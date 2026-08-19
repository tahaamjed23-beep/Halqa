import { useEffect, useState } from 'react';
import { ArrowRight, Users } from 'lucide-react';
import { api } from '../api';
import { money, position } from '../lib/format';

// ---------------------------------------------------------------------------
// Joining used to be an unlabelled text box with no feedback: you typed a code,
// pressed a button, and either landed in a circle or got a raw error. A member
// should see what they are joining before they commit to twelve months of
// payments, and an invite link should open straight onto it.
// ---------------------------------------------------------------------------

// Shape comes from GET /committees/preview/:inviteCode in halqa-api.
type Preview = {
  id: string; name: string; contributionPaisa: string; memberCap: number;
  memberCount: number; periodDays: number; status: string;
  host?: { fullName?: string } | null;
};

const clean = (v: string) => v.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 12);

export function JoinByCode({ initialCode, onJoined }:
  { initialCode?: string | null; onJoined: (committeeId: string) => void }) {
  const [code, setCode] = useState(clean(initialCode || ''));
  const [preview, setPreview] = useState<Preview | null>(null);
  const [state, setState] = useState<'idle' | 'looking' | 'joining'>('idle');
  const [error, setError] = useState('');

  // A code arriving from an invite link looks itself up straight away, so the
  // member lands on the circle rather than on an empty form.
  useEffect(() => { if (initialCode) void look(clean(initialCode)); /* eslint-disable-next-line */ }, [initialCode]);

  const look = async (value: string) => {
    if (value.length < 4) { setError('That code looks too short.'); return; }
    setState('looking'); setError(''); setPreview(null);
    try {
      setPreview(await api<Preview>(`/committees/preview/${encodeURIComponent(value)}`));
    } catch {
      setError('No committee found with that code. Check it with the host.');
    } finally { setState('idle'); }
  };

  const join = async () => {
    if (!preview) return;
    setState('joining'); setError('');
    try {
      await api(`/committees/${preview.id}/join`, { method: 'POST', body: JSON.stringify({ inviteCode: code }) });
      onJoined(preview.id);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not join.');
      setState('idle');
    }
  };

  const paste = async () => {
    try { setCode(clean(await navigator.clipboard.readText())); } catch { /* denied */ }
  };

  return (
    <section className="panel join-card">
      <div className="panel-head"><div><h2>Join a committee</h2><p>Ask the host for the code.</p></div></div>

      <div className="join-entry">
        <input
          className="field join-code-input"
          value={code}
          onChange={e => { setCode(clean(e.target.value)); setPreview(null); setError(''); }}
          onKeyDown={e => { if (e.key === 'Enter') void look(code); }}
          placeholder="ABC123"
          inputMode="text"
          autoCapitalize="characters"
          autoComplete="off"
          spellCheck={false}
          aria-label="Invite code"
        />
        <button className="secondary join-paste" onClick={() => void paste()}>Paste</button>
      </div>

      {!preview && (
        <button className="primary full" disabled={code.length < 4 || state === 'looking'} onClick={() => void look(code)}>
          {state === 'looking' ? 'Looking up' : 'Find committee'}
        </button>
      )}

      {error && <div className="error-box">{error}</div>}

      {preview && (
        <div className="join-preview">
          <div className="join-preview-head">
            <div className="member-avatar"><Users /></div>
            <div>
              <b>{preview.name}</b>
              <span>{preview.host?.fullName ? `Hosted by ${preview.host.fullName}` : 'Committee'}</span>
            </div>
          </div>
          <div className="detail-grid">
            <div><span>Each turn</span><b>{money(preview.contributionPaisa)}</b></div>
            <div><span>Members</span><b>{preview.memberCount} of {preview.memberCap}</b></div>
            <div><span>Every</span><b>{preview.periodDays} days</b></div>
            <div><span>You would owe</span><b>{money(Number(preview.contributionPaisa) * preview.memberCap)}</b></div>
          </div>
          <p className="join-liability">
            Over the full cycle you pay {money(Number(preview.contributionPaisa) * preview.memberCap)} in
            and collect the pot once. {position(preview.memberCount + 1, preview.memberCap)} if you join now.
          </p>
          <button className="primary full" disabled={state === 'joining'} onClick={() => void join()}>
            {state === 'joining' ? 'Joining' : <>Join this committee <ArrowRight /></>}
          </button>
        </div>
      )}
    </section>
  );
}

export default JoinByCode;
