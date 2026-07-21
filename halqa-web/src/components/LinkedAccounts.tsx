import { useEffect, useState } from 'react';
import { api } from '../api';
import { Field } from './ui';

// Linked collection accounts, wallet-app style: every linked method renders as
// a bank-branded card (logo, holder name, masked number, verified/preferred
// badges) and adding one is a stepped flow — rail → bank → details — with a
// live preview card that fills in as you type. Pointers only, always: the
// server masks numbers on the way out; no balances, no card numbers.

export type LinkedMethod = { id: string; rail: string; accountNo: string; accountTitle?: string; bankName?: string; label: string; preferred: boolean; verified?: boolean };

type BrandMeta = { name: string; mono: string; color: string; dark: string };
export const RAIL_META: Record<string, BrandMeta> = {
  RAAST: { name: 'Raast', mono: 'RA', color: '#0e7d72', dark: '#07524a' },
  JAZZCASH: { name: 'JazzCash', mono: 'JC', color: '#c8102e', dark: '#7e0a1d' },
  EASYPAISA: { name: 'Easypaisa', mono: 'EP', color: '#3f9c35', dark: '#25631f' },
  BANK_TRANSFER: { name: 'Bank account', mono: 'BK', color: '#5b6472', dark: '#39404b' },
};

// Indicative brand palette for the demo bank directory — avatar colors, not
// official assets. "Other bank" keeps the neutral slate.
export const PK_BANKS: BrandMeta[] = [
  { name: 'HBL', mono: 'HBL', color: '#007a3d', dark: '#004d26' },
  { name: 'Meezan Bank', mono: 'MZ', color: '#5d2e8e', dark: '#3a1c59' },
  { name: 'UBL', mono: 'UBL', color: '#0057a8', dark: '#003668' },
  { name: 'MCB', mono: 'MCB', color: '#006341', dark: '#003d28' },
  { name: 'Allied Bank', mono: 'ABL', color: '#005baa', dark: '#003a6d' },
  { name: 'Bank Alfalah', mono: 'BAF', color: '#b3282d', dark: '#701a1d' },
  { name: 'Bank Al Habib', mono: 'BAH', color: '#00693e', dark: '#004127' },
  { name: 'Standard Chartered', mono: 'SC', color: '#0f7dc2', dark: '#0a4f7a' },
  { name: 'Faysal Bank', mono: 'FBL', color: '#00539f', dark: '#003464' },
  { name: 'Askari Bank', mono: 'AKB', color: '#00447c', dark: '#002a4e' },
  { name: 'JS Bank', mono: 'JS', color: '#003da5', dark: '#002668' },
  { name: 'Soneri Bank', mono: 'SNB', color: '#8a1538', dark: '#560d23' },
  { name: 'Bank of Punjab', mono: 'BOP', color: '#9a3b26', dark: '#5f2317' },
  { name: 'NBP', mono: 'NBP', color: '#00594c', dark: '#00352e' },
  { name: 'SadaPay', mono: 'SP', color: '#ff4f6e', dark: '#c22646' },
  { name: 'NayaPay', mono: 'NP', color: '#00b388', dark: '#007257' },
  { name: 'Other bank', mono: 'BK', color: '#5b6472', dark: '#39404b' },
];
export const bankMeta = (bankName?: string): BrandMeta | undefined => PK_BANKS.find(b => b.name === bankName);
export const cardMeta = (rail: string, bankName?: string): BrandMeta =>
  rail === 'BANK_TRANSFER' ? (bankMeta(bankName) ?? { ...RAIL_META.BANK_TRANSFER, name: bankName || 'Bank account' }) : (RAIL_META[rail] ?? RAIL_META.BANK_TRANSFER);

// Grouping + entry formatting. IBANs group in 4s (PK36 SONE 0000 …); wallets
// and Raast IDs read as 03XX XXXXXXX. Masked numbers from the server regroup
// the same way, so cards look right with dots too.
export const groupAccount = (value: string) => value.replace(/\s+/g, '').replace(/(.{4})/g, '$1 ').trim();
export const formatEntry = (rail: string, raw: string) => rail === 'BANK_TRANSFER'
  ? groupAccount(raw.toUpperCase().replace(/[^A-Z0-9•]/g, '').slice(0, 24))
  : raw.replace(/[^\d•]/g, '').slice(0, 11).replace(/^(.{4})(.+)$/, '$1 $2');

