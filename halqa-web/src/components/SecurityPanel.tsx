import { useState } from 'react';
import { Check, Delete, Fingerprint, KeyRound, ShieldCheck } from 'lucide-react';
import { api } from '../api';
import type { User } from '../types';
import { biometricAvailable, storedCredId, registerBiometric, clearBiometric } from '../lib/webauthn';

// App lock. Two independent things, and members confuse them constantly, so
// they are labelled as plainly as possible:
//
//   * the PASSWORD signs you in on a new device;
//   * the PIN opens the app on this device, every single time, even inside a
//     valid session.
//
// The device biometric sits on top of the PIN rather than replacing it. It
// never leaves the handset and Halqa neither receives nor stores it — only the
// credential id lives locally, which is the whole point of the design.

const LEN = 4;

function PinPad({ value, onPress, onBack, disabled }: {
  value: string; onPress: (d: string) => void; onBack: () => void; disabled?: boolean;
}) {
  return <>
    <div className="pin-dots" style={{ margin: '4px 0 16px' }}>
      {Array.from({ length: LEN }, (_, i) => <i key={i} className={i < value.length ? 'on' : ''} />)}
    </div>
    <div className="pin-pad">
      {['1','2','3','4','5','6','7','8','9'].map(d =>
        <button key={d} type="button" className="pin-key" disabled={disabled} onClick={() => onPress(d)}>{d}</button>)}
      <span className="pin-key spacer" aria-hidden />
      <button type="button" className="pin-key" disabled={disabled} onClick={() => onPress('0')}>0</button>
      <button type="button" className="pin-key ghost" onClick={onBack} disabled={!value.length || disabled}
        aria-label="Delete"><Delete size={20} /></button>
    </div>
  </>;
}

export function SecurityPanel({ user }: { user?: User }) {
  const [stage, setStage] = useState<'idle' | 'current' | 'new' | 'confirm'>('idle');
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const [bioOn, setBioOn] = useState(Boolean(storedCredId()));

  const reset = () => { setStage('idle'); setCurrent(''); setNext(''); setConfirm(''); setError(''); };

  async function press(d: string) {
    setError('');
    if (stage === 'current' && current.length < LEN) {
      const v = current + d; setCurrent(v);
      if (v.length === LEN) {
        setBusy(true);
        try {
          await api('/auth/verify-pin', { method: 'POST', body: JSON.stringify({ pin: v }) });
          setStage('new');
        } catch {
          setError('That PIN is not right'); setCurrent('');
        } finally { setBusy(false); }
      }
    } else if (stage === 'new' && next.length < LEN) {
      const v = next + d; setNext(v);
      if (v.length === LEN) setStage('confirm');
    } else if (stage === 'confirm' && confirm.length < LEN) {
      const v = confirm + d; setConfirm(v);
      if (v.length === LEN) {
        if (v !== next) { setError('Those did not match. Start again.'); setNext(''); setConfirm(''); setStage('new'); return; }
        setBusy(true);
        try {
          await api('/auth/set-pin', { method: 'POST', body: JSON.stringify({ pin: v }) });
          setDone(true); reset(); setTimeout(() => setDone(false), 3000);
        } catch (reason) {
          setError((reason as Error).message || 'Could not update your PIN'); setStage('new'); setNext(''); setConfirm('');
        } finally { setBusy(false); }
      }
    }
  }

  const back = () => {
    if (stage === 'current') setCurrent(p => p.slice(0, -1));
    else if (stage === 'new') setNext(p => p.slice(0, -1));
    else if (stage === 'confirm') setConfirm(p => p.slice(0, -1));
  };

  async function toggleBiometric(on: boolean) {
    setError('');
    if (!on) { clearBiometric(); setBioOn(false); return; }
    try {
      const id = await registerBiometric(user?.id ?? 'halqa', user?.fullName ?? 'Halqa member');
      if (id) setBioOn(true);
      else setError('This device did not complete the biometric setup');
    } catch {
      setError('This device did not complete the biometric setup');
    }
  }

  const value = stage === 'current' ? current : stage === 'new' ? next : confirm;
  const title = stage === 'current' ? 'Enter your current PIN'
    : stage === 'new' ? 'Choose a new PIN'
    : 'Enter it again to confirm';

  return <div className="settings-block">
    <div className="row" style={{ padding: '4px 0 12px' }}>
      <div className="row-ic"><KeyRound size={17} /></div>
      <div className="row-body">
        <strong>App PIN</strong>
        <span>Asked every time you open Halqa, even when you are already signed in.</span>
      </div>
      {stage === 'idle'
        ? <button className="secondary" onClick={() => setStage('current')}>Change</button>
        : <button className="secondary" onClick={reset}>Cancel</button>}
    </div>

    {stage !== 'idle' && <div style={{ paddingBottom: 8 }}>
      <p className="muted" style={{ fontSize: 13, textAlign: 'center', marginBottom: 4 }}>{title}</p>
      <PinPad value={value} onPress={d => void press(d)} onBack={back} disabled={busy} />
    </div>}

    {biometricAvailable() && <label className="settings-toggle">
      <input type="checkbox" checked={bioOn} onChange={e => void toggleBiometric(e.target.checked)} />
      <span>
        <b><Fingerprint size={13} style={{ verticalAlign: '-2px' }} /> Unlock with fingerprint or face</b>
        <small>Sits on top of the PIN, it does not replace it. It never leaves this device, and Halqa never receives or stores it.</small>
      </span>
    </label>}

    {done && <div className="commitment-ok"><Check /><div>
      <b>PIN updated</b><small>Use the new one the next time you open the app.</small>
    </div></div>}
    {error && <div className="error-box">{error}</div>}

    <div className="info-stack" style={{ marginTop: 10 }}>
      <div><span>Asked for</span><b>Every open, and every payment</b></div>
      <div><span>Forgotten it</span><b>Sign in with your password and set a new one</b></div>
    </div>
    <p className="muted" style={{ fontSize: 11.5, marginTop: 8 }}>
      <ShieldCheck size={12} style={{ verticalAlign: '-2px' }} /> Five wrong attempts lock the account for
      fifteen minutes. That is deliberate, and it protects you rather than us.
    </p>
  </div>;
}
