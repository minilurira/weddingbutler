import Image from "next/image";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Reveal } from "@/components/Reveal";
import { OpenModalButton } from "@/components/OpenModalButton";
import { FaqAccordion } from "@/components/home/FaqAccordion";
import { PriceTeaserCards } from "@/components/home/PriceTeaserCards";
import { fontDisplay, fontSerif } from "@/lib/style";

const SERVICE_STEPS = [
  "축의금 접수 및 방명록 안내 · 답례품 전달",
  "식권 배부 및 하객 동선 안내",
  "봉투 개봉 전 봉인 · 2인 교차 검수 정산",
  "성명·금액 엑셀 리포트 예식 당일 전달",
  "양가 어른께 봉투 인계 및 최종 확인 서명",
];

const HOW_IT_WORKS = [
  { n: "1", tag: "ONLINE", title: "날짜 선택 · 결제", body: "홈페이지에서 예식 날짜와 시간, 요금제를 고르고 바로 결제하면 예약이 확정됩니다." },
  { n: "2", tag: "D-7", title: "사전 상담", body: "담당 매니저가 예식장 구조, 답례품, 양가 요청사항을 전화·카카오톡으로 확인합니다." },
  { n: "3", tag: "D-DAY", title: "현장 운영", body: "예식 1시간 전 도착, 축의대 세팅 후 접수·식권·답례품 응대를 진행합니다." },
  { n: "4", tag: "FINISH", title: "정산 · 인계", body: "2인 교차 검수로 정산하고, 리포트와 함께 지정하신 분께 직접 인계합니다." },
];

