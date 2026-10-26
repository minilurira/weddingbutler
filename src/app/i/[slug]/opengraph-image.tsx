import { ImageResponse } from "next/og";
import { getBySlug, isLive, photoUrl } from "@/lib/invitation/store";
import { isTemplate } from "@/lib/invitation/content";
import { TEMPLATE_OUTER_BG } from "@/lib/invitation/theme";

export const dynamic = "force-dynamic";
export const alt = "모바일 청첩장";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// 카카오톡·문자로 주소를 보냈을 때 보이는 썸네일(1200×630). 세로 사진이 얼굴이 잘리지 않도록
// 표지 사진을 자르지 않고 가운데에 통째로 두고, 양옆은 템플릿 분위기의 한 가지 색으로 채운다. 사진이 없으면 사이트 색 배경.
// 글자는 넣지 않는다(한글 글꼴을 따로 싣지 않기 위해). 제목·날짜는 카카오톡이 og:title/description으로 보여 준다.
export default async function Image({ params }: { params: { slug: string } }) {
  const row = await getBySlug(params.slug).catch(() => null);
  const cover = row && isLive(row) && row.content.cover ? photoUrl(row.content.cover) : "";
  const bg = row && isTemplate(row.template) ? TEMPLATE_OUTER_BG[row.template] : "#EFE6D8";

  return new ImageResponse(
    cover ? (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: bg }}>
        {/* 사진은 자르지 않고 통째로 가운데에 (위아래 여백 40px) */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={cover} alt="" height={550} style={{ height: 550, objectFit: "contain", borderRadius: 14, boxShadow: "0 10px 30px rgba(51,35,42,0.22)" }} />
      </div>
    ) : (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg,#F3E9EB,#E9CAD1)", color: "#A9647E", fontSize: 54, letterSpacing: 14 }}>
        WEDDING INVITATION
      </div>
    ),
    { ...size },
  );
}
