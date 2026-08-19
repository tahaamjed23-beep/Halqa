import { useMemo, useState } from 'react';
import { ChevronLeft, Flame, Gavel, Info, ShieldAlert, Wallet } from 'lucide-react';
import type { User } from '../types';
import { money, percent } from '../lib/format';

// ---------------------------------------------------------------------------
// HYPER: 30 days, Rs 500 a day, a Rs 15,000 pot, seven members collecting each
// day, so 210 in the circle. What a member pays in over the cycle is exactly
// what they collect, which is what makes it a committee and not a scheme.
//
// Members buy their collection day at a 24-hour opening auction. An early day
// is a real advance of cash, so it costs something; the last days are worth
// nothing and clear at nil.
//
// THE BID CEILING is the part that matters. A premium for an early day is a
// cost of money, and daily cadence turns small rupee figures into very large
// annual rates. Every bid is therefore capped where the member's all-in cost
// reaches 48% a year. On day 1 that lands at about Rs 276; by the last week it
// is a few rupees. Mirrors halqa-api/src/lib/hyper.ts, which enforces it.
// ---------------------------------------------------------------------------

const DAYS = 30;
const DAILY_PAISA = 50_000;      // Rs 500
const POT_PAISA = 1_500_000;     // Rs 15,000
const SEATS_PER_DAY = 7;
const ROSTER = SEATS_PER_DAY * DAYS;
const MIN_SCORE = 650;
const MIN_CLEAN = 2;
const MIN_VAULT_PAISA = 1_500_000;
const MAX_APR_PCT = 48;

const advance = (day: number) => Math.max(0, POT_PAISA - DAILY_PAISA * day);
const outstanding = (day: number) => Math.max(0, DAYS - day);

/** The hard cap the server enforces on a bid for this day. */
function maxBid(day: number) {
  const a = advance(day), o = outstanding(day);
  if (a <= 0 || o <= 0) return 0;
  return (MAX_APR_PCT * a * o) / (2 * 365 * 100);
}
function bidApr(premium: number, day: number) {
  const a = advance(day), o = outstanding(day);
  if (a <= 0 || o <= 0 || premium <= 0) return 0;
  return (premium * 2 * 365 * 100) / (a * o);
}

