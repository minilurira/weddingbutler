import { NextResponse } from "next/server";
import { lookupAdmin } from "@/lib/lookup-api";

export const dynamic = "force-dynamic";

// 예약 조회 인증번호 요청 → 어드민이 그 번호에 예약이 있으면 문자 발송
export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { phone?: unknown };
  const { status, body: data } = await lookupAdmin("otp", { phone: body.phone });
  return NextResponse.json(data, { status });
}
