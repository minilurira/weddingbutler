"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { BUSINESS } from "@/lib/site";

/**
 * 화면 오른쪽 아래에 붙어 다니는 문의 버튼.
 *
 * 스크롤을 어디까지 내렸든 바로 연락할 수 있어야 한다. 다만 첫 화면에는
 * 이미 큰 예약 버튼이 있으므로, 한 화면 넘게 내려간 뒤에 나타나게 해서
 * 히어로의 버튼을 가리지 않도록 한다.
 *
 * 예약 진행 중과 관리자 화면에서는 방해가 되므로 아예 띄우지 않는다.
 */
export function FloatingContact() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 520);

    // 새로고침으로 이미 내려간 위치에서 시작할 수 있으니 한 번 재어둔다.
    // 이펙트 본문에서 곧바로 상태를 바꾸면 렌더가 연쇄되므로 다음 프레임에 미룬다.
    const frame = requestAnimationFrame(onScroll);
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  if (pathname.startsWith("/booking") || pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <div
      className={`fixed bottom-5 right-5 z-40 flex flex-col items-end gap-2.5 transition-all duration-400 ease-[cubic-bezier(.22,1,.36,1)] sm:bottom-7 sm:right-7 ${
        visible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-3 opacity-0"
      }`}
      aria-hidden={!visible}
    >
      {BUSINESS.kakaoChannel && (
        <a
          href={BUSINESS.kakaoChannel}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="카카오톡으로 문의하기"
          tabIndex={visible ? 0 : -1}
          /* 카카오 노란색은 브랜드 규정색이라 그대로 쓴다 */
          className="flex h-13 w-13 items-center justify-center rounded-full bg-[#fee500] text-[#3c1e1e] shadow-[0_6px_20px_rgba(59,41,50,.18)] transition-transform duration-300 ease-[cubic-bezier(.22,1,.36,1)] hover:-translate-y-0.5"
        >
          <Icon name="chat" className="h-6 w-6" />
        </a>
      )}

      <a
        href={BUSINESS.phoneHref}
        aria-label={`전화로 문의하기 ${BUSINESS.phone}`}
        tabIndex={visible ? 0 : -1}
        className="flex h-13 w-13 items-center justify-center rounded-full bg-white text-rose-deep shadow-[0_6px_20px_rgba(59,41,50,.16)] ring-1 ring-line transition-transform duration-300 ease-[cubic-bezier(.22,1,.36,1)] hover:-translate-y-0.5"
      >
        <Icon name="phone" className="h-[22px] w-[22px]" />
      </a>

      <Link
        href="/booking"
        tabIndex={visible ? 0 : -1}
        className="flex h-13 items-center gap-2 rounded-full bg-rose-deep pl-5 pr-6 text-[14px] font-medium text-white shadow-[0_6px_22px_rgba(176,84,108,.34)] transition-transform duration-300 ease-[cubic-bezier(.22,1,.36,1)] hover:-translate-y-0.5"
      >
        <Icon name="calendar" className="h-[18px] w-[18px]" />
        예약하기
      </Link>
    </div>
  );
}
