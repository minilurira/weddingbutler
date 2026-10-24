export type PlanKey = "small" | "standard" | "premium" | "special";

export interface Plan {
  key: PlanKey;
  name: string;
  base: number;
  incl: number;
  butlers: number;
  desc: string;
}

/** 일반 예약 화면에 보이는 요금제 (스페셜 제외) */
export type PublicPlanKey = Exclude<PlanKey, "special">;

export const PLAN_ORDER: PublicPlanKey[] = ["small", "standard", "premium"];

export const PLANS: Record<PlanKey, Plan> = {
  small: {
    key: "small",
    name: "스몰케어",
    base: 390000,
    incl: 200,
    butlers: 2,
    desc: "식권 200매 이하 · 웨딩버틀러 2명",
  },
  standard: {
    key: "standard",
    name: "스탠다드",
    base: 450000,
    incl: 300,
    butlers: 2,
    desc: "식권 201~300매 · 웨딩버틀러 2명",
  },
  premium: {
    key: "premium",
    name: "프리미엄",
    base: 800000,
    incl: 400,
    butlers: 4,
    desc: "양가 합계 식권 400매 기준 · 웨딩버틀러 4명",
  },
  // 스페셜: 관리자가 예약 링크마다 금액을 정한다. PLAN_ORDER에는 넣지 않아 일반 예약 화면에는 나오지 않는다.
  special: {
    key: "special",
    name: "스페셜",
    base: 0,
    incl: 0,
    butlers: 2,
    desc: "맞춤 금액 · 웨딩버틀러 2명",
  },
};

export function won(n: number): string {
  return n.toLocaleString("ko-KR") + "원";
}

export interface PriceBreakdown {
  base: number;
  over: number;
  extraButlerAmount: number;
  total: number;
  deposit: number;
  balance: number;
  incl: number;
}

/** Fixed booking deposit, regardless of plan — the remaining balance
 * (base + extras, minus this) is settled on-site right before handover,
 * once the actual 식권 배부 매수 for the day is known. */
export const DEPOSIT_AMOUNT = 100000;

/** 고객이 예약할 때 고르는 결제 유형.
 * - deposit: 예약금(DEPOSIT_AMOUNT)만 온라인 결제, 나머지는 예식 당일 현장 결제
 * - full: 총 금액을 온라인으로 한 번에 결제, 현장 결제 금액 0원 */
export type PaymentType = "deposit" | "full";

export const PAYMENT_TYPES: Record<PaymentType, { name: string; short: string }> = {
  deposit: { name: "예약금 결제 후 현장결제", short: "예약금" },
  full: { name: "전액결제", short: "전액" },
};

export function isPaymentType(v: unknown): v is PaymentType {
  return v === "deposit" || v === "full";
}

/** 현장 결제는 현금으로만 받는다 — 예약 화면·FAQ에 같은 문구로 안내한다. */
export const ONSITE_CASH_ONLY_NOTE = "현장 결제 금액은 현금으로만 결제할 수 있습니다.";

export function calcPrice(
  plan: PlanKey,
  guests: number,
  extraButlers: number,
  paymentType: PaymentType
): PriceBreakdown {
  const p = PLANS[plan];
  // Estimated only — actual 기준 초과 식권 fee is settled on-site after the
  // real 식권 배부 매수 is counted, so it's not part of the online total/deposit.
  const over = Math.max(0, guests - p.incl) * 2000;
  const extraButlerAmount = extraButlers * 100000;
  const total = p.base + extraButlerAmount;
  const deposit = paymentType === "full" ? total : Math.min(DEPOSIT_AMOUNT, total);
  return {
    base: p.base,
    over,
    extraButlerAmount,
    total,
    deposit,
    balance: total - deposit,
    incl: p.incl,
  };
}

/** 스페셜 예약: 링크에 정해진 금액을 한 번에 전액 결제한다 (추가 요금·현장 결제 없음). */
export function specialPrice(amount: number): PriceBreakdown {
  return { base: amount, over: 0, extraButlerAmount: 0, total: amount, deposit: amount, balance: 0, incl: 0 };
}

/** Flat 1,000원 charge used only by the header's hidden test-payment button
 * (결제/알림톡/카카오워크봇 파이프라인 점검용) — never reachable by a real
 * customer, see TEST_PAYMENT_KEY handling in /api/reservations. 예약금 유형으로
 * 테스트하면 현장 결제 1,000원이 남도록 해서 어드민에 유형이 구분돼 들어간다. */
export function testPrice(paymentType: PaymentType): PriceBreakdown {
  const total = paymentType === "full" ? 1000 : 2000;
  return {
    base: total,
    over: 0,
    extraButlerAmount: 0,
    total,
    deposit: 1000,
    balance: total - 1000,
    incl: 0,
  };
}

/** 저장된 금액으로 결제 유형을 판별한다 — 현장 결제 금액이 없으면 전액결제. */
export function paymentTypeOf(balanceAmount: number): PaymentType {
  return balanceAmount > 0 ? "deposit" : "full";
}

/** Clamp guest count when switching plans, mirroring the prototype's `pick()` behavior. */
export function guestsForPlanSwitch(plan: PlanKey, guests: number): number {
  if (plan === "small" && guests > 200) return 200;
  if (plan === "premium" && guests < 400) return 400;
  if (plan === "standard" && guests > 300) return 300;
  return guests;
}

export const TIME_SLOTS: string[] = [
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
  "17:30",
  "18:00",
  "18:30",
  "19:00",
];

/** 축의대 구분. 스몰케어·스탠다드는 한쪽(신랑측/신부측)만 맡고, 프리미엄은 양가를 맡는다. */
export type Side = "groom" | "bride" | "both";
export type OneSide = "groom" | "bride";

export const SIDE_LABEL: Record<Side, string> = {
  groom: "신랑측",
  bride: "신부측",
  both: "양가",
};

export function isOneSide(v: unknown): v is OneSide {
  return v === "groom" || v === "bride";
}

/** 요금제별 축의대 구분: 프리미엄은 항상 양가, 나머지는 고객이 고른 쪽. */
export function sideForPlan(plan: PlanKey, side: Side | null | undefined): Side | null {
  if (plan === "premium") return "both";
  return side ?? null;
}

/** 이미 잡힌 예식 시각 기준으로 앞 1시간 ~ 뒤 2시간(양 끝 포함)은 다른 예약을 받지 않는다. */
export const BLOCK_BEFORE_MIN = 60;
export const BLOCK_AFTER_MIN = 120;

function toMinutes(t: string): number | null {
  const m = /^(\d{2}):(\d{2})$/.exec(t);
  return m ? Number(m[1]) * 60 + Number(m[2]) : null;
}

/** 예약된 시각 목록 → 고를 수 없는 TIME_SLOTS 목록. */
export function blockedSlots(bookedTimes: string[]): string[] {
  const booked = bookedTimes.map(toMinutes).filter((n): n is number => n !== null);
  return TIME_SLOTS.filter((slot) => {
    const s = toMinutes(slot)!;
    return booked.some((b) => s >= b - BLOCK_BEFORE_MIN && s <= b + BLOCK_AFTER_MIN);
  });
}

export const PAY_METHODS = ["신용카드", "계좌이체", "카카오페이"] as const;
export type PayMethod = (typeof PAY_METHODS)[number];
