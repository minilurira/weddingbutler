// 라인 아이콘 (stroke = currentColor). 아이콘만 있는 버튼은 만들지 말 것(02 기획안 1장).
const base = {
  width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none',
  stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const,
  'aria-hidden': true,
};

export const IconDownload = () => (
  <svg {...base}><path d="M12 4v11" /><path d="M7 10l5 5 5-5" /><path d="M5 20h14" /></svg>
);
export const IconVideo = () => (
  <svg {...base}><rect x="3" y="5" width="13" height="14" rx="2" /><path d="M16 10l5-3v10l-5-3z" /></svg>
);
export const IconLock = () => (
  <svg {...base} width={20} height={20}><rect x="4" y="10" width="16" height="10" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></svg>
);
export const IconSearch = () => (
  <svg {...base} width={20} height={20} stroke="var(--wb-caption)"><circle cx="11" cy="11" r="7" /><path d="M20 20l-4-4" /></svg>
);
