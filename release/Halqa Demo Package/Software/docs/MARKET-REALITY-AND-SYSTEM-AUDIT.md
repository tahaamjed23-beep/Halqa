# Market Reality & System Audit — No Bias, No Bullshit

Date: 2026-07-05
Purpose: ground Halqa's design in how Pakistani committees *actually* work, who
*actually* uses them, and what real interest-rate/inflation math implies for the
"investment" feature — then honestly grade our current build and the Codex
"100 options" list against that reality. Every factual claim below is sourced.
Where something is a judgment call rather than a fact, it's labeled as such.

---

## 1. How the Pakistani committee market actually works (sourced)

- **Scale**: ~41% of Pakistan's population has used a committee/ROSCA at some
  point — roughly 100 million people. Split is roughly 23% women, 18% men.
  [Oraan case study](https://picg.org.pk/wp-content/uploads/2024/10/Oraan-case-study.pdf),
  [Kantar/Finclusion](https://finclusion.org/blog/roscas-and-mobile-wallet-adoption-in-pakistan.html)
- **Mechanics**: identical to what we built — fixed group, fixed periodic
  contribution, one person takes the full pot per round (by draw or consent),
  rotates until everyone has received once. Traditionally a trusted
  "money-keeper" (often *not* the eventual host — usually a respected member)
  holds the cash with no formal records.
  [Oraan: Understanding ROSCAs](https://www.oraan.com/post/understanding-roscas-a-guide-to-committees-and-bcs),
  [Meer](https://www.meer.com/en/84578-pakistans-committee-system-benefits-and-risks)
- **Who actually joins**: originally housewives; now also teachers,
  shopkeepers, white-collar and blue-collar workers. Overwhelmingly
  community/workplace-based — friends, relatives, or colleagues who already
  trust each other, precisely *because* formal credit is hard to get for this
  segment. [Synergyzer](https://synergyzer.com/committees-rewiring-the-pakistani-mindset-around-money/),
  [Meer](https://www.meer.com/en/84578-pakistans-committee-system-benefits-and-risks)
- **Why they join instead of using a bank**: (a) **zero interest** — this is
  not incidental, it's the main draw, tied to a widely held view that interest
  (riba) is religiously impermissible; (b) informal, flexible, no paperwork or
  credit check; (c) social trust does the enforcement a bank would do with
  contracts. [Meer](https://www.meer.com/en/84578-pakistans-committee-system-benefits-and-risks)

**Verdict on "the average user":** low-to-middle income, often women, joining
through an existing social circle (family/colleagues/neighbors), whose primary
motive is disciplined saving and once-in-a-cycle lump-sum access (school fees,
a wedding, a small business input, an appliance) — not yield-seeking. This
matters enormously for feature design (Section 5).

---

## 2. The documented structural flaws of traditional committees (sourced)

DAWN's ["The faults in our committees"](https://www.dawn.com/news/1725956/the-faults-in-our-committees)
identifies two specific, named structural problems — not vague "fraud risk":

1. **First-receiver advantage / last-receiver erosion.** The person who
   receives the pot in round 1 got full purchasing power; the person who
   receives in the final round effectively lent their money for free through a
   period of real inflation and rupee depreciation, and gets back a pot whose
   real value has shrunk. In Pakistan, that erosion is not theoretical: CPI
   inflation was ~11.07% YoY in June 2026, having been ~10.9-11.7% through the
   spring. [TradingEconomics](https://tradingeconomics.com/pakistan/inflation-cpi),
   [nsave](https://www.nsave.com/pakistan/inflation)
   Over a 10-round monthly committee, a last-receiver's payout can lose
   roughly **9-10% of real purchasing power** just from inflation over the
   cycle, before any investment math even enters the picture.
2. **Correlated default risk.** Committees are usually formed within one
   social/economic network (one office, one neighborhood). If that network
   gets hit by one shock — delayed salaries, layoffs at the shared employer —
   *many members default at once*, because the thing that makes committees
   trustworthy (shared circumstances) is the same thing that makes them
   fragile (shared risk). This is structurally different from a bank
   diversifying across unrelated borrowers.
3. **Trust collapse with no records.** The Rs 420 million Karachi case
   (Sidra Humaid) is the canonical failure mode: an organizer ran many
   overlapping committees with *no written records*, over-committed to new
   members to cover shortfalls in older ones (a rolling Ponzi structure), and
   collapsed. [DAWN](https://www.dawn.com/news/1724659),
   [Express Tribune](https://tribune.com.pk/story/2390548/scam-by-committee-beware-who-you-trust-online)
   Note what actually caused this: **no ledger, no independent record of who
   owed what.** Not "no investment feature." Not "no yield." A digitized,
   immutable, third-party-visible ledger — which is *already Halqa's Stage-1
   core* — directly solves the actual documented failure mode. This is worth
   restating to the owner as validation: the boring "record-keeping" layer is
   not a placeholder for the investment feature, it *is* the single highest
   proven-value feature per the actual fraud case law.

---

## 3. The incumbent competitor already validates the compliant path

**Oraan** is a live, funded Pakistani product doing almost exactly Halqa's
Stage 1 concept, and it is *regulated*:

- Oraan Financial Services (Private) Limited holds an actual **SECP license
  (No. SECP/LRD/107/OFSPL/2023) for NBFC Investment Finance Services.**
  [PICG case study](https://picg.org.pk/wp-content/uploads/2024/10/Oraan-case-study.pdf)
- Product: digital committees, 5- or 10-month plans, host picks a start month
  and monthly amount; Oraan positions itself as **facilitator/agent**, not
  custodian-in-the-shadows.
  [Oraan committees page](https://www.oraan.com/committees)
- Revenue: **not a flat subscription** — service/processing fees tied to
  specific actions (e.g., a fee for early payout access; some users report a
  flat service charge on top of the installment).
  [Oraan service fee calculator](https://www.oraan.com/service-fee-calculator)
- Oraan is explicitly women-first in positioning, matching the demographic
  data in Section 1. [Oraan about](https://www.oraan.com/about-us)

**What this proves, concretely:**
- The Pakistani market **already accepts** a digital, company-run committee
  product charging fees on top of a zero-interest structure — so Halqa's
  "platform fee on profit + turn-sale premium" model is not untested territory.
- It also proves the **licensing bar is real and clearable** — Oraan did the
  NBFC registration rather than skip it. That validates our own Stage
  1→2→3 legal plan (already locked in memory) rather than being an obstacle
  unique to us.
- Oraan does **not** appear to lead with an "investment/yield" pitch — it
  leads with **discipline, structure, and accountability** for a
  traditionally interest-free product. That is a meaningful signal about what
  the actual market wants to hear (Section 5).

---

## 4. What the real numbers say about "investment profit" — sanity-checked

Verified, current, sourced figures (not Codex's unsourced list):

- **SBP policy rate**: 11.5% as of June 15, 2026 (held since the April 27,
  2026 hike). [tradingeconomics.com/pakistan/interest-rate](https://tradingeconomics.com/pakistan/interest-rate)
- **National Savings rates** (verify live at savings.gov.pk before shipping
  any number in-app): Behbood Savings Certificate ~13.68%/yr (monthly
  profit), Regular Income Certificate ~13.56%/yr (monthly), Defence Savings
  Certificate ~13.24%/yr (at maturity), Special Savings Certificate
  ~13.44%/yr (bi-annual). [hisaabkar.pk National Savings Calculator](https://hisaabkar.pk/tools/national-savings-calculator/)
- **T-Bills**: 3/6/12-month tenors, discount-priced, yields move with the
  policy rate; a recent auction saw yields rise up to 39bps.
  [Profit by Pakistan Today](https://profit.pakistantoday.com.pk/2026/02/05/treasury-bill-yields-rise-by-up-to-39-bps-as-govt-raises-rs823-billion-in-auction/)
- **CPI inflation**: ~11.07% YoY (June 2026).
  [tradingeconomics.com/pakistan/inflation-cpi](https://tradingeconomics.com/pakistan/inflation-cpi)

**The honest math nobody in the Codex report said out loud:**
Nominal yields on every "low-risk" instrument (11-14%) are sitting *almost
exactly on top of* current inflation (~11%). **Real (inflation-adjusted)
return on the safe catalog is roughly 0-3%, not 11-14%.** The "100 options"
document quoted these as if 11-14% were pure profit. It isn't — it's mostly
compensation for inflation, which every saver is already losing to whether or
not they invest. This isn't a reason to abandon the feature; it's a reason to
**never market it as "make money"** — market it as **"don't lose as much to
inflation as a traditional committee does,"** which is both true and honestly
compelling, especially combined with the first-receiver/last-receiver fix in
Section 5.

Re-checking our own verified worked example from the money model
(N=10, C=10,000, r=20%, i=18%, held ~55 member-months): profit ≈ Rs 16,500
gross, ≈ Rs 15,675 net of the 5% DEV fee, ≈ Rs 1,567 per member. That example
used an 18% rate that is **higher than any currently verified low-risk
instrument** (current best low-risk is ~13.7%). Recompute app-facing examples
with the real ~11-13.7% range so the in-app "worked example" isn't
overstating returns — this is a direct product-honesty bug in the assumptions
baked into `INSTRUCTIONS FOR DUMMIES...txt` Section 4.4 and should be
corrected there too.

---

## 5. Who the investment feature must actually serve, and what "useful" means for them

Per Section 1, the average user is a disciplined saver joining through an
existing trust circle, not a yield-seeker, and is likely to view "interest" as
something to avoid on principle, not just on returns. Given that and the real
rate/inflation math in Section 4, "useful investment feature" for this person
means, in priority order:

1. **Protects them from real erosion, doesn't promise riches.** Frame as
   inflation-mitigation, not wealth-building. A last-receiver in a 10-round
   committee losing ~9-10% of real value (Section 2) getting even a ~2-3%
   real offset from the reinvested slice is a genuine, honestly-stated win.
   This is the actual honest pitch — not "invest and earn."
2. **Fixes the first-receiver/last-receiver unfairness, which the current
   design does not.** Right now `distributionMode=SHARE` splits pooled
   profit **equally per member regardless of position**. That's a missed,
   free opportunity: weighting the profit share toward **later** turn
   positions (who waited longer and suffered more real erosion) is a genuine,
   defensible structural improvement over a traditional committee — and it is
   *the single most differentiated, sourced-justified feature idea in this
   whole exercise*, because it fixes a named, documented flaw
   ([DAWN](https://www.dawn.com/news/1725956/the-faults-in-our-committees))
   rather than chasing yield. This is a stronger pitch than most of Codex's
   100 items combined.
3. **Shariah framing has to be resolved before this ships broadly.**
   Traditional ROSCAs are widely considered halal specifically because
   they're interest-free
   ([search on ROSCA Islamic compliance](https://www.emerald.com/jiabr/article-abstract/doi/10.1108/JIABR-11-2024-0462/1321976)).
   The moment Halqa introduces a *rate-of-return* instrument, even a
   "low-risk government scheme," a meaningful share of the target
   demographic (Section 1: religiously-motivated committee users) may view
   participation as compromising the interest-free nature they specifically
   joined a committee for. **This is not addressed anywhere in the 100-option
   Codex list.** Concrete fix: default every committee's reinvestRatio to
   **0%** (pure traditional committee, unchanged experience), make the
   investment layer explicitly **opt-in per committee at creation**, and
   make the scheme catalog clearly separate Shariah-compliant instruments
   (Islamic money-market funds, Sukuk-based National Savings variants) from
   conventional ones, with a visible filter — not just a `shariahCompliant`
   boolean buried in scheme details.
4. **Trust signals matter more than return numbers to this user.** Given
   Section 2's fraud case study, the highest-value thing to surface
   prominently is *not* a return graph — it's host reliability (completed
   cycles, on-time rate) and the fact that every rupee is on an immutable,
   visible ledger. Lead with that in the UI, not with a projection chart.
5. **Absolute amounts are small — respect that.** Typical committee
   contributions cited for the Oraan product start at **Rs 1,000/month**
   ([Oraan Google Play listing summary](https://play.google.com/store/apps/details?id=com.oraan.android)).
   At Rs 1,000/month, even our own optimistic worked example scales down to a
   profit share of low tens of rupees per member per cycle. Don't build UI
   that makes a trivial number look manipulated or hyped (giant graphs, "up
   to 30% returns!" banners) — that erodes exactly the trust this product
   depends on. Show the real number plainly.

---

## 6. Grading Halqa's current build against this reality

**What's already right (keep it):**
- Stage 1 record-only design with an immutable, append-only ledger directly
  answers the documented #1 failure mode (Section 2, point 3). This is not a
  compliance formality — it is the single most market-validated feature we
  have, and it should be marketed as such, loudly.
- Credit-weighted turn order is a real, working mitigation for correlated
  default risk within a trust network (Section 2, point 2) — good, keep.
- Low-risk-only scheme cap (r≤25%) matches the market's actual risk
  tolerance for a product whose users chose a zero-interest instrument to
  begin with. Do not loosen this without re-testing user reaction; Codex's
  suggestion to raise the cap to 50% (its own #42) trades against exactly the
  trust-sensitivity identified in Section 5.

**What's wrong or missing, specifically:**
- Distribution is **flat per-member**, ignoring the first/last-receiver
  unfairness that is the single most citable, real flaw in the traditional
  system (Section 5, point 2). This is a real gap, not a cosmetic one.
- No **Shariah-compliant filter/default** in the scheme selection UI, despite
  this being potentially the biggest adoption blocker for the exact
  demographic that uses committees (Section 5, point 3).
- The worked example and any in-app messaging must be re-derived from real,
  currently-verified rates (Section 4), not the ~18% figure used in the
  original spec — that number is above every real current low-risk
  instrument and overstates the pitch.
- No visible **host reliability record** (cycles completed, on-time %) is
  surfaced to prospective joiners — the thing that would have prevented the
  Rs 420m case is trust signaling, and we don't surface it yet.

---

## 7. Grading the Codex "100 options" report — direct, unfiltered

The user asked for no AI bias and no bullshitting, so here it is plainly:

**Fabricated precision, presented as fact.** Numbers like "T-Bills (91-Day):
~11.75% APY (July 2026 auction)" and dozens of others in that list are
plausible-sounding but **not sourced anywhere in that document**, and several
don't match what I could verify (real SBP policy rate 11.5%, National Savings
13.2-13.7% range, not the specific figures quoted). Any number shipped in-app
must come from a dated source URL (as our own spec at Part 10.2 already
requires) — the 100-option list did not do this and should not be trusted
as-is for real figures.

**Ignores the two documented structural flaws entirely.** Neither
first-receiver/last-receiver inflation erosion nor correlated-network default
risk — the two specific, cited problems with committees — appear anywhere in
100 items. The list optimizes yield and deterrence mechanics while missing
the actual named disease.

**A meaningful fraction of the 100 items are regulatorily reckless for our
locked Stage 1 position**, not just "future work":
- #20 (P2P invoice discounting via an unnamed NBFC), #21 (stablecoin yield
  farming), #22 ("Halqa becomes a micro-lending platform"), #97 (smart
  contract escrow), #90 (integrating with SBP's national credit bureau eCIB)
  are not "Stage 2 stretch goals" — they are entirely different regulated
  businesses (securities brokerage, VASP/crypto, NBFC lending, national
  credit reporting) each requiring their own license, and several
  (unlicensed lending, unlicensed crypto conversion) are the exact behavior
  that gets fintechs shut down in Pakistan. These should not be on the same
  list as "raise the reinvestment cap" as if they were comparable-effort
  options.
- #71 (daily interest on late payments, "0.1%/day = 36.5% APR") is,
  functionally, charging interest — which directly conflicts with the
  interest-free premise that is the entire reason this product's users chose
  a committee over a bank loan (Section 1). This is an example of a
  "profit booster" that actively undermines the product's core appeal.
- #90 (report defaulters to eCIB), #92 (cross-app blacklist sharing), #96
  (auto-read a linked bank/wallet account) all imply data-sharing and
  account-access arrangements Halqa has no legal basis or partner to support
  today, and several conflict with the "no bank-balance reading" reality
  already established in our own locked spec (Part 8 of the original
  instructions doc).

**The 100-item format itself is an anti-pattern for decision-making.** A
flat list with checkbox-style risk/impl icons (🟢🟡🔴 / ⬜🔲🔳⬛) invites
picking things because they're novel or high-numbered, not because they're
grounded in what the two cited real articles say actually breaks committees.
Several genuinely good, low-effort ideas (e.g., #69 withhold profit until
dues clear, #73 credit-weighted order — already built, #82 loss-aversion
nudging) are real and worth keeping, but they arrived at by volume, not by
diagnosis. This audit intentionally has 7 sections and cites two primary
sources per structural claim instead of 100 bullet points, on purpose.

---

## 8. Concrete, prioritized recommendations (grounded, not exhaustive)

**Ship next (cheap, directly answers a cited real flaw):**
1. Weight `SHARE`-mode profit distribution toward later turn positions
   instead of flat-equal — directly fixes the documented first/last-receiver
   unfairness (Section 5.2). Needs a formula decision (e.g., weight
   proportional to rounds-waited) — recommend linear weighting by
   `roundNumber` as the simplest defensible rule; open to a fairer
   curve later.
2. Add a Shariah-compliant filter as the **default view** in scheme
   selection, with conventional instruments requiring an explicit toggle to
   reveal (Section 5.3). Cheap UI change, addresses the single biggest silent
   adoption risk identified in this document.
3. Re-derive every in-app worked example and any marketing copy from
   currently-sourced rates (Section 4), not invented or stale figures.
   Add a visible "rates last verified: [date], source: [link]" line anywhere
   a rate is shown — this is already required by our own spec but isn't
   fully done in the UI yet.
4. Surface host reliability (cycles completed cleanly, on-time %) prominently
   on every committee card before someone joins — the actual trust signal
   that would have prevented the cited fraud case, and currently invisible
   in our UI.

**Do not build (regulatory or product-integrity reasons, not "later"):**
- Anything from the Codex list requiring a separate license we don't have
  (crypto/stablecoin conversion, unlicensed lending, national credit bureau
  integration, invoice-discounting NBFC operations).
- Daily/percentage interest on late payments — functionally riba, undermines
  the core reason this product exists for its actual user base.
- Any UI that shows a single "expected return" number without honestly
  showing it's roughly inflation-offsetting, not wealth-generating, given
  Section 4's real math.

**Worth a real product decision (tradeoffs, not a clear yes):**
- Whether to raise reinvestRatio cap above 25% (Codex #42) — deferred until
  we have actual user reaction data; this document recommends *not* doing it
  pre-launch given Section 5's trust-sensitivity argument, but it's the
  owner's call once real users exist.
- Split/staged payout (#76) or profit-withheld-until-dues-clear (#69) as
  default-protection mechanisms — both are legitimate and consistent with
  our existing security-deposit design; worth building after the scheduler/
  ban-enforcement loop (already identified as the top remaining gap in prior
  session) is in place, since these mechanisms lean on the same enforcement
  infrastructure.

---

## Sources (all cited inline above; consolidated here for convenience)

- [Oraan: Understanding ROSCAs — A Guide to Committees and BCs](https://www.oraan.com/post/understanding-roscas-a-guide-to-committees-and-bcs)
- [Oraan case study — PICG](https://picg.org.pk/wp-content/uploads/2024/10/Oraan-case-study.pdf)
- [Oraan — Committees product page](https://www.oraan.com/committees)
- [Oraan — About](https://www.oraan.com/about-us)
- [Oraan — Service Fee Calculator](https://www.oraan.com/service-fee-calculator)
- [Kantar/Finclusion — ROSCAs and Mobile Wallet Adoption in Pakistan](https://finclusion.org/blog/roscas-and-mobile-wallet-adoption-in-pakistan.html)
- [Meer — Pakistan's committee system: benefits and risks](https://www.meer.com/en/84578-pakistans-committee-system-benefits-and-risks)
- [Synergyzer — Committees: Rewiring the Pakistani Mindset Around Money](https://synergyzer.com/committees-rewiring-the-pakistani-mindset-around-money/)
- [DAWN — The faults in our committees](https://www.dawn.com/news/1725956/the-faults-in-our-committees)
- [DAWN — Gullible depositors lose 'Rs420m' in Ponzi scheme](https://www.dawn.com/news/1724659)
- [Express Tribune — Scam by committee: beware who you trust online](https://tribune.com.pk/story/2390548/scam-by-committee-beware-who-you-trust-online)
- [TradingEconomics — Pakistan Interest Rate](https://tradingeconomics.com/pakistan/interest-rate)
- [TradingEconomics — Pakistan Inflation Rate (CPI)](https://tradingeconomics.com/pakistan/inflation-cpi)
- [nsave — Inflation in Pakistan 2026](https://www.nsave.com/pakistan/inflation)
- [hisaabkar.pk — National Savings Calculator Pakistan 2026](https://hisaabkar.pk/tools/national-savings-calculator/)
- [Profit by Pakistan Today — Treasury bill yields rise](https://profit.pakistantoday.com.pk/2026/02/05/treasury-bill-yields-rise-by-up-to-39-bps-as-govt-raises-rs823-billion-in-auction/)
- [Emerald — Community-driven financial practices: interest-free ROSCAs in Muslim communities](https://www.emerald.com/jiabr/article-abstract/doi/10.1108/JIABR-11-2024-0462/1321976)
