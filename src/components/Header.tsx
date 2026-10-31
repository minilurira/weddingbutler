"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fontDisplay, fontSerif } from "@/lib/style";
import { useReservation } from "@/components/ReservationProvider";

type NavKey = "service" | "pricing" | "invitation" | "myinvitation" | "contact" | "lookup";
interface NavItem { href: string; label: string; key: NavKey; children?: { href: string; label: string; key: NavKey }[] }

// "무료 청첩장" 아래에 "내 청첩장"(만든 청첩장 관리·대시보드)을 하위 메뉴로 둔다
const NAV: NavItem[] = [
  { href: "/service", label: "서비스", key: "service" },
  { href: "/pricing", label: "가격안내", key: "pricing" },
  {
    href: "/invitation",
    label: "무료 청첩장",
    key: "invitation",
    children: [
      { href: "/invitation", label: "무료 청첩장 소개", key: "invitation" },
      { href: "/invitation/new", label: "내 청첩장", key: "myinvitation" },
    ],
  },
  { href: "/contact", label: "문의하기", key: "contact" },
  { href: "/reservation/lookup", label: "예약조회", key: "lookup" },
];

export function Header({ active }: { active?: NavKey }) {
  const { openModal } = useReservation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [testKey, setTestKey] = useState<string | null>(null);

  useEffect(() => {
    try {
      const key = new URLSearchParams(window.location.search).get("testkey");
      if (key) setTestKey(key);
    } catch {
      // ignore
    }
  }, []);

  function openBookingFromMenu() {
    setMenuOpen(false);
    openModal();
  }

  function openTestPayment() {
    if (testKey) openModal(undefined, { test: true, testKey });
  }

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        backdropFilter: "blur(14px)",
        background: "rgba(243,233,235,0.88)",
        borderBottom: "1px solid #E7D5DA",
      }}
    >
      <nav
        style={{
          maxWidth: 1180,
          margin: "0 auto",
          padding: "14px clamp(16px,4vw,24px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 20,
        }}
      >
        <Link
          href="/"
          style={{ display: "flex", flexDirection: "column", lineHeight: 1.05, color: "#33232A" }}
        >
          <span style={{ fontFamily: fontDisplay, fontSize: "clamp(17px,4.4vw,22px)", letterSpacing: "0.22em", color: "#A9647E" }}>
            WEDDING BUTLER
          </span>
          <span
            style={{
              fontFamily: fontSerif,
              fontSize: 12,
              letterSpacing: "0.34em",
              color: "#8A7C6D",
              marginTop: 3,
            }}
          >
            웨 딩 버 틀 러
          </span>
        </Link>
        <div data-mq="nav-menu" style={{ display: "flex", alignItems: "center", gap: 28 }}>
          <div style={{ display: "flex", gap: 26, fontSize: 14, fontWeight: 500 }}>
            {NAV.map((item) =>
              item.children ? (
                <div key={item.href} className="nav-dd">
                  <Link
                    href={item.href}
                    aria-haspopup="true"
                    style={{ color: active === item.key || active === "myinvitation" ? "#A9647E" : "#473A3F" }}
                  >
                    {item.label} <span aria-hidden="true" style={{ fontSize: 10, opacity: 0.6 }}>▾</span>
                  </Link>
                  <div className="nav-dd-menu">
                    <div className="nav-dd-box">
                      {item.children.map((c) => (
                        <Link key={c.href} href={c.href} style={{ color: active === c.key ? "#A9647E" : "#473A3F" }}>
                          {c.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{ color: active === item.key ? "#A9647E" : "#473A3F" }}
                >
                  {item.label}
                </Link>
              ),
            )}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
          <Link
            href="/contact"
            className="btn-line-hover"
            style={{
              border: "1px solid #33232A",
              color: "#33232A",
              padding: "11px 20px",
              borderRadius: 999,
              fontSize: 14,
              fontWeight: 500,
              letterSpacing: "0.02em",
            }}
          >
            예약문의
          </Link>
          <button
            onClick={() => openModal()}
            style={{
              background: "#33232A",
              color: "#F3E9EB",
              padding: "12px 22px",
              border: "none",
              borderRadius: 999,
              fontSize: 14,
              fontWeight: 500,
              letterSpacing: "0.02em",
              cursor: "pointer",
            }}
            className="btn-dark-hover"
          >
            예약하기
          </button>
          </div>
          {testKey && (
            <button
              onClick={openTestPayment}
              style={{
                background: "#B0304A",
                color: "#fff",
                padding: "12px 18px",
                border: "none",
                borderRadius: 999,
                fontSize: 13,
                fontWeight: 500,
                letterSpacing: "0.02em",
                cursor: "pointer",
              }}
            >
              테스트 결제 (1,000원)
            </button>
          )}
        </div>
        <button
          data-mq="burger"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="메뉴"
          style={{
            display: "none",
            width: 44,
            height: 44,
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            background: "transparent",
            border: "none",
            padding: 0,
            cursor: "pointer",
          }}
        >
          <span style={{ display: "block", width: 22, height: 1.5, background: "#33232A" }} />
          <span style={{ display: "block", width: 22, height: 1.5, background: "#33232A" }} />
        </button>
      </nav>
      {menuOpen && (
        <div
          data-mq="drawer"
          style={{
            borderTop: "1px solid #E7D5DA",
            background: "#F3E9EB",
            padding: "8px 18px 20px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {NAV.map((item) => (
            <div key={item.href} style={{ display: "flex", flexDirection: "column" }}>
              <Link
                href={item.href}
                onClick={() => setMenuOpen(false)}
                style={{
                  padding: "16px 4px",
                  fontSize: 16,
                  color: active === item.key ? "#A9647E" : "#473A3F",
                  borderBottom: item.children ? "none" : "1px solid #EBDCE0",
                }}
              >
                {item.label}
              </Link>
              {item.children && (
                <div style={{ display: "flex", flexDirection: "column", paddingBottom: 6, borderBottom: "1px solid #EBDCE0" }}>
                  {item.children
                    .filter((c) => c.href !== item.href)
                    .map((c) => (
                      <Link
                        key={c.href}
                        href={c.href}
                        onClick={() => setMenuOpen(false)}
                        style={{ padding: "10px 4px 10px 20px", fontSize: 15, color: active === c.key ? "#A9647E" : "#6B5A60" }}
                      >
                        <span aria-hidden="true" style={{ color: "#C9AEB8", marginRight: 8 }}>└</span>
                        {c.label}
                      </Link>
                    ))}
                </div>
              )}
            </div>
          ))}
          <button
            onClick={openBookingFromMenu}
            style={{
              marginTop: 16,
              textAlign: "center",
              background: "#33232A",
              color: "#F3E9EB",
              padding: 16,
              border: "none",
              borderRadius: 999,
              fontSize: 15,
              cursor: "pointer",
            }}
          >
            예약하기
          </button>
          <Link
            href="/contact"
            onClick={() => setMenuOpen(false)}
            style={{
              marginTop: 10,
              textAlign: "center",
              border: "1px solid #33232A",
              color: "#33232A",
              padding: 15,
              borderRadius: 999,
              fontSize: 15,
            }}
          >
            예약문의
          </Link>
          {testKey && (
            <button
              onClick={() => {
                setMenuOpen(false);
                openTestPayment();
              }}
              style={{
                marginTop: 10,
                textAlign: "center",
                background: "#B0304A",
                color: "#fff",
                padding: 16,
                border: "none",
                borderRadius: 999,
                fontSize: 15,
                cursor: "pointer",
              }}
            >
              테스트 결제 (1,000원)
            </button>
          )}
        </div>
      )}
    </header>
  );
}
