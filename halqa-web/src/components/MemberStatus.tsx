import { useEffect, useState } from 'react';
import { Fingerprint, Info, Lock, Percent, Receipt, Unlock } from 'lucide-react';
import { api } from '../api';
import { biometricAvailable, registerBiometric, clearBiometric } from '../lib/webauthn';
import type { User } from '../types';
import { BottomBar, Field, Notice, Row, RowGroup, Sheet } from './wallet';

// ---------------------------------------------------------------------------
// YOUR STANDING
//
// Three facts and the actions that change them: which turns you may take, what
// discount you have earned on Halqa's fee, and whether this device can unlock
// with a fingerprint.
//
// It used to be a panel of paragraphs with an employer input wedged into a row,
// which on a profile carrying ten committees pushed everything under it off the
// screen. It is four rows now, and the one thing that needs typing asks for it
// in a sheet.
// ---------------------------------------------------------------------------

export default function MemberStatus({ user }: { user: User }) {
  const [me, setMe] = useState<User | null>(user);
  const [busy, setBusy] = useState('');
  const [employer, setEmployer] = useState(user.employerName || '');
  const [askEmployer, setAskEmployer] = useState(false);

  const load = () => api<User>('/auth/me').then(setMe).catch(() => {});
  useEffect(() => { void load() }, []);
  if (!me) return null;

  const clean = me.committeesCompletedClean ?? 0;
  const unlocked = !!me.earlyTurnUnlocked;
  const discountPct = Math.round((me.feeDiscountBps ?? 0) / 100);

  const verifyIncome = async () => {
    setBusy('income');
    try {
      await api('/profile/verify-income', { method: 'POST', body: JSON.stringify({ employerName: employer.trim() }) });
      setAskEmployer(false); await load();
    } finally { setBusy('') }
  };
  const secureCheque = async () => {
    setBusy('cheque');
    try { await api('/profile/secure-cheque', { method: 'POST', body: '{}' }); await load() }
    finally { setBusy('') }
  };
  const clearOne = async (kind: 'income' | 'cheque') => {
    setBusy(kind);
    try { await api('/profile/clear-verification', { method: 'POST', body: JSON.stringify({ kind }) }); await load() }
    finally { setBusy('') }
  };
  const toggleBiometric = async () => {
    setBusy('bio');
    try {
      if (me.hasBiometric) {
        await api('/auth/set-biometric', { method: 'POST', body: JSON.stringify({ credentialId: null }) });
        clearBiometric();
      } else {
        const id = await registerBiometric(me.id, me.fullName);
        if (id) await api('/auth/set-biometric', { method: 'POST', body: JSON.stringify({ credentialId: id }) });
      }
      await load();
    } finally { setBusy('') }
  };

  return (
    <>
      <RowGroup title="Your standing">
        <Row chevron={false} icon={unlocked ? <Unlock /> : <Lock />}
             title={unlocked ? 'Any turn is open to you' : 'Late turns only, for now'}
             sub={unlocked
               ? 'No seat is closed to you'
               : Math.min(clean, 2) + ' of 2 clean circles' + (clean >= 2 ? ', verification pending' : '')}
             value={unlocked ? 'Open' : Math.min(clean, 2) + '/2'}
             tone={unlocked ? 'ok' : 'warn'} />

        <Row chevron={false} icon={<Percent />} title="Discount on Halqa's fee"
             sub={me.discountReason || 'Verify income or leave a cheque'}
             value={discountPct + '% off'} tone={discountPct ? 'ok' : undefined} />

        <Row icon={<Receipt />} title="Income and employer"
             sub={me.incomeVerifiedAt
               ? 'Verified, 80 per cent off'
               : 'Employer and one payslip, 80 per cent off'}
             value={me.incomeVerifiedAt ? 'Verified' : 'Verify'}
             tone={me.incomeVerifiedAt ? 'ok' : undefined}
             onClick={() => me.incomeVerifiedAt ? void clearOne('income') : setAskEmployer(true)} />

        <Row icon={<Receipt />} title="Guarantee cheque"
             sub={me.chequeSecuredAt
               ? 'On file'
               : 'An agent collects it in person'}
             value={me.chequeSecuredAt ? 'On file' : 'Arrange'}
             tone={me.chequeSecuredAt ? 'ok' : undefined}
             onClick={() => me.chequeSecuredAt ? void clearOne('cheque') : void secureCheque()} />

        {biometricAvailable() && (
          <Row chevron={false} icon={<Fingerprint />} title="Unlock with a fingerprint"
               sub="Instead of the PIN"
               value={me.hasBiometric ? 'On' : 'Off'} tone={me.hasBiometric ? 'ok' : undefined}
               onClick={busy === 'bio' ? undefined : () => void toggleBiometric()} />
        )}
      </RowGroup>

      {askEmployer && (
        <Sheet title="Who do you work for" onClose={() => setAskEmployer(false)}>
          <Field label="Employer" hint="Checked against your documents">
            <input value={employer} placeholder="Company or employer name"
                   onChange={e => setEmployer(e.target.value)} />
          </Field>
          <div className="w-inset">
            <Notice kind="info" icon={<Info />}>
              With one payslip, 80 per cent off the fee.
            </Notice>
          </div>
          <BottomBar>
            <button className="primary full" disabled={busy === 'income' || employer.trim().length < 2}
                    onClick={() => void verifyIncome()}>
              {busy === 'income' ? 'Submitting' : 'Submit'}
            </button>
          </BottomBar>
        </Sheet>
      )}
    </>
  );
}
