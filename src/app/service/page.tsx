import Image from "next/image";
import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { OpenModalButton } from "@/components/OpenModalButton";
import { fontDisplay, fontSerif } from "@/lib/style";

export const metadata: Metadata = {
  title: "서비스 소개 | 웨딩버틀러",
  description: "전문 교육을 받은 웨딩버틀러가 접수부터 정산까지 책임집니다.",
};

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

export default function ServicePage() {
  return (
    <div style={{ width: "100%", overflowX: "hidden", background: "#F3E9EB" }}>
      <Header active="service" />

      <section style={{ padding: "90px 24px 60px", textAlign: "center" }}>
        <p style={{ fontFamily: fontDisplay, fontSize: 14, letterSpacing: "0.4em", color: "#A9647E", margin: "0 0 16px" }}>OUR SERVICE</p>
        <h1 style={{ fontFamily: fontSerif, fontSize: 40, fontWeight: 600, margin: "0 0 18px", letterSpacing: "-0.02em" }}>축의대 대행 서비스</h1>
        <p style={{ fontSize: 16, lineHeight: 1.9, color: "#6B5A60", margin: 0 }}>전문 교육을 받은 웨딩버틀러가 접수부터 정산까지 책임집니다.</p>
      </section>

      <section style={{ padding: "0 24px 90px" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px,1fr))", gap: 48, alignItems: "center" }}>
          <div style={{ borderRadius: 4, overflow: "hidden", minHeight: 400, position: "relative" }}>
            <Image src="/img/butlers.jpeg" alt="웨딩버틀러 현장 응대" fill priority style={{ objectFit: "cover" }} sizes="(max-width: 768px) 100vw, 50vw" />
          </div>
          <div>
            <h2 style={{ fontFamily: fontSerif, fontSize: 30, fontWeight: 600, margin: "0 0 28px", lineHeight: 1.45, letterSpacing: "-0.02em" }}>
              예식 당일, 이 모든 것을
              <br />대신 해드립니다
            </h2>
            <div style={{ display: "flex", flexDirection: "column" }}>
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
        </div>
      </section>

      <section style={{ padding: "90px 24px", backgroundColor: "#FFFFFF9F" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <p style={{ fontFamily: fontDisplay, fontSize: 14, letterSpacing: "0.4em", color: "#A9647E", margin: "0 0 16px" }}>HOW IT WORKS</p>
            <h2 style={{ fontFamily: fontSerif, fontSize: 32, fontWeight: 600, margin: 0, letterSpacing: "-0.02em" }}>예약부터 정산까지, 네 단계</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px,1fr))", gap: 20 }}>
            {HOW_IT_WORKS.map((s) => (
              <div key={s.n} style={{ background: "#FFFFFF", borderRadius: 4, padding: "34px 28px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
                  <span style={{ width: 30, height: 30, borderRadius: "50%", background: "#A9647E", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>
                    {s.n}
                  </span>
                  <span style={{ fontSize: 12, letterSpacing: "0.2em", color: "#9A8189" }}>{s.tag}</span>
                </div>
                <h3 style={{ fontFamily: fontSerif, fontSize: 19, fontWeight: 600, margin: "0 0 12px" }}>{s.title}</h3>
                <p style={{ fontSize: 14, lineHeight: 1.85, color: "#6B5A60", margin: 0 }}>{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        style={{
          padding: "110px 24px",
          textAlign: "center",
          backgroundImage: "linear-gradient(rgba(18,18,18,0.58), rgba(35,35,35,0.66)), url('/img/couple.jpeg')",
          backgroundSize: "cover",
          backgroundPosition: "center 30%",
        }}
      >
        <h2 style={{ fontFamily: fontSerif, fontSize: 34, fontWeight: 600, color: "#FFFFFF", margin: "0 0 18px", lineHeight: 1.5, letterSpacing: "-0.02em" }}>
          가장 행복한 날의 걱정 하나,
          <br />저희가 덜어드릴게요
        </h2>
        <OpenModalButton
          as="a"
          className="btn-ivory-hover"
          style={{ display: "inline-block", marginTop: 16, color: "#33232A", padding: "18px 44px", borderRadius: 999, fontSize: 16, fontWeight: 500, backgroundColor: "#F3E9EBD0" }}
        >
          날짜 확인하고 예약하기
        </OpenModalButton>
      </section>

      <Footer />
    </div>
  );
}
