import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  BadgeCheck, BellRing, FileSignature, Info, Landmark, LockKeyhole, ShieldCheck,
} from 'lucide-react';
import { api } from '../api';
import { money } from '../lib/format';
import type { User } from '../types';
import { SHOW_BANK_RAIL } from '../config';
import { BottomBar, Card, Facts, Field, Notice, Row, RowGroup, Sheet } from './wallet';

// ---------------------------------------------------------------------------
// CIRCLE SAFETY
//
// This was two panels of prose, a nine-row list of ACTIVE / OFF with wrapped
// labels, a table of members with four columns, and a commitment form sitting
// open underneath all of it. On a phone it was a wall.
//
// A member opens this tab to answer three questions: what do I still owe, am I
// covered, and is anybody behind. Those are the top of the screen. The
// safeguards are one line each, the members are rows, and the optional
// assurance form is a sheet, because most members never touch it.
// ---------------------------------------------------------------------------

type Commitment = { id: string; guarantor?: { id: string; fullName: string; creditScore: number }; promissoryRef?: string; autoDebitRef?: string; acceptedTermsAt?: string; verifiedByHostAt?: string };
type ProtectionMember = { membershipId: string; user: { id: string; fullName: string; creditScore: number; defaultFlag: boolean; cooldownUntil?: string }; turnPosition: number; hasReceived: boolean; status: string; currentPayment: null | { id: string; status: string; dueDate: string; penaltyPaisa: string }; daysToDeadline: number | null; remainingDuesPaisa: string; heldDepositPaisa: string; heldPayoutPaisa: string; defaultImpactPaisa: string; commitment?: Commitment; forwardLiabilityPaisa?: string; requiredSecurityPaisa?: string; postedSecurityPaisa?: string; securityShortfallPaisa?: string; securitySatisfied?: boolean; securityGateActive?: boolean };
type ProtectionSummary = { policy: Record<string, unknown>; payoutBufferBps: number; forwardLiabilityGateEnabled?: boolean; latePenaltyBps: number; activeRound: null | { roundNumber: number; dueDate: string; payoutDate: string }; openRecoveryCases: number; matrix: ProtectionMember[]; partnerGates: { key: string; label: string; status: string }[] };

const flag = (value: unknown, fallback = true) => typeof value === 'boolean' ? value : fallback;
const title = (v: string) => v.toLowerCase().replaceAll('_', ' ').replace(/(^|\s)\S/g, l => l.toUpperCase());
const payWord = (s?: string) =>
  s === 'PAID' ? 'Paid' : s === 'LATE' ? 'Late' : s === 'MISSED' ? 'Missed' : s === 'WAIVED' ? 'Waived' : 'Due';

