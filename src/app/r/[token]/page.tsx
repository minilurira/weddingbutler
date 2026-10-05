// 고객 축의 기록 페이지 (02 기획안 S14~S18). 기록은 어드민 DB에 있고 서버에서만 불러온다.
// 토큰 조회 → 관리자 서명 or 문자 인증 세션 확인(S14) → 만료(S18) → 스몰(S17) → 요약·리스트(S15·S16)
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import "@/styles/wb-tokens.css";
import "@/styles/wb-record.css";
import { RecordView } from "@/components/record/RecordView";
import { RecordGate } from "@/components/record/RecordGate";
import { RecordFrame, SUPPORT_PHONE } from "@/components/record/RecordFrame";
import { sampleRecord, sampleSealed, sampleStandard } from "@/mocks/record-sample";
import { getRecordInfo, getRecordPayload, isRecordToken } from "@/lib/record-api";
import { SESSION_COOKIE, hasCustomerSession, isAdminPreview } from "@/lib/record-session";
import { krDate } from "@/lib/format";
import type { RecordPayload } from "@/types/record";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "축의 기록 | 웨딩버틀러",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

// 디자인 확인용 데모. 운영 사이트에서는 열리지 않는다.
const DEMOS: Record<string, RecordPayload> = {
  demo: sampleStandard,
  "demo-sealed": sampleSealed,
  "demo-premium": sampleRecord,
};

export default async function RecordPage({
  params,
  searchParams,
}: {
  params: { token: string };
  searchParams: { admin?: string | string[] };
}) {
  const { token } = params;

  const demo = process.env.VERCEL_ENV !== "production" ? DEMOS[token] : undefined;
  if (demo) {
    return (
      <>
        <div className="wbr-sample-banner" role="note">샘플 화면이에요. 표시된 이름과 금액은 가상 데이터예요.</div>
        <RecordView {...demo} />
      </>
    );
  }

  if (!isRecordToken(token)) notFound();

  const adminParam = typeof searchParams.admin === "string" ? searchParams.admin : undefined;
  const admin = isAdminPreview(token, adminParam);
  const viewer = admin ? "admin" : "customer";

  const info = await getRecordInfo(token, viewer);
  if (info.state === "not_found") notFound();
  if (info.state === "unavailable") {
    return (
      <RecordFrame>
        <div className="wbr-empty">
          기록을 불러오지 못했어요
          <span className="wbr-muted">잠시 후 다시 열어 주세요. 계속 안 되면 고객센터 {SUPPORT_PHONE}로 연락 주세요.</span>
        </div>
      </RecordFrame>
    );
  }
  if (info.state === "expired") {
    return (
      <RecordFrame>
        <div className="wbr-empty">
          보관 기간이 끝나 기록이 삭제됐어요
          <span className="wbr-muted">
            {info.expiresAt ? `${krDate(info.expiresAt)}까지 열람할 수 있었어요. ` : ""}
            필요하시면 고객센터 {SUPPORT_PHONE}로 문의해 주세요.
          </span>
        </div>
      </RecordFrame>
    );
  }

  if (!admin && !hasCustomerSession(token, cookies().get(SESSION_COOKIE)?.value)) {
    return (
      <RecordFrame>
        <RecordGate token={token} coupleName={info.coupleName} phoneMasked={info.phoneMasked} />
      </RecordFrame>
    );
  }

  const downloadUrl = `/r/${token}/download${admin && adminParam ? `?admin=${encodeURIComponent(adminParam)}` : ""}`;
  const banner = admin && (
    <div className="wbr-preview-banner" role="note">
      관리자 미리보기{info.status === "published" ? "" : " · 아직 게시 전이라 고객은 볼 수 없어요"}
    </div>
  );

  // 스몰케어는 엑셀 다운로드만 제공 (S17)
  if (info.plan === "small") {
    return (
      <>
        {banner}
        <RecordFrame>
          <section className="wbr-card wbr-gate">
            <h1>{info.coupleName} 님의 축의 기록</h1>
            <p className="wbr-gate__lead">
              스몰케어 상품은 축의 기록을 엑셀 파일로 드려요.
              {info.expiresAt ? ` ${krDate(info.expiresAt)}에 삭제되니 내려받아 보관해 주세요.` : ""}
            </p>
            <a className="wbr-btn wbr-btn--primary wbr-btn--block" href={downloadUrl}>엑셀 다운로드</a>
          </section>
        </RecordFrame>
      </>
    );
  }

  const payload = await getRecordPayload(token, viewer);
  if (!payload) {
    return (
      <RecordFrame>
        <div className="wbr-empty">
          기록을 불러오지 못했어요
          <span className="wbr-muted">잠시 후 다시 열어 주세요.</span>
        </div>
      </RecordFrame>
    );
  }

  return (
    <>
      {banner}
      <RecordView meta={{ ...payload.meta, downloadUrl, supportPhone: SUPPORT_PHONE }} entries={payload.entries} />
    </>
  );
}
