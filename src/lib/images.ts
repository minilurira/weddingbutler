/**
 * 사이트에서 쓰는 사진 레지스트리.
 *
 * ─────────────────────────────────────────────────────────────
 * 사진을 바꾸고 싶다면 이 파일만 고치면 됩니다.
 *
 * 1. unsplash.com 에서 마음에 드는 사진을 엽니다.
 * 2. 사진 위에서 우클릭 → "이미지 주소 복사".
 *    https://images.unsplash.com/photo-XXXXXXXXXXXXX-YYYYYYYYYYYY?... 형태입니다.
 * 3. 아래 항목의 `src` 를 `?` 앞부분까지만 잘라서 붙여넣습니다.
 *    (뒤 파라미터는 buildSrc 가 알아서 붙입니다)
 * 4. `alt` 를 사진 내용에 맞게 고쳐 주세요. 화면에 안 보이지만
 *    스크린리더와 검색엔진이 읽습니다.
 * ─────────────────────────────────────────────────────────────
 *
 * `intent` 는 "이 자리에 어떤 사진이 와야 하는가"를 적어둔 것입니다.
 * 사진이 마음에 안 들 때 무엇으로 바꿔야 할지 판단하는 기준입니다.
 *
 * 모든 사진은 로딩에 실패해도 브랜드 그라디언트로 자연스럽게 대체되므로
 * (components/ui/SmartImage.tsx) 깨진 이미지가 노출되지 않습니다.
 */

export type SiteImage = {
  /** Unsplash 원본 주소 (쿼리스트링 제외) */
  src: string;
  /** 스크린리더·SEO용 대체 텍스트 */
  alt: string;
  /** 이 자리에 어울리는 사진의 조건 */
  intent: string;
  /** 폴백 그라디언트 톤 */
  tone: "rose" | "lilac" | "blush" | "ink";
};

export const IMAGES = {
  hero: {
    src: "https://images.unsplash.com/photo-1519741497674-611481863552",
    alt: "예식장에서 하객을 맞이하는 결혼식 현장",
    intent:
      "예식장 전경. 흰 글씨를 얹으므로 너무 밝지 않고 여백이 넉넉한 넓은 컷이 좋습니다.",
    tone: "ink",
  },
  reception: {
    src: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc",
    alt: "방명록과 답례품이 놓인 결혼식 접수대",
    intent:
      "접수대·방명록·펜이 놓인 테이블 클로즈업. 어두운 섹션 안에 놓이므로 차분한 톤이 좋습니다.",
    tone: "ink",
  },
  butler: {
    src: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d",
    alt: "단정한 정장 차림으로 응대를 준비하는 스태프",
    intent: "정장·유니폼 차림의 단정한 응대 인력. 신뢰감을 주는 톤.",
    tone: "ink",
  },
  ceremony: {
    src: "https://images.unsplash.com/photo-1465495976277-4387d4b0e4a6",
    alt: "예식 중인 신랑 신부",
    intent: "예식 순간. 부부가 주인공인 컷 — 얼굴이 또렷하지 않아도 좋음.",
    tone: "rose",
  },
  detail: {
    src: "https://images.unsplash.com/photo-1519225421980-715cb0215aed",
    alt: "결혼식장에 놓인 꽃 장식",
    intent: "플로럴·테이블 세팅 등 디테일 컷. 여백이 넉넉한 정적인 사진.",
    tone: "lilac",
  },
  guests: {
    src: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d",
    alt: "결혼식장에 모인 하객들",
    intent: "하객이 모여 있는 로비/홀. 붐비는 느낌이 드러나야 함.",
    tone: "blush",
  },
} as const satisfies Record<string, SiteImage>;

export type ImageKey = keyof typeof IMAGES;

/**
 * Unsplash 이미지 주소에 크기·품질 파라미터를 붙인다.
 * Next.js 이미지 최적화를 거치지만, 원본을 미리 줄여 받으면 전송량이 준다.
 */
export function buildSrc(
  image: SiteImage,
  { width = 1600, quality = 75 }: { width?: number; quality?: number } = {},
): string {
  const params = new URLSearchParams({
    auto: "format",
    fit: "crop",
    w: String(width),
    q: String(quality),
  });
  return `${image.src}?${params.toString()}`;
}

/** 사진이 로드되기 전/실패했을 때 깔리는 브랜드 그라디언트. */
export const TONE_GRADIENT: Record<SiteImage["tone"], string> = {
  rose: "linear-gradient(135deg, #fdeef2 0%, #f6c9d5 45%, #eda5b7 100%)",
  lilac: "linear-gradient(135deg, #f8f1f6 0%, #ded0dd 45%, #a98caa 100%)",
  blush: "linear-gradient(135deg, #fff5f7 0%, #fadde4 45%, #f0b8c4 100%)",
  ink: "linear-gradient(135deg, #5d444f 0%, #47323c 55%, #3b2932 100%)",
};
