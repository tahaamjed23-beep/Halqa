import { useEffect, useState } from 'react';
import { AlertTriangle, Check, DoorOpen, Mic, Users, UserPlus, X } from 'lucide-react';
import { api, money } from '../api';

// Leaving a circle. There is no cancel button, because a committee is a
// promise to eleven other people. There is a ladder of five rungs, and the
// member is shown what each one would cost them BEFORE they choose — the
// restitution arithmetic is computed server-side and quoted here.
//
// A member who has already collected cannot exit at all. They hold the pot and
// owe the remainder; leaving then is default, not exit, and the sheet says so
// plainly rather than hiding the button.

type Quote = {
  rung: 'WINDOW' | 'SUBSTITUTION' | 'GROUP_VOTE' | 'HARDSHIP';
  label: string; available: boolean;
  restitutionDuePaisa: string; finePaisa: string; netToLeaverPaisa: string; note: string;
};
type Options = {
  hasCollected: boolean; inConfirmationWindow: boolean; installmentsPaid: number;
  available: string[]; quotes: Quote[]; blockedReason: string | null;
  vote: { windowHours: number; approvalShare: number; quorumShare: number };
};

const ICON: Record<Quote['rung'], JSX.Element> = {
  WINDOW: <DoorOpen size={17} />,
  SUBSTITUTION: <UserPlus size={17} />,
  GROUP_VOTE: <Users size={17} />,
  HARDSHIP: <Mic size={17} />,
};

const BLURB: Record<Quote['rung'], string> = {
  WINDOW: 'Free and silent. Nothing is recorded and nobody is told.',
  SUBSTITUTION: 'Someone takes your place and pays you back what you have put in, directly. No fine. This is the route most people should take.',
  GROUP_VOTE: 'The circle votes over seventy two hours. If too few vote, it comes to Halqa rather than trapping you.',
  HARDSHIP: 'A recorded statement to the helpline. The fine is waived and it is marked as hardship, never as a default.',
};

export function ExitSheet({ committeeId, onClose, onDone }: {
  committeeId: string; onClose: () => void; onDone?: () => void;
}) {
  const [opt, setOpt] = useState<Options | null>(null);
  const [chosen, setChosen] = useState<Quote['rung'] | null>(null);
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api<Options>(`/exits/committee/${committeeId}/options`)
      .then(setOpt)
      .catch(() => setError('Could not load your options for this circle'));
  }, [committeeId]);

  async function submit() {
    if (!chosen) return;
    setBusy(true); setError('');
    try {
      await api(`/exits/committee/${committeeId}`, {
        method: 'POST',
        body: JSON.stringify({ rung: chosen, reason: reason.trim() || undefined }),
      });
      setDone(chosen === 'GROUP_VOTE'
        ? 'Your request is with the circle. They have seventy two hours to vote, and if too few do, Halqa reviews it.'
        : 'You have left this circle. Anything you are owed settles when the cycle finishes.');
      onDone?.();
    } catch (reason_) {
      setError((reason_ as Error).message || 'Could not submit that request');
    } finally { setBusy(false); }
  }

  return <div className="sheet-wrap" role="dialog" aria-label="Leave this circle">
    <div className="sheet-bg" onClick={onClose} />
    <div className="sheet">
      <div className="sheet-head">
        <div><span className="eyebrow">Leaving</span><h2>Step out of this circle</h2></div>
        <button className="back" aria-label="Close" onClick={onClose}><X /></button>
      </div>

      {!opt && !error && <p className="muted">Loading your options…</p>}

      {done && <div className="commitment-ok"><Check /><div><b>Done</b><small>{done}</small></div></div>}

      {opt && !done && <>
        {opt.blockedReason
          ? <div className="warn-box"><AlertTriangle size={16} /><div>
              <b>You cannot exit this circle</b>
              <small>{opt.blockedReason}</small>
            </div></div>
          : <>
            <p className="muted" style={{ fontSize: 12.5, marginBottom: 12 }}>
              You have paid {opt.installmentsPaid} installment{opt.installmentsPaid === 1 ? '' : 's'}.
              Every option below shows exactly what you get back and what it costs, before you choose.
            </p>

            <div className="list">
              {opt.quotes.filter(q => q.available).map(q => {
                const on = chosen === q.rung;
                return <button key={q.rung} className={`exit-opt ${on ? 'on' : ''}`} onClick={() => setChosen(q.rung)}>
                  <div className="row-ic">{ICON[q.rung]}</div>
                  <div className="row-body">
                    <strong>{q.label}</strong>
                    <span>{BLURB[q.rung]}</span>
                    <div className="exit-nums">
                      <span>You get back <b>{money(q.netToLeaverPaisa)}</b></span>
                      {q.finePaisa !== '0' && <span>Fine <b>{money(q.finePaisa)}</b></span>}
                    </div>
                  </div>
                  {on && <Check size={17} style={{ color: 'var(--l600)', flex: 'none' }} />}
                </button>;
              })}
            </div>

            {opt.quotes.filter(q => q.available).length === 0 &&
              <p className="muted">No exit route is open on this circle right now.</p>}

            {chosen && <>
              <label className="field-wrap" style={{ marginTop: 12 }}>
                <span>{chosen === 'HARDSHIP' ? 'What has happened?' : 'Anything you want the circle to know? (optional)'}</span>
                <textarea className="field" rows={3} maxLength={500} value={reason}
                  onChange={e => setReason(e.target.value)}
                  placeholder={chosen === 'HARDSHIP' ? 'A short explanation. You can also record this by calling the helpline.' : ''} />
                {chosen === 'HARDSHIP' && <small>You can call the helpline and say this instead of typing it. A recorded reason counts exactly the same.</small>}
              </label>
              <button className="primary" disabled={busy} onClick={() => void submit()}>
                {busy ? 'Submitting…' : `Confirm · ${opt.quotes.find(q => q.rung === chosen)?.label}`}
              </button>
              <p className="muted" style={{ fontSize: 11.5, marginTop: 8 }}>
                {opt.quotes.find(q => q.rung === chosen)?.note}
              </p>
            </>}
          </>}
        {error && <div className="error-box">{error}</div>}
      </>}

      {error && !opt && <div className="error-box">{error}</div>}
    </div>
  </div>;
}
