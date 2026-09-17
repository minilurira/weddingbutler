import type { Metadata } from "next";
import { cormorant, notoSansKr, notoSerifKr } from "@/lib/fonts";
import { fontSans } from "@/lib/style";
import { ReservationProvider } from "@/components/ReservationProvider";
import { LocalBusinessJsonLd } from "@/components/LocalBusinessJsonLd";
import { OG_IMAGE, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/seo";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} | 축의대 대행 서비스`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: ["웨딩버틀러", "축의대", "축의대 대행", "축의금 접수", "결혼식 축의대", "웨딩 하객 접수"],
  alternates: {
    canonical: "/",
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
    title: `${SITE_NAME} | 축의대 대행 서비스`,
    description: SITE_DESCRIPTION,
    images: [{ url: OG_IMAGE, width: 1376, height: 768, alt: SITE_NAME }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} | 축의대 대행 서비스`,
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
        process.env.NEXT_PUBLIC_NAVER_SITE_VERIFICATION || "fa02c0472da1b17139e2f6724fe3282517787948",
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
        <LocalBusinessJsonLd />
        <ReservationProvider>{children}</ReservationProvider>
      </body>
    </html>
  );
}
