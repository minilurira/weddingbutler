import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { LOOKUP_COOKIE, lookupAdmin, lookupPhone } from "@/lib/lookup-api";

export const dynamic = "force-dynamic";

// 인증된 번호의 예약 목록
export async function GET() {
  const phone = lookupPhone(cookies().get(LOOKUP_COOKIE)?.value);
  if (!phone) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  const { status, body } = await lookupAdmin("reservations", { phone });
  return NextResponse.json({ ...body, phoneMasked: `${phone.slice(0, 3)}-****-${phone.slice(-4)}` }, { status });
}
