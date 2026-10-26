import { NextResponse } from "next/server";
import { adminPublicPost } from "@/lib/lookup-api";
import { INVITATION_COOKIE, INVITATION_SESSION_DAYS, newInvitationSession } from "@/lib/invitation/session";

export const dynamic = "force-dynamic";

// 인증번호가 맞으면 그 번호로 7일 동안 청첩장을 만들고 고칠 수 있는 쿠키를 준다
export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { phone?: unknown; code?: unknown };
  const { status, body: data } = await adminPublicPost("lookup/verify", { phone: body.phone, code: body.code });
  const phone = typeof data.phone === "string" ? data.phone : null;
  const res = NextResponse.json(status === 200 ? { ok: true } : data, { status });
  if (status === 200 && phone) {
    res.cookies.set(INVITATION_COOKIE, newInvitationSession(phone), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: INVITATION_SESSION_DAYS * 24 * 60 * 60,
    });
  }
  return res;
}
