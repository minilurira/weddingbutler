import crypto from "crypto";
import { recordSecret } from "@/lib/record-api";

// 모바일 청첩장 만든 사람 세션: 문자 인증을 마친 휴대폰 번호를 서명한 쿠키(7일)로 기억한다.
// 그 번호로 만든 청첩장만 고치고 발행할 수 있다.

export const INVITATION_COOKIE = "wb_inv";
export const INVITATION_SESSION_DAYS = 7;

function sign(value: string) {
  return crypto.createHmac("sha256", recordSecret()).update(`invitation.${value}`).digest("base64url");
}

export function newInvitationSession(phone: string, now = Date.now()) {
  const exp = Math.floor(now / 1000) + INVITATION_SESSION_DAYS * 24 * 60 * 60;
  return `${phone}.${exp}.${sign(`${phone}.${exp}`)}`;
}

/** 쿠키가 유효하면 인증된 휴대폰 번호(숫자만), 아니면 null */
export function invitationPhone(cookieValue: string | undefined, now = Date.now()): string | null {
  if (!cookieValue || !recordSecret()) return null;
  const [phone, exp, sig] = cookieValue.split(".");
  if (!phone || !/^01\d{8,9}$/.test(phone) || !exp || !sig || Number(exp) * 1000 < now) return null;
  const a = Buffer.from(sig);
  const b = Buffer.from(sign(`${phone}.${exp}`));
  return a.length === b.length && crypto.timingSafeEqual(a, b) ? phone : null;
}
