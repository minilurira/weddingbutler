'use client';

import { useEffect, useRef, useState } from 'react';
import { INDEX_BAR, type IndexKey } from '@/lib/hangul';

interface Props {
  enabled: boolean;              // 이름순 정렬일 때만 true
  available: Set<string>;        // 현재 결과에 존재하는 색인 키
  onJump: (key: IndexKey) => void;
}

/** 우측 세로 가나다 색인 — 탭/드래그로 이동, 중앙 큰 글자 오버레이 */
export function IndexBar({ enabled, available, onJump }: Props) {
  const [overlay, setOverlay] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const lastKey = useRef<string | null>(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  const fire = (key: IndexKey) => {
    if (!enabled || !available.has(key) || lastKey.current === key) return;
    lastKey.current = key;
    onJump(key);
    setOverlay(key === 'A-Z' ? 'A' : key);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => { setOverlay(null); lastKey.current = null; }, 700);
  };

  // 드래그: 손가락 아래 버튼의 data-key를 읽는다
  const onPointerMove = (e: React.PointerEvent) => {
    if (e.buttons === 0 && e.pointerType === 'mouse') return;
    const el = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null;
    const key = el?.dataset.key as IndexKey | undefined;
    if (key) fire(key);
  };

  return (
    <>
      <nav
        className="wbr-index"
        aria-label="가나다 색인"
        data-disabled={!enabled}
        onPointerMove={onPointerMove}
      >
        {INDEX_BAR.map((k) => {
          const off = !enabled || !available.has(k);
          return (
            <button
              key={k}
              type="button"
              data-key={k}
              disabled={off}
              aria-label={`${k}(으)로 이동`}
              onClick={() => { lastKey.current = null; fire(k); }}
            >
              {k === 'A-Z' ? 'A' : k}
            </button>
          );
        })}
      </nav>
      {overlay && <div className="wbr-overlay" aria-hidden="true">{overlay}</div>}
    </>
  );
}