const REVIEWS = [
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

const SEOUL_TAGS = ["강남 · 서초", "송파 · 강동", "여의도 · 영등포", "종로 · 중구", "마포 · 서대문", "용산 · 성동", "노원 · 강북", "그 외 전 지역"];
const GYEONGGI_TAGS = ["성남 · 분당", "수원 · 용인", "고양 · 파주", "부천 · 광명", "안양 · 과천", "하남 · 남양주", "화성 · 평택", "그 외 전 지역"];

export default function HomePage() {
  return (
    <div style={{ width: "100%", overflowX: "hidden", background: "#F3E9EB" }}>
      <Header />

      <section
        id="top"
        data-mq="hero"
        style={{
          position: "relative",
          minHeight: 640,
          display: "flex",
          alignItems: "center",
          backgroundImage:
            "linear-gradient(90deg, rgba(18,18,18,0.82) 0%, rgba(28,28,28,0.52) 55%, rgba(40,40,40,0.18) 100%), url('/img/hero-desk.jpeg')",
          backgroundSize: "cover",
          backgroundPosition: "center right",
        }}
      >
        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "clamp(64px,11vw,110px) clamp(18px,5vw,24px)", width: "100%" }}>
          <Reveal style={{ maxWidth: 620 }}>
            <p style={{ fontFamily: fontDisplay, fontSize: 15, letterSpacing: "0.42em", color: "#E9CAD1", margin: "0 0 22px" }}>
              FOR YOUR MOST PRECIOUS DAY
            </p>
            <h1 style={{ fontFamily: fontSerif, fontSize: "clamp(30px,6.8vw,52px)", lineHeight: 1.34, fontWeight: 600, color: "#FFFFFF", margin: "0 0 24px", letterSpacing: "-0.02em" }}>
              축의대는 맡기고,
              <br />두 분은 웃기만 하세요
            </h1>
            <p style={{ fontSize: 17, lineHeight: 1.9, color: "#F3E9EB", margin: "0 0 38px", maxWidth: 500 }}>
              전문 교육을 받은 웨딩버틀러가 축의금 접수부터 정산까지 책임집니다. 가족·친구에게 부탁하지 않아도 되는 가장 깔끔한 방법.
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <OpenModalButton
                className="btn-accent-hover"
                style={{ background: "#A9647E", color: "#FFFFFF", padding: "17px 36px", border: "none", borderRadius: 999, fontSize: 16, fontWeight: 500, cursor: "pointer" }}
              >
                날짜 확인하고 예약하기
              </OpenModalButton>
              <a
                href="#price"
                className="btn-outline-hover"
                style={{ border: "1px solid rgba(255,255,255,0.55)", color: "#FFFFFF", padding: "17px 32px", borderRadius: 999, fontSize: 16, fontWeight: 400 }}
              >
                요금제 보기
              </a>
            </div>
            <div style={{ display: "flex", gap: 40, marginTop: 56, flexWrap: "wrap" }}>
              <Stat value="1,200+" label="누적 예식 진행" />
              <Stat value="100%" label="현장 정산 완료율" />
              <Stat value="4.9 / 5" label="예비부부 만족도" />
            </div>
          </Reveal>
        </div>
      </section>

      <section style={{ background: "#33232A", padding: "22px 24px" }}>
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
          <span>· 100% 온라인 예약 · 결제</span>
          <span>· 실시간 접수 현황</span>
          <span>
            · 예식 7일 전까지 전액 환불{" "}
            <a href="/pricing" style={{ color: "#E9CAD1", textDecoration: "underline" }}>
              자세히 보기
            </a>
          </span>
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
              { n: "02", title: "돈 문제는 예민합니다", body: "2인 1조 교차 검수, 접수부터 전달까지 카메라 기록, 실시간 접수 현황으로 금액 분쟁의 여지를 없앱니다.", delay: 150 },
              { n: "03", title: "첫인상은 축의대에서", body: "호텔 서비스 기준의 응대 교육을 이수한 매니저가 정장·화이트 글러브 차림으로 하객을 맞이합니다.", delay: 250 },
            ].map((c) => (
              <Reveal key={c.n} delay={c.delay}>
                <div className="card-hover-border" style={{ background: "#FFFFFF", border: "1px solid #E7D5DA", borderRadius: 4, padding: "40px 34px" }}>
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

      <section
        id="price"
        data-mq="parallax"
        style={{
          padding: "clamp(64px,11vw,120px) clamp(18px,5vw,24px)",
          backgroundImage: "linear-gradient(rgba(243,233,235,0.72), rgba(243,233,235,0.82)), url('/img/hall.png')",
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
            추가 하객 요금은 예식 후 실제 접수 인원 기준으로 정산되며, 차액은 예식 다음 영업일에 청구·환불됩니다.
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
              <AreaStat icon="1h" title="예식 1시간 전 도착" />
              <AreaStat icon="56" title="서울 25구 + 경기 31시·군" sub="수도권 전 지역 상시 운영" />
              <AreaStat icon="+" title="그 외 지역도 문의 가능" sub="인천·충청권은 개별 협의" />
            </div>
          </Reveal>

          <p style={{ textAlign: "center", fontSize: 13, color: "#9A8189", margin: "28px 0 0", lineHeight: 1.8 }}>
            ※ 본사(성남 분당) 기준 이동 거리에 따라 출장비가 추가될 수 있으며, 금액은 예약 후 사전 상담 시 안내드립니다.
          </p>
        </div>
      </section>

      <section id="review" style={{ padding: "clamp(64px,11vw,120px) clamp(18px,5vw,24px)" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto" }}>
          <Reveal style={{ textAlign: "center", marginBottom: 56 }}>
            <p style={{ fontFamily: fontDisplay, fontSize: 14, letterSpacing: "0.4em", color: "#A9647E", margin: "0 0 16px" }}>REAL REVIEWS</p>
            <h2 style={{ fontFamily: fontSerif, fontSize: "clamp(26px,5vw,38px)", fontWeight: 600, margin: 0, letterSpacing: "-0.02em" }}>예식을 마친 부부들의 이야기</h2>
          </Reveal>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px,1fr))", gap: 22 }}>
            {REVIEWS.map((r, i) => (
              <Reveal key={r.who} delay={50 + i * 100}>
                <div style={{ background: "#FFFFFF", border: "1px solid #E7D5DA", borderRadius: 4, padding: "38px 32px" }}>
                  <div style={{ fontFamily: fontDisplay, fontSize: 44, color: "#E9CAD1", lineHeight: 0.6, marginBottom: 22 }}>&ldquo;</div>
                  <p style={{ fontSize: 15, lineHeight: 2, color: "#473A3F", margin: "0 0 26px" }}>{r.quote}</p>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 20, borderTop: "1px solid #E7D5DA" }}>
                    <span style={{ fontSize: 14, color: "#33232A" }}>{r.who}</span>
                    <span style={{ fontSize: 13, color: "#9A8189" }}>{r.tag}</span>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
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

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div style={{ fontFamily: fontSerif, fontSize: 30, color: "#E9CAD1" }}>{value}</div>
      <div style={{ fontSize: 13, color: "#D8C3C9", marginTop: 6 }}>{label}</div>
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
