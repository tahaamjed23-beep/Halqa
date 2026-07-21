import { useEffect, useState } from 'react';
import { Bell, ChevronRight, CreditCard, Fingerprint, Globe, HelpCircle, Megaphone, Scale, ShieldCheck, UserCog } from 'lucide-react';
import { api } from '../api';
import type { User } from '../types';
import { Field } from '../components/ui';
import LegalFooter, { LegalDocModal } from '../components/LegalFooter';
import { LEGAL_DOCS, TERMS_VERSION, type DocId } from '../legal/content';
import { useLang } from '../lib/i18n';

// The Settings hub — the sectioned "gear" screen every payment app has.
// Sections: Sign in & security · Account preferences · Data privacy ·
// Advertising data · Notifications · Payments · Legal & policies · Help.

type SectionId = 'security' | 'account' | 'privacy' | 'ads' | 'notifications' | 'payments' | 'legal' | 'help';

const pref = {
  get: (k: string, fallback: string) => localStorage.getItem(`halqa.pref.${k}`) ?? fallback,
  set: (k: string, v: string) => localStorage.setItem(`halqa.pref.${k}`, v),
};

function ChangePassword() {
  const [current, setCurrent] = useState(''); const [next, setNext] = useState(''); const [busy, setBusy] = useState(false); const [done, setDone] = useState(false); const [error, setError] = useState('');
  const submit = async () => { setBusy(true); setError(''); setDone(false); try { await api('/auth/change-password', { method: 'POST', body: JSON.stringify({ currentPassword: current, newPassword: next }) }); setDone(true); setCurrent(''); setNext(''); } catch (reason) { setError((reason as Error).message); } finally { setBusy(false); } };
  return <div className="settings-block">
    <div className="form-grid"><Field label="Current password"><input className="field" type="password" autoComplete="current-password" value={current} onChange={e => setCurrent(e.target.value)} /></Field><Field label="New password (min 8, letters + numbers)"><input className="field" type="password" autoComplete="new-password" value={next} onChange={e => setNext(e.target.value)} /></Field></div>
    {done && <div className="commitment-ok" style={{ marginTop: 10 }}><ShieldCheck /><div><b>Password updated</b><p>Every other session was signed out.</p></div></div>}
    {error && <div className="error-box">{error}</div>}
    <div className="form-actions"><button className="primary" disabled={busy || !current || next.length < 8} onClick={submit}>{busy ? 'Updating…' : 'Update password'}</button></div>
  </div>;
}

