# HALQA — Master Execution Plan
Date: 2026-07-07 · Author: Claude (post full-system rescan)
Companion docs: MARKET-REALITY-AND-SYSTEM-AUDIT.md (sourced market research),
STRATEGY-AND-PARTNERSHIP-PATH.md (Oraan analysis + partnership research).
This doc is the single actionable plan. Everything below reflects the code as
it exists TODAY (rescanned 2026-07-07), not an aspiration.

---

## 1. Where the system actually stands (verified by code scan + typecheck)

The build has advanced far beyond the original prototype. Verified present:

**Backend (halqa-api, compiles clean as of today — I fixed 3 TS errors in
routes/risk.ts that broke the production build):**
- Three committee modes with allocation caps: ROTATING (≤25% invest),
  HYBRID (≤75%), INVESTMENT (50–100%, turn-sale disabled).
- 35-scheme catalog (lib/scheme-catalog.ts) with per-scheme riskScore,
  liquidityDays, volatilityBps, creditRiskBps, shariahCompliant flag,
  source URL + rate-as-of date. Mode-based risk caps (ROTATING → schemes
  risk ≤3 only).
- Risk engine (lib/risk-engine.ts, model HALQA-RM-2.0.0): 6-factor scored
  assessment (credit, behavior, market, liquidity mismatch, allocation,
  concentration) with mitigation credit, expected-loss bps, required
  deposit coverage, and plain-language recommendations. Stress projections
  with downside/expected/upside.
- Strategy catalog: all 100 previously-proposed options triaged in code as
  ACTIVE/GUARDED/REJECTED/DEFERRED with recorded conflict-resolution
  reasoning (e.g. rejected: stablecoin farming, app-native microloans,
  interest-on-late-payments, blockchain escrow, credit-bureau reporting).
  This matches the market-reality audit's recommendations.
- Profit engine (lib/profit-engine.ts): time-weighted capital-days math
  (explicitly avoids the "full principal invested day one" illusion),
  CONSERVATIVE/TARGET/UPSIDE scenarios, platform fee bps, tax withholding,
  expected-loss deduction, reserve haircuts, target-profit feasibility gap.
- Capital-days profit distribution (lib/distribution.ts): profit split by
  how long each member's money actually sat in the pool. This IS the fix
  for the documented last-receiver inflation unfairness — later receivers
  accrue more capital-days and get a larger profit share. Deterministic
  remainder handling.
- Protection center (routes/protection.ts): security deposits with accrued
  yield, payout holdbacks, protection commitments (optional guarantor
  [score ≥700], promissory-note ref, auto-debit ref, explicit terms
  acceptance), host verification of commitments, rate-limited peer nudges,
  default-impact figures per member.
- Recovery/rehabilitation: open recovery cases; defaulter repays
  outstanding + penalty + 10% rehabilitation fee → ban lifted with a
  6-month cooldown; cooldown + score ≥550 gates on joining.
- Risk policy per committee (routes/risk.ts): host-set policy (buffers,
  reserves, penalties, guarantor requirements, profit targets) stored as
  hashed JSON; members give explicit consent tied to the policy hash —
  changing policy invalidates consent. This is genuinely good design.

**Frontend (halqa-web, compiles clean):** restructured into pages/
(Auth, Home, Circles, Committee, CreateCircle, Marketplace, Profile,
Terminal, Shell) + components (RiskConsole, ProtectionCenter,
ProjectionChart, ui). Distinctive warm gold/cream/dark-ink design system
(40KB CSS) — sidebar layout, gold orb motifs, risk dials, protection
tables, Shariah toggle, portfolio lab. No longer the generic "AI blue"
look.

**Still missing / weak (the real gap list):**
1. **~~No scheduler.~~ RESOLVED 2026-07-06/07 (verified by code read):**
   `src/services/delinquency.ts` runs hourly via node-cron from `server.ts`
   — reminders, late/missed marking, idempotent credit deltas, post-receipt
   default → ban + deposit/holdback forfeiture + recovery case + guarantor
   consequence. Holdback release is event-driven on clean payment
   (`routes/payments.ts`); deposit refunds fire at cycle completion
   (`routes/committees.ts` payout path).
2. **No KYC capture flow** (CNIC upload/OCR/selfie) — schema fields exist,
   no UI/endpoints. Hosting in production requires kycLevel 2 which nothing
   can currently grant.
3. **No end-to-end test of the new engines** — capital-days distribution,
   holdbacks, recovery flow have unit-style logic but the full
   multi-round lifecycle with the new protection features has not been
   exercised the way the old flow was.
4. **Rates in scheme-catalog are dated 2026-05-13** — two months stale.
   Per the market audit, verified July numbers exist (SBP 11.5% policy
   rate, NSC 13.2–13.7%). Needs a refresh pass + the "rates last verified"
   line in every UI surface.
5. **No host reputation surfacing** (cycles completed, on-time %) on
   join screens — the single most market-validated trust feature per the
   Rs 420M fraud case analysis.
