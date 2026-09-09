import type { Metadata } from "next";
import {
  Article,
  DraftNotice,
  List,
  PolicyLayout,
} from "@/components/site/PolicyLayout";
import { BUSINESS, SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "개인정보처리방침",
  description: `${SITE.name}의 개인정보 수집·이용·보관 및 파기에 관한 안내.`,
};

export default function PrivacyPolicyPage() {
  return (
    <PolicyLayout
      eyebrow="약관"
      title="개인정보처리방침"
      updatedAt="2026년 1월 1일"
    >
      <DraftNotice>
        이 문서는 표준 양식을 바탕으로 작성된 <b>초안</b>입니다. 실제 사업자
        정보와 위탁 현황을 반영해 검토하신 뒤 사용해 주세요.
      </DraftNotice>

      <Article heading="1. 총칙">
        <p>
          {BUSINESS.companyName}(이하 &lsquo;회사&rsquo;)은 이용자의 개인정보를
          중요하게 생각하며, 「개인정보 보호법」 등 관련 법령을 준수합니다.
          회사는 개인정보처리방침을 통해 이용자가 제공한 개인정보가 어떤
          용도와 방식으로 이용되고 있으며 어떤 조치가 취해지고 있는지
          알려드립니다.
        </p>
      </Article>

      <Article heading="2. 수집하는 개인정보 항목 및 수집 방법">
        <p>회사는 다음의 개인정보를 수집합니다.</p>
        <List
          items={[
            "예약 시 (필수): 신랑·신부 성함, 예약자 성함, 연락처, 예식장 정보, 예상 하객 수",
            "예약 시 (선택): 이메일 주소, 예식장 주소, 요청사항",
            "문의 게시판 이용 시: 성함, 문의 내용, 게시글 비밀번호(암호화 저장)",
            "결제 시: 결제 수단 정보 및 결제 내역 (결제대행사가 처리하며 회사는 카드번호 등 민감정보를 직접 보관하지 않습니다)",
            "서비스 이용 과정에서 자동 생성되는 정보: 접속 로그, 브라우저 정보",
          ]}
        />
      </Article>

      <Article heading="3. 개인정보의 수집 및 이용 목적">
        <List
          items={[
            "예약 접수 및 확인, 인력 배정, 사전 조율 연락",
            "예약금 결제 및 정산, 환불 처리",
            "문의 접수 및 답변",
            "서비스 품질 개선 및 분쟁 대응",
          ]}
        />
      </Article>

      <Article heading="4. 개인정보의 보유 및 이용 기간">
        <p>
          회사는 수집 목적이 달성되면 개인정보를 지체 없이 파기합니다. 다만
          관계 법령에 따라 보존이 필요한 경우 아래 기간 동안 보관합니다.
        </p>
        <List
          items={[
            "예약 정보: 예식일로부터 1년",
            "문의 게시글: 답변 완료 후 1년 (작성자가 직접 삭제 가능)",
            "계약 또는 청약철회 등에 관한 기록: 5년 (전자상거래법)",
            "대금 결제 및 재화 등의 공급에 관한 기록: 5년 (전자상거래법)",
            "소비자의 불만 또는 분쟁 처리에 관한 기록: 3년 (전자상거래법)",
          ]}
        />
      </Article>

      <Article heading="5. 개인정보의 제3자 제공 및 처리 위탁">
        <p>
          회사는 이용자의 개인정보를 원칙적으로 외부에 제공하지 않습니다.
          다만 서비스 제공을 위해 아래 업무를 위탁하고 있습니다.
        </p>
        <List
          items={[
            "결제 처리: 주식회사 코리아포트원(PortOne) 및 연동 결제대행사 — 결제 및 환불 처리",
            "데이터 보관: Supabase Inc. — 예약·문의 데이터 저장",
            "서비스 호스팅: Vercel Inc. — 웹사이트 운영",
          ]}
        />
        <p>
          위탁 계약 시 개인정보 보호 관련 지시 엄수, 재위탁 제한, 안전성 확보
          조치 등을 명시하고 있습니다.
        </p>
      </Article>

      <Article heading="6. 이용자의 권리와 행사 방법">
        <p>
          이용자는 언제든지 자신의 개인정보에 대한 열람·정정·삭제·처리정지를
          요구할 수 있습니다. {BUSINESS.email} 또는 {BUSINESS.phone}로 연락
          주시면 지체 없이 조치하겠습니다.
        </p>
        <p>
          문의 게시판에 남기신 글은 작성 시 설정한 비밀번호로 직접 삭제하실
          수 있습니다.
        </p>
      </Article>

      <Article heading="7. 개인정보의 파기 절차 및 방법">
        <p>
          보유 기간이 지나거나 처리 목적이 달성된 개인정보는 지체 없이
          파기합니다. 전자적 파일 형태의 정보는 복구가 불가능한 방법으로
          영구 삭제하며, 종이 문서는 분쇄하거나 소각합니다.
        </p>
      </Article>

      <Article heading="8. 개인정보의 안전성 확보 조치">
        <List
          items={[
            "게시글 비밀번호는 복호화가 불가능한 해시로 저장합니다.",
            "데이터베이스는 서버에서만 접근 가능하도록 제한하고 있습니다.",
            "개인정보 취급자를 최소한으로 제한하고 있습니다.",
            "모든 통신 구간에 HTTPS 암호화를 적용합니다.",
          ]}
        />
      </Article>

      <Article heading="9. 개인정보 보호책임자">
        <List
          items={[
            `성명: ${BUSINESS.ceo}`,
            `연락처: ${BUSINESS.phone}`,
            `이메일: ${BUSINESS.email}`,
          ]}
        />
        <p>
          개인정보 침해에 대한 신고나 상담이 필요하신 경우 개인정보침해
          신고센터(privacy.kisa.or.kr, 국번없이 118) 등에 문의하실 수
          있습니다.
        </p>
      </Article>

      <Article heading="10. 개인정보처리방침의 변경">
        <p>
          이 개인정보처리방침의 내용이 추가·삭제·수정되는 경우 시행일
          7일 전부터 홈페이지를 통해 안내드립니다.
        </p>
      </Article>
    </PolicyLayout>
  );
}
