"use client";

import type { PayMethod } from "@/lib/plans";

export interface RequestDepositPaymentArgs {
  paymentId: string;
  orderName: string;
  amount: number;
  payMethod: PayMethod;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  /** Where KG이니시스's mobile flow redirects back to after auth. Required for
   * mobile — without it, PortOne can't use the REDIRECTION window type and
   * falls back to the PC 웹표준 module, which 이니시스 then refuses on a
   * mobile device ("[INIStdPay/Dev. Error] PC로 결제 진행을 부탁드립니다"). */
  redirectUrl: string;
}

export interface RequestDepositPaymentResult {
  ok: boolean;
  message?: string;
}

/**
 * Kicks off a PortOne V2 payment for the given deposit amount, using the
 * KG이니시스 channel configured for this store. Requires
 * NEXT_PUBLIC_PORTONE_STORE_ID and NEXT_PUBLIC_PORTONE_CHANNEL_KEY.
 */
export async function requestDepositPayment(
  args: RequestDepositPaymentArgs
): Promise<RequestDepositPaymentResult> {
  const storeId = process.env.NEXT_PUBLIC_PORTONE_STORE_ID;
  const channelKey = process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KEY;

  if (!storeId || !channelKey) {
    return {
      ok: false,
      message:
        "결제 연동이 아직 설정되지 않았습니다 (NEXT_PUBLIC_PORTONE_STORE_ID / NEXT_PUBLIC_PORTONE_CHANNEL_KEY). .env.local을 확인해 주세요.",
    };
  }

  const PortOne = await import("@portone/browser-sdk/v2");

  const basePayload = {
    storeId,
    channelKey,
    paymentId: args.paymentId,
    orderName: args.orderName,
    totalAmount: args.amount,
    currency: "CURRENCY_KRW" as const,
    redirectUrl: args.redirectUrl,
    customer: {
      fullName: args.customerName,
      phoneNumber: args.customerPhone.replace(/[^0-9]/g, ""),
      email: args.customerEmail,
    },
  };

  const response = await PortOne.requestPayment(
    args.payMethod === "카카오페이"
      ? {
          ...basePayload,
          payMethod: "EASY_PAY",
          easyPay: { easyPayProvider: "EASY_PAY_PROVIDER_KAKAOPAY" },
        }
      : args.payMethod === "계좌이체"
        ? { ...basePayload, payMethod: "TRANSFER" }
        : { ...basePayload, payMethod: "CARD" }
  );

  if (!response || response.code != null) {
    return { ok: false, message: response?.message ?? "결제가 취소되었습니다." };
  }

  return { ok: true };
}
