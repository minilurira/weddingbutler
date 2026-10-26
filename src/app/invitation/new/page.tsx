import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { InvitationEntry } from "@/components/invitation/InvitationEntry";

export const metadata: Metadata = {
  title: "모바일 청첩장 만들기",
  robots: { index: false, follow: false },
};

export default function NewInvitationPage() {
  return (
    <div style={{ width: "100%", overflowX: "hidden", background: "#F3E9EB" }}>
      <Header active="invitation" />
      <InvitationEntry />
      <Footer />
    </div>
  );
}
