// 고객 축의 기록 페이지 (02 기획안 S15·S16).
// 지금은 미리보기용 데모 토큰만 샘플 데이터로 보여준다.
// TODO: token → booking 조회 + OTP 세션 검증(S14) → 만료 410(S18) → 스몰 S17 → 서버에서 마스킹한 payload
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import "@/styles/wb-tokens.css";
import "@/styles/wb-record.css";
import { RecordView } from "@/components/record/RecordView";
import { sampleRecord, sampleSealed, sampleStandard } from "@/mocks/record-sample";
import type { RecordPayload } from "@/types/record";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "축의 기록 | 웨딩버틀러",
  robots: { index: false, follow: false },
};

const DEMOS: Record<string, RecordPayload> = {
  demo: sampleStandard,
  "demo-sealed": sampleSealed,
  "demo-premium": sampleRecord,
};

export default async function RecordPage({ params }: { params: { token: string } }) {
  const payload = DEMOS[params.token];
  if (!payload) notFound();

  return (
    <>
      <div className="wbr-sample-banner" role="note">
        샘플 화면이에요. 표시된 이름과 금액은 가상 데이터예요.
      </div>
      <RecordView {...payload} />
    </>
  );
}
