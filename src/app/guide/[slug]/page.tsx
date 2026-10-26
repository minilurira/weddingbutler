import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { OpenModalButton } from "@/components/OpenModalButton";
import { GUIDES, GUIDE_UPDATED, getGuide } from "@/lib/guide";
import { fontDisplay, fontSerif } from "@/lib/style";
import { SITE_NAME, SITE_URL } from "@/lib/seo";

export function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const g = getGuide(params.slug);
  if (!g) return {};
  const url = `${SITE_URL}/guide/${g.slug}`;
  return {
    title: g.title,
    description: g.description,
    alternates: { canonical: `/guide/${g.slug}` },
    openGraph: { type: "article", locale: "ko_KR", url, siteName: SITE_NAME, title: g.title, description: g.description, images: [{ url: "/img/og-image.jpg", width: 1376, height: 768, alt: SITE_NAME }] },
  };
}

const h2: React.CSSProperties = { fontFamily: fontSerif, fontSize: "clamp(20px,4.2vw,24px)", fontWeight: 600, margin: "0 0 14px", lineHeight: 1.5, letterSpacing: "-0.01em", color: "#33232A" };
const p: React.CSSProperties = { margin: "0 0 14px", fontSize: 16, lineHeight: 1.95, color: "#473A3F" };

