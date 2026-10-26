// 모바일 청첩장 내용(JSON)의 형태, 기본값, 입력값 정리. 서버와 브라우저가 함께 쓰는 순수 함수만 둔다.

export const INVITATION_TEMPLATES = ["classic", "modern", "botanical", "rose"] as const;
export type InvitationTemplate = (typeof INVITATION_TEMPLATES)[number];

export const TEMPLATE_INFO: Record<InvitationTemplate, { name: string; premium: boolean; blurb: string }> = {
  classic: { name: "클래식 아이보리", premium: false, blurb: "따뜻한 아이보리와 세리프 글꼴" },
  modern: { name: "모던 미니멀", premium: true, blurb: "흑백 대비와 큰 날짜 타이포" },
  botanical: { name: "보태니컬 그린", premium: true, blurb: "세이지 그린과 부드러운 곡선" },
  rose: { name: "로즈 에디토리얼", premium: true, blurb: "와인색과 이탤릭 영문 제목" },
};
export const isTemplate = (v: unknown): v is InvitationTemplate => typeof v === "string" && (INVITATION_TEMPLATES as readonly string[]).includes(v);
export const isPremium = (t: string) => isTemplate(t) && TEMPLATE_INFO[t].premium;
export const PREMIUM_PRICE = 10000;

export const GALLERY_MAX = 12; // 무료 템플릿
export const GALLERY_MAX_PREMIUM = 30;
export const galleryMax = (template: string) => (isPremium(template) ? GALLERY_MAX_PREMIUM : GALLERY_MAX);
export const ACCOUNT_MAX = 4;

export interface InvitationAccount { who: string; bank: string; number: string; holder: string }
export interface InvitationContact { label: string; phone: string }

export interface InvitationContent {
  v: 1;
  groom: string;
  bride: string;
  title: string;
  greeting: string;
  groomFather: string;
  groomMother: string;
  brideFather: string;
  brideMother: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM (24시간)
  venue: string;
  hall: string;
  address: string;
  traffic: string;
  mapNaver: boolean;
  mapKakao: boolean;
  mapTmap: boolean;
  showCalendar: boolean;
  showDday: boolean;
  cover: string; // 저장소 경로 ("" = 없음)
  gallery: string[];
  showAccounts: boolean;
  accounts: InvitationAccount[];
  showContacts: boolean;
  contacts: InvitationContact[];
  receptStyle: number; // 0 정중하게 · 1 다정하게 · 2 간결하게
  guestbook: boolean;
  // 프리미엄 전용 안내 (프리미엄 템플릿에서만 하객에게 보인다)
  parkingPlace: string;
  parkingEntrance: string;
  parkingFree: string;
  parkingFull: string;
  memoMeal: string;
  memoShuttle: string;
  memoPhoto: string;
  memoWreath: string;
}

export const GREETINGS: [string, string][] = [
  ["정중하게", "서로 다른 길을 걸어온 두 사람이\n이제 같은 길을 함께 걸으려 합니다.\n저희의 시작을 지켜봐 주시고\n따뜻한 마음으로 축복해 주세요."],
  ["따뜻하게", "봄처럼 따뜻한 날,\n저희 두 사람이 사랑의 결실을 맺습니다.\n귀한 걸음 하시어 축복해 주시면\n더없는 기쁨으로 간직하겠습니다."],
  ["담백하게", "저희 두 사람, 결혼합니다.\n오셔서 자리를 빛내 주시면\n감사한 마음으로 오래 기억하겠습니다."],
  ["감성적으로", "같은 계절을 여러 번 함께 지나며\n서로에게 가장 편한 사람이 되었습니다.\n이제 남은 모든 계절을 함께하려 합니다.\n그 첫날에 함께해 주세요."],
  ["오래 만난 커플", "오랜 시간 곁을 지켜 온 두 사람이\n이제 평생을 약속합니다.\n긴 시간 저희를 아껴 주신 분들께\n그 약속의 순간을 보여 드리고 싶습니다."],
  ["유쾌하게", "드디어 저희가 결혼합니다!\n맛있는 식사 준비해 두었으니\n편한 마음으로 오셔서\n함께 웃고 축하해 주세요."],
  ["양가 부모님 이름으로", "저희 아들과 딸이\n서로를 아끼는 마음으로 새 가정을 이룹니다.\n바쁘시더라도 귀한 걸음 하시어\n두 사람의 앞날을 축복해 주시기 바랍니다."],
  ["짧게", "저희 결혼합니다.\n함께 축하해 주세요."],
];

