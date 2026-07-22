import { useEffect, useState } from 'react';
import { BadgeCheck, Fingerprint, Lock, Receipt, Unlock } from 'lucide-react';
import { api } from '../api';
import { biometricAvailable, registerBiometric, clearBiometric } from '../lib/webauthn';
import type { User } from '../types';

// The member's standing: turn-access tenure, the service-charge discount they've
// earned by verifying, and the optional biometric unlock. Self-refreshing so the
// discount/tenure updates live after each action.
export default function MemberStatus({ user }: { user: User }) {
  const [me, setMe] = useState<User | null>(user);
  const [busy, setBusy] = useState('');
  const [employer, setEmployer] = useState(user.employerName || '');
  const [askEmployer, setAskEmployer] = useState(false);
  const load = () => api<User>('/auth/me').then(setMe).catch(() => {});
  useEffect(() => { void load(); }, []);
  if (!me) return null;
  const clean = me.committeesCompletedClean ?? 0;
  const unlocked = !!me.earlyTurnUnlocked;
  const discountPct = Math.round((me.feeDiscountBps ?? 0) / 100);

  const verifyIncome = async () => {
    if (!employer.trim()) { setAskEmployer(true); return; }
    setBusy('income'); try { await api('/profile/verify-income', { method: 'POST', body: JSON.stringify({ employerName: employer.trim() }) }); setAskEmployer(false); await load(); } finally { setBusy(''); }
  };
  const secureCheque = async () => { setBusy('cheque'); try { await api('/profile/secure-cheque', { method: 'POST', body: '{}' }); await load(); } finally { setBusy(''); } };
  const clearOne = async (kind: 'income' | 'cheque') => { setBusy(kind); try { await api('/profile/clear-verification', { method: 'POST', body: JSON.stringify({ kind }) }); await load(); } finally { setBusy(''); } };
  const toggleBiometric = async () => {
    setBusy('bio');
    try {
      if (me.hasBiometric) { await api('/auth/set-biometric', { method: 'POST', body: JSON.stringify({ credentialId: null }) }); clearBiometric(); }
      else { const id = await registerBiometric(me.id, me.fullName); if (id) await api('/auth/set-biometric', { method: 'POST', body: JSON.stringify({ credentialId: id }) }); }
      await load();
    } finally { setBusy(''); }
  };

  return <section className="panel">
    <div className="panel-head"><div><span className="eyebrow">Your standing</span><h2>Turn access & rewards</h2><p>Earn cheaper fees and earlier turns by proving you're reliable.</p></div><BadgeCheck /></div>
    <div className="tenure-note" style={{ background: '#fdecec', borderColor: '#f0b8b8', color: '#8a1d1d' }}>⚠ Be honest — every claim here is checked against your documents when we review your account. Misrepresenting your income, employer or cheque will get you removed and blacklisted.</div>

    {/* Tenure */}
    <div className="tenure-note">
      {unlocked ? <Unlock size={18} /> : <Lock size={18} />}
      <div>{unlocked
        ? <><b>Established member.</b> You can take any turn in a circle.</>
        : <><b>New member — last turns only.</b> You can join circles but only in a late seat until you finish <b>2 circles cleanly</b> and we verify you. Progress: <b>{Math.min(clean, 2)}/2</b> clean circles{clean >= 2 ? ' — verification pending.' : '.'}</>}</div>
    </div>

    {/* Discount + verifications */}
    <div className="status-tiers">
      <div className="verify-row">
        <span><b>Service-charge discount</b><small>{me.discountReason || 'Verify below to earn a discount'}</small></span>
        <span className="discount-badge">{discountPct}% off</span>
      </div>

      <div className="verify-row">
        <span><b>Income & employer verified</b><small>Employed? Your employer + pay slip. Housewife/student? Your husband's or guardian's employer + their pay slip → 80% off charges</small></span>
        {me.incomeVerifiedAt
          ? <button className="text-action slim-action danger" disabled={busy==='income'} onClick={() => void clearOne('income')}>Remove</button>
          : askEmployer
            ? <span style={{ display: 'inline-flex', gap: 6 }}><input className="field" style={{ width: 150, padding: '5px 9px', fontSize: 12.5 }} placeholder="Employer name" value={employer} onChange={e => setEmployer(e.target.value)} /><button className="text-action slim-action" disabled={busy==='income'||employer.trim().length<2} onClick={() => void verifyIncome()}>Submit</button></span>
            : <button className="text-action slim-action" disabled={busy==='income'} onClick={() => void verifyIncome()}>Verify</button>}
      </div>

      <div className="verify-row">
        <span><b>Guarantee cheque</b><small>A cheque on file → 95% off (our lowest-risk members)</small></span>
        {me.chequeSecuredAt
          ? <button className="text-action slim-action danger" disabled={busy==='cheque'} onClick={() => void clearOne('cheque')}>Remove</button>
          : <button className="text-action slim-action" disabled={busy==='cheque'} onClick={() => void secureCheque()}><Receipt size={13} style={{ verticalAlign: '-2px' }} /> Provide cheque</button>}
      </div>
    </div>
    {me.chequeSecuredAt ? null : <p className="muted" style={{ fontSize: 11 }}>A guarantee cheque is collected in person by an agent (it's what makes a bounced-cheque case possible). Marking it here reserves the discount; it activates once collected.</p>}

    {/* Biometric */}
    {biometricAvailable() && <label className="settings-toggle" style={{ marginTop: 4 }}>
      <input type="checkbox" checked={!!me.hasBiometric} disabled={busy==='bio'} onChange={() => void toggleBiometric()} />
      <span><b><Fingerprint size={13} style={{ verticalAlign: '-2px' }} /> Unlock with fingerprint</b><small>Use your device's fingerprint/Face instead of typing the PIN on every open.</small></span>
    </label>}
  </section>;
}
