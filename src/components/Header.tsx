"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { fontDisplay, fontSerif } from "@/lib/style";
import { useReservation } from "@/components/ReservationProvider";

const NAV = [
  { href: "/service", label: "서비스" },
  { href: "/pricing", label: "가격 안내" },
  { href: "/contact", label: "문의하기" },
] as const;

export function Header({ active }: { active?: "service" | "pricing" | "contact" }) {
  const { openModal } = useReservation();
  const [menuOpen, setMenuOpen] = useState(false);

  function openBookingFromMenu() {
    setMenuOpen(false);
    openModal();
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
          style={{ display: "flex", alignItems: "center", gap: 10, color: "#33232A" }}
        >
          <Image
            src="/favicon-wb.png"
            alt="웨딩버틀러"
            width={34}
            height={34}
            style={{ width: "clamp(26px,6vw,34px)", height: "clamp(26px,6vw,34px)", borderRadius: 8, flexShrink: 0 }}
            priority
          />
          <span style={{ display: "flex", flexDirection: "column", lineHeight: 1.05 }}>
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
          </span>
        </Link>
        <div data-mq="nav-menu" style={{ display: "flex", alignItems: "center", gap: 28 }}>
          <div style={{ display: "flex", gap: 26, fontSize: 14, fontWeight: 500 }}>
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                style={{ color: active === item.href.slice(1) ? "#A9647E" : "#473A3F" }}
              >
                {item.label}
              </Link>
            ))}
          </div>
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
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              style={{
                padding: "16px 4px",
                fontSize: 16,
                color: active === item.href.slice(1) ? "#A9647E" : "#473A3F",
                borderBottom: "1px solid #EBDCE0",
              }}
            >
              {item.label}
            </Link>
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
        </div>
      )}
    </header>
  );
}
