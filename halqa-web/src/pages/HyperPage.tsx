import { useMemo, useState } from 'react';
import { ChevronLeft, Dices, Flame, Lock, ShieldAlert, Users } from 'lucide-react';
import type { User } from '../types';
import { money, percent } from '../lib/format';

// ---------------------------------------------------------------------------
// HYPER: daily contributions, a random queue, members who cannot see each other.
//
// This screen was previously an opening auction where members bid for a
// collection day. That is a chit fund: the discovered price is interest in
// substance, it sits in the refused list, and India regulates precisely that
// family. Seats here are DRAWN by a verifiable ballot and can never be bought.
//
// Mirrors halqa-api/src/lib/hyper.ts. The numbers below are the specification's,
// and the APR figure uses the same formula the server does, because it is the
// number a regulator or a journalist will compute against us.
// ---------------------------------------------------------------------------

const TICKETS = [
  { dailyPaisa: 10_000, label: 'Rs 100' },
  { dailyPaisa: 50_000, label: 'Rs 500' },
  { dailyPaisa: 100_000, label: 'Rs 1,000' },
  { dailyPaisa: 200_000, label: 'Rs 2,000' },
];
const MIN_DAYS = 48;
const MAX_DAYS = 60;
const MIN_SCORE = 650;
const MIN_CLEAN = 2;
const MAX_APR_PCT = 48;

/** APR = 2 x 365 x F / ((n-1)^2 x c). Same formula as the server. */
function aprPct(allInPaisa: number, days: number, dailyPaisa: number) {
  if (days <= 1 || dailyPaisa <= 0) return 0;
  return (allInPaisa * 2 * 365 * 100) / ((days - 1) ** 2 * dailyPaisa);
}

