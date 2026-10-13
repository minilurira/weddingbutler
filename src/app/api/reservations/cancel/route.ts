import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { cancelPortOnePayment } from "@/lib/portone";

export const dynamic = "force-dynamic";

// 어드민 전용: 예약번호로 포트원 결제를 찾아 전액 취소(이니시스 환불)한다.
// 어드민이 RESERVATION_API_KEY(= 여기의 ADMIN_API_KEY)를 Bearer로 보낸다.
//
// 응답 code: "cancelled" | "already_cancelled" | "not_found" | "not_paid" | "pg_error"
export async function POST(req: NextRequest) {
  const apiKey = process.env.ADMIN_API_KEY;
  if (!apiKey) {
    console.error("[reservations/cancel] ADMIN_API_KEY is not set - refusing all requests.");
    return NextResponse.json({ code: "server_error", message: "server not configured" }, { status: 500 });
  }
  const auth = req.headers.get("authorization") ?? "";
  if (auth !== `Bearer ${apiKey}`) {
    return NextResponse.json({ code: "unauthorized" }, { status: 401 });
  }

  let body: { bookingNo?: string; reason?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ code: "bad_request", message: "Invalid JSON body." }, { status: 400 });
  }
  const bookingNo = body.bookingNo?.trim();
  const reason = body.reason?.trim();
  if (!bookingNo || !reason) {
    return NextResponse.json({ code: "bad_request", message: "bookingNo and reason are required." }, { status: 400 });
  }

  try {
    const db = supabaseAdmin();
    const { data: reservation } = await db
      .from("reservations")
      .select("id, booking_no, payment_status, portone_payment_id, deposit_amount")
      .eq("booking_no", bookingNo)
      .maybeSingle();

    if (!reservation) {
      return NextResponse.json({ code: "not_found", message: "홈페이지에 결제 기록이 없는 예약입니다." }, { status: 404 });
    }
    if (reservation.payment_status === "cancelled") {
      return NextResponse.json({ code: "already_cancelled", refundAmount: reservation.deposit_amount });
    }
    if (reservation.payment_status !== "paid") {
      return NextResponse.json(
        { code: "not_paid", message: `결제 완료 상태가 아닙니다 (${reservation.payment_status}).` },
        { status: 409 }
      );
    }

    const result = await cancelPortOnePayment(reservation.portone_payment_id, reason);
    if (!result.ok) {
      console.error(`[reservations/cancel] PortOne cancel failed for ${bookingNo}: ${result.code} ${result.message}`);
      return NextResponse.json({ code: "pg_error", message: result.message, pgCode: result.code }, { status: 502 });
    }

    await db.from("reservations").update({ payment_status: "cancelled" }).eq("id", reservation.id);
    console.log(`[reservations/cancel] ${bookingNo} cancelled (status=${result.status}, amount=${result.cancelledAmount})`);

    return NextResponse.json({
      code: result.alreadyCancelled ? "already_cancelled" : "cancelled",
      refundAmount: result.cancelledAmount || reservation.deposit_amount,
      pgStatus: result.status,
    });
  } catch (err) {
    console.error(`[reservations/cancel] failed for ${bookingNo}`, err);
    return NextResponse.json({ code: "server_error", message: "결제취소 처리 중 오류가 발생했습니다." }, { status: 500 });
  }
}
