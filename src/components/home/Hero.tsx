import { SmartImage } from "@/components/ui/SmartImage";
import { Reveal } from "@/components/ui/Reveal";
import { Icon } from "@/components/ui/Icon";
import { ButtonLink, Container } from "@/components/ui/Primitives";
import { IMAGES } from "@/lib/images";
import { HERO_CHIPS } from "@/lib/content";
import { PLANS } from "@/lib/pricing";
import { formatManwon } from "@/lib/format";

/**
 * 첫 화면 — 어두운 사진 위에 흰 글씨를 얹는 방식.
 *
 * 바탕을 먼저 어둡게 깔고 그 위에 사진을 얹기 때문에, 사진이 늦게 오거나
 * 끝내 오지 않아도 글씨가 안 읽히는 일은 없다.
 *
 * 등장 모션은 전부 CSS 다. 자바스크립트가 실패하거나 사용자가 모션을
 * 줄이도록 설정했더라도 문구는 항상 보인다.
 */
export function Hero() {
  const cheapest = PLANS[0];

  return (
    <section className="relative isolate flex min-h-[86svh] items-center overflow-hidden bg-plum pb-20 pt-32 sm:min-h-[92svh] sm:pb-24 sm:pt-40">
      {/* 배경 사진 — 흐름에서 빼기 위해 감싸는 div 를 절대배치한다 */}
      <div aria-hidden className="absolute inset-0 -z-10">
        <SmartImage
          image={IMAGES.hero}
          priority
          width={1920}
          sizes="100vw"
          className="h-full w-full"
          imgClassName="animate-drift opacity-55"
        />
      </div>

      {/* 글씨가 잘 읽히도록 어둡게 덮어준다 */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-gradient-to-b from-plum/75 via-plum/60 to-plum/90"
      />

      <Container className="relative text-center">
        <Reveal direction="up">
          <p className="inline-flex items-center gap-2 rounded-full border border-cream/20 bg-cream/10 px-4 py-1.5 text-[12px] font-medium text-cream/90 backdrop-blur-sm">
            <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-rose" />
            결혼식 축의대 대행 서비스
          </p>
        </Reveal>

        <Reveal direction="up" delay={0.08}>
          <h1 className="mx-auto mt-7 max-w-[20ch] text-[clamp(2rem,7vw,3.75rem)] font-semibold leading-[1.2] tracking-[-0.03em] text-white">
            축의대 부탁할 사람,
            <br />
            이제 찾지 않으셔도 됩니다.
          </h1>
        </Reveal>

        <Reveal direction="up" delay={0.16}>
          <p className="mx-auto mt-7 max-w-[38ch] text-[15px] leading-[1.9] text-cream/80 sm:text-[16.5px]">
            접수부터 기록, 보관, 정산까지 훈련된 웨딩버틀러가 맡습니다.{" "}
            <br className="hidden sm:block" />
            가장 가까운 분들이 하객으로만 계실 수 있도록.
          </p>
        </Reveal>

        <Reveal direction="up" delay={0.24}>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <ButtonLink
              href="/booking"
              size="lg"
              className="w-full sm:w-auto sm:min-w-[13.5rem]"
            >
              예약 가능한 날짜 보기
            </ButtonLink>
            <ButtonLink
              href="/pricing"
              variant="light"
              size="lg"
              className="w-full sm:w-auto"
            >
              {formatManwon(cheapest.basePrice)}부터 · 요금 보기
            </ButtonLink>
          </div>
        </Reveal>

        {/* 핵심 조건 요약 — 스크롤하지 않아도 판단에 필요한 정보를 먼저 준다 */}
        <Reveal direction="up" delay={0.32}>
          <ul className="mx-auto mt-14 grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-4">
            {HERO_CHIPS.map((chip) => (
              <li
                key={chip.label}
                className="flex flex-col items-center gap-2 rounded-2xl border border-cream/15 bg-cream/[.07] px-3 py-4 backdrop-blur-sm"
              >
                <Icon name={chip.icon} className="h-5 w-5 text-rose" />
                <span className="text-[12.5px] font-medium text-cream/85">
                  {chip.label}
                </span>
              </li>
            ))}
          </ul>
        </Reveal>
      </Container>
    </section>
  );
}
