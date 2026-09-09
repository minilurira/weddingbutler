import type { Metadata } from "next";
import { cormorant, notoSansKr, notoSerifKr } from "@/lib/fonts";
import { fontSans } from "@/lib/style";
import { ReservationProvider } from "@/components/ReservationProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "웨딩버틀러 | 축의대 대행 서비스",
  description:
    "전문 교육을 받은 웨딩버틀러가 축의금 접수부터 정산까지 책임집니다. 날짜 선택부터 결제까지 온라인에서 3분이면 끝납니다.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className={`${notoSansKr.variable} ${notoSerifKr.variable} ${cormorant.variable}`}>
      <body style={{ fontFamily: fontSans }}>
        <ReservationProvider>{children}</ReservationProvider>
      </body>
    </html>
  );
}
