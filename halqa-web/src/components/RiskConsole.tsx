import { useCallback, useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle2, Gauge, Info, RefreshCw, Shield, SlidersHorizontal } from 'lucide-react';
import { api } from '../api';
import { money } from '../lib/format';
import type { RiskAssessment, RiskProjection } from '../types';
import { BottomBar, Card, Facts, Field, Notice, Row, RowGroup, Sheet } from './wallet';

// ---------------------------------------------------------------------------
// THE RISK VIEW
//
// It was four dials, a strip of economics, a list of factors each with a
// decimal score and its own bar, a policy editor with three number inputs, a
// deposit board, a recommendations column and a consent card, all on one
// screen. It read as an instrument panel, not a thing a member could use.
//
// A member needs the grade and what is driving it. A host needs the mandate and
// the deposits. So: one grade, three figures, the factors as rows, and the host
// controls in a sheet behind a button that only a host sees.
// ---------------------------------------------------------------------------

type Deposit = { id: string; amountPaisa: string; status: 'PENDING' | 'HELD' | 'REFUNDED' | 'FORFEITED'; membership: { turnPosition: number; user: { id: string; fullName: string; username: string } } };
type RiskPolicy = { targetRiskScore: number; payoutBufferBps: number; liquidityReserveBps: number; latePenaltyBps: number; guarantorRequired: boolean; dynamicDeposit: boolean; profitCollateral: boolean; capitalDaysDistribution: boolean; delayedDistributionDays: number; profitRecycling: boolean; progressivePenalties: boolean; payoutHoldbackEnabled: boolean; holdbackReleasePayments: number; featureLockOnDefault: boolean; smartNudges: boolean; peerNudges: boolean; promissoryNoteRequired: boolean; autoDebitMandateRequired: boolean; depositYieldBps: number; insuranceReserveBps: number; postReceiptPenaltyPoints: number; rehabilitationCooldownMonths: number; consentText: string };

const defaultPolicy: RiskPolicy = { targetRiskScore: 3, payoutBufferBps: 1500, liquidityReserveBps: 1000, latePenaltyBps: 200, guarantorRequired: false, dynamicDeposit: true, profitCollateral: true, capitalDaysDistribution: true, delayedDistributionDays: 0, profitRecycling: false, progressivePenalties: true, payoutHoldbackEnabled: true, holdbackReleasePayments: 2, featureLockOnDefault: true, smartNudges: true, peerNudges: true, promissoryNoteRequired: false, autoDebitMandateRequired: false, depositYieldBps: 0, insuranceReserveBps: 0, postReceiptPenaltyPoints: 200, rehabilitationCooldownMonths: 6, consentText: 'I understand this committee risk limit, liquidity policy, default controls and that all projections are indicative rather than guaranteed.' };

export function RiskBadge({ score, band }: { score: number; band: string }) {
  return <span className={'risk-badge risk-' + band.toLowerCase()}><i>{score}</i>{band.charAt(0) + band.slice(1).toLowerCase()}</span>;
}

const statusWord = (s: string) =>
  s === 'HELD' ? 'Held' : s === 'PENDING' ? 'Waiting' : s === 'REFUNDED' ? 'Returned' : 'Forfeited';

