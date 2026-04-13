import { Shell } from "@/components/Shell";
import { createCompetitor } from "../actions";

export default function NewCompetitorPage() {
  return (
    <Shell active="/competitors">
      <h1 className="mb-1 text-2xl font-semibold">New competitor</h1>
      <p className="mb-6 text-sm text-[var(--muted)]">
        Add a competitor to track. You can come back and add scrape targets any time.
      </p>

      <form action={createCompetitor} className="grid max-w-2xl gap-4">
        <Field label="Name" name="name" required />
        <Field label="Website" name="website" placeholder="https://example.com" />
        <Textarea
          label="Social handles"
          name="social"
          hint="One per line, format: instagram: @foo"
          rows={3}
        />
        <Textarea
          label="Scrape targets"
          name="scrape_targets"
          hint="One per line: URL | CSS selector | type | label  — e.g. https://foo.com/pricing | .price-table | price | Main pricing"
          rows={5}
        />
        <Textarea label="Notes" name="notes" rows={3} />
        <div className="flex gap-2">
          <button
            type="submit"
            className="rounded bg-[var(--accent)] px-4 py-2 font-medium text-black hover:bg-orange-400"
          >
            Create
          </button>
        </div>
      </form>
    </Shell>
  );
}

function Field({
  label,
  name,
  required,
  placeholder,
}: {
  label: string;
  name: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="grid gap-1">
      <span className="text-sm">{label}</span>
      <input
        name={name}
        required={required}
        placeholder={placeholder}
        className="rounded border border-[var(--border)] bg-[var(--background)] px-3 py-2 outline-none focus:border-[var(--accent)]"
      />
    </label>
  );
}

function Textarea({
  label,
  name,
  rows = 3,
  hint,
}: {
  label: string;
  name: string;
  rows?: number;
  hint?: string;
}) {
  return (
    <label className="grid gap-1">
      <span className="text-sm">{label}</span>
      {hint ? <span className="text-xs text-[var(--muted)]">{hint}</span> : null}
      <textarea
        name={name}
        rows={rows}
        className="rounded border border-[var(--border)] bg-[var(--background)] px-3 py-2 font-mono text-sm outline-none focus:border-[var(--accent)]"
      />
    </label>
  );
}
