"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { NAV_LINKS, SITE } from "@/lib/site";
import { buttonClass } from "@/components/ui/Primitives";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  /*
   * 홈은 어두운 사진 히어로로 시작한다. 맨 위에 있을 때 헤더가 투명하므로
   * 글씨를 밝게 바꾸지 않으면 로고와 메뉴가 배경에 묻혀 안 보인다.
   * 스크롤해서 헤더에 배경이 깔리면 원래 색으로 돌아온다.
   */
  const onDarkHero = pathname === "/" && !scrolled;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);

    // 새로고침으로 이미 스크롤된 위치에서 시작하는 경우가 있어 한 번 재어둔다.
    // 이펙트 본문에서 곧바로 상태를 바꾸면 렌더가 연쇄되므로 다음 프레임에 미룬다.
    const frame = requestAnimationFrame(onScroll);
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  // 메뉴가 열린 동안 뒤 본문이 스크롤되지 않도록 잠근다.
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ease-[cubic-bezier(.22,1,.36,1)] ${
        scrolled
          ? "border-b border-line/80 bg-cream/95 backdrop-blur-xl backdrop-saturate-150"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <div
        className={`mx-auto flex w-full max-w-[1200px] items-center justify-between px-5 transition-all duration-500 sm:px-8 ${
          scrolled ? "h-16" : "h-20"
        }`}
      >
        <Link
          href="/"
          className="flex items-baseline gap-2 font-semibold tracking-tight"
          aria-label={`${SITE.name} 홈으로`}
        >
          <span
            className={`text-[17px] transition-colors ${
              onDarkHero ? "text-white" : "text-ink"
            }`}
          >
            {SITE.name}
          </span>
          <span
            className={`hidden text-[10px] uppercase tracking-[0.22em] transition-colors sm:inline ${
              onDarkHero ? "text-white/55" : "text-ink-mute"
            }`}
          >
            Wedding Butler
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => {
            const active = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative rounded-full px-4 py-2 text-sm transition-colors ${
                  onDarkHero
                    ? active
                      ? "text-white"
                      : "text-white/70 hover:text-white"
                    : active
                      ? "text-ink"
                      : "text-ink-soft hover:text-ink"
                }`}
              >
                {link.label}
                <span
                  aria-hidden
                  className={`absolute inset-x-4 -bottom-0.5 h-px origin-left bg-rose transition-transform duration-400 ease-[cubic-bezier(.22,1,.36,1)] ${
                    active ? "scale-x-100" : "scale-x-0"
                  }`}
                />
              </Link>
            );
          })}
          <Link href="/booking" className={buttonClass("primary", "sm", "ml-3")}>
            예약하기
          </Link>
        </nav>

        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-expanded={menuOpen}
          aria-label={menuOpen ? "메뉴 닫기" : "메뉴 열기"}
          className={`-mr-2 flex h-10 w-10 items-center justify-center rounded-full transition-colors md:hidden ${
            onDarkHero
              ? "text-white hover:bg-white/10"
              : "text-ink hover:bg-ink/[.05]"
          }`}
        >
          <span className="relative block h-3 w-5">
            <span
              className={`absolute left-0 block h-px w-5 bg-current transition-all duration-300 ${
                menuOpen ? "top-1.5 rotate-45" : "top-0"
              }`}
            />
            <span
              className={`absolute left-0 block h-px w-5 bg-current transition-all duration-300 ${
                menuOpen ? "top-1.5 -rotate-45" : "top-3"
              }`}
            />
          </span>
        </button>
      </div>

      {menuOpen && (
        <div className="animate-fade-up border-t border-line bg-cream/98 backdrop-blur-xl md:hidden">
            <nav className="flex flex-col gap-1 px-5 py-6">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-xl px-3 py-3 text-[15px] text-ink transition-colors hover:bg-ink/[.04]"
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/booking"
                onClick={() => setMenuOpen(false)}
                className={buttonClass("primary", "md", "mt-3 w-full")}
              >
                예약하기
              </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
