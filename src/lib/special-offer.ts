
import { logError } from "@/lib/error-log";// 스페셜 예약 링크는 어드민이 만들고 관리한다. 홈페이지는 어드민 공개 API(/api/public/special/<token>)로
// 링크를 확인하고(금액은 항상 여기서 가져온다), 결제를 시작할 때 점유하고, 결제가 끝나면 사용 처리한다.

export type SpecialOfferState = "open" | "held" | "used" | "cancelled" | "expired" | "not_found";

export interface SpecialOffer {
  state: SpecialOfferState;
  amount: number;
  label: string;
  expiresAt: string;
}

export const SPECIAL_TOKEN_RE = /^[A-Za-z0-9_-]{16,64}$/;

function endpoint(token: string): { url: URL; key: string } | null {
  const base = process.env.ADMIN_API_URL;
  const key = process.env.ADMIN_API_KEY;
  if (!base || !key) {
    console.warn("[special-offer] ADMIN_API_URL/ADMIN_API_KEY not set.");
    return null;
  }
  return { url: new URL(`/api/public/special/${encodeURIComponent(token)}`, base), key };
}

/** 어드민에 닿지 못하면 null (호출하는 쪽에서 "잠시 후 다시 시도" 처리). */
export async function fetchSpecialOffer(token: string): Promise<SpecialOffer | null> {
  const ep = endpoint(token);
  if (!ep || !SPECIAL_TOKEN_RE.test(token)) return null;
  try {
    const res = await fetch(ep.url, { headers: { Authorization: `Bearer ${ep.key}` }, cache: "no-store", signal: AbortSignal.timeout(5000) });
    if (!res.ok) return null;
    const j = (await res.json()) as Partial<SpecialOffer>;
    return { state: j.state ?? "not_found", amount: Number(j.amount ?? 0), label: j.label ?? "", expiresAt: j.expiresAt ?? "" };
  } catch (err) {
    logError("[special-offer] fetch failed", err);
    return null;
  }
}

async function act(token: string, action: "hold" | "use" | "release", bookingNo: string): Promise<boolean> {
  const ep = endpoint(token);
  if (!ep) return false;
  try {
    const res = await fetch(ep.url, {
      method: "POST",
      headers: { Authorization: `Bearer ${ep.key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ action, bookingNo }),
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return false;
    return ((await res.json()) as { ok?: boolean }).ok === true;
  } catch (err) {
    logError(`[special-offer] ${action} failed`, err);
    return false;
  }
}

export const holdSpecialOffer = (token: string, bookingNo: string) => act(token, "hold", bookingNo);
export const markSpecialOfferUsed = (token: string, bookingNo: string) => act(token, "use", bookingNo);
export const releaseSpecialOffer = (token: string, bookingNo: string) => act(token, "release", bookingNo);

export const SPECIAL_STATE_MESSAGE: Record<Exclude<SpecialOfferState, "open">, string> = {
  held: "다른 결제가 진행 중인 링크입니다. 잠시 후 다시 시도해 주세요.",
  used: "이미 결제가 완료된 링크입니다.",
  cancelled: "취소된 링크입니다. 담당자에게 문의해 주세요.",
  expired: "유효기간이 지난 링크입니다. 담당자에게 새 링크를 요청해 주세요.",
  not_found: "유효하지 않은 링크입니다. 링크 주소를 다시 확인해 주세요.",
};
