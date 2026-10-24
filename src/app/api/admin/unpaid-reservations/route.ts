import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { snapshotPortOnePayment } from "@/lib/portone";
import { abandonStage, isTestTransaction } from "@/lib/payment-reconciliation";
import { PLANS, type PlanKey } from "@/lib/plans";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// 어드민 전용: 결제를 끝내지 못한 예약(결제 대기·실패)을 포트원 결제 상태와 함께 돌려준다.
// 고객이 어느 단계에서 나갔는지(abandonStage)를 알려 주는 읽기 전용 조회이며, 아무것도 바꾸지 않는다.
// 어드민이 RESERVATION_API_KEY(= 여기의 ADMIN_API_KEY)를 Bearer로 보낸다.
//   GET ?days=30   (최근 N일, 1~93, 기본 30)
const CONCURRENCY = 5;
const RECENT_MIN = 30;

export async function GET(req: NextRequest) {
  const apiKey = process.env.ADMIN_API_KEY;
  if (!apiKey) {
    console.error("[unpaid-reservations] ADMIN_API_KEY is not set - refusing all requests.");
    return NextResponse.json({ code: "server_error", message: "server not configured" }, { status: 500 });
  }
  if ((req.headers.get("authorization") ?? "") !== `Bearer ${apiKey}`) {
    return NextResponse.json({ code: "unauthorized" }, { status: 401 });
  }
  const days = Math.min(93, Math.max(1, Math.floor(Number(req.nextUrl.searchParams.get("days"))) || 30));

  try {
    const { data, error } = await supabaseAdmin()
      .from("reservations")
      .select("booking_no, plan, couple_name, phone, venue, ceremony_year, ceremony_month, ceremony_day, ceremony_time, guests, deposit_amount, total_amount, payment_status, portone_payment_id, special_token, created_at")
      .in("payment_status", ["pending", "failed"])
      .gte("created_at", new Date(Date.now() - days * 86_400_000).toISOString())
      .order("created_at", { ascending: false })
      .limit(300);
    if (error) throw error;
    const list = data ?? [];

    const now = Date.now();
    const rows: unknown[] = [];
    const failed: { bookingNo: string; message: string }[] = [];
    for (let i = 0; i < list.length; i += CONCURRENCY) {
      await Promise.all(
        list.slice(i, i + CONCURRENCY).map(async (r) => {
          try {
            const pg = await snapshotPortOnePayment(r.portone_payment_id);
            const st = abandonStage(pg.status, pg.failureReason);
            rows.push({
              bookingNo: r.booking_no,
              name: r.couple_name,
              phone: r.phone,
              plan: PLANS[r.plan as PlanKey]?.name ?? r.plan,
              special: Boolean(r.special_token),
              venue: r.venue ?? "",
              ceremony: `${r.ceremony_year}-${String(r.ceremony_month).padStart(2, "0")}-${String(r.ceremony_day).padStart(2, "0")} ${r.ceremony_time}`,
              guests: r.guests,
              amount: r.deposit_amount,
              totalAmount: r.total_amount,
              dbStatus: r.payment_status,
              createdAt: r.created_at,
              pgStatus: pg.status,
              stage: st.stage,
              stageLabel: st.label,
              hint: st.hint,
              failureReason: pg.failureReason,
              recent: now - Date.parse(r.created_at) < RECENT_MIN * 60_000,
              isTest: isTestTransaction(r.couple_name, r.deposit_amount),
            });
          } catch (e) {
            console.error(`[unpaid-reservations] lookup failed for ${r.booking_no}`, e);
            failed.push({ bookingNo: r.booking_no, message: e instanceof Error ? e.message : "조회 실패" });
          }
        })
      );
    }
    (rows as { createdAt: string }[]).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return NextResponse.json({ code: "ok", days, rows, failed });
  } catch (err) {
    console.error("[unpaid-reservations] failed", err);
    return NextResponse.json({ code: "server_error", message: "미결제 예약을 불러오지 못했습니다." }, { status: 500 });
  }
}
