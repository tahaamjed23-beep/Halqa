// Core of the Pakistan-calibrated committee simulation — importable by both
// the printable script (pakistan-sim.ts) and the CI test (pakistan-sim.test.ts).
//
// Design contract (what the test asserts):
//  - Deterministic: same seed → identical results, run after run.
//  - Paired arms: paper vs Halqa replay IDENTICAL randomness (same people,
//    same shocks); differences are caused by the modelled measures only.
//  - Calibration is visible: every behavioural assumption is a named constant.
//
// Calibration anchors (directional, stated honestly):
//  - Income bands ~Rs 28k–90k/month: urban lower/middle household bands in the
//    spirit of PSLM / Labour Force Survey groupings.
//  - Contribution burden 8–15% of income: typical kameti practice; Oraan's
//    plans start at Rs 1,000/month.
//  - Segment discipline: ROSCA/kameti literature (e.g., Besley–Coate–Loury
//    tradition) finds socially-embedded committees default rarely; women-run
//    home committees are the most disciplined cohort (Oraan: 84% women).
//  - Seasonality: two Eid months and a school-fee month strain budgets.

export function rng(seed: number) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

export type Segment = { key: string; share: number; incomeLo: number; incomeHi: number; baseLateP: number; shockP: number; abscondHazard: number; discipline: number };
export const SEGMENTS: Segment[] = [
  // share · income band (Rs/mo) · monthly lateness propensity · monthly income-shock p ·
  // post-receipt abscond hazard when stressed (paper baseline) · discipline rank
  { key: 'salaried_lower_middle', share: 0.30, incomeLo: 40000, incomeHi: 90000, baseLateP: 0.07, shockP: 0.05, abscondHazard: 0.020, discipline: 0.85 },
  { key: 'daily_wage_informal',   share: 0.25, incomeLo: 28000, incomeHi: 48000, baseLateP: 0.16, shockP: 0.14, abscondHazard: 0.045, discipline: 0.60 },
  { key: 'home_business_women',   share: 0.25, incomeLo: 30000, incomeHi: 60000, baseLateP: 0.05, shockP: 0.07, abscondHazard: 0.008, discipline: 0.95 },
  { key: 'young_gig_urban',       share: 0.12, incomeLo: 32000, incomeHi: 70000, baseLateP: 0.12, shockP: 0.10, abscondHazard: 0.060, discipline: 0.55 },
  { key: 'overcommitted',         share: 0.08, incomeLo: 28000, incomeHi: 55000, baseLateP: 0.28, shockP: 0.18, abscondHazard: 0.130, discipline: 0.30 },
];
export const EID_MONTHS = [3, 9];
export const SCHOOL_FEE_MONTH = 7;

// Halqa-measure effects (each one maps to a real, shipped mechanism):
export const REMINDER_LATENESS_CUT = 0.70;   // smart nudges: accidental lateness ×0.70
export const DETERRENCE_FACTOR = 0.60;       // ban + forfeiture + portable passport: abscond hazard ×0.60
export const AUTO_COVER_ADOPTION = 0.15;     // opt-in vault auto-cover share of members
export const AUTO_COVER_EFFECT = 0.80;       // covered months resolved without escalation
export const PRE_RECEIPT_DROP_P = { paper: 0.05, halqa: 0.02 }; // shocked pre-receipt walkaway
export const HOLDBACK_RATE = 0.15;           // payout holdback retained
export const DEPOSIT_CURVE_BPS = 7000;       // graduated deposit coverage — the DEFAULT of the host-set 30–90% range (2026-07-14)

export type Member = { seg: Segment; income: number; contribution: number; burden: number; disciplineScore: number; hasVaultCover: boolean };
export type ArmResult = { onTime: number; lateResolved: number; dropout: number; defaults: number; coveredFully: number; recoveredPaisa: number; exposedPaisa: number; perSeg: Record<string, { defaults: number }> };

