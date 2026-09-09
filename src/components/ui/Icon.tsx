/**
 * 사이트에서 쓰는 아이콘 모음.
 *
 * 아이콘 라이브러리를 받아오면 쓰지도 않는 수백 개가 함께 딸려온다.
 * 필요한 것만 직접 그려서 한 파일에 모아둔다. 모두 24x24 기준,
 * 선 굵기 1.6, currentColor 를 따르므로 글자색만 바꾸면 색도 따라온다.
 */

export type IconName =
  | "envelope"
  | "notebook"
  | "lock"
  | "gift"
  | "receipt"
  | "list"
  | "users"
  | "shield"
  | "eye"
  | "clock"
  | "calendar"
  | "card"
  | "phone"
  | "chat"
  | "check"
  | "heart"
  | "alert"
  | "queue";

const PATHS: Record<IconName, React.ReactNode> = {
  // 축의금 봉투
  envelope: (
    <>
      <rect x="3" y="5.5" width="18" height="13" rx="2.5" />
      <path d="m3.5 7 8.5 6 8.5-6" />
    </>
  ),
  // 방명록 / 기록
  notebook: (
    <>
      <path d="M6 3.5h11a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H6a1.5 1.5 0 0 1-1.5-1.5v-14A1.5 1.5 0 0 1 6 3.5Z" />
      <path d="M8.5 8.5h7M8.5 12h7M8.5 15.5h4" />
    </>
  ),
  // 잠금 보관함
  lock: (
    <>
      <rect x="4.5" y="10.5" width="15" height="9.5" rx="2.5" />
      <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
      <path d="M12 14.5v2" />
    </>
  ),
  // 답례품
  gift: (
    <>
      <rect x="3.5" y="9" width="17" height="11.5" rx="2" />
      <path d="M3.5 13h17M12 9v11.5" />
      <path d="M12 9c-1 -3 -2.2 -4.5 -3.8 -4.5a2.2 2.2 0 0 0 0 4.5H12Zm0 0c1-3 2.2-4.5 3.8-4.5a2.2 2.2 0 0 1 0 4.5H12Z" />
    </>
  ),
  // 정산 영수증
  receipt: (
    <>
      <path d="M5.5 3.5h13v17l-2.2-1.6-2.2 1.6-2.1-1.6-2.2 1.6-2.2-1.6-2.1 1.6v-17Z" />
      <path d="M9 8.5h6M9 12h6" />
    </>
  ),
  // 명단
  list: (
    <>
      <path d="M9 6.5h11M9 12h11M9 17.5h11" />
      <path d="M4.5 6.5h.01M4.5 12h.01M4.5 17.5h.01" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3 20c0-3.2 2.7-5.2 6-5.2s6 2 6 5.2" />
      <path d="M16 5.2a3.2 3.2 0 0 1 0 5.6M17.5 14.6c2.1.6 3.5 2.3 3.5 4.6" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3.2 19 6v5.5c0 4-2.9 7.4-7 8.8-4.1-1.4-7-4.8-7-8.8V6l7-2.8Z" />
      <path d="m9 12 2.2 2.2L15.5 10" />
    </>
  ),
  eye: (
    <>
      <path d="M2.8 12S6 6.2 12 6.2 21.2 12 21.2 12 18 17.8 12 17.8 2.8 12 2.8 12Z" />
      <circle cx="12" cy="12" r="2.8" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.2V12l3.2 2" />
    </>
  ),
  calendar: (
    <>
      <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" />
      <path d="M3.5 9.8h17M8.5 3v4M15.5 3v4" />
    </>
  ),
  card: (
    <>
      <rect x="2.8" y="5.5" width="18.4" height="13" rx="2.5" />
      <path d="M2.8 10h18.4M6.5 14.8h3.5" />
    </>
  ),
  phone: (
    <path d="M7.6 3.8c.6 0 1.1.4 1.3 1l.9 3a1.4 1.4 0 0 1-.4 1.4l-1.3 1.2a12 12 0 0 0 5.5 5.5l1.2-1.3a1.4 1.4 0 0 1 1.4-.4l3 .9c.6.2 1 .7 1 1.3v2.7a1.6 1.6 0 0 1-1.8 1.6C10.6 20 4 13.4 3.5 5.6a1.6 1.6 0 0 1 1.6-1.8h2.5Z" />
  ),
  chat: (
    <path d="M12 4.2c4.7 0 8.5 2.9 8.5 6.6 0 3.6-3.8 6.6-8.5 6.6-.7 0-1.4-.1-2-.2l-4 2.1.9-3.3c-2-1.2-3.4-3.1-3.4-5.2 0-3.7 3.8-6.6 8.5-6.6Z" />
  ),
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  heart: (
    <path d="M12 20s-7.5-4.4-7.5-9.4A4.1 4.1 0 0 1 12 8.2a4.1 4.1 0 0 1 7.5 2.4c0 5-7.5 9.4-7.5 9.4Z" />
  ),
  alert: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.8v4.8M12 16h.01" />
    </>
  ),
  // 대기 줄
  queue: (
    <>
      <circle cx="6" cy="8" r="2.4" />
      <circle cx="12" cy="8" r="2.4" />
      <circle cx="18" cy="8" r="2.4" />
      <path d="M3 18.5c0-2 1.4-3.4 3-3.4s3 1.4 3 3.4M9 18.5c0-2 1.4-3.4 3-3.4s3 1.4 3 3.4M15 18.5c0-2 1.4-3.4 3-3.4s3 1.4 3 3.4" />
    </>
  ),
};

export function Icon({
  name,
  className = "h-5 w-5",
}: {
  name: IconName;
  className?: string;
}) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {PATHS[name]}
    </svg>
  );
}

/** 아이콘을 연핑크 원 안에 넣은 형태. 카드 왼쪽/위에 붙인다. */
export function IconBadge({
  name,
  className = "",
}: {
  name: IconName;
  className?: string;
}) {
  return (
    <span
      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blush text-rose-deep ${className}`}
    >
      <Icon name={name} className="h-[22px] w-[22px]" />
    </span>
  );
}
