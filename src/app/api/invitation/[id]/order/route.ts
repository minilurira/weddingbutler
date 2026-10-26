import { NextResponse } from "next/server";
import { notFound, serverError, sessionPhone, unauthorized } from "@/lib/invitation/api";
import { PREMIUM_PRICE, TEMPLATE_INFO, isPremium, isTemplate } from "@/lib/invitation/content";
import { createOrder, getOwned, isPaid } from "@/lib/invitation/store";

export const dynamic = "force-dynamic";

// 프리미엄 결제 주문 만들기. 금액은 서버가 정한다.
export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const phone = sessionPhone();
  if (!phone) return unauthorized();
  try {
    const row = await getOwned(params.id, phone);
    if (!row) return notFound();
    if (!isPremium(row.template)) return NextResponse.json({ error: "not_premium" }, { status: 400 });
    if (isPaid(row)) return NextResponse.json({ paid: true });
    const { paymentId, amount } = await createOrder(row);
    const name = isTemplate(row.template) ? TEMPLATE_INFO[row.template].name : "프리미엄";
    return NextResponse.json({ paymentId, amount: amount === PREMIUM_PRICE ? amount : PREMIUM_PRICE, orderName: `모바일 청첩장 프리미엄 · ${name}`, phone });
  } catch (err) {
    return serverError("order", err);
  }
}
