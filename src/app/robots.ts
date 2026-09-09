import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // 개인정보가 담긴 경로는 검색엔진이 훑지 않게 막는다.
      disallow: ["/admin", "/booking", "/api/", "/qna/write"],
    },
    sitemap: `${SITE.url}/sitemap.xml`,
  };
}
