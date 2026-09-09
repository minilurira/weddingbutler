import type { PlanKey } from "@/lib/plans";

export interface CreateReservationInput {
  plan: PlanKey;
  year: number;
  month: number;
  day: number;
  time: string;
  name: string;
  phone: string;
  venue: string;
  guests: number;
  extraButlers: number;
  payMethod: string;
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
