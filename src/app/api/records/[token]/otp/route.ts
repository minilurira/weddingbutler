import { NextResponse } from "next/server";
import { isRecordToken, requestRecordOtp } from "@/lib/record-api";

export const dynamic = "force-dynamic";

// 축의 기록 문자 인증번호 요청 → 어드민이 예약자 번호로 발송
export async function POST(_req: Request, { params }: { params: { token: string } }) {
  if (!isRecordToken(params.token)) return NextResponse.json({ error: "not_found" }, { status: 404 });
  const { status, body } = await requestRecordOtp(params.token);
  return NextResponse.json(body, { status });
}
