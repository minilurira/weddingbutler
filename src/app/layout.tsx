import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} — ${SITE.tagline}`,
    template: `%s | ${SITE.name}`,
  },
  description: SITE.description,
  keywords: [
    "축의대 대행",
    "축의금 접수 대행",
    "결혼식 접수대",
    "웨딩버틀러",
    "혼주 도우미",
    "축의금 관리",
  ],
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: SITE.url,
    siteName: SITE.name,
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.description,
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.description,
  },
  robots: { index: true, follow: true },
};

const FONT_CSS_URL =
  "https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css";

export const viewport: Viewport = {
  themeColor: "#fff7f9",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
        {/*
          Pretendard 를 CDN 에서 불러온다. next/font/google 을 쓰지 않는 이유는
          빌드 시점에 외부 폰트를 받아오면 네트워크가 제한된 환경에서 빌드가
          깨지기 때문이다.

          중요: <link rel="stylesheet"> 로 그냥 걸면 렌더 차단 자원이 되어,
          CDN 이 느리거나 막힌 환경에서 본문 텍스트가 통째로 안 보이는 시간이
          생긴다. 그래서 스크립트로 나중에 붙여 논블로킹으로 만든다.
          폰트가 오기 전까지는 시스템 한글 폰트로 즉시 읽을 수 있고,
          도착하면 자연스럽게 교체된다.
        */}
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="" />
        <link rel="preload" as="style" href={FONT_CSS_URL} />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var l=document.createElement("link");l.rel="stylesheet";l.href=${JSON.stringify(FONT_CSS_URL)};document.head.appendChild(l)})()`,
          }}
        />
        <noscript>
          <link rel="stylesheet" href={FONT_CSS_URL} />
        </noscript>

        {/*
          스크롤 리빌은 JS 가 살아 있을 때만 켠다. 이 클래스가 없으면
          globals.css 의 감추는 규칙 자체가 적용되지 않으므로, 스크립트가
          막힌 환경에서도 본문이 그대로 보인다. 깜빡임이 없도록 페인트 전에
          붙인다.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `document.documentElement.classList.add("js-reveal")`,
          }}
        />
      </head>
      <body className="min-h-dvh antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-ink focus:px-5 focus:py-3 focus:text-sm focus:text-cream"
        >
          본문으로 건너뛰기
        </a>
        <Header />
        <main id="main">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
