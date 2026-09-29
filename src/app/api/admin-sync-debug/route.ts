import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * TEMPORARY diagnostic route to verify ADMIN_API_URL/ADMIN_API_KEY actually
 * reach the admin app. Sends one clearly-marked ping payload (externalId
 * "DIAGNOSTIC-PING") so it's easy to spot/ignore in the admin's list, then
 * reports back exactly what the admin responded. Remove once admin sync is
 * confirmed working.
 */
export async function GET() {
  const url = process.env.ADMIN_API_URL;
  const apiKey = process.env.ADMIN_API_KEY;

  if (!url || !apiKey) {
    return NextResponse.json({
      ok: false,
      meaning: "ADMIN_API_URL 또는 ADMIN_API_KEY가 Vercel에 설정되어 있지 않습니다.",
      urlSet: !!url,
      apiKeySet: !!apiKey,
    });
  }

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        externalId: "DIAGNOSTIC-PING",
        customer: "진단테스트",
        couple: "진단테스트",
        phone: "010-0000-0000",
        weddingDate: "2099-01-01",
        weddingTime: "12:00",
        venue: "진단용 - 무시해 주세요",
        guestCount: 0,
        plan: "스몰케어",
        memo: "admin-sync-debug ping",
        paidAmount: 0,
      }),
    });
    const body = await res.text().catch(() => "");

    const meaning =
      res.status === 401 || res.status === 403
        ? "인증 실패 — ADMIN_API_KEY 값이 admin 쪽 RESERVATION_API_KEY와 일치하지 않습니다."
        : res.status === 404
          ? "404 — ADMIN_API_URL 경로가 잘못됐거나 admin 쪽에 해당 엔드포인트가 없습니다."
          : res.ok
            ? "성공 — admin이 정상적으로 받았습니다. 지금까지의 실패는 이전 배포/설정 문제였을 가능성이 높습니다."
            : `예상치 못한 응답(${res.status}) — rawBody 확인 필요.`;

    return NextResponse.json({ ok: true, urlUsed: url, status: res.status, meaning, rawBody: body });
  } catch (err) {
    return NextResponse.json({
      ok: false,
      meaning: "admin API에 아예 연결이 안 됐습니다 (네트워크/도메인 문제).",
      error: err instanceof Error ? err.message : String(err),
      urlUsed: url,
    });
  }
}
