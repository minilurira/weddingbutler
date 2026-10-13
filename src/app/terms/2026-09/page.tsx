import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { TERMS_HTML_2026_09 } from "@/lib/legal/terms-content-2026-09";

export const metadata: Metadata = {
  title: "서비스 이용약관 (이전 버전 · 2026년 9월 21일 시행)",
  alternates: { canonical: "/terms/2026-09" },
  robots: { index: false, follow: true },
};

export default function TermsArchivePage() {
  return (
    <div style={{ width: "100%", overflowX: "hidden", background: "#F3E9EB" }}>
      <Header />
      <div style={{ background: "#FFFFFF" }} dangerouslySetInnerHTML={{ __html: TERMS_HTML_2026_09 }} />
      <Footer />
    </div>
  );
}
