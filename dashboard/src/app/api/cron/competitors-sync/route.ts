import { NextResponse } from "next/server";
import { requireCronAuth } from "@/lib/cron-auth";
import { runCompetitorSync } from "@/lib/competitor-sync";

export const maxDuration = 300;
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const denied = await requireCronAuth(request);
  if (denied) return denied;
  const summary = await runCompetitorSync();
  return NextResponse.json({ ok: true, ...summary });
}

export const POST = GET;
