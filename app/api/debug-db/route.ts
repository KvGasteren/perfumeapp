/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/debug-db/route.ts
import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export const runtime = "nodejs"; // make sure we’re not on edge

export async function GET() {
  const dbUrl = process.env.DATABASE_URL;

  if (!dbUrl) {
    return NextResponse.json(
      { error: "DATABASE_URL is not set in this runtime" },
      { status: 500 }
    );
  }

  // parse safely so we can log the shape
  const parsed = new URL(dbUrl);

  const info = {
    protocol: parsed.protocol, // should be "postgresql:" or "postgres:"
    host: parsed.host,
    pathname: parsed.pathname,
    hasUsername: Boolean(parsed.username),
    usernameLength: parsed.username?.length ?? 0,
    hasPassword: Boolean(parsed.password),
    passwordLength: parsed.password?.length ?? 0,
    search: parsed.search,
  };

  try {
    const sql = neon(dbUrl);
    // simplest possible query
    const rows = await sql`select 1 as ok`;
    return NextResponse.json({ ok: true, info, rows });
  } catch (err: any) {
    // return the actual neon error so we see 401, 403, etc.
    return NextResponse.json(
      {
        ok: false,
        info,
        message: err?.message,
        name: err?.name,
        stack: err?.stack,
      },
      { status: 500 }
    );
  }
}
