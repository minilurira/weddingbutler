import type { EnvelopeMode, PaymentType, PlanKey, Side } from "@/lib/plans";

export interface CreateReservationInput {
  plan: PlanKey;
  year: number;
  month: number;
  day: number;
  time: string;
  name: string;
  /** 스몰케어·스탠다드만: 신랑측/신부측. 스몰양가·프리미엄은 서버에서 양가로 저장한다. */
  side?: Side | null;
  phone: string;
  email: string;
  venue: string;
  /** 예식장 지역(TRAVEL_REGIONS key). 일반 예약은 필수, 스페셜·테스트는 없어도 된다(출장비 0원). */
  region?: string;
  /** 봉투 처리 방식: 밀봉 / 개봉 집계 (테스트 결제는 없어도 된다) */
  envelopeMode?: EnvelopeMode;
  /** 고객이 남기는 요청 사항(선택, 최대 500자) */
  memo?: string;
  /** 고객이 고른 유입 경로(선택, 최대 60자) */
  source?: string;
  guests: number;
  extraButlers: number;
  payMethod: string;
  paymentType: PaymentType;
  /** 결제/알림톡/카카오워크봇 파이프라인 점검용 — testKey가 서버의
   * TEST_PAYMENT_KEY와 일치할 때만 1,000원 결제로 처리된다. */
  test?: boolean;
  testKey?: string;
  /** 스페셜 예약 링크의 토큰(plan이 "special"일 때만). 금액은 서버가 링크에서 가져온다. */
  specialToken?: string;
}

export interface CreateReservationResponse {
  id: string;
  bookingNo: string;
  paymentId: string;
  orderName: string;
  amount: number;
}

export interface ConfirmReservationResponse {
  ok: boolean;
  bookingNo?: string;
  message?: string;
}

export interface AvailabilityResponse {
  /** 고를 수 없는 시간 칩(TIME_SLOTS 중) */
  blocked: string[];
}

export interface ContactInput {
  name: string;
  phone: string;
  date: string;
  area: string;
  topic: string;
  message: string;
  agree: boolean;
}

/** 예약 시 묻는 "알게 된 경로" 선택지. 마지막 "기타"는 직접 입력. */
export const SOURCE_OPTIONS = ["네이버 검색", "네이버 스마트플레이스", "인스타그램", "당근", "숨고", "크몽", "지인 소개", "블로그·카페 후기"] as const;
export const SOURCE_OTHER = "기타";
/** 주소의 ?src= 값(링크마다 붙여 둔 짧은 이름)을 선택지로 바꾼다. 모르는 값은 "" */
const SRC_PARAM: Record<string, (typeof SOURCE_OPTIONS)[number]> = {
  naver: "네이버 검색", place: "네이버 스마트플레이스", insta: "인스타그램", instagram: "인스타그램",
  daangn: "당근", soomgo: "숨고", kmong: "크몽", friend: "지인 소개", blog: "블로그·카페 후기",
};
export const sourceFromParam = (v: string | null | undefined): string => SRC_PARAM[(v ?? "").trim().toLowerCase()] ?? "";
