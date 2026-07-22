# Halqa — Licensing & Credit-Bureau Roadmap (updated 2026-07-22)

> Written for the chairman: plain English, worked examples, honest about what is
> real today versus what needs a partner's signature. Every capability is
> **stage-tagged** so nobody ever over-claims. This replaces the vaguer "we'll
> sign TASDEEQ" line with the actual, researched process.

---

## 0. The one-paragraph version

We already hold the three pieces of paper that let a company *operate*: a
**Private Limited company** (our legal body), an **FBR NTN** (our tax number),
and a **payment-aggregator / merchant agreement** (our money rails). With just
those, Halqa can run the whole committee product, score our own members, and get
a foot in the door at a private credit bureau *to read scores*. What we **cannot**
do with those papers alone is **report defaults into the national credit system**
or touch **eCIB** — those need a bank partner. So the plan splits cleanly into
"do now" and "wait for the partner."

---

## 1. What each paper actually buys us

Think of it like a driving test. A car (Pvt Ltd), a licence plate (NTN), and a
fuel card (merchant agreement) let you *drive and buy petrol*. They do **not**
make you a *taxi company* that can pick up strangers for money — that's a
different, harder licence. Same idea here.

| Paper we hold | What it really is | What it unlocks |
|---|---|---|
| **Private Limited (SECP)** | Our legal body — the "person" that signs contracts | We can legally sign a bureau or bank agreement. Necessary for everything, but by itself unlocks nothing special. **SECP registration is NOT a licence.** |
| **FBR NTN** | Our tax registration number | Basic legitimacy; every real company has one. A bureau/bank will ask for it as part of "know your business," but it grants zero access on its own. |
| **Payment-aggregator / merchant agreement** | Permission to *route* money through a licensed payment company's rails | We can collect and disburse committee money through the aggregator. It does **not** make us a bank or a lender. |

**The key point:** none of these three makes Halqa a "credit institution" (the
legal category banks, microfinance banks and NBFCs sit in). That matters,
because the credit bureaus treat "credit institutions" completely differently
from everyone else — see §3.

---

## 2. What Halqa CAN do RIGHT NOW — no partner, no new licence

**[Everything in this section is FUNCTIONAL today on our current papers.]**

1. **Run the committee product as a facilitator.** We record money, we never
   hold it. We vet members, collect on the due date via the aggregator rails,
   and disburse to the turn-holder. This is *exactly* how Oraan operates — our
   biggest competitor uses the same "we're an agent, not a bank" posture. So
   the model is proven and legal.

2. **Score our own members with our own data.** This is a bigger deal than it
   sounds. **Oraan does not use a credit bureau at all** — it built its own
   risk score with an outside scoring vendor plus an in-house credit hire.
   Money Fellows (Egypt) is the same: proprietary, behaviour-based scoring, not
   a bureau feed. Our `score-bands.ts` (the new system where your score decides
   *which committee seats you may take*) plus our `CreditEvent` history is a
   legitimate, precedented approach. **No licence stops us from scoring our own
   members on our own data.** This is the engine that makes the whole
   anti-default machine work today.

3. **Build the default-reporting queue now.** Every missed payment already
   writes a `BUREAU_IMPACT_QUEUED` record, CNIC-linked, and members have already
   e-signed consent to bureau reporting (Clause 5 of the weekly undertaking,
   under the Electronic Transactions Ordinance 2002). **Building the pipe is
   free; firing it needs a partner (§3).** Doing it now means the day we get a
   partner, we have months of clean history ready to file.

4. **Let a member pull their OWN bureau score and show it to us.** A person is
   allowed to request their own credit report from TASDEEQ/DataCheck with their
   CNIC, and share it with us. This is a "consumer brings their own score" flow
   — legal today. *(Caveat: we still need to confirm each bureau will accept a
   non-bank as the app that receives it — a business-desk question, not a
   licence question.)*

---

## 3. What NEEDS a partner — the honest gate

There are **three different bureau relationships**, and our papers only reach the
first one. This is the part people get wrong, so here it is plainly.

### 3a. PULL a stranger's score at signup — **[PARTNER AGREEMENT]**
"When Ayesha signs up, Halqa automatically checks her TASDEEQ score to set her
starting band." — This needs a **subscriber contract** with the bureau. It is
**not a public sign-up form**; it's a negotiated commercial deal. **The good
news:** it does **not** require becoming a bank. Proof: **Karandaaz — a non-bank
company — signed a data-sharing agreement with TASDEEQ.** So a non-financial
company *can* get a pull contract. This is the one bureau relationship our
current papers can realistically chase.

### 3b. REPORT defaults into the bureau — **[BANK PARTNER]**
"A Halqa defaulter's record follows their CNIC into the national system so no
bank will lend to them." — This is the "life sentence" deterrent, and it's the
gated one. As a *non-credit-institution*, to furnish data directly we'd need a
**Federal-Government notification** (the special route utilities and telcos took
to become reporters) — that is a government process, not a sign-up, and no such
notification exists for a payment app today. **The clean path is to report
*through* a bank/aggregator partner who is already a bureau member.**

### 3c. eCIB (the State Bank's own registry) — **[BANK PARTNER], fully closed**
eCIB is **only** open to regulated financial institutions (banks, DFIs, NBFCs,
microfinance banks). A Pvt Ltd + NTN + merchant agreement cannot pull from it,
cannot even see our own members' records. The **only** way in is a partner FI
reporting on the circle's behalf. No exceptions.

