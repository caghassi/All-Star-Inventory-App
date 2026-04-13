export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const params = await searchParams;
  const next = params.next ?? "/";
  const hasError = params.error === "1";

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-lg border border-[var(--border)] bg-[var(--surface-solid)] p-8 shadow-lg">
        <div className="mb-6 flex flex-col items-center gap-2">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded bg-[var(--accent)] text-lg font-bold text-black">
            A
          </span>
          <h1 className="text-lg font-semibold">All Star Dashboard</h1>
          <p className="text-sm text-[var(--muted)]">Enter the team password to continue.</p>
        </div>
        <form action="/api/auth/login" method="post" className="flex flex-col gap-3">
          <input type="hidden" name="next" value={next} />
          <input
            type="password"
            name="password"
            autoFocus
            required
            placeholder="Password"
            className="rounded border border-[var(--border)] bg-[var(--background)] px-3 py-2 outline-none focus:border-[var(--accent)]"
          />
          {hasError ? (
            <p className="text-sm text-red-400">Incorrect password — try again.</p>
          ) : null}
          <button
            type="submit"
            className="rounded bg-[var(--accent)] px-3 py-2 font-medium text-black hover:bg-orange-400"
          >
            Sign in
          </button>
        </form>
        <p className="mt-6 text-center text-xs text-[var(--muted)]">
          Microsoft SSO coming later.
        </p>
      </div>
    </div>
  );
}
