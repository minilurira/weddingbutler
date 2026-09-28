/**
 * 대한민국 법정공휴일(관공서의 공휴일에 관한 규정) — 음력 기준 공휴일(설날·추석·
 * 부처님오신날)과 대체공휴일은 해마다 날짜가 바뀌므로, 이 목록은 연말에 다음 해
 * 날짜를 추가하는 방식으로 수동 갱신해야 한다. 예약 가능 범위(오늘부터 3개월)를
 * 벗어난 연도는 비워 둬도 안전하다 — 목록에 없는 날은 주말이 아닌 한 예약 불가로
 * 처리될 뿐, 잘못 열리지 않는다.
 */
const HOLIDAYS: ReadonlySet<string> = new Set([
  // 2026
  "2026-01-01", // 신정
  "2026-02-16",
  "2026-02-17",
  "2026-02-18", // 설날 연휴
  "2026-03-01",
  "2026-03-02", // 삼일절 (대체공휴일 3/2)
  "2026-05-05", // 어린이날
  "2026-05-24",
  "2026-05-25", // 부처님오신날 (대체공휴일 5/25)
  "2026-06-06", // 현충일
  "2026-08-15",
  "2026-08-17", // 광복절 (대체공휴일 8/17)
  "2026-09-24",
  "2026-09-25",
  "2026-09-26", // 추석 연휴
  "2026-10-03",
  "2026-10-05", // 개천절 (대체공휴일 10/5)
  "2026-10-09", // 한글날
  "2026-12-25", // 성탄절
]);

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

function toKey(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

export function isKoreanHoliday(d: Date): boolean {
  return HOLIDAYS.has(toKey(d));
}

/** 예약 가능한 요일: 주말(토·일) 또는 법정공휴일. */
export function isBookableDow(d: Date): boolean {
  const dow = d.getDay();
  return dow === 0 || dow === 6 || isKoreanHoliday(d);
}

/** 예약 가능한 가장 이른 날짜: 오늘로부터 7일 이후. */
export function minBookingDate(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 7);
  return d;
}

/** 예약 가능한 가장 늦은 날짜: 오늘로부터 3개월 이내. */
export function maxBookingDate(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setMonth(d.getMonth() + 3);
  return d;
}

/** 오늘 기준으로 예약 가능한 첫 번째 날짜(주말 또는 공휴일). */
export function firstBookableDate(): Date {
  const max = maxBookingDate();
  const d = minBookingDate();
  while (d <= max && !isBookableDow(d)) d.setDate(d.getDate() + 1);
  return d;
}
