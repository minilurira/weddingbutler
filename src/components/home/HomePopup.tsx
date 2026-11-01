"use client";

import { useCallback, useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { useReservation } from "@/components/ReservationProvider";
import { DEPOSIT_AMOUNT, DESK_TYPE, EVENT, isEventShowing, manwon, PLAN_ORDER, PLANS, type PublicPlanKey } from "@/lib/plans";
import { fontDisplay, fontSerif } from "@/lib/style";

/**
 * 메인 첫 화면 팝업. 여러 장(SLIDES)이 자동으로 넘어간다.
 * 장을 늘리거나 빼려면 buildSlides()만 고치면 된다. "오늘 하루 보지 않기"는 브라우저에 날짜를 저장한다.
 */

const HIDE_KEY = "wb_home_popup_hidden_on";
const ROTATE_MS = 5000;

interface Slide {
  id: string;
  eyebrow: string;
  title: string;
  sub: ReactNode;
  body: ReactNode;
  cta: string;
}

function todayKst(): string {
  return new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 10);
}

const badge = (kind: "one" | "both" | "accent"): CSSProperties => ({
  fontSize: 11,
  fontWeight: 500,
  padding: "3px 8px",
  borderRadius: 999,
  whiteSpace: "nowrap",
  fontFamily: "var(--font-sans), sans-serif",
  ...(kind === "one"
    ? { background: "#F6ECEF", color: "#A9647E", border: "1px solid #EBD6DD" }
    : kind === "both"
      ? { background: "#33232A", color: "#F3E9EB", border: "1px solid #33232A" }
      : { background: "#A9647E", color: "#FFFFFF", border: "1px solid #A9647E" }),
});

const noteStyle: CSSProperties = { fontSize: 12, lineHeight: 1.75, color: "#6B5A60", margin: "10px 2px 14px" };

function EventBody() {
  return (
    <>
      {PLAN_ORDER.map((k: PublicPlanKey) => (
        <div
          key={k}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 10,
            padding: "13px 15px",
            background: "#FFFFFF",
            border: "1px solid #E7D5DA",
            borderRadius: 4,
            marginBottom: 8,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap", fontFamily: fontSerif, fontWeight: 600, fontSize: 16 }}>
            {PLANS[k].name}
            <span style={badge(k === "smallboth" || k === "premium" ? "both" : "one")}>{DESK_TYPE[k]}</span>
            {k === "smallboth" && <span style={badge("accent")}>NEW</span>}
          </div>
          <div style={{ textAlign: "right", whiteSpace: "nowrap" }}>
            <span style={{ fontSize: 13, color: "#A8959B", textDecoration: "line-through", marginRight: 6 }}>{manwon(PLANS[k].base)}</span>
            <span style={{ fontFamily: fontSerif, fontSize: 19, fontWeight: 700, color: "#8E3F5F" }}>{manwon(EVENT.prices[k])}</span>
          </div>
        </div>
      ))}
      <p style={noteStyle}>
        · 밀봉 · 개봉 집계 모두 이벤트가 적용 · 부가세 포함
        <br />· 스몰양가: 양가 각 60명 이하 · 축의대 1곳 · 버틀러 2명
      </p>
    </>
  );
}

