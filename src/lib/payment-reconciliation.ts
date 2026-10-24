// 결제 건 대사: 홈페이지 DB(reservations)의 결제 상태·금액을 포트원 결제 기록과 한 건씩 맞춰 본다.
// 포트원 대사 API(payment-reconciliations)는 부가세 리포트만 주고, 건별 수수료·정산금액은 어떤 API로도
// 받을 수 없어서 여기서는 "결제 상태와 금액이 서로 맞는지"만 본다. 수수료·입금액 대사는 하지 않는다.

export type DbPaymentStatus = "pending" | "paid" | "failed" | "cancelled";

export interface PgSnapshot {
  /** 포트원 결제 상태. 기록이 없으면 "NOT_FOUND" */
  status: string;
  /** 결제 금액(amount.total) */
  amount: number;
  /** 포트원이 알려 준 취소 금액(없으면 null) */
  cancelledAmount: number | null;
}

export interface ReconcileRow {
  bookingNo: string;
  dbStatus: DbPaymentStatus;
  dbAmount: number;
  paidAt: string | null;
  createdAt: string;
  pgStatus: string;
  pgAmount: number;
  pgCancelledAmount: number | null;
  verdict: "ok" | "mismatch" | "unpaid";
  /** mismatch일 때 사람이 읽는 사유 */
  reason: string;
}

const PG_PAID = new Set(["PAID", "PARTIAL_CANCELLED"]);
const PG_CANCELLED = new Set(["CANCELLED", "PARTIAL_CANCELLED"]);
const PG_NOT_PAID = new Set(["READY", "FAILED", "PAY_PENDING", "VIRTUAL_ACCOUNT_ISSUED", "NOT_FOUND"]);

/** DB 상태와 포트원 상태를 비교해 판정한다. 같은 금액이면서 상태가 맞아야 ok. */
export function judge(dbStatus: DbPaymentStatus, dbAmount: number, pg: PgSnapshot): Pick<ReconcileRow, "verdict" | "reason"> {
  const { status } = pg;
  const mismatch = (reason: string) => ({ verdict: "mismatch" as const, reason });

  if (dbStatus === "paid") {
    if (status === "PAID") return pg.amount === dbAmount ? { verdict: "ok", reason: "" } : mismatch(`금액이 다릅니다 (예약 ${dbAmount.toLocaleString("ko-KR")}원, 포트원 ${pg.amount.toLocaleString("ko-KR")}원)`);
    if (status === "PARTIAL_CANCELLED") return mismatch("포트원에서 부분취소된 결제인데 예약은 결제완료 상태입니다");
    if (status === "CANCELLED") return mismatch("포트원에서는 취소된 결제인데 예약은 결제완료 상태입니다");
    if (status === "NOT_FOUND") return mismatch("포트원에 결제 기록이 없습니다");
    return mismatch(`포트원 결제 상태가 ${status}입니다`);
  }

  if (dbStatus === "cancelled") {
    if (PG_CANCELLED.has(status)) return { verdict: "ok", reason: "" };
    if (status === "PAID") return mismatch("예약은 취소 처리됐는데 포트원 결제는 그대로입니다 (환불되지 않았을 수 있음)");
    return { verdict: "ok", reason: "" }; // 결제 전에 취소된 예약
  }

  // pending / failed
  if (status === "PAID") return mismatch(`포트원에는 결제 완료인데 예약은 ${dbStatus === "pending" ? "결제 대기" : "결제 실패"} 상태입니다 (결제는 됐는데 확정 처리가 안 됨)`);
  if (PG_CANCELLED.has(status)) return { verdict: "ok", reason: "" };
  if (PG_NOT_PAID.has(status)) return { verdict: "unpaid", reason: "" };
  return mismatch(`알 수 없는 포트원 상태 ${status}`);
}

export const isPgPaid = (status: string) => PG_PAID.has(status);
