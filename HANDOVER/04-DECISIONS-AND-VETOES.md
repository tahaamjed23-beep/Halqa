# 04 · THE DECISION LOG

Every ruling, chronologically. Later entries supersede earlier ones — **read to
the end before acting on anything here.** Where a decision was later reversed the
reversal is marked.

---

## 7 July 2026 — communication protocol

**"Yes boss" sign-off required on every message.** Instituted as a truth-marker
after agents overstated progress. Never lie, never overstate; say "unverified" or
"failed" plainly when true. When docs and code disagree, read the code and say so.

---

## 14 July 2026 — three product rules

**1 · Keep every feature; label honestly.** Chairman: *"keep everything even if
not shariah, just dont say its shariah in the app."*

Non-Shariah features — the early-turn fee, turn-market premiums, the crypto vault
tier, the guarantee pool and slot fee — **stay fully functional**. Halqa never
*claims* Shariah compliance where it does not apply, and always keeps a halal path
adjacent. The only things that may gate a feature are (a) custody or licensing,
(b) an explicit chairman request, or (c) a hard safety rule (crypto is never
usable inside committees). **"Not halal" is NOT a reason to remove.**

**2 · Learning-register documents.** He rejected the v3 report set: *"too brief…
just meeting points… i need learning reports, full learning detailed."* Two
document registers now exist and both must be maintained — a meeting register
(bullets, numbers) and a learning register (define every term, show the rupee
arithmetic, give an example, add a self-test).

**3 · Host-configurable float window** — the host sets the expected early-payment
window at creation, feeding every projected-returns chart.
**STATUS: IMPLEMENTED 18 July.**

---

## 19 July 2026 — stage-tag everything

The record-only app alone is *"nominal profits, very basic"* — the differentiator,
profitability and security all come from **deployment** (real money placement).
Therefore: in every business explanation, assume licence and partner both exist as
the **base case**, and tag every claim `FUNCTIONAL` / `LICENCE` / `BANK PARTNER` /
`LICENCE+BANK`.

**⚠️ PARTIALLY SUPERSEDED 28 July** — the bank-partner tag is dead (see below).
Current tags: `FUNCTIONAL` / `BUILD` / `GATE-2` / `STAGE-2`.

---

## 20 July 2026 — Shahid Kazi meeting → the simplicity pivot

Ex-Alfalah SEVP, ex-Rozee CEO, MFB director. Liked it; not investing.

- **His own failure "Razq" could not scale because fees were too high.** ⇒ **low
  or zero user fees or it dies.** This is the origin of the permanent Rs 0 price.
- **Study Money Fellows (Egypt).**
- **Make it simple** — this stage is about customers. Just lend and pay. **No
  investments, no vault, no engines, no tiers** for now.
- **The host must have a real incentive** — hosts are the acquisition engine.
- **Link the payment APIs.**
- **Monetise via consented intent-data sales, not user fees.**

**How it was applied:** the investment/vault/engine code was **not deleted** — it
was hidden behind `SIMPLE_MODE`, per the keep-everything rule.

**⚠️ The intent-data line was later reframed** — see 2 August.

---

## 20 July 2026 — brand v1 and go-live

- Tier names renamed at the **display layer only** (DB enum unchanged):
  CLASSIC→Basic, SUKOON→Earn, BAZAAR→Earn & Share, PRIORITY→Early Access,
  SIGMA→Maximum.
- **Halqa went live on Vercel.**
- Original brand ruling: **gold and white, "not dark green."** **⚠️ REVERSED
  2 August.**

---

## 22 July 2026 — scoring and signup

**1 · Credit-weighted turn REORDERING scrapped entirely.** Credit no longer moves
anyone. It only controls **which free slots you may claim** at join, plus
marketplace access. *Why: reshuffling people by score was confusing and felt
unfair.* A claimed slot is permanent. Also removed the user-facing
"Secure"/"Strong" circle labels.

**2 · Signup security batch built** — phone OTP, app PIN on every open,
address/city/occupation/employer capture, proper card linking (PAN and CVC never
persisted). Vault stripped from the UI via `SIMPLE_MODE`.

**3 · Gold-goal committee identified as the top X-factor** — spot-settled beats
Oraan's price-lock on Shariah grounds. Shippable now, cash-only.

---

## 23 July 2026 — the record-only lock, then Akif's reversal

### Morning: hard constraints locked

Chairman: Halqa is **pure record-only**.

- **NO vault, NO security deposits, NO payout hold-back, NO custody, NO bank
  partner — ever.** *"Stop citing deposits/holdback/vault as live defences."*
- **Anti-default rests ONLY on:** turn-position quarantine, tenure progression,
  legal instruments (mutual PG + weekly undertaking), reputation and the Credit
  Passport, and family/linked-account withholding.
- **New-member quarantine:** every new member, **regardless of credit score**, may
  take only one of the **last 3 turns** of ANY committee. Unlocks after **2 clean
  completed committees + manual verification**.
