/**
 * 클라이언트와 서버가 함께 보는 결제 설정.
 *
 * 여기에는 공개되어도 되는 값(storeId, channelKey)만 둔다.
 * API Secret 과 웹훅 시크릿은 서버 전용 lib/portone.ts 에서만 읽는다.
 */

export const PORTONE_STORE_ID = process.env.NEXT_PUBLIC_PORTONE_STORE_ID ?? "";
export const PORTONE_CHANNEL_KEY =
  process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KEY ?? "";

/**
 * 실결제가 가능한 상태인지.
 *
 * storeId 와 channelKey 가 모두 들어와 있어야 포트원 결제창을 띄울 수 있다.
 * 하나라도 비어 있으면 모의결제 모드로 동작한다 — 키가 없는 상태에서도
 * 예약 흐름 전체를 테스트할 수 있게 하기 위해서다.
 */
export const IS_LIVE_PAYMENT = Boolean(
  PORTONE_STORE_ID && PORTONE_CHANNEL_KEY,
);

export const IS_MOCK_PAYMENT = !IS_LIVE_PAYMENT;

/** 결제창에 넘길 통화·결제수단 (SDK 가 요구하는 문자열 그대로) */
export const PAYMENT_CURRENCY = "KRW" as const;
export const PAYMENT_METHOD = "CARD" as const;
