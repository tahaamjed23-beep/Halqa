// ============================================================================
// HALQA — PAKISTAN 2025 AGENT-BASED COMMITTEE SIMULATION
// ----------------------------------------------------------------------------
// An agent-based model (ABM) of 120,000 committee members living calendar year
// 2025 month by month, calibrated to real, citable Pakistani datasets:
//
//   • Income structure ..... PBS HIES/PSLM household income quintiles; LFS
//                            2020-21 informal-employment share (~72% non-agri)
//   • 2025 calendar ........ Ramadan Mar 1–30 · Eid-ul-Fitr Mar 31 · Eid-ul-
//                            Adha Jun 7 · school admissions Aug/Sep + Jan ·
//                            monsoon floods Jul–Aug (Punjab/KP 2025) · wedding
//                            season Nov–Feb + Shawwal (Apr)
//   • 2025 rate path ....... SBP policy rate 13%→12% (Jan 27) → 11% (May 5),
//                            held 11% H2; money-market/deposit curves tracked
//   • 2025 inflation ....... PBS CPI YoY, low single digits H1, food uptick
//                            post-flood Sep–Oct
//   • Committee behaviour .. Oraan/TechCrunch (41% participation), PMN
//                            MicroWatch Dec-24 sector stats, ROSCA literature
//                            (Besley–Coate–Loury 1993: social collateral)
//
// DESIGN: dual-arm, identical-randomness. The same agents live the same 2025
// twice — Arm A (paper committee) vs Arm B (Halqa stack) — so outcome deltas
// are caused by the protections, not luck. Deterministic seed => reproducible.
// This is a calibrated model, NOT a backtest of real ledgers (none exist).
// Run: npx tsx tests/pakistan-2025-sim.ts
// ============================================================================
export {};

// ---------- deterministic PRNG (mulberry32) ----------
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const SEED = 20250101;

