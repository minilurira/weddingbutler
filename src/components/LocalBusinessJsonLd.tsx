import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/seo";

export function LocalBusinessJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: SITE_NAME,
    alternateName: "Wedding Butler",
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    email: "cs@weddingbutler.co.kr",
    image: `${SITE_URL}/img/hero-desk.jpeg`,
    address: {
      "@type": "PostalAddress",
      streetAddress: "운중로 124 8층 804-S80호",
      addressLocality: "성남시 분당구",
      addressRegion: "경기도",
      addressCountry: "KR",
    },
    areaServed: [
      { "@type": "City", name: "서울특별시" },
      { "@type": "State", name: "경기도" },
    ],
    priceRange: "390,000원 ~ 800,000원",
  };

  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
