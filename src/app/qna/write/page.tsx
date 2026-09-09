import type { Metadata } from "next";
import { WriteForm } from "@/components/qna/WriteForm";
import { QnaNotConfigured } from "@/components/qna/EmptyState";
import { isDatabaseConfigured } from "@/lib/supabase";
import { Container, Eyebrow, Lead, Section, SectionTitle } from "@/components/ui/Primitives";

export const metadata: Metadata = {
  title: "문의 남기기",
  robots: { index: false, follow: true },
};

export const dynamic = "force-dynamic";

export default function QnaWritePage() {
  return (
    <Section className="pt-32 pb-24 sm:pt-40 sm:pb-32">
      <Container className="max-w-[760px]">
        <Eyebrow>문의 남기기</Eyebrow>
        <SectionTitle>무엇이든 물어보세요.</SectionTitle>
        <Lead>
          영업일 기준 1일 이내에 답변드립니다. 예식 날짜가 정해지셨다면 함께
          적어주시면 가능 여부까지 확인해 드리겠습니다.
        </Lead>

        <div className="mt-12">
          {isDatabaseConfigured() ? <WriteForm /> : <QnaNotConfigured />}
        </div>
      </Container>
    </Section>
  );
}
