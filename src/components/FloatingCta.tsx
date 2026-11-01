"use client";

import { usePathname } from "next/navigation";
import { useReservation } from "@/components/ReservationProvider";
import { trackKakaoChatClick } from "@/lib/analytics";

export const KAKAO_CHAT_URL = "https://pf.kakao.com/_AIhxnX/chat";

// 플로팅 버튼을 띄우지 않는 화면: 스페셜 예약 링크, 청첩장 편집기, 결제 완료 화면
const HIDDEN_PREFIXES = ["/s/", "/invitation/new", "/reservation/return"];

export function KakaoIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 3C6.5 3 2 6.6 2 11c0 2.8 1.9 5.3 4.7 6.7l-1 3.6c-.1.3.3.6.6.4l4.2-2.8c.5.1 1 .1 1.5.1 5.5 0 10-3.6 10-8S17.5 3 12 3z"
      />
    </svg>
  );
}

function CalendarIcon({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </svg>
  );
}

/** 스크롤해도 항상 보이는 예약문의·예약하기 버튼 (PC·모바일 모두 오른쪽 아래) */
export function FloatingCta() {
  const pathname = usePathname() ?? "";
  const { openModal } = useReservation();
  if (HIDDEN_PREFIXES.some((p) => pathname.startsWith(p))) return null;

  return (
    <div className="floating-cta" role="group" aria-label="예약 바로가기">
      <a
        href={KAKAO_CHAT_URL}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackKakaoChatClick("floating")}
        className="floating-cta-btn floating-cta-kakao"
      >
        <KakaoIcon />
        예약문의
      </a>
      <button type="button" onClick={() => openModal()} className="floating-cta-btn floating-cta-book">
        <CalendarIcon />
        예약하기
      </button>
    </div>
  );
}
