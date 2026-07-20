# Learning Volume 4 — HOW HALQA MAKES MONEY, AND HOW WE KNOW THE SYSTEM WORKS
### The business model taught from first principles, then the three simulations explained the way a physicist would explain an experiment. Requires Volumes 1–3.

---

## Part 1 — The business model, derived (not asserted)

### 1.1 Start from the constraint
Volume 1 gave you the golden rule: recorded, never held. Volume 3 gave you riba: no fixed charges for money-time. Add the market reality: our users are lower-middle-income savers who rightly distrust fees. Question: **what revenue model survives all three constraints?**

Work through the options like an elimination proof:
- *Charge a subscription?* Extracts money even when members earn nothing; punishes the poorest; dies in any price comparison with the free paper committee. ✗
- *Take a cut of contributions?* That's a tax on savings — 0.5% of a Rs 140k pot is Rs 700/month for... bookkeeping. Worse than the flaw we're fixing. ✗
- *Interest-spread lending (be a bank)?* Needs a full licence, a balance sheet, capital, and it's riba. ✗✗
- *Take a share of profit we create that wouldn't otherwise exist?* Members lose nothing they ever had; we earn only by making them richer; it is literally the classical Mudarabah contract (Volume 3, §5.2); and it needs no custody to *compute*. ✓

That's the model: **Halqa is the mudarib (working manager) of members' idle money, keeping 5% of realised profit. 0% of principal, 0% of contributions, 0% of the fees members pay each other.**

### 1.2 What Halqa explicitly does NOT touch (and why each matters)
- **Contribution principal** — the committee's own money. Touching it = becoming the fraud we exist to kill.
- **Deposit principal** — collateral belongs to members; it earns *for them*.
- **Early-turn fees** — member-to-member (Volume 2, Part 5). If Halqa kept any of it, Halqa would profit from the one 🟠 mechanic — an unacceptable conflict: never build revenue on the thing your own app labels religiously questionable.
- **Late penalties** — go to charity (halal tiers) or the never-late. A platform that profits from lateness wants members late. Incentive hygiene.
- **The referral bonus (Rs 250)** — paid *from Halqa's own 5% share* when a referred member completes a first cycle. Even marketing spend never touches member money.

### 1.3 Worked example — one circle's year, full accounting
Reference circle (12 × Rs 11,667, Sigma pooled, prompt payers):
- Real profit created (float + deposit yield, Volume 2): ≈ **Rs 72,400** over the cycle.
- Halqa's 5%: ≈ **Rs 3,620**. Members keep ≈ 68,800.
- The fees (~Rs 77k) that boosted individual bonuses: pass straight through, Halqa keeps Rs 0.

Rs 3,620/year from a whole circle is *tiny*. That's not a flaw — it's the design forcing the right growth strategy:

### 1.4 Why tiny-per-circle is fine: the model scales on balances, not circles
Compare two members:
- Fatima: one Rs 5,000/month circle, sweeps every payout instantly. Earning balance: a few thousand rupees on a few float days. Halqa's revenue from her: coins.
- Khadija: same circle, but parks her Rs 60,000 payout in the vault's Income tier for the rest of the year. Her balance earns 60,000 × 0.121 ≈ Rs 7,260/yr → Halqa's 5% ≈ **Rs 363/yr from one behaviour**, roughly 10× what her committee activity generates.

Lesson: **revenue ∝ rupee-days under management** ("earning-days" — the north-star metric), not user count. One saver deepening beats fifty downloads. This is also why the product invests so much in making the vault attractive (four tiers, auto-cover, parking): the vault is the business.

Illustrative steady state (a shape, never a promise): 100k active savers × average Rs 40–60k earning balances ≈ Rs 4–6B under management × ~11% blended yield ≈ Rs 440–660M/yr member profit → **Rs 22–33M/yr Halqa revenue**. Double vault adoption in the same cohort ≈ double the revenue with zero new users.

### 1.5 The cost side, and the two moats this model buys
Costs: engineers, cloud, compliance/licensing (front-loaded), support (largely deflected by the in-app assistant). No branches, no field force, no cost-of-funds, and — because we don't lend — **no NPLs and no CAR pressure** (Volume 3, Ch 2 vocabulary: we carry a bank's data advantages with none of a bank's balance-sheet risks).
The alignment moat: "if members don't earn, we don't" survives regulators, journalists, and fiqh scholars — three audiences that routinely kill extractive fintechs.
The future lines (post-licence): custody margin, Credit-Passport verification partnerships (lenders paying for underwriting data on thin-file borrowers), receivables-data feeds for banks (the exportable bank pack), premium host tooling.

---

## Part 2 — The simulations (how we know, not just hope)

### 2.0 Why simulate — and the experimental-design problem
No dataset of real committee ledgers exists anywhere on earth (informal = unrecorded, by definition). So claims like "our protections reduce defaults" can be adjectives, or they can be a **model with visible assumptions**. We built the model — and treated it like a physics experiment:

The naive approach — simulate a paper committee, then simulate Halqa, compare — is broken, because each run's random events differ: maybe run B just got luckier people. The fix is the **paired experiment**: generate ONE population with ONE random seed (a seed makes "random" numbers exactly reproducible — same seed, same sequence, forever), then run the *same* people through both worlds. Same incomes, same shocks, same tempted absconders — the only difference between arms is Halqa's protection stack. Any outcome difference is therefore *caused* by the stack. In experimental terms: perfectly matched control and treatment groups, n = 100,000. And determinism means any reviewer can re-run it and get bit-identical results.

