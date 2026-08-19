import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';
import { api } from '../api';
import { money } from '../lib/format';

// ---------------------------------------------------------------------------
// The 24-hour confirmation window.
//
// A member used to go from "join" straight to twelve months of obligations with
// no moment in between. This is that moment: the final roster, the seat order,
// the amount, and the full forward obligation in rupees, with a free way out
// while the countdown runs.
//
// The countdown is derived from one server timestamp rather than a local timer,
// so every member sees the same deadline and a reload cannot extend it.
// ---------------------------------------------------------------------------

type Props = {
  committeeId: string;
  committeeName: string;
  confirmingSince: string;
  contributionPaisa: string | number;
  rounds: number;
  isHost: boolean;
  onChanged: () => void;
};

const WINDOW_MS = 24 * 3_600_000;

function remaining(since: string) {
  return Math.max(0, new Date(since).getTime() + WINDOW_MS - Date.now());
}

function clock(ms: number) {
  const h = Math.floor(ms / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  const s = Math.floor((ms % 60_000) / 1000);
  return `${h}h ${String(m).padStart(2, '0')}m ${String(s).padStart(2, '0')}s`;
}

export function ConfirmingWindow(props: Props) {
  const { committeeId, committeeName, confirmingSince, contributionPaisa, rounds, isHost, onChanged } = props;
  const [left, setLeft] = useState(() => remaining(confirmingSince));
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const t = setInterval(() => setLeft(remaining(confirmingSince)), 1000);
    return () => clearInterval(t);
  }, [confirmingSince]);

  const total = Number(contributionPaisa) * Math.max(0, rounds);
  const open = left > 0;

  const withdraw = async () => {
    setBusy(true); setError('');
    try {
      await api(`/committees/${committeeId}/withdraw`, { method: 'POST' });
      onChanged();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not leave right now.');
      setBusy(false);
    }
  };

  const startNow = async () => {
    setBusy(true); setError('');
    try {
      await api(`/committees/${committeeId}/start`, { method: 'POST', body: '{}' });
      onChanged();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not start yet.');
      setBusy(false);
    }
  };

  return (
    <section className="panel confirming">
      <div className="confirming-head">
        <Clock />
        <div>
          <b>{open ? 'Starts in' : 'Ready to start'}</b>
          <strong className="confirming-clock">{open ? clock(left) : 'Window closed'}</strong>
        </div>
      </div>

      <p className="confirming-lead">
        {open
          ? `${committeeName} locks in when the countdown ends. Until then you can leave and nothing is owed.`
          : `The window has closed. ${committeeName} can now begin.`}
      </p>

      <div className="detail-grid">
        <div><span>Each turn</span><b>{money(contributionPaisa)}</b></div>
        <div><span>Rounds</span><b>{rounds}</b></div>
        <div><span>You pay in total</span><b>{money(total)}</b></div>
        <div><span>You collect once</span><b>{money(total)}</b></div>
      </div>

      <p className="confirming-obligation">
        Over the full cycle you pay <b>{money(total)}</b> in {rounds} payments of {money(contributionPaisa)},
        and you collect the pot once at your turn.
      </p>

      {error && <div className="error-box">{error}</div>}

      {open && !isHost && (
        confirm ? (
          <div className="confirming-confirm">
            <p>Leave {committeeName}? Your seat is released and the group is told. Nothing is owed.</p>
            <div className="form-actions">
              <button className="secondary" disabled={busy} onClick={() => setConfirm(false)}>Stay</button>
              <button className="danger-button" disabled={busy} onClick={() => void withdraw()}>
                {busy ? 'Leaving' : 'Leave, free'}
              </button>
            </div>
          </div>
        ) : (
          <button className="secondary full" onClick={() => setConfirm(true)}>Leave now, free</button>
        )
      )}

      {open && isHost && (
        <p className="confirming-hostnote">
          You opened this window. Members can still leave without a fine until it closes.
        </p>
      )}

      {!open && (
        <button className="primary full" disabled={busy} onClick={() => void startNow()}>
          {busy ? 'Starting' : 'Begin the committee'}
        </button>
      )}
    </section>
  );
}

export default ConfirmingWindow;
