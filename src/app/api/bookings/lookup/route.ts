import { NextRequest } from "next/server";
import { fail, handleRouteError, ok } from "@/lib/api";
import { getBookingByPaymentId } from "@/lib/bookings";
import { getPlan } from "@/lib/pricing";

export const dynamic = "force-dynamic";

/**
 * GET /api/bookings/lookup?paymentId=...
 *
 * 예약 완료 화면이 방금 만든 예약을 다시 그려주기 위한 조회.
 *
 * paymentId 는 추측이 불가능한 무작위 값이지만, 그래도 여기서는 예약 확인에
 * 꼭 필요한 항목만 내려보낸다. 연락처는 뒷자리를 가린다.
 */
export async function GET(request: NextRequest) {
  try {
    const paymentId = request.nextUrl.searchParams.get("paymentId");
    if (!paymentId) return fail("결제 정보를 찾을 수 없습니다.", 400);

    const booking = await getBookingByPaymentId(paymentId);
    if (!booking) return fail("예약 정보를 찾을 수 없습니다.", 404);

    return ok({
      booking: {
        status: booking.status,
        planId: booking.plan_id,
        planName: getPlan(booking.plan_id)?.name ?? booking.plan_id,
        eventDate: booking.event_date,
        eventTime: booking.event_time,
        guestCount: booking.guest_count,
        extraButlers: booking.extra_butlers,
        venueName: booking.venue_name,
        contactName: booking.contact_name,
        phoneMasked: maskPhone(booking.phone),
        totalAmount: booking.total_amount,
        depositAmount: booking.deposit_amount,
        balanceAmount: booking.total_amount - booking.deposit_amount,
      },
    });
  } catch (error) {
    return handleRouteError(error);
  }
}

/** "01012345678" → "010-1234-****" */
function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 8) return "***";
  return `${digits.slice(0, 3)}-${digits.slice(3, -4)}-****`;
}
