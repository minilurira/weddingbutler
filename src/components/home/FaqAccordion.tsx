"use client";

import { useState, type CSSProperties } from "react";

const FAQS = [
  {
    q: "축의금은 누구에게 전달하나요?",
    a: "예약 때 또는 사전 통화 때 지정하신 인수자께만 전달합니다. 지정되지 않은 분이 요청하시면 의뢰인께 직접 확인한 뒤 전달합니다. 전달할 때 인계확인서에 함께 서명하며, 이때부터 보관 책임이 인수자께 넘어갑니다.",
  },
  {
    q: "봉투를 열어서 금액을 정리해 주나요?",
    a: "고르실 수 있습니다. 밀봉은 봉투를 열지 않고 번호와 매수로 전달하고, 개봉 집계는 예식 후 버틀러 2명이 카메라 앞에서 봉투를 열어 봉투별 금액과 총액을 정리합니다. 둘 다 무료이며 예식 7일 전 사전 통화까지 바꾸실 수 있습니다.",
  },
  {
    q: "하객이 예상보다 많으면요?",
    a: "접수대에서 나눠드린 식권이 요금제 기준을 넘으면 1매당 2,000원이 추가됩니다. 당일 받은 식권을 함께 세고 시작하고, 끝나고 남은 식권을 세서 계산합니다.",
  },
  {
    q: "현장 결제는 언제 하나요?",
    a: "예식이 끝나고 축의금을 전달드리기 직전, 현장에서 카드 결제 링크나 계좌이체로 결제합니다. 신랑·신부님은 그 시간에 바쁘시니 인수자를 결제자로 지정하시길 권합니다.",
  },
  {
    q: "언제까지 예약할 수 있나요?",
    a: "예식 7일 전까지 온라인으로 예약하실 수 있습니다. 그 이후는 예약을 받지 않습니다. 봄·가을 주말은 조기 마감되는 경우가 많아 2~3개월 전 예약을 권합니다.",
  },
  {
    q: "취소하면 환불되나요?",
    a: "예식 7일 전까지는 전액, 6~3일 전은 서비스 결제 금액의 50%, 2일 전~당일은 30%를 환불합니다. 예약 후 7일 이내 취소는 전액 환불됩니다.",
  },
  {
    q: "문제가 생기면 누가 책임지나요?",
    a: "축의대 운영 구역 안에서, 전달하기 전까지 생긴 일은 웨딩버틀러가 책임집니다. 밀봉은 봉투 매수와 봉인 상태, 개봉 집계는 정리한 총액과 전달한 현금의 일치가 책임 범위입니다. 겉으로 일반 하객과 구분할 수 없어 식권이 나간 경우처럼 통상의 주의로 막을 수 없는 일은 책임 범위에 포함되지 않습니다. 자세한 내용은 이용약관을 확인해 주세요.",
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
