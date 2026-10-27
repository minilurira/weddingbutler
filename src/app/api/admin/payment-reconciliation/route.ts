import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { snapshotPortOnePayment } from "@/lib/portone";
import { isPgPaid, isTestTransaction, judge, type DbPaymentStatus, type ReconcileRow } from "@/lib/payment-reconciliation";

import { logError } from "@/lib/error-log";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

// 어드민 전용 결제 건 대사: 기간(접수일 기준) 안의 예약을 포트원 결제 기록과 한 건씩 맞춰 본다.
// 어드민이 RESERVATION_API_KEY(= 여기의 ADMIN_API_KEY)를 Bearer로 보낸다. 읽기 전용이며 아무것도 바꾸지 않는다.
//   GET ?from=YYYY-MM-DD&until=YYYY-MM-DD   (한국시간 기준, until 포함)
const MAX_DAYS = 93;
const CONCURRENCY = 5;
const DATE = /^\d{4}-\d{2}-\d{2}$/;

export async function GET(req: NextRequest) {
  const apiKey = process.env.ADMIN_API_KEY;
  if (!apiKey) {
    logError("[payment-reconciliation] ADMIN_API_KEY is not set - refusing all requests.");
    return NextResponse.json({ code: "server_error", message: "server not configured" }, { status: 500 });
  }
  if ((req.headers.get("authorization") ?? "") !== `Bearer ${apiKey}`) {
    return NextResponse.json({ code: "unauthorized" }, { status: 401 });
  }

  const from = req.nextUrl.searchParams.get("from") ?? "";
  const until = req.nextUrl.searchParams.get("until") ?? "";
  if (!DATE.test(from) || !DATE.test(until) || from > until) {
    return NextResponse.json({ code: "bad_request", message: "from, until(YYYY-MM-DD)을 확인해 주세요." }, { status: 400 });
  }
  const startMs = Date.parse(`${from}T00:00:00+09:00`), endMs = Date.parse(`${until}T00:00:00+09:00`) + 86400000;
  if (!(endMs - startMs <= MAX_DAYS * 86400000)) {
    return NextResponse.json({ code: "bad_request", message: `조회 기간은 ${MAX_DAYS}일 이내여야 합니다.` }, { status: 400 });
  }

  try {
    const { data, error } = await supabaseAdmin()
      .from("reservations")
      .select("booking_no, couple_name, payment_status, portone_payment_id, deposit_amount, created_at, paid_at")
      .gte("created_at", new Date(startMs).toISOString())
      .lt("created_at", new Date(endMs).toISOString())
      .order("created_at", { ascending: true })
      .limit(1000);
    if (error) throw error;
    const list = data ?? [];

    const rows: ReconcileRow[] = [];
    const failed: { bookingNo: string; message: string }[] = [];
    for (let i = 0; i < list.length; i += CONCURRENCY) {
      await Promise.all(
        list.slice(i, i + CONCURRENCY).map(async (r) => {
          try {
            const pg = await snapshotPortOnePayment(r.portone_payment_id);
            const dbStatus = r.payment_status as DbPaymentStatus;
            rows.push({
              bookingNo: r.booking_no, dbStatus, dbAmount: r.deposit_amount, paidAt: r.paid_at, createdAt: r.created_at,
              pgStatus: pg.status, pgAmount: pg.amount, pgCancelledAmount: pg.cancelledAmount,
              isTest: isTestTransaction(r.couple_name, r.deposit_amount),
              ...judge(dbStatus, r.deposit_amount, pg),
            });
          } catch (e) {
            logError(`[payment-reconciliation] lookup failed for ${r.booking_no}`, e);
            failed.push({ bookingNo: r.booking_no, message: e instanceof Error ? e.message : "조회 실패" });
          }
        })
      );
    }
    rows.sort((a, b) => a.createdAt.localeCompare(b.createdAt));

    const sum = (f: (r: ReconcileRow) => boolean, g: (r: ReconcileRow) => number) => rows.filter(f).reduce((s, r) => s + g(r), 0);
    return NextResponse.json({
      code: "ok",
      from, until,
      summary: {
        checked: rows.length,
        ok: rows.filter((r) => r.verdict === "ok").length,
        unpaid: rows.filter((r) => r.verdict === "unpaid").length,
        mismatch: rows.filter((r) => r.verdict === "mismatch").length,
        failed: failed.length,
        dbPaidTotal: sum((r) => r.dbStatus === "paid", (r) => r.dbAmount),
        pgPaidTotal: sum((r) => isPgPaid(r.pgStatus), (r) => r.pgAmount - (r.pgCancelledAmount ?? 0)),
      },
      rows,
      failed,
    });
  } catch (err) {
    logError("[payment-reconciliation] failed", err);
    return NextResponse.json({ code: "server_error", message: "대사 중 오류가 발생했습니다." }, { status: 500 });
  }
}
