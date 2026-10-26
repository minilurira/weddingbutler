import { NextResponse } from "next/server";
import { clientIp, notFound, serverError } from "@/lib/invitation/api";
import { checkPassword, guestbookProblem, hashIp, hashPassword } from "@/lib/invitation/guard";
import { addGuestbook, deleteGuestbook, getBySlug, getGuestbookHash, listGuestbook, recentGuestbookCount } from "@/lib/invitation/store";
import { recordSecret } from "@/lib/record-api";

export const dynamic = "force-dynamic";

type Ctx = { params: { slug: string } };

async function openInvitation(slug: string) {
  const row = await getBySlug(slug);
  return row && row.status === "published" && row.content.guestbook ? row : null;
}

// 하객: 방명록 보기 (공개된 청첩장만)
export async function GET(_req: Request, { params }: Ctx) {
  try {
    const row = await openInvitation(params.slug);
    if (!row) return notFound();
    return NextResponse.json({ entries: await listGuestbook(row.id, 100) });
  } catch (err) {
    return serverError("guest list", err);
  }
}

// 하객: 글 남기기. 이름·메시지·비밀번호 4자리. 욕설·광고는 거절하고, 같은 사람이 10분에 3번 넘게 올리지 못한다.
export async function POST(req: Request, { params }: Ctx) {
  const body = (await req.json().catch(() => ({}))) as { name?: unknown; message?: unknown; password?: unknown };
  const name = typeof body.name === "string" ? body.name.trim().slice(0, 20) : "";
  const message = typeof body.message === "string" ? body.message.trim().slice(0, 300) : "";
  const password = typeof body.password === "string" ? body.password : "";
  if (!name || !message) return NextResponse.json({ error: "empty" }, { status: 400 });
  if (!/^\d{4}$/.test(password)) return NextResponse.json({ error: "password" }, { status: 400 });
  const problem = guestbookProblem(name, message);
  if (problem) return NextResponse.json({ error: problem }, { status: 422 });
  try {
    const row = await openInvitation(params.slug);
    if (!row) return notFound();
    const ipHash = hashIp(clientIp(), recordSecret());
    if ((await recentGuestbookCount(row.id, ipHash, 10)) >= 3) return NextResponse.json({ error: "too_many" }, { status: 429 });
    const entry = await addGuestbook(row.id, { name, message, passwordHash: hashPassword(password), ipHash });
    return NextResponse.json({ entry });
  } catch (err) {
    return serverError("guest add", err);
  }
}

// 하객: 내가 쓴 글 지우기 (남길 때 정한 비밀번호가 맞아야 한다)
export async function DELETE(req: Request, { params }: Ctx) {
  const body = (await req.json().catch(() => ({}))) as { entryId?: unknown; password?: unknown };
  if (typeof body.entryId !== "string" || typeof body.password !== "string") return NextResponse.json({ error: "invalid" }, { status: 400 });
  try {
    const row = await getBySlug(params.slug);
    if (!row || row.status !== "published") return notFound();
    const hash = await getGuestbookHash(row.id, body.entryId);
    if (!hash) return notFound();
    if (!checkPassword(body.password, hash)) return NextResponse.json({ error: "wrong_password" }, { status: 403 });
    await deleteGuestbook(row.id, body.entryId);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return serverError("guest delete", err);
  }
}
