export interface PortOnePaymentLookup {
  status: string;
  amountTotal: number;
  paymentId: string;
  txId?: string;
}

/**
 * Server-side payment verification against PortOne V2's REST API. This is
 * the source of truth for whether a deposit was actually paid — the browser
 * SDK's success callback alone must never be trusted to mark a reservation
 * as paid.
 */
export async function verifyPortOnePayment(
  paymentId: string
): Promise<PortOnePaymentLookup> {
  const secret = process.env.PORTONE_API_SECRET;
  if (!secret) {
    throw new Error(
      "PORTONE_API_SECRET is not configured (see .env.example)."
    );
  }

  const res = await fetch(
    `https://api.portone.io/payments/${encodeURIComponent(paymentId)}`,
    {
      headers: { Authorization: `PortOne ${secret}` },
      cache: "no-store",
    }
  );

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`PortOne payment lookup failed (${res.status}): ${text}`);
  }

  const data = await res.json();
  return {
    status: data.status,
    amountTotal: data.amount?.total ?? 0,
    paymentId: data.id ?? paymentId,
    txId: data.transactionId ?? data.pgTxId ?? undefined,
  };
}

export type PortOneCancelResult =
  | { ok: true; status: string; cancelledAmount: number; alreadyCancelled: boolean }
  | { ok: false; code: string; message: string };

/**
 * Cancel (refund) of a PortOne V2 payment. PortOne relays the cancel to
 * the PG (KG이니시스). Without `amount` the whole payment is cancelled; with
 * it, only that amount (부분취소). A payment that is already cancelled is
 * reported as ok with alreadyCancelled so a retried request stays idempotent.
 */
export async function cancelPortOnePayment(
  paymentId: string,
  reason: string,
  opts: { amount?: number; requester?: "ADMIN" | "CUSTOMER" } = {}
): Promise<PortOneCancelResult> {
  const secret = process.env.PORTONE_API_SECRET;
  if (!secret) {
    throw new Error(
      "PORTONE_API_SECRET is not configured (see .env.example)."
    );
  }

  const res = await fetch(
    `https://api.portone.io/payments/${encodeURIComponent(paymentId)}/cancel`,
    {
      method: "POST",
      headers: {
        Authorization: `PortOne ${secret}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ reason, requester: opts.requester ?? "ADMIN", ...(opts.amount ? { amount: opts.amount } : {}) }),
      cache: "no-store",
    }
  );

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (data.type === "PAYMENT_ALREADY_CANCELLED") {
      return { ok: true, status: "SUCCEEDED", cancelledAmount: 0, alreadyCancelled: true };
    }
    return {
      ok: false,
      code: data.type ?? `HTTP_${res.status}`,
      message: data.message ?? `PortOne cancel failed (${res.status})`,
    };
  }

  const cancellation = data.cancellation ?? {};
  if (cancellation.status === "FAILED") {
    return { ok: false, code: "CANCELLATION_FAILED", message: "PG사에서 결제취소가 거절되었습니다." };
  }
  return {
    ok: true,
    status: cancellation.status ?? "SUCCEEDED",
    cancelledAmount: cancellation.totalAmount ?? 0,
    alreadyCancelled: false,
  };
}
