import type { Metadata } from "next";
import { SmartImage } from "@/components/ui/SmartImage";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import {
  ButtonLink,
  Container,
  Eyebrow,
  Lead,
  Section,
  SectionTitle,
} from "@/components/ui/Primitives";
import { IMAGES } from "@/lib/images";
import { SERVICE_ITEMS, TRUST_POINTS } from "@/lib/content";

export const metadata: Metadata = {
  title: "서비스 안내",
  description:
    "웨딩버틀러가 예식 당일 접수대에서 하는 일과 진행 순서. 도착부터 정산 인계까지 시간대별로 안내합니다.",
};

/** 예식 당일 버틀러의 실제 동선 */
const TIMELINE = [
  {
    time: "예식 1시간 전",
    title: "도착 및 세팅",
    body: "접수대 위치를 확인하고 방명록, 필기구, 봉투 정리함, 잠금 보관함을 배치합니다. 답례품이 있다면 함께 정리합니다.",
  },
  {
    time: "예식 40분 전",
    title: "혼주님과 최종 확인",
    body: "정산을 인계받으실 분, 양가 구분 방식, 답례품 지급 기준을 현장에서 다시 한번 맞춥니다.",
  },
  {
    time: "예식 30분 전 ~ 시작",
    title: "접수 집중 시간",
    body: "하객이 가장 몰리는 구간입니다. 한 명이 봉투를 받고 한 명이 기록하며, 대기 줄이 길어지면 동선을 나눠 분산합니다.",
  },
  {
    time: "예식 진행 중",
    title: "늦은 하객 응대 및 1차 정리",
    body: "늦게 오시는 분들을 계속 응대하면서, 접수된 축의금을 순차적으로 잠금 보관함으로 옮기고 명단을 정리합니다.",
  },
  {
    time: "예식 종료 직후",
    title: "현장 정산",
    body: "지정하신 분 앞에서 함께 세어 금액을 확인하고, 정리된 명단과 함께 인계합니다.",
  },
  {
    time: "정산 이후",
    title: "정리 및 철수",
    body: "접수대를 원래 상태로 정리하고 철수합니다. 남은 답례품도 함께 전달드립니다.",
  },
];

/** 예식 전에 준비해 주셔야 할 것들 */
const PREPARE = [
  {
    title: "접수대 위치",
    body: "예식장에서 지정해 주는 접수대 위치를 알려주세요. 양가 분리 운영이 필요하면 미리 말씀해 주세요.",
  },
  {
    title: "정산 인계 대상",
    body: "예식 후 축의금을 받으실 분(보통 혼주 또는 형제자매)을 정해 주세요. 당일 현장에서 신원을 확인합니다.",
  },
  {
    title: "답례품·식권",
    body: "지급 기준(전원/일부/양가 구분)을 알려주시면 그대로 안내드립니다. 물품은 예식 전 접수대에 두시면 됩니다.",
  },
  {
    title: "예상 하객 수",
    body: "양가 각각의 예상 인원을 알려주시면 버틀러 배치를 미리 계획합니다.",
  },
];

