"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

export function Reveal({
  children,
  delay = 0,
  style,
}: {
  children: ReactNode;
  delay?: number;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const revealed = useRef(false);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reveal = () => {
      if (revealed.current) return;
      revealed.current = true;
      setShown(true);
    };

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting || entry.boundingClientRect.bottom < 0) {
            reveal();
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    io.observe(el);

    const sweep = () => {
      if (revealed.current) return;
      const r = el.getBoundingClientRect();
      if (r.bottom < 0 || r.top < window.innerHeight) {
        reveal();
        io.unobserve(el);
      }
    };
    window.addEventListener("scroll", sweep, { passive: true });
    sweep();

    return () => {
      io.disconnect();
      window.removeEventListener("scroll", sweep);
    };
  }, []);

  return (
    <div
      ref={ref}
      className={`reveal${shown ? " reveal-in" : ""}`}
      style={{ transitionDelay: delay ? `${delay}ms` : undefined, ...style }}
    >
      {children}
    </div>
  );
}
