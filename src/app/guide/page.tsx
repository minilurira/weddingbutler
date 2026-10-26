import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { GUIDES } from "@/lib/guide";
import { fontDisplay, fontSerif } from "@/lib/style";
import { SITE_NAME, SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  title: "축의대행·축의대대행 가이드, 무료 모바일청첩장 안내",
  description: "축의대행(축의대대행) 가격·인원·정산과 무료 모바일청첩장 만드는 법을 한곳에 모았습니다.",
  alternates: { canonical: "/guide" },
};

const GROUPS = [
  { title: "축의대행 · 축의대대행 가이드", slugs: ["what-is-chuiuldaehaeng", "chuiuldaedaehaeng", "cost", "how-many-staff", "vs-friend", "settlement", "checklist", "seoul-gyeonggi"] },
  { title: "무료 모바일청첩장 가이드", slugs: ["free-mobile-invitation", "invitation-greeting-examples"] },
];

export default function GuideHub() {
  const bySlug = new Map(GUIDES.map((g) => [g.slug, g]));
  const ld = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: SITE_NAME, item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "가이드", item: `${SITE_URL}/guide` },
    ],
  };
  return (
    <div style={{ width: "100%", overflowX: "hidden", background: "#F3E9EB" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <Header />
      <section style={{ padding: "clamp(54px,9vw,90px) clamp(18px,5vw,24px) clamp(30px,5vw,48px)", textAlign: "center" }}>
        <p style={{ fontFamily: fontDisplay, fontSize: 14, letterSpacing: "0.4em", color: "#A9647E", margin: "0 0 16px" }}>GUIDE</p>
        <h1 style={{ fontFamily: fontSerif, fontSize: "clamp(26px,6vw,38px)", fontWeight: 600, margin: "0 0 18px", letterSpacing: "-0.02em", lineHeight: 1.4 }}>
          축의대행 · 축의대대행 가이드
          <br />
          무료 모바일청첩장 안내
        </h1>
        <p style={{ maxWidth: 640, margin: "0 auto", fontSize: 16, lineHeight: 1.9, color: "#6B5A60" }}>
          결혼식 당일 축의대는 어떻게 운영되는지, 축의대행 비용과 인원은 어떻게 정해지는지, 무료 모바일청첩장은 어떻게 만드는지 궁금한 점을 모았습니다.
        </p>
      </section>
      <main style={{ padding: "0 clamp(18px,5vw,24px) clamp(60px,9vw,100px)" }}>
        <div style={{ maxWidth: 960, margin: "0 auto", display: "flex", flexDirection: "column", gap: 44 }}>
          {GROUPS.map((grp) => (
            <section key={grp.title}>
              <h2 style={{ fontFamily: fontSerif, fontSize: 22, fontWeight: 600, margin: "0 0 18px" }}>{grp.title}</h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%,280px),1fr))", gap: 14 }}>
                {grp.slugs.map((s) => {
                  const g = bySlug.get(s);
                  if (!g) return null;
                  return (
                    <Link key={s} href={`/guide/${s}`} style={{ display: "block", background: "#FFFFFF", borderRadius: 4, padding: "24px 24px 22px", border: "1px solid #EFE0E4" }}>
                      <span style={{ fontFamily: fontDisplay, fontSize: 12, letterSpacing: "0.3em", color: "#A9647E" }}>{g.eyebrow}</span>
                      <h3 style={{ fontFamily: fontSerif, fontSize: 18, fontWeight: 600, margin: "10px 0 8px", lineHeight: 1.5, color: "#33232A" }}>{g.title}</h3>
                      <p style={{ margin: 0, fontSize: 14, lineHeight: 1.8, color: "#6B5A60" }}>{g.description}</p>
                    </Link>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
