"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import {
  calcPrice,
  guestsForPlanSwitch,
  PAY_METHODS,
  PLAN_ORDER,
  PLANS,
  TIME_SLOTS,
  won,
  type PayMethod,
  type PlanKey,
} from "@/lib/plans";
import { fontDisplay, fontSerif } from "@/lib/style";
import { requestDepositPayment } from "@/lib/portone-client";
import type {
  ConfirmReservationResponse,
  CreateReservationResponse,
} from "@/lib/reservation-types";

interface ModalState {
  plan: PlanKey;
  y: number;
  m: number;
  date: number | null;
  time: string | null;
  guests: number;
  extraButlers: number;
  name: string;
  phone: string;
  venue: string;
  pay: PayMethod;
  phase: "form" | "submitting" | "done";
  bookingNo: string;
  error: string | null;
}

function initialState(plan: PlanKey): ModalState {
  const now = new Date();
  return {
    plan,
    y: now.getFullYear(),
    m: now.getMonth() + 1,
    date: null,
    time: null,
    guests: 250,
    extraButlers: 0,
    name: "",
    phone: "",
    venue: "",
    pay: "신용카드",
    phase: "form",
    bookingNo: "",
    error: null,
  };
}

const chipStyle = (on: boolean): CSSProperties => ({
  padding: "12px 6px",
  textAlign: "center",
  fontSize: 14,
  borderRadius: 3,
  cursor: "pointer",
  userSelect: "none",
  transition: "all .2s ease",
  background: on ? "#33232A" : "#FFFFFF",
  color: on ? "#FFFFFF" : "#473A3F",
  border: "1px solid " + (on ? "#33232A" : "#E2CDD4"),
});

