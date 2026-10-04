'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import type { RecordEntry, Side } from '@/types/record';
import { BUCKETS, bucketOf, type BucketKey } from '@/lib/record-stats';
import { indexKey, matchesQuery, type IndexKey } from '@/lib/hangul';
import { won } from '@/lib/format';
import { IndexBar } from './IndexBar';
import { IconSearch } from './icons';

type SortKey = 'no' | 'name' | 'amt';

interface Props {
  entries: RecordEntry[];
  opened: boolean;
  showSideFilter: boolean;
}

const pad = (n: number) => String(n).padStart(3, '0');

/** S16 — 300행까지 클라이언트에서 검색·필터·정렬 (AC-09: 100ms 이내) */
export function GuestList({ entries, opened, showSideFilter }: Props) {
  const [q, setQ] = useState('');
  const [sort, setSort] = useState<SortKey>('no');
  const [side, setSide] = useState<'all' | Side>('all');
  const [bucket, setBucket] = useState<'all' | BucketKey>('all');

  const rowRefs = useRef(new Map<string, HTMLElement>());
  const setRowRef = (id: string) => (el: HTMLElement | null) => {
    if (el) rowRefs.current.set(id, el);
    else rowRefs.current.delete(id);
  };

  const effectiveSort: SortKey = !opened && sort === 'amt' ? 'no' : sort;

  const rows = useMemo(() => {
    const filtered = entries.filter((e) => {
      if (showSideFilter && side !== 'all' && e.side !== side) return false;
      if (opened && bucket !== 'all' && bucketOf(e.amount ?? 0) !== bucket) return false;
      return matchesQuery(q, e);
    });
    return filtered.sort((a, b) => {
      if (effectiveSort === 'name') return a.name.localeCompare(b.name, 'ko');
      if (effectiveSort === 'amt') return (b.amount ?? 0) - (a.amount ?? 0) || a.envelopeNo - b.envelopeNo;
      return a.envelopeNo - b.envelopeNo;
    });
  }, [entries, q, side, bucket, effectiveSort, opened, showSideFilter]);

  const byName = effectiveSort === 'name';
  const available = useMemo(() => new Set(rows.map((r) => indexKey(r.name))), [rows]);
  const filtering = q.trim() !== '' || side !== 'all' || bucket !== 'all';
  const filteredTotal = opened ? rows.reduce((a, r) => a + (r.amount ?? 0), 0) : 0;

  const jumpTo = useCallback(
    (key: IndexKey) => {
      const first = rows.find((r) => indexKey(r.name) === key);
      if (!first) return;
      // 데스크톱 표와 모바일 카드 중 보이는 쪽으로 이동
      const candidates = [`t-${first.envelopeNo}`, `c-${first.envelopeNo}`]
        .map((id) => rowRefs.current.get(id))
        .filter((el): el is HTMLElement => !!el && el.offsetParent !== null);
      candidates[0]?.scrollIntoView({ block: 'start', behavior: 'smooth' });
    },
    [rows],
  );

  const reset = () => { setQ(''); setSide('all'); setBucket('all'); };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="wbr-tools">
        <label className="wbr-search">
          <IconSearch />
          <span className="sr-only">하객 검색</span>
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="이름·봉투번호·메모 검색 (초성 ㅎㄱㄷ도 돼요)"
            autoComplete="off"
          />
        </label>
        <label className="wbr-select">
          정렬
          <select value={effectiveSort} onChange={(e) => setSort(e.target.value as SortKey)}>
            <option value="no">봉투번호순</option>
            <option value="name">이름순</option>
            {opened && <option value="amt">금액 높은순</option>}
          </select>
        </label>
      </div>

      {(showSideFilter || opened) && (
        <div className="wbr-chips">
          {showSideFilter && (
            <>
              {(['all', '신랑측', '신부측'] as const).map((s) => (
                <button key={s} className="wbr-chip" aria-pressed={side === s} onClick={() => setSide(s)}>
                  {s === 'all' ? '전체' : s}
                </button>
              ))}
              {opened && <span className="wbr-chips__sep" aria-hidden="true" />}
            </>
          )}
          {opened && (
            <>
              <button className="wbr-chip" aria-pressed={bucket === 'all'} onClick={() => setBucket('all')}>금액 전체</button>
              {BUCKETS.map((b) => (
                <button key={b.key} className="wbr-chip" aria-pressed={bucket === b.key} onClick={() => setBucket(b.key)}>
                  {b.label}
                </button>
              ))}
            </>
          )}
        </div>
      )}

      <div className="wbr-count" aria-live="polite">
        <div>{filtering ? `검색 결과 ${rows.length}명 / 전체 ${entries.length}명` : `전체 ${entries.length}명`}</div>
        {opened && <strong>합계 {won(filteredTotal)}</strong>}
      </div>

      {rows.length === 0 ? (
        <div className="wbr-empty">
          {q.trim() ? `‘${q.trim()}’에 맞는 하객이 없어요` : '조건에 맞는 하객이 없어요'}
          <button className="wbr-btn" onClick={reset}>검색 초기화</button>
        </div>
      ) : (
        <>
          <div className="wbr-listwrap">
            <div className="wbr-scroll">
              <table className="wbr-table">
                <thead>
                  <tr>
                    <th scope="col">봉투</th>
                    <th scope="col">성명</th>
                    <th scope="col">구분</th>
                    <th scope="col">관계</th>
                    {opened && <th scope="col" className="num">금액</th>}
                    <th scope="col" className="num">식권</th>
                    <th scope="col">메모</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.envelopeNo} ref={setRowRef(`t-${r.envelopeNo}`)}>
                      <td className="no">{pad(r.envelopeNo)}</td>
                      <td className="name">{r.name}</td>
                      <td>{r.side}</td>
                      <td>{r.relation ?? '—'}</td>
                      {opened && <td className="num amt">{won(r.amount ?? 0)}</td>}
                      <td className="num">{r.tickets}</td>
                      <td>{r.memo}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <ul className="wbr-cards" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                {rows.map((r) => (
                  <li key={r.envelopeNo} className="wbr-rowcard" ref={setRowRef(`c-${r.envelopeNo}`)}>
                    <div className="wbr-rowcard__top">
                      <span>{r.name}</span>
                      {opened && <span>{won(r.amount ?? 0)}</span>}
                    </div>
                    <div className="wbr-rowcard__sub">
                      {pad(r.envelopeNo)} · {r.side} · {r.relation ?? '—'} · 식권 {r.tickets}
                      {r.memo ? ` · ${r.memo}` : ''}
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <IndexBar enabled={byName} available={available} onJump={jumpTo} />
          </div>
          {!byName && <div className="wbr-muted">가나다 색인은 이름순 정렬에서 쓸 수 있어요.</div>}
        </>
      )}
    </div>
  );
}
