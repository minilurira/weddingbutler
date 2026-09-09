import Link from "next/link";
import { Hero } from "@/components/home/Hero";
import { SmartImage } from "@/components/ui/SmartImage";
import { Accordion } from "@/components/ui/Accordion";
import { PlanCards } from "@/components/pricing/PlanCards";
import { Icon, IconBadge } from "@/components/ui/Icon";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import {
  ButtonLink,
  Container,
  IconCard,
  Section,
  SectionHead,
} from "@/components/ui/Primitives";
import {
  FAQ_ITEMS,
  PAIN_POINTS,
  PROCESS_STEPS,
  SERVICE_ITEMS,
  TRUST_POINTS,
} from "@/lib/content";
import { IMAGES } from "@/lib/images";
import { MIN_LEAD_DAYS } from "@/lib/availability";
import { BUSINESS } from "@/lib/site";

export default function HomePage() {
  return (
    <>
      <Hero />

      {/* ── 이런 고민 있으시죠 ──────────────────────────────── */}
      <Section id="why">
        <Container>
          <Reveal>
            <SectionHead
              label="Why Wedding Butler"
              title={
                <>
                  축의대는 생각보다
                  <br />
                  부담이 큰 자리입니다.
                </>
              }
              lead="하객으로 오신 분께 세 시간짜리 근무를 부탁하는 일입니다. 부탁하는 쪽도, 받는 쪽도 편치 않습니다."
            />
          </Reveal>

          <RevealGroup className="mt-14 grid gap-4 md:grid-cols-3">
            {PAIN_POINTS.map((point) => (
              <RevealItem key={point.title} className="h-full">
                <IconCard>
                  <IconBadge name={point.icon} />
                  <h3 className="mt-5 text-[17px] font-semibold tracking-tight text-ink">
                    {point.title}
                  </h3>
                  <p className="mt-3 text-[14.5px] leading-[1.85] text-ink-soft">
                    {point.body}
                  </p>
                </IconCard>
              </RevealItem>
            ))}
          </RevealGroup>
        </Container>
      </Section>

      {/* ── 하는 일 ────────────────────────────────────────── */}
      <Section className="bg-cream-deep/60">
        <Container>
          <Reveal>
            <SectionHead
              label="Our Service"
              title={
                <>
                  접수대에서 벌어지는
                  <br />
                  모든 일을 맡습니다.
                </>
              }
              lead="봉투를 받는 것만이 아닙니다. 줄을 관리하고, 기록을 남기고, 현금을 안전하게 옮기고, 마지막에 정확히 넘겨드리는 것까지가 하나의 일입니다."
            />
          </Reveal>

          <RevealGroup className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {SERVICE_ITEMS.map((item) => (
              <RevealItem key={item.number} className="h-full">
                <IconCard>
                  <div className="flex items-center gap-4">
                    <IconBadge name={item.icon} />
                    <span className="font-mono text-[11px] tracking-[0.16em] text-rose-deep">
                      {item.number}
                    </span>
                  </div>
                  <h3 className="mt-5 text-[16.5px] font-semibold tracking-tight text-ink">
                    {item.title}
                  </h3>
                  <p className="mt-2.5 text-[14px] leading-[1.85] text-ink-soft">
                    {item.body}
                  </p>
                </IconCard>
              </RevealItem>
            ))}
          </RevealGroup>

          <Reveal delay={0.1}>
            <div className="mt-12 text-center">
              <ButtonLink href="/service" variant="outline" size="lg">
                예식 당일 진행 순서 자세히 보기
              </ButtonLink>
            </div>
          </Reveal>
        </Container>
      </Section>

      {/* ── 일하는 방식(약속) ──────────────────────────────── */}
      <Section className="bg-plum">
        <Container>
          <Reveal>
            <SectionHead
              tone="dark"
              label="Our Promise"
              title={
                <>
                  현금을 다루는 일이니까,
                  <br />
                  방식이 분명해야 합니다.
                </>
              }
              lead="저희는 아직 쌓아둔 사례가 없습니다. 그래서 실적 대신 일하는 방식을 먼저 공개합니다."
            />
          </Reveal>

          <RevealGroup className="mt-14 grid gap-4 sm:grid-cols-2">
            {TRUST_POINTS.map((point) => (
              <RevealItem key={point.title} className="h-full">
                <div className="h-full rounded-[18px] border border-cream/12 bg-cream/[.05] p-6 sm:p-7">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-rose/20 text-rose">
                    <Icon name={point.icon} className="h-[22px] w-[22px]" />
                  </span>
                  <h3 className="mt-5 text-[16.5px] font-semibold tracking-tight text-cream">
                    {point.title}
                  </h3>
                  <p className="mt-2.5 text-[14px] leading-[1.85] text-cream/65">
                    {point.body}
                  </p>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>

          <Reveal delay={0.12}>
            <div className="mt-12 overflow-hidden rounded-[20px]">
              <SmartImage
                image={IMAGES.reception}
                width={1400}
                sizes="(max-width: 1024px) 100vw, 1100px"
                className="aspect-[21/9]"
              />
            </div>
          </Reveal>
        </Container>
      </Section>

      {/* ── 진행 과정 ──────────────────────────────────────── */}
      <Section>
        <Container>
          <Reveal>
            <SectionHead
              label="Process"
              title="예약부터 정산까지 다섯 단계."
              lead="예약은 온라인에서 3분이면 끝납니다. 나머지는 저희가 먼저 연락드립니다."
            />
          </Reveal>

          <RevealGroup className="relative mx-auto mt-14 max-w-3xl">
            {/* 단계를 잇는 세로선 */}
            <div
              aria-hidden
              className="absolute bottom-14 left-[27px] top-8 hidden w-px bg-line sm:block"
            />
            {PROCESS_STEPS.map((step) => (
              <RevealItem key={step.step}>
                <div className="relative flex gap-5 pb-4 sm:gap-7">
                  <span className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-line bg-white font-mono text-[13px] font-semibold text-rose-deep shadow-[0_2px_10px_rgba(59,41,50,.05)]">
                    {step.step}
                  </span>
                  <div className="flex-1 rounded-[18px] border border-line bg-white p-6 shadow-[0_2px_16px_rgba(59,41,50,.045)]">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                      <h3 className="text-[17px] font-semibold tracking-tight text-ink">
                        {step.title}
                      </h3>
                      <span className="rounded-full bg-blush px-2.5 py-1 text-[11.5px] font-medium text-rose-deep">
                        {step.detail}
                      </span>
                    </div>
                    <p className="mt-2.5 text-[14.5px] leading-[1.85] text-ink-soft">
                      {step.body}
                    </p>
                  </div>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>

          <Reveal delay={0.1}>
            <p className="mt-8 text-center text-[13px] text-ink-mute">
              예약은 예식일로부터 최소 {MIN_LEAD_DAYS}일 전까지 가능합니다 ·
              주말(토·일) 11시–19시 예식만 받습니다
            </p>
          </Reveal>
        </Container>
      </Section>

      {/* ── 요금제 ─────────────────────────────────────────── */}
      <Section id="pricing" className="bg-cream-deep/60">
        <Container>
          <Reveal>
            <SectionHead
              label="Pricing"
              title="하객 규모에 맞춰 세 가지."
              lead="모두 부가세 포함 금액입니다. 예약 시 총 금액의 10%만 결제하시고, 잔금은 예식 당일 정산합니다."
            />
          </Reveal>

          <div className="mt-14">
            <PlanCards />
          </div>

          <Reveal delay={0.1}>
            <p className="mt-9 text-center text-[13.5px] text-ink-mute">
              하객 수를 넣으면 정확한 금액이 계산됩니다 —{" "}
              <Link
                href="/pricing"
                className="font-medium text-rose-deep underline decoration-rose decoration-2 underline-offset-4 transition-colors hover:text-ink"
              >
                요금 계산기 열기
              </Link>
            </p>
          </Reveal>
        </Container>
      </Section>

      {/* ── FAQ ────────────────────────────────────────────── */}
      <Section>
        <Container>
          <Reveal>
            <SectionHead
              label="FAQ"
              title="궁금한 점이 있으신가요?"
              lead="여기에 없는 질문은 문의 게시판에 남겨 주세요. 영업일 기준 1일 이내에 답변드립니다."
            />
          </Reveal>

          <Reveal delay={0.08} className="mx-auto mt-14 max-w-3xl">
            <Accordion items={FAQ_ITEMS} />
          </Reveal>

          <Reveal delay={0.12}>
            <div className="mt-12 text-center">
              <ButtonLink href="/qna" variant="outline" size="lg">
                문의 게시판 가기
              </ButtonLink>
            </div>
          </Reveal>
        </Container>
      </Section>

      {/* ── 마무리 CTA ─────────────────────────────────────── */}
      <Section className="bg-cream-deep/60 pb-24 sm:pb-32">
        <Container>
          <Reveal>
            <div className="relative overflow-hidden rounded-[28px] bg-plum px-7 py-16 text-center sm:px-14 sm:py-20">
              <div
                aria-hidden
                className="pointer-events-none absolute -top-28 left-1/2 h-72 w-[560px] -translate-x-1/2 rounded-full opacity-60 blur-3xl"
                style={{
                  background:
                    "radial-gradient(circle, rgba(237,165,183,.45) 0%, rgba(237,165,183,0) 70%)",
                }}
              />
              <div className="relative">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-rose">
                  Book Now
                </p>
                <h2 className="mt-5 text-[clamp(1.6rem,4vw,2.5rem)] font-semibold text-cream">
                  날짜가 정해지셨다면,
                  <br />
                  지금 자리를 잡아두세요.
                </h2>
                <p className="mx-auto mt-5 max-w-[40ch] text-[15px] leading-[1.85] text-cream/70">
                  주말 예식은 일정이 빠르게 찹니다. 예약금 결제까지 3분이면
                  끝납니다.
                </p>
                <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6">
                  <ButtonLink
                    href="/booking"
                    size="lg"
                    className="w-full sm:w-auto sm:min-w-[13rem]"
                  >
                    예약 가능한 날짜 보기
                  </ButtonLink>
                  <a
                    href={BUSINESS.phoneHref}
                    className="inline-flex items-center gap-2 text-[14.5px] font-medium text-cream/80 underline decoration-cream/30 underline-offset-4 transition-colors hover:text-cream"
                  >
                    <Icon name="phone" className="h-4 w-4" />
                    전화 문의 {BUSINESS.phone}
                  </a>
                </div>
              </div>
            </div>
          </Reveal>
        </Container>
      </Section>
    </>
  );
}
