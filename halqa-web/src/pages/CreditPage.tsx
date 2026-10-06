import { useEffect, useState } from 'react';
import { ShieldCheck, TrendingUp } from 'lucide-react';
import { api } from '../api';
import { date, money } from '../lib/format';
import type { User } from '../types';
import { ScoreRing } from '../components/ui';
import Affordability from '../components/Affordability';
import ScoreSimulator from '../components/ScoreSimulator';
import { Card, Facts, FlowHeader, Row, RowGroup } from '../components/wallet';

// ---------------------------------------------------------------------------
// THE CREDIT REPORT
//
// A bureau-style dashboard built entirely from the member's own Halqa record:
// the score and its band, every instalment as a dot, how the score has moved,
// and the factors behind it. Nothing here is collected for the purpose; it is
// all data the member can already see elsewhere in the app.
// ---------------------------------------------------------------------------

type CreditEvent = { id: string; reason: string; scoredAt: string; delta: number };
type PaymentRow = { id: string; amountPaisa: string; status: string; paidAt?: string | null; round: { roundNumber: number; committee: { name: string } } };

const BAND = (score: number) =>
  score >= 760 ? { label: 'Excellent', tone: 'ok' as const, note: 'Every turn position and hosting are open to you.' }
  : score >= 700 ? { label: 'Good', tone: 'ok' as const, note: 'Hosting is unlocked and you rank strongly for early turns.' }
  : score >= 640 ? { label: 'Fair', tone: 'warn' as const, note: 'Building. On-time turns carry you towards hosting at 700.' }
  : { label: 'Needs work', tone: 'bad' as const, note: 'Recent misses are weighing on it. Every on-time turn recovers ground.' };

const DOT = (status: string) =>
  status === 'PAID' ? { c: 'var(--ok)', t: 'On time' }
  : status === 'LATE' ? { c: 'var(--warn)', t: 'Late' }
  : status === 'MISSED' ? { c: 'var(--bad)', t: 'Missed' }
  : { c: 'var(--line)', t: 'Not due yet' };

export default function CreditPage({ user, back }: { user: User; back: () => void }) {
  const [events, setEvents] = useState<CreditEvent[]>([]);
  const [payments, setPayments] = useState<PaymentRow[]>([]);

  useEffect(() => {
    void Promise.all([api<CreditEvent[]>('/profile/credit'), api<PaymentRow[]>('/payments/mine')])
      .then(([ev, rows]) => { setEvents(ev); setPayments(rows) })
      .catch(() => {});
  }, []);

  const band = BAND(user.creditScore);
  const recent = payments.slice(0, 12);
  const onTimePct = payments.length
    ? Math.round(payments.filter(p => p.status === 'PAID').length / payments.length * 100)
    : null;

  // Walk the score backwards through its events to draw recent movement.
  const trend = (() => {
    const points: { score: number }[] = [{ score: user.creditScore }];
    let s = user.creditScore;
    for (const e of events.slice(0, 11)) { s -= e.delta; points.unshift({ score: s }) }
    return points;
  })();
  const negatives = events.filter(e => e.delta < 0).length;
  const positives = events.filter(e => e.delta > 0).length;

  return (
    <div className="w-screen">
      <FlowHeader title="Credit report" onBack={back} />

      <section className="cred-band">
        <ScoreRing score={user.creditScore} />
        <div>
          <b>{band.label}</b>
          <span>{band.note}</span>
        </div>
      </section>

      <div className="w-screen-body">
        <Card>
          <Facts cols={3} items={[
            ['Paid on time', onTimePct === null ? 'No history' : onTimePct + '%'],
            ['Instalments', String(payments.length)],
            ['Hosting', user.creditScore >= 700 ? 'Unlocked' : 'At 700'],
          ]} />
        </Card>

        <Card title={'Your last ' + (recent.length || 12) + ' instalments'}
              action={<ShieldCheck />}>
          {recent.length ? (
            <>
              <div className="cred-dots">
                {recent.map(p => {
                  const d = DOT(p.status);
                  return <i key={p.id} style={{ background: d.c }}
                            title={p.round.committee.name + ', turn ' + p.round.roundNumber + ', ' + money(p.amountPaisa) + ', ' + d.t} />;
                })}
              </div>
              <div className="cred-legend">
                {[...new Set(recent.map(p => p.status))].map(st => {
                  const d = DOT(st);
                  return <span key={st}><i style={{ background: d.c }} />{d.t}</span>;
                })}
              </div>
            </>
          ) : (
            <p className="w-body">No instalments recorded yet. Join a circle and your history starts.</p>
          )}
        </Card>

        <Card title="How your score has moved" action={<TrendingUp />}>
          {trend.length > 1 ? (() => {
            const W = 300, H = 76, pad = 6;
            const vals = trend.map(p => p.score);
            const lo0 = Math.min(...vals), hi0 = Math.max(...vals);
            const span = Math.max(hi0 - lo0, 12);
            const mid = (lo0 + hi0) / 2;
            const lo = mid - span * 0.75, hi = mid + span * 0.75;
            const x = (i: number) => pad + i * (W - pad * 2) / (trend.length - 1);
            const y = (v: number) => H - pad - (v - lo) / (hi - lo || 1) * (H - pad * 2);
            const line = trend.map((p, i) => x(i).toFixed(1) + ',' + y(p.score).toFixed(1)).join(' ');
            const first = trend[0].score, last = trend[trend.length - 1].score;
            const move = last - first;
            return (
              <>
                <svg className="cred-spark" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none"
                     role="img" aria-label={`Score moved from ${first} to ${last}`}>
                  <polyline points={line} fill="none" stroke="var(--l600)" strokeWidth="2"
                            strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
                  <circle cx={x(trend.length - 1)} cy={y(last)} r="3.5" fill="var(--l600)" />
                </svg>
                <div className="cred-spark-foot">
                  <span>{first}<small>when this started</small></span>
                  <span className={move >= 0 ? 'up' : 'down'}>
                    {move >= 0 ? '+' : ''}{move}<small>{trend.length} score events</small></span>
                  <span><b>{last}</b><small>today</small></span>
                </div>
              </>
            );
          })() : <p className="w-foot">Your score has not moved yet.</p>}
        </Card>

        <Affordability monthlyIncomeP={Number(user.declaredIncomePaisa || 0)}
                       committedMonthlyP={0} activeCircles={0}
                       verified={Boolean(user.incomeVerifiedAt)} />
        <ScoreSimulator score={user.creditScore} />

        <RowGroup title="What is behind the number">
          <Row chevron={false} title="Positive events"
               sub="On-time turns, clean finishes"
               value={String(positives)} tone="ok" />
          <Row chevron={false} title="Negative events"
               sub="Late, missed, penalties"
               value={String(negatives)} tone={negatives ? 'bad' : undefined} />
          <Row chevron={false} title="Identity level"
               sub="CNIC on file"
               value={String(user.kycLevel)} />
        </RowGroup>

        {events.length > 0 && (
          <RowGroup title="Recent events">
            {events.slice(0, 10).map(e => (
              <Row key={e.id} chevron={false} title={e.reason} sub={date(e.scoredAt)}
                   value={(e.delta > 0 ? '+' : '') + e.delta}
                   tone={e.delta >= 0 ? 'ok' : 'bad'} />
            ))}
          </RowGroup>
        )}
      </div>
    </div>
  );
}
