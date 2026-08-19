import { Lock, Unlock } from 'lucide-react';
import { money, ordinal } from '../lib/format';

// ---------------------------------------------------------------------------
// Which turns a member may claim, and what would open the rest.
//
// The rules existed in score-bands.ts and were enforced silently: a member saw
// some seats greyed out and was told nothing. Being refused without a reason is
// the thing this product exists to replace, and "position 5 of 12" means
// nothing unless somebody explains why it is 5.
//
// Two separate gates, and members confuse them constantly, so they are shown
// separately:
//   the tenure quarantine, which every new member sits in whatever their score
//   the score band, which decides how early you may go once you are out of it
// ---------------------------------------------------------------------------

const CUTOFFS = { decent: 550, good: 650, excellent: 750 };
const REQUIRED_CLEAN = 2;

function bandOf(score: number) {
  if (score >= CUTOFFS.excellent) return 'EXCELLENT';
  if (score >= CUTOFFS.good) return 'GOOD';
  if (score >= CUTOFFS.decent) return 'DECENT';
  return 'REBUILDING';
}

function bandSeats(band: string, n: number): number[] {
  const all = Array.from({ length: n }, (_, i) => i + 1);
  if (band === 'EXCELLENT' || band === 'GOOD') return all;
  if (band === 'DECENT') return all.filter(k => k > Math.floor(n / 2));
  return all.filter(k => k > n - 3);
}

export function SeatEligibility({ creditScore, cleanCircles, members, contributionPaisa }:
  { creditScore: number; cleanCircles: number; members: number; contributionPaisa: string | number }) {
  const band = bandOf(creditScore);
  const inQuarantine = cleanCircles < REQUIRED_CLEAN;
  const byBand = bandSeats(band, members);
  const allowed = inQuarantine ? byBand.filter(k => k > members - 3) : byBand;
  const earliest = allowed.length ? Math.min(...allowed) : members;
  const c = Number(contributionPaisa) || 0;

  return (
    <section className="panel">
      <div className="panel-head">
        <div><h2>Turns you can take</h2><p>And what would open the earlier ones.</p></div>
        {inQuarantine ? <Lock /> : <Unlock />}
      </div>

      <div className="seat-map" role="img" aria-label="Turns available to you">
        {Array.from({ length: members }, (_, i) => {
          const k = i + 1;
          const open = allowed.includes(k);
          return (
            <span key={k} className={`seat-dot${open ? ' open' : ''}${k === earliest ? ' first' : ''}`} title={
              open ? `${ordinal(k)} turn: you can take this` : `${ordinal(k)} turn: not open to you yet`
            }>{k}</span>
          );
        })}
      </div>

      <p className="seat-line">
        You can take the <b>{ordinal(earliest)}</b> turn or later. At the {ordinal(earliest)} you
        would still owe <b>{money(c * (members - earliest))}</b> after collecting.
      </p>

      <div className="seat-gates">
        <div className={inQuarantine ? 'seat-gate' : 'seat-gate ok'}>
          <i />
          <div>
            <b>{inQuarantine ? 'You are new here' : 'Past the new-member limit'}</b>
            <span>
              {inQuarantine
                ? `Every new member takes one of the last three turns, whatever their score. ${REQUIRED_CLEAN - cleanCircles} more clean committee${REQUIRED_CLEAN - cleanCircles === 1 ? '' : 's'} opens the rest.`
                : 'You have completed enough committees cleanly, so your score decides now.'}
            </span>
          </div>
        </div>
        <div className={band === 'REBUILDING' ? 'seat-gate' : 'seat-gate ok'}>
          <i />
          <div>
            <b>Your score is {creditScore}</b>
            <span>
              {band === 'EXCELLENT' || band === 'GOOD' ? 'Any turn is open to you.'
                : band === 'DECENT' ? `At ${CUTOFFS.good} you could take any turn. For now, the second half.`
                : `At ${CUTOFFS.decent} you move to the second half of the order.`}
            </span>
          </div>
        </div>
      </div>

      <p className="seat-fine">
        An early turn is money now and payments later, so it is gated. A late turn is savings, so
        it is always open.
      </p>
    </section>
  );
}

export default SeatEligibility;
