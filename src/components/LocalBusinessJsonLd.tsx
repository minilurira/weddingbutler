import { SITE_DESCRIPTION, SITE_NAME, SITE_SAME_AS, SITE_URL } from "@/lib/seo";

export function LocalBusinessJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: SITE_NAME,
    alternateName: "Wedding Butler",
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    logo: `${SITE_URL}/brand/wb-logo-512.png`,
    email: "cs@weddingbutler.co.kr",
    telephone: "010-5918-9203",
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
    paymentAccepted: "신용카드",
    knowsAbout: ["축의대 업체", "축의대행", "축의대대행", "축의금 대행", "결혼식 축의대 운영"],
    makesOffer: {
      "@type": "Offer",
      itemOffered: {
        "@type": "Service",
        name: "축의대 운영 대행",
        serviceType: "축의대 업체 · 축의대행",
        description: "결혼식 축의대에서 축의금 접수, 식권 배부, 봉투 정산, 인계까지 대신 운영합니다.",
        areaServed: ["서울특별시", "경기도"],
      },
    },
    ...(SITE_SAME_AS.length ? { sameAs: SITE_SAME_AS } : {}),
  };

  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
