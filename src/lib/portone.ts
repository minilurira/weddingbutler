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
