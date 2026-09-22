import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { OpenModalButton } from "@/components/OpenModalButton";
import { fontDisplay, fontSerif } from "@/lib/style";

export const metadata: Metadata = {
  title: "가격안내",
  description: "하객 규모에 맞춰 세 가지로 준비했습니다. 모든 금액은 부가세 포함입니다.",
  alternates: { canonical: "/pricing" },
};

const CARDS = [
  {
    plan: "small" as const,
    eyebrow: "01 SMALL CARE",
    name: "스몰케어",
    priceWhole: "39",
    dark: false,
    bullets: ["하객 200명 이하 예식", "웨딩버틀러 2명 배정", "축의금 접수 · 봉투 번호 기록 · 하객 안내", "정산 리포트 · 운영 영상 제공"],
  },
  {
    plan: "standard" as const,
    eyebrow: "02 STANDARD",
    name: "스탠다드",
    priceWhole: "45",
    dark: true,
    bullets: ["하객 201~300명 예식", "웨딩버틀러 2명 배정", "스몰케어 구성 전부 포함", "버틀러 추가 가능 (1명당 100,000원)"],
  },
  {
    plan: "premium" as const,
    eyebrow: "03 PREMIUM",
    name: "프리미엄",
    priceWhole: "80",
    dark: false,
    bullets: ["양가 합계 하객 400명 기준", "웨딩버틀러 4명 배정 (양가 2명씩)", "신랑측 · 신부측 축의대 분리 운영", "버틀러 추가 가능 (1명당 100,000원)"],
  },
];

const COMPARE_ROWS: [string, string, string, string][] = [
  ["기본 요금", "39만원", "45만원", "80만원"],
  ["기준 하객", "200명 이하", "201~300명", "양가 합계 400명"],
  ["배정 버틀러", "2명", "2명", "4명"],
  ["기준 초과 하객", "1명당 2,000원", "1명당 2,000원", "1명당 2,000원"],
  ["버틀러 추가", "해당 없음", "1명 10만원", "1명 10만원"],
  ["개봉 집계", "무료", "무료", "무료"],
];

const EXTRA_COSTS = [
  { label: "기준 초과 하객", value: "1명당 2,000원", note: "접수대에서 접수한 하객 기준 · 혼주·예식장이 직접 안내한 하객은 세지 않습니다" },
  { label: "버틀러 추가", value: "1명당 100,000원", note: "스탠다드 · 프리미엄" },
  { label: "서비스 지역 외", value: "사전 견적", note: "서울·경기 외 지역은 예약 전 출장비를 안내드립니다" },
  { label: "개봉 집계", value: "무료", note: null as string | null },
];

const RECORDING = [
  {
    name: "밀봉",
    tag: "기본",
    body: "봉투를 열지 않고, 받은 순서대로 번호를 붙여 성함·신랑측/신부측과 함께 기록합니다. 봉투는 그대로 봉인해 전달드립니다.",
    responsibility: "전달한 봉투 매수와 봉인 상태",
    caveat: null as string | null,
  },
  {
    name: "개봉 집계",
    tag: "무료",
    body: "예식이 끝나고 접수를 마감한 뒤, 버틀러 2명이 카메라 앞에서 번호 순서대로 봉투를 열어 봉투별 금액과 신랑측·신부측 합계, 총액을 정리합니다. 현금은 봉투 원본과 함께 전달드리며, 인수자께서 집계 과정에 함께하실 수 있습니다.",
    responsibility: "리포트의 총액과 전달한 현금의 일치",
    caveat: "하객이 봉투에 적은 금액과 실제 금액의 차이, 빈 봉투·위조지폐는 책임 범위에 포함되지 않습니다",
  },
];

const INCLUDED = [
  "축의금 접수 및 실시간 접수 현황",
  "방명록 안내 · 정리",
  "하객 안내 및 인원 관리",
  "답례품 전달 안내",
  "2인 교차 검수 정산",
  "엑셀 정산 리포트 당일 전달",
  "현금영수증 발행 대행",
];

