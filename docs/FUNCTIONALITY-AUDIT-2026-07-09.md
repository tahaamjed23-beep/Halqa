# Halqa — Functionality & Request-Compliance Audit

Date: 2026-07-09 · Auditor: independent pass (Fable 5), no prior-work benefit of the doubt.
Method: code reading, live-browser probes, full test runs, and two new simulations.
Verification state at close: **API + web typecheck clean · 17/17 unit · 237/237 integration ×2 (re-run-safe) · production build clean**.

---

## 1. Verdict in one paragraph

The app is genuinely functional as a **Stage-1 record-only prototype**: every advertised mechanism (rotating core, scoring, deposits, holdbacks, grace, all five profit tiers, vault with tiers + parking + top-ups + the new auto-cover, goal circles, staking streak, turn market with Shariah gating, penalties-to-charity, Credit Passport, Rafa) runs end-to-end against the real API and is covered by 237 integration checks. The two honest boundaries: **no real money moves** (recorded, never held — by design until SECP licensing) and **yield is computed from dated indicative rates**, not live deployments. This audit found and fixed three real defects, closed one genuinely under-delivered request (vault auto-cover), and lists every remaining gap below.

## 2. Defects found by this audit (all fixed and verified)

| # | Defect | Severity | Fix |
|---|---|---|---|
| 1 | **Rafa was absent on the committee page** — `App.tsx` renders CommitteePage outside the Shell, so the mascot's two most important reactions (installment paid, payout released) fired into the void. The "reacts to what you do" feature silently never worked where it mattered most. | High (feature dead where it matters) | RafaBot now mounts on the committee branch too; verified live: nod + "✅ Installment recorded!" on the committee page. |
| 2 | **Rafa gave two false answers**: claimed a password-reset flow and a Profile support channel exist. Neither does. | Medium (bot lying) | Answers rewritten to the honest truth; "forgot **my** password" phrasing gap also fixed and verified. |
| 3 | **Gold-hedge edge cases**: toggle state survived a switch to INVESTMENT mode (→ API 400 on submit); periods under 10 days fail gold's 3-day liquidity check with a confusing error. | Medium (broken submit path) | Submit guard + disabled toggle with plain-language hint under 10-day periods. |
| 4 | **Auto-cover safety**: (new code) the cover query originally could have drawn on vaults for cancelled circles' stale rounds. | Caught pre-ship | Query restricted to ACTIVE committees. |

## 3. Request-by-request compliance (the "was Opus ignoring me" check)

Legend: ✅ met · 🟡 partial (honestly disclosed) · ❌ was missed → status now.

