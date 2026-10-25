import Image from "next/image";
import { Reveal } from "@/components/Reveal";
import { fontDisplay, fontSerif } from "@/lib/style";

const POINTS = [
  { title: "총액·봉투·식권을 한눈에", body: "신랑측·신부측, 관계별 합계와 금액대 분포까지 정리해 드려요." },
  { title: "하객 이름으로 바로 검색", body: "초성 검색과 가나다 색인으로 답례 인사 돌릴 분을 금방 찾아요." },
  { title: "엑셀로 내려받기", body: "봉투 번호·성명·금액이 담긴 파일을 그대로 보관하실 수 있어요." },
  { title: "본인 확인 후 열람", body: "예약자 휴대폰 문자 인증을 거쳐야 열리고, 90일 뒤 자동으로 삭제돼요." },
];

/** 메인 — 예식 후 고객이 직접 보는 축의 기록 화면 소개 (캡처는 데모 가상 데이터) */
export function RecordShowcase() {
  return (
    <section id="record" style={{ padding: "clamp(64px,10vw,110px) clamp(18px,5vw,24px)" }}>
      <div
        style={{
          maxWidth: 1180,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%,340px), 1fr))",
          gap: "clamp(40px,6vw,72px)",
          alignItems: "center",
        }}
      >
        <Reveal>
          <p style={{ fontFamily: fontDisplay, fontSize: 14, letterSpacing: "0.4em", color: "#A9647E", margin: "0 0 18px" }}>GUEST RECORD</p>
          <h2 style={{ fontFamily: fontSerif, fontSize: "clamp(24px,4.8vw,34px)", fontWeight: 600, margin: "0 0 18px", lineHeight: 1.4, letterSpacing: "-0.02em" }}>
            축의 기록, 예식이 끝나면
            <br />휴대폰으로 바로 확인하세요
          </h2>
          <p style={{ fontSize: 16, lineHeight: 1.9, color: "#6B5A60", margin: "0 0 30px" }}>
            인계가 끝나면 고객 전용 기록 화면 주소를 보내 드려요. 앱 설치 없이 휴대폰과 PC 어디서나 열 수 있어요.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {POINTS.map((p, i) => (
              <div
                key={p.title}
                style={{
                  display: "flex",
                  gap: 16,
                  padding: "16px 0",
                  borderTop: "1px solid #E7D5DA",
                  borderBottom: i === POINTS.length - 1 ? "1px solid #E7D5DA" : undefined,
                }}
              >
                <span style={{ fontFamily: fontDisplay, color: "#A9647E", fontSize: 15, minWidth: 26 }}>{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 600, color: "#33232A", marginBottom: 4 }}>{p.title}</div>
                  <div style={{ fontSize: 14, lineHeight: 1.8, color: "#6B5A60" }}>{p.body}</div>
                </div>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal delay={150}>
          <div style={{ position: "relative", paddingBottom: "clamp(40px,8vw,64px)", paddingRight: "clamp(36px,8vw,70px)" }}>
            {/* PC 화면 */}
            <div style={{ background: "#FFFFFF", borderRadius: 10, border: "1px solid #E7D5DA", boxShadow: "0 24px 60px -24px rgba(51,35,42,.35)", overflow: "hidden" }}>
              <div style={{ display: "flex", gap: 6, padding: "10px 12px", background: "#F6EEF0", borderBottom: "1px solid #E7D5DA" }} aria-hidden="true">
                {[0, 1, 2].map((d) => (
                  <span key={d} style={{ width: 9, height: 9, borderRadius: "50%", background: "#E2CBD2" }} />
                ))}
              </div>
              <Image
                src="/img/record/pc-summary.png"
                alt="PC에서 본 축의 기록 요약 화면 예시"
                width={2880}
                height={1800}
                sizes="(max-width: 768px) 90vw, 560px"
                style={{ width: "100%", height: "auto", display: "block" }}
              />
            </div>
            {/* 모바일 화면 */}
            <div
              style={{
                position: "absolute",
                right: 0,
                bottom: 0,
                width: "clamp(110px,30%,180px)",
                padding: 6,
                background: "#33232A",
                borderRadius: 22,
                boxShadow: "0 24px 50px -18px rgba(51,35,42,.55)",
              }}
            >
              <Image
                src="/img/record/mobile-list.png"
                alt="휴대폰에서 본 하객 리스트 화면 예시"
                width={780}
                height={1614}
                sizes="180px"
                style={{ width: "100%", height: "auto", display: "block", borderRadius: 17 }}
              />
            </div>
          </div>
          <p style={{ fontSize: 12, color: "#9A8189", margin: "14px 0 0", textAlign: "center" }}>예시 화면 · 이름과 금액은 가상 데이터예요</p>
        </Reveal>
      </div>
    </section>
  );
}
