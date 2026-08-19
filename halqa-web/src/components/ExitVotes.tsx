import { useCallback, useEffect, useState } from 'react';
import { Scale, ThumbsDown, ThumbsUp } from 'lucide-react';
import { api } from '../api';
import type { User } from '../types';
import { money, since } from '../lib/format';

// ---------------------------------------------------------------------------
// Voting on a member's exit.
//
// The request, the tally, the quorum and the restitution engine all existed on
// the server. There was simply no screen, so nobody could vote and every
// request sat until it expired. A ladder rung nobody can climb is not a rung.
//
// The rules shown here are the server's: a simple majority of votes cast,
// excluding the person leaving, with half the circle required to vote. The host
// votes as one member and breaks ties, with no veto, because handing the
// organiser power over exits rebuilds the asymmetry the fraud cases run on.
// ---------------------------------------------------------------------------

type Vote = { userId: string; approve: boolean };
type Debt = { id: string; debtorId: string; amountPaisa: string };
type Request = {
  id: string;
  userId: string;
  rung: string;
  status: string;
  reason?: string | null;
  createdAt: string;
  restitutionDuePaisa: string;
  finePaisa: string;
  votes: Vote[];
  debts: Debt[];
  user?: { id: string; fullName: string; displayName?: string | null };
};

export function ExitVotes({ committeeId, user, memberCount }:
  { committeeId: string; user: User; memberCount: number }) {
  const [rows, setRows] = useState<Request[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try { setRows(await api<Request[]>(`/exits/committee/${committeeId}`)); }
    catch { /* nothing pending, or offline */ }
  }, [committeeId]);

  useEffect(() => { void load(); }, [load]);

  const cast = async (id: string, approve: boolean) => {
    setBusy(id); setError('');
    try {
      await api(`/exits/${id}/vote`, { method: 'POST', body: JSON.stringify({ approve }) });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Your vote did not go through.');
    } finally { setBusy(null); }
  };

  const open = rows.filter(r => r.status === 'PENDING' && r.rung === 'GROUP_VOTE');
  if (!open.length) return null;

  return (
    <section className="panel">
      <div className="panel-head">
        <div><h2>Someone wants to leave</h2><p>The group decides, not the host.</p></div>
        <Scale />
      </div>

      {error && <div className="error-box">{error}</div>}

      {open.map(r => {
        const mine = r.userId === user.id;
        const eligible = Math.max(1, memberCount - 1);           // the leaver cannot vote
        const cast_ = r.votes.length;
        const forVotes = r.votes.filter(v => v.approve).length;
        const myVote = r.votes.find(v => v.userId === user.id);
        const quorum = Math.ceil(eligible / 2);
        const quorumMet = cast_ >= quorum;
        const owedToThem = Number(r.restitutionDuePaisa || 0);
        const myDebt = r.debts.find(d => d.debtorId === user.id);

        return (
          <div key={r.id} className="vote-card">
            <div className="vote-head">
              <b>{r.user?.displayName || r.user?.fullName || 'A member'}</b>
              <span>asked {since(r.createdAt)} ago</span>
            </div>

            {r.reason && <p className="vote-reason">{r.reason}</p>}

            <div className="detail-grid">
              <div><span>They get back</span><b>{money(owedToThem)}</b></div>
              <div><span>Their fine</span><b>{money(Number(r.finePaisa || 0))}</b></div>
              {myDebt && <div><span>Your share</span><b>{money(Number(myDebt.amountPaisa))}</b></div>}
            </div>

            <div className="vote-tally">
              <div className="vote-bar">
                <i style={{ width: `${(forVotes / eligible) * 100}%` }} />
              </div>
              <span>
                {forVotes} of {cast_} cast are in favour · {cast_} of {eligible} have voted
                {quorumMet ? '' : ` · ${quorum - cast_} more needed`}
              </span>
            </div>

            {mine ? (
              <p className="vote-note">This is your request. You cannot vote on it.</p>
            ) : (
              <div className="vote-actions">
                <button
                  className={`vote-btn yes${myVote?.approve === true ? ' on' : ''}`}
                  disabled={busy === r.id}
                  onClick={() => void cast(r.id, true)}
                ><ThumbsUp />Let them go</button>
                <button
                  className={`vote-btn no${myVote?.approve === false ? ' on' : ''}`}
                  disabled={busy === r.id}
                  onClick={() => void cast(r.id, false)}
                ><ThumbsDown />Keep the circle</button>
              </div>
            )}

            <p className="vote-note">
              A majority of the votes cast decides it, once half the circle has voted. If too few
              vote, Halqa reviews it rather than trapping anyone.
            </p>
          </div>
        );
      })}
    </section>
  );
}

export default ExitVotes;
