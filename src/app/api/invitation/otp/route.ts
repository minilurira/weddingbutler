import { NextResponse } from "next/server";
import { adminPublicPost } from "@/lib/lookup-api";

export const dynamic = "force-dynamic";

// 모바일 청첩장 인증번호 요청 → 어드민이 알림톡(실패 시 문자)으로 6자리 번호를 보낸다
export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { phone?: unknown };
  const { status, body: data } = await adminPublicPost("invitation/otp", { phone: body.phone });
  return NextResponse.json(data, { status });
}
