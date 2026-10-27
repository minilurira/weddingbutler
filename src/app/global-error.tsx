"use client";

import { useEffect } from "react";

// 최상위(레이아웃)에서 난 오류용 안내. 기록 방식은 error.tsx와 같다.
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    try {
      void fetch("/api/log/client", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: error.message || "최상위 화면 오류", where: window.location.pathname, digest: error.digest }),
        keepalive: true,
      });
    } catch {
      /* 무시 */
    }
  }, [error]);
  return (
    <html lang="ko">
      <body style={{ margin: 0, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, textAlign: "center", background: "#F3E9EB", color: "#33232A", fontFamily: "sans-serif" }}>
        <div style={{ maxWidth: 380 }}>
          <h1 style={{ margin: "0 0 12px", fontSize: 22 }}>문제가 생겼어요</h1>
          <p style={{ margin: "0 0 22px", fontSize: 15, lineHeight: 1.8, color: "#6B5A60" }}>잠시 뒤에 다시 시도해 주세요. 계속되면 고객센터로 알려 주세요.</p>
          <button type="button" onClick={reset} style={{ minHeight: 46, padding: "0 28px", border: 0, borderRadius: 23, background: "#33232A", color: "#F3E9EB", fontSize: 15, cursor: "pointer" }}>다시 시도</button>
        </div>
      </body>
    </html>
  );
}