function Toggle({ label, hint, checked, onChange, disabled }: { label: string; hint: string; checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return <label className="settings-toggle"><input type="checkbox" checked={checked} disabled={disabled} onChange={e => onChange(e.target.checked)} /><span><b>{label}</b><small>{hint}</small></span></label>;
}

// Linked payment methods — wallet / Raast / bank identifiers the member saves
// once and reuses at checkout and for auto-pay. Pointers only; never balances,
// never card numbers.
type LinkedMethod = { id: string; rail: string; accountNo: string; label: string; preferred: boolean };
const RAIL_META: Record<string, { name: string; mono: string; color: string }> = {
  RAAST: { name: 'Raast', mono: 'RA', color: '#0e7d72' }, JAZZCASH: { name: 'JazzCash', mono: 'JC', color: '#c8102e' },
  EASYPAISA: { name: 'Easypaisa', mono: 'EP', color: '#3f9c35' }, BANK_TRANSFER: { name: 'Bank account', mono: 'BK', color: '#5b6472' },
};
export function LinkedMethodsManager() {
  const [methods, setMethods] = useState<LinkedMethod[]>([]);
  const [salaryRef, setSalaryRef] = useState<string | null>(null);
  const [adding, setAdding] = useState(false); const [rail, setRail] = useState('RAAST'); const [accountNo, setAccountNo] = useState(''); const [busy, setBusy] = useState(false); const [error, setError] = useState('');
  const load = () => Promise.all([
    api<{ methods: LinkedMethod[] }>('/profile/payment-methods').then(d => setMethods(d.methods)),
    api<{ salaryAccountLinked: boolean; salaryAccountRef: string | null }>('/auth/me').then(d => setSalaryRef(d.salaryAccountLinked ? d.salaryAccountRef : null)).catch(() => {}),
  ]).catch(() => {});
  useEffect(() => { void load(); }, []);
  const add = async () => { setBusy(true); setError(''); try { await api('/profile/payment-methods', { method: 'POST', body: JSON.stringify({ rail, accountNo: accountNo.replace(/\s+/g, '') }) }); setAdding(false); setAccountNo(''); await load(); } catch (reason) { setError((reason as Error).message); } finally { setBusy(false); } };
  const prefer = async (id: string) => { try { const d = await api<{ methods: LinkedMethod[] }>(`/profile/payment-methods/${id}/preferred`, { method: 'POST' }); setMethods(d.methods); } catch { /* refresh next open */ } };
  const remove = async (id: string) => { try { const d = await api<{ methods: LinkedMethod[] }>(`/profile/payment-methods/${id}`, { method: 'DELETE' }); setMethods(d.methods); if (id === salaryRef) setSalaryRef(null); } catch { /* refresh next open */ } };
  const markSalary = async (id: string, enabled: boolean) => { try { const d = await api<{ salaryAccountLinked: boolean; salaryAccountRef: string | null }>(`/profile/payment-methods/${id}/salary`, { method: 'POST', body: JSON.stringify({ enabled }) }); setSalaryRef(d.salaryAccountLinked ? d.salaryAccountRef : null); } catch { /* refresh next open */ } };
  return <div className="settings-block">
    <span className="eyebrow" style={{ display: 'block', marginBottom: 6 }}>Linked payment methods</span>
    <div className="method-list">
      {methods.map(m => { const meta = RAIL_META[m.rail] || RAIL_META.BANK_TRANSFER; return <div key={m.id} className={`method-row static ${m.preferred ? 'on' : ''}`}>
        <i className="method-logo" style={{ background: meta.color }}>{meta.mono}</i>
        <span className="method-text"><b>{m.label}</b><small className="mono">{m.accountNo}{m.id === salaryRef ? ' · 💼 Salary account — 20% off early/slot fees' : ''}</small></span>
        {m.preferred ? <span className="pref-chip">Preferred</span> : <button className="text-action slim-action" onClick={() => void prefer(m.id)}>Make preferred</button>}
        {m.id === salaryRef ? <button className="text-action slim-action" onClick={() => void markSalary(m.id, false)}>Unset salary</button> : <button className="text-action slim-action" onClick={() => void markSalary(m.id, true)}>Salary account</button>}
        <button className="text-action slim-action danger" onClick={() => void remove(m.id)}>Remove</button>
      </div>; })}
      {!methods.length && !adding && <p className="muted" style={{ fontSize: 12.5 }}>Nothing linked yet. Link your wallet or Raast ID once — checkout pre-fills it and auto-pay can use it.</p>}
    </div>
    {adding ? <div className="add-method">
      <div className="rail-grid">{Object.keys(RAIL_META).map(r => <button key={r} className={`rail-chip ${rail === r ? 'on' : ''}`} onClick={() => setRail(r)}>{RAIL_META[r].name}</button>)}</div>
      <Field label={rail === 'BANK_TRANSFER' ? 'IBAN' : rail === 'RAAST' ? 'Raast ID (your mobile number)' : `${RAIL_META[rail].name} wallet number`}>
        <input className="field" value={accountNo} onChange={e => setAccountNo(e.target.value)} placeholder={rail === 'BANK_TRANSFER' ? 'PK36XXXX0000123456789012' : '03XXXXXXXXX'} />
      </Field>
      {error && <div className="error-box">{error}</div>}
      <div className="form-actions"><button className="secondary" onClick={() => { setAdding(false); setError(''); }}>Cancel</button><button className="primary" disabled={busy || accountNo.replace(/\s+/g, '').length < 11} onClick={add}>{busy ? 'Linking…' : 'Link method'}</button></div>
      <p className="muted" style={{ fontSize: 11.5 }}>Halqa stores the identifier only — never balances, never cards. Cards will be entered on the licensed payment partner's own secure page when live rails switch on.</p>
    </div> : <button className="secondary" style={{ marginTop: 8, padding: '9px 14px', borderRadius: 12, fontSize: 12.5, fontWeight: 700 }} onClick={() => setAdding(true)}>+ Link a wallet or account</button>}
  </div>;
}

export default function SettingsPage({ user }: { user: User }) {
  const [open, setOpen] = useState<SectionId | null>(null);
  const [doc, setDoc] = useState<DocId | null>(null);
  const [lang, setLang] = useLang();
  const [consent, setConsent] = useState<boolean | null>(null);
  const [consentBusy, setConsentBusy] = useState(false);
  const [notif, setNotif] = useState({ reminders: pref.get('notif.reminders', 'on') === 'on', rounds: pref.get('notif.rounds', 'on') === 'on', marketing: pref.get('notif.marketing', 'off') === 'on' });
  const [rail, setRail] = useState(pref.get('payments.rail', 'RAAST'));
  useEffect(() => { void api<{ dataConsent: boolean }>('/profile/consent').then(d => setConsent(d.dataConsent)).catch(() => setConsent(null)); }, []);
  const saveConsent = async (value: boolean) => { setConsentBusy(true); try { await api('/profile/consent', { method: 'PATCH', body: JSON.stringify({ dataConsent: value }) }); setConsent(value); } catch { /* keep previous */ } finally { setConsentBusy(false); } };
  const setN = (k: keyof typeof notif, v: boolean) => { setNotif({ ...notif, [k]: v }); pref.set(`notif.${k}`, v ? 'on' : 'off'); };

  const sections: { id: SectionId; icon: JSX.Element; title: string; sub: string }[] = [
    { id: 'security', icon: <Fingerprint />, title: 'Sign in & security', sub: 'Password, sessions, account protection' },
    { id: 'account', icon: <UserCog />, title: 'Account preferences', sub: 'Identity on file, language, display' },
    { id: 'privacy', icon: <ShieldCheck />, title: 'Data privacy', sub: 'What Halqa shares, your controls, your data' },
    { id: 'ads', icon: <Megaphone />, title: 'Advertising data', sub: 'Goal-intent sharing and ad choices' },
    { id: 'notifications', icon: <Bell />, title: 'Notifications', sub: 'Reminders, round updates, marketing' },
    { id: 'payments', icon: <CreditCard />, title: 'Payments', sub: 'Preferred rail, fees, payment history' },
    { id: 'legal', icon: <Scale />, title: 'Legal & policies', sub: 'User Agreement, Privacy, Fees, Community' },
    { id: 'help', icon: <HelpCircle />, title: 'Help & about', sub: 'Support, security reports, version' },
  ];

  return <div className="page narrow enter">
    <div className="page-head"><div><span className="eyebrow">Account center</span><h1>Settings</h1><p>Everything about your account, your data, and your choices — in one place.</p></div></div>
    <div className="settings-list">
      {sections.map(s => <section key={s.id} className={`panel settings-section ${open === s.id ? 'open' : ''}`}>
        <button className="settings-row" onClick={() => setOpen(open === s.id ? null : s.id)}>{s.icon}<span className="settings-row-text"><b>{s.title}</b><small>{s.sub}</small></span><ChevronRight className={`chev ${open === s.id ? 'down' : ''}`} /></button>
        {open === s.id && <div className="settings-body">
          {s.id === 'security' && <>
            <ChangePassword />
            <div className="info-stack"><div><span>Two-step verification</span><b>Coming with WhatsApp OTP</b></div><div><span>Failed sign-in lockout</span><b>On — locks after repeated failures</b></div><div><span>Sessions</span><b>Changing your password signs out all other devices</b></div></div>
          </>}
          {s.id === 'account' && <>
            <div className="info-stack">
              <div><span>Full name</span><b>{user.fullName}</b></div>
              <div><span>Username</span><b>@{user.username}</b></div>
              <div><span>Mobile</span><b>{user.phone}</b></div>
              <div><span>Email</span><b>{user.email}</b></div>
              <div><span>CNIC</span><b>{user.cnic ? `•••••••••${user.cnic.slice(-4)} · verified identity on file` : 'Not on file — add it to rank higher in turn order'}</b></div>
            </div>
            <div className="settings-block"><Toggle label={lang === 'en' ? 'اردو interface' : 'English interface'} hint="Switch the app language." checked={lang === 'ur'} onChange={v => setLang(v ? 'ur' : 'en')} /></div>
            <p className="muted" style={{ fontSize: 12 }}>Name, phone, email or CNIC wrong? Contact support@halqa.pk with proof of identity — identity fields are audit-locked and can't be self-edited once circles are running.</p>
          </>}
          {s.id === 'privacy' && <>
            <Toggle label="Share my goal interest with relevant partners" hint="Only your name, number, city and goal category — never your ledger, score, CNIC or circle history. Off means nothing is ever shared. You can change this any time." checked={consent === true} disabled={consent === null || consentBusy} onChange={saveConsent} />
            <div className="info-stack"><div><span>Your ledger & score</span><b>Never sold, never shared with partners</b></div><div><span>Other members see</span><b>Name, reliability, payment status in shared circles only</b></div><div><span>Download my data</span><b>Generate a Credit Passport from Profile, or email privacy@halqa.pk</b></div><div><span>Delete my account</span><b>Email privacy@halqa.pk — honoured after active circles settle</b></div></div>
            <button className="text-action" onClick={() => setDoc('privacy')}>Read the full Privacy Policy</button>
          </>}
          {s.id === 'ads' && <>
            <Toggle label="Goal-intent sharing (the only 'advertising data' we use)" hint="This is the same switch as Data privacy — one consent, one switch, no dark patterns. Sponsored content, if ever shown, will be labelled." checked={consent === true} disabled={consent === null || consentBusy} onChange={saveConsent} />
            <div className="info-stack"><div><span>Third-party ad trackers</span><b>None in the app</b></div><div><span>Your CNIC & ledger</span><b>Never available to advertisers</b></div></div>
            <button className="text-action" onClick={() => setDoc('ads')}>Read Advertising & Ad Choices</button>
          </>}
          {s.id === 'notifications' && <>
            <Toggle label="Payment reminders" hint="Due-date nudges for your installments." checked={notif.reminders} onChange={v => setN('reminders', v)} />
            <Toggle label="Round updates" hint="Payout releases, round openings, circle milestones." checked={notif.rounds} onChange={v => setN('rounds', v)} />
            <Toggle label="News & offers from Halqa" hint="Off by default. Product news only — we don't spam." checked={notif.marketing} onChange={v => setN('marketing', v)} />
            <p className="muted" style={{ fontSize: 12 }}>Preferences apply on this device. Critical security alerts are always delivered.</p>
          </>}
          {s.id === 'payments' && <>
            <LinkedMethodsManager />
            <Field label="Fallback rail" hint="Used when none of your linked methods fits.">
              <div className="rail-grid">{['RAAST', 'JAZZCASH', 'EASYPAISA', 'BANK_TRANSFER', 'CASH'].map(r => { const meta = RAIL_META[r]; return <button key={r} className={`rail-chip ${rail === r ? 'on' : ''}`} onClick={() => { setRail(r); pref.set('payments.rail', r); }}>{meta && <i className="chip-logo" style={{ background: meta.color }}>{meta.mono}</i>}{meta ? meta.name : 'Cash'}</button>; })}</div>
            </Field>
            <div className="info-stack"><div><span>Digital confirmations</span><b>Sandbox mode — clearly marked until live rails switch on</b></div><div><span>Fees Halqa charges</span><b>Only what's in the Fees & Payments Policy</b></div><div><span>Payment history</span><b>Profile → Recorded installments</b></div></div>
            <button className="text-action" onClick={() => setDoc('fees')}>Read Fees & Payments Policy</button>
          </>}
          {s.id === 'legal' && <>
            <div className="legal-links">{(Object.keys(LEGAL_DOCS) as DocId[]).map(id => <button key={id} className="settings-row slim" onClick={() => setDoc(id)}><Scale size={16} /><span className="settings-row-text"><b>{LEGAL_DOCS[id].title}</b><small>{LEGAL_DOCS[id].updated}</small></span><ChevronRight className="chev" /></button>)}</div>
            <p className="muted" style={{ fontSize: 12 }}>You accepted version {TERMS_VERSION} at signup; acceptance is recorded with a timestamp.</p>
          </>}
          {s.id === 'help' && <>
            <div className="info-stack"><div><span>Support</span><b>support@halqa.pk · replies within 2 working days</b></div><div><span>Security reports</span><b>security@halqa.pk</b></div><div><span>App</span><b>Halqa web · {TERMS_VERSION.split('-')[0]}</b></div><div><span><Globe size={12} style={{ verticalAlign: 'middle' }} /> Region</span><b>Pakistan · Asia/Karachi</b></div></div>
          </>}
        </div>}
      </section>)}
    </div>
    <LegalFooter />
    {doc && <LegalDocModal doc={doc} onClose={() => setDoc(null)} />}
  </div>;
}
