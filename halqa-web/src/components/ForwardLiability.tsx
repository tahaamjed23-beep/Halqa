import { useMemo, useState } from 'react';
import { TrendingDown } from 'lucide-react';
import { money, ordinal } from '../lib/format';

// ---------------------------------------------------------------------------
// L(k) — what a seat actually commits you to.
//
// The server has computed forward liability since the beginning and no screen
// ever showed it. It is the single most important number in the model: it is
// why an early seat is a loan and a late seat is savings, why early seats are
// gated, and why the deposit curve exists. A member picking a seat was being
// asked to take on a number nobody told them.
//
//   L(k) = c x (n - k)
//
// After collecting at seat k you still owe one contribution for every round
// that remains. Seat 1 owes the most; the last seat owes nothing.
// ---------------------------------------------------------------------------

type Props = {
  contributionPaisa: string | number;
  members: number;
  /** The member's own seat, when they have one. */
  seat?: number | null;
};

export function ForwardLiability({ contributionPaisa, members, seat }: Props) {
  const c = Number(contributionPaisa) || 0;
  const n = Math.max(1, members);
  const [hover, setHover] = useState<number | null>(null);

  const rows = useMemo(
    () => Array.from({ length: n }, (_, i) => {
      const k = i + 1;
      return { k, owed: c * (n - k), collects: c * n };
    }),
    [c, n],
  );

  const shown = hover ?? seat ?? 1;
  const row = rows[Math.min(rows.length, Math.max(1, shown)) - 1];
  const max = rows[0].owed || 1;

  return (
    <section className="panel">
      <div className="panel-head">
        <div>
          <h2>What each turn commits you to</h2>
          <p>After you collect, you still pay in for every round that is left.</p>
        </div>
        <TrendingDown />
      </div>

      <div className="lk-callout">
        <div>
          <span>{ordinal(row.k)} turn collects</span>
          <b>{money(row.collects)}</b>
        </div>
        <div>
          <span>and still owes afterwards</span>
          <b className={row.owed ? 'lk-owed' : 'lk-clear'}>{money(row.owed)}</b>
        </div>
      </div>

      <div className="lk-bars" role="img" aria-label="Amount still owed after collecting, by turn">
        {rows.map(r => (
          <button
            key={r.k}
            className={`lk-bar${r.k === shown ? ' on' : ''}${seat === r.k ? ' mine' : ''}`}
            style={{ height: `${Math.max(4, (r.owed / max) * 100)}%` }}
            onMouseEnter={() => setHover(r.k)}
            onMouseLeave={() => setHover(null)}
            onFocus={() => setHover(r.k)}
            onBlur={() => setHover(null)}
            title={`${ordinal(r.k)} turn: owes ${money(r.owed)} after collecting`}
            aria-label={`${ordinal(r.k)} turn owes ${money(r.owed)} after collecting`}
          />
        ))}
      </div>
      <div className="lk-axis"><span>first turn</span><span>last turn</span></div>

      <p className="lk-note">
        The first turn is money now and payments later, so it works like a loan.
        The last turn is payments first and money at the end, so it works like saving.
        {seat ? ` Yours is the ${ordinal(seat)}.` : ''}
      </p>
    </section>
  );
}

export default ForwardLiability;
