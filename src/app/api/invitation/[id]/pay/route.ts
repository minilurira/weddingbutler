import { NextResponse } from "next/server";
import { notFound, serverError, sessionPhone, unauthorized } from "@/lib/invitation/api";
import { getOrder, getOwned, isPaid, markPaid } from "@/lib/invitation/store";
import { verifyPortOnePayment } from "@/lib/portone";

import { logError } from "@/lib/error-log";
export const dynamic = "force-dynamic";

// 결제 확인: 브라우저가 "결제됐다"고 해도 믿지 않고, 포트원 서버에 직접 물어 PAID이고 금액이 주문과 같을 때만 결제 완료로 기록한다.
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const phone = sessionPhone();
  if (!phone) return unauthorized();
  const body = (await req.json().catch(() => ({}))) as { paymentId?: unknown };
  if (typeof body.paymentId !== "string" || !/^[A-Za-z0-9_-]{8,80}$/.test(body.paymentId)) return NextResponse.json({ error: "invalid" }, { status: 400 });
  try {
    const row = await getOwned(params.id, phone);
    if (!row) return notFound();
    if (isPaid(row)) return NextResponse.json({ ok: true, paid: true });
    const order = await getOrder(row.id, body.paymentId);
    if (!order) return notFound();
    let pay;
    try {
      pay = await verifyPortOnePayment(body.paymentId);
    } catch (err) {
      logError("[invitation] payment verify failed", err);
      return NextResponse.json({ error: "verify_failed" }, { status: 502 });
    }
    if (pay.status !== "PAID") return NextResponse.json({ error: "not_paid", status: pay.status }, { status: 402 });
    if (pay.amountTotal !== order.amount) {
      logError(`[invitation] amount mismatch for ${body.paymentId}: paid ${pay.amountTotal}, expected ${order.amount}`);
      return NextResponse.json({ error: "amount_mismatch" }, { status: 409 });
    }
    await markPaid(row.id, body.paymentId, order.amount);
    return NextResponse.json({ ok: true, paid: true });
  } catch (err) {
    return serverError("pay", err);
  }
}