export default function GuideArticlePage({ params }: { params: { slug: string } }) {
  const g = getGuide(params.slug);
  if (!g) notFound();
  const url = `${SITE_URL}/guide/${g.slug}`;
  const related = g.related.map((s) => GUIDES.find((x) => x.slug === s)).filter(Boolean) as typeof GUIDES;
  const ld = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: g.title,
      description: g.description,
      inLanguage: "ko-KR",
      datePublished: GUIDE_UPDATED,
      dateModified: GUIDE_UPDATED,
      mainEntityOfPage: url,
      author: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
      publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: g.faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: SITE_NAME, item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "가이드", item: `${SITE_URL}/guide` },
        { "@type": "ListItem", position: 3, name: g.title, item: url },
      ],
    },
  ];

  return (
    <div style={{ width: "100%", overflowX: "hidden", background: "#F3E9EB" }}>
      {ld.map((d, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(d) }} />
      ))}
      <Header />

      <section style={{ padding: "clamp(50px,8vw,84px) clamp(18px,5vw,24px) clamp(26px,4vw,40px)" }}>
        <div style={{ maxWidth: 820, margin: "0 auto" }}>
          <nav aria-label="현재 위치" style={{ fontSize: 13, color: "#9A8189", marginBottom: 18 }}>
            <Link href="/guide" style={{ color: "#9A8189" }}>가이드</Link> <span aria-hidden="true">›</span> <span>{g.eyebrow}</span>
          </nav>
          <p style={{ fontFamily: fontDisplay, fontSize: 13, letterSpacing: "0.34em", color: "#A9647E", margin: "0 0 14px" }}>{g.eyebrow}</p>
          <h1 style={{ fontFamily: fontSerif, fontSize: "clamp(26px,5.6vw,38px)", fontWeight: 600, margin: "0 0 22px", lineHeight: 1.4, letterSpacing: "-0.02em", color: "#33232A" }}>{g.title}</h1>
          <p style={{ margin: 0, fontSize: 17, lineHeight: 1.95, color: "#6B5A60" }}>{g.lead}</p>
        </div>
      </section>

      <main style={{ padding: "0 clamp(18px,5vw,24px) clamp(40px,6vw,64px)" }}>
        <article style={{ maxWidth: 820, margin: "0 auto", background: "#FFFFFF", borderRadius: 4, padding: "clamp(28px,5vw,48px) clamp(22px,5vw,44px)", display: "flex", flexDirection: "column", gap: 40 }}>
          {g.sections.map((s) => (
            <section key={s.h2}>
              <h2 style={h2}>{s.h2}</h2>
              {s.body?.map((t, i) => <p key={i} style={p}>{t}</p>)}
              {s.bullets && (
                <ul style={{ margin: "0 0 14px", paddingLeft: 22, display: "flex", flexDirection: "column", gap: 8 }}>
                  {s.bullets.map((b) => <li key={b} style={{ fontSize: 16, lineHeight: 1.85, color: "#473A3F" }}>{b}</li>)}
                </ul>
              )}
              {s.table && (
                <div style={{ overflowX: "auto", margin: "4px 0 14px" }}>
                  <table className="g-table" style={{ width: "100%", minWidth: 480, borderCollapse: "collapse", fontSize: 15 }}>
                    <thead>
                      <tr>{s.table.head.map((h) => <th key={h} style={{ textAlign: "left", padding: "12px 14px", background: "#F9EFF2", color: "#8E4E68", fontWeight: 600, borderBottom: "1px solid #E7D5DA", whiteSpace: "nowrap" }}>{h}</th>)}</tr>
                    </thead>
                    <tbody>
                      {s.table.rows.map((r, i) => (
                        <tr key={i}>{r.map((c, j) => <td key={j} data-label={s.table!.head[j]} style={{ padding: "13px 14px", borderBottom: "1px solid #F0E3E6", lineHeight: 1.7, color: "#473A3F", fontWeight: j === 0 ? 600 : 400, verticalAlign: "top", whiteSpace: j === 0 ? "nowrap" : "normal", minWidth: j === 0 ? undefined : 120 }}>{c}</td>)}</tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          ))}

          <section>
            <h2 style={h2}>자주 묻는 질문</h2>
            <div style={{ borderTop: "1px solid #E7D5DA" }}>
              {g.faq.map((f) => (
                <details key={f.q} style={{ borderBottom: "1px solid #E7D5DA", padding: "4px 2px" }}>
                  <summary style={{ cursor: "pointer", padding: "16px 0", fontSize: 16, fontWeight: 600, color: "#33232A" }}>{f.q}</summary>
                  <p style={{ margin: "0 0 16px", fontSize: 15, lineHeight: 1.85, color: "#6B5A60" }}>{f.a}</p>
                </details>
              ))}
            </div>
          </section>
        </article>

        <div style={{ maxWidth: 820, margin: "28px auto 0", textAlign: "center", background: "#33232A", borderRadius: 4, padding: "clamp(34px,6vw,52px) 24px" }}>
          {g.cta === "reserve" ? (
            <>
              <p style={{ fontFamily: fontSerif, fontSize: "clamp(20px,4.6vw,26px)", color: "#FFFFFF", margin: "0 0 8px", lineHeight: 1.5 }}>축의대대행, 웨딩버틀러에 맡기세요</p>
              <p style={{ fontSize: 14.5, color: "#D8C3C9", margin: "0 0 22px", lineHeight: 1.8 }}>날짜를 고르고 바로 예약할 수 있어요. 무료 모바일청첩장도 함께 만들어 보세요.</p>
              <OpenModalButton as="a" className="btn-ivory-hover" style={{ display: "inline-block", color: "#33232A", padding: "16px 38px", borderRadius: 999, fontSize: 16, fontWeight: 500, backgroundColor: "#F3E9EBD0" }}>
                날짜 확인하고 예약하기
              </OpenModalButton>
            </>
          ) : (
            <>
              <p style={{ fontFamily: fontSerif, fontSize: "clamp(20px,4.6vw,26px)", color: "#FFFFFF", margin: "0 0 8px", lineHeight: 1.5 }}>무료 모바일청첩장, 지금 만들어 보세요</p>
              <p style={{ fontSize: 14.5, color: "#D8C3C9", margin: "0 0 22px", lineHeight: 1.8 }}>휴대폰 인증만으로 시작해요. 예식 당일 축의대행도 웨딩버틀러에 맡길 수 있습니다.</p>
              <Link href="/invitation" style={{ display: "inline-block", color: "#33232A", padding: "16px 38px", borderRadius: 999, fontSize: 16, fontWeight: 500, backgroundColor: "#F3E9EBD0" }}>
                무료 모바일 청첩장 알아보기
              </Link>
            </>
          )}
        </div>

        {related.length > 0 && (
          <aside style={{ maxWidth: 820, margin: "40px auto 0" }} aria-label="함께 보면 좋은 글">
            <h2 style={{ fontFamily: fontSerif, fontSize: 20, fontWeight: 600, margin: "0 0 14px" }}>함께 보면 좋은 글</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%,230px),1fr))", gap: 12 }}>
              {related.map((r) => (
                <Link key={r.slug} href={`/guide/${r.slug}`} style={{ display: "block", background: "#FFFFFF", borderRadius: 4, padding: "18px 18px 16px", border: "1px solid #EFE0E4" }}>
                  <h3 style={{ fontFamily: fontSerif, fontSize: 16, fontWeight: 600, margin: "0 0 6px", lineHeight: 1.5, color: "#33232A" }}>{r.title}</h3>
                  <p style={{ margin: 0, fontSize: 13, lineHeight: 1.7, color: "#6B5A60" }}>{r.description}</p>
                </Link>
              ))}
            </div>
            <p style={{ textAlign: "center", margin: "22px 0 0", fontSize: 14 }}><Link href="/guide" style={{ color: "#8E4E68", textDecoration: "underline" }}>가이드 전체 보기</Link></p>
          </aside>
        )}
      </main>
      <Footer />
    </div>
  );
}