export default function HyperPage({ user, back }: { user: User; back: () => void }) {
  const [day, setDay] = useState<number | null>(null);
  const [bid, setBid] = useState('');
  const [placed, setPlaced] = useState<{ day: number; amount: number } | null>(null);

  // Standing book. Early days fill first because they are worth the most.
  const book = useMemo(() => Array.from({ length: DAYS }, (_, i) => {
    const d = i + 1;
    const taken = d <= 4 ? SEATS_PER_DAY : d <= 10 ? Math.floor(SEATS_PER_DAY / 2) : 0;
    return { d, taken, top: Math.round((maxBid(d) * 2) / 3), cap: maxBid(d), full: taken >= SEATS_PER_DAY };
  }), []);

  const hasVault = false; // vault balance is not on the user record yet
  const gates = [
    { ok: user.creditScore >= MIN_SCORE, label: `Score ${MIN_SCORE} or above`, have: `You are at ${user.creditScore}` },
    { ok: (user.committeesCompletedClean || 0) >= MIN_CLEAN, label: `${MIN_CLEAN} clean completed committees`, have: `You have ${user.committeesCompletedClean || 0}` },
    { ok: Boolean(user.incomeVerifiedAt), label: 'Salary slip on file', have: user.incomeVerifiedAt ? 'Verified' : 'Not uploaded yet' },
    { ok: Boolean(user.incomeVerifiedAt) || hasVault, label: 'Daily earnings, or a vault balance', have: `Vault minimum is ${money(MIN_VAULT_PAISA)}` },
    { ok: Boolean(user.hasVerifiedRaast), label: 'Verified Raast credential', have: user.hasVerifiedRaast ? 'On file' : 'Not linked yet' },
  ];
  const eligible = gates.every(g => g.ok);

  const chosen = book.find(x => x.d === day) || null;
  const bidNum = Number(bid || 0) * 100;         // entered in rupees, held in paisa
  const overCap = Boolean(chosen && bidNum > chosen.cap);
  const tooLow = Boolean(chosen && bidNum <= chosen.top);

  return (
    <div className="page narrow enter">
      <button className="back-link" onClick={back}><ChevronLeft />Back</button>
      <div className="page-head">
        <div>
          <span className="eyebrow">Daily committee</span>
          <h1>HYPER</h1>
          <p>Rs 500 a day for 30 days. You collect Rs 15,000 on the day you win.</p>
        </div>
      </div>

      <section className="panel hyper-hero">
        <div className="hyper-hero-top"><Flame /><span>30 days · {ROSTER} members · {SEATS_PER_DAY} collect a day</span></div>
        <b className="hyper-hero-pot">{money(POT_PAISA)}</b>
        <div className="detail-grid">
          <div><span>You pay daily</span><b>{money(DAILY_PAISA)}</b></div>
          <div><span>Over the cycle</span><b>{money(DAILY_PAISA * DAYS)}</b></div>
          <div><span>You collect</span><b>{money(POT_PAISA)}</b></div>
        </div>
        <p className="hyper-note">
          What you pay in over the 30 days is exactly what you collect. The only thing that
          changes is when you get it.
        </p>
      </section>

      <section className="panel hyper-risk">
        <div className="hyper-risk-head"><ShieldAlert /><b>Read this first</b></div>
        <p>
          In an ordinary committee you know the others, and that is what makes people pay. Here
          you do not. So HYPER is the most tightly gated product on Halqa, and it collects from
          you automatically every single day.
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

      {/* The auction, with the ceiling stated before anyone bids. */}
      <section className="panel">
        <div className="panel-head">
          <div><h2>Bid for your day</h2><p>An earlier day means cash sooner, so it costs more.</p></div>
          <Gavel />
        </div>
        <div className="hyper-cap">
          <Info />
          <div>
            <b>Halqa caps every bid.</b>
            <span>
              A bid for an early day is a cost of money. We stop it at {MAX_APR_PCT}% a year,
              which is {money(Math.round(maxBid(1)))} on day one and almost nothing by the end.
            </span>
          </div>
        </div>

        <div className="hyper-days">
          {book.map(x => (
            <button
              key={x.d}
              className={`hyper-day${day === x.d ? ' on' : ''}${x.full ? ' full' : ''}`}
              disabled={x.full || !eligible}
              onClick={() => { setDay(x.d); setBid(String(Math.ceil((x.top + 50) / 100))); }}
            >
              <span className="hyper-day-n"><b>{x.d}</b><small>day</small></span>
              <span className="hyper-day-body">
                <b>Collect {money(POT_PAISA)}</b>
                <small>{x.full ? 'full' : `${SEATS_PER_DAY - x.taken} of ${SEATS_PER_DAY} left`} · you still owe {money(DAILY_PAISA * outstanding(x.d))} after</small>
              </span>
              <span className="hyper-day-bid">
                <b>{x.top ? money(x.top) : 'No bid'}</b>
                <small>max {money(Math.round(x.cap))}</small>
              </span>
            </button>
          ))}
        </div>
      </section>

      {chosen && (
        <section className="panel">
          <div className="panel-head"><div><h2>Your bid for day {chosen.d}</h2></div></div>
          <div className="amt-input hyper-bid-input">
            <i>Rs</i>
            <input inputMode="numeric" value={bid} onChange={e => setBid(e.target.value.replace(/\D/g, ''))} aria-label="Your bid in rupees" />
          </div>
          <div className="detail-grid">
            <div><span>Standing bid</span><b>{money(chosen.top)}</b></div>
            <div><span>Most allowed</span><b>{money(Math.round(chosen.cap))}</b></div>
            <div><span>Your bid as a yearly rate</span><b>{percent(bidApr(bidNum, chosen.d))}</b></div>
          </div>
          {overCap && <div className="error-box">That is above the {MAX_APR_PCT}% ceiling for day {chosen.d}. The most allowed is {money(Math.round(chosen.cap))}.</div>}
          {!overCap && tooLow && <div className="warning-box">Your bid must beat the standing bid of {money(chosen.top)}.</div>}
          <button className="primary full" disabled={overCap || tooLow} onClick={() => setPlaced({ day: chosen.d, amount: bidNum })}>
            <Gavel />Place bid
          </button>
          <p className="hyper-note">You are charged only if you are still the highest bidder when the auction closes.</p>
        </section>
      )}

      {placed && (
        <div className="market-rules">
          <Wallet />
          <div>
            <b>Bid placed on day {placed.day}</b>
            <p>{money(placed.amount)} standing. Nothing is charged unless you win the day.</p>
          </div>
        </div>
      )}
    </div>
  );
}
