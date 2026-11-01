"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { useReservation } from "@/components/ReservationProvider";
import { EVENT, isEventShowing, manwon } from "@/lib/plans";
import { fontDisplay, fontSerif } from "@/lib/style";

/**
 * 메인 첫 화면 팝업. 사진 위주의 여러 장(buildSlides)이 자동으로 넘어간다.
 * 장을 늘리거나 빼려면 buildSlides()만 고치면 된다. 사진은 public/popup/ 에 둔다.
 * "오늘 하루 보지 않기"는 브라우저에 오늘 날짜(한국시간)를 저장한다.
 */

const HIDE_KEY = "wb_home_popup_hidden_on";
const ROTATE_MS = 5000;

interface Slide {
  id: string;
  image: string;
  imagePosition: string;
  eyebrow?: string;
  chip?: ReactNode;
  title: ReactNode;
  sub: ReactNode;
  highlight?: ReactNode;
  cta: string;
  action: "pricing" | "booking";
}

function todayKst(): string {
  return new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 10);
}

function CardIcon() {
  return (
    <svg width="22" height="16" viewBox="0 0 22 16" fill="none" aria-hidden="true">
      <rect x="0.75" y="0.75" width="20.5" height="14.5" rx="2.5" stroke="#fff" strokeWidth="1.5" />
      <path d="M1 5h20" stroke="#fff" strokeWidth="2" />
      <path d="M4 11h5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function buildSlides(): Slide[] {
  const slides: Slide[] = [];
  if (isEventShowing()) {
    slides.push({
      id: "year-end-event",
      image: "/popup/year-end-event.jpg",
      imagePosition: "50% 40%",
      eyebrow: "YEAR-END EVENT",
      title: EVENT.name,
      sub: (
        <>
          11월 1일 – 12월 31일 예식이라면
          <br />전 요금제를 특별가로 만나보세요
        </>
      ),
      highlight: (
        <>
          스몰케어 <b style={{ fontFamily: fontSerif, fontSize: 18, fontWeight: 600 }}>{manwon(EVENT.prices.small)}</b>부터
        </>
      ),
      cta: "이벤트 가격 보기",
      action: "pricing",
    });
  }
  slides.push({
    id: "card-full-payment",
    image: "/popup/card-payment.jpg",
    imagePosition: "50% 15%",
    chip: (
      <>
        <CardIcon />
        전액 카드결제 가능
      </>
    ),
    title: (
      <>
        예약할 때 카드로,
        <br />한 번에 끝내세요
      </>
    ),
    sub: "예식 당일엔 현금 걱정 없이 맡겨 주세요",
    cta: "예약하기",
    action: "booking",
  });
  return slides;
}

const glass: CSSProperties = {
  border: "1px solid rgba(255,255,255,0.42)",
  background: "rgba(255,255,255,0.1)",
  backdropFilter: "blur(6px)",
  WebkitBackdropFilter: "blur(6px)",
  borderRadius: 999,
};

export function HomePopup() {
  const { openModal } = useReservation();
  const router = useRouter();
  const [slides, setSlides] = useState<Slide[]>([]);
  const [open, setOpen] = useState(false);
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const [touchX, setTouchX] = useState<number | null>(null);

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

  function act() {
    setOpen(false);
    if (slide.action === "pricing") router.push("/pricing");
    else openModal();
  }

  const linkBtn: CSSProperties = { background: "none", border: "none", padding: 0, fontSize: 12.5, color: "#8B7980", cursor: "pointer" };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="웨딩버틀러 안내"
      data-testid="home-popup"
      onClick={() => setOpen(false)}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 150,
        background: "rgba(18,14,16,0.6)",
        overflowY: "auto",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        fontFamily: "var(--font-sans), sans-serif",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        style={{ position: "relative", width: "100%", maxWidth: 420, margin: "auto", background: "#FBF7F5", borderRadius: 10, overflow: "hidden", boxShadow: "0 40px 90px rgba(0,0,0,0.5)" }}
      >
        <button
          onClick={() => setOpen(false)}
          aria-label="닫기"
          style={{
            position: "absolute",
            top: 14,
            right: 14,
            zIndex: 3,
            width: 36,
            height: 36,
            borderRadius: "50%",
            border: "1px solid rgba(255,255,255,0.4)",
            background: "rgba(25,16,20,0.35)",
            color: "#FFFFFF",
            fontSize: 18,
            lineHeight: 1,
            cursor: "pointer",
          }}
        >
          ×
        </button>

        <div
          onTouchStart={(e) => setTouchX(e.touches[0].clientX)}
          onTouchEnd={(e) => {
            if (touchX === null) return;
            const dx = e.changedTouches[0].clientX - touchX;
            if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
            setTouchX(null);
          }}
          style={{ position: "relative", aspectRatio: "4 / 5", overflow: "hidden", background: "#33232A" }}
        >
          {slides.map((s, i) => (
            <Image
              key={s.id}
              src={s.image}
              alt=""
              fill
              sizes="420px"
              priority={i === 0}
              style={{ objectFit: "cover", objectPosition: s.imagePosition, opacity: i === idx ? 1 : 0, transition: "opacity .6s ease" }}
            />
          ))}
          <div
            aria-hidden="true"
            style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(25,16,20,0) 28%, rgba(25,16,20,0.5) 52%, rgba(25,16,20,0.9) 100%)" }}
          />
          {count > 1 && (
            <div
              style={{
                position: "absolute",
                top: 20,
                left: 20,
                zIndex: 2,
                fontFamily: fontDisplay,
                fontSize: 14,
                letterSpacing: "0.2em",
                color: "#FFFFFF",
                background: "rgba(25,16,20,0.3)",
                padding: "4px 12px",
                borderRadius: 999,
              }}
            >
              {String(idx + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
            </div>
          )}
          <div key={slide.id} style={{ position: "absolute", left: 0, right: 0, bottom: 0, zIndex: 1, padding: "0 clamp(22px,6vw,30px) clamp(24px,6vw,30px)", color: "#FFFFFF", animation: "wbPopupUp .5s ease" }}>
            {slide.eyebrow && (
              <p style={{ fontFamily: fontDisplay, fontSize: 13, letterSpacing: "0.42em", color: "#F1D9DF", margin: "0 0 12px", display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ width: 22, height: 1, background: "#F1D9DF", opacity: 0.8 }} />
                {slide.eyebrow}
              </p>
            )}
            {slide.chip && (
              <div style={{ ...glass, display: "inline-flex", alignItems: "center", gap: 10, padding: "8px 14px 8px 10px", marginBottom: 16, fontSize: 13 }}>{slide.chip}</div>
            )}
            <h2 style={{ fontFamily: fontSerif, fontWeight: 600, fontSize: "clamp(26px,7vw,31px)", lineHeight: 1.35, margin: "0 0 12px", letterSpacing: "-0.02em" }}>{slide.title}</h2>
            <p style={{ fontSize: 14.5, lineHeight: 1.75, color: "rgba(255,255,255,0.86)", margin: 0 }}>{slide.sub}</p>
            {slide.highlight && (
              <div style={{ ...glass, display: "inline-flex", alignItems: "baseline", gap: 6, marginTop: 16, padding: "9px 16px", fontSize: 13.5 }}>{slide.highlight}</div>
            )}
          </div>
        </div>

        <div style={{ padding: "18px 22px 0" }}>
          <button
            onClick={act}
            className="btn-dark-hover"
            style={{ display: "block", width: "100%", padding: 15, borderRadius: 999, border: "none", background: "#33232A", color: "#F7EEF0", fontSize: 15, fontWeight: 500, cursor: "pointer" }}
          >
            {slide.cta} →
          </button>
        </div>
        {count > 1 && (
          <div style={{ display: "flex", justifyContent: "center", gap: 7, padding: "14px 0 2px" }}>
            {slides.map((s, i) => (
              <button
                key={s.id}
                onClick={() => setIdx(i)}
                aria-label={`${i + 1}번째 안내 보기`}
                style={{ width: i === idx ? 20 : 6, height: 6, padding: 0, border: "none", borderRadius: 999, background: i === idx ? "#A9647E" : "#DCC9CF", cursor: "pointer", transition: "width .25s ease" }}
              />
            ))}
          </div>
        )}
        <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 24px 16px" }}>
          <button onClick={hideToday} style={linkBtn}>
            오늘 하루 보지 않기
          </button>
          <button onClick={() => setOpen(false)} style={linkBtn}>
            닫기
          </button>
        </div>
      </div>
      <style>{`@keyframes wbPopupUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}`}</style>
    </div>
  );
}
