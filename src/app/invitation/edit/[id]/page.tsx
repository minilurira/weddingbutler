import type { Metadata } from "next";
import { InvitationEditor } from "@/components/invitation/InvitationEditor";

export const metadata: Metadata = {
  title: "청첩장 고치기",
  robots: { index: false, follow: false },
};

export default function EditInvitationPage({ params }: { params: { id: string } }) {
  return <InvitationEditor id={params.id} />;
}
