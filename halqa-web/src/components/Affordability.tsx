import { Wallet } from 'lucide-react';
import { money, percent } from '../lib/format';

// ---------------------------------------------------------------------------
// What a member can carry, shown as headroom rather than as a refusal.
//
// Mirrors halqa-api/src/lib/affordability.ts.
//
// The point of a committee is that a large sum becomes affordable by spreading
// it: a member on Rs 30,000 a month can collect a Rs 30,000 pot, because across
// twelve members that is Rs 2,500 a month. The pot size is never the test. So
// this screen leads with what a member could collect, not with a limit.
//
// Strictness is aimed where members actually get into trouble: holding four or
// five committees at once, not one they can plainly pay for.
// ---------------------------------------------------------------------------

export function Affordability({ monthlyIncomeP, committedMonthlyP, activeCircles, verified }:
  { monthlyIncomeP: number; committedMonthlyP: number; activeCircles: number; verified: boolean }) {
  const cap = monthlyIncomeP * 0.33;
  const used = Math.min(cap, committedMonthlyP);
  const headroom = Math.max(0, cap - committedMonthlyP);
  const concurrent = verified ? 6 : 1;
  const left = Math.max(0, concurrent - activeCircles);
  // What the headroom buys at a few common lengths. This is the number that
  // makes the point, and it is the one members were never shown.
  const pots = [6, 12, 24].map(months => ({ months, pot: headroom * months }));
  const watched = activeCircles >= 3;

  if (monthlyIncomeP <= 0) {
    return (
      <section className="panel">
        <div className="panel-head"><div><h2>How much you can take on</h2></div><Wallet /></div>
        <p className="afford-note">
          Tell Halqa your monthly income and it will show you exactly how much committee you can
          carry, instead of stopping you at the door.
        </p>
      </section>
    );
  }

  return (
    <section className="panel">
      <div className="panel-head"><div><h2>How much you can take on</h2></div><Wallet /></div>

      <div className="afford-bar">
        <i style={{ width: `${(used / cap) * 100}%` }} />
      </div>
      <div className="afford-legend">
        <span>{money(committedMonthlyP)} committed</span>
        <span>{money(cap)} limit</span>
      </div>

      <div className="detail-grid">
        <div><span>Room left each month</span><b>{money(headroom)}</b></div>
        <div><span>Committees left</span><b>{left}</b></div>
        <div><span>Of your income</span><b>{percent((committedMonthlyP / monthlyIncomeP) * 100)}</b></div>
      </div>

      {headroom > 0 && (
        <div className="afford-pots">
          <span className="afford-pots-lead">Spread over more months, that same room collects:</span>
          <div className="detail-grid">
            {pots.map(p => (
              <div key={p.months}><span>{p.months} months</span><b>{money(p.pot)}</b></div>
            ))}
          </div>
        </div>
      )}

      <p className="afford-note">
        {headroom > 0 && left > 0
          ? `You can take ${left === 1 ? 'one more committee' : `${left} more committees`} up to ${money(headroom)} a month.`
          : headroom <= 0
            ? 'Your committees already use the income Halqa can see.'
            : `You are at your limit of ${concurrent} committee${concurrent > 1 ? 's' : ''} at once.`}
      </p>
      {!verified && (
        <p className="afford-note">
          Verifying your income lets you run up to four committees at once, and lowers what Halqa
          charges you by up to 80 per cent.
        </p>
      )}
      {watched && (
        <p className="afford-note">
          You are running {activeCircles} committees. From the fourth, Halqa also looks at how
          healthy each circle is and how much you are carrying at once, not just this month's cost.
        </p>
      )}
      <p className="afford-fine">
        Halqa keeps committees under a third of your income, and looks no further than that until
        your fourth. A good record opens up earlier turns and more committees, but never a bigger
        amount: only new proof of income does that.
      </p>
    </section>
  );
}

export default Affordability;
