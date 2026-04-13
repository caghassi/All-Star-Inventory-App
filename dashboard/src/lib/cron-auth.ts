// Cron endpoints are authed two ways:
//   1. Vercel's cron invocation sends `authorization: Bearer <CRON_SECRET>`
//      when CRON_SECRET is set as an env var. We verify that.
//   2. A signed-in dashboard user can manually trigger a sync from the UI;
//      in that case the route-level `getSession()` check also allows it.

import { NextResponse } from "next/server";
import { getSession } from "./auth";

export async function requireCronAuth(request: Request): Promise<NextResponse | null> {
  const header = request.headers.get("authorization");
  const secret = process.env.CRON_SECRET;
  if (secret && header === `Bearer ${secret}`) return null;

  const session = await getSession();
  if (session) return null;

  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
