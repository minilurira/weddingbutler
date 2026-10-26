"use client";

import { useCallback, useEffect, useState, type CSSProperties } from "react";
import {
  RECEPT_TEXTS,
  dateLabel,
  daysUntil,
  mapLinks,
  monthCells,
  type InvitationContent,
} from "@/lib/invitation/content";
import { fontDisplay, fontSerif } from "@/lib/style";

// 하객이 보는 모바일 청첩장. 에디터 미리보기와 발행본이 같은 컴포넌트를 쓴다.
// preview=true(에디터)에서는 방명록을 서버에 연결하지 않고 예시 글만 보여 준다.

const INK = "#3A3128";
const SOFT = "#6B5E50";
const GOLD = "#8A6A43";
const BROWN = "#6B5232";
const LINE = "#CDBDA3";
const IVORY = "#FBF7F0";
const SAND = "#F4ECDF";
const SANS = "var(--font-sans), sans-serif";

interface GuestEntry { id: string; name: string; message: string; created_at: string }

const SAMPLE_ENTRIES: GuestEntry[] = [
  { id: "s1", name: "지민", message: "두 사람의 시작을 진심으로 축하해요. 오래오래 행복하세요!", created_at: "" },
  { id: "s2", name: "현우", message: "결혼 축하해! 그날 만나자.", created_at: "" },
];

const eyebrow: CSSProperties = { textAlign: "center", fontFamily: SANS, fontSize: 11, letterSpacing: "0.3em", color: GOLD, marginBottom: 14 };
const sectionTitle: CSSProperties = { margin: "0 0 22px", textAlign: "center", fontSize: 20, fontWeight: 400 };
const outlineBtn: CSSProperties = { minHeight: 44, border: `1px solid ${LINE}`, borderRadius: 6, background: "transparent", color: BROWN, fontSize: 13, cursor: "pointer", fontFamily: "inherit" };

