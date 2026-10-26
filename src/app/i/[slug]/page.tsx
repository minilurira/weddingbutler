import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { InvitationView } from "@/components/invitation/InvitationView";
import { dateLabel } from "@/lib/invitation/content";
import { getBySlug, photoUrl } from "@/lib/invitation/store";
import { SITE_URL } from "@/lib/seo";

export const dynamic = "force-dynamic";

async function load(slug: string) {
  const row = await getBySlug(slug).catch(() => null);
  return row && row.status === "published" ? row : null;
}

// 검색에 나오지 않게 하고(noindex), 카카오톡·문자로 공유했을 때 보이는 제목·설명·사진을 정한다
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const row = await load(params.slug);
  if (!row) return { title: "청첩장", robots: { index: false, follow: false } };
  const c = row.content;
  const title = `${c.groom} ♥ ${c.bride} 결혼합니다`;
  const description = [dateLabel(c), [c.venue, c.hall].filter(Boolean).join(" ")].filter(Boolean).join(" · ");
  const image = c.cover ? photoUrl(c.cover) : undefined;
  return {
    title,
    description,
    robots: { index: false, follow: false },
    alternates: { canonical: `${SITE_URL}/i/${row.slug}` },
    openGraph: { type: "website", title, description, url: `${SITE_URL}/i/${row.slug}`, images: image ? [{ url: image }] : undefined },
    twitter: { card: image ? "summary_large_image" : "summary", title, description, images: image ? [image] : undefined },
  };
}

export default async function InvitationPublicPage({ params }: { params: { slug: string } }) {
  const row = await load(params.slug);
  if (!row) notFound();
  return (
    <div style={{ background: "#E9E2D6", minHeight: "100vh" }}>
      <InvitationView content={row.content} photoUrl={photoUrl} slug={row.slug} />
    </div>
  );
}
