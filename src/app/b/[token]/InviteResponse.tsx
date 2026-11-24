"use client";

import { useState, useTransition, type CSSProperties } from "react";
import { respondAction } from "./actions";
import { INVITE_STATE_MESSAGE, type InviteInfo, type InviteState } from "@/lib/butler-invite";

const btn = (bg: string, color: string, border = bg): CSSProperties => ({ flex: 1, padding: "16px 0", borderRadius: 999, fontSize: 16, fontWeight: 600, background: bg, color, border: `1px solid ${border}`, cursor: "pointer" });

export default function InviteResponse({ token, info, initial, locked }: { token: string; info: InviteInfo; initial: InviteState; locked: boolean }) {
  const [state, setState] = useState<InviteState>(initial);
  const [error, setError] = useState("");
  const [pending, start] = useTransition();

  function send(action: "accept" | "decline") {
    start(async () => {
      const res = await respondAction(token, action);
      if (!res) { setError("잠시 후 다시 시도해 주세요."); return; }
      setError("");
      setState(res.state);
    });
  }

  const rows: [string, string][] = [["일시", `${info.date} ${info.time}`], ["장소", info.venue], ["근무 시작", info.start]];
  // 기한 전에는 답을 바꿀 수 있으므로 응답한 뒤에도 버튼을 둔다(지금 고른 답은 강조)
  const answerable = (state === "pending" || state === "available" || state === "unavailable") && !locked;
  return (
    <>
      <p style={{ fontSize: 15, lineHeight: 1.8, color: "#473A3F", margin: "0 0 22px" }}>{info.name} 버틀러님, 아래 예식에 참석이 가능하신지 알려주세요.</p>
      <dl style={{ margin: "0 0 26px", padding: "18px 20px", background: "#fff", borderRadius: 8, border: "1px solid #E7D5DA" }}>
        {rows.map(([k, v]) => (
          <div key={k} style={{ display: "flex", gap: 14, padding: "7px 0", fontSize: 15 }}>
            <dt style={{ width: 72, color: "#8C7A80", flexShrink: 0 }}>{k}</dt>
            <dd style={{ margin: 0 }}>{v}</dd>
          </div>
        ))}
      </dl>
      {state !== "pending" && state !== "not_found" ? (
        <p style={{ fontSize: 15, lineHeight: 1.9, margin: "0 0 18px", padding: "16px 18px", borderRadius: 8, background: state === "available" ? "#E8F1EA" : "#fff", border: "1px solid #E7D5DA" }}>{INVITE_STATE_MESSAGE[state]}</p>
      ) : null}
      {locked ? <p style={{ fontSize: 14, color: "#6B5A60", margin: 0, lineHeight: 1.8 }}>이미 배정되어 여기서는 답을 바꿀 수 없습니다. 변경이 필요하면 웨딩버틀러(010-4418-1003)로 연락해 주세요.</p> : null}
      {answerable ? (
        <>
          <div style={{ display: "flex", gap: 10 }}>
            <button type="button" disabled={pending || state === "available"} onClick={() => send("accept")} style={{ ...btn(state === "available" ? "#33232A" : "#33232A", "#F3E9EB"), opacity: state === "unavailable" ? 0.55 : 1 }}>{pending ? "처리 중…" : "참석 가능"}</button>
            <button type="button" disabled={pending || state === "unavailable"} onClick={() => send("decline")} style={{ ...btn("#fff", "#33232A", "#DCC4CC"), opacity: state === "available" ? 0.55 : 1 }}>참석 불가</button>
          </div>
          <p style={{ fontSize: 13, color: "#8C7A80", margin: "14px 0 0", lineHeight: 1.7 }}>{state === "pending" ? `${info.deadline}까지 응답해 주세요. ` : "예식일 전까지 이 링크에서 답을 바꿀 수 있습니다. "}참석 가능으로 응답하셔도 배정은 따로 확정해 안내드립니다.</p>
        </>
      ) : null}
      {error ? <p style={{ fontSize: 14, color: "#A9647E", margin: "14px 0 0" }}>{error}</p> : null}
    </>
  );
}
