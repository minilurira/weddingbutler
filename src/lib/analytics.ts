// GA4 이벤트 전송 도우미. 이름·연락처·이메일 등 개인정보는 보내지 않는다.

type Gtag = (...args: unknown[]) => void;

type GaWindow = { gtag?: Gtag; __wbGaQueue?: unknown[][] };

// 페이지 첫 렌더 때 보낸 이벤트는 GA가 아직 준비되기 전일 수 있어, 준비될 때까지 모아 둔다.
function gtag(...args: unknown[]) {
  if (typeof window === "undefined") return;
  const w = window as unknown as GaWindow;
  if (typeof w.gtag === "function") w.gtag(...args);
  else (w.__wbGaQueue ||= []).push(args);
}

/** GoogleAnalytics가 config 직후 호출: 모아 둔 이벤트를 보낸다. */
export function flushQueuedEvents() {
  const w = window as unknown as GaWindow;
  const q = w.__wbGaQueue || [];
  w.__wbGaQueue = [];
  if (typeof w.gtag === "function") for (const args of q) w.gtag(...args);
}

const PENDING_KEY = "wb_pending_purchase";

export interface PurchaseInfo {
  bookingNo: string;
  amount: number;
  plan: string;
  paymentType?: string;
  test?: boolean;
}

/** 모바일 결제는 다른 페이지로 넘어갔다 돌아오므로, 결제 전에 금액·플랜을 잠시 보관해 둔다. */
export function stashPendingPurchase(rid: string, info: PurchaseInfo) {
  try {
    sessionStorage.setItem(PENDING_KEY, JSON.stringify({ rid, ...info }));
  } catch {
    /* 저장 불가 환경이면 생략 */
  }
}

export function takePendingPurchase(rid: string): PurchaseInfo | null {
  try {
    const raw = sessionStorage.getItem(PENDING_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as PurchaseInfo & { rid: string };
    if (data.rid !== rid) return null;
    sessionStorage.removeItem(PENDING_KEY);
    return data;
  } catch {
    return null;
  }
}

/** 예약 완료(결제 확인 성공). 같은 예약번호는 한 번만 보낸다. */
export function trackPurchase(info: PurchaseInfo) {
  if (info.test || !info.bookingNo) return;
  const sentKey = `wb_ga_purchase_${info.bookingNo}`;
  try {
    if (sessionStorage.getItem(sentKey)) return;
    sessionStorage.setItem(sentKey, "1");
  } catch {
    /* GA4도 transaction_id로 중복을 걸러 준다 */
  }
  gtag("event", "purchase", {
    transaction_id: info.bookingNo,
    value: info.amount,
    currency: "KRW",
    plan: info.plan,
    payment_type: info.paymentType,
    items: [{ item_id: info.plan, item_name: info.plan, price: info.amount, quantity: 1 }],
  });
}

/** 문의 전송 성공 */
export function trackContact(topic: string) {
  gtag("event", "generate_lead", { topic });
}

/** 예약 창 열림 */
export function trackReservationOpen(plan: string) {
  gtag("event", "reservation_open", { plan });
}

/** 문의하기 페이지 접근 */
export function trackContactPageView() {
  gtag("event", "contact_page_view");
}

/** GNB 예약문의(카카오채널 채팅) 클릭 */
export function trackKakaoChatClick(location: string) {
  gtag("event", "kakao_chat_click", { location });
}
