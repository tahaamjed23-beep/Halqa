# HALQA — TECHNICAL COMPENDIUM
### The complete engineering, treasury, formula, and integration reference
*Internal document. Every formula below was verified against the live code on 19 July 2026. Sections marked INTERNAL contain mechanics that must never appear in the app or investor materials.*

---

## PART 1 — THE TECHNOLOGY INVENTORY

What follows is every computer-science concept and tool the platform runs on, what each one does, and why it matters to a money product. Think of this as the answer to "what is this thing actually made of?"

**TypeScript.** A programming language that is JavaScript with types: every variable declares what kind of thing it holds, and the compiler refuses to build if anything mismatches. In a fintech codebase this is the first line of defence — an amount can never accidentally be treated as text, a user id can never slip into a money field. Both the API and the web app are 100% TypeScript, and a full typecheck runs before every release.

**Node.js + Express.** Node runs JavaScript/TypeScript on the server; Express is the framework that turns it into an API — a set of URLs (endpoints) the app calls, like `POST /api/committees` to create a circle. Significance: one language across the whole stack means one team, one set of rules, no translation bugs between front and back.

**PostgreSQL.** The database — the single source of truth for every user, circle, payment and ledger entry. Postgres is the standard choice for financial systems because it is **ACID**: transactions are Atomic (all-or-nothing), Consistent, Isolated, and Durable. When a payout settles, either every leg of it commits or none does — there is no state where money half-moved.

**Prisma ORM.** The layer that lets our TypeScript talk to Postgres safely. The entire database schema (every table, every field) is declared in one file (`schema.prisma`) and versioned like code, so the shape of our data has a full history and can never drift silently.

**The double-entry ledger.** The oldest idea in finance, implemented literally: every movement of value is one row with a **debit account** and a **credit account** for the same amount. Nothing is ever "added" to a balance — balances are *derived* by summing entries. Consequence: money is conserved by construction. You cannot create or destroy a rupee in Halqa; you can only move it, and every move has a from, a to, a reason, a timestamp, and an actor. This is the feature an auditor, a bank partner, or the SECP will care about most.

**BigInt paisa arithmetic.** All money is stored as whole **paisa** (1/100 of a rupee) in arbitrary-precision integers. Floating-point numbers (the normal decimals computers use) cannot represent 0.1 exactly and drift over millions of operations — deadly in finance. Integer paisa can never drift: Rs 116.67 is exactly 11667 paisa, forever.

**Idempotency keys.** Every money-writing request carries a unique key; if the same request arrives twice (a user double-taps, a network retries), the second is recognised and ignored. This is how we guarantee a payment can never be recorded twice — the classic fintech failure mode, solved at the protocol level.

**Database transactions (`$transaction`).** Multi-step money paths (a payout with holdback + early fee + float profit + a safety-fund top-up) run inside a single database transaction: all steps commit together or roll back together.

**Append-only audit trail.** Alongside the ledger, every significant action (tier change, allocation set, member banned, deposit posted) writes an audit row that is never edited or deleted. Combined with the ledger, this means the platform can answer "what happened, exactly, and who did it?" for any moment in its history.

**JWT authentication (access + refresh tokens).** Users log in once and receive two signed tokens: a short-lived access token sent with every request, and a longer-lived refresh token to mint new ones. Passwords themselves are stored only as one-way hashes — the platform cannot read anyone's password, ever.

**Zod runtime validation.** Every input from the outside world is checked against a declared schema *at runtime* before any code touches it — amounts within bounds, percentages summing to 100, enum values legal. The type system protects us from ourselves; Zod protects us from the internet.

**Compute-on-read accrual (no cron).** Vault and float profit are not updated by a scheduled background job (a "cron") — they are *computed from timestamps whenever asked*: profit = principal × rate × days elapsed, derived from the ledger entries themselves. No job to crash, no drift between the job and reality; the ledger is always self-consistent.

**React + Vite (the web app).** React renders the interface as composable components; Vite builds and hot-reloads it. The app is a single-page application with **code-splitting** — heavy pages (charts, committee detail) load lazily so first paint stays fast on cheap phones.

**Recharts.** The charting library behind the growth projections, the coverage trade-off curve, and the committee growth tab — declarative charts fed straight from engine numbers.

**PWA (Progressive Web App).** The web app carries a manifest and mobile meta so it can be installed to a phone's home screen and feel native — the distribution path that needs no app store approval.

