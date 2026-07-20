// Pakistan-calibrated committee simulation — 100,000 members, seeded.
//
// Purpose: answer "what would REAL middle/lower-class Pakistani savers do?"
// far more honestly than a uniform random model. Members are drawn from five
// behavioural segments with income bands, payment discipline, income-shock
// exposure and seasonal pressure calibrated to public evidence:
//
//  - Income bands: urban lower/middle household income ~Rs 28k–90k/month
//    (PSLM / Labour Force Survey style bands; directional, not a dataset).
//  - Committee burden: contributions typically 8–15% of monthly income
//    (kameti practice; Oraan plans start at Rs 1,000/month).
//  - Discipline: ROSCA/kameti literature finds socially-embedded committees
//    default rarely (~1–3%) because of social enforcement; women-run home
//    committees are the most disciplined cohort (Oraan: 84% women savers).
//  - Seasonality: two Eid months and a school-fee month strain budgets.
//
// Two arms replay IDENTICAL seeded randomness over the same people:
//  A) PAPER committee — no reminders, no grace, no collateral, no portable
//     reputation, social/random turn order.
//  B) HALQA — smart reminders, the grace window, graduated deposits + 15%
//     payout holdback, credit-weighted ordering, ban/passport deterrence,
//     and 15% vault auto-cover adoption.
//
// This is a directional behavioural model, not an empirical backtest on real
// ledgers — no such public dataset exists. Every assumption is visible below.
export {}; // module scope — keeps this script's helpers out of the global namespace

function rng(seed: number) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

type Segment = { key: string; share: number; incomeLo: number; incomeHi: number; baseLateP: number; shockP: number; abscondHazard: number; discipline: number };
// share = population share; baseLateP = monthly lateness propensity before
// modifiers; shockP = monthly income-shock probability (job gap, medical,
// inflation spike); abscondHazard = monthly post-receipt abscond hazard WHEN
// stressed, in a paper committee; discipline = ordering-rank input.
const SEGMENTS: Segment[] = [
  { key: 'salaried_lower_middle', share: 0.30, incomeLo: 40000, incomeHi: 90000, baseLateP: 0.07, shockP: 0.05, abscondHazard: 0.020, discipline: 0.85 },
  { key: 'daily_wage_informal',   share: 0.25, incomeLo: 28000, incomeHi: 48000, baseLateP: 0.16, shockP: 0.14, abscondHazard: 0.045, discipline: 0.60 },
  { key: 'home_business_women',   share: 0.25, incomeLo: 30000, incomeHi: 60000, baseLateP: 0.05, shockP: 0.07, abscondHazard: 0.008, discipline: 0.95 },
  { key: 'young_gig_urban',       share: 0.12, incomeLo: 32000, incomeHi: 70000, baseLateP: 0.12, shockP: 0.10, abscondHazard: 0.060, discipline: 0.55 },
  { key: 'overcommitted',         share: 0.08, incomeLo: 28000, incomeHi: 55000, baseLateP: 0.28, shockP: 0.18, abscondHazard: 0.130, discipline: 0.30 },
];
const EID_MONTHS = [3, 9];
const SCHOOL_FEE_MONTH = 7;
const N = 100_000;
const SEED = 19470814;

type Member = { seg: Segment; income: number; contribution: number; burden: number; disciplineScore: number; hasVaultCover: boolean };
type ArmResult = { onTime: number; lateResolved: number; dropout: number; defaults: number; coveredFully: number; recoveredPaisa: number; exposedPaisa: number; perSeg: Record<string, { defaults: number }> };

