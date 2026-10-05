import { NextResponse } from "next/server";
import { isRecordToken, verifyRecordOtp } from "@/lib/record-api";
import { SESSION_COOKIE, SESSION_HOURS, newSessionValue, sessionCookiePath } from "@/lib/record-session";

export const dynamic = "force-dynamic";

// 인증번호가 맞으면 이 기록 주소에서만 쓰는 12시간짜리 열람 쿠키를 준다
export async function POST(req: Request, { params }: { params: { token: string } }) {
  if (!isRecordToken(params.token)) return NextResponse.json({ error: "not_found" }, { status: 404 });

  let code = "";
  try {
    const body = (await req.json()) as { code?: unknown };
    code = typeof body.code === "string" ? body.code : "";
  } catch {
    return NextResponse.json({ error: "invalid JSON body" }, { status: 400 });
  }

  const { status, body } = await verifyRecordOtp(params.token, code);
  const res = NextResponse.json(body, { status });
  if (status === 200) {
    res.cookies.set(SESSION_COOKIE, newSessionValue(params.token), {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: sessionCookiePath(params.token),
      maxAge: SESSION_HOURS * 60 * 60,
    });
  }
  return res;
}
