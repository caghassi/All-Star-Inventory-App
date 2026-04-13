import Link from "next/link";
import { Shell } from "@/components/Shell";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

type CompetitorRow = {
  id: string;
  name: string;
  website: string | null;
  social: Record<string, string>;
  active: boolean;
  snapshots: number;
  latest_snapshot_at: string | null;
};

export default async function CompetitorsPage() {
  const q = sql();
  const rows = (await q`
    select
      c.id, c.name, c.website, c.social, c.active,
      count(s.id)::int as snapshots,
      max(s.captured_at) as latest_snapshot_at
    from competitors c
    left join competitor_snapshots s on s.competitor_id = c.id
    group by c.id
    order by c.active desc, c.name asc
  `) as CompetitorRow[];

  return (
    <Shell active="/competitors">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Competition</h1>
          <p className="text-sm text-[var(--muted)]">
            Track pricing, products, and social signals from competitors.
          </p>
        </div>
        <div className="flex gap-2">
          <form action="/api/cron/competitors-sync" method="post">
            <button
              type="submit"
              className="rounded border border-[var(--border)] px-3 py-1.5 text-sm hover:bg-[var(--border)]"
            >
              Scrape now
            </button>
          </form>
          <Link
            href="/competitors/new"
            className="rounded bg-[var(--accent)] px-3 py-1.5 text-sm font-medium text-black hover:bg-orange-400"
          >
            + Add competitor
          </Link>
        </div>
      </div>

      {rows.length === 0 ? (
        <p className="rounded border border-[var(--border)] bg-[var(--surface-solid)] p-6 text-sm text-[var(--muted)]">
          No competitors yet. Click <strong>Add competitor</strong> to track your first one.
        </p>
      ) : (
        <div className="grid gap-3">
          {rows.map((c) => (
            <Link
              key={c.id}
              href={`/competitors/${c.id}`}
              className="block rounded border border-[var(--border)] bg-[var(--surface-solid)] p-4 hover:border-[var(--accent)]"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-medium">{c.name}</h3>
                    {!c.active ? (
                      <span className="rounded-full bg-[var(--border)] px-2 py-0.5 text-xs">
                        paused
                      </span>
                    ) : null}
                  </div>
                  {c.website ? (
                    <p className="text-sm text-[var(--muted)]">{c.website}</p>
                  ) : null}
                </div>
                <div className="text-right text-sm text-[var(--muted)]">
                  <div>{c.snapshots} snapshot{c.snapshots === 1 ? "" : "s"}</div>
                  {c.latest_snapshot_at ? (
                    <div>
                      Updated{" "}
                      {new Date(c.latest_snapshot_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </div>
                  ) : (
                    <div>No data yet</div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </Shell>
  );
}
