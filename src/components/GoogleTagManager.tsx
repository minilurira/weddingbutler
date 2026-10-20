"use client";

import { useEffect } from "react";
import { isReportHost } from "@/lib/record-host";
import { GTM_ID } from "@/lib/seo";

// 고객 축의 기록(report 도메인, /r/<토큰>)은 주소에 접근 토큰이 들어 있어 태그를 싣지 않는다.
export function GoogleTagManager() {
  useEffect(() => {
    const { host, pathname } = window.location;
    if (isReportHost(host) || pathname.startsWith("/r/")) return;

    const w = window as unknown as { dataLayer: unknown[] };
    w.dataLayer = w.dataLayer || [];
    w.dataLayer.push({ "gtm.start": Date.now(), event: "gtm.js" });
    const s = document.createElement("script");
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtm.js?id=${GTM_ID}`;
    document.head.appendChild(s);
  }, []);

  return null;
}
