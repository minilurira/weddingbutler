import { NextRequest, NextResponse } from "next/server";
import { fetchBlockedSlots } from "@/lib/availability";
import type { AvailabilityResponse } from "@/lib/reservation-types";

export const dynamic = "force-dynamic";

// 예약 화면에서 날짜를 고르면 호출: 그날 고를 수 없는 시간 칩 목록만 돌려준다(개인정보 없음).
export async function GET(req: NextRequest) {
  const date = req.nextUrl.searchParams.get("date") ?? "";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ message: "date must be YYYY-MM-DD" }, { status: 400 });
  }
  const res: AvailabilityResponse = { blocked: (await fetchBlockedSlots(date)) ?? [] };
  return NextResponse.json(res);
}
