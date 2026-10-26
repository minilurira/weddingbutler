"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, type CSSProperties } from "react";
import { fontSerif } from "@/lib/style";
import { formatPhoneInput } from "@/lib/phone";

interface Item { id: string; template: string; paid: boolean; status: "draft" | "published" | "hidden"; url: string; groom: string; bride: string; date: string; updatedAt: string }

const STATUS: Record<Item["status"], string> = { draft: "작성 중", published: "공개 중", hidden: "비공개" };
const card: CSSProperties = { maxWidth: 520, margin: "0 auto", background: "#FFFFFF", borderRadius: 6, padding: "clamp(24px,5vw,40px)", boxSizing: "border-box" };
const field: CSSProperties = { width: "100%", height: 52, boxSizing: "border-box", border: "1px solid #DCC4CC", borderRadius: 10, padding: "0 16px", fontSize: 16, color: "#33232A", background: "#FFFFFF", fontFamily: "inherit" };
const primary: CSSProperties = { width: "100%", minHeight: 52, border: "none", borderRadius: 999, background: "#33232A", color: "#F3E9EB", fontSize: 16, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" };

const ERR: Record<string, string> = {
  invalid_phone: "휴대폰 번호를 확인해 주세요.",
  too_many_requests: "인증번호를 너무 자주 요청하셨어요. 잠시 뒤에 다시 시도해 주세요.",
  sms_failed: "인증번호를 보내지 못했어요. 잠시 뒤에 다시 시도해 주세요.",
  unavailable: "지금은 인증을 할 수 없어요. 잠시 뒤에 다시 시도해 주세요.",
  mismatch: "인증번호가 맞지 않아요.",
  expired: "인증번호가 만료됐어요. 새 번호를 받아 주세요.",
  locked: "인증번호를 여러 번 틀렸어요. 새 번호를 받아 주세요.",
};

export function InvitationEntry() {
  const [items, setItems] = useState<Item[] | null>(null); // null = 확인 중, undefined 아님
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const load = useCallback(async () => {
    const r = await fetch("/api/invitation", { cache: "no-store" }).catch(() => null);
    if (r && r.ok) {
      setItems(((await r.json()) as { invitations: Item[] }).invitations);
      setLoggedIn(true);
    } else {
      setLoggedIn(false);
    }
  }, []);
  useEffect(() => {
    void load();
  }, [load]);

  async function post(url: string, body?: object) {
    return fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body ?? {}) });
  }

  async function sendCode() {
    setErr("");
    setBusy(true);
    try {
      const r = await post("/api/invitation/otp", { phone });
      const d = (await r.json().catch(() => ({}))) as { error?: string };
      if (!r.ok) return setErr(ERR[d.error ?? ""] ?? "인증번호를 보내지 못했어요.");
      setSent(true);
    } finally {
      setBusy(false);
    }
  }

  async function verify() {
    setErr("");
    setBusy(true);
    try {
      const r = await post("/api/invitation/verify", { phone, code });
      const d = (await r.json().catch(() => ({}))) as { error?: string };
      if (!r.ok) return setErr(ERR[d.error ?? ""] ?? "인증하지 못했어요.");
      await load();
    } finally {
      setBusy(false);
    }
  }

  async function create() {
    setErr("");
    setBusy(true);
    try {
      const r = await post("/api/invitation");
      const d = (await r.json().catch(() => ({}))) as { id?: string; error?: string };
      if (!r.ok || !d.id) return setErr(d.error === "limit" ? "청첩장은 한 번호에 5개까지 만들 수 있어요. 안 쓰는 청첩장을 지워 주세요." : "만들지 못했어요. 잠시 뒤에 다시 시도해 주세요.");
      window.location.href = `/invitation/edit/${d.id}`;
    } finally {
      setBusy(false);
    }
  }

  async function logout() {
    await post("/api/invitation/logout");
    setItems(null);
    setLoggedIn(false);
    setSent(false);
    setCode("");
  }

  return (
    <main style={{ padding: "clamp(40px,8vw,80px) clamp(18px,5vw,24px) clamp(56px,9vw,100px)" }}>
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <h1 style={{ fontFamily: fontSerif, fontSize: "clamp(26px,5.6vw,34px)", fontWeight: 600, margin: "0 0 12px", letterSpacing: "-0.02em" }}>모바일 청첩장 만들기</h1>
        <p style={{ fontSize: 15, lineHeight: 1.8, color: "#6B5A60", margin: 0 }}>휴대폰 번호로 본인 확인을 하면, 언제든 다시 들어와 고칠 수 있어요.</p>
      </div>

      {loggedIn === null && <div style={{ ...card, textAlign: "center", color: "#6B5A60" }}>불러오는 중…</div>}

      {loggedIn === false && (
        <div style={card}>
          <label htmlFor="invPhone" style={{ display: "block", fontSize: 14, fontWeight: 600, marginBottom: 8 }}>휴대폰 번호</label>
          <input id="invPhone" type="tel" inputMode="numeric" autoComplete="tel" placeholder="010-0000-0000" value={phone} onChange={(e) => setPhone(formatPhoneInput(e.target.value))} disabled={sent} style={field} />
          {!sent ? (
            <button type="button" onClick={sendCode} disabled={busy || phone.replace(/\D/g, "").length < 10} style={{ ...primary, marginTop: 14, opacity: busy || phone.replace(/\D/g, "").length < 10 ? 0.5 : 1 }}>인증번호 받기</button>
          ) : (
            <>
              <label htmlFor="invCode" style={{ display: "block", fontSize: 14, fontWeight: 600, margin: "18px 0 8px" }}>인증번호 6자리</label>
              <input id="invCode" inputMode="numeric" autoComplete="one-time-code" maxLength={6} placeholder="000000" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))} style={{ ...field, letterSpacing: "0.3em", textAlign: "center" }} />
              <button type="button" onClick={verify} disabled={busy || code.length !== 6} style={{ ...primary, marginTop: 14, opacity: busy || code.length !== 6 ? 0.5 : 1 }}>확인하고 시작하기</button>
              <button type="button" onClick={() => { setSent(false); setCode(""); setErr(""); }} style={{ width: "100%", minHeight: 44, marginTop: 6, border: "none", background: "transparent", color: "#6B5A60", fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>번호 다시 입력 · 인증번호 다시 받기</button>
            </>
          )}
          {err && <p role="alert" style={{ margin: "14px 0 0", fontSize: 14, color: "#B03A52" }}>{err}</p>}
          <p style={{ margin: "18px 0 0", fontSize: 12, lineHeight: 1.7, color: "#9A8189" }}>입력한 번호는 인증과 청첩장 관리에만 쓰입니다. 인증번호는 알림톡(또는 문자)으로 보내 드려요.</p>
        </div>
      )}

      {loggedIn && items && (
        <div style={card}>
          <button type="button" onClick={create} disabled={busy} style={{ ...primary, opacity: busy ? 0.6 : 1 }}>+ 새 청첩장 만들기</button>
          {err && <p role="alert" style={{ margin: "12px 0 0", fontSize: 14, color: "#B03A52" }}>{err}</p>}
          <div style={{ marginTop: 24, borderTop: "1px solid #F0E3E6" }}>
            {items.length === 0 && <p style={{ padding: "24px 0", textAlign: "center", fontSize: 14, color: "#9A8189", margin: 0 }}>아직 만든 청첩장이 없어요.</p>}
            {items.map((it) => (
              <div key={it.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 0", borderBottom: "1px solid #F0E3E6" }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 16, fontWeight: 600 }}>{[it.groom, it.bride].filter(Boolean).join(" · ") || "이름을 입력해 주세요"}</div>
                  <div style={{ fontSize: 13, color: "#9A8189", marginTop: 2 }}>{it.date || "날짜 미정"} · <span style={{ color: it.status === "published" ? "#2F6B45" : "#8E4E68", fontWeight: 600 }}>{STATUS[it.status]}</span></div>
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
                  {it.paid && it.template !== "classic" && <Link href={`/invitation/dashboard/${it.id}`} style={{ display: "inline-flex", alignItems: "center", minHeight: 44, padding: "0 18px", borderRadius: 999, border: "1px solid #A9647E", background: "#F9EFF2", color: "#8E4E68", fontSize: 14, fontWeight: 700 }}>대시보드</Link>}
                  <Link href={`/invitation/edit/${it.id}`} style={{ display: "inline-flex", alignItems: "center", minHeight: 44, padding: "0 18px", borderRadius: 999, border: "1px solid #DCC4CC", color: "#473A3F", fontSize: 14, fontWeight: 500 }}>고치기</Link>
                </div>
              </div>
            ))}
          </div>
          <button type="button" onClick={logout} style={{ marginTop: 18, minHeight: 44, border: "none", background: "transparent", color: "#9A8189", fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>다른 번호로 다시 인증하기</button>
        </div>
      )}
    </main>
  );
}
