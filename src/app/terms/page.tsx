import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { TERMS_HTML } from "@/lib/legal/terms-content";

export const metadata: Metadata = {
  title: "서비스 이용약관",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <div style={{ width: "100%", overflowX: "hidden", background: "#F3E9EB" }}>
      <Header />
      <div style={{ background: "#FFFFFF" }} dangerouslySetInnerHTML={{ __html: TERMS_HTML }} />
      <Footer />
    </div>
  );
}