export default function HyperPage({ user, back }: { user: User; back: () => void }) {
  const [ticket, setTicket] = useState(1);
  const [days, setDays] = useState(MAX_DAYS);

  const t = TICKETS[ticket];
  const roster = days;                 // one collection a day
  const pot = t.dailyPaisa * days;

  // The largest all-in cost that still clears the published ceiling.
  const maxCost = useMemo(
    () => (MAX_APR_PCT * (days - 1) ** 2 * t.dailyPaisa) / (2 * 365 * 100),
    [days, t.dailyPaisa],
  );

  const gates = [
    { ok: user.creditScore >= MIN_SCORE, label: `Score ${MIN_SCORE} or above`, have: `You are at ${user.creditScore}` },
    { ok: (user.committeesCompletedClean || 0) >= MIN_CLEAN, label: `${MIN_CLEAN} clean completed committees`, have: `You have ${user.committeesCompletedClean || 0}` },
    { ok: Boolean(user.incomeVerifiedAt), label: 'Verified income', have: user.incomeVerifiedAt ? 'Verified' : 'Not verified yet' },
    { ok: Boolean(user.hasVerifiedRaast), label: 'Verified Raast credential', have: user.hasVerifiedRaast ? 'On file' : 'Not linked yet' },
  ];
  const eligible = gates.every(g => g.ok);

  return (
    <div className="page narrow enter">
      <button className="back-link" onClick={back}><ChevronLeft />Back</button>
      <div className="page-head">
        <div>
          <span className="eyebrow">Daily committee</span>
          <h1>HYPER</h1>
          <p>You pay every day. The queue is random and nobody sees who else is in it.</p>
        </div>
      </div>

      {/* The honest risk statement goes first, not buried at the bottom. */}
      <section className="panel hyper-risk">
        <div className="hyper-risk-head"><ShieldAlert /><b>Read this before anything else</b></div>
        <p>
          In an ordinary committee you know the others, and that is what makes people pay.
          Here nobody knows anybody. That protection is gone, so HYPER is the most tightly
          gated product on Halqa, not the most open one.
        </p>
      </section>

      <section className="panel">
        <div className="panel-head"><div><h2>Who can join</h2></div></div>
        <div className="hyper-gates">
          {gates.map(g => (
            <div key={g.label} className={g.ok ? 'hyper-gate ok' : 'hyper-gate'}>
              <i />
              <div><b>{g.label}</b><span>{g.have}</span></div>
            </div>
          ))}
        </div>
        {!eligible && <div className="warning-box">You cannot join a HYPER committee yet.</div>}
      </section>

      <section className="panel">
        <div className="panel-head"><div><h2>Your daily amount</h2></div></div>
        <div className="segmented hyper-tickets">
          {TICKETS.map((x, i) => (
            <button key={x.dailyPaisa} className={ticket === i ? 'on' : ''} onClick={() => setTicket(i)}>{x.label}</button>
          ))}
        </div>

        <div className="panel-head hyper-sub"><div><h2>Cycle length</h2><p>Between {MIN_DAYS} and {MAX_DAYS} days.</p></div></div>
        <input
          className="allocation-slider"
          type="range" min={MIN_DAYS} max={MAX_DAYS} step={1}
          value={days} onChange={e => setDays(Number(e.target.value))}
          aria-label="Cycle length in days"
        />
        <div className="detail-grid">
          <div><span>Days</span><b>{days}</b></div>
          <div><span>Members</span><b>{roster}</b></div>
          <div><span>You pay daily</span><b>{money(t.dailyPaisa)}</b></div>
          <div><span>You collect</span><b>{money(pot)}</b></div>
        </div>
        <p className="hyper-note">
          Over the cycle you pay in {money(pot)} and you collect {money(pot)} once, on the day
          the ballot gives you.
        </p>
      </section>

      <section className="panel">
        <div className="panel-head"><div><h2>What it can cost you</h2></div></div>
        <div className="hyper-apr">
          <div>
            <span>Most you can ever be charged, all in</span>
            <b>{money(Math.floor(maxCost))}</b>
          </div>
          <div>
            <span>As a yearly rate at the earliest seat</span>
            <b>{percent(aprPct(maxCost, days, t.dailyPaisa))}</b>
          </div>
        </div>
        <p className="hyper-note">
          Paying daily makes small fees look large once they are annualised, so Halqa caps the
          total at {MAX_APR_PCT}% a year for the earliest seat. Every charge counts toward that
          cap, including cover and access fees.
        </p>
      </section>

      <section className="panel">
        <div className="panel-head"><div><h2>How your day is chosen</h2></div><Dices /></div>
        <ol className="hyper-ballot">
          <li>Halqa locks a sealed number and publishes its fingerprint before the draw.</li>
          <li>Every member taps once, and each tap adds to the randomness.</li>
          <li>The order comes out of the combined result.</li>
          <li>The sealed number is published afterwards, so anyone can recheck the draw.</li>
        </ol>
        <div className="hyper-never">
          <Lock />
          <div>
            <b>Days are never bought.</b>
            <span>There is no bidding and no picking. Paying for an earlier turn would be interest, so it does not exist here.</span>
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="panel-head"><div><h2>Who you are to everyone else</h2></div><Users /></div>
        <div className="hyper-roster">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className={i === 2 ? 'hyper-seat me' : 'hyper-seat'}>
              <b>Member #{i + 1}</b><span>{i === 2 ? 'this would be you' : `day ${i + 1}`}</span>
            </div>
          ))}
        </div>
        <p className="hyper-note">
          No names, no photos, no phone numbers and no group chat. Halqa runs the queue, so there
          is no organiser who could favour anyone.
        </p>
      </section>

      <button className="primary full" disabled={!eligible}>
        <Flame />{eligible ? 'Join the queue' : 'Not open to you yet'}
      </button>
      <p className="hyper-foot">
        Payment is collected automatically every day. You can leave free within 24 hours of the
        committee forming; after it starts, only a replacement can take your place.
      </p>
    </div>
  );
}
