"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";

type Direction = "up" | "left" | "right" | "none";

const OFFSET: Record<Direction, { "--reveal-x": string; "--reveal-y": string }> =
  {
    up: { "--reveal-x": "0", "--reveal-y": "28px" },
    left: { "--reveal-x": "28px", "--reveal-y": "0" },
    right: { "--reveal-x": "-28px", "--reveal-y": "0" },
    none: { "--reveal-x": "0", "--reveal-y": "0" },
  };

/**
 * 화면에 들어올 때 한 번 나타나는 요소를 관찰한다.
 *
 * 감추는 일은 CSS 가 하고(globals.css), 여기서는 "보이기 시작했다"는 사실만
 * 클래스로 알린다. 그래서 JS 가 실패하거나 사용자가 모션을 끈 경우에는
 * 아무 일도 일어나지 않고 콘텐츠가 그냥 보인다.
 */
function useRevealObserver<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // 아주 오래된 브라우저에서는 관찰 없이 즉시 보여준다.
    if (typeof IntersectionObserver === "undefined") {
      element.classList.add("is-shown");
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-shown");
          observer.unobserve(entry.target);
        }
      },
      // 살짝 안쪽으로 들어왔을 때 시작해야 자연스럽다.
      { rootMargin: "0px 0px -80px 0px" },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return ref;
}

export function Reveal({
  children,
  delay = 0,
  direction = "up",
  className,
  as: Tag = "div",
}: {
  children: ReactNode;
  /** 초 단위 지연 */
  delay?: number;
  direction?: Direction;
  className?: string;
  as?: "div" | "section" | "article" | "span";
}) {
  const ref = useRevealObserver<HTMLDivElement>();

  const style = {
    ...OFFSET[direction],
    ...(delay ? { "--reveal-delay": `${delay}s` } : {}),
  } as CSSProperties;

  return (
    <Tag ref={ref} data-reveal className={className} style={style}>
      {children}
    </Tag>
  );
}

/**
 * 자식들을 순서대로 등장시키는 컨테이너.
 *
 * 지연 시간은 CSS 의 nth-child 로 붙으므로 자식에게 index 를 넘길 필요가 없다.
 */
export function RevealGroup({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div data-reveal-group className={className}>
      {children}
    </div>
  );
}

export function RevealItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRevealObserver<HTMLDivElement>();

  return (
    <div ref={ref} data-reveal className={className}>
      {children}
    </div>
  );
}
