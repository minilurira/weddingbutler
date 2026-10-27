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
  AUDIO_MAX_BYTES,
  MUSIC_TRACKS,
  endDate,
  formatPhoneDash,
  getMusic,
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
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
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

function Field({ id, label, req = false, children }: { id: string; label: string; req?: boolean; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={id} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 500, color: "#473A3F", marginBottom: 6 }}>
        {label}
        <span style={{ fontSize: 11, fontWeight: 700, padding: "1px 7px", borderRadius: 999, color: req ? "#B03A52" : "#9A8189", background: req ? "#FBEAEE" : "#F4EEF0" }}>{req ? "필수" : "선택"}</span>
      </label>
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
  const [publishedAt, setPublishedAt] = useState<string | null>(null);
  const [template, setTemplateState] = useState<InvitationTemplate>("classic");
  const [paid, setPaid] = useState(false);
  const [paying, setPaying] = useState(false);
  // 이니시스 결제는 구매자 이메일이 필수라서 결제 직전에 한 번 받는다 (브라우저에서 포트원으로만 보내고 우리 DB에는 저장하지 않는다)
  // 배경음악 미리듣기 (에디터에서 곡을 들어 보고 고른다)
  const previewAudio = useRef<HTMLAudioElement | null>(null);
  const [previewKey, setPreviewKey] = useState("");
  const [musicOk, setMusicOk] = useState(false);
  const [musicBusy, setMusicBusy] = useState(false);
  const musicInput = useRef<HTMLInputElement>(null);
  useEffect(() => () => { previewAudio.current?.pause(); }, []);
  const [payEmail, setPayEmail] = useState("");
  const [emailAsk, setEmailAsk] = useState(false);
  const [emailErr, setEmailErr] = useState("");
  const [url, setUrl] = useState("");
  const [loadErr, setLoadErr] = useState("");
  const [saveState, setSaveState] = useState<"saved" | "saving" | "error">("saved");
  const [dragging, setDragging] = useState(false);
  const [batch, setBatch] = useState<{ total: number; done: number } | null>(null);
  const [savedAt, setSavedAt] = useState("");
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
  const thumbInput = useRef<HTMLInputElement>(null);

  const photoBase = `${(process.env.NEXT_PUBLIC_SUPABASE_URL || "").replace(/\/$/, "")}/storage/v1/object/public/invitation-photos/`;
  const photoUrl = useCallback((path: string) => `${photoBase}${path}`, [photoBase]);

  // 불러오기
  useEffect(() => {
    (async () => {
      const r = await fetch(`/api/invitation/${id}`, { cache: "no-store" }).catch(() => null);
      if (!r) return setLoadErr("불러오지 못했어요. 잠시 뒤에 다시 시도해 주세요.");
      if (r.status === 401) return void (window.location.href = "/invitation/new");
      if (!r.ok) return setLoadErr("이 청첩장을 찾을 수 없어요.");
      const d = (await r.json()) as { status: Status; url: string; template: InvitationTemplate; paid: boolean; publishedAt: string | null; content: InvitationContent };
      latest.current = d.content;
      setContent(d.content);
      setStatus(d.status);
      setPublishedAt(d.publishedAt ?? null);
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
  async function uploadFiles(files: File[], target: "cover" | "gallery" | "thumb") {
    if (!content || files.length === 0) return;
    setMsg("");
    const max = galleryMax(template);
    const room = target === "cover" || target === "thumb" ? 1 : max - content.gallery.length;
    if (room <= 0) return setMsg(isPremium(template) ? `갤러리 사진은 ${max}장까지 올릴 수 있어요.` : `무료 템플릿은 갤러리 사진을 ${max}장까지 올릴 수 있어요. 프리미엄 템플릿은 ${galleryMax("modern")}장까지 올릴 수 있어요.`);
    const picked = files.slice(0, room);
    if (files.length > room) setMsg(`${max}장까지만 올릴 수 있어서 ${picked.length}장만 올렸어요.`);
    // 3장씩 동시에 올리고, 올린 순서는 고른 순서대로 유지한다
    const results: (string | null)[] = new Array(picked.length).fill(null);
    let nextIndex = 0;
    setBatch({ total: picked.length, done: 0 });
    const worker = async () => {
      while (nextIndex < picked.length) {
        const i = nextIndex++;
        try {
          const blob = await resizeToJpeg(picked[i]);
          const r = await fetch(`/api/invitation/${id}/photo`, { method: "POST", headers: { "Content-Type": "image/jpeg" }, body: blob });
          const d = (await r.json().catch(() => ({}))) as { path?: string; error?: string };
          if (!r.ok || !d.path) {
            setMsg(d.error === "photo_limit" ? "올린 사진이 너무 많아요. 안 쓰는 사진을 빼 주세요." : "사진을 올리지 못했어요. 다시 시도해 주세요.");
          } else results[i] = d.path;
        } catch {
          setMsg("이 파일은 사진으로 열 수 없어요. JPG, PNG, WEBP 사진을 올려 주세요.");
        } finally {
          setBatch((b) => (b ? { ...b, done: b.done + 1 } : b));
        }
      }
    };
    await Promise.all(Array.from({ length: Math.min(3, picked.length) }, worker));
    setBatch(null);
    const added = results.filter((p): p is string => Boolean(p));
    if (added.length === 0) return;
    const cur = latest.current ?? content;
    if (target === "thumb") update({ thumb: added[0] });
    else if (target === "cover") update({ cover: added[0] });
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
  // 빠진 필수 칸으로 화면을 옮기고 그 칸에 커서를 둔다 (안내 문구가 화면 밖에 있어 눌러도 반응 없는 것처럼 보이지 않게)
  function focusMissing(miss: string[]) {
    const ids: Record<string, string> = { "신랑 이름": "eGroom", "신부 이름": "eBride", "예식 날짜": "eDate", "예식장 이름": "eVenue" };
    const el = miss.length ? document.getElementById(ids[miss[0]] ?? "") : null;
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    window.setTimeout(() => el.focus({ preventScroll: true }), 350);
  }

  async function publish() {
    setMsg("");
    if (!(await flush())) return setMsg("저장하지 못했어요. 인터넷 연결을 확인해 주세요.");
    if (isPremium(template) && !paid) {
      const miss = missingForPublish(latest.current ?? content!);
      if (miss.length) {
        focusMissing(miss);
        return setMsg(`발행하려면 ${miss.join(", ")}을(를) 먼저 입력해 주세요.`);
      }
      if (!EMAIL_RE.test(payEmail.trim())) {
        setEmailErr("");
        setEmailAsk(true);
        return;
      }
      return startPayment();
    }
    await doPublish();
  }

  async function doPublish() {
    const r = await fetch(`/api/invitation/${id}/publish`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "publish" }) });
    const d = (await r.json().catch(() => ({}))) as { error?: string; missing?: string[]; url?: string; publishedAt?: string | null };
    if (r.status === 400 && d.missing) {
      focusMissing(d.missing);
      return setMsg(`발행하려면 ${d.missing.join(", ")}을(를) 먼저 입력해 주세요.`);
    }
    if (r.status === 402) return setMsg("프리미엄 템플릿은 결제 후에 발행할 수 있어요.");
    if (!r.ok) return setMsg("발행하지 못했어요. 잠시 뒤에 다시 시도해 주세요.");
    setStatus("published");
    if (d.publishedAt) setPublishedAt(d.publishedAt);
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
        customerEmail: payEmail.trim(),
        redirectUrl: `${window.location.origin}/invitation/edit/${id}`,
      });
      if (!res.ok) return setMsg(res.message ?? "결제가 취소되었어요.");
      await confirmAndPublish(d.paymentId);
    } catch (err) {
      // 결제창을 열지 못한 경우(팝업 차단, 인터넷 문제 등)도 조용히 지나가지 않고 알린다
      console.error("[invitation] payment failed to start", err);
      setMsg("결제창을 열지 못했어요. 팝업 차단이 켜져 있다면 허용한 뒤 다시 눌러 주세요.");
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
  const saveLabel = saveState === "saving" ? "저장 중…" : saveState === "error" ? "저장 실패 · 다시 시도 중" : savedAt ? `임시저장됨 · ${savedAt}` : "자동 저장됨";
  function previewTrack(key: string) {
    previewAudio.current?.pause();
    if (previewKey === key) return setPreviewKey("");
    const custom = key === "custom" && latest.current?.musicFile ? `${photoBase.replace("/invitation-photos/", "/invitation-audio/")}${latest.current.musicFile}` : "";
    const t = key === "custom" ? { src: custom } : getMusic(key);
    if (!t || !t.src) return;
    const a = new Audio(t.src);
    a.onended = () => setPreviewKey("");
    previewAudio.current = a;
    a.play().then(() => setPreviewKey(key)).catch(() => { setPreviewKey(""); setMsg("음악을 재생하지 못했어요. 기기의 무음 설정을 확인해 주세요."); });
  }

  // 직접 올린 배경음악: 3MB 이하 mp3/m4a. 용량이 크면 올리기 전에 알려 준다.
  async function uploadMusic(file: File) {
    setMsg("");
    if (file.size > AUDIO_MAX_BYTES) return setMsg("음악 파일이 너무 커요. 3MB 이하(3분 안팎의 MP3)만 올릴 수 있어요. 용량을 줄인 파일로 다시 올려 주세요.");
    setMusicBusy(true);
    try {
      const r = await fetch(`/api/invitation/${id}/music`, { method: "POST", headers: { "Content-Type": file.type || "audio/mpeg" }, body: file });
      const d = (await r.json().catch(() => ({}))) as { path?: string; error?: string };
      if (!r.ok || !d.path) return setMsg(d.error === "bad_type" ? "mp3 또는 m4a 파일만 올릴 수 있어요." : d.error === "too_large" ? "음악 파일이 너무 커요. 3MB 이하만 올릴 수 있어요." : "음악을 올리지 못했어요. 잠시 뒤에 다시 시도해 주세요.");
      previewAudio.current?.pause();
      setPreviewKey("");
      update({ music: "custom", musicFile: d.path, musicName: file.name.replace(/\.[^.]+$/, "").slice(0, 40) });
    } catch {
      setMsg("음악을 올리지 못했어요. 인터넷 연결을 확인해 주세요.");
    } finally {
      setMusicBusy(false);
    }
  }

  const publishLabel = paying ? "결제 진행 중…" : status === "published" ? "변경 내용 반영하기" : isPremium(template) && !paid ? `${PREMIUM_PRICE.toLocaleString("ko-KR")}원 결제하고 발행` : "발행하기";
  async function saveDraft() {
    setMsg("");
    if (!(await flush())) return setMsg("저장하지 못했어요. 인터넷 연결을 확인해 주세요.");
    setSavedAt(new Date().toLocaleTimeString("ko-KR", { hour: "numeric", minute: "2-digit" }));
  }

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
          {status !== "published" && <button type="button" className="inv-hide-narrow" onClick={() => void saveDraft()} style={{ minHeight: 44, padding: "0 18px", borderRadius: 22, border: `1.5px solid ${ACCENT}`, background: "#FFFFFF", color: ACCENT, fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>임시저장</button>}
          <button type="button" onClick={publish} style={{ minHeight: 44, padding: "0 22px", borderRadius: 22, border: 0, background: ACCENT, color: "#FFFFFF", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>{paying ? "결제 진행 중…" : status === "published" ? "변경 내용 반영하기" : isPremium(template) && !paid ? `${PREMIUM_PRICE.toLocaleString("ko-KR")}원 결제하고 발행` : "발행하기"}</button>
        </div>
      </header>

      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "20px clamp(14px,3vw,24px) 80px", display: "flex", gap: 28, alignItems: "flex-start" }}>
        <main style={{ flex: "1 1 560px", minWidth: 0 }}>
          {msg && <div role="alert" style={{ position: "sticky", top: 76, zIndex: 35, marginBottom: 14, padding: "12px 16px", borderRadius: 12, background: "#FBE9E9", color: "#8A2F3D", fontSize: 14, boxShadow: "0 6px 18px rgba(138,47,61,0.18)" }}>{msg}</div>}
          {missing.length > 0 && status !== "published" && <div style={{ marginBottom: 14, padding: "12px 16px", borderRadius: 12, background: "#FFFFFF", border: "1px dashed #C07E96", fontSize: 13, color: "#473A3F" }}>발행하려면 <b>{missing.join(", ")}</b>이(가) 필요해요.</div>}

          <Card title="템플릿" hint={`프리미엄 템플릿은 주차 안내·예식장 메모·사진 ${galleryMax("modern")}장·제작자 대시보드가 있어요. 고르고 꾸미는 것은 무료이고, 결제는 발행할 때 한 번만 해요.`}>
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
              <Field id="eGroom" req label="신랑 이름"><input id="eGroom" style={input} value={c.groom} placeholder="예: 민준" onChange={(e) => update({ groom: e.target.value })} /></Field>
              <Field id="eBride" req label="신부 이름"><input id="eBride" style={input} value={c.bride} placeholder="예: 서연" onChange={(e) => update({ bride: e.target.value })} /></Field>
              <Field id="eDate" req label="예식 날짜"><input id="eDate" type="date" style={input} value={c.date} onChange={(e) => update({ date: e.target.value })} /></Field>
              <Field id="eTime" label="예식 시간"><input id="eTime" type="time" step={900} style={input} value={c.time} onChange={(e) => update({ time: e.target.value || "13:00" })} /></Field>
              <Field id="eVenue" req label="예식장 이름"><input id="eVenue" style={input} value={c.venue} placeholder="예: ○○웨딩홀" onChange={(e) => update({ venue: e.target.value })} /></Field>
              <Field id="eHall" label="홀 이름 · 층"><input id="eHall" style={input} value={c.hall} placeholder="예: 그랜드홀 3층" onChange={(e) => update({ hall: e.target.value })} /></Field>
            </div>
            {c.date && <p style={{ margin: "14px 0 0", padding: "10px 14px", borderRadius: 10, background: "#FBF6F7", fontSize: 13 }}>청첩장에는 <b>{dateLabel(c)}</b>로 보여요.</p>}
            <p style={{ margin: "10px 0 0", padding: "10px 14px", borderRadius: 10, background: "#FBF6F7", fontSize: 13, lineHeight: 1.7 }}>모바일 청첩장은 <b>발행일부터 6개월</b> 동안 열려 있어요. 예식일이 6개월보다 더 남았다면 <b>예식일 다음날</b>에 끝나요. {status === "published" ? "이 청첩장은" : "지금 발행하면"} <b>{endDate(c.date, publishedAt)}</b>까지 볼 수 있어요. 끝난 뒤에는 보관 기간이 끝났다는 안내가 나오고, 하단에는 웨딩버틀러 표시가 들어가요.</p>
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

          <Card title="카카오톡 공유 썸네일" hint="카카오톡·문자로 주소를 보내면 이름·날짜와 함께 보이는 사진이에요. 가로로 넓은 사진(3:2 또는 16:9 정도)을 올려 주세요. 올리지 않으면 표지 사진으로 자동으로 만들어요.">
            <div style={{ display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
              {c.thumb ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={photoUrl(c.thumb)} alt="공유 썸네일" style={{ width: 230, aspectRatio: "1200 / 630", objectFit: "cover", borderRadius: 10, border: `1px solid ${BORDER}`, background: "#F1E8EA" }} />
              ) : (
                <div style={{ width: 230, aspectRatio: "1200 / 630", borderRadius: 10, border: "1px dashed #DCC4CC", background: "#FBF6F7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12.5, color: "#9A8189", textAlign: "center", padding: 8 }}>가로 사진을 올려 주세요</div>
              )}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <button type="button" style={{ ...ghost, borderColor: ACCENT, color: ACCENT, fontWeight: 600 }} onClick={() => thumbInput.current?.click()}>{c.thumb ? "다른 사진으로 바꾸기" : "가로 사진 올리기"}</button>
                {c.thumb && <button type="button" style={{ ...ghost, color: "#B25B4B" }} onClick={() => update({ thumb: "" })}>빼기 (표지 사진으로 대체)</button>}
              </div>
              <input ref={thumbInput} type="file" accept="image/*" hidden onChange={(e) => { void uploadFiles(Array.from(e.target.files ?? []), "thumb"); e.target.value = ""; }} />
            </div>
            <p style={{ margin: "12px 0 0", fontSize: 12.5, lineHeight: 1.7, color: "#9A8189" }}>사진의 가운데를 중심으로 가로로 넓게 잘려서 보여요. 얼굴이 가운데 오도록 골라 주세요. 카카오톡은 한 번 본 주소의 썸네일을 저장해 두어서, 바꾼 뒤에도 예전 모습이 한동안 보일 수 있어요.</p>
          </Card>

          <Card title={`갤러리 (${c.gallery.length}/${galleryMax(template)}장)`} hint="사진을 끌어다 놓거나 눌러서 고르세요. 여러 장을 한 번에 올릴 수 있어요.">
            <div {...dragProps("gallery")} style={photoBox(dragging)}>
              <svg width="34" height="34" viewBox="0 0 34 34" fill="none" aria-hidden="true" style={{ display: "block", margin: "2px auto 10px" }}><rect x="4" y="6" width="26" height="22" rx="5" stroke={dragging ? ACCENT : "#C9AAB5"} strokeWidth="1.8" /><circle cx="12" cy="14" r="2.4" fill={dragging ? ACCENT : "#C9AAB5"} /><path d="M5 24l7-6 5 4 4-3 8 6" stroke={dragging ? ACCENT : "#C9AAB5"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
              <p style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 600, color: DARK }}>{dragging ? "놓으면 올라가요" : "사진을 여기로 끌어다 놓으세요"}</p>
              <p style={{ margin: "0 0 14px", fontSize: 12.5, color: "#9A8189" }}>JPG · PNG · WEBP · 여러 장을 한 번에 올릴 수 있어요. 크기는 자동으로 줄여 올려요.</p>
              <button type="button" style={{ ...ghost, border: `1px solid ${ACCENT}`, color: ACCENT, fontWeight: 600 }} onClick={() => galleryInput.current?.click()}>파일 불러오기</button>
              <input ref={galleryInput} type="file" accept="image/*" multiple hidden onChange={(e) => { void uploadFiles(Array.from(e.target.files ?? []), "gallery"); e.target.value = ""; }} />
              {batch && (
                <div role="status" aria-live="polite" style={{ margin: "16px auto 0", maxWidth: 360 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: ACCENT, fontWeight: 600, marginBottom: 6 }}>
                    <span>사진 올리는 중…</span>
                    <span>{batch.done} / {batch.total}장</span>
                  </div>
                  <div style={{ height: 6, borderRadius: 3, background: "#EBDDE2", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${Math.round((batch.done / batch.total) * 100)}%`, background: ACCENT, transition: "width .25s ease" }} />
                  </div>
                </div>
              )}
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
            {c.showAccounts && <p style={{ margin: "0 0 12px", fontSize: 12.5, color: "#9A8189" }}>계좌를 보여 주려면 <b style={{ color: "#B03A52" }}>구분 · 은행 · 계좌번호 · 예금주</b>를 모두 적어 주세요. 비어 있는 계좌는 청첩장에 나오지 않아요.</p>}
            <div style={{ display: "flex", flexDirection: "column", gap: 12, opacity: c.showAccounts ? 1 : 0.45 }}>
              {c.accounts.map((a, i) => (
                <div key={i} style={{ padding: "14px 16px 16px", border: `1px solid ${BORDER}`, borderRadius: 16, background: "#FDFAFB" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                    <b style={{ fontSize: 13, color: "#6B5A60" }}>계좌 {i + 1}</b>
                    <button type="button" onClick={() => update({ accounts: c.accounts.filter((_, j) => j !== i) })} aria-label={`계좌 ${i + 1} 삭제`} style={{ minHeight: 36, padding: "0 12px", borderRadius: 18, border: "1px solid #E7C4BC", background: "#FFFFFF", color: "#B25B4B", fontSize: 12.5, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>삭제</button>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 10 }}>
                    <Field id={`acWho${i}`} label="구분" req={c.showAccounts}><input id={`acWho${i}`} style={input} value={a.who} placeholder="예: 신랑" onChange={(e) => setAccount(i, { who: e.target.value })} /></Field>
                    <Field id={`acBank${i}`} label="은행" req={c.showAccounts}><input id={`acBank${i}`} style={input} value={a.bank} placeholder="예: 국민은행" onChange={(e) => setAccount(i, { bank: e.target.value })} /></Field>
                    <Field id={`acNum${i}`} label="계좌번호" req={c.showAccounts}><input id={`acNum${i}`} inputMode="numeric" style={input} value={a.number} placeholder="숫자와 - 만 입력" onChange={(e) => setAccount(i, { number: e.target.value })} /></Field>
                    <Field id={`acHolder${i}`} label="예금주" req={c.showAccounts}><input id={`acHolder${i}`} style={input} value={a.holder} placeholder="예: 김민준" onChange={(e) => setAccount(i, { holder: e.target.value })} /></Field>
                  </div>
                </div>
              ))}
            </div>
            {c.accounts.length < ACCOUNT_MAX && <button type="button" style={{ ...ghost, marginTop: 12, border: `1px dashed ${ACCENT}`, color: ACCENT, fontWeight: 600 }} onClick={() => update({ accounts: [...c.accounts, { who: "", bank: "", number: "", holder: "" }] })}>+ 계좌 추가 ({c.accounts.length}/{ACCOUNT_MAX})</button>}
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

          <Card title="연락처" hint="켜면 하객 화면에 전화·문자(·카카오톡) 버튼이 생겨요. 번호는 버튼 안에만 들어가고 화면에 숫자로 보이지 않아요.">
            <div style={{ display: "flex", alignItems: "center", marginBottom: 8, fontSize: 14 }}>연락처 보이기 <Switch on={c.showContacts} label="연락처 보이기" onChange={(v) => update({ showContacts: v })} /></div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, opacity: c.showContacts ? 1 : 0.45 }}>
              {c.contacts.map((x, i) => (
                <div key={i} style={{ display: "flex", flexDirection: "column", gap: 8, padding: "12px 14px", border: `1px solid ${BORDER}`, borderRadius: 14, background: "#FDFAFB" }}>
                  <div style={{ display: "flex", gap: 8 }}>
                    <input aria-label="구분" style={{ ...input, flex: "0 0 110px" }} value={x.label} placeholder="구분" onChange={(e) => update({ contacts: c.contacts.map((y, j) => (j === i ? { ...y, label: e.target.value } : y)) })} />
                    <input aria-label="전화번호" type="tel" inputMode="tel" style={input} value={formatPhoneDash(x.phone)} placeholder="010-1234-5678" onChange={(e) => update({ contacts: c.contacts.map((y, j) => (j === i ? { ...y, phone: formatPhoneDash(e.target.value) } : y)) })} />
                  </div>
                  <input aria-label="카카오톡 링크" style={input} value={x.kakao} placeholder="카카오톡 오픈채팅 링크 (선택) https://open.kakao.com/o/…" onChange={(e) => update({ contacts: c.contacts.map((y, j) => (j === i ? { ...y, kakao: e.target.value } : y)) })} />
                  {x.kakao.trim() && !/^(?:https?:\/\/)?(?:open|pf)\.kakao\.com\//.test(x.kakao.trim()) && <p style={{ margin: 0, fontSize: 12, color: "#B03A52" }}>카카오톡 오픈채팅(open.kakao.com) 또는 채널(pf.kakao.com) 링크만 쓸 수 있어요.</p>}
                </div>
              ))}
            </div>
            <p style={{ margin: "12px 0 0", fontSize: 12.5, lineHeight: 1.7, color: "#9A8189" }}>카카오톡은 전화번호로 바로 대화를 열 수 없어서, <b>1:1 오픈채팅방 링크</b>를 붙여 넣으면 &lsquo;카카오톡&rsquo; 버튼이 생겨요. (카카오톡 → 채팅 → 오픈채팅 → 새로 만들기 → 1:1 채팅)</p>
          </Card>

          <Card title="배경음악" hint="하객이 청첩장에서 ‘배경음악’ 버튼을 누르면 재생돼요. 자동으로 재생되지 않아서 조용한 곳에서도 부담이 없어요.">
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <button type="button" aria-pressed={!c.music} style={{ ...chip(!c.music), borderRadius: 14, textAlign: "left", height: "auto", padding: "12px 14px" }} onClick={() => { previewAudio.current?.pause(); setPreviewKey(""); update({ music: "" }); }}>
                <span style={{ display: "block", fontSize: 14, fontWeight: 700 }}>음악 없음</span>
              </button>
              {MUSIC_TRACKS.map((t) => (
                <div key={t.key} style={{ display: "flex", gap: 8, alignItems: "stretch" }}>
                  <button type="button" aria-pressed={c.music === t.key} style={{ ...chip(c.music === t.key), flex: 1, borderRadius: 14, textAlign: "left", height: "auto", padding: "12px 14px" }} onClick={() => update({ music: t.key })}>
                    <span style={{ display: "block", fontSize: 14, fontWeight: 700 }}>{t.title}</span>
                    <span style={{ display: "block", fontSize: 12, color: "#9A8189", marginTop: 2 }}>{t.artist}</span>
                  </button>
                  <button type="button" aria-label={`${t.title} ${previewKey === t.key ? "멈추기" : "미리듣기"}`} onClick={() => previewTrack(t.key)} style={{ ...ghost, minWidth: 88, borderRadius: 14, color: ACCENT, borderColor: ACCENT, fontWeight: 600 }}>{previewKey === t.key ? "■ 멈춤" : "▶ 듣기"}</button>
                </div>
              ))}
            </div>
            <p style={{ margin: "12px 0 0", fontSize: 12.5, lineHeight: 1.7, color: "#9A8189" }}>위 두 곡은 공유마당(한국저작권위원회)의 CC BY 곡이에요. 곡명·작곡가·출처는 청첩장 맨 아래에 자동으로 표시돼요.</p>

            <div style={{ marginTop: 16, padding: "14px 16px", border: `1px dashed ${c.music === "custom" ? ACCENT : "#DCC4CC"}`, borderRadius: 14, background: c.music === "custom" ? "#F9EFF2" : "#FDFAFB" }}>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>내 음악 올리기</div>
              <p style={{ margin: "0 0 10px", fontSize: 12.5, lineHeight: 1.7, color: "#9A8189" }}>mp3 · m4a, <b>3MB 이하</b> (3분 안팎의 노래). 용량이 큰 파일은 음질을 낮춰 줄인 뒤 올려 주세요.</p>
              {c.music === "custom" && c.musicFile ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <Field id="musicName" label="청첩장에 표시할 곡 이름"><input id="musicName" style={input} value={c.musicName} maxLength={40} placeholder="예: 우리의 노래" onChange={(e) => update({ musicName: e.target.value })} /></Field>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <button type="button" onClick={() => previewTrack("custom")} style={{ ...ghost, color: ACCENT, borderColor: ACCENT, fontWeight: 600 }}>{previewKey === "custom" ? "■ 멈춤" : "▶ 듣기"}</button>
                    <button type="button" onClick={() => { previewAudio.current?.pause(); setPreviewKey(""); update({ music: "", musicFile: "", musicName: "" }); }} style={{ ...ghost, color: "#B25B4B" }}>삭제</button>
                    <button type="button" disabled={!musicOk || musicBusy} onClick={() => musicInput.current?.click()} style={{ ...ghost, opacity: !musicOk || musicBusy ? 0.5 : 1 }}>다른 파일로 바꾸기</button>
                  </div>
                </div>
              ) : (
                <button type="button" disabled={!musicOk || musicBusy} onClick={() => musicInput.current?.click()} style={{ ...ghost, borderColor: ACCENT, color: ACCENT, fontWeight: 600, opacity: !musicOk || musicBusy ? 0.5 : 1 }}>{musicBusy ? "올리는 중…" : "음악 파일 올리기"}</button>
              )}
              <input ref={musicInput} type="file" accept="audio/mpeg,audio/mp4,audio/x-m4a,.mp3,.m4a" hidden onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ""; if (f) void uploadMusic(f); }} />
              <label style={{ display: "flex", gap: 10, alignItems: "flex-start", marginTop: 12, fontSize: 12.5, lineHeight: 1.7, color: "#6B5A60", cursor: "pointer" }}>
                <input type="checkbox" checked={musicOk} onChange={(e) => setMusicOk(e.target.checked)} style={{ marginTop: 4, width: 18, height: 18, accentColor: ACCENT }} />
                <span>이 음악을 청첩장에 쓸 수 있는 권리(직접 만든 곡이거나 사용 허락·라이선스)가 있음을 확인합니다. 저작권 문제가 확인되면 음악이 삭제될 수 있어요.</span>
              </label>
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

          <Card title="청첩장 관리" hint="작성 중에는 입력할 때마다 자동으로 저장돼요. 나중에 휴대폰 인증으로 ‘내 청첩장’에서 이어서 쓸 수 있어요.">
            {status === "published" && (
              <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
                <button type="button" style={ghost} onClick={() => { setCopied(false); setDone(true); }}>주소 복사</button>
                <button type="button" style={ghost} onClick={hide}>비공개로 바꾸기</button>
              </div>
            )}
            <div style={{ marginTop: status === "published" ? 4 : 0, paddingTop: 14, borderTop: `1px solid ${BORDER}`, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <p style={{ margin: 0, flex: "1 1 220px", fontSize: 12.5, lineHeight: 1.6, color: "#9A8189" }}>지우면 되돌릴 수 없고, 올린 사진과 방명록도 함께 사라져요.</p>
              <button type="button" onClick={removeInvitation} style={{ minHeight: 40, padding: "0 16px", borderRadius: 20, border: "1px solid #E7C4BC", background: "#FFFFFF", color: "#B25B4B", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>이 청첩장 지우기</button>
            </div>
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

      {/* 좁은 화면(휴대폰): 임시저장·발행을 화면 아래에 고정해 항상 보이게 한다 */}
      {status !== "published" && (
        <>
          <div className="inv-only-narrow" aria-hidden="true" style={{ height: 84 }} />
          <div className="inv-only-narrow" style={{ position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 45, gap: 10, padding: "10px 14px calc(10px + env(safe-area-inset-bottom))", background: "#FFFFFF", borderTop: `1px solid ${BORDER}`, boxShadow: "0 -6px 20px rgba(51,35,42,0.08)" }}>
            <button type="button" onClick={() => void saveDraft()} style={{ flex: "1 1 0", justifyContent: "center", minHeight: 48, borderRadius: 24, border: `1.5px solid ${ACCENT}`, background: "#FFFFFF", color: ACCENT, fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>임시저장</button>
            <button type="button" onClick={publish} style={{ flex: "2 1 0", justifyContent: "center", minHeight: 48, borderRadius: 24, border: 0, background: ACCENT, color: "#FFFFFF", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>{publishLabel}</button>
          </div>
        </>
      )}

      {/* 결제 전 이메일 확인 (이니시스 필수 항목) */}
      {emailAsk && (
        <div role="dialog" aria-modal="true" aria-label="결제 이메일" style={{ position: "fixed", inset: 0, zIndex: 70, background: "rgba(51,35,42,0.5)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!EMAIL_RE.test(payEmail.trim())) return setEmailErr("이메일 주소를 확인해 주세요. 예: name@example.com");
              setEmailAsk(false);
              void startPayment();
            }}
            style={{ width: "100%", maxWidth: 420, background: "#FFFFFF", borderRadius: 22, padding: 28, boxSizing: "border-box" }}
          >
            <h2 style={{ margin: 0, fontFamily: fontSerif, fontSize: 20, fontWeight: 600 }}>결제 영수증을 받을 이메일</h2>
            <p style={{ margin: "8px 0 16px", fontSize: 13.5, lineHeight: 1.7, color: "#6B5A60" }}>카드 결제에 필요한 정보예요. 결제 확인과 영수증에만 쓰이고, 웨딩버틀러에는 저장하지 않아요.</p>
            <label htmlFor="payEmail" style={{ display: "block", fontSize: 13, fontWeight: 500, marginBottom: 6 }}>이메일 <span style={{ fontSize: 11, fontWeight: 700, padding: "1px 7px", borderRadius: 999, color: "#B03A52", background: "#FBEAEE" }}>필수</span></label>
            <input id="payEmail" type="email" inputMode="email" autoComplete="email" autoFocus value={payEmail} onChange={(e) => { setPayEmail(e.target.value); setEmailErr(""); }} placeholder="name@example.com" style={input} />
            {emailErr && <p role="alert" style={{ margin: "8px 0 0", fontSize: 12.5, color: "#B03A52" }}>{emailErr}</p>}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 20 }}>
              <button type="button" onClick={() => setEmailAsk(false)} style={ghost}>닫기</button>
              <button type="submit" style={{ minHeight: 44, padding: "0 22px", borderRadius: 22, border: 0, background: ACCENT, color: "#FFFFFF", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>{`${PREMIUM_PRICE.toLocaleString("ko-KR")}원 결제하기`}</button>
            </div>
          </form>
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
