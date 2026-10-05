// 03 요청서 7-11 그대로. 업로드 시 서버에서 name_index·name_cho를 계산할 때도 이 모듈을 쓴다.

const CHO = ['ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ','ㅅ','ㅆ','ㅇ','ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'] as const;
const MERGE: Record<string, string> = { 'ㄲ': 'ㄱ', 'ㄸ': 'ㄷ', 'ㅃ': 'ㅂ', 'ㅆ': 'ㅅ', 'ㅉ': 'ㅈ' };

export const INDEX_BAR = ['ㄱ','ㄴ','ㄷ','ㄹ','ㅁ','ㅂ','ㅅ','ㅇ','ㅈ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ','A-Z','#'] as const;
export type IndexKey = (typeof INDEX_BAR)[number];

export const choseongOf = (ch: string): string | null => {
  const c = ch.charCodeAt(0);
  return c >= 0xac00 && c <= 0xd7a3 ? CHO[Math.floor((c - 0xac00) / 588)] : null;
};

export const indexKey = (name: string): IndexKey => {
  const f = name.trim().charAt(0);
  const cho = choseongOf(f);
  if (cho) return (MERGE[cho] ?? cho) as IndexKey;
  return /[A-Za-z]/.test(f) ? 'A-Z' : '#';
};

export const choseongString = (name: string): string =>
  [...name].map((ch) => choseongOf(ch) ?? ch).join('');

const ONLY_CHO = /^[ㄱ-ㅎ]+$/;

/** 성명·봉투번호·메모 부분일치, 입력이 초성만이면 초성 문자열로 비교 */
export const matchesQuery = (
  q: string,
  e: { name: string; envelopeNo: number; memo?: string },
): boolean => {
  const query = q.trim();
  if (!query) return true;
  if (ONLY_CHO.test(query)) return choseongString(e.name).includes(query);
  const lq = query.toLowerCase();
  return (
    e.name.toLowerCase().includes(lq) ||
    String(e.envelopeNo).padStart(3, '0').includes(query) ||
    (e.memo ?? '').toLowerCase().includes(lq)
  );
};