const NOTICES: { icon: string; title: string; body: React.ReactNode }[] = [
  {
    icon: "◷",
    title: "예약 및 결제",
    body: (
      <>
        <NoticeItem>모든 요금제의 서비스 결제 금액은 10만원이며, 카드로 결제하시면 예약이 확정됩니다.</NoticeItem>
        <NoticeItem>남은 서비스 대금은 예식 당일 전달 직전 현장에서 결제합니다.</NoticeItem>
        <NoticeItem>현장 결제는 카드 결제 링크 또는 계좌이체로 진행되며 현금영수증을 발행합니다.</NoticeItem>
        <NoticeItem>예식일 7일 전까지만 온라인 예약을 받습니다.</NoticeItem>
      </>
    ),
  },
  {
    icon: "↺",
    title: "취소 및 환불",
    body: (
      <>
        <div style={{ overflowX: "auto", margin: "0 0 14px" }}>
          <table style={{ width: "100%", minWidth: 320, borderCollapse: "collapse", fontSize: 14 }}>
            <tbody>
              <tr>
                <th style={{ textAlign: "left", padding: "10px 14px", background: "#FAF3F5", color: "#6B5A60", fontWeight: 500, border: "1px solid #F0E3E6" }}>취소 시점</th>
                <th style={{ textAlign: "left", padding: "10px 14px", background: "#FAF3F5", color: "#6B5A60", fontWeight: 500, border: "1px solid #F0E3E6" }}>서비스 결제 금액 환불</th>
              </tr>
              <tr>
                <td style={{ padding: "10px 14px", border: "1px solid #F0E3E6", color: "#4A3B41" }}>예식 7일 전까지</td>
                <td style={{ padding: "10px 14px", border: "1px solid #F0E3E6", color: "#4A3B41" }}>전액 환불</td>
              </tr>
              <tr>
                <td style={{ padding: "10px 14px", border: "1px solid #F0E3E6", color: "#4A3B41" }}>예식 6일 전 ~ 3일 전</td>
                <td style={{ padding: "10px 14px", border: "1px solid #F0E3E6", color: "#4A3B41" }}>50% 환불</td>
              </tr>
              <tr>
                <td style={{ padding: "10px 14px", border: "1px solid #F0E3E6", color: "#4A3B41" }}>예식 2일 전 ~ 당일</td>
                <td style={{ padding: "10px 14px", border: "1px solid #F0E3E6", color: "#4A3B41" }}>30% 환불</td>
              </tr>
            </tbody>
          </table>
        </div>
        <NoticeItem>예약 후 7일 이내 취소는 예식일과 관계없이 전액 환불됩니다. (예식 7일 전 당일에 예약하신 경우는 위 표를 따릅니다)</NoticeItem>
        <NoticeItem>예식 7일 전까지 알려 주시면 한 번 무료로 날짜를 바꿔 드립니다. (버틀러 배정 가능 시)</NoticeItem>
        <NoticeItem>천재지변, 감염병 관련 행정명령, 신랑·신부 또는 직계가족 상(喪)으로 예식이 취소되면 전액 환불됩니다.</NoticeItem>
        <NoticeItem>웨딩버틀러 사정으로 서비스를 못 하게 되면 전액 환불하고 총 금액의 10%를 배상합니다.</NoticeItem>
      </>
    ),
  },
  {
    icon: "!",
    title: "사전 확인 필수",
    body: (
      <>
        <NoticeItem>접수대 운영에 테이블·의자·전원 확보가 필요하니, 예식장에 설치 가능 여부를 확인해 주세요.</NoticeItem>
        <NoticeItem>예식 7일 전 사전 통화에서 예식장 구조, 신랑·신부측 구분 방법, 하객 기준, 인수자와 잔금 결제자를 확인합니다.</NoticeItem>
      </>
    ),
  },
  {
    icon: "⌸",
    title: "하객 기준",
    body: (
      <>
        <NoticeLabel>기준 하객 수</NoticeLabel>
        <div style={{ display: "flex", flexDirection: "column", gap: 9, marginBottom: 20 }}>
          <NoticeItem>스몰케어 — 버틀러 2명, 하객 200명 이하</NoticeItem>
          <NoticeItem>스탠다드 — 버틀러 2명, 하객 201 ~ 300명</NoticeItem>
          <NoticeItem>프리미엄 — 버틀러 4명, 양가 합계 400명</NoticeItem>
        </div>
        <NoticeLabel>기준 초과 시</NoticeLabel>
        <div style={{ display: "flex", flexDirection: "column", gap: 9, marginBottom: 20 }}>
          <NoticeItem>기준을 넘긴 하객은 1명당 2,000원이 추가됩니다.</NoticeItem>
          <NoticeItem>접수대에서 접수한 하객만 셉니다.</NoticeItem>
          <NoticeItem>혼주·예식장이 직접 안내한 하객은 산정에 포함하지 않습니다.</NoticeItem>
        </div>
        <div style={{ background: "#FAF4F5", borderRadius: 6, padding: "18px 20px" }}>
          <NoticeLabel muted>예시</NoticeLabel>
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            <NoticeItem small>스몰케어 하객 230명 → 30명 초과, 6만원 추가</NoticeItem>
            <NoticeItem small>스탠다드 하객 320명 → 20명 초과, 4만원 추가</NoticeItem>
            <NoticeItem small>프리미엄 양가 합계 460명 → 60명 초과, 12만원 추가</NoticeItem>
          </div>
        </div>
      </>
    ),
  },
  {
    icon: "ⓘ",
    title: "참고 안내",
    body: (
      <>
        <NoticeItem>서비스는 축의금 접수대 구역 내에서 진행되며, 해당 구역 밖에서 발생한 사안에 대해서는 책임을 지지 않습니다.</NoticeItem>
        <NoticeItem>축의금은 예약 때 또는 사전 통화 때 지정하신 인수자께만 전달합니다. 지정되지 않은 분이 요청하시면 의뢰인께 직접 확인한 뒤 전달합니다.</NoticeItem>
        <NoticeItem>서비스 지역은 서울·경기 기준이며, 그 외 지역은 예약 전 출장비를 안내드립니다.</NoticeItem>
      </>
    ),
  },
];

