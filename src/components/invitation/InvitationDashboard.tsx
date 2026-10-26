"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, type CSSProperties } from "react";
import { fontSerif } from "@/lib/style";

interface Stats {
  total: number;
  today: number;
  week: { date: string; count: number }[];
  sources: { source: string; count: number }[];
  actions: Record<string, number>;
  guestbook: number;
}
interface Info { status: "draft" | "published" | "hidden"; url: string; groom: string; bride: string; date: string }
interface Entry { id: string; name: string; message: string; created_at: string }

const SOURCE: Record<string, { label: string; color: string }> = {
  kakao: { label: "카카오톡", color: "#A9647E" },
  naver: { label: "네이버", color: "#7BA68A" },
  sns: { label: "SNS", color: "#C9A25B" },
  etc: { label: "문자·브라우저 등", color: "#D6A3B6" },
};
const card: CSSProperties = { background: "#FFFFFF", border: "1px solid #E7D5DA", borderRadius: 16, padding: "16px 18px" };
const ghost: CSSProperties = { minHeight: 44, padding: "0 16px", borderRadius: 22, border: "1px solid #DCC4CC", background: "#FFFFFF", color: "#473A3F", fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: "inherit", textDecoration: "none", display: "inline-flex", alignItems: "center" };

function csvCell(v: string) {
  return `"${v.replace(/"/g, '""').replace(/\r?\n/g, " ")}"`;
}

