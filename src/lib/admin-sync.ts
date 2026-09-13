import type { PlanKey } from "@/lib/plans";
import { PLANS } from "@/lib/plans";

export interface AdminSyncInput {
  bookingNo: string;
  plan: PlanKey;
  year: number;
  month: number;
  day: number;
  time: string;
  name: string;
  phone: string;
  venue: string;
  guests: number;
  payMethod: string;
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

/**
 * Push a newly-submitted reservation to the 웨딩버틀러 어드민 so staff see it in
 * "신규요청" right away, before the deposit payment step even runs. Never
 * throws - a sync failure must not block the customer's booking flow, so
 * this only logs on failure.
 */
export async function syncReservationToAdmin(input: AdminSyncInput): Promise<void> {
  const url = process.env.ADMIN_API_URL;
  const apiKey = process.env.ADMIN_API_KEY;
  if (!url || !apiKey) {
    console.warn("[admin-sync] ADMIN_API_URL/ADMIN_API_KEY not set - skipping admin sync.");
    return;
  }

  // "김민준 · 이서연" -> customer shown in the admin list is the bride's name (last segment).
  const parts = input.name.split("·").map((p) => p.trim()).filter(Boolean);
  const customer = parts.length > 1 ? parts[parts.length - 1] : input.name.trim();

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        externalId: input.bookingNo,
        customer,
        couple: input.name.trim(),
        phone: input.phone.trim(),
        weddingDate: `${input.year}-${pad(input.month)}-${pad(input.day)}`,
        weddingTime: input.time,
        venue: input.venue?.trim() || "미정",
        guestCount: input.guests,
        plan: PLANS[input.plan].name,
        memo: `결제 수단: ${input.payMethod}`,
      }),
    });
    if (!res.ok) {
      console.error(`[admin-sync] admin API responded ${res.status} for ${input.bookingNo}`, await res.text());
    }
  } catch (err) {
    console.error(`[admin-sync] failed to reach admin API for ${input.bookingNo}`, err);
  }
}
