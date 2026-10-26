import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { sessionPhone } from "@/lib/invitation/api";
import { isPaid, listByPhone } from "@/lib/invitation/store";
import { isPremium } from "@/lib/invitation/content";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "내 청첩장 대시보드", robots: { index: false, follow: false } };

// 홈페이지 어디서든 쓰는 "내 대시보드" 고정 주소. 로그인(휴대폰 인증)이 되어 있고 결제한 프리미엄 청첩장이 하나면 그 대시보드로 바로,
// 여러 개이거나 로그인이 안 되어 있으면 "내 청첩장" 목록(로그인)으로 보낸다.
export default async function DashboardEntry() {
  const phone = sessionPhone();
  if (!phone) redirect("/invitation/new");
  const rows = await listByPhone(phone).catch(() => []);
  const premium = rows.filter((r) => isPremium(r.template) && isPaid(r));
  if (premium.length === 1) redirect(`/invitation/dashboard/${premium[0].id}`);
  redirect("/invitation/new");
}
