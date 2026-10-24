import type { PaymentType, PlanKey, Side } from "@/lib/plans";
import { PAYMENT_TYPES, PLANS } from "@/lib/plans";

export interface AdminSyncInput {
  bookingNo: string;
  plan: PlanKey;
  year: number;
  month: number;
  day: number;
  time: string;
  name: string;
  side: Side | null;
  phone: string;
  venue: string;
  customerMemo: string | null;
  guests: number;
  payMethod: string;
  depositAmount: number;
  paymentType: PaymentType;
  extraButlers: number;
  totalAmount: number;
  onsiteAmount: number;
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
        side: input.side ?? undefined,
        phone: input.phone.trim(),
        weddingDate: `${input.year}-${pad(input.month)}-${pad(input.day)}`,
        weddingTime: input.time,
        venue: input.venue?.trim() || "미정",
        guestCount: input.guests,
        plan: PLANS[input.plan].name,
        customerMemo: input.customerMemo?.trim() || undefined,
        memo: `결제 수단: ${input.payMethod} · ${PAYMENT_TYPES[input.paymentType].name}`,
        paidAmount: input.depositAmount,
        paymentType: input.paymentType,
        extraButlers: input.extraButlers,
        totalAmount: input.totalAmount,
        onsiteAmount: input.onsiteAmount,
      }),
    });
    if (!res.ok) {
      console.error(`[admin-sync] admin API responded ${res.status} for ${input.bookingNo}`, await res.text());
    }
  } catch (err) {
    console.error(`[admin-sync] failed to reach admin API for ${input.bookingNo}`, err);
  }
}

export interface InquiryNoticeInput {
  name: string;
  phone: string;
  ceremonyDate: string | null;
  area: string | null;
  topic: string;
  message: string;
}

/**
 * Ask the 어드민 to post a 신규 문의 notice to the same KakaoWork room as new
 * reservations (the bot key lives only in the admin). Never throws - the
 * inquiry is already saved, so a failed notice only logs.
 */
export async function notifyAdminOfInquiry(input: InquiryNoticeInput): Promise<void> {
  const url = process.env.ADMIN_API_URL;
  const apiKey = process.env.ADMIN_API_KEY;
  if (!url || !apiKey) {
    console.warn("[admin-sync] ADMIN_API_URL/ADMIN_API_KEY not set - skipping inquiry notice.");
    return;
  }

  try {
    const res = await fetch(`${new URL(url).origin}/api/public/inquiries`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify(input),
      cache: "no-store",
    });
    if (!res.ok) {
      console.error(`[admin-sync] inquiry notice responded ${res.status}`, await res.text());
    }
  } catch (err) {
    console.error("[admin-sync] failed to send inquiry notice", err);
  }
}