function ago(iso: string): string {
  if (!iso) return "";
  const min = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (min < 1) return "방금";
  if (min < 60) return `${min}분 전`;
  if (min < 60 * 24) return `${Math.floor(min / 60)}시간 전`;
  return `${Math.floor(min / 60 / 24)}일 전`;
}

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export function InvitationView({ content: c, photoBase, slug, preview = false }: { content: InvitationContent; photoBase: string; slug: string | null; preview?: boolean }) {
  const photoUrl = (path: string) => (path ? `${photoBase}${path}` : "");
  const label = dateLabel(c);
  const dday = daysUntil(c.date);
  const cal = monthCells(c.date);
  const links = mapLinks(c);
  const names = [c.groom, c.bride].filter(Boolean).join(" · ") || "신랑 · 신부";
  const parents = (a: string, b: string) => [a, b].filter(Boolean).join(" · ");
  const groomParents = parents(c.groomFather, c.groomMother);
  const brideParents = parents(c.brideFather, c.brideMother);
  const place = [c.venue, c.hall].filter(Boolean).join(" ");
  const accounts = c.accounts.filter((a) => a.number.trim());
  const contacts = c.contacts.filter((x) => x.phone.trim());

  const [toast, setToast] = useState("");
  const say = useCallback((m: string) => {
    setToast(m);
    window.setTimeout(() => setToast(""), 1800);
  }, []);
  async function copyAndSay(text: string, ok: string) {
    say((await copyText(text)) ? ok : "복사하지 못했어요. 길게 눌러 직접 복사해 주세요.");
  }

  // 방명록
  const [entries, setEntries] = useState<GuestEntry[]>(preview ? SAMPLE_ENTRIES : []);
  const [gName, setGName] = useState("");
  const [gMsg, setGMsg] = useState("");
  const [gPw, setGPw] = useState("");
  const [gErr, setGErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [delId, setDelId] = useState("");
  const [delPw, setDelPw] = useState("");

  const loadEntries = useCallback(async () => {
    if (preview || !slug) return;
    try {
      const r = await fetch(`/api/i/${slug}/guestbook`, { cache: "no-store" });
      if (r.ok) setEntries(((await r.json()) as { entries: GuestEntry[] }).entries);
    } catch {
      /* 목록을 못 불러와도 청첩장은 계속 보인다 */
    }
  }, [preview, slug]);
  useEffect(() => {
    if (c.guestbook) void loadEntries();
  }, [c.guestbook, loadEntries]);

  const GB_ERRORS: Record<string, string> = {
    empty: "이름과 메시지를 입력해 주세요.",
    password: "비밀번호는 숫자 4자리로 입력해 주세요. 글을 지울 때 필요해요.",
    profanity: "욕설로 보이는 표현이 있어 등록할 수 없어요.",
    advertising: "광고나 링크로 보이는 내용이 있어 등록할 수 없어요.",
    too_many: "너무 자주 남기셨어요. 잠시 뒤에 다시 남겨 주세요.",
  };

  async function submitEntry() {
    setGErr("");
    if (preview) return setGErr("미리보기에서는 방명록을 남길 수 없어요. 발행하면 하객이 남길 수 있어요.");
    if (!slug) return;
    setBusy(true);
    try {
      const r = await fetch(`/api/i/${slug}/guestbook`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: gName, message: gMsg, password: gPw }) });
      const data = (await r.json().catch(() => ({}))) as { entry?: GuestEntry; error?: string };
      if (!r.ok || !data.entry) return setGErr(GB_ERRORS[data.error ?? ""] ?? "남기지 못했어요. 잠시 뒤에 다시 시도해 주세요.");
      setEntries((prev) => [data.entry as GuestEntry, ...prev]);
      setGName("");
      setGMsg("");
      setGPw("");
      say("방명록을 남겼어요.");
    } finally {
      setBusy(false);
    }
  }

  async function removeEntry(id: string) {
    if (preview || !slug) return;
    setBusy(true);
    try {
      const r = await fetch(`/api/i/${slug}/guestbook`, { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ entryId: id, password: delPw }) });
      if (r.status === 403) return say("비밀번호가 맞지 않아요.");
      if (!r.ok) return say("지우지 못했어요. 잠시 뒤에 다시 시도해 주세요.");
      setEntries((prev) => prev.filter((e) => e.id !== id));
      setDelId("");
      setDelPw("");
      say("지웠어요.");
    } finally {
      setBusy(false);
    }
  }

  const input: CSSProperties = { height: 46, border: "1px solid #D9CDB8", borderRadius: 6, padding: "0 14px", fontSize: 15, background: "#FFFDF8", color: INK, boxSizing: "border-box", width: "100%", fontFamily: "inherit" };

  return (
    <div style={{ position: "relative", width: "100%", maxWidth: 480, margin: "0 auto", background: IVORY, color: INK, fontFamily: fontSerif, overflow: "hidden" }}>
      {/* 표지 */}
      <section
        aria-label="표지"
        style={{
          position: "relative",
          minHeight: 760,
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          alignItems: "center",
          padding: "0 32px 72px",
          boxSizing: "border-box",
          textAlign: "center",
          color: "#FFFDF8",
          backgroundColor: "#8E7656",
          backgroundImage: c.cover
            ? `linear-gradient(180deg, rgba(40,30,20,0) 38%, rgba(40,30,20,0.72) 100%), url(${photoUrl(c.cover)})`
            : "linear-gradient(180deg,#D9C9B2 0%,#B9A184 55%,#8E7656 100%)",
          backgroundSize: "cover",
          backgroundPosition: "center 25%",
        }}
      >
        {!c.cover && preview && <div style={{ position: "absolute", top: 120, left: 0, right: 0, fontFamily: SANS, fontSize: 13, opacity: 0.9 }}>표지 사진을 올려 주세요</div>}
        <div style={{ fontFamily: SANS, fontSize: 12, letterSpacing: "0.36em", marginBottom: 22 }}>WEDDING INVITATION</div>
        <div style={{ fontSize: 36, fontWeight: 300, letterSpacing: "0.1em", lineHeight: 1.3 }}>{c.groom || "신랑"} <span style={{ fontSize: 22, opacity: 0.85 }}>&amp;</span> {c.bride || "신부"}</div>
        <div style={{ width: 36, height: 1, background: "#FFFDF8", opacity: 0.7, margin: "26px 0" }} />
        <div style={{ fontSize: 15, lineHeight: 1.9, letterSpacing: "0.04em" }}>
          {label || "예식 날짜를 입력해 주세요"}
          {place && (<><br />{place}</>)}
        </div>
      </section>

      {/* 인사말 */}
      <section style={{ padding: "72px 36px 64px", textAlign: "center" }}>
        <div style={eyebrow}>INVITATION</div>
        <h2 style={{ margin: "0 0 28px", fontSize: 22, fontWeight: 400, letterSpacing: "0.03em" }}>{c.title || "소중한 분들을 초대합니다"}</h2>
        <p style={{ margin: 0, fontSize: 15, lineHeight: 2.1, fontWeight: 300, whiteSpace: "pre-line" }}>{c.greeting}</p>
        {(groomParents || brideParents) && (
          <div style={{ marginTop: 36, fontSize: 14, lineHeight: 2, fontWeight: 300, color: SOFT }}>
            {groomParents && <div>{groomParents} 의 아들 <b style={{ fontWeight: 600, color: INK }}>{c.groom}</b></div>}
            {brideParents && <div>{brideParents} 의 딸 <b style={{ fontWeight: 600, color: INK }}>{c.bride}</b></div>}
          </div>
        )}
      </section>

      {/* 예식 안내: 달력과 D-day */}
      {(c.showCalendar || c.showDday) && cal && (
        <section style={{ padding: "56px 28px 60px", background: SAND, textAlign: "center" }}>
          <div style={eyebrow}>WEDDING DAY</div>
          <div style={{ fontSize: 19, letterSpacing: "0.05em", marginBottom: 6 }}>{label}</div>
          {c.showCalendar && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, minmax(0,1fr))", rowGap: 6, fontFamily: SANS, fontSize: 13, marginTop: 24 }}>
              {["일", "월", "화", "수", "목", "금", "토"].map((w, i) => (
                <div key={w} style={{ padding: "6px 0", fontSize: 11, color: i === 0 ? "#B25B4B" : "#7A6A56" }}>{w}</div>
              ))}
              {cal.cells.map((d, i) => (
                <div key={i} style={{ height: 38, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {d > 0 && (
                    <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 34, height: 34, borderRadius: 17, background: d === cal.day ? BROWN : "transparent", color: d === cal.day ? "#FFFDF8" : i % 7 === 0 ? "#B25B4B" : INK, fontWeight: d === cal.day ? 700 : 400 }}>{d}</span>
                  )}
                </div>
              ))}
            </div>
          )}
          {c.showDday && dday !== null && (
            <div style={{ marginTop: 26, fontSize: 14, color: BROWN }}>
              {dday > 0 ? <>결혼식까지 <b style={{ fontSize: 18 }}>D-{dday}</b></> : dday === 0 ? <b style={{ fontSize: 18 }}>오늘 결혼합니다</b> : <>두 사람의 결혼식이 <b>{-dday}일 전</b>에 있었어요</>}
            </div>
          )}
        </section>
      )}

      {/* 오시는 길 */}
      {(c.venue || c.address || links.length > 0 || c.traffic) && (
        <section style={{ padding: "64px 28px 56px" }}>
          <div style={eyebrow}>LOCATION</div>
          <h2 style={{ ...sectionTitle, marginBottom: 6 }}>{place || "예식장"}</h2>
          {c.address && <p style={{ margin: "0 0 22px", textAlign: "center", fontSize: 13, color: SOFT, fontWeight: 300 }}>{c.address}</p>}
          {links.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: `repeat(${links.length}, minmax(0,1fr))`, gap: 8 }}>
              {links.map((l) => (
                <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer" style={{ ...outlineBtn, display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none" }}>{l.label}</a>
              ))}
            </div>
          )}
          {c.address && (
            <button type="button" onClick={() => copyAndSay(c.address, "주소를 복사했어요.")} style={{ ...outlineBtn, width: "100%", marginTop: 8 }}>주소 복사</button>
          )}
          {c.traffic && <div style={{ marginTop: 22, fontSize: 13, lineHeight: 1.9, color: SOFT, fontWeight: 300, whiteSpace: "pre-line" }}>{c.traffic}</div>}
        </section>
      )}

      {/* 갤러리: 2열 */}
      {c.gallery.length > 0 && (
        <section style={{ padding: "56px 4px", background: SAND }}>
          <div style={eyebrow}>GALLERY</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 3, marginTop: 22 }}>
            {c.gallery.map((p, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={p} src={photoUrl(p)} alt={`웨딩 사진 ${i + 1}`} loading="lazy" style={{ display: "block", width: "100%", aspectRatio: "1 / 1.2", objectFit: "cover" }} />
            ))}
          </div>
        </section>
      )}

      {/* 마음 전하실 곳 */}
      {c.showAccounts && accounts.length > 0 && (
        <section style={{ padding: "60px 28px 48px", textAlign: "center" }}>
          <div style={eyebrow}>GIFT</div>
          <h2 style={sectionTitle}>마음 전하실 곳</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, textAlign: "left", fontFamily: SANS }}>
            {accounts.map((a, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 16px", border: "1px solid #E1D5C0", borderRadius: 8, background: "#FFFDF8" }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, color: SOFT }}>{[a.who, a.holder].filter(Boolean).join(" · ")}</div>
                  <div style={{ fontSize: 14, marginTop: 2, wordBreak: "break-all" }}>{[a.bank, a.number].filter(Boolean).join(" ")}</div>
                </div>
                <button type="button" onClick={() => copyAndSay(a.number, "계좌번호를 복사했어요.")} style={{ minHeight: 44, minWidth: 56, padding: "0 14px", border: 0, borderRadius: 6, background: "#EDE2CF", color: BROWN, fontSize: 12, fontWeight: 500, cursor: "pointer", fontFamily: "inherit" }}>복사</button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 연락처 */}
      {c.showContacts && contacts.length > 0 && (
        <section style={{ padding: "8px 28px 48px", textAlign: "center" }}>
          <div style={eyebrow}>CONTACT</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, fontFamily: SANS }}>
            {contacts.map((x, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", border: "1px solid #E1D5C0", borderRadius: 8, background: "#FFFDF8" }}>
                <span style={{ flex: 1, textAlign: "left", fontSize: 14 }}>{x.label}</span>
                <a href={`tel:${x.phone}`} style={{ ...outlineBtn, display: "flex", alignItems: "center", padding: "0 14px", textDecoration: "none" }}>전화</a>
                <a href={`sms:${x.phone}`} style={{ ...outlineBtn, display: "flex", alignItems: "center", padding: "0 14px", textDecoration: "none" }}>문자</a>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 축의 접수 안내: 항상 표시 */}
      <section style={{ margin: "0 20px", padding: "36px 24px 32px", border: `1px solid ${LINE}`, borderRadius: 10, textAlign: "center", background: "#FFFDF8" }}>
        <div style={eyebrow}>GIFT RECEPTION</div>
        <h2 style={{ margin: "0 0 14px", fontSize: 18, fontWeight: 400, lineHeight: 1.6 }}>축의 접수는<br />웨딩버틀러가 함께합니다</h2>
        <p style={{ margin: "0 0 22px", fontSize: 13, lineHeight: 1.95, color: SOFT, fontWeight: 300, whiteSpace: "pre-line" }}>{RECEPT_TEXTS[c.receptStyle] ?? RECEPT_TEXTS[0]}</p>
        <a href="https://weddingbutler.co.kr" target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", minHeight: 44, padding: "0 22px", borderRadius: 22, background: BROWN, color: "#FFFDF8", fontFamily: SANS, fontSize: 13, fontWeight: 500, textDecoration: "none" }}>웨딩버틀러 알아보기</a>
      </section>

      {/* 방명록 */}
      {c.guestbook && (
        <section style={{ padding: "64px 24px 40px" }}>
          <div style={eyebrow}>GUESTBOOK</div>
          <h2 style={sectionTitle}>축하의 한마디</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, fontFamily: SANS }}>
            <label htmlFor="gbName" style={{ fontSize: 12, color: SOFT }}>이름</label>
            <input id="gbName" value={gName} onChange={(e) => setGName(e.target.value.slice(0, 20))} placeholder="이름" style={input} />
            <label htmlFor="gbMsg" style={{ fontSize: 12, color: SOFT }}>메시지</label>
            <textarea id="gbMsg" value={gMsg} onChange={(e) => setGMsg(e.target.value.slice(0, 300))} placeholder="두 사람에게 전하고 싶은 말을 남겨 주세요" style={{ ...input, height: 96, padding: "12px 14px", resize: "none" }} />
            <label htmlFor="gbPw" style={{ fontSize: 12, color: SOFT }}>비밀번호 (숫자 4자리)</label>
            <input id="gbPw" type="password" inputMode="numeric" maxLength={4} value={gPw} onChange={(e) => setGPw(e.target.value.replace(/\D/g, "").slice(0, 4))} placeholder="내 글을 지울 때 필요해요" style={input} />
            {gErr && <div role="alert" style={{ fontSize: 12, color: "#B25B4B" }}>{gErr}</div>}
            <div style={{ fontSize: 11, lineHeight: 1.6, color: "#8A7A66" }}>욕설·광고는 등록되지 않고, 신랑·신부가 부적절한 글을 지울 수 있어요.</div>
            <button type="button" disabled={busy} onClick={submitEntry} style={{ minHeight: 48, border: 0, borderRadius: 6, background: BROWN, color: "#FFFDF8", fontSize: 14, fontWeight: 500, cursor: "pointer", opacity: busy ? 0.6 : 1, fontFamily: "inherit" }}>방명록 남기기</button>
          </div>
          <div style={{ marginTop: 26, display: "flex", flexDirection: "column", gap: 12, fontFamily: SANS }}>
            {entries.length === 0 && <div style={{ textAlign: "center", fontSize: 13, color: "#8A7A66" }}>첫 번째 축하 글을 남겨 보세요.</div>}
            {entries.map((e) => (
              <div key={e.id} style={{ padding: 16, borderRadius: 8, background: SAND }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12, color: SOFT }}>
                  <b style={{ fontWeight: 700, color: INK }}>{e.name}</b>
                  <span>
                    {ago(e.created_at)}
                    {!preview && (
                      <button type="button" onClick={() => { setDelId(delId === e.id ? "" : e.id); setDelPw(""); }} aria-label={`${e.name} 님 글 삭제`} style={{ marginLeft: 6, minHeight: 44, padding: "0 8px", border: 0, background: "transparent", color: "#B25B4B", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>삭제</button>
                    )}
                  </span>
                </div>
                <p style={{ margin: "8px 0 0", fontSize: 14, lineHeight: 1.7, whiteSpace: "pre-line", wordBreak: "break-word" }}>{e.message}</p>
                {delId === e.id && (
                  <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                    <input type="password" inputMode="numeric" maxLength={4} aria-label="비밀번호 4자리" value={delPw} onChange={(ev) => setDelPw(ev.target.value.replace(/\D/g, "").slice(0, 4))} placeholder="비밀번호 4자리" style={{ ...input, height: 44, flex: 1 }} />
                    <button type="button" disabled={busy || delPw.length !== 4} onClick={() => removeEntry(e.id)} style={{ minHeight: 44, padding: "0 16px", border: 0, borderRadius: 6, background: "#B25B4B", color: "#FFFFFF", fontSize: 13, cursor: "pointer", opacity: busy || delPw.length !== 4 ? 0.5 : 1, fontFamily: "inherit" }}>지우기</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      <footer style={{ padding: "40px 24px 56px", textAlign: "center", fontFamily: SANS, fontSize: 11, color: "#9A8B76", lineHeight: 1.9 }}>
        {slug && !preview && (
          <button type="button" onClick={() => copyAndSay(window.location.href, "청첩장 주소를 복사했어요.")} style={{ ...outlineBtn, padding: "0 22px", borderRadius: 22, marginBottom: 22 }}>청첩장 주소 복사</button>
        )}
        <div style={{ fontFamily: fontDisplay, letterSpacing: "0.2em", color: "#A9647E" }}>WEDDING BUTLER</div>
        <div>웨딩버틀러 모바일 청첩장 · {names}</div>
      </footer>

      {toast && (
        <div role="status" style={{ position: "fixed", left: "50%", bottom: 28, transform: "translateX(-50%)", zIndex: 30, padding: "12px 20px", borderRadius: 22, background: "rgba(51,35,42,0.92)", color: "#FFFFFF", fontSize: 13, fontFamily: SANS, maxWidth: "88vw", textAlign: "center" }}>{toast}</div>
      )}
    </div>
  );
}
