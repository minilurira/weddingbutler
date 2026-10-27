import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";
import { GUIDES, GUIDE_UPDATED } from "@/lib/guide";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", "/service", "/pricing", "/invitation", "/contact", "/terms", "/terms/invitation", "/privacy"];
  const now = new Date();
  const pages: MetadataRoute.Sitemap = routes.map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: now,
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
