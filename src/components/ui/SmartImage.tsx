"use client";

import Image from "next/image";
import { useState } from "react";
import { Illustration } from "@/components/ui/Illustration";
import { buildPhotoSrc, type SiteImage } from "@/lib/images";

/**
 * 그림을 기본으로 깔고, 사진이 등록돼 있으면 그 위에 얹는 이미지.
 *
 * 사진이 없거나(기본 상태), 주소가 잘못됐거나, 네트워크가 막혀 못 불러오면
 * 아래 깔린 그림이 그대로 보인다. 그래서 어떤 상황에서도 빈 자리나
 * 깨진 이미지가 노출되지 않는다.
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
  /** 사진 위에 글씨를 올릴 때 가독성을 위한 어두운 레이어 */
  overlay?: boolean;
}) {
  const [photoFailed, setPhotoFailed] = useState(false);
  const [photoLoaded, setPhotoLoaded] = useState(false);

  const showPhoto = Boolean(image.photo) && !photoFailed;

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* 기본 그림 — 사진이 뜨기 전에도, 끝내 안 떠도 이 자리를 채운다 */}
      <div className="absolute inset-0">
        <Illustration
          scene={image.scene}
          variant={image.variant ?? "light"}
          className={imgClassName}
        />
      </div>

      {showPhoto && (
        <Image
          src={buildPhotoSrc(image.photo!, { width })}
          alt={image.alt}
          fill
          sizes={sizes}
          priority={priority}
          onError={() => setPhotoFailed(true)}
          onLoad={() => setPhotoLoaded(true)}
          className={`object-cover transition-opacity duration-1000 ease-out ${
            photoLoaded ? "opacity-100" : "opacity-0"
          } ${imgClassName}`}
        />
      )}

      {overlay && (
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-plum/55 via-plum/15 to-transparent"
        />
      )}
    </div>
  );
}
