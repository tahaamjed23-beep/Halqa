# Report 1 — MASTER PRODUCT REPORT (v3, expanded)
### Everything that exists in Halqa, how it fits together, why each piece is shaped the way it is, and exactly where the Shariah line runs.
*State as of 2026-07-13 · verified by 25 unit + 262 end-to-end checks (run twice consecutively), both typechecks, production build, and a manual UI walk on desktop and phone widths — including the Urdu toggle and the bank receivables export, exercised live in the browser.*

## 0. The one-breath version
Halqa is Pakistan's committee (kameti/BC/ROSCA) made digital and honest: the same contribute→rotate→collect loop people already trust, plus four things paper can never do — enforcement instead of blind trust, real halal profit on idle money, a portable credit identity, and total honesty about what is halal and what is not. In Stage 1 **money is recorded, never held**: members pay each other directly and Halqa keeps the enforceable ledger. There is no pot to steal because there is no pot.

## 1. Why the committee, and why record-only (the two founding decisions)
- **Why the committee:** it is the one financial instrument the market already runs at national scale (~41% participation, ~US$5B/yr rotating). Halqa creates no new behaviour; it removes the three flaws of the existing one — fragility (one abscond destroys months of savings), zero yield (the pool idles while inflation eats it), and invisibility (twenty years of discipline builds no credit file).
- **Why record-only:** custody is what turns a committee app into a regulated financial institution — and custody is what every historical committee fraud actually was (a single operator holding everyone's money). Stage 1 deliberately holds nothing: members transfer to each other over Raast/wallets/cash and record the reference; Halqa enforces the schedule, the collateral, the scores and the ledger. Custody arrives only with the SECP NBFC licence (the path Oraan proved: SECP/LRD/107/OFSPL/2023) or a regulated custodian partnership. This is simultaneously the compliance posture, the trust pitch, and the security model.

## 2. The member journey, screen by screen
- **Auth** — register (starts at reliability score 700) or sign in; optional **referral handle** at signup (the referrer earns a loyalty bonus when the new member completes a first full cycle — funded from Halqa's own share, never from members). Passwords changeable in-app (Profile → Security); a password change signs out all other sessions.
- **Dashboard** — next installment, next payout, recorded savings, your circles; "Host a committee" gated at score 700. Assalam-o-Alaikum greeting, streak chip, updates count.
- **Language** — a one-tap **English ⇄ اردو toggle** in the sidebar flips the app to Urdu with full right-to-left layout, instantly, on every open screen. First-touch surfaces (navigation, home hero, trust banner) ship translated; deeper pages roll out on the same dictionary. In a market where only 24% of women own a phone and most onboarding is assisted, the person helping a new member is often more comfortable in Urdu — the toggle is an inclusion feature, not a cosmetic one.
- **Circles** — your committees + join by invite code, with a **pre-join preview** (terms + the host's verified reputation card) *before* committing. Two join guards run server-side:
  - a reliability floor (score ≥ 550), and
  - the **first-circle cap**: a member who has never completed a full cycle anywhere on the platform cannot join a circle above **Rs 25,000 per installment**. Newcomers prove themselves in small circles before touching big money — the same graduated-exposure logic a good host applies socially, now enforced in code. Complete one clean cycle and the cap lifts forever.
- **Create flow** (host) — deliberately simple-first:
  - Basics: name, members 3–30, contribution, period 7–365 days, optional **goal tag** (Hajj/education/wedding/home/business + custom name).
  - **Profit engine** (the star, in plain language): tick levers — Earn on idle money (Sukoon base) · Patience pays (Bazaar) · Monthly gift draw · Early-turn fee (conventional). The named tier (Classic/Sukoon/Bazaar/Priority/Sigma) is derived live with a halal/not-reviewed chip, so the host always knows which side of the line she is configuring.
  - **Gold hedge** (optional): put 5–50% of every pool into the gold-linked allocation with live estimated growth; auto-guards (hidden in Investment mode; disabled under 10-day periods because gold needs 3 days to liquidate before payout).
  - **Anti-default panel**: holdback, penalties, locks, nudges, deposits, guarantor.
  - **Advanced (off by default)**: only here do risk bands (Low/Med/High auto-selecting the best eligible scheme), the scheme picker, and the allocation slider appear. A first-time host never meets an allocation slider.
- **Committee page** — hero (payout, your position, round), engine banner with full disclosure, five tabs: Turns & people · Payments (record installment with rail + reference) · Growth (host deploy/liquidate within the locked mandate) · Protection (live safeguards, collateral coverage %, peer nudges, commitments) · Chat (members-only, real-time).
  - Hosts additionally get the **Bank pack** button (Payments tab, active circles): one tap exports a bank-facing JSON statement of the circle — future-round inflow schedule, per-round and total expected receivables, each member's reliability score, KYC level, on-time percentage and collateral held, plus the record-only disclaimer. This is the artifact a host (or Halqa, at partnership scale) hands a banker who asks the two questions bankers actually ask about committees: *what receivables are coming, and how reliable are the payers?* It turns a social arrangement into an underwritable schedule.
- **Market** — turn trading: free swaps only in halal tiers; premium listings/bids (≤50% of payout) in conventional tiers only, and labelled as such.
- **Terminal ("Growth laboratory")** — two tabs: **Halqa earning & gold** (the four engine sleeves with their roles + estimated 1-year growth on Rs 100k) and **Market investments** (26 schemes, sort by return/risk, Low/Med/High/Extreme band chips, per-scheme education, projection modeller). Crypto appears only at ceiling 10 with a red banner + double-confirm.
- **Profile** — score ring + credit events; **Sukoon Vault** (parking, top-ups, four yield tiers, auto-cover toggle, full sweep); Credit Passport generator; change password.
- **Rafa** — free-floating 3D assistant: reacts to real actions (pay→nod, deposit→coin, create/payout→celebrate), idle animations, a real-time page-following walkthrough for new members, and a ~120-intent FAQ chat (greetings included) with honest fallbacks — when Rafa doesn't know, Rafa says so rather than inventing. Present on every screen including inside committees; becomes a bottom sheet on phones.

## 3. The five committee tiers — and the exact Shariah map
| Tier | Mechanics | Shariah status (as labelled in-app) |
|---|---|---|
| **Classic** | Pure rotation; no engine | Neutral (no investment activity) |
| **Sukoon** | Float sweep (~10.8% money-market) + deposits earn Mudarabah (~11.2%) paid to the depositor | **Halal structure** 🟢 |
| **Bazaar** | Sukoon + patience tilt: float + deposit yield pooled, split by capital-days × weight 1.0→2.0× (first→last turn) | **Halal structure** 🟢 |
| **Priority** | Early-turn fee ≤10% deducted from the early member's own payout, declining to 0%, redistributed to waiting members | **NOT Shariah-reviewed** 🟠 (prices early access) |
| **Sigma** | Everything at once; fee optionally pooled through the patience split; reference max bonus **Rs 16,982/yr** (CI-locked) | **NOT Shariah-reviewed** 🟠 |

**The complete Shariah map (memorise this):**
- 🟢 Halal by design: float sweep · Mudarabah deposits · patience tilt · early-bird boost · staking streak · vault Standard/Income/Gold tiers · penalties→charity · free turn swaps · goal circles · the referral bonus (paid from Halqa's own Mudarib share — member money is never touched).
- 🟡 Halal-intent, pending formal board sign-off: the prize draw (hiba — principal never staked, deterministic draw).
- 🟠 Labelled NOT Shariah-reviewed: the early-turn fee (Priority/Sigma) · turn-market premium sales · vault **Crypto** tier.
- The label appears at: tier picker chips, engine summary, committee-page banner, consent text, vault tier buttons, terminal scheme cards, and both crypto confirm modals. A fully halal path is always one tap away, and the conventional path is never mislabelled to capture a fee.

## 4. The earning levers (each explained, with its design reason)
- **Float sweep**: every paid contribution earns the Islamic money-market rate for the exact days it sat before payout (clamped so backdating can't fabricate profit); realised each round net of Halqa's 5% share. *Design reason: this is the profit that exists in every committee and has been wasted for a century — capturing it requires changing nobody's behaviour.*
- **Deposits that earn**: security deposits accrue ~11.2% Mudarabah all cycle; Sukoon pays the depositor, Bazaar/Sigma pool it into the tilt; principal always returns in full. *Design reason: collateral that costs the member nothing is collateral nobody resents posting — protection and profit from the same rupees.*
- **Patience tilt**: completion profit splits by capital-days × disclosed position weight (1.0→2.0×). *Design reason: the late turns carry the committee (and the inflation cost); paper committees never compensated them — this is the fairness correction that makes late positions desirable rather than punitive.*
- **Early-bird boost**: ≥75% of payments made 3+ days early ⇒ 1.25× profit weight. *Self-funding: early money is what creates the float profit being shared.*
- **Staking streak**: +5% float bonus per consecutive clean round (cap +20%); any late payment resets. *Collective discipline literally pays — the group polices itself.*
- **Prize draw (opt-in)**: half a round's net float profit gifted to one on-time payer, chosen by a replayable deterministic hash; principal never staked. *The kameti-culture "lucky draw", rebuilt so it stakes nothing.*
- **Priority/Sigma fee**: ≤10%, deducted from the early member's own payout, redistributed to the waiting members — Halqa keeps none; Sigma can pool it through the tilt (that is what reaches Rs 16,982). *Quarantined, capped, opt-in and labelled — the one conventional mechanic, priced transparently instead of by auction.*
- **Gold hedge**: 5–50% of each pool into the gold-linked allocation (~15% indicative) — the culturally-trusted inflation hedge, the same asset that backs roughly half of some MFB loan books.
- **Referral loyalty**: Rs 250 to the referrer when a referred member completes their **first full cycle** — not at signup. *Paying on completion, not registration, means the incentive rewards exactly the behaviour the platform needs (finished, clean circles) and cannot be farmed by fake signups. Funded from Halqa's own platform-fee share; strictly once per referred member, enforced at the ledger level.*

## 5. The Sukoon Vault (the personal layer)
- **Parking**: payouts stay recorded in the vault, earning, until swept — the single highest-leverage behaviour for both the member and Halqa's revenue line.
- **Top-ups**: any amount from Rs 100; no committee needed — the vault works as a standalone halal savings pocket.
- **Four tiers**: Standard ~10.8% 🟢 · Income ~12.1% 🟢 · Gold ~15% 🟢 · **Crypto ~30% "rate" (speculative)** 🟠 — the crypto tier is switchable only through a UI double-confirm **and** an API-level `acknowledgeExtremeRisk` gate (the server refuses a silent switch with HTTP 428), affects only the personal vault, and can never touch committees. It exists to prove the system can say no.
- **Sweep**: full withdrawal anytime — principal + accrued profit − 5% Mudarib share on profit only.
- **Auto-cover** (opt-in): an overdue installment settles itself from the member's vault via the standard settlement path — the late penalty and score hit still apply (fair to the group), but the miss never escalates toward default. The member's own savings become their default insurance: no pool, no premiums, no moral hazard.

## 6. The default-protection stack (every layer coded and tested)
1. **Score gates**: 550 to join, 700 to host; +6 early / +4 on-time / −10/−20/−40 late / +25 clean completion.
2. **First-circle cap**: unproven members (zero completed cycles) limited to circles of ≤ Rs 25,000/installment — exposure graduates with demonstrated behaviour.
3. **Graduated deposits** sized to position — early turns owe the group more, so they post more: deposits now cover **90% of a member's remaining dues** (capped at 95% with credit adjustments). Productive collateral that earns while protecting; always returned in full.
4. **15% payout holdback**, released after clean follow-up payments (and force-released at completion — a stuck-holdback bug was found and fixed by test, which is the point of having 262 of them).
5. **Credit-weighted ordering** — reliable members occupy the risky early slots by default.
6. Reminders → **calibrated post-due grace window** (an internal fraction of the period, clamped 2–14 days; deliberately never shown in UI so it cannot be gamed) — penalties/score apply during it, escalation waits.
7. **Progressive fixed penalties** (2/5/10% bands, never compounding). Destination: **charity** in halal tiers; never-late members otherwise; unused reserve refunded at completion.
8. **Vault auto-cover** (above) · optional guarantor · post-payout default ⇒ platform ban + collateral forfeiture + open recovery case with a rehabilitation path (clear dues + fee ⇒ restored with cooldown).
9. Live **collateral-coverage %** shown to each member in the Protection tab — protection you can see.
- **Quantified**: calibrated 100k-member simulation — defaults **1.41% → 0.27%**, recovery on default **0% → 90.4%**, defaults fully collateralised **70%**, worst segment (overcommitted) 7.95% → 0.83% — locked by 8 CI assertions including dual-seed robustness. The coverage raise to 90% is what pushed recovery from the mid-80s to 90%+.

## 7. Reputation & trust surfaces
- **Credit Passport**: signed export (clean completions, on-time %, total recorded) with a public verification link any lender can check without a Halqa account; 90-day validity; regenerable. The informal economy's first exportable credit file.
- **Bank receivables pack** (host-side): the institutional counterpart of the Passport — where the Passport proves a *person*, the pack proves a *circle*: forward inflow schedule + member reliability + collateral held, exportable in one tap.
- Host reputation card at join-time; pre-join preview; committee chat; live protection matrix with peer nudges.

## 8. The catalog (31 schemes)
- **Engine sleeves** (shown separately): Islamic money-market (float/Standard) · Islamic Mudarabah deposits · Islamic income fund (Income tier) · gold-linked (Gold tier / gold hedge).
- **Market universe** (advanced investing only): T-bills/PIBs, National Savings certificates, sovereign & corporate sukuk 🟢, money-market/income/balanced/asset-allocation/equity funds, PSX ETF (~18%), Shariah equity fund 🟢, REIT 🟢, Murabaha trade finance 🟢, microfinance deposits, private credit, multi-asset, **Digital Asset Basket (Crypto)** — risk 10/10 EXTREME, not government-backed, barred from committees.
- Every card: dated rate + "rate verified" stamp (stale-rate warnings), liquidity days, volatility/credit inputs, source link, plain-language "what this actually is" education.

## 9. Engineering facts (meeting-grade)
- React + TypeScript + Vite front (PWA: manifest, theme-color, installable to a phone home screen; responsive layout with bottom-sheet assistant; Urdu/RTL localisation layer); Node/Express + Prisma/PostgreSQL back; Socket.IO chat.
- **Integer paisa everywhere on a double-entry ledger** — every entry carries debit, credit, reason code, reference and an idempotency key; every balance reconstructible from first principles; profit conservation asserted by tests (bonuses across a cycle sum exactly to real profit created — the ledger cannot invent a rupee).
- **25 unit/property tests + 262 integration checks** across the full lifecycle — the Rs 16,982 promise, the simulation's headline claims, the first-circle cap, the referral bonus's once-ever guarantee, the receivables pack's host-only access, crypto gating, password rotation — re-run-safe and self-healing; CI runs typecheck + tests + build on every change.
- Structured JSON request logs, DB-checked health endpoint, rate limiting (strict in production), hourly delinquency scheduler, root error boundary.
- Bank-custody/guarantee rail fully built against a production-shaped sandbox, feature-flagged OFF (one flag restores it when a partner and a licence exist).

## 10. Honest boundaries — say these before anyone asks
- **No custody, no real deployment** until the SECP NBFC licence; all yield is computed at dated indicative rates and labelled "never guaranteed."
- Prize draw pending Shariah-board sign-off; Shariah claims are design-intent, not a fatwa — and the app says so.
- No self-service password *reset* while logged out yet (change-password exists in-app); no support inbox beyond chat + the assistant; no migrations/backups/staging yet; simulations are calibrated models, not ledger history — replacing the model with real ledger data is what the pilot is for.
