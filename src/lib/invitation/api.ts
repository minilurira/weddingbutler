import { cookies, headers } from "next/headers";
import { NextResponse } from "next/server";
import { logErrorWait } from "@/lib/error-log";
import { INVITATION_COOKIE, invitationPhone } from "@/lib/invitation/session";
import { SITE_URL } from "@/lib/seo";

// 모바일 청첩장 API 공통 도우미

/** 문자 인증을 마친 만든 사람의 휴대폰 번호 (없으면 null) */
export function sessionPhone(): string | null {
  return invitationPhone(cookies().get(INVITATION_COOKIE)?.value);
}

export const unauthorized = () => NextResponse.json({ error: "login_required" }, { status: 401 });
export const notFound = () => NextResponse.json({ error: "not_found" }, { status: 404 });

/** 서버 오류 응답. 오류 기록 저장이 끝난 뒤 응답한다(서버리스에서 응답 직후 저장이 끊기지 않게). 호출은 항상 `return serverError(...)` 형태로 쓴다. */
export async function serverError(tag: string, err: unknown) {
  await logErrorWait(`[invitation ${tag}]`, err);
  return NextResponse.json({ error: "server_error" }, { status: 500 });
}

/** 요청한 사람의 IP (Vercel이 붙여 주는 x-forwarded-for 첫 값) */
export function clientIp(): string {
  const h = headers();
  return (h.get("x-forwarded-for") || "").split(",")[0].trim() || h.get("x-real-ip") || "unknown";
}

/** 청첩장 공개 주소 (예: https://weddingbutler.co.kr/i/k7Qm2xRa) */
export function publicUrl(slug: string): string {
  return `${SITE_URL}/i/${slug}`;
}
