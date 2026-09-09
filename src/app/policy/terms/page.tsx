import type { Metadata } from "next";
import Link from "next/link";
import {
  Article,
  DraftNotice,
  List,
  PolicyLayout,
} from "@/components/site/PolicyLayout";
import { BUSINESS, SITE } from "@/lib/site";
import { MIN_LEAD_DAYS } from "@/lib/availability";
import { DEPOSIT_RATE } from "@/lib/pricing";

export const metadata: Metadata = {
  title: "이용약관",
  description: `${SITE.name} 축의대 대행 서비스 이용약관.`,
};

export default function TermsPage() {
  const percent = Math.round(DEPOSIT_RATE * 100);

  return (
    <PolicyLayout eyebrow="약관" title="이용약관" updatedAt="2026년 1월 1일">
      <DraftNotice>
        이 문서는 표준 양식을 바탕으로 작성된 <b>초안</b>입니다. 실제 운영
        조건에 맞게 검토하신 뒤 사용해 주세요.
      </DraftNotice>

      <Article heading="제1조 (목적)">
        <p>
          이 약관은 {BUSINESS.companyName}(이하 &lsquo;회사&rsquo;)이 제공하는
          결혼식 축의대 대행 서비스(이하 &lsquo;서비스&rsquo;)의 이용 조건 및
          절차, 회사와 이용자의 권리·의무 및 책임사항을 정함을 목적으로
          합니다.
        </p>
      </Article>

      <Article heading="제2조 (서비스의 내용)">
        <p>회사가 제공하는 서비스의 범위는 다음과 같습니다.</p>
        <List
          items={[
            "예식 현장 접수대에서의 축의금 접수 및 기록",
            "방명록 안내 및 답례품 전달",
            "접수된 축의금의 현장 보관 및 정산 인계",
            "정산 내역 정리 및 전달",
          ]}
        />
        <p>
          접수대 및 의자 등 예식장에서 제공하는 시설, 답례품·식권 등 이용자가
          준비해야 하는 물품은 서비스 범위에 포함되지 않습니다.
        </p>
      </Article>

      <Article heading="제3조 (예약)">
        <List
          items={[
            `예약은 홈페이지를 통해 접수하며, 예식일 기준 ${MIN_LEAD_DAYS}일 전까지 신청하실 수 있습니다.`,
            "예약 가능 일시는 토요일·일요일 11시부터 19시까지입니다.",
            `예약금(총 서비스 금액의 ${percent}%) 결제가 완료된 시점에 예약이 확정됩니다.`,
            "예약금 결제 전에는 해당 일시가 확정되지 않으며, 다른 이용자의 예약이 먼저 확정될 수 있습니다.",
          ]}
        />
      </Article>

      <Article heading="제4조 (요금 및 정산)">
        <List
          items={[
            "모든 표시 요금은 부가가치세가 포함된 금액입니다.",
            "요금제에 포함된 하객 수를 초과하는 경우 1명당 2,000원의 추가 요금이 발생합니다.",
            "버틀러 추가 배정 시 1명당 100,000원의 요금이 발생합니다.",
            "잔금은 예식 당일 현장에서 실제 하객 수를 기준으로 정산합니다.",
          ]}
        />
      </Article>

      <Article heading="제5조 (취소 및 환불)">
        <p>
          예약 취소 및 환불에 관한 사항은 별도의{" "}
          <Link
            href="/policy/refund"
            className="underline decoration-rose underline-offset-4"
          >
            취소·환불규정
          </Link>
          을 따릅니다.
        </p>
      </Article>

      <Article heading="제6조 (이용자의 의무)">
        <List
          items={[
            "이용자는 예약 시 정확한 정보를 제공해야 하며, 허위 정보로 인한 불이익은 이용자가 부담합니다.",
            "예식 정보가 변경된 경우 지체 없이 회사에 알려야 합니다.",
            "예식 당일 축의금을 인계받을 담당자를 지정해야 합니다.",
            "접수대 위치 및 예식장 이용 규정에 관한 사항을 사전에 안내해야 합니다.",
          ]}
        />
      </Article>

      <Article heading="제7조 (회사의 의무)">
        <List
          items={[
            "회사는 약정한 일시에 약정한 인원의 버틀러를 배정합니다.",
            "회사는 접수된 축의금을 안전하게 보관하고, 지정된 담당자에게 정확히 인계합니다.",
            "회사는 업무 수행 중 알게 된 이용자의 개인정보를 보호합니다.",
          ]}
        />
      </Article>

      <Article heading="제8조 (책임의 한계)">
        <p>
          회사는 천재지변, 예식장 사정 등 불가항력으로 인해 서비스를 제공하지
          못한 경우 책임을 지지 않으며, 이 경우 예약금 전액을 환불합니다.
        </p>
        <p>
          회사의 고의 또는 과실로 축의금에 손실이 발생한 경우, 회사는 그
          손실에 대해 배상 책임을 집니다. 구체적인 보상 기준은 예약 확정 시
          별도로 안내드립니다.
        </p>
        <p>
          이용자가 지정한 담당자에게 정상적으로 인계한 이후 발생한 사고에
          대해서는 회사가 책임지지 않습니다.
        </p>
      </Article>

      <Article heading="제9조 (분쟁의 해결)">
        <p>
          서비스 이용과 관련하여 분쟁이 발생한 경우, 회사와 이용자는 상호
          협의하여 해결하기 위해 노력합니다. 협의가 이루어지지 않을 경우
          관계 법령 및 상관례에 따릅니다.
        </p>
      </Article>

      <Article heading="부칙">
        <p>이 약관은 2026년 1월 1일부터 시행합니다.</p>
      </Article>
    </PolicyLayout>
  );
}
