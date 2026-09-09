"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Calendar } from "@/components/booking/Calendar";
import { Checkbox, Field, TextArea, TextInput } from "@/components/booking/Fields";
import { MockPaymentDialog } from "@/components/booking/MockPaymentDialog";
import { Button, ButtonLink } from "@/components/ui/Primitives";
import { CountUp } from "@/components/ui/CountUp";
import { formatWon } from "@/lib/format";
import {
  calculateQuote,
  EXTRA_BUTLER_FEE,
  EXTRA_GUEST_FEE,
  MAX_EXTRA_BUTLERS,
  MAX_GUEST_COUNT,
  PLANS,
  type PlanId,
} from "@/lib/pricing";
import {
  allTimeSlots,
  earliestBookableDate,
  formatKoreanDate,
  formatKoreanTime,
  formatDateString,
  parseDateString,
  type DateString,
  type TimeString,
} from "@/lib/availability";
import {
  IS_MOCK_PAYMENT,
  PAYMENT_CURRENCY,
  PAYMENT_METHOD,
  PORTONE_CHANNEL_KEY,
  PORTONE_STORE_ID,
} from "@/lib/payment-config";

const STEPS = [
  { key: "plan", label: "요금제" },
  { key: "schedule", label: "날짜·시간" },
  { key: "info", label: "예식 정보" },
  { key: "confirm", label: "확인·결제" },
] as const;

type FormState = {
  groomName: string;
  brideName: string;
  venueName: string;
  venueAddress: string;
  contactName: string;
  phone: string;
  email: string;
  notes: string;
};

const EMPTY_FORM: FormState = {
  groomName: "",
  brideName: "",
  venueName: "",
  venueAddress: "",
  contactName: "",
  phone: "",
  email: "",
  notes: "",
};

function monthOf(date: DateString): DateString {
  return `${date.slice(0, 7)}-01`;
}

/** 참조가 매 렌더 바뀌지 않도록 모듈 상수로 둔다. */
const EMPTY_TAKEN: Record<string, string[]> = {};

