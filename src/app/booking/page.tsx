import type { Metadata } from "next";
import { Suspense } from "react";
import { BookingFlow } from "@/components/booking/BookingFlow";
import { Container, Eyebrow, Section } from "@/components/ui/Primitives";
import { MIN_LEAD_DAYS } from "@/lib/availability";

export const metadata: Metadata = {
  title: "예약하기",
  description:
    "웨딩버틀러 축의대 대행 온라인 예약. 주말 11시–19시 예식, 예약금 10% 결제로 시간대가 확정됩니다.",
  robots: { index: false, follow: true },
};

export default function BookingPage() {
  return (
    <Section className="pt-32 sm:pt-36 lg:pt-40">
      <Container>
        <div className="max-w-2xl">
          <Eyebrow>온라인 예약</Eyebrow>
          <h1 className="mt-4 text-[clamp(1.75rem,4vw,2.5rem)] font-semibold tracking-tight text-ink">
            예약은 3분이면 끝납니다.
          </h1>
          <p className="mt-4 text-[15px] leading-[1.85] text-ink-soft">
            주말(토·일) 11시–19시 예식만 받고 있으며, 예식일 기준{" "}
            {MIN_LEAD_DAYS}일 전까지 예약하실 수 있습니다. 예약금은 총 금액의
            10%이며 잔금은 예식 당일 정산합니다.
          </p>
        </div>

        <div className="mt-14">
          {/* useSearchParams 를 쓰는 흐름이라 Suspense 경계가 필요하다. */}
          <Suspense fallback={<BookingSkeleton />}>
            <BookingFlow />
          </Suspense>
        </div>
      </Container>
    </Section>
  );
}

function BookingSkeleton() {
  return (
    <div className="grid gap-10 lg:grid-cols-[1.35fr_.65fr]">
      <div className="animate-pulse">
        <div className="h-1 rounded-full bg-line" />
        <div className="mt-10 h-6 w-2/3 rounded bg-line" />
        <div className="mt-8 flex flex-col gap-2.5">
          <div className="h-24 rounded-2xl bg-line/60" />
          <div className="h-24 rounded-2xl bg-line/60" />
          <div className="h-24 rounded-2xl bg-line/60" />
        </div>
      </div>
      <div className="h-72 animate-pulse rounded-[20px] bg-line/60" />
    </div>
  );
}
