"use client";

import { useEffect, useState, type CSSProperties } from "react";
import Link from "next/link";
import { SIDE_LABEL, TIME_SLOTS, won, type Side } from "@/lib/plans";
import { firstBookableDate, isBookableDow, maxBookingDate, minBookingDate } from "@/lib/booking-calendar";
import { fontDisplay, fontSerif } from "@/lib/style";
import { formatPhoneInput } from "@/lib/phone";
import { requestDepositPayment } from "@/lib/portone-client";
import type { AvailabilityResponse, ConfirmReservationResponse, CreateReservationResponse } from "@/lib/reservation-types";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SIDES: Side[] = ["groom", "bride", "both"];

const eyebrow: CSSProperties = { fontSize: 13, letterSpacing: "0.2em", color: "#A9647E", margin: "0 0 16px" };
const divider: CSSProperties = { height: 1, background: "#E7D5DA", margin: "32px 0" };
const labelStyle: CSSProperties = { display: "flex", flexDirection: "column", gap: 8, fontSize: 13, color: "#473A3F" };
const inputStyle: CSSProperties = { border: "1px solid #DCC4CC", background: "#FFFFFF", borderRadius: 4, padding: "13px 14px", fontSize: 15, color: "#33232A", width: "100%", boxSizing: "border-box", fontFamily: "inherit" };
const chip = (on: boolean, disabled = false): CSSProperties => ({
  textAlign: "center", padding: "12px 6px", borderRadius: 4, fontSize: 14, cursor: disabled ? "not-allowed" : "pointer", userSelect: "none",
  background: on ? "#33232A" : disabled ? "#EADFE2" : "#FFFFFF", color: on ? "#F3E9EB" : disabled ? "#B7A5AB" : "#473A3F",
  border: "1px solid " + (on ? "#33232A" : "#DCC4CC"), textDecoration: disabled ? "line-through" : "none",
});
const navBtn: CSSProperties = { width: 36, height: 36, borderRadius: "50%", border: "1px solid #DCC4CC", background: "#fff", color: "#33232A", fontSize: 18, lineHeight: 1 };

