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
    prefix: null as string | null,
    dark: false,
    bullets: ["하객 200명 이하 예식", "웨딩버틀러 2명 배정", "추가 하객 1명당 2,000원", "실시간 집계 리포트 제공"],
  },
  {
    plan: "standard" as const,
    eyebrow: "02 STANDARD",
    name: "스탠다드",
    priceWhole: "45",
    prefix: null as string | null,
    dark: true,
    bullets: ["하객 200명 초과 ~ 300명 이하", "웨딩버틀러 2명 배정", "추가 하객 1명당 2,000원", "버틀러 추가 1명당 10만원"],
  },
  {
    plan: "premium" as const,
    eyebrow: "03 PREMIUM",
    name: "프리미엄",
    priceWhole: "80",
    prefix: "부터",
    dark: false,
    bullets: ["양가 하객 각 200명 기준", "웨딩버틀러 4명 배정 (양가 2명씩)", "추가 하객 1명당 2,000원", "버틀러 추가 1명당 10만원"],
  },
];

const COMPARE_ROWS: [string, string, string, string][] = [
  ["기본 요금", "39만원", "45만원", "80만원~"],
  ["기준 하객", "200명 이하", "300명 이하", "양가 각 200명"],
  ["배정 버틀러", "2명", "2명", "4명"],
  ["추가 하객", "1명당 2,000원", "1명당 2,000원", "1명당 2,000원"],
  ["버틀러 추가", "해당 없음", "1명 10만원", "1명 10만원"],
];

const INCLUDED = [
  "축의금 접수 및 실시간 집계",
  "방명록 안내 · 정리",
  "식권 배부 및 수량 관리",
  "답례품 전달 안내",
  "2인 교차 검수 정산",
  "엑셀 리포트 당일 전달",
  "현금영수증 발행 대행",
  "영업배상책임보험 가입",
];

