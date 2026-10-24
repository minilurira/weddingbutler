import { fontDisplay } from "@/lib/style";

export interface Review {
  quote: string;
  who: string;
  tag: string;
}

const CARD_W = 360; // px
const GAP = 22; // px
const SPEED = 45; // px/초 — 오른쪽에서 왼쪽으로 흐르는 속도

/**
 * 후기 카드가 오른쪽에서 왼쪽으로 끊김 없이 흐른다 (CSS 애니메이션만 사용, 자바스크립트 없음).
 * 마우스를 올리면 멈추고, '동작 줄이기' 설정에서는 흐르지 않고 가로로 넘겨 볼 수 있다.
 * 후기가 적어도 화면이 비지 않게 한 묶음의 너비가 충분해질 때까지 같은 후기를 반복해 채운다.
 */
export function ReviewMarquee({ reviews }: { reviews: Review[] }) {
  if (reviews.length === 0) return null;
  const reps = Math.max(1, Math.ceil(2200 / (reviews.length * (CARD_W + GAP)))); // 넓은 화면(2200px)까지 채움
  const half = Array.from({ length: reps }, () => reviews).flat();
  const duration = Math.round((half.length * (CARD_W + GAP)) / SPEED);

  const card = (r: Review, key: string) => (
    <div key={key} style={{ flex: `0 0 ${CARD_W}px`, width: CARD_W, maxWidth: "82vw", boxSizing: "border-box", background: "#FFFFFF", border: "1px solid #E7D5DA", borderRadius: 4, padding: "38px 32px", display: "flex", flexDirection: "column" }}>
      <div style={{ fontFamily: fontDisplay, fontSize: 44, color: "#E9CAD1", lineHeight: 0.6, marginBottom: 22 }}>&ldquo;</div>
      <p style={{ fontSize: 15, lineHeight: 2, color: "#473A3F", margin: "0 0 26px", flex: 1 }}>{r.quote}</p>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, paddingTop: 20, borderTop: "1px solid #E7D5DA" }}>
        <span style={{ fontSize: 14, color: "#33232A" }}>{r.who}</span>
        <span style={{ fontSize: 13, color: "#9A8189", whiteSpace: "nowrap" }}>{r.tag}</span>
      </div>
    </div>
  );

  return (
    <div className="review-marquee" style={{ ["--review-gap" as string]: `${GAP}px`, ["--review-dur" as string]: `${duration}s` }}>
      <div className="review-track">
        <div className="review-half">{half.map((r, i) => card(r, `a${i}`))}</div>
        {/* 이어 붙이는 같은 묶음: 보조 기기에는 한 번만 읽히게 숨긴다 */}
        <div className="review-half" aria-hidden="true">{half.map((r, i) => card(r, `b${i}`))}</div>
      </div>
    </div>
  );
}
