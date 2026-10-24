import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { BOOKING_OPEN_UNTIL_LABEL, isBookableDow, maxBookingDate, minBookingDate } from "@/lib/booking-calendar";
import { fetchBlockedSlots } from "@/lib/availability";
import { calcPrice, isOneSide, isPaymentType, PLANS, sideForPlan, specialPrice, testPrice, type PlanKey } from "@/lib/plans";
import { fetchSpecialOffer, holdSpecialOffer, releaseSpecialOffer, SPECIAL_STATE_MESSAGE, SPECIAL_TOKEN_RE } from "@/lib/special-offer";
import { supabaseAdmin } from "@/lib/supabase";
import type {
  CreateReservationInput,
  CreateReservationResponse,
} from "@/lib/reservation-types";

function isPlanKey(v: unknown): v is PlanKey {
  return typeof v === "string" && v in PLANS;
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export async function POST(req: NextRequest) {
  let body: CreateReservationInput;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON body." }, { status: 400 });
  }

  const { plan, year, month, day, time, name, side, phone, email, venue, memo, guests, extraButlers, payMethod, paymentType, test, testKey, specialToken } =
    body;

  const isTest = test === true;
  if (isTest && (!process.env.TEST_PAYMENT_KEY || testKey !== process.env.TEST_PAYMENT_KEY)) {
    return NextResponse.json({ message: "잘못된 테스트 키입니다." }, { status: 403 });
  }

  if (!isPlanKey(plan)) {
    return NextResponse.json({ message: "Unknown plan." }, { status: 400 });
  }
  // 스페셜은 어드민이 만든 링크로만 예약할 수 있고, 금액은 링크에서 가져온다 (고객이 보낸 금액은 쓰지 않는다).
  const isSpecial = plan === "special";
  if (isSpecial && (isTest || typeof specialToken !== "string" || !SPECIAL_TOKEN_RE.test(specialToken))) {
    return NextResponse.json({ message: "유효하지 않은 예약 링크입니다." }, { status: 400 });
  }
  if (
    !Number.isInteger(year) ||
    !Number.isInteger(month) ||
    !Number.isInteger(day) ||
    !time ||
    !name?.trim() ||
    !phone?.trim() ||
    !email?.trim() ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
    !venue?.trim() ||
    !Number.isInteger(guests) ||
    guests < 1 ||
    !Number.isInteger(extraButlers) ||
    extraButlers < 0 ||
    !payMethod ||
    !isPaymentType(paymentType) ||
    (isSpecial && paymentType !== "full")
  ) {
    return NextResponse.json({ message: "Missing or invalid fields." }, { status: 400 });
  }

  const ceremonyDate = new Date(year, month - 1, day);
  if (ceremonyDate < minBookingDate()) {
    return NextResponse.json({ message: "예식 3일 전까지만 예약할 수 있습니다." }, { status: 400 });
  }
  if (ceremonyDate > maxBookingDate()) {
    return NextResponse.json({ message: `${BOOKING_OPEN_UNTIL_LABEL} 예식까지만 예약할 수 있습니다.` }, { status: 400 });
  }
  if (!isBookableDow(ceremonyDate)) {
    return NextResponse.json({ message: "주말 또는 공휴일만 예약 가능합니다." }, { status: 400 });
  }
  if (isSpecial) {
    if (!isOneSide(side) && side !== "both") {
      return NextResponse.json({ message: "신랑측, 신부측 또는 양가를 선택해 주세요." }, { status: 400 });
    }
  } else if (plan !== "premium" && !isOneSide(side)) {
    return NextResponse.json({ message: "신랑측 또는 신부측을 선택해 주세요." }, { status: 400 });
  }

  // 예약 화면에서 막은 시간을 서버에서도 다시 확인한다(두 고객이 거의 동시에 같은 시간대를 고르는 경우).
  // 파이프라인 점검용 테스트 결제는 실제 시간대와 무관하므로 확인하지 않는다.
  if (!isTest) {
    const blocked = await fetchBlockedSlots(`${year}-${pad(month)}-${pad(day)}`);
    if (blocked?.includes(time)) {
      return NextResponse.json(
        { message: "이미 예약된 시간대입니다. 다른 예식 시간을 선택해 주세요." },
        { status: 409 }
      );
    }
  }

  const bookingNo = `WB${year}${pad(month)}${pad(day)}-${Math.floor(1000 + Math.random() * 8999)}`;
  const paymentId = randomUUID();

  let specialAmount = 0;
  if (isSpecial) {
    const offer = await fetchSpecialOffer(specialToken!);
    if (!offer) {
      return NextResponse.json({ message: "예약 링크를 확인하지 못했습니다. 잠시 후 다시 시도해 주세요." }, { status: 503 });
    }
    if (offer.state !== "open") {
      return NextResponse.json({ message: SPECIAL_STATE_MESSAGE[offer.state] }, { status: 409 });
    }
    // 결제를 시작하는 순간 링크를 점유해, 같은 링크로 두 사람이 동시에 결제하지 못하게 한다.
    if (!(await holdSpecialOffer(specialToken!, bookingNo))) {
      return NextResponse.json({ message: SPECIAL_STATE_MESSAGE.held }, { status: 409 });
    }
    specialAmount = offer.amount;
  }

  const price = isTest ? testPrice(paymentType) : isSpecial ? specialPrice(specialAmount) : calcPrice(plan, guests, extraButlers, paymentType);
  const planInfo = PLANS[plan];
  const orderName = isTest
    ? `[TEST] 웨딩버틀러 ${planInfo.name} 결제 파이프라인 점검 (1,000원)`
    : `웨딩버틀러 ${planInfo.name} ${paymentType === "full" ? "서비스 전액" : "예약금"}`;

  try {
    const db = supabaseAdmin();
    const { data, error } = await db
      .from("reservations")
      .insert({
        booking_no: bookingNo,
        plan,
        ceremony_year: year,
        ceremony_month: month,
        ceremony_day: day,
        ceremony_time: time,
        couple_name: isTest ? `[TEST] ${name.trim()}` : name.trim(),
        side: sideForPlan(plan, isSpecial ? side : isOneSide(side) ? side : null),
        phone: phone.trim(),
        email: email.trim(),
        venue: venue?.trim() || null,
        memo: typeof memo === "string" ? memo.trim().slice(0, 500) || null : null,
        guests,
        extra_butlers: extraButlers,
        pay_method: payMethod,
        base_amount: price.base,
        over_amount: price.over,
        extra_butler_amount: price.extraButlerAmount,
        total_amount: price.total,
        deposit_amount: price.deposit,
        balance_amount: price.balance,
        payment_status: "pending",
        portone_payment_id: paymentId,
        ...(isSpecial ? { special_token: specialToken } : {}),
      })
      .select("id")
      .single();

    if (error || !data) throw error ?? new Error("insert returned no data");

    const response: CreateReservationResponse = {
      id: data.id,
      bookingNo,
      paymentId,
      orderName,
      amount: price.deposit,
    };
    return NextResponse.json(response);
  } catch (err) {
    console.error("[reservations] insert failed", err);
    if (isSpecial) {
      await releaseSpecialOffer(specialToken!, bookingNo);
      // 스페셜용 DB 변경(supabase/special.sql)이 아직 적용되지 않은 경우
      const code = (err as { code?: string } | null)?.code;
      if (code === "23514" || code === "42703" || code === "PGRST204") {
        return NextResponse.json({ message: "스페셜 예약 준비가 아직 끝나지 않았습니다. 담당자에게 문의해 주세요." }, { status: 503 });
      }
    }
    return NextResponse.json(
      { message: "예약을 생성하지 못했습니다. 잠시 후 다시 시도해 주세요." },
      { status: 500 }
    );
  }
}
