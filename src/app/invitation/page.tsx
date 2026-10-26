import Link from "next/link";
import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { fontDisplay, fontSerif } from "@/lib/style";

export const metadata: Metadata = {
  title: "무료 모바일 청첩장 만들기",
  description: "웨딩버틀러에서 모바일 청첩장을 무료로 만들고, 미리 본 뒤 링크 하나로 보내세요. 지도·방명록·배경음악·계좌 복사까지 담았습니다.",
  alternates: { canonical: "/invitation" },
};

// 청첩장 에디터를 오픈하면 true로 바꾼다. false인 동안 "만들기" 버튼은 오픈 준비 중으로 보인다.
const INVITATION_OPEN = false;
const EDITOR_PATH = "/invitation/new";

const STEPS = [
  { n: "1", title: "템플릿 고르기", body: "무료 템플릿 1종과 5,000원 템플릿 3종 중 마음에 드는 디자인을 고릅니다." },
  { n: "2", title: "사진과 정보 넣기", body: "사진을 끌어다 놓고 이름, 예식 일시, 예식장을 입력합니다. 입력은 자동으로 저장돼요." },
  { n: "3", title: "미리 보고 보내기", body: "하객이 볼 화면 그대로 미리 본 뒤 발행하고, 주소를 복사해 카카오톡이나 문자로 보냅니다." },
];

const FEATURES = [
  { title: "지도와 길 안내", body: "예식장을 찾으면 지도에 핀이 찍히고, 네이버 지도·카카오맵·티맵으로 바로 길 안내가 열립니다." },
  { title: "방명록", body: "하객이 축하 글을 남기고 비밀번호로 자기 글을 지울 수 있어요. 욕설과 광고는 자동으로 막습니다." },
  { title: "배경음악", body: "샘플 음악 중에서 고르면 하객 화면에 재생 버튼이 생깁니다. 자동으로 시작되지는 않아요." },
  { title: "계좌 복사", body: "마음 전하실 곳의 계좌번호를 버튼 한 번으로 복사할 수 있습니다." },
  { title: "PC와 모바일 에디터", body: "PC에서도 휴대폰에서도 같은 청첩장을 이어서 고칠 수 있고, 고쳐도 주소는 그대로입니다." },
  { title: "축의 접수 안내", body: "예식 당일 축의대를 웨딩버틀러가 함께한다는 안내가 청첩장 아래에 들어갑니다." },
];

const TEMPLATES = [
  { name: "클래식 아이보리", price: "무료", bg: "linear-gradient(180deg,#D9C9B2 0%,#8E7656 100%)", fg: "#FFFDF8", weight: 300 },
  { name: "모던 미니멀", price: "5,000원", bg: "linear-gradient(180deg,#EDEDED 0%,#9A9A9A 100%)", fg: "#111111", weight: 800 },
  { name: "보태니컬 그린", price: "5,000원", bg: "linear-gradient(180deg,#B7C9B5 0%,#6F8F76 100%)", fg: "#1F3A2C", weight: 400 },
  { name: "로즈 에디토리얼", price: "5,000원", bg: "linear-gradient(180deg,#F1D3D8 0%,#C98A9C 100%)", fg: "#4A1F2E", weight: 400 },
];

const COMPARE: { label: string; free: string; paid: string }[] = [
  { label: "지도·방명록·계좌 복사·축의 접수 안내", free: "포함", paid: "포함" },
  { label: "배경음악", free: "샘플 음악", paid: "샘플 음악 + 내 음악 파일 올리기" },
  { label: "사진", free: "12장", paid: "30장" },
  { label: "주차 안내", free: "-", paid: "주차장 위치, 무료 시간, 만차 시 안내" },
  { label: "예식장 메모", free: "-", paid: "식사, 셔틀버스, 포토부스, 화환 안내" },
  { label: "제작자 대시보드", free: "-", paid: "방문 수, 방명록 관리, 공개·비공개 전환" },
  { label: "하단 웨딩버틀러 표시", free: "있음", paid: "없음" },
];

