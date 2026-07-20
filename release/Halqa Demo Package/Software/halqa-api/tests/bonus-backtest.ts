import { allocateCyclePool } from '../src/lib/distribution';
import { slotFeeBpsForRound } from '../src/lib/partner-catalog';
import { earlyBirdFactor, patienceWeightTenths, qualifiesEarlyBird, roundFloatProfit } from '../src/lib/sukoon';

// Backtest of the Rs 15,000 promise (12 women, Rs 140,004 pool, Sigma pooled)
// under rate stress and realistic payment behaviour — the engine's own
// integer math, swept across scenarios instead of the single disciplined case.
const MEMBERS = 12, CONTRIBUTION = 1_166_700n, PERIOD = 30, DAY = 86_400_000;
const POOL = CONTRIBUTION * BigInt(MEMBERS);
const FEE_BPS = 1000;

function maxBonus(floatRate: number, depositRate: number, payDaysBeforeDue: number, earlyBird: boolean): bigint {
  const start = Date.UTC(2026, 0, 1);
  let netFloat = 0n; const fees: bigint[] = [];
  for (let r = 1; r <= MEMBERS; r++) {
    const due = start + r * PERIOD * DAY;
    const payoutDate = new Date(due + 7 * DAY);
    const paidAt = new Date(due - payDaysBeforeDue * DAY);
    const gross = roundFloatProfit(Array.from({ length: MEMBERS }, () => ({ amountPaisa: CONTRIBUTION, paidAt })), floatRate, payoutDate);
    netFloat += gross - gross * 5n / 100n;
    fees.push(POOL * BigInt(slotFeeBpsForRound(FEE_BPS, r, MEMBERS)) / 10_000n);
  }
  let depositYield = 0n;
  const yBps = BigInt(Math.round(depositRate * 100));
  const heldDays = BigInt(MEMBERS * PERIOD + 7);
  for (let pos = 1; pos <= MEMBERS; pos++) {
    const covBps = Math.max(0, Math.min(9000, Math.round(7000 * (MEMBERS - pos) / (MEMBERS - 1))));
    depositYield += (CONTRIBUTION * BigInt(MEMBERS - pos) * BigInt(covBps) / 10_000n) * yBps * heldDays / 3_650_000n;
  }
  const pool = netFloat + depositYield + fees.reduce((a, b) => a + b, 0n);
  const accounts = Array.from({ length: MEMBERS }, (_, i) => {
    const pos = i + 1;
    let capDays = 0n;
    for (let r = 1; r <= MEMBERS; r++) capDays += CONTRIBUTION * BigInt(Math.max(1, MEMBERS * PERIOD + 7 - (r * PERIOD - payDaysBeforeDue)));
    const tilt = patienceWeightTenths(pos, MEMBERS);
    const boost = earlyBirdFactor(qualifiesEarlyBird(earlyBird ? MEMBERS : 0, MEMBERS));
    return { userId: `p${pos}`, paidPrincipalPaisa: CONTRIBUTION * BigInt(MEMBERS), capitalDays: capDays * tilt * boost };
  });
  const split = allocateCyclePool(pool, 0n, accounts);
  // Last position: pays no fee, takes the top patience share.
  return split[MEMBERS - 1].profitPaisa - fees[MEMBERS - 1];
}

const rs = (p: bigint) => 'Rs ' + (Number(p) / 100).toLocaleString('en-US', { maximumFractionDigits: 0 });
const rates: [string, number, number][] = [['rates −30%', 10.8 * 0.7, 11.2 * 0.7], ['rates base', 10.8, 11.2], ['rates +20%', 10.8 * 1.2, 11.2 * 1.2]];
const behaviours: [string, number, boolean][] = [
  ['pay at round open (~30d float)', 30, true],
  ['pay 10 days before due', 10, true],
  ['pay 3 days before due (early-bird holds)', 3, true],
  ['pay on the due date (no early-bird)', 0, false],
];
console.log('Backtest — max annual bonus (Sigma pooled, best position), 12 × Rs 140,004 pool, fee fixed 10%');
console.log('Behaviour \\ Rates'.padEnd(44), rates.map(r => r[0].padStart(12)).join(''));
for (const [bLabel, days, eb] of behaviours) {
  const row = rates.map(([, f, d]) => rs(maxBonus(f, d, days, eb)).padStart(12)).join('');
  console.log(bLabel.padEnd(44), row);
}
console.log('\nReading: the Rs 15,000 promise needs day-one payers at current rates. Slower payers shrink the');
console.log('float; rate cuts shrink both engines. The fee floor (~Rs 9,334 through the patience split) holds');
console.log('regardless — the fee is member-to-member and rate-independent. Indicative, never guaranteed.');