- **Income/employer verification → 80% discount** on Halqa's charges. A discount,
  not a gate.
- **CNIC camera capture + optional biometric unlock.**

### Same day: Akif Saeed meeting 2 — several absolutes reversed

He is the sitting SECP Chairman. His direction **outranks our self-imposed
"never" constraints.** Read `01` for the full list. The reversals:

| Morning rule | Akif's direction |
|---|---|
| No vault, ever | **Revive the vault** — but via a licensed AMC + CDC trustee so Halqa still never holds money |
| No company capital at risk | **Halqa should cover defaults on its own balance sheet and insure that exposure with takaful** |
| No bank partner ever | Use CDC + AMC instead — *(this one survives, and hardened on 28 July)* |

He also asked for: **filtering over enforcement** (show members only what they are
eligible for; income-tiered circles; keep barriers low), **separate consumers from
savers**, **study Money Fellows and Egypt**, and **a full product report in ~2
weeks** covering everything from cybersecurity to marketing.

**⚠️ UNRESOLVED TENSION:** Akif says cover defaults from the balance sheet and
insure them. The competitor archive says balance-sheet guarantee is what killed
eMoneyPool, and Money Fellows only carries it because it is licensed. The current
documents take the archive's side (position-as-collateral, no platform cover) and
route takaful to Stage 2. **This has never been put back to the chairman for a
final ruling. Flag it.**

---

## 28 July 2026 — no bank partner, ever

The chairman ruled while reviewing the report set: **Halqa will never use or need
a bank partner. Remove the concept from all documents.**

