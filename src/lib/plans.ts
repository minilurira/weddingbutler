export type PlanKey = "small" | "smallboth" | "standard" | "premium" | "special";

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

export const PLAN_ORDER: PublicPlanKey[] = ["small", "standard", "smallboth", "premium"];

export const PLANS: Record<PlanKey, Plan> = {
  small: {
    key: "small",
    name: "스몰케어",
    base: 390000,
    incl: 100,
    butlers: 2,
    desc: "식권 100매 이하 · 웨딩버틀러 2명",
  },
  // 스몰양가: 양가 하객이 적은 예식. 축의대 1곳에서 양가를 함께 받고 기록도 하나로 합친다.
  smallboth: {
    key: "smallboth",
    name: "스몰양가",
    base: 400000,
    incl: 120,
    butlers: 2,
    desc: "양가 각 식권 60매 이하 · 통합 축의대 · 웨딩버틀러 2명",
  },
  standard: {
    key: "standard",
    name: "스탠다드",
    base: 450000,
    incl: 200,
    butlers: 2,
    desc: "식권 101~200매 · 웨딩버틀러 2명",
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

/** 축의대 유형: 한측(신랑측 또는 신부측) / 양가 통합(축의대 1곳) / 양가 분리(축의대 2곳) */
export const DESK_TYPE: Record<PublicPlanKey, string> = {
  small: "한측 축의대",
  smallboth: "양가 통합",
  standard: "한측 축의대",
  premium: "양가 분리",
};

/** 양가를 함께 맡는 요금제 (신랑측/신부측을 고르지 않는다) */
export function isBothSidePlan(plan: PlanKey): boolean {
  return plan === "premium" || plan === "smallboth";
}

/**
 * 연말 이벤트: 예약(결제)한 날이 showUntil(한국시간) 전이면 예식일과 상관없이 기본 요금을 이벤트가로 받는다(기록 방식과 무관).
 * 팝업·취소선 표시도 같은 시점까지만 보인다.
 */
export const EVENT = {
  name: "연말 웨딩 이벤트",
  label: "12월 31일까지 예약",
  showUntil: new Date("2027-01-01T00:00:00+09:00"),
  prices: { small: 350000, smallboth: 350000, standard: 400000, premium: 750000 } as Record<PublicPlanKey, number>,
};

export function dateKey(y: number, m: number, d: number): string {
  return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

/** 이벤트 안내(팝업·가격 취소선)를 보여줄 시기인지 */
export function isEventShowing(now: Date = new Date()): boolean {
  return now < EVENT.showUntil;
}

/** 이벤트가 (이벤트 대상 요금제가 아니면 null) */
export function eventPriceOf(plan: PlanKey): number | null {
  return plan in EVENT.prices ? EVENT.prices[plan as PublicPlanKey] : null;
}

/** 예약 시점 기준 기본 요금: 이벤트 기간에 예약하면 이벤트가, 아니면 정가 */
export function planBase(plan: PlanKey): number {
  const ev = eventPriceOf(plan);
  return ev !== null && isEventShowing() ? ev : PLANS[plan].base;
}

/** "39만원"처럼 만원 단위로 짧게 */
export function manwon(n: number): string {
  return (n / 10000).toLocaleString("ko-KR") + "만원";
}

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
  /** 정가 기본 요금 (이벤트가가 적용되면 base보다 크다) */
  listBase: number;
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
  const base = planBase(plan);
  // Estimated only — actual 기준 초과 식권 fee is settled on-site after the
  // real 식권 배부 매수 is counted, so it's not part of the online total/deposit.
  const over = Math.max(0, guests - p.incl) * 2000;
  const extraButlerAmount = extraButlers * 100000;
  const total = base + extraButlerAmount;
  const deposit = paymentType === "full" ? total : Math.min(DEPOSIT_AMOUNT, total);
  return {
    base,
    over,
    extraButlerAmount,
    total,
    deposit,
    balance: total - deposit,
    incl: p.incl,
    listBase: p.base,
  };
}

/** 스페셜 예약: 링크에 정해진 금액을 전액 결제하거나, 예약금(DEPOSIT_AMOUNT)만 결제하고 나머지는 현장에서 현금으로 받는다. */
export function specialPrice(amount: number, paymentType: PaymentType = "full"): PriceBreakdown {
  const deposit = paymentType === "full" || !specialAllowsDeposit(amount) ? amount : DEPOSIT_AMOUNT;
  return { base: amount, over: 0, extraButlerAmount: 0, total: amount, deposit, balance: amount - deposit, incl: 0, listBase: amount };
}

/** 스페셜 금액이 예약금보다 커야 예약금 결제를 고를 수 있다. */
export function specialAllowsDeposit(amount: number): boolean {
  return amount > DEPOSIT_AMOUNT;
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
    listBase: total,
  };
}

/** 저장된 금액으로 결제 유형을 판별한다 — 현장 결제 금액이 없으면 전액결제. */
export function paymentTypeOf(balanceAmount: number): PaymentType {
  return balanceAmount > 0 ? "deposit" : "full";
}

/** Clamp guest count when switching plans, mirroring the prototype's `pick()` behavior. */
export function guestsForPlanSwitch(plan: PlanKey, guests: number): number {
  if (plan === "small" && guests > 100) return 100;
  if (plan === "smallboth" && guests > 120) return 120;
  if (plan === "premium" && guests < 400) return 400;
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

/** 축의대 구분. 스몰케어·스탠다드는 한쪽(신랑측/신부측)만 맡고, 스몰양가·프리미엄은 양가를 맡는다. */
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

/** 요금제별 축의대 구분: 스몰양가·프리미엄은 항상 양가, 나머지는 고객이 고른 쪽. */
export function sideForPlan(plan: PlanKey, side: Side | null | undefined): Side | null {
  if (isBothSidePlan(plan)) return "both";
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