**i18n with RTL.** The interface is translation-keyed with full right-to-left layout support; one tap flips it to Urdu. Not cosmetic: the target user often reads Urdu first.

**Deterministic seeded simulation (agent-based model).** The 2025 Pakistan simulation runs 120,000 software agents through the real calendar with a fixed random seed and decision-paired randomness: the same person faces the same temptations in both simulated worlds (paper vs Halqa), so every difference in outcomes is *caused* by the platform, not by luck. Deterministic means anyone can re-run it and reproduce every figure to the decimal — the property that makes the numbers defensible in diligence.

**Automated test harness (271 integration assertions + unit tests + CI).** Every money path, engine formula, and default control is exercised by tests on every change. The headline engine outputs (the Rs 15,600 reference bonus, the recovery percentages) are *locked* as assertions — if a code change moves them, the build fails and we know before anyone else does.

**Fuzzy matching (bounded Levenshtein distance).** Rafa's autocorrect: the edit-distance between words, computed with an early-exit budget (1 edit for 4–6 letter words, 2 for 7+), plus a synonym-folding table that maps romanised Urdu (kameti, beesi, qist, sood, walat...) onto canonical tokens, plus conversational context memory. This is why "comitee kya hai" works.

**Security layers.** Rate limiting, login lockouts, and account-lock enforcement exist in code and currently run in **relaxed demo mode** by deliberate choice; a single switch re-arms them for production.

---

## PART 2 — TREASURY: HOW THE MONEY IS ACTUALLY HANDLED

Treasury means: where does cash physically sit, who controls it, how does it earn, and how do we make sure it is always there when a payout is due. Halqa's treasury design is two-stage, matching the regulatory architecture.

**Stage 1 (today, record-only): there is no treasury — deliberately.** Members pay each other outside the platform (cash, bank transfer, wallet), and Halqa records the movements in the ledger. The platform touches no client money, so there is nothing to safeguard, no custody licence needed, and no scenario where Halqa's failure costs a member her savings. The only real account is `platform:fees`, which records our own earned fees. Engine profit is computed and displayed as *indicative* at dated rates — arithmetic, not custody.

**Stage 2 (licence + bank partner): the treasury switch.** The design, ready in the architecture:

1. **Segregated escrow.** Each circle's collections land in escrow at the partner bank — client money, legally separate from Halqa's own funds, in the members' beneficial ownership. Halqa instructs; the bank holds. Virtual account references per circle keep every rupee attributable.
2. **The float sweep.** Idle escrow (money between pay-in and payout day) is placed into an Islamic money-market fund via the AMC's institutional account — the Mudarabah placement that funds Engine 1. Settlement is T+1 (order today, cash back tomorrow), which is why the money can earn without endangering payouts.
3. **The liquidity ladder.** Every instrument we may hold has a known exit time (`liquidityDays`: money-market 1 day, gold ~3 days), and the platform enforces the rule *liquidityDays ≤ periodDays − 7* at configuration time: nothing can be bought that cannot be sold comfortably before the payout it must fund. The 7 is the payout buffer.
4. **Payout buffers and reserves.** Circle risk policy carries two dials recorded per committee: a payout buffer (default 15% of the pool kept liquid regardless of the sweep) and a liquidity reserve (default 10%). These are the shock absorbers for a late payer on payout day.
5. **Gold discipline.** The gold-linked slice has the slowest exit (~3 days), so gold is only permitted when the period is at least 10 days (3-day exit + 7-day buffer), and the liquidation is scheduled ahead of each payout date.
6. **The Safety Fund.** Where a host enabled the slot-fee guarantee, that pool is the circle's own money, ring-fenced in the same escrow, spent only to top up a shortfall on a member's turn, remainder returned at cycle end.
7. **Reconciliation.** The bank's statement and Halqa's ledger must agree line-by-line, every day. Because our ledger is double-entry and append-only, reconciliation is a mechanical diff, not an investigation. Any unmatched line halts new placements until explained.
8. **Profit waterfall.** Fund profit arrives at the bank's declared Mudarabah rate; the member keeps her share in full. On the personal vault only, the platform takes a 5% share **of profit, never principal** on sweep-out (the Mudarib service share). Late-payment penalties never enter treasury revenue at all — they route to charity.

