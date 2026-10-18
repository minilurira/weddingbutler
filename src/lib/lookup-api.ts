import crypto from "crypto";
import { recordSecret } from "@/lib/record-api";

// 홈페이지 "예약 조회". 예약은 어드민 DB에 있으므로 홈페이지 서버가 어드민 /api/public/lookup/* 를 대신 부르고,
// 문자 인증을 마친 번호는 서명한 쿠키(30분)로 기억한다.

export const LOOKUP_COOKIE = "wb_lookup";
export const LOOKUP_MINUTES = 30;

export interface LookupReservation {
  id: string;
  status: string;
  plan: string;
  dateLabel: string;
  venue: string;
  customer: string;
  paidAmount: number;
  cancel: { reason: string; refundAmount: number; cancelledAt: string | null } | null;
  refund: { cancellable: boolean; amount: number; rate: number; label: string } | null;
}

function sign(value: string) {
  return crypto.createHmac("sha256", recordSecret()).update(`lookup.${value}`).digest("base64url");
}

export function newLookupSession(phone: string) {
  const exp = Math.floor(Date.now() / 1000) + LOOKUP_MINUTES * 60;
  return `${phone}.${exp}.${sign(`${phone}.${exp}`)}`;
}

/** 쿠키가 유효하면 인증된 휴대폰 번호(숫자만) */
export function lookupPhone(cookieValue: string | undefined): string | null {
  if (!cookieValue || !recordSecret()) return null;
  const [phone, exp, sig] = cookieValue.split(".");
  if (!phone || !exp || !sig || Number(exp) * 1000 < Date.now()) return null;
  const a = Buffer.from(sig);
  const b = Buffer.from(sign(`${phone}.${exp}`));
  return a.length === b.length && crypto.timingSafeEqual(a, b) ? phone : null;
}

function adminOrigin() {
  const url = process.env.ADMIN_API_URL;
  if (!url) return null;
  try {
    return new URL(url).origin;
  } catch {
    return null;
  }
}

/** 어드민 /api/public/lookup/<path> 에 POST. 연결이 안 되면 503 */
export async function lookupAdmin(path: "otp" | "verify" | "reservations" | "cancel", body: object) {
  const origin = adminOrigin();
  const key = recordSecret();
  if (!origin || !key) {
    console.warn("[lookup-api] ADMIN_API_URL/ADMIN_API_KEY not set - lookup unavailable.");
    return { status: 503, body: { error: "unavailable" } as Record<string, unknown> };
  }
  try {
    const res = await fetch(`${origin}/api/public/lookup/${path}`, {
      method: "POST",
      cache: "no-store",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify(body),
    });
    const data = (await res.json().catch(() => ({ error: "unavailable" }))) as Record<string, unknown>;
    if (res.status >= 500) console.error(`[lookup-api] ${path} responded ${res.status}`, data);
    return { status: res.status, body: data };
  } catch (err) {
    console.error(`[lookup-api] failed to reach admin for ${path}`, err);
    return { status: 503, body: { error: "unavailable" } as Record<string, unknown> };
  }
}
