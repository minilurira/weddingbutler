import "server-only";

import { PaymentClient, Webhook } from "@portone/server-sdk";

/**
 * 포트원 서버 연동.
 *
 * 결제 성공을 클라이언트 말만 듣고 믿으면 안 된다. 브라우저에서 온
 * "결제됐어요"는 위조할 수 있으므로, 반드시 포트원 서버에 직접 물어
 * 상태와 금액을 확인한 뒤에야 예약을 확정한다.
 */

const API_SECRET = process.env.PORTONE_API_SECRET ?? "";
const WEBHOOK_SECRET = process.env.PORTONE_WEBHOOK_SECRET ?? "";

/** 실제 포트원 API 로 검증할 수 있는 상태인지 */
export function isPortOneConfigured(): boolean {
  return Boolean(API_SECRET);
}

export function isWebhookConfigured(): boolean {
  return Boolean(WEBHOOK_SECRET);
}

let client: ReturnType<typeof PaymentClient> | null = null;

function getClient() {
  if (!API_SECRET) {
    throw new Error(
      "PORTONE_API_SECRET 이 설정되지 않아 결제를 검증할 수 없습니다.",
    );
  }
  client ??= PaymentClient({ secret: API_SECRET });
  return client;
}

export type VerifiedPayment = {
  /** 포트원이 알려준 결제 상태 */
  status: string;
  /** 실제로 승인된 금액 (원) */
  amount: number;
  /** 카드/간편결제 등 */
  method: string | null;
  /** 원본 응답 — 그대로 DB 에 남긴다 */
  raw: unknown;
};

/**
 * 결제 ID 로 포트원에 조회해 실제 결제 내역을 가져온다.
 *
 * 상태가 PAID 인지, 금액이 우리가 청구한 금액과 같은지는 호출부에서 판단한다.
 */
export async function fetchPayment(
  paymentId: string,
): Promise<VerifiedPayment> {
  const payment = await getClient().getPayment({ paymentId });

  // Payment 는 상태별 유니온이라 amount/method 가 없는 갈래도 있다.
  // 좁혀 쓰기보다 안전하게 옵셔널 접근으로 뽑아낸다.
  const record = payment as {
    status?: string;
    amount?: { total?: number };
    method?: { type?: string };
  };

  return {
    status: record.status ?? "UNKNOWN",
    amount: record.amount?.total ?? 0,
    method: record.method?.type ?? null,
    raw: payment,
  };
}

export type WebhookPaymentEvent = {
  type: string;
  paymentId: string | null;
};

/**
 * 웹훅 요청을 검증하고 결제 ID 를 뽑아낸다.
 *
 * 서명 검증에는 파싱하지 않은 원본 문자열이 필요하다. JSON.parse 를 거친
 * 객체를 다시 stringify 하면 서명이 깨지므로 raw body 를 그대로 넘긴다.
 */
export async function verifyWebhook(
  rawBody: string,
  headers: Record<string, string>,
): Promise<WebhookPaymentEvent> {
  if (!WEBHOOK_SECRET) {
    throw new Error("PORTONE_WEBHOOK_SECRET 이 설정되지 않았습니다.");
  }

  const webhook = await Webhook.verify(WEBHOOK_SECRET, rawBody, headers);
  const record = webhook as {
    type?: string;
    data?: { paymentId?: string };
  };

  return {
    type: record.type ?? "unknown",
    paymentId: record.data?.paymentId ?? null,
  };
}

/** 웹훅 서명 검증에 필요한 헤더만 골라낸다. */
export function pickWebhookHeaders(headers: Headers): Record<string, string> {
  const picked: Record<string, string> = {};
  for (const name of ["webhook-id", "webhook-signature", "webhook-timestamp"]) {
    const value = headers.get(name);
    if (value) picked[name] = value;
  }
  return picked;
}
