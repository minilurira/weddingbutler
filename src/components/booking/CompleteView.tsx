"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ButtonLink } from "@/components/ui/Primitives";
import { formatWon } from "@/lib/format";
import { formatKoreanDate, formatKoreanTime } from "@/lib/availability";
import { BUSINESS } from "@/lib/site";

type BookingSummary = {
  status: string;
  planName: string;
  eventDate: string;
  eventTime: string;
  guestCount: number;
  extraButlers: number;
  venueName: string;
  contactName: string;
  phoneMasked: string;
  totalAmount: number;
  depositAmount: number;
  balanceAmount: number;
};

type Phase =
  | { kind: "loading" }
  | { kind: "success"; booking: BookingSummary }
  | { kind: "error"; message: string };

/**
 * 결제 완료 화면.
 *
 * 두 경로로 도착한다.
 *  1. PC 결제: 예약 페이지가 이미 검증을 마치고 이 주소로 밀어준 경우
 *  2. 모바일 결제: 결제사 페이지에서 redirectUrl 로 곧바로 돌아온 경우
 *
 * 2번은 아직 검증이 안 된 상태이므로, 여기서 한 번 더 검증을 요청한다.
 * 이미 확정된 예약이면 서버가 그대로 성공을 돌려주므로 중복 처리 걱정은 없다.
 */
