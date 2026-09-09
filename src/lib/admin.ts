import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

/**
 * 관리자 인증.
 *
 * 운영자 한 명이 예약과 문의를 확인하는 용도라 계정 시스템까지는 두지 않고,
 * 환경변수의 비밀번호 하나로 로그인한다. 세션은 서명된 httpOnly 쿠키로
 * 유지하므로 브라우저에서 값을 위조할 수 없다.
 */

export const ADMIN_COOKIE = "wb_admin";

/** 세션 유효 기간 (초) — 8시간 */
const SESSION_TTL = 8 * 60 * 60;

function getPassword(): string {
  return process.env.ADMIN_PASSWORD ?? "";
}

function getSigningSecret(): string {
  // 별도 시크릿이 없으면 비밀번호에서 파생시킨다. 비밀번호를 바꾸면
  // 기존 세션이 모두 무효가 되는데, 그 편이 안전하다.
  return process.env.ADMIN_SESSION_SECRET || `derived:${getPassword()}`;
}

export function isAdminConfigured(): boolean {
  return getPassword().length > 0;
}

function sign(payload: string): string {
  return createHmac("sha256", getSigningSecret())
    .update(payload)
    .digest("base64url");
}

/** "만료시각.서명" 형태의 세션 토큰을 만든다. */
export function createSessionToken(): string {
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_TTL;
  return `${expiresAt}.${sign(String(expiresAt))}`;
}

function isValidToken(token: string | undefined): boolean {
  if (!token) return false;

  const [expiresAtRaw, signature] = token.split(".");
  if (!expiresAtRaw || !signature) return false;

  const expiresAt = Number(expiresAtRaw);
  if (!Number.isFinite(expiresAt) || expiresAt < Date.now() / 1000) {
    return false;
  }

  const expected = Buffer.from(sign(expiresAtRaw));
  const actual = Buffer.from(signature);
  if (expected.length !== actual.length) return false;

  return timingSafeEqual(expected, actual);
}

/** 입력한 비밀번호가 맞는지 상수 시간으로 비교한다. */
export function checkAdminPassword(input: string): boolean {
  const password = getPassword();
  if (!password) return false;

  const expected = Buffer.from(password);
  const actual = Buffer.from(input);
  if (expected.length !== actual.length) return false;

  return timingSafeEqual(expected, actual);
}

/** 현재 요청이 로그인된 관리자인지 */
export async function isAdminAuthenticated(): Promise<boolean> {
  if (!isAdminConfigured()) return false;
  const store = await cookies();
  return isValidToken(store.get(ADMIN_COOKIE)?.value);
}

export const ADMIN_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: SESSION_TTL,
};
