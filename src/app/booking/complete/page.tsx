import type { Metadata } from "next";
import { Suspense } from "react";
import { CompleteView } from "@/components/booking/CompleteView";
import { Container, Section } from "@/components/ui/Primitives";

export const metadata: Metadata = {
  title: "예약 완료",
  robots: { index: false, follow: false },
};

export default function BookingCompletePage() {
  return (
    <Section className="pt-32 sm:pt-36 lg:pt-40">
      <Container className="max-w-[720px]">
        <Suspense
          fallback={
            <div className="rounded-[24px] border border-line bg-white/70 px-8 py-20 text-center">
              <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-line border-t-rose" />
            </div>
          }
        >
          <CompleteView />
        </Suspense>
      </Container>
    </Section>
  );
}
