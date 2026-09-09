import "server-only";

import { randomUUID } from "node:crypto";
import { getSupabase } from "@/lib/supabase";
import { calculateQuote, type PlanId } from "@/lib/pricing";
import {
  allTimeSlots,
  isBookableDate,
  type DateString,
  type TimeString,
} from "@/lib/availability";
import type { BookingRequest } from "@/lib/validation";
import type { BookingRow } from "@/types/database";

/**
 * 결제를 시작한 예약이 슬롯을 붙잡아 두는 시간(분).
 *
 * 결제창을 띄운 채 이탈한 예약이 그 시간대를 영원히 막아버리면 안 되고,
 * 반대로 결제 진행 중인 슬롯을 남이 채가도 곤란하다. 그 사이의 타협값.
 */
export const PENDING_HOLD_MINUTES = 20;

/** 포트원에 넘길 결제 ID. 사람이 읽을 수 있으면서 충돌하지 않게 만든다. */
export function generatePaymentId(eventDate: DateString): string {
  const compact = eventDate.replace(/-/g, "");
  const suffix = randomUUID().replace(/-/g, "").slice(0, 12);
  return `wb-${compact}-${suffix}`;
}

/** 지금 시점에서 "점유 중"으로 봐야 하는 예약들 */
function heldSince(): string {
  return new Date(Date.now() - PENDING_HOLD_MINUTES * 60_000).toISOString();
}

export type TakenSlots = Record<DateString, TimeString[]>;

/**
 * 주어진 기간에 이미 잡혀 있는 슬롯을 날짜별로 모아 돌려준다.
 *
 * 확정된 예약(paid/completed)과, 아직 결제 중인 최근 pending 예약을 함께 센다.
 */
export async function getTakenSlots(
  from: DateString,
  to: DateString,
): Promise<TakenSlots> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("bookings")
    .select("event_date, event_time, status, created_at")
    .gte("event_date", from)
    .lte("event_date", to)
    .in("status", ["paid", "completed", "pending"]);

  if (error) throw new Error(`예약 현황을 불러오지 못했습니다: ${error.message}`);

  const cutoff = heldSince();
  const taken: TakenSlots = {};

  for (const row of data ?? []) {
    const stillHeld =
      row.status !== "pending" || row.created_at >= cutoff;
    if (!stillHeld) continue;

    (taken[row.event_date] ??= []).push(row.event_time);
  }

  return taken;
}

/** 특정 날짜에 아직 예약 가능한 시간 슬롯 */
export async function getAvailableTimes(
  date: DateString,
): Promise<TimeString[]> {
  if (!isBookableDate(date)) return [];
  const taken = await getTakenSlots(date, date);
  const takenSet = new Set(taken[date] ?? []);
  return allTimeSlots().filter((time) => !takenSet.has(time));
}

export class SlotTakenError extends Error {
  constructor() {
    super("이미 예약된 시간입니다. 다른 시간을 선택해 주세요.");
    this.name = "SlotTakenError";
  }
}

export type CreatedBooking = {
  bookingId: string;
  paymentId: string;
  orderName: string;
  totalAmount: number;
  depositAmount: number;
};

/**
 * 예약을 pending 상태로 만들고 결제에 필요한 값을 돌려준다.
 *
 * 금액은 요청에 담긴 값을 쓰지 않고 planId·guestCount·extraButlers 로
 * 서버에서 다시 계산한다. 결제 검증 단계에서 이 값과 대조한다.
 */
export async function createBooking(
  input: BookingRequest,
): Promise<CreatedBooking> {
  const supabase = getSupabase();

  const quote = calculateQuote({
    planId: input.planId as PlanId,
    guestCount: input.guestCount,
    extraButlers: input.extraButlers,
  });

  // 먼저 한 번 걸러낸다. 경합은 아래 insert 의 유니크 인덱스가 최종적으로 막는다.
  const available = await getAvailableTimes(input.eventDate);
  if (!available.includes(input.eventTime)) {
    throw new SlotTakenError();
  }

  const paymentId = generatePaymentId(input.eventDate);

  const { data, error } = await supabase
    .from("bookings")
    .insert({
      plan_id: quote.plan.id,
      event_date: input.eventDate,
      event_time: input.eventTime,
      guest_count: quote.guestCount,
      extra_butlers: quote.extraButlers,
      groom_name: input.groomName,
      bride_name: input.brideName,
      venue_name: input.venueName,
      venue_address: input.venueAddress || null,
      contact_name: input.contactName,
      phone: input.phone,
      email: input.email || null,
      notes: input.notes || null,
      total_amount: quote.total,
      deposit_amount: quote.deposit,
      status: "pending",
      payment_id: paymentId,
    })
    .select("id")
    .single();

  if (error) {
    // 유니크 인덱스 위반 = 그 사이에 다른 사람이 같은 슬롯을 확정한 경우
    if (error.code === "23505") throw new SlotTakenError();
    throw new Error(`예약을 저장하지 못했습니다: ${error.message}`);
  }

  return {
    bookingId: data.id,
    paymentId,
    orderName: buildOrderName(quote.plan.name, input.eventDate),
    totalAmount: quote.total,
    depositAmount: quote.deposit,
  };
}

/** 결제창과 카드 명세서에 찍히는 주문명 */
export function buildOrderName(planName: string, eventDate: string): string {
  const [, month, day] = eventDate.split("-");
  return `웨딩버틀러 ${planName} 예약금 (${Number(month)}/${Number(day)})`;
}

export async function getBookingByPaymentId(
  paymentId: string,
): Promise<BookingRow | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("payment_id", paymentId)
    .maybeSingle();

  if (error) throw new Error(`예약을 조회하지 못했습니다: ${error.message}`);
  return data;
}

export async function getBookingById(id: string): Promise<BookingRow | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(`예약을 조회하지 못했습니다: ${error.message}`);
  return data;
}

/** 결제가 확인된 예약을 확정 처리한다. 이미 확정된 예약이면 아무것도 하지 않는다. */
export async function markBookingPaid(bookingId: string): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase
    .from("bookings")
    .update({ status: "paid", paid_at: new Date().toISOString() })
    .eq("id", bookingId)
    .eq("status", "pending");

  if (error) {
    if (error.code === "23505") throw new SlotTakenError();
    throw new Error(`예약 확정에 실패했습니다: ${error.message}`);
  }
}

export async function markBookingCancelled(
  bookingId: string,
  reason: string,
): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase
    .from("bookings")
    .update({
      status: "cancelled",
      cancelled_at: new Date().toISOString(),
      cancel_reason: reason,
    })
    .eq("id", bookingId);

  if (error) throw new Error(`예약 취소에 실패했습니다: ${error.message}`);
}

/** 포트원 응답을 그대로 남겨둔다. 나중에 분쟁이 생기면 이 기록이 근거가 된다. */
export async function recordPayment(entry: {
  bookingId: string | null;
  portonePaymentId: string;
  amount: number;
  status: string;
  method?: string | null;
  raw?: unknown;
}): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase.from("payments").upsert(
    {
      booking_id: entry.bookingId,
      portone_payment_id: entry.portonePaymentId,
      amount: entry.amount,
      status: entry.status,
      method: entry.method ?? null,
      raw: (entry.raw ?? null) as never,
    },
    { onConflict: "portone_payment_id,status", ignoreDuplicates: true },
  );

  // 결제 기록 실패가 예약 확정을 막아서는 안 된다. 로그만 남기고 넘어간다.
  if (error) {
    console.error("[payments] 결제 기록 저장 실패:", error.message);
  }
}
