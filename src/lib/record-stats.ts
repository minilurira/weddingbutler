import type { RecordEntry, Side } from '@/types/record';

export type BucketKey = 'b3' | 'b5' | 'b10' | 'bx';
export const BUCKETS: { key: BucketKey; label: string }[] = [
  { key: 'b3', label: '3만원 이하' },
  { key: 'b5', label: '5만원' },
  { key: 'b10', label: '10만원' },
  { key: 'bx', label: '10만원 초과' },
];

/** 3만 이하 / 3만 초과~5만 / 5만 초과~10만 / 10만 초과 */
export const bucketOf = (amount: number): BucketKey =>
  amount <= 30_000 ? 'b3' : amount <= 50_000 ? 'b5' : amount <= 100_000 ? 'b10' : 'bx';

/** 관계 표기 순서. 템플릿 밖 값은 '기타'로 묶는다. */
export const RELATIONS = ['친척', '친구', '직장', '지인'] as const;

const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);

export interface RecordStats {
  envelopes: number;
  tickets: number;
  totalAmount: number | null; // 밀봉이면 null
  sides: { side: Side; envelopes: number; tickets: number; amount: number | null }[];
  relations: { label: string; envelopes: number; amount: number | null }[];
  buckets: { key: BucketKey; label: string; count: number }[] | null;
}

export function computeStats(entries: RecordEntry[], opened: boolean): RecordStats {
  const amt = (e: RecordEntry) => e.amount ?? 0;

  const sides = (['신랑측', '신부측'] as Side[])
    .map((side) => {
      const rs = entries.filter((e) => e.side === side);
      return { side, envelopes: rs.length, tickets: sum(rs.map((e) => e.tickets)), amount: opened ? sum(rs.map(amt)) : null };
    })
    .filter((s) => s.envelopes > 0);

  const relLabel = (r?: string) => (r && (RELATIONS as readonly string[]).includes(r) ? r : '기타');
  const relOrder = [...RELATIONS, '기타'];
  const relations = relOrder
    .map((label) => {
      const rs = entries.filter((e) => relLabel(e.relation) === label);
      return { label, envelopes: rs.length, amount: opened ? sum(rs.map(amt)) : null };
    })
    .filter((r) => r.envelopes > 0);

  return {
    envelopes: entries.length,
    tickets: sum(entries.map((e) => e.tickets)),
    totalAmount: opened ? sum(entries.map(amt)) : null,
    sides,
    relations,
    buckets: opened
      ? BUCKETS.map((b) => ({ ...b, count: entries.filter((e) => bucketOf(amt(e)) === b.key).length }))
      : null,
  };
}