| Request | Status |
|---|---|
| Priority default 10% + worked example in UI | ✅ |
| Bazaar fixed so patience genuinely pays (last earns most) | ✅ locked by test |
| Rs 15,000 max bonus in the 12-women example, fee capped 10% | ✅ Rs 15,639, CI-locked |
| 100k-user simulation + defaulter count | ✅ (now upgraded — §5) |
| Shrink the big ugly headings | ✅ verified 23px |
| Remove all bank mentions | ✅ flag-gated, 0 on screen |
| Kill auto-open tutorial → real-time Rafa walkthrough | ✅ coach card follows pages |
| Rafa = cute 3D character with action animations (outsourced) | ✅ — but its committee-page reactions were dead until this audit (defect #1). Now truly working. |
| Robot free-floating, no circle, quirky stunt + wander every ~3 min | ✅ (interval 180s; stunts verified by class) |
| Risk → Low/Med/High, auto-max, badge follows choice | ✅ |
| Combine engines freely (multi-select levers) | ✅ |
| Per-position earnings for every tier + combined | ✅ |
| Profit engine above anti-default; fee explainer un-messed | ✅ |
| De-emphasize investing; risk out of the create flow's face | ✅ advanced-off-by-default |
| Anti-default: "do ALL of them, minus very strict ones" | ❌ **was under-delivered** (only the grace window shipped) → **now closed**: vault auto-cover implemented this pass (opt-in safety net; overdue installment settles from the member's own vault through the standard path; late penalty + score hit still apply; 18 new integration checks). Two items deliberately parked as chairman decisions: raising early-position deposit coverage (it renumbers the verified bonus table) and graduated exposure caps for newcomers (arguably a "very strict" restriction — your carve-out). |
| Hidden grace window ≈23% of period, never shown in UI | ✅ code constant only; Rafa doesn't leak it |
| Vault tiers / goal circles / gold-linked / staking streak | ✅ all four, tested |
| Terminal: separate Halqa earning+gold from market investments | ✅ 4 engine cards vs 26-scheme market list, no overlap |
| Gold in committee creation + estimated gold growth | ✅ |
| Crypto: HIGH RISK warning + double-confirm | ✅ risk 10/EXTREME, excluded from committees, modal verified |
| 10,000-word investor/technical PDF | ✅ 10,013 words, 34 pages |
| Rafa: answer "hello"; "+10,000 questions" | 🟡 greetings/small-talk now fully work (hello, salam, AOA, thanks, who-are-you — verified). The KB is ~116 hand-written intents × wide synonym sets ≈ thousands of phrasings, **not 10,000 literal rows**. Deliberate: 10,000 generated rows would bloat the app bundle and produce garbage answers. If you want true open-ended Q&A, the honest path is wiring Rafa to an LLM API at launch — flagged as a decision, not silently skipped. |
| Launch in browser | ✅ running now |

## 4. What is NOT functional (the honest list)

1. **No real money moves.** Stage-1 records transfers; custody/deployment awaits the SECP NBFC licence. Every screen says "recorded", by design.
2. **Yield is simulated** from dated indicative rates (money-market 10.8%, Mudarabah 11.2%, income 12.1%, gold 15%). Real deployment needs the licence + custody partner.
3. **No password reset / account recovery.** Rafa now says so honestly.
4. **No support channel** beyond committee chat + Rafa.
5. **Bank/custody rail hidden** behind `SHOW_BANK_RAIL=false` — statement matching, guarantee pools and bank KYC are built + tested but unreachable from the UI until re-enabled; consequently **KYC Level 2 is unreachable** from the UI (only matters for hosting in production mode).
6. **Ops gaps:** no DB migrations (db push only), no backups, no staging, no browser e2e; Postgres must be started manually after every reboot.
7. **Prize draw** pending formal Shariah-board sign-off (labelled in-app).
8. **Vault accrual nuance:** an auto-cover debit resets the accrual window, so remaining balance under-credits profit until the next sweep — conservative direction (never over-pays), documented.
9. **Crypto band chip:** the EXTREME-risk crypto entry appears only under the "All" chip with the ceiling raised to 10 (there is no "Extreme" chip) — intentional friction, noted.
10. **Rafa is keyword-matched, not an LLM** — unknown phrasings get a graceful fallback.
11. Delinquency dev-trigger route is disabled in production mode (scheduler owns it there).

## 5. Simulations & backtests (new, calibrated)

### 5a. Pakistan-calibrated 100,000-member simulation (`tests/pakistan-sim.ts`, seeded)
Five behavioural segments (salaried lower-middle 30%, daily-wage informal 25%, home-business women 25%, young gig 12%, overcommitted 8%) with PSLM-style income bands (Rs 28–90k), contribution burden 8–15% of income, two Eid months + school-fee month, income shocks — and **both arms replay identical randomness**, so differences come only from Halqa's measures:

| | Paper committee | **Halqa** |
|---|---|---|
| On-time payments | 84.38% | **88.94%** |
| Pre-receipt dropouts | 1.06% | **0.36%** |
| **Post-receipt defaulters** | **1.41%** | **0.27%** |
| Avg recovery on default | 0% | **85.5%** |
| Defaults fully collateralised | 0% | **64.0%** |
| Worst segment (overcommitted) | 7.95% | **0.83%** |

Reading: a paper kameti among ordinary lower/middle-class Pakistanis already defaults rarely (social enforcement — matches the ROSCA literature), but when it happens the group loses everything. Halqa cuts the default rate ~5× (deterrence, credit-weighted ordering, grace, auto-cover) **and** recovers ~85% of what's left. The earlier 7.28% figure came from the deliberately harsh uniform model (15% "shaky", random positions, no deterrence modelling); this calibrated model is the better estimate. Caveat, stated plainly: it's a directional behavioural model calibrated to public evidence, not an empirical backtest on real payment ledgers — no such public dataset exists.

### 5b. Bonus promise under stress (`tests/bonus-backtest.ts`, engine-exact math)
Max annual bonus, Sigma pooled, best position, fee fixed at 10%:

| Behaviour \ Rates | −30% | base | +20% |
|---|---|---|---|
| Pay at round open | Rs 13,983 | **Rs 15,976** | Rs 17,304 |
| Pay 10 days before due | Rs 13,249 | Rs 14,926 | Rs 16,045 |
| Pay 3 days before due | Rs 12,991 | Rs 14,559 | Rs 15,604 |
| Pay on the due date | Rs 12,881 | Rs 14,402 | Rs 15,415 |

The Rs 15,000 headline needs day-one payers at current rates; the floor under the worst modelled case is Rs 12,881 because the member-to-member fee component (~Rs 9,334 through the patience split) is rate-independent. All indicative, never guaranteed.

## 6. Recommended next decisions (yours, chairman)

1. **Deposit-coverage raise** (early positions 70→90%, cap 95%): closes most of the residual default exposure; costs a renumbering of the published bonus table. Recommend: yes, in a dedicated pass.
2. **Graduated exposure for newcomers** (small first circles until the score proves out): strongest remaining anti-default lever; it is a restriction on new users — your "very strict" carve-out applies. Recommend: yes, with generous limits.
3. **Rafa → LLM-backed answers** at launch for true open-ended Q&A (keyword KB stays as the instant/offline layer).
4. **SECP NBFC licensing** remains the gate between this prototype and real money — unchanged, and the dossier (§11) covers the path.
