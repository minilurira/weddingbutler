import type { InvitationTemplate } from "@/lib/invitation/content";

// 청첩장 바깥(휴대폰 화면 밖) 배경색. 서버 페이지와 클라이언트 컴포넌트가 함께 쓰므로 "use client" 파일이 아닌 곳에 둔다.
export const TEMPLATE_OUTER_BG: Record<InvitationTemplate, string> = {
  classic: "#E9E2D6",
  modern: "#E4E4E4",
  botanical: "#DDE5D8",
  rose: "#EBDADD",
};
