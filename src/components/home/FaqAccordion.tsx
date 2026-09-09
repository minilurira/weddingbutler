"use client";

import { useState, type CSSProperties } from "react";

const FAQS = [
  {
    q: "축의금은 누구에게 전달되나요?",
    a: "예약 시 지정하신 분(양가 부모님 또는 신랑·신부)께 현장에서 직접 인계하고, 인수 확인 서명을 받습니다. 인계 전까지 봉투는 잠금 보관함에 봉인 상태로 관리됩니다.",
  },
  {
    q: "하객이 예상보다 많이 오면 어떻게 되나요?",
    a: "현장 대응은 그대로 진행되며, 초과 인원만큼 1명당 2,000원이 예식 다음 영업일에 정산됩니다. 예상보다 적게 오셨다면 차액은 환불해 드립니다.",
  },
  {
    q: "언제까지 예약해야 하나요?",
    a: "예식 7일 전까지 온라인 예약이 가능합니다. 다만 봄·가을 주말은 조기 마감되는 경우가 많아 예식 2~3개월 전 예약을 권장드립니다.",
  },
  {
    q: "환불 규정이 어떻게 되나요?",
    a: "예식 7일 전까지 전액, 3일 전까지 50% 환불됩니다. 2일 전부터는 인력 배정이 확정되어 환불이 어렵습니다. 예식장 사정으로 인한 연기는 1회 무료 변경해 드립니다.",
  },
  {
    q: "사고가 나면 보상받을 수 있나요?",
    a: "모든 웨딩버틀러는 영업배상책임보험에 가입되어 있으며, 현장 CCTV 및 접수 기록으로 전 과정이 남습니다. 만일의 경우 회사가 전액 책임집니다.",
  },
];

export function FaqAccordion() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div style={{ borderTop: "1px solid #E2CDD4" }}>
      {FAQS.map((item, i) => {
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
            {isOpen && (
              <p style={{ fontSize: 15, lineHeight: 2, color: "#6B5A60", margin: "18px 0 0", paddingRight: 40 }}>
                {item.a}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
