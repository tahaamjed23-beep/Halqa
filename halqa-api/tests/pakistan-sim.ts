// Printable runner for the Pakistan-calibrated committee simulation.
// Core model lives in lib-pakistan-sim.ts (shared with the CI test).
// Run: npx tsx tests/pakistan-sim.ts
import { ArmResult, SEGMENTS, runArm } from './lib-pakistan-sim';

const N = 100_000;
const SEED = 19470814;
const A = runArm(N, SEED, false);
const B = runArm(N, SEED, true);

const pct = (x: number, base: number) => (x / base * 100).toFixed(2) + '%';
function report(label: string, a: ArmResult) {
  const obligations = a.onTime + a.lateResolved;
  console.log(`\n=== ${label} ===`);
  console.log(`  On-time payments               ${pct(a.onTime, obligations)}`);
  console.log(`  Late (resolved / covered)      ${pct(a.lateResolved, obligations)}`);
  console.log(`  Pre-receipt dropouts           ${a.dropout.toLocaleString()} members (${pct(a.dropout, N)})`);
  console.log(`  POST-RECEIPT DEFAULTERS        ${a.defaults.toLocaleString()} members (${pct(a.defaults, N)})`);
  if (a.defaults) {
    console.log(`  Avg recovery on default        ${a.exposedPaisa ? (a.recoveredPaisa / a.exposedPaisa * 100).toFixed(1) : '0.0'}% of exposure`);
    console.log(`  Defaults fully collateralised  ${(a.coveredFully / a.defaults * 100).toFixed(1)}%`);
  }
  console.log('  Default rate by segment:');
  for (const s of SEGMENTS) console.log(`    ${s.key.padEnd(24)} ${(a.perSeg[s.key].defaults / Math.round(N * s.share) * 100).toFixed(2)}%`);
}
console.log('Pakistan-calibrated committee simulation — 100,000 members, seed ' + SEED + ' (reproducible)');
console.log('Segments: salaried 30% · daily-wage 25% · home-business women 25% · gig 12% · overcommitted 8%');
console.log('Stressors: 2 Eid months, school-fee month, income shocks, contribution burden 8–15% of income');
report('ARM A — paper committee (no protections, arbitrary order)', A);
report('ARM B — Halqa (reminders, grace, collateral, credit-weighted order, deterrence, 15% auto-cover)', B);
console.log('\nHonest caveats: directional behavioural model calibrated to public evidence (PSLM-style income');
console.log('bands, kameti/ROSCA literature, the Oraan case study) — not an empirical backtest on real ledgers.');
