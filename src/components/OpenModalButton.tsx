"use client";

import type { CSSProperties, ReactNode } from "react";
import { useReservation } from "@/components/ReservationProvider";
import type { PlanKey } from "@/lib/plans";

export function OpenModalButton({
  children,
  plan,
  as = "button",
  style,
  className,
}: {
  children: ReactNode;
  plan?: PlanKey;
  as?: "button" | "a";
  style?: CSSProperties;
  className?: string;
}) {
  const { openModal } = useReservation();
  if (as === "a") {
    return (
      <a onClick={() => openModal(plan)} style={{ cursor: "pointer", ...style }} className={className}>
        {children}
      </a>
    );
  }
  return (
    <button onClick={() => openModal(plan)} style={style} className={className}>
      {children}
    </button>
  );
}
