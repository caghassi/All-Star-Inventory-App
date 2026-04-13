import { Shell } from "@/components/Shell";
import { sql } from "@/lib/db";
import { markLeadCall } from "./actions";

export const dynamic = "force-dynamic";

type Row = {
  queue_id: string;
  lead_id: string;
  name: string;
  category: string | null;
  address: string | null;
  phone: string | null;
  website: string | null;
  rating: number | null;
  user_ratings_total: number | null;
  source: string;
  priority: number;
  called: boolean;
  outcome: string | null;
  notes: string | null;
  week_start: string;
};

function formatWeek(iso: string): string {
  return new Date(iso + "T00:00:00Z").toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

export default async function LeadsPage() {
  const q = sql();
  const rows = (await q`
    select
      w.id as queue_id,
      w.week_start,
      w.priority,
      w.called,
      w.outcome,
      w.notes,
      l.id as lead_id,
      l.name,
      l.category,
      l.address,
      l.phone,
      l.website,
      l.rating,
      l.user_ratings_total,
      l.source
    from weekly_call_queue w
    join leads l on l.id = w.lead_id
    where w.week_start = (
      select max(week_start) from weekly_call_queue
    )
    order by w.priority desc, l.name asc
  `) as Row[];

  const weekStart = rows[0]?.week_start;

  return (
    <Shell active="/leads">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Weekly Call List</h1>
          <p className="text-sm text-[var(--muted)]">
            {weekStart
              ? `Week of ${formatWeek(weekStart)} — ${rows.length} prospects`
              : "No leads yet. Run the sync to generate this week's list."}
          </p>
        </div>
        <form action="/api/cron/leads-sync" method="post">
          <button
            type="submit"
            className="rounded border border-[var(--border)] px-3 py-1.5 text-sm hover:bg-[var(--border)]"
          >
            Sync leads now
          </button>
        </form>
      </div>

      {rows.length === 0 ? (
        <p className="rounded border border-[var(--border)] bg-[var(--surface-solid)] p-6 text-sm text-[var(--muted)]">
          Nothing queued yet. Make sure <code>GOOGLE_PLACES_API_KEY</code> is set, then run
          the sync.
        </p>
      ) : (
        <div className="grid gap-3">
          {rows.map((r) => (
            <LeadCard key={r.queue_id} row={r} />
          ))}
        </div>
      )}
    </Shell>
  );
}

function LeadCard({ row }: { row: Row }) {
  return (
    <div className="rounded border border-[var(--border)] bg-[var(--surface-solid)] p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
            <span className="rounded bg-[var(--border)] px-2 py-0.5">
              {row.source === "google_places" ? "Google" : "Schools scrape"}
            </span>
            {row.category ? <span>{row.category}</span> : null}
            {row.rating ? (
              <span>
                ★ {row.rating.toFixed(1)}
                {row.user_ratings_total ? ` (${row.user_ratings_total})` : ""}
              </span>
            ) : null}
          </div>
          <h3 className="mt-1 text-lg font-medium">{row.name}</h3>
          {row.address ? (
            <p className="text-sm text-[var(--muted)]">{row.address}</p>
          ) : null}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
        {row.phone ? (
          <a
            href={`tel:${row.phone}`}
            className="rounded bg-[var(--accent)] px-3 py-1.5 text-black hover:bg-orange-400"
          >
            Call {row.phone}
          </a>
        ) : (
          <span className="text-[var(--muted)]">No phone on file</span>
        )}
        {row.website ? (
          <a
            href={row.website}
            target="_blank"
            rel="noreferrer"
            className="text-[var(--muted)] hover:text-white"
          >
            {new URL(row.website).hostname}
          </a>
        ) : null}
      </div>

      <form action={markLeadCall} className="mt-3 flex flex-wrap items-center gap-2">
        <input type="hidden" name="queue_id" value={row.queue_id} />
        <input type="hidden" name="lead_id" value={row.lead_id} />
        <select
          name="outcome"
          defaultValue={row.outcome ?? ""}
          className="rounded border border-[var(--border)] bg-[var(--background)] px-2 py-1 text-sm"
        >
          <option value="">Outcome…</option>
          <option value="answered">Answered</option>
          <option value="voicemail">Left voicemail</option>
          <option value="no_answer">No answer</option>
          <option value="interested">Interested</option>
          <option value="not_interested">Not interested</option>
          <option value="do_not_call">Do not call</option>
        </select>
        <input
          type="text"
          name="notes"
          defaultValue={row.notes ?? ""}
          placeholder="Notes"
          className="flex-1 min-w-[12rem] rounded border border-[var(--border)] bg-[var(--background)] px-2 py-1 text-sm"
        />
        <label className="flex items-center gap-1 text-sm text-[var(--muted)]">
          <input type="checkbox" name="called" defaultChecked={row.called} />
          Called
        </label>
        <button
          type="submit"
          className="rounded border border-[var(--border)] px-3 py-1 text-sm hover:bg-[var(--border)]"
        >
          Save
        </button>
      </form>
    </div>
  );
}
