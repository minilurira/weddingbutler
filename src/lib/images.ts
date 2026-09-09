import type { SceneName } from "@/components/ui/Illustration";

/**
 * 사이트에서 쓰는 그림/사진 목록.
 *
 * ─────────────────────────────────────────────────────────────
 * 지금은 전부 직접 그린 일러스트입니다.
 * (components/ui/Illustration.tsx — 왜 그림인지도 거기 적혀 있습니다)
 *
 * 실제 예식 사진으로 바꾸고 싶으시면
 * ─────────────────────────────────────────────────────────────
 * 아래 항목에 `photo` 한 줄만 추가하면 됩니다.
 *
 *   hero: {
 *     scene: "reception",
 *     variant: "dark",
 *     alt: "...",
 *     photo: "https://images.unsplash.com/photo-XXXXXXXX",  ← 이 줄
 *   },
 *
 * 사진 주소 얻는 법
 *  1. unsplash.com 등에서 사진을 엽니다.
 *  2. 사진 위 우클릭 → "이미지 주소 복사".
 *  3. `?` 앞부분까지만 잘라서 붙여넣습니다. 뒤 옵션은 알아서 붙습니다.
 *  4. `alt` 를 사진 내용에 맞게 고쳐주세요. 화면에는 안 보이지만
 *     스크린리더와 검색엔진이 읽습니다.
 *
 * 직접 찍은 사진을 쓰시려면 public/ 폴더에 넣고
 * photo: "/photos/접수대.jpg" 처럼 적으시면 됩니다.
 *
 * 사진이 어떤 이유로든 안 뜨면 자동으로 그림으로 되돌아갑니다.
 * 그래서 깨진 이미지가 노출될 일은 없습니다.
 *
 * next.config.ts 의 remotePatterns 에 없는 도메인의 사진은 차단되니,
 * unsplash 가 아닌 곳을 쓰실 때는 거기에 도메인을 추가해 주세요.
 */

export type SiteImage = {
  /** 기본으로 보여줄 일러스트 장면 */
  scene: SceneName;
  /** 어두운 배경에 놓이면 "dark" */
  variant?: "dark" | "light";
  /** 스크린리더·SEO용 설명 */
  alt: string;
  /** (선택) 실제 사진 주소. 넣으면 사진이 그림을 대신합니다. */
  photo?: string;
};

export const IMAGES = {
  /** 첫 화면 배경 — 흰 글씨를 얹으므로 어두운 톤 */
  hero: {
    scene: "reception",
    variant: "dark",
    alt: "웨딩버틀러 두 명이 축의금 접수대를 지키고 있는 결혼식 접수 현장",
  },

  /** 접수대 위 클로즈업 — 방명록, 봉투, 잠금 보관함 */
  reception: {
    scene: "desk",
    variant: "dark",
    alt: "방명록과 축의금 봉투, 잠금 보관함이 놓인 접수대",
  },

  /** 버틀러 소개 */
  butler: {
    scene: "butlers",
    variant: "light",
    alt: "정장을 갖춰 입고 접수를 준비하는 웨딩버틀러 두 명",
  },

  /** 하객 응대 */
  guests: {
    scene: "queue",
    variant: "light",
    alt: "축의금 봉투를 들고 접수대 앞에 줄을 선 하객들",
  },

  /** 예식 분위기 */
  ceremony: {
    scene: "flowers",
    variant: "light",
    alt: "꽃으로 장식된 예식장 아치",
  },

  /** 디테일 컷 */
  detail: {
    scene: "flowers",
    variant: "light",
    alt: "예식장에 놓인 꽃 장식",
  },
} as const satisfies Record<string, SiteImage>;

export type ImageKey = keyof typeof IMAGES;

/**
 * 사진 주소에 크기·품질 옵션을 붙인다.
 * 직접 올린 파일(/photos/...)에는 붙이지 않는다.
 */
export function buildPhotoSrc(
  photo: string,
  { width = 1600, quality = 75 }: { width?: number; quality?: number } = {},
): string {
  if (!photo.startsWith("http")) return photo;

  const params = new URLSearchParams({
    auto: "format",
    fit: "crop",
    w: String(width),
    q: String(quality),
  });
  return `${photo}?${params.toString()}`;
}
