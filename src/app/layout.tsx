import type { Metadata } from "next";
import { cormorant, notoSansKr, notoSerifKr } from "@/lib/fonts";
import { fontSans } from "@/lib/style";
import { ReservationProvider } from "@/components/ReservationProvider";
import { LocalBusinessJsonLd } from "@/components/LocalBusinessJsonLd";
import { GoogleTagManager } from "@/components/GoogleTagManager";
import { GTM_ID, OG_IMAGE, SITE_DESCRIPTION, SITE_KEYWORDS, SITE_NAME, SITE_TITLE, SITE_URL } from "@/lib/seo";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: SITE_KEYWORDS,
  alternates: {
    canonical: "/",
    types: { "application/rss+xml": "/guide/rss.xml" },
  },
  icons: {
    icon: "/favicon-wb.png",
    apple: "/favicon-wb.png",
  },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [{ url: OG_IMAGE, width: 1376, height: 768, alt: SITE_NAME }],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [OG_IMAGE],
  },
  robots: {
    index: true,
    follow: true,
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    other: {
      "naver-site-verification":
        process.env.NEXT_PUBLIC_NAVER_SITE_VERIFICATION || "d714f906d1ed62c2d1468a07a7e41f032cf2126b",
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className={`${notoSansKr.variable} ${notoSerifKr.variable} ${cormorant.variable}`}>
      <body style={{ fontFamily: fontSans }}>
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        <GoogleTagManager />
        <LocalBusinessJsonLd />
        <ReservationProvider>{children}</ReservationProvider>
      </body>
    </html>
  );
}
