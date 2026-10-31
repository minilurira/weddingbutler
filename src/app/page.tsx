import Image from "next/image";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Reveal } from "@/components/Reveal";
import { OpenModalButton } from "@/components/OpenModalButton";
import { FaqAccordion } from "@/components/home/FaqAccordion";
import { PriceTeaserCards } from "@/components/home/PriceTeaserCards";
import { ReviewMarquee } from "@/components/home/ReviewMarquee";
import { RecordShowcase } from "@/components/home/RecordShowcase";
import Link from "next/link";
import { fontDisplay, fontSerif } from "@/lib/style";
import { HOME_FAQS } from "@/lib/home-faq";

const SERVICE_STEPS = [
  "축의금 접수 및 방명록 안내 · 답례품 전달",
  "식권 배부 및 하객 동선 안내",
  "받은 봉투는 즉시 번호를 붙여 잠금 가방에 보관 · 2인 교차 검수",
  "성명·봉투 번호·신랑/신부측 엑셀 리포트 (개봉 집계 시 금액 포함)",
  "지정하신 인수자께 직접 전달 · 인계확인서 서명",
];

const HOW_IT_WORKS = [
  { n: "1", tag: "ONLINE", title: "날짜 선택 · 결제", body: "홈페이지에서 예식 날짜와 시간, 요금제를 고르고 바로 결제하면 예약이 확정됩니다." },
  { n: "2", tag: "D-7", title: "사전 상담", body: "담당 매니저가 예식장 구조, 답례품, 양가 요청사항을 전화·카카오톡으로 확인합니다." },
  { n: "3", tag: "D-DAY", title: "현장 운영", body: "예식 1시간 전 도착해 접수대를 세팅합니다. 받은 식권을 함께 세고 시작하며, 봉투를 받는 즉시 번호를 붙이고 기록합니다." },
  { n: "4", tag: "FINISH", title: "정산 · 인계", body: "버틀러 2명이 번호·장부·봉투 매수를 맞춰 보고, 남은 금액이 있으면 현장 결제 후 지정하신 인수자께 직접 전달합니다." },
];

const REVIEWS = [
  {
    quote: "현금이 많이 오가는 자리라 내심 불안했는데, 2인 교차 검수에 카메라 기록까지 철저하게 진행해 주셔서 마음 푹 놓고 예식에만 집중할 수 있었습니다.",
    who: "김○○ · 신랑",
    tag: "스탠다드 · 여의도",
  },
  {
    quote: "부모님께서 처음엔 대행 서비스를 낯설어하셨는데, 단정한 정장 차림과 호텔급 응대를 보시고는 하객 대접을 제대로 했다며 가장 만족해하셨어요.",
    who: "최○○ · 신부",
    tag: "프리미엄 · 수원",
  },
  {
    quote: "소규모 웨딩이라 지인에게 접수대를 부탁하기가 참 미안했어요. 스몰케어 요금제로 부담 없이 이용했는데, 식권 배부부터 답례품 안내까지 완벽했습니다.",
    who: "강○○ · 신부",
    tag: "스몰케어 · 성동",
  },
  {
    quote: "식이 끝나고 바로 받아본 엑셀 리포트 덕분에 양가 정산이 10분 만에 끝났습니다. 지정해 둔 가족에게 안전하게 인계해 주셔서 정말 든든했어요.",
    who: "윤○○ · 신랑",
    tag: "스탠다드 · 송파",
  },
  {
    quote: "접수대에 서면 밥도 제대로 못 먹는 경우가 많은데, 웨딩버틀러 덕분에 제 친구들도 편하게 식을 즐길 수 있어서 미안함을 덜었습니다.",
    who: "홍○○ · 신부",
    tag: "스탠다드 · 분당",
  },
  {
    quote:
      "사촌동생에게 부탁하려다 웨딩버틀러로 바꿨는데, 그날 제일 잘한 선택이었어요. 하객분들이 축의대가 호텔 같다고 하시더라고요.",
    who: "이○○ · 신부",
    tag: "스탠다드 · 강남",
  },
  {
    quote:
      "양가 축의대를 따로 운영했는데 리포트가 엑셀로 정리돼서 나와 답례 인사 돌릴 때 정말 편했습니다. 금액 차이도 1원 없이 맞았어요.",
    who: "박○○ · 신랑",
    tag: "프리미엄 · 판교",
  },
  {
    quote: "홈페이지에서 날짜 고르고 결제까지 5분 만에 끝났어요. 예식 일주일 전 매니저님 전화 상담도 꼼꼼해서 안심됐습니다.",
    who: "정○○ · 신부",
    tag: "스몰케어 · 일산",
  },
];

