"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { DESK_TYPE, EVENT, isEventShowing, manwon, PLAN_ORDER, PLANS, type PublicPlanKey } from "@/lib/plans";
import { fontDisplay, fontSerif } from "@/lib/style";
import { Reveal } from "@/components/Reveal";

const BULLETS: Record<PublicPlanKey, { text: string; muted?: boolean }[]> = {
  small: [
    { text: "하객 100명 이하 예식" },
    { text: "웨딩버틀러 2명 배정" },
    { text: "봉투 · 식대 집계 엑셀 파일 제공" },
  ],
  smallboth: [
    { text: "양가 각 하객 60명 이하 예식" },
    { text: "웨딩버틀러 2명 · 축의대 1곳" },
    { text: "양가 통합 기록 · 엑셀 파일 제공" },
  ],
  standard: [
    { text: "하객 101~200명 예식" },
    { text: "200명 초과 시 1명당 2,000원 추가", muted: true },
    { text: "웨딩버틀러 2명 배정" },
    { text: "정산 리포트 제공" },
  ],
  premium: [
    { text: "양가 하객 각 200명 기준" },
    { text: "웨딩버틀러 4명 배정 (양가 2명씩)" },
    { text: "정산 리포트 · 운영 영상 제공" },
  ],
};

const EYEBROW: Record<PublicPlanKey, string> = {
  small: "01 SMALL CARE",
  smallboth: "03 SMALL BOTH",
  standard: "02 STANDARD",
  premium: "04 PREMIUM",
};

const DELAY: Record<PublicPlanKey, number> = { small: 50, standard: 120, smallboth: 190, premium: 260 };

export function PriceTeaserCards() {
  const [selected, setSelected] = useState<PublicPlanKey>("standard");
  // 이벤트가 표시는 브라우저 시각으로 정한다 (기간이 끝난 뒤 정적 HTML과 어긋나지 않게).
  const [eventOn, setEventOn] = useState(false);
  useEffect(() => setEventOn(isEventShowing()), []);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 250px), 1fr))", gap: 18, alignItems: "start" }}>
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
          padding: "44px 28px 36px",
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
                  margin: "0 0 12px",
                  color: dark ? "#FFFFFF" : undefined,
                }}
              >
                {PLANS[key].name}
              </h3>
              <div
                style={{
                  paddingBottom: 20,
                  marginBottom: 22,
                  borderBottom: "1px solid " + (dark ? "rgba(255,255,255,0.16)" : "#E7D5DA"),
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  gap: 12,
                }}
              >
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 500,
                    padding: "4px 10px",
                    borderRadius: 999,
                    ...(key === "smallboth" || key === "premium"
                      ? { background: dark ? "#F3E9EB" : "#33232A", color: dark ? "#33232A" : "#F3E9EB" }
                      : { background: dark ? "rgba(255,255,255,0.12)" : "#F6ECEF", color: dark ? "#E9CAD1" : "#A9647E" }),
                  }}
                >
                  {DESK_TYPE[key]}
                </span>
                {eventOn && (
                  <span style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 12, color: dark ? "#E9CAD1" : "#A9647E" }}>연말 이벤트가</span>
                    <span style={{ fontSize: 13, color: dark ? "#B79AA3" : "#A8959B", textDecoration: "line-through" }}>{manwon(PLANS[key].base)}</span>
                    <span style={{ fontFamily: fontSerif, fontSize: 22, fontWeight: 600, color: dark ? "#FFFFFF" : "#8E3F5F" }}>{manwon(EVENT.prices[key])}</span>
                  </span>
                )}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 13, margin: 0 }}>
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
