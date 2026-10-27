import { NextResponse } from "next/server";
import { publicUrl, serverError, sessionPhone, unauthorized } from "@/lib/invitation/api";
import { TERMS_VERSION } from "@/lib/invitation/content";
import { createInvitation, listByPhone } from "@/lib/invitation/store";

export const dynamic = "force-dynamic";

// 내 청첩장 목록
export async function GET() {
  const phone = sessionPhone();
  if (!phone) return unauthorized();
  try {
    const rows = await listByPhone(phone);
    return NextResponse.json({
      invitations: rows.map((r) => ({ id: r.id, template: r.template, paid: Boolean(r.paid_at), status: r.status, url: publicUrl(r.slug), groom: r.content.groom, bride: r.content.bride, date: r.content.date, updatedAt: r.updated_at })),
    });
  } catch (err) {
    return serverError("list", err);
  }
}

// 새 청첩장(초안) 만들기
export async function POST(req: Request) {
  const phone = sessionPhone();
  if (!phone) return unauthorized();
  // 만들기 전 주의사항·이용약관 동의(필수). 현재 버전에 동의했을 때만 만든다.
  const body = (await req.json().catch(() => ({}))) as { agree?: unknown; termsVersion?: unknown };
  if (body.agree !== true || body.termsVersion !== TERMS_VERSION) return NextResponse.json({ error: "agree_required", termsVersion: TERMS_VERSION }, { status: 400 });
  try {
    const row = await createInvitation(phone);
    if (row === "limit") return NextResponse.json({ error: "limit" }, { status: 409 });
    return NextResponse.json({ id: row.id });
  } catch (err) {
    return serverError("create", err);
  }
}
