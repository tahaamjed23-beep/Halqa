import { useCallback, useEffect, useState } from 'react';
import {
  CreditCard, Info, Landmark, Lock, PiggyBank, RotateCcw, ShieldCheck,
} from 'lucide-react';
import { api, key } from '../api';
import { money } from '../lib/format';
import type { Page, Partner, User } from '../types';
import AccountMenu from '../components/AccountMenu';
import { ScoreRing } from '../components/ui';
import { SHOW_BANK_RAIL, SIMPLE_MODE } from '../config';
import { LinkedAccountsManager } from '../components/LinkedAccounts';
import MemberStatus from '../components/MemberStatus';
import { Card, Field, Notice, Row, RowGroup } from '../components/wallet';

// ---------------------------------------------------------------------------
// THE PROFILE
//
// Who you are, what you are worth to a circle, and the machinery that collects
// from you. It used to carry a second, smaller copy of the whole vault: tier
// buttons, a top-up field, a withdraw button, all duplicating the vault screen
// and drifting out of step with it. There is one vault now, and this shows its
// balance and opens it.
// ---------------------------------------------------------------------------

type BankKycResult = { kycLevel: number; kycStatus: string; bankVerifiedAt: string; bankVerifyRef: string; partner: string; sandbox?: boolean };

function BankKycPanel({ user }: { user: User }) {
  const [partner, setPartner] = useState<Partner | null>(null);
  const [cnic, setCnic] = useState('');
  const [iban, setIban] = useState('');
  const [result, setResult] = useState<BankKycResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => { void api<{ partner: Partner | null }>('/partner').then(d => setPartner(d.partner)).catch(() => setPartner(null)) }, []);
  const verified = result || (user.kycLevel >= 2
    ? { kycLevel: user.kycLevel, kycStatus: user.kycStatus, bankVerifiedAt: user.bankVerifiedAt || '', bankVerifyRef: user.bankVerifyRef || '', partner: partner?.name || 'Partner bank' }
    : null);
  const submit = async () => {
    setBusy(true); setError('');
    try { setResult(await api<BankKycResult>('/partner/kyc', { method: 'POST', body: JSON.stringify({ cnic: cnic.replace(/\D/g, ''), iban: iban.replace(/\s+/g, '') }) })) }
    catch (reason) { setError((reason as Error).message) } finally { setBusy(false) }
  };
  if (!partner) return null;
  if (verified) {
    return (
      <RowGroup title="Bank verification">
        <Row chevron={false} icon={<Landmark />} title={'Level ' + verified.kycLevel}
             sub={'Verified by ' + verified.partner + (partner.sandbox ? ', sandbox' : '')}
             value={verified.kycStatus} tone="ok" />
      </RowGroup>
    );
  }
  return (
    <Card title="Bank verification">
      <p className="w-body">
        {partner.name} confirms your CNIC and that the account is yours. Level 2 unlocks hosting
        and bank-custody circles.
      </p>
      <Field label="CNIC">
        <input className="mono" inputMode="numeric" maxLength={13} value={cnic}
               onChange={e => setCnic(e.target.value.replace(/\D/g, ''))} placeholder="3520212345671" />
      </Field>
      <Field label="IBAN" hint="Your own PK account, checked with the standard checksum.">
        <input className="mono" value={iban} onChange={e => setIban(e.target.value.toUpperCase())}
               placeholder="PK36SONE0000123456789012" />
      </Field>
      {error && <Notice kind="bad" icon={<Info />}>{error}</Notice>}
      <button className="primary full" disabled={busy || cnic.length !== 13 || iban.replace(/\s+/g, '').length < 24} onClick={submit}>
        {busy ? 'Verifying' : 'Verify with ' + partner.name}
      </button>
    </Card>
  );
}

type VaultInfo = { enabled: boolean; tier: string; autoCover: boolean; balancePaisa: string; accruedProfitPaisa: string; ratePct: number };

/** The vault, in one row. The whole thing lives on its own screen. */
function VaultRow({ go }: { go?: (page: Page) => void }) {
  const [vault, setVault] = useState<VaultInfo | null>(null);
  useEffect(() => { void api<VaultInfo>('/vault').then(setVault).catch(() => setVault(null)) }, []);
  if (!vault) return null;
  return (
    <RowGroup title="Savings">
      <Row icon={<PiggyBank />} title="Your vault"
           sub={vault.enabled ? 'Payouts park here and earn' : 'Payouts release straight out'}
           value={money(vault.balancePaisa)}
           valueSub={money(vault.accruedProfitPaisa) + ' earned'}
           onClick={go ? () => go('vault') : undefined} />
      <Row chevron={false} icon={<ShieldCheck />} title="Covers a missed instalment"
           sub="Paid from the vault before it becomes a default"
           value={vault.autoCover ? 'On' : 'Off'} tone={vault.autoCover ? 'ok' : undefined} />
    </RowGroup>
  );
}

// Auto-collection lives here, not buried inside each committee: one list, every
// active circle, the rail each one pulls over.
type AutoCircle = { id: string; name: string; status: string; members?: { userId: string; autoDebitEnabled?: boolean; autoDebitRail?: string | null }[] };

