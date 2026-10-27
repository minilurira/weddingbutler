"use client";

import { useEffect } from "react";

// 화면을 그리다가 오류가 났을 때 보여 주는 안내. 오류는 조용히 기록한다(전송에 실패해도 화면에는 영향이 없다).
export default function RouteError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    try {
      void fetch("/api/log/client", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: error.message || "화면 오류", where: window.location.pathname, digest: error.digest }),
        keepalive: true,
      });
    } catch {
      /* 무시 */
    }
  }, [error]);
  return (
    <main style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, textAlign: "center", background: "#F3E9EB", color: "#33232A" }}>
      <div style={{ maxWidth: 380 }}>
        <h1 style={{ margin: "0 0 12px", fontSize: 22, fontWeight: 600 }}>문제가 생겼어요</h1>
        <p style={{ margin: "0 0 22px", fontSize: 15, lineHeight: 1.8, color: "#6B5A60" }}>화면을 불러오는 중에 오류가 났어요. 잠시 뒤에 다시 시도해 주세요. 계속되면 고객센터로 알려 주세요.</p>
        <button type="button" onClick={reset} style={{ minHeight: 46, padding: "0 28px", border: 0, borderRadius: 23, background: "#33232A", color: "#F3E9EB", fontSize: 15, cursor: "pointer" }}>다시 시도</button>
      </div>
    </main>
  );
}
