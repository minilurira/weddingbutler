"use client";

import { useCallback, useEffect, useState, type CSSProperties } from "react";
import {
  RECEPT_TEXTS,
  dateLabel,
  daysUntil,
  isPremium,
  isTemplate,
  mapLinks,
  monthCells,
  type InvitationContent,
  type InvitationTemplate,
} from "@/lib/invitation/content";
import { fontDisplay, fontSans, fontSerif } from "@/lib/style";

// 하객이 보는 모바일 청첩장. 에디터 미리보기와 발행본, 소개 페이지의 전체 시안이 같은 컴포넌트를 쓴다.
// preview=true(에디터·시안)에서는 방명록과 사용 기록을 서버에 연결하지 않고 예시 글만 보여 준다.

interface Theme {
  bg: string; ink: string; soft: string; gold: string; accent: string; onAccent: string;
  line: string; sand: string; card: string; radius: number; heading: string;
  receptBg: string; receptFg: string; receptSoft: string; receptBorder: string;
}

const THEMES: Record<InvitationTemplate, Theme> = {
  classic: { bg: "#FBF7F0", ink: "#3A3128", soft: "#6B5E50", gold: "#8A6A43", accent: "#6B5232", onAccent: "#FFFDF8", line: "#CDBDA3", sand: "#F4ECDF", card: "#FFFDF8", radius: 6, heading: fontSerif, receptBg: "#FFFDF8", receptFg: "#3A3128", receptSoft: "#6B5E50", receptBorder: "#CDBDA3" },
  modern: { bg: "#FFFFFF", ink: "#111111", soft: "#555555", gold: "#111111", accent: "#111111", onAccent: "#FFFFFF", line: "#111111", sand: "#F2F2F2", card: "#FFFFFF", radius: 0, heading: fontSans, receptBg: "#F2F2F2", receptFg: "#111111", receptSoft: "#333333", receptBorder: "#F2F2F2" },
  botanical: { bg: "#EEF2EA", ink: "#2C4A3A", soft: "#4A6B58", gold: "#5F7F6B", accent: "#2C4A3A", onAccent: "#EEF2EA", line: "#B9CDB9", sand: "#E3EADD", card: "#F6F9F3", radius: 14, heading: fontSerif, receptBg: "#2C4A3A", receptFg: "#EEF2EA", receptSoft: "#DCE7D8", receptBorder: "#2C4A3A" },
  rose: { bg: "#F8ECEE", ink: "#4A1F2E", soft: "#6B4553", gold: "#8A3A52", accent: "#8A3A52", onAccent: "#FFF6F7", line: "#E0B2BE", sand: "#F1D8DD", card: "#FFF8F9", radius: 12, heading: fontSerif, receptBg: "#8A3A52", receptFg: "#FFF6F7", receptSoft: "#F8DCE3", receptBorder: "#8A3A52" },
};

interface GuestEntry { id: string; name: string; message: string; created_at: string }

const SAMPLE_ENTRIES: GuestEntry[] = [
  { id: "s1", name: "지민", message: "두 사람의 시작을 진심으로 축하해요. 오래오래 행복하세요!", created_at: "" },
  { id: "s2", name: "현우", message: "결혼 축하해! 그날 만나자.", created_at: "" },
];

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

