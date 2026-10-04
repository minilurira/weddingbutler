import type { RecordStats } from '@/lib/record-stats';
import { num, won } from '@/lib/format';

interface Props {
  stats: RecordStats;
  opened: boolean;
  showSides: boolean;
  envelopeMismatch: boolean;
  handoverEnvelopeCount: number;
  facts: { label: string; value: string }[];
}

/** S15 — 혼주도 보므로 숫자 카드를 차트보다 위, 크게. 차트는 2개 이내. */
export function SummaryTab({ stats, opened, showSides, envelopeMismatch, handoverEnvelopeCount, facts }: Props) {
  const relMax = Math.max(1, ...stats.relations.map((r) => (opened ? r.amount ?? 0 : r.envelopes)));
  const bucketMax = Math.max(1, ...(stats.buckets ?? []).map((b) => b.count));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div className="wbr-grid">
        {opened && stats.totalAmount !== null && (
          <div className="wbr-stat wbr-stat--brand">
            <div className="wbr-stat__label">총 축의금</div>
            <div className="wbr-stat__value">{num(stats.totalAmount)}<span className="wbr-stat__unit">원</span></div>
            <div className="wbr-muted">인계 현금과 합계 일치 확인</div>
          </div>
        )}
        <div className="wbr-stat">
          <div className="wbr-stat__label">봉투</div>
          <div className="wbr-stat__value">{num(stats.envelopes)}<span className="wbr-stat__unit">매</span></div>
          <div className="wbr-muted">
            {envelopeMismatch
              ? `인계확인서 ${handoverEnvelopeCount}매 — 고객센터로 문의해 주세요`
              : `인계확인서 ${handoverEnvelopeCount}매와 일치`}
          </div>
        </div>
        <div className="wbr-stat">
          <div className="wbr-stat__label">식권</div>
          <div className="wbr-stat__value">{num(stats.tickets)}<span className="wbr-stat__unit">장</span></div>
          <div className="wbr-muted">추가 하객 정산 기준</div>
        </div>
      </div>

      {showSides && stats.sides.length > 1 && (
        <div className="wbr-grid wbr-grid--wide">
          {stats.sides.map((s) => (
            <div key={s.side} className="wbr-side">
              <div>
                <div className="wbr-side__name">{s.side}</div>
                <div className="wbr-muted" style={{ fontSize: 15 }}>봉투 {s.envelopes}매 · 식권 {s.tickets}장</div>
              </div>
              <div className="wbr-side__value">{s.amount !== null ? won(s.amount) : `${s.envelopes}매`}</div>
            </div>
          ))}
        </div>
      )}

      <div className="wbr-grid wbr-grid--wide">
        <section className="wbr-card" aria-labelledby="rel-h">
          <div className="wbr-card__head">
            <h2 id="rel-h">관계별 {opened ? '합계' : '봉투 수'}</h2>
            <span className="wbr-muted">{opened ? '금액 기준' : '금액 미기록'}</span>
          </div>
          {stats.relations.map((r) => {
            const v = opened ? r.amount ?? 0 : r.envelopes;
            return (
              <div key={r.label} className="wbr-hbar">
                <div className="wbr-hbar__label">{r.label}</div>
                <div className="wbr-hbar__track" aria-hidden="true">
                  <div className="wbr-hbar__fill" style={{ width: `${Math.round((v / relMax) * 100)}%` }} />
                </div>
                <div className="wbr-hbar__value">{opened ? won(v) : `${v}매`}</div>
              </div>
            );
          })}
        </section>

        {opened && stats.buckets && (
          <section className="wbr-card" aria-labelledby="bucket-h">
            <div className="wbr-card__head">
              <h2 id="bucket-h">금액대 분포</h2>
              <span className="wbr-muted">봉투 수</span>
            </div>
            <div className="wbr-vbars">
              {stats.buckets.map((b) => (
                <div key={b.key} className="wbr-vbar">
                  <span>{b.count}매</span>
                  <div className="wbr-vbar__fill" style={{ height: Math.round((b.count / bucketMax) * 130) }} aria-hidden="true" />
                </div>
              ))}
            </div>
            <div className="wbr-vbars__labels">
              {stats.buckets.map((b) => <div key={b.key}>{b.label}</div>)}
            </div>
          </section>
        )}
      </div>

      <dl className="wbr-facts">
        {facts.map((f) => (
          <div key={f.label}>
            <dt>{f.label}</dt>
            <dd>{f.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
