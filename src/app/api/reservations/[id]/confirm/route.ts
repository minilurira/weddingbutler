import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { verifyPortOnePayment } from "@/lib/portone";
import { syncReservationToAdmin } from "@/lib/admin-sync";
import type { PlanKey } from "@/lib/plans";
import type { ConfirmReservationResponse } from "@/lib/reservation-types";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  let body: { paymentId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid JSON body." }, { status: 400 });
  }

  const paymentId = body.paymentId;
  if (!paymentId) {
    return NextResponse.json({ ok: false, message: "paymentId is required." }, { status: 400 });
  }

  try {
    const db = supabaseAdmin();
    const { data: reservation, error: fetchError } = await db
      .from("reservations")
      .select("*")
      .eq("id", params.id)
      .single();

    if (fetchError || !reservation) {
      return NextResponse.json({ ok: false, message: "예약을 찾을 수 없습니다." }, { status: 404 });
    }

    if (reservation.portone_payment_id !== paymentId) {
      return NextResponse.json(
        { ok: false, message: "결제 정보가 예약과 일치하지 않습니다." },
        { status: 400 }
      );
    }

    if (reservation.payment_status === "paid") {
      const res: ConfirmReservationResponse = { ok: true, bookingNo: reservation.booking_no };
      return NextResponse.json(res);
    }

    const payment = await verifyPortOnePayment(paymentId);

    if (payment.status !== "PAID" || payment.amountTotal !== reservation.deposit_amount) {
      await db
        .from("reservations")
        .update({ payment_status: "failed" })
        .eq("id", params.id);
      const res: ConfirmReservationResponse = {
        ok: false,
        message: "결제가 확인되지 않았습니다. 결제 내역을 확인 후 다시 시도해 주세요.",
      };
      return NextResponse.json(res, { status: 402 });
    }

    await db
      .from("reservations")
      .update({
        payment_status: "paid",
        portone_tx_id: payment.txId ?? null,
        paid_at: new Date().toISOString(),
      })
      .eq("id", params.id);

    // Fire-and-forget-ish: staff should only see the reservation in the admin
    // once the deposit is actually paid, not while the customer is still
    // filling out the form. Never blocks or fails the customer's booking if
    // the admin is unreachable.
    void syncReservationToAdmin({
      bookingNo: reservation.booking_no,
      plan: reservation.plan as PlanKey,
      year: reservation.ceremony_year,
      month: reservation.ceremony_month,
      day: reservation.ceremony_day,
      time: reservation.ceremony_time,
      name: reservation.couple_name,
      phone: reservation.phone,
      venue: reservation.venue ?? "",
      guests: reservation.guests,
      payMethod: reservation.pay_method,
    });

    const res: ConfirmReservationResponse = { ok: true, bookingNo: reservation.booking_no };
    return NextResponse.json(res);
  } catch (err) {
    console.error("[reservations/confirm] verification failed", err);
    const res: ConfirmReservationResponse = {
      ok: false,
      message: "결제 확인 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.",
    };
    return NextResponse.json(res, { status: 500 });
  }
}