### 2.1 Instrument 1 — the red-team stress test (`monte-carlo.ts`)
Purpose: attack our own design. 100k members under deliberately hostile assumptions — 15% unreliable population, **random** turn ordering (no credit-weighting), no deterrence effects modelled. Findings: 7.28% post-payout default; and the collateral of that era (70% coverage curve) fully covered only ~59% of worst-case absconds.
What we did with the bad news: shipped **vault auto-cover**, and raised the **deposit curve to 90%** (cap 95%). This is the honest use of simulation — not to generate brag numbers, but to find the design's weakest joint and fix it. When an investor asks "what breaks this?", the answer is "here's the test where we broke it ourselves, and here's the patch."

### 2.2 Instrument 2 — the Pakistan-calibrated model (`lib-pakistan-sim.ts`)
The main result. The population is built from public evidence, not convenience:

| Segment | Share | Monthly income band | Why it's modelled |
|---|---|---|---|
| Salaried lower-middle | 30% | Rs 40–90k | steady but stretched |
| Daily-wage informal | 25% | Rs 28–48k | volatile income = late risk |
| Home-business women | 25% | Rs 30–60k | the committee's core demographic |
| Young gig workers | 12% | — | new economy, thin files |
| Overcommitted | 8% | — | in too many circles — the danger group |

Realism layers: contribution burden 8–15% of income; committee sizes 8–15; **two Eid months** (+10 percentage points lateness — festival spending is real), a **school-fee month** (+6pp and 1.4× income-shock rate), per-segment random income shocks (5–18% monthly probability), lateness scaling with burden.
The Halqa arm applies only effects that map 1:1 to shipped features: reminders (lateness ×0.70), ban+Passport deterrence (abscond ×0.60), auto-cover (15% adoption, 80% effective), the live 90% deposit curve + 15% holdback for recovery, credit-weighted ordering.

**Results (paper arm → Halqa arm, same 100k lives):**

| Metric | Paper | Halqa |
|---|---|---|
| Post-payout defaulters | 1.41% | **0.27%** |
| Recovery on default | 0% | **90.4%** of exposure |
| Defaults fully collateralised | 0% | **70%** |
| Pre-payout dropouts | 1.06% | 0.36% |
| On-time payments | 84.4% | 88.9% |
| Worst segment (overcommitted) default | 7.95% | 0.83% |

How to read it like a skeptic: the deterrence multipliers (×0.60 etc.) are *calibrated judgments* — arguable. But the **recovery** line barely depends on them: it's near-arithmetic. If position-2 defaults owing Rs 116,670 and her posted deposit ≈ Rs 105,000 + holdback Rs 21,000 are forfeited, recovery is what division says it is. The strongest claim rests on the most mechanical assumption — that's the right way around.

### 2.3 Instrument 3 — the bonus backtest (`bonus-backtest.ts`)
Question: is Rs 16,982 a fair-weather number? Method: run the engine's own arithmetic across a grid of worlds — rates at −30%/base/+20% × four payer-behaviour profiles (day-one → due-date payers). Corners: best cell **Rs 17,319**; worst cell (rates −30% AND lazy payers) **Rs 13,821**. The floor's cause (you derived it in Volume 2): ~Rs 9,334 of the bonus is fee redistribution, immune to interest rates. Two independent profit sources = graceful degradation. This is diversification (Volume 3, §1.6) working inside a single product.

### 2.4 The lock (the part that makes it engineering, not marketing)
All headline claims are **CI assertions** — automated tests that run on every code change: determinism, segment shares ±1%, burden bounds, ≥3× default reduction, >60% recovery, risk-ordering sanity, robustness under a second seed, and the Rs 15,000-promise ladder. If an engineer's edit quietly weakens the protection stack, **the build fails before the claim can drift from the code**. Documents can lie; a red build cannot.

### 2.5 The honest boundary (memorise this sentence)
"It's a calibrated model, not history — the pilot's purpose is to replace the model with our own ledger data." Say it *before* the skeptic does. It converts your biggest weakness (no real data) into evidence of intellectual honesty, and it frames the pilot as the obvious next step — which is exactly what you're raising for.

---

## Part 3 — Self-test
1. Why is a subscription fee worse than 5%-of-profit for this specific market? *(Extracts when members earn nothing; loses to the free paper committee; punishes smallest savers.)*
2. Khadija parks Rs 80,000 in the Gold tier (~15%) for 9 months. Member profit? Halqa revenue? *(80,000 × 0.15 × 274/365 ≈ Rs 9,008 → Halqa ≈ Rs 450, member keeps ≈ 8,558.)*
3. What experimental flaw does the shared random seed eliminate? *(Luck differences between arms — makes the comparison causal, like matched control/treatment groups.)*
4. Which simulation number is most assumption-proof, and why? *(Recovery ~90.4% — mostly arithmetic on collateral sizes, not behavioural guesses.)*
5. Why does the platform's revenue not fall when a circle chooses the fully-halal Bazaar tier over Sigma? *(Halqa's 5% applies to real profit — float + deposit yield — which both tiers have; the fee was never Halqa's money in any tier.)*