export const TITLES = ["소중한 분들을 초대합니다", "저희 결혼합니다", "결혼식에 초대합니다", "두 사람이 하나 되는 날", "함께해 주세요", "WE ARE GETTING MARRIED"];

export const RECEPT_TEXTS = [
  "예식 당일 축의대에서 정성껏 접수하고\n한 분 한 분의 마음을 기록해 전해드립니다.\n편안한 마음으로 오셔서 축하해 주세요.",
  "축하의 마음은 웨딩버틀러가 소중히 받아\n두 사람에게 빠짐없이 전해 드릴게요.",
  "축의대는 웨딩버틀러가 운영합니다.\n편하게 들러 주세요.",
];
export const RECEPT_LABELS = ["정중하게", "다정하게", "간결하게"];

export function defaultContent(): InvitationContent {
  return {
    v: 1,
    groom: "",
    bride: "",
    title: TITLES[0],
    greeting: GREETINGS[0][1],
    groomFather: "",
    groomMother: "",
    brideFather: "",
    brideMother: "",
    date: "",
    time: "13:00",
    venue: "",
    hall: "",
    address: "",
    traffic: "",
    mapNaver: true,
    mapKakao: true,
    mapTmap: false,
    showCalendar: true,
    showDday: true,
    cover: "",
    gallery: [],
    showAccounts: true,
    accounts: [
      { who: "신랑", bank: "", number: "", holder: "" },
      { who: "신부", bank: "", number: "", holder: "" },
    ],
    showContacts: false,
    contacts: [
      { label: "신랑", phone: "" },
      { label: "신부", phone: "" },
    ],
    receptStyle: 0,
    guestbook: true,
    parkingPlace: "",
    parkingEntrance: "",
    parkingFree: "",
    parkingFull: "",
    memoMeal: "",
    memoShuttle: "",
    memoPhoto: "",
    memoWreath: "",
  };
}

// --- 입력값 정리 (서버에서 저장 전에 항상 거친다) ---

const str = (v: unknown, max: number) => (typeof v === "string" ? v.replace(/\r\n/g, "\n").slice(0, max) : "");
const line = (v: unknown, max: number) => str(v, max).replace(/\n/g, " ");
const bool = (v: unknown, fallback: boolean) => (typeof v === "boolean" ? v : fallback);
const digitsDash = (v: unknown, max: number) => line(v, max).replace(/[^0-9-]/g, "");

/** 이 청첩장(id)의 저장소 경로만 받는다: "<id>/<이름>.jpg|webp" */
export function isOwnPhotoPath(id: string, v: unknown): v is string {
  return typeof v === "string" && new RegExp(`^${id}/[A-Za-z0-9_-]{6,64}\\.(jpg|webp)$`).test(v);
}

export function sanitizeContent(id: string, raw: unknown, template = "classic"): InvitationContent {
  const d = defaultContent();
  const r = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const date = typeof r.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(r.date) ? r.date : "";
  const time = typeof r.time === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(r.time) ? r.time : d.time;
  const accounts = (Array.isArray(r.accounts) ? r.accounts : d.accounts).slice(0, ACCOUNT_MAX).map((a) => {
    const x = (a && typeof a === "object" ? a : {}) as Record<string, unknown>;
    return { who: line(x.who, 20), bank: line(x.bank, 20), number: digitsDash(x.number, 30), holder: line(x.holder, 20) };
  });
  const contacts = (Array.isArray(r.contacts) ? r.contacts : d.contacts).slice(0, 6).map((c) => {
    const x = (c && typeof c === "object" ? c : {}) as Record<string, unknown>;
    return { label: line(x.label, 20), phone: digitsDash(x.phone, 15) };
  });
  const gallery = (Array.isArray(r.gallery) ? r.gallery : []).filter((p) => isOwnPhotoPath(id, p)).slice(0, galleryMax(template)) as string[];
  const recept = Number(r.receptStyle);
  return {
    v: 1,
    groom: line(r.groom, 20),
    bride: line(r.bride, 20),
    title: line(r.title, 40),
    greeting: str(r.greeting, 600),
    groomFather: line(r.groomFather, 20),
    groomMother: line(r.groomMother, 20),
    brideFather: line(r.brideFather, 20),
    brideMother: line(r.brideMother, 20),
    date,
    time,
    venue: line(r.venue, 40),
    hall: line(r.hall, 40),
    address: line(r.address, 120),
    traffic: str(r.traffic, 400),
    mapNaver: bool(r.mapNaver, d.mapNaver),
    mapKakao: bool(r.mapKakao, d.mapKakao),
    mapTmap: bool(r.mapTmap, d.mapTmap),
    showCalendar: bool(r.showCalendar, d.showCalendar),
    showDday: bool(r.showDday, d.showDday),
    cover: isOwnPhotoPath(id, r.cover) ? r.cover : "",
    gallery,
    showAccounts: bool(r.showAccounts, d.showAccounts),
    accounts,
    showContacts: bool(r.showContacts, d.showContacts),
    contacts,
    receptStyle: recept === 1 || recept === 2 ? recept : 0,
    guestbook: bool(r.guestbook, d.guestbook),
    parkingPlace: line(r.parkingPlace, 60),
    parkingEntrance: line(r.parkingEntrance, 60),
    parkingFree: line(r.parkingFree, 60),
    parkingFull: line(r.parkingFull, 60),
    memoMeal: line(r.memoMeal, 60),
    memoShuttle: line(r.memoShuttle, 60),
    memoPhoto: line(r.memoPhoto, 60),
    memoWreath: line(r.memoWreath, 60),
  };
}