6. **No Capacitor wrap / distribution** — still browser-only.
7. **Figma design source inaccessible** — the file at
   figma.com/design/S6ZQ5VMBkmKKwLvj6AogTz needs edit access granted to
   the connected Figma account before it can drive the UI.

---

## 2. Investment model — what "actually useful" means now (build order)

The engines exist. What makes them *useful to the average user* (per the
market audit: low/middle-income, trust-first, not yield-chasing):

1. **Refresh + date-stamp every rate** (gap #4). An investment feature
   quoting stale rates is worse than none — it's the fastest way to look
   like a scam. Add `rates verified [date] · source` to every projection.
2. **Cadence→tenor auto-matching in the create wizard.** The catalog has
   liquidityDays/tenorDays and the risk engine penalizes mismatch — but the
   UI should simply *hide* schemes whose liquidity horizon exceeds the
   committee period minus the 7-day buffer. Prevents the
   364-day-bill-in-30-day-committee foot-gun instead of just scoring it.
3. **The honest headline number.** Lead every projection with the REAL
   framing: "protects ~X Rs of your payout's purchasing power vs a
   traditional committee" (inflation-erosion offset), with the nominal
   profit as the secondary number. The capital-days distribution is the
   differentiator — show each member "your share grows the longer your
   money works," which doubles as an on-time-payment incentive.
4. **Ladder execution for LONG cadence** (engine supports the math;
   deployment logic should split across 91/182/364-day legs maturing
   before each payout date).
5. **Cross-committee pooled placement** — design the schema now (a
   PoolPlacement entity aggregating slices from many committees), execute
   only at Stage 2 with the custody partner. This is where "better
   returns" genuinely comes from at scale: institutional placement size,
   not higher risk.
6. **Fee floor waiver:** take no platform profit fee when a member's cycle
   profit is below a small threshold (e.g. Rs 200). Trivial revenue loss,
   large trust gain.

## 3. Anti-defaulter — final stack (most of it is now built)

Built and active in code: credit-weighted order · security deposits with
yield · payout holdbacks with staged release · guarantor commitments ·
promissory/auto-debit references · peer + smart nudges · feature lock on
default · recovery cases with rehabilitation fee + 6-month cooldown ·
join gates (score ≥550, cooldown, ban) · post-receipt penalty points ·
risk-scored deposit requirements.

Remaining, in priority order:
1. **The scheduler** (gap #1) — without it none of the above fires
   automatically. node-cron job evaluating: dueDate passed → LATE +
   penalty; grace passed → MISSED + credit hit; post-receipt missed →
   recovery case + ban; payout+N on-time payments → holdback release;
   cycle complete → deposit refund + yield. Idempotent via CreditEvent
   unique keys (already in schema).
2. **Oraan-style position-priced priority fee** (from the strategy doc):
   early payout slots pay a small non-refundable fee into the committee's
   default reserve. Complements deposits; simpler mental model. The
   insuranceReserveBps field already exists — this funds it.
3. **Host reputation card** (gap #5) — deterrence through selection:
   defaulters can't get invited if hosts can see reliability history.

## 4. What makes Halqa unlike BOTH committees and mutual funds (innovation bets)

Ranked by (impact × feasibility ÷ regulatory pain). These are the "something
new for the Pakistani economy" — none are offered by Oraan or any AMC:

**BET 1 — Gold-unit committees ("Sona Halqa").** Contributions in PKR
convert to grams of gold at that day's rate; the pot is denominated in
grams, paid out at payout-day value. Structurally immunizes the
last-receiver against PKR erosion (the documented #1 flaw) using the one
asset every Pakistani household already trusts. Shariah-clean (asset, not
riba). Oraan sells gold savings and committees as SEPARATE products —
combining them is the genuinely new instrument. Needs: a licensed digital
gold provider at Stage 2; simulate now. Honest caveat: gold can fall too —
show two-sided history, never "guaranteed."

**BET 2 — The Halqa Credit Passport.** ~100M Pakistanis have committee
payment history and zero credit-bureau footprint. Export a member's
verified Halqa history (cycles completed, on-time %, volumes) as a
shareable, QR-verifiable document / API. Near-term: helps users get
rentals, jobs, microfinance. Long-term: THIS is the business — licensing
informal-savings credit data to licensed lenders (with consent) is a
moat no committee app or mutual fund has. Costs almost nothing to start
(a signed PDF + verification endpoint).

**BET 3 — Goal-locked committees with vendor payouts.** Committee whose
payout routes (optionally) to a partner vendor at a group discount:
solar installations (pot-sized ticket, self-funding via bill savings),
university fees (Oraan's SNPL proves demand), Hajj/Umrah packages,
wedding services, motorcycle dealers. Halqa earns a vendor-side referral
margin instead of squeezing members. Turns the app from a savings tool
into a purchasing-power network.

**BET 4 — Takaful-style mutual default pool.** The insurance reserve
reframed as tabarru (mutual donation) with transparent governance —
Shariah-native default insurance without an insurance license fight at
small scale (legal review still required before charging for it).

## 5. Partners — ranked best to worst (Pakistan-specific, researched)

1. **Neem** (SECP-licensed NBFC, BaaS/embedded-finance APIs, existing bank
   partnerships) — the right first door. One integration gets custody +
   wallets without becoming a bank's enterprise-sales hostage.
2. **SBP Regulatory Sandbox** (not a partner — the parallel regulatory
   track; cohorts active since the May-2025 guidelines, 6-month controlled
   tests). Apply with the working Stage-1 ledger as the demo.
3. **Meezan Bank** — largest Islamic bank; the single strongest trust/
   Shariah credibility signal possible for this demographic; has
   Mudarabah deposit products that map directly to the catalog. Slower,
   enterprise-paced.
4. **Telenor Microfinance Bank (Easypaisa)** — massive wallet reach,
   microfinance license, proven fintech-partnership behavior (BISP
   disbursements). Distribution more than custody.
5. **Mobilink Microfinance Bank (JazzCash)** — same profile as Easypaisa,
   largest wallet base; interchangeable as #4/#5, pick whoever engages.
6. **Al Meezan Investment Management** — for the investment leg only:
   Shariah money-market fund execution for pooled placements. Pair with a
   custody partner, not a substitute for one.
7. **CDC (Central Depository Company / Emlaak)** — mutual-fund
   aggregation rails; a plausible execution channel for the scheme
   catalog.
8. **SadaPay / NayaPay** — EMI wallets, modern APIs, young-user brands;
   but EMIs can't hold investments and are payments-only. Collections UX,
   later.
9. **Big-five commercial banks (HBL, UBL, MCB, Alfalah, NBP)** — strongest
   balance sheets, slowest processes, least incentive to move for a
   pre-traction startup. Approach only with traction or via the sandbox.
10. **Crypto/VASP-adjacent providers** — rejected. Regulatory posture in
    PK makes any stablecoin-yield custody partnership a liability, and it
    contradicts the trust positioning entirely.

Sequence: real users on Stage-1 ledger → sandbox application → Neem
conversation → Meezan/Easypaisa once volume exists. Raast is the eventual
collection rail (free, API-based, SBP-owned) — via whichever partner.

## 6. Design status ("less AI-looking")

Already substantially solved in the current build: the UI moved from the
generic Apple-blue clone to a warm gold/cream/dark-ink identity with orb
motifs, risk dials, and a sidebar layout — that IS a distinctive product
face. Remaining design work:
1. **Unblock Figma**: grant edit access on the shared file
   (S6ZQ5VMBkmKKwLvj6AogTz) to the connected Figma account; the current
   integration returns "no edit access." Then the Figma design can be
   diffed against the built UI screen-by-screen.
2. Typography: a distinctive display face (e.g. an editorial serif for
   headings) is the one cheap move left that most separates "template" from
   "brand." Currently system sans throughout.
3. Urdu/RTL readiness: even English-first, number formatting (lakh/crore
   style grouping) and an Urdu toggle on key money screens would be a
   real differentiator for the actual demographic.

## 7. Execution order (the plan, condensed)

| # | Work | Why first | Size |
|---|------|-----------|------|
| 1 | Scheduler/enforcement loop (cron: late→penalty→missed→recovery→release/refund) | Credit accuracy is the owner's hard requirement; every protection feature is inert without it | 2-3 d |
| 2 | Full-cycle E2E test of new engines (3 modes × distribution × holdbacks × recovery) | The engines are unproven end-to-end; money math must pass the books-balance test | 1-2 d |
| 3 | Rate refresh + "verified [date]" stamps + cadence→tenor filter in wizard | Stale rates = instant credibility death; foot-gun prevention | 1 d |
| 4 | Host reputation card + priority-fee reserve | Highest-validated trust feature + Oraan-proven anti-default lever | 1-2 d |
| 5 | KYC capture (CNIC upload + review queue; defer OCR/liveness) | Production host gate currently unsatisfiable | 2-3 d |
| 6 | Credit Passport MVP (signed PDF export + verify endpoint) | Cheapest innovation bet, unique, zero regulatory pain at consent-based MVP | 1-2 d |
| 7 | Capacitor Android wrap, internal testing track | Real users need a phone app; committees live on phones | 2-3 d |
| 8 | Pilot: 3–5 real committees (friends/family), feedback loop | Everything after this needs real usage data | ongoing |
| 9 | SBP sandbox application + Neem outreach (parallel to all above) | Months-long lead time; start now | parallel |
| 10 | Sona Halqa (gold-unit) design spike + goal-locked committee vendor model | The two biggest differentiation bets, built on pilot learnings | after pilot |

---
Bottom line: the platform's engineering is now ahead of its operations.
Stop adding engines; make the clock run (scheduler), prove the money math
end-to-end, refresh the data, put it on phones, and get real Pakistanis
using it while the partnership track runs in parallel.
