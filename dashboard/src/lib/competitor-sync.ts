// Scrapes each active competitor's configured URLs and saves a snapshot
// whenever the rendered text content differs from the previous run.
//
// A competitor row looks like:
//   {
//     name: "Foo Prints",
//     website: "https://fooprints.com",
//     scrape_targets: [
//       { url: "https://fooprints.com/pricing", selector: ".pricing-table", type: "price" },
//       { url: "https://fooprints.com/blog",    selector: "article",         type: "promo" }
//     ]
//   }
//
// The scraper is intentionally generic and defensive: any target that errors
// is simply skipped and the rest continue.

import * as cheerio from "cheerio";
import { sql } from "./db";

type ScrapeTarget = {
  url: string;
  selector?: string;
  type?: "price" | "product" | "promo" | "social" | "note";
  label?: string;
};

export type CompetitorSyncSummary = {
  competitorsChecked: number;
  snapshotsCreated: number;
  errors: Array<{ competitor: string; url: string; message: string }>;
};

function normalize(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

async function fetchAndExtract(target: ScrapeTarget): Promise<{ title: string | null; text: string } | null> {
  const res = await fetch(target.url, {
    headers: { "user-agent": "AllStarDashboard/0.1 (competitor research)" },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const html = await res.text();
  const $ = cheerio.load(html);
  const scope = target.selector ? $(target.selector) : $("body");
  if (!scope.length) return null;
  const text = normalize(scope.text()).slice(0, 10_000);
  const title = normalize($("title").first().text()) || null;
  return { title, text };
}

export async function runCompetitorSync(): Promise<CompetitorSyncSummary> {
  const q = sql();
  const competitors = (await q`
    select id, name, scrape_targets from competitors where active = true
  `) as Array<{ id: string; name: string; scrape_targets: ScrapeTarget[] }>;

  let snapshotsCreated = 0;
  const errors: CompetitorSyncSummary["errors"] = [];

  for (const c of competitors) {
    const targets = Array.isArray(c.scrape_targets) ? c.scrape_targets : [];
    for (const t of targets) {
      try {
        const result = await fetchAndExtract(t);
        if (!result) continue;

        // Only record if the text differs from the last snapshot for this URL.
        const prev = (await q`
          select data->>'text' as text
          from competitor_snapshots
          where competitor_id = ${c.id}
            and source_url = ${t.url}
          order by captured_at desc
          limit 1
        `) as Array<{ text: string | null }>;

        if (prev[0]?.text === result.text) continue;

        await q`
          insert into competitor_snapshots
            (competitor_id, snapshot_type, source_url, title, data)
          values
            (${c.id}, ${t.type ?? "note"}, ${t.url}, ${result.title},
             ${JSON.stringify({ text: result.text, label: t.label ?? null })}::jsonb)
        `;
        snapshotsCreated++;
      } catch (err) {
        errors.push({
          competitor: c.name,
          url: t.url,
          message: err instanceof Error ? err.message : String(err),
        });
      }
    }
  }

  return {
    competitorsChecked: competitors.length,
    snapshotsCreated,
    errors,
  };
}
