"use server";

import { revalidatePath } from "next/cache";
import { sql } from "@/lib/db";

export async function markReorderCall(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const outcome = String(formData.get("outcome") ?? "") || null;
  const notes = String(formData.get("notes") ?? "") || null;
  const called = formData.get("called") === "on";
  if (!id) return;

  const q = sql();
  await q`
    update reorder_calls
    set called = ${called},
        outcome = ${outcome},
        notes = ${notes}
    where id = ${id}
  `;
  revalidatePath("/reorders");
}
