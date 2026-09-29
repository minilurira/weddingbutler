"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { PlanKey } from "@/lib/plans";
import { ReservationModal } from "@/components/ReservationModal";

interface ReservationContextValue {
  openModal: (plan?: PlanKey, opts?: { test?: boolean; testKey?: string }) => void;
  closeModal: () => void;
}

const ReservationContext = createContext<ReservationContextValue | null>(null);

export function useReservation(): ReservationContextValue {
  const ctx = useContext(ReservationContext);
  if (!ctx) {
    throw new Error("useReservation must be used within ReservationProvider");
  }
  return ctx;
}

function isPlanKey(v: string | null): v is PlanKey {
  return v === "small" || v === "standard" || v === "premium";
}

export function ReservationProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [plan, setPlan] = useState<PlanKey>("standard");
  const [test, setTest] = useState(false);
  const [testKey, setTestKey] = useState("");

  const openModal = useCallback((p?: PlanKey, opts?: { test?: boolean; testKey?: string }) => {
    if (p) setPlan(p);
    setTest(!!opts?.test);
    setTestKey(opts?.testKey ?? "");
    setOpen(true);
  }, []);
  const closeModal = useCallback(() => setOpen(false), []);

  useEffect(() => {
    try {
      const q = new URLSearchParams(window.location.search);
      const p = q.get("plan");
      if (isPlanKey(p)) setPlan(p);
      if (q.has("booking")) setOpen(true);
    } catch {
      // ignore malformed query strings
    }
  }, []);

  const value = useMemo(() => ({ openModal, closeModal }), [openModal, closeModal]);

  return (
    <ReservationContext.Provider value={value}>
      {children}
      <ReservationModal open={open} plan={plan} test={test} testKey={testKey} onClose={closeModal} onPlanChange={setPlan} />
    </ReservationContext.Provider>
  );
}
