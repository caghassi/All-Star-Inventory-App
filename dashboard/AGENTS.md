# This is NOT the Next.js you know

This app uses Next.js 16. Read `node_modules/next/dist/docs/` before writing
code. Notable breaking changes from older Next.js:

- `middleware.ts` was renamed to `proxy.ts`.
- Turbopack is the default bundler for both `next dev` and `next build`.
- `next build` no longer runs ESLint automatically — run `npm run lint`.
- Route params are Promises: `{ params }: { params: Promise<{ id: string }> }`.
- Page `searchParams` are Promises too.

## Project conventions

- Server components by default. Use `"use server"` for server actions and
  `"use client"` only where you need interactivity.
- Database access goes through `src/lib/db.ts`'s tagged `sql\`\`` template.
- Tunables (geo, keywords, thresholds) live in `src/lib/config.ts`.
- All cron-style jobs live under `src/app/api/cron/` and call
  `requireCronAuth(request)` first.
