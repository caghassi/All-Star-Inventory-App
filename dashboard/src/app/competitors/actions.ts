"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { sql } from "@/lib/db";

type ScrapeTarget = {
  url: string;
  selector?: string;
  type?: string;
  label?: string;
};

function parseTargets(raw: string): ScrapeTarget[] {
  const out: ScrapeTarget[] = [];
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    // Format: url | selector | type | label   (pipe-separated, last 3 optional)
    const [url, selector, type, label] = trimmed.split("|").map((s) => s.trim());
    if (!url || !url.startsWith("http")) continue;
    out.push({
      url,
      selector: selector || undefined,
      type: (type as ScrapeTarget["type"]) || "note",
      label: label || undefined,
    });
  }
  return out;
}

function parseSocial(raw: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const line of raw.split(/\r?\n/)) {
    const m = line.trim().match(/^([a-zA-Z]+)\s*[:=]\s*(.+)$/);
    if (m) out[m[1].toLowerCase()] = m[2].trim();
  }
  return out;
}

export async function createCompetitor(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const website = String(formData.get("website") ?? "").trim() || null;
  const notes = String(formData.get("notes") ?? "").trim() || null;
  const targets = parseTargets(String(formData.get("scrape_targets") ?? ""));
  const social = parseSocial(String(formData.get("social") ?? ""));

  if (!name) return;

  const q = sql();
  const rows = (await q`
    insert into competitors (name, website, notes, scrape_targets, social)
    values (${name}, ${website}, ${notes},
            ${JSON.stringify(targets)}::jsonb,
            ${JSON.stringify(social)}::jsonb)
    returning id
  `) as Array<{ id: string }>;

  revalidatePath("/competitors");
  redirect(`/competitors/${rows[0].id}`);
}

export async function updateCompetitor(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const name = String(formData.get("name") ?? "").trim();
  const website = String(formData.get("website") ?? "").trim() || null;
  const notes = String(formData.get("notes") ?? "").trim() || null;
  const active = formData.get("active") === "on";
  const targets = parseTargets(String(formData.get("scrape_targets") ?? ""));
  const social = parseSocial(String(formData.get("social") ?? ""));

  const q = sql();
  await q`
    update competitors
    set name = ${name},
        website = ${website},
        notes = ${notes},
        active = ${active},
        scrape_targets = ${JSON.stringify(targets)}::jsonb,
        social = ${JSON.stringify(social)}::jsonb,
        updated_at = now()
    where id = ${id}
  `;
  revalidatePath(`/competitors/${id}`);
  revalidatePath("/competitors");
}

export async function deleteCompetitor(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const q = sql();
  await q`delete from competitors where id = ${id}`;
  revalidatePath("/competitors");
  redirect("/competitors");
}

export async function addManualSnapshot(formData: FormData) {
  const id = String(formData.get("competitor_id") ?? "");
  const type = String(formData.get("type") ?? "note");
  const title = String(formData.get("title") ?? "") || null;
  const url = String(formData.get("url") ?? "") || null;
  const text = String(formData.get("text") ?? "");
  if (!id || !text) return;

  const q = sql();
  await q`
    insert into competitor_snapshots (competitor_id, snapshot_type, source_url, title, data)
    values (${id}, ${type}, ${url}, ${title}, ${JSON.stringify({ text })}::jsonb)
  `;
  revalidatePath(`/competitors/${id}`);
}
