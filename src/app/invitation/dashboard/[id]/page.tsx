import type { Metadata } from "next";
import { InvitationDashboard } from "@/components/invitation/InvitationDashboard";

export const metadata: Metadata = {
  title: "청첩장 대시보드",
  robots: { index: false, follow: false },
};

export default function DashboardPage({ params }: { params: { id: string } }) {
  return <InvitationDashboard id={params.id} />;
}
