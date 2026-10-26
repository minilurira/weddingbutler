import { NextResponse } from "next/server";
import { notFound, publicUrl, serverError, sessionPhone, unauthorized } from "@/lib/invitation/api";
import { deleteInvitation, getOwned, pruneUnusedPhotos, saveContent } from "@/lib/invitation/store";

export const dynamic = "force-dynamic";

type Ctx = { params: { id: string } };

export async function GET(_req: Request, { params }: Ctx) {
  const phone = sessionPhone();
  if (!phone) return unauthorized();
  try {
    const row = await getOwned(params.id, phone);
    if (!row) return notFound();
    return NextResponse.json({ id: row.id, status: row.status, url: publicUrl(row.slug), template: row.template, paid: Boolean(row.paid_at), content: row.content });
  } catch (err) {
    return serverError("get", err);
  }
}

// 자동 저장: 내용 전체를 받아 정리한 뒤 저장한다
export async function PATCH(req: Request, { params }: Ctx) {
  const phone = sessionPhone();
  if (!phone) return unauthorized();
  const body = (await req.json().catch(() => null)) as { content?: unknown } | null;
  if (!body || typeof body.content !== "object") return NextResponse.json({ error: "invalid" }, { status: 400 });
  try {
    const row = await saveContent(params.id, phone, body.content);
    if (!row) return notFound();
    await pruneUnusedPhotos(row.id, row.content).catch((err) => console.warn("[invitation] prune failed", err));
    return NextResponse.json({ ok: true, content: row.content, savedAt: row.updated_at });
  } catch (err) {
    return serverError("save", err);
  }
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const phone = sessionPhone();
  if (!phone) return unauthorized();
  try {
    return (await deleteInvitation(params.id, phone)) ? NextResponse.json({ ok: true }) : notFound();
  } catch (err) {
    return serverError("delete", err);
  }
}
