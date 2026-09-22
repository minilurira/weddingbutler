"use client";

import { useState, type CSSProperties } from "react";
import { PLAN_ORDER, PLANS, type PlanKey } from "@/lib/plans";
import { fontDisplay, fontSerif } from "@/lib/style";
import { Reveal } from "@/components/Reveal";

const BULLETS: Record<PlanKey, { text: string; muted?: boolean }[]> = {
  small: [
    { text: "하객 200명 이하 예식" },
    { text: "웨딩버틀러 2명 배정" },
    { text: "정산 리포트 · 운영 영상 제공" },
  ],
  standard: [
    { text: "하객 200명 초과 ~ 300명 이하" },
    { text: "웨딩버틀러 2명 배정" },
    { text: "정산 리포트 · 운영 영상 제공" },
  ],
  premium: [
    { text: "양가 하객 각 200명 기준" },
    { text: "웨딩버틀러 4명 배정 (양가 2명씩)" },
    { text: "정산 리포트 · 운영 영상 제공" },
  ],
};

const EYEBROW: Record<PlanKey, string> = {
  small: "01 SMALL CARE",
  standard: "02 STANDARD",
  premium: "03 PREMIUM",
};

const DELAY: Record<PlanKey, number> = { small: 50, standard: 150, premium: 250 };

export function PriceTeaserCards() {
  const [selected, setSelected] = useState<PlanKey>("standard");

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))", gap: 22, alignItems: "start" }}>
      {PLAN_ORDER.map((key) => {
        const isStandard = key === "standard";
        const on = selected === key;
        const dark = isStandard;
        const card: CSSProperties = {
          position: "relative",
          cursor: "pointer",
          background: dark ? "#33232A" : "#FFFFFF",
          border: "1px solid " + (dark ? "#33232A" : "#E7D5DA"),
          borderRadius: 4,
          padding: "44px 34px 38px",
        };
        return (
          <Reveal key={key} delay={DELAY[key]}>
            <div onClick={() => setSelected(key)} style={card}>
              <div
                style={{
                  position: "absolute",
                  inset: -1,
                  borderRadius: 4,
                  pointerEvents: "none",
                  border: "2px solid #A9647E",
                  opacity: on ? 1 : 0,
                  transition: "opacity .25s ease",
                }}
              />
              {isStandard && (
                <div
                  style={{
                    position: "absolute",
                    top: -13,
                    left: 34,
                    background: "#A9647E",
                    color: "#fff",
                    fontSize: 12,
                    letterSpacing: "0.14em",
                    padding: "6px 14px",
                    borderRadius: 999,
                  }}
                >
                  BEST
                </div>
              )}
              <p style={{ fontFamily: fontDisplay, fontSize: 13, letterSpacing: "0.34em", color: dark ? "#E9CAD1" : "#A9647E", margin: "0 0 10px" }}>
                {EYEBROW[key]}
              </p>
              <h3
                style={{
                  fontFamily: fontSerif,
                  fontSize: 26,
                  fontWeight: 600,
                  margin: "0 0 22px",
                  color: dark ? "#FFFFFF" : undefined,
                  paddingBottom: 22,
                  borderBottom: "1px solid " + (dark ? "rgba(255,255,255,0.16)" : "#E7D5DA"),
                }}
              >
                {PLANS[key].name}
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 13, margin: "26px 0 0" }}>
                {BULLETS[key].map((b) => (
                  <div
                    key={b.text}
                    style={{
                      display: "flex",
                      gap: 10,
                      fontSize: 15,
                      color: dark ? "#F3E9EB" : b.muted ? "#9A8189" : "#473A3F",
                      lineHeight: 1.6,
                    }}
                  >
                    <span style={{ color: dark ? "#E9CAD1" : b.muted ? "#E9CAD1" : "#A9647E" }}>·</span>
                    <span>{b.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        );
      })}
    </div>
  );
}