The one-sentence treasury philosophy: **member money is either in escrow, in a T+1 halal instrument, or on its way to a payout — and every rupee of it is reconstructable from the ledger at any second.**

---

## PART 3 — THE FORMULA BOOK (every formula, where it lives, with worked numbers)

The reference circle throughout: **n = 12 members, c = Rs 11,667/month, pool P = n × c = Rs 140,004.**

**3.1 The pool.** `P = n × c` — the amount one member collects each round. Used everywhere; the anchor of all other numbers.

**3.2 Simple accrual (the yield primitive).** `profit = principal × annualRate × days / 365`, computed in exact BigInt paisa (`projectedReturn`, `lib/money.ts`). Worked: Rs 140,004 at 10.8% for 24 days → 140,004 × 0.108 × 24/365 ≈ **Rs 994**. This one function powers the float sweep, deposit earnings, and vault accrual — one primitive, audited once, reused everywhere.

**3.3 Capital-days (the fairness measure).** Each member's claim on pool profit is `amount × days it sat` (`lib/profit-engine.ts`, `lib/distribution.ts`). A member's share = `profitPool × herCapitalDays / ΣallCapitalDays` (the last member receives the remainder so paisa never leak to rounding). Worked: if Ayesha's Rs 11,667 sat 30 days (350,010 rupee-days) and the circle's total was 4,200,120 rupee-days, she owns 350,010/4,200,120 = 8.33% of that round's float profit. Contributions are time-weighted per round — the model never pretends the whole cycle's money was invested on day one.

**3.4 Patience weight.** `w(k) = 1 + (k − 1)/(n − 1)`, implemented in exact tenths: `10 + round(10 × (k−1)/(n−1))` (`lib/sukoon.ts`). Turn 1 → 1.0×, turn 12 → 2.0×, linear between. Applied as a multiplier on capital-days in the distribution. Worked: turn 7 of 12 → 1 + 6/11 ≈ **1.55×**.

**3.5 Early-bird boost.** A member who recorded **≥ 75% of her payments at least 3 days early** carries a **1.25×** weight in the completion split (`qualifiesEarlyBird`: `earlyCount × 4 ≥ paidCount × 3`). Weights multiply: a patient early-bird at turn 12 carries 2.0 × 1.25 = **2.5×**. Funded by the extra float her early money actually created — a profit-sharing ratio, not a charge.

**3.6 Early-access fee.** `fee(k) = maxFee × (n − k)/(n − 1)` as a share of the pool; maxFee = 10%. Turn 1 pays 10%, declining linearly to 0 at the final turn. **90% of every fee redistributes to still-waiting members; 10% is the platform cut.** Worked: turn 3 of 12 → 10% × 9/11 = 8.18% ≈ **Rs 11,455** on the reference pool, of which Rs 10,310 goes to the waiting members.

**3.7 Graduated security deposit (verified from `routes/committees.ts`).** Three-part formula:
- Position coverage: `positionCoverageBps = coverageBase × (n − k)/(n − 1)` — first position carries the full host-chosen coverage (30–90%, default 70%), last position zero.
- Credit adjustment: `creditAdjBps = clamp((700 − creditScore) × 10, −1000, +1500)` — a member 100 points below the 700 benchmark posts up to +10 percentage points more; a strong scorer posts up to 10 less.
- Final: `deposit = remainingDuesAfterPayout × clamp(positionCoverage + creditAdj, 0, coverageBase + 500 capped at 9500) / 10000`, where `remainingDues = c × (n − k)`.
Worked: turn 1, score 700, 70% coverage → 0.70 × 11,667 × 11 ≈ **Rs 89,835**. Same turn with score 640 → coverage 76% → ≈ Rs 97,536. Turn 12 → **Rs 0**. Collateral mirrors exposure *and* individual credit.

**3.8 Post-due grace window — INTERNAL, never displayed.** `graceDays = clamp(round(0.23 × periodDays), 2, 14)` (`POST_DUE_GRACE_PCT`, `routes/committees.ts`). A 30-day circle quietly tolerates 7 days before the heavy penalty tier. The member never sees this number — disclosing it would turn a mercy into an entitlement.

**3.9 Progressive penalties (`lib/settlement.ts`).** Late but within 3 days → base penalty (`latePenaltyBps`, default 200 = 2% of installment); 4+ days → 500 (5%); beyond the grace window → 1000 (10%). Reliability score deltas at the same breakpoints: **−10 / −20 / −40**. All penalty money routes to charity (iltizam bi-tasadduq).

