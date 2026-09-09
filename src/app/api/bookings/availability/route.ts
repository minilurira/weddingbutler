import { NextRequest } from "next/server";
import { handleRouteError, fail, ok } from "@/lib/api";
import { getTakenSlots } from "@/lib/bookings";
import {
  addDays,
  allTimeSlots,
  earliestBookableDate,
  isValidDateString,
  latestBookableDate,
} from "@/lib/availability";

export const dynamic = "force-dynamic";

/**
 * GET /api/bookings/availability?from=YYYY-MM-DD&to=YYYY-MM-DD
 *
 * 달력이 한 달치 예약 현황을 한 번에 받아가기 위한 엔드포인트.
 * 날짜별로 이미 찬 시간대를 돌려준다.
 */
export async function GET(request: NextRequest) {
  try {
    const params = request.nextUrl.searchParams;
    const from = params.get("from");
    const to = params.get("to");

    if (!isValidDateString(from) || !isValidDateString(to)) {
      return fail("조회할 기간을 올바르게 지정해 주세요.", 400);
    }
    if (from > to) {
      return fail("시작일이 종료일보다 뒤일 수 없습니다.", 400);
    }
    // 한 번에 너무 넓은 기간을 훑지 못하게 막는다.
    if (to > addDays(from, 92)) {
      return fail("한 번에 조회할 수 있는 기간은 3개월까지입니다.", 400);
    }

    const taken = await getTakenSlots(from, to);

    return ok({
      taken,
      slots: allTimeSlots(),
      earliest: earliestBookableDate(),
      latest: latestBookableDate(),
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
