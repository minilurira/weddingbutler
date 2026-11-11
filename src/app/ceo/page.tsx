import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { OpenModalButton } from "@/components/OpenModalButton";
import { fontDisplay, fontSerif } from "@/lib/style";
import { SITE_NAME, SITE_URL } from "@/lib/seo";

const TITLE = "대표 버틀러 이강, 최소연 소개";
const DESC = "웨딩버틀러를 함께 운영하는 대표 버틀러 이강과 최소연을 소개합니다. 약속을 먼저 지키고 예식 1시간 전에 도착합니다.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  alternates: { canonical: "/ceo" },
  openGraph: { type: "profile", locale: "ko_KR", url: `${SITE_URL}/ceo`, siteName: SITE_NAME, title: TITLE, description: DESC, images: [{ url: "/img/ceo.jpg", width: 777, height: 1000, alt: "웨딩버틀러 대표 버틀러 이강" }] },
};

interface Person { name: string; role: string; photo: string; greeting: string; motto: string; facts: string[] }

// 회사명과 상세 경력은 싣지 않는다. 재직 중이라는 사실과 축의대행 경력 햇수만 밝힌다. 현직 사명은 쓰지 않는다.
// 두 대표가 함께 지키는 현장 원칙. 사이트의 서비스 안내와 같은 내용만 쓴다.
const COMMON = ["예식 1시간 전 도착", "2인 1조 교차 검수", "접수부터 전달까지 카메라 기록", "인계확인서 서명"];

const PEOPLE: Person[] = [
  { name: "이강", role: "대표 버틀러", photo: "/img/ceo.jpg", motto: "약속은 지킬 수 있을 때만 하고, 한 번 하면 반드시 지킵니다.", greeting: "결제 기업에 다니며 축의대행을 3년째 해 왔습니다. 한 번 한 약속은 시간까지 지킵니다.", facts: ["결제 기업 재직 중", "축의대행 3년", "예약과 정산 시스템 직접 운영", ...COMMON] },
  { name: "최소연", role: "대표 버틀러", photo: "/img/ceo2.jpg", motto: "늦지 않는 것이 고객께 드리는 가장 기본적인 예의입니다.", greeting: "대기업에 다니며 축의대행을 4년째 해 왔습니다. 예식 날에는 약속한 시간보다 먼저 와 있습니다.", facts: ["대기업 재직 중", "축의대행 4년", ...COMMON] },
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
                  <p style={{ margin: "0 0 18px", fontFamily: fontSerif, fontSize: "clamp(19px,4.4vw,24px)", lineHeight: 1.6, color: "#33232A", letterSpacing: "-0.02em" }}>&ldquo;{x.motto}&rdquo;</p>
                  {x.greeting && <p style={{ margin: "0 0 18px", fontSize: 15.5, lineHeight: 1.95, color: "#5E4D53", fontWeight: 300 }}>{x.greeting}</p>}
                  {x.facts.length > 0 && (
                    <ul style={{ listStyle: "none", margin: "0 0 28px", padding: 0, display: "flex", flexWrap: "wrap", gap: 10 }}>
                      {x.facts.map((f) => <li key={f} style={{ background: "#FFFFFF", border: "1px solid #E7D5DA", borderRadius: 999, padding: "6px 14px", fontSize: 13.5, color: "#8E4E68" }}>{f}</li>)}
                    </ul>
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
