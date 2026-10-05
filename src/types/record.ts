// 고객용 축의 기록(S14~S17) 데이터 타입
// 밀봉 모드에서는 서버가 amount를 아예 빼고 내려준다(03 요청서 7-10, AC-06).

export type Side = '신랑측' | '신부측';
export type RecordMode = 'opened' | 'sealed';
export type PlanCode = 'small' | 'standard' | 'premium';

export interface RecordEntry {
  envelopeNo: number;
  side: Side;
  name: string;
  relation?: string;
  /** 밀봉 모드면 서버 응답에 키 자체가 없어야 함 */
  amount?: number;
  tickets: number;
  memo?: string;
}

export interface RecordMeta {
  bookingNo: string;
  coupleName: string;          // "김도윤 · 이하린"
  weddingAt: string;           // ISO 8601
  venueName: string;
  hallName?: string;
  plan: PlanCode;
  recordMode: RecordMode;
  publishedAt: string;         // ISO
  handoverAt: string;          // 인계확인서 서명 시각 ISO
  handoverEnvelopeCount: number; // 인계확인서 봉투 매수
  receiverLabel: string;       // "김○○ (신랑 부친)" — 서버에서 마스킹
  staffCount: number;
  version: number;
  expiresAt: string;           // ISO, 게시 + 보관기간
  baseGuests: number;          // 상품 기본 하객
  extraGuestFee: number;       // 1명당
  downloadUrl: string;         // 서버 라우트(밀봉이면 금액 열 제외된 파일)
  videoUrl?: string;
  supportPhone: string;
}

export interface RecordPayload {
  meta: RecordMeta;
  entries: RecordEntry[];
}