export function ReservationModal({
  open,
  plan,
  onClose,
  onPlanChange,
}: {
  open: boolean;
  plan: PlanKey;
  onClose: () => void;
  onPlanChange: (p: PlanKey) => void;
}) {
  const [state, setState] = useState<ModalState>(() => initialState(plan));
  const prevPlanProp = useRef(plan);

  const patch = (
    p: Partial<ModalState> | ((s: ModalState) => Partial<ModalState>)
  ) => setState((s) => ({ ...s, ...(typeof p === "function" ? p(s) : p) }));

  function pick(p: PlanKey) {
    patch((s) => ({ plan: p, guests: guestsForPlanSwitch(p, s.guests) }));
  }

  useEffect(() => {
    if (plan !== prevPlanProp.current) {
      pick(plan);
      prevPlanProp.current = plan;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plan]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  function shiftMonth(d: number) {
    patch((s) => {
      let y = s.y;
      let m = s.m + d;
      if (m > 12) {
        m = 1;
        y++;
      }
      if (m < 1) {
        m = 12;
        y--;
      }
      return { y, m, date: null };
    });
  }

  function handleClose() {
    onClose();
    if (state.phase === "done") {
      patch(initialState(state.plan));
    }
  }

  if (!open) return null;

  const P = PLANS[state.plan];
  const price = calcPrice(state.plan, state.guests, state.extraButlers);
  const ready = !!(state.date && state.time && state.name.trim() && state.phone.trim());

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const first = new Date(state.y, state.m - 1, 1);
  const start = first.getDay();
  const totalDays = new Date(state.y, state.m, 0).getDate();

  const days: { key: string; label: string; style: CSSProperties; onClick: (() => void) | null }[] = [];
  for (let i = 0; i < start; i++) {
    days.push({ key: "b" + i, label: "", style: { height: 42 }, onClick: null });
  }
  for (let d = 1; d <= totalDays; d++) {
    const dt = new Date(state.y, state.m - 1, d);
    const dow = dt.getDay();
    const past = dt < today;
    const sel = state.date === d && !past;
    days.push({
      key: "d" + d,
      label: String(d),
      onClick: past ? null : () => patch({ date: d }),
      style: {
        height: 42,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 14,
        borderRadius: 3,
        userSelect: "none",
        cursor: past ? "default" : "pointer",
        background: sel ? "#33232A" : past ? "transparent" : "#FFFFFF",
        border: "1px solid " + (sel ? "#33232A" : past ? "transparent" : "#E7D5DA"),
        color: sel ? "#FFFFFF" : past ? "#D8C3C9" : dow === 0 ? "#C0607F" : dow === 6 ? "#8A9BB0" : "#473A3F",
        transition: "background .2s ease, border-color .2s ease, color .2s ease",
      },
    });
  }

  const whenLabel = state.date
    ? `${state.y}년 ${state.m}월 ${state.date}일${state.time ? " " + state.time : ""}`
    : "날짜를 선택해 주세요";

  async function submit() {
    if (!ready) return;
    patch({ phase: "submitting", error: null });
    try {
      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: state.plan,
          year: state.y,
          month: state.m,
          day: state.date,
          time: state.time,
          name: state.name,
          phone: state.phone,
          venue: state.venue,
          guests: state.guests,
          extraButlers: state.extraButlers,
          payMethod: state.pay,
        }),
      });
      const created = (await res.json()) as CreateReservationResponse & { message?: string };
      if (!res.ok || !created.id) {
        throw new Error(created.message || "예약 생성에 실패했습니다.");
      }

      const payResult = await requestDepositPayment({
        paymentId: created.paymentId,
        orderName: created.orderName,
        amount: created.amount,
        payMethod: state.pay,
        customerName: state.name,
        customerPhone: state.phone,
      });
      if (!payResult.ok) {
        throw new Error(payResult.message || "결제가 취소되었습니다.");
      }

      const confirmRes = await fetch(`/api/reservations/${created.id}/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentId: created.paymentId }),
      });
      const confirmed = (await confirmRes.json()) as ConfirmReservationResponse;
      if (!confirmed.ok) {
        throw new Error(confirmed.message || "결제 확인에 실패했습니다.");
      }

      patch({ phase: "done", bookingNo: confirmed.bookingNo || created.bookingNo, error: null });
    } catch (err) {
      patch({
        phase: "form",
        error: err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.",
      });
    }
  }

  function reset() {
    patch((s) => ({ ...initialState(s.plan), guests: s.guests, extraButlers: s.extraButlers, pay: s.pay }));
  }

  const submitLabel =
    state.phase === "submitting"
      ? "결제 진행 중..."
      : ready
        ? `${won(price.deposit)} 선결제하기`
        : "날짜 · 시간 · 정보를 입력해 주세요";

  const submitStyle: CSSProperties = {
    width: "100%",
    padding: 18,
    borderRadius: 999,
    border: "none",
    fontSize: 16,
    fontWeight: 500,
    cursor: ready && state.phase !== "submitting" ? "pointer" : "default",
    transition: "all .25s ease",
    background: ready ? "#33232A" : "#DCC4CC",
    color: ready ? "#F3E9EB" : "#9A8189",
    opacity: state.phase === "submitting" ? 0.7 : 1,
  };

  return (
    <div
      data-testid="reservation-modal"
      onClick={handleClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        background: "rgba(18,18,18,0.66)",
        backdropFilter: "blur(4px)",
        overflowY: "auto",
        padding: "48px 20px",
        fontFamily: "var(--font-sans), sans-serif",
        color: "#33232A",
      }}
    >
      <div onClick={(e) => e.stopPropagation()} style={{ maxWidth: 1060, margin: "0 auto", position: "relative" }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 20, marginBottom: 22 }}>
          <div>
            <p style={{ fontFamily: fontDisplay, fontSize: 13, letterSpacing: "0.4em", color: "#E9CAD1", margin: "0 0 10px" }}>
              RESERVATION
            </p>
            <h2 style={{ fontFamily: fontSerif, fontSize: 30, fontWeight: 600, margin: "0 0 8px", color: "#FFFFFF", letterSpacing: "-0.02em" }}>
              온라인 예약 · 결제
            </h2>
            <p style={{ fontSize: 14, lineHeight: 1.8, color: "#D8C3C9", margin: 0 }}>
              날짜와 시간을 고르고 결제까지 3분이면 끝납니다.
            </p>
          </div>
          <button
            onClick={handleClose}
            className="modal-close-hover"
            style={{
              flex: "none",
              width: 44,
              height: 44,
              borderRadius: "50%",
              border: "1px solid rgba(255,255,255,0.4)",
              background: "transparent",
              color: "#FFFFFF",
              fontSize: 20,
              lineHeight: 1,
              cursor: "pointer",
            }}
          >
            ×
          </button>
        </div>

        <div style={{ background: "#F3E9EB", borderRadius: 6, overflow: "hidden", boxShadow: "0 30px 80px rgba(0,0,0,0.45)" }}>
          {state.phase !== "done" && (
            <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.35fr) minmax(0,1fr)" }}>
              <div style={{ padding: "44px 40px", borderRight: "1px solid #E7D5DA" }}>
                <div style={{ fontSize: 13, letterSpacing: "0.2em", color: "#A9647E", marginBottom: 16 }}>STEP 1 · 요금제</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
                  {PLAN_ORDER.map((k) => (
                    <div
                      key={k}
                      onClick={() => {
                        pick(k);
                        onPlanChange(k);
                      }}
                      style={chipStyle(state.plan === k)}
                    >
                      {PLANS[k].name}
                    </div>
                  ))}
                </div>

                <div style={{ height: 1, background: "#E7D5DA", margin: "32px 0" }} />

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                  <span style={{ fontSize: 13, letterSpacing: "0.2em", color: "#A9647E" }}>STEP 2 · 예식 날짜</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <button onClick={() => shiftMonth(-1)} className="round-nav-hover" style={navBtnStyle}>
                      ‹
                    </button>
                    <span style={{ fontFamily: fontSerif, fontSize: 17, minWidth: 118, textAlign: "center" }}>
                      {state.y}년 {state.m}월
                    </span>
                    <button onClick={() => shiftMonth(1)} className="round-nav-hover" style={navBtnStyle}>
                      ›
                    </button>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 6, marginBottom: 8 }}>
                  {["일", "월", "화", "수", "목", "금", "토"].map((d, i) => (
                    <div
                      key={d}
                      style={{
                        textAlign: "center",
                        fontSize: 12,
                        padding: "6px 0",
                        color: i === 0 ? "#C0607F" : i === 6 ? "#8A9BB0" : "#9A8189",
                      }}
                    >
                      {d}
                    </div>
                  ))}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 6 }}>
                  {days.map((day) => (
                    <div key={day.key} onClick={day.onClick ?? undefined} style={day.style}>
                      {day.label}
                    </div>
                  ))}
                </div>

                <div style={{ height: 1, background: "#E7D5DA", margin: "32px 0" }} />

                <div style={{ fontSize: 13, letterSpacing: "0.2em", color: "#A9647E", marginBottom: 16 }}>STEP 3 · 예식 시간</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(96px,1fr))", gap: 8 }}>
                  {TIME_SLOTS.map((t) => (
                    <div key={t} onClick={() => patch({ time: t })} style={chipStyle(state.time === t)}>
                      {t}
                    </div>
                  ))}
                </div>

                <div style={{ height: 1, background: "#E7D5DA", margin: "32px 0" }} />

                <div style={{ fontSize: 13, letterSpacing: "0.2em", color: "#A9647E", marginBottom: 16 }}>STEP 4 · 예식 정보</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <label style={fieldLabelStyle}>
                    신랑 · 신부 성함
                    <input
                      value={state.name}
                      onChange={(e) => patch({ name: e.target.value })}
                      placeholder="김민준 · 이서연"
                      className="field-focus"
                      style={fieldInputStyle}
                    />
                  </label>
                  <label style={fieldLabelStyle}>
                    연락처
                    <input
                      value={state.phone}
                      onChange={(e) => patch({ phone: e.target.value })}
                      placeholder="010-0000-0000"
                      className="field-focus"
                      style={fieldInputStyle}
                    />
                  </label>
                  <label style={{ ...fieldLabelStyle, gridColumn: "span 2" }}>
                    예식장 · 홀 이름
                    <input
                      value={state.venue}
                      onChange={(e) => patch({ venue: e.target.value })}
                      placeholder="서울 · 그랜드컨벤션 3층 그레이스홀"
                      className="field-focus"
                      style={fieldInputStyle}
                    />
                  </label>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 18 }}>
                  <div style={fieldLabelStyle}>
                    예상 하객 수
                    <div style={stepperWrapStyle}>
                      <button
                        onClick={() => patch((s) => ({ guests: Math.max(50, s.guests - 10) }))}
                        className="stepper-btn-hover"
                        style={stepperBtnStyle}
                      >
                        −
                      </button>
                      <div style={stepperValueStyle}>{state.guests.toLocaleString("ko-KR")}명</div>
                      <button
                        onClick={() => patch((s) => ({ guests: s.guests + 10 }))}
                        className="stepper-btn-hover"
                        style={stepperBtnStyle}
                      >
                        ＋
                      </button>
                    </div>
                  </div>
                  <div style={fieldLabelStyle}>
                    버틀러 추가 <span style={{ color: "#9A8189" }}>(1명 10만원)</span>
                    <div style={stepperWrapStyle}>
                      <button
                        onClick={() => patch((s) => ({ extraButlers: Math.max(0, s.extraButlers - 1) }))}
                        className="stepper-btn-hover"
                        style={stepperBtnStyle}
                      >
                        −
                      </button>
                      <div style={stepperValueStyle}>{state.extraButlers}명</div>
                      <button
                        onClick={() => patch((s) => ({ extraButlers: Math.min(6, s.extraButlers + 1) }))}
                        className="stepper-btn-hover"
                        style={stepperBtnStyle}
                      >
                        ＋
                      </button>
                    </div>
                  </div>
                </div>

                <div style={{ height: 1, background: "#E7D5DA", margin: "32px 0" }} />

                <div style={{ fontSize: 13, letterSpacing: "0.2em", color: "#A9647E", marginBottom: 16 }}>STEP 5 · 결제 수단</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
                  {PAY_METHODS.map((p) => (
                    <div key={p} onClick={() => patch({ pay: p })} style={chipStyle(state.pay === p)}>
                      {p}
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ padding: "44px 36px", background: "#E9CAD1", display: "flex", flexDirection: "column" }}>
                <div style={{ fontSize: 13, letterSpacing: "0.2em", color: "#A9647E", marginBottom: 22 }}>예약 내역</div>
                <div style={{ fontFamily: fontSerif, fontSize: 22, fontWeight: 600, marginBottom: 6 }}>{P.name}</div>
                <div style={{ fontSize: 13, color: "#6B5A60", lineHeight: 1.8, marginBottom: 26 }}>{P.desc}</div>

                <div style={{ display: "flex", flexDirection: "column", gap: 14, padding: "22px 0", borderTop: "1px solid #DCC4CC", borderBottom: "1px solid #DCC4CC" }}>
                  <SummaryRow label="예식 일시" value={whenLabel} />
                  <SummaryRow label="예식장" value={state.venue.trim() || "미입력"} />
                  <SummaryRow label="배정 버틀러" value={`${P.butlers + state.extraButlers}명`} />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: "22px 0", borderBottom: "1px solid #DCC4CC" }}>
                  <SummaryRow label="기본 요금" value={won(price.base)} />
                  <SummaryRow
                    label={`추가 하객 ${Math.max(0, state.guests - price.incl)}명`}
                    value={price.over ? "+ " + won(price.over) : "-"}
                  />
                  <SummaryRow label="버틀러 추가" value={price.extraButlerAmount ? "+ " + won(price.extraButlerAmount) : "-"} />
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "24px 0 6px" }}>
                  <span style={{ fontSize: 15, color: "#473A3F" }}>총 결제 금액</span>
                  <span style={{ fontFamily: fontSerif, fontSize: 30, fontWeight: 600, color: "#33232A" }}>{won(price.total)}</span>
                </div>
                <div style={{ textAlign: "right", fontSize: 12, color: "#9A8189", marginBottom: 22 }}>
                  부가세 포함 · 오늘 50% 선결제 {won(price.deposit)} / 예식 후 잔금 {won(price.balance)}
                </div>

                <button onClick={submit} disabled={!ready || state.phase === "submitting"} style={submitStyle}>
                  {submitLabel}
                </button>
                {state.error && (
                  <p style={{ fontSize: 13, lineHeight: 1.7, color: "#B0304A", margin: "12px 0 0" }}>{state.error}</p>
                )}
                <p style={{ fontSize: 12, lineHeight: 1.8, color: "#9A8189", margin: "16px 0 0" }}>
                  오늘은 전체 금액의 50%만 결제되며, 잔금은 예식 종료 후 정산 내역 확인 뒤 결제하시면 됩니다. 예식 7일 전까지 전액 환불, 3일 전까지 50% 환불됩니다.
                </p>
              </div>
            </div>
          )}

          {state.phase === "done" && (
            <div style={{ padding: "80px 40px", textAlign: "center" }}>
              <div
                style={{
                  width: 58,
                  height: 58,
                  borderRadius: "50%",
                  background: "#A9647E",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 26px",
                  fontSize: 26,
                }}
              >
                ✓
              </div>
              <h3 style={{ fontFamily: fontSerif, fontSize: 28, fontWeight: 600, margin: "0 0 14px" }}>예약이 확정되었습니다</h3>
              <p style={{ fontSize: 15, lineHeight: 1.9, color: "#6B5A60", margin: "0 0 32px" }}>
                담당 매니저가 24시간 내로 연락드립니다.
                <br />두 분의 가장 빛나는 날, 저희가 함께하겠습니다.
              </p>
              <div
                style={{
                  display: "inline-flex",
                  flexDirection: "column",
                  gap: 12,
                  background: "#E9CAD1",
                  padding: "28px 40px",
                  borderRadius: 4,
                  textAlign: "left",
                  minWidth: 320,
                }}
              >
                <SummaryRow label="예약번호" value={state.bookingNo} wide />
                <SummaryRow label="요금제" value={P.name} wide />
                <SummaryRow label="예식 일시" value={whenLabel} wide />
                <SummaryRow label="선결제 금액" value={won(price.deposit)} wide />
              </div>
              <div style={{ marginTop: 30, display: "flex", gap: 10, justifyContent: "center" }}>
                <button onClick={reset} className="round-nav-hover" style={outlineBtnStyle}>
                  다시 예약하기
                </button>
                <button onClick={handleClose} className="btn-dark-hover" style={darkBtnStyle}>
                  닫기
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SummaryRow({ label, value, wide }: { label: string; value: string; wide?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: wide ? 40 : undefined, fontSize: 14 }}>
      <span style={{ color: "#6B5A60" }}>{label}</span>
      <span style={{ color: "#33232A", textAlign: "right" }}>{value}</span>
    </div>
  );
}

const navBtnStyle: CSSProperties = {
  width: 30,
  height: 30,
  border: "1px solid #E2CDD4",
  background: "#fff",
  borderRadius: "50%",
  cursor: "pointer",
  color: "#6B5A60",
  fontSize: 14,
  lineHeight: 1,
};

const fieldLabelStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 7,
  fontSize: 13,
  color: "#6B5A60",
};

const fieldInputStyle: CSSProperties = {
  border: "1px solid #E2CDD4",
  background: "#fff",
  borderRadius: 3,
  padding: "12px 13px",
  fontSize: 14,
  color: "#33232A",
  outline: "none",
};

const stepperWrapStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  border: "1px solid #E2CDD4",
  background: "#fff",
  borderRadius: 3,
};

const stepperBtnStyle: CSSProperties = {
  width: 42,
  height: 44,
  border: "none",
  background: "transparent",
  cursor: "pointer",
  color: "#6B5A60",
  fontSize: 16,
};

const stepperValueStyle: CSSProperties = {
  flex: 1,
  textAlign: "center",
  fontSize: 15,
  color: "#33232A",
};

const outlineBtnStyle: CSSProperties = {
  border: "1px solid #E2CDD4",
  background: "transparent",
  color: "#6B5A60",
  padding: "13px 28px",
  borderRadius: 999,
  fontSize: 14,
  cursor: "pointer",
};

const darkBtnStyle: CSSProperties = {
  border: "none",
  background: "#33232A",
  color: "#F3E9EB",
  padding: "13px 28px",
  borderRadius: 999,
  fontSize: 14,
  cursor: "pointer",
};
