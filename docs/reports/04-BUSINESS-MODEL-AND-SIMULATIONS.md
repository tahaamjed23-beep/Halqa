# Report 4 — BUSINESS MODEL + SIMULATIONS & BACKTESTING (v3, expanded)

## A. The business model, from first principles
- **The asset we monetise:** idle time on other people's money — the days between a member's payment and the round's payout, the deposits held all cycle, and the balances parked in the vault. That time was economically dead in every paper committee for a century. Halqa is, at its core, a machine for noticing wasted days and paying their owners for them.
- **The structure:** classic **Mudarabah** — members are capital providers (rab-ul-maal), Halqa the working manager (Mudarib). Profit shared by a pre-agreed ratio; no profit → no manager's share. Our ratio: **5% of generated profit, 0% of principal.**
- **What we never touch (recite cold):** contribution principal · deposit principal · early-turn fees (100% member-to-member) · turn-market premiums (member-to-member; a 10% marketplace fee applies to premiums only, in conventional tiers) · late penalties (→ charity in halal tiers, → never-late members otherwise). Even the referral programme is paid out of **Halqa's own** fee share — Rs 250 to a referrer when the referred member completes a first full cycle — so growth spending never leaks into member money either.
- **Revenue lines today (simulated) and post-licence (real):**
  1. 5% of float-sweep profit — every engine circle, every round.
  2. 5% of vault profit — Standard/Income/Gold/Crypto tiers; always-on, independent of the committee calendar.
  3. Post-licence expansions: custody margin, **Credit-Passport verification partnerships** with MFBs/lenders (underwriting data-as-a-service), **receivables-data feeds** (the exportable circle statement — forward inflows + member reliability — is the underwriting artifact for committee-backed financing), premium host tooling.
- **Why the shape is superior to a flat fee:**
  - *Alignment:* "if members don't earn, we don't" survives regulators, journalists and fiqh scholars alike. A flat fee on savings is a tax on the poor's discipline; a share of created profit is a wage for creating it.
  - *Balance-scaling:* revenue grows with wealth-per-member, not only member count — deepening beats churn-and-burn acquisition. The referral design reinforces this: it pays for *completed cycles*, the exact unit that deepens balances.
  - *Marginal economics:* an additional earning-day is a ledger row against a pooled instrument — near-zero marginal cost, fixed-share marginal revenue.
  - *No credit risk on our book:* we don't lend; there is no cost-of-funds or NPL line. Defaults hurt members' circles (and we've built nine layers against them) but they do not sit on Halqa's balance sheet.
- **Illustrative steady state (shape, not promise):** 100k active savers · blended earning balances Rs 4–6B · ~11% blended yield → **Rs 440–660M/yr member profit → Rs 22–33M/yr Halqa** at 5%. Same cohort at double vault adoption roughly doubles our line without a single new user. That sensitivity — revenue doubling on *behaviour*, not acquisition — is the model's quiet superpower.
- **Cost base:** lean engineering + front-loaded compliance/licensing + cloud + assistant-deflected support. Contribution-positive early by construction.

## B. The simulations — three instruments, one discipline
*(Why simulate at all: no public dataset of real committee ledgers exists anywhere. The honest options are adjectives or a model with visible assumptions. We chose the model — seeded, reproducible, and now enforced by CI. The unusual part is not that we simulated; it is that the simulation's conclusions are automated tests: if a code change breaks a claim we make in this document, the build fails.)*

### B1. Harsh uniform stress test (`tests/monte-carlo.ts`)
- 100k members, deliberately hostile assumptions: 15% unreliable population, random turn positions, no deterrence modelling.
- Output: **7.28%** post-payout default; found that deposit+holdback at the *original* coverage levels fully covered only ~59% of worst-case (immediate post-payout) absconds.
- Its job was diagnostic — it drove two shipped builds: the **vault auto-cover**, and the **deposit-coverage raise to 90% of remaining dues** (early positions post more because they owe the group more). Quote it as "our own red-team": we attacked the design, published the wound, and shipped the fix.

### B2. Pakistan-calibrated model (`tests/lib-pakistan-sim.ts` + runner + CI test)
- **Population:** 100k across five segments — salaried lower-middle 30% (Rs 40–90k), daily-wage informal 25% (Rs 28–48k), home-business women 25% (Rs 30–60k), young gig 12%, overcommitted 8% — incomes in PSLM/LFS-style bands; contribution burden 8–15% of income; committees of 8–15.
- **Stressors:** two Eid months (+10pp lateness), school-fee month (+6pp, 1.4× shock rate), per-segment monthly income shocks (5–18%), burden-scaled lateness. The model deliberately makes life hard in the months Pakistani households actually find hard.
- **Design integrity:** both arms replay **identical seeded randomness** — same people, same shocks, same bad months — so paper-vs-Halqa differences are caused *only* by the modelled measures. Each modelled measure maps 1:1 to a shipped mechanism (reminders ×0.70 lateness; ban/passport deterrence ×0.60 abscond; 15% auto-cover adoption at 80% effectiveness; graduated deposits at the live 90% curve + 15% holdback recovery; credit-weighted ordering).
- **Results (paper → Halqa):** post-receipt defaults **1.41% → 0.27%** · recovery **0% → 90.4%** of exposure · defaults fully collateralised **70%** · pre-receipt dropouts 1.06% → 0.36% · on-time 84.4% → 88.9% · overcommitted segment 7.95% → 0.83%.
- **Reading those numbers like an operator:** the headline is not the five-fold default reduction (deterrence models are arguable); it is the **recovery line**. Even when someone does abscond, nine-tenths of the exposure comes back from collateral already in the system — that is a *structural* claim about deposit sizing, not a behavioural guess, and it is the direct dividend of the 90% coverage curve.
- **Now CI-locked (8 assertions):** determinism (same seed ⇒ identical output) · segment shares within ±1% · burden inside 8–15% · ≥3× default reduction · >60% recovery · dropout & on-time improvements · risk ordering sane (overcommitted worst, home-business women best) · **conclusions robust under a second seed**. A careless edit can no longer silently change the numbers we quote.

### B3. Bonus backtest (`tests/bonus-backtest.ts`)
- The engine's own integer math swept across **rates ±30% × payer behaviour** (round-open / 10-days-early / 3-days-early / due-date payers) for the Sigma-pooled reference circle (12 members, Rs 140k pool, fee fixed at 10%).
- The grid, current engine: best cell (day-one payers, base rates) **Rs 17,319** · the CI-locked canonical promise **Rs 16,982** · worst cell (rates −30%, everyone pays on the due date) **Rs 13,821**.
- Why the floor holds: the fee component (~Rs 9,334 through the patience split) is member-to-member and rate-independent; only the real-yield component breathes with rates. Even Pakistan's rate cycle cannot take the bonus below five figures in the reference case.
- The tier ladder underneath (same circle, levers added one at a time): Classic Rs 0 → Priority ~7,600 → Bazaar ~7,650 → Sigma monthly **15,285** → Sigma pooled **16,982**. Note that the Rs 15,000 promise now clears at the *monthly* rung — pooled mode is upside, not a requirement.

## C. Present it in three sentences
- "We red-teamed the design with a harsh 100k stress test, then built a Pakistan-calibrated model — five income segments, Eid and school-fee seasonality, income shocks — where both arms live the identical random life with and without our protections."
- "Defaults drop about five-fold, recovery goes from zero to ninety percent — and those exact claims are automated tests: the build fails if a change breaks them."
- "And before you ask: it's a calibrated model, not history — replacing it with our own ledger data is precisely what the pilot is for."
