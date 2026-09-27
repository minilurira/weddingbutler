import type { PlanKey } from "@/lib/plans";
import { PLANS } from "@/lib/plans";

export interface NewReservationNotifyInput {
  bookingNo: string;
  customerName: string;
  phone: string;
  plan: PlanKey;
  year: number;
  month: number;
  day: number;
  time: string;
  venue: string;
  amount: number;
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

/**
 * Fires the "결제 완료" 알림톡 pair (customer + ops team) via an n8n webhook,
 * once for each newly-paid reservation. Same fire-and-forget/non-throwing
 * shape as admin-sync.ts - a notification failure must never block the
 * customer's payment confirmation response.
 */
export async function sendNewReservationAlimtalk(input: NewReservationNotifyInput): Promise<void> {
  const url = process.env.N8N_NEW_RESERVATION_WEBHOOK_URL;
  if (!url) {
    console.warn("[notify-new-reservation] N8N_NEW_RESERVATION_WEBHOOK_URL not set - skipping notification.");
    return;
  }

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        bookingNo: input.bookingNo,
        customerName: input.customerName,
        phone: input.phone,
        plan: PLANS[input.plan].name,
        weddingDate: `${input.year}-${pad(input.month)}-${pad(input.day)}`,
        weddingTime: input.time,
        venue: input.venue?.trim() || "미정",
        amount: input.amount,
      }),
    });
    if (!res.ok) {
      console.error(`[notify-new-reservation] webhook responded ${res.status} for ${input.bookingNo}`, await res.text());
    }
  } catch (err) {
    console.error(`[notify-new-reservation] failed to reach webhook for ${input.bookingNo}`, err);
  }
}
