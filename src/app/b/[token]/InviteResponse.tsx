"use client";

import { useState, useTransition, type CSSProperties } from "react";
import { respondAction } from "./actions";
import { INVITE_STATE_MESSAGE, type InviteInfo, type InviteState } from "@/lib/butler-invite";

const btn = (bg: string, color: string, border = bg): CSSProperties => ({ flex: 1, padding: "16px 0", borderRadius: 999, fontSize: 16, fontWeight: 600, background: bg, color, border: `1px solid ${border}`, cursor: "pointer" });

export default function InviteResponse({ token, info, initial }: { token: string; info: InviteInfo; initial: InviteState }) {
  const [state, setState] = useState<InviteState>(initial);
  const [message, setMessage] = useState("");
  const [pending, start] = useTransition();

  function send(action: "accept" | "decline") {
    if (action === "decline" && !window.confirm("불참으로 응답할까요?")) return;
    start(async () => {
      const res = await respondAction(token, action);
      if (!res) { setMessage("잠시 후 다시 시도해 주세요."); return; }
      setState(res.state);
      setMessage(res.message ?? "");
    });
  }

  const rows: [string, string][] = [["일시", `${info.date} ${info.time}`], ["장소", info.venue], ["담당", info.side], ["근무 시작", info.start], ["정산금", info.pay]];
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
      {state === "pending" ? (
        <>
          <div style={{ display: "flex", gap: 10 }}>
            <button type="button" disabled={pending} onClick={() => send("accept")} style={btn("#33232A", "#F3E9EB")}>{pending ? "처리 중…" : "참석"}</button>
            <button type="button" disabled={pending} onClick={() => send("decline")} style={btn("#fff", "#33232A", "#DCC4CC")}>불참</button>
          </div>
          <p style={{ fontSize: 13, color: "#8C7A80", margin: "14px 0 0", lineHeight: 1.7 }}>선착순으로 확정되며, {info.deadline}까지 응답해 주세요.</p>
        </>
      ) : null}
      {state !== "pending" && state !== "not_found" ? (
        <p style={{ fontSize: 15, lineHeight: 1.9, margin: 0, padding: "16px 18px", borderRadius: 8, background: state === "accepted" ? "#E8F1EA" : "#fff", border: "1px solid #E7D5DA" }}>{INVITE_STATE_MESSAGE[state]}</p>
      ) : null}
      {message ? <p style={{ fontSize: 14, color: "#A9647E", margin: "14px 0 0" }}>{message}</p> : null}
    </>
  );
}
