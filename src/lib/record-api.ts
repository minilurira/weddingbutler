import type { PlanCode, RecordPayload } from "@/types/record";

// 축의 기록은 어드민 DB에 있다. 홈페이지 서버만 이 함수들로 어드민 /api/public/records/* 를 부른다.

export type Viewer = "customer" | "admin";

export type RecordInfo =
  | { state: "ok"; status: string; plan: PlanCode; coupleName: string; phoneMasked: string; expiresAt: string | null }
  | { state: "expired"; expiresAt?: string }
  | { state: "not_found" }
  | { state: "unavailable" };

/** 어드민이 만드는 토큰은 base64url 24자 */
export const isRecordToken = (token: string) => /^[A-Za-z0-9_-]{16,64}$/.test(token);

export function recordSecret() {
  return process.env.RECORD_API_KEY || process.env.ADMIN_API_KEY || "";
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

async function adminFetch(path: string, init?: RequestInit): Promise<Response | null> {
  const origin = adminOrigin();
  const key = recordSecret();
  if (!origin || !key) {
    console.warn("[record-api] ADMIN_API_URL/ADMIN_API_KEY not set - records unavailable.");
    return null;
  }
  try {
    return await fetch(`${origin}/api/public/records/${path}`, {
      ...init,
      cache: "no-store",
      headers: { ...(init?.headers ?? {}), Authorization: `Bearer ${key}` },
    });
  } catch (err) {
    console.error(`[record-api] failed to reach admin for ${path}`, err);
    return null;
  }
}

const q = (viewer: Viewer, extra = "") => `?viewer=${viewer}${extra}`;

export async function getRecordInfo(token: string, viewer: Viewer): Promise<RecordInfo> {
  const res = await adminFetch(`${encodeURIComponent(token)}${q(viewer)}`);
  if (!res) return { state: "unavailable" };
  if (res.status === 404) return { state: "not_found" };
  if (res.status === 410) return { state: "expired", ...(await res.json().catch(() => ({}))) };
  if (!res.ok) {
    console.error(`[record-api] info responded ${res.status}`);
    return { state: "unavailable" };
  }
  return res.json();
}

/** 명단 포함 전체 기록. downloadUrl·supportPhone은 홈페이지가 채운다. */
export async function getRecordPayload(
  token: string,
  viewer: Viewer,
  opts: { log?: boolean } = {}
): Promise<{ meta: Omit<RecordPayload["meta"], "downloadUrl" | "supportPhone">; entries: RecordPayload["entries"] } | null> {
  const res = await adminFetch(`${encodeURIComponent(token)}/entries${q(viewer, opts.log === false ? "&log=0" : "")}`);
  if (!res || !res.ok) {
    if (res) console.error(`[record-api] entries responded ${res.status}`);
    return null;
  }
  return res.json();
}

export async function requestRecordOtp(token: string) {
  const res = await adminFetch(`${encodeURIComponent(token)}/otp`, { method: "POST" });
  if (!res) return { status: 503, body: { error: "unavailable" } };
  return { status: res.status, body: await res.json().catch(() => ({ error: "unavailable" })) };
}

export async function verifyRecordOtp(token: string, code: string) {
  const res = await adminFetch(`${encodeURIComponent(token)}/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code }),
  });
  if (!res) return { status: 503, body: { error: "unavailable" } };
  return { status: res.status, body: await res.json().catch(() => ({ error: "unavailable" })) };
}
