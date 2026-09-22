import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PRIVACY_HTML_2026_01 } from "@/lib/legal/privacy-content-2026-01";

export const metadata: Metadata = {
  title: "개인정보처리방침 (이전 버전 · 2026년 1월 1일 시행)",
  alternates: { canonical: "/privacy/2026-01" },
  robots: { index: false, follow: true },
};

export default function PrivacyArchivePage() {
  return (
    <div style={{ width: "100%", overflowX: "hidden", background: "#F3E9EB" }}>
      <Header />
      <div style={{ background: "#FFFFFF" }} dangerouslySetInnerHTML={{ __html: PRIVACY_HTML_2026_01 }} />
      <Footer />
    </div>
  );
}
