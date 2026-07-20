# Strategy, Anti-Default Model, Investment Upgrade & Bank Partnership Path

Date: 2026-07-05
Builds on: MARKET-REALITY-AND-SYSTEM-AUDIT.md (read that first — this doc
assumes its findings). Every factual claim is sourced; every recommendation is
labeled as sourced-fact-based or a judgment call.

---

## 1. What Oraan actually does to prevent defaulters (sourced, specific)

This is more concrete than "credit score" — Oraan uses five real mechanisms:

1. **Real KYC, not self-declared identity.** CNIC front/back required on
   first application; the app can additionally request **proof of address
   and proof of income** before approval.
   [Oraan Help Center — verification docs](https://help.oraan.com/docs/oraan-help-articles/verification/what-documents-are-required-for-verification-for-oraan-committee/)
2. **Verified bank account, not a claimed one.** Every linked account is
   verified; adding someone else's account requires their CNIC too. This
   stops the "I'll just type in any account number" failure mode entirely.
   [Oraan Help Center — verification](https://help.oraan.com/docs/oraan-help-articles/verification/)
3. **Reference-based cross-liability.** If your *reference* (the person who
   vouches for you) has a pending balance or is a defaulter, **Oraan can drop
   you** from the committee before you even become a problem. This is a
   guarantor model enforced automatically, not socially.
4. **Family cross-liability.** If you *or a family member* defaults, Oraan
   has the contractual right to **withhold your payment** from a different
   committee to recover the shortfall. This extends liability beyond a
   single committee to the whole account relationship.
5. **Slot-priced, non-refundable management fee — this is the real
   innovation.** Instead of a refundable security deposit, Oraan simply
   **charges more to receive your payout earlier.** "Management fees for
   selecting the payout in earlier months are higher compared to later
   months." [Oraan — early payout fee](https://help.oraan.com/) /
   summarized from public listings and terms.

**Why #5 matters more than it looks:** it solves the exact problem our own
spec's "security deposit" was trying to solve, but more simply. A refundable
deposit requires the user to trust they'll get it back, requires escrow
logic, and creates a support burden ("where's my deposit?"). A **non-
refundable fee, priced by position risk, collected upfront** is:
- Immediately understandable (it's just a fee, like a booking fee)
- Self-funding — the fee revenue itself can capitalize a default-reserve pool
- Legally simpler in Stage 1 (a recorded service charge, not funds "held in
  trust" that create custody questions)

**Recommendation:** adopt Oraan's model as Halqa's *primary* anti-default
lever, not the refundable-deposit model in the original spec. Concretely:
early positions (1 to N/3) pay a small **priority fee** at join time (e.g.
1-3% of expected payout, scaled by position), later positions pay less or
none. This fee funds a **committee-level reserve** that backstops a default
instead of relying purely on credit score + turn order. Combine with
credit-weighted order (already built) rather than replacing it — Oraan
appears to use verification + fees as the primary lever and doesn't need
turn-order weighting because most of their committees likely use
consent/host-assignment; we can do *both*, which is a real edge.

---

## 2. What would make Halqa genuinely new, not "Oraan with extra steps"

Be blunt: a committee app with KYC, fees, and a ledger is not new — Oraan
already does that, is licensed, and has a head start. Copying its
default-prevention playbook (Section 1) is smart *operationally*, but it is
not differentiation. Here is what actually is, based on gaps Oraan does not
appear to fill:

1. **Oraan's fee model keeps 100% of the fee for itself; Halqa's model
   shares real yield back to members.** Oraan's revenue is a management fee
   charged *to* the user for a service. Halqa's model — reinvest a slice,
   split *realized profit* with members, take a small percentage of that
   profit — is structurally more generous and is a genuinely different pitch:
   **"the platform only earns when you do."** This is worth leading with in
   marketing, and it's true today even in Stage 1 simulation.
2. **Fixing the first/last-receiver unfairness is not something any
   Pakistani committee product appears to advertise solving.** (Confirmed:
   no source found describing this being addressed by Oraan or any other
   product.) Weighting profit distribution toward later positions
   (Section 5.2 of the audit doc) is a concrete, explainable, honest feature
   that answers a *named, published, real complaint* about committees
   ([DAWN](https://www.dawn.com/news/1725956/the-faults-in-our-committees))
   that the market leader does not appear to solve. This is your strongest
   differentiation claim and it costs almost nothing to build — it's a
   distribution formula change, not new infrastructure.
3. **A visible, host-agnostic trust ledger** — Oraan is itself the
   trusted party (you trust Oraan, not the "host," since Oraan is the
   money-keeper). Halqa's design still has a *human host* configuring the
   committee. That's actually closer to how committees have always worked
   (a trusted community member runs it) — so Halqa's honest positioning is
   **"your committee, your community, but with an accountant no one can
   argue with"** — versus Oraan's **"we run the committee for you."**
   Different market: Halqa can serve existing community committees that
   *already have a host they trust* and just want the recordkeeping/
   investment/anti-fraud layer, rather than convincing people to hand their
   committee to a company outright. That is a real, different wedge.
4. **Multi-cadence design (very-short/short/mid/long) is more flexible than
   what's publicly documented for Oraan**, which markets primarily 5- or
   10-month plans. A 7-14 day "very short" cycle option (Section 3 below)
   targeting quick, small-value community groups is an underserved segment
   if community groups want faster cycles than what Oraan's plans offer.

**Direction, stated plainly:** don't try to out-Oraan Oraan on
verification/fees (they got there first and are licensed). Win on (a) profit-
sharing instead of pure fee extraction, (b) fixing the specific, named
unfairness in traditional committees, and (c) serving hosts who want to keep
running their own community committee rather than handing it to a company.

---

## 3. Committee duration economics: short / mid / long, honestly estimated

**No public survey gives exact average committee size/amount/duration
breakdowns by cadence in Pakistan** — the sources found say committees
"typically run... usually one year"
([search summary](https://www.dawn.com/news/832118)) and that Oraan's plans
are 5- or 10-month, starting at Rs 1,000/month
([Oraan Google Play](https://play.google.com/store/apps/details?id=com.oraan.android)).
Beyond that, precise averages are not publicly published. The table below is
a **reasoned framework**, not a sourced statistic — flag it as such to
anyone using it for real financial projections, and validate with real
early-user data once Halqa has any.

| Cadence | Period | Typical N (est.) | Typical monthly contribution (est., PKR) | Full-cycle pool per member (est.) | Reasoning |
|---|---|---|---|---|---|
| VERY_SHORT | 7-14 days | 4-8 | 500-3,000 | 2,000-24,000 | Fast, small, low-trust-required groups (coworkers, small circles); matches Oraan's Rs 1,000 floor and below |
| SHORT | 1-2 months | 6-12 | 2,000-10,000 | 12,000-120,000 | Matches the classic "monthly committee" — Oraan's most common product shape |
| MID | 3-6 months | 8-15 | 5,000-25,000 | 40,000-375,000 | Larger goals: appliance, small business restock, semester fee |
| LONG | 8-12 months | 8-20 | 10,000-50,000 | 80,000-1,000,000 | Matches "committees typically run one year"; big goals: wedding, property deposit, business capital |

**How the investment layer should differ by cadence (recommendation):**
- **VERY_SHORT**: reinvestRatio should default low or **0%** — periods are
  too short for T-Bill/NSC tenors (91-day minimum) to mature meaningfully
  within a round; forcing an investment here mostly adds liquidation-timing
  risk for negligible return. Scheme choice, if used at all: overnight/
  short-tenor money-market funds only (T+1 redemption).
- **SHORT**: matches money-market fund liquidity well (daily NAV, T+1
  redemption) — this is the natural home for Codex's money-market fund idea
  (#10/#11 in the prior list), which was one of the better-reasoned entries
  there.
- **MID**: matches 91-day and 182-day T-Bill tenors almost exactly (a
  3-6 month committee period can hold a 91-day bill to maturity without
  early-redemption discount loss) — this is the strongest natural fit in the
  whole catalog and should be the flagship "MID = T-Bill" pairing in the UI.
- **LONG**: matches 182-day/364-day T-Bills and National Savings certificates
  (Behbood, RIC, SSC — semi-annual/monthly profit structures) which need
  multi-month holds to avoid early-encashment penalties. This is where the
  **laddering idea** (stagger across 91/182/364-day tenors so something
  matures near each payout date) has real merit — flagged as reasonable in
  the audit doc, and cadence=LONG is exactly where it applies best.

**Concrete rule to add to the create-committee wizard:** when a host picks a
cadence, **auto-filter the scheme picker to schemes whose tenor is ≤ the
committee's periodDays** (or close to it), so a host can't accidentally pick
a 364-day T-Bill for a 30-day committee and get hit with early-redemption
losses. This is a real bug-shaped gap in the current build — nothing stops
that mismatch today.

---

## 4. How to get genuinely better returns, responsibly (not yield-chasing)

Given Section 4 of the audit (real yield on safe instruments is ~0-3% after
inflation), "better returns" has to come from **structure**, not from taking
more risk, or it contradicts the low-risk-only decision already locked in.
Three legitimate levers:

1. **Aggregate across committees for institutional pricing.** A single
   member investing Rs 20,000 gets retail rates. If Halqa (or its future
   custody partner) pools the reinvested slices from **many committees
   together** before deploying into a scheme, the combined capital can access
   **bulk/institutional NSC or T-Bill placements**, which sometimes carry
   marginally better terms than small retail deposits, and definitely reduces
   per-transaction overhead. This is the "Cross-Committee Investment Pool"
   idea from the prior list — it's one of the few in that list that's both
   low-risk and genuinely additive. Needs a licensed custody partner to do
   for real (Section 5); can be simulated/modeled now.
2. **Laddering matched to cadence** (Section 3) — captures slightly better
   yield by matching maturity to actual hold time instead of either (a)
   leaving money in an overnight instrument the whole time (leaves yield on
   the table) or (b) locking into a 364-day instrument and eating an
   early-redemption penalty when the committee needs to pay out sooner
   (destroys principal). This is free — it's an allocation rule, not a new
   product.
3. **Reduce our own fee drag at small scale.** The current 5% platform fee
   on profit is reasonable, but on the real ~0-3% net yields in Section 4,
   5% of a *small* number is a *very* small number in absolute terms — not
   worth much distraction, but also not worth shrinking trust over. Consider
   **waiving the fee entirely below a minimum profit threshold** (e.g., don't
   take a fee if realized profit per member is under some small PKR floor) —
   costs us little revenue at that scale, and avoids the optics of taking a
   cut of a trivial amount, which would look bad relative to member goodwill.

**What NOT to do to chase yield** (already covered in the audit, restated
because it's the direct answer to "better returns"): do not raise the risk
ceiling into equity/crypto/lending products to manufacture bigger numbers —
that breaks the low-risk-only decision, breaks the Shariah-sensitivity
finding, and turns one bad quarter into the platform's Rs-420-million moment.
The honest, structurally sound path to "more value" is participation +
allocation efficiency, not risk-taking.

---

## 5. Bank / NBFC partnership path for Pakistan (concrete, sourced)

You already decided (owner input) that a bank partner is needed and that
you'll try to get one, no guarantee. Here is the realistic, current path,
not a generic "talk to a bank" answer:

1. **Apply to the SBP Regulatory Sandbox.** SBP opened cohort applications
   under May 2025 guidelines, testing solutions in a controlled live
   environment for up to six months.
   [SBP sandbox press release](https://www.sbp.org.pk/press/2026/Pr-06-Jan-2026.pdf),
   [Open Banking Expo coverage](https://www.openbankingexpo.com/news/state-bank-of-pakistan-unveils-first-cohort-of-regulatory-sandbox-applicants/)
   This is the lowest-friction, most realistic near-term path to operate
   *with real oversight* before needing a full licence or a bank's direct
   sign-off — SBP already ran a cohort including Bank of Punjab and fintech
   applicants like Barq Fintech. Apply for the next cohort with the
   Stage-1 ledger + Stage-2 custody-partner design as your submission.
2. **Target a Banking-as-a-Service (BaaS) / licensed NBFC infrastructure
   provider instead of going straight to a large commercial bank.** A
   concrete example already operating in Pakistan: **Neem** — a fully
   SECP-licensed NBFC providing financial infrastructure APIs, backed by
   partnerships with major Pakistani banks.
   [neem.io](https://www.neem.io/)
   This is the realistic door to knock on: a BaaS/NBFC provider already has
   the licence and the bank relationships, and integrates via API rather
   than requiring Halqa itself to become a bank's direct enterprise client
   from a standing start. This is a materially easier first conversation
   than approaching HBL/UBL/Meezan directly.
3. **Build on Raast for the payment rail once custody exists.** Raast is
   SBP's free (no transaction fees), API-based instant payment system,
   already processing 1.5 billion+ transactions worth PKR 34 trillion, with
   an explicit open-API ecosystem for fintechs and a P2M (person-to-merchant)
   phase enabling direct account-to-account collection.
   [SBP — Raast](https://www.sbp.org.pk/dfs/Raast.html),
   [World Bank Raast case study](https://fastpayments.worldbank.org/sites/default/files/2022-05/Pakistan_RAAST_Case_Study_%20May_2022.pdf)
   This is the natural rail for the "automated collection" upgrade Oraan
   already has (Section 1, mechanism #2/#5) — once a custody partner exists,
   Raast is very likely cheaper and faster to integrate against than
   JazzCash/Easypaisa proprietary APIs, and it's government-backed
   infrastructure, not a single company's product.
4. **Sequencing recommendation:** (a) finish and demonstrate the Stage-1
   ledger with real early users first — this is the credible proof-of-concept
   a sandbox application or BaaS partner will actually want to see; (b) apply
   to the SBP sandbox cohort in parallel, since it's a 6-month controlled
   test, not a final licence commitment; (c) approach a BaaS/NBFC provider
   (Neem or equivalent) as the custody/execution partner referenced
   throughout the existing Stage 2 plan, rather than a big bank directly;
   (d) integrate Raast once a partner relationship exists for real collection
   and payout.

---

## 6. What to build next, given all of the above (short, ordered)

1. Adopt Oraan's **priced-by-position fee model** as the primary anti-default
   lever (Section 1), alongside the already-built credit-weighted order.
   Replace or supplement the refundable-deposit design with this simpler,
   Stage-1-compliant mechanism.
2. Weight profit distribution toward later turn positions (audit doc,
   Section 5.2 / Section 2 above) — the single clearest, most honest
   differentiation move available, and cheap to build.
3. Auto-filter scheme choice by cadence/tenor fit (Section 3) — closes a real
   gap that could otherwise cause an early-redemption loss for a host who
   picks an ill-matched scheme.
4. Add the cross-committee pooled-allocation concept to the *roadmap*
   (not urgent — needs the custody partner from Section 5 to be real, but
   worth designing the schema for now so it isn't a rewrite later).
5. Start the SBP sandbox application and a first outreach conversation with
   a BaaS/NBFC provider (Neem or equivalent) in parallel with product work —
   this is a months-long process and should not wait for the product to be
   "finished."

---

## Sources (consolidated)

- [Oraan Help Center — verification documents required](https://help.oraan.com/docs/oraan-help-articles/verification/what-documents-are-required-for-verification-for-oraan-committee/)
- [Oraan Help Center — verification](https://help.oraan.com/docs/oraan-help-articles/verification/)
- [Oraan Support Center](https://help.oraan.com/)
- [Oraan — Google Play listing](https://play.google.com/store/apps/details?id=com.oraan.android)
- [DAWN — The faults in our committees](https://www.dawn.com/news/1725956/the-faults-in-our-committees)
- [DAWN — Committees popular for saving/lending in Pakistan](https://www.dawn.com/news/832118)
- [SBP — Regulatory Sandbox cohort press release](https://www.sbp.org.pk/press/2026/Pr-06-Jan-2026.pdf)
- [Open Banking Expo — SBP sandbox cohort coverage](https://www.openbankingexpo.com/news/state-bank-of-pakistan-unveils-first-cohort-of-regulatory-sandbox-applicants/)
- [Neem — financial infrastructure for Pakistan](https://www.neem.io/)
- [SBP — Raast: Pakistan's Instant Payment System](https://www.sbp.org.pk/dfs/Raast.html)
- [World Bank — Pakistan RAAST case study](https://fastpayments.worldbank.org/sites/default/files/2022-05/Pakistan_RAAST_Case_Study_%20May_2022.pdf)
