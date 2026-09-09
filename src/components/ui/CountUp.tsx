"use client";

import { useEffect, useRef, useState } from "react";
import { formatNumber } from "@/lib/format";

/**
 * 숫자가 바뀔 때 부드럽게 굴러가는 카운터.
 *
 * 요금 계산기에서 하객 수를 조절하면 총액이 튀지 않고 이어지도록 쓴다.
 * 화면에 처음 들어올 때는 0에서, 이후 값이 바뀌면 이전 값에서 출발한다.
 *
 * 애니메이션이 어떤 이유로도 돌지 않으면 최종 금액을 그대로 보여준다.
 * 금액이 안 보이거나 0 으로 멈추는 일이 있어서는 안 되기 때문이다.
 */
export function CountUp({
  value,
  duration = 700,
  suffix = "원",
  className = "",
}: {
  value: number;
  duration?: number;
  suffix?: string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const fromRef = useRef(0);
  const [display, setDisplay] = useState<number | null>(null);
  // IntersectionObserver 가 없는 환경이면 관찰을 기다리지 않고 바로 시작한다.
  const [started, setStarted] = useState(
    () => typeof IntersectionObserver === "undefined",
  );

  // 화면에 들어왔는지 한 번만 확인한다.
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    if (typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setStarted(true);
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -40px 0px" },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;

    // 모션을 줄이도록 설정한 사용자에게는 굴리지 않고 결과만 보여준다.
    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    // 굴리지 않는 경우에는 상태를 건드리지 않는다.
    // display 가 비어 있으면 아래에서 최종 값을 그대로 그리기 때문이다.
    if (prefersReduced) {
      fromRef.current = value;
      return;
    }

    const from = fromRef.current;
    const delta = value - from;
    if (delta === 0) return;

    let frame = 0;
    const start = performance.now();

    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      // easeOutExpo — 처음엔 빠르게, 끝에서 부드럽게 멈춘다
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setDisplay(Math.round(from + delta * eased));

      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      } else {
        fromRef.current = value;
      }
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value, started, duration]);

  // 아직 굴리기 전이면 최종 값을 그대로 쓴다 — 서버 렌더 결과와도 일치한다.
  return (
    <span ref={ref} className={`tabular ${className}`}>
      {formatNumber(display ?? value)}
      {suffix}
    </span>
  );
}