export function drawMembers(n: number, r: () => number): Member[] {
  const members: Member[] = [];
  for (let i = 0; i < n; i++) {
    let x = r(); let seg = SEGMENTS[0];
    for (const s of SEGMENTS) { if (x < s.share) { seg = s; break; } x -= s.share; }
    const income = seg.incomeLo + r() * (seg.incomeHi - seg.incomeLo);
    const burden = 0.08 + r() * 0.07;
    members.push({ seg, income, contribution: Math.max(1000, Math.round(income * burden / 500) * 500), burden, disciplineScore: seg.discipline + (r() - 0.5) * 0.2, hasVaultCover: r() < AUTO_COVER_ADOPTION });
  }
  return members;
}

export function runArm(n: number, seed: number, halqa: boolean): ArmResult {
  const r = rng(seed);
  const ms = drawMembers(n, r);
  const res: ArmResult = { onTime: 0, lateResolved: 0, dropout: 0, defaults: 0, coveredFully: 0, recoveredPaisa: 0, exposedPaisa: 0, perSeg: {} };
  for (const s of SEGMENTS) res.perSeg[s.key] = { defaults: 0 };
  let idx = 0;
  while (idx < ms.length) {
    const size = 8 + Math.floor(r() * 8); // committees of 8–15
    const group = ms.slice(idx, idx + size); idx += size;
    if (group.length < 3) break;
    const ordered = halqa ? [...group].sort((a, b) => b.disciplineScore - a.disciplineScore) : [...group];
    const nG = ordered.length;
    const out = ordered.map(() => false);
    for (let round = 1; round <= nG; round++) {
      const month = ((round - 1) % 12) + 1;
      for (let p = 0; p < nG; p++) {
        // Burn identical randomness in both arms regardless of branch outcomes.
        const uShock = r(), uLate = r(), uCover = r(), uHaz = r(), uDrop = r();
        if (out[p]) continue;
        const m = ordered[p];
        const received = p + 1 <= round;
        const shocked = uShock < m.seg.shockP * (month === SCHOOL_FEE_MONTH ? 1.4 : 1);
        let lateP = m.seg.baseLateP * (1 + Math.max(0, m.burden - 0.12) * 3);
        if (EID_MONTHS.includes(month)) lateP += 0.10;
        if (month === SCHOOL_FEE_MONTH) lateP += 0.06;
        if (shocked) lateP += 0.25;
        if (halqa) lateP *= REMINDER_LATENESS_CUT;
        if (uLate >= clamp(lateP, 0.01, 0.9)) { res.onTime++; continue; }
        if (halqa && m.hasVaultCover && uCover < AUTO_COVER_EFFECT) { res.lateResolved++; continue; }
        if (received && shocked) {
          let hazard = m.seg.abscondHazard;
          if (halqa) hazard *= DETERRENCE_FACTOR;
          if (uHaz < hazard) {
            out[p] = true; res.defaults++; res.perSeg[m.seg.key].defaults++;
            const remaining = (nG - round + 1) * m.contribution * 100;
            res.exposedPaisa += remaining;
            if (halqa) {
              const coverageBps = clamp(Math.round(DEPOSIT_CURVE_BPS * (nG - (p + 1)) / Math.max(1, nG - 1)), 0, 7500);
              const deposit = (nG - (p + 1)) * m.contribution * 100 * coverageBps / 10000;
              const holdback = HOLDBACK_RATE * nG * m.contribution * 100;
              const recovered = Math.min(remaining, deposit + holdback);
              res.recoveredPaisa += recovered;
              if (recovered >= remaining) res.coveredFully++;
            }
            continue;
          }
        }
        if (!received && shocked && uDrop < (halqa ? PRE_RECEIPT_DROP_P.halqa : PRE_RECEIPT_DROP_P.paper)) { out[p] = true; res.dropout++; continue; }
        res.lateResolved++;
      }
    }
  }
  return res;
}
