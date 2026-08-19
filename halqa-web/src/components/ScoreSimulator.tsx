import { useState } from 'react';
import { Activity } from 'lucide-react';

// ---------------------------------------------------------------------------
// "What happens to my score if I miss one?"
//
// The score gated seats, hosting and the marketplace, and no screen ever told a
// member what moved it. Guessing at a number that decides what you are allowed
// to do is exactly the black box the whole product exists to replace.
//
// Every figure below is the one the server actually applies:
//   on time            +2   (capped at +40 a cycle)
//   clean completion   +200
//   1 to 3 days late   -10
//   4 or more days     -20
//   missed             -40
//   default after
//     collecting       -200
// Source: lib/rewards.ts SCORE_DELTA and services/delinquency.ts.
// ---------------------------------------------------------------------------

const EVENTS = [
  { id: 'ontime',   label: 'Pay on time',              delta: 2,    tone: 'up' },
  { id: 'complete', label: 'Finish a committee clean', delta: 200,  tone: 'up' },
  { id: 'late3',    label: 'Pay 1 to 3 days late',     delta: -10,  tone: 'down' },
  { id: 'late4',    label: 'Pay 4 or more days late',  delta: -20,  tone: 'down' },
  { id: 'missed',   label: 'Miss a payment',           delta: -40,  tone: 'down' },
  { id: 'default',  label: 'Stop paying after collecting', delta: -200, tone: 'bad' },
] as const;

const MIN = 300;
const MAX = 850;
const clamp = (n: number) => Math.max(MIN, Math.min(MAX, n));

function bandOf(score: number) {
  if (score >= 750) return 'Excellent';
  if (score >= 650) return 'Good';
  if (score >= 550) return 'Decent';
  return 'Rebuilding';
}

export function ScoreSimulator({ score }: { score: number }) {
  const [picked, setPicked] = useState<string | null>(null);
  const event = EVENTS.find(e => e.id === picked) || null;
  const next = clamp(score + (event?.delta ?? 0));
  const moved = next - score;
  const bandChanged = bandOf(next) !== bandOf(score);

  return (
    <section className="panel">
      <div className="panel-head">
        <div><h2>What moves your score</h2><p>Tap one to see it.</p></div>
        <Activity />
      </div>

      <div className="sim-head">
        <div className="sim-now"><span>Now</span><b>{score}</b></div>
        <div className="sim-arrow">{moved === 0 ? '' : moved > 0 ? '→' : '→'}</div>
        <div className={`sim-next${moved > 0 ? ' up' : moved < 0 ? ' down' : ''}`}>
          <span>{event ? 'After' : 'Pick one'}</span>
          <b>{event ? next : '—'}</b>
        </div>
      </div>

      {event && (
        <p className={`sim-verdict${bandChanged ? ' warn' : ''}`}>
          {moved > 0 ? `Up ${moved} points.` : `Down ${Math.abs(moved)} points.`}
          {bandChanged
            ? ` That moves you from ${bandOf(score)} to ${bandOf(next)}, which changes the turns you can take.`
            : ` You stay in ${bandOf(next)}.`}
        </p>
      )}

      <div className="sim-events">
        {EVENTS.map(e => (
          <button
            key={e.id}
            className={`sim-event ${e.tone}${picked === e.id ? ' on' : ''}`}
            onClick={() => setPicked(picked === e.id ? null : e.id)}
          >
            <span>{e.label}</span>
            <b>{e.delta > 0 ? `+${e.delta}` : e.delta}</b>
          </button>
        ))}
      </div>

      <p className="sim-note">
        On-time payments add up to 40 points a cycle, so the score rises slowly and steadily.
        It falls faster than it rises because it measures risk, not loyalty.
      </p>
    </section>
  );
}

export default ScoreSimulator;
