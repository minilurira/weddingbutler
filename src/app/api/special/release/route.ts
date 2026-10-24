import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { releaseSpecialOffer } from "@/lib/special-offer";

export const dynamic = "force-dynamic";

// 스페셜 예약 화면에서 결제가 취소·실패했을 때 링크 점유를 바로 풀어, 같은 고객이 다시 시도할 수 있게 한다.
// 예약번호와 결제번호(paymentId)를 둘 다 알아야 하고, 아직 결제되지 않은 예약만 대상이다.
export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as { rid?: string; paymentId?: string };
  if (!body.rid || !body.paymentId) return NextResponse.json({ ok: false }, { status: 400 });
  try {
    const db = supabaseAdmin();
    const { data: r } = await db
      .from("reservations")
      .select("id, booking_no, payment_status, portone_payment_id, special_token")
      .eq("id", body.rid)
      .maybeSingle();
    if (!r || r.portone_payment_id !== body.paymentId || !r.special_token || r.payment_status === "paid") {
      return NextResponse.json({ ok: false }, { status: 404 });
    }
    await db.from("reservations").update({ payment_status: "failed" }).eq("id", r.id).eq("payment_status", "pending");
    return NextResponse.json({ ok: await releaseSpecialOffer(r.special_token, r.booking_no) });
  } catch (err) {
    console.error("[special/release] failed", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
