import { useCallback, useEffect, useState } from 'react';
import {
  CreditCard, Info, Landmark, Lock, PiggyBank, RotateCcw, ShieldCheck,
} from 'lucide-react';
import { api, key } from '../api';
import { money } from '../lib/format';
import type { Page, Partner, User } from '../types';
import AccountMenu from '../components/AccountMenu';
import { ScoreRing } from '../components/ui';
import { Pfp } from '../components/Appearance';
import { SHOW_BANK_RAIL, SIMPLE_MODE } from '../config';
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
      <Field label="IBAN" hint="Your own PK account">
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
           sub={vault.enabled ? 'Parking payouts' : 'Parking off'}
           value={money(vault.balancePaisa)}
           valueSub={money(vault.accruedProfitPaisa) + ' earned'}
           onClick={go ? () => go('vault') : undefined} />
      <Row chevron={false} icon={<ShieldCheck />} title="Covers a missed instalment"
           sub="Before it becomes a default"
           value={vault.autoCover ? 'On' : 'Off'} tone={vault.autoCover ? 'ok' : undefined} />
    </RowGroup>
  );
}

// Auto-collection, as one line rather than one row per circle. A member with
// ten committees was getting ten identical rows saying the same sentence, which
// pushed everything below them off the screen. If they all pull the same way,
// that is one fact, not ten.
type AutoCircle = { id: string; name: string; status: string; members?: { userId: string; autoDebitEnabled?: boolean; autoDebitRail?: string | null }[] };

function AutoCollection({ user, go }: { user: User; go?: (page: Page) => void }) {
  const [circles, setCircles] = useState<AutoCircle[]>([]);
  const load = useCallback(() => api<AutoCircle[]>('/committees')
    .then(rows => setCircles(rows.filter(r => r.status === 'ACTIVE' || r.status === 'FORMING')))
    .catch(() => {}), []);
  useEffect(() => { void load() }, [load]);

  const mine = (c: AutoCircle) => c.members?.find(m => m.userId === user.id);
  const joined = circles.filter(mine);
  const rails = Array.from(new Set(joined.map(c => mine(c)?.autoDebitRail || 'Raast')));

  return (
    <RowGroup title="Collection">
      <Row chevron={false} icon={<Lock />} title="Auto collection"
           sub={joined.length
             ? joined.length + ' committee' + (joined.length === 1 ? '' : 's') + ', collected over '
               + rails.join(' and ') + ' on each due date'
             : 'On from your first committee'}
           value={joined.length ? 'On' : 'Ready'} tone={joined.length ? 'ok' : undefined} />
      <Row icon={<CreditCard />} title="Where it pulls from"
           sub="Accounts, payday, order"
           onClick={go ? () => go('cards') : undefined} />
    </RowGroup>
  );
}

type PaymentRow = { id: string; amountPaisa: string; status: string; round: { roundNumber: number; committee: { name: string } } };
type Recovery = { id: string; outstandingPaisa: string; penaltyPaisa: string; status: string; openedAt: string; committee: { id: string; name: string }; round: { roundNumber: number } };

export default function ProfilePage({ user, openCredit, go }:
  { user: User; openCredit?: () => void; go?: (page: Page) => void }) {
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [photo, setPhoto] = useState<string | null>(null);
  const [recoveries, setRecoveries] = useState<Recovery[]>([]);
  const [refs, setRefs] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const [busy, setBusy] = useState('');

  const load = useCallback(() => Promise.all([
    api<PaymentRow[]>('/payments/mine'),
    api<Recovery[]>('/protection/recovery/mine'),
  ]).then(([rows, cases]) => { setPayments(rows); setRecoveries(cases) }), []);
  useEffect(() => { void load() }, [load]);
  useEffect(() => {
    void api<{ avatarUrl: string | null }>('/profile/appearance')
      .then(a => setPhoto(a.avatarUrl)).catch(() => {});
  }, []);

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
        <div className="prof-avatar"><Pfp url={photo} name={user.fullName} size={56} /></div>
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
        <AutoCollection user={user} go={go} />

        {payments.length > 0 && (
          <RowGroup title="Recorded instalments">
            {payments.slice(0, 5).map(p => (
              <Row key={p.id} chevron={false} icon={<CreditCard />}
                   title={p.round.committee.name}
                   sub={'Turn ' + p.round.roundNumber}
                   value={money(p.amountPaisa)}
                   valueSub={p.status === 'PAID' ? 'Paid' : p.status === 'LATE' ? 'Late' : 'Due'}
                   tone={p.status === 'PAID' ? 'ok' : p.status === 'LATE' ? 'bad' : 'warn'} />
            ))}
          </RowGroup>
        )}
        {payments.length > 5 && (
          <div className="w-inset">
            <button className="secondary" onClick={() => go?.('activity')}>
              See all {payments.length}, each with its receipt
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
