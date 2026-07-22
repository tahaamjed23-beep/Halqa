import { useEffect, useState } from 'react';
import { Delete, Fingerprint, ShieldCheck } from 'lucide-react';
import { api, tokens } from '../api';
import { Logo } from './ui';
import { assertBiometric, storedCredId } from '../lib/webauthn';
import type { User } from '../types';

// The app-open PIN gate. Shown on every fresh load when the member has a PIN
// (in-memory unlock only — a reload re-asks, matching "every time you open"),
// and as a one-time setup when they don't yet. A wrong PIN never reveals
// anything; "Forgot PIN" falls back to a full password sign-in.
export default function PinLock({ user, mode, onUnlock, onLogout, onSkip }: { user: User; mode: 'verify' | 'setup'; onUnlock: () => void; onLogout: () => void; onSkip?: () => void }) {
  // Biometric is offered only if the member enabled it (server flag) AND this
  // device holds the credential. On open we auto-prompt once for convenience.
  const biometricReady = mode === 'verify' && !!user.hasBiometric && !!storedCredId();
  const tryBiometric = async () => { if (await assertBiometric()) onUnlock(); };
  useEffect(() => { if (biometricReady) void tryBiometric(); /* eslint-disable-next-line */ }, []);
  const [stage, setStage] = useState<'enter' | 'confirm'>('enter');
  const [pin, setPin] = useState('');
  const [firstPin, setFirstPin] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const LEN = 4;

  const submitVerify = async (value: string) => {
    setBusy(true); setError('');
    try { await api('/auth/verify-pin', { method: 'POST', body: JSON.stringify({ pin: value }) }); onUnlock(); }
    catch (reason) { setError((reason as Error).message || 'Incorrect PIN'); setPin(''); }
    finally { setBusy(false); }
  };
  const submitSetup = async (value: string) => {
    if (stage === 'enter') { setFirstPin(value); setPin(''); setStage('confirm'); return; }
    if (value !== firstPin) { setError('PINs did not match — try again'); setPin(''); setFirstPin(''); setStage('enter'); return; }
    setBusy(true); setError('');
    try { await api('/auth/set-pin', { method: 'POST', body: JSON.stringify({ pin: value }) }); onUnlock(); }
    catch (reason) { setError((reason as Error).message); setPin(''); setFirstPin(''); setStage('enter'); }
    finally { setBusy(false); }
  };
  const press = (digit: string) => {
    if (busy || pin.length >= LEN) return;
    const next = pin + digit; setPin(next); setError('');
    if (next.length === LEN) { if (mode === 'verify') void submitVerify(next); else void submitSetup(next); }
  };
  const back = () => { if (!busy) { setPin(p => p.slice(0, -1)); setError(''); } };

  const title = mode === 'setup' ? (stage === 'enter' ? 'Create your app PIN' : 'Confirm your PIN') : `Welcome back, ${user.fullName.split(' ')[0]}`;
  const sub = mode === 'setup'
    ? (stage === 'enter' ? 'Pick a 4-digit PIN. You’ll enter it every time you open Halqa.' : 'Enter it again to confirm.')
    : 'Enter your 4-digit PIN to open Halqa.';

  return <div className="pin-screen">
    <div className="pin-card">
      <div className="pin-head"><Logo /><span className="pin-lockicon"><ShieldCheck size={18} /></span></div>
      <h2>{title}</h2><p>{sub}</p>
      <div className="pin-dots">{Array.from({ length: LEN }, (_, i) => <i key={i} className={i < pin.length ? 'on' : ''} />)}</div>
      {error && <div className="pin-error">{error}</div>}
      <div className="pin-pad">
        {['1','2','3','4','5','6','7','8','9'].map(d => <button key={d} type="button" className="pin-key" disabled={busy} onClick={() => press(d)}>{d}</button>)}
        <span className="pin-key spacer" aria-hidden />
        <button type="button" className="pin-key" disabled={busy} onClick={() => press('0')}>0</button>
        <button type="button" className="pin-key ghost" onClick={back} disabled={!pin.length || busy} aria-label="Delete"><Delete size={20} /></button>
      </div>
      {biometricReady && <button type="button" className="pin-biometric" onClick={() => void tryBiometric()}><Fingerprint size={18} /> Unlock with fingerprint</button>}
      {mode === 'setup' && onSkip
        ? <button type="button" className="pin-forgot" onClick={onSkip}>Set up later</button>
        : <button type="button" className="pin-forgot" onClick={() => { tokens.clear(); onLogout(); }}>{mode === 'setup' ? 'Sign out instead' : 'Forgot PIN? Sign in with password'}</button>}
    </div>
  </div>;
}
