import { fail, handleRouteError, ok, readJson } from "@/lib/api";
import {
  getBookingByPaymentId,
  markBookingPaid,
  recordPayment,
} from "@/lib/bookings";
import { fetchPayment, isPortOneConfigured } from "@/lib/portone";
import { paymentCompleteSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

/**
 * POST /api/payments/complete
 *
 * 결제창이 닫힌 뒤 브라우저가 호출한다. 브라우저가 "성공했다"고 말한 것을
 * 그대로 믿지 않고, 포트원 서버에 직접 물어 상태와 금액을 확인한 뒤에만
 * 예약을 확정한다.
 */
export async function POST(request: Request) {
  try {
    const { paymentId } = paymentCompleteSchema.parse(await readJson(request));

    const booking = await getBookingByPaymentId(paymentId);
    if (!booking) {
      return fail("예약 정보를 찾을 수 없습니다.", 404);
    }

    // 웹훅이 먼저 도착해 이미 확정된 경우 — 성공으로 응답한다.
    if (booking.status === "paid" || booking.status === "completed") {
      return ok({ bookingId: booking.id, status: booking.status });
    }

    if (booking.status === "cancelled") {
      return fail("취소된 예약입니다. 다시 예약해 주세요.", 409);
    }

    /*
     * 모의결제 모드.
     *
     * API Secret 이 없으면 포트원에 물어볼 방법이 없다. 이때는 검증을
     * 건너뛰고 확정 처리한다 — 키를 넣기 전에도 예약 흐름 전체를
     * 테스트할 수 있게 하기 위해서다. 키가 들어오는 순간 이 분기는
     * 더 이상 타지 않으므로, 운영 환경에서 검증이 생략될 일은 없다.
     */
    if (!isPortOneConfigured()) {
      console.warn(
        `[payments] 모의결제로 예약을 확정합니다 (paymentId=${paymentId}). ` +
          "실제 결제 검증을 하려면 PORTONE_API_SECRET 을 설정하세요.",
      );
      await markBookingPaid(booking.id);
      await recordPayment({
        bookingId: booking.id,
        portonePaymentId: paymentId,
        amount: booking.deposit_amount,
        status: "MOCK_PAID",
        method: "MOCK",
      });
      return ok({ bookingId: booking.id, status: "paid", mock: true });
    }

    const payment = await fetchPayment(paymentId);

    await recordPayment({
      bookingId: booking.id,
      portonePaymentId: paymentId,
      amount: payment.amount,
      status: payment.status,
      method: payment.method,
      raw: payment.raw,
    });

    if (payment.status !== "PAID") {
      return fail(
        `결제가 완료되지 않았습니다. (상태: ${payment.status})`,
        402,
        { status: payment.status },
      );
    }

    // 금액 대조 — 결제창에 넘긴 금액이 조작됐다면 여기서 걸린다.
    if (payment.amount !== booking.deposit_amount) {
      console.error(
        `[payments] 금액 불일치: 청구 ${booking.deposit_amount}원, 승인 ${payment.amount}원 (paymentId=${paymentId})`,
      );
      return fail(
        "결제 금액이 예약 금액과 일치하지 않습니다. 고객센터로 문의해 주세요.",
        409,
      );
    }

    await markBookingPaid(booking.id);

    return ok({ bookingId: booking.id, status: "paid" });
  } catch (error) {
    return handleRouteError(error);
  }
}
