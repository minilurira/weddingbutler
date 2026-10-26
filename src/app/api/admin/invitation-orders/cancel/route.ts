import { NextResponse } from "next/server";
import { requireAdminKey } from "@/lib/invitation/admin-auth";
import { applyCancellation, getOrderByPayment } from "@/lib/invitation/store";
import { cancelPortOnePayment } from "@/lib/portone";

export const dynamic = "force-dynamic";

// 어드민 전용: 프리미엄 결제 전액 취소(환불). PG 취소가 성공했을 때만 주문·청첩장을 바꾼다. 이미 취소된 건을 다시 불러도 안전하다.
export async function POST(req: Request) {
  const denied = requireAdminKey(req);
  if (denied) return denied;
  const body = (await req.json().catch(() => ({}))) as { paymentId?: unknown; reason?: unknown; after?: unknown };
  const paymentId = typeof body.paymentId === "string" ? body.paymentId : "";
  const reason = typeof body.reason === "string" ? body.reason.trim().slice(0, 100) : "";
  const after = body.after === "hide" ? "hide" : "free";
  if (!/^[A-Za-z0-9_-]{8,80}$/.test(paymentId)) return NextResponse.json({ code: "bad_request", message: "결제번호를 확인해 주세요." }, { status: 400 });
  if (!reason) return NextResponse.json({ code: "bad_request", message: "취소 사유를 입력해 주세요." }, { status: 400 });
  try {
    const order = await getOrderByPayment(paymentId);
    if (!order) return NextResponse.json({ code: "not_found", message: "결제 기록을 찾을 수 없습니다." }, { status: 404 });
    if (order.status === "cancelled") return NextResponse.json({ code: "ok", alreadyCancelled: true });
    if (order.status !== "paid") return NextResponse.json({ code: "not_paid", message: "결제가 완료된 건만 취소할 수 있습니다." }, { status: 409 });
    const res = await cancelPortOnePayment(paymentId, `모바일 청첩장 결제 취소: ${reason}`);
    if (!res.ok) return NextResponse.json({ code: "pg_failed", message: res.message }, { status: 502 });
    await applyCancellation(order, order.amount, reason, after);
    return NextResponse.json({ code: "ok", alreadyCancelled: res.alreadyCancelled, refunded: order.amount });
  } catch (err) {
    console.error("[admin invitation-orders cancel] failed", err);
    return NextResponse.json({ code: "server_error", message: "취소 처리 중 오류가 났습니다. 포트원에서 취소 여부를 확인해 주세요." }, { status: 500 });
  }
}
