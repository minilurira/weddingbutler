import { adminPublicPost } from "@/lib/lookup-api";

// 영업대행(추천) 코드. 코드와 수수료 원장은 어드민에 있고, 홈페이지는 어드민 공개 API로 확인만 한다.

export const REF_STORAGE_KEY = "wb_ref";
/** 추천 링크(?ref=)로 들어온 뒤 이 기간 안에 예약하면 코드가 자동으로 채워진다 */
export const REF_KEEP_DAYS = 30;

export function normalizeRefCode(v: unknown): string {
  if (typeof v !== "string") return "";
  const c = v.toUpperCase().replace(/[^A-Z0-9]/g, "");
  return /^[A-Z0-9]{5,12}$/.test(c) ? c : "";
}

export type RefCheck = { valid: true; code: string; name: string } | { valid: false; reason: "not_found" | "blocked" | "unavailable" };

/** 서버 전용: 어드민에 코드 확인 */
export async function checkReferralCode(raw: unknown): Promise<RefCheck> {
  const code = normalizeRefCode(raw);
  if (!code) return { valid: false, reason: "not_found" };
  const { status, body } = await adminPublicPost("referral/check", { code });
  if (status >= 400) return { valid: false, reason: "unavailable" };
  if (body.valid === true && typeof body.code === "string") return { valid: true, code: body.code, name: String(body.name ?? "") };
  return { valid: false, reason: body.reason === "blocked" ? "blocked" : "not_found" };
}

// ---------- 브라우저 ----------

/** 주소의 ?ref= 값을 저장하고, 저장된(30일 이내) 코드를 돌려준다 */
export function captureRefFromUrl(): string {
  try {
    const fromUrl = normalizeRefCode(new URLSearchParams(window.location.search).get("ref"));
    if (fromUrl) localStorage.setItem(REF_STORAGE_KEY, JSON.stringify({ code: fromUrl, at: Date.now() }));
    const raw = localStorage.getItem(REF_STORAGE_KEY);
    if (!raw) return "";
    const saved = JSON.parse(raw) as { code?: string; at?: number };
    if (!saved.code || !saved.at || Date.now() - saved.at > REF_KEEP_DAYS * 86_400_000) {
      localStorage.removeItem(REF_STORAGE_KEY);
      return "";
    }
    return normalizeRefCode(saved.code);
  } catch {
    return "";
  }
}
