// Lightweight scraper for local school / league directory pages. We keep the
// list of sources in the DB (`competitor_snapshots` is for competitors; we
// use a simple const list here) so it's easy to add more.
//
// Each source returns a list of { name, url } pairs which we turn into leads
// with source='schools_scrape'.

import * as cheerio from "cheerio";

export type SchoolLead = {
  name: string;
  url: string | null;
  phone: string | null;
  address: string | null;
  sourceUrl: string;
};

/**
 * Pages to parse. Add/remove as you find good local directories.
 * The scraper is best-effort: if a source changes its HTML we just skip it.
 */
const SOURCES: Array<{
  name: string;
  url: string;
  selector: string;
  nameSelector?: string;
  linkSelector?: string;
}> = [
  {
    name: "Turlock Unified School District",
    // Schools-list page. Selector kept loose; verify & adjust after first run.
    url: "https://www.turlock.k12.ca.us/apps/pages/index.jsp?uREC_ID=1035925&type=d",
    selector: "a[href*='schools']",
  },
  {
    name: "Stanislaus County Office of Education",
    url: "https://www.stancoe.org/about-our-schools/school-districts",
    selector: "a[href*='school']",
  },
];

export async function scrapeSchoolLeads(): Promise<SchoolLead[]> {
  const leads: SchoolLead[] = [];
  for (const s of SOURCES) {
    try {
      const res = await fetch(s.url, {
        headers: { "user-agent": "AllStarDashboard/0.1 (lead research)" },
        cache: "no-store",
      });
      if (!res.ok) continue;
      const html = await res.text();
      const $ = cheerio.load(html);
      $(s.selector).each((_, el) => {
        const $el = $(el);
        const name = $el.text().trim();
        const href = $el.attr("href") ?? null;
        if (!name || name.length < 3) return;
        leads.push({
          name,
          url: href ? new URL(href, s.url).toString() : null,
          phone: null,
          address: null,
          sourceUrl: s.url,
        });
      });
    } catch {
      // swallow — scraper is best-effort
    }
  }
  // Dedup on lowercase name
  const seen = new Set<string>();
  return leads.filter((l) => {
    const k = l.name.toLowerCase();
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}
