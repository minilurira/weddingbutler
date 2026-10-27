import { NextResponse } from "next/server";
import { saveErrorLog } from "@/lib/error-log";

export const dynamic = "force-dynamic";

// 브라우저에서 난 화면 오류(error.tsx가 보낸다)를 받아 기록한다.
// 누구나 호출할 수 있으므로 길이를 자르고, 같은 주소(IP)에서 1분에 5건까지만 받는다. 개인정보는 error-log.ts에서 가린다.
const hits = new Map<string, { at: number; n: number }>();

export async function POST(req: Request) {
  const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() || "unknown";
  const now = Date.now();
  const h = hits.get(ip);
  if (!h || now - h.at > 60_000) hits.set(ip, { at: now, n: 1 });
  else if (++h.n > 5) return NextResponse.json({ ok: true });
  if (hits.size > 500) hits.clear();

  const body = (await req.json().catch(() => ({}))) as { message?: unknown; where?: unknown; digest?: unknown };
  const message = typeof body.message === "string" ? body.message.slice(0, 300) : "";
  if (!message) return NextResponse.json({ ok: true });
  const where = typeof body.where === "string" ? body.where.slice(0, 120) : "";
  const digest = typeof body.digest === "string" ? body.digest.slice(0, 40) : "";
  await saveErrorLog("browser", where || "client", message, [digest && `digest ${digest}`, req.headers.get("user-agent")?.slice(0, 160)].filter(Boolean).join(" · "));
  return NextResponse.json({ ok: true });
}
