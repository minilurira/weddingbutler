"use client";

import Link from "next/link";
import { fontDisplay } from "@/lib/style";
import { useReservation } from "@/components/ReservationProvider";

const BUSINESS_LINE =
  "웨딩버틀러 · 대표자 이강 · 사업자등록번호 677-08-03502\n경기 성남시 분당구 운중로 124 8층 804-S80호 · 010-5918-9203\n© 2026 Wedding Butler. All rights reserved.";

const legalLinkStyle = { color: "#9A8189" } as const;

function LegalLinks() {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 20, marginTop: 18, fontSize: 12.5 }}>
      <Link href="/terms" style={legalLinkStyle} className="footer-legal-hover">
        서비스 이용약관
      </Link>
      <Link href="/privacy" style={{ ...legalLinkStyle, fontWeight: 700 }} className="footer-legal-hover">
        개인정보처리방침
      </Link>
    </div>
  );
}

export function Footer({ full = false }: { full?: boolean }) {
  const { openModal } = useReservation();

  if (!full) {
    return (
      <footer style={{ background: "#33232A", padding: "clamp(40px,7vw,56px) clamp(18px,5vw,24px) 40px" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto" }}>
          <div style={{ fontFamily: fontDisplay, fontSize: 20, letterSpacing: "0.22em", color: "#E9CAD1" }}>
            WEDDING BUTLER
          </div>
          <p style={{ fontSize: 12, lineHeight: 1.9, color: "#6B5A60", margin: "22px 0 0", whiteSpace: "pre-line" }}>
            {BUSINESS_LINE}
          </p>
          <LegalLinks />
        </div>
      </footer>
    );
  }

  return (
    <footer style={{ background: "#33232A", padding: "clamp(48px,8vw,70px) clamp(18px,5vw,24px) 44px" }}>
      <div style={{ maxWidth: 1180, margin: "0 auto" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px,1fr))",
            gap: 40,
            paddingBottom: 44,
            borderBottom: "1px solid rgba(255,255,255,0.12)",
          }}
        >
          <div>
            <div style={{ fontFamily: fontDisplay, fontSize: 20, letterSpacing: "0.22em", color: "#E9CAD1" }}>
              WEDDING BUTLER
            </div>
            <p style={{ fontSize: 13, lineHeight: 1.9, color: "#9A8189", margin: "16px 0 0" }}>
              축의대 대행 전문 서비스
              <br />
              두 분의 하루를 지킵니다.
            </p>
          </div>
          <div>
            <div style={{ fontSize: 13, letterSpacing: "0.2em", color: "#D8C3C9", marginBottom: 16 }}>SERVICE</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 14 }}>
              <Link href="/service" style={{ color: "#9A8189" }}>
                서비스 소개
              </Link>
              <Link href="/pricing" style={{ color: "#9A8189" }}>
                가격안내
              </Link>
              <Link href="/contact" style={{ color: "#9A8189" }}>
                문의하기
              </Link>
              <a onClick={() => openModal()} style={{ color: "#9A8189", cursor: "pointer" }}>
                예약 · 결제
              </a>
              <a href="#faq" style={{ color: "#9A8189" }}>
                자주 묻는 질문
              </a>
            </div>
          </div>
          <div>
            <div style={{ fontSize: 13, letterSpacing: "0.2em", color: "#D8C3C9", marginBottom: 16 }}>CONTACT</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 14, color: "#9A8189" }}>
              <a href="tel:01059189203" style={{ color: "#9A8189" }}>
                010-5918-9203
              </a>
              <span>
                경기 성남시 분당구 운중로 124
                <br />
                8층 804-S80호
              </span>
              <span>카카오톡 채널 @웨딩버틀러</span>
            </div>
          </div>
        </div>
        <p style={{ fontSize: 12, lineHeight: 1.9, color: "#6B5A60", margin: "26px 0 0", whiteSpace: "pre-line" }}>
          {BUSINESS_LINE}
        </p>
        <LegalLinks />
      </div>
    </footer>
  );
}
