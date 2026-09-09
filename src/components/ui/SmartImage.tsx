"use client";

import Image from "next/image";
import { useState } from "react";
import { buildSrc, TONE_GRADIENT, type SiteImage } from "@/lib/images";

/**
 * 사진이 아직 안 왔거나 로딩에 실패해도 자리가 비어 보이지 않는 이미지.
 *
 * 폴백은 "회색 네모"가 아니라 브랜드 그라디언트 + 얇은 격자 패턴이라
 * 사진이 끝내 안 뜨더라도 의도한 디자인처럼 보인다.
 */
export function SmartImage({
  image,
  className = "",
  imgClassName = "",
  sizes = "100vw",
  width = 1600,
  priority = false,
  overlay = false,
}: {
  image: SiteImage;
  className?: string;
  imgClassName?: string;
  sizes?: string;
  width?: number;
  priority?: boolean;
  /** 사진 위에 텍스트를 올릴 때 가독성을 위한 어두운 레이어 */
  overlay?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);

  return (
    <div
      className={`relative overflow-hidden bg-ivory-deep ${className}`}
      style={{ backgroundImage: TONE_GRADIENT[image.tone] }}
    >
      {/* 폴백 텍스처 — 사진이 얹히면 아래로 가려진다 */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.18]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.6) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />

      {!failed && (
        <Image
          src={buildSrc(image, { width })}
          alt={image.alt}
          fill
          sizes={sizes}
          priority={priority}
          onError={() => setFailed(true)}
          onLoad={() => setLoaded(true)}
          className={`object-cover transition-opacity duration-1000 ease-out ${
            loaded ? "opacity-100" : "opacity-0"
          } ${imgClassName}`}
        />
      )}

      {overlay && (
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-ink/55 via-ink/15 to-transparent"
        />
      )}
    </div>
  );
}