export function AccountCard({ rail, bankName, accountTitle, accountNo, label, verified, preferred, salary, draft, footer }:
  { rail: string; bankName?: string; accountTitle?: string; accountNo: string; label?: string; verified?: boolean; preferred?: boolean; salary?: boolean; draft?: boolean; footer?: React.ReactNode }) {
  const meta = cardMeta(rail, bankName);
  return <div className="acct-card" style={{ background: `linear-gradient(135deg, ${meta.color}, ${meta.dark})` }}>
    <div className="acct-card-top">
      <i className="acct-card-logo">{meta.mono}</i>
      <b>{rail === 'BANK_TRANSFER' ? (bankName || 'Bank account') : meta.name}</b>
      <span className="acct-badges">
        {draft ? <em className="acct-badge">Preview</em> : verified ? <em className="acct-badge ok">Verified ✓</em> : <em className="acct-badge warn">Unverified</em>}
        {preferred && <em className="acct-badge gold">Preferred</em>}
        {salary && <em className="acct-badge gold">💼 Salary · 20% off fees</em>}
      </span>
    </div>
    <div className="acct-card-no mono">{groupAccount(accountNo) || '•••• •••• ••••'}</div>
    <div className="acct-card-holder"><span>Account holder</span><b>{accountTitle || label || '—'}</b></div>
    {footer}
  </div>;
}