export function InvitationView({ content: c, photoBase, slug, template = "classic", preview = false }: { content: InvitationContent; photoBase: string; slug: string | null; template?: string; preview?: boolean }) {
  const tpl: InvitationTemplate = isTemplate(template) ? template : "classic";
  const T = THEMES[tpl];
  const premium = isPremium(tpl);
  const photoUrl = (path: string) => (path ? `${photoBase}${path}` : "");
  const SANS = "var(--font-sans), sans-serif";

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
  const parkingRows = [["주차장", c.parkingPlace], ["들어오는 길", c.parkingEntrance], ["무료 시간", c.parkingFree], ["만차 시", c.parkingFull]].filter(([, v]) => v);
  const memoRows = [["식사", c.memoMeal], ["셔틀버스", c.memoShuttle], ["포토부스", c.memoPhoto], ["화환", c.memoWreath]].filter(([, v]) => v);
  const [, mm, dd] = c.date ? c.date.split("-") : ["", "", ""];

  const eyebrow: CSSProperties = { textAlign: tpl === "modern" ? "left" : "center", fontFamily: tpl === "rose" ? fontDisplay : SANS, fontSize: tpl === "rose" ? 15 : 11, fontStyle: tpl === "rose" ? "italic" : "normal", letterSpacing: tpl === "rose" ? "0.02em" : "0.3em", color: T.gold, marginBottom: 14, fontWeight: tpl === "modern" ? 500 : 400 };
  const sectionTitle: CSSProperties = { margin: "0 0 22px", textAlign: tpl === "modern" ? "left" : "center", fontSize: 20, fontWeight: tpl === "modern" ? 700 : 400, fontFamily: T.heading };
  const outlineBtn: CSSProperties = { minHeight: 46, border: `1px solid ${tpl === "modern" ? "#D2D2D2" : T.line}`, borderRadius: tpl === "botanical" ? 23 : T.radius, background: T.card, color: tpl === "modern" ? T.ink : T.accent, fontSize: 13, fontWeight: 500, letterSpacing: "0.01em", cursor: "pointer", fontFamily: "inherit" };
  const pad = 28;

  const [toast, setToast] = useState("");
  const say = useCallback((m: string) => {
    setToast(m);
    window.setTimeout(() => setToast(""), 1800);
  }, []);

  // 사용 기록: 하객 화면에서만 보낸다 (실패해도 화면에는 영향이 없다)
  const track = useCallback(
    (kind: string) => {
      if (preview || !slug) return;
      try {
        void fetch(`/api/i/${slug}/event`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ kind }), keepalive: true });
      } catch {
        /* 무시 */
      }
    },
    [preview, slug],
  );
  useEffect(() => {
    track("view");
  }, [track]);

  async function copyAndSay(text: string, ok: string, kind?: string) {
    if (kind) track(kind);
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

  const input: CSSProperties = { height: 46, border: `1px solid ${tpl === "modern" ? "#D8D8D8" : tpl === "classic" ? "#D9CDB8" : T.line}`, borderRadius: T.radius === 0 ? 0 : Math.min(T.radius, 12), padding: "0 14px", fontSize: 15, background: T.card, color: T.ink, boxSizing: "border-box", width: "100%", fontFamily: "inherit" };

  // 표지: 템플릿마다 사진 위에 글자를 올리는 방식이 다르다
  const coverImg = c.cover ? photoUrl(c.cover) : "";
  const coverBase: CSSProperties = { position: "relative", boxSizing: "border-box", textAlign: "center", backgroundSize: "cover", backgroundPosition: "center 25%" };
  const fallback = "linear-gradient(180deg,#D9C9B2 0%,#B9A184 55%,#8E7656 100%)";
  const cover = (() => {
    const hint = !c.cover && preview ? <div style={{ position: "absolute", top: 120, left: 0, right: 0, fontFamily: SANS, fontSize: 13, opacity: 0.9 }}>표지 사진을 올려 주세요</div> : null;
    const nameLine = (<>{c.groom || "신랑"} <span style={{ fontSize: "0.6em", opacity: 0.85 }}>&amp;</span> {c.bride || "신부"}</>);
    if (tpl === "modern") {
      return (
        <section aria-label="표지" style={{ ...coverBase, minHeight: 780, display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "92px 28px 40px", color: "#FFFFFF", textAlign: "left", backgroundColor: "#111111", backgroundImage: coverImg ? `linear-gradient(180deg,rgba(0,0,0,0.45) 0%,rgba(0,0,0,0) 28%,rgba(0,0,0,0) 45%,rgba(0,0,0,0.78) 100%),url(${coverImg})` : "linear-gradient(180deg,#2A2A2A,#111111)" }}>
          {hint}
          <div style={{ fontFamily: SANS, fontSize: 11, letterSpacing: "0.34em", fontWeight: 500 }}>WE ARE GETTING MARRIED</div>
          <div>
            {mm && <div style={{ fontFamily: SANS, fontSize: 112, lineHeight: 0.95, fontWeight: 900, letterSpacing: "-0.04em" }}>{mm}<br />{dd}</div>}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 12, marginTop: 24, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.6)", fontFamily: SANS, fontSize: 13, lineHeight: 1.8 }}>
              <div><b style={{ fontWeight: 700 }}>{c.groom || "신랑"} &amp; {c.bride || "신부"}</b><br />{label || "예식 날짜를 입력해 주세요"}</div>
              <div style={{ textAlign: "right" }}>{c.venue}{c.hall && (<><br />{c.hall}</>)}</div>
            </div>
          </div>
        </section>
      );
    }
    if (tpl === "botanical") {
      return (
        <section aria-label="표지" style={{ ...coverBase, minHeight: 800, display: "flex", flexDirection: "column", justifyContent: "flex-end", alignItems: "center", padding: "0 28px 56px", color: T.ink, backgroundColor: T.bg, backgroundPosition: "center 20%", backgroundImage: coverImg ? `linear-gradient(180deg,rgba(238,242,234,0) 0%,rgba(238,242,234,0) 55%,rgba(238,242,234,0.85) 76%,${T.bg} 90%),url(${coverImg})` : "linear-gradient(180deg,#B7C9B5,#EEF2EA)" }}>
          {hint}
          <div style={{ fontFamily: SANS, fontSize: 11, letterSpacing: "0.34em", color: T.soft }}>SAVE THE DATE</div>
          <h1 style={{ margin: "14px 0 8px", fontFamily: fontSerif, fontSize: 34, fontWeight: 400, letterSpacing: "0.1em" }}>{[c.groom || "신랑", c.bride || "신부"].join(" · ")}</h1>
          <div style={{ fontSize: 15, lineHeight: 1.9, color: T.soft }}>{label || "예식 날짜를 입력해 주세요"}{place && (<><br />{place}</>)}</div>
        </section>
      );
    }
    if (tpl === "rose") {
      return (
        <section aria-label="표지" style={{ ...coverBase, minHeight: 800, display: "flex", flexDirection: "column", justifyContent: "flex-end", alignItems: "center", padding: "0 28px 52px", color: "#FFF6F7", backgroundColor: "#8A3A52", backgroundPosition: "center 18%", backgroundImage: coverImg ? `linear-gradient(180deg,rgba(74,31,46,0) 0%,rgba(74,31,46,0) 45%,rgba(74,31,46,0.72) 82%,rgba(74,31,46,0.86) 100%),url(${coverImg})` : "linear-gradient(180deg,#E7BCC6,#8A3A52)" }}>
          {hint}
          <div style={{ fontFamily: fontDisplay, fontStyle: "italic", fontSize: 16, color: "#F8DCE3" }}>We are getting married</div>
          <h1 style={{ margin: "10px 0 0", fontFamily: fontSerif, fontWeight: 400, fontSize: 40, lineHeight: 1.15, letterSpacing: "0.04em" }}>{nameLine}</h1>
          <div style={{ marginTop: 20, fontSize: 15, lineHeight: 1.9, letterSpacing: "0.04em" }}>{label || "예식 날짜를 입력해 주세요"}{place && (<><br />{place}</>)}</div>
        </section>
      );
    }
    return (
      <section aria-label="표지" style={{ ...coverBase, minHeight: 760, display: "flex", flexDirection: "column", justifyContent: "flex-end", alignItems: "center", padding: "0 32px 72px", color: "#FFFDF8", backgroundColor: "#8E7656", backgroundImage: coverImg ? `linear-gradient(180deg, rgba(40,30,20,0) 38%, rgba(40,30,20,0.72) 100%), url(${coverImg})` : fallback }}>
        {hint}
        <div style={{ fontFamily: SANS, fontSize: 12, letterSpacing: "0.36em", marginBottom: 22 }}>WEDDING INVITATION</div>
        <div style={{ fontSize: 36, fontWeight: 300, letterSpacing: "0.1em", lineHeight: 1.3 }}>{nameLine}</div>
        <div style={{ width: 36, height: 1, background: "#FFFDF8", opacity: 0.7, margin: "26px 0" }} />
        <div style={{ fontSize: 15, lineHeight: 1.9, letterSpacing: "0.04em" }}>{label || "예식 날짜를 입력해 주세요"}{place && (<><br />{place}</>)}</div>
      </section>
    );
  })();

  const infoCard = (title: string, rows: string[][], eyebrowText: string) => (
    <section style={{ padding: `8px ${pad}px 56px` }}>
      <div style={eyebrow}>{eyebrowText}</div>
      <h2 style={sectionTitle}>{title}</h2>
      <div style={{ border: `1px solid ${tpl === "modern" ? "#E2E2E2" : T.line}`, borderRadius: T.radius, background: T.card, fontFamily: SANS, fontSize: 13, lineHeight: 1.75, overflow: "hidden" }}>
        {rows.map(([k, v], i) => (
          <div key={k} style={{ display: "flex", gap: 14, padding: "14px 16px", borderTop: i ? `1px solid ${tpl === "modern" ? "#EDEDED" : T.line}` : "none" }}>
            <div style={{ flex: "0 0 74px", fontWeight: 700, color: T.accent }}>{k}</div>
            <div style={{ flex: 1, minWidth: 0, color: T.soft, wordBreak: "keep-all" }}>{v}</div>
          </div>
        ))}
      </div>
    </section>
  );

  return (
    <div style={{ position: "relative", width: "100%", maxWidth: 480, margin: "0 auto", background: T.bg, color: T.ink, fontFamily: T.heading, overflow: "hidden" }}>
      {cover}

      {/* 인사말 */}
      <section style={{ padding: "72px 36px 64px", textAlign: tpl === "modern" ? "left" : "center", background: tpl === "botanical" ? T.sand : undefined }}>
        <div style={eyebrow}>{tpl === "modern" ? "01 — INVITATION" : tpl === "rose" ? "Invitation" : "INVITATION"}</div>
        <h2 style={{ margin: "0 0 28px", fontSize: tpl === "modern" ? 26 : 22, fontWeight: tpl === "modern" ? 700 : 400, letterSpacing: "0.02em", lineHeight: 1.5 }}>{c.title || "소중한 분들을 초대합니다"}</h2>
        <p style={{ margin: 0, fontSize: 15, lineHeight: 2.1, fontWeight: 300, whiteSpace: "pre-line", color: tpl === "modern" ? "#333333" : T.ink }}>{c.greeting}</p>
        {(groomParents || brideParents) && (
          <div style={{ marginTop: 36, fontSize: 14, lineHeight: 2, fontWeight: 300, color: T.soft, ...(tpl === "modern" ? { paddingTop: 22, borderTop: `1px solid ${T.ink}` } : {}) }}>
            {groomParents && <div>{groomParents} 의 아들 <b style={{ fontWeight: 600, color: T.ink }}>{c.groom}</b></div>}
            {brideParents && <div>{brideParents} 의 딸 <b style={{ fontWeight: 600, color: T.ink }}>{c.bride}</b></div>}
          </div>
        )}
      </section>

      {/* 예식 안내: 달력과 D-day */}
      {(c.showCalendar || c.showDday) && cal && (
        <section style={{ padding: "56px 28px 60px", background: tpl === "modern" ? "#111111" : T.sand, color: tpl === "modern" ? "#FFFFFF" : T.ink, textAlign: "center" }}>
          <div style={{ ...eyebrow, textAlign: "center", color: tpl === "modern" ? "#D8D8D8" : T.gold }}>WEDDING DAY</div>
          <div style={{ fontSize: tpl === "modern" ? 26 : 19, fontWeight: tpl === "modern" ? 900 : 400, letterSpacing: "0.03em", marginBottom: 6 }}>{label}</div>
          {c.showCalendar && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, minmax(0,1fr))", rowGap: 6, fontFamily: SANS, fontSize: 13, marginTop: 24 }}>
              {["일", "월", "화", "수", "목", "금", "토"].map((w, i) => (
                <div key={w} style={{ padding: "6px 0", fontSize: 11, color: i === 0 ? (tpl === "modern" ? "#FF9C8F" : "#B25B4B") : tpl === "modern" ? "#BDBDBD" : T.soft }}>{w}</div>
              ))}
              {cal.cells.map((d, i) => (
                <div key={i} style={{ height: 38, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {d > 0 && (
                    <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 34, height: 34, borderRadius: tpl === "modern" ? 0 : 17, background: d === cal.day ? (tpl === "modern" ? "#FFFFFF" : T.accent) : "transparent", color: d === cal.day ? (tpl === "modern" ? "#111111" : T.onAccent) : i % 7 === 0 ? (tpl === "modern" ? "#FF9C8F" : "#B25B4B") : "inherit", fontWeight: d === cal.day ? 700 : 400 }}>{d}</span>
                  )}
                </div>
              ))}
            </div>
          )}
          {c.showDday && dday !== null && (
            <div style={{ marginTop: 26, fontSize: 14, color: tpl === "modern" ? "#D8D8D8" : T.accent }}>
              {dday > 0 ? <>결혼식까지 <b style={{ fontSize: 18, color: tpl === "modern" ? "#FFFFFF" : T.accent }}>D-{dday}</b></> : dday === 0 ? <b style={{ fontSize: 18 }}>오늘 결혼합니다</b> : <>두 사람의 결혼식이 <b>{-dday}일 전</b>에 있었어요</>}
            </div>
          )}
        </section>
      )}

      {/* 오시는 길 */}
      {(c.venue || c.address || links.length > 0 || c.traffic) && (
        <section style={{ padding: "64px 28px 56px" }}>
          <div style={eyebrow}>{tpl === "modern" ? "03 — LOCATION" : tpl === "rose" ? "Location" : "LOCATION"}</div>
          <h2 style={{ ...sectionTitle, marginBottom: 6 }}>{place || "예식장"}</h2>
          {c.address && <p style={{ margin: "0 0 22px", textAlign: tpl === "modern" ? "left" : "center", fontSize: 13, color: T.soft, fontWeight: 300 }}>{c.address}</p>}
          {links.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: `repeat(${links.length}, minmax(0,1fr))`, gap: 8 }}>
              {links.map((l) => (
                <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer" onClick={() => track("map")} style={{ ...outlineBtn, display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none" }}>{l.label}<span aria-hidden="true" style={{ marginLeft: 4, fontSize: 11, opacity: 0.5 }}>↗</span></a>
              ))}
            </div>
          )}
          {c.address && (
            <button type="button" onClick={() => copyAndSay(c.address, "주소를 복사했어요.", "copy_address")} style={{ ...outlineBtn, width: "100%", marginTop: 8 }}>주소 복사</button>
          )}
          {c.traffic && <div style={{ marginTop: 22, fontSize: 13, lineHeight: 1.9, color: T.soft, fontWeight: 300, whiteSpace: "pre-line" }}>{c.traffic}</div>}
        </section>
      )}

      {/* 프리미엄: 주차 안내 · 예식장 메모 */}
      {premium && parkingRows.length > 0 && infoCard("주차 안내", parkingRows, tpl === "modern" ? "PARKING" : tpl === "rose" ? "Parking" : "PARKING")}
      {premium && memoRows.length > 0 && infoCard("예식장 메모", memoRows, tpl === "modern" ? "NOTE" : tpl === "rose" ? "Good to know" : "NOTE")}

      {/* 갤러리: 2열 */}
      {c.gallery.length > 0 && (
        <section style={{ padding: "56px 4px", background: tpl === "modern" || tpl === "botanical" ? "transparent" : T.sand }}>
          <div style={{ ...eyebrow, padding: tpl === "modern" ? "0 24px" : 0 }}>{tpl === "modern" ? "04 — GALLERY" : tpl === "rose" ? "Gallery" : "GALLERY"}</div>
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
        <section style={{ padding: "60px 28px 48px", textAlign: tpl === "modern" ? "left" : "center", background: tpl === "botanical" ? T.sand : undefined }}>
          <div style={eyebrow}>{tpl === "modern" ? "05 — GIFT" : tpl === "rose" ? "With love" : "GIFT"}</div>
          <h2 style={sectionTitle}>마음 전하실 곳</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, textAlign: "left", fontFamily: SANS }}>
            {accounts.map((a, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 16px", border: `1px solid ${tpl === "modern" ? T.ink : tpl === "classic" ? "#E1D5C0" : T.line}`, borderRadius: T.radius, background: T.card }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, color: T.soft }}>{[a.who, a.holder].filter(Boolean).join(" · ")}</div>
                  <div style={{ fontSize: 14, marginTop: 2, wordBreak: "break-all", fontWeight: tpl === "modern" ? 500 : 400 }}>{[a.bank, a.number].filter(Boolean).join(" ")}</div>
                </div>
                <button type="button" onClick={() => copyAndSay(a.number, "계좌번호를 복사했어요.", "copy_account")} style={{ minHeight: 44, minWidth: 56, padding: "0 14px", border: 0, borderRadius: tpl === "modern" ? 0 : tpl === "classic" ? 6 : 22, background: tpl === "classic" ? "#EDE2CF" : T.accent, color: tpl === "classic" ? T.accent : T.onAccent, fontSize: 12, fontWeight: 500, cursor: "pointer", fontFamily: "inherit" }}>복사</button>
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
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", border: `1px solid ${tpl === "modern" ? T.ink : tpl === "classic" ? "#E1D5C0" : T.line}`, borderRadius: T.radius, background: T.card }}>
                <span style={{ flex: 1, textAlign: "left", fontSize: 14 }}>{x.label}</span>
                <a href={`tel:${x.phone}`} onClick={() => track("call")} style={{ ...outlineBtn, display: "flex", alignItems: "center", padding: "0 14px", textDecoration: "none" }}>전화</a>
                <a href={`sms:${x.phone}`} onClick={() => track("sms")} style={{ ...outlineBtn, display: "flex", alignItems: "center", padding: "0 14px", textDecoration: "none" }}>문자</a>
                {x.kakao && <a href={x.kakao} target="_blank" rel="noopener noreferrer" style={{ ...outlineBtn, display: "flex", alignItems: "center", padding: "0 14px", textDecoration: "none" }}>카카오톡</a>}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 축의 접수 안내: 항상 표시 */}
      <section style={{ margin: "0 20px", padding: "36px 24px 32px", border: `1px solid ${T.receptBorder}`, borderRadius: tpl === "botanical" ? 20 : tpl === "rose" ? 16 : tpl === "modern" ? 0 : 10, textAlign: tpl === "modern" ? "left" : "center", background: T.receptBg, color: T.receptFg }}>
        <div style={{ ...eyebrow, color: tpl === "botanical" ? "#B9CDB9" : tpl === "rose" ? "#F1C9D3" : tpl === "modern" ? T.receptFg : T.gold, textAlign: tpl === "modern" ? "left" : "center" }}>{tpl === "modern" ? "06 — GIFT RECEPTION" : tpl === "rose" ? "Gift reception" : "GIFT RECEPTION"}</div>
        <h2 style={{ margin: "0 0 14px", fontSize: 18, fontWeight: tpl === "modern" ? 700 : 400, lineHeight: 1.6, fontFamily: T.heading }}>축의 접수는<br />웨딩버틀러가 함께합니다</h2>
        <p style={{ margin: "0 0 22px", fontSize: 13, lineHeight: 1.95, color: T.receptSoft, fontWeight: 300, whiteSpace: "pre-line" }}>{RECEPT_TEXTS[c.receptStyle] ?? RECEPT_TEXTS[0]}</p>
        <a href="https://weddingbutler.co.kr" target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", minHeight: 44, padding: "0 22px", borderRadius: tpl === "modern" ? 0 : 22, background: tpl === "classic" ? T.accent : tpl === "modern" ? "#111111" : T.bg, color: tpl === "classic" ? T.onAccent : tpl === "modern" ? "#FFFFFF" : T.receptBg, fontFamily: SANS, fontSize: 13, fontWeight: 500, textDecoration: "none" }}>웨딩버틀러 알아보기</a>
      </section>

      {/* 방명록 */}
      {c.guestbook && (
        <section style={{ padding: "64px 24px 40px" }}>
          <div style={eyebrow}>{tpl === "modern" ? "07 — GUESTBOOK" : tpl === "rose" ? "Guestbook" : "GUESTBOOK"}</div>
          <h2 style={sectionTitle}>축하의 한마디</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, fontFamily: SANS }}>
            <label htmlFor="gbName" style={{ fontSize: 12, color: T.soft }}>이름</label>
            <input id="gbName" value={gName} onChange={(e) => setGName(e.target.value.slice(0, 20))} placeholder="이름" style={input} />
            <label htmlFor="gbMsg" style={{ fontSize: 12, color: T.soft }}>메시지</label>
            <textarea id="gbMsg" value={gMsg} onChange={(e) => setGMsg(e.target.value.slice(0, 300))} placeholder="두 사람에게 전하고 싶은 말을 남겨 주세요" style={{ ...input, height: 96, padding: "12px 14px", resize: "none" }} />
            <label htmlFor="gbPw" style={{ fontSize: 12, color: T.soft }}>비밀번호 (숫자 4자리)</label>
            <input id="gbPw" type="password" inputMode="numeric" maxLength={4} value={gPw} onChange={(e) => setGPw(e.target.value.replace(/\D/g, "").slice(0, 4))} placeholder="내 글을 지울 때 필요해요" style={input} />
            {gErr && <div role="alert" style={{ fontSize: 12, color: "#B25B4B" }}>{gErr}</div>}
            <div style={{ fontSize: 11, lineHeight: 1.6, color: T.soft }}>욕설·광고는 등록되지 않고, 신랑·신부가 부적절한 글을 지울 수 있어요.</div>
            <button type="button" disabled={busy} onClick={submitEntry} style={{ minHeight: 48, border: 0, borderRadius: tpl === "modern" ? 0 : tpl === "classic" ? 6 : 25, background: T.accent, color: T.onAccent, fontSize: 14, fontWeight: 500, cursor: "pointer", opacity: busy ? 0.6 : 1, fontFamily: "inherit" }}>방명록 남기기</button>
          </div>
          <div style={{ marginTop: 26, display: "flex", flexDirection: "column", gap: 12, fontFamily: SANS }}>
            {entries.length === 0 && <div style={{ textAlign: "center", fontSize: 13, color: T.soft }}>첫 번째 축하 글을 남겨 보세요.</div>}
            {entries.map((e) => (
              <div key={e.id} style={{ padding: 16, borderRadius: Math.min(T.radius, 12), background: T.sand }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12, color: T.soft }}>
                  <b style={{ fontWeight: 700, color: T.ink }}>{e.name}</b>
                  <span>
                    {ago(e.created_at)}
                    {!preview && (
                      <button type="button" onClick={() => { setDelId(delId === e.id ? "" : e.id); setDelPw(""); }} aria-label={`${e.name} 님 글 삭제`} style={{ marginLeft: 6, minHeight: 44, padding: "0 8px", border: 0, background: "transparent", color: "#B25B4B", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>삭제</button>
                    )}
                  </span>
                </div>
                <p style={{ margin: "8px 0 0", fontSize: 14, lineHeight: 1.7, whiteSpace: "pre-line", wordBreak: "break-word", color: T.ink }}>{e.message}</p>
                {delId === e.id && (
                  <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                    <input type="password" inputMode="numeric" maxLength={4} aria-label="비밀번호 4자리" value={delPw} onChange={(ev) => setDelPw(ev.target.value.replace(/\D/g, "").slice(0, 4))} placeholder="비밀번호 4자리" style={{ ...input, height: 44, flex: 1 }} />
                    <button type="button" disabled={busy || delPw.length !== 4} onClick={() => removeEntry(e.id)} style={{ minHeight: 44, padding: "0 16px", border: 0, borderRadius: Math.min(T.radius, 8), background: "#B25B4B", color: "#FFFFFF", fontSize: 13, cursor: "pointer", opacity: busy || delPw.length !== 4 ? 0.5 : 1, fontFamily: "inherit" }}>지우기</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      <footer style={{ padding: "40px 24px 56px", textAlign: "center", fontFamily: SANS, fontSize: 11, color: T.soft, lineHeight: 1.9 }}>
        {slug && !preview && (
          <button type="button" onClick={() => copyAndSay(window.location.href, "청첩장 주소를 복사했어요.", "copy_url")} style={{ ...outlineBtn, padding: "0 22px", borderRadius: tpl === "modern" ? 0 : 22 }}>청첩장 주소 복사</button>
        )}
        {/* 무료·프리미엄 모두 웨딩버틀러를 표시한다: 축의대행과 모바일 청첩장은 웨딩버틀러에 */}
        <div style={{ marginTop: 22 }}>
          <div style={{ fontFamily: fontDisplay, letterSpacing: "0.2em", color: "#A9647E" }}>WEDDING BUTLER</div>
          <div>웨딩버틀러 모바일 청첩장 · {names}</div>
          <div style={{ marginTop: 6 }}>축의대행과 모바일 청첩장은 <a href="https://weddingbutler.co.kr" target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "underline" }}>웨딩버틀러</a>에 맡겨 보세요.</div>
          {slug && !preview && <div style={{ marginTop: 14 }}><a href="/invitation/new" style={{ color: "inherit", opacity: 0.75, textDecoration: "underline" }}>청첩장을 만드셨나요? 내 청첩장 관리</a></div>}
        </div>
      </footer>

      {toast && (
        <div role="status" style={{ position: "fixed", left: "50%", bottom: 28, transform: "translateX(-50%)", zIndex: 30, padding: "12px 20px", borderRadius: 22, background: "rgba(51,35,42,0.92)", color: "#FFFFFF", fontSize: 13, fontFamily: SANS, maxWidth: "88vw", textAlign: "center" }}>{toast}</div>
      )}
    </div>
  );
}
