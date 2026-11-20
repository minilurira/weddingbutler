"use client";

import { useEffect, useState } from "react";

// 예약 조회 화면의 '내 추천 코드'. 결제를 마친 예약이 있는 고객만 코드를 받을 수 있다(셀프 발급).

interface MyReferral {
  code: string;
  url: string;
  ratePercent: number;
  status: string;
  account: { bankName: string; accountNumberMasked: string; accountHolder: string; checked: boolean } | null;
  residentNoRegistered: boolean;
  incomeTypeLabel: string;
  counts: { pending: number; ready: number; paid: number };
  expectedAmount: number;
  paidNetAmount: number;
}

const won = (n: number) => `${n.toLocaleString("ko-KR")}원`;
const card: React.CSSProperties = { background: "#FFFFFF", borderRadius: 20, padding: "clamp(20px,4vw,28px)", boxShadow: "0 1px 0 #E7D5DA" };
const input: React.CSSProperties = { width: "100%", boxSizing: "border-box", height: 46, border: "1px solid #E7D5DA", borderRadius: 12, padding: "0 14px", fontSize: 15, background: "#FFFFFF", color: "#33232A" };
const darkBtn: React.CSSProperties = { height: 46, padding: "0 20px", border: "none", borderRadius: 999, background: "#33232A", color: "#F3E9EB", fontSize: 14.5, fontWeight: 500, cursor: "pointer" };
const lightBtn: React.CSSProperties = { ...darkBtn, background: "#F3E9EB", color: "#473A3F" };
const small: React.CSSProperties = { fontSize: 13, lineHeight: 1.8, color: "#9A8189", margin: 0 };

export const REFERRAL_TERMS = [
  "추천 링크나 코드로 예약·결제한 예식이 끝나면, 그 예약의 최종 서비스 금액(온라인 결제 + 현장 결제, 할인 반영, 환불 금액 제외)의 5%를 수수료로 드립니다.",
  "수수료는 예식이 있었던 달의 다음 달 1~5일에 등록하신 계좌로 보내 드립니다. 예약이 취소되면 수수료는 없습니다.",
  "수수료는 소득세법에 따라 원천징수(기타소득 8.8%, 1회 125,000원 이하는 0원 / 반복 지급 시 사업소득 3.3%) 후 지급하며, 지급명세서 제출을 위해 주민등록번호가 필요합니다.",
  "본인 예약에는 코드를 쓸 수 없고, 코드를 부정하게 쓰거나 무단으로 광고에 노출하면 코드 사용을 정지할 수 있습니다.",
  "수집 항목: 이름, 휴대폰 번호, 정산 계좌(은행·계좌번호·예금주), 주민등록번호(암호화 보관). 이용 목적: 추천 수수료 정산과 세금 신고. 보관 기간: 마지막 지급일로부터 5년(국세기본법) 후 파기.",
];