// Per-decision hashed randomness: every (committee, round, member, decision)
// gets its own deterministic uniform draw, so BOTH arms see the *exact same*
// event stream decision-for-decision. This is what makes month-level A→B
// comparisons meaningful — a shared sequential stream would desynchronise the
// moment the arms branch differently.
function hashRnd(a: number, b: number, c: number, d: number): number {
  let h = (SEED ^ 0x9E3779B9) >>> 0;
  for (const v of [a, b, c, d]) {
    h = Math.imul(h ^ (v + 0x7F4A7C15), 0x85EBCA6B) >>> 0;
    h = (h ^ (h >>> 13)) >>> 0;
  }
  h = Math.imul(h ^ (h >>> 16), 0xC2B2AE35) >>> 0;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

// ---------- the real 2025 calendar ----------
// cpiYoY: PBS CPI releases (approx, %). mmRate/depRate: Islamic money-market /
// Mudarabah deposit indicative annual %, tracking the SBP policy path.
type MonthCtx = {
  name: string; policy: number; mmRate: number; depRate: number; cpiYoY: number;
  ramadan?: boolean; eid?: 'FITR' | 'ADHA'; schoolFees?: boolean; flood?: boolean;
  weddingSeason?: boolean; winterBills?: boolean; summerBills?: boolean;
};
const MONTHS_2025: MonthCtx[] = [
  { name: 'Jan', policy: 12.0, mmRate: 12.6, depRate: 11.9, cpiYoY: 2.4, schoolFees: true, weddingSeason: true, winterBills: true },
  { name: 'Feb', policy: 12.0, mmRate: 12.2, depRate: 11.6, cpiYoY: 1.5, weddingSeason: true, winterBills: true },
  { name: 'Mar', policy: 12.0, mmRate: 12.0, depRate: 11.4, cpiYoY: 0.7, ramadan: true, eid: 'FITR' },
  { name: 'Apr', policy: 12.0, mmRate: 11.8, depRate: 11.2, cpiYoY: 0.3, weddingSeason: true },   // Shawwal weddings
  { name: 'May', policy: 11.0, mmRate: 11.4, depRate: 10.9, cpiYoY: 3.5 },
  { name: 'Jun', policy: 11.0, mmRate: 11.1, depRate: 10.7, cpiYoY: 3.2, eid: 'ADHA', summerBills: true },
  { name: 'Jul', policy: 11.0, mmRate: 11.0, depRate: 10.6, cpiYoY: 4.1, flood: true, summerBills: true },
  { name: 'Aug', policy: 11.0, mmRate: 11.0, depRate: 10.6, cpiYoY: 3.0, flood: true, schoolFees: true, summerBills: true },
  { name: 'Sep', policy: 11.0, mmRate: 10.9, depRate: 10.5, cpiYoY: 5.6, schoolFees: true },      // post-flood food spike
  { name: 'Oct', policy: 11.0, mmRate: 10.9, depRate: 10.5, cpiYoY: 6.2 },
  { name: 'Nov', policy: 11.0, mmRate: 10.8, depRate: 10.4, cpiYoY: 5.9, weddingSeason: true, winterBills: true },
  { name: 'Dec', policy: 11.0, mmRate: 10.8, depRate: 10.4, cpiYoY: 5.5, weddingSeason: true, winterBills: true },
];

// ---------- population segments (HIES/LFS-calibrated) ----------
type Segment = {
  key: string; share: number; incomeLo: number; incomeHi: number;
  baseLateP: number; shockP: number; abscondHazard: number; discipline: number;
  jobLossP: number; remittanceP: number; urban: number;
};
const SEGMENTS: Segment[] = [
  { key: 'salaried_lower_middle', share: 0.30, incomeLo: 40_000, incomeHi: 90_000,  baseLateP: 0.07, shockP: 0.05, abscondHazard: 0.020, discipline: 0.85, jobLossP: 0.004, remittanceP: 0.06, urban: 0.75 },
  { key: 'daily_wage_informal',   share: 0.25, incomeLo: 28_000, incomeHi: 48_000,  baseLateP: 0.16, shockP: 0.13, abscondHazard: 0.060, discipline: 0.66, jobLossP: 0.015, remittanceP: 0.09, urban: 0.55 },
  { key: 'home_business_women',   share: 0.25, incomeLo: 30_000, incomeHi: 60_000,  baseLateP: 0.09, shockP: 0.08, abscondHazard: 0.012, discipline: 0.88, jobLossP: 0.006, remittanceP: 0.12, urban: 0.60 },
  { key: 'young_gig_urban',       share: 0.12, incomeLo: 35_000, incomeHi: 70_000,  baseLateP: 0.13, shockP: 0.10, abscondHazard: 0.050, discipline: 0.72, jobLossP: 0.012, remittanceP: 0.04, urban: 0.95 },
  { key: 'overcommitted',         share: 0.08, incomeLo: 30_000, incomeHi: 65_000,  baseLateP: 0.24, shockP: 0.18, abscondHazard: 0.140, discipline: 0.50, jobLossP: 0.012, remittanceP: 0.05, urban: 0.70 },
];

// ---------- life-event cost model (× monthly income) ----------
// Hazards are monthly; costs are lognormal-ish draws expressed as a multiple
// of the household's monthly income (HIES out-of-pocket patterns).
const LIFE_EVENTS = {
  medical:        { hazard: 0.016, costLo: 0.3, costHi: 2.5 },   // OOP health shock
  funeral:        { hazard: 0.004, costLo: 0.5, costHi: 1.5 },
  weddingGuest:   { hazard: 0.10,  costLo: 0.05, costHi: 0.20 }, // salami/clothes, wedding-season months only
  ownWedding:     { costLo: 4.0, costHi: 10.0 },                 // hosted shaadi: 4–10 months of income
  floodDamage:    { hazard: 0.055, costLo: 0.5, costHi: 3.0 },   // flood months, weighted to non-urban
};

// ---------- agents ----------
type Agent = {
  seg: number; income: number; discipline: number; urban: boolean;
  weddingMonth: number; // -1 none; else 0..11 — a hosted family shaadi in 2025
  buffer: number;       // months of income in liquid savings
};
const N = 120_000;
function buildAgents(): Agent[] {
  const rnd = mulberry32(SEED); // population is IDENTICAL for both arms
  const agents: Agent[] = [];
  for (const [si, s] of SEGMENTS.entries()) {
    const count = Math.round(N * s.share);
    for (let i = 0; i < count; i++) {
      const income = s.incomeLo + (s.incomeHi - s.incomeLo) * rnd();
      // ~9% of households host a wedding in a given year (PSLM household size
      // & marriage-rate arithmetic); skew scheduled into wedding-season months.
      let weddingMonth = -1;
      if (rnd() < 0.09) {
        const seasonal = [0, 1, 3, 10, 11];
        weddingMonth = rnd() < 0.7 ? seasonal[Math.floor(rnd() * seasonal.length)] : Math.floor(rnd() * 12);
      }
      agents.push({
        seg: si, income, discipline: s.discipline + (rnd() - 0.5) * 0.2,
        urban: rnd() < s.urban, weddingMonth,
        buffer: 0.2 + rnd() * (si === 0 ? 1.5 : si === 4 ? 0.4 : 0.9),
      });
    }
  }
  return agents;
}

// ---------- committees ----------
type Committee = { members: number[]; contribution: number; startMonth: number; size: number; positions: number[] };
function buildCommittees(agents: Agent[]): Committee[] {
  const rnd = mulberry32(SEED + 7);
  // Group by income decile so contribution burden is realistic (8–15%).
  const idx = agents.map((_, i) => i).sort((a, b) => agents[a].income - agents[b].income);
  const committees: Committee[] = [];
  let cursor = 0;
  while (cursor < idx.length - 7) {
    const size = 8 + Math.floor(rnd() * 8);               // 8–15 members
    const members = idx.slice(cursor, cursor + size);
    if (members.length < 8) break;
    cursor += size;
    const medianIncome = agents[members[Math.floor(members.length / 2)]].income;
    const burden = 0.08 + rnd() * 0.07;                   // 8–15% of income
    const contribution = Math.round(medianIncome * burden / 500) * 500;
    const startMonth = Math.floor(rnd() * 4);             // circles start Jan–Apr
    committees.push({ members, contribution, startMonth, size, positions: [] });
  }
  return committees;
}

// ---------- one arm ----------
type ArmResult = {
  onTime: number; late: number; missed: number; totalPayments: number;
  dropoutsPre: number; defaultersPost: number; exposure: number; recovered: number; fullyCovered: number;
  bySegmentDefault: number[]; bySegmentMembers: number[];
  monthlyDefaults: number[]; monthlyLateRate: number[]; monthlyPayments: number[];
  weddingFunded: number; weddingTotal: number;
  memberYieldPaisaTotal: number; // float+deposit yield accrued to members (Halqa arm only)
};
function runArm(halqa: boolean, agents: Agent[], committees: Committee[]): ArmResult {
  const res: ArmResult = {
    onTime: 0, late: 0, missed: 0, totalPayments: 0, dropoutsPre: 0, defaultersPost: 0,
    exposure: 0, recovered: 0, fullyCovered: 0,
    bySegmentDefault: SEGMENTS.map(() => 0), bySegmentMembers: SEGMENTS.map(() => 0),
    monthlyDefaults: MONTHS_2025.map(() => 0), monthlyLateRate: MONTHS_2025.map(() => 0), monthlyPayments: MONTHS_2025.map(() => 0),
    weddingFunded: 0, weddingTotal: 0, memberYieldPaisaTotal: 0,
  };
  const monthlyLateCount = MONTHS_2025.map(() => 0);

  for (const [ci, c] of committees.entries()) {
    // Turn order: Halqa = credit-weighted (discipline desc); paper = arbitrary
    // (deterministic per-committee shuffle, independent of the event stream).
    const order = [...c.members];
    if (halqa) order.sort((a, b) => agents[b].discipline - agents[a].discipline);
    else {
      const srnd = mulberry32(SEED + 1000 + ci);
      for (let i = order.length - 1; i > 0; i--) { const j = Math.floor(srnd() * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; }
    }
    for (const m of c.members) res.bySegmentMembers[agents[m].seg]++;

    const received = new Set<number>();
    const defaulted = new Set<number>();
    const missStreak = new Map<number, number>();
    const pot = c.contribution * c.size;
    let weddingSaver = -1;
    for (const m of c.members) if (agents[m].weddingMonth >= 0 && weddingSaver === -1) { weddingSaver = m; res.weddingTotal++; }

    for (let r = 0; r < c.size; r++) {
      const mIdx = (c.startMonth + r) % 12;
      if (c.startMonth + r >= 12) break; // calendar year ends
      const M = MONTHS_2025[mIdx];
      const recipient = order[r];
      // decision-id helper: same draw for the same (committee, round, member,
      // decision) in BOTH arms — the event stream is truly paired.
      const D = (m: number, decision: number) => hashRnd(ci, r, m, decision);

      for (const m of c.members) {
        if (defaulted.has(m)) continue;
        const a = agents[m];
        const s = SEGMENTS[a.seg];
        res.totalPayments++; res.monthlyPayments[mIdx]++;

        // --- month stress: burden + seasonality + life events (identical across arms) ---
        const burden = c.contribution / a.income;
        let stress = burden * 2.2;
        if (M.ramadan || M.eid) stress += 0.10;
        if (M.eid === 'ADHA') stress += 0.05;                                   // qurbani
        if (M.schoolFees) stress += 0.06;
        if (M.winterBills || M.summerBills) stress += 0.03;
        if (M.weddingSeason && D(m, 1) < LIFE_EVENTS.weddingGuest.hazard) stress += 0.04;
        if (D(m, 2) < LIFE_EVENTS.medical.hazard) stress += 0.5 * (LIFE_EVENTS.medical.costLo + D(m, 21) * (LIFE_EVENTS.medical.costHi - LIFE_EVENTS.medical.costLo)) * burden * 3;
        if (D(m, 3) < LIFE_EVENTS.funeral.hazard) stress += 0.10;
        if (M.flood && D(m, 4) < LIFE_EVENTS.floodDamage.hazard * (a.urban ? 0.5 : 1.6)) stress += 0.25;
        if (a.weddingMonth === mIdx) stress += 0.30;                            // hosting a shaadi
        if (D(m, 5) < s.jobLossP) stress += 0.60;
        if (D(m, 6) < s.remittanceP) stress -= 0.08;                            // remittance eases the month
        stress += (D(m, 7) - 0.5) * 0.05;

        // --- lateness ---
        let lateP = s.baseLateP * (0.6 + stress) * (1.15 - a.discipline * 0.5);
        if (halqa) lateP *= 0.70;                                               // reminders + streak incentive
        lateP = Math.max(0.005, Math.min(0.85, lateP));

        if (D(m, 8) < lateP) {
          monthlyLateCount[mIdx]++;
          // does the late resolve inside the month (grace / social / auto-cover)?
          let resolveP = 0.75 + a.discipline * 0.15;
          if (halqa) {
            resolveP = Math.min(0.98, resolveP + 0.10);                         // hidden grace + nudges
            if (D(m, 10) < 0.15) resolveP = Math.min(0.995, resolveP + 0.8 * (1 - resolveP)); // 15% auto-cover adoption
          }
          if (D(m, 9) < resolveP) { res.late++; missStreak.set(m, 0); }
          else {
            res.missed++;
            const streak = (missStreak.get(m) ?? 0) + 1;
            missStreak.set(m, streak);
            // dropout only on a SECOND unresolved miss (one bad month happens
            // to honest people; persistence is what signals exit).
            if (streak >= 2 && !received.has(m)) { defaulted.add(m); res.dropoutsPre++; }
          }
        } else { res.onTime++; missStreak.set(m, 0); }
      }

      // --- post-payout abscond decision by this round's recipient ---
      if (!defaulted.has(recipient)) {
        received.add(recipient);
        const a = agents[recipient];
        const s = SEGMENTS[a.seg];
        const remaining = c.contribution * (c.size - r - 1);
        const temptation = remaining / (a.income * (1 + a.buffer));
        let hazard = s.abscondHazard * Math.min(2.2, 0.4 + temptation) * (1.2 - a.discipline * 0.6);
        if (M.flood) hazard *= 1.3;
        if (halqa) hazard *= 0.60;                                              // ban + passport deterrence
        if (remaining > 0 && D(recipient, 11) < hazard) {
          defaulted.add(recipient);
          res.defaultersPost++; res.monthlyDefaults[mIdx]++;
          res.bySegmentDefault[a.seg]++;
          res.exposure += remaining;
          if (halqa) {
            // recovery = graduated deposit (70% base curve at this position) + 15% holdback
            const coverage = Math.min(0.75, 0.70 * (c.size - r - 1) / (c.size - 1));
            const rec = Math.min(remaining, remaining * coverage + pot * 0.15);
            res.recovered += rec;
            if (rec >= remaining * 0.999) res.fullyCovered++;
          }
        }
      }
      // --- Halqa arm: member yield accrual at the REAL 2025 rate curve ---
      if (halqa) {
        const floatYield = pot * (M.mmRate / 100) * (24 / 365);                 // ~24 avg idle days
        const depositBase = pot * 0.35;                                         // graduated deposits outstanding ≈ 35% of pot
        const depYield = depositBase * (M.depRate / 100) * (30 / 365);
        res.memberYieldPaisaTotal += (floatYield + depYield) * 0.95;            // net of 5% Mudarib share
      }
    }
    if (weddingSaver >= 0 && !defaulted.has(weddingSaver) && received.has(weddingSaver)) res.weddingFunded++;
  }
  for (let i = 0; i < 12; i++) res.monthlyLateRate[i] = res.monthlyPayments[i] ? monthlyLateCount[i] / res.monthlyPayments[i] : 0;
  return res;
}

// ---------- run & report ----------
const agents = buildAgents();
const committees = buildCommittees(agents);
const A = runArm(false, agents, committees);
const B = runArm(true, agents, committees);

const pct = (x: number, d = 2) => (x * 100).toFixed(d) + '%';
const rs = (x: number) => 'Rs ' + Math.round(x).toLocaleString('en-US');

console.log('='.repeat(76));
console.log('HALQA — PAKISTAN 2025 AGENT-BASED SIMULATION  (seed ' + SEED + ', N=' + agents.length.toLocaleString() + ')');
console.log('Committees: ' + committees.length.toLocaleString() + ' · sizes 8–15 · burden 8–15% of income · real 2025 calendar & SBP rate path');
console.log('='.repeat(76));

function report(label: string, r: ArmResult, halqa: boolean) {
  console.log('\n--- ' + label + ' ---');
  console.log('  On-time payments            ' + pct(r.onTime / r.totalPayments));
  console.log('  Late (resolved)             ' + pct(r.late / r.totalPayments));
  console.log('  Missed (unresolved)         ' + pct(r.missed / r.totalPayments));
  console.log('  Pre-receipt dropouts        ' + r.dropoutsPre.toLocaleString() + '  (' + pct(r.dropoutsPre / agents.length) + ' of members)');
  console.log('  POST-PAYOUT DEFAULTERS      ' + r.defaultersPost.toLocaleString() + '  (' + pct(r.defaultersPost / agents.length) + ' of members)');
  console.log('  Recovery on default         ' + (halqa ? pct(r.recovered / Math.max(1, r.exposure), 1) : '0.0% (no collateral exists)'));
  console.log('  Defaults fully collateralised ' + (halqa ? pct(r.fullyCovered / Math.max(1, r.defaultersPost), 1) : '0.0%'));
  console.log('  Wedding-goal circles funded ' + r.weddingFunded.toLocaleString() + ' / ' + r.weddingTotal.toLocaleString() + '  (' + pct(r.weddingFunded / Math.max(1, r.weddingTotal), 1) + ')');
  if (halqa) console.log('  Member yield created (net)  ' + rs(r.memberYieldPaisaTotal) + '  (float @2025 MM curve + deposits @2025 Mudarabah curve)');
  console.log('  Default rate by segment:');
  for (const [i, s] of SEGMENTS.entries())
    console.log('    ' + s.key.padEnd(24) + pct(r.bySegmentDefault[i] / Math.max(1, r.bySegmentMembers[i])));
}
report('ARM A — paper committee (2025)', A, false);
report('ARM B — Halqa (2025)', B, true);

console.log('\n--- 2025 MONTH-BY-MONTH (defaults · late-rate, Arm A → Arm B) ---');
for (let i = 0; i < 12; i++) {
  const M = MONTHS_2025[i];
  const tags = [M.ramadan ? 'Ramadan' : '', M.eid === 'FITR' ? 'Eid-ul-Fitr' : '', M.eid === 'ADHA' ? 'Eid-ul-Adha' : '',
    M.schoolFees ? 'school-fees' : '', M.flood ? 'MONSOON-FLOOD' : '', M.weddingSeason ? 'weddings' : ''].filter(Boolean).join(', ');
  console.log('  ' + M.name + '  policy ' + M.policy.toFixed(1) + '% · CPI ' + M.cpiYoY.toFixed(1) + '%'
    + ' · defaults ' + String(A.monthlyDefaults[i]).padStart(4) + ' → ' + String(B.monthlyDefaults[i]).padStart(4)
    + ' · late ' + pct(A.monthlyLateRate[i], 1).padStart(6) + ' → ' + pct(B.monthlyLateRate[i], 1).padStart(6)
    + (tags ? '   [' + tags + ']' : ''));
}

console.log('\n--- HEADLINES (paper → Halqa, calendar 2025) ---');
console.log('  Post-payout default rate   ' + pct(A.defaultersPost / agents.length) + ' → ' + pct(B.defaultersPost / agents.length)
  + '  (' + (A.defaultersPost / Math.max(1, B.defaultersPost)).toFixed(1) + 'x reduction)');
console.log('  Recovery on default        0% → ' + pct(B.recovered / Math.max(1, B.exposure), 1));
console.log('  On-time payments           ' + pct(A.onTime / A.totalPayments, 1) + ' → ' + pct(B.onTime / B.totalPayments, 1));
console.log('  Pre-receipt dropouts       ' + pct(A.dropoutsPre / agents.length) + ' → ' + pct(B.dropoutsPre / agents.length));
console.log('  Wedding funds completed    ' + pct(A.weddingFunded / Math.max(1, A.weddingTotal), 1) + ' → ' + pct(B.weddingFunded / Math.max(1, B.weddingTotal), 1));
console.log('\nHonest caveats: agent-based model calibrated to published statistics (PBS');
console.log('HIES/LFS bands, SBP 2025 rate path, PBS CPI 2025, 2025 Islamic calendar,');
console.log('monsoon-2025 flood incidence, PMN MicroWatch) — synthetic agents, not a');
console.log('backtest of real committee ledgers (no such public dataset exists).');
