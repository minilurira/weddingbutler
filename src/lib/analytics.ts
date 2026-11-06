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

// ── 예약 퍼널 ──────────────────────────────────────────────
// 예약 창을 연 뒤 어디까지 왔는지 단계별로 보낸다. 한 번 열 때 단계마다 한 번만 보낸다(ReservationModal).
// 어드민 유입·검색의 "예약 퍼널" 카드가 이벤트 이름으로 집계하므로 이름을 바꾸면 어드민도 같이 바꾼다.
export const FUNNEL_EVENTS = {
  date_select: "reservation_date_select", // 날짜·시간 선택
  info_start: "reservation_info_start", // 이름·연락처 등 첫 입력
  submit_click: "reservation_submit_click", // 결제하기 클릭
  form_blocked: "reservation_form_blocked", // 결제하기를 눌렀지만 빈칸·미동의로 막힘
  pay_window: "reservation_pay_window", // 결제창 열림
  pay_fail: "reservation_pay_fail", // 결제창 닫음·결제 실패
} as const;

export type FunnelStep = keyof typeof FUNNEL_EVENTS;

export function trackFunnel(step: FunnelStep, params: Record<string, string | number> = {}) {
  gtag("event", FUNNEL_EVENTS[step], params);
}

/** 결제를 끝내지 않고 예약 창을 닫음. last_step = 닫기 직전까지 온 단계 */
export function trackReservationClose(lastStep: string, plan: string) {
  gtag("event", "reservation_close", { last_step: lastStep, plan });
}
