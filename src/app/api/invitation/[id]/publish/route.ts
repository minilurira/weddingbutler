import { NextResponse } from "next/server";
import { notFound, publicUrl, serverError, sessionPhone, unauthorized } from "@/lib/invitation/api";
import { missingForPublish } from "@/lib/invitation/content";
import { getOwned, setStatus } from "@/lib/invitation/store";

export const dynamic = "force-dynamic";

// 발행(공개) / 비공개 전환
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const phone = sessionPhone();
  if (!phone) return unauthorized();
  const body = (await req.json().catch(() => ({}))) as { action?: unknown };
  const action = body.action === "hide" ? "hidden" : "published";
  try {
    const row = await getOwned(params.id, phone);
    if (!row) return notFound();
    if (action === "published") {
      const missing = missingForPublish(row.content);
      if (missing.length) return NextResponse.json({ error: "missing", missing }, { status: 400 });
    }
    const updated = await setStatus(row.id, phone, action);
    if (!updated) return notFound();
    return NextResponse.json({ ok: true, status: updated.status, url: publicUrl(updated.slug) });
  } catch (err) {
    return serverError("publish", err);
  }
}
