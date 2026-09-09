import { NextResponse } from "next/server";
import {
  getBookingByPaymentId,
  markBookingCancelled,
  markBookingPaid,
  recordPayment,
} from "@/lib/bookings";
import {
  fetchPayment,
  isPortOneConfigured,
  isWebhookConfigured,
  pickWebhookHeaders,
  verifyWebhook,
} from "@/lib/portone";

export const dynamic = "force-dynamic";

/**
 * POST /api/payments/webhook
 *
 * 포트원이 결제 상태 변화를 알려주는 통로.
 *
 * 모바일 결제는 리디렉션 도중 사용자가 창을 닫는 일이 흔해서, 브라우저가
 * /api/payments/complete 를 호출하지 못하는 경우가 있다. 그런 결제도
 * 웹훅으로는 들어오므로 여기서 확정을 마무리한다.
 *
 * 포트원 콘솔의 웹훅 URL 에 다음 주소를 등록하세요:
 *   https://<도메인>/api/payments/webhook
 */
export async function POST(request: Request) {
  // 서명 검증에는 파싱 전 원본 문자열이 필요하다.
  const rawBody = await request.text();

  if (!isWebhookConfigured()) {
    console.warn(
      "[webhook] PORTONE_WEBHOOK_SECRET 이 없어 웹훅을 무시합니다.",
    );
    return NextResponse.json({ ok: true, skipped: true });
  }

  let event;
  try {
    event = await verifyWebhook(rawBody, pickWebhookHeaders(request.headers));
  } catch (error) {
    // 서명이 맞지 않는 요청은 포트원이 보낸 것이 아니다. 절대 처리하지 않는다.
    console.error("[webhook] 서명 검증 실패:", error);
    return NextResponse.json(
      { ok: false, error: "invalid signature" },
      { status: 400 },
    );
  }

  const { type, paymentId } = event;
  if (!paymentId) {
    return NextResponse.json({ ok: true, ignored: type });
  }

  try {
    const booking = await getBookingByPaymentId(paymentId);
    if (!booking) {
      console.warn(`[webhook] 해당 결제의 예약이 없습니다: ${paymentId}`);
      return NextResponse.json({ ok: true, ignored: "unknown payment" });
    }

    if (!isPortOneConfigured()) {
      console.warn("[webhook] API Secret 이 없어 결제 상태를 조회할 수 없습니다.");
      return NextResponse.json({ ok: true, skipped: true });
    }

    // 웹훅 본문의 상태를 믿지 않고 다시 조회한다. 조회 결과가 최종 진실이다.
    const payment = await fetchPayment(paymentId);

    await recordPayment({
      bookingId: booking.id,
      portonePaymentId: paymentId,
      amount: payment.amount,
      status: payment.status,
      method: payment.method,
      raw: payment.raw,
    });

    if (
      payment.status === "PAID" &&
      payment.amount === booking.deposit_amount &&
      booking.status === "pending"
    ) {
      await markBookingPaid(booking.id);
    }

    if (
      (payment.status === "CANCELLED" || payment.status === "FAILED") &&
      booking.status !== "cancelled"
    ) {
      await markBookingCancelled(
        booking.id,
        `결제 ${payment.status} (웹훅 ${type})`,
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    // 500 을 주면 포트원이 재시도한다. 일시적 장애라면 그 편이 낫다.
    console.error("[webhook] 처리 실패:", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
