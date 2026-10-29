import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";
import { GUIDES, GUIDE_UPDATED } from "@/lib/guide";

// 페이지 내용을 실제로 고친 날. 매번 오늘 날짜로 내보내면 검색엔진이 수정일을 믿지 않으므로, 내용을 바꿀 때 함께 고친다.
const PAGES: { route: string; updated: string }[] = [
  { route: "", updated: "2026-10-29" },
  { route: "/service", updated: "2026-10-26" },
  { route: "/pricing", updated: "2026-10-29" },
  { route: "/invitation", updated: "2026-10-27" },
  { route: "/contact", updated: "2026-10-25" },
  { route: "/terms", updated: "2026-10-25" },
  { route: "/terms/invitation", updated: "2026-10-27" },
  { route: "/privacy", updated: "2026-10-25" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const pages: MetadataRoute.Sitemap = PAGES.map(({ route, updated }) => ({
    url: `${SITE_URL}${route}`,
    lastModified: new Date(updated),
    changeFrequency: "monthly",
    priority: route === "" ? 1 : 0.8,
  }));
  // 검색어별 안내 글(가이드)
  const guides: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/guide`, lastModified: new Date(GUIDE_UPDATED), changeFrequency: "monthly", priority: 0.8 },
    ...GUIDES.map((g) => ({ url: `${SITE_URL}/guide/${g.slug}`, lastModified: new Date(GUIDE_UPDATED), changeFrequency: "monthly" as const, priority: 0.7 })),
  ];
  return [...pages, ...guides];
}
