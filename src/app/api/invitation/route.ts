import { NextResponse } from "next/server";
import { publicUrl, serverError, sessionPhone, unauthorized } from "@/lib/invitation/api";
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
export async function POST() {
  const phone = sessionPhone();
  if (!phone) return unauthorized();
  try {
    const row = await createInvitation(phone);
    if (row === "limit") return NextResponse.json({ error: "limit" }, { status: 409 });
    return NextResponse.json({ id: row.id });
  } catch (err) {
    return serverError("create", err);
  }
}
