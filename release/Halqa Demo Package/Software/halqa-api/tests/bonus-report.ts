import { allocateCyclePool } from '../src/lib/distribution';
import { slotFeeBpsForRound } from '../src/lib/partner-catalog';
import { earlyBirdFactor, patienceWeightTenths, qualifiesEarlyBird, roundFloatProfit } from '../src/lib/sukoon';

// Per-position bonus report for the 12-women reference group, using the exact
// engine functions. Prints early / middle / last / max for each configuration.
const MEMBERS = 12, CONTRIBUTION = 1_166_700n, PERIOD_DAYS = 30, DAY = 86_400_000;
const POOL = CONTRIBUTION * BigInt(MEMBERS);
const FLOAT_RATE = 10.8, DEPOSIT_RATE = 11.2, FEE_BPS = 1000;

type Cfg = { earlyFee: boolean; engine: boolean; patience: boolean; pooled: boolean };

function simulate(c: Cfg): bigint[] {
  const start = Date.UTC(2026, 0, 1);
  const completion = start + (MEMBERS * PERIOD_DAYS + 7) * DAY;
  let netFloat = 0n; const fees: bigint[] = [];
  for (let r = 1; r <= MEMBERS; r++) {
    const payoutDate = new Date(start + (r * PERIOD_DAYS + 7) * DAY);
    const paidAt = new Date(r === 1 ? start : start + ((r - 1) * PERIOD_DAYS + 7) * DAY);
    if (c.engine) {
      const g = roundFloatProfit(Array.from({ length: MEMBERS }, () => ({ amountPaisa: CONTRIBUTION, paidAt })), FLOAT_RATE, payoutDate);
      netFloat += g - g * 5n / 100n;
    }
    fees.push(c.earlyFee ? POOL * BigInt(slotFeeBpsForRound(FEE_BPS, r, MEMBERS)) / 10_000n : 0n);
  }
  let depositYield = 0n;
  if (c.engine) {
    const yBps = BigInt(Math.round(DEPOSIT_RATE * 100)), heldDays = BigInt(Math.ceil((completion - start) / DAY));
    for (let pos = 1; pos <= MEMBERS; pos++) {
      const coverageBps = Math.max(0, Math.min(9000, Math.round(7000 * (MEMBERS - pos) / (MEMBERS - 1))));
      depositYield += (CONTRIBUTION * BigInt(MEMBERS - pos) * BigInt(coverageBps) / 10_000n) * yBps * heldDays / 3_650_000n;
    }
  }
  const pool = netFloat + depositYield + (c.pooled ? fees.reduce((a, b) => a + b, 0n) : 0n);
  const accounts = Array.from({ length: MEMBERS }, (_, i) => {
    const pos = i + 1; let capDays = 0n;
    for (let r = 1; r <= MEMBERS; r++) { const paidDay = r === 1 ? 0 : (r - 1) * PERIOD_DAYS + 7; capDays += CONTRIBUTION * BigInt(Math.ceil((MEMBERS * PERIOD_DAYS + 7) - paidDay)); }
    const tilt = c.patience ? patienceWeightTenths(pos, MEMBERS) : 10n;
    const boost = c.engine ? earlyBirdFactor(qualifiesEarlyBird(MEMBERS, MEMBERS)) : 4n;
    return { userId: `p${pos}`, paidPrincipalPaisa: CONTRIBUTION * BigInt(MEMBERS), capitalDays: capDays * tilt * boost };
  });
  const split = allocateCyclePool(pool, 0n, accounts);
  return Array.from({ length: MEMBERS }, (_, i) => {
    const pos = i + 1; let div = 0n;
    if (c.earlyFee && !c.pooled) for (let r = 1; r <= MEMBERS; r++) if (r !== pos) div += fees[r - 1] / BigInt(MEMBERS - 1);
    return split[i].profitPaisa + div - fees[pos - 1];
  });
}

const rs = (p: bigint) => 'Rs ' + (Number(p) / 100).toLocaleString('en-US', { maximumFractionDigits: 0 });
const configs: [string, Cfg][] = [
  ['Classic (no engine)', { earlyFee: false, engine: false, patience: false, pooled: false }],
  ['Sukoon (earn only)', { earlyFee: false, engine: true, patience: false, pooled: false }],
  ['Bazaar (earn + patience)', { earlyFee: false, engine: true, patience: true, pooled: false }],
  ['Priority (10% fee only)', { earlyFee: true, engine: false, patience: false, pooled: false }],
  ['Sigma monthly (fee + engine)', { earlyFee: true, engine: true, patience: true, pooled: false }],
  ['Sigma POOLED (fee + engine)', { earlyFee: true, engine: true, patience: true, pooled: true }],
];
console.log('Config'.padEnd(32), 'Pos#1'.padStart(10), 'Pos#6'.padStart(10), 'Pos#12'.padStart(10), 'MAX'.padStart(10), 'GroupTot'.padStart(11));
for (const [name, cfg] of configs) {
  const b = simulate(cfg);
  const max = b.reduce((a, x) => x > a ? x : a);
  const tot = b.reduce((a, x) => a + x, 0n);
  console.log(name.padEnd(32), rs(b[0]).padStart(10), rs(b[5]).padStart(10), rs(b[11]).padStart(10), rs(max).padStart(10), rs(tot).padStart(11));
}
