import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { calcPrice, PLANS, type PlanKey } from "@/lib/plans";
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

  const { plan, year, month, day, time, name, phone, email, venue, guests, extraButlers, payMethod } =
    body;

  if (!isPlanKey(plan)) {
    return NextResponse.json({ message: "Unknown plan." }, { status: 400 });
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
    !payMethod
  ) {
    return NextResponse.json({ message: "Missing or invalid fields." }, { status: 400 });
  }

  const ceremonyDate = new Date(year, month - 1, day);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const minDate = new Date(today);
  minDate.setDate(minDate.getDate() + 7);
  if (ceremonyDate < minDate) {
    return NextResponse.json({ message: "예식 7일 전까지만 예약할 수 있습니다." }, { status: 400 });
  }
  const dow = ceremonyDate.getDay();
  if (dow !== 0 && dow !== 6) {
    return NextResponse.json({ message: "토요일 · 일요일만 예약 가능합니다." }, { status: 400 });
  }

  const price = calcPrice(plan, guests, extraButlers);
  const planInfo = PLANS[plan];
  const bookingNo = `WB${year}${pad(month)}${pad(day)}-${Math.floor(1000 + Math.random() * 8999)}`;
  const paymentId = randomUUID();
  const orderName = `웨딩버틀러 ${planInfo.name} 서비스 결제금`;

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
        couple_name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        venue: venue?.trim() || null,
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
    return NextResponse.json(
      { message: "예약을 생성하지 못했습니다. 잠시 후 다시 시도해 주세요." },
      { status: 500 }
    );
  }
}
