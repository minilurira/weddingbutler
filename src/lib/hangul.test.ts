// vitest 기준. jest면 import 줄만 지우면 된다.
import { describe, expect, it } from 'vitest';
import { indexKey, matchesQuery } from './hangul';

describe('indexKey', () => {
  it.each([
    ['홍길동', 'ㅎ'],
    ['꽃님', 'ㄱ'],
    ['쌍둥이', 'ㅅ'],
    ['Kim', 'A-Z'],
    ['(주)회사', '#'],
  ])('%s → %s', (name, key) => expect(indexKey(name)).toBe(key));
});

describe('matchesQuery', () => {
  const e = { name: '홍길동', envelopeNo: 14, memo: '대리 전달' };
  it('초성 검색', () => expect(matchesQuery('ㅎㄱㄷ', e)).toBe(true));
  it('봉투번호 0패딩', () => expect(matchesQuery('014', e)).toBe(true));
  it('메모', () => expect(matchesQuery('대리', e)).toBe(true));
  it('불일치', () => expect(matchesQuery('ㄱㄱ', e)).toBe(false));
});
