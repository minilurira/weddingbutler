import { NextResponse } from "next/server";

/**
 * TEMPORARY diagnostic route to verify PORTONE_API_SECRET without touching
 * any real reservation or payment. Looks up a nonexistent payment id — a
 * valid secret gets back "payment not found" (404), an invalid/missing
 * secret gets back "unauthorized" (401). Remove once the live-key rollout
 * is confirmed working.
 */
export async function GET() {
  const secret = process.env.PORTONE_API_SECRET;
  if (!secret) {
    return NextResponse.json({ ok: false, meaning: "PORTONE_API_SECRET is not set." });
  }

  const res = await fetch(
    "https://api.portone.io/payments/__debug_nonexistent_payment__",
    { headers: { Authorization: `PortOne ${secret}` }, cache: "no-store" }
  );
  const body = await res.text().catch(() => "");

  const meaning =
    res.status === 401
      ? "SECRET IS STILL WRONG (401 unauthorized) — recheck the live V2 API Secret in PortOne's dashboard."
      : res.status === 404
        ? "SECRET IS VALID (404 = authenticated, just no such payment) — the earlier fix is working."
        : `Unexpected status ${res.status} — see rawBody.`;

  return NextResponse.json({ ok: true, status: res.status, meaning, rawBody: body });
}
