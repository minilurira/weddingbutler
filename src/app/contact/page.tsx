import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ContactSection } from "@/components/contact/ContactSection";
import { fontDisplay, fontSerif } from "@/lib/style";

export const metadata: Metadata = {
  title: "문의하기 | 웨딩버틀러",
  description: "궁금한 점을 남겨주시면 영업일 기준 24시간 내 답변드립니다.",
};

export default function ContactPage() {
  return (
    <div style={{ width: "100%", overflowX: "hidden", background: "#F3E9EB", minHeight: "100vh" }}>
      <Header active="contact" />

      <section style={{ padding: "90px 24px 60px", textAlign: "center" }}>
        <p style={{ fontFamily: fontDisplay, fontSize: 14, letterSpacing: "0.4em", color: "#A9647E", margin: "0 0 16px" }}>CONTACT</p>
        <h1 style={{ fontFamily: fontSerif, fontSize: 40, fontWeight: 600, margin: "0 0 18px", letterSpacing: "-0.02em" }}>문의하기</h1>
        <p style={{ fontSize: 16, lineHeight: 1.9, color: "#6B5A60", margin: 0 }}>궁금한 점을 남겨주시면 영업일 기준 24시간 내 답변드립니다.</p>
      </section>

      <ContactSection />

      <Footer />
    </div>
  );
}
