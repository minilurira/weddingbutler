/** 입력 중인 휴대폰 번호를 010-0000-0000 형식으로 맞춘다. 숫자만 남기고 최대 11자리. */
export function formatPhoneInput(value: string): string {
  const d = value.replace(/[^0-9]/g, "").slice(0, 11);
  if (d.length < 4) return d;
  if (d.length < 8) return `${d.slice(0, 3)}-${d.slice(3)}`;
  return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}`;
}
