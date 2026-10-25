'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/** 실시간 공유 중인 기록: 화면이 보이는 동안 일정 간격으로 서버에서 최신 명단을 다시 불러온다. */
export function LiveRefresh({ seconds = 20 }: { seconds?: number }) {
  const router = useRouter();
  useEffect(() => {
    const tick = () => { if (document.visibilityState === 'visible') router.refresh(); };
    const id = setInterval(tick, seconds * 1000);
    document.addEventListener('visibilitychange', tick); // 다시 화면으로 돌아오면 바로 갱신
    return () => { clearInterval(id); document.removeEventListener('visibilitychange', tick); };
  }, [router, seconds]);
  return null;
}
