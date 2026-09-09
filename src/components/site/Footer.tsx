import Link from "next/link";
import { BUSINESS, FOOTER_LINKS, NAV_LINKS, SITE } from "@/lib/site";
import { Container } from "@/components/ui/Primitives";

export function Footer() {
  return (
    <footer className="border-t border-line bg-cream-deep/60">
      <Container className="py-14 sm:py-16">
        <div className="flex flex-col gap-10 md:flex-row md:justify-between">
          <div className="max-w-sm">
            <p className="text-[17px] font-semibold tracking-tight text-ink">
              {SITE.name}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-ink-soft">
              결혼식 축의대 대행 서비스.
              <br />
              접수부터 정산까지, 두 분은 예식에만 집중하세요.
            </p>
            <a
              href={BUSINESS.phoneHref}
              className="mt-5 inline-block text-[15px] font-semibold tracking-tight text-ink transition-colors hover:text-rose-deep"
            >
              {BUSINESS.phone}
            </a>
            <p className="mt-1 text-[13px] text-ink-mute">{BUSINESS.hours}</p>
          </div>

          <div className="flex gap-12 sm:gap-20">
            <nav className="flex flex-col gap-2.5">
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-mute">
                서비스
              </p>
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-ink-soft transition-colors hover:text-ink"
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/booking"
                className="text-sm text-ink-soft transition-colors hover:text-ink"
              >
                예약하기
              </Link>
            </nav>

            <nav className="flex flex-col gap-2.5">
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-mute">
                약관
              </p>
              {FOOTER_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-ink-soft transition-colors hover:text-ink"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        <div className="mt-12 border-t border-line pt-8">
          <dl className="flex flex-wrap gap-x-6 gap-y-1.5 text-[12px] leading-relaxed text-ink-mute">
            <div className="flex gap-1.5">
              <dt>상호</dt>
              <dd className="text-ink-soft">{BUSINESS.companyName}</dd>
            </div>
            <div className="flex gap-1.5">
              <dt>대표</dt>
              <dd className="text-ink-soft">{BUSINESS.ceo}</dd>
            </div>
            <div className="flex gap-1.5">
              <dt>사업자등록번호</dt>
              <dd className="text-ink-soft">{BUSINESS.registrationNumber}</dd>
            </div>
            <div className="flex gap-1.5">
              <dt>통신판매업신고</dt>
              <dd className="text-ink-soft">{BUSINESS.mailOrderNumber}</dd>
            </div>
            <div className="flex gap-1.5">
              <dt>주소</dt>
              <dd className="text-ink-soft">{BUSINESS.address}</dd>
            </div>
            <div className="flex gap-1.5">
              <dt>이메일</dt>
              <dd className="text-ink-soft">{BUSINESS.email}</dd>
            </div>
          </dl>

          {BUSINESS.isPlaceholder && (
            <p className="mt-4 rounded-lg bg-[#a8392f]/[.07] px-3 py-2 text-[12px] text-[#a8392f]">
              사업자 정보가 아직 자리표시자입니다. 실제 값으로 교체해 주세요
              (<code className="font-mono">src/lib/site.ts</code>).
            </p>
          )}

          <p className="mt-6 text-[12px] text-ink-mute">
            © {new Date().getFullYear()} {SITE.name}. All rights reserved.
          </p>
        </div>
      </Container>
    </footer>
  );
}
