"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { fontSerif } from "@/lib/style";
import type { ConfirmReservationResponse } from "@/lib/reservation-types";

/** 모바일 결제(이니시스 리다이렉트 방식)가 끝나고 돌아오는 페이지.
 * 예약 생성 시점에 이미 만들어 둔 예약 id·paymentId로 결제를 확정한다 —
 * 모달 안에서 완료되는 PC 팝업 방식과 달리, 이 페이지로의 이동 자체가
 * 원래 페이지의 리액트 상태를 모두 잃게 하므로 별도의 화면으로 처리한다. */
function ReturnContent() {
  const params = useSearchParams();
  const rid = params.get("rid");
  const paymentId = params.get("paymentId");
  const [phase, setPhase] = useState<"confirming" | "done" | "error">("confirming");
  const [bookingNo, setBookingNo] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!rid || !paymentId) {
      setPhase("error");
      setMessage("결제 정보를 확인할 수 없습니다.");
      return;
    }
    (async () => {
      try {
        const res = await fetch(`/api/reservations/${rid}/confirm`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paymentId }),
        });
        const data = (await res.json()) as ConfirmReservationResponse;
        if (data.ok) {
          setBookingNo(data.bookingNo || "");
          setPhase("done");
        } else {
          setMessage(data.message || "결제가 확인되지 않았습니다.");
          setPhase("error");
        }
      } catch {
        setMessage("결제 확인 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
        setPhase("error");
      }
    })();
  }, [rid, paymentId]);

  return (
    <div style={{ minHeight: "55vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "clamp(60px,12vw,120px) 20px" }}>
      <div style={{ textAlign: "center", maxWidth: 440 }}>
        {phase === "confirming" && (
          <>
            <div style={spinnerCircleStyle}>···</div>
            <h1 style={{ fontFamily: fontSerif, fontSize: 24, fontWeight: 600, margin: "0 0 12px" }}>결제를 확인하고 있습니다</h1>
            <p style={{ fontSize: 14, lineHeight: 1.8, color: "#6B5A60", margin: 0 }}>잠시만 기다려 주세요.</p>
          </>
        )}
        {phase === "done" && (
          <>
            <div style={{ ...spinnerCircleStyle, background: "#A9647E" }}>✓</div>
            <h1 style={{ fontFamily: fontSerif, fontSize: 26, fontWeight: 600, margin: "0 0 14px" }}>예약이 확정되었습니다</h1>
            <p style={{ fontSize: 15, lineHeight: 1.9, color: "#6B5A60", margin: "0 0 28px" }}>
              예약확인서를 알림톡과 이메일로 보내드렸습니다. 내용이 신청과 다르면 바로 알려 주세요.
              <br />예식 7일 전 담당 매니저가 연락드립니다.
            </p>
            {bookingNo && (
              <div style={{ display: "inline-block", background: "#E9CAD1", padding: "16px 28px", borderRadius: 4, fontSize: 14, marginBottom: 30 }}>
                <span style={{ color: "#6B5A60" }}>예약번호</span>{" "}
                <span style={{ color: "#33232A" }}>{bookingNo}</span>
              </div>
            )}
            <div>
              <Link href="/" style={darkBtnStyle}>
                홈으로 돌아가기
              </Link>
            </div>
          </>
        )}
        {phase === "error" && (
          <>
            <div style={{ ...spinnerCircleStyle, background: "#B0304A" }}>!</div>
            <h1 style={{ fontFamily: fontSerif, fontSize: 24, fontWeight: 600, margin: "0 0 12px" }}>결제를 확인하지 못했습니다</h1>
            <p style={{ fontSize: 14, lineHeight: 1.8, color: "#6B5A60", margin: "0 0 28px" }}>{message}</p>
            <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/" style={darkBtnStyle}>
                다시 예약하기
              </Link>
              <Link href="/contact" style={outlineBtnStyle}>
                문의하기
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const spinnerCircleStyle = {
  width: 58,
  height: 58,
  borderRadius: "50%",
  background: "#9A8189",
  color: "#fff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  margin: "0 auto 26px",
  fontSize: 26,
} as const;

const darkBtnStyle = {
  display: "inline-block",
  border: "none",
  background: "#33232A",
  color: "#F3E9EB",
  padding: "13px 28px",
  borderRadius: 999,
  fontSize: 14,
} as const;

const outlineBtnStyle = {
  display: "inline-block",
  border: "1px solid #E2CDD4",
  background: "transparent",
  color: "#6B5A60",
  padding: "13px 28px",
  borderRadius: 999,
  fontSize: 14,
} as const;

export default function ReservationReturnPage() {
  return (
    <div style={{ width: "100%", overflowX: "hidden", background: "#F3E9EB" }}>
      <Header />
      <Suspense fallback={null}>
        <ReturnContent />
      </Suspense>
      <Footer full />
    </div>
  );
}
