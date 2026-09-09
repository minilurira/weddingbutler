"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CountUp } from "@/components/ui/CountUp";
import { buttonClass } from "@/components/ui/Primitives";
import { formatWon } from "@/lib/format";
import {
  calculateQuote,
  EXTRA_BUTLER_FEE,
  EXTRA_GUEST_FEE,
  MAX_EXTRA_BUTLERS,
  MAX_GUEST_COUNT,
  PLANS,
  suggestPlan,
  type PlanId,
} from "@/lib/pricing";

/**
 * 하객 수와 추가 버틀러를 넣으면 총액과 예약금이 바로 나오는 계산기.
 *
 * 여기서 나오는 금액은 어디까지나 화면 표시용이다. 실제 결제 금액은
 * 서버가 같은 함수(calculateQuote)로 다시 계산해서 쓴다.
 */
export function Calculator() {
  const [planId, setPlanId] = useState<PlanId>("standard");
  const [guestCount, setGuestCount] = useState(250);
  const [extraButlers, setExtraButlers] = useState(0);

  const plan = PLANS.find((p) => p.id === planId)!;
  const quote = useMemo(
    () => calculateQuote({ planId, guestCount, extraButlers }),
    [planId, guestCount, extraButlers],
  );

  const recommended = suggestPlan(guestCount);
  const showSuggestion = recommended.id !== planId && quote.extraGuests > 0;

  return (
    <div className="overflow-hidden rounded-[24px] border border-line bg-white/70">
      <div className="grid lg:grid-cols-[1.15fr_.85fr]">
        {/* ── 입력 ── */}
        <div className="p-7 sm:p-9 lg:p-10">
          <fieldset>
            <legend className="text-[12px] font-semibold uppercase tracking-[0.14em] text-ink-mute">
              요금제
            </legend>
            <div className="mt-4 grid gap-2.5 sm:grid-cols-3">
              {PLANS.map((option) => {
                const selected = option.id === planId;
                return (
                  <button
                    key={option.id}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => {
                      setPlanId(option.id);
                      if (!option.allowsExtraButler) setExtraButlers(0);
                    }}
                    className={`relative rounded-2xl border px-4 py-4 text-left transition-all duration-300 ${
                      selected
                        ? "border-ink bg-ink text-ivory"
                        : "border-line bg-white text-ink hover:border-ink/25"
                    }`}
                  >
                    <span className="block font-mono text-[10px] tracking-[0.14em] opacity-60">
                      {option.index}
                    </span>
                    <span className="mt-1.5 block text-[14px] font-semibold tracking-tight">
                      {option.name}
                    </span>
                    <span
                      className={`mt-0.5 block text-[11.5px] ${selected ? "text-ivory/60" : "text-ink-mute"}`}
                    >
                      {option.includedGuests}명 포함
                    </span>
                  </button>
                );
              })}
            </div>
          </fieldset>

          {/* 하객 수 */}
          <div className="mt-9">
            <div className="flex items-end justify-between gap-4">
              <label
                htmlFor="calc-guests"
                className="text-[12px] font-semibold uppercase tracking-[0.14em] text-ink-mute"
              >
                예상 하객 수
              </label>
              <div className="flex items-baseline gap-1">
                <input
                  id="calc-guest-number"
                  type="number"
                  min={0}
                  max={MAX_GUEST_COUNT}
                  value={guestCount}
                  onChange={(event) =>
                    setGuestCount(
                      Math.max(
                        0,
                        Math.min(
                          MAX_GUEST_COUNT,
                          Number(event.target.value) || 0,
                        ),
                      ),
                    )
                  }
                  aria-label="예상 하객 수 직접 입력"
                  className="tabular w-24 rounded-lg border border-line bg-white px-3 py-1.5 text-right text-[19px] font-semibold tracking-tight text-ink focus:border-champagne"
                />
                <span className="text-[14px] text-ink-mute">명</span>
              </div>
            </div>

            <input
              id="calc-guests"
              type="range"
              min={0}
              max={600}
              step={10}
              value={Math.min(600, guestCount)}
              onChange={(event) => setGuestCount(Number(event.target.value))}
              aria-label="예상 하객 수 조절"
              className="mt-4 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-line accent-ink"
            />
            <div className="mt-2 flex justify-between text-[11px] text-ink-mute">
              <span>0명</span>
              <span>300명</span>
              <span>600명+</span>
            </div>

            <div className="collapsible" data-open={showSuggestion}>
              <div>
                <p className="text-[13px] leading-relaxed text-champagne-deep">
                  <span className="mt-3 block">
                    {guestCount}명이면 {recommended.name} 요금제가 더 유리할 수
                    있습니다.{" "}
                    <button
                      type="button"
                      onClick={() => setPlanId(recommended.id)}
                      className="font-semibold underline underline-offset-4"
                    >
                      {recommended.name}(으)로 바꾸기
                    </button>
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* 추가 버틀러 */}
          <div className="mt-9">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-ink-mute">
                  버틀러 추가
                </p>
                <p className="mt-1.5 text-[13px] text-ink-soft">
                  기본 {plan.butlers}명 배정 ·{" "}
                  {plan.allowsExtraButler
                    ? `1명 추가당 ${formatWon(EXTRA_BUTLER_FEE)}`
                    : "이 요금제는 추가 배정을 제공하지 않습니다"}
                </p>
              </div>

              {plan.allowsExtraButler && (
                <div className="flex items-center gap-1 rounded-full border border-line bg-white p-1">
                  <button
                    type="button"
                    onClick={() => setExtraButlers((n) => Math.max(0, n - 1))}
                    disabled={extraButlers === 0}
                    aria-label="버틀러 한 명 줄이기"
                    className="flex h-8 w-8 items-center justify-center rounded-full text-ink transition-colors hover:bg-ink/[.05] disabled:opacity-30"
                  >
                    −
                  </button>
                  <span className="tabular w-7 text-center text-[15px] font-semibold text-ink">
                    {extraButlers}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setExtraButlers((n) => Math.min(MAX_EXTRA_BUTLERS, n + 1))
                    }
                    disabled={extraButlers >= MAX_EXTRA_BUTLERS}
                    aria-label="버틀러 한 명 늘리기"
                    className="flex h-8 w-8 items-center justify-center rounded-full text-ink transition-colors hover:bg-ink/[.05] disabled:opacity-30"
                  >
                    +
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── 결과 ── */}
        <div className="border-t border-line bg-ink p-7 text-ivory sm:p-9 lg:border-l lg:border-t-0 lg:p-10">
          <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-ivory/45">
            예상 견적
          </p>

          <dl className="mt-6 flex flex-col gap-3 text-[14px]">
            <div className="flex justify-between gap-4">
              <dt className="text-ivory/60">{plan.name} 기본</dt>
              <dd className="tabular">{formatWon(quote.basePrice)}</dd>
            </div>

            <div className="flex justify-between gap-4">
              <dt className="text-ivory/60">
                추가 하객 {quote.extraGuests}명
                <span className="ml-1 text-[11.5px] text-ivory/35">
                  ×{formatWon(EXTRA_GUEST_FEE)}
                </span>
              </dt>
              <dd className="tabular">{formatWon(quote.extraGuestFee)}</dd>
            </div>

            {plan.allowsExtraButler && (
              <div className="flex justify-between gap-4">
                <dt className="text-ivory/60">추가 버틀러 {extraButlers}명</dt>
                <dd className="tabular">{formatWon(quote.extraButlerFee)}</dd>
              </div>
            )}
          </dl>

          <div className="mt-6 border-t border-ivory/12 pt-6">
            <p className="text-[13px] text-ivory/60">총 서비스 금액</p>
            <p className="mt-1.5 text-[30px] font-semibold tracking-tight text-ivory">
              <CountUp value={quote.total} />
            </p>
            <p className="mt-1 text-[12px] text-ivory/40">부가세 포함</p>
          </div>

          <div className="mt-7 rounded-2xl bg-ivory/[.07] p-5">
            <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-champagne">
              지금 결제할 예약금 (10%)
            </p>
            <p className="mt-2 text-[26px] font-semibold tracking-tight text-ivory">
              <CountUp value={quote.deposit} />
            </p>
            <p className="mt-2.5 text-[12.5px] leading-relaxed text-ivory/50">
              잔금 {formatWon(quote.balance)}은 예식 당일 현장에서 정산합니다.
              실제 하객 수에 따라 조정됩니다.
            </p>
          </div>

          <Link
            href={`/booking?plan=${planId}&guests=${quote.guestCount}&butlers=${quote.extraButlers}`}
            className={buttonClass("light", "lg", "mt-7 w-full")}
          >
            이 조건으로 예약하기
          </Link>
        </div>
      </div>
    </div>
  );
}
