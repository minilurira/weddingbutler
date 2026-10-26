import { NextResponse } from "next/server";
import { notFound, serverError, sessionPhone, unauthorized } from "@/lib/invitation/api";
import { deleteGuestbook, getOwned, listGuestbook } from "@/lib/invitation/store";

export const dynamic = "force-dynamic";

// 만든 사람: 방명록 보기
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const phone = sessionPhone();
  if (!phone) return unauthorized();
  try {
    const row = await getOwned(params.id, phone);
    if (!row) return notFound();
    return NextResponse.json({ entries: await listGuestbook(row.id, 200) });
  } catch (err) {
    return serverError("guestbook list", err);
  }
}

// 만든 사람: 어떤 글이든 삭제
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const phone = sessionPhone();
  if (!phone) return unauthorized();
  const body = (await req.json().catch(() => ({}))) as { entryId?: unknown };
  if (typeof body.entryId !== "string") return NextResponse.json({ error: "invalid" }, { status: 400 });
  try {
    const row = await getOwned(params.id, phone);
    if (!row) return notFound();
    await deleteGuestbook(row.id, body.entryId);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return serverError("guestbook delete", err);
  }
}
