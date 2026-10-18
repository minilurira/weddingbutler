import { NextResponse } from "next/server";
import { LOOKUP_COOKIE, LOOKUP_MINUTES, lookupAdmin, newLookupSession } from "@/lib/lookup-api";

export const dynamic = "force-dynamic";

// 인증번호가 맞으면 그 번호로 30분 동안 예약을 볼 수 있는 쿠키를 준다
export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { phone?: unknown; code?: unknown };
  const { status, body: data } = await lookupAdmin("verify", { phone: body.phone, code: body.code });
  const phone = typeof data.phone === "string" ? data.phone : null;
  const res = NextResponse.json(status === 200 ? { ok: true } : data, { status });
  if (status === 200 && phone) {
    res.cookies.set(LOOKUP_COOKIE, newLookupSession(phone), {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: LOOKUP_MINUTES * 60,
    });
  }
  return res;
}
