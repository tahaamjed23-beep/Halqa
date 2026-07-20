# Sukoon / Bazaar / Priority Profit Engines

Date: 2026-07-08. Status: implemented, verified (14/14 unit, 123/123 integration ×2).

## What it is

The halal return floor for rotating committees. Returns come from real,
Shariah-compliant schemes on money that is genuinely idle — never from
charging the early receiver (the riba trap in Indian chit-fund auctions).

Committee tiers (chosen at creation, locked at start, consent required):

- **CLASSIC** — pure rotating committee, no investment activity.
- **SUKOON** — float sweep + deposits-that-earn, profit split by capital-days.
- **BAZAAR** — Sukoon + disclosed patience tilt: later turn positions weigh
  up to 2.0x in the profit split (weights 1.0x→2.0x linear, in the consent
  text). Funded by realised profit only.

## Mechanics

1. **Float sweep** — every PAID contribution earns the Islamic money-market
   sleeve rate (`islamic-money-market-fund-basket`, 10.8% indicative) for the
   exact days it sat before the round payout (clamped 0–90). Realised at
   payout: `FLOAT_SWEEP_PROFIT_SIMULATED` (net) + `FLOAT_MUDARIB_FEE_5_PERCENT`
   (platform's Mudarib share). Net stays pooled in escrow.
2. **Deposits that earn** — in Sukoon/Bazaar, security-deposit yield uses the
   `islamic-mudarabah-deposit-basket` rate (11.2% indicative) instead of the
   host-set bps. Paid to the depositor at completion (their capital, their
   profit).
3. **Patience tilt (Bazaar)** — at cycle completion the pooled profit is
   distributed by capital-days × `patienceWeightTenths(position, N)`
   (10 → 20 tenths).
4. **Prize draw (opt-in, `prizeDrawEnabled`)** — half of a round's net float
   profit is gifted (`PRIZE_HIBA_GIFT_RECORDED`) to one on-time payer picked
   deterministically (djb2 over `committeeId:roundNumber`). Principal is never
   staked. Flagged in UI as pending Shariah board sign-off.

Consent: tier ≠ CLASSIC requires member risk consent even at 0% reinvest
ratio (the engine invests float and deposits).

## Priority tier — conventional, NOT Shariah-reviewed (added 2026-07-08)

This is the Indian chit-fund mechanism the user asked for, deliberately kept
separate from Sukoon/Bazaar because it is an interest-style fee, not real
investment profit:

- Host sets `earlyFeeBps` (min 0.5%, max 20%) — the fee the round-1 recipient
  pays, declining linearly to 0% for the last position (reuses the existing
  `slotFeeBpsForRound` curve — same shape as the guarantee-pool slot fee, but
  wired to a completely different destination).
- The fee is deducted from that round's payout and immediately split
  **equally** among every other active member as a same-round dividend
  (`EARLY_FEE_DIVIDEND_RECORDED`) — never pooled, never held until cycle
  completion, never kept by Halqa. This is the real chit-fund behavior: "the
  discount is shared among all members except the winner, every round."
- Requires member consent at start (same gate as Sukoon/Bazaar/reinvestment).
- Consent text states explicitly: *"has NOT been reviewed for Shariah
  compliance; choose Sukoon or Bazaar for a halal alternative."*
- Mutually exclusive with Sukoon/Bazaar at the API level (one tier per
  circle) and blocked for INVESTMENT mode (no rotating turns to price).

Verified: a 3-member, Rs 20,000/month Priority circle at 6% early fee — round
1 (earliest, full rate) deducted exactly Rs 3,600 from the recipient's payout
and split it into two Rs 1,800 dividends to the other members, paid the same
round. Test also confirmed the payout math stacks correctly with the default
15% holdback (both deductions apply; nothing is double-counted).

## Senior review pass (2026-07-08, second block) — bugs found & fixed

1. **Deposit-yield funding gap (serious).** Yield was ledgered out of
   `escrow`; at realistic parameters (12×140k: yield ≈ Rs 42k/yr vs float
   ≈ Rs 9k/yr) escrow would go negative and silently consume the members'
   float distribution. Fixed: yield now draws on
   `committee:{id}:deposit_investment` — the deposits themselves are the
   invested corpus.
2. **Float/investment double-count.** A reinvested slice earned scheme
   profit AND float profit for the same rupee-days. Fixed: float sweep now
   subtracts the deployment-window overlap per liquidated investment.
3. **Test idempotency leaks.** Priority circles stayed ACTIVE across runs
   (5-hosted cap), and a mid-run crash could leave vault parking enabled,
   contaminating the next run. Fixed: suite start now cancels all test
   circles, resets parking flags, and purges test vault ledger rows.
4. **Rate limit** raised 300 → 600 per 15 min (the suite itself was on
   course to 429 a third consecutive run).

## Payout Parking (Sukoon Vault) — added

Opt-in per member (`/api/vault`): round payouts credit `user:{id}:vault`
instead of releasing, accrue the Islamic money-market rate per parked entry
(clamped 365 days), and sweep out in full on demand — principal +
accrued profit − 5% Mudarib fee (`VAULT_SWEEP_PRINCIPAL_RECORDED`,
`VAULT_PARKING_PROFIT_SIMULATED`, `VAULT_MUDARIB_FEE_5_PERCENT`). Verified
end-to-end: park → balance visible → 30-day accrual → sweep returns
principal + profit > 0 → vault empty → second sweep 409s.

Suite is now 14 unit + 138 integration checks, re-run-safe (×2 verified).

## Third block (2026-07-08) — Bazaar "patience pays" correction + Priority polish + infra

- **Bazaar was backwards (real bug, caught by the user).** Deposit yield was
  paid to each depositor, and since early positions post the biggest deposits,
  early positions quietly earned the most — the opposite of "patience pays."
  Fixed: in Bazaar the deposit *principal* still returns in full, but its
  *yield* is now pooled into escrow and distributed through the
  patience-weighted split (`DEPOSIT_YIELD_POOLED_FOR_PATIENCE`). Sukoon keeps
  per-depositor yield (`SECURITY_DEPOSIT_YIELD_RECORDED`). Principle: early
  positions get liquidity (early payout), late positions get the yield.
  Verified: 3-member Bazaar now pays position 1 = 10,880 paisa, position 3 =
  21,757 paisa — exactly the 2x tilt, last turn earns most.
- **Priority default fee → 10%**, with a worked how-it-works panel in the
  create flow (deducted-from-payout example, declining schedule, net effect)
  and "optional / not Shariah-reviewed" reinforced.
- **Infra:** structured JSON request logging (one line per request, health
  excluded); GitHub Actions CI (`.github/workflows/ci.yml`) running
  typecheck + unit tests + build for both packages on push/PR.
- Suite: 14 unit + 141 integration, re-run-safe (×2 verified).

## Fourth block (2026-07-08) — SIGMA tier, Rs 15,000 promise, Rafa, bug fixes

Goal set by the chairman: the best-placed member of the 12-women reference
group (Rs 140,004 pool) must clear **Rs 15,000/year bonus with the early fee
hard-capped at 10%**. Achieved and locked in CI.

- **SIGMA tier** — every lever in one circle: 10%-capped early fee (declining
  curve) + float sweep + pooled deposit yield + patience tilt + optional prize
  draw. `dividendPooled` mode routes the fees through the patience-weighted
  completion split instead of equal monthly dividends. NOT Shariah-reviewed
  (fee component); consent text spells out every mechanism.
- **The ladder** (tests/sigma-max-bonus.test.ts, engine-exact integer math,
  day-one payers): Classic Rs 0 → Priority 10% Rs 7,637 → Bazaar Rs 6,306 →
  Sigma monthly Rs 13,942 → **Sigma pooled Rs 15,639 ≥ 15,000**. Conservation
  asserted: group net bonus = float + deposit profit exactly (fees are
  member-to-member). CI fails if any lever regresses.
- **Early-bird boost (halal, all engine tiers)** — ≥75% of contributions paid
  3+ days early ⇒ 1.25x weight in the completion profit split. Early money
  genuinely creates the float profit that funds it.
- **Bug fixed: stranded default_reserve.** Late penalties and insurance-reserve
  slices sat in `default_reserve` forever. Now at completion: reserve
  contributions are refunded pro-rata (`DEFAULT_RESERVE_REFUND_RECORDED`);
  penalties go to charity in Sukoon/Bazaar (`LATE_PENALTY_DONATED_TO_CHARITY_
  RECORDED` — a penalty may discipline, never enrich) or to members who never
  paid late otherwise (`LATE_PENALTY_POOL_DIVIDEND_RECORDED`).
- **Bug fixed: Shariah gap in the turn market.** Sukoon/Bazaar circles could
  sell turns at a premium. Now: free swaps only in those tiers (listing and
  bids capped at zero); premiums remain on Classic/Priority/Sigma.
- **Bug fixed: join race** — member cap re-checked inside the join transaction.
- **Vault top-ups** — `POST /api/vault/deposit` (min Rs 100): the vault is now
  a general halal savings pocket, not just payout parking. UI on Profile.
- **Rafa** — in-app mascot tutorial (8 steps): committee basics, tiers with
  halal/not-reviewed labels, where bonus money really comes from, the 10% fee
  worked example, the 12-women table (engine-verified numbers), vault, turn
  market, penalties-to-charity. Auto-opens on first login, relaunchable from
  the floating face. `components/RafaGuide.tsx`.
- Rate limit 600 → 1500/15min (suite growth). Suite: **17 unit + 207
  integration, re-run-safe (×2 verified)**; both typechecks and the web build
  clean; Rafa + Sigma picker + vault top-up verified live in the browser.

## Fifth block (2026-07-08) — clean UI, Rafa bot, 100k sim, bank removal

- **Priority 1 — typography scale-down.** A single override block at the end of
  `index.css` tames every oversized display heading (page titles 58→~30px, hero
  numbers 33-37→~22px, section h2s, etc). Verified live: welcome h1 renders at
  23px.
- **All bank mentions removed from the front-end** behind `SHOW_BANK_RAIL=false`
  (config.ts). Gated: BankKycPanel, the CreateCircle partner/custody section,
  the CommitteePage custody banner + statement import, the ProtectionCenter
  partner-gates. Reworded "custody"/"bank partner" copy in Auth/Home/Terminal.
  Verified: 0 "bank"/"custody" strings on the dashboard. Backend rail untouched
  — flip the flag to restore everything.
- **Rafa rebuilt as a 3D guide bot** (`RafaBot.tsx`, `rafa-knowledge.ts`). The
  old auto-open 8-step modal is gone. Now: an animated SVG robot (floating,
  blinking, glowing antenna) as a floating helper; a **real-time walkthrough**
  whose coach card follows the user's actual page and can walk them to the next
  one (verified: CTA navigated and the card updated Dashboard→Circles live); and
  a **FAQ chat** over a curated knowledge base (~40 rich intents, each with many
  trigger synonyms, matched by keyword scoring — covers far more than 40
  phrasings). Verified: "how does the 10% fee work" returned the correct answer.
- **Monte Carlo — 100,000 random members** (`tests/monte-carlo.ts`, seeded).
  Headline: **7.28% post-receipt default rate** under a deliberately harsh 15%
  "shaky" population and *random* turn positions. 54.6% clean, 34.5% completed
  with a late payment, 3.6% pre-receipt dropouts. **Design finding:** forfeited
  deposit + 15% holdback fully covers only **59%** of worst-case (immediate
  post-payout) defaults — the residual is the inherent ROSCA early-default risk.
  Mitigant already in the product: credit-weighted ordering puts the low-coverage
  early slots with the most reliable members (the sim ignores this, so its
  number is conservative). Invariant check passed: 0 engine circles paid negative
  member profit.

### Scavenger — recommended next levers (not yet built)
- **Anti-default (highest value):** raise early-position deposit coverage (curve
  base 70%→~90%, ceiling 90%→95%) for RANDOM_BALLOT circles so immediate
  post-payout defaults are fully collateralised; auto-recommend a guarantor when
  the modelled coverage ratio < 100%. (Now surfaced read-only in the Protection
  tab as a live "collateral coverage of your dues %".) Needs its own pass +
  renumbering of the bonus figures, so deferred to keep the suite green.
- **More profit (no partner needed):** a group *staking streak* — circles with
  a clean on-time month unlock a slightly longer float-sweep window; a
  member-referral loyalty pool funded from the platform Mudarib share.
- Suite this block: 17 unit + 207 integration still green; both typechecks and
  the web build clean; Rafa bot, clean headings and bank-free UI verified live.

## Sixth block (2026-07-08) — grace window, vault tiers, goal circles, staking streak, 3D Rafa

- **Hidden grace window (anti-default, softened enforcement).** After an
  installment's due date a member now gets a grace of ~23% of the period
  (`postDueGraceDays = clamp(round(periodDays*0.23), 2, 14)` — 7d on a 30d
  circle, 10d on a 45d circle) before the strict, irreversible measures (MISSED
  mark, post-payout default ban, collateral forfeiture). Their reliability score
  and penalties still apply on any late day (settlement.ts / delinquency.ts) —
  only the harsh consequences wait. The percentage is a code constant,
  deliberately **never surfaced in the UI**. Replaces the old flat 5-day grace.
- **Vault yield tiers.** `User.vaultTier` (STANDARD/INCOME/GOLD) → the vault
  accrues on the money-market (10.8%), Islamic income fund (12.1%) or
  gold-linked allocation (15%, a halal inflation hedge). `POST /api/vault/tier`;
  the chosen tier's dated rate applies to open entries. Profile UI has a 3-way
  tier selector. More AUM parked = more Mudarib share.
- **Goal circles.** `Committee.goalType` (HAJJ/EDUCATION/WEDDING/HOME/BUSINESS/
  CUSTOM) + `goalName` + `goalTargetPaisa`. Same engine, high-intent demand
  (Oraan's SNPL proved it). Optional selector in Create; a 🎯 chip on the card.
- **Group staking streak.** `Committee.cleanStreak` — a circle that pays cleanly
  and on time earns a float-sweep loyalty bonus of +5% per consecutive clean
  round, capped at +20%. Applied in the payout route only (route-level, so the
  pure `roundFloatProfit` and the unit bonus numbers are unaffected); a
  late/missed payment resets the streak.
- **Rafa is now a real 3D character** (outsourced build, re-verified): CSS-3D
  robot with mood states (idle/wave/celebrate/coin/nod/talking) that react to
  live actions via a `halqa:action` event bus (`lib/events.ts`): create circle →
  celebrate, installment → nod, vault deposit → coin ("💰 Saved!"), payout →
  celebrate. Chat + real-time walkthrough retained.
- Suite: **17 unit + 218 integration**, re-run-safe (×2), both typechecks + web
  build green. New integration checks: grace-window sizing, goal metadata,
  staking streak advance, and all three vault tiers.

## Seventh block (2026-07-08) — UX polish on the create flow + free-floating Rafa

- **Profit engine moved above the anti-default panel** on the create page,
  without a risky block-swap: the two `<section>`s are wrapped in a
  `.engine-first` container with `flex-direction: column-reverse`. Verified
  live: profit engine renders at y≈1866, anti-default at y≈2612.
- **Fee explainer cleaned up.** The cramped side-by-side `info-stack` for
  "How it works / Declining charge / Net effect" is now a `.fee-explainer`
  grid — each item a card with a small uppercase label above readable body
  text. Verified: 3 clean cards render when the early fee is ticked.
- **Rafa is now free-floating (no circle) with idle stunts.** The `.rafa-fab`
  circular background/shadow is gone (transparent, borderRadius 0); the robot
  is 58px. Every ~3 minutes (when the chat is closed) Rafa does a random quirky
  stunt — dance / kick / shake / 3D spin / hop / roll — and wanders to a random
  spot on screen (leftward/up, anchored bottom-right) before floating back.
  Stunt animations live on a `.rafa-stage` wrapper so they compose cleanly with
  the position transform on the button. Respects `prefers-reduced-motion`.
- Confirmed the goal selector + vault tiers were already rendering (the earlier
  "nothing new showing" was just below the fold). tsc + web build green.

## Eighth block (2026-07-08) — Terminal cleanup + duplicate-scheme bug

- **Data bug found & fixed: duplicate schemes.** The scheme catalog had been
  renamed at some point (short slugs → `-basket`/`-certificate`), but
  `syncSchemeCatalog` only upserted the new slugs — the 7 old-slug rows (plus 2
  other non-catalog strays) were left active, so the Terminal listed 38 schemes
  with only 29 unique names. Fixed at the source: `syncSchemeCatalog` now
  deactivates any active scheme whose slug isn't in the catalog (non-destructive
  `isActive:false`, safe for FK refs). One-time cleanup applied; boot prune
  guards recurrence. Now exactly **29 active, all unique**. Integration asserts
  no duplicate scheme names.
- **Terminal header risk badge was contradictory** — it showed the *selected
  scheme's* risk (e.g. Behbood = 1/LOW) right under the max-risk slider set to
  8/HIGH. Removed the header mascot/badge entirely (decorative + confusing).
- **High-return schemes were buried by scrolling.** Added a scheme toolbar: a
  sort toggle (Highest return / Lowest risk, default return) and risk-band
  filter chips (All / Low / Medium / High), plus a contained scroll. Verified:
  top schemes are now the 18% / 17.2% funds; the High chip jumps straight to the
  5 risk-7/8 schemes with one tap.
- Suite: 17 unit + **219 integration** (added the scheme-uniqueness check),
  green; both typechecks + web build clean.

## Ninth block (2026-07-08) — create flow de-risked: engine first, investing optional

The chairman's product call: member-directed investing (reinvest a slice → pick
a scheme → set a risk ceiling → the whole Terminal) is legacy core and now
*secondary* — the real value is the profit engine (float + deposits + vault),
which needs no investing decision. But the create flow front-loaded risk, so a
new host was bamboozled by risk/scheme/allocation before understanding the
simple earning. Fixed:

