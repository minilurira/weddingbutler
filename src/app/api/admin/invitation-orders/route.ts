import { NextRequest, NextResponse } from "next/server";
import { requireAdminKey } from "@/lib/invitation/admin-auth";
import { healRecentPending } from "@/lib/invitation/reconcile";
import { listOrders } from "@/lib/invitation/store";
import { SITE_URL } from "@/lib/seo";

export const dynamic = "force-dynamic";

// 어드민 전용: 모바일 청첩장 프리미엄 결제내역 (읽기 전용). ?from=YYYY-MM-DD&until=YYYY-MM-DD (한국 시간, until은 그 날 끝까지)
const day = /^\d{4}-\d{2}-\d{2}$/;

export async function GET(req: NextRequest) {
  const denied = requireAdminKey(req);
  if (denied) return denied;
  const from = req.nextUrl.searchParams.get("from") ?? "";
  const until = req.nextUrl.searchParams.get("until") ?? "";
  if (!day.test(from) || !day.test(until)) return NextResponse.json({ code: "bad_request", message: "from, until 필요" }, { status: 400 });
  try {
    const fromIso = new Date(`${from}T00:00:00+09:00`).toISOString();
    const untilIso = new Date(new Date(`${until}T00:00:00+09:00`).getTime() + 86400000).toISOString();
    // 결제는 됐지만 확정되지 못한 최근 주문이 있으면 먼저 바로잡고 목록을 만든다
    await healRecentPending().catch((err) => console.warn("[admin invitation-orders] heal failed", err));
    const orders = await listOrders(fromIso, untilIso);
    return NextResponse.json({ code: "ok", orders: orders.map((o) => ({ ...o, url: o.slug ? `${SITE_URL}/i/${o.slug}` : "" })) });
  } catch (err) {
    console.error("[admin invitation-orders] failed", err);
    return NextResponse.json({ code: "server_error", message: "조회하지 못했습니다." }, { status: 500 });
  }
}