export function CompleteView() {
  const params = useSearchParams();
  const paymentId = params.get("paymentId");
  const errorCode = params.get("code");
  const errorMessage = params.get("message");

  const [fetched, setFetched] = useState<Phase>({ kind: "loading" });

  /*
   * 주소만 보고도 바로 알 수 있는 실패는 상태로 만들지 않고 그대로 계산한다.
   *  - code 파라미터: 결제사가 실패를 알리며 되돌려보낸 경우
   *  - paymentId 없음: 잘못된 경로로 들어온 경우
   */
  const upfrontError = errorCode
    ? errorMessage || "결제가 취소되었거나 실패했습니다."
    : !paymentId
      ? "결제 정보를 찾을 수 없습니다."
      : null;

  useEffect(() => {
    if (upfrontError || !paymentId) return;

    let cancelled = false;

    async function run() {
      try {
        // 모바일 리디렉션으로 바로 들어온 경우를 대비해 확정을 한 번 더 요청한다.
        await fetch("/api/payments/complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paymentId }),
        });

        const response = await fetch(
          `/api/bookings/lookup?paymentId=${encodeURIComponent(paymentId!)}`,
        );
        const payload = await response.json();

        if (cancelled) return;

        if (!response.ok || !payload.ok) {
          setFetched({
            kind: "error",
            message: payload?.error ?? "예약 정보를 불러오지 못했습니다.",
          });
          return;
        }

        const booking = payload.booking as BookingSummary;

        if (booking.status !== "paid" && booking.status !== "completed") {
          setFetched({
            kind: "error",
            message:
              "결제가 아직 확인되지 않았습니다. 잠시 후 새로고침하시거나 고객센터로 문의해 주세요.",
          });
          return;
        }

        setFetched({ kind: "success", booking });
      } catch {
        if (!cancelled) {
          setFetched({
            kind: "error",
            message: "결제 확인 중 오류가 발생했습니다.",
          });
        }
      }
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, [paymentId, upfrontError]);

  const phase: Phase = upfrontError
    ? { kind: "error", message: upfrontError }
    : fetched;

  if (phase.kind === "loading") {
    return (
      <div className="rounded-[24px] border border-line bg-white/70 px-8 py-20 text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-line border-t-rose" />
        <p className="mt-6 text-[14.5px] text-ink-soft">
          결제 내역을 확인하고 있습니다…
        </p>
      </div>
    );
  }

  if (phase.kind === "error") {
    return (
      <div className="rounded-[24px] border border-line bg-white/70 px-8 py-16 text-center sm:px-12">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#a8392f]/10">
          <svg
            viewBox="0 0 24 24"
            className="h-6 w-6 text-[#a8392f]"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          >
            <path d="M12 7v6M12 17h.01" />
          </svg>
        </div>
        <h1 className="mt-6 text-[22px] font-semibold tracking-tight text-ink">
          예약이 완료되지 않았습니다
        </h1>
        <p className="mx-auto mt-3 max-w-[42ch] text-[14.5px] leading-relaxed text-ink-soft">
          {phase.message}
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <ButtonLink href="/booking">다시 예약하기</ButtonLink>
          <ButtonLink href="/qna" variant="outline">
            문의하기
          </ButtonLink>
        </div>
        <p className="mt-6 text-[13px] text-ink-mute">
          결제는 되었는데 예약이 안 됐다면 {BUSINESS.phone}로 연락 주세요.
        </p>
      </div>
    );
  }

  const { booking } = phase;
  const rows: [string, string][] = [
    ["요금제", booking.planName],
    [
      "예식 일시",
      `${formatKoreanDate(booking.eventDate)} ${formatKoreanTime(booking.eventTime)}`,
    ],
    ["예식장", booking.venueName],
    ["예상 하객", `${booking.guestCount}명`],
    ["예약자", `${booking.contactName} (${booking.phoneMasked})`],
  ];

  return (
    <div className="animate-fade-up">
      <div className="rounded-[24px] border border-line bg-white/70 px-7 py-14 text-center sm:px-12">
        <div className="animate-pop-in mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose/20 [animation-delay:.15s]">
          <svg
            viewBox="0 0 24 24"
            className="h-7 w-7 text-rose-deep"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m5 12.5 4.5 4.5L19 7.5" />
          </svg>
        </div>

        <h1 className="mt-7 text-[clamp(1.5rem,3.4vw,2rem)] font-semibold tracking-tight text-ink">
          예약이 확정되었습니다
        </h1>
        <p className="mx-auto mt-4 max-w-[44ch] text-[14.5px] leading-[1.85] text-ink-soft">
          예약금 결제가 확인되어 해당 시간대를 확보했습니다.
          <br />
          예식 일주일 전에 담당자가 연락드려 세부 사항을 조율하겠습니다.
        </p>

        <dl className="mx-auto mt-10 max-w-md divide-y divide-line border-y border-line text-left">
          {rows.map(([label, value]) => (
            <div
              key={label}
              className="flex items-start justify-between gap-6 py-3.5"
            >
              <dt className="shrink-0 text-[13px] text-ink-mute">{label}</dt>
              <dd className="text-right text-[14px] text-ink">{value}</dd>
            </div>
          ))}
        </dl>

        <div className="mx-auto mt-8 max-w-md rounded-[18px] bg-cream-deep/70 px-6 py-5 text-left">
          <div className="flex justify-between gap-4 text-[13.5px]">
            <span className="text-ink-mute">총 서비스 금액</span>
            <span className="tabular text-ink">
              {formatWon(booking.totalAmount)}
            </span>
          </div>
          <div className="mt-2 flex justify-between gap-4 text-[13.5px]">
            <span className="text-ink-mute">결제하신 예약금</span>
            <span className="tabular font-semibold text-rose-deep">
              {formatWon(booking.depositAmount)}
            </span>
          </div>
          <div className="mt-2 flex justify-between gap-4 border-t border-line pt-3 text-[13.5px]">
            <span className="text-ink-mute">예식 당일 정산할 잔금</span>
            <span className="tabular text-ink">
              {formatWon(booking.balanceAmount)}
            </span>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <ButtonLink href="/">홈으로</ButtonLink>
          <ButtonLink href="/service" variant="outline">
            예식 당일 진행 순서 보기
          </ButtonLink>
        </div>
      </div>

      <p className="mt-6 text-center text-[13px] leading-relaxed text-ink-mute">
        예약 변경이나 취소가 필요하시면 {BUSINESS.phone}로 연락 주세요.
        <br />
        취소 시점에 따른 환불 기준은{" "}
        <a
          href="/policy/refund"
          className="underline decoration-rose underline-offset-4"
        >
          취소·환불규정
        </a>
        을 확인해 주세요.
      </p>
    </div>
  );
}
