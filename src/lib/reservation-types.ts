import type { PlanKey } from "@/lib/plans";

export interface CreateReservationInput {
  plan: PlanKey;
  year: number;
  month: number;
  day: number;
  time: string;
  name: string;
  phone: string;
  email: string;
  venue: string;
  guests: number;
  extraButlers: number;
  payMethod: string;
  /** 결제/알림톡/카카오워크봇 파이프라인 점검용 — testKey가 서버의
   * TEST_PAYMENT_KEY와 일치할 때만 1,000원 결제로 처리된다. */
  test?: boolean;
  testKey?: string;
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

export interface ContactInput {
  name: string;
  phone: string;
  date: string;
  area: string;
  topic: string;
  message: string;
  agree: boolean;
}
