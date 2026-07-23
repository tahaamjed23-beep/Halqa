# Halqa — Product & Model Direction
### Built on Akif Saeed's guidance (SECP Chairman) · meeting 23 Jul 2026
### Working document → feeds the full product report due ~2 weeks

> How to read this: it is written to **teach**, not just list. Every list item
> has a one-line *why* so you (Taha) can defend it to Akif without notes. The
> boxed **lists** and **tables** are the exact deliverables he asked for; the
> prose around them is so you understand *why* each line is there.
>
> Tags on claims: **[LIVE]** works today · **[BUILD]** we can build now ·
> **[LICENCE]** needs a licence/partner · **[VERIFY]** a fact still being
> confirmed by research (filled in the researched sections below).

---

## 0 · The one-paragraph version

Akif liked it and gave us a real design brief. The big idea he pushed: **stop
thinking of Halqa as one product for one kind of person.** There are two kinds of
people in every committee — **Savers** (using it as disciplined savings, happy to
wait for a late turn) and **Consumers** (who want the lump sum *early* to spend,
i.e. they are quietly borrowing from the group). Almost all default risk sits on
the Consumer side. So we **split them**, and treat each correctly: Savers get a
**Vault that actually grows their money** (held by a licensed AMC/trustee like
**CDC**, so we never custody it), and Consumers get **filtered by what they can
afford** and **secured** before they can take money early. On top, Halqa
**covers defaults on its own balance sheet** (so members never lose — that is the
trust product) and **insures that exposure with takaful** so our capital risk is
capped. Recovery exists, but the doctrine is Akif's ex-boss's line: *don't build
clever ways to chase defaulters — build a system where nobody has a reason to
default and the consequences are too big to be worth it.*

---

## 1 · What Akif actually told us (the mandate, verbatim-intent)

- **He was impressed** — called it original, recalled the Oraan founders also came
  to him for guidance.
- **"Don't worry about"** licensing, insurance, and the TASDEEQ bureau
  partnership for now — he treats those as solvable later.