export default function ServicePage() {
  return (
    <>
      <Section className="pt-32 sm:pt-40 lg:pt-44">
        <Container>
          <div className="grid items-end gap-12 lg:grid-cols-[1.1fr_.9fr] lg:gap-16">
            <Reveal>
              <Eyebrow>서비스 안내</Eyebrow>
              <SectionTitle>
                접수대에 서 있는 세 시간을
                <br />
                저희가 대신합니다.
              </SectionTitle>
              <Lead>
                축의대는 결혼식에서 가장 정신없는 자리입니다. 익숙하지 않은
                분이 맡으면 줄이 밀리고, 기록이 빠지고, 결국 예식이 끝난 뒤에
                다시 세어봐야 합니다. 훈련된 사람이 맡으면 그럴 일이 없습니다.
              </Lead>
            </Reveal>

            <Reveal delay={0.1} direction="left">
              <SmartImage
                image={IMAGES.butler}
                width={900}
                sizes="(max-width: 1024px) 100vw, 42vw"
                className="aspect-[4/3] rounded-[24px]"
              />
            </Reveal>
          </div>
        </Container>
      </Section>

      {/* ── 하는 일 ── */}
      <Section className="bg-ivory-deep/50">
        <Container>
          <Reveal className="max-w-2xl">
            <Eyebrow>업무 범위</Eyebrow>
            <SectionTitle>여섯 가지를 맡습니다.</SectionTitle>
          </Reveal>

          <RevealGroup className="mt-14 grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {SERVICE_ITEMS.map((item) => (
              <RevealItem key={item.number}>
                <div className="border-t border-line pt-6">
                  <span className="font-mono text-[11px] tracking-[0.14em] text-champagne-deep">
                    {item.number}
                  </span>
                  <h3 className="mt-3 text-[17px] font-semibold tracking-tight text-ink">
                    {item.title}
                  </h3>
                  <p className="mt-2.5 text-[14.5px] leading-[1.8] text-ink-soft">
                    {item.body}
                  </p>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
        </Container>
      </Section>

      {/* ── 당일 타임라인 ── */}
      <Section>
        <Container>
          <Reveal className="max-w-2xl">
            <Eyebrow>예식 당일</Eyebrow>
            <SectionTitle>시간대별로 이렇게 움직입니다.</SectionTitle>
            <Lead>
              두 분은 아무것도 하지 않으셔도 됩니다. 확인이 필요한 순간에만
              짧게 여쭙습니다.
            </Lead>
          </Reveal>

          <div className="mt-14 grid gap-12 lg:grid-cols-[1fr_.75fr] lg:gap-20">
            <RevealGroup className="relative">
              {/* 타임라인 세로선 */}
              <div
                aria-hidden
                className="absolute bottom-4 left-[7px] top-3 w-px bg-line"
              />
              {TIMELINE.map((entry) => (
                <RevealItem key={entry.time}>
                  <div className="relative flex gap-6 pb-10 pl-8 last:pb-0">
                    <span
                      aria-hidden
                      className="absolute left-0 top-2.5 h-[15px] w-[15px] rounded-full border-2 border-champagne bg-ivory"
                    />
                    <div>
                      <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-champagne-deep">
                        {entry.time}
                      </p>
                      <h3 className="mt-2 text-[17px] font-semibold tracking-tight text-ink">
                        {entry.title}
                      </h3>
                      <p className="mt-2 max-w-[52ch] text-[14.5px] leading-[1.8] text-ink-soft">
                        {entry.body}
                      </p>
                    </div>
                  </div>
                </RevealItem>
              ))}
            </RevealGroup>

            <Reveal delay={0.1} direction="left">
              <SmartImage
                image={IMAGES.guests}
                width={800}
                sizes="(max-width: 1024px) 100vw, 34vw"
                className="aspect-[3/4] rounded-[24px]"
              />
            </Reveal>
          </div>
        </Container>
      </Section>

      {/* ── 준비해 주실 것 ── */}
      <Section className="bg-ivory-deep/50">
        <Container>
          <Reveal className="max-w-2xl">
            <Eyebrow>사전 조율</Eyebrow>
            <SectionTitle>네 가지만 알려주시면 됩니다.</SectionTitle>
            <Lead>
              예식 일주일 전에 담당자가 먼저 연락드립니다. 그때 함께 확인하는
              내용입니다.
            </Lead>
          </Reveal>

          <RevealGroup className="mt-14 grid gap-5 sm:grid-cols-2">
            {PREPARE.map((item) => (
              <RevealItem key={item.title}>
                <div className="h-full rounded-[20px] border border-line bg-white/70 p-7">
                  <h3 className="text-[16px] font-semibold tracking-tight text-ink">
                    {item.title}
                  </h3>
                  <p className="mt-2.5 text-[14px] leading-[1.8] text-ink-soft">
                    {item.body}
                  </p>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
        </Container>
      </Section>

      {/* ── 안심 요소 ── */}
      <Section className="pb-24 sm:pb-32">
        <Container>
          <Reveal className="max-w-2xl">
            <Eyebrow>운영 원칙</Eyebrow>
            <SectionTitle>현금을 다루는 방식은 공개합니다.</SectionTitle>
          </Reveal>

          <RevealGroup className="mt-12 grid gap-px overflow-hidden rounded-[20px] border border-line bg-line sm:grid-cols-2">
            {TRUST_POINTS.map((point) => (
              <RevealItem key={point.title} className="h-full">
                <div className="h-full bg-ivory p-7">
                  <h3 className="text-[16px] font-semibold tracking-tight text-ink">
                    {point.title}
                  </h3>
                  <p className="mt-2.5 text-[14px] leading-[1.8] text-ink-soft">
                    {point.body}
                  </p>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>

          <Reveal delay={0.1}>
            <div className="mt-12 flex flex-wrap gap-3">
              <ButtonLink href="/booking" size="lg">
                예약하기
              </ButtonLink>
              <ButtonLink href="/pricing" variant="outline" size="lg">
                요금 확인하기
              </ButtonLink>
            </div>
          </Reveal>
        </Container>
      </Section>
    </>
  );
}
