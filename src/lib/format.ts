/** 금액·연락처 표시 포맷 유틸. */

const won = new Intl.NumberFormat("ko-KR");

/** 390000 → "390,000원" */
export function formatWon(amount: number): string {
  return `${won.format(Math.round(amount))}원`;
}

/** 390000 → "390,000" (단위는 호출부가 직접 붙일 때) */
export function formatNumber(value: number): string {
  return won.format(Math.round(value));
}

/** 390000 → "39만원", 450000 → "45만원", 800000 → "80만원" */
export function formatManwon(amount: number): string {
  const man = amount / 10_000;
  if (Number.isInteger(man)) return `${won.format(man)}만원`;
  return formatWon(amount);
}

/** "01012345678" → "010-1234-5678" (표시 전용, 저장은 원본으로) */
export function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (digits.length === 11) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
  }
  if (digits.length === 10) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  return value;
}

/** ISO 문자열 → "2026. 5. 16. 오후 2:30" (Asia/Seoul) */
export function formatDateTime(iso: string): string {
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

/** ISO 문자열 → "2026. 5. 16." (Asia/Seoul) */
export function formatDateOnly(iso: string): string {
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    dateStyle: "medium",
  }).format(new Date(iso));
}