export function LinkedAccountsManager() {
  const [methods, setMethods] = useState<LinkedMethod[]>([]);
  const [salaryRef, setSalaryRef] = useState<string | null>(null);
  const [adding, setAdding] = useState(false); const [rail, setRail] = useState('RAAST'); const [bank, setBank] = useState('HBL');
  const [accountNo, setAccountNo] = useState(''); const [accountTitle, setAccountTitle] = useState('');
  const [busy, setBusy] = useState(false); const [error, setError] = useState('');
  const [otpFor, setOtpFor] = useState(''); const [otpCode, setOtpCode] = useState(''); const [otpError, setOtpError] = useState(''); const [devCode, setDevCode] = useState('');
  const load = () => Promise.all([
    api<{ methods: LinkedMethod[] }>('/profile/payment-methods').then(d => setMethods(d.methods)),
    api<{ salaryAccountLinked: boolean; salaryAccountRef: string | null }>('/auth/me').then(d => setSalaryRef(d.salaryAccountLinked ? d.salaryAccountRef : null)).catch(() => {}),
  ]).catch(() => {});
  useEffect(() => { void load(); }, []);
  const add = async () => { setBusy(true); setError(''); try {
    const d = await api<{ method: LinkedMethod; devCode?: string }>('/profile/payment-methods', { method: 'POST', body: JSON.stringify({ rail, accountNo: accountNo.replace(/\s+/g, ''), accountTitle: accountTitle.trim() || undefined, bankName: rail === 'BANK_TRANSFER' ? bank : undefined }) });
    setAdding(false); setAccountNo(''); setAccountTitle(''); await load();
    // Jump straight into verification for the fresh link; in sandbox the code
    // is surfaced inline so the demo flows end-to-end without a real gateway.
    setOtpFor(d.method.id); setOtpCode(''); setOtpError(''); setDevCode(d.devCode || '');
  } catch (reason) { setError((reason as Error).message); } finally { setBusy(false); } };
  const prefer = async (id: string) => { try { const d = await api<{ methods: LinkedMethod[] }>(`/profile/payment-methods/${id}/preferred`, { method: 'POST' }); setMethods(d.methods); } catch { /* refresh next open */ } };
  const remove = async (id: string) => { try { const d = await api<{ methods: LinkedMethod[] }>(`/profile/payment-methods/${id}`, { method: 'DELETE' }); setMethods(d.methods); if (id === salaryRef) setSalaryRef(null); } catch { /* refresh next open */ } };
  const markSalary = async (id: string, enabled: boolean) => { try { const d = await api<{ salaryAccountLinked: boolean; salaryAccountRef: string | null }>(`/profile/payment-methods/${id}/salary`, { method: 'POST', body: JSON.stringify({ enabled }) }); setSalaryRef(d.salaryAccountLinked ? d.salaryAccountRef : null); } catch { /* refresh next open */ } };
  const verify = async (id: string) => { setOtpError(''); try { const d = await api<{ methods: LinkedMethod[] }>(`/profile/payment-methods/${id}/verify`, { method: 'POST', body: JSON.stringify({ code: otpCode.trim() }) }); setMethods(d.methods); setOtpFor(''); setOtpCode(''); setDevCode(''); } catch (reason) { setOtpError((reason as Error).message); } };
  const numberLabel = rail === 'BANK_TRANSFER' ? 'IBAN' : rail === 'RAAST' ? 'Raast ID (your mobile number)' : `${RAIL_META[rail].name} wallet number`;
  return <div className="settings-block">
    <span className="eyebrow" style={{ display: 'block', marginBottom: 8 }}>Linked collection accounts</span>
    <div className="acct-list">
      {methods.map(m => <AccountCard key={m.id} rail={m.rail} bankName={m.bankName} accountTitle={m.accountTitle} accountNo={m.accountNo} label={m.label} verified={m.verified} preferred={m.preferred} salary={m.id === salaryRef}
        footer={<div className="acct-card-actions">
          {!m.verified && (otpFor === m.id
            ? <span className="otp-strip"><input className="otp-in mono" inputMode="numeric" maxLength={6} placeholder="6-digit code" value={otpCode} onChange={e => setOtpCode(e.target.value.replace(/\D/g, ''))} /><button className="card-action" disabled={otpCode.length !== 6} onClick={() => void verify(m.id)}>Confirm</button>{devCode && <small className="otp-dev">Sandbox code: <b className="mono">{devCode}</b></small>}</span>
            : <button className="card-action" onClick={() => { setOtpFor(m.id); setOtpCode(''); setOtpError(''); setDevCode(''); }}>Enter WhatsApp code</button>)}
          {!m.preferred && <button className="card-action" onClick={() => void prefer(m.id)}>Make preferred</button>}
          {m.id === salaryRef ? <button className="card-action" onClick={() => void markSalary(m.id, false)}>Unset salary</button> : <button className="card-action" onClick={() => void markSalary(m.id, true)}>Mark as salary account</button>}
          <button className="card-action danger" onClick={() => void remove(m.id)}>Remove</button>
        </div>} />)}
      {otpError && <div className="error-box">{otpError}</div>}
      {!methods.length && !adding && <p className="muted" style={{ fontSize: 12.5 }}>Nothing linked yet. Link your wallet, Raast ID or bank account once — auto-collection pulls from it and checkout pre-fills it.</p>}
    </div>
    {adding ? <div className="add-method">
      <span className="eyebrow">Step 1 · Where should collections pull from?</span>
      <div className="rail-grid" style={{ margin: '8px 0 14px' }}>{Object.keys(RAIL_META).map(r => <button key={r} type="button" className={`rail-chip ${rail === r ? 'on' : ''}`} onClick={() => setRail(r)}><i className="chip-logo" style={{ background: RAIL_META[r].color }}>{RAIL_META[r].mono}</i>{RAIL_META[r].name}</button>)}</div>
      {rail === 'BANK_TRANSFER' && <>
        <span className="eyebrow">Step 2 · Pick your bank</span>
        <div className="bank-grid" style={{ margin: '8px 0 14px' }}>{PK_BANKS.map(b => <button key={b.name} type="button" className={`bank-tile ${bank === b.name ? 'on' : ''}`} onClick={() => setBank(b.name)}><i style={{ background: `linear-gradient(135deg, ${b.color}, ${b.dark})` }}>{b.mono}</i><span>{b.name}</span></button>)}</div>
      </>}
      <span className="eyebrow">{rail === 'BANK_TRANSFER' ? 'Step 3' : 'Step 2'} · Account details</span>
      <div style={{ marginTop: 8 }}>
        <Field label="Account holder name"><input className="field" value={accountTitle} onChange={e => setAccountTitle(e.target.value)} placeholder="Exactly as printed on the account" autoComplete="name" /></Field>
        <Field label={numberLabel}><input className="field mono" inputMode={rail === 'BANK_TRANSFER' ? 'text' : 'numeric'} value={accountNo} onChange={e => setAccountNo(formatEntry(rail, e.target.value))} placeholder={rail === 'BANK_TRANSFER' ? 'PK36 SONE 0000 1234 5678 9012' : '03XX XXXXXXX'} /></Field>
      </div>
      <div style={{ margin: '10px 0' }}><AccountCard draft rail={rail} bankName={rail === 'BANK_TRANSFER' ? bank : undefined} accountTitle={accountTitle} accountNo={accountNo} /></div>
      {error && <div className="error-box">{error}</div>}
      <div className="form-actions"><button className="secondary" onClick={() => { setAdding(false); setError(''); }}>Cancel</button><button className="primary" disabled={busy || accountNo.replace(/[\s•]+/g, '').length < 10 || accountTitle.trim().length < 3} onClick={add}>{busy ? 'Linking…' : 'Link account'}</button></div>
      <p className="muted" style={{ fontSize: 11.5 }}>A one-time WhatsApp code confirms the mandate. Halqa stores the identifier only — never balances, never cards. Cards will be entered on the licensed payment partner's own secure page when live rails switch on.</p>
    </div> : methods.length < 5 && <button className="secondary" style={{ marginTop: 10, padding: '9px 14px', borderRadius: 12, fontSize: 12.5, fontWeight: 700 }} onClick={() => setAdding(true)}>+ Link an account</button>}
  </div>;
}