function drawMembers(r: () => number): Member[] {
  const members: Member[] = [];
  for (let i = 0; i < N; i++) {
    let x = r(); let seg = SEGMENTS[0];
    for (const s of SEGMENTS) { if (x < s.share) { seg = s; break; } x -= s.share; }
    const income = seg.incomeLo + r() * (seg.incomeHi - seg.incomeLo);
    const burden = 0.08 + r() * 0.07; // 8–15% of income
    members.push({ seg, income, contribution: Math.max(1000, Math.round(income * burden / 500) * 500), burden, disciplineScore: seg.discipline + (r() - 0.5) * 0.2, hasVaultCover: r() < 0.15 });
  }
  return members;
}

function runArm(halqa: boolean): ArmResult {
  const r = rng(SEED); // identical draws in both arms
  const ms = drawMembers(r);
  const res: ArmResult = { onTime: 0, lateResolved: 0, dropout: 0, defaults: 0, coveredFully: 0, recoveredPaisa: 0, exposedPaisa: 0, perSeg: {} };
  for (const s of SEGMENTS) res.perSeg[s.key] = { defaults: 0 };
  let idx = 0;
  while (idx < ms.length) {
    const size = 8 + Math.floor(r() * 8); // committees of 8–15
    const group = ms.slice(idx, idx + size); idx += size;
    if (group.length < 3) break;
    // Halqa credit-weights the order (disciplined members carry the risky early
    // slots); a paper committee's order is social/arbitrary.
    const ordered = halqa ? [...group].sort((a, b) => b.disciplineScore - a.disciplineScore) : [...group];
    const n = ordered.length;
    const out = ordered.map(() => false);
    for (let round = 1; round <= n; round++) {
      const month = ((round - 1) % 12) + 1;
      for (let p = 0; p < n; p++) {
        // Burn identical randomness in both arms regardless of branch outcomes,
        // so arm differences come from the measures — never from luck drift.
        const uShock = r(), uLate = r(), uCover = r(), uHaz = r(), uDrop = r();
        if (out[p]) continue;
        const m = ordered[p];
        const received = p + 1 <= round;
        const shocked = uShock < m.seg.shockP * (month === SCHOOL_FEE_MONTH ? 1.4 : 1);
        let lateP = m.seg.baseLateP * (1 + Math.max(0, m.burden - 0.12) * 3);
        if (EID_MONTHS.includes(month)) lateP += 0.10;
        if (month === SCHOOL_FEE_MONTH) lateP += 0.06;
        if (shocked) lateP += 0.25;
        if (halqa) lateP *= 0.70; // smart reminders kill accidental lateness
        if (uLate >= clamp(lateP, 0.01, 0.9)) { res.onTime++; continue; }
        // Late this month.
        if (halqa && m.hasVaultCover && uCover < 0.8) { res.lateResolved++; continue; } // auto-cover settles it
        if (received && shocked) {
          let hazard = m.seg.abscondHazard;
          if (halqa) hazard *= 0.60; // ban + forfeiture + portable reputation deter walking away
          if (uHaz < hazard) {
            out[p] = true; res.defaults++; res.perSeg[m.seg.key].defaults++;
            const remaining = (n - round + 1) * m.contribution * 100;
            res.exposedPaisa += remaining;
            if (halqa) {
              // Recovery = graduated deposit (sized by position) + 15% holdback.
              const coverageBps = clamp(Math.round(7000 * (n - (p + 1)) / Math.max(1, n - 1)), 0, 9000);
              const deposit = (n - (p + 1)) * m.contribution * 100 * coverageBps / 10000;
              const holdback = 0.15 * n * m.contribution * 100;
              const recovered = Math.min(remaining, deposit + holdback);
              res.recoveredPaisa += recovered;
              if (recovered >= remaining) res.coveredFully++;
            }
            continue;
          }
        }
        if (!received && shocked && uDrop < (halqa ? 0.02 : 0.05)) { out[p] = true; res.dropout++; continue; }
        // Pays late: Halqa's grace window absorbs it (penalty + score hit, no
        // escalation); on paper it lingers as unresolved conflict either way.
        res.lateResolved++;
      }
    }
  }
  return res;
}

const A = runArm(false);
const B = runArm(true);
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
