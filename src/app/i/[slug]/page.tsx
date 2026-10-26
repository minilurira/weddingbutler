import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { InvitationView } from "@/components/invitation/InvitationView";
import { TEMPLATE_OUTER_BG } from "@/lib/invitation/theme";
import { isTemplate } from "@/lib/invitation/content";
import { dateLabel } from "@/lib/invitation/content";
import { getBySlug, isLive, photoBase } from "@/lib/invitation/store";
import { SITE_URL } from "@/lib/seo";

function ExpiredNotice() {
  return (
    <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, background: "#F6F1EA", textAlign: "center", color: "#473A3F" }}>
      <div style={{ maxWidth: 360 }}>
        <h1 style={{ margin: "0 0 12px", fontSize: 20, fontWeight: 600 }}>보관 기간이 끝난 청첩장이에요</h1>
        <p style={{ margin: "0 0 24px", fontSize: 14, lineHeight: 1.8, color: "#6B5A60" }}>모바일 청첩장은 발행일부터 6개월(예식일이 더 늦으면 예식일 다음날)까지 열려 있어요.</p>
        <a href="https://weddingbutler.co.kr/invitation" style={{ display: "inline-flex", alignItems: "center", minHeight: 44, padding: "0 22px", borderRadius: 22, background: "#A9647E", color: "#FFFFFF", fontSize: 14, textDecoration: "none" }}>웨딩버틀러에서 청첩장 만들기</a>
      </div>
    </main>
  );
}

export const dynamic = "force-dynamic";

async function load(slug: string) {
  const row = await getBySlug(slug).catch(() => null);
  return row && isLive(row) ? row : null;
}

// 검색에 나오지 않게 하고(noindex), 카카오톡·문자로 공유했을 때 보이는 제목·설명·사진을 정한다
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const row = await load(params.slug);
  if (!row) return { title: "청첩장", robots: { index: false, follow: false } };
  const c = row.content;
  const title = `${c.groom} ♥ ${c.bride} 결혼합니다`;
  const description = [dateLabel(c), [c.venue, c.hall].filter(Boolean).join(" ")].filter(Boolean).join(" · ");
  return {
    title,
    description,
    robots: { index: false, follow: false },
    alternates: { canonical: `${SITE_URL}/i/${row.slug}` },
    openGraph: { type: "website", title, description, url: `${SITE_URL}/i/${row.slug}` },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function InvitationPublicPage({ params }: { params: { slug: string } }) {
  const row = await load(params.slug);
  if (!row) {
    const old = await getBySlug(params.slug).catch(() => null);
    if (old && old.status === "published") return <ExpiredNotice />; // 공개였지만 보관 기간이 지난 청첩장
    notFound();
  }
  return (
    <div style={{ background: isTemplate(row.template) ? TEMPLATE_OUTER_BG[row.template] : "#E9E2D6", minHeight: "100vh" }}>
      <InvitationView content={row.content} photoBase={photoBase()} slug={row.slug} template={row.template} />
    </div>
  );
}
