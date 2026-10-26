"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { InvitationView } from "@/components/invitation/InvitationView";
import { TEMPLATE_OUTER_BG } from "@/lib/invitation/theme";
import { TEMPLATE_INFO, type InvitationTemplate } from "@/lib/invitation/content";
import { SAMPLE_PHOTO_BASE, sampleContent } from "@/lib/invitation/sample";

// 소개 페이지의 "전체 시안 보기": 실제 하객 화면과 같은 컴포넌트로 예시 청첩장을 처음부터 끝까지 보여 준다.
export function SamplePreviewButton({ template }: { template: InvitationTemplate }) {
  const [open, setOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const info = TEMPLATE_INFO[template];

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} style={{ minHeight: 44, padding: "0 20px", borderRadius: 999, border: "1px solid #DCC4CC", background: "#FFFFFF", color: "#473A3F", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
        전체 시안 보기
      </button>
      {open && (
        <div role="dialog" aria-modal="true" aria-label={`${info.name} 전체 시안`} style={{ position: "fixed", inset: 0, zIndex: 100, background: TEMPLATE_OUTER_BG[template], overflowY: "auto" }}>
          <div style={{ position: "sticky", top: 0, zIndex: 2, display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: "rgba(51,35,42,0.92)", color: "#FFFFFF", fontSize: 14 }}>
            <b style={{ flex: 1 }}>{info.name} · {info.premium ? "프리미엄" : "무료"} 시안 <span style={{ fontWeight: 400, opacity: 0.75, fontSize: 12 }}>· AI로 생성한 샘플 사진</span></b>
            <Link href="/invitation/new" style={{ display: "inline-flex", alignItems: "center", minHeight: 44, padding: "0 16px", borderRadius: 22, background: "#A9647E", color: "#FFFFFF", fontWeight: 700, textDecoration: "none" }}>이걸로 만들기</Link>
            <button ref={closeRef} type="button" onClick={() => setOpen(false)} style={{ minHeight: 44, padding: "0 16px", borderRadius: 22, border: "1px solid rgba(255,255,255,0.5)", background: "transparent", color: "#FFFFFF", cursor: "pointer", fontFamily: "inherit" }}>닫기</button>
          </div>
          <InvitationView content={sampleContent(template)} photoBase={SAMPLE_PHOTO_BASE} slug={null} template={template} preview />
        </div>
      )}
    </>
  );
}