export function InvitationDashboard({ id }: { id: string }) {
  const [info, setInfo] = useState<Info | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [err, setErr] = useState("");
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const [a, b, c] = await Promise.all([
      fetch(`/api/invitation/${id}`, { cache: "no-store" }).catch(() => null),
      fetch(`/api/invitation/${id}/stats`, { cache: "no-store" }).catch(() => null),
      fetch(`/api/invitation/${id}/guestbook`, { cache: "no-store" }).catch(() => null),
    ]);
    if (!a || a.status === 401) return void (window.location.href = "/invitation/new");
    if (!a.ok) return setErr("이 청첩장을 찾을 수 없어요.");
    const d = (await a.json()) as { status: Info["status"]; url: string; content: { groom: string; bride: string; date: string } };
    setInfo({ status: d.status, url: d.url, groom: d.content.groom, bride: d.content.bride, date: d.content.date });
    if (b && b.status === 403) return setErr("제작자 대시보드는 프리미엄 템플릿을 결제한 청첩장에서 볼 수 있어요.");
    if (b && b.ok) setStats(((await b.json()) as { stats: Stats }).stats);
    if (c && c.ok) setEntries(((await c.json()) as { entries: Entry[] }).entries);
  }, [id]);
  useEffect(() => {
    void load();
  }, [load]);

  async function copyUrl() {
    if (!info) return;
    try {
      await navigator.clipboard.writeText(info.url);
      setCopied(true);
    } catch {
      window.prompt("주소를 길게 눌러 복사해 주세요", info.url);
    }
  }

  async function setOpen(open: boolean) {
    if (!open && !window.confirm("비공개로 바꾸면 주소로 들어와도 청첩장이 보이지 않아요. 다시 공개하면 같은 주소로 열려요. 바꿀까요?")) return;
    setBusy(true);
    try {
      const r = await fetch(`/api/invitation/${id}/publish`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: open ? "publish" : "hide" }) });
      if (r.ok) setInfo((p) => (p ? { ...p, status: open ? "published" : "hidden" } : p));
      else window.alert("바꾸지 못했어요. 잠시 뒤에 다시 시도해 주세요.");
    } finally {
      setBusy(false);
    }
  }

  async function removeEntry(entryId: string) {
    const r = await fetch(`/api/invitation/${id}/guestbook`, { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ entryId }) });
    if (r.ok) setEntries((p) => p.filter((e) => e.id !== entryId));
  }

  function downloadCsv() {
    const rows = [["이름", "메시지", "남긴 시각"], ...entries.map((e) => [e.name, e.message, new Date(e.created_at).toLocaleString("ko-KR")])];
    // 엑셀에서 한글이 깨지지 않도록 UTF-8 BOM을 붙인다
    const blob = new Blob(["\ufeff" + rows.map((r) => r.map(csvCell).join(",")).join("\r\n")], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "방명록.csv";
    a.click();
    URL.revokeObjectURL(a.href);
  }

  if (err) return <main style={{ padding: "80px 20px", textAlign: "center" }}><p style={{ marginBottom: 16 }}>{err}</p><Link href={`/invitation/edit/${id}`} style={{ color: "#A9647E" }}>청첩장으로 돌아가기</Link></main>;
  if (!info || !stats) return <main style={{ padding: 80, textAlign: "center", color: "#6B5A60" }}>불러오는 중…</main>;

  const max = Math.max(1, ...stats.week.map((d) => d.count));
  const srcTotal = stats.sources.reduce((a, s) => a + s.count, 0) || 1;
  const act = (k: string) => stats.actions[k] ?? 0;
  const tiles: [string, number, string][] = [
    ["총 방문", stats.total, "최근 30일"],
    ["오늘 방문", stats.today, "한국 시간 0시부터"],
    ["길찾기 누름", act("map"), "지도 앱 버튼"],
    ["계좌 복사", act("copy_account"), "마음 전하실 곳"],
  ];

  return (
    <div style={{ background: "#F3E9EB", minHeight: "100vh", color: "#33232A" }}>
      <header style={{ background: "#FFFFFF", borderBottom: "1px solid #E7D5DA" }}>
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "16px clamp(16px,4vw,24px)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Link href={`/invitation/edit/${id}`} style={{ fontSize: 14, color: "#6B5A60", minHeight: 44, display: "inline-flex", alignItems: "center" }}>← 청첩장 고치기</Link>
            <span style={{ marginLeft: "auto", padding: "4px 10px", borderRadius: 11, background: "#F9EFF2", color: "#8E4E68", fontSize: 11, fontWeight: 700 }}>프리미엄</span>
          </div>
          <h1 style={{ fontFamily: fontSerif, fontSize: 24, fontWeight: 600, margin: "6px 0 2px" }}>{[info.groom, info.bride].filter(Boolean).join(" & ") || "내 청첩장"}</h1>
          <div style={{ fontSize: 13, color: "#6B5A60" }}>{info.date || "날짜 미정"} · <b style={{ color: info.status === "published" ? "#2F6B45" : "#8E4E68" }}>{info.status === "published" ? "공개 중" : "비공개"}</b></div>
          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <input readOnly aria-label="청첩장 주소" value={info.url} onFocus={(e) => e.target.select()} style={{ flex: 1, minWidth: 0, height: 44, border: "1px solid #DCC4CC", borderRadius: 12, padding: "0 12px", fontSize: 13, background: "#FBF6F7", color: "#33232A", fontFamily: "inherit" }} />
            <button type="button" onClick={copyUrl} style={{ minHeight: 44, padding: "0 16px", border: 0, borderRadius: 12, background: "#A9647E", color: "#FFF", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>{copied ? "복사했어요" : "URL 복사"}</button>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 720, margin: "0 auto", padding: "16px clamp(16px,4vw,24px) 60px", display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 10 }}>
          {tiles.map(([l, v, sub]) => (
            <div key={l} style={card}>
              <div style={{ fontSize: 12, color: "#6B5A60" }}>{l}</div>
              <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.02em" }}>{v.toLocaleString("ko-KR")}</div>
              <div style={{ fontSize: 11, color: "#9A8189" }}>{sub}</div>
            </div>
          ))}
        </div>

        <section style={card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}><b style={{ fontSize: 14 }}>최근 7일 방문</b><span style={{ fontSize: 11, color: "#9A8189" }}>하루 방문 수 · 내가 연 것은 제외</span></div>
          <div role="img" aria-label={`최근 7일 방문: ${stats.week.map((d) => `${d.date.slice(5)} ${d.count}회`).join(", ")}`} style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 130, marginTop: 14 }}>
            {stats.week.map((d, i) => (
              <div key={d.date} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <span style={{ fontSize: 11, color: "#6B5A60" }}>{d.count}</span>
                <div style={{ width: "100%", height: Math.round((d.count / max) * 84) + 4, borderRadius: "6px 6px 2px 2px", background: i === stats.week.length - 1 ? "#A9647E" : "#E2BFCB" }} />
                <span style={{ fontSize: 10, color: "#9A8189" }}>{d.date.slice(5).replace("-", "/")}</span>
              </div>
            ))}
          </div>
        </section>

        <section style={card}>
          <b style={{ fontSize: 14 }}>어디서 열었나요</b>
          {stats.total === 0 ? <p style={{ margin: "10px 0 0", fontSize: 13, color: "#9A8189" }}>아직 방문 기록이 없어요. 주소를 카카오톡이나 문자로 보내 보세요.</p> : (
            <>
              <div style={{ display: "flex", height: 12, borderRadius: 6, overflow: "hidden", margin: "14px 0 10px" }}>
                {stats.sources.map((s) => <div key={s.source} style={{ width: `${(s.count / srcTotal) * 100}%`, background: (SOURCE[s.source] ?? SOURCE.etc).color }} />)}
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 16px", fontSize: 12, color: "#473A3F" }}>
                {stats.sources.map((s) => (
                  <span key={s.source} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ width: 10, height: 10, borderRadius: 5, background: (SOURCE[s.source] ?? SOURCE.etc).color }} />
                    {(SOURCE[s.source] ?? SOURCE.etc).label} {Math.round((s.count / srcTotal) * 100)}%
                  </span>
                ))}
              </div>
            </>
          )}
        </section>

        <section style={card}>
          <b style={{ fontSize: 14 }}>하객이 누른 버튼</b>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(130px,1fr))", gap: 8, marginTop: 12, fontSize: 13 }}>
            {([["길찾기", "map"], ["계좌 복사", "copy_account"], ["주소 복사", "copy_address"], ["전화", "call"], ["문자", "sms"], ["청첩장 주소 복사", "copy_url"]] as const).map(([l, k]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "10px 12px", borderRadius: 10, background: "#FBF6F7" }}><span>{l}</span><b>{act(k)}</b></div>
            ))}
          </div>
        </section>

        <section style={card}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <b style={{ fontSize: 14, flex: 1 }}>방명록 {entries.length}개</b>
            <button type="button" style={ghost} disabled={entries.length === 0} onClick={downloadCsv}>엑셀로 내려받기</button>
          </div>
          {entries.length === 0 && <p style={{ margin: "10px 0 0", fontSize: 13, color: "#9A8189" }}>아직 받은 글이 없어요.</p>}
          {entries.map((e) => (
            <div key={e.id} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "12px 0", borderTop: "1px solid #F0E3E6" }}>
              <div style={{ flex: 1, minWidth: 0, fontSize: 14 }}><b>{e.name}</b><div style={{ marginTop: 4, lineHeight: 1.6, whiteSpace: "pre-line", color: "#473A3F", wordBreak: "break-word" }}>{e.message}</div></div>
              <button type="button" aria-label={`${e.name} 님 글 삭제`} onClick={() => removeEntry(e.id)} style={{ ...ghost, color: "#B25B4B", flex: "0 0 auto" }}>삭제</button>
            </div>
          ))}
        </section>

        <section style={card}>
          <b style={{ fontSize: 14 }}>청첩장 관리</b>
          <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
            <Link href={`/invitation/edit/${id}`} style={{ ...ghost, background: "#A9647E", color: "#FFFFFF", border: 0, fontWeight: 700 }}>청첩장 고치기</Link>
            <a href={info.url} target="_blank" rel="noopener noreferrer" style={ghost}>하객 화면 보기</a>
            {info.status === "published"
              ? <button type="button" style={ghost} disabled={busy} onClick={() => setOpen(false)}>비공개로 바꾸기</button>
              : <button type="button" style={ghost} disabled={busy} onClick={() => setOpen(true)}>다시 공개하기</button>}
          </div>
          <p style={{ margin: "12px 0 0", fontSize: 12, lineHeight: 1.7, color: "#9A8189" }}>이 대시보드는 인증한 휴대폰 번호로 만든 분만 열 수 있어요. 숫자는 하객 화면에서 기록된 값이고, 만든 분이 직접 연 것은 세지 않아요.</p>
        </section>
      </main>
    </div>
  );
}
