"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type CSSProperties, type DragEvent, type ReactNode } from "react";
import { InvitationView } from "@/components/invitation/InvitationView";
import {
  ACCOUNT_MAX,
  GREETINGS,
  RECEPT_LABELS,
  INVITATION_TEMPLATES,
  PREMIUM_PRICE,
  TEMPLATE_INFO,
  TITLES,
  dateLabel,
  galleryMax,
  isPremium,
  missingForPublish,
  type InvitationTemplate,
  type InvitationAccount,
  type InvitationContent,
} from "@/lib/invitation/content";
import { resizeToJpeg } from "@/lib/invitation/resize";
import { requestDepositPayment } from "@/lib/portone-client";
import { fontSerif } from "@/lib/style";

type Status = "draft" | "published" | "hidden";
interface GuestEntry { id: string; name: string; message: string; created_at: string }

const ACCENT = "#A9647E";
const DARK = "#33232A";
const BORDER = "#E7D5DA";
const input: CSSProperties = { width: "100%", height: 48, boxSizing: "border-box", border: "1px solid #DCC4CC", borderRadius: 12, padding: "0 14px", fontSize: 15, color: DARK, background: "#FFFFFF", fontFamily: "inherit" };
const area: CSSProperties = { ...input, height: "auto", padding: "12px 14px", lineHeight: 1.8, resize: "vertical" };
const chipBase: CSSProperties = { minHeight: 44, padding: "0 14px", borderRadius: 22, fontSize: 13, cursor: "pointer", color: DARK, fontFamily: "inherit" };
const chip = (on: boolean): CSSProperties => ({ ...chipBase, border: on ? `2px solid ${ACCENT}` : "1px solid #DCC4CC", background: on ? "#F9EFF2" : "#FFFFFF" });
const ghost: CSSProperties = { minHeight: 44, padding: "0 18px", borderRadius: 22, border: "1px solid #DCC4CC", background: "#FFFFFF", color: "#473A3F", fontSize: 14, fontWeight: 500, cursor: "pointer", fontFamily: "inherit" };

function Card({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <section style={{ background: "#FFFFFF", border: `1px solid ${BORDER}`, borderRadius: 18, padding: "22px 24px", marginBottom: 16 }}>
      <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>{title}</h2>
      {hint && <p style={{ margin: "4px 0 0", fontSize: 13, lineHeight: 1.6, color: "#6B5A60" }}>{hint}</p>}
      <div style={{ marginTop: 16 }}>{children}</div>
    </section>
  );
}

function Field({ id, label, children }: { id: string; label: string; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={id} style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#473A3F", marginBottom: 6 }}>{label}</label>
      {children}
    </div>
  );
}

function Switch({ on, label, onChange }: { on: boolean; label: string; onChange: (v: boolean) => void }) {
  return (
    <button type="button" role="switch" aria-checked={on} aria-label={label} onClick={() => onChange(!on)} style={{ width: 52, height: 44, border: 0, background: "transparent", cursor: "pointer", padding: 0 }}>
      <span style={{ display: "block", width: 44, height: 26, borderRadius: 13, background: on ? ACCENT : "#CDBDC2", position: "relative", margin: "0 auto" }}>
        <span style={{ position: "absolute", top: 3, left: on ? 21 : 3, width: 20, height: 20, borderRadius: 10, background: "#FFFFFF" }} />
      </span>
    </button>
  );
}

