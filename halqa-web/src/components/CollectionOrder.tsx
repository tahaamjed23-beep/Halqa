import { useEffect, useState } from 'react';
import { ArrowDown, ArrowUp, Banknote, Check, Wallet } from 'lucide-react';
import { api } from '../api';
import { CardMini } from './CardArt';

// Which account is tried first, and what happens if it does not clear.
//
// Every Pakistani wallet lets you set a default payment method. Halqa needs one
// step more, because collection is automatic and unattended: if the first rail
// fails at six in the morning there is nobody to pick another one. So the
// member sets an ORDER, and the platform walks it until something clears.
//
// One account is marked as the salary account. Collecting on payday from the
// account the salary actually lands in is the most certain collection there is,
// which is why it earns a disclosed discount on Halqa's charges.

type Method = {
  id: string; rail: string; label: string; accountNo?: string; last4?: string;
  brand?: string; preferred?: boolean; verified?: boolean;
};

const railIcon = (m: Method) =>
  m.rail === 'CARD' ? <CardMini brand={m.brand || m.label} />
  : <div className="row-ic">{m.rail === 'BANK' ? <Banknote size={17} /> : <Wallet size={17} />}</div>;

export function CollectionOrder() {
  const [methods, setMethods] = useState<Method[]>([]);
  const [salaryId, setSalaryId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api<{ methods: Method[] }>('/profile/payment-methods')
      .then(r => {
        const list = r.methods ?? [];
        setMethods(list);
        setSalaryId(list.find(m => m.preferred)?.id ?? null);
      })
      .catch(() => setError('Could not load your accounts'));
  }, []);

  async function persist(next: Method[], salary: string | null) {
    setMethods(next); setBusy(true); setError(''); setSaved(false);
    try {
      await api('/profile/payment-methods/order', {
        method: 'PATCH',
        body: JSON.stringify({ order: next.map(m => m.id), salaryMethodId: salary }),
      });
      setSaved(true); setTimeout(() => setSaved(false), 2000);
    } catch {
      setError('Could not save the order. It will still work in the current order.');
    } finally { setBusy(false); }
  }

  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= methods.length) return;
    const next = [...methods];
    [next[i], next[j]] = [next[j], next[i]];
    void persist(next, salaryId);
  };

  if (!methods.length) {
    return <section className="panel">
      <div className="panel-head"><div>
        <span className="eyebrow">Collection</span><h2>Which account pays first</h2>
        <p>Link an account and you can set the order Halqa tries them in.</p>
      </div></div>
    </section>;
  }

  return <section className="panel">
    <div className="panel-head"><div>
      <span className="eyebrow">Collection</span>
      <h2>Which account pays first</h2>
      <p>Halqa tries these in order on the morning your contribution is due and stops at the first one that clears. You know which account has money in it on which day; we don't.</p>
    </div></div>

    <div className="list">
      {methods.map((m, i) => <div className="row" key={m.id}>
        <span className="ord-badge">{i + 1}</span>
        {railIcon(m)}
        <div className="row-body">
          <strong>{m.label || m.rail}</strong>
          <span>
            {m.last4 ? `•••• ${m.last4}` : m.accountNo}
            {i === 0 ? ' · tried first' : ` · fallback ${i}`}
            {m.verified === false ? ' · pending verification' : ''}
          </span>
        </div>
        {salaryId === m.id && <span className="chip ok">Salary</span>}
        <div className="ord-moves">
          <button className="back" aria-label="Move up" disabled={i === 0 || busy}
            onClick={() => move(i, -1)}><ArrowUp size={15} /></button>
          <button className="back" aria-label="Move down" disabled={i === methods.length - 1 || busy}
            onClick={() => move(i, 1)}><ArrowDown size={15} /></button>
        </div>
      </div>)}
    </div>

    <label className="field-wrap" style={{ marginTop: 14 }}>
      <span>Which of these is your salary account?</span>
      <select className="field" value={salaryId ?? ''} onChange={e => void persist(methods, e.target.value || null)}>
        <option value="">Not set</option>
        {methods.map(m => <option key={m.id} value={m.id}>{m.label || m.rail}</option>)}
      </select>
      <small>
        Halqa collects on the morning your pay lands rather than on the due date, because that is when
        the balance is highest. Naming the salary account earns a disclosed reduction on Halqa's charges.
      </small>
    </label>

    {saved && <div className="commitment-ok"><Check /><div>
      <b>Order saved</b><small>Applies to every circle from your next contribution.</small>
    </div></div>}
    {error && <div className="error-box">{error}</div>}
  </section>;
}
