"use server";

import { revalidatePath } from "next/cache";
import { sql } from "@/lib/db";

export async function markLeadCall(formData: FormData) {
  const queueId = String(formData.get("queue_id") ?? "");
  const leadId = String(formData.get("lead_id") ?? "");
  const outcome = String(formData.get("outcome") ?? "") || null;
  const notes = String(formData.get("notes") ?? "") || null;
  const called = formData.get("called") === "on";
  if (!queueId || !leadId) return;

  const q = sql();
  await q`
    update weekly_call_queue
    set called = ${called}, outcome = ${outcome}, notes = ${notes}
    where id = ${queueId}
  `;

  // Mirror status back onto the lead so we don't re-queue them for ~60 days.
  const mappedStatus =
    outcome === "interested"
      ? "queued"
      : outcome === "not_interested" || outcome === "do_not_call"
        ? "do_not_call"
        : called
          ? "called"
          : "new";

  await q`
    update leads
    set status = ${mappedStatus},
        last_called_at = case when ${called} then now() else last_called_at end,
        notes = coalesce(${notes}, notes),
        updated_at = now()
    where id = ${leadId}
  `;
  revalidatePath("/leads");
}
