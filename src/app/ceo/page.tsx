import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { OpenModalButton } from "@/components/OpenModalButton";
import { fontDisplay, fontSerif } from "@/lib/style";
import { SITE_NAME, SITE_URL } from "@/lib/seo";

const TITLE = "대표 버틀러 이강, 최소연 소개";
const DESC = "웨딩버틀러를 함께 운영하는 대표 버틀러 이강과 최소연을 소개합니다. 축의금 접수부터 정산까지 기록이 남는 방식으로 운영합니다.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  alternates: { canonical: "/ceo" },
  openGraph: { type: "profile", locale: "ko_KR", url: `${SITE_URL}/ceo`, siteName: SITE_NAME, title: TITLE, description: DESC, images: [{ url: "/img/ceo.jpg", width: 777, height: 1000, alt: "웨딩버틀러 대표 버틀러 이강" }] },
};

// 확인된 사실만 쓴다. 회사명은 이전 직장만 밝히고, 현재 직장은 업종으로만 적는다.
const FACTS = ["결제와 정산 경력 10년", "2016년부터", "자동이체 중계 월 2,000억 원 규모 담당"];

const CAREER: { period: string; title: string; lines: string[] }[] = [
  { period: "2016 ~ 2021", title: "케이에스넷 (결제대행 PG 기업)", lines: ["카페24와 가비아 호스팅몰 채널 월 150억 원 규모 관리", "도시가스사 17곳 자동이체 중계, 월 1,200억 원에서 2,000억 원으로 확대", "토스페이 PG사 최초 연동 등 원천사 6곳 제휴"] },
  { period: "2021 ~ 2024", title: "하이픈코퍼레이션 (데이터 API 기업)", lines: ["API 마켓 Product Owner, 런칭 6개월 만에 월 반복매출 1억 원", "유료 고객사 200곳 이상, 월 100만 콜", "선불 충전 과금 체계와 수익 인식 기준 수립"] },
  { period: "2024 ~ 2025", title: "핑거버스 (포인트 충전 서비스)", lines: ["전략기획 실장, 상품권 발행사 3곳과 정산 주기, 수수료율, 미상환 잔액 조건 협상", "BM별 이익률 분석으로 역마진 구간 파악"] },
  { period: "2025 ~ 현재", title: "결제 서비스 기업 근무", lines: ["가맹점 영업과 정산, 운영 업무"] },
  { period: "2026 ~ 현재", title: "웨딩버틀러 대표", lines: ["축의대행 서비스 운영", "예약, 결제, 정산 시스템을 직접 만들어 운영"] },
];

interface Person { name: string; role: string; photo: string; greeting: string; facts: string[]; career: typeof CAREER }

// 최소연 대표의 소개글과 경력은 본인 확인 후 채운다. 비어 있으면 사진과 직함만 보인다.
const PEOPLE: Person[] = [
  { name: "이강", role: "대표 버틀러", photo: "/img/ceo.jpg", greeting: "2016년부터 결제와 정산 업무를 맡아 왔습니다. 축의금도 돈이 오가는 일이라, 접수부터 정산까지 기록이 남고 서로 확인하는 방식으로 운영합니다. 예약과 정산 시스템도 직접 만들어 운영합니다.", facts: FACTS, career: CAREER },
  { name: "최소연", role: "대표 버틀러", photo: "/img/ceo2.jpg", greeting: "", facts: [], career: [] },
];