export default function RiskConsole({ committeeId, host }: { committeeId: string; host: boolean }) {
  const [risk, setRisk] = useState<RiskAssessment | null>(null);
  const [projection, setProjection] = useState<RiskProjection | null>(null);
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [refs, setRefs] = useState<Record<string, string>>({});
  const [policy, setPolicy] = useState<RiskPolicy>(defaultPolicy);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [mandate, setMandate] = useState(false);

  const load = useCallback(async () => {
    try {
      const [assessment, forecast, depositRows] = await Promise.all([
        api<RiskAssessment>('/risk/committee/' + committeeId),
        api<RiskProjection>('/risk/committee/' + committeeId + '/projection'),
        api<Deposit[]>('/committees/' + committeeId + '/deposits').catch(() => []),
      ]);
      setRisk(assessment); setProjection(forecast); setDeposits(depositRows);
      setPolicy({ ...defaultPolicy, ...assessment.policy, targetRiskScore: assessment.riskTolerance } as RiskPolicy);
    } catch (reason) { setError((reason as Error).message) }
  }, [committeeId]);
  useEffect(() => { void load() }, [load]);

  const run = async (fn: () => Promise<unknown>) => {
    setBusy(true); setError('');
    try { await fn(); await load() }
    catch (reason) { setError((reason as Error).message) }
    finally { setBusy(false) }
  };

  const confirmDeposit = (id: string) => {
    const txnRef = refs[id]?.trim(); if (!txnRef) return;
    void run(() => api('/committees/' + committeeId + '/deposits/' + id + '/confirm',
      { method: 'POST', body: JSON.stringify({ txnRef }) }));
  };

  if (!risk) return <Row chevron={false} icon={<Gauge />} title="Working out the risk" />;

  const accepted = risk.consent?.status === 'ACCEPTED';

  return (
    <>
      <Card title="How risky this circle is" action={<RiskBadge score={risk.score} band={risk.band} />}>
        <Facts cols={3} items={[
          ['Loss set aside', (risk.expectedLossBps / 100).toFixed(2) + '%'],
          ['Early-turn deposit', money(risk.depositRequiredPaisa)],
          ['Expected profit', money(projection?.expectedProfitPaisa || 0)],
        ]} />
        {!accepted && (
          <>
            <Notice kind="warn" icon={<Shield />}>
              Accept the allocation, liquidity and default controls before this circle starts.
            </Notice>
            <button className="primary full" disabled={busy}
                    onClick={() => void run(() => api('/risk/committee/' + committeeId + '/consent',
                      { method: 'POST', body: JSON.stringify({ accepted: true }) }))}>
              I understand and accept
            </button>
          </>
        )}
        {accepted && (
          <Notice kind="ok" icon={<CheckCircle2 />}>
            You accepted these terms, and the acceptance is locked to this version.
          </Notice>
        )}
      </Card>

      <RowGroup title="What drives the grade">
        {risk.factors.map(f => (
          <Row key={f.key} chevron={false} title={f.label} sub={f.evidence}
               value={f.score.toFixed(1)}
               tone={f.score <= 3 ? 'ok' : f.score <= 6 ? undefined : 'warn'} />
        ))}
      </RowGroup>

      {risk.recommendations.length > 0 && (
        <RowGroup title="What would lower it">
          {risk.recommendations.map(r => (
            <Row key={r} chevron={false} icon={<AlertTriangle />} title={r} />
          ))}
        </RowGroup>
      )}

      {deposits.length > 0 && (
        <RowGroup title="Security deposits">
          {deposits.map(d => (
            <div key={d.id}>
              <Row chevron={false} title={d.membership.user.fullName}
                   sub={'Turn ' + d.membership.turnPosition}
                   value={money(d.amountPaisa)} valueSub={statusWord(d.status)}
                   tone={d.status === 'HELD' ? 'ok' : d.status === 'FORFEITED' ? 'bad' : 'warn'} />
              {host && d.status === 'PENDING' && (
                <div className="w-inset" style={{ paddingBottom: 10 }}>
                  <div className="risk-confirm">
                    <input aria-label="Transfer reference" value={refs[d.id] || ''} placeholder="Transfer reference"
                           onChange={e => setRefs({ ...refs, [d.id]: e.target.value })} />
                    <button className="secondary" disabled={busy || !refs[d.id]?.trim()}
                            onClick={() => confirmDeposit(d.id)}>Confirm</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </RowGroup>
      )}

      {host && (
        <div className="w-inset">
          <div className="w-actions">
            {risk.committeeStatus === 'FORMING' && (
              <button className="secondary" onClick={() => setMandate(true)}>
                <SlidersHorizontal /> Risk mandate
              </button>
            )}
            <button className="secondary" disabled={busy}
                    onClick={() => void run(() => api('/risk/committee/' + committeeId + '/refresh', { method: 'POST' }))}>
              <RefreshCw /> Recalculate
            </button>
          </div>
        </div>
      )}

      {error && <div className="w-inset"><Notice kind="bad" icon={<Info />}>{error}</Notice></div>}
      <p className="w-foot">
        Model {risk.modelVersion}. It estimates exposure. It does not guarantee a return or
        prevent a loss.
      </p>

      {mandate && (
        <Sheet title="Risk mandate" onClose={() => setMandate(false)}>
          <div className="w-inset" style={{ paddingTop: 12 }}>
            <Notice kind="info" icon={<Info />}>
              Locks when the circle starts. Any scheme above the ceiling is refused.
            </Notice>
          </div>
          <Field label={'Ceiling: ' + policy.targetRiskScore + ' out of 10'}>
            <input aria-label="Risk appetite" className="allocation-slider" type="range" min="1"
                   max={risk.mode === 'ROTATING' ? 3 : risk.mode === 'HYBRID' ? 6 : 8} step="1"
                   value={policy.targetRiskScore}
                   onChange={e => setPolicy({ ...policy, targetRiskScore: +e.target.value })} />
          </Field>
          <Field label="Payout buffer, per cent">
            <input aria-label="Payout buffer, per cent" inputMode="numeric" value={policy.payoutBufferBps / 100}
                   onChange={e => setPolicy({ ...policy, payoutBufferBps: (Number(e.target.value.replace(/\D/g, '')) || 0) * 100 })} />
          </Field>
          <Field label="Liquidity reserve, per cent">
            <input aria-label="Liquidity reserve, per cent" inputMode="numeric" value={policy.liquidityReserveBps / 100}
                   onChange={e => setPolicy({ ...policy, liquidityReserveBps: (Number(e.target.value.replace(/\D/g, '')) || 0) * 100 })} />
          </Field>
          <Field label="Late penalty, per cent">
            <input aria-label="Late charge, per cent" inputMode="numeric" value={policy.latePenaltyBps / 100}
                   onChange={e => setPolicy({ ...policy, latePenaltyBps: (Number(e.target.value.replace(/\D/g, '')) || 0) * 100 })} />
          </Field>
          <BottomBar>
            <button className="primary full" disabled={busy}
                    onClick={() => { setMandate(false); void run(async () => {
                      await api('/risk/committee/' + committeeId + '/policy', { method: 'PATCH', body: JSON.stringify(policy) });
                      await api('/risk/committee/' + committeeId + '/refresh', { method: 'POST' });
                    }) }}>
              Save the mandate
            </button>
          </BottomBar>
        </Sheet>
      )}
    </>
  );
}
