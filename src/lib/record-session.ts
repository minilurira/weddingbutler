import crypto from "crypto";
import { recordSecret } from "@/lib/record-api";

// 고객 열람 세션(문자 인증 후 12시간)과 관리자 미리보기 서명을 같은 키(HMAC)로 검증한다.

export const SESSION_COOKIE = "wbr_session";
export const SESSION_HOURS = 12;

function sign(value: string) {
  return crypto.createHmac("sha256", recordSecret()).update(value).digest("base64url");
}

function safeEqual(a: string, b: string) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && crypto.timingSafeEqual(x, y);
}

function checkSigned(kind: "customer" | "admin", token: string, value: string | undefined) {
  if (!value || !recordSecret()) return false;
  const [exp, sig] = value.split(".");
  const expNum = Number(exp);
  if (!expNum || !sig || expNum * 1000 < Date.now()) return false;
  return safeEqual(sig, sign(`${kind}.${token}.${exp}`));
}

export function newSessionValue(token: string) {
  const exp = Math.floor(Date.now() / 1000) + SESSION_HOURS * 60 * 60;
  return `${exp}.${sign(`customer.${token}.${exp}`)}`;
}

export const hasCustomerSession = (token: string, cookieValue: string | undefined) => checkSigned("customer", token, cookieValue);

/** 어드민 "고객 화면으로 보기" 링크의 ?admin=<exp>.<sig> */
export const isAdminPreview = (token: string, adminParam: string | undefined) => checkSigned("admin", token, adminParam);

export const sessionCookiePath = (token: string) => `/r/${token}`;
