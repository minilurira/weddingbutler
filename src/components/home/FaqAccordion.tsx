"use client";

import { useState, type CSSProperties } from "react";
import { HOME_FAQS } from "@/lib/home-faq";

export function FaqAccordion() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div style={{ borderTop: "1px solid #E2CDD4" }}>
      {HOME_FAQS.map((item, i) => {
        const isOpen = open === i;
        const iconStyle: CSSProperties = {
          fontSize: 20,
          color: isOpen ? "#A9647E" : "#9A8189",
          transition: "transform .25s ease, color .25s ease",
          transform: isOpen ? "rotate(45deg)" : "rotate(0deg)",
          lineHeight: 1,
        };
        return (
          <div
            key={item.q}
            onClick={() => setOpen(isOpen ? null : i)}
            style={{ borderBottom: "1px solid #E2CDD4", padding: "26px 4px", cursor: "pointer" }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 20 }}>
              <span style={{ fontSize: 17, color: "#33232A", fontWeight: 500 }}>{item.q}</span>
              <span style={iconStyle}>+</span>
            </div>
            {/* 접힌 답변도 HTML에는 남겨 검색엔진이 읽을 수 있게 한다 */}
            <p hidden={!isOpen} style={{ fontSize: 15, lineHeight: 2, color: "#6B5A60", margin: "18px 0 0", paddingRight: 40 }}>
              {item.a}
            </p>
          </div>
        );
      })}
    </div>
  );
}
