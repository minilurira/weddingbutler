import type { Metadata } from "next";
import {
  Article,
  DraftNotice,
  List,
  PolicyLayout,
} from "@/components/site/PolicyLayout";
import { BUSINESS } from "@/lib/site";
import { DEPOSIT_RATE } from "@/lib/pricing";

export const metadata: Metadata = {
  title: "취소·환불규정",
  description:
    "웨딩버틀러 축의대 대행 서비스의 예약 취소 및 예약금 환불 기준 안내.",
};

export default function RefundPolicyPage() {
  const percent = Math.round(DEPOSIT_RATE * 100);

  return (
    <PolicyLayout
      eyebrow="약관"
      title="취소 · 환불규정"
      updatedAt="2026년 1월 1일"
    >
      <DraftNotice>
        아래 환불 기준은 <b>표준 예시</b>입니다. 실제 운영 기준을 정하신 뒤
        이 페이지의 내용을 교체해 주세요. (파일:{" "}
        <code className="font-mono">src/app/policy/refund/page.tsx</code>)
      </DraftNotice>

      <Article heading="제1조 (예약금)">
        <p>
          예약금은 총 서비스 금액의 {percent}%이며, 예약 시 결제됩니다. 결제된
          예약금은 해당 일시의 인력 배정을 확정하는 데 사용되며, 예식 당일
          정산 시 총 금액에서 전액 차감됩니다.
        </p>
      </Article>

      <Article heading="제2조 (예약 취소 및 환불 기준)">
        <p>고객의 사정으로 예약을 취소하는 경우 환불 기준은 다음과 같습니다.</p>
        <List
          items={[
            "예식일 30일 전까지 취소: 예약금 전액 환불",
            "예식일 14일 전까지 취소: 예약금의 50% 환불",
            "예식일 7일 전까지 취소: 예약금의 30% 환불",
            "예식일 7일 이내 취소 또는 당일 미진행: 환불 불가",
          ]}
        />
        <p>
          환불은 취소 접수일로부터 영업일 기준 3일 이내에 결제하신 수단으로
          처리됩니다. 카드 결제의 경우 카드사 사정에 따라 실제 반영까지 추가
          기간이 소요될 수 있습니다.
        </p>
      </Article>

      <Article heading="제3조 (일정 변경)">
        <p>
          예식 일정이 변경된 경우, 취소가 아닌 일정 변경으로 처리해 드립니다.
          변경하실 일시에 배정 가능한 인력이 있는 경우 예약금을 그대로
          이전합니다. 일정 변경은 예식일 7일 전까지 요청해 주셔야 하며,{" "}
          {BUSINESS.phone}로 연락 주시면 안내해 드립니다.
        </p>
      </Article>

      <Article heading="제4조 (회사 사정에 의한 취소)">
        <p>
          천재지변, 인력 사고 등 회사 사정으로 서비스를 제공할 수 없게 된
          경우, 예약금 전액을 즉시 환불하고 별도의 보상 기준에 따라
          보상합니다. 가능한 경우 대체 인력을 우선 배정합니다.
        </p>
      </Article>

      <Article heading="제5조 (잔금 정산)">
        <p>
          잔금은 예식 당일 현장에서 정산합니다. 실제 하객 수가 예약 시
          입력하신 인원과 다를 경우, 실제 인원을 기준으로 금액을 조정합니다.
          예상보다 하객이 적은 경우 그만큼 차감되며, 많은 경우 초과 인원에
          대한 추가 요금이 발생합니다.
        </p>
      </Article>

      <Article heading="문의">
        <p>
          취소·환불에 대한 문의는 {BUSINESS.phone} 또는 {BUSINESS.email}로
          연락 주시기 바랍니다.
        </p>
      </Article>
    </PolicyLayout>
  );
}
