import { NextResponse } from "next/server";
import { LOOKUP_COOKIE } from "@/lib/lookup-api";

export const dynamic = "force-dynamic";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(LOOKUP_COOKIE, "", { httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: 0 });
  return res;
}