export default function SpecialBooking({ token, amount, label }: { token: string; amount: number; label: string }) {
  const start = firstBookableDate();
  const min = minBookingDate();
  const max = maxBookingDate();

  const [ym, setYm] = useState({ y: start.getFullYear(), m: start.getMonth() + 1 });
  const [day, setDay] = useState<number | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [blocked, setBlocked] = useState<{ key: string; slots: string[] }>({ key: "", slots: [] });
  const [side, setSide] = useState<Side | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [venue, setVenue] = useState("");
  const [guests, setGuests] = useState("");
  const [memo, setMemo] = useState("");
  const [agree, setAgree] = useState({ terms: false, refund: false, privacy: false });
  const [phase, setPhase] = useState<"form" | "submitting" | "done">("form");
  const [error, setError] = useState("");
  const [bookingNo, setBookingNo] = useState("");

  const dateKey = day ? `${ym.y}-${String(ym.m).padStart(2, "0")}-${String(day).padStart(2, "0")}` : "";

  useEffect(() => {
    if (!dateKey) return;
    let cancelled = false;
    fetch(`/api/availability?date=${dateKey}`, { cache: "no-store" })
      .then((r) => (r.ok ? (r.json() as Promise<AvailabilityResponse>) : { blocked: [] }))
      .catch((): AvailabilityResponse => ({ blocked: [] }))
      .then((res) => {
        if (cancelled) return;
        setBlocked({ key: dateKey, slots: res.blocked });
        setTime((t) => (t && res.blocked.includes(t) ? null : t)); // 이미 막힌 시간이면 다시 고르게 한다
      });
    return () => { cancelled = true; };
  }, [dateKey]);

  const blockedSlots = blocked.key === dateKey ? blocked.slots : [];
  const canPrev = ym.y * 12 + ym.m > min.getFullYear() * 12 + min.getMonth() + 1;
  const canNext = ym.y * 12 + ym.m < max.getFullYear() * 12 + max.getMonth() + 1;
  function shiftMonth(d: number) {
    setDay(null);
    setTime(null);
    setYm(({ y, m }) => {
      m += d;
      if (m > 12) { m = 1; y++; }
      if (m < 1) { m = 12; y--; }
      return { y, m };
    });
  }

  const first = new Date(ym.y, ym.m - 1, 1).getDay();
  const count = new Date(ym.y, ym.m, 0).getDate();
  const cells: (number | null)[] = [...Array(first).fill(null), ...Array.from({ length: count }, (_, i) => i + 1)];
  const bookable = (d: number) => {
    const x = new Date(ym.y, ym.m - 1, d);
    return x >= min && x <= max && isBookableDow(x);
  };

  const guestCount = Number(guests.replace(/[^0-9]/g, "")) || 0;
  const missing = [
    !day && "예식 날짜", !time && "예식 시간", !side && "신랑측 · 신부측 · 양가", !name.trim() && "성함", !phone.trim() && "연락처",
    !EMAIL_RE.test(email.trim()) && "이메일", !venue.trim() && "예식장 · 홀 이름", guestCount < 1 && "예상 하객 수",
  ].filter(Boolean) as string[];
  const agreed = agree.terms && agree.refund && agree.privacy;
  const ready = missing.length === 0 && agreed;

  async function submit() {
    if (phase === "submitting") return;
    if (missing.length) { setError(`아래 항목을 입력해 주세요: ${missing.join(", ")}`); return; }
    if (!agreed) { setError("필수 항목에 모두 동의해 주세요."); return; }
    setPhase("submitting");
    setError("");
    let created: (CreateReservationResponse & { message?: string }) | null = null;
    try {
      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: "special", specialToken: token, year: ym.y, month: ym.m, day, time, name, side, phone, email, venue, memo,
          guests: guestCount, extraButlers: 0, payMethod: "신용카드", paymentType: "full",
        }),
      });
      created = (await res.json()) as CreateReservationResponse & { message?: string };
      if (!res.ok || !created.id) throw new Error(created.message || "예약을 만들지 못했습니다.");

      const returnUrl = new URL("/reservation/return", window.location.origin);
      returnUrl.searchParams.set("rid", created.id);
      returnUrl.searchParams.set("paymentId", created.paymentId);
      const pay = await requestDepositPayment({
        paymentId: created.paymentId, orderName: created.orderName, amount: created.amount, payMethod: "신용카드",
        customerName: name, customerPhone: phone, customerEmail: email, redirectUrl: returnUrl.toString(),
      });
      if (!pay.ok) throw new Error(pay.message || "결제가 취소되었습니다.");

      const confirmRes = await fetch(`/api/reservations/${created.id}/confirm`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ paymentId: created.paymentId }),
      });
      const confirmed = (await confirmRes.json()) as ConfirmReservationResponse;
      if (!confirmed.ok) throw new Error(confirmed.message || "결제 확인에 실패했습니다.");
      setBookingNo(confirmed.bookingNo || created.bookingNo);
      setPhase("done");
    } catch (err) {
      // 결제를 시작했다면 링크 점유를 풀어 바로 다시 시도할 수 있게 한다
      if (created?.id) {
        void fetch("/api/special/release", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ rid: created.id, paymentId: created.paymentId }) }).catch(() => {});
      }
      setError(err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.");
      setPhase("form");
    }
  }

  if (phase === "done") {
    return (
      <div style={{ minHeight: "55vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "clamp(60px,12vw,120px) 20px", textAlign: "center" }}>
        <div style={{ maxWidth: 440 }}>
          <h1 style={{ fontFamily: fontSerif, fontSize: 26, fontWeight: 600, margin: "0 0 14px" }}>예약이 접수되었습니다</h1>
          <p style={{ fontSize: 15, lineHeight: 1.9, color: "#6B5A60", margin: "0 0 26px" }}>
            결제가 완료되었습니다. 예약확인서를 알림톡과 이메일로 보내드립니다.<br />예식 7일 전 담당 매니저가 연락드립니다.
          </p>
          {bookingNo && <div style={{ display: "inline-block", background: "#E9CAD1", padding: "16px 28px", borderRadius: 4, fontSize: 14, marginBottom: 30 }}><span style={{ color: "#6B5A60" }}>예약번호</span> {bookingNo}</div>}
          <div><Link href="/" style={{ display: "inline-block", background: "#33232A", color: "#F3E9EB", padding: "14px 30px", borderRadius: 999, fontSize: 14 }}>홈으로 돌아가기</Link></div>
        </div>
      </div>
    );
  }

  return (
    <main style={{ maxWidth: 760, margin: "0 auto", padding: "clamp(40px,7vw,72px) clamp(16px,5vw,32px) clamp(60px,9vw,96px)" }}>
      <p style={{ fontFamily: fontDisplay, fontSize: 13, letterSpacing: "0.4em", color: "#A9647E", margin: "0 0 12px" }}>WEDDING BUTLER</p>
      <h1 style={{ fontFamily: fontSerif, fontSize: "clamp(24px,5vw,32px)", fontWeight: 600, lineHeight: 1.4, margin: "0 0 12px" }}>스페셜 예약</h1>
      <p style={{ fontSize: 14.5, lineHeight: 1.9, color: "#6B5A60", margin: 0 }}>
        {label ? `${label} · ` : ""}담당자가 안내한 맞춤 금액으로 예약합니다. 예식 날짜와 시간, 예식장을 선택하고 결제하면 예약이 접수됩니다.
      </p>

      <div style={divider} />
      <div style={{ ...eyebrow, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <span>STEP 1 · 예식 날짜</span>
        <span style={{ display: "flex", alignItems: "center", gap: 10, letterSpacing: 0 }}>
          <button type="button" onClick={() => canPrev && shiftMonth(-1)} disabled={!canPrev} style={{ ...navBtn, opacity: canPrev ? 1 : 0.35 }} aria-label="이전 달">‹</button>
          <span style={{ fontFamily: fontSerif, fontSize: 17, color: "#33232A", minWidth: 104, textAlign: "center" }}>{ym.y}년 {ym.m}월</span>
          <button type="button" onClick={() => canNext && shiftMonth(1)} disabled={!canNext} style={{ ...navBtn, opacity: canNext ? 1 : 0.35 }} aria-label="다음 달">›</button>
        </span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 6, marginBottom: 6 }}>
        {["일", "월", "화", "수", "목", "금", "토"].map((d, i) => <div key={d} style={{ textAlign: "center", fontSize: 12, padding: "6px 0", color: i === 0 ? "#C0607F" : i === 6 ? "#8A9BB0" : "#9A8189" }}>{d}</div>)}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 6 }}>
        {cells.map((d, i) => d === null ? <div key={`b${i}`} /> : (
          <div key={d} onClick={bookable(d) ? () => { setDay(d); setTime(null); } : undefined} style={{ ...chip(day === d, !bookable(d)), padding: "11px 0", textDecoration: "none" }}>{d}</div>
        ))}
      </div>
      <p style={{ fontSize: 12, color: "#9A8189", margin: "10px 0 0" }}>주말·공휴일, 오늘로부터 3일 이후 날짜만 선택할 수 있습니다.</p>

      <div style={divider} />
      <div style={eyebrow}>STEP 2 · 예식 시간</div>
      {!day && <p style={{ fontSize: 13.5, color: "#9A8189", margin: 0 }}>먼저 예식 날짜를 선택해 주세요.</p>}
      {day && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(92px,1fr))", gap: 8 }}>
          {TIME_SLOTS.map((t) => blockedSlots.includes(t)
            ? <div key={t} aria-disabled="true" title="예약이 마감된 시간입니다" style={chip(false, true)}>{t}</div>
            : <div key={t} onClick={() => setTime(t)} style={chip(time === t)}>{t}</div>)}
        </div>
      )}

      <div style={divider} />
      <div style={eyebrow}>STEP 3 · 예식 정보</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 16 }}>
        <div style={{ ...labelStyle, gridColumn: "1 / -1" }}>
          축의대 구분
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
            {SIDES.map((s) => <div key={s} onClick={() => setSide(s)} style={chip(side === s)}>{SIDE_LABEL[s]}</div>)}
          </div>
        </div>
        <label style={labelStyle}>예약자 성함<input style={inputStyle} value={name} onChange={(e) => setName(e.target.value)} placeholder="이서연" /></label>
        <label style={labelStyle}>연락처<input style={inputStyle} value={phone} onChange={(e) => setPhone(formatPhoneInput(e.target.value))} inputMode="numeric" autoComplete="tel" placeholder="010-0000-0000" /></label>
        <label style={{ ...labelStyle, gridColumn: "1 / -1" }}>이메일 <span style={{ fontSize: 12, color: "#9A8189" }}>결제 영수증이 발송됩니다.</span>
          <input type="email" style={inputStyle} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" /></label>
        <label style={{ ...labelStyle, gridColumn: "1 / -1" }}>예식장 · 홀 이름<input style={inputStyle} value={venue} onChange={(e) => setVenue(e.target.value)} placeholder="서울 · 그랜드컨벤션 3층 그레이스홀" /></label>
        <label style={{ ...labelStyle, gridColumn: "1 / -1" }}>예상 하객 수 <input style={inputStyle} value={guests} onChange={(e) => setGuests(e.target.value.replace(/[^0-9]/g, ""))} inputMode="numeric" placeholder="예: 200" /></label>
        <label style={{ ...labelStyle, gridColumn: "1 / -1" }}>요청 사항 <span style={{ fontSize: 12, color: "#9A8189" }}>(선택)</span>
          <textarea style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }} rows={3} maxLength={500} value={memo} onChange={(e) => setMemo(e.target.value)} placeholder="전달하실 내용이 있으면 남겨 주세요." /></label>
      </div>

      <div style={divider} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
        <span style={{ fontSize: 15, color: "#473A3F" }}>결제 금액 (신용카드 · 전액)</span>
        <span style={{ fontFamily: fontSerif, fontSize: 30, fontWeight: 600 }}>{won(amount)}</span>
      </div>
      <p style={{ textAlign: "right", fontSize: 12, lineHeight: 1.7, color: "#9A8189", margin: "6px 0 20px" }}>부가세 포함 · 기준 인원을 초과한 식권이 생기면 그 금액만 당일 현장에서 현금으로 정산합니다.</p>

      <div style={{ display: "flex", flexDirection: "column", gap: 9, marginBottom: 18 }}>
        {([
          ["terms", <>[필수] 이용약관에 동의합니다. <Link href="/terms" target="_blank" style={{ color: "#8E4E67", textDecoration: "underline" }}>전문 보기</Link></>],
          ["refund", <>[필수] 취소·환불 기준을 확인했습니다.<br /><span style={{ color: "#6B5A60" }}>7일 전까지 전액 · 6~3일 전 50% · 2일 전~당일 30% 환불 (결제한 금액 기준)</span></>],
          ["privacy", <>[필수] 개인정보 수집·이용에 동의합니다. <Link href="/privacy" target="_blank" style={{ color: "#8E4E67", textDecoration: "underline" }}>전문 보기</Link></>],
        ] as const).map(([k, text]) => (
          <label key={k} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 12.5, lineHeight: 1.7, color: "#473A3F", cursor: "pointer" }}>
            <input type="checkbox" checked={agree[k]} onChange={() => setAgree((a) => ({ ...a, [k]: !a[k] }))} style={{ width: 14, height: 14, margin: "4px 0 0", flex: "none", accentColor: "#A9647E" }} />
            <span>{text}</span>
          </label>
        ))}
      </div>

      {error && <div role="alert" style={{ background: "#F7E4E4", color: "#8E3A3A", padding: "12px 14px", borderRadius: 4, fontSize: 13.5, lineHeight: 1.7, marginBottom: 14 }}>{error}</div>}
      <button type="button" onClick={submit} disabled={phase === "submitting"} style={{ width: "100%", padding: 18, borderRadius: 999, border: "none", fontSize: 16, fontWeight: 500, cursor: phase === "submitting" ? "default" : "pointer", background: ready ? "#33232A" : "#DCC4CC", color: ready ? "#F3E9EB" : "#6B5A60", opacity: phase === "submitting" ? 0.7 : 1 }}>
        {phase === "submitting" ? "결제 진행 중..." : ready ? `${won(amount)} 결제하기` : missing.length ? "날짜 · 시간 · 정보를 입력해 주세요" : "필수 항목에 동의해 주세요"}
      </button>
    </main>
  );
}
