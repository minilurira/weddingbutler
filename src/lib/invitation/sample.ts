import { GREETINGS, defaultContent, type InvitationContent, type InvitationTemplate } from "@/lib/invitation/content";

// 소개 페이지의 "전체 시안 보기"에 쓰는 예시 청첩장. 사진은 public/img/invitation/ (AI로 생성한 샘플 이미지)
export const SAMPLE_PHOTO_BASE = "/img/invitation/";

const SAMPLE_PHOTOS: Record<InvitationTemplate, { cover: string; gallery: string[] }> = {
  classic: { cover: "p85.jpg", gallery: ["p76.jpg", "p82.jpg", "p84.jpg", "p74.jpg", "p79.jpg", "p75.jpg"] },
  modern: { cover: "p68.jpg", gallery: ["p70.jpg", "p71.jpg", "p69.jpg", "p76.jpg", "p82.jpg", "p85.jpg"] },
  botanical: { cover: "p78.jpg", gallery: ["p72.jpg", "p75.jpg", "p81.jpg", "p84.jpg", "p79.jpg", "p74.jpg"] },
  rose: { cover: "p73.jpg", gallery: ["p80.jpg", "p86.jpg", "p77.jpg", "p83.jpg", "p74.jpg", "p72.jpg"] },
};

export function sampleContent(template: InvitationTemplate): InvitationContent {
  const p = SAMPLE_PHOTOS[template];
  return {
    ...defaultContent(),
    groom: "민준",
    bride: "서연",
    title: "소중한 분들을 초대합니다",
    greeting: GREETINGS[0][1],
    groomFather: "김정훈",
    groomMother: "이미경",
    brideFather: "박성호",
    brideMother: "최은정",
    date: "2027-05-08",
    time: "13:00",
    venue: "예식장명",
    hall: "그랜드홀 3층",
    address: "서울특별시 ○○구 ○○로 123",
    traffic: "지하철 ○호선 ○○역 3번 출구 도보 5분",
    cover: p.cover,
    gallery: p.gallery,
    accounts: [
      { who: "신랑", bank: "○○은행", number: "000-0000-0000", holder: "김민준" },
      { who: "신부", bank: "○○은행", number: "000-0000-0000", holder: "박서연" },
    ],
    showContacts: true,
    contacts: [
      { label: "신랑", phone: "010-0000-0000", kakao: "" },
      { label: "신부", phone: "010-0000-0000", kakao: "" },
    ],
    parkingPlace: "예식장 건물 지하 1~3층",
    parkingEntrance: "○○로 쪽 입구",
    parkingFree: "2시간 무료, 축의대에서 등록",
    parkingFull: "○○ 공영주차장 (도보 5분)",
    memoMeal: "2층 연회장, 예식 30분 전부터",
    memoShuttle: "○○역 2번 출구, 12시부터 15분 간격",
    memoPhoto: "1층 로비",
    memoWreath: "마음만 감사히 받겠습니다",
  };
}
