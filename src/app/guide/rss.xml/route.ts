import { SITE_NAME, SITE_URL } from "@/lib/seo";
import { GUIDES, GUIDE_UPDATED } from "@/lib/guide";

// 가이드 글 RSS. 네이버 서치어드바이저 "RSS 제출"에 이 주소(/guide/rss.xml)를 등록한다.
export const dynamic = "force-static";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export function GET() {
  const date = new Date(GUIDE_UPDATED).toUTCString();
  const items = GUIDES.map((g) => {
    const url = `${SITE_URL}/guide/${g.slug}`;
    return `    <item>
      <title>${esc(g.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description>${esc(g.description)}</description>
      <pubDate>${date}</pubDate>
    </item>`;
  }).join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${esc(`${SITE_NAME} 가이드`)}</title>
    <link>${SITE_URL}/guide</link>
    <atom:link href="${SITE_URL}/guide/rss.xml" rel="self" type="application/rss+xml" />
    <description>축의대행·축의대대행 가격·인원·정산과 무료 모바일청첩장 안내</description>
    <language>ko</language>
    <lastBuildDate>${date}</lastBuildDate>
${items}
  </channel>
</rss>
`;
  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
}
