import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { INVITATION_TERMS_HTML } from "@/lib/legal/invitation-terms-content";

export const metadata: Metadata = {
  title: "모바일 청첩장 이용약관",
  description: "모바일 청첩장을 만들기 전에 확인할 주의사항과 이용약관입니다.",
  alternates: { canonical: "/terms/invitation" },
};

export default function InvitationTermsPage() {
  return (
    <div style={{ width: "100%", overflowX: "hidden", background: "#F3E9EB" }}>
      <Header />
      <div style={{ background: "#FFFFFF" }} dangerouslySetInnerHTML={{ __html: INVITATION_TERMS_HTML }} />
      <Footer />
    </div>
  );
}
