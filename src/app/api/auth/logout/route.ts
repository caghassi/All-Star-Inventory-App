import { NextResponse } from "next/server";
import { destroySession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  await destroySession();
  return NextResponse.redirect(new URL("/login", request.url), { status: 303 });
}

export const GET = POST;