**3.10 Turn marketplace pricing (verified from `routes/exchange.ts`).** A seller lists her upcoming position at a premium; bound: `0 ≤ premium ≤ 50% of the payout`. Bids must beat the current floor (highest open bid, else the ask). On acceptance the buyer pays the premium, and the platform takes `fee = premium / 10` (exactly 10%) into `platform:fees`. **Shariah gate:** circles running the halal-labelled earning configurations allow **free swaps only** (premium must be zero) — selling a claim to money for more money is contested fiqh, so it is simply not offered there.

**3.11 Vault blended rate (portion sizing).** `blendedRate = Σ shareᵢ × rateᵢ / 100`, and identically for the blended risk score (`routes/vault.ts`). Worked: 40% money-market (10.8%) + 30% income (12.1%) + 20% gold (15%) + 10% crypto (30% indicative) → **13.95%/yr blended, risk 4.2/10** — the exact figures the API returned in verification.

**3.12 Vault growth projection.** Monthly compounding: `bₜ₊₁ = bₜ × (1 + r/1200) + monthlyTopUp`, three paths using per-sleeve band factors — halal sleeves ~0.7–1.25× of the dated rate, gold 0.5–1.5×, crypto **−1.5× to 2.2×** (the conservative crypto path models actually losing a large part of the portion — an honest asymmetric band, not a symmetric wobble).

**3.13 Expected-payment lead factor.** Host sets how early members typically pay; `floatFactor = (leadDays + 7)/(periodDays + 7)` scales the float share of the pre-start bonus estimate (halal configs: ×(0.75 + 0.25f); fee configs: ×(0.9 + 0.1f)). Estimate-shaping only — realised profit always follows real timestamps.

**3.14 Group streak bonus.** Each consecutive fully-clean round adds **+5%** to the circle's float profit, capped at **+50%**; one late payment resets it.

**3.15 Committee risk score (verified weights, `lib/risk-engine.ts`).** `risk = 0.22×credit + 0.18×behaviour + 0.18×instrument + 0.16×liquidityMismatch + 0.14×allocation + 0.12×concentration`, each factor 0–10, displayed in bands: Low ≤3, Medium 4–6, High ≥7.

**3.16 Platform revenue cuts (in code today).** Early-access fee: 10% of the fee. Turn-market: 10% of premium. Vault sweep: 5% of accrued profit. Slot fee (Safety Fund): 0.5–3% pooled to the circle's own fund, not to Halqa.

**3.17 Referral.** Flat **Rs 250**, paid from Halqa's own fees, only when the referred member completes her **first full cycle** — pays for finishers, not signups.

---

## PART 4 — BUYING A TURN: THE PREMIUM SYSTEM, EXPLAINED PROPERLY

The scenario: Bilal holds turn 9 but his shop needs stock *now*; Sana holds turn 2 but doesn't need the money until school fees in spring. On paper committees this swap happens informally, priced by begging. Halqa makes it a market with rules.

Sana lists her position 2 with an asking premium — say Rs 6,000. The listing shows every member the position, the payout it commands (Rs 140,004), and the ask. Bilal (or anyone in the circle) bids; each bid must beat the floor, which is the highest open bid or the ask. When Sana accepts, three things happen atomically: the positions swap in the turn order, Bilal pays Sana the Rs 6,000 premium (recorded member-to-member), and the platform books exactly 10% of the premium — Rs 600 — as its marketplace fee. The whole trade is consent-based: it is visible to the group and the host, prices are hard-bounded (a premium can never exceed half the payout, which blocks desperation pricing), and scores are untouched — trading a turn is a preference, not a sin.

Read it as finance for a second: Bilal paid Rs 6,000 to receive Rs 140,004 seven months earlier — an implied cost of about 4.3% for seven months of acceleration, dramatically cheaper than any informal lender in the bazaar, and the money went to *Sana*, a fellow member, not to a middleman. That is the recurring Halqa pattern: fees flow member-to-member, and the platform takes a sliver for running the market.

The Shariah note, honestly: classical scholars dispute selling a money-claim at a premium. So the circles that carry a halal label do not offer premium sales at all — positions there swap free by mutual consent, and the premium market exists only in configurations that never claimed the label. Feature kept, label honest.

---

