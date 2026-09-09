"use client";

import Link from "next/link";
import { fontDisplay, fontSerif } from "@/lib/style";
import { useReservation } from "@/components/ReservationProvider";

const NAV = [
  { href: "/service", label: "서비스" },
  { href: "/pricing", label: "요금제" },
  { href: "/contact", label: "문의하기" },
] as const;

export function Header({ active }: { active?: "service" | "pricing" | "contact" }) {
  const { openModal } = useReservation();

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
          padding: "16px 24px",
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
          <span style={{ fontFamily: fontDisplay, fontSize: 22, letterSpacing: "0.22em", color: "#A9647E" }}>
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
        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
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
            className="btn-hover-accent"
          >
            예약하기
          </button>
        </div>
      </nav>
    </header>
  );
}
