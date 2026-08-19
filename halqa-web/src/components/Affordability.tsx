import { Wallet } from 'lucide-react';
import { money, percent } from '../lib/format';

// ---------------------------------------------------------------------------
// What a member can carry, shown as headroom rather than as a refusal.
//
// Mirrors halqa-api/src/lib/affordability.ts. Halqa is stricter than the
// regulator here: SBP caps consumer debt service at 40% of income, and
// committees are held to 33% on their own, because a committee instalment
// outranks rent and the loss lands on eleven neighbours rather than a bank.
//
// The rule that matters most: good history never raises the money cap. It
// unlocks seats and lowers friction. Only new income evidence raises the cap,
// because escalating limits are what cause liquidity defaults.
// ---------------------------------------------------------------------------

export function Affordability({ monthlyIncomeP, committedMonthlyP, activeCircles, verified }:
  { monthlyIncomeP: number; committedMonthlyP: number; activeCircles: number; verified: boolean }) {
  const cap = monthlyIncomeP * 0.33;
  const used = Math.min(cap, committedMonthlyP);
  const headroom = Math.max(0, cap - committedMonthlyP);
  const concurrent = verified ? 4 : 1;
  const left = Math.max(0, concurrent - activeCircles);

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
      <p className="afford-fine">
        Halqa keeps committees under a third of your income. A good record opens up earlier turns
        and more committees, but never a bigger amount: only new proof of income does that.
      </p>
    </section>
  );
}

export default Affordability;
