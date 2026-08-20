import { useEffect, useState } from 'react';
import { CalendarClock, ChevronLeft, Plus, ShieldCheck, Trash2, Zap } from 'lucide-react';
import { api } from '../api';
import type { User } from '../types';
import { RailLogo, RAIL_BRAND, SchemeMark } from '../components/RailLogo';
import { maskAccount } from '../lib/format';

// ---------------------------------------------------------------------------
// Payment methods.
//
// The card face used to read `primary.masked` and `primary.kind`. Neither field
// exists: the API returns `accountNo`, already masked, and `rail`. So the card
// rendered as a green rectangle with a name on it and the bare word "Rail",
// which is exactly what a member saw.
//
// Laid out the way a wallet lays it out: one card that looks like a card and
// carries the mark of the wallet it belongs to, then the accounts beneath it as
// rows, so a member recognises their own account before reading a digit.
// ---------------------------------------------------------------------------

type Method = {
  id: string;
  rail: string;
  accountNo?: string;
  accountTitle?: string;
  label?: string;
  brand?: string | null;
  last4?: string | null;
  expiry?: string | null;
  preferred?: boolean;
  verified?: boolean;
  salary?: boolean;
};

const railName = (rail: string) => RAIL_BRAND[rail as keyof typeof RAIL_BRAND]?.name || 'Bank';

export default function CardsPage({ user, back }: { user: User; back: () => void }) {
  const [methods, setMethods] = useState<Method[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const load = () => api<Method[] | { methods: Method[] }>('/profile/payment-methods')
    .then(r => setMethods(Array.isArray(r) ? r : (r?.methods ?? [])))
    .catch(() => setMethods([]))
    .finally(() => setLoading(false));

  useEffect(() => { void load(); }, []);

  const primary = methods.find(m => m.preferred) || methods[0];
  const isCard = primary?.rail === 'CARD';
  const number = isCard
    ? `•••• •••• •••• ${(primary?.last4 || primary?.accountNo || '').replace(/\D/g, '').slice(-4) || '••••'}`
    : primary ? maskAccount(primary.accountNo || '') : '•••• •••• ••••';

  const remove = async (id: string) => {
    setConfirmId(null);
    try { await api(`/profile/payment-methods/${id}`, { method: 'DELETE' }); await load(); }
    catch { /* leave it in place */ }
  };

  return (
    <div className="page narrow enter">
      <button className="back-link" onClick={back}><ChevronLeft />Back</button>
      <div className="page-head"><div><h1>Payment methods</h1></div></div>

      <div className={`paycard rail-${primary?.rail || 'NONE'}`}>
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

      <section className="panel">
        <div className="panel-head"><div><h2>Your accounts</h2></div><span className="muted">{methods.length} of 5</span></div>

        {loading && <div className="chart-skeleton" style={{ height: 64 }} />}

        {!loading && !methods.length && (
          <div className="empty-state">
            <ShieldCheck />
            <p>Add the account Halqa should collect from.</p>
          </div>
        )}

        <div className="acct-rows">
          {methods.map(m => (
            <div key={m.id} className="acct-row">
              <div className="acct-row-main">
                {m.rail === 'CARD' ? <SchemeMark brand={m.brand} size={34} /> : <RailLogo rail={m.rail} size={38} />}
                <div className="acct-row-text">
                  <b>{m.label || railName(m.rail)}</b>
                  <span>{maskAccount(m.accountNo || '')}{m.verified ? '' : ' · not verified yet'}</span>
                </div>
                {m.preferred && <span className="pref-chip">Primary</span>}
                <button className="acct-row-del" aria-label="Remove account" onClick={() => setConfirmId(m.id)}><Trash2 /></button>
              </div>

              {confirmId === m.id && (
                <div className="acct-row-confirm">
                  <p>Remove this account? Collection moves to your next one.</p>
                  <div className="form-actions">
                    <button className="secondary" onClick={() => setConfirmId(null)}>Keep it</button>
                    <button className="danger-button" onClick={() => void remove(m.id)}>Remove</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {methods.length < 5 && <button className="primary full add-method-btn"><Plus />Add an account</button>}

        <div className="rail-supported">
          <span>Works with</span>
          {(['RAAST', 'JAZZCASH', 'EASYPAISA', 'BANK_TRANSFER'] as const).map(r => (
            <RailLogo key={r} rail={r} size={28} />
          ))}
        </div>
      </section>

      <section className="panel">
        <div className="panel-head"><div><h2>Auto debit</h2></div></div>
        <div className="settings-body">
          <div className="settings-row">
            <Zap />
            <span className="settings-row-text">
              <b>Collect on payday</b>
              <small>Taken the morning your pay arrives, before the due date.</small>
            </span>
            <span className="pref-chip">On</span>
          </div>
          <div className="settings-row">
            <CalendarClock />
            <span className="settings-row-text">
              <b>Your payday</b>
              <small>Not set yet. Add one payslip and Halqa works it out.</small>
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