export function InvitationEditor({ id }: { id: string }) {
  const [content, setContent] = useState<InvitationContent | null>(null);
  const [status, setStatus] = useState<Status>("draft");
  const [template, setTemplateState] = useState<InvitationTemplate>("classic");
  const [paid, setPaid] = useState(false);
  const [paying, setPaying] = useState(false);
  const [url, setUrl] = useState("");
  const [loadErr, setLoadErr] = useState("");
  const [saveState, setSaveState] = useState<"saved" | "saving" | "error">("saved");
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(0);
  const [msg, setMsg] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [done, setDone] = useState(false);
  const [copied, setCopied] = useState(false);
  const [entries, setEntries] = useState<GuestEntry[] | null>(null);
  const dirty = useRef(false);
  const timer = useRef<number | null>(null);
  const latest = useRef<InvitationContent | null>(null);
  const coverInput = useRef<HTMLInputElement>(null);
  const galleryInput = useRef<HTMLInputElement>(null);

  const photoBase = `${(process.env.NEXT_PUBLIC_SUPABASE_URL || "").replace(/\/$/, "")}/storage/v1/object/public/invitation-photos/`;
  const photoUrl = useCallback((path: string) => `${photoBase}${path}`, [photoBase]);

  // 불러오기
  useEffect(() => {
    (async () => {
      const r = await fetch(`/api/invitation/${id}`, { cache: "no-store" }).catch(() => null);
      if (!r) return setLoadErr("불러오지 못했어요. 잠시 뒤에 다시 시도해 주세요.");
      if (r.status === 401) return void (window.location.href = "/invitation/new");
      if (!r.ok) return setLoadErr("이 청첩장을 찾을 수 없어요.");
      const d = (await r.json()) as { status: Status; url: string; template: InvitationTemplate; paid: boolean; content: InvitationContent };
      latest.current = d.content;
      setContent(d.content);
      setStatus(d.status);
      setUrl(d.url);
      setTemplateState(d.template);
      setPaid(d.paid);
      // 모바일 결제창에서 돌아온 경우: 주소의 paymentId로 결제를 확인하고 이어서 발행한다
      const q = new URLSearchParams(window.location.search);
      const pid = q.get("paymentId");
      if (pid) {
        window.history.replaceState(null, "", window.location.pathname);
        if (q.get("code")) setMsg(q.get("message") || "결제가 완료되지 않았어요. 다시 시도해 주세요.");
        else void confirmAndPublish(pid);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // 자동 저장: 마지막 입력 뒤 0.8초 (저장이 끝나기 전에 또 바뀌면 다시 저장)
  const flush = useCallback(async (): Promise<boolean> => {
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = null;
    if (!dirty.current || !latest.current) return true;
    dirty.current = false;
    setSaveState("saving");
    const r = await fetch(`/api/invitation/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ content: latest.current }) }).catch(() => null);
    if (!r || !r.ok) {
      dirty.current = true;
      setSaveState("error");
      return false;
    }
    setSaveState(dirty.current ? "saving" : "saved");
    return true;
  }, [id]);

  const update = useCallback(
    (patch: Partial<InvitationContent>) => {
      setContent((prev) => {
        if (!prev) return prev;
        const next = { ...prev, ...patch };
        latest.current = next;
        dirty.current = true;
        setSaveState("saving");
        if (timer.current) window.clearTimeout(timer.current);
        timer.current = window.setTimeout(() => void flush(), 800);
        return next;
      });
    },
    [flush],
  );

  // 창을 닫기 전에 저장 안 된 게 있으면 알린다
  useEffect(() => {
    const onLeave = (e: BeforeUnloadEvent) => {
      if (dirty.current) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", onLeave);
    return () => window.removeEventListener("beforeunload", onLeave);
  }, []);

  // 사진 올리기 (브라우저에서 줄인 뒤 한 장씩)
  async function uploadFiles(files: File[], target: "cover" | "gallery") {
    if (!content || files.length === 0) return;
    setMsg("");
    const max = galleryMax(template);
    const room = target === "cover" ? 1 : max - content.gallery.length;
    if (room <= 0) return setMsg(isPremium(template) ? `갤러리 사진은 ${max}장까지 올릴 수 있어요.` : `무료 템플릿은 갤러리 사진을 ${max}장까지 올릴 수 있어요. 프리미엄 템플릿은 ${galleryMax("modern")}장까지 올릴 수 있어요.`);
    const picked = files.slice(0, room);
    if (files.length > room) setMsg(`${max}장까지만 올릴 수 있어서 ${picked.length}장만 올렸어요.`);
    const added: string[] = [];
    for (const f of picked) {
      setUploading((n) => n + 1);
      try {
        const blob = await resizeToJpeg(f);
        const r = await fetch(`/api/invitation/${id}/photo`, { method: "POST", headers: { "Content-Type": "image/jpeg" }, body: blob });
        const d = (await r.json().catch(() => ({}))) as { path?: string; error?: string };
        if (!r.ok || !d.path) {
          setMsg(d.error === "photo_limit" ? "올린 사진이 너무 많아요. 안 쓰는 사진을 빼 주세요." : "사진을 올리지 못했어요. 다시 시도해 주세요.");
          continue;
        }
        added.push(d.path);
      } catch {
        setMsg("이 파일은 사진으로 열 수 없어요. JPG, PNG, WEBP 사진을 올려 주세요.");
      } finally {
        setUploading((n) => n - 1);
      }
    }
    if (added.length === 0) return;
    const cur = latest.current ?? content;
    if (target === "cover") update({ cover: added[0] });
    else update({ gallery: [...cur.gallery, ...added].slice(0, max) });
  }

  const onDrop = (target: "cover" | "gallery") => (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    void uploadFiles(Array.from(e.dataTransfer.files), target);
  };
  const dragProps = (target: "cover" | "gallery") => ({
    onDragOver: (e: DragEvent) => { e.preventDefault(); setDragging(true); },
    onDragLeave: () => setDragging(false),
    onDrop: onDrop(target),
  });

  // 발행: 프리미엄은 결제를 먼저 한다. 빠진 항목이 있으면 결제하기 전에 알려 준다.
  async function publish() {
    setMsg("");
    if (!(await flush())) return setMsg("저장하지 못했어요. 인터넷 연결을 확인해 주세요.");
    if (isPremium(template) && !paid) {
      const miss = missingForPublish(latest.current ?? content!);
      if (miss.length) return setMsg(`발행하려면 ${miss.join(", ")}을(를) 먼저 입력해 주세요.`);
      return startPayment();
    }
    await doPublish();
  }

  async function doPublish() {
    const r = await fetch(`/api/invitation/${id}/publish`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "publish" }) });
    const d = (await r.json().catch(() => ({}))) as { error?: string; missing?: string[]; url?: string };
    if (r.status === 400 && d.missing) return setMsg(`발행하려면 ${d.missing.join(", ")}을(를) 먼저 입력해 주세요.`);
    if (r.status === 402) return setMsg("프리미엄 템플릿은 결제 후에 발행할 수 있어요.");
    if (!r.ok) return setMsg("발행하지 못했어요. 잠시 뒤에 다시 시도해 주세요.");
    setStatus("published");
    if (d.url) setUrl(d.url);
    setCopied(false);
    setDone(true);
  }

  async function startPayment() {
    setPaying(true);
    try {
      const r = await fetch(`/api/invitation/${id}/order`, { method: "POST" });
      const d = (await r.json().catch(() => ({}))) as { paid?: boolean; paymentId?: string; amount?: number; orderName?: string; phone?: string };
      if (d.paid) {
        setPaid(true);
        return await doPublish();
      }
      if (!r.ok || !d.paymentId || !d.amount) return setMsg("결제를 시작하지 못했어요. 잠시 뒤에 다시 시도해 주세요.");
      const res = await requestDepositPayment({
        paymentId: d.paymentId,
        orderName: d.orderName ?? "모바일 청첩장 프리미엄",
        amount: d.amount,
        payMethod: "신용카드",
        customerName: [latest.current?.groom, latest.current?.bride].filter(Boolean).join(" ") || "청첩장",
        customerPhone: d.phone ?? "",
        customerEmail: "",
        redirectUrl: `${window.location.origin}/invitation/edit/${id}`,
      });
      if (!res.ok) return setMsg(res.message ?? "결제가 취소되었어요.");
      await confirmAndPublish(d.paymentId);
    } finally {
      setPaying(false);
    }
  }

  // 서버가 포트원에 직접 확인한 뒤에만 결제 완료로 처리한다
  async function confirmAndPublish(paymentId: string) {
    const r = await fetch(`/api/invitation/${id}/pay`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ paymentId }) });
    if (!r.ok) return setMsg("결제 확인에 실패했어요. 결제가 되었다면 잠시 뒤 '발행하기'를 다시 눌러 주세요. 중복 결제는 되지 않아요.");
    setPaid(true);
    await doPublish();
  }

  async function changeTemplate(next: InvitationTemplate) {
    if (next === template) return;
    if (!(await flush())) return setMsg("저장하지 못했어요. 인터넷 연결을 확인해 주세요.");
    const r = await fetch(`/api/invitation/${id}/template`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ template: next }) });
    const d = (await r.json().catch(() => ({}))) as { content?: InvitationContent };
    if (!r.ok || !d.content) return setMsg("템플릿을 바꾸지 못했어요. 잠시 뒤에 다시 시도해 주세요.");
    latest.current = d.content;
    setContent(d.content);
    setTemplateState(next);
    setMsg(isPremium(template) && !isPremium(next) && d.content.gallery.length < (content?.gallery.length ?? 0) ? "무료 템플릿은 갤러리 사진이 12장까지라 나머지는 뺐어요." : "");
  }

  async function hide() {
    if (!window.confirm("비공개로 바꾸면 주소로 들어와도 청첩장이 보이지 않아요. 다시 발행하면 같은 주소로 열려요. 바꿀까요?")) return;
    const r = await fetch(`/api/invitation/${id}/publish`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "hide" }) });
    if (r.ok) setStatus("hidden");
    else setMsg("바꾸지 못했어요. 잠시 뒤에 다시 시도해 주세요.");
  }

  async function copyUrl() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      window.prompt("주소를 길게 눌러 복사해 주세요", url);
    }
  }

  async function removeInvitation() {
    if (!window.confirm("이 청첩장을 지울까요? 올린 사진과 방명록도 모두 지워지고 되돌릴 수 없어요.")) return;
    const r = await fetch(`/api/invitation/${id}`, { method: "DELETE" });
    if (r.ok) window.location.href = "/invitation/new";
    else setMsg("지우지 못했어요. 잠시 뒤에 다시 시도해 주세요.");
  }

  async function loadEntries() {
    const r = await fetch(`/api/invitation/${id}/guestbook`, { cache: "no-store" }).catch(() => null);
    if (r && r.ok) setEntries(((await r.json()) as { entries: GuestEntry[] }).entries);
  }
  async function deleteEntry(entryId: string) {
    const r = await fetch(`/api/invitation/${id}/guestbook`, { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ entryId }) });
    if (r.ok) setEntries((prev) => (prev ? prev.filter((e) => e.id !== entryId) : prev));
  }

  if (loadErr) return <main style={{ padding: 60, textAlign: "center" }}><p>{loadErr}</p><Link href="/invitation/new" style={{ color: ACCENT }}>내 청첩장으로 돌아가기</Link></main>;
  if (!content) return <main style={{ padding: 60, textAlign: "center", color: "#6B5A60" }}>불러오는 중…</main>;
  const c = content;
  const missing = missingForPublish(c);
  const setAccount = (i: number, patch: Partial<InvitationAccount>) => update({ accounts: c.accounts.map((a, j) => (j === i ? { ...a, ...patch } : a)) });
  const photoBox = (over: boolean): CSSProperties => ({ border: `2px dashed ${over ? ACCENT : "#DCC4CC"}`, borderRadius: 14, background: over ? "#F9EFF2" : "#FBF6F7", padding: 16, textAlign: "center" });
  const saveLabel = saveState === "saving" ? "저장 중…" : saveState === "error" ? "저장 실패 · 다시 시도 중" : "자동 저장됨";

  const preview = <InvitationView content={c} photoBase={photoBase} slug={null} template={template} preview />;

  return (
    <div style={{ background: "#F3E9EB", minHeight: "100vh", color: DARK }}>
      {/* 상단 바 */}
      <header style={{ position: "sticky", top: 0, zIndex: 40, background: "#FFFFFF", borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", display: "flex", alignItems: "center", gap: 10, padding: "10px clamp(14px,3vw,24px)", flexWrap: "wrap" }}>
          <Link href="/invitation/new" style={{ fontSize: 14, color: "#6B5A60", minHeight: 44, display: "inline-flex", alignItems: "center" }}>← 내 청첩장</Link>
          <span style={{ fontSize: 12, color: saveState === "error" ? "#B03A52" : "#9A8189" }}>{saveLabel}</span>
          <span style={{ marginLeft: "auto", fontSize: 12, fontWeight: 700, color: status === "published" ? "#2F6B45" : "#8E4E68" }}>{status === "published" ? "공개 중" : status === "hidden" ? "비공개" : "작성 중"}</span>
          {isPremium(template) && paid && <Link href={`/invitation/dashboard/${id}`} style={{ ...ghost, display: "inline-flex", alignItems: "center", textDecoration: "none" }}>대시보드</Link>}
          <button type="button" className="inv-only-narrow" onClick={() => setShowPreview(true)} style={ghost}>미리보기</button>
          <button type="button" onClick={publish} style={{ minHeight: 44, padding: "0 22px", borderRadius: 22, border: 0, background: ACCENT, color: "#FFFFFF", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>{paying ? "결제 진행 중…" : status === "published" ? "변경 내용 반영하기" : isPremium(template) && !paid ? `${PREMIUM_PRICE.toLocaleString("ko-KR")}원 결제하고 발행` : "발행하기"}</button>
        </div>
      </header>

      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "20px clamp(14px,3vw,24px) 80px", display: "flex", gap: 28, alignItems: "flex-start" }}>
        <main style={{ flex: "1 1 560px", minWidth: 0 }}>
          {msg && <div role="alert" style={{ marginBottom: 14, padding: "12px 16px", borderRadius: 12, background: "#FBE9E9", color: "#8A2F3D", fontSize: 14 }}>{msg}</div>}
          {missing.length > 0 && status !== "published" && <div style={{ marginBottom: 14, padding: "12px 16px", borderRadius: 12, background: "#FFFFFF", border: "1px dashed #C07E96", fontSize: 13, color: "#473A3F" }}>발행하려면 <b>{missing.join(", ")}</b>이(가) 필요해요.</div>}

          <Card title="템플릿" hint={`프리미엄 템플릿은 주차 안내·예식장 메모·사진 ${galleryMax("modern")}장·제작자 대시보드가 있고 하단 웨딩버틀러 표시가 없어요. 고르고 꾸미는 것은 무료이고, 결제는 발행할 때 한 번만 해요.`}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 8 }}>
              {INVITATION_TEMPLATES.map((t) => (
                <button key={t} type="button" aria-pressed={template === t} onClick={() => changeTemplate(t)} style={{ ...chip(template === t), borderRadius: 14, padding: "10px 12px", textAlign: "left", height: "auto" }}>
                  <span style={{ display: "block", fontSize: 14, fontWeight: 700 }}>{TEMPLATE_INFO[t].name}</span>
                  <span style={{ display: "block", fontSize: 12, color: TEMPLATE_INFO[t].premium ? "#8E4E68" : "#2F6B45", fontWeight: 600 }}>{TEMPLATE_INFO[t].premium ? (paid ? "결제 완료" : `${PREMIUM_PRICE.toLocaleString("ko-KR")}원`) : "무료"}</span>
                </button>
              ))}
            </div>
          </Card>

          <Card title="기본 정보" hint="청첩장 표지와 예식 안내에 들어가요.">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 14 }}>
              <Field id="eGroom" label="신랑 이름"><input id="eGroom" style={input} value={c.groom} placeholder="예: 민준" onChange={(e) => update({ groom: e.target.value })} /></Field>
              <Field id="eBride" label="신부 이름"><input id="eBride" style={input} value={c.bride} placeholder="예: 서연" onChange={(e) => update({ bride: e.target.value })} /></Field>
              <Field id="eDate" label="예식 날짜"><input id="eDate" type="date" style={input} value={c.date} onChange={(e) => update({ date: e.target.value })} /></Field>
              <Field id="eTime" label="예식 시간"><input id="eTime" type="time" step={900} style={input} value={c.time} onChange={(e) => update({ time: e.target.value || "13:00" })} /></Field>
              <Field id="eVenue" label="예식장 이름"><input id="eVenue" style={input} value={c.venue} placeholder="예: ○○웨딩홀" onChange={(e) => update({ venue: e.target.value })} /></Field>
              <Field id="eHall" label="홀 이름 · 층"><input id="eHall" style={input} value={c.hall} placeholder="예: 그랜드홀 3층" onChange={(e) => update({ hall: e.target.value })} /></Field>
            </div>
            {c.date && <p style={{ margin: "14px 0 0", padding: "10px 14px", borderRadius: 10, background: "#FBF6F7", fontSize: 13 }}>청첩장에는 <b>{dateLabel(c)}</b>로 보여요.</p>}
            <div style={{ display: "flex", gap: 18, marginTop: 10, flexWrap: "wrap", fontSize: 14, alignItems: "center" }}>
              <span style={{ display: "flex", alignItems: "center" }}>달력 보이기 <Switch on={c.showCalendar} label="달력 보이기" onChange={(v) => update({ showCalendar: v })} /></span>
              <span style={{ display: "flex", alignItems: "center" }}>D-day 보이기 <Switch on={c.showDday} label="D-day 보이기" onChange={(v) => update({ showDday: v })} /></span>
            </div>
          </Card>

          <Card title="표지 사진" hint="청첩장 맨 위에 크게 보여요. 세로 사진이 잘 어울려요. 사진을 끌어다 놓거나 눌러서 고르세요.">
            <div {...dragProps("cover")} style={photoBox(dragging)}>
              {c.cover ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={photoUrl(c.cover)} alt="표지 사진" style={{ width: 140, height: 190, objectFit: "cover", borderRadius: 10, display: "block", margin: "0 auto 12px" }} />
              ) : (
                <p style={{ margin: "6px 0 12px", fontSize: 14, color: "#6B5A60" }}>{dragging ? "놓으면 올라가요" : "여기로 사진을 끌어다 놓으세요"}</p>
              )}
              <button type="button" style={ghost} onClick={() => coverInput.current?.click()}>{c.cover ? "다른 사진으로 바꾸기" : "파일 불러오기"}</button>
              {c.cover && <button type="button" style={{ ...ghost, marginLeft: 8, color: "#B25B4B" }} onClick={() => update({ cover: "" })}>빼기</button>}
              <input ref={coverInput} type="file" accept="image/*" hidden onChange={(e) => { void uploadFiles(Array.from(e.target.files ?? []), "cover"); e.target.value = ""; }} />
            </div>
          </Card>

          <Card title="인사말" hint="아래 예시를 누르면 채워져요. 채운 뒤 마음대로 고쳐 써도 좋아요.">
            <Field id="eTitle" label="제목"><input id="eTitle" style={input} value={c.title} placeholder="예: 소중한 분들을 초대합니다" onChange={(e) => update({ title: e.target.value })} /></Field>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, margin: "8px 0 14px" }}>
              {TITLES.map((t) => <button key={t} type="button" aria-pressed={c.title === t} style={chip(c.title === t)} onClick={() => update({ title: t })}>{t}</button>)}
            </div>
            <Field id="eGreeting" label="본문"><textarea id="eGreeting" rows={6} style={area} value={c.greeting} placeholder="두 사람의 이야기와 초대의 말을 적어 주세요." onChange={(e) => update({ greeting: e.target.value })} /></Field>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
              {GREETINGS.map(([label, text]) => <button key={label} type="button" aria-pressed={c.greeting === text} style={chip(c.greeting === text)} onClick={() => update({ greeting: text })}>{label}</button>)}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 10, marginTop: 18 }}>
              <Field id="pGF" label="신랑 아버지"><input id="pGF" style={input} value={c.groomFather} placeholder="이름" onChange={(e) => update({ groomFather: e.target.value })} /></Field>
              <Field id="pGM" label="신랑 어머니"><input id="pGM" style={input} value={c.groomMother} placeholder="이름" onChange={(e) => update({ groomMother: e.target.value })} /></Field>
              <Field id="pBF" label="신부 아버지"><input id="pBF" style={input} value={c.brideFather} placeholder="이름" onChange={(e) => update({ brideFather: e.target.value })} /></Field>
              <Field id="pBM" label="신부 어머니"><input id="pBM" style={input} value={c.brideMother} placeholder="이름" onChange={(e) => update({ brideMother: e.target.value })} /></Field>
            </div>
            <p style={{ margin: "8px 0 0", fontSize: 12, color: "#9A8189" }}>비워 두면 &ldquo;○○○ · ○○○ 의 아들&rdquo; 줄이 청첩장에서 빠져요.</p>
          </Card>

          <Card title="오시는 길" hint="주소를 넣으면 하객이 눌러서 지도 앱으로 길 안내를 받을 수 있어요.">
            <Field id="eAddr" label="예식장 주소"><input id="eAddr" style={input} value={c.address} placeholder="예: 서울특별시 ○○구 ○○로 123" onChange={(e) => update({ address: e.target.value })} /></Field>
            <div style={{ fontSize: 13, fontWeight: 500, margin: "14px 0 8px" }}>길 안내 버튼</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button type="button" aria-pressed={c.mapNaver} style={chip(c.mapNaver)} onClick={() => update({ mapNaver: !c.mapNaver })}>네이버 지도</button>
              <button type="button" aria-pressed={c.mapKakao} style={chip(c.mapKakao)} onClick={() => update({ mapKakao: !c.mapKakao })}>카카오맵</button>
              <button type="button" aria-pressed={c.mapTmap} style={chip(c.mapTmap)} onClick={() => update({ mapTmap: !c.mapTmap })}>티맵</button>
            </div>
            <div style={{ marginTop: 14 }}>
              <Field id="eTraffic" label="교통·주차 안내"><textarea id="eTraffic" rows={3} style={area} value={c.traffic} placeholder="예: 지하철 2호선 ○○역 3번 출구 도보 5분 / 주차 2시간 무료" onChange={(e) => update({ traffic: e.target.value })} /></Field>
            </div>
          </Card>

          <Card title={`갤러리 (${c.gallery.length}/${galleryMax(template)}장)`} hint="사진을 끌어다 놓거나 눌러서 고르세요. 여러 장을 한 번에 올릴 수 있어요.">
            <div {...dragProps("gallery")} style={photoBox(dragging)}>
              <p style={{ margin: "4px 0 12px", fontSize: 14, color: "#6B5A60" }}>{dragging ? "놓으면 올라가요" : "여기로 사진을 끌어다 놓으세요"}</p>
              <button type="button" style={ghost} onClick={() => galleryInput.current?.click()}>파일 불러오기</button>
              <input ref={galleryInput} type="file" accept="image/*" multiple hidden onChange={(e) => { void uploadFiles(Array.from(e.target.files ?? []), "gallery"); e.target.value = ""; }} />
              {uploading > 0 && <p style={{ margin: "12px 0 0", fontSize: 13, color: ACCENT }}>사진 {uploading}장 올리는 중…</p>}
            </div>
            {c.gallery.length > 0 && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(88px,1fr))", gap: 8, marginTop: 14 }}>
                {c.gallery.map((p, i) => (
                  <div key={p} style={{ position: "relative" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={photoUrl(p)} alt={`갤러리 사진 ${i + 1}`} style={{ width: "100%", aspectRatio: "3 / 4", objectFit: "cover", borderRadius: 10, display: "block" }} />
                    <div style={{ position: "absolute", left: 4, right: 4, bottom: 4, display: "flex", justifyContent: "space-between", gap: 4 }}>
                      <button type="button" aria-label={`${i + 1}번 사진 앞으로`} disabled={i === 0} onClick={() => { const g = [...c.gallery]; [g[i - 1], g[i]] = [g[i], g[i - 1]]; update({ gallery: g }); }} style={{ minWidth: 30, minHeight: 30, border: 0, borderRadius: 8, background: "rgba(51,35,42,0.72)", color: "#FFF", cursor: "pointer", opacity: i === 0 ? 0.35 : 1 }}>◀</button>
                      <button type="button" aria-label={`${i + 1}번 사진 빼기`} onClick={() => update({ gallery: c.gallery.filter((x) => x !== p) })} style={{ minWidth: 30, minHeight: 30, border: 0, borderRadius: 8, background: "rgba(178,58,82,0.85)", color: "#FFF", cursor: "pointer" }}>×</button>
                      <button type="button" aria-label={`${i + 1}번 사진 뒤로`} disabled={i === c.gallery.length - 1} onClick={() => { const g = [...c.gallery]; [g[i + 1], g[i]] = [g[i], g[i + 1]]; update({ gallery: g }); }} style={{ minWidth: 30, minHeight: 30, border: 0, borderRadius: 8, background: "rgba(51,35,42,0.72)", color: "#FFF", cursor: "pointer", opacity: i === c.gallery.length - 1 ? 0.35 : 1 }}>▶</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card title="마음 전하실 곳" hint="계좌번호는 청첩장 주소를 받은 누구나 볼 수 있어요. 공개하고 싶지 않으면 끄세요.">
            <div style={{ display: "flex", alignItems: "center", marginBottom: 8, fontSize: 14 }}>계좌 보이기 <Switch on={c.showAccounts} label="계좌 보이기" onChange={(v) => update({ showAccounts: v })} /></div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, opacity: c.showAccounts ? 1 : 0.45 }}>
              {c.accounts.map((a, i) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(120px,1fr))", gap: 8, padding: 12, border: `1px solid ${BORDER}`, borderRadius: 12 }}>
                  <input aria-label="구분" style={input} value={a.who} placeholder="구분 (예: 신랑)" onChange={(e) => setAccount(i, { who: e.target.value })} />
                  <input aria-label="은행" style={input} value={a.bank} placeholder="은행" onChange={(e) => setAccount(i, { bank: e.target.value })} />
                  <input aria-label="계좌번호" inputMode="numeric" style={input} value={a.number} placeholder="계좌번호" onChange={(e) => setAccount(i, { number: e.target.value })} />
                  <input aria-label="예금주" style={input} value={a.holder} placeholder="예금주" onChange={(e) => setAccount(i, { holder: e.target.value })} />
                  <button type="button" onClick={() => update({ accounts: c.accounts.filter((_, j) => j !== i) })} style={{ ...ghost, color: "#B25B4B" }}>삭제</button>
                </div>
              ))}
            </div>
            {c.accounts.length < ACCOUNT_MAX && <button type="button" style={{ ...ghost, marginTop: 10 }} onClick={() => update({ accounts: [...c.accounts, { who: "", bank: "", number: "", holder: "" }] })}>+ 계좌 추가 ({c.accounts.length}/{ACCOUNT_MAX})</button>}
          </Card>

          <Card title="주차 안내 · 예식장 메모" hint={isPremium(template) ? "하객에게 보여요. 비워 둔 칸은 보이지 않아요." : "프리미엄 템플릿에서 하객에게 보여요. 미리 적어 두면 템플릿을 바꿀 때 바로 쓸 수 있어요."}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 12 }}>
              <Field id="pk1" label="주차장 위치"><input id="pk1" style={input} value={c.parkingPlace} placeholder="예: 건물 지하 1~3층" onChange={(e) => update({ parkingPlace: e.target.value })} /></Field>
              <Field id="pk2" label="들어오는 길"><input id="pk2" style={input} value={c.parkingEntrance} placeholder="예: ○○로에서 우회전 후 지하 입구" onChange={(e) => update({ parkingEntrance: e.target.value })} /></Field>
              <Field id="pk3" label="무료 시간"><input id="pk3" style={input} value={c.parkingFree} placeholder="예: 2시간 무료, 축의대에서 등록" onChange={(e) => update({ parkingFree: e.target.value })} /></Field>
              <Field id="pk4" label="만차 시"><input id="pk4" style={input} value={c.parkingFull} placeholder="예: ○○ 공영주차장 (도보 5분)" onChange={(e) => update({ parkingFull: e.target.value })} /></Field>
              <Field id="mm1" label="식사"><input id="mm1" style={input} value={c.memoMeal} placeholder="예: 2층 연회장 뷔페, 예식 30분 전부터" onChange={(e) => update({ memoMeal: e.target.value })} /></Field>
              <Field id="mm2" label="셔틀버스"><input id="mm2" style={input} value={c.memoShuttle} placeholder="예: ○○역 2번 출구, 15분 간격" onChange={(e) => update({ memoShuttle: e.target.value })} /></Field>
              <Field id="mm3" label="포토부스"><input id="mm3" style={input} value={c.memoPhoto} placeholder="예: 1층 로비" onChange={(e) => update({ memoPhoto: e.target.value })} /></Field>
              <Field id="mm4" label="화환"><input id="mm4" style={input} value={c.memoWreath} placeholder="예: 화환은 정중히 사양합니다" onChange={(e) => update({ memoWreath: e.target.value })} /></Field>
            </div>
          </Card>

          <Card title="연락처" hint="켜면 하객 화면에 전화·문자 버튼이 생겨요. 번호는 버튼 안에만 들어가고 화면에 숫자로 보이지 않아요.">
            <div style={{ display: "flex", alignItems: "center", marginBottom: 8, fontSize: 14 }}>연락처 보이기 <Switch on={c.showContacts} label="연락처 보이기" onChange={(v) => update({ showContacts: v })} /></div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, opacity: c.showContacts ? 1 : 0.45 }}>
              {c.contacts.map((x, i) => (
                <div key={i} style={{ display: "flex", gap: 8 }}>
                  <input aria-label="이름" style={{ ...input, flex: "0 0 110px" }} value={x.label} placeholder="구분" onChange={(e) => update({ contacts: c.contacts.map((y, j) => (j === i ? { ...y, label: e.target.value } : y)) })} />
                  <input aria-label="전화번호" type="tel" style={input} value={x.phone} placeholder="010-1234-5678" onChange={(e) => update({ contacts: c.contacts.map((y, j) => (j === i ? { ...y, phone: e.target.value } : y)) })} />
                </div>
              ))}
            </div>
          </Card>

          <Card title="축의 접수 안내" hint="모든 청첩장에 항상 들어가는 섹션이라 끌 수 없어요. 문구 분위기만 고를 수 있어요.">
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {RECEPT_LABELS.map((l, i) => <button key={l} type="button" aria-pressed={c.receptStyle === i} style={chip(c.receptStyle === i)} onClick={() => update({ receptStyle: i })}>{l}</button>)}
            </div>
          </Card>

          <Card title="방명록" hint="하객이 축하 글을 남길 수 있어요. 욕설·광고는 자동으로 막고, 하객은 비밀번호로 자기 글을 지울 수 있어요.">
            <div style={{ display: "flex", alignItems: "center", fontSize: 14 }}>방명록 받기 <Switch on={c.guestbook} label="방명록 받기" onChange={(v) => update({ guestbook: v })} /></div>
            {status === "published" ? (
              <div style={{ marginTop: 10 }}>
                <button type="button" style={ghost} onClick={loadEntries}>{entries ? "새로 불러오기" : "받은 글 보기 · 관리"}</button>
                {entries && entries.length === 0 && <p style={{ fontSize: 13, color: "#9A8189" }}>아직 받은 글이 없어요.</p>}
                {entries?.map((e) => (
                  <div key={e.id} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "12px 0", borderTop: "1px solid #F0E3E6" }}>
                    <div style={{ flex: 1, fontSize: 14 }}><b>{e.name}</b><div style={{ marginTop: 4, lineHeight: 1.6, whiteSpace: "pre-line", color: "#473A3F" }}>{e.message}</div></div>
                    <button type="button" aria-label={`${e.name} 님 글 삭제`} onClick={() => deleteEntry(e.id)} style={{ ...ghost, color: "#B25B4B", flex: "0 0 auto" }}>삭제</button>
                  </div>
                ))}
              </div>
            ) : <p style={{ margin: "10px 0 0", fontSize: 13, color: "#9A8189" }}>발행한 뒤부터 하객이 글을 남길 수 있고, 여기서 보고 지울 수 있어요.</p>}
          </Card>

          <Card title="청첩장 관리">
            {status === "published" && (
              <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
                <button type="button" style={ghost} onClick={() => { setCopied(false); setDone(true); }}>주소 복사</button>
                <button type="button" style={ghost} onClick={hide}>비공개로 바꾸기</button>
              </div>
            )}
            <button type="button" onClick={removeInvitation} style={{ ...ghost, color: "#B25B4B" }}>이 청첩장 지우기</button>
          </Card>
        </main>

        {/* 미리보기 (넓은 화면) */}
        <aside className="inv-preview-wide" style={{ flex: "0 0 380px", position: "sticky", top: 78 }}>
          <div style={{ fontSize: 12, fontWeight: 500, color: "#6B5A60", marginBottom: 8, textAlign: "center" }}>하객이 보는 화면 · 실시간 미리보기</div>
          <div style={{ height: "calc(100vh - 150px)", minHeight: 520, overflowY: "auto", borderRadius: 32, border: `8px solid ${DARK}`, background: "#FBF7F0" }}>{preview}</div>
        </aside>
      </div>

      {/* 미리보기 (좁은 화면: 전체 화면) */}
      {showPreview && (
        <div role="dialog" aria-modal="true" aria-label="미리보기" style={{ position: "fixed", inset: 0, zIndex: 60, background: "#E9E2D6", overflowY: "auto" }}>
          <button type="button" onClick={() => setShowPreview(false)} style={{ position: "fixed", top: 12, right: 12, zIndex: 61, minHeight: 44, padding: "0 20px", borderRadius: 22, border: 0, background: DARK, color: "#FFF", fontSize: 14, cursor: "pointer" }}>닫기</button>
          {preview}
        </div>
      )}

      {/* 발행 완료 */}
      {done && (
        <div role="dialog" aria-modal="true" aria-label="발행 완료" style={{ position: "fixed", inset: 0, zIndex: 70, background: "rgba(51,35,42,0.5)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div style={{ width: "100%", maxWidth: 460, background: "#FFFFFF", borderRadius: 22, padding: 28, boxSizing: "border-box" }}>
            <h2 style={{ margin: 0, fontFamily: fontSerif, fontSize: 21, fontWeight: 600 }}>청첩장이 만들어졌어요</h2>
            <p style={{ margin: "8px 0 18px", fontSize: 14, lineHeight: 1.7, color: "#6B5A60" }}>아래 주소를 복사해 카카오톡이나 문자로 보내 주세요. 고쳐도 주소는 그대로예요.</p>
            {isPremium(template) && paid && <p style={{ margin: "-6px 0 16px", padding: "12px 14px", borderRadius: 12, background: "#F9EFF2", fontSize: 13, lineHeight: 1.6, color: "#473A3F" }}>방문 수·길찾기·계좌 복사 횟수는 <Link href={`/invitation/dashboard/${id}`} style={{ color: ACCENT, fontWeight: 700 }}>제작자 대시보드</Link>에서 볼 수 있어요.</p>}
            <div style={{ display: "flex", gap: 8 }}>
              <input readOnly aria-label="청첩장 주소" value={url} onFocus={(e) => e.target.select()} style={{ ...input, background: "#FBF6F7" }} />
              <button type="button" onClick={copyUrl} style={{ minHeight: 48, padding: "0 18px", border: 0, borderRadius: 12, background: ACCENT, color: "#FFF", fontSize: 14, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>{copied ? "복사했어요" : "URL 복사"}</button>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 20 }}>
              <a href={url} target="_blank" rel="noopener noreferrer" style={{ ...ghost, display: "inline-flex", alignItems: "center", textDecoration: "none" }}>내 폰에서 열어 보기</a>
              <button type="button" onClick={() => setDone(false)} style={{ minHeight: 44, padding: "0 20px", borderRadius: 22, border: 0, background: DARK, color: "#FFF", fontSize: 14, cursor: "pointer" }}>닫기</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
