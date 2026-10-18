"use client";

import { useEffect, useState } from "react";
import { formatPhoneInput } from "@/lib/phone";
import type { LookupReservation } from "@/lib/lookup-api";

const ERRORS: Record<string, string> = {
  invalid_phone: "휴대폰 번호를 다시 확인해 주세요.",
  no_reservation: "이 번호로 된 예약이 없어요. 예약하실 때 입력한 번호인지 확인해 주세요.",
  too_many_requests: "인증번호 요청이 너무 많아요. 1시간 뒤에 다시 시도해 주세요.",
  sms_failed: "문자를 보내지 못했어요. 잠시 후 다시 시도하시거나 고객센터로 문의해 주세요.",
  expired: "인증번호가 만료됐어요. 인증번호를 다시 받아 주세요.",
  locked: "인증번호를 5번 틀렸어요. 인증번호를 다시 받아 주세요.",
  unauthenticated: "본인 확인 시간이 지났어요. 다시 인증해 주세요.",
  already_cancelled: "이미 취소된 예약이에요.",
  in_progress: "이 예약의 취소가 이미 진행 중이에요. 잠시 후 새로고침해 주세요.",
  not_cancellable: "이 예약은 홈페이지에서 취소할 수 없어요. 고객센터로 문의해 주세요.",
  payment_failed: "결제취소가 처리되지 않았어요. 잠시 후 다시 시도하시거나 고객센터로 문의해 주세요.",
  not_found: "예약을 찾을 수 없어요.",
};

const STATUS: Record<string, { label: string; color: string; bg: string }> = {
  신규요청: { label: "예약 접수", color: "#8A5A1F", bg: "#FFF3E0" },
  협의중: { label: "상담 중", color: "#5A5A8A", bg: "#EEEEFA" },
  확정: { label: "예약 확정", color: "#2F6B4A", bg: "#E6F4EC" },
  취소: { label: "취소 완료", color: "#8A8086", bg: "#F1EEF0" },
};

const REASONS = ["일정 변경", "예식 취소", "다른 업체 이용", "기타"] as const;

const won = (n: number) => `${n.toLocaleString("ko-KR")}원`;

const card: React.CSSProperties = { background: "#FFFFFF", borderRadius: 20, padding: "clamp(20px,4vw,28px)", boxShadow: "0 1px 0 #E7D5DA" };
const input: React.CSSProperties = { width: "100%", boxSizing: "border-box", height: 52, border: "1px solid #E7D5DA", borderRadius: 14, padding: "0 16px", fontSize: 16, background: "#FFFFFF", color: "#33232A" };
const darkBtn: React.CSSProperties = { height: 52, padding: "0 22px", border: "none", borderRadius: 999, background: "#33232A", color: "#F3E9EB", fontSize: 15, fontWeight: 500, cursor: "pointer" };
const lightBtn: React.CSSProperties = { ...darkBtn, background: "#F3E9EB", color: "#473A3F" };

