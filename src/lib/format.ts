// 카피 원칙(02 기획안 6장): "90,000원", "2026년 11월 14일(토) 11:20". 모든 날짜는 KST.

export const won = (n: number): string => `${n.toLocaleString('ko-KR')}원`;
export const num = (n: number): string => n.toLocaleString('ko-KR');

const parts = (iso: string) => {
  const f = new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul',
    year: 'numeric', month: 'numeric', day: 'numeric',
    weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).formatToParts(new Date(iso));
  const get = (t: Intl.DateTimeFormatPartTypes) => f.find((p) => p.type === t)?.value ?? '';
  return { y: get('year'), m: get('month'), d: get('day'), w: get('weekday'), hh: get('hour'), mm: get('minute') };
};

/** 2026년 10월 25일(일) */
export const krDate = (iso: string): string => {
  const p = parts(iso);
  return `${p.y}년 ${p.m}월 ${p.d}일(${p.w})`;
};

/** 2026년 10월 25일(일) 11:00 */
export const krDateTime = (iso: string): string => {
  const p = parts(iso);
  return `${krDate(iso)} ${p.hh}:${p.mm}`;
};

/** 11:00 */
export const krTime = (iso: string): string => {
  const p = parts(iso);
  return `${p.hh}:${p.mm}`;
};
