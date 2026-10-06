import { CalendarClock, Check, Lock, TrendingUp, Users } from 'lucide-react';
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
//
// Rebuilt 23 September 2026. It was a grid of twelve small numbered squares,
// a paragraph, and two identical bordered boxes with a coloured dot: every
// element the same weight, nothing to land on, no answer visible without
// reading. It now leads with the answer as a single large figure, draws the
// order as a strip the member can actually read their position off, and states
// each gate as a row with an icon that says at a glance whether it is passed.
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
  const owedAfter = c * (members - earliest);
  const tenurePassed = !inQuarantine;
  const scoreOpen = band === 'EXCELLENT' || band === 'GOOD';

  return (
    <section className="seat">
      {/* The answer, before the explanation. A member opens this screen to find
          out how early they can go, so that is the largest thing on it. */}
      <div className="seat-hero">
        <span className="seat-hero-lab">The earliest turn open to you</span>
        <strong className="seat-hero-fig">{ordinal(earliest)}</strong>
        <span className="seat-hero-of">of {members}</span>
        <p className="seat-hero-note">
          {owedAfter > 0
            ? <>Take it and you would still owe <b>{money(owedAfter)}</b> to the circle afterwards.</>
            : <>Nothing would remain owing to the circle afterwards.</>}
        </p>
      </div>

      {/* The order, drawn as the run of turns it is. Open turns carry the brand
          fill, the earliest one is marked, and the rest are plainly shut rather
          than a slightly paler version of the same square. */}
      <div className="seat-strip" role="img"
           aria-label={`Turns ${allowed.join(', ')} of ${members} are open to you`}>
        {Array.from({ length: members }, (_, i) => {
          const k = i + 1;
          const open = allowed.includes(k);
          return (
            // No title: the strip above is one image with one description, so
            // a reader is already told which turns are open and never reaches
            // the pips. The browser's own tooltip could be neither dismissed
            // nor held open, which is what WCAG 1.4.13 asks for, and it was
            // repeating what the strip's own label already says.
            <span key={k}
              className={`seat-pip${open ? ' open' : ''}${k === earliest ? ' first' : ''}`}>
              {k}
            </span>
          );
        })}
      </div>
      <p className="seat-key">
        <span><i className="on" />Open to you</span>
        <span><i />Not yet</span>
      </p>

      {/* The two gates, each as one row that answers itself in its icon. */}
      <div className="seat-gates">
        <div className={`seat-gate${tenurePassed ? ' pass' : ''}`}>
          <span className="seat-gate-ic">{tenurePassed ? <Check /> : <Users />}</span>
          <span className="seat-gate-txt">
            <b>{tenurePassed ? 'Past the new member limit' : 'You are new here'}</b>
            <span>
              {tenurePassed
                ? 'Two circles completed cleanly, so your score decides from here.'
                : `Every new member takes one of the last three turns, whatever their score. ${REQUIRED_CLEAN - cleanCircles} more clean committee${REQUIRED_CLEAN - cleanCircles === 1 ? '' : 's'} opens the rest.`}
            </span>
          </span>
          {!tenurePassed && <span className="seat-gate-tag">{cleanCircles} of {REQUIRED_CLEAN}</span>}
        </div>

        <div className={`seat-gate${scoreOpen ? ' pass' : ''}`}>
          <span className="seat-gate-ic">{scoreOpen ? <Check /> : <TrendingUp />}</span>
          <span className="seat-gate-txt">
            <b>Your credit score</b>
            <span>
              {scoreOpen ? 'High enough for any turn in this circle.'
                : band === 'DECENT' ? `Reach ${CUTOFFS.good} and any turn opens. For now, the second half.`
                : `Reach ${CUTOFFS.decent} and you move to the second half of the order.`}
            </span>
          </span>
          <span className="seat-gate-tag num">{creditScore}</span>
        </div>

        <div className="seat-gate pass">
          <span className="seat-gate-ic"><CalendarClock /></span>
          <span className="seat-gate-txt">
            <b>Order is fixed once the circle starts</b>
            <span>Nothing reorders you afterwards. A swap needs the other member and the host to agree.</span>
          </span>
        </div>
      </div>

      {!scoreOpen && (
        <p className="seat-foot">
          <Lock /> Turns 1 to {earliest - 1} are closed to you in this circle.
        </p>
      )}
    </section>
  );
}

export default SeatEligibility;