> ⚠️ **Lawyer-to-confirm.** The exact wording of the Credit Bureaus Act 2015
> (Section 2 definitions of "credit institution" and "credit information
> furnisher") should be read by a Pakistani banking lawyer before we rely on any
> of §3 in a real dispute. Our research strongly supports the *direction* above,
> but the SBP PDFs did not parse cleanly enough to quote the clauses verbatim.
> One nuance a lawyer should nail down: the Act's definition uses "includes"
> (illustrative, not a closed list) plus a residual clause letting the Federal
> Government add classes — so the correct statement is **not** "a Pvt Ltd is
> categorically barred forever," it's "a Pvt Ltd has no *automatic* membership
> right and no *self-serve* path today."

---

## 4. The sequenced roadmap (by dependency, not calendar — dates follow signatures)

**Phase 0 — NOW, on current papers [FUNCTIONAL]**
- Run committees; score members with our own bands; accumulate the reporting
  queue; ship the gold-goal committee X-factor (see §5); pursue a TASDEEQ *pull*
  subscriber contract in parallel; get the undertaking + PG texts lawyer-reviewed.

**Phase 1 — first signatures (weeks-scale once we start calling) [PARTNER AGREEMENT]**
- **TASDEEQ / DataCheck subscriber (pull) contract** — Karandaaz-style, to set
  a real starting score at signup.
- **WhatsApp Business API provider** — turn the queued receipts/OTPs (which we
  already generate) into real messages.

**Phase 2 — the bank / aggregator partner (the big unlock) [BANK PARTNER]**
- Real Raast auto-collection pulls · custody for the Safety Fund and deposits ·
  **default reporting into TASDEEQ/DataCheck AND eCIB** · salary-deduction via
  employers · guarantor auto-debit.

**Phase 3 — scale-out [LICENCE / PARTNER]**
- NADRA biometric KYC · takaful (default insurance) · a refiner/vault partner
  for *physical* gold delivery (see §5).

**Phase 4 — after 12–24 months of revenue history [LICENCE+BANK]**
- Receivables securitisation, then own-revenue sukuk.

---

## 5. The X-factor to ship in Phase 0 — the Gold-Goal Committee

Research verdict: **leapfrog Oraan, don't copy it.** Here's the reasoning in
plain terms, because this is our single strongest near-term differentiator.

**What Oraan does:** their "Oraan Gold" locks *today's* gold price and delivers a
physical coin after you finish 6–10 months of installments. It's popular because
it fights inflation. **But** — locking a gold price today for delivery months
later is *deferred* gold-for-money exchange, which the majority Shariah view
treats as **riba** (gold-for-currency must be spot / same-session — this is the
*Bay' al-Sarf* rule). Oraan still markets it as Shariah-compliant. **That gap is
our opening.**

**What Halqa should do instead — the Gold-Goal Committee [FUNCTIONAL now]:**
a normal PKR rotating committee, except the host sets the goal in **grams/tolas
of gold** instead of rupees. The app shows live PKR-per-gram and sizes each
member's contribution to hit the gram target. On a member's payout day, they get
cash **plus a one-tap "buy gold now"** (or we auto-convert the pot to gold at
**that day's spot price**). Because the gold and the cash change hands in the
**same session**, it stays cleanly on the Shariah-compliant side — the member
simply carries price risk until their turn, which is exactly what makes it halal.

**Worked example:** Sana joins a 10-member gold-goal committee targeting 1 tola
(≈11.66g). Gold is Rs 24,000/gram today, so 1 tola ≈ Rs 280,000; her monthly
contribution is sized to that. When her turn comes in month 4, gold has risen to
Rs 26,000/gram — she receives the pot and buys her tola **at month-4 spot**. Her
committee kept pace with the rupee's fall; a plain cash beesi would not have.

**Why it wins in Pakistan:** a cash committee preserves *nominal* rupees; a
gold-denominated one preserves *purchasing power*. In an economy where gold has
risen in PKR every year on record, that's the whole pitch: *"your beesi keeps up
with the rupee."*

**The honest caveat:** *physical, allocated delivery* of gold needs a named
refiner/vault partner (like Oraan's ARY coins) — that's a Phase-3 dependency.
**Until then, ship only the cash-payout + assisted-purchase variant**, which
needs no custody and no licence. And the exact contract wording must be signed
off by a qualified mufti before we label anything "Shariah-compliant" — the
multi-month committee tenure is an edge case under AAOIFI Standard No. 57.

**Other differentiators worth queuing (all FUNCTIONAL):** make the turn-pricing
fee curve (early fee → late bonus) a public, headline feature; market our mutual
guarantee as hard as Money Fellows markets its company one; add an "earned early
slot" unlock (your first clean completed circle unlocks the earliest seats);
and show every gold committee's progress in grams **and** rupees side by side.

---

*Sources: Oraan product + T&C pages, Karandaaz–PICG/EY 2024 Oraan case study,
Money Fellows product pages + 2025 profitability coverage, AAOIFI Shariah
Standard No. 57 (via World Gold Council), SBP Credit Bureaus Act 2015, TASDEEQ /
DataCheck / eCIB. Figures on gold returns are indicative (commentary sources,
not SBP/WGC primary series). Bureau-access legal specifics are lawyer-to-confirm.
Yes boss.*