- **Second stage (Vault + Float)** runs entirely through **CDC as trustee** (holds
  fund assets, units in the member's own name) plus a **licensed digital AMC**
  (manages). Halqa's role is distribution and records under an **SECP mutual-fund
  distributor registration** — not EMI, not NBFC.
- **Bureau access:** without a bank/FI partner, reads come via a subscriber
  agreement directly with TASDEEQ/DataCheck. Bureau *writes* stay out of scope for
  stages one and two.
- **The old line "reach custody via a bank/EMI partner" is dead.** The only bank
  account anywhere in the plan is Halqa's own ordinary corporate operating account
  at Gate 1, which is not a partnership.
- Removed from documents: "bank-custody circles" as a plan. Level-2 KYC is now
  described as account verification reserved for second-stage products. The
  `BANK_CUSTODY` code and Soneri sandbox rail stay in the tree but are **not
  documented as a roadmap item**.

### Document style rulings from the same session

Apply to every future document:

- **Formal-human register** — clear declarative sentences, never casual. He
  specifically rejected *"not WE DONT HOLD money"* phrasing.
- **NO italic kicker or teaser lines** under headings.
- **NO "correction" or "previously we said" boxes**, no self-referential meta —
  just state the correct fact. *"remove these disgusting boxes… i hate that, and
  those like mini italic texts give away u are ai."*
- **Figures labelled as Exhibits.**
- **Mechanisms must be specific enough that "how?" never arises.** Example he gave:
  payout holdback = the release endpoint refuses while any round contribution is
  unpaid + linked-default withhold + a forward-liability pot slice capped at 60%.
- **Benchmark: JP Morgan pitchbook discipline.**

---

## 31 July 2026 — payday collection shipped

Commit `6052124`. Came from a chacha: *"I pay as soon as my pay arrives."*
Suite went to **60 unit / 352 integration**, all green.

---

## 2 August 2026 — the data strategy session

### The escalation, and where it landed

He pushed progressively harder on data:
1. *"we need permission for every piece of data on their device, we will however
   be ethical"*
2. *"ok fine but lets include everything we can actually get, eg the sms
   notifications"*
3. *"recommend other things WE CAN GET, whether they are ethical or not"*
4. *"try to find something that is unethical or ethical we dont care, just legal,
   that wont take the app down or SECP shuts it down"*
5. Then, on being shown an aggressive list: **"no man most of these are u trying
   to sound evil, i just want here, the sell score access, but we will link with
   tasdeeq… find better ones actually useful and not illegal"**

**The finding that resolved it:** his own three filters — legal, no Google
delisting, no SECP shutdown — **already exclude the entire harvest playbook.**
Contacts, gallery, READ_SMS, precise-location-as-lender, Accessibility and
QUERY_ALL_PACKAGES each fail Google or SECP. So the aggressive ask and the ethical
answer converged.

### Decisions taken

- **Location:** keep the one-time precise GPS home pin, add server-side IP
  geolocation as a free cross-check. **No background location.**
- **Accessibility Service bank-screen reading: REJECTED** with three reasons on
  record (see `03` section D).
- **The balance/payday signal comes from:** the pull attempt itself, the
  credit-alert listener, and Raast at Gate 2 — never screen-reading.
- **THE strategic move: incentivised volunteering beats scraping.** Reward a Sakh
  boost or fee discount for uploading a bank statement, linking salary, adding a
  guarantor. Same payload, consented, survives every filter forever, and is better
  data because it is structured rather than parsed.
- **Usage rule:** grey telemetry is fine **invisible-and-defensive** (fraud,
  security, risk pricing); never **visible-and-extractive** (profiling inferred
  wealth for sale).

### Growth strategy approved

TASDEEQ two-way membership (flagship), organizer incentives on **value not
recruitment depth** (multi-level is an illegal pyramid), formal-finance on-ramp,
remittance committees (licensed rail only, **never hold FX**), employer committees
("for later"). Plus a liked-but-unprioritised batch: gold, credit-builder,
seasonal Islamic, merchant-sponsored, white-label to FIs, aggregate insights, BISP.

### The hit-piece analysis

For a trust-moat company **the journalist threshold is below the legal one.**
Three things already in the model rhyme with the loan-app scandal and were flagged
as **LIVE RED ALERTS**:

1. **Intent-data sale** → "sells poor people's dreams." **Reframed to Goal
   Direct-Pay** — we negotiate a better deal, the merchant pays commission.
2. **Public default flag** → "publicly shames missed payers." **Kept INTERNAL.**
3. **Non-removable salary anchor** → "drains wages, can't switch off." Needs
   member-facing "why this protects you" plus a pause-with-reason that costs score
   not access.

Also flagged: late fees as Halqa profit ("profits when the poor fall behind" —
routed to the circle pool on Shariah circles), and the hidden grace window
("conceals real deadlines" — frame as "we forgive honest slips").

### Brand v2 approved — reversing the July ruling

He pasted JazzCash and Easypaisa screenshots: *"look at these guys and look at us,
we look like ai slop."*

**Approved and shipped:** pine/gold "Evergreen & Saved Gold" palette, "The
Register" logo, the score renamed **Sakh**. This **reverses** the 20 July
gold-and-white ruling. Reason: gold-led reads greedy and rhymes with the 400
banned loan apps; deep pine is the trust territory those apps left vacant. Full
detail in `09`.

---

## 9 August 2026 — the discipline layer

Chairman's rules, specified in `docs/HALQA-DISCIPLINE-LAYER-2026-08-09.pdf`:

- **No normal cancel button.** Mid-cycle exit requires a story to the group, then
  majority approval; contributions return **at the end of the cycle** as the
  punishment; fines apply; total inability to pay → Halqa helpline and a recorded
  statement.
- **PIN + face recognition at join.**
- **24-hour buffer before the committee starts** with penalty-free exit.
- **Affordability from the income slip** — the system computes how many committees
  you can afford; more requires contacting Halqa with proof of additional income.

### Two corrections he made the same day

**Correction 1 — leniency killed.** The first design offered lighter controls to
circles where everyone knows each other. He rejected it: *"no i dont want too much
leniency, there will still be autodebit and insurance. i just need a way that we
can detect whether they know this person, perhaps contact list or something."*

⇒ Authenticity became **detection that only tightens**, never a relaxation.

**Correction 2 — the topology was backwards.** The second design tested whether
*all members* know each other (a mesh) and removed the host to check connectivity.
He corrected: *"the idea is that the host knows everyone, and this is only for
tier 1 committees, the other one as we discussed open ones, dont require this."*

⇒ **He is right and the literature agrees.** Kamran's informant: *"It is his job
to decide whether to accept someone into the Committee."* The organizer is the hub
**by design**; the star is the real structure, not a fraud signal. The test became
**spoke integrity** — every host↔member link confirmed from both ends, Tier 1
only. Full design in `03` C1i. **Awaiting his approval.**

---

## Standing rules that have never been overturned

1. **Never hold member money.**
2. **Members pay Rs 0, permanently.**
3. **No bank partner, ever.**
4. **Never remove a feature for being non-Shariah** — only refrain from labelling
   it Shariah.
5. **Never blind `prisma db push` against production** — additive-only hand-written
   SQL.
6. **Never claim we can jail defaulters.**
7. **Never use multi-level organizer compensation.**
8. **Never hold or move FX** in remittance committees.
9. **Never hold the metal** in gold committees.
10. **The member fee ceiling is Rs 300** on a Rs 20,000 installment.
11. **Do not use workflows or the Agent tool** unless asked.
12. **Do not mention kameti.pk.**

---

## Open questions never put to him

These are genuine gaps. Raise them when relevant.

1. **The balance-sheet default cover tension** (Akif vs the archive) — above.
2. **The organizer guarantee.** In the traditional system the host covers a
   defaulting member from his own pocket, and Kamran's informants cite that
   guarantee as their main reason for feeling safe. Removing custody — correctly —
   also removed it. Either we reproduce it (host guarantee, circle pool, or
   platform cover at the licensed stage) or we state plainly that seat arithmetic
   replaces it. **Both are defensible; silence is not.**
3. **Circle authenticity v3** — the paired-declaration design awaits approval.
4. **Exit fine level** (one installment, 70/30 split), the **33% affordability
   cap**, and the **Tier 1 ceilings** are all proposals, not settled policy.

Yes boss
