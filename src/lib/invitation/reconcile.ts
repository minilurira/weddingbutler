import { supabaseAdmin } from "@/lib/supabase";
import { markPaid } from "@/lib/invitation/store";
import { verifyPortOnePayment } from "@/lib/portone";

// 결제는 끝났는데 브라우저가 닫히거나 네트워크가 끊겨 "결제 확인" 요청이 서버에 닿지 못한 주문을 바로잡는다.
// 포트원 서버에 직접 물어 PAID이고 금액이 주문과 같을 때만 결제 완료로 기록한다(결제 확인 API와 같은 기준).
const WINDOW_MS = 3 * 24 * 3600 * 1000;

/** 이 청첩장의 미완료 주문을 확인한다. 하나라도 결제 완료로 고쳤으면 true */
export async function healPendingOrders(invitationId: string): Promise<boolean> {
  const since = new Date(Date.now() - WINDOW_MS).toISOString();
  const { data } = await supabaseAdmin()
    .from("invitation_orders")
    .select("payment_id, amount")
    .eq("invitation_id", invitationId)
    .eq("status", "pending")
    .gte("created_at", since)
    .order("created_at", { ascending: false })
    .limit(3);
  for (const o of data ?? []) {
    try {
      const pay = await verifyPortOnePayment(o.payment_id);
      if (pay.status === "PAID" && pay.amountTotal === o.amount) {
        await markPaid(invitationId, o.payment_id, o.amount);
        console.warn(`[invitation] 결제는 됐지만 확정되지 않았던 주문을 복구했습니다: ${o.payment_id}`);
        return true;
      }
    } catch {
      // 포트원에 그 결제가 없거나(결제창만 열고 끝냄) 조회 실패: 그대로 둔다
    }
  }
  return false;
}

/** 최근 미완료 주문이 있는 청첩장들을 한꺼번에 확인한다(어드민 결제 목록을 열 때) */
export async function healRecentPending(limit = 12): Promise<number> {
  const since = new Date(Date.now() - WINDOW_MS).toISOString();
  const { data } = await supabaseAdmin()
    .from("invitation_orders")
    .select("invitation_id")
    .eq("status", "pending")
    .gte("created_at", since)
    .not("invitation_id", "is", null)
    .order("created_at", { ascending: false })
    .limit(50);
  const ids = Array.from(new Set((data ?? []).map((r) => r.invitation_id as string))).slice(0, limit);
  let healed = 0;
  for (const id of ids) if (await healPendingOrders(id)) healed++;
  return healed;
}