function AutoPayPanel({ user }: { user: User }) {
  const [circles, setCircles] = useState<AutoCircle[]>([]);
  const load = useCallback(() => api<AutoCircle[]>('/committees')
    .then(rows => setCircles(rows.filter(r => r.status === 'ACTIVE' || r.status === 'FORMING'))), []);
  useEffect(() => { void load() }, [load]);
  const mine = (c: AutoCircle) => c.members?.find(m => m.userId === user.id);
  const joined = circles.filter(mine);

  return (
    <>
      {joined.length > 0 && (
        <RowGroup title="Auto collection">
          {joined.map(c => {
            const m = mine(c)!;
            return <Row key={c.id} chevron={false} icon={<Lock />} title={c.name}
                        sub={'Collects over ' + (m.autoDebitRail || 'Raast') + ' on the due date'}
                        value="On" tone="ok" />;
          })}
        </RowGroup>
      )}
      <div className="w-inset">
        <Notice kind="info" icon={<Info />}>
          Every committee collects automatically. Pay early yourself and there is nothing left to
          take. Halqa schedules the collection and never holds the money.
        </Notice>
      </div>
      <LinkedAccountsManager />
    </>
  );
}

type PaymentRow = { id: string; amountPaisa: string; status: string; round: { roundNumber: number; committee: { name: string } } };
type Recovery = { id: string; outstandingPaisa: string; penaltyPaisa: string; status: string; openedAt: string; committee: { id: string; name: string }; round: { roundNumber: number } };

export default function ProfilePage({ user, openCredit, go }:
  { user: User; openCredit?: () => void; go?: (page: Page) => void }) {
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [recoveries, setRecoveries] = useState<Recovery[]>([]);
  const [refs, setRefs] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const [busy, setBusy] = useState('');

  const load = useCallback(() => Promise.all([
    api<PaymentRow[]>('/payments/mine'),
    api<Recovery[]>('/protection/recovery/mine'),
  ]).then(([rows, cases]) => { setPayments(rows); setRecoveries(cases) }), []);
  useEffect(() => { void load() }, [load]);

  const resolve = async (id: string) => {
    setBusy(id); setError('');
    try {
      await api('/protection/recovery/' + id + '/resolve', { method: 'POST', body: JSON.stringify({ txnRef: refs[id], idempotencyKey: key() }) });
      await load();
    } catch (reason) { setError((reason as Error).message) } finally { setBusy('') }
  };

  const open = recoveries.filter(r => r.status === 'OPEN');

  return (
    <div className="w-screen">
      {/* Who you are, and what a circle sees. */}
      <section className="prof-band">
        <div className="prof-avatar">{user.fullName[0]}</div>
        <div className="prof-id">
          <b>{user.fullName}</b>
          <span>@{user.username} · {user.phone}</span>
          {openCredit && <button className="prof-link" onClick={openCredit}>See your full credit report</button>}
        </div>
        <ScoreRing score={user.creditScore} />
      </section>

      <div className="w-screen-body">
        {go && <AccountMenu go={go} />}

        {open.length > 0 && (
          <Card title={open.length + ' unresolved default case' + (open.length > 1 ? 's' : '')}>
            <p className="w-body">
              Record the outstanding amount, the fixed penalties and the 10 per cent
              rehabilitation fee. Once every case clears, access returns with a six month
              low-risk cooldown.
            </p>
            {open.map(item => (
              <div key={item.id} className="prof-recovery">
                <div>
                  <b>{item.committee.name}, turn {item.round.roundNumber}</b>
                  <small>Outstanding {money(item.outstandingPaisa)} · penalties {money(item.penaltyPaisa)}</small>
                </div>
                <input value={refs[item.id] || ''} placeholder="Transfer reference"
                       onChange={e => setRefs({ ...refs, [item.id]: e.target.value })} />
                <button className="secondary" disabled={busy === item.id || (refs[item.id]?.trim().length || 0) < 4}
                        onClick={() => resolve(item.id)}>
                  <RotateCcw /> Record it
                </button>
              </div>
            ))}
            {error && <Notice kind="bad" icon={<Info />}>{error}</Notice>}
          </Card>
        )}

        {!SIMPLE_MODE && <VaultRow go={go} />}
        <MemberStatus user={user} />
        {SHOW_BANK_RAIL && <BankKycPanel user={user} />}
        <AutoPayPanel user={user} />

        {payments.length > 0 && (
          <RowGroup title="Recorded instalments">
            {payments.slice(0, 12).map(p => (
              <Row key={p.id} chevron={false} icon={<CreditCard />}
                   title={p.round.committee.name}
                   sub={'Turn ' + p.round.roundNumber}
                   value={money(p.amountPaisa)}
                   valueSub={p.status === 'PAID' ? 'Paid' : p.status === 'LATE' ? 'Late' : 'Due'}
                   tone={p.status === 'PAID' ? 'ok' : p.status === 'LATE' ? 'bad' : 'warn'} />
            ))}
          </RowGroup>
        )}
        {payments.length > 12 && (
          <p className="w-foot">
            The other {payments.length - 12} are on the Activity screen, each with its receipt.
          </p>
        )}
      </div>
    </div>
  );
}
