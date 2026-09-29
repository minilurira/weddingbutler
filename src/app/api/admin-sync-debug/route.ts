import { NextResponse } from "next/server";
import { PLANS, type PlanKey } from "@/lib/plans";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

/**
 * TEMPORARY diagnostic route. Re-sends the most recent *real* reservation's
 * data to ADMIN_API_URL (a genuine admin-sync attempt, not a synthetic
 * payload) and reports back exactly what the admin responded — this catches
 * payload-shape issues (special characters, field values) that a clean
 * synthetic test payload wouldn't. Remove once admin sync is confirmed
 * working end-to-end.
 */
export async function GET() {
  const url = process.env.ADMIN_API_URL;
  const apiKey = process.env.ADMIN_API_KEY;

  if (!url || !apiKey) {
    return NextResponse.json({
      ok: false,
      meaning: "ADMIN_API_URL 또는 ADMIN_API_KEY가 Vercel에 설정되어 있지 않습니다.",
      urlSet: !!url,
      apiKeySet: !!apiKey,
    });
  }

  const db = supabaseAdmin();
  const { data: reservation, error } = await db
    .from("reservations")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (error || !reservation) {
    return NextResponse.json({ ok: false, meaning: "최근 예약을 찾지 못했습니다.", error: error?.message });
  }

  function pad(n: number) {
    return String(n).padStart(2, "0");
  }
  const parts = String(reservation.couple_name).split("·").map((p: string) => p.trim()).filter(Boolean);
  const customer = parts.length > 1 ? parts[parts.length - 1] : String(reservation.couple_name).trim();

  const payload = {
    externalId: reservation.booking_no,
    customer,
    couple: reservation.couple_name,
    phone: reservation.phone,
    weddingDate: `${reservation.ceremony_year}-${pad(reservation.ceremony_month)}-${pad(reservation.ceremony_day)}`,
    weddingTime: reservation.ceremony_time,
    venue: reservation.venue || "미정",
    guestCount: reservation.guests,
    plan: PLANS[reservation.plan as PlanKey]?.name ?? reservation.plan,
    memo: `[admin-sync-debug 재전송] 결제 수단: ${reservation.pay_method}`,
    paidAmount: reservation.deposit_amount,
  };

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify(payload),
    });
    const body = await res.text().catch(() => "");

    const meaning =
      res.status === 401 || res.status === 403
        ? "인증 실패 — ADMIN_API_KEY 값이 admin 쪽 RESERVATION_API_KEY와 일치하지 않습니다."
        : res.status === 404
          ? "404 — ADMIN_API_URL 경로가 잘못됐거나 admin 쪽에 해당 엔드포인트가 없습니다."
          : res.ok
            ? "성공 — 실제 예약 데이터로도 admin이 정상적으로 받았습니다."
            : `admin이 이 실제 데이터를 거부했습니다 (상태 ${res.status}) — rawBody를 확인하세요. 필드 값/형식 문제일 수 있습니다.`;

    return NextResponse.json({
      ok: true,
      bookingNo: reservation.booking_no,
      paymentStatus: reservation.payment_status,
      urlUsed: url,
      payloadSent: payload,
      status: res.status,
      meaning,
      rawBody: body,
    });
  } catch (err) {
    return NextResponse.json({
      ok: false,
      meaning: "admin API에 아예 연결이 안 됐습니다 (네트워크/도메인 문제).",
      error: err instanceof Error ? err.message : String(err),
      urlUsed: url,
      payloadSent: payload,
    });
  }
}