async function call(method: "GET" | "POST", body?: object) {
  const res = await fetch("/api/lookup/referral", {
    method,
    cache: "no-store",
    headers: { "Content-Type": "application/json" },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const data = (await res.json().catch(() => ({}))) as { eligible?: boolean; referral?: MyReferral | null; error?: string; message?: string };
  return { ok: res.ok, data };
}

export function ReferralCard() {
  const [state, setState] = useState<"loading" | "hidden" | "ready">("loading");
  const [eligible, setEligible] = useState(false);
  const [ref, setRef] = useState<MyReferral | null>(null);
  const [agree, setAgree] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [acctOpen, setAcctOpen] = useState(false);
  const [bank, setBank] = useState("");
  const [acct, setAcct] = useState("");
  const [holder, setHolder] = useState("");
  const [rrnOpen, setRrnOpen] = useState(false);
  const [rrn, setRrn] = useState("");

  useEffect(() => {
    call("GET").then(({ ok, data }) => {
      if (!ok) return setState("hidden");
      setEligible(Boolean(data.eligible));
      setRef(data.referral ?? null);
      setState(data.eligible || data.referral ? "ready" : "hidden");
    }, () => setState("hidden"));
  }, []);

  async function act(body: object, done?: () => void) {
    setBusy(true);
    setMsg("");
    try {
      const { ok, data } = await call("POST", body);
      if (!ok) return setMsg(data.message ?? "잠시 후 다시 시도해 주세요.");
      setRef(data.referral ?? null);
      done?.();
    } catch {
      setMsg("잠시 후 다시 시도해 주세요.");
    } finally {
      setBusy(false);
    }
  }

  async function share() {
    if (!ref) return;
    const text = `웨딩버틀러 축의대 예약할 때 제 추천 코드 ${ref.code} 를 써 주세요!`;
    try {
      if (navigator.share) await navigator.share({ title: "웨딩버틀러", text, url: ref.url });
      else {
        await navigator.clipboard.writeText(`${text}\n${ref.url}`);
        setMsg("추천 링크를 복사했어요. 카카오톡에 붙여 넣어 보내 주세요.");
      }
    } catch {
      /* 공유 창을 닫은 경우 */
    }
  }
  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setMsg("복사했어요.");
    } catch {
      setMsg(text);
    }
  }

  if (state !== "ready") return null;

  return (
    <article style={{ ...card, border: "1px solid #EBC2D3" }}>
      <p style={{ margin: "0 0 4px", fontSize: 13, letterSpacing: "0.08em", color: "#A9647E" }}>내 추천 코드</p>
      {!ref ? (
        <>
          <h2 style={{ margin: "0 0 10px", fontSize: 19, fontWeight: 600, color: "#33232A" }}>지인에게 웨딩버틀러를 소개해 주세요</h2>
          <p style={{ margin: "0 0 14px", fontSize: 14.5, lineHeight: 1.8, color: "#6B5A60" }}>
            추천 코드로 예약한 분의 예식이 끝나면 서비스 금액의 <b>5%</b>를 다음 달 초에 보내 드려요.
          </p>
          <button type="button" onClick={() => setShowTerms((v) => !v)} style={{ background: "none", border: "none", padding: 0, color: "#A9647E", fontSize: 13.5, textDecoration: "underline", cursor: "pointer" }}>
            {showTerms ? "조건 접기" : "영업대행(추천) 조건과 개인정보 수집 보기"}
          </button>
          {showTerms && (
            <ul style={{ margin: "10px 0 0", paddingLeft: 18, fontSize: 13, lineHeight: 1.8, color: "#6B5A60" }}>
              {REFERRAL_TERMS.map((t) => <li key={t}>{t}</li>)}
            </ul>
          )}
          <label style={{ display: "flex", gap: 8, alignItems: "flex-start", margin: "14px 0", fontSize: 14, color: "#473A3F", lineHeight: 1.6 }}>
            <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} style={{ marginTop: 4 }} />
            영업대행 조건과 개인정보 수집·이용에 동의합니다.
          </label>
          <button type="button" style={{ ...darkBtn, opacity: agree && eligible ? 1 : 0.5 }} disabled={busy || !agree || !eligible} onClick={() => act({ action: "issue", agreed: true })}>
            {busy ? "발급 중…" : "코드 받기"}
          </button>
        </>
      ) : (
        <>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12, margin: "4px 0 12px" }}>
            <span style={{ fontSize: 28, fontWeight: 700, letterSpacing: "0.08em", color: "#33232A" }}>{ref.code}</span>
            {ref.status !== "active" && <span style={{ fontSize: 12.5, color: "#B03A3A" }}>사용 정지된 코드예요. 고객센터로 문의해 주세요.</span>}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            <button type="button" style={darkBtn} onClick={share}>추천 링크 공유</button>
            <button type="button" style={lightBtn} onClick={() => copy(ref.url)}>링크 복사</button>
            <button type="button" style={lightBtn} onClick={() => copy(ref.code)}>코드 복사</button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0,1fr))", gap: 8, margin: "16px 0", textAlign: "center" }}>
            {[["예식 전", ref.counts.pending], ["정산 대기", ref.counts.ready], ["정산 완료", ref.counts.paid]].map(([l, n]) => (
              <div key={l as string} style={{ background: "#F8F1F3", borderRadius: 14, padding: "10px 4px" }}>
                <div style={{ fontSize: 12.5, color: "#9A8189" }}>{l}</div>
                <div style={{ fontSize: 18, fontWeight: 600, color: "#33232A" }}>{n}건</div>
              </div>
            ))}
          </div>
          <p style={{ ...small, color: "#6B5A60" }}>
            받을 예정 수수료 <b>{won(ref.expectedAmount)}</b> (세전) · 지금까지 받은 금액 <b>{won(ref.paidNetAmount)}</b>
          </p>

          <div style={{ borderTop: "1px solid #F1E4E8", margin: "16px 0 0", paddingTop: 14, display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
              <span style={{ fontSize: 14, color: "#473A3F" }}>
                정산 계좌: {ref.account ? `${ref.account.bankName} ${ref.account.accountNumberMasked} ${ref.account.accountHolder}` : <span style={{ color: "#B03A3A" }}>미등록</span>}
                {ref.account && !ref.account.checked && <span style={{ fontSize: 12.5, color: "#9A8189" }}> (확인 중)</span>}
              </span>
              <button type="button" style={{ ...lightBtn, height: 36, fontSize: 13 }} onClick={() => { setAcctOpen((v) => !v); setHolder((h) => h || ref.account?.accountHolder || ""); }}>{ref.account ? "변경" : "등록"}</button>
            </div>
            {acctOpen && (
              <form style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,2fr)", gap: 8 }} onSubmit={(e) => { e.preventDefault(); act({ action: "account", bankName: bank, accountNumber: acct, accountHolder: holder }, () => { setAcctOpen(false); setAcct(""); }); }}>
                <input style={input} value={bank} onChange={(e) => setBank(e.target.value)} placeholder="은행" aria-label="은행" />
                <input style={input} value={acct} onChange={(e) => setAcct(e.target.value.replace(/[^0-9-]/g, ""))} placeholder="계좌번호" inputMode="numeric" aria-label="계좌번호" />
                <input style={input} value={holder} onChange={(e) => setHolder(e.target.value)} placeholder="예금주 (본인 명의)" aria-label="예금주" />
                <button type="submit" style={darkBtn} disabled={busy}>저장</button>
              </form>
            )}
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
              <span style={{ fontSize: 14, color: "#473A3F" }}>
                주민등록번호(세금 신고용): {ref.residentNoRegistered ? "등록됨" : <span style={{ color: "#B03A3A" }}>미등록</span>}
              </span>
              <button type="button" style={{ ...lightBtn, height: 36, fontSize: 13 }} onClick={() => setRrnOpen((v) => !v)}>{ref.residentNoRegistered ? "변경" : "등록"}</button>
            </div>
            {rrnOpen && (
              <form style={{ display: "flex", gap: 8 }} onSubmit={(e) => { e.preventDefault(); act({ action: "resident", residentNo: rrn }, () => { setRrnOpen(false); setRrn(""); }); }}>
                <input style={input} value={rrn} onChange={(e) => setRrn(e.target.value.replace(/[^0-9-]/g, "").slice(0, 14))} placeholder="000000-0000000" inputMode="numeric" autoComplete="off" aria-label="주민등록번호" />
                <button type="submit" style={darkBtn} disabled={busy || rrn.replace(/[^0-9]/g, "").length !== 13}>저장</button>
              </form>
            )}
            <p style={small}>계좌와 주민등록번호를 등록해야 수수료를 보내 드릴 수 있어요. 주민등록번호는 원천징수 지급명세서 제출에만 쓰고 암호화해 보관합니다.</p>
          </div>
        </>
      )}
      {msg && <p role="status" style={{ margin: "12px 0 0", fontSize: 14, lineHeight: 1.7, color: "#A9647E" }}>{msg}</p>}
    </article>
  );
}
