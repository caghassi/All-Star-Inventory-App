// Upsert leads from Google Places + local school scrapes, then rotate the
// weekly call queue so you have a fresh list of prospects every Monday.

import { sql } from "./db";
import { TARGET_GEO, WEEKLY_LEAD_QUOTA } from "./config";
import { fetchAllLeads } from "./places";
import { scrapeSchoolLeads } from "./schools";

function mondayOf(d: Date): string {
  const out = new Date(d);
  const day = out.getUTCDay(); // 0=Sun..6=Sat
  const offset = day === 0 ? -6 : 1 - day;
  out.setUTCDate(out.getUTCDate() + offset);
  return out.toISOString().slice(0, 10);
}

export type LeadsSyncSummary = {
  placesUpserted: number;
  schoolsUpserted: number;
  weekStart: string;
  queued: number;
};

export async function runLeadsSync(): Promise<LeadsSyncSummary> {
  const q = sql();

  // 1. Google Places
  let placesUpserted = 0;
  try {
    const places = await fetchAllLeads();
    for (const p of places) {
      await q`
        insert into leads (
          source, source_ref, name, category, address, city, state, postal_code,
          phone, website, lat, lng, rating, user_ratings_total, raw
        ) values (
          'google_places', ${p.placeId}, ${p.name}, ${p.category}, ${p.address},
          ${p.city ?? TARGET_GEO.city}, ${p.state ?? TARGET_GEO.state},
          ${p.postalCode}, ${p.phone}, ${p.website}, ${p.lat}, ${p.lng},
          ${p.rating}, ${p.userRatingsTotal}, ${JSON.stringify(p.raw)}::jsonb
        )
        on conflict (source, source_ref) do update set
          name = excluded.name,
          category = excluded.category,
          address = excluded.address,
          phone = coalesce(excluded.phone, leads.phone),
          website = coalesce(excluded.website, leads.website),
          rating = excluded.rating,
          user_ratings_total = excluded.user_ratings_total,
          raw = excluded.raw,
          updated_at = now()
      `;
      placesUpserted++;
    }
  } catch (err) {
    console.error("Places sync failed:", err);
  }

  // 2. Local schools scrape
  let schoolsUpserted = 0;
  try {
    const schools = await scrapeSchoolLeads();
    for (const s of schools) {
      await q`
        insert into leads (
          source, source_ref, name, category, website, city, state, raw
        ) values (
          'schools_scrape', ${s.url ?? s.name}, ${s.name}, 'school',
          ${s.url}, ${TARGET_GEO.city}, ${TARGET_GEO.state},
          ${JSON.stringify(s)}::jsonb
        )
        on conflict (source, source_ref) do update set
          name = excluded.name,
          website = coalesce(excluded.website, leads.website),
          updated_at = now()
      `;
      schoolsUpserted++;
    }
  } catch (err) {
    console.error("Schools scrape failed:", err);
  }

  // 3. Rotate the weekly queue: pick top N leads that haven't been called recently.
  const weekStart = mondayOf(new Date());

  const picked = (await q`
    with candidates as (
      select l.id,
             case
               when l.status = 'new' then 100
               else 50
             end
             + coalesce(l.user_ratings_total, 0) / 10 as score
      from leads l
      where l.status not in ('do_not_call', 'won', 'lost')
        and (l.last_called_at is null or l.last_called_at < now() - interval '60 days')
        and not exists (
          select 1 from weekly_call_queue w
          where w.lead_id = l.id and w.week_start = ${weekStart}
        )
      order by score desc
      limit ${WEEKLY_LEAD_QUOTA}
    )
    insert into weekly_call_queue (lead_id, week_start, priority)
    select id, ${weekStart}, score from candidates
    on conflict (lead_id, week_start) do nothing
    returning id
  `) as Array<{ id: string }>;

  return {
    placesUpserted,
    schoolsUpserted,
    weekStart,
    queued: picked.length,
  };
}
