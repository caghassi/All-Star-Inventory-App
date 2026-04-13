// Syncs the last ~13 months of Printavo invoices into `printavo_orders`, then
// rebuilds the `reorder_calls` queue: any order whose due date anniversary is
// 21-45 days from today AND (total >= $200 OR recurring customer OR event
// keyword in job name) gets queued for a reminder call.

import { iterateInvoicesSince, type PrintavoInvoice } from "./printavo";
import { sql } from "./db";
import {
  EVENT_KEYWORDS,
  REORDER_LEAD_DAYS_MAX,
  REORDER_LEAD_DAYS_MIN,
  REORDER_MIN_TOTAL_CENTS,
} from "./config";

function detectEventKeyword(jobName: string | null | undefined): string | null {
  if (!jobName) return null;
  const lc = jobName.toLowerCase();
  for (const kw of EVENT_KEYWORDS) {
    if (lc.includes(kw)) return kw;
  }
  return null;
}

function toCents(total: number | null | undefined): number {
  if (total == null) return 0;
  return Math.round(total * 100);
}

function asDateOnly(iso: string | null | undefined): string | null {
  if (!iso) return null;
  // ISO date or datetime — take first 10 chars.
  return iso.slice(0, 10);
}

export type SyncSummary = {
  ordersUpserted: number;
  reorderCallsCreated: number;
  reorderCallsRemoved: number;
};

export async function runPrintavoSync(): Promise<SyncSummary> {
  const q = sql();
  // Pull ~13 months so we always have a full year of history plus slack.
  const since = new Date();
  since.setMonth(since.getMonth() - 13);

  let ordersUpserted = 0;
  for await (const inv of iterateInvoicesSince(since)) {
    await upsertInvoice(inv);
    ordersUpserted++;
  }

  // Now recompute the reorder queue.
  const today = new Date();
  const windowStart = new Date(today);
  windowStart.setDate(today.getDate() + REORDER_LEAD_DAYS_MIN);
  const windowEnd = new Date(today);
  windowEnd.setDate(today.getDate() + REORDER_LEAD_DAYS_MAX);

  // Translate the "anniversary window" to last-year date ranges.
  // An order from last year qualifies if (due_date + 1 year) is within the window.
  const lastYearWindowStart = new Date(windowStart);
  lastYearWindowStart.setFullYear(lastYearWindowStart.getFullYear() - 1);
  const lastYearWindowEnd = new Date(windowEnd);
  lastYearWindowEnd.setFullYear(lastYearWindowEnd.getFullYear() - 1);

  const candidates = (await q`
    select
      o.id, o.customer_id, o.job_name, o.order_total_cents, o.due_date, o.is_event, o.event_keyword
    from printavo_orders o
    where o.due_date between ${lastYearWindowStart.toISOString().slice(0, 10)}
                         and ${lastYearWindowEnd.toISOString().slice(0, 10)}
  `) as Array<{
    id: string;
    customer_id: string | null;
    job_name: string | null;
    order_total_cents: number;
    due_date: string;
    is_event: boolean;
    event_keyword: string | null;
  }>;

  // Customer frequency map (customers with 2+ historical orders count as recurring).
  const recurringRows = (await q`
    select customer_id, count(*)::int as n
    from printavo_orders
    where customer_id is not null
    group by customer_id
    having count(*) >= 2
  `) as Array<{ customer_id: string; n: number }>;
  const recurring = new Set(recurringRows.map((r) => r.customer_id));

  let reorderCallsCreated = 0;
  for (const c of candidates) {
    const reasons: string[] = [];
    if (c.order_total_cents >= REORDER_MIN_TOTAL_CENTS) reasons.push("high_value");
    if (c.customer_id && recurring.has(c.customer_id)) reasons.push("recurring");
    if (c.is_event) reasons.push("event_keyword");
    if (reasons.length === 0) continue;

    const projectedEvent = new Date(c.due_date);
    projectedEvent.setFullYear(projectedEvent.getFullYear() + 1);
    const projectedCall = new Date(projectedEvent);
    projectedCall.setDate(projectedCall.getDate() - 30);

    await q`
      insert into reorder_calls
        (printavo_order_id, projected_event_date, projected_call_date, reason)
      values
        (${c.id}, ${projectedEvent.toISOString().slice(0, 10)},
         ${projectedCall.toISOString().slice(0, 10)}, ${reasons.join(",")})
      on conflict (printavo_order_id, projected_event_date) do update
        set reason = excluded.reason
    `;
    reorderCallsCreated++;
  }

  // Drop stale entries (event date already in the past).
  const removed = (await q`
    delete from reorder_calls
    where projected_event_date < current_date
    returning id
  `) as Array<{ id: string }>;

  return {
    ordersUpserted,
    reorderCallsCreated,
    reorderCallsRemoved: removed.length,
  };
}

async function upsertInvoice(inv: PrintavoInvoice): Promise<void> {
  const q = sql();
  const jobName = inv.nickname ?? null;
  const keyword = detectEventKeyword(jobName);
  const tags = Array.isArray(inv.tags)
    ? inv.tags.map((t) => (typeof t === "string" ? t : t?.name)).filter(Boolean)
    : [];

  await q`
    insert into printavo_orders (
      printavo_id, visual_id, job_name, customer_id, customer_name,
      customer_email, customer_phone, order_total_cents, due_date, created_date,
      status, tags, is_event, event_keyword, raw, synced_at
    ) values (
      ${inv.id},
      ${inv.visualId ?? null},
      ${jobName},
      ${inv.customer?.id ?? null},
      ${inv.customer?.companyName ?? null},
      ${inv.customer?.email ?? null},
      ${inv.customer?.phone ?? null},
      ${toCents(inv.total)},
      ${asDateOnly(inv.dueAt)},
      ${asDateOnly(inv.createdAt)},
      ${inv.status?.name ?? null},
      ${JSON.stringify(tags)}::jsonb,
      ${keyword !== null},
      ${keyword},
      ${JSON.stringify(inv)}::jsonb,
      now()
    )
    on conflict (printavo_id) do update set
      visual_id = excluded.visual_id,
      job_name = excluded.job_name,
      customer_id = excluded.customer_id,
      customer_name = excluded.customer_name,
      customer_email = excluded.customer_email,
      customer_phone = excluded.customer_phone,
      order_total_cents = excluded.order_total_cents,
      due_date = excluded.due_date,
      created_date = excluded.created_date,
      status = excluded.status,
      tags = excluded.tags,
      is_event = excluded.is_event,
      event_keyword = excluded.event_keyword,
      raw = excluded.raw,
      synced_at = now()
  `;
}
