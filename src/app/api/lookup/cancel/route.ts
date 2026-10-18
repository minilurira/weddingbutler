import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { LOOKUP_COOKIE, lookupAdmin, lookupPhone } from "@/lib/lookup-api";

export const dynamic = "force-dynamic";

// 인증된 번호의 예약을 고객이 직접 취소. 환불 금액은 어드민이 약관 기준으로 다시 계산해 결제취소한다.
export async function POST(req: Request) {
  const phone = lookupPhone(cookies().get(LOOKUP_COOKIE)?.value);
  if (!phone) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  const body = (await req.json().catch(() => ({}))) as { id?: unknown; reason?: unknown };
  const { status, body: data } = await lookupAdmin("cancel", { phone, id: body.id, reason: body.reason });
  return NextResponse.json(data, { status });
}
