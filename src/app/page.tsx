import Link from "next/link";
import { Hero } from "@/components/home/Hero";
import { SmartImage } from "@/components/ui/SmartImage";
import { Accordion } from "@/components/ui/Accordion";
import { PlanCards } from "@/components/pricing/PlanCards";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import {
  ButtonLink,
  Container,
  Eyebrow,
  Lead,
  Section,
  SectionTitle,
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

export default function HomePage() {
  return (
    <>
      <Hero />

      {/* ── 왜 필요한가 ─────────────────────────────────── */}
      <Section id="why">
        <Container>
          <Reveal>
            <Eyebrow>왜 대행이 필요할까요</Eyebrow>
            <SectionTitle>
              축의대는 생각보다
              <br />
              부담이 큰 자리입니다.
            </SectionTitle>
            <Lead>
              하객으로 오신 분께 세 시간짜리 근무를 부탁하는 일입니다. 부탁하는
              쪽도, 받는 쪽도 편치 않습니다.
            </Lead>
          </Reveal>

          <RevealGroup className="mt-14 grid gap-5 md:grid-cols-3">
            {PAIN_POINTS.map((point, index) => (
              <RevealItem key={point.title}>
                <div className="h-full rounded-[20px] border border-line bg-white/60 p-7">
                  <span className="font-mono text-[11px] tracking-[0.14em] text-champagne-deep">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-4 text-[17px] font-semibold tracking-tight text-ink">
                    {point.title}
                  </h3>
                  <p className="mt-3 text-[14.5px] leading-[1.8] text-ink-soft">
                    {point.body}
                  </p>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
        </Container>
      </Section>

      {/* ── 무엇을 하나 ─────────────────────────────────── */}
      <Section className="bg-ivory-deep/50">
        <Container>
          <div className="grid gap-14 lg:grid-cols-[.85fr_1.15fr] lg:gap-20">
            <Reveal>
              <Eyebrow>서비스 범위</Eyebrow>
              <SectionTitle>
                접수대에서 벌어지는
                <br />
                모든 일을 맡습니다.
              </SectionTitle>
              <Lead>
                봉투를 받는 것만이 아닙니다. 줄을 관리하고, 기록을 남기고,
                현금을 안전하게 옮기고, 마지막에 정확히 넘겨드리는 것까지가
                하나의 일입니다.
              </Lead>
              <div className="mt-9">
                <ButtonLink href="/service" variant="outline">
                  당일 진행 순서 자세히 보기
                </ButtonLink>
              </div>
            </Reveal>

            <RevealGroup className="grid gap-x-8 gap-y-9 sm:grid-cols-2">
              {SERVICE_ITEMS.map((item) => (
                <RevealItem key={item.number}>
                  <div className="border-t border-line pt-5">
                    <span className="font-mono text-[11px] tracking-[0.14em] text-champagne-deep">
                      {item.number}
                    </span>
                    <h3 className="mt-2.5 text-[16px] font-semibold tracking-tight text-ink">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-[14px] leading-[1.8] text-ink-soft">
                      {item.body}
                    </p>
                  </div>
                </RevealItem>
              ))}
            </RevealGroup>
          </div>
        </Container>
      </Section>

      {/* ── 진행 과정 ───────────────────────────────────── */}
      <Section>
        <Container>
          <Reveal className="max-w-2xl">
            <Eyebrow>진행 과정</Eyebrow>
            <SectionTitle>예약부터 정산까지 네 단계.</SectionTitle>
            <Lead>
              예약은 온라인에서 3분이면 끝납니다. 나머지는 저희가 먼저
              연락드립니다.
            </Lead>
          </Reveal>

          <RevealGroup className="mt-14 grid gap-px overflow-hidden rounded-[20px] border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
            {PROCESS_STEPS.map((step) => (
              <RevealItem key={step.step} className="h-full">
                <div className="flex h-full flex-col bg-ivory p-7">
                  <span className="font-mono text-[11px] tracking-[0.14em] text-champagne-deep">
                    {step.step}
                  </span>
                  <h3 className="mt-4 text-[17px] font-semibold tracking-tight text-ink">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-[14px] leading-[1.8] text-ink-soft">
                    {step.body}
                  </p>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>

          <Reveal delay={0.1}>
            <p className="mt-7 text-[13px] text-ink-mute">
              예약은 예식일로부터 최소 {MIN_LEAD_DAYS}일 전까지 가능합니다.
              주말(토·일) 11시–19시 예식만 받습니다.
            </p>
          </Reveal>
        </Container>
      </Section>

      {/* ── 안심 요소 ───────────────────────────────────── */}
      <Section className="bg-ink text-ivory">
        <Container>
          <div className="grid gap-14 lg:grid-cols-2 lg:gap-20">
            <Reveal>
              <p className="flex items-center gap-2.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-champagne">
                <span aria-hidden className="h-px w-6 bg-champagne/60" />
                맡기실 때 가장 걱정되는 것
              </p>
              <h2 className="mt-4 text-[clamp(1.75rem,4vw,2.75rem)] font-semibold text-ivory">
                현금을 다루는 일이니까,
                <br />
                방식이 분명해야 합니다.
              </h2>
              <p className="mt-5 max-w-[44ch] text-[15px] leading-[1.85] text-ivory/70">
                저희는 아직 쌓아둔 사례가 없습니다. 그래서 실적 대신 일하는
                방식을 먼저 공개합니다.
              </p>

              <div className="mt-10 overflow-hidden rounded-[20px]">
                <SmartImage
                  image={IMAGES.reception}
                  width={900}
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="aspect-[16/10]"
                />
              </div>
            </Reveal>

            <RevealGroup className="flex flex-col divide-y divide-ivory/12 border-t border-ivory/12">
              {TRUST_POINTS.map((point) => (
                <RevealItem key={point.title}>
                  <div className="py-7">
                    <h3 className="text-[17px] font-semibold tracking-tight text-ivory">
                      {point.title}
                    </h3>
                    <p className="mt-2.5 text-[14.5px] leading-[1.8] text-ivory/65">
                      {point.body}
                    </p>
                  </div>
                </RevealItem>
              ))}
            </RevealGroup>
          </div>
        </Container>
      </Section>

      {/* ── 요금제 ──────────────────────────────────────── */}
      <Section id="pricing">
        <Container>
          <Reveal className="max-w-2xl">
            <Eyebrow>요금제</Eyebrow>
            <SectionTitle>하객 규모에 맞춰 세 가지.</SectionTitle>
            <Lead>
              모두 부가세 포함 금액입니다. 예약 시 총 금액의 10%만 결제하시고,
              잔금은 예식 당일 정산합니다.
            </Lead>
          </Reveal>

          <div className="mt-14">
            <PlanCards />
          </div>

          <Reveal delay={0.1}>
            <p className="mt-8 text-center text-[13px] text-ink-mute">
              하객 수를 넣으면 정확한 금액이 계산됩니다 —{" "}
              <Link
                href="/pricing"
                className="font-medium text-ink underline decoration-champagne decoration-2 underline-offset-4 transition-colors hover:text-champagne-deep"
              >
                요금 계산기 열기
              </Link>
            </p>
          </Reveal>
        </Container>
      </Section>

      {/* ── FAQ ─────────────────────────────────────────── */}
      <Section className="bg-ivory-deep/50">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[.7fr_1.3fr] lg:gap-20">
            <Reveal>
              <Eyebrow>자주 묻는 질문</Eyebrow>
              <SectionTitle>궁금한 점이 있으신가요?</SectionTitle>
              <Lead>
                여기에 없는 질문은 문의 게시판에 남겨 주세요. 영업일 기준 1일
                이내에 답변드립니다.
              </Lead>
              <div className="mt-8">
                <ButtonLink href="/qna" variant="outline">
                  문의 게시판 가기
                </ButtonLink>
              </div>
            </Reveal>

            <Reveal delay={0.08}>
              <Accordion items={FAQ_ITEMS} />
            </Reveal>
          </div>
        </Container>
      </Section>

      {/* ── 마무리 CTA ──────────────────────────────────── */}
      <Section className="pb-24 sm:pb-32">
        <Container>
          <Reveal>
            <div className="relative overflow-hidden rounded-[24px] border border-line bg-white/70 px-7 py-16 text-center sm:px-14 sm:py-20">
              <div
                aria-hidden
                className="pointer-events-none absolute -top-24 left-1/2 h-72 w-[520px] -translate-x-1/2 rounded-full opacity-60 blur-3xl"
                style={{
                  background:
                    "radial-gradient(circle, rgba(196,167,125,.38) 0%, rgba(196,167,125,0) 70%)",
                }}
              />
              <div className="relative">
                <h2 className="text-[clamp(1.6rem,3.6vw,2.5rem)] font-semibold text-ink">
                  날짜가 정해지셨다면,
                  <br />
                  지금 자리를 잡아두세요.
                </h2>
                <p className="mx-auto mt-5 max-w-[42ch] text-[15px] leading-[1.85] text-ink-soft">
                  주말 예식은 일정이 빠르게 찹니다. 예약금 결제까지 3분이면
                  끝납니다.
                </p>
                <div className="mt-9 flex flex-wrap justify-center gap-3">
                  <ButtonLink href="/booking" size="lg">
                    예약 가능한 날짜 보기
                  </ButtonLink>
                  <ButtonLink href="/qna" variant="outline" size="lg">
                    먼저 문의하기
                  </ButtonLink>
                </div>
              </div>
            </div>
          </Reveal>
        </Container>
      </Section>
    </>
  );
}
