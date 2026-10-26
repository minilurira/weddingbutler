import { NextResponse } from "next/server";
import { notFound, serverError, sessionPhone, unauthorized } from "@/lib/invitation/api";
import { isTemplate } from "@/lib/invitation/content";
import { setTemplate } from "@/lib/invitation/store";

export const dynamic = "force-dynamic";

// 템플릿 바꾸기. 프리미엄 템플릿도 고르고 꾸미는 것은 무료이고, 결제는 발행할 때 한다.
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const phone = sessionPhone();
  if (!phone) return unauthorized();
  const body = (await req.json().catch(() => ({}))) as { template?: unknown };
  if (!isTemplate(body.template)) return NextResponse.json({ error: "invalid" }, { status: 400 });
  try {
    const row = await setTemplate(params.id, phone, body.template);
    if (!row) return notFound();
    return NextResponse.json({ ok: true, template: row.template, content: row.content });
  } catch (err) {
    return serverError("template", err);
  }
}
