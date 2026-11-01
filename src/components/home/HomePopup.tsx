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
const ROTATE_MS = 3500;

interface Slide {
  id: string;
  /** dark: 사진 아래쪽을 어둡게 하고 흰 글씨 / light: 밝은 여백 위 위쪽에 진한 글씨 */
  theme: "dark" | "light";
  image: string;
  imagePosition: string;
  eyebrow?: string;
  title: ReactNode;
  sub: ReactNode;
  highlight?: ReactNode;
  cta: string;
  action: "pricing" | "booking";
}

function todayKst(): string {
  return new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 10);
}

function buildSlides(): Slide[] {
  const slides: Slide[] = [];
  if (isEventShowing()) {
    slides.push({
      id: "year-end-event",
      theme: "dark",
      image: "/popup/year-end-event.jpg",
      imagePosition: "50% 45%",
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
          스몰케어 <b style={{ fontFamily: fontSerif, fontSize: 20, fontWeight: 600, color: "#FFFFFF" }}>{manwon(EVENT.prices.small)}</b>부터
        </>
      ),
      cta: "이벤트 가격 보기",
      action: "pricing",
    });
  }
  slides.push({
    id: "card-full-payment",
    theme: "light",
    image: "/popup/card-payment.jpg",
    imagePosition: "50% 50%",
    title: (
      <>
        예약할 때 카드로,
        <br />한 번에 끝내세요
      </>
    ),
    sub: (
      <>
        예식 당일엔
        <br />
        현금 걱정 없이 맡겨 주세요
      </>
    ),
    cta: "예약하기",
    action: "booking",
  });
  return slides;
}


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
  const light = slide.theme === "light";

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
          style={{ position: "relative", aspectRatio: "4 / 5.2", overflow: "hidden", background: light ? "#EFE5DA" : "#33232A" }}
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
            style={{
              position: "absolute",
              inset: 0,
              opacity: light ? 0 : 1,
              transition: "opacity .6s ease",
              background: "linear-gradient(180deg, rgba(25,16,20,0.25) 0%, rgba(25,16,20,0.05) 25%, rgba(25,16,20,0.45) 50%, rgba(25,16,20,0.9) 100%)",
            }}
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
                background: light ? "rgba(51,35,42,0.55)" : "rgba(25,16,20,0.3)",
                padding: "4px 12px",
                borderRadius: 999,
              }}
            >
              {String(idx + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
            </div>
          )}
          <div
            key={slide.id}
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              zIndex: 1,
              ...(light ? { top: 0, padding: "64px 28px 0" } : { bottom: 0, padding: "0 clamp(22px,6vw,30px) 100px" }),
              color: light ? "#33232A" : "#FFFFFF",
              animation: "wbPopupUp .5s ease",
            }}
          >
            {slide.eyebrow && (
              <p style={{ fontFamily: fontDisplay, fontSize: 13, letterSpacing: "0.42em", color: "#F1D9DF", margin: "0 0 12px", display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ width: 22, height: 1, background: "#F1D9DF", opacity: 0.8 }} />
                {slide.eyebrow}
              </p>
            )}
            <h2 style={{ fontFamily: fontSerif, fontWeight: 600, fontSize: "clamp(26px,7vw,31px)", lineHeight: 1.35, margin: "0 0 12px", letterSpacing: "-0.02em" }}>{slide.title}</h2>
            <p style={{ fontSize: 14.5, lineHeight: 1.75, color: light ? "#5E4E54" : "rgba(255,255,255,0.86)", margin: 0 }}>{slide.sub}</p>
            {slide.highlight && (
              <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 14, fontSize: 14, color: "#F1D9DF" }}>{slide.highlight}</div>
            )}
          </div>
          <button
            onClick={act}
            style={{
              position: "absolute",
              zIndex: 2,
              bottom: light ? 28 : 24,
              left: light ? 28 : 24,
              right: light ? "auto" : 24,
              padding: light ? "14px 26px" : 15,
              borderRadius: 999,
              border: "none",
              background: light ? "#33232A" : "#FBF7F5",
              color: light ? "#F7EEF0" : "#33232A",
              fontSize: 15,
              fontWeight: 500,
              cursor: "pointer",
              boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
            }}
          >
            {slide.cta} →
          </button>
        </div>

        {count > 1 && (
          <div style={{ display: "flex", justifyContent: "center", gap: 7, padding: "14px 0 0" }}>
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
        <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 24px 16px" }}>
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