function NoticeItem({ children, small }: { children: React.ReactNode; small?: boolean }) {
  return (
    <div style={{ display: "flex", gap: 9, fontSize: small ? 13 : 14, lineHeight: small ? 1.7 : 1.75, color: "#6B5A60" }}>
      <span style={{ color: "#CBA9B4" }}>·</span>
      <span>{children}</span>
    </div>
  );
}

function NoticeLabel({ children, muted }: { children: React.ReactNode; muted?: boolean }) {
  return <p style={{ fontSize: 12, letterSpacing: "0.08em", color: muted ? "#9A8189" : "#A9647E", margin: "0 0 10px", fontWeight: 500 }}>{children}</p>;
}

function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14, marginBottom: 14 }}>
      <span style={{ display: "block", width: 26, height: 1, background: "#CBA9B4" }} />
      <span style={{ fontFamily: fontDisplay, fontSize: 13, letterSpacing: "0.4em", color: "#A9647E" }}>{children}</span>
      <span style={{ display: "block", width: 26, height: 1, background: "#CBA9B4" }} />
    </div>
  );
}

export default function PricingPage() {
  return (
    <div style={{ width: "100%", overflowX: "hidden", background: "#F3E9EB", minHeight: "100vh" }}>
      <Header active="pricing" />

      <section style={{ padding: "clamp(54px,9vw,90px) clamp(18px,5vw,24px) clamp(36px,6vw,60px)", textAlign: "center" }}>
        <p style={{ fontFamily: fontDisplay, fontSize: 14, letterSpacing: "0.4em", color: "#A9647E", margin: "0 0 16px" }}>PRICE PLANS</p>
        <h1 style={{ fontFamily: fontSerif, fontSize: "clamp(27px,6.2vw,40px)", fontWeight: 600, margin: "0 0 18px", letterSpacing: "-0.02em" }}>가격안내</h1>
        <p style={{ fontSize: 16, lineHeight: 1.9, color: "#6B5A60", margin: 0 }}>하객 규모에 맞춰 세 가지로 준비했습니다. 모든 금액은 부가세 포함입니다.</p>
      </section>

      <section style={{ padding: "0 clamp(18px,5vw,24px) clamp(56px,9vw,90px)" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%,300px),1fr))", gap: 22, alignItems: "start" }}>
          {CARDS.map((c) => (
            <div
              key={c.plan}
              style={{
                position: "relative",
                background: c.dark ? "#33232A" : "#FFFFFF",
                border: "1px solid " + (c.dark ? "#33232A" : "#E7D5DA"),
                borderRadius: 4,
                padding: "46px 36px 40px",
              }}
            >
              {c.dark && (
                <div style={{ position: "absolute", top: -13, left: 36, background: "#A9647E", color: "#fff", fontSize: 12, letterSpacing: "0.14em", padding: "6px 14px", borderRadius: 999 }}>
                  BEST
                </div>
              )}
              <p style={{ fontFamily: fontDisplay, fontSize: 13, letterSpacing: "0.34em", color: c.dark ? "#E9CAD1" : "#A9647E", margin: "0 0 10px" }}>{c.eyebrow}</p>
              <h2 style={{ fontFamily: fontSerif, fontSize: 28, fontWeight: 600, margin: "0 0 24px", color: c.dark ? "#FFFFFF" : undefined }}>{c.name}</h2>
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: 6,
                  paddingBottom: 26,
                  borderBottom: "1px solid " + (c.dark ? "rgba(255,255,255,0.16)" : "#E7D5DA"),
                }}
              >
                <span style={{ fontFamily: fontSerif, fontSize: 46, fontWeight: 600, color: c.dark ? "#FFFFFF" : undefined, letterSpacing: "-0.02em" }}>{c.priceWhole}</span>
                <span style={{ fontSize: 18, color: c.dark ? "#F3E9EB" : "#473A3F" }}>만원</span>
                <span style={{ fontSize: 13, color: c.dark ? "#B79AA3" : "#9A8189", marginLeft: 6 }}>VAT 포함</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 14, margin: "28px 0 34px" }}>
                {c.bullets.map((b) => (
                  <div key={b} style={{ display: "flex", gap: 10, fontSize: 15, color: c.dark ? "#F3E9EB" : "#473A3F", lineHeight: 1.7 }}>
                    <span style={{ color: c.dark ? "#E9CAD1" : "#A9647E" }}>·</span>
                    <span>{b}</span>
                  </div>
                ))}
              </div>
              <OpenModalButton
                plan={c.plan}
                className={c.dark ? "btn-accent-hover" : "btn-dark-hover"}
                style={{
                  display: "block",
                  width: "100%",
                  textAlign: "center",
                  padding: 15,
                  borderRadius: 999,
                  fontSize: 15,
                  border: "none",
                  cursor: "pointer",
                  background: c.dark ? "#A9647E" : "#F7F3EA",
                  color: c.dark ? "#FFFFFF" : "#473A3F",
                }}
              >
                이 요금제로 예약
              </OpenModalButton>
            </div>
          ))}
        </div>
      </section>

      <section style={{ padding: "clamp(56px,9vw,90px) clamp(18px,5vw,24px)", background: "rgba(255,255,255,0.75)" }}>
        <div style={{ maxWidth: 980, margin: "0 auto" }}>
          <h2 style={{ fontFamily: fontSerif, fontSize: "clamp(23px,4.8vw,30px)", fontWeight: 600, margin: "0 0 34px", letterSpacing: "-0.02em" }}>한 눈에 비교하기</h2>
          <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
            <div style={{ background: "#FFFFFF", border: "1px solid #E7D5DA", borderRadius: 4, overflow: "hidden", minWidth: 620 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr 1fr", background: "#33232A" }}>
                <div style={{ padding: "18px 22px", fontSize: 14, color: "#D8C3C9" }}>항목</div>
                <div style={{ padding: "18px 22px", fontSize: 14, color: "#FFFFFF" }}>스몰케어</div>
                <div style={{ padding: "18px 22px", fontSize: 14, color: "#FFFFFF" }}>스탠다드</div>
                <div style={{ padding: "18px 22px", fontSize: 14, color: "#FFFFFF" }}>프리미엄</div>
              </div>
              {COMPARE_ROWS.map((row, i) => (
                <div
                  key={row[0]}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1.2fr 1fr 1fr 1fr",
                    borderBottom: i === COMPARE_ROWS.length - 1 ? undefined : "1px solid #F0E3E6",
                  }}
                >
                  <div style={{ padding: "18px 22px", fontSize: 14, color: "#6B5A60" }}>{row[0]}</div>
                  <div style={{ padding: "18px 22px", fontSize: 15, color: row[1] === "해당 없음" ? "#9A8189" : undefined }}>{row[1]}</div>
                  <div style={{ padding: "18px 22px", fontSize: 15 }}>{row[2]}</div>
                  <div style={{ padding: "18px 22px", fontSize: 15 }}>{row[3]}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ background: "#FFFFFF", border: "1px solid #E7D5DA", borderRadius: 4, padding: "clamp(22px,4vw,30px) clamp(20px,4vw,32px)", marginTop: 22 }}>
            <h3 style={{ fontFamily: fontSerif, fontSize: 17, fontWeight: 600, margin: "0 0 18px" }}>추가 비용</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {EXTRA_COSTS.map((c) => (
                <div key={c.label} style={{ display: "flex", flexWrap: "wrap", gap: "4px 14px", alignItems: "baseline" }}>
                  <span style={{ fontSize: 14, color: "#6B5A60", minWidth: 108 }}>{c.label}</span>
                  <span style={{ fontSize: 15, color: "#33232A" }}>{c.value}</span>
                  {c.note && <span style={{ fontSize: 13, lineHeight: 1.8, color: "#9A8189", flex: "1 1 260px" }}>{c.note}</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section style={{ padding: "clamp(56px,9vw,90px) clamp(18px,5vw,24px)" }}>
        <div style={{ maxWidth: 980, margin: "0 auto" }}>
          <SectionEyebrow>RECORDING</SectionEyebrow>
          <h2 style={{ fontFamily: fontSerif, fontSize: "clamp(24px,5.2vw,33px)", fontWeight: 600, margin: "0 0 14px", letterSpacing: "-0.02em", textAlign: "center" }}>
            기록 방식
          </h2>
          <p style={{ fontSize: 15, lineHeight: 1.9, color: "#6B5A60", margin: "0 0 34px", textAlign: "center" }}>
            두 가지 중 고르실 수 있습니다. 둘 다 추가 요금이 없습니다.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%,300px),1fr))", gap: 18 }}>
            {RECORDING.map((r) => (
              <div key={r.name} style={{ background: "#FFFFFF", border: "1px solid #E7D5DA", borderRadius: 6, padding: "clamp(26px,4vw,34px) clamp(22px,4vw,32px)" }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 16 }}>
                  <h3 style={{ fontFamily: fontSerif, fontSize: 19, fontWeight: 600, margin: 0 }}>{r.name}</h3>
                  <span style={{ fontSize: 12, color: "#A9647E", letterSpacing: "0.1em" }}>{r.tag}</span>
                </div>
                <p style={{ fontSize: 14.5, lineHeight: 1.9, color: "#4A3B41", margin: "0 0 14px" }}>{r.body}</p>
                <div style={{ background: "#FAF4F5", borderRadius: 4, padding: "14px 16px" }}>
                  <p style={{ fontSize: 12, color: "#9A8189", margin: "0 0 6px", letterSpacing: "0.06em" }}>책임 범위</p>
                  <p style={{ fontSize: 14, lineHeight: 1.8, color: "#4A3B41", margin: r.caveat ? "0 0 8px" : 0 }}>{r.responsibility}</p>
                  {r.caveat && <p style={{ fontSize: 13, lineHeight: 1.8, color: "#9A8189", margin: 0 }}>{r.caveat}</p>}
                </div>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 13.5, lineHeight: 1.9, color: "#9A8189", margin: "22px 0 0" }}>
            기록 방식은 예식 7일 전 사전 통화까지 바꾸실 수 있고, 예식 당일에는 바꿀 수 없습니다.
          </p>
        </div>
      </section>

      <section style={{ padding: "clamp(30px,6vw,60px) clamp(18px,5vw,24px) clamp(40px,7vw,70px)" }}>
        <div
          data-mq="split"
          style={{ maxWidth: 980, margin: "0 auto", display: "grid", gridTemplateColumns: "minmax(0,1.15fr) minmax(0,1fr)", gap: 22, alignItems: "stretch" }}
        >
          <div style={{ background: "#33232A", borderRadius: 6, padding: "clamp(28px,5vw,44px) clamp(22px,5vw,40px)" }}>
            <div style={{ display: "inline-block", background: "#A9647E", color: "#FFFFFF", fontSize: 12, letterSpacing: "0.14em", padding: "6px 14px", borderRadius: 999, marginBottom: 22 }}>
              EVENT
            </div>
            <h2 style={{ fontFamily: fontSerif, fontSize: 28, fontWeight: 600, color: "#FFFFFF", margin: "0 0 16px", lineHeight: 1.45, letterSpacing: "-0.02em" }}>
              블로그 후기 작성하면
              <br />결제 금액의 10% 페이백
            </h2>
            <p style={{ fontSize: 15, lineHeight: 1.9, color: "#F3E9EB", margin: "0 0 28px" }}>
              예식 후 서비스 이용 후기를 블로그에 남겨주시면, 실제 결제하신 금액의 10%를 계좌로 돌려드립니다.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "flex", gap: 12, fontSize: 14, color: "#F3E9EB", lineHeight: 1.7 }}>
                <span style={{ color: "#E9CAD1" }}>01</span>
                <span>예식 후 30일 이내, 사진 3장 이상 + 500자 이상 포스팅</span>
              </div>
              <div style={{ display: "flex", gap: 12, fontSize: 14, color: "#F3E9EB", lineHeight: 1.7 }}>
                <span style={{ color: "#E9CAD1" }}>02</span>
                <span>게시글 링크를 카카오톡 채널 또는 이메일로 전달</span>
              </div>
              <div style={{ display: "flex", gap: 12, fontSize: 14, color: "#F3E9EB", lineHeight: 1.7 }}>
                <span style={{ color: "#E9CAD1" }}>03</span>
                <span>확인 후 영업일 기준 5일 내 지정 계좌로 입금</span>
              </div>
            </div>
            <p style={{ fontSize: 12, lineHeight: 1.8, color: "#B79AA3", margin: "24px 0 0" }}>
              ※ 포스팅은 최소 6개월간 유지되어야 하며, 1건의 예식당 1회 지급됩니다.
            </p>
          </div>

          <div style={{ background: "#FFFFFF", border: "1px solid #E7D5DA", borderRadius: 6, padding: "clamp(28px,5vw,44px) clamp(22px,5vw,40px)" }}>
            <p style={{ fontFamily: fontDisplay, fontSize: 13, letterSpacing: "0.34em", color: "#A9647E", margin: "0 0 14px" }}>PAYMENT</p>
            <h2 style={{ fontFamily: fontSerif, fontSize: 26, fontWeight: 600, margin: "0 0 18px", lineHeight: 1.45, letterSpacing: "-0.02em" }}>
              서비스 결제 10만원,
              <br />나머지는 전달 직전 현장에서
            </h2>
            <p style={{ fontSize: 15, lineHeight: 1.9, color: "#6B5A60", margin: "0 0 28px" }}>
              요금제와 상관없이 서비스 결제 금액은 10만원입니다. 서비스 예약 시 카드로 결제하시면 예약이 확정됩니다 (KG이니시스 구매안전서비스). 예식 당일, 축의금을 전달드리기 직전에 남은 서비스 대금을 현장에서 결제합니다.
            </p>
            <div style={{ display: "flex", gap: 12, marginBottom: 22, flexWrap: "wrap" }}>
              <div style={{ flex: "1 1 140px", background: "#F7F3EA", borderRadius: 4, padding: 20 }}>
                <div style={{ fontSize: 12, color: "#9A8189", marginBottom: 8 }}>서비스 결제</div>
                <div style={{ fontFamily: fontSerif, fontSize: 26, fontWeight: 600 }}>10만원</div>
                <div style={{ fontSize: 13, color: "#6B5A60", marginTop: 6 }}>카드 결제 · 예약 확정</div>
              </div>
              <div style={{ flex: "1 1 140px", background: "#F7F3EA", borderRadius: 4, padding: 20 }}>
                <div style={{ fontSize: 12, color: "#9A8189", marginBottom: 8 }}>예식 당일</div>
                <div style={{ fontFamily: fontSerif, fontSize: 26, fontWeight: 600 }}>현장 결제</div>
                <div style={{ fontSize: 13, color: "#6B5A60", marginTop: 6 }}>전달 직전 현장 결제</div>
              </div>
            </div>
            <p style={{ fontSize: 12.5, lineHeight: 1.85, color: "#9A8189", margin: 0 }}>
              ※ 현장 결제는 카드 결제 링크 또는 계좌이체로 진행되며 현금영수증을 발행합니다. 결제하실 분은 예약 때 또는 사전 통화 때 지정해 주세요. 인수자로 지정하시면 편합니다.
            </p>
          </div>
        </div>
      </section>

      <section style={{ padding: "clamp(56px,9vw,90px) clamp(18px,5vw,24px)", background: "rgba(255,255,255,0.55)" }}>
        <div style={{ maxWidth: 980, margin: "0 auto" }}>
          <SectionEyebrow>INCLUDED</SectionEyebrow>
          <h2 style={{ fontFamily: fontSerif, fontSize: "clamp(24px,5.2vw,33px)", fontWeight: 600, margin: "0 0 40px", letterSpacing: "-0.02em", textAlign: "center" }}>
            모든 패키지 공통 포함
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%,300px),1fr))", gap: 14 }}>
            {INCLUDED.map((item) => (
              <div key={item} style={{ display: "flex", alignItems: "center", gap: 14, background: "#FFFFFF", border: "1px solid #EEDDE2", borderRadius: 999, padding: "18px 26px" }}>
                <span style={{ flex: "none", color: "#A9647E", fontSize: 15, fontWeight: 700 }}>✓</span>
                <span style={{ fontSize: 15, color: "#473A3F", lineHeight: 1.6 }}>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: "clamp(56px,9vw,90px) clamp(18px,5vw,24px)" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <SectionEyebrow>NOTICE</SectionEyebrow>
          <h2 style={{ fontFamily: fontSerif, fontSize: "clamp(24px,5.2vw,33px)", fontWeight: 600, margin: "0 0 40px", letterSpacing: "-0.02em", textAlign: "center" }}>
            예약 전 확인사항
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {NOTICES.map((n) => (
              <div key={n.title} style={{ background: "#FFFFFF", border: "1px solid #EEDDE2", borderRadius: 8, padding: "clamp(22px,4vw,30px) clamp(20px,4vw,32px)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                  <span style={{ fontSize: 16, color: "#A9647E" }}>{n.icon}</span>
                  <h3 style={{ fontFamily: fontSerif, fontSize: 17, fontWeight: 600, margin: 0 }}>{n.title}</h3>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>{n.body}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        style={{
          padding: "clamp(70px,11vw,110px) clamp(18px,5vw,24px)",
          textAlign: "center",
          backgroundImage: "linear-gradient(rgba(18,18,18,0.58), rgba(35,35,35,0.66)), url('/img/couple.jpeg')",
          backgroundSize: "cover",
          backgroundPosition: "center 30%",
        }}
      >
        <h2 style={{ fontFamily: fontSerif, fontSize: "clamp(24px,5.6vw,34px)", fontWeight: 600, color: "#FFFFFF", margin: "0 0 18px", lineHeight: 1.5, letterSpacing: "-0.02em" }}>날짜만 정하시면 됩니다</h2>
        <p style={{ fontSize: 16, lineHeight: 1.9, color: "#F3E9EB", margin: "0 0 34px" }}>온라인에서 예약과 결제까지 3분이면 끝납니다.</p>
        <OpenModalButton
          plan="standard"
          className="btn-ivory-hover"
          style={{ background: "#F3E9EB", color: "#33232A", padding: "18px 44px", border: "none", borderRadius: 999, fontSize: 16, fontWeight: 500, cursor: "pointer" }}
        >
          예약하기
        </OpenModalButton>
      </section>

      <Footer />
    </div>
  );
}