const FAQ_LD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: HOME_FAQS.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
};

const SEOUL_TAGS = ["강남 · 서초", "송파 · 강동", "여의도 · 영등포", "종로 · 중구", "마포 · 서대문", "용산 · 성동", "노원 · 강북", "그 외 전 지역"];
const GYEONGGI_TAGS = ["성남 · 분당", "수원 · 용인", "고양 · 파주", "부천 · 광명", "안양 · 과천", "하남 · 남양주", "화성 · 평택", "그 외 전 지역"];

export default function HomePage() {
  return (
    <div style={{ width: "100%", overflowX: "hidden", background: "#F3E9EB" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_LD) }} />
      <Header />

      <section id="top" data-mq="hero" className="hero">
        <div className="hero-bg" aria-hidden="true" />
        <div className="hero-inner" style={{ maxWidth: 1180, margin: "0 auto", width: "100%" }}>
          <Reveal style={{ maxWidth: 580 }}>
            <p className="hero-eyebrow" style={{ fontFamily: fontDisplay, color: "#E9CAD1", margin: 0 }}>
              FOR YOUR MOST PRECIOUS DAY
            </p>
            <h1 className="hero-title" style={{ fontFamily: fontSerif, fontWeight: 400, color: "#FFFFFF", margin: 0, letterSpacing: "-0.02em" }}>
              <span className="hero-kicker" style={{ display: "block", fontWeight: 500, letterSpacing: "0.04em", color: "#E9CAD1" }}>
                축의대행 · 축의대대행 웨딩버틀러
              </span>
              축의대는 맡기고,
              <br />
              <span style={{ color: "#F2D3DB" }}>두 분은 웃기만 하세요</span>
            </h1>
            <p className="hero-desc" style={{ color: "rgba(255,255,255,0.84)", margin: 0, maxWidth: 470 }}>
              전문 교육을 받은 웨딩버틀러가 축의금 접수부터 정산까지 책임집니다. 가족·친구에게 부탁하지 않아도 되는 가장 깔끔한 방법.
            </p>
            <div className="hero-cta">
              <OpenModalButton
                className="btn-accent-hover"
                style={{ background: "#A9647E", color: "#FFFFFF", padding: "17px 34px", border: "none", borderRadius: 999, fontSize: 16, fontWeight: 500, cursor: "pointer" }}
              >
                날짜 확인하고 예약하기
              </OpenModalButton>
              <a
                href="#price"
                className="btn-outline-hover"
                style={{ border: "1px solid rgba(255,255,255,0.5)", background: "rgba(255,255,255,0.06)", color: "#FFFFFF", padding: "17px 30px", borderRadius: 999, fontSize: 16, fontWeight: 400, textAlign: "center" }}
              >
                요금제 보기
              </a>
            </div>
          </Reveal>
        </div>
        <div className="hero-trust">
          <div>
            {["전문 교육 버틀러", "당일 현장 정산", "서울 · 경기 전 지역"].map((t, i) => (
              <span key={t}>
                <b style={{ fontFamily: fontDisplay }}>{String(i + 1).padStart(2, "0")}</b>
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section data-mq="strip" style={{ background: "#33232A", padding: "22px 24px", overflow: "hidden" }}>
        <div
          style={{
            maxWidth: 1180,
            margin: "0 auto",
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: "14px 44px",
            fontSize: 14,
            color: "#E6D2D8",
            letterSpacing: "0.02em",
          }}
        >
          <span style={{ whiteSpace: "nowrap" }}>· 100% 온라인 예약 · 결제</span>
          <span style={{ whiteSpace: "nowrap" }}>· 실시간 접수 현황</span>
          <span style={{ whiteSpace: "nowrap" }}>· 예식 7일 전까지 전액 환불</span>
        </div>
        <div
          data-mq="strip-dup"
          aria-hidden="true"
          style={{ display: "none", fontSize: 14, color: "#E6D2D8", letterSpacing: "0.02em" }}
        >
          <span style={{ whiteSpace: "nowrap" }}>· 100% 온라인 예약 · 결제</span>
          <span style={{ whiteSpace: "nowrap" }}>· 실시간 접수 현황</span>
          <span style={{ whiteSpace: "nowrap" }}>· 예식 7일 전까지 전액 환불</span>
        </div>
      </section>

      <section id="service" style={{ padding: "clamp(64px,11vw,120px) clamp(18px,5vw,24px)" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto" }}>
          <Reveal style={{ textAlign: "center", marginBottom: 64 }}>
            <p style={{ fontFamily: fontDisplay, fontSize: 14, letterSpacing: "0.4em", color: "#A9647E", margin: "0 0 16px" }}>WHY WEDDING BUTLER</p>
            <h2 style={{ fontFamily: fontSerif, fontSize: "clamp(26px,5vw,38px)", fontWeight: 600, margin: "0 0 18px", letterSpacing: "-0.02em" }}>축의대에 세울 사람, 아직 못 정하셨나요</h2>
            <p style={{ fontSize: 16, lineHeight: 1.9, color: "#6B5A60", margin: 0 }}>가장 바쁜 날, 가장 예민한 자리입니다. 웨딩버틀러가 대신 지킵니다.</p>
          </Reveal>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 22 }}>
            {[
              { n: "01", title: "부탁할 사람이 없어요", body: "사촌·친구에게 반나절을 부탁하고, 답례와 식대까지 챙기는 부담. 예약 한 번으로 정리됩니다.", delay: 50 },
              { n: "02", title: "돈 문제는 예민합니다", body: "2인 1조 교차 검수, 접수부터 전달까지 카메라 기록, 실시간 접수 현황으로 분쟁의 여지를 없앱니다.", delay: 150 },
              { n: "03", title: "첫인상은 축의대에서", body: "호텔 서비스 기준의 응대 교육을 이수한 매니저가 정장·화이트 글러브 차림으로 하객을 맞이합니다.", delay: 250 },
            ].map((c) => (
              <Reveal key={c.n} delay={c.delay}>
                <div className="card-hover-border card-glow" style={{ background: "#FFFFFF", border: "1px solid #E7D5DA", borderRadius: 4, padding: "40px 34px", animationDelay: `${(c.delay - 50) * 5}ms` }}>
                  <div style={{ fontFamily: fontDisplay, fontSize: 34, color: "#E9CAD1", lineHeight: 1 }}>{c.n}</div>
                  <h3 style={{ fontFamily: fontSerif, fontSize: 21, fontWeight: 600, margin: "20px 0 14px" }}>{c.title}</h3>
                  <p style={{ fontSize: 15, lineHeight: 1.95, color: "#6B5A60", margin: 0 }}>{c.body}</p>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%,320px), 1fr))",
              gap: "clamp(32px,5vw,56px)",
              alignItems: "center",
              marginTop: "clamp(56px,9vw,96px)",
            }}
          >
            <div style={{ borderRadius: 4, overflow: "hidden", minHeight: "clamp(240px,50vw,380px)", position: "relative" }}>
              <Image src="/img/butlers.jpeg" alt="웨딩버틀러 현장 응대" fill style={{ objectFit: "cover" }} sizes="(max-width: 768px) 100vw, 50vw" />
            </div>
            <div>
              <p style={{ fontFamily: fontDisplay, fontSize: 14, letterSpacing: "0.4em", color: "#A9647E", margin: "0 0 18px" }}>SERVICE SCOPE</p>
              <h2 style={{ fontFamily: fontSerif, fontSize: "clamp(24px,4.8vw,34px)", fontWeight: 600, margin: "0 0 30px", lineHeight: 1.4, letterSpacing: "-0.02em" }}>
                예식 당일, 이 모든 것을
                <br />대신 해드립니다
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {SERVICE_STEPS.map((step, i) => (
                  <div
                    key={step}
                    style={{
                      display: "flex",
                      gap: 16,
                      padding: "16px 0",
                      borderTop: "1px solid #E7D5DA",
                      borderBottom: i === SERVICE_STEPS.length - 1 ? "1px solid #E7D5DA" : undefined,
                    }}
                  >
                    <span style={{ fontFamily: fontDisplay, color: "#A9647E", fontSize: 15, minWidth: 26 }}>{String(i + 1).padStart(2, "0")}</span>
                    <span style={{ fontSize: 15, lineHeight: 1.7, color: "#473A3F" }}>{step}</span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section id="flow" style={{ padding: "clamp(64px,10vw,110px) clamp(18px,5vw,24px)", backgroundColor: "#FFFFFFBC" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto" }}>
          <Reveal style={{ textAlign: "center", marginBottom: 60 }}>
            <p style={{ fontFamily: fontDisplay, fontSize: 14, letterSpacing: "0.4em", color: "#A9647E", margin: "0 0 16px" }}>HOW IT WORKS</p>
            <h2 style={{ fontFamily: fontSerif, fontSize: "clamp(26px,5vw,38px)", fontWeight: 600, margin: 0, letterSpacing: "-0.02em" }}>예약부터 정산까지, 네 단계</h2>
          </Reveal>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: 20 }}>
            {HOW_IT_WORKS.map((s, i) => (
              <Reveal key={s.n} delay={50 + i * 100}>
                <div style={{ background: "#F3E9EB", borderRadius: 4, padding: "34px 28px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
                    <span style={{ width: 30, height: 30, borderRadius: "50%", background: "#A9647E", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>
                      {s.n}
                    </span>
                    <span style={{ fontSize: 12, letterSpacing: "0.2em", color: "#9A8189" }}>{s.tag}</span>
                  </div>
                  <h3 style={{ fontFamily: fontSerif, fontSize: 19, fontWeight: 600, margin: "0 0 12px" }}>{s.title}</h3>
                  <p style={{ fontSize: 14, lineHeight: 1.85, color: "#6B5A60", margin: 0 }}>{s.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <RecordShowcase />

      <section
        id="price"
        data-mq="parallax"
        style={{
          padding: "clamp(64px,11vw,120px) clamp(18px,5vw,24px)",
          backgroundImage: "linear-gradient(rgba(243,233,235,0.72), rgba(243,233,235,0.82)), url('/img/hall.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        }}
      >
        <div style={{ maxWidth: 1180, margin: "0 auto" }}>
          <Reveal style={{ textAlign: "center", marginBottom: 56 }}>
            <p style={{ fontFamily: fontDisplay, fontSize: 14, letterSpacing: "0.4em", color: "#A9647E", margin: "0 0 16px" }}>PRICE</p>
            <h2 style={{ fontFamily: fontSerif, fontSize: "clamp(26px,5vw,38px)", fontWeight: 600, margin: "0 0 16px", letterSpacing: "-0.02em" }}>하객 규모에 맞춰 고르세요</h2>
            <p style={{ fontSize: 15, lineHeight: 1.9, color: "#6B5A60", margin: 0 }}>모든 금액은 부가세 포함입니다. 자세한 금액과 비교표는 가격 안내 페이지에서 확인하세요.</p>
          </Reveal>

          <PriceTeaserCards />

          <p style={{ textAlign: "center", fontSize: 13, color: "#9A8189", margin: "32px 0 0", lineHeight: 1.8 }}>
            추가 하객 요금은 예식 후 실제 접수 인원 기준으로 정산되며, 차액은 예식 다음 영업일에 청구됩니다.
          </p>
          <div style={{ textAlign: "center", marginTop: 38 }}>
            <a
              href="/pricing"
              className="btn-dark-hover"
              style={{ display: "inline-block", color: "#F3E9EB", padding: "18px 46px", borderRadius: 999, fontSize: 16, fontWeight: 500, backgroundColor: "#33232A" }}
            >
              요금제 자세히보기
            </a>
          </div>
        </div>
      </section>

      <section id="area" style={{ padding: "clamp(64px,10vw,110px) clamp(18px,5vw,24px)", backgroundColor: "#FFFFFFC0" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto" }}>
          <Reveal style={{ textAlign: "center", marginBottom: 56 }}>
            <p style={{ fontFamily: fontDisplay, fontSize: 14, letterSpacing: "0.4em", color: "#A9647E", margin: "0 0 16px" }}>SERVICE AREA</p>
            <h2 style={{ fontFamily: fontSerif, fontSize: "clamp(26px,5vw,38px)", fontWeight: 600, margin: "0 0 16px", letterSpacing: "-0.02em" }}>서울 전역 · 경기 전역 출장</h2>
            <p style={{ fontSize: 16, lineHeight: 1.9, color: "#6B5A60", margin: 0 }}>수도권 어느 예식장이든 웨딩버틀러가 찾아갑니다.</p>
          </Reveal>

          <Reveal delay={100} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px,1fr))", gap: 22 }}>
            <AreaCard title="서울 전체" tag="25개 자치구" body="강남·서초 일대 호텔 예식장부터 도심 소규모 웨딩홀까지 모두 가능합니다." tags={SEOUL_TAGS} />
            <AreaCard title="경기 전체" tag="31개 시·군" body="분당·판교 본사를 중심으로 경기 전역에 매니저를 배정합니다." tags={GYEONGGI_TAGS} />
            <div style={{ background: "#33232A", borderRadius: 4, padding: "40px 34px", display: "flex", flexDirection: "column", justifyContent: "center", gap: 26 }}>
              <AreaStat icon="1h" title="예식 1시간 전 도착" sub="접수대 세팅과 식권 확인까지" />
              <AreaStat icon="56" title="서울 25구 + 경기 31시·군" sub="수도권 전 지역 상시 운영" />
              <AreaStat icon="+" title="그 외 지역도 문의 가능" sub="인천·충청권은 개별 협의" />
            </div>
          </Reveal>

          <p style={{ textAlign: "center", fontSize: 13, color: "#9A8189", margin: "28px 0 0", lineHeight: 1.8 }}>
            ※ 본사(성남 분당) 기준 이동 거리에 따라 출장비가 추가될 수 있으며, 금액은 예약 후 사전 상담 시 안내드립니다.
          </p>
        </div>
      </section>

      <section id="review" style={{ padding: "clamp(64px,11vw,120px) 0" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "0 clamp(18px,5vw,24px)" }}>
          <Reveal style={{ textAlign: "center", marginBottom: 56 }}>
            <p style={{ fontFamily: fontDisplay, fontSize: 14, letterSpacing: "0.4em", color: "#A9647E", margin: "0 0 16px" }}>REAL REVIEWS</p>
            <h2 style={{ fontFamily: fontSerif, fontSize: "clamp(26px,5vw,38px)", fontWeight: 600, margin: 0, letterSpacing: "-0.02em" }}>예식을 마친 부부들의 이야기</h2>
          </Reveal>
        </div>
        <ReviewMarquee reviews={REVIEWS} />
      </section>

      <section id="guide" style={{ padding: "clamp(60px,9vw,100px) clamp(18px,5vw,24px)" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <Reveal style={{ textAlign: "center", marginBottom: 36 }}>
            <p style={{ fontFamily: fontDisplay, fontSize: 14, letterSpacing: "0.4em", color: "#A9647E", margin: "0 0 16px" }}>GUIDE</p>
            <h2 style={{ fontFamily: fontSerif, fontSize: "clamp(24px,5vw,34px)", fontWeight: 600, margin: "0 0 14px", letterSpacing: "-0.02em", lineHeight: 1.45 }}>축의대대행 · 축의대행,<br />무료 모바일청첩장까지 안내해 드려요</h2>
            <p style={{ margin: 0, fontSize: 15.5, lineHeight: 1.9, color: "#6B5A60" }}>축의대행이 무엇인지, 비용과 인원은 어떻게 정해지는지, 무료 모바일청첩장은 어떻게 만드는지 모았습니다.</p>
          </Reveal>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%,270px),1fr))", gap: 12 }}>
            {[
              ["/guide/what-is-chuiuldaehaeng", "축의대행이란? 축의대대행이 하는 일"],
              ["/guide/cost", "축의대행 가격 비교와 비용 계산"],
              ["/guide/how-many-staff", "하객 수별 축의대 인원"],
              ["/guide/vs-friend", "축의대행 vs 지인에게 부탁"],
              ["/guide/free-mobile-invitation", "무료 모바일청첩장 만들기"],
              ["/guide/invitation-greeting-examples", "모바일 청첩장 문구 예시"],
            ].map(([href, label]) => (
              <Link key={href} href={href} style={{ display: "block", background: "#FFFFFF", border: "1px solid #EFE0E4", borderRadius: 4, padding: "18px 20px", fontSize: 15.5, color: "#33232A", fontWeight: 500 }}>{label} <span aria-hidden="true" style={{ color: "#A9647E" }}>→</span></Link>
            ))}
          </div>
          <p style={{ textAlign: "center", margin: "22px 0 0", fontSize: 14 }}><Link href="/guide" style={{ color: "#8E4E68", textDecoration: "underline" }}>가이드 전체 보기</Link></p>
        </div>
      </section>

      <section id="faq" style={{ padding: "clamp(64px,10vw,110px) clamp(18px,5vw,24px) clamp(70px,11vw,120px)", backgroundColor: "#FFFFFFBE" }}>
        <div style={{ maxWidth: 820, margin: "0 auto" }}>
          <Reveal style={{ textAlign: "center", marginBottom: 44 }}>
            <p style={{ fontFamily: fontDisplay, fontSize: 14, letterSpacing: "0.4em", color: "#A9647E", margin: "0 0 16px" }}>FAQ</p>
            <h2 style={{ fontFamily: fontSerif, fontSize: "clamp(24px,5vw,34px)", fontWeight: 600, margin: 0, letterSpacing: "-0.02em" }}>자주 묻는 질문</h2>
          </Reveal>
          <FaqAccordion />
        </div>
      </section>

      <section
        style={{
          position: "relative",
          padding: "clamp(76px,12vw,130px) clamp(18px,5vw,24px)",
          backgroundImage: "linear-gradient(rgba(18,18,18,0.58), rgba(35,35,35,0.66)), url('/img/couple.jpeg')",
          backgroundSize: "cover",
          backgroundPosition: "center 30%",
        }}
      >
        <div style={{ maxWidth: 760, margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontFamily: fontSerif, fontSize: "clamp(26px,5.4vw,38px)", fontWeight: 600, color: "#FFFFFF", margin: "0 0 20px", lineHeight: 1.5, letterSpacing: "-0.02em" }}>
            가장 행복한 날의 걱정 하나,
            <br />저희가 덜어드릴게요
          </h2>
          <p style={{ fontSize: 16, lineHeight: 1.9, color: "#F3E9EB", margin: "0 0 36px" }}>지금 날짜를 확인하고 예약하시면 담당 매니저가 24시간 내 연락드립니다.</p>
          <OpenModalButton
            className="btn-ivory-hover"
            style={{ display: "inline-block", color: "#33232A", padding: "18px 44px", border: "none", borderRadius: 999, fontSize: 16, fontWeight: 500, backgroundColor: "#F3E9EBC2", cursor: "pointer" }}
          >
            날짜 확인하고 예약하기
          </OpenModalButton>
        </div>
      </section>

      <Footer full />
    </div>
  );
}

function AreaCard({ title, tag, body, tags }: { title: string; tag: string; body: string; tags: string[] }) {
  return (
    <div style={{ background: "#FFFFFF", border: "1px solid #E7D5DA", borderRadius: 4, padding: "40px 34px" }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 8 }}>
        <h3 style={{ fontFamily: fontSerif, fontSize: 24, fontWeight: 600, margin: 0 }}>{title}</h3>
        <span style={{ fontSize: 13, color: "#A9647E" }}>{tag}</span>
      </div>
      <p style={{ fontSize: 14, lineHeight: 1.8, color: "#6B5A60", margin: "0 0 24px" }}>{body}</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {tags.map((t, i) => (
          <span
            key={t}
            style={{
              fontSize: 13,
              color: i === tags.length - 1 ? "#9A8189" : "#473A3F",
              background: "#F7F3EA",
              borderRadius: 999,
              padding: "8px 14px",
            }}
          >
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

function AreaStat({ icon, title, sub }: { icon: string; title: string; sub?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
      <span
        style={{
          width: 46,
          height: 46,
          borderRadius: "50%",
          background: "rgba(233,202,209,0.18)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: fontDisplay,
          fontSize: 17,
          color: "#E9CAD1",
        }}
      >
        {icon}
      </span>
      <div>
        <div style={{ fontSize: 15, color: "#FFFFFF" }}>{title}</div>
        {sub && <div style={{ fontSize: 13, color: "#B79AA3", marginTop: 4 }}>{sub}</div>}
      </div>
    </div>
  );
}