- **Investigate the investment rails:** **CDC** (Central Depository Company),
  **margin trading**, **mutual funds**, and **link to a licensed online AMC**
  (he named Pakistan's *first* online AMC). Reason: it lets us offer savings/
  investment **without holding money ourselves.**
- **Bring the Vault back.** We scrapped it; he wants it — because a member who
  keeps money in an in-built savings/investment vault **cannot really default**
  (on a miss, we settle the group out of *their* parked money).
- **Auto-debit:** he asked, pointedly, *does it truly work?* — and hinted **Raast
  is getting a proper auto-debit feature.** Our whole collection standard hinges
  on the honest answer. (Researched in §5.)
- **The SECP sandbox can work** for us.
- **Halqa must cover defaults on its own balance sheet** — *and* **insure** it
  (takaful).
- **Filtering / eligibility (his ex-boss's doctrine):** don't build enforcement —
  build so there is **no incentive to default, or consequences so severe** that
  nobody does. The practical tool: **only show a member the committees they are
  eligible for.** A high-pot, high-instalment committee should require a standard
  verified income; students and housewives see smaller, tailored ones.
- **Keep barriers to entry LOW** — simple yet efficient. Don't drown the small
  saver in KYC.
- **Separate Consumers from Savers.** Savers → vault + AMC-trustee investment.
  Consumers → enforce personal guarantee (PG) and stronger terms.
- **Study Money Fellows and Egypt:** what regulation *let it exist*, its
  regulator, its credit system, its default & recovery history. And note **Oraan
  was not SECP-licensed** — he doesn't know how it legally runs. (Researched §10.)
- **The build spine:** onboarding → collection → pooling products → prevention →
  recovery.
- **In ~2 weeks:** a **full product report** covering *everything* —
  cybersecurity to marketing — and you must be able to answer any question on it.
  (Table of contents in §12.)

---

## 2 · Why people love committees, and why they don't
### (the efficiencies / inefficiencies list he asked for)

The strategy in one sentence: **keep every reason people love committees, delete
every reason they fear them.** That single table below *is* the product thesis.

**First, the market — this is not a niche.** Pakistan's committee/kameti sector is
estimated at **~Rs 4 trillion (~US$5bn/yr)** rotating informally, the country's
**3rd-largest savings channel** after bank deposits and national savings, with
**~34–41% of adults** having ever participated and **~90% aware** of it. Yet only
**14% of women** (56% of men) own a formal account, and **85% of adults rely on
informal credit**. So committees aren't a backwater — they're where most of
Pakistan already saves and borrows. ([Dawn](https://www.dawn.com/news/1725956),
[Dawn/World Bank](https://www.dawn.com/news/950117/committees-system-country-s-third-largest-savings-channel),
[Karandaaz K-FIS 2024](https://www.brandsynario.com/karandaaz-releases-k-fis-2024-on-financial-inclusion-trends-in-pakistan/))

**Why they LOVE it (the efficiencies) — each with its mechanism + source:**

| Efficiency | The mechanism (one line) | Source |
|---|---|---|
| Interest-free lump sum | Pooled contributions hand one member many months of savings at once, no riba | [Besley–Coate–Loury, AER 1993](http://eprints.lse.ac.uk/1613/) |
| Commitment device | The fixed, social schedule defeats your own self-control problem | [Ashraf–Karlan–Yin, HBS](https://www.hbs.edu/ris/Publication%20Files/09-100.pdf) |
| No credit history/collateral | Membership by social vouching — the only credit the ~100m unbanked can get | [TechCrunch/Oraan](https://techcrunch.com/2021/09/26/oraan-raises-3m-to-increase-financial-inclusion-among-pakistani-women/) |
| Social accountability | Exclusion + reputation cost make repayment self-enforcing without courts | [Anderson–Baland–Moene](https://econ.cms.arts.ubc.ca/wp-content/uploads/sites/38/2013/05/pdf_paper_siwan-anderson-enforcement-organizational-design.pdf) |
| Shields women's savings | Money committed to a ROSCA is off-limits to household spending pressure | [Anderson–Baland, QJE 2002](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=244530) |
| Speed & simplicity | Formed in minutes, pot in days — vs weeks of bank underwriting + likely rejection | [Dawn](https://www.dawn.com/news/1725956) |
| Enables big purchases | Delivers an indivisible lump sum (fees, wedding, medical) years sooner than solo saving | [Besley–Coate–Loury](http://eprints.lse.ac.uk/1613/) |
| Cultural/religious fit | Only ~9% of the excluded trust banks; committees need no institution and no interest | [Karandaaz K-FIS](https://www.brandsynario.com/karandaaz-releases-k-fis-2024-on-financial-inclusion-trends-in-pakistan/) |

**Why they FEAR it (the inefficiencies) — each is a wound Halqa closes:**

| Inefficiency | The mechanism (one line) | Source |
|---|---|---|
| Organiser absconds with the pot | Head has custody of all cash, no contract, no record → runs | Sidra Humaid **$2m/200 women** ([Vice](https://www.vice.com/en/article/sidra-humaid-committee-scam-pakistan/)); Karachi **Rs 420m** ([Dawn](https://www.dawn.com/news/1724659)) |
| Early taker stops paying | Whoever collects first has the strongest reason to walk; others eat the loss | [Besley–Coate–Loury](http://eprints.lse.ac.uk/1613/); [Dawn](https://www.dawn.com/news/1725956) |
| No legal recourse | Verbal, cash, no receipt → near-impossible to prove in court | [Dawn](https://www.dawn.com/news/1725956) |
| Money earns nothing | 0% nominal return while **~11.7%** inflation erodes the late taker's value | [Dawn](https://www.dawn.com/news/1846983) |
| Timing risk | You may get a late slot exactly when you needed cash early | [Wikipedia ROSCA](https://en.wikipedia.org/wiki/Rotating_savings_and_credit_association) |
| Illiquidity/rigidity | Fixed amount, fixed schedule, no pause/exit if your cashflow breaks | [Dawn](https://www.dawn.com/news/1725956) |
| Opacity / no record | No audit trail, no provable history to build credit from | [Dawn](https://www.dawn.com/news/1725956) |
| Trust breaks at scale | Social enforcement vanishes among online strangers — the exact digital-fraud failure mode | [Anderson–Baland–Moene](https://econ.cms.arts.ubc.ca/wp-content/uploads/sites/38/2013/05/pdf_paper_siwan-anderson-enforcement-organizational-design.pdf) |

**The killer line for Akif:** *there is no aggregate default/fraud data for informal
committees at all — because the system keeps no records. The opacity is itself the
risk.* Halqa's record IS the product.

**How Halqa maps to it (final, design):**

| What people LOVE (keep it) | How Halqa keeps it |
|---|---|
| Interest-free lump sum | Committees stay interest-free; fees are service/positioning, not riba |
| Forced-savings discipline | Locked schedule + always-on auto-collection = the discipline, automated |
| No credit history needed to join | Score *gates slots*, it does not gate entry; newcomers start at late turns |
| Social trust / accountability | Real names, broad locality, job shown; mutual PG; reputation record |
| Simple, fast, no paperwork | One-screen onboarding for savers; friction only where risk is (consumers) |

| What people FEAR (kill it) | How Halqa kills it |
|---|---|
| Organiser runs off with the pot | **We never hold the pot** — money moves member-to-member on a ledger |
| Someone takes an early turn then stops paying | Eligibility filter + vault buffer + PG + position quarantine (§3, §6) |
| No legal recourse | E-signed undertaking + mutual PG → Order XXXVII summary suit (§7) |
| My money sits dead / loses to inflation while I wait | **Growth Vault** — idle money earns via an AMC fund while you wait (§4) |
| If someone defaults, *I* lose | **Halqa covers it** on our balance sheet + takaful — members made whole (§7) |
| No record of my reliability | Every payment is a recorded, portable reliability event |

---

## 3 · The spine of the new model: SAVERS vs CONSUMERS

This is the reframe that makes everything else click. Teach it like this:

**A committee is two transactions wearing one coat.**
- If you take an **early** turn, you receive the lump sum before you've paid most
  of it in — you are **borrowing** from the group and repaying over the rest of
  the cycle. That's a **Consumer**.
- If you take a **late** turn, you pay in for months and collect at the end — you
  are **saving** (with discipline, and ideally some growth). That's a **Saver**.

**Worked example (10-person committee, Rs 10,000/month, Rs 100,000 pot):**
- *Amna* takes **turn 1**. She gets Rs 100,000 in month 1 having paid Rs 10,000.
  She still owes 9 × Rs 10,000. She is a **Consumer** with Rs 90,000 of *forward
  liability* — this is the only place real default risk lives.
- *Bilal* takes **turn 10**. He pays Rs 10,000 for nine months, then collects
  Rs 100,000. He can't meaningfully default — he's always paid in more than he's
  received. He is a **Saver**. His only complaint in a normal committee is that
  his money sat dead for nine months. **Fix that and you've won him.**

**So we treat them differently:**

| | **Savers** (late turns / pure savings) | **Consumers** (early turns / borrowing) |
|---|---|---|
| Their goal | Discipline + growth on idle money | Get the lump sum **now** |
| Default risk | ~Zero | **Almost all of it** |
| Onboarding friction | **Light** (keep barriers low) | **Heavier**, proportional to forward liability |
| What we offer | Vault + AMC-trustee investment (§4) | A secured early-turn slot |
| What we require | Almost nothing | Eligibility by income + vault buffer and/or PG + cheque option |
| Revenue to us | Distribution fee / fund trailer | Positioning fee + guarantee fee |

**Why this is powerful:** it lets us **keep barriers low for the 70% who are low
risk** (Akif's "keep it simple") while concentrating our controls on the ~30% who
actually carry the risk. One rule can't do that; the split can.

---

## 4 · The Vault, done right (money you can't lose vs money that grows)

We scrapped the vault because "holding deposits" screamed EMI/NBFC licence. Akif's
move dissolves that: **don't hold it — route it to a licensed AMC whose assets a
Trustee (CDC) holds in the member's own name.** Halqa is the *interface/
distributor*, never the custodian. That keeps our record-only licence position
*and* gives us the vault.

**The structure works exactly as Akif implied — and it's already proven in
Pakistan.** Under the **NBFC Regulations 2008**, every mutual fund runs on a
three-party trust: the **investor**, the **AMC** (manages), and the **Trustee**
(holds). **All fund cash and assets are registered in the Trustee's name — the AMC
never has custody.** [CDC](https://www.cdcpakistan.com/businesses/trustee-custodial-services/)
is the Trustee for most Pakistani funds. So:

- **Money flow:** member → **Trustee (CDC) collection account** → **units issued in
  the member's own name.** The platform *never holds the money.*
- **Proof it's allowed:** **Mahaana Wealth** — Pakistan's **first digital-only
  AMC** (the one Akif named), CDC-custodied — states plainly: *"All of your funds
  are stored with the Central Depository Company (CDC). Mahaana does not have direct
  access to your funds."* ([Mahaana](https://www.mahaana.com/faqs)) Its Islamic Cash
  Fund takes **Rs 1,000 minimum**, redeems in **1–2 business days**, and Islamic
  money-market funds currently yield **~10–11%** ([MUFAP](https://www.mufap.com.pk/Industry/IndustryStatDaily?tab=1)) —
  vs 5–8% on a bank savings account. That is real growth on a Saver's waiting money.
- **CDC even runs the rails for this:** **Emlaak Financials** (CDC's own digital
  multi-AMC marketplace, 2022) is a live precedent for a platform distributing
  funds without holding a rupee. ([CDC](https://www.cdcpakistan.com/media-center/cdc-launches-new-fintech-initiative-of-mutual-fund-digital-platform-emlaak-financials/))
- **What licence we'd need — and it's light:** to route savings into funds we need
  only an **SECP multi-AMC *distributor* registration** — **NOT an EMI licence, NOT
  a full NBFC licence.** ([SECP distributor framework](https://www.secp.gov.pk/media-center/press-releases/secp-approves-simplified-regulatory-requirements-for-mutual-fund-distributors/))
  If we want to *recommend* a fund (not just offer it), that's an **Investment
  Adviser** licence (public-ltd, higher bar) — optional, later.
- **Margin Trading (MTS) — honest read:** its relevance is **speculative.** The
  plausible use is deploying the short **float** between collection and payout as a
  secured *Financier* (KIBOR+8%, 15-day auto-release lines up with a kameti cycle),
  but that needs **NCCPL membership** and is a **later-stage** capability, not a
  near-term move. Say that to him plainly rather than pretending it's core.
  ([NCCPL MTS](https://www.nccpl.com.pk/en/products-services/margin-trading-system-mts))

**Bottom line for the vault:** money sits with **CDC as trustee**, units are the
member's own, Halqa is a **distributor** — so the vault returns **without breaking
our record-only principle and without an EMI/NBFC licence.** Mahaana already walks
this exact path with SECP's blessing.

**Two vault modes (design, final):**

1. **Safety Vault (a collateral buffer).** A member voluntarily parks money that
   acts as *their own* default cushion. On a missed instalment, with pre-signed
   consent, we settle the group from **their** parked money. Because it is the
   member's *own* funds being set off against their *own* obligation, this is
   contractually clean (set-off), not "seizing" anyone's money. → This is how a
   Consumer "can't default up to their buffer."
2. **Growth Vault (a savings product).** Idle money — a Saver waiting for turn 10,
   or anyone — buys units of a **money-market / Islamic income fund** via the AMC.
   It earns **~10–11%** (Islamic money-market, mid-2026) instead of dying to
   inflation — deleting the biggest reason Savers dislike committees.

**Why members trust it:** the money is held by **CDC as trustee**, not by Halqa.
If Halqa vanished tomorrow, their units are still theirs. That is a *stronger*
trust story than "we hold your money safely."

---

## 5 · Collection standards (how the money actually gets in)

Akif's real question — *does auto-debit truly work?* — decides this section. The
honest rail reality is researched below; the **standard** we hold ourselves to is
design.


**The honest answer to Akif's question ("does auto-debit truly work?"):**
**No — true cross-bank auto-debit does not exist in Pakistan today, for anyone,
including Oraan.** No non-bank can legally *pull* from a member's bank account on a
schedule right now. Here is exactly what is and isn't real:

| Collection method | Status today | Catch |
|---|---|---|
| **Raast RTP** (we send a request, member one-tap approves in their bank app) | **LIVE** — all banks/MFBs/EMIs mandated since Mar 2024 | Still needs a per-cycle tap; not a silent pull |
| Intra-bank standing instruction | LIVE | Member must set it up at *their own* bank; we don't control it |
| 1LINK **1BILL** biller collection | LIVE | Must be a registered biller; wallet-balance only |
| Card-on-file recurring (MIT) | LIVE but weak | Card penetration is tiny among our users |
| **Raast PISP "pull payment"** (one-time consent, then true auto-pull) | **IN TESTING — "launching very soon"** (Raast CEO, Jun 2026) | **No SBP go-live circular yet**; needs PISP status/bank partner |
| Cross-bank direct-debit / e-mandate | **DOES NOT EXIST YET** | Raast PISP will be the first |

**So Akif's hint is right:** SBP's **Raast PISP layer** adds exactly the
consent-then-pull auto-debit he described — a licensed provider takes a one-time
mandate, then pulls on schedule with no OTP each time.
([SBP Raast Participation Criteria, Feb 2025](https://www.sbp.org.pk/press/2025/Pr-22-Feb-2025.pdf);
[Raast CEO, The News, Jun 2026](https://www.thenews.pk/print/1422144-raast-projected-to-process-500bn-in-transactions-this-year))
It's **in testing, not shipped.** The move: **build on Raast RTP now, be
first-in-line for PISP pull the day it goes live** (needs SBP PISP approval or a
bank/EMI partner). That is a sharper answer than "yes it works" — it's true, and
it shows we know the rail better than most.

**The Halqa collection standard (design, final):**
- **No member should have to remember to pay.** Today that means a **one-tap Raast
  RTP** on the due date; the day **Raast PISP pull** ships it upgrades to a silent
  auto-debit with no tap — we build for both so the switch is a config change, not
  a rebuild.
- **Mandate at join:** the collection account/rail is linked and authorised the
  moment a member joins a committee — not at due time.
- **Retry ladder:** on a failed pull — retry at T+0, T+1, T+3 (payday-aware),
  then escalate. Every retry logged.
- **Reminder cadence:** T-3, T-1, T-0 via WhatsApp/SMS; T+1 "missed" with the
  consequence spelled out.
- **Grace + late fee:** a short grace window, then a late fee that is **our
  revenue and the group's compensation**, not a penalty we pocket silently.
- **Self-cure from Safety Vault** before anything is called a default (§4, §7).

---

## 6 · Default PREVENTION standards (Akif's "remove the incentive" doctrine)

> **The doctrine (quote him):** *"Don't build ways to enforce recovery — build a
> way that there is no incentive to default, or the consequences are so great
> that no one does."* Prevention is 90% of the answer; recovery (§7) is the last
> 10%.

**The prevention stack, cheapest → strongest:**

1. **Eligibility filtering (the cheapest prevention there is).** You cannot
   default on a commitment you were never allowed to take. So **only show each
   member the committees they qualify for**:
   - High-pot / high-instalment committees → require **verified standard income**.
   - Students / low-income → smaller pots, lower instalments, mostly late slots.
   - Housewives → tailored committees, husband's income as the reference (we now
     capture that at signup).
   *Worked example:* a student earning nothing never sees the Rs 50,000/month
   committee — so he can never blow up in it. The filter did the work of a
   collections team, for free.
2. **Match friction to risk (keep barriers low).** Savers/late-turn takers get a
   one-screen join. Early-turn Consumers get income verification + security. Don't
   tax the safe majority to control the risky minority.
3. **Vault buffer for early turns.** An early-turn Consumer must hold X% of
   forward liability in their Safety Vault (their own money). They literally
   cannot default up to that buffer.
4. **Position quarantine (already built).** New members → late turns only until
   **2 clean completed circles + verification**. New risk starts where risk is
   lowest.
5. **Verification discounts (already built).** Cheque on file (95%), income+
   employer (80%), salary account (20%) — cheaper fees for lower risk. We *price*
   people toward being safe.
6. **Deterrence that's visibly bigger than the gain:** day-1 credit-score damage,
   platform-wide **CNIC blacklist**, **family/linked-account withholding**, and a
   signed PG that converts to a fast court route. The point is that the member
   *sees* all this before they'd ever consider walking.

**Prevention standard, stated as a rule:** *by the time a member can take money
early, the group's exposure to them is already ≥ mostly pre-secured (vault buffer
+ verified income + PG), and the person who can't afford it never got in.*

---

## 7 · Recovery — a real way (when prevention still fails)

Recovery is a **ladder**. The first rungs make members whole and keep them; the
last rungs keep deterrence credible. Note how little of it is "chase the money":

- **Rung 0 — Prevented:** eligibility + vault buffer means most exposure is
  pre-collateralised before a default can happen.
- **Rung 1 — Self-cure:** auto-debit retries; then draw the missed amount from the
  defaulter's **own Safety Vault**. No one else is touched.
- **Rung 2 — Halqa covers it (the trust product):** Halqa's **first-loss fund pays
  the group immediately**, so **members never lose a rupee**. This is the Money
  Fellows promise Akif pointed at — and the reason people will trust us over a
  paper committee. Funded from the fee spread + late fees + a provision.
- **Rung 3 — Insure it (credit guarantee, not takaful):** a **credit-guarantee**
  arrangement (NCGCL-style — see §8) reimburses Halqa's fund above an attachment
  point, **capping our balance-sheet risk** on the tail. *Credit-life takaful sits
  on top as a member benefit (death/disability only) — it does not cover ordinary
  default.*
- **Rung 4 — Pursue (keeps deterrence real):** e-signed undertaking + mutual PG →
  **Order XXXVII** summary suit → decree → **asset attachment**; **§489-F** if the
  cheque tier was used. Primarily to keep the *threat* credible, not as the main
  way we get money back.

**Important precision on "insure the defaults" (Akif will know this distinction —
he personally handed Salaam Family Takaful its digital licence in May 2024):**
there are **two different instruments**, and only one covers actual default:

1. **Credit-life takaful** (EFU Hemayah, Pak-Qatar Family Takaful, Salaam Family
   Takaful) — pays the outstanding balance **only if the member dies or is
   permanently disabled.** It does **NOT** cover wilful default, job loss, or
   "won't pay." Good as a **member benefit** (the family isn't chased if someone
   dies), not as our default backstop.
   ([EFU](https://www.efulife.com/corporate-benefits/credit-life-scheme-for-financial-institutions),
   [Salaam Takaful/Arab News](https://www.arabnews.com/node/2511826/pakistan))
2. **Credit guarantee** — the instrument that actually covers *default of any kind*.
   Pakistan now has a dedicated one: **National Credit Guarantee Company (NCGCL)**,
   launched Jan 2024 (Karandaaz 56% + Ministry of Finance 44%). It guarantees a
   lender's portfolio against default, incl. a **Gender program** stream (our
   demographic). Live precedent: **PMIC–NCGCL signed a Rs 2.0bn Loan Portfolio
   Guarantee in Jan 2026** to backstop a microfinance book.
   ([NCGCL](https://en.wikipedia.org/wiki/National_Credit_Guarantee_Company),
   [PMIC–NCGCL](https://pmic.pk/blog/2026/01/20/pmic-ncgcl-sign-a-loan-portfolio-guarantee-to-boost-financing-for-priority-sectors/))

**So the correct stack (say it this way to him):** Halqa takes **first loss** on its
book → cedes the portfolio's default tail to an **NCGCL-style credit guarantee** →
adds **credit-life takaful** on top as a member benefit. And note the **product
gap**: *no one in Pakistan sells "committee-default takaful" today* — and the SECP
4th sandbox cohort explicitly invited **"new takaful models."** That gap is a thing
we could pilot **with** him. To access NCGCL/guarantee rails cleanly we'd most
likely sit as/behind an **NBFC** — the same ladder Oraan climbed.

**The whole point (Akif's boss):** Rungs 2–3 remove the *fear* (members are safe),
Rungs 0–1 remove the *incidence* (few defaults happen), Rung 4 removes the
*temptation* (walking away costs more than paying). Enforcement is the smallest
part.

---

## 8 · Covering + insuring defaults (the balance-sheet economics)

Akif said two things that must be held together: **cover defaults on our balance
sheet**, *and* **insure them**. Here's the money logic, plainly:

- **We take first loss** (like Money Fellows). If a member defaults and their
  vault buffer doesn't cover it, **Halqa's fund pays the group.**
- **Sizing it:** after the §6 prevention stack, our Pakistan-calibrated simulation
  put post-payout default at roughly **0.3%–1.4%** of pot value. On a book of,
  say, Rs 100m of active pots, that's ~Rs 0.3–1.4m of expected loss — a
  **provision**, not a catastrophe. It is funded by the **fee spread + late fees +
  a small guarantee fee** on guaranteed committees.
- **A guarantee caps the tail:** we self-fund the expected/attritional losses and
  cede the unexpected spike (a bad month, a fraud ring) to an **NCGCL-style credit
  guarantee** (§7 Rung 3) — exactly how a bank provisions expected loss and
  transfers the tail. (Credit-life **takaful** is a separate, member-benefit layer
  for death/disability only — not our default backstop.)
- **It's also revenue:** because we guarantee it, we can **charge for the
  guarantee** — a "protected committee" is a premium product. Members happily pay
  a little to *never lose*.

---

## 9 · Model-structure ideas (many) — for Akif to react to

He said "give many ideas for the model structure." Here are seven, each with what
it needs and which of his goals it serves. Present them as a menu, not a decision.

1. **Pure record-only (today's baseline).** We hold nothing, guarantee nothing.
   *Needs:* nothing. *Trust:* weak. *Use:* the floor we build up from.
2. **Guaranteed committee (Money Fellows-style).** Halqa covers defaults on
   balance sheet + takaful; charge a guarantee fee. *Needs:* capital + provisioning
   + takaful. *Serves:* trust, "members never lose."
3. **Vault-collateralised committee.** Early-turn takers post a Safety-Vault buffer
   (own money at the AMC/trustee); defaults self-cure from it. *Needs:* AMC/CDC
   link. *Serves:* low capital, strong on the Consumer side.
4. **Saver-fund + Consumer-credit split.** Two clean products: a pure savings/
   investment product (AMC-fund-backed) for Savers, and a guaranteed-credit
   committee for Consumers. *Needs:* AMC link + guarantee fund. *Serves:* the §3
   split, cleanest regulatory separation.
5. **AMC-distribution model.** Halqa is a *distribution channel* for a licensed
   AMC's fund; a "committee" is just a goal-wrapper on fund units. Money never
   touches us. *Needs:* distributor arrangement. *Serves:* "never hold money,"
   fastest licence path.
6. **Sandbox pilot.** Run 2–3 guaranteed committees under the **SECP sandbox**,
   capped size, live members, to **prove the default numbers** before scaling.
   *Needs:* sandbox admission. *Serves:* credibility with Akif; de-risks scale.
7. **Hybrid float-backstop (advanced, handle with legal care).** Savers' parked
   Growth-Vault float — with explicit consent and a return paid to them —
   provides part of the first-loss capital that guarantees Consumers' committees.
   *Needs:* careful structuring so it isn't "using client funds." *Serves:* capital
   efficiency; **flag as the sensitive one** (this is the kind of thing that needs
   his exact read).

**My recommendation to lead with:** **#4 (the split)** as the frame, delivered via
**#3 (vault-collateral)** + **#2 (guarantee)** mechanics, piloted through **#6
(sandbox)**. Say #7 out loud only to ask him whether it's allowed.

---

## 10 · Comparators: what let Money Fellows/Egypt exist, and how Oraan runs

### 10a · Egypt / Money Fellows — how a digital committee was *allowed* to exist

The single most useful finding: **Egypt never passed a "gam'eya law."** The
gam'eya is a private civil contract, as it always was. What let Money Fellows
operate legally was that the **Central Bank of Egypt's regulatory sandbox
dedicated its entire 2nd cohort to ROSCAs** — giving Money Fellows a *supervised
operating authority* while the rules were written around it.
([AmCham Egypt](https://www.amcham.org.eg/publications/industry-insight/issue/89/financial-digitization))

- **Money Fellows holds no bank/EMI licence itself.** It is the technology +
  matching layer; **Banque Misr (state-owned)** is the licensed custodian and now
  the **prepaid-card issuer** (Mastercard–Banque Misr–Money Fellows, Jan 2025).
  Money never legally sits with Money Fellows.
  ([ffnews](https://ffnews.com/newsarticle/paytech/mastercard-banque-misr-and-money-fellows-collaborate-to-launch-prepaid-card-to-drive-financial-inclusion-in-egypt-through-online-money-circles/))
  → **This validates our "don't hold money — use a licensed custodian" instinct.**
- **Scale under that model:** ~**US$1.5bn** processed, **2m+** completed circles,
  ~**350k** MAU, **profitable in 2025**.
  ([LaunchBase Africa](https://launchbaseafrica.com/2025/10/21/how-money-fellows-hit-profitability-by-digitising-egypts-informal-gameya-and-processing-1-5b/))
- **Honest nuance on "they cover defaults":** Money Fellows publishes **no default
  rate.** The often-quoted "**7–8%**" is the share of **empty slots it fills with
  its own working capital**, funded by a **$2.25m Symbiotics debt facility** — a
  vacancy mechanism, **not** a blanket default guarantee.
  ([Symbiotics](https://symbioticsgroup.com/press-release-money-fellow/),
  [TechCrunch](https://techcrunch.com/2025/05/04/moneyfellows-raises-13m-to-take-its-group-savings-model-outside-egypt/))
  So when we say "Halqa covers defaults," we'd actually be going **further** than
  Money Fellows — be precise about that with Akif.
- **What structurally enabled Egypt (and what Pakistan lacks):**

| Enabler | Egypt | Pakistan (our gap / ask) |
|---|---|---|
| Legal path for the platform | CBE sandbox **ROSCA cohort** | SECP sandbox exists but **no committee-specific cohort** — our ask |
| Rails for the unbanked | Meeza (35m cards, ID-only), Fawry (300k agents), InstaPay | Raast growing; **no Meeza-equivalent** universal prepaid card |
| Credit bureau | iScore covers the formally banked | eCIB **closed to non-FIs**; TASDEEQ/DataCheck partner-only |
| Custodian partner | State bank (Banque Misr) incentivised by inclusion mandate | Bank partner **achievable but must be negotiated** |

**The Chairman-ready framing:** *Egypt didn't legalise the committee — it legalised
the platform via a sandbox cohort and let a bank handle the licensed money
functions. Pakistan's equivalent is one SECP decision (a committee sandbox window)
plus a bank/AMC custodian.*

### 10b · Oraan — correcting the record (important)

Akif said Oraan isn't SECP-licensed. **The record says otherwise, and you need the
accurate version:** Oraan Financial Services (Pvt) Ltd holds an **SECP NBFC
"Investment Finance Services" licence — `SECP/LRD/107/OFSPL/2023` (2023)**.
([CxO Forum](https://news.cxoforum.global/oraan-obtains-nbfc-license-aiming-to-revolutionize-financial-inclusion-nationwide/),
[SECP IFS](https://www.secp.gov.pk/licensing/nbfcs/investment-finance-services/))
Before 2023 it ran under the **SECP sandbox**. His uncertainty most likely refers
to that earlier unlicensed-but-supervised phase, or to the **SBP-side payment
flow** (who holds the pooled cash), which SECP may not see. Most plausible mechanic:
Oraan is a **technology facilitator** that routes rupees member-to-member through a
bank/payment partner and never holds the pool itself. **Do not repeat "Oraan is
unlicensed" — say this instead.**

### 10c · SECP sandbox — our actual door

- **Four cohorts run** (Guidelines Dec 2019). The **4th cohort (May 2023) theme was
  Islamic finance — micro/nano-finance and *new takaful models*** — essentially a
  description of Halqa.
  ([ProPakistani](https://propakistani.pk/2023/04/29/secp-announces-fourth-cohort-under-its-regulatory-sandbox/))
- **Unregistered startups are explicitly eligible** (must commit to register if the
  test succeeds; no minimum capital to apply). Apply: **sandbox@secp.gov.pk**.
  ([SECP](https://www.secp.gov.pk/regulatory-sandbox/what-is-regulatory-sandbox/))
- **No 5th cohort announced as of Jul 2026** — timing may be opportune to ask Akif
  directly to open (or point us at) the next window. (SBP separately launched its
  own sandbox in Aug 2025 — but committees sit with **SECP**, not SBP.)

**Why we care (design):** Akif wants to know *what regulatory + credit
infrastructure let a digital ROSCA scale in Egypt*, so we can argue for the
equivalent enablers here (a sandbox cohort, a bank/AMC custodian, bureau access).
And the Oraan correction matters: the biggest local player took the **sandbox →
NBFC licence** ladder — so rather than "we're different because they're
unlicensed," our stronger line is *"we'll walk the same regulated path Oraan did,
but start guarantee-backed and AMC-custodied from day one."*

---

## 11 · What to put to him (research answered most of it — these are the real asks)

Research already closed the factual questions (all in the sections above):
- **Vault licence?** → an **SECP multi-AMC distributor registration** is enough; no
  EMI/NBFC needed to route savings to a CDC-held fund (§4).
- **Auto-debit?** → not true pull today for anyone; **Raast RTP now**, **Raast PISP
  pull in testing** (§5).
- **Insure defaults?** → **credit guarantee (NCGCL)** covers default; **takaful**
  only covers death/disability (§7–8).

So the genuinely-open questions — the ones only *he* can answer — are:

- Would SECP **open (or point us at) a sandbox cohort** for a digital committee
  platform, the way CBE did for Money Fellows in Egypt?
- Where exactly does **"Halqa covers defaults on its own balance sheet"** cross from
  an ordinary business cost into needing an **NBFC / insurance** licence?
- Can we reach an **NCGCL-style guarantee** and **eCIB/bureau** access *inside* the
  sandbox, or only after the NBFC licence?
- The **#7 float-backstop** (savers' vault float part-funding the guarantee) —
  allowed with consent, or a line we must not cross?
- Does he prefer we sit as a **distributor to an existing AMC (e.g. Mahaana)** or
  build toward our **own NBFC**, given where he wants this to go?

---

## 12 · Table of contents for the full product report (due ~2 weeks)

So you can see the shape of what he wants — *"every single detail, cybersecurity
to marketing."* Each becomes a section you can answer any question on:

1. Executive summary + the model in one page
2. The Saver/Consumer thesis (§3) and the market (size, segments; PK informal
   committee market ~Rs 4tn/yr, 3rd-largest savings channel)
3. Onboarding & identity (CNIC/NADRA, PIN, biometric, KYC tiers by risk)
4. Collection (rails, auto-debit/Raast, mandates, retries, reconciliation)
5. Pooling & products (record-only committee, vault, AMC-trustee investment,
   goal committees)
6. Prevention (eligibility filtering, quarantine, verification, vault buffers)
7. Recovery (the ladder), balance-sheet cover, takaful
8. Credit scoring & bureau roadmap (own score now → TASDEEQ/eCIB via partner)
9. Licensing & structure (SECP company, sandbox, where lines are — AMC/EMI/NBFC)
10. Financial model (unit economics, guarantee-fund sizing, revenue lines, P&L)
11. Technology & architecture (stack, APIs, scale, region/latency)
12. **Cybersecurity & data protection** (auth, secrets, PII, PECA/data law,
    pen-test posture)
13. Comparators (Money Fellows/Egypt, Oraan, iScore vs our scoring)
14. Risk register (regulatory, credit, fraud, liquidity, reputational)
15. Go-to-market & marketing (segments, channels, trust-building, unit CAC)
16. Roadmap & milestones (sandbox pilot → scale)

---

*Every factual claim in the researched sections (§2, §4, §5, §7–8, §10) carries an
inline primary-source link. Where a number could not be independently confirmed it
is marked in the underlying research notes; the design sections (§3, §6, §9) are
our own reasoning from Akif's brief, not external claims.*

---

## Appendix · Full research briefs (with every source URL)

The five analyst briefs behind this document — Pakistan investment-custody rails
(CDC/AMC/Mahaana/MTS/fund yields), auto-debit & Raast, Egypt/Money Fellows,
Oraan/sandbox/takaful, and ROSCA economics — are preserved verbatim with their
complete source lists in the research log. Pull them in for the full product
report's footnotes.
