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
  failureReason?: string | null;
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
  /** 테스트 거래 여부 (isTestTransaction) */
  isTest?: boolean;
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

/** 테스트 거래: 이름이 [TEST]로 시작하거나 결제 금액이 1,000원 이하(결제 점검용 1,000원 결제·1,000원 스페셜 링크) */
export function isTestTransaction(coupleName: string | null | undefined, amount: number): boolean {
  return /^\[TEST\]/.test(coupleName ?? "") || amount <= 1000;
}

export type AbandonStage = "before_window" | "window_closed" | "in_progress" | "failed" | "vbank_unpaid" | "paid_unconfirmed" | "cancelled" | "other";

/**
 * 결제를 끝내지 못한 예약이 어느 단계에서 멈췄는지. 예약 DB에 행이 있다는 것은 고객이 예약 정보를 모두 입력하고
 * "결제하기"를 눌렀다는 뜻이다(그 앞의 단계에서 나간 사람은 기록이 남지 않는다). 그 뒤는 포트원 결제 상태로 구분한다.
 */
export function abandonStage(pgStatus: string, failureReason?: string | null): { stage: AbandonStage; label: string; hint: string } {
  switch (pgStatus) {
    case "NOT_FOUND":
      return { stage: "before_window", label: "결제창 열기 전 이탈", hint: "예약 정보를 입력하고 결제하기를 눌렀지만 결제 요청이 포트원에 닿지 않았습니다. 결제창이 뜨기 전에 창을 닫았거나 오류가 났을 수 있습니다." };
    case "READY":
      return { stage: "window_closed", label: "결제창에서 이탈", hint: "결제창은 열렸지만 결제를 시도하지 않고 나갔습니다 (카드 선택 전·인증 전 포함)." };
    case "PAY_PENDING":
      return { stage: "in_progress", label: "결제 진행 중 중단", hint: "카드 인증 등 결제 도중에 멈췄습니다. 방금 시작한 건이면 아직 진행 중일 수 있습니다." };
    case "FAILED":
      return { stage: "failed", label: "결제 실패", hint: failureReason ? `사유: ${failureReason}` : "결제를 시도했지만 실패했습니다. 카드사 승인 거절, 한도·인증 오류, 결제창에서 직접 취소한 경우가 모두 이렇게 남습니다." };
    case "VIRTUAL_ACCOUNT_ISSUED":
      return { stage: "vbank_unpaid", label: "가상계좌 미입금", hint: "가상계좌를 발급받고 입금하지 않았습니다." };
    case "PAID":
      return { stage: "paid_unconfirmed", label: "결제 완료 · 확정 누락", hint: "포트원에는 결제가 완료됐는데 예약이 확정 처리되지 않았습니다. 바로 확인이 필요합니다." };
    case "CANCELLED":
    case "PARTIAL_CANCELLED":
      return { stage: "cancelled", label: "결제 후 취소", hint: "결제 뒤 취소되었습니다." };
    default:
      return { stage: "other", label: `기타 (${pgStatus})`, hint: "알 수 없는 결제 상태입니다." };
  }
}
