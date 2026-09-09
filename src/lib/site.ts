/**
 * 사이트 전역 상수. 사업자 정보·연락처는 실제 값을 받는 대로 여기만 고치면 된다.
 */

export const SITE = {
  name: "웨딩버틀러",
  nameEn: "Wedding Butler",
  tagline: "결혼식 축의대, 이제 맡기세요",
  description:
    "축의금 접수부터 기록·정산까지, 훈련된 웨딩버틀러가 대신합니다. 온라인으로 요금 확인부터 날짜 예약, 예약금 결제까지 한 번에.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://weddingbutler.vercel.app",
} as const;

/**
 * TODO(사업자 정보): 아래 값은 자리표시자입니다.
 * 전자상거래법상 결제가 이뤄지는 사이트는 상호·대표자·사업자등록번호·
 * 통신판매업신고번호·주소·연락처를 표기해야 합니다. 실제 값으로 교체해 주세요.
 */
export const BUSINESS = {
  companyName: "웨딩버틀러",
  ceo: "대표자명",
  registrationNumber: "000-00-00000",
  mailOrderNumber: "제0000-지역-0000호",
  address: "주소를 입력해 주세요",
  phone: "0000-0000",
  phoneHref: "tel:00000000",
  email: "hello@weddingbutler.kr",
  kakaoChannel: "",
  hours: "평일 10:00 – 19:00 (주말·공휴일은 현장 근무로 연결이 늦을 수 있습니다)",
  isPlaceholder: true,
} as const;

export const NAV_LINKS = [
  { href: "/service", label: "서비스" },
  { href: "/pricing", label: "요금제" },
  { href: "/qna", label: "문의하기" },
] as const;

export const FOOTER_LINKS = [
  { href: "/policy/terms", label: "이용약관" },
  { href: "/policy/privacy", label: "개인정보처리방침" },
  { href: "/policy/refund", label: "취소·환불규정" },
] as const;