const NOTICES: { icon: string; title: string; body: React.ReactNode }[] = [
  {
    icon: "◷",
    title: "예약 및 결제",
    body: (
      <>
        <NoticeItem>전체 금액의 50%를 선결제하시면 예약이 확정됩니다.</NoticeItem>
        <NoticeItem>잔금 50%는 예식 종료 후 정산 내역 확인 뒤 결제해 주세요.</NoticeItem>
        <NoticeItem>추가 하객·추가 버틀러 요금은 잔금 결제 시 함께 청구됩니다.</NoticeItem>
        <NoticeItem>현금영수증·세금계산서는 잔금 결제 후 다음 영업일에 처리됩니다.</NoticeItem>
      </>
    ),
  },
  {
    icon: "↺",
    title: "취소 및 환불",
    body: (
      <>
        <NoticeItem>예식 7일 전까지 전액 환불, 3일 전까지 50% 환불됩니다.</NoticeItem>
        <NoticeItem>예식 2일 전부터는 인력 배정이 확정되어 환불이 어렵습니다.</NoticeItem>
        <NoticeItem>예식장 사정에 따른 일정 연기는 1회 무료로 변경해 드립니다.</NoticeItem>
      </>
    ),
  },
  {
    icon: "!",
    title: "사전 확인 필수",
    body: (
      <>
        <NoticeItem>접수대 운영에 테이블·의자·전원 확보가 필요하니, 예식장에 설치 가능 여부를 확인해 주세요.</NoticeItem>
        <NoticeItem>예식 3일 전까지 식순·하객 예상 인원·답례품 수량을 알려주셔야 정상 운영이 가능합니다.</NoticeItem>
      </>
    ),
  },
  {
    icon: "⌸",
    title: "하객 인원 기준",
    body: (
      <>
        <NoticeLabel>기본 보장 인원</NoticeLabel>
        <div style={{ display: "flex", flexDirection: "column", gap: 9, marginBottom: 20 }}>
          <NoticeItem>스몰케어 · 스탠다드 — 버틀러 2명, 하객 200 ~ 300명</NoticeItem>
          <NoticeItem>프리미엄 — 버틀러 4명, 양가 각 200명</NoticeItem>
        </div>
        <NoticeLabel>인원 초과 시</NoticeLabel>
        <div style={{ display: "flex", flexDirection: "column", gap: 9, marginBottom: 20 }}>
          <NoticeItem>보장 인원 초과 시 1명당 2,000원이 추가됩니다.</NoticeItem>
          <NoticeItem>스탠다드 300명 초과 시 버틀러 1명 추가가 필요합니다.</NoticeItem>
          <NoticeItem>프리미엄 양가 각 250명 초과 시 버틀러 1명 추가가 필요합니다.</NoticeItem>
        </div>
        <div style={{ background: "#FAF4F5", borderRadius: 6, padding: "18px 20px" }}>
          <NoticeLabel muted>예시</NoticeLabel>
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            <NoticeItem small>스몰케어 230명 → 30명 초과, 6만원 추가</NoticeItem>
            <NoticeItem small>스탠다드 320명 → 20명 초과 4만원 + 버틀러 1명 추가 10만원</NoticeItem>
            <NoticeItem small>프리미엄 양가 각 260명 → 120명 초과 24만원 + 버틀러 1명 10만원</NoticeItem>
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
        <NoticeItem>본인·혼주 외 제3자의 축의금 수령 요청은 확인 절차 후에만 진행되며, 하객 요청에 따른 예외 처리 시에는 별도로 안내드립니다.</NoticeItem>
        <NoticeItem>서비스 지역은 수도권 기준이며, 그 외 지역은 출장 가능 여부를 별도로 문의해 주세요.</NoticeItem>
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
                {c.prefix && <span style={{ fontSize: 16, color: "#9A8189" }}>{c.prefix}</span>}
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
          <p style={{ fontSize: 13, lineHeight: 1.9, color: "#9A8189", margin: "22px 0 0" }}>
            추가 하객 요금은 예식 후 실제 접수 인원 기준으로 정산되며, 차액은 예식 다음 영업일에 청구·환불됩니다. 모든 요금에는 출장비와 리포트 제공이 포함되어 있습니다.
          </p>
        </div>
      </section>

      <section style={{ padding: "clamp(56px,9vw,90px) clamp(18px,5vw,24px) 0" }}>
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
              50% 선결제,
              <br />잔금은 예식이 끝난 뒤에
            </h2>
            <p style={{ fontSize: 15, lineHeight: 1.9, color: "#6B5A60", margin: "0 0 28px" }}>
              예약 시 전체 금액의 50%만 결제하시면 예약이 확정됩니다. 나머지 50%는 예식 종료 후 정산 내역을 확인하고 결제하시면 됩니다.
            </p>
            <div style={{ display: "flex", gap: 12, marginBottom: 22, flexWrap: "wrap" }}>
              <div style={{ flex: 1, background: "#F7F3EA", borderRadius: 4, padding: 20 }}>
                <div style={{ fontSize: 12, color: "#9A8189", marginBottom: 8 }}>예약 시</div>
                <div style={{ fontFamily: fontSerif, fontSize: 26, fontWeight: 600 }}>50%</div>
                <div style={{ fontSize: 13, color: "#6B5A60", marginTop: 6 }}>선결제 · 예약 확정</div>
              </div>
              <div style={{ flex: 1, background: "#F7F3EA", borderRadius: 4, padding: 20 }}>
                <div style={{ fontSize: 12, color: "#9A8189", marginBottom: 8 }}>예식 종료 후</div>
                <div style={{ fontFamily: fontSerif, fontSize: 26, fontWeight: 600 }}>50%</div>
                <div style={{ fontSize: 13, color: "#6B5A60", marginTop: 6 }}>잔금 · 추가분 합산</div>
              </div>
            </div>
            <p style={{ fontSize: 12, lineHeight: 1.8, color: "#9A8189", margin: 0 }}>
              ※ 추가 하객·추가 버틀러 요금은 잔금 결제 시 함께 청구됩니다. 잔금은 예식 다음 영업일까지 결제해 주세요.
            </p>
          </div>
        </div>
      </section>

      <section style={{ padding: "clamp(56px,9vw,90px) clamp(18px,5vw,24px)", background: "rgba(255,255,255,0.55)" }}>
        <div style={{ maxWidth: 980, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14, marginBottom: 14 }}>
            <span style={{ display: "block", width: 26, height: 1, background: "#CBA9B4" }} />
            <span style={{ fontFamily: fontDisplay, fontSize: 13, letterSpacing: "0.4em", color: "#A9647E" }}>INCLUDED</span>
            <span style={{ display: "block", width: 26, height: 1, background: "#CBA9B4" }} />
          </div>
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
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14, marginBottom: 14 }}>
            <span style={{ display: "block", width: 26, height: 1, background: "#CBA9B4" }} />
            <span style={{ fontFamily: fontDisplay, fontSize: 13, letterSpacing: "0.4em", color: "#A9647E" }}>NOTICE</span>
            <span style={{ display: "block", width: 26, height: 1, background: "#CBA9B4" }} />
          </div>
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