/** 발행 전에 꼭 있어야 하는 항목. 빠진 항목 이름 목록(없으면 []) */
export function missingForPublish(c: InvitationContent): string[] {
  const miss: string[] = [];
  if (!c.groom.trim()) miss.push("신랑 이름");
  if (!c.bride.trim()) miss.push("신부 이름");
  if (!c.date) miss.push("예식 날짜");
  if (!c.venue.trim()) miss.push("예식장 이름");
  return miss;
}

// --- 화면 표시용 계산 ---

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

/** "2027년 5월 8일 토요일 오후 1시" (날짜가 없으면 "") */
export function dateLabel(c: Pick<InvitationContent, "date" | "time">): string {
  if (!c.date) return "";
  const [y, m, d] = c.date.split("-").map(Number);
  const wd = WEEKDAYS[new Date(Date.UTC(y, m - 1, d)).getUTCDay()];
  const [hh, mm] = c.time.split(":").map(Number);
  const ampm = hh < 12 ? "오전" : "오후";
  const h12 = hh % 12 === 0 ? 12 : hh % 12;
  return `${y}년 ${m}월 ${d}일 ${wd}요일 ${ampm} ${h12}시${mm ? ` ${mm}분` : ""}`;
}

/** 오늘(한국 시간) 기준 예식까지 남은 날. 지났으면 음수, 날짜가 없으면 null */
export function daysUntil(date: string, now = Date.now()): number | null {
  if (!date) return null;
  const [y, m, d] = date.split("-").map(Number);
  const k = new Date(now + 9 * 3600 * 1000);
  const today = Date.UTC(k.getUTCFullYear(), k.getUTCMonth(), k.getUTCDate());
  return Math.round((Date.UTC(y, m - 1, d) - today) / 86400000);
}

/** 달력: 그 달의 칸 목록(앞쪽 빈칸은 0) */
export function monthCells(date: string): { year: number; month: number; day: number; cells: number[] } | null {
  if (!date) return null;
  const [y, m, d] = date.split("-").map(Number);
  const lead = new Date(Date.UTC(y, m - 1, 1)).getUTCDay();
  const last = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const cells = [...Array(lead).fill(0), ...Array.from({ length: last }, (_, i) => i + 1)];
  return { year: y, month: m, day: d, cells };
}

/** 지도 앱 길찾기 링크 (주소가 있으면 주소, 없으면 예식장 이름으로 찾는다) */
export function mapLinks(c: InvitationContent): { label: string; href: string }[] {
  const q = (c.address || c.venue).trim();
  if (!q) return [];
  const e = encodeURIComponent(q);
  const links: { label: string; href: string }[] = [];
  if (c.mapNaver) links.push({ label: "네이버 지도", href: `https://map.naver.com/p/search/${e}` });
  if (c.mapKakao) links.push({ label: "카카오맵", href: `https://map.kakao.com/link/search/${e}` });
  if (c.mapTmap) links.push({ label: "티맵", href: `tmap://search?name=${e}` });
  return links;
}
