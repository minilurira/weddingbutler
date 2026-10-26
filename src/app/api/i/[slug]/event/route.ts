import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { sessionPhone } from "@/lib/invitation/api";
import { EVENT_KINDS, addEvent, getBySlug, type EventKind } from "@/lib/invitation/store";

export const dynamic = "force-dynamic";

/** 어디서 열었는지: 접속 환경(User-Agent)으로 가른다. 개인을 알아보는 값은 저장하지 않는다. */
function sourceOf(ua: string): string {
  if (/KAKAOTALK/i.test(ua)) return "kakao";
  if (/NAVER\(|NAVER\//i.test(ua)) return "naver";
  if (/Instagram|FBAN|FBAV/i.test(ua)) return "sns";
  return "etc";
}

// 하객 화면이 보내는 사용 기록(열어 봄, 길찾기 누름, 계좌 복사 등). 만든 사람 본인의 방문은 세지 않는다.
export async function POST(req: Request, { params }: { params: { slug: string } }) {
  const body = (await req.json().catch(() => ({}))) as { kind?: unknown };
  const kind = body.kind;
  if (typeof kind !== "string" || !(EVENT_KINDS as readonly string[]).includes(kind)) return NextResponse.json({ error: "invalid" }, { status: 400 });
  try {
    const row = await getBySlug(params.slug);
    if (!row || row.status !== "published") return NextResponse.json({ ok: true }); // 없는 주소여도 조용히 넘긴다
    if (sessionPhone() === row.phone) return NextResponse.json({ ok: true, skipped: "owner" });
    await addEvent(row.id, kind as EventKind, sourceOf(headers().get("user-agent") || ""));
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[invitation] event failed", err);
    return NextResponse.json({ ok: true }); // 기록 실패가 하객 화면을 막지 않게 한다
  }
}