const FAQ = [
  { q: "무료 템플릿은 정말 비용이 없나요?", a: "네. 클래식 아이보리 템플릿은 만들고 발행하고 고치는 데 비용이 들지 않습니다." },
  { q: "유료 템플릿은 언제 결제하나요?", a: "만드는 동안에는 결제하지 않고, 발행할 때 5,000원을 카드로 한 번 결제합니다. 이후 고쳐도 다시 결제하지 않아요." },
  { q: "제작자 대시보드는 무엇인가요?", a: "유료 템플릿으로 발행하면 만든 분만 볼 수 있는 대시보드 주소를 문자로 보내 드립니다. 청첩장을 몇 명이 열어 봤는지, 길찾기·계좌 복사를 몇 번 눌렀는지 확인하고 방명록을 관리할 수 있어요." },
  { q: "보낸 뒤에 고칠 수 있나요?", a: "언제든 고칠 수 있고, 고친 내용은 같은 주소에 바로 반영됩니다. 다시 보낼 필요가 없어요." },
  { q: "축의대 대행도 함께 맡길 수 있나요?", a: "네. 청첩장과 별도로 웨딩버틀러 축의대 대행을 예약하실 수 있습니다." },
];

const eyebrow: CSSProperties = { fontFamily: fontDisplay, fontSize: 14, letterSpacing: "0.4em", color: "#A9647E", margin: "0 0 16px" };
const h2: CSSProperties = { fontFamily: fontSerif, fontSize: "clamp(24px,5vw,32px)", fontWeight: 600, margin: 0, letterSpacing: "-0.02em", lineHeight: 1.45 };

function Phone({ t, width, tilt = 0 }: { t: (typeof TEMPLATES)[number]; width: number; tilt?: number }) {
  return (
    <div
      aria-hidden="true"
      style={{
        width,
        aspectRatio: "9 / 18.5",
        borderRadius: width * 0.14,
        border: `${Math.max(5, Math.round(width * 0.035))}px solid #33232A`,
        background: t.bg,
        boxShadow: "0 18px 40px rgba(51,35,42,0.18)",
        transform: tilt ? `rotate(${tilt}deg)` : undefined,
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        alignItems: "center",
        padding: `0 10px ${Math.round(width * 0.2)}px`,
        boxSizing: "border-box",
        color: t.fg,
        textAlign: "center",
        flex: "0 0 auto",
      }}
    >
      <span style={{ fontSize: Math.max(7, width * 0.035), letterSpacing: "0.28em", marginBottom: width * 0.05 }}>WEDDING INVITATION</span>
      <span style={{ fontFamily: fontSerif, fontSize: width * 0.1, fontWeight: t.weight, letterSpacing: "0.06em" }}>민준 &amp; 서연</span>
      <span style={{ width: width * 0.1, height: 1, background: t.fg, opacity: 0.7, margin: `${width * 0.05}px 0` }} />
      <span style={{ fontSize: Math.max(7, width * 0.042), lineHeight: 1.7 }}>2027. 5. 8 SAT 1PM</span>
    </div>
  );
}

const DASH_POINTS = [
  { title: "방문 통계", body: "총 방문 수, 오늘 방문 수, 최근 7일 방문 추이를 한눈에 봅니다." },
  { title: "어디서 열었는지", body: "카카오톡, 문자 등 하객이 어떤 경로로 청첩장을 열었는지 보여 드려요." },
  { title: "하객이 누른 버튼", body: "길찾기와 계좌 복사를 몇 번 눌렀는지 알 수 있어요." },
  { title: "방명록 관리", body: "축하 글을 한곳에서 보고, 부적절한 글은 지우고, 엑셀로 내려받아 간직하세요." },
  { title: "공개·비공개 전환", body: "예식이 끝나면 버튼 하나로 청첩장을 비공개로 돌릴 수 있어요." },
  { title: "나만 여는 주소", body: "발행할 때 문자로 받은 주소로 열고, 처음 한 번 휴대폰 인증을 거쳐요." },
];

const DASH_WEEK = [12, 18, 9, 41, 63, 37, 24];