async function post(path: string, body?: object) {
  const res = await fetch(`/api/lookup/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body ?? {}),
  });
  const data = (await res.json().catch(() => ({}))) as { error?: string; remaining?: number; refundAmount?: number };
  return { ok: res.ok, data };
}

function errorText(code: string | undefined) {
  return ERRORS[code ?? ""] ?? "잠시 후 다시 시도해 주세요.";
}

export function LookupView() {
  const [step, setStep] = useState<"loading" | "phone" | "list">("loading");
  const [phone, setPhone] = useState("");
  const [sent, setSent] = useState(false);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [list, setList] = useState<LookupReservation[]>([]);
  const [phoneMasked, setPhoneMasked] = useState("");
  const [cancelTarget, setCancelTarget] = useState<LookupReservation | null>(null);

  async function loadList(): Promise<boolean> {
    const res = await fetch("/api/lookup/reservations", { cache: "no-store" });
    if (!res.ok) return false;
    const data = (await res.json()) as { reservations?: LookupReservation[]; phoneMasked?: string };
    setList(data.reservations ?? []);
    setPhoneMasked(data.phoneMasked ?? "");
    setStep("list");
    return true;
  }

  useEffect(() => {
    loadList().then((ok) => { if (!ok) setStep("phone"); }).catch(() => setStep("phone"));
  }, []);

  async function sendCode(e?: React.FormEvent) {
    e?.preventDefault();
    if (phone.replace(/[^0-9]/g, "").length < 10) { setMessage(ERRORS.invalid_phone); return; }
    setBusy(true);
    setMessage("");
    const { ok, data } = await post("otp", { phone });
    setBusy(false);
    if (!ok) { setMessage(errorText(data.error)); return; }
    setSent(true);
    setCode("");
    setMessage("인증번호를 문자로 보냈어요. 5분 안에 입력해 주세요.");
  }

  async function verify(e: React.FormEvent) {
    e.preventDefault();
    if (code.length !== 6) { setMessage("인증번호 6자리를 입력해 주세요."); return; }
    setBusy(true);
    const { ok, data } = await post("verify", { phone, code });
    if (ok && (await loadList())) { setBusy(false); setMessage(""); return; }
    setBusy(false);
    if (data.error === "mismatch") {
      setMessage(typeof data.remaining === "number" && data.remaining > 0
        ? `인증번호가 맞지 않아요. ${data.remaining}번 더 시도할 수 있어요.`
        : "인증번호가 맞지 않아요.");
      return;
    }
    setMessage(errorText(data.error));
  }

  async function logout() {
    await post("logout");
    setList([]);
    setSent(false);
    setCode("");
    setPhone("");
    setMessage("");
    setStep("phone");
  }

  async function onCancelled(text: string) {
    setCancelTarget(null);
    setMessage(text);
    if (!(await loadList())) setStep("phone");
  }

  return (
    <section style={{ maxWidth: 640, margin: "0 auto", padding: "0 clamp(16px,5vw,24px) clamp(64px,10vw,110px)" }}>
      {step === "loading" && <div style={{ ...card, textAlign: "center", color: "#9A8189" }}>불러오는 중…</div>}

      {step === "phone" && (
        <div style={card}>
          <form onSubmit={sendCode} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <label htmlFor="lookup-phone" style={{ fontSize: 14, fontWeight: 600, color: "#473A3F" }}>예약자 휴대폰 번호</label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <input
                id="lookup-phone"
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                placeholder="010-0000-0000"
                value={phone}
                onChange={(e) => setPhone(formatPhoneInput(e.target.value))}
                style={{ ...input, flex: "1 1 220px" }}
              />
              <button type="submit" disabled={busy} style={{ ...(sent ? lightBtn : darkBtn), flex: "0 0 auto", opacity: busy ? 0.6 : 1 }}>
                {busy && !sent ? "보내는 중…" : sent ? "다시 받기" : "인증번호 받기"}
              </button>
            </div>
          </form>
          {sent && (
            <form onSubmit={verify} style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
              <input
                id="lookup-otp"
                aria-label="인증번호 6자리"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                placeholder="인증번호 6자리"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ""))}
                style={{ ...input, flex: "1 1 220px", letterSpacing: "0.2em" }}
              />
              <button type="submit" disabled={busy} style={{ ...darkBtn, flex: "0 0 auto", opacity: busy ? 0.6 : 1 }}>확인</button>
            </form>
          )}
          {message && <p role="status" style={{ margin: "14px 0 0", fontSize: 14, lineHeight: 1.7, color: "#A9647E" }}>{message}</p>}
        </div>
      )}

      {step === "list" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, fontSize: 14, color: "#6B5A60" }}>
            <span>{phoneMasked} 번호의 예약 {list.length}건</span>
            <button onClick={logout} style={{ background: "none", border: "none", color: "#9A8189", fontSize: 14, textDecoration: "underline", cursor: "pointer" }}>다른 번호로 조회</button>
          </div>
          {message && <p role="status" style={{ margin: 0, padding: "14px 16px", borderRadius: 14, background: "#FFFFFF", fontSize: 14, lineHeight: 1.7, color: "#A9647E" }}>{message}</p>}
          {list.length === 0 && <div style={{ ...card, textAlign: "center", color: "#9A8189" }}>이 번호로 된 예약이 없어요.</div>}
          {list.map((r) => <ReservationCard key={r.id} r={r} onCancel={() => { setMessage(""); setCancelTarget(r); }} />)}
          <p style={{ margin: "6px 0 0", fontSize: 13, lineHeight: 1.8, color: "#9A8189" }}>
            예약 변경이나 궁금한 점은 카카오톡 채널 @웨딩버틀러 또는 <a href="tel:01059189203" style={{ color: "#9A8189" }}>010-5918-9203</a>으로 문의해 주세요.
          </p>
        </div>
      )}

      {cancelTarget && <CancelDialog r={cancelTarget} onClose={() => setCancelTarget(null)} onDone={onCancelled} />}
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", gap: 12, fontSize: 14.5, lineHeight: 1.7 }}>
      <span style={{ flex: "0 0 72px", color: "#9A8189" }}>{label}</span>
      <span style={{ color: "#33232A", wordBreak: "keep-all" }}>{value}</span>
    </div>
  );
}

function ReservationCard({ r, onCancel }: { r: LookupReservation; onCancel: () => void }) {
  const badge = STATUS[r.status] ?? STATUS["신규요청"];
  return (
    <article style={card}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 14 }}>
        <span style={{ fontSize: 13, color: "#9A8189" }}>예약번호 {r.id}</span>
        <span style={{ fontSize: 13, fontWeight: 600, color: badge.color, background: badge.bg, borderRadius: 999, padding: "4px 12px" }}>{badge.label}</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <Row label="예약자" value={r.customer} />
        <Row label="플랜" value={r.plan} />
        <Row label="예식 일시" value={r.dateLabel} />
        <Row label="예식장" value={r.venue} />
        <Row label="결제금액" value={won(r.paidAmount)} />
        {r.cancel && <Row label="환불금액" value={r.cancel.refundAmount ? won(r.cancel.refundAmount) : "없음"} />}
      </div>
      {r.refund && (
        r.refund.cancellable ? (
          <button onClick={onCancel} style={{ ...lightBtn, width: "100%", marginTop: 18, height: 48, color: "#A9475E" }}>예약 취소</button>
        ) : (
          <p style={{ margin: "16px 0 0", fontSize: 13, lineHeight: 1.7, color: "#9A8189" }}>
            이 예약은 홈페이지에서 취소할 수 없어요. 카카오톡 채널 @웨딩버틀러로 문의해 주세요.
          </p>
        )
      )}
    </article>
  );
}

function CancelDialog({ r, onClose, onDone }: { r: LookupReservation; onClose: () => void; onDone: (message: string) => void }) {
  const [reason, setReason] = useState<(typeof REASONS)[number]>("일정 변경");
  const [other, setOther] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const refund = r.refund!;
  const reasonText = reason === "기타" ? other.trim() : reason;

  async function submit() {
    if (!reasonText) { setError("취소 사유를 입력해 주세요."); return; }
    setBusy(true);
    setError("");
    const { ok, data } = await post("cancel", { id: r.id, reason: reasonText });
    setBusy(false);
    if (!ok) { setError(errorText(data.error)); return; }
    const amount = data.refundAmount ?? 0;
    onDone(amount > 0
      ? `예약이 취소됐어요. ${won(amount)}은 결제하신 수단으로 환불되며, 카드사에 따라 영업일 기준 3~7일이 걸릴 수 있어요.`
      : "예약이 취소됐어요.");
  }

  return (
    <div onClick={() => !busy && onClose()} style={{ position: "fixed", inset: 0, zIndex: 80, background: "rgba(51,35,42,0.4)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div role="dialog" aria-modal="true" aria-labelledby="cancel-title" onClick={(e) => e.stopPropagation()} style={{ ...card, width: "100%", maxWidth: 440, boxSizing: "border-box", maxHeight: "90vh", overflowY: "auto" }}>
        <h2 id="cancel-title" style={{ margin: "0 0 8px", fontSize: 19, fontWeight: 700, color: "#33232A" }}>예약을 취소할까요?</h2>
        <p style={{ margin: "0 0 18px", fontSize: 14, lineHeight: 1.7, color: "#6B5A60" }}>{r.dateLabel} · {r.venue}</p>

        <div style={{ borderRadius: 14, background: "#FAF3F5", padding: "14px 16px", marginBottom: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14.5, marginBottom: 6 }}>
            <span style={{ color: "#6B5A60" }}>결제금액</span><span>{won(r.paidAmount)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 16, fontWeight: 700 }}>
            <span>환불 예정 금액</span><span style={{ color: "#A9647E" }}>{won(refund.amount)}</span>
          </div>
          <p style={{ margin: "8px 0 0", fontSize: 12.5, lineHeight: 1.7, color: "#9A8189" }}>
            {refund.label} (이용약관 제14조). 천재지변·직계가족 사망 등 전액 환불 사유가 있으시면 취소 전에 카카오톡 채널로 문의해 주세요.
          </p>
        </div>

        <div style={{ fontSize: 14, fontWeight: 600, color: "#473A3F", marginBottom: 10 }}>취소 사유</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 14.5 }}>
          {REASONS.map((label) => (
            <label key={label} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
              <input type="radio" name="lookup-cancel-reason" checked={reason === label} onChange={() => setReason(label)} />
              {label === "기타" ? "기타 (직접 입력)" : label}
            </label>
          ))}
          {reason === "기타" && (
            <textarea
              rows={3}
              maxLength={200}
              value={other}
              onChange={(e) => setOther(e.target.value)}
              placeholder="취소 사유를 적어 주세요"
              style={{ ...input, height: "auto", padding: "12px 16px", lineHeight: 1.6, resize: "vertical" }}
            />
          )}
        </div>

        {error && <p role="alert" style={{ margin: "14px 0 0", fontSize: 14, lineHeight: 1.7, color: "#B0304A" }}>{error}</p>}
        <p style={{ margin: "16px 0 0", fontSize: 13, color: "#9A8189" }}>취소하면 되돌릴 수 없어요.</p>

        <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
          <button disabled={busy} onClick={onClose} style={{ ...lightBtn, flex: 1, height: 48 }}>닫기</button>
          <button disabled={busy || !reasonText} onClick={submit} style={{ ...darkBtn, flex: 1.4, height: 48, background: "#A9475E", color: "#fff", opacity: busy || !reasonText ? 0.6 : 1 }}>
            {busy ? "취소하는 중…" : refund.amount > 0 ? `${won(refund.amount)} 환불받고 취소` : "예약 취소"}
          </button>
        </div>
      </div>
    </div>
  );
}
