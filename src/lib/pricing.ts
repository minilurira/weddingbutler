/**
 * 웨딩버틀러 요금 정책 — 단일 소스(Single Source of Truth).
 *
 * 화면 표시용 견적과 실제 결제 금액이 어긋나면 안 되므로,
 * 클라이언트 계산기와 서버 결제 검증 모두 이 파일의 함수를 그대로 사용한다.
 * 정책이 바뀌면 이 파일만 고치면 된다.
 */

/** 표시 금액은 전부 부가세 포함가다. */
export const VAT_INCLUDED = true;

/** 포함 인원을 넘어선 하객 1명당 추가 요금(원). */
export const EXTRA_GUEST_FEE = 2_000;

/** 버틀러 1명 추가 시 요금(원). */
export const EXTRA_BUTLER_FEE = 100_000;

/** 예약 시 선결제하는 계약금 비율. 잔금은 예식 당일 정산. */
export const DEPOSIT_RATE = 0.1;

/** 요금제 하나가 감당할 수 있는 현실적인 상한. 폼 입력 검증에 쓴다. */
export const MAX_GUEST_COUNT = 1_200;
export const MAX_EXTRA_BUTLERS = 6;

export type PlanId = "small" | "standard" | "premium";

export type Plan = {
  id: PlanId;
  /** 01, 02, 03 — 카드에 붙는 넘버링 */
  index: string;
  name: string;
  tagline: string;
  /** 기본 요금(원, VAT 포함) */
  basePrice: number;
  /** 기본 요금에 포함된 하객 수 */
  includedGuests: number;
  /** 기본 배정 버틀러 수 */
  butlers: number;
  /** 버틀러를 추가로 붙일 수 있는 요금제인지 */
  allowsExtraButler: boolean;
  /** 가격 앞에 "부터"가 붙는 요금제인지 (프리미엄) */
  priceIsFrom: boolean;
  /** 요금제 카드에 노출할 조건 요약 */
  guestRange: string;
  /** 카드 본문에 노출할 항목들 */
  features: string[];
  /** 이런 분께 어울립니다 */
  bestFor: string;
  /** 강조 표시할 대표 요금제 */
  highlight?: boolean;
};

export const PLANS: Plan[] = [
  {
    id: "small",
    index: "01",
    name: "스몰케어",
    tagline: "가까운 사람들과 치르는 담백한 예식",
    basePrice: 390_000,
    includedGuests: 200,
    butlers: 2,
    allowsExtraButler: false,
    priceIsFrom: false,
    guestRange: "하객 200명 이하",
    features: [
      "웨딩버틀러 2명 배정",
      "축의금 접수·기록·정산 전 과정",
      "방명록 안내 및 답례품 전달",
      "예식 종료 후 현장 정산 및 인계",
    ],
    bestFor: "스몰웨딩·하우스웨딩처럼 하객 규모가 크지 않은 예식",
  },
  {
    id: "standard",
    index: "02",
    name: "스탠다드",
    tagline: "가장 많은 예비부부가 선택하는 기본 구성",
    basePrice: 450_000,
    includedGuests: 300,
    butlers: 2,
    allowsExtraButler: true,
    priceIsFrom: false,
    guestRange: "하객 200명 이상 ~ 300명 이하",
    features: [
      "웨딩버틀러 2명 배정",
      "축의금 접수·기록·정산 전 과정",
      "방명록 안내 및 답례품 전달",
      "혼잡 시간대 대기 줄 분산 운영",
      "버틀러 추가 배정 가능 (1명당 10만원)",
    ],
    bestFor: "일반적인 웨딩홀 예식, 양가 하객이 한 접수대에 모이는 경우",
    highlight: true,
  },
  {
    id: "premium",
    index: "03",
    name: "프리미엄 양가",
    tagline: "신랑측·신부측 접수대를 따로 운영",
    basePrice: 800_000,
    includedGuests: 400,
    butlers: 4,
    allowsExtraButler: true,
    priceIsFrom: true,
    guestRange: "양가 하객 각 200명 기준",
    features: [
      "웨딩버틀러 4명 배정 (양가 각 2명)",
      "신랑측·신부측 접수대 분리 운영",
      "축의금 접수·기록·정산 전 과정",
      "양가 각각 별도 정산서 제공",
      "버틀러 추가 배정 가능 (1명당 10만원)",
    ],
    bestFor: "양가 하객이 많고 접수대를 나누어 운영해야 하는 대형 예식",
  },
];

export function getPlan(planId: string): Plan | undefined {
  return PLANS.find((plan) => plan.id === planId);
}

export type QuoteInput = {
  planId: PlanId;
  guestCount: number;
  extraButlers: number;
};

export type Quote = {
  plan: Plan;
  guestCount: number;
  extraButlers: number;
  /** 포함 인원을 초과한 하객 수 */
  extraGuests: number;
  basePrice: number;
  extraGuestFee: number;
  extraButlerFee: number;
  /** 최종 결제 대상 총액 (VAT 포함) */
  total: number;
  /** 예약 시 선결제할 금액 */
  deposit: number;
  /** 예식 당일 정산할 잔금 */
  balance: number;
};

/**
 * 견적을 계산한다.
 *
 * 입력값은 신뢰하지 않고 요금제가 허용하는 범위로 강제 보정한다.
 * (예: 스몰케어는 버틀러 추가가 불가능하므로 extraButlers를 0으로 깎는다)
 */
export function calculateQuote(input: QuoteInput): Quote {
  const plan = getPlan(input.planId);
  if (!plan) {
    throw new Error(`알 수 없는 요금제입니다: ${input.planId}`);
  }

  const guestCount = clampInt(input.guestCount, 0, MAX_GUEST_COUNT);
  const extraButlers = plan.allowsExtraButler
    ? clampInt(input.extraButlers, 0, MAX_EXTRA_BUTLERS)
    : 0;

  const extraGuests = Math.max(0, guestCount - plan.includedGuests);
  const extraGuestFee = extraGuests * EXTRA_GUEST_FEE;
  const extraButlerFee = extraButlers * EXTRA_BUTLER_FEE;
  const total = plan.basePrice + extraGuestFee + extraButlerFee;
  const deposit = Math.round(total * DEPOSIT_RATE);

  return {
    plan,
    guestCount,
    extraButlers,
    extraGuests,
    basePrice: plan.basePrice,
    extraGuestFee,
    extraButlerFee,
    total,
    deposit,
    balance: total - deposit,
  };
}

/** 하객 수를 입력하면 가장 저렴하게 커버되는 요금제를 돌려준다. */
export function suggestPlan(guestCount: number): Plan {
  return (
    PLANS.find(
      (plan) => plan.id !== "premium" && guestCount <= plan.includedGuests,
    ) ?? PLANS[PLANS.length - 1]
  );
}

function clampInt(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, Math.floor(value)));
}
