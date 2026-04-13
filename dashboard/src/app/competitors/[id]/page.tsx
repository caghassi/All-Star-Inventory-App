import { notFound } from "next/navigation";
import { Shell } from "@/components/Shell";
import { sql } from "@/lib/db";
import { addManualSnapshot, deleteCompetitor, updateCompetitor } from "../actions";

export const dynamic = "force-dynamic";

type Competitor = {
  id: string;
  name: string;
  website: string | null;
  notes: string | null;
  active: boolean;
  social: Record<string, string>;
  scrape_targets: Array<{ url: string; selector?: string; type?: string; label?: string }>;
};

type Snapshot = {
  id: string;
  snapshot_type: string;
  source_url: string | null;
  title: string | null;
  data: { text?: string; label?: string | null };
  captured_at: string;
};

function socialToText(social: Record<string, string>): string {
  return Object.entries(social)
    .map(([k, v]) => `${k}: ${v}`)
    .join("\n");
}

function targetsToText(targets: Competitor["scrape_targets"]): string {
  return targets
    .map((t) => [t.url, t.selector ?? "", t.type ?? "", t.label ?? ""].join(" | "))
    .join("\n");
}

export default async function CompetitorDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const q = sql();
  const [competitor] = (await q`
    select id, name, website, notes, active, social, scrape_targets
    from competitors where id = ${id}
  `) as Competitor[];
  if (!competitor) notFound();

  const snapshots = (await q`
    select id, snapshot_type, source_url, title, data, captured_at
    from competitor_snapshots
    where competitor_id = ${id}
    order by captured_at desc
    limit 100
  `) as Snapshot[];

  return (
    <Shell active="/competitors">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{competitor.name}</h1>
          {competitor.website ? (
            <a
              href={competitor.website}
              target="_blank"
              rel="noreferrer"
              className="text-sm text-[var(--muted)] hover:text-white"
            >
              {competitor.website}
            </a>
          ) : null}
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_1.4fr]">
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[var(--muted)]">
            Configuration
          </h2>
          <form action={updateCompetitor} className="grid gap-3 rounded border border-[var(--border)] bg-[var(--surface-solid)] p-4">
            <input type="hidden" name="id" value={competitor.id} />
            <label className="grid gap-1 text-sm">
              <span>Name</span>
              <input
                name="name"
                defaultValue={competitor.name}
                className="rounded border border-[var(--border)] bg-[var(--background)] px-3 py-2 outline-none focus:border-[var(--accent)]"
              />
            </label>
            <label className="grid gap-1 text-sm">
              <span>Website</span>
              <input
                name="website"
                defaultValue={competitor.website ?? ""}
                className="rounded border border-[var(--border)] bg-[var(--background)] px-3 py-2 outline-none focus:border-[var(--accent)]"
              />
            </label>
            <label className="grid gap-1 text-sm">
              <span>Social handles</span>
              <span className="text-xs text-[var(--muted)]">One per line: key: value</span>
              <textarea
                name="social"
                rows={3}
                defaultValue={socialToText(competitor.social ?? {})}
                className="rounded border border-[var(--border)] bg-[var(--background)] px-3 py-2 font-mono text-sm outline-none focus:border-[var(--accent)]"
              />
            </label>
            <label className="grid gap-1 text-sm">
              <span>Scrape targets</span>
              <span className="text-xs text-[var(--muted)]">
                URL | CSS selector | type | label
              </span>
              <textarea
                name="scrape_targets"
                rows={5}
                defaultValue={targetsToText(competitor.scrape_targets ?? [])}
                className="rounded border border-[var(--border)] bg-[var(--background)] px-3 py-2 font-mono text-sm outline-none focus:border-[var(--accent)]"
              />
            </label>
            <label className="grid gap-1 text-sm">
              <span>Notes</span>
              <textarea
                name="notes"
                rows={3}
                defaultValue={competitor.notes ?? ""}
                className="rounded border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)]"
              />
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="active" defaultChecked={competitor.active} />
              <span>Active (include in scheduled scrapes)</span>
            </label>
            <div className="flex justify-between">
              <button
                type="submit"
                className="rounded bg-[var(--accent)] px-4 py-2 text-sm font-medium text-black hover:bg-orange-400"
              >
                Save
              </button>
              <button
                type="submit"
                formAction={deleteCompetitor}
                className="rounded border border-red-500/50 px-4 py-2 text-sm text-red-300 hover:bg-red-500/10"
              >
                Delete
              </button>
            </div>
          </form>

          <form
            action={addManualSnapshot}
            className="mt-6 grid gap-2 rounded border border-[var(--border)] bg-[var(--surface-solid)] p-4"
          >
            <h3 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted)]">
              Add a manual note / snapshot
            </h3>
            <input type="hidden" name="competitor_id" value={competitor.id} />
            <select
              name="type"
              defaultValue="note"
              className="rounded border border-[var(--border)] bg-[var(--background)] px-2 py-1 text-sm"
            >
              <option value="note">Note</option>
              <option value="price">Price</option>
              <option value="product">Product</option>
              <option value="promo">Promo</option>
              <option value="social">Social post</option>
            </select>
            <input
              name="title"
              placeholder="Title"
              className="rounded border border-[var(--border)] bg-[var(--background)] px-2 py-1 text-sm"
            />
            <input
              name="url"
              placeholder="Source URL (optional)"
              className="rounded border border-[var(--border)] bg-[var(--background)] px-2 py-1 text-sm"
            />
            <textarea
              name="text"
              rows={3}
              required
              placeholder="Content..."
              className="rounded border border-[var(--border)] bg-[var(--background)] px-2 py-1 text-sm"
            />
            <button
              type="submit"
              className="self-start rounded border border-[var(--border)] px-3 py-1 text-sm hover:bg-[var(--border)]"
            >
              Add snapshot
            </button>
          </form>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[var(--muted)]">
            Recent snapshots
          </h2>
          {snapshots.length === 0 ? (
            <p className="rounded border border-[var(--border)] bg-[var(--surface-solid)] p-4 text-sm text-[var(--muted)]">
              No snapshots yet. Add a scrape target above and click &ldquo;Scrape now&rdquo; on the
              competitors list.
            </p>
          ) : (
            <div className="grid gap-2">
              {snapshots.map((s) => (
                <div
                  key={s.id}
                  className="rounded border border-[var(--border)] bg-[var(--surface-solid)] p-4"
                >
                  <div className="flex items-center justify-between text-xs text-[var(--muted)]">
                    <span className="rounded bg-[var(--border)] px-2 py-0.5 uppercase">
                      {s.snapshot_type}
                    </span>
                    <span>{new Date(s.captured_at).toLocaleString()}</span>
                  </div>
                  {s.title ? (
                    <h4 className="mt-1 text-sm font-medium">{s.title}</h4>
                  ) : null}
                  {s.source_url ? (
                    <a
                      href={s.source_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-[var(--accent)] hover:underline"
                    >
                      {s.source_url}
                    </a>
                  ) : null}
                  {s.data?.text ? (
                    <p className="mt-2 whitespace-pre-wrap text-sm text-[var(--muted)]">
                      {s.data.text.slice(0, 500)}
                      {s.data.text.length > 500 ? "…" : ""}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </Shell>
  );
}
