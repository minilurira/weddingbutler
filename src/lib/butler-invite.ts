import { logError } from "@/lib/error-log";

// 버틀러 참석 문의 링크(/b/<token>)는 어드민이 만들고 판정한다. 홈페이지는 어드민 공개 API(/api/public/butler-invite/<token>)로
// 정보를 가져오고 참석/불참 응답을 전달만 한다.

export type InviteState = "pending" | "accepted" | "declined" | "closed" | "cancelled" | "expired" | "wait" | "not_found";

export interface InviteInfo {
  name: string;
  gradeLabel: string;
  date: string;
  time: string;
  venue: string;
  side: string;
  start: string;
  pay: string;
  deadline: string;
}

export const INVITE_TOKEN_RE = /^[0-9a-f]{32}$/;

function endpoint(token: string): { url: URL; key: string } | null {
  const base = process.env.ADMIN_API_URL;
  const key = process.env.ADMIN_API_KEY;
  if (!base || !key || !INVITE_TOKEN_RE.test(token)) return null;
  return { url: new URL(`/api/public/butler-invite/${token}`, base), key };
}

/** 어드민에 닿지 못하면 null */
export async function fetchInvite(token: string): Promise<{ state: InviteState; info?: InviteInfo } | null> {
  const ep = endpoint(token);
  if (!ep) return INVITE_TOKEN_RE.test(token) ? null : { state: "not_found" };
  try {
    const res = await fetch(ep.url, { headers: { Authorization: `Bearer ${ep.key}` }, cache: "no-store", signal: AbortSignal.timeout(5000) });
    return res.ok ? ((await res.json()) as { state: InviteState; info?: InviteInfo }) : null;
  } catch (err) {
    logError("[butler-invite] fetch failed", err);
    return null;
  }
}

export async function respondInvite(token: string, action: "accept" | "decline"): Promise<{ state: InviteState; message?: string } | null> {
  const ep = endpoint(token);
  if (!ep) return null;
  try {
    const res = await fetch(ep.url, { method: "POST", headers: { Authorization: `Bearer ${ep.key}`, "Content-Type": "application/json" }, body: JSON.stringify({ action }), cache: "no-store", signal: AbortSignal.timeout(10000) });
    return res.ok ? ((await res.json()) as { state: InviteState; message?: string }) : null;
  } catch (err) {
    logError("[butler-invite] respond failed", err);
    return null;
  }
}

export const INVITE_STATE_MESSAGE: Record<Exclude<InviteState, "pending">, string> = {
  accepted: "참석이 확정되었습니다. 감사합니다. 변경이 필요하면 웨딩버틀러로 연락해 주세요.",
  declined: "불참으로 응답하셨습니다. 변경이 필요하면 웨딩버틀러로 연락해 주세요.",
  closed: "이미 다른 버틀러님으로 확정되어 마감되었습니다. 다음 기회에 부탁드립니다.",
  cancelled: "취소된 문의입니다. 자세한 내용은 웨딩버틀러로 연락해 주세요.",
  expired: "응답 기한이 지난 문의입니다. 참석이 가능하시면 웨딩버틀러로 연락해 주세요.",
  wait: "오너 버틀러가 확정된 뒤에 응답할 수 있습니다. 잠시 후 다시 눌러 주세요.",
  not_found: "유효하지 않은 링크입니다. 링크 주소를 다시 확인해 주세요.",
};