export function BookingFlow() {
  const router = useRouter();
  const params = useSearchParams();

  // 요금제 페이지의 계산기에서 넘어온 조건이 있으면 그대로 이어받는다.
  const initialPlan = (params.get("plan") ?? "standard") as PlanId;
  const [planId, setPlanId] = useState<PlanId>(
    PLANS.some((p) => p.id === initialPlan) ? initialPlan : "standard",
  );
  const [guestCount, setGuestCount] = useState(() => {
    const raw = Number(params.get("guests"));
    return Number.isFinite(raw) && raw > 0 ? Math.min(raw, MAX_GUEST_COUNT) : 250;
  });
  const [extraButlers, setExtraButlers] = useState(() => {
    const raw = Number(params.get("butlers"));
    return Number.isFinite(raw) && raw > 0 ? Math.min(raw, MAX_EXTRA_BUTLERS) : 0;
  });

  const [step, setStep] = useState(0);
  const [month, setMonth] = useState<DateString>(() =>
    monthOf(earliestBookableDate()),
  );
  const [date, setDate] = useState<DateString | null>(null);
  const [time, setTime] = useState<TimeString | null>(null);
  /**
   * 어느 달의 현황인지를 값과 함께 들고 있는다.
   * 이렇게 두면 "불러오는 중"을 별도 상태로 관리할 필요 없이 파생시킬 수 있다.
   */
  const [slotData, setSlotData] = useState<{
    month: DateString;
    taken: Record<string, string[]>;
  } | null>(null);

  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [mockPayment, setMockPayment] = useState<{
    paymentId: string;
    orderName: string;
    amount: number;
  } | null>(null);

  const plan = PLANS.find((p) => p.id === planId)!;
  const quote = useMemo(
    () => calculateQuote({ planId, guestCount, extraButlers }),
    [planId, guestCount, extraButlers],
  );

  // ── 달력에 보이는 달의 예약 현황 불러오기 ─────────────────────────────
  useEffect(() => {
    const from = month;
    const lastDay = parseDateString(month);
    lastDay.setUTCMonth(lastDay.getUTCMonth() + 1, 0);
    const to = formatDateString(lastDay);

    let cancelled = false;

    fetch(`/api/bookings/availability?from=${from}&to=${to}`)
      .then((response) => response.json())
      .then((payload) => {
        if (cancelled) return;
        // DB 가 아직 연결되지 않았어도 화면은 정상 동작해야 한다.
        // 이 경우 "모든 시간이 비어 있음"으로 두고 최종 검증은 서버가 한다.
        setSlotData({ month, taken: payload?.ok ? (payload.taken ?? {}) : {} });
      })
      .catch(() => {
        if (!cancelled) setSlotData({ month, taken: {} });
      });

    return () => {
      cancelled = true;
    };
  }, [month]);

  // 현재 보고 있는 달의 현황이 아직 안 왔으면 "불러오는 중"이다.
  const slotsReady = slotData?.month === month;
  const taken = slotsReady ? slotData.taken : EMPTY_TAKEN;

  const availableTimes = useMemo(() => {
    if (!date) return [];
    const takenSet = new Set(taken[date] ?? []);
    return allTimeSlots().map((slot) => ({
      time: slot,
      available: !takenSet.has(slot),
    }));
  }, [date, taken]);

  const update = useCallback(
    <K extends keyof FormState>(key: K, value: FormState[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }));
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    },
    [],
  );

  // ── 단계별 진행 가능 여부 ─────────────────────────────────────────────
  const canGoNext = useMemo(() => {
    if (step === 0) return guestCount > 0;
    if (step === 1) return Boolean(date && time);
    // 예식 정보 단계는 버튼을 막지 않는다. 눌렀을 때 어떤 항목이 비었는지
    // 알려주는 편이, 왜 못 넘어가는지 모른 채 비활성 버튼을 보는 것보다 낫다.
    if (step === 2) return true;
    return agreePrivacy && agreeTerms;
  }, [step, guestCount, date, time, agreePrivacy, agreeTerms]);

  function validateInfoStep(): boolean {
    const next: Record<string, string> = {};
    if (!form.groomName.trim()) next.groomName = "신랑 성함을 입력해 주세요.";
    if (!form.brideName.trim()) next.brideName = "신부 성함을 입력해 주세요.";
    if (!form.venueName.trim()) next.venueName = "예식장 이름을 입력해 주세요.";
    if (!form.contactName.trim())
      next.contactName = "연락받으실 분의 성함을 입력해 주세요.";
    if (!/^0\d{8,10}$/.test(form.phone.replace(/\D/g, "")))
      next.phone = "연락처를 올바르게 입력해 주세요. (예: 010-1234-5678)";
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      next.email = "이메일 형식이 올바르지 않습니다.";

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function goNext() {
    if (step === 2 && !validateInfoStep()) return;
    setStep((current) => Math.min(STEPS.length - 1, current + 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function goBack() {
    setStep((current) => Math.max(0, current - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // ── 예약 생성 → 결제 ─────────────────────────────────────────────────
  async function handleSubmit() {
    if (!date || !time) return;
    setSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId,
          eventDate: date,
          eventTime: time,
          guestCount,
          extraButlers,
          groomName: form.groomName,
          brideName: form.brideName,
          venueName: form.venueName,
          venueAddress: form.venueAddress,
          contactName: form.contactName,
          phone: form.phone,
          email: form.email,
          notes: form.notes,
          agreePrivacy,
          agreeTerms,
        }),
      });

      const payload = await response.json();

      if (!response.ok || !payload.ok) {
        setSubmitError(payload?.error ?? "예약을 저장하지 못했습니다.");
        // 슬롯 경합이면 날짜 단계로 되돌려 다시 고르게 한다.
        if (response.status === 409) {
          setTime(null);
          setStep(1);
        }
        return;
      }

      const { paymentId, orderName, depositAmount } = payload;

      if (IS_MOCK_PAYMENT) {
        setMockPayment({ paymentId, orderName, amount: depositAmount });
        return;
      }

      await startRealPayment({ paymentId, orderName, amount: depositAmount });
    } catch {
      setSubmitError(
        "네트워크 오류로 예약을 완료하지 못했습니다. 잠시 후 다시 시도해 주세요.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function startRealPayment({
    paymentId,
    orderName,
    amount,
  }: {
    paymentId: string;
    orderName: string;
    amount: number;
  }) {
    // 결제 SDK 는 실제로 결제창을 띄울 때만 불러온다 (초기 번들에서 제외)
    const PortOne = await import("@portone/browser-sdk/v2");

    const response = await PortOne.requestPayment({
      storeId: PORTONE_STORE_ID,
      channelKey: PORTONE_CHANNEL_KEY,
      paymentId,
      orderName,
      totalAmount: amount,
      currency: PAYMENT_CURRENCY,
      payMethod: PAYMENT_METHOD,
      customer: {
        fullName: form.contactName,
        phoneNumber: form.phone.replace(/\D/g, ""),
        ...(form.email ? { email: form.email } : {}),
      },
      // 모바일은 결제사 페이지로 이동했다가 이 주소로 돌아온다.
      redirectUrl: `${window.location.origin}/booking/complete?paymentId=${encodeURIComponent(paymentId)}`,
    });

    // 리디렉션 방식이면 여기까지 오지 않고 페이지가 넘어간다.
    if (!response) return;

    if (response.code) {
      setSubmitError(response.message ?? "결제가 취소되었거나 실패했습니다.");
      return;
    }

    await confirmPayment(paymentId);
  }

  /** 서버에 결제 검증을 요청하고 완료 화면으로 보낸다. */
  const confirmPayment = useCallback(
    async (paymentId: string) => {
      const response = await fetch("/api/payments/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentId }),
      });
      const payload = await response.json();

      if (!response.ok || !payload.ok) {
        setSubmitError(
          payload?.error ?? "결제 확인에 실패했습니다. 고객센터로 문의해 주세요.",
        );
        return;
      }

      router.push(
        `/booking/complete?paymentId=${encodeURIComponent(paymentId)}`,
      );
    },
    [router],
  );

  return (
    <div className="grid gap-10 lg:grid-cols-[1.35fr_.65fr] lg:gap-12">
      <div>
        {/* ── 단계 표시 ── */}
        <ol className="flex items-center gap-2 sm:gap-3">
          {STEPS.map((entry, index) => {
            const state =
              index === step ? "current" : index < step ? "done" : "upcoming";
            return (
              <li key={entry.key} className="flex flex-1 items-center gap-2">
                <div className="flex-1">
                  <div
                    className={`h-[3px] rounded-full transition-colors duration-500 ${
                      state === "upcoming" ? "bg-line" : "bg-rose-deep"
                    }`}
                  />
                  <p
                    className={`mt-2.5 text-[11.5px] font-medium transition-colors sm:text-[12.5px] ${
                      state === "upcoming" ? "text-ink-mute" : "text-ink"
                    }`}
                  >
                    <span className="tabular mr-1.5 font-mono text-[10px] opacity-50">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    {entry.label}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>

        <div className="mt-10">
          {/* step 이 바뀌면 다시 마운트되면서 슬라이드가 재생된다 */}
          <div key={step} className="animate-slide-in">
              {step === 0 && (
                <StepPlan
                  planId={planId}
                  onPlanChange={(id) => {
                    setPlanId(id);
                    if (!PLANS.find((p) => p.id === id)!.allowsExtraButler) {
                      setExtraButlers(0);
                    }
                  }}
                  guestCount={guestCount}
                  onGuestCountChange={setGuestCount}
                  extraButlers={extraButlers}
                  onExtraButlersChange={setExtraButlers}
                />
              )}

              {step === 1 && (
                <StepSchedule
                  month={month}
                  onMonthChange={setMonth}
                  date={date}
                  onDateChange={(next) => {
                    setDate(next);
                    setTime(null);
                  }}
                  time={time}
                  onTimeChange={setTime}
                  taken={taken}
                  loading={!slotsReady}
                  availableTimes={availableTimes}
                />
              )}

              {step === 2 && (
                <StepInfo form={form} errors={errors} onChange={update} />
              )}

              {step === 3 && (
                <StepConfirm
                  planName={plan.name}
                  date={date}
                  time={time}
                  form={form}
                  quote={quote}
                  agreePrivacy={agreePrivacy}
                  agreeTerms={agreeTerms}
                  onAgreePrivacy={setAgreePrivacy}
                  onAgreeTerms={setAgreeTerms}
                />
              )}
          </div>
        </div>

        {submitError && (
          <p
            role="alert"
            className="mt-6 rounded-xl bg-[#a8392f]/[.08] px-4 py-3 text-[13.5px] leading-relaxed text-[#a8392f]"
          >
            {submitError}
          </p>
        )}

        <div className="mt-10 flex items-center justify-between gap-3 border-t border-line pt-7">
          {step > 0 ? (
            <Button variant="ghost" onClick={goBack} disabled={submitting}>
              이전
            </Button>
          ) : (
            <span />
          )}

          {step < STEPS.length - 1 ? (
            <Button onClick={goNext} disabled={!canGoNext} size="lg">
              다음
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={!canGoNext || submitting}
              size="lg"
            >
              {submitting
                ? "처리 중…"
                : `예약금 ${formatWon(quote.deposit)} 결제하기`}
            </Button>
          )}
        </div>
      </div>

      {/* ── 항상 보이는 견적 요약 ── */}
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-[20px] border border-line bg-plum p-6 text-cream sm:p-7">
          <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-cream/45">
            예약 요약
          </p>

          <dl className="mt-5 flex flex-col gap-2.5 text-[13.5px]">
            <div className="flex justify-between gap-3">
              <dt className="text-cream/55">요금제</dt>
              <dd>{plan.name}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-cream/55">예상 하객</dt>
              <dd className="tabular">{guestCount}명</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-cream/55">버틀러</dt>
              <dd className="tabular">{plan.butlers + extraButlers}명</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-cream/55">일시</dt>
              <dd className="text-right">
                {date && time ? (
                  <>
                    {formatKoreanDate(date)}
                    <br />
                    {formatKoreanTime(time)}
                  </>
                ) : (
                  <span className="text-cream/35">선택 전</span>
                )}
              </dd>
            </div>
          </dl>

          <div className="mt-6 border-t border-cream/12 pt-5">
            <div className="flex justify-between gap-3 text-[13.5px]">
              <span className="text-cream/55">총 서비스 금액</span>
              <span className="tabular">{formatWon(quote.total)}</span>
            </div>
            <div className="mt-4">
              <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-rose">
                지금 결제할 예약금
              </p>
              <p className="mt-1.5 text-[26px] font-semibold tracking-tight">
                <CountUp value={quote.deposit} />
              </p>
              <p className="mt-1.5 text-[12px] leading-relaxed text-cream/45">
                잔금 {formatWon(quote.balance)}은 예식 당일 정산합니다.
              </p>
            </div>
          </div>

          {IS_MOCK_PAYMENT && (
            <p className="mt-5 rounded-xl bg-rose/15 px-3.5 py-3 text-[12px] leading-relaxed text-rose">
              결제 키가 아직 등록되지 않아 <b>테스트 모드</b>로 동작합니다.
              실제 결제는 이뤄지지 않습니다.
            </p>
          )}
        </div>

        <p className="mt-4 px-1 text-[12px] leading-relaxed text-ink-mute">
          예약이 어려우시면{" "}
          <Link
            href="/qna"
            className="underline decoration-rose underline-offset-4"
          >
            문의 게시판
          </Link>
          에 남겨 주세요.
        </p>
      </aside>

      <MockPaymentDialog
        open={mockPayment !== null}
        orderName={mockPayment?.orderName ?? ""}
        amount={mockPayment?.amount ?? 0}
        onApprove={() => {
          const paymentId = mockPayment?.paymentId;
          setMockPayment(null);
          if (paymentId) void confirmPayment(paymentId);
        }}
        onCancel={() => {
          setMockPayment(null);
          setSubmitError("결제를 취소하셨습니다. 다시 시도해 주세요.");
        }}
      />
    </div>
  );
}

/* ── STEP 1: 요금제 ─────────────────────────────────────────────────── */

function StepPlan({
  planId,
  onPlanChange,
  guestCount,
  onGuestCountChange,
  extraButlers,
  onExtraButlersChange,
}: {
  planId: PlanId;
  onPlanChange: (id: PlanId) => void;
  guestCount: number;
  onGuestCountChange: (count: number) => void;
  extraButlers: number;
  onExtraButlersChange: (count: number) => void;
}) {
  const plan = PLANS.find((p) => p.id === planId)!;

  return (
    <div>
      <h2 className="text-[22px] font-semibold tracking-tight text-ink">
        어떤 요금제로 진행할까요?
      </h2>
      <p className="mt-2 text-[14.5px] leading-relaxed text-ink-soft">
        예상 하객 수를 넣으시면 추가 요금까지 반영된 금액이 계산됩니다.
      </p>

      <div className="mt-7 flex flex-col gap-2.5">
        {PLANS.map((option) => {
          const selected = option.id === planId;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onPlanChange(option.id)}
              aria-pressed={selected}
              className={`flex items-start justify-between gap-5 rounded-2xl border p-5 text-left transition-all duration-300 ${
                selected
                  ? "border-ink bg-white shadow-[0_2px_18px_rgba(26,26,26,.06)]"
                  : "border-line bg-white/50 hover:border-ink/20"
              }`}
            >
              <div className="flex gap-4">
                <span
                  aria-hidden
                  className={`mt-1 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border transition-colors ${
                    selected ? "border-[5px] border-rose-deep" : "border-line"
                  }`}
                />
                <div>
                  <p className="text-[16px] font-semibold tracking-tight text-ink">
                    {option.name}
                  </p>
                  <p className="mt-1 text-[13px] leading-relaxed text-ink-mute">
                    {option.guestRange} · 버틀러 {option.butlers}명
                  </p>
                </div>
              </div>
              <p className="shrink-0 text-[15px] font-semibold tracking-tight text-ink">
                {formatWon(option.basePrice)}
                {option.priceIsFrom && (
                  <span className="text-[12px] font-normal text-ink-mute">
                    ~
                  </span>
                )}
              </p>
            </button>
          );
        })}
      </div>

      {/* 하객 수 */}
      <div className="mt-9 rounded-2xl border border-line bg-white/60 p-6">
        <div className="flex items-end justify-between gap-4">
          <label
            htmlFor="booking-guests"
            className="text-[13px] font-medium text-ink"
          >
            예상 하객 수
          </label>
          <div className="flex items-baseline gap-1">
            <input
              type="number"
              min={0}
              max={MAX_GUEST_COUNT}
              value={guestCount}
              onChange={(event) =>
                onGuestCountChange(
                  Math.max(
                    0,
                    Math.min(MAX_GUEST_COUNT, Number(event.target.value) || 0),
                  ),
                )
              }
              aria-label="예상 하객 수 직접 입력"
              className="tabular w-24 rounded-lg border border-line bg-white px-3 py-1.5 text-right text-[18px] font-semibold text-ink focus:border-rose"
            />
            <span className="text-[13px] text-ink-mute">명</span>
          </div>
        </div>

        <input
          id="booking-guests"
          type="range"
          min={0}
          max={600}
          step={10}
          value={Math.min(600, guestCount)}
          onChange={(event) => onGuestCountChange(Number(event.target.value))}
          className="mt-4 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-line accent-ink"
        />

        <p className="mt-3 text-[12.5px] leading-relaxed text-ink-mute">
          {plan.name}은 {plan.includedGuests}명까지 포함이며, 초과 시 1명당{" "}
          {formatWon(EXTRA_GUEST_FEE)}이 추가됩니다. 실제 인원은 예식 당일
          확정해 잔금에 반영합니다.
        </p>

        {plan.allowsExtraButler && (
          <div className="mt-6 flex items-center justify-between gap-4 border-t border-line pt-5">
            <div>
              <p className="text-[13px] font-medium text-ink">버틀러 추가</p>
              <p className="mt-1 text-[12.5px] text-ink-mute">
                기본 {plan.butlers}명 · 1명 추가당 {formatWon(EXTRA_BUTLER_FEE)}
              </p>
            </div>
            <div className="flex items-center gap-1 rounded-full border border-line bg-white p-1">
              <button
                type="button"
                onClick={() => onExtraButlersChange(Math.max(0, extraButlers - 1))}
                disabled={extraButlers === 0}
                aria-label="버틀러 한 명 줄이기"
                className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-ink/[.05] disabled:opacity-30"
              >
                −
              </button>
              <span className="tabular w-7 text-center text-[15px] font-semibold text-ink">
                {extraButlers}
              </span>
              <button
                type="button"
                onClick={() =>
                  onExtraButlersChange(
                    Math.min(MAX_EXTRA_BUTLERS, extraButlers + 1),
                  )
                }
                disabled={extraButlers >= MAX_EXTRA_BUTLERS}
                aria-label="버틀러 한 명 늘리기"
                className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-ink/[.05] disabled:opacity-30"
              >
                +
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── STEP 2: 날짜·시간 ──────────────────────────────────────────────── */

function StepSchedule({
  month,
  onMonthChange,
  date,
  onDateChange,
  time,
  onTimeChange,
  taken,
  loading,
  availableTimes,
}: {
  month: DateString;
  onMonthChange: (month: DateString) => void;
  date: DateString | null;
  onDateChange: (date: DateString) => void;
  time: TimeString | null;
  onTimeChange: (time: TimeString) => void;
  taken: Record<string, string[]>;
  loading: boolean;
  availableTimes: { time: TimeString; available: boolean }[];
}) {
  return (
    <div>
      <h2 className="text-[22px] font-semibold tracking-tight text-ink">
        예식 날짜와 시간을 골라주세요.
      </h2>
      <p className="mt-2 text-[14.5px] leading-relaxed text-ink-soft">
        토·일요일 11시부터 19시까지 예약 가능합니다. 예식 시작 시간을 선택해
        주세요.
      </p>

      <div className="mt-7 grid gap-6 sm:grid-cols-[1fr_.85fr]">
        <Calendar
          month={month}
          onMonthChange={onMonthChange}
          selected={date}
          onSelect={onDateChange}
          taken={taken}
          loading={loading}
        />

        <div className="rounded-[20px] border border-line bg-white/70 p-5 sm:p-6">
          <p className="text-[13px] font-medium text-ink">
            {date ? formatKoreanDate(date) : "날짜를 먼저 선택해 주세요"}
          </p>

          {date ? (
            <div className="mt-4 grid grid-cols-3 gap-2">
              {availableTimes.map((slot) => {
                const selected = slot.time === time;
                return (
                  <button
                    key={slot.time}
                    type="button"
                    disabled={!slot.available}
                    onClick={() => onTimeChange(slot.time)}
                    aria-pressed={selected}
                    className={`tabular rounded-xl border py-2.5 text-[13.5px] transition-all duration-200 ${
                      selected
                        ? "border-rose-deep bg-rose-deep font-semibold text-white"
                        : slot.available
                          ? "border-line bg-white text-ink hover:border-ink/30"
                          : "cursor-not-allowed border-line/60 bg-cream-deep/40 text-ink-mute/40 line-through"
                    }`}
                  >
                    {slot.time}
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="mt-6 text-[13px] leading-relaxed text-ink-mute">
              달력에서 토요일 또는 일요일을 선택하시면 예약 가능한 시간이
              표시됩니다.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── STEP 3: 예식 정보 ──────────────────────────────────────────────── */

function StepInfo({
  form,
  errors,
  onChange,
}: {
  form: FormState;
  errors: Partial<Record<string, string>>;
  onChange: <K extends keyof FormState>(key: K, value: FormState[K]) => void;
}) {
  return (
    <div>
      <h2 className="text-[22px] font-semibold tracking-tight text-ink">
        예식 정보를 알려주세요.
      </h2>
      <p className="mt-2 text-[14.5px] leading-relaxed text-ink-soft">
        예식 일주일 전에 담당자가 이 연락처로 사전 조율 연락을 드립니다.
      </p>

      <div className="mt-7 flex flex-col gap-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="신랑 성함" required error={errors.groomName}>
            {(props) => (
              <TextInput
                {...props}
                value={form.groomName}
                onChange={(event) => onChange("groomName", event.target.value)}
                placeholder="홍길동"
                autoComplete="off"
              />
            )}
          </Field>
          <Field label="신부 성함" required error={errors.brideName}>
            {(props) => (
              <TextInput
                {...props}
                value={form.brideName}
                onChange={(event) => onChange("brideName", event.target.value)}
                placeholder="김영희"
                autoComplete="off"
              />
            )}
          </Field>
        </div>

        <Field label="예식장 이름" required error={errors.venueName}>
          {(props) => (
            <TextInput
              {...props}
              value={form.venueName}
              onChange={(event) => onChange("venueName", event.target.value)}
              placeholder="○○컨벤션 3층 그랜드홀"
            />
          )}
        </Field>

        <Field
          label="예식장 주소"
          hint="정확한 위치를 알면 버틀러가 제시간에 도착하기 쉽습니다."
          error={errors.venueAddress}
        >
          {(props) => (
            <TextInput
              {...props}
              value={form.venueAddress}
              onChange={(event) => onChange("venueAddress", event.target.value)}
              placeholder="서울시 ○○구 ○○로 00"
            />
          )}
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="연락받으실 분" required error={errors.contactName}>
            {(props) => (
              <TextInput
                {...props}
                value={form.contactName}
                onChange={(event) => onChange("contactName", event.target.value)}
                placeholder="예약자 성함"
                autoComplete="name"
              />
            )}
          </Field>
          <Field label="연락처" required error={errors.phone}>
            {(props) => (
              <TextInput
                {...props}
                type="tel"
                inputMode="numeric"
                value={form.phone}
                onChange={(event) => onChange("phone", event.target.value)}
                placeholder="010-1234-5678"
                autoComplete="tel"
              />
            )}
          </Field>
        </div>

        <Field
          label="이메일"
          hint="예약 확인 내역을 받아보실 주소 (선택)"
          error={errors.email}
        >
          {(props) => (
            <TextInput
              {...props}
              type="email"
              value={form.email}
              onChange={(event) => onChange("email", event.target.value)}
              placeholder="hello@example.com"
              autoComplete="email"
            />
          )}
        </Field>

        <Field
          label="요청사항"
          hint="양가 접수대 분리, 답례품 안내 방식 등 미리 알려주실 내용이 있다면 적어주세요."
        >
          {(props) => (
            <TextArea
              {...props}
              value={form.notes}
              onChange={(event) => onChange("notes", event.target.value)}
              placeholder="예: 신랑측 하객이 200명 정도로 예상됩니다. 답례품은 어르신들께만 드리려 합니다."
            />
          )}
        </Field>
      </div>
    </div>
  );
}

/* ── STEP 4: 확인·결제 ─────────────────────────────────────────────── */

function StepConfirm({
  planName,
  date,
  time,
  form,
  quote,
  agreePrivacy,
  agreeTerms,
  onAgreePrivacy,
  onAgreeTerms,
}: {
  planName: string;
  date: DateString | null;
  time: TimeString | null;
  form: FormState;
  quote: ReturnType<typeof calculateQuote>;
  agreePrivacy: boolean;
  agreeTerms: boolean;
  onAgreePrivacy: (value: boolean) => void;
  onAgreeTerms: (value: boolean) => void;
}) {
  const rows: [string, string][] = [
    ["요금제", planName],
    [
      "예식 일시",
      date && time
        ? `${formatKoreanDate(date)} ${formatKoreanTime(time)}`
        : "-",
    ],
    ["예식장", form.venueName],
    ["신랑·신부", `${form.groomName} · ${form.brideName}`],
    ["예상 하객", `${quote.guestCount}명`],
    ["배정 버틀러", `${quote.plan.butlers + quote.extraButlers}명`],
    ["연락처", `${form.contactName} (${form.phone})`],
  ];

  return (
    <div>
      <h2 className="text-[22px] font-semibold tracking-tight text-ink">
        내용을 확인해 주세요.
      </h2>
      <p className="mt-2 text-[14.5px] leading-relaxed text-ink-soft">
        예약금을 결제하시면 이 시간대가 확정됩니다.
      </p>

      <dl className="mt-7 divide-y divide-line rounded-[20px] border border-line bg-white/70">
        {rows.map(([label, value]) => (
          <div
            key={label}
            className="flex items-start justify-between gap-6 px-6 py-4"
          >
            <dt className="shrink-0 text-[13px] text-ink-mute">{label}</dt>
            <dd className="text-right text-[14px] text-ink">{value || "-"}</dd>
          </div>
        ))}
      </dl>

      {form.notes && (
        <div className="mt-4 rounded-[20px] border border-line bg-white/70 px-6 py-5">
          <p className="text-[13px] text-ink-mute">요청사항</p>
          <p className="mt-2 whitespace-pre-line text-[14px] leading-relaxed text-ink">
            {form.notes}
          </p>
        </div>
      )}

      <div className="mt-6 rounded-[20px] border border-line bg-cream-deep/60 px-6 py-5">
        <dl className="flex flex-col gap-2 text-[13.5px]">
          <div className="flex justify-between gap-4">
            <dt className="text-ink-mute">{quote.plan.name} 기본</dt>
            <dd className="tabular text-ink">{formatWon(quote.basePrice)}</dd>
          </div>
          {quote.extraGuestFee > 0 && (
            <div className="flex justify-between gap-4">
              <dt className="text-ink-mute">추가 하객 {quote.extraGuests}명</dt>
              <dd className="tabular text-ink">
                {formatWon(quote.extraGuestFee)}
              </dd>
            </div>
          )}
          {quote.extraButlerFee > 0 && (
            <div className="flex justify-between gap-4">
              <dt className="text-ink-mute">
                추가 버틀러 {quote.extraButlers}명
              </dt>
              <dd className="tabular text-ink">
                {formatWon(quote.extraButlerFee)}
              </dd>
            </div>
          )}
          <div className="mt-2 flex justify-between gap-4 border-t border-line pt-3">
            <dt className="font-medium text-ink">총 서비스 금액</dt>
            <dd className="tabular font-semibold text-ink">
              {formatWon(quote.total)}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="font-medium text-rose-deep">
              지금 결제할 예약금 (10%)
            </dt>
            <dd className="tabular font-semibold text-rose-deep">
              {formatWon(quote.deposit)}
            </dd>
          </div>
        </dl>
        <p className="mt-4 border-t border-line pt-4 text-[12.5px] leading-relaxed text-ink-mute">
          잔금 {formatWon(quote.balance)}은 예식 당일 현장에서 정산합니다.
          실제 하객 수에 따라 금액이 조정될 수 있습니다.
        </p>
      </div>

      <div className="mt-7 flex flex-col gap-4">
        <Checkbox checked={agreePrivacy} onChange={onAgreePrivacy}>
          <b className="font-semibold text-ink">[필수]</b> 예약 처리를 위한
          개인정보 수집·이용에 동의합니다. (수집 항목: 성함, 연락처, 이메일,
          예식 정보 / 보유 기간: 예식일로부터 1년){" "}
          <Link
            href="/policy/privacy"
            target="_blank"
            className="underline decoration-rose underline-offset-4"
          >
            전문 보기
          </Link>
        </Checkbox>

        <Checkbox checked={agreeTerms} onChange={onAgreeTerms}>
          <b className="font-semibold text-ink">[필수]</b> 이용약관 및
          취소·환불규정을 확인했으며 이에 동의합니다.{" "}
          <Link
            href="/policy/refund"
            target="_blank"
            className="underline decoration-rose underline-offset-4"
          >
            환불규정 보기
          </Link>
        </Checkbox>
      </div>

      <p className="mt-6 text-[12.5px] leading-relaxed text-ink-mute">
        결제에 문제가 있으시면{" "}
        <ButtonLink href="/qna" variant="ghost" size="sm" className="!px-1">
          문의 게시판
        </ButtonLink>
        을 이용해 주세요.
      </p>
    </div>
  );
}
