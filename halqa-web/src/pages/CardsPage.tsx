import { useEffect, useState } from 'react';
import { CalendarClock, Info, Plus, ShieldCheck, Star, Trash2, Zap } from 'lucide-react';
import { api } from '../api';
import type { User } from '../types';
import { RailLogo, RAIL_BRAND, SchemeMark } from '../components/RailLogo';
import { maskAccount } from '../lib/format';
import AddSource from '../components/AddSource';
import { Blank, BottomBar, FlowHeader, Notice, Row, RowGroup, Sheet } from '../components/wallet';

// ---------------------------------------------------------------------------
// PAYMENT METHODS
//
// The card face used to read `primary.masked` and `primary.kind`. Neither field
// exists: the API returns `accountNo`, already masked, and `rail`. So the card
// rendered as a green rectangle with a name on it and the bare word "Rail",
// which is exactly what a member saw.
//
// The "Add an account" button had no handler either, so the one thing this
// screen exists for could not be done from it. It opens the linking flow now.
//
// Laid out the way a wallet lays it out: one card that looks like a card and
// carries the mark of the wallet it belongs to, then the accounts beneath it as
// rows, so a member recognises their own account before reading a digit.
// ---------------------------------------------------------------------------

type Method = {
  id: string; rail: string; accountNo?: string; accountTitle?: string; label?: string;
  brand?: string | null; last4?: string | null; expiry?: string | null;
  preferred?: boolean; verified?: boolean; salary?: boolean;
};
type SalaryStatus = { salaryDay: number | null; salaryDayLearned: number | null; salaryVerifiedAt: string | null };

const railName = (rail: string) => RAIL_BRAND[rail as keyof typeof RAIL_BRAND]?.name || 'Bank';
const ordinal = (d: number) =>
  d === 1 || d === 21 || d === 31 ? 'st' : d === 2 || d === 22 ? 'nd' : d === 3 || d === 23 ? 'rd' : 'th';

export default function CardsPage({ user, back }: { user: User; back: () => void }) {
  const [methods, setMethods] = useState<Method[]>([]);
  const [salary, setSalary] = useState<SalaryStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  const load = () => Promise.all([
    api<Method[] | { methods: Method[] }>('/profile/payment-methods')
      .then(r => setMethods(Array.isArray(r) ? r : (r?.methods ?? [])))
      .catch(() => setMethods([])),
    api<SalaryStatus>('/profile/salary-status').then(setSalary).catch(() => setSalary(null)),
  ]).finally(() => setLoading(false));

  useEffect(() => { void load() }, []);

  const primary = methods.find(m => m.preferred) || methods[0];
  const isCard = primary?.rail === 'CARD';
  const number = isCard
    ? '•••• •••• •••• ' + ((primary?.last4 || primary?.accountNo || '').replace(/\D/g, '').slice(-4) || '••••')
    : primary ? maskAccount(primary.accountNo || '') : '•••• •••• ••••';

  const remove = async (id: string) => {
    setConfirmId(null);
    try { await api('/profile/payment-methods/' + id, { method: 'DELETE' }); await load() }
    catch { /* leave it in place */ }
  };
  const prefer = async (id: string) => {
    try { await api('/profile/payment-methods/' + id + '/preferred', { method: 'POST' }); await load() }
    catch { /* refresh next open */ }
  };

  const payday = salary?.salaryDay ?? salary?.salaryDayLearned ?? null;

  return (
    <div className="w-screen">
      <FlowHeader title="Payment methods" onBack={back} />

      <div className={'paycard rail-' + (primary?.rail || 'NONE')}>
        <div className="paycard-top">
          <span className="paycard-mark">
            {isCard ? <SchemeMark brand={primary?.brand} size={42} />
                    : <RailLogo rail={primary?.rail || 'BANK_TRANSFER'} size={36} plain />}
          </span>
          <span className="paycard-rail">{primary ? railName(primary.rail) : 'No account yet'}</span>
        </div>
        <div className="paycard-no">{number}</div>
        <div className="paycard-bot">
          <div>
            <span>{isCard ? 'Cardholder' : 'Account holder'}</span>
            <b>{primary?.accountTitle || user.fullName}</b>
          </div>
          {isCard && primary?.expiry
            ? <div className="right"><span>Expires</span><b>{primary.expiry}</b></div>
            : primary && <div className="right"><span>Status</span><b>{primary.verified ? 'Verified' : 'Not verified'}</b></div>}
        </div>
      </div>

      <div className="w-screen-body">
        {loading && <div className="chart-skeleton" />}

        {!loading && !methods.length && (
          <Blank icon={<ShieldCheck />} title="Nothing linked yet"
                 sub="Add the account Halqa collects from." />
        )}

        {methods.length > 0 && (
          <RowGroup title={methods.length + ' of 5 linked'}>
            {methods.map(m => (
              <div key={m.id}>
                <Row chevron={false}
                     icon={m.rail === 'CARD' ? <SchemeMark brand={m.brand} size={22} /> : <RailLogo rail={m.rail} size={22} />}
                     title={m.label || railName(m.rail)}
                     sub={maskAccount(m.accountNo || '') + (m.verified ? '' : ' · not verified yet')}
                     value={m.preferred ? 'Default' : undefined}
                     tone={m.preferred ? 'ok' : undefined} />
                <div className="acct-acts">
                  {!m.preferred && (
                    <button onClick={() => void prefer(m.id)}><Star /> Make it the default</button>
                  )}
                  <button className="danger" onClick={() => setConfirmId(m.id)}><Trash2 /> Remove</button>
                </div>
              </div>
            ))}
          </RowGroup>
        )}

        <RowGroup title="Auto collection">
          <Row chevron={false} icon={<Zap />} title="Collected on your payday"
               sub="The morning your pay arrives"
               value="On" tone="ok" />
          <Row chevron={false} icon={<CalendarClock />} title="Your payday"
               sub={payday
                 ? 'The ' + payday + ordinal(payday) + (salary?.salaryVerifiedAt ? ', verified' : ', as you told us')
                 : 'Not set'}
               value={payday ? String(payday) + ordinal(payday) : 'Not set'}
               tone={payday ? 'ok' : 'warn'} />
        </RowGroup>

        <div className="w-inset">
          <Notice kind="info" icon={<Info />}>
            The identifier only. No balances, no card numbers.
          </Notice>
          <div className="rail-supported">
            <span>Works with</span>
            {(['RAAST', 'JAZZCASH', 'EASYPAISA', 'BANK_TRANSFER'] as const).map(r => (
              <RailLogo key={r} rail={r} size={28} />
            ))}
          </div>
        </div>
      </div>

      {methods.length < 5 && (
        <BottomBar>
          <button className="primary full" onClick={() => setAdding(true)}><Plus /> Add an account</button>
        </BottomBar>
      )}

      {adding && (
        <AddSource onClose={() => setAdding(false)}
                   onDone={() => { setAdding(false); void load() }} />
      )}

      {confirmId && (
        <Sheet title="Remove this account" onClose={() => setConfirmId(null)}>
          <div className="w-inset" style={{ paddingTop: 12 }}>
            <Notice kind="warn" icon={<Info />}>
              Collection moves to your next account.
            </Notice>
          </div>
          <BottomBar>
            <button className="secondary" onClick={() => setConfirmId(null)}>Keep it</button>
            <button className="danger-button" onClick={() => void remove(confirmId)}>Remove</button>
          </BottomBar>
        </Sheet>
      )}
    </div>
  );
}