## PART 5 — THE GOLD HEDGE: WHAT IT ACTUALLY MEANS

A **hedge** is a position you hold because it moves opposite to a risk you already carry. The risk every Pakistani saver carries is the rupee itself: inflation eats cash, and depreciation eats it again in import prices. Gold is the traditional counterweight — when the rupee weakens, the PKR price of gold typically rises, which is precisely why grandmothers hold bangles as savings.

Halqa implements the same instinct in fund form, in two places. In a **circle**, the host can tick "back this circle with gold": a chosen slice (5–50%) of the pooled money is allocated to a gold-linked fund — units whose value tracks the gold price — instead of the money-market sleeve. In the **vault**, gold-linked is one of the four sleeves you can size a portion into. Either way, nobody buys physical bars: exposure comes through fund units at published prices, entering and exiting at NAV.

Worked example: a circle allocates 20% of its Rs 140,004 pool → Rs 28,001 rides gold. Over a stretch where the rupee slides and PKR gold gains 12%, that slice adds ~Rs 3,360 — while pure cash would have quietly lost purchasing power. The honest other side, always stated in-app: gold can *fall* in calm years; ~15% is a dated indicative figure, not a promise; and because gold takes ~3 days to liquidate, the platform only allows it where the circle's rhythm leaves room (period ≥ 10 days), with liquidation scheduled ahead of each payout. A hedge, priced and labelled — never a guarantee.

---

## PART 6 — THE INTEGRATION MAP: EVERYTHING WE MUST PLUG INTO

Halqa alone is a ledger with brains. The full product is Halqa plus rails. Stage-tagged:

**Partner bank — escrow + settlement (LICENCE + BANK).** The custody backbone: segregated client-money escrow, virtual account references per circle, statement feeds/webhooks for reconciliation. This is the single most important partnership; everything in Part 2 hangs off it.

**Raast (SBP instant payments) (LICENCE + BANK).** Pakistan's free, instant, account-to-account rail — including Request-to-Pay, which is practically designed for installment collection: the app requests, the member approves in her bank app, escrow receives seconds later, ledger reconciles automatically.

**1Link (LIVE-adjacent / LICENCE).** The interbank switch: IBFT transfers, bill-payment presentment (a Halqa installment payable at any bank app or agent like a utility bill), and OTC cash collection through agent networks for members without accounts.

**JazzCash / easypaisa wallets (PARTNER).** ~21M and ~18M monthly active users respectively — the cash-in/cash-out endpoints where our members already keep value. Wallet-to-escrow collection turns a committee installment into two taps.

**Asset-management company (AMC) (PARTNER).** Institutional accounts for the money-market, Islamic income, and gold funds: unit purchase/redemption APIs, daily NAV feeds (the dated rates the app displays), and the distribution-trail agreements (~0.5%/yr) that pay us for placing balances.

**NADRA / Verisys + biometric KYC (LICENCE).** Identity verification against the national database — the step that upgrades a scored profile into a bank-grade verified customer, and the precondition for escrow onboarding at scale.

**eCIB + private credit bureaus (PARTNER).** The State Bank's credit registry and its private counterparts — where the Credit Passport stops being an export and starts being a reported credit file. This is the Esusu move: committee discipline becoming bureau-visible history.

**Takaful operator (PARTNER).** Islamic mutual insurance wrapping circles: death/disability coverage on outstanding obligations, distributed through us at a 15–20% share. Turns the worst family scenario into a covered event.

**Auto-debit mandates (LICENCE + BANK).** Standing direct-debit instructions against members' accounts — the single biggest mechanical reducer of "forgot to pay," already modelled in the risk policy (`autoDebitMandateRequired`).

**WhatsApp Business API + SMS (LIVE→PARTNER).** Where Pakistani committees already live. Invites, nudges before due dates, receipts after payments; SMS as the fallback for feature phones. The smart-nudge engine already exists in the risk policy — this gives it reach.

**s.489-F enforcement path (LICENCE).** Post-custody, collections run on instruments with criminal-law backing for dishonoured cheques — the legal teeth informal committees never had.

Sequencing: nothing above blocks today's product. Each integration switches on a revenue line or a control that is already built and waiting in the architecture.

---

*End of compendium. The reference circle figures (Rs 0 / ~6,300 / ~15,600 and the −30% stress floor ~13,000) are locked in automated tests; the simulation figures reproduce from seed 20250101.*
