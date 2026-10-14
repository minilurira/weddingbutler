import { blockedSlots } from "@/lib/plans";

/**
 * 어드민에 이미 잡힌 그날의 예식 시각을 가져와 고를 수 없는 시간 칩 목록을 돌려준다.
 * 어드민이 기준인 이유: 어드민에서 바꾼 시간·전화로 받은 수동 예약까지 반영해야 해서.
 * 어드민에 닿지 못하면 null — 호출하는 쪽은 시간을 막지 않고 예약을 계속 받는다.
 */
export async function fetchBlockedSlots(date: string): Promise<string[] | null> {
  const reservationsUrl = process.env.ADMIN_API_URL;
  const apiKey = process.env.ADMIN_API_KEY;
  if (!reservationsUrl || !apiKey) {
    console.warn("[availability] ADMIN_API_URL/ADMIN_API_KEY not set - not blocking any time slots.");
    return null;
  }

  try {
    const url = new URL("/api/public/availability", reservationsUrl);
    url.searchParams.set("date", date);
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${apiKey}` },
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) {
      console.error(`[availability] admin API responded ${res.status} for ${date}`);
      return null;
    }
    const json = (await res.json()) as { times?: unknown };
    const times = Array.isArray(json.times) ? json.times.filter((t): t is string => typeof t === "string") : [];
    return blockedSlots(times);
  } catch (err) {
    console.error(`[availability] failed to reach admin API for ${date}`, err);
    return null;
  }
}
