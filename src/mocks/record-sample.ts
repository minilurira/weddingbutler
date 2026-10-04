// 디자인 확인용 가상 데이터(실존 인물 아님). 기록 데모 페이지(F1-6)에 쓸 때는 '샘플' 표기 필수.
import type { RecordEntry, RecordPayload, Side } from '@/types/record';

const R = (envelopeNo: number, side: Side, name: string, relation: string, amount: number, tickets: number, memo = ''): RecordEntry =>
  ({ envelopeNo, side, name, relation, amount, tickets, ...(memo ? { memo } : {}) });

const ENTRIES: RecordEntry[] = [
  R(1, '신랑측', '김태현', '직장', 100000, 2), R(2, '신랑측', '이정우', '친구', 50000, 1),
  R(3, '신랑측', '박상철', '친척', 300000, 3, '부부 함께'), R(4, '신랑측', '최윤아', '직장', 50000, 1),
  R(5, '신랑측', '정민호', '친구', 100000, 2), R(6, '신랑측', '한경수', '지인', 50000, 1),
  R(7, '신랑측', '오세진', '직장', 100000, 1), R(8, '신랑측', '김영숙', '친척', 200000, 2),
  R(9, '신랑측', 'Daniel Kim', '친구', 100000, 1, '영문 기재'), R(10, '신랑측', '윤재석', '직장', 30000, 0, '식사 안 함'),
  R(11, '신랑측', '장미경', '지인', 50000, 1), R(12, '신랑측', '(주)한빛산업', '직장', 300000, 0, '회사 명의'),
  R(13, '신랑측', '서동욱', '친구', 50000, 1), R(14, '신랑측', '홍길동', '친척', 100000, 2),
  R(15, '신랑측', '권혁준', '친구', 100000, 1), R(16, '신랑측', '남궁현', '직장', 50000, 1),
  R(17, '신랑측', '송지원', '친구', 50000, 1, '대리 전달'), R(18, '신랑측', '임채원', '친척', 500000, 4),
  R(19, '신부측', '이하은', '친구', 100000, 1), R(20, '신부측', '박소영', '직장', 50000, 1),
  R(21, '신부측', '김수정', '친척', 200000, 2), R(22, '신부측', '조현우', '직장', 100000, 2),
  R(23, '신부측', '문가은', '친구', 50000, 1), R(24, '신부측', '배성훈', '지인', 30000, 1),
  R(25, '신부측', '신혜린', '친구', 100000, 1), R(26, '신부측', '유정란', '친척', 300000, 3),
  R(27, '신부측', '안지호', '직장', 50000, 1), R(28, '신부측', '황보름', '친구', 50000, 1),
  R(29, '신부측', '성다인', '직장', 100000, 1), R(30, '신부측', 'Emily Park', '친구', 100000, 1, '영문 기재'),
  R(31, '신부측', '차은비', '친구', 50000, 1), R(32, '신부측', '구본희', '직장', 50000, 0),
  R(33, '신부측', '표영자', '친척', 100000, 2), R(34, '신부측', '탁수연', '지인', 30000, 1),
  R(35, '신부측', '노승아', '친구', 100000, 1), R(36, '신부측', '전미라', '직장', 50000, 1, '축하카드 동봉'),
];

export const sampleRecord: RecordPayload = {
  meta: {
    bookingNo: 'WB20261025-3232',
    coupleName: '김도윤 · 이하린',
    weddingAt: '2026-10-25T11:00:00+09:00',
    venueName: '[예식장명]',
    hallName: '[홀 이름]',
    plan: 'premium',
    recordMode: 'opened',
    publishedAt: '2026-10-25T18:40:00+09:00',
    handoverAt: '2026-10-25T15:10:00+09:00',
    handoverEnvelopeCount: 36,
    receiverLabel: '김○○ (신랑 부친)',
    staffCount: 4,
    version: 1,
    expiresAt: '2027-10-20T18:40:00+09:00', // 보관기간 미확정 — HANDOFF.md 결정사항
    baseGuests: 400,
    extraGuestFee: 2000,
    downloadUrl: '#',
    videoUrl: '#',
    supportPhone: '[대표번호]',
  },
  entries: ENTRIES,
};

/** 밀봉 모드 응답 모양(서버가 amount 키를 제거한 상태) */
export const sampleSealed: RecordPayload = {
  meta: { ...sampleRecord.meta, recordMode: 'sealed' },
  entries: ENTRIES.map(({ amount: _omit, ...rest }) => rest),
};

/** 스탠다드(한쪽) */
export const sampleStandard: RecordPayload = {
  meta: { ...sampleRecord.meta, plan: 'standard', staffCount: 2, baseGuests: 300, handoverEnvelopeCount: 18 },
  entries: ENTRIES.filter((e) => e.side === '신랑측'),
};
