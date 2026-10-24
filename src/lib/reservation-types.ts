import type { PaymentType, PlanKey, Side } from "@/lib/plans";

export interface CreateReservationInput {
  plan: PlanKey;
  year: number;
  month: number;
  day: number;
  time: string;
  name: string;
  /** 스몰케어·스탠다드만: 신랑측/신부측. 프리미엄은 서버에서 양가로 저장한다. */
  side?: Side | null;
  phone: string;
  email: string;
  venue: string;
  /** 고객이 남기는 요청 사항(선택, 최대 500자) */
  memo?: string;
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
