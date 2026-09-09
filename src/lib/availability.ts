/**
 * 예약 가능 일시 규칙.
 *
 * 예식은 한국에서 열리므로 모든 날짜 판단은 Asia/Seoul 기준이다.
 * Vercel 서버는 UTC로 돌기 때문에, Date 객체의 로컬 시간대에 의존하면
 * 자정 전후로 "오늘"이 하루 어긋난다. 그래서 날짜는 "YYYY-MM-DD",
 * 시간은 "HH:mm" 문자열로만 다루고 비교도 문자열/숫자로만 한다.
 */

export const TIME_ZONE = "Asia/Seoul";

/** 예약 가능 요일: 토(6), 일(0) */
export const BOOKABLE_WEEKDAYS = [0, 6] as const;

/** 예약 가능 시간대 (분 단위, 11:00 ~ 19:00) */
export const OPEN_MINUTES = 11 * 60;
export const CLOSE_MINUTES = 19 * 60;

/** 시간 슬롯 간격(분) */
export const SLOT_STEP_MINUTES = 30;

/** 오늘로부터 최소 며칠 뒤부터 예약을 받을지 (인력 배정에 필요한 리드타임) */
export const MIN_LEAD_DAYS = 7;

/** 최대 몇 달 앞까지 달력을 열어둘지 */
export const MAX_MONTHS_AHEAD = 12;

/** 같은 날짜·시간에 동시에 받을 수 있는 예약 수 */
export const SLOT_CAPACITY = 1;

export type DateString = string; // "YYYY-MM-DD"
export type TimeString = string; // "HH:mm"

/** 현재 서울 날짜를 "YYYY-MM-DD"로 돌려준다. */
export function todayInSeoul(now: Date = new Date()): DateString {
  // en-CA 로케일은 YYYY-MM-DD 형식을 그대로 내준다.
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

/** "YYYY-MM-DD" → 시간대 영향 없는 UTC 자정 Date. 요일 계산·날짜 덧셈 전용. */
export function parseDateString(date: DateString): Date {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

export function formatDateString(date: Date): DateString {
  return date.toISOString().slice(0, 10);
}

export function addDays(date: DateString, days: number): DateString {
  const d = parseDateString(date);
  d.setUTCDate(d.getUTCDate() + days);
  return formatDateString(d);
}

/** 0=일 … 6=토 */
export function weekdayOf(date: DateString): number {
  return parseDateString(date).getUTCDay();
}

export function isWeekend(date: DateString): boolean {
  return (BOOKABLE_WEEKDAYS as readonly number[]).includes(weekdayOf(date));
}

/** 예약을 받기 시작하는 가장 이른 날짜 */
export function earliestBookableDate(now: Date = new Date()): DateString {
  return addDays(todayInSeoul(now), MIN_LEAD_DAYS);
}

/** 달력을 열어두는 마지막 날짜 */
export function latestBookableDate(now: Date = new Date()): DateString {
  const d = parseDateString(todayInSeoul(now));
  d.setUTCMonth(d.getUTCMonth() + MAX_MONTHS_AHEAD);
  return formatDateString(d);
}

export function isValidDateString(value: unknown): value is DateString {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }
  // 2026-02-31 같은 값을 걸러낸다.
  return formatDateString(parseDateString(value)) === value;
}

export function isValidTimeString(value: unknown): value is TimeString {
  return typeof value === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

export function timeToMinutes(time: TimeString): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export function minutesToTime(minutes: number): TimeString {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/** 예약 가능한 모든 시간 슬롯 ("11:00" … "19:00") */
export function allTimeSlots(): TimeString[] {
  const slots: TimeString[] = [];
  for (let m = OPEN_MINUTES; m <= CLOSE_MINUTES; m += SLOT_STEP_MINUTES) {
    slots.push(minutesToTime(m));
  }
  return slots;
}

export function isBookableTime(time: unknown): time is TimeString {
  if (!isValidTimeString(time)) return false;
  const minutes = timeToMinutes(time);
  if (minutes < OPEN_MINUTES || minutes > CLOSE_MINUTES) return false;
  return (minutes - OPEN_MINUTES) % SLOT_STEP_MINUTES === 0;
}

export type DateRejection =
  | "invalid"
  | "weekday-only-weekend"
  | "too-soon"
  | "too-far";

/** 날짜가 예약 가능한지 판정하고, 불가하면 사유를 돌려준다. */
export function checkDate(
  date: unknown,
  now: Date = new Date(),
): { ok: true } | { ok: false; reason: DateRejection } {
  if (!isValidDateString(date)) return { ok: false, reason: "invalid" };
  if (!isWeekend(date)) return { ok: false, reason: "weekday-only-weekend" };
  if (date < earliestBookableDate(now)) return { ok: false, reason: "too-soon" };
  if (date > latestBookableDate(now)) return { ok: false, reason: "too-far" };
  return { ok: true };
}

export function isBookableDate(date: unknown, now: Date = new Date()): boolean {
  return checkDate(date, now).ok;
}

export const DATE_REJECTION_MESSAGE: Record<DateRejection, string> = {
  invalid: "날짜 형식이 올바르지 않습니다.",
  "weekday-only-weekend": "예약은 토요일과 일요일만 가능합니다.",
  "too-soon": `예식 준비를 위해 ${MIN_LEAD_DAYS}일 뒤부터 예약하실 수 있습니다.`,
  "too-far": "너무 먼 날짜입니다. 전화로 문의해 주세요.",
};

/** "2026-05-16" → "2026년 5월 16일 (토)" */
export function formatKoreanDate(date: DateString): string {
  const d = parseDateString(date);
  const weekday = ["일", "월", "화", "수", "목", "금", "토"][d.getUTCDay()];
  return `${d.getUTCFullYear()}년 ${d.getUTCMonth() + 1}월 ${d.getUTCDate()}일 (${weekday})`;
}

/** "14:30" → "오후 2시 30분" */
export function formatKoreanTime(time: TimeString): string {
  const minutes = timeToMinutes(time);
  const h24 = Math.floor(minutes / 60);
  const m = minutes % 60;
  const meridiem = h24 < 12 ? "오전" : "오후";
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return m === 0
    ? `${meridiem} ${h12}시`
    : `${meridiem} ${h12}시 ${String(m).padStart(2, "0")}분`;
}
