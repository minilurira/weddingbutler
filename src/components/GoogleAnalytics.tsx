"use client";

import { useEffect } from "react";
import { isReportHost } from "@/lib/record-host";
import { GA_ID } from "@/lib/seo";
import { flushQueuedEvents } from "@/lib/analytics";

// 고객 축의 기록(report 도메인, /r/<토큰>)은 주소에 접근 토큰이 들어 있어 태그를 싣지 않는다.
export function GoogleAnalytics() {
  useEffect(() => {
    const { host, pathname } = window.location;
    if (isReportHost(host) || pathname.startsWith("/r/")) return;

    const w = window as unknown as { dataLayer: unknown[]; gtag?: (...args: unknown[]) => void };
    w.dataLayer = w.dataLayer || [];
    if (!w.gtag) {
      w.gtag = function gtag() {
        // gtag.js는 arguments 객체 그대로를 받아야 한다
        // eslint-disable-next-line prefer-rest-params
        w.dataLayer.push(arguments);
      };
    }
    w.gtag("js", new Date());
    w.gtag("config", GA_ID);
    flushQueuedEvents();
    const s = document.createElement("script");
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
    document.head.appendChild(s);
  }, []);

  return null;
}
