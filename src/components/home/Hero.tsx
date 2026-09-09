import { SmartImage } from "@/components/ui/SmartImage";
import { Reveal } from "@/components/ui/Reveal";
import { ButtonLink, Container } from "@/components/ui/Primitives";
import { IMAGES } from "@/lib/images";
import { PLANS } from "@/lib/pricing";
import { formatManwon } from "@/lib/format";

/**
 * 첫 화면.
 *
 * 등장 모션은 전부 CSS 로 처리한다. 자바스크립트가 늦거나 실패해도,
 * 사용자가 모션을 줄이도록 설정했더라도 문구는 항상 읽힌다.
 */
export function Hero() {
  const cheapest = PLANS[0];

  return (
    <section className="relative overflow-hidden pt-32 sm:pt-40 lg:pt-44">
      {/* 우측 상단에서 은은하게 번지는 핑크 톤 */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-40 -top-40 h-[560px] w-[560px] rounded-full opacity-50 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(237,165,183,.55) 0%, rgba(237,165,183,0) 68%)",
        }}
      />

      <Container className="relative">
        <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_.95fr] lg:gap-16">
          <div>
            <Reveal direction="up">
              <p className="flex items-center gap-2.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-rose-deep">
                <span aria-hidden className="h-px w-6 bg-rose" />
                결혼식 축의대 대행
              </p>
            </Reveal>

            <Reveal direction="up" delay={0.08}>
              <h1 className="mt-6 text-[clamp(2.25rem,6.4vw,4.25rem)] font-semibold leading-[1.12] tracking-[-0.03em] text-ink">
                축의대 부탁할 사람,
                <br />
                이제 찾지 않으셔도 됩니다.
              </h1>
            </Reveal>

            <Reveal direction="up" delay={0.16}>
              <p className="mt-7 max-w-[44ch] text-[16px] leading-[1.85] text-ink-soft sm:text-[17px]">
                {/* 줄바꿈은 넓은 화면에서만. 좁은 화면에서 두 문장이 붙지
                    않도록 공백을 명시적으로 넣는다. */}
                접수부터 기록, 보관, 정산까지 훈련된 웨딩버틀러가 맡습니다.{" "}
                <br className="hidden sm:block" />
                가장 가까운 분들이 하객으로만 계실 수 있도록.
              </p>
            </Reveal>

            <Reveal direction="up" delay={0.24}>
              <div className="mt-10 flex flex-wrap gap-3">
                <ButtonLink href="/booking" size="lg">
                  날짜 확인하고 예약하기
                </ButtonLink>
                <ButtonLink href="/pricing" variant="outline" size="lg">
                  요금 먼저 보기
                </ButtonLink>
              </div>
            </Reveal>

            <Reveal direction="up" delay={0.32}>
              <dl className="mt-14 grid max-w-lg grid-cols-3 gap-6 border-t border-line pt-8">
                <div>
                  <dt className="text-[12px] text-ink-mute">시작 요금</dt>
                  <dd className="mt-1.5 text-[19px] font-semibold tracking-tight text-ink">
                    {formatManwon(cheapest.basePrice)}
                  </dd>
                  <dd className="text-[12px] text-ink-mute">부가세 포함</dd>
                </div>
                <div>
                  <dt className="text-[12px] text-ink-mute">예약금</dt>
                  <dd className="mt-1.5 text-[19px] font-semibold tracking-tight text-ink">
                    10%
                  </dd>
                  <dd className="text-[12px] text-ink-mute">잔금은 당일</dd>
                </div>
                <div>
                  <dt className="text-[12px] text-ink-mute">배정 인원</dt>
                  <dd className="mt-1.5 text-[19px] font-semibold tracking-tight text-ink">
                    2명 ~
                  </dd>
                  <dd className="text-[12px] text-ink-mute">항상 2인 1조</dd>
                </div>
              </dl>
            </Reveal>
          </div>

          <Reveal direction="left" delay={0.1} className="relative">
            <SmartImage
              image={IMAGES.hero}
              priority
              width={1200}
              sizes="(max-width: 1024px) 100vw, 46vw"
              className="aspect-[4/5] rounded-[24px] sm:aspect-[5/6]"
              imgClassName="animate-drift"
            />

            {/* 사진 위에 겹치는 작은 안내 카드 — 서비스의 핵심 약속 하나 */}
            <div className="absolute -bottom-6 -left-4 max-w-[248px] rounded-[18px] border border-line bg-cream/95 p-5 backdrop-blur-xl sm:-left-8">
              <p className="text-[13px] font-semibold text-ink">
                정산은 눈앞에서
              </p>
              <p className="mt-1.5 text-[13px] leading-relaxed text-ink-soft">
                예식이 끝나면 혼주님 앞에서 함께 세어 확인하고 인계합니다.
              </p>
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