export default function ProtectionCenter({ committeeId, user, host }:
  { committeeId: string; user: User; host: boolean }) {
  const [summary, setSummary] = useState<ProtectionSummary | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState('');
  const [assure, setAssure] = useState(false);
  const [guarantorUsername, setGuarantorUsername] = useState('');
  const [promissoryRef, setPromissoryRef] = useState('');
  const [autoDebitRef, setAutoDebitRef] = useState('');

  const load = useCallback(() =>
    api<ProtectionSummary>('/protection/committee/' + committeeId)
      .then(setSummary).catch(reason => setError(reason.message)), [committeeId]);
  useEffect(() => { void load() }, [load]);

  // A summary without a matrix is a bad response, not a crash. The preview
  // fixture fell through to an empty array, which is truthy, so .matrix was
  // undefined and .find threw the whole Safety tab into the error boundary.
  const ok = !!summary && Array.isArray(summary.matrix) && !!summary.policy;
  const mine = useMemo(() => ok ? summary!.matrix.find(m => m.user.id === user.id) : undefined, [ok, summary, user.id]);

  const act = async (key: string, run: () => Promise<unknown>) => {
    setBusy(key); setError('');
    try { await run(); await load() }
    catch (reason) { setError((reason as Error).message) }
    finally { setBusy('') }
  };

  if (!ok) return (
    <RowGroup>
      <Row chevron={false} icon={<ShieldCheck />}
           title={error ? 'Could not load the safety controls' : 'Loading the safety controls'}
           sub={error || undefined} />
    </RowGroup>
  );

  const behind = summary.matrix.filter(m => m.currentPayment && m.currentPayment.status !== 'PAID').length;

  const controls: [string, boolean, string][] = [
    ['Payout holdback', flag(summary.policy.payoutHoldbackEnabled), summary.payoutBufferBps / 100 + '% until you have paid on'],
    ['Forward-liability security', summary.forwardLiabilityGateEnabled === true, summary.forwardLiabilityGateEnabled === true ? 'An early turn must be secured first' : 'Not on for this circle'],
    ['Late penalties', flag(summary.policy.progressivePenalties), 'Base ' + summary.latePenaltyBps / 100 + '%, up to 10%'],
    ['Lock on default', flag(summary.policy.featureLockOnDefault), 'Join, host and marketplace blocked'],
    ['Credit-weighted turns', true, 'A better record gets an earlier turn'],
    ['Reminders', flag(summary.policy.smartNudges), 'Private, before any score damage'],
    ['Rehabilitation', true, Number(summary.policy.rehabilitationCooldownMonths ?? 6) + ' month cooldown after recovery'],
  ];

  return (
    <>
      {/* What you owe, and whether it is covered. */}
      <Card>
        <Facts cols={3} items={[
          ['You still owe', money(mine?.remainingDuesPaisa || mine?.defaultImpactPaisa || 0)],
          ['Turns left', String(summary.matrix.length - behind)],
          ['Behind', String(behind)],
        ]} />
        {mine?.daysToDeadline != null && (
          <Notice kind={mine.daysToDeadline < 0 ? 'bad' : 'info'} icon={<Info />}>
            {mine.daysToDeadline >= 0
              ? mine.daysToDeadline + ' day' + (mine.daysToDeadline === 1 ? '' : 's') + ' until your next instalment'
              : Math.abs(mine.daysToDeadline) + ' day' + (Math.abs(mine.daysToDeadline) === 1 ? '' : 's') + ' overdue'}
          </Notice>
        )}
      </Card>

      <RowGroup title="What protects this circle">
        {controls.map(([label, on, detail]) => (
          <Row key={label} chevron={false}
               icon={on ? <BadgeCheck /> : <LockKeyhole />}
               title={label} sub={detail}
               value={on ? 'On' : 'Off'} tone={on ? 'ok' : undefined} />
        ))}
      </RowGroup>

      <RowGroup title="Your cover">
        <Row chevron={false} title="Deposit held" value={money(mine?.heldDepositPaisa || 0)} />
        <Row chevron={false} title="Payout held back" value={money(mine?.heldPayoutPaisa || 0)} />
        {summary.forwardLiabilityGateEnabled && mine && (
          <>
            <Row chevron={false} title="Security your turn needs" value={money(mine.requiredSecurityPaisa || 0)} />
            <Row chevron={false} title="Security posted" value={money(mine.postedSecurityPaisa || 0)}
                 tone={mine.securitySatisfied ? 'ok' : 'warn'} />
          </>
        )}
        {mine?.commitment ? (
          <Row chevron={false} icon={<FileSignature />} title="Extra assurance"
               sub={(mine.commitment.guarantor ? mine.commitment.guarantor.fullName : 'No guarantor')
                 + ' · ' + (mine.commitment.verifiedByHostAt ? 'host verified' : 'awaiting the host')}
               value="Recorded" tone="ok" />
        ) : (
          <Row icon={<FileSignature />} title="Add extra assurance"
               sub="A guarantor, a promissory note or a mandate"
               onClick={() => setAssure(true)} />
        )}
      </RowGroup>

      <RowGroup title={summary.matrix.length + ' members'}>
        {summary.matrix.map(m => {
          const late = m.currentPayment && m.currentPayment.status !== 'PAID';
          return (
            <div key={m.membershipId}>
              <Row chevron={false}
                   icon={<span className="prot-initial">{m.user.fullName[0]}</span>}
                   title={m.user.fullName + (m.user.id === user.id ? ' · You' : '')}
                   sub={'Turn ' + m.turnPosition + ' · score ' + m.user.creditScore + (m.hasReceived ? ' · collected' : '')}
                   value={payWord(m.currentPayment?.status)}
                   tone={m.currentPayment?.status === 'PAID' ? 'ok' : late ? 'bad' : undefined} />
              {(m.user.id !== user.id && flag(summary.policy.peerNudges)) || (host && m.commitment && !m.commitment.verifiedByHostAt) || (host && m.currentPayment?.status === 'MISSED') ? (
                <div className="acct-acts">
                  {m.user.id !== user.id && flag(summary.policy.peerNudges) && (
                    <button disabled={busy === 'nudge-' + m.user.id}
                            onClick={() => act('nudge-' + m.user.id, () => api('/protection/committee/' + committeeId + '/peer-nudge/' + m.user.id, { method: 'POST' }))}>
                      <BellRing /> Remind
                    </button>
                  )}
                  {host && m.commitment && !m.commitment.verifiedByHostAt && (
                    <button disabled={busy === 'verify-' + m.membershipId}
                            onClick={() => act('verify-' + m.membershipId, () => api('/protection/committee/' + committeeId + '/commitment/' + m.membershipId + '/verify', { method: 'POST' }))}>
                      Verify
                    </button>
                  )}
                  {host && m.currentPayment?.status === 'MISSED' && (
                    <button className="danger" disabled={busy === 'cover-' + m.currentPayment.id}
                            onClick={() => act('cover-' + m.currentPayment!.id, () => api('/committees/' + committeeId + '/default-cover/' + m.currentPayment!.id, { method: 'POST' }))}>
                      Use the cover
                    </button>
                  )}
                </div>
              ) : null}
            </div>
          );
        })}
      </RowGroup>

      {SHOW_BANK_RAIL && summary.partnerGates.length > 0 && (
        <RowGroup title="External enforcement">
          {summary.partnerGates.map(g => (
            <Row key={g.key} chevron={false} icon={g.key === 'PAYROLL' ? <Landmark /> : <ShieldCheck />}
                 title={g.label} value={title(g.status)} />
          ))}
        </RowGroup>
      )}

      {error && <div className="w-inset"><Notice kind="bad" icon={<Info />}>{error}</Notice></div>}

      {assure && (
        <Sheet title="Extra assurance" onClose={() => setAssure(false)}>
          <Field label="Guarantor username" hint="A Halqa member scoring 700 or more">
            <input value={guarantorUsername} placeholder="Optional"
                   onChange={e => setGuarantorUsername(e.target.value)} />
          </Field>
          <Field label="Promissory note reference">
            <input value={promissoryRef} placeholder="Optional"
                   onChange={e => setPromissoryRef(e.target.value)} />
          </Field>
          <Field label="Auto-debit mandate reference">
            <input value={autoDebitRef} placeholder="Optional"
                   onChange={e => setAutoDebitRef(e.target.value)} />
          </Field>
          <BottomBar>
            <button className="primary full" disabled={busy === 'commit'}
                    onClick={() => { setAssure(false); void act('commit', () => api('/protection/committee/' + committeeId + '/commitment', {
                      method: 'PUT',
                      body: JSON.stringify({
                        guarantorUsername: guarantorUsername || undefined,
                        promissoryRef: promissoryRef || undefined,
                        autoDebitRef: autoDebitRef || undefined,
                        acceptedTerms: true,
                      }),
                    })) }}>
              Record it
            </button>
          </BottomBar>
        </Sheet>
      )}
    </>
  );
}
