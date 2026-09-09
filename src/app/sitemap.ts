import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  // 예약/관리자/문의 상세는 색인 대상이 아니라 제외한다.
  const routes: [string, MetadataRoute.Sitemap[number]["changeFrequency"], number][] = [
    ["", "weekly", 1],
    ["/service", "monthly", 0.9],
    ["/pricing", "monthly", 0.9],
    ["/qna", "daily", 0.6],
    ["/policy/terms", "yearly", 0.2],
    ["/policy/privacy", "yearly", 0.2],
    ["/policy/refund", "yearly", 0.3],
  ];

  return routes.map(([path, changeFrequency, priority]) => ({
    url: `${SITE.url}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
  }));
}
