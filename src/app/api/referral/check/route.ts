import { NextResponse } from "next/server";
import { checkReferralCode } from "@/lib/referral";

export const dynamic = "force-dynamic";

// 예약창의 추천 코드 확인 → { valid, name(가린 이름) }
export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { code?: unknown };
  return NextResponse.json(await checkReferralCode(body.code));
}
