"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Primitives";
import { formatWon } from "@/lib/format";

/**
 * 포트원 키가 아직 없을 때 실제 결제창을 대신하는 모의 결제창.
 *
 * 실제 카드 정보를 받지 않는다. "결제 성공/실패" 두 갈래만 흉내 내서
 * 뒤따르는 서버 검증과 완료 화면까지 흐름을 그대로 테스트할 수 있게 한다.
 * 키가 설정되면 이 창은 나타나지 않는다.
 */
export function MockPaymentDialog({
  open,
  orderName,
  amount,
  onApprove,
  onCancel,
}: {
  open: boolean;
  orderName: string;
  amount: number;
  onApprove: () => void;
  onCancel: () => void;
}) {
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      className="animate-fade-in fixed inset-0 z-[80] flex items-center justify-center bg-ink/45 p-5 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="mock-pay-title"
    >
      <div className="animate-pop-in w-full max-w-sm rounded-[22px] bg-cream p-7">
            <p className="inline-flex rounded-full bg-[#a8392f]/10 px-2.5 py-1 text-[11px] font-semibold text-[#a8392f]">
              테스트 모드
            </p>

            <h2
              id="mock-pay-title"
              className="mt-4 text-[19px] font-semibold tracking-tight text-ink"
            >
              모의 결제창
            </h2>
            <p className="mt-2 text-[13.5px] leading-relaxed text-ink-soft">
              포트원 결제 키가 아직 등록되지 않아 실제 결제창 대신 이 화면이
              열렸습니다. 실제로 돈이 빠져나가지 않습니다.
            </p>

            <dl className="mt-6 flex flex-col gap-2 border-t border-line pt-5 text-[13.5px]">
              <div className="flex justify-between gap-4">
                <dt className="text-ink-mute">주문명</dt>
                <dd className="text-right text-ink">{orderName}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-ink-mute">결제금액</dt>
                <dd className="tabular font-semibold text-ink">
                  {formatWon(amount)}
                </dd>
              </div>
            </dl>

            <div className="mt-7 flex flex-col gap-2">
              <Button autoFocus onClick={onApprove} size="lg">
                결제 성공으로 처리
              </Button>
              <Button onClick={onCancel} variant="ghost" size="md">
                결제 취소
              </Button>
        </div>
      </div>
    </div>
  );
}