- **`reinvestPercent` now defaults to 0.** A new circle is pure rotating + the
  profit engine, no scheme, no member risk decision.
- **Profit engine is now the first choice** in the form (right after the
  basics), reworded in plainer language ("Earn while everyone saves", "money
  that's just waiting"). Anti-default sits just below it.
- **All investing/risk controls (mode grid, Low/Med/High band, scheme picker,
  allocation slider, risk-policy grid) are hidden behind an optional
  `.advanced-toggle`** — "Also invest a slice of the pool into a market scheme",
  off by default. Verified live: risk band / mode grid / scheme picker are
  absent until the toggle is ticked.
- **Risk removed from the header + summary.** No more risk mascot up top; the
  summary strip now reads Pool / Members / Earns-via / Goal. Title changed from
  "Build a risk-defined circle" → "Start a savings circle".
- The default (Bazaar, 0% reinvest, null scheme) maps to an already-tested API
  path (the integration Bazaar circle uses exactly reinvestRatio:0). tsc + web
  build green; unit 17 + integration 219 unchanged (API untouched this block).
- Open item for the chairman: the **Terminal** ("Growth laboratory") is still a
  top-level nav section for a now-secondary power tool — candidate to demote/
  rename to an optional "Explore", pending your call.

## Tenth block (2026-07-08) — investor dossier PDF + Rafa greetings

- **Investor/technical dossier** — `docs/HALQA-INVESTOR-TECHNICAL-DOSSIER.html`
  → `.pdf` (10,013 words, 34 pages, ~470KB). Covers market + sizing (TAM/SAM/
  SOM), personas, competitors (Oraan deep-dive w/ sources), uniqueness/moats,
  every system in detail, profit + revenue model + worked unit economics,
  verified examples, Shariah (today + how to go further), risk (100k sim, common
  concerns, scenarios), licensing (SECP NBFC), tech/architecture, roadmap,
  investor case + FAQ, disclaimers + glossary. Generated with headless Chrome
  (`--headless=new --print-to-pdf`). Regenerate: open the HTML and re-run that
  Chrome command (Chrome at C:\Program Files\Google\Chrome\Application).
- **Rafa greetings + KB expansion** — fixed the "can't answer hello" gap. Added
  a Chat category (hello/salam/aoa/thanks/bye/who-are-you/help/confused/joke/
  affirm) + ~25 more feature intents (rounds vs cycles, multiple committees,
  leaving, host-disappears, scam/legit, insured, privacy, Mudarabah, riba, which
  tier, more-shariah, improve-score, etc.). Verified live: hello, assalam o
  alaikum, who are you, which tier, thanks all answer correctly.

## Eleventh block (2026-07-08) — Terminal simplified to one section + scheme education

- **Collapsed the Terminal to a single "Investments & projected returns"
  section.** Removed the four tabs (Schemes / Portfolio lab / Strategy map /
  Decisions) — Strategy map & Decisions were internal blueprint/conflict boards
  irrelevant to members, and Portfolio lab was a separate optimiser. Now the
  page is just the scheme explorer (sort + risk-band filter + max-risk ceiling)
  with the projection chart and KPIs. Dropped the `/risk/catalog` fetch and the
  portfolio/blueprint/conflict state and their unused imports.
- **Added plain-language scheme education.** A `scheme-about` block in the detail
  panel explains what each scheme actually *is*, keyed by category (gold =
  "classic hedge against inflation and a weakening rupee"; sukuk, T-bills,
  equity, REIT, microfinance, etc.), plus a Shariah-compliant chip and the
  scheme's own note. Verified live: Gold shows Commodity + the hedge description
  + halal chip; tabs gone; title reads "Investments & projected returns".
- tsc + web build green (API untouched).

## Twelfth block (2026-07-08) — gold in create, gold growth, crypto (extreme, gated)

- **Gold hedge in committee creation.** A prominent "🪙 Back this circle with
  gold" section (create page, before anti-default) — a toggle + allocation
  slider (5–50%) with live estimated growth. On submit it overrides the
  investment config: mode→HYBRID (so gold's risk-6 is allowed), scheme→
  gold-linked-allocation, reinvest→chosen %, risk→6. No need to dig into the
  generic "Advanced invest" controls.
- **Estimated gold/engine growth.** The Terminal "Halqa earning & gold" cards
  now show "Est. 1-year growth on Rs 100,000 → Rs X" (gold: Rs 115,000). The
  create gold section shows into-gold / est-growth-per-cycle / Rs-100k-per-year.
- **Cryptocurrency scheme added** (`crypto-basket`, "Digital Asset Basket
  (Crypto)"). Pakistan has no live government-backed crypto/CBDC, so it is a
  regulated-venue basket explicitly **NOT government-backed**, riskScore **10 /
  EXTREME**, indicative 30% (speculative). Kept out of committees (they cap at
  8). In the Terminal market tab the max-risk slider now reaches 10 (default
  still 8, so you must deliberately raise it to see crypto), it carries a red
  HIGH-RISK banner, and selecting it triggers a **double-confirm modal**
  ("⚠ Extreme-risk asset" → "No, take me back" / "I understand the risk — show
  it"). Verified live. Catalog now 30 schemes; integration still 219/219.

## Thirteenth block (2026-07-09) — independent audit pass (Fable 5)

Full report: docs/FUNCTIONALITY-AUDIT-2026-07-09.md. Highlights:
- **Defects fixed:** Rafa was never mounted on the committee page (App.tsx
  renders it outside the Shell), so the pay/payout reactions fired into the
  void — now mounted on that branch too; Rafa gave two false answers (password
  reset / support channel) — corrected to honest ones + phrasing gap fixed;
  gold-hedge stale-toggle and short-period edge cases guarded.
- **Vault auto-cover implemented** (the under-delivered "do all anti-default
  measures" item): opt-in `User.vaultAutoCover`, `POST /api/vault/auto-cover`,
  delinquency pass settles an overdue installment from the member's vault via
  `VAULT_AUTO_COVER_RELEASE` + the standard settleContribution path (late
  penalty + score hit still apply; ACTIVE-committee guard so stale rounds can
  never drain a vault). Profile toggle + Rafa KB entry. Dev-only
  `POST /api/protection/delinquency/run` trigger for tests.
- **Pakistan-calibrated simulation** (tests/pakistan-sim.ts): 100k members in 5
  segments, Eid/school seasonality, income shocks, identical-randomness arms.
  Paper kameti 1.41% post-receipt default / 0% recovery vs Halqa 0.27% / 85.5%
  recovery, 64% fully collateralised. Bonus backtest (tests/bonus-backtest.ts):
  worst modelled case Rs 12,881, base Rs 15,976.
- Suite now **17 unit + 237 integration ×2**; both typechecks + build clean.

## Bug found & fixed while testing

Full-cycle testing exposed a pre-existing engine bug: payout holdbacks
created near the end of a cycle can never gather the required clean
follow-up payments, stayed `HELD` forever, and the completion pool sweep
redistributed that member's own money to everyone as "profit." Completion now
releases remaining holdbacks to their owners first
(`PAYOUT_HOLDBACK_RELEASED_AT_COMPLETION`), and the suite asserts no stuck
holdbacks remain.

## Verified earnings (engine output, not projection)

3-member test circle, Rs 20,000/month, 19-day float window, full cycle:
float profit ledgered every round; distribution came out exactly
10,478 / 15,718 / 20,959 paisa for positions 1/2/3 = the disclosed
1.0x/1.5x/2.0x tilt.

Extrapolated to the reference case (12 members × Rs 11,667/month,
Rs 140,000 pool, current indicative rates, ~19-day average float window),
per person per year:

| Position | Float share | Deposit yield | Year total | 3-year total |
|---|---|---|---|---|
| #1 (earliest) | ~500 | ~9,250 | **~9,750** | ~29,200 |
| #6 (middle) | ~725 | ~2,750 | **~3,480** | ~10,400 |
| #12 (last) | ~1,000 | 0 | **~1,000** | ~3,000 |

Honest notes: the mid position crosses Rs 10,000 at the 3-year mark; early
positions well before. The **last positions do not** get there from this
engine alone — they need the prize draw, the bank-partner boosts (merchant
payout vouchers, tabarru-structured priority) or a personal vault, which is
why those remain on the roadmap. Deposit yield is yield on the member's own
locked capital. All figures are indicative, tied to dated scheme rates, and
the deposit yield currently draws on the pooled realised profit (acceptable
at these ratios; revisit if deposits ever dwarf float profit).
