'use client';

import Image from 'next/image';
import { useMemo, useState } from 'react';
import type { RecordPayload } from '@/types/record';
import { computeStats } from '@/lib/record-stats';
import { krDate, krDateTime, krTime } from '@/lib/format';
import { SummaryTab } from './SummaryTab';
import { GuestList } from './GuestList';
import { IconDownload, IconLock, IconVideo } from './icons';
import { RecordFooter } from './RecordFrame';

type Tab = 'summary' | 'list';

const PLAN_LABEL = { small: '스몰케어 · 한쪽', standard: '스탠다드 · 한쪽', premium: '프리미엄 · 양가' } as const;

/**
 * S15 대시보드 + S16 리스트 (스탠다드·프리미엄).
 * 스몰은 S17(다운로드 전용)을 따로 렌더할 것 — 서버가 entries를 403으로 막는다(AC-07).
 * payload는 서버에서 권한 검증·마스킹이 끝난 값이어야 한다.
 */
export function RecordView({ meta, entries }: RecordPayload) {
  const [tab, setTab] = useState<Tab>('summary');
  const opened = meta.recordMode === 'opened';
  const premium = meta.plan === 'premium';
  const stats = useMemo(() => computeStats(entries, opened), [entries, opened]);

  const extraGuests = Math.max(0, stats.tickets - meta.baseGuests);
  const envelopeMismatch = meta.handoverEnvelopeCount !== stats.envelopes;

  return (
    <div className="wbr">
      <header className="wbr-header">
        <div className="wbr-header__in">
          <span className="wbr-brand">
            <Image src="/brand/wb-logo-96.png" alt="" width={40} height={40} priority />
            웨딩버틀러
          </span>
          <a className="wbr-support" href={`tel:${meta.supportPhone.replace(/[^0-9]/g, '')}`}>
            고객센터 {meta.supportPhone}
          </a>
        </div>
      </header>

      <main className="wbr-main">
        <section className="wbr-hero">
          <div className="wbr-tags">
            <span className="wbr-tag wbr-tag--brand">{PLAN_LABEL[meta.plan]}</span>
            <span className="wbr-tag">{opened ? '개봉 집계' : '밀봉 접수'}</span>
            <span className="wbr-muted">{meta.bookingNo}</span>
          </div>
          <h1>{meta.coupleName} 님의 축의 기록</h1>
          <div className="wbr-hero__line">
            {krDateTime(meta.weddingAt)} · {meta.venueName}
            {meta.hallName ? ` ${meta.hallName}` : ''}
          </div>
          <div className="wbr-hero__meta">
            기록 게시 {krDateTime(meta.publishedAt)} · 인계확인서 서명 {krTime(meta.handoverAt)} · 버전 {meta.version}
          </div>
        </section>

        <div className="wbr-bar">
          <div className="wbr-tabs" role="tablist" aria-label="기록 보기">
            <button role="tab" id="tab-summary" aria-controls="panel-summary" aria-selected={tab === 'summary'} className="wbr-tab" onClick={() => setTab('summary')}>
              요약
            </button>
            <button role="tab" id="tab-list" aria-controls="panel-list" aria-selected={tab === 'list'} className="wbr-tab" onClick={() => setTab('list')}>
              하객 리스트 {stats.envelopes}
            </button>
          </div>
          <div className="wbr-actions">
            {meta.videoUrl && (
              <a className="wbr-btn" href={meta.videoUrl} target="_blank" rel="noopener noreferrer">
                <IconVideo /> 운영 영상 보기
              </a>
            )}
            <a className="wbr-btn wbr-btn--primary" href={meta.downloadUrl}>
              <IconDownload /> 엑셀 다운로드
            </a>
          </div>
        </div>

        {!opened && (
          <div className="wbr-notice" role="note">
            <IconLock />
            <div>밀봉 접수로 금액은 기록되지 않았어요. 봉투는 개봉하지 않은 채 번호 순서대로 전달됐어요.</div>
          </div>
        )}

        {tab === 'summary' ? (
          <div id="panel-summary" role="tabpanel" aria-labelledby="tab-summary">
            <SummaryTab
              stats={stats}
              opened={opened}
              showSides={premium}
              envelopeMismatch={envelopeMismatch}
              handoverEnvelopeCount={meta.handoverEnvelopeCount}
              facts={[
                { label: '축의금 인수자', value: meta.receiverLabel },
                { label: '인계 시각', value: krDateTime(meta.handoverAt) },
                { label: '담당 버틀러', value: `버틀러 ${meta.staffCount}명 (2인 상호확인)` },
                {
                  label: '추가 하객 정산',
                  value: extraGuests > 0
                    ? `식권 기준 ${extraGuests}명 · ${(extraGuests * meta.extraGuestFee).toLocaleString('ko-KR')}원`
                    : '기본 하객 이내 · 추가 없음',
                },
              ]}
            />
          </div>
        ) : (
          <div id="panel-list" role="tabpanel" aria-labelledby="tab-list">
            <GuestList entries={entries} opened={opened} showSideFilter={premium} />
          </div>
        )}

        <section className="wbr-retention">
          <div>
            <strong>이 기록은 {krDate(meta.expiresAt)}에 삭제돼요</strong>
            <p>하객 개인정보 보호를 위해 정해진 기간 동안만 열람할 수 있어요. 엑셀 파일로 보관해 주세요.</p>
          </div>
          <a className="wbr-btn" href={meta.downloadUrl}>엑셀로 보관하기</a>
        </section>

        <RecordFooter />
      </main>
    </div>
  );
}