export default function CeoPage() {
  const ld = PEOPLE.map((x) => ({
    "@context": "https://schema.org",
    "@type": "Person",
    name: x.name,
    jobTitle: `웨딩버틀러 ${x.role}`,
    image: `${SITE_URL}${x.photo}`,
    url: `${SITE_URL}/ceo`,
    worksFor: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
  }));
  return (
    <div style={{ width: "100%", overflowX: "hidden", background: "#F3E9EB" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <Header active="ceo" />
      <main style={{ padding: "clamp(50px,8vw,84px) clamp(18px,5vw,24px) clamp(40px,6vw,64px)" }}>
        <div style={{ maxWidth: 980, margin: "0 auto" }}>
          <p style={{ fontFamily: fontDisplay, fontSize: 13, letterSpacing: "0.34em", color: "#A9647E", margin: "0 0 14px" }}>REPRESENTATIVE BUTLER</p>
          <h1 style={{ fontFamily: fontSerif, fontSize: "clamp(26px,5.6vw,38px)", fontWeight: 400, margin: "0 0 clamp(26px,5vw,44px)", lineHeight: 1.4, letterSpacing: "-0.025em", color: "#33232A" }}>
            축의금은 돈이 오가는 일,<br />그래서 두 대표가 직접 기준을 만들었습니다
          </h1>
          <div style={{ display: "flex", flexDirection: "column", gap: "clamp(44px,8vw,80px)" }}>
            {PEOPLE.map((x) => (
              <section key={x.name} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%,280px),1fr))", gap: "clamp(24px,5vw,48px)", alignItems: "start" }}>
                <div>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={x.photo} width={777} height={1000} alt={`웨딩버틀러 ${x.role} ${x.name}`} style={{ width: "100%", height: "auto", borderRadius: 4, display: "block" }} />
                  <p style={{ margin: "12px 0 0", fontSize: 14, color: "#5E4D53", textAlign: "center" }}>{x.role} <span style={{ color: "#33232A", fontWeight: 500 }}>{x.name}</span></p>
                </div>
                <div>
                  {x.greeting && <p style={{ margin: "0 0 18px", fontSize: 17, lineHeight: 1.95, color: "#473A3F", fontWeight: 300 }}>{x.greeting}</p>}
                  {x.facts.length > 0 && (
                    <ul style={{ listStyle: "none", margin: "0 0 28px", padding: 0, display: "flex", flexWrap: "wrap", gap: 10 }}>
                      {x.facts.map((f) => <li key={f} style={{ background: "#FFFFFF", border: "1px solid #E7D5DA", borderRadius: 999, padding: "6px 14px", fontSize: 13.5, color: "#8E4E68" }}>{f}</li>)}
                    </ul>
                  )}
                  {x.career.length > 0 && (
                    <>
                      <h2 style={{ fontFamily: fontDisplay, fontSize: 13, letterSpacing: "0.3em", color: "#A9647E", margin: "0 0 14px", fontWeight: 400 }}>CAREER</h2>
                      <ol style={{ listStyle: "none", margin: 0, padding: "0 0 0 18px", borderLeft: "1px solid #D9BFC6", display: "flex", flexDirection: "column", gap: 22 }}>
                        {x.career.map((c) => (
                          <li key={c.period}>
                            <p style={{ margin: 0, fontSize: 13, color: "#9A8189" }}>{c.period}</p>
                            <p style={{ margin: "2px 0 6px", fontSize: 16, color: "#33232A", fontWeight: 600 }}>{c.title}</p>
                            <ul style={{ margin: 0, paddingLeft: 18, display: "flex", flexDirection: "column", gap: 4 }}>
                              {c.lines.map((l) => <li key={l} style={{ fontSize: 14.5, lineHeight: 1.8, color: "#5E4D53" }}>{l}</li>)}
                            </ul>
                          </li>
                        ))}
                      </ol>
                    </>
                  )}
                </div>
              </section>
            ))}
          </div>
        </div>
        <div style={{ maxWidth: 980, margin: "clamp(34px,6vw,56px) auto 0", textAlign: "center", background: "#33232A", borderRadius: 4, padding: "clamp(34px,6vw,52px) 24px" }}>
          <p style={{ fontFamily: fontSerif, fontSize: "clamp(20px,4.6vw,26px)", color: "#FFFFFF", margin: "0 0 8px", lineHeight: 1.5 }}>축의대는 웨딩버틀러에 맡기세요</p>
          <p style={{ fontSize: 14.5, color: "#D8C3C9", margin: "0 0 22px", lineHeight: 1.8 }}>날짜를 고르고 바로 예약할 수 있어요.</p>
          <OpenModalButton as="a" className="btn-ivory-hover" style={{ display: "inline-block", color: "#33232A", padding: "16px 38px", borderRadius: 999, fontSize: 16, fontWeight: 500, backgroundColor: "#F3E9EBD0" }}>
            날짜 확인하고 예약하기
          </OpenModalButton>
        </div>
      </main>
      <Footer />
    </div>
  );
}