/** 제작자 대시보드 예시 화면 (숫자는 예시) */
function DashboardMock() {
  const max = Math.max(...DASH_WEEK);
  const tile: CSSProperties = { padding: "12px 14px", borderRadius: 12, background: "#FFFFFF", border: "1px solid #E7D5DA" };
  return (
    <div role="img" aria-label="제작자 대시보드 예시: 방문 수, 최근 7일 방문 그래프, 방명록 목록" style={{ width: "100%", maxWidth: 340, margin: "0 auto", borderRadius: 28, border: "8px solid #170E12", background: "#F3E9EB", padding: 14, boxSizing: "border-box", boxShadow: "0 18px 40px rgba(51,35,42,0.18)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: "#33232A" }}>내 청첩장 대시보드</span>
        <span style={{ padding: "3px 9px", borderRadius: 10, background: "#F9EFF2", color: "#8E4E68", fontSize: 10, fontWeight: 700 }}>유료</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 8 }}>
        {[["총 방문", "412"], ["오늘 방문", "24"], ["길찾기 누름", "54"], ["계좌 복사", "31"]].map(([l, v]) => (
          <div key={l} style={tile}>
            <div style={{ fontSize: 11, color: "#6B5A60" }}>{l}</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: "#33232A" }}>{v}</div>
          </div>
        ))}
      </div>
      <div style={{ ...tile, marginTop: 8 }}>
        <div style={{ fontSize: 11, color: "#6B5A60", marginBottom: 8 }}>최근 7일 방문</div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 64 }}>
          {DASH_WEEK.map((n, i) => (
            <div key={i} style={{ flex: 1, height: Math.round((n / max) * 60) + 4, borderRadius: "4px 4px 1px 1px", background: i === DASH_WEEK.length - 1 ? "#A9647E" : "#E2BFCB" }} />
          ))}
        </div>
      </div>
      <div style={{ ...tile, marginTop: 8 }}>
        <div style={{ fontSize: 11, color: "#6B5A60", marginBottom: 6 }}>방명록 28개</div>
        {[["지민", "진심으로 축하해요!"], ["현우", "결혼 축하해! 그날 만나자."]].map(([n, m]) => (
          <div key={n} style={{ display: "flex", justifyContent: "space-between", gap: 8, padding: "6px 0", borderTop: "1px solid #F0E3E6", fontSize: 12, color: "#473A3F" }}>
            <span><b>{n}</b> {m}</span>
            <span style={{ color: "#B25B4B", flex: "0 0 auto" }}>삭제</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MakeButton({ big = false }: { big?: boolean }) {
  const style: CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    padding: big ? "18px 40px" : "16px 32px",
    borderRadius: 999,
    fontSize: big ? 16 : 15,
    fontWeight: 600,
    border: "none",
  };
  if (INVITATION_OPEN) {
    return (
      <Link href={EDITOR_PATH} className="btn-dark-hover" style={{ ...style, background: "#33232A", color: "#F3E9EB" }}>
        무료로 만들기
      </Link>
    );
  }
  return (
    <span role="status" style={{ ...style, background: "#E9CAD1", color: "#5E3A48" }}>
      곧 오픈합니다
    </span>
  );
}

export default function InvitationPage() {
  return (
    <div style={{ width: "100%", overflowX: "hidden", background: "#F3E9EB" }}>
      <Header active="invitation" />

      {/* 히어로 */}
      <section style={{ padding: "clamp(54px,9vw,96px) clamp(18px,5vw,24px) clamp(40px,7vw,72px)" }}>
        <div
          style={{
            maxWidth: 1180,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%,340px),1fr))",
            gap: "clamp(36px,6vw,64px)",
            alignItems: "center",
          }}
        >
          <div>
            <p style={eyebrow}>MOBILE INVITATION</p>
            <h1 style={{ fontFamily: fontSerif, fontSize: "clamp(28px,6.4vw,44px)", fontWeight: 600, margin: "0 0 20px", letterSpacing: "-0.02em", lineHeight: 1.35 }}>
              모바일 청첩장,
              <br />
              무료로 만드세요
            </h1>
            <p style={{ fontSize: 16, lineHeight: 1.9, color: "#6B5A60", margin: "0 0 30px" }}>
              템플릿을 고르고 사진과 정보만 넣으면 완성됩니다.
              <br />
              미리 본 뒤 링크 하나로 하객에게 보내세요.
            </p>
            <p style={{ fontSize: 14, color: "#8E4E68", fontWeight: 600, margin: "-14px 0 28px" }}>유료 템플릿은 누가 봤는지 알 수 있는 제작자 대시보드까지 드려요.</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
              <MakeButton big />
              <a href="#templates" style={{ display: "inline-flex", alignItems: "center", padding: "16px 26px", borderRadius: 999, border: "1px solid #DCC4CC", color: "#473A3F", fontSize: 15, fontWeight: 500, background: "#FFFFFF" }}>
                템플릿 보기
              </a>
            </div>
            {!INVITATION_OPEN && (
              <p style={{ fontSize: 13, color: "#9A8189", margin: "16px 0 0" }}>
                지금 오픈을 준비하고 있어요. 궁금한 점은 <Link href="/contact" style={{ color: "#A9647E", textDecoration: "underline" }}>문의하기</Link>로 남겨 주세요.
              </p>
            )}
          </div>
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "clamp(10px,2vw,18px)", minHeight: 360 }}>
            <div data-mq="inv-side"><Phone t={TEMPLATES[2]} width={150} tilt={-6} /></div>
            <Phone t={TEMPLATES[0]} width={190} />
            <div data-mq="inv-side"><Phone t={TEMPLATES[3]} width={150} tilt={6} /></div>
          </div>
        </div>
      </section>

      {/* 만드는 방법 */}
      <section style={{ padding: "clamp(56px,9vw,90px) clamp(18px,5vw,24px)", backgroundColor: "#FFFFFF9F" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <p style={eyebrow}>HOW IT WORKS</p>
            <h2 style={h2}>세 단계면 완성돼요</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%,260px),1fr))", gap: 20 }}>
            {STEPS.map((s) => (
              <div key={s.n} style={{ background: "#FFFFFF", borderRadius: 4, padding: "32px 28px" }}>
                <span style={{ width: 30, height: 30, borderRadius: "50%", background: "#A9647E", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, marginBottom: 18 }}>{s.n}</span>
                <h3 style={{ fontFamily: fontSerif, fontSize: 19, fontWeight: 600, margin: "0 0 12px" }}>{s.title}</h3>
                <p style={{ fontSize: 14, lineHeight: 1.85, color: "#6B5A60", margin: 0 }}>{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 기능 */}
      <section style={{ padding: "clamp(56px,9vw,90px) clamp(18px,5vw,24px)" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <p style={eyebrow}>FEATURES</p>
            <h2 style={h2}>하객에게 필요한 것을 모두 담았어요</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%,300px),1fr))", gap: 0, borderTop: "1px solid #E7D5DA" }}>
            {FEATURES.map((f, i) => (
              <div key={f.title} style={{ display: "flex", gap: 16, padding: "24px 4px", borderBottom: "1px solid #E7D5DA" }}>
                <span style={{ fontFamily: fontDisplay, color: "#A9647E", fontSize: 15, minWidth: 26 }}>{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 600, margin: "0 0 6px", color: "#33232A" }}>{f.title}</h3>
                  <p style={{ fontSize: 14, lineHeight: 1.8, color: "#6B5A60", margin: 0 }}>{f.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 템플릿 */}
      <section id="templates" style={{ padding: "clamp(56px,9vw,90px) clamp(18px,5vw,24px)", backgroundColor: "#FFFFFF9F", scrollMarginTop: 80 }}>
        <div style={{ maxWidth: 1180, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <p style={eyebrow}>TEMPLATES</p>
            <h2 style={h2}>무료 1종, 프리미엄 3종</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px,1fr))", gap: "clamp(12px,2vw,20px)" }}>
            {TEMPLATES.map((t) => (
              <div key={t.name} style={{ background: "#FFFFFF", borderRadius: 4, padding: "24px 12px 20px", display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
                <Phone t={t} width={120} />
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontFamily: fontSerif, fontSize: 18, fontWeight: 600 }}>{t.name}</div>
                  <div style={{ marginTop: 6, display: "inline-block", padding: "4px 12px", borderRadius: 999, fontSize: 13, fontWeight: 600, background: t.price === "무료" ? "#E5F0E8" : "#F9EFF2", color: t.price === "무료" ? "#2F6B45" : "#8E4E68" }}>{t.price}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 유료: 제작자 대시보드 (강조) */}
      <section style={{ padding: "clamp(64px,10vw,110px) clamp(18px,5vw,24px)", background: "#33232A", color: "#F3E9EB" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%,320px),1fr))",
              gap: "clamp(36px,6vw,72px)",
              alignItems: "center",
            }}
          >
            <div>
              <p style={{ ...eyebrow, color: "#E2BFCB" }}>PREMIUM DASHBOARD</p>
              <h2 style={{ ...h2, color: "#FFFFFF", fontSize: "clamp(26px,5.6vw,38px)", marginBottom: 18 }}>
                보내고 끝이 아니에요.
                <br />
                누가 봤는지 확인하세요
              </h2>
              <p style={{ fontSize: 16, lineHeight: 1.9, color: "#E9D6DC", margin: "0 0 26px" }}>
                5,000원 템플릿으로 발행하면 <b style={{ color: "#FFFFFF" }}>만든 분만 볼 수 있는 제작자 대시보드</b>를 드립니다. 청첩장을 보낸 뒤의 반응을 확인하고, 방명록과 공개 여부까지 한곳에서 관리하세요.
              </p>
              <span style={{ display: "inline-block", padding: "8px 16px", borderRadius: 999, background: "#A9647E", color: "#FFFFFF", fontSize: 14, fontWeight: 600 }}>유료 템플릿 3종에 모두 포함</span>
            </div>
            <div>
              <DashboardMock />
              <p style={{ textAlign: "center", fontSize: 12, color: "#C9AEB8", margin: "12px 0 0" }}>화면의 숫자는 예시입니다</p>
            </div>
          </div>

          <div style={{ marginTop: "clamp(48px,8vw,80px)", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%,300px),1fr))", gap: 16 }}>
            {DASH_POINTS.map((d, i) => (
              <div key={d.title} style={{ padding: "26px 24px", borderRadius: 4, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(233,202,209,0.18)" }}>
                <span style={{ fontFamily: fontDisplay, color: "#E2BFCB", fontSize: 15 }}>{String(i + 1).padStart(2, "0")}</span>
                <h3 style={{ fontSize: 17, fontWeight: 600, margin: "10px 0 8px", color: "#FFFFFF" }}>{d.title}</h3>
                <p style={{ fontSize: 14, lineHeight: 1.8, color: "#E9D6DC", margin: 0 }}>{d.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 무료와 유료 비교 */}
      <section style={{ padding: "clamp(56px,9vw,90px) clamp(18px,5vw,24px)", backgroundColor: "#FFFFFF9F" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <p style={eyebrow}>FREE &amp; PREMIUM</p>
            <h2 style={h2}>무료로 충분하고, 유료는 더 친절해요</h2>
          </div>
          <div style={{ overflowX: "auto", background: "#FFFFFF", borderRadius: 4 }}>
            <table style={{ width: "100%", minWidth: 560, borderCollapse: "collapse", fontSize: 14 }}>
              <thead>
                <tr style={{ background: "#FBF6F7" }}>
                  <th scope="col" style={{ textAlign: "left", padding: "16px 20px", fontWeight: 600, color: "#473A3F" }}>기능</th>
                  <th scope="col" style={{ textAlign: "left", padding: "16px 20px", fontWeight: 600, color: "#2F6B45", width: "24%" }}>무료</th>
                  <th scope="col" style={{ textAlign: "left", padding: "16px 20px", fontWeight: 600, color: "#8E4E68", width: "38%" }}>유료 5,000원</th>
                </tr>
              </thead>
              <tbody>
                {COMPARE.map((r) => (
                  <tr key={r.label} style={{ borderTop: "1px solid #F0E3E6" }}>
                    <th scope="row" style={{ textAlign: "left", padding: "16px 20px", fontWeight: 500, color: "#33232A" }}>{r.label}</th>
                    <td style={{ padding: "16px 20px", color: "#6B5A60" }}>{r.free}</td>
                    <td style={{ padding: "16px 20px", color: "#473A3F" }}>{r.paid}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 자주 묻는 질문 */}
      <section style={{ padding: "clamp(56px,9vw,90px) clamp(18px,5vw,24px)" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <p style={eyebrow}>FAQ</p>
            <h2 style={h2}>자주 묻는 질문</h2>
          </div>
          <div style={{ borderTop: "1px solid #E7D5DA" }}>
            {FAQ.map((f) => (
              <details key={f.q} style={{ borderBottom: "1px solid #E7D5DA", padding: "4px 4px" }}>
                <summary style={{ cursor: "pointer", padding: "18px 0", fontSize: 16, fontWeight: 600, color: "#33232A" }}>{f.q}</summary>
                <p style={{ margin: "0 0 18px", fontSize: 15, lineHeight: 1.85, color: "#6B5A60" }}>{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* 마무리 */}
      <section style={{ padding: "clamp(64px,10vw,100px) clamp(18px,5vw,24px)", textAlign: "center", backgroundColor: "#FFFFFF9F" }}>
        <h2 style={{ ...h2, marginBottom: 14 }}>청첩장은 무료로, 축의대는 웨딩버틀러에게</h2>
        <p style={{ fontSize: 15, lineHeight: 1.85, color: "#6B5A60", margin: "0 0 28px" }}>예식 당일 축의금 접수부터 정산까지 맡기실 수도 있어요.</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center" }}>
          <MakeButton />
          <Link href="/service" style={{ display: "inline-flex", alignItems: "center", padding: "16px 28px", borderRadius: 999, border: "1px solid #DCC4CC", color: "#473A3F", fontSize: 15, fontWeight: 500, background: "#FFFFFF" }}>
            축의대 대행 알아보기
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
