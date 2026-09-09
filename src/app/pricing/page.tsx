import type { Metadata } from "next";
import { Calculator } from "@/components/pricing/Calculator";
import { PlanCards } from "@/components/pricing/PlanCards";
import { Accordion } from "@/components/ui/Accordion";
import { Reveal } from "@/components/ui/Reveal";
import {
  ButtonLink,
  Container,
  Eyebrow,
  Lead,
  Section,
  SectionTitle,
} from "@/components/ui/Primitives";
import { formatWon } from "@/lib/format";
import {
  DEPOSIT_RATE,
  EXTRA_BUTLER_FEE,
  EXTRA_GUEST_FEE,
  PLANS,
} from "@/lib/pricing";
import { FAQ_ITEMS } from "@/lib/content";

export const metadata: Metadata = {
  title: "요금제",
  description:
    "웨딩버틀러 축의대 대행 요금 안내. 스몰케어 39만원, 스탠다드 45만원, 프리미엄 양가 80만원부터. 모두 부가세 포함이며 예약금은 10%입니다.",
};

const INCLUDED = [
  "웨딩버틀러 인건비 및 교통비",
  "접수대 운영 물품 (필기구·정리함·잠금 보관함)",
  "축의금 접수·기록·정산",
  "방명록 안내 및 답례품 전달",
  "예식 전 사전 조율 상담",
  "정산 내역 전달",
];

const NOT_INCLUDED = [
  "접수대 및 의자 (예식장에서 제공하는 것을 사용합니다)",
  "답례품·식권 등 준비물 자체",
  "예식장 주차비 (별도 요청 시 실비 정산)",
  "예식 시간이 4시간을 크게 넘길 경우의 추가 운영비",
];

export default function PricingPage() {
  const depositPercent = Math.round(DEPOSIT_RATE * 100);

  return (
    <>
      <Section className="pt-32 sm:pt-40 lg:pt-44">
        <Container>
          <Reveal className="max-w-2xl">
            <Eyebrow>요금제</Eyebrow>
            <SectionTitle>
              하객 규모에 맞춰
              <br />
              세 가지로 나눴습니다.
            </SectionTitle>
            <Lead>
              표시된 금액은 모두 부가세 포함입니다. 숨은 비용은 없습니다.
              예약할 때는 총 금액의 {depositPercent}%만 결제하시고, 잔금은 예식
              당일 실제 하객 수를 확인한 뒤 정산합니다.
            </Lead>
          </Reveal>

          <div className="mt-14">
            <PlanCards />
          </div>
        </Container>
      </Section>

      {/* ── 계산기 ── */}
      <Section className="bg-cream-deep/50">
        <Container>
          <Reveal className="max-w-2xl">
            <Eyebrow>요금 계산기</Eyebrow>
            <SectionTitle>내 예식은 얼마일까요?</SectionTitle>
            <Lead>
              예상 하객 수를 넣으면 총액과 지금 결제할 예약금이 바로 나옵니다.
            </Lead>
          </Reveal>

          <Reveal delay={0.08} className="mt-12">
            <Calculator />
          </Reveal>
        </Container>
      </Section>

      {/* ── 추가 요금 규칙 ── */}
      <Section>
        <Container>
          <div className="grid gap-14 lg:grid-cols-[.8fr_1.2fr] lg:gap-20">
            <Reveal>
              <Eyebrow>추가 요금</Eyebrow>
              <SectionTitle>추가되는 항목은 두 가지뿐입니다.</SectionTitle>
              <Lead>
                그 외에 예약 후에 붙는 비용은 없습니다. 예상보다 하객이 적게
                오셨다면 그만큼 잔금에서 차감됩니다.
              </Lead>
            </Reveal>

            <Reveal delay={0.08}>
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="rounded-[20px] border border-line bg-white/70 p-7">
                  <p className="text-[13px] text-ink-mute">포함 인원 초과 시</p>
                  <p className="mt-2 text-[26px] font-semibold tracking-tight text-ink">
                    {formatWon(EXTRA_GUEST_FEE)}
                  </p>
                  <p className="mt-1 text-[13px] text-ink-mute">하객 1명당</p>
                  <ul className="mt-5 flex flex-col gap-2 border-t border-line pt-5 text-[13.5px] text-ink-soft">
                    {PLANS.map((plan) => (
                      <li key={plan.id} className="flex justify-between gap-3">
                        <span>{plan.name}</span>
                        <span className="tabular text-ink-mute">
                          {plan.includedGuests}명 초과부터
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-[20px] border border-line bg-white/70 p-7">
                  <p className="text-[13px] text-ink-mute">버틀러 추가 배정</p>
                  <p className="mt-2 text-[26px] font-semibold tracking-tight text-ink">
                    {formatWon(EXTRA_BUTLER_FEE)}
                  </p>
                  <p className="mt-1 text-[13px] text-ink-mute">1명당</p>
                  <p className="mt-5 border-t border-line pt-5 text-[13.5px] leading-relaxed text-ink-soft">
                    스탠다드와 프리미엄 양가 요금제에서 선택할 수 있습니다.
                    접수대가 두 곳 이상이거나 하객이 특정 시간에 몰릴 것으로
                    예상될 때 권해드립니다.
                  </p>
                </div>
              </div>

              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <div className="rounded-[20px] border border-line bg-white/70 p-7">
                  <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-rose-deep">
                    포함됩니다
                  </p>
                  <ul className="mt-4 flex flex-col gap-2.5 text-[13.5px] leading-relaxed text-ink-soft">
                    {INCLUDED.map((item) => (
                      <li key={item} className="flex gap-2.5">
                        <span aria-hidden className="mt-2 h-1 w-1 shrink-0 rounded-full bg-rose" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-[20px] border border-line bg-white/70 p-7">
                  <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-ink-mute">
                    포함되지 않습니다
                  </p>
                  <ul className="mt-4 flex flex-col gap-2.5 text-[13.5px] leading-relaxed text-ink-soft">
                    {NOT_INCLUDED.map((item) => (
                      <li key={item} className="flex gap-2.5">
                        <span aria-hidden className="mt-2 h-1 w-1 shrink-0 rounded-full bg-line" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Reveal>
          </div>
        </Container>
      </Section>

      {/* ── FAQ ── */}
      <Section className="bg-cream-deep/50 pb-24 sm:pb-32">
        <Container>
          <Reveal className="max-w-2xl">
            <Eyebrow>자주 묻는 질문</Eyebrow>
            <SectionTitle>요금에 대해 많이 묻는 것들.</SectionTitle>
          </Reveal>

          <Reveal delay={0.08} className="mt-12">
            <Accordion items={FAQ_ITEMS.slice(3, 7)} />
          </Reveal>

          <Reveal delay={0.12}>
            <div className="mt-12 flex flex-wrap gap-3">
              <ButtonLink href="/booking" size="lg">
                예약 가능한 날짜 보기
              </ButtonLink>
              <ButtonLink href="/qna" variant="outline" size="lg">
                따로 문의하기
              </ButtonLink>
            </div>
          </Reveal>
        </Container>
      </Section>
    </>
  );
}
