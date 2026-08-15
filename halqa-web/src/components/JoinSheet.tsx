import { useState } from 'react';
import { KeyRound, MessageCircle, Mail, MessageSquare, Search, X, Check } from 'lucide-react';
import { api } from '../api';

// Joining a committee. The centre button in the bottom bar opens this, because
// joining is what most members do most of the time — hosting is the rarer act.
//
// Four ways in, which is how people actually receive an invite in Pakistan:
// a code read out on the phone, a WhatsApp forward, an SMS, or an email.

type Found = { id: string; name: string; contributionPaisa: string; memberCap: number; members: number };

export function JoinSheet({ onClose, onJoined }: { onClose: () => void; onJoined?: (id: string) => void }) {
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [found, setFound] = useState<Found | null>(null);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const clean = code.trim().toUpperCase();

  async function look() {
    if (clean.length < 4) return;
    setBusy(true); setError(''); setFound(null);
    try {
      setFound(await api<Found>(`/committees/preview/${encodeURIComponent(clean)}`));
    } catch {
      setError('No circle with that code. Check it with whoever invited you.');
    } finally { setBusy(false); }
  }

  async function join() {
    if (!found) return;
    setBusy(true); setError('');
    try {
      await api(`/committees/${found.id}/join`, { method: 'POST', body: JSON.stringify({ inviteCode: clean }) });
      setDone(true); onJoined?.(found.id);
    } catch (reason) {
      setError((reason as Error).message || 'Could not join this circle');
    } finally { setBusy(false); }
  }

  // Ask for the code through whichever channel the invite arrived on. Nothing
  // is sent on the member's behalf; these open the app with a prefilled ask.
  const askText = encodeURIComponent('Assalam-o-alaikum! Please send me the Halqa invite code for your committee.');
  const ways: Array<{ id: string; label: string; icon: JSX.Element; bg: string; href?: string; onClick?: () => void }> = [
    { id: 'code', label: 'Enter code', icon: <KeyRound size={18} />, bg: 'var(--l500)', onClick: () => document.getElementById('join-code')?.focus() },
    { id: 'wa', label: 'WhatsApp', icon: <MessageCircle size={18} />, bg: '#25D366', href: `https://wa.me/?text=${askText}` },
    { id: 'sms', label: 'Messages', icon: <MessageSquare size={18} />, bg: '#0B84FF', href: `sms:?&body=${askText}` },
    { id: 'mail', label: 'Email', icon: <Mail size={18} />, bg: '#C5221F', href: `mailto:?subject=Halqa%20invite%20code&body=${askText}` },
  ];

  return <div className="sheet-wrap" role="dialog" aria-label="Join a committee">
    <div className="sheet-bg" onClick={onClose} />
    <div className="sheet">
      <div className="sheet-head">
        <div><span className="eyebrow">Join a committee</span><h2>Have an invite?</h2></div>
        <button className="back" aria-label="Close" onClick={onClose}><X /></button>
      </div>

      {done ? <div className="commitment-ok"><Check /><div>
        <b>You're in</b>
        <small>You'll see the circle under Committees. Nothing is collected until the host starts it.</small>
      </div></div> : <>
        <label className="field-wrap"><span>Invite code</span>
          <input id="join-code" className="field code-input" value={code} maxLength={10} placeholder="ABC123"
            onChange={e => { setCode(e.target.value); setFound(null); setError(''); }}
            onKeyDown={e => { if (e.key === 'Enter') void look(); }} />
          <small>Six characters, from whoever invited you.</small>
        </label>

        {!found && <button className="primary" disabled={busy || clean.length < 4} onClick={() => void look()}>
          <Search size={15} /> {busy ? 'Looking…' : 'Find this circle'}
        </button>}

        {found && <>
          <div className="row" style={{ marginTop: 10 }}>
            <div className="row-ic"><KeyRound size={17} /></div>
            <div className="row-body">
              <strong>{found.name}</strong>
              <span>{found.members} of {found.memberCap} seats taken</span>
            </div>
          </div>
          <button className="primary" disabled={busy} onClick={() => void join()}>
            {busy ? 'Joining…' : `Join ${found.name}`}
          </button>
          <p className="muted" style={{ fontSize: 11.5, marginTop: 8 }}>
            You'll see the full roster, your turn position and your total commitment before anything is
            collected, and you can withdraw free inside the first twenty four hours.
          </p>
        </>}

        <div className="sec-head" style={{ marginTop: 18 }}><h2>Don't have the code?</h2></div>
        <div className="join-ways">
          {ways.map(w => w.href
            ? <a key={w.id} className="join-way" href={w.href} target="_blank" rel="noreferrer">
                <em style={{ background: w.bg, color: '#fff' }}>{w.icon}</em>{w.label}
              </a>
            : <button key={w.id} className="join-way" onClick={w.onClick}>
                <em style={{ background: w.bg, color: '#fff' }}>{w.icon}</em>{w.label}
              </button>)}
        </div>
        <p className="muted" style={{ fontSize: 11.5, marginTop: 10 }}>
          These open a message asking for the code. Halqa never sends anything on your behalf.
        </p>

        {error && <div className="error-box">{error}</div>}
      </>}
    </div>
  </div>;
}

/** Share block for a host: the code plus the same four channels, outbound. */
export function ShareInvite({ code, name, contribution }: { code: string; name: string; contribution?: string }) {
  const text = encodeURIComponent(
    `Assalam-o-alaikum! Join our committee "${name}" on Halqa${contribution ? `, ${contribution} per round` : ''}. ` +
    `Open the app and enter invite code: ${code}`);
  const [copied, setCopied] = useState(false);
  const ways = [
    { id: 'wa', label: 'WhatsApp', icon: <MessageCircle size={18} />, bg: '#25D366', href: `https://wa.me/?text=${text}` },
    { id: 'sms', label: 'Messages', icon: <MessageSquare size={18} />, bg: '#0B84FF', href: `sms:?&body=${text}` },
    { id: 'mail', label: 'Email', icon: <Mail size={18} />, bg: '#C5221F', href: `mailto:?subject=${encodeURIComponent(`Join ${name} on Halqa`)}&body=${text}` },
  ];
  return <div>
    <div className="invite-code" onClick={() => { void navigator.clipboard?.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 1600); }}
      style={{ cursor: 'pointer' }} role="button" tabIndex={0}>
      <span>{copied ? 'Copied' : 'Invite code · tap to copy'}</span><b>{code}</b>
    </div>
    <div className="join-ways">
      {ways.map(w => <a key={w.id} className="join-way" href={w.href} target="_blank" rel="noreferrer">
        <em style={{ background: w.bg, color: '#fff' }}>{w.icon}</em>{w.label}
      </a>)}
    </div>
  </div>;
}
