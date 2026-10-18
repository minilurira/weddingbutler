import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { LookupView } from "@/components/lookup/LookupView";
import { fontDisplay, fontSerif } from "@/lib/style";

export const metadata: Metadata = {
  title: "예약 조회",
  description: "예약하신 휴대폰 번호로 웨딩버틀러 예약 내역을 확인하고 취소할 수 있습니다.",
  alternates: { canonical: "/reservation/lookup" },
  robots: { index: false, follow: false },
};

export default function LookupPage() {
  return (
    <div style={{ width: "100%", overflowX: "hidden", background: "#F3E9EB", minHeight: "100vh" }}>
      <Header active="lookup" />

      <section style={{ padding: "clamp(54px,9vw,90px) clamp(18px,5vw,24px) clamp(28px,5vw,44px)", textAlign: "center" }}>
        <p style={{ fontFamily: fontDisplay, fontSize: 14, letterSpacing: "0.4em", color: "#A9647E", margin: "0 0 16px" }}>RESERVATION</p>
        <h1 style={{ fontFamily: fontSerif, fontSize: "clamp(27px,6.2vw,40px)", fontWeight: 600, margin: "0 0 18px", letterSpacing: "-0.02em" }}>예약 조회</h1>
        <p style={{ fontSize: 16, lineHeight: 1.9, color: "#6B5A60", margin: 0 }}>예약하신 휴대폰 번호로 본인 확인 후 예약 내역을 보실 수 있어요.</p>
      </section>

      <LookupView />

      <Footer />
    </div>
  );
}
