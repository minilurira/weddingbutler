export type PlanKey = "small" | "standard" | "premium";

export interface Plan {
  key: PlanKey;
  name: string;
  base: number;
  incl: number;
  butlers: number;
  desc: string;
}

export const PLAN_ORDER: PlanKey[] = ["small", "standard", "premium"];

export const PLANS: Record<PlanKey, Plan> = {
  small: {
    key: "small",
    name: "스몰케어",
    base: 390000,
    incl: 200,
    butlers: 2,
    desc: "하객 200명 이하 · 웨딩버틀러 2명",
  },
  standard: {
    key: "standard",
    name: "스탠다드",
    base: 450000,
    incl: 300,
    butlers: 2,
    desc: "하객 300명 이하 · 웨딩버틀러 2명",
  },
  premium: {
    key: "premium",
    name: "프리미엄",
    base: 800000,
    incl: 400,
    butlers: 4,
    desc: "양가 각 200명 기준 · 웨딩버틀러 4명",
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

export function calcPrice(
  plan: PlanKey,
  guests: number,
  extraButlers: number
): PriceBreakdown {
  const p = PLANS[plan];
  const over = Math.max(0, guests - p.incl) * 2000;
  const extraButlerAmount = extraButlers * 100000;
  const total = p.base + over + extraButlerAmount;
  const deposit = Math.round(total / 2);
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

export const PAY_METHODS = ["신용카드", "계좌이체", "카카오페이"] as const;
export type PayMethod = (typeof PAY_METHODS)[number];