function PayOption({ title, accent, children, on }: { title: string; accent?: string; children: ReactNode; on?: boolean }) {
  return (
    <div style={{ background: "#FFFFFF", border: on ? "1.5px solid #33232A" : "1px solid #E7D5DA", borderRadius: 4, padding: "16px 18px 14px", marginBottom: 10 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
        <span style={{ fontFamily: fontSerif, fontWeight: 600, fontSize: 17, color: on ? "#33232A" : "#473A3F" }}>{title}</span>
        {accent && <span style={badge("accent")}>{accent}</span>}
      </div>
      <p style={{ fontSize: 13.5, lineHeight: 1.75, color: "#6B5A60", margin: 0 }}>{children}</p>
    </div>
  );
}

const B = ({ children }: { children: ReactNode }) => <b style={{ color: "#33232A", fontWeight: 500 }}>{children}</b>;

function CardPayBody() {
  return (
    <>
      <PayOption title="전액결제" accent="추천" on>
        예약할 때 <B>총 금액을 카드로 결제</B>
        <br />
        현장 결제 <B>0원</B> · 당일 따로 챙길 것이 없어요
      </PayOption>
      <PayOption title="예약금 결제 후 현장결제">
        예약할 때 <B>예약금 {manwon(DEPOSIT_AMOUNT)}</B>만 카드로 결제
        <br />
        나머지는 예식 당일 현장에서 현금 결제
      </PayOption>
      <p style={noteStyle}>
        · 예약할 때 두 가지 중 고르실 수 있어요 · 카드 결제가 끝나면 예약 확정
        <br />· KG이니시스 구매안전서비스 · 부가세 포함
        <br />· 기준 인원을 넘긴 식권만 당일 현장에서 현금 정산
      </p>
    </>
  );
}

function buildSlides(): Slide[] {
  const slides: Slide[] = [];
  if (isEventShowing()) {
    slides.push({
      id: "year-end-event",
      eyebrow: "YEAR-END EVENT",
      title: EVENT.name,
      sub: (
        <>
          <b style={{ color: "#FFFFFF", fontWeight: 500 }}>11월 1일 ~ 12월 31일</b> 예식 한정 특별가
        </>
      ),
      body: <EventBody />,
      cta: "이벤트가로 예약하기",
    });
  }
  slides.push({
    id: "card-full-payment",
    eyebrow: "CARD PAYMENT",
    title: "전액 카드결제 가능",
    sub: (
      <>
        예약할 때 <b style={{ color: "#FFFFFF", fontWeight: 500 }}>총 금액을 카드로 한 번에</b> 결제하고
        <br />
        예식 당일엔 현금 걱정 없이 맡겨 주세요
      </>
    ),
    body: <CardPayBody />,
    cta: "예약하기",
  });
  return slides;
}

export function HomePopup() {
  const { openModal } = useReservation();
  const [slides, setSlides] = useState<Slide[]>([]);
  const [open, setOpen] = useState(false);
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    // 예약 링크(?booking)로 들어온 경우엔 예약 창이 바로 열리므로 팝업을 띄우지 않는다.
    try {
      if (new URLSearchParams(window.location.search).has("booking")) return;
    } catch {
      // ignore
    }
    let hidden = false;
    try {
      hidden = window.localStorage.getItem(HIDE_KEY) === todayKst();
    } catch {
      // 저장소를 못 쓰는 브라우저는 매번 보여준다
    }
    if (hidden) return;
    const s = buildSlides();
    if (!s.length) return;
    setSlides(s);
    setOpen(true);
  }, []);

  const count = slides.length;
  const go = useCallback((d: number) => setIdx((i) => (i + d + count) % count), [count]);

  useEffect(() => {
    if (!open || paused || count < 2) return;
    const t = window.setTimeout(() => go(1), ROTATE_MS);
    return () => window.clearTimeout(t);
  }, [open, paused, count, idx, go]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, go]);

  if (!open || !count) return null;
  const slide = slides[Math.min(idx, count - 1)];

  function hideToday() {
    try {
      window.localStorage.setItem(HIDE_KEY, todayKst());
    } catch {
      // ignore
    }
    setOpen(false);
  }

  function book() {
    setOpen(false);
    openModal();
  }

  const arrowBtn: CSSProperties = {
    width: 30,
    height: 30,
    borderRadius: "50%",
    border: "1px solid #DCC4CC",
    background: "transparent",
    color: "#8E7A81",
    fontSize: 15,
    lineHeight: 1,
    cursor: "pointer",
  };
  const linkBtn: CSSProperties = { background: "none", border: "none", padding: 0, fontSize: 13, color: "#6B5A60", cursor: "pointer" };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={slide.title}
      data-testid="home-popup"
      onClick={() => setOpen(false)}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 150,
        background: "rgba(18,18,18,0.62)",
        overflowY: "auto",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        fontFamily: "var(--font-sans), sans-serif",
        color: "#33232A",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        style={{ position: "relative", width: "100%", maxWidth: 440, margin: "auto", background: "#F3E9EB", borderRadius: 6, overflow: "hidden", boxShadow: "0 30px 80px rgba(0,0,0,0.45)" }}
      >
        <button
          onClick={() => setOpen(false)}
          aria-label="닫기"
          style={{ position: "absolute", top: 14, right: 14, zIndex: 2, width: 34, height: 34, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.35)", background: "transparent", color: "#FFFFFF", fontSize: 18, lineHeight: 1, cursor: "pointer" }}
        >
          ×
        </button>
        <div key={slide.id} style={{ animation: "wbPopupFade .35s ease" }}>
          <div style={{ background: "#33232A", color: "#FFFFFF", padding: "clamp(28px,6vw,34px) clamp(22px,6vw,30px) clamp(22px,5vw,28px)", textAlign: "center" }}>
            <p style={{ fontFamily: fontDisplay, letterSpacing: "0.4em", fontSize: 14, color: "#E9CAD1", margin: "0 0 12px" }}>{slide.eyebrow}</p>
            <h2 style={{ fontFamily: fontSerif, fontWeight: 600, fontSize: "clamp(23px,6vw,28px)", margin: "0 0 10px", letterSpacing: "-0.02em" }}>{slide.title}</h2>
            <p style={{ fontSize: 14, lineHeight: 1.7, color: "#D8C3C9", margin: 0 }}>{slide.sub}</p>
          </div>
          <div style={{ padding: "clamp(18px,4vw,22px) clamp(16px,5vw,24px) 4px", minHeight: count > 1 ? 380 : undefined }}>{slide.body}</div>
        </div>
        <div style={{ padding: "0 clamp(16px,5vw,24px)" }}>
          <button
            onClick={book}
            className="btn-dark-hover"
            style={{ display: "block", width: "100%", padding: 16, borderRadius: 999, border: "none", background: "#33232A", color: "#F3E9EB", fontSize: 15, fontWeight: 500, cursor: "pointer" }}
          >
            {slide.cta}
          </button>
        </div>
        {count > 1 && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, padding: "16px 0 2px" }}>
            <button onClick={() => go(-1)} aria-label="이전" style={arrowBtn}>
              ‹
            </button>
            {slides.map((s, i) => (
              <button
                key={s.id}
                onClick={() => setIdx(i)}
                aria-label={`${i + 1}번째 안내`}
                style={{ width: i === idx ? 22 : 7, height: 7, padding: 0, border: "none", borderRadius: 999, background: i === idx ? "#A9647E" : "#DCC4CC", cursor: "pointer", transition: "width .25s ease" }}
              />
            ))}
            <button onClick={() => go(1)} aria-label="다음" style={arrowBtn}>
              ›
            </button>
          </div>
        )}
        <div style={{ display: "flex", justifyContent: "space-between", padding: "12px clamp(16px,5vw,24px) 18px" }}>
          <button onClick={hideToday} style={linkBtn}>
            오늘 하루 보지 않기
          </button>
          <button onClick={() => setOpen(false)} style={linkBtn}>
            닫기
          </button>
        </div>
      </div>
      <style>{`@keyframes wbPopupFade{from{opacity:0;transform:translateX(8px)}to{opacity:1;transform:none}}`}</style>
    </div>
  );
}
