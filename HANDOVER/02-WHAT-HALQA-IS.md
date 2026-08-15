# 02 · WHAT HALQA IS

---

## 1. The instrument

A **committee** (Urdu *kameti*, also "BC" for ballot committee; globally a
**ROSCA** — Rotating Savings and Credit Association) is a precise financial
machine:

- *n* members
- each pays a fixed contribution *c* every period
- each period, one member collects the entire pot *n × c*
- after *n* periods, every member has paid *n × c* and collected exactly once

Total in equals total out. The machine holds nothing at rest and earns nothing
for itself.

**Its genius is that it is two financial products fused into one schedule.**
Whoever collects early receives a lump sum before paying for it — an
interest-free loan repaid in installments. Whoever collects late pays
installments before receiving — forced saving under a commitment device.

### The formula everything else hangs off

At the moment member *k* collects, their remaining obligation to the group is the
**forward liability**:

```
L(k) = c × (n − k)
```

- Largest at seat 1: `c × (n−1)`
- Falls by exactly one contribution per seat
- Zero at seat *n*

**Risk is not spread evenly across a committee — it is concentrated entirely in
the early seats.** Every control Halqa has, and every failure in the competitor
archive, is ultimately about who bears `L(k)` when someone stops paying.

Worked example — 12 members, Rs 10,000 each, pot Rs 120,000:
- Seat 1 collects Rs 120,000 having paid Rs 10,000. Forward liability Rs 110,000.
- Seat 12 collects Rs 120,000 having paid Rs 120,000. Forward liability Rs 0.

### The four structural families of committee

| Family | How order is set | Halqa's position |
|---|---|---|
| **Ballot (random)** — Pakistan's default | Names drawn by lot ("parchi") | **Supported.** Plus a verifiable draw (see `03`). |
| **Fixed order (negotiated)** | Seats agreed at formation by need or seniority | **Core.** This is Halqa's pick-your-seat with band gates. |
| **Auction (the Indian chit fund)** | Highest discount accepted takes the pot; discount distributed as dividend | **REFUSED.** The discovered price is interest in substance — a worked example gives ~45–55% implied APR. Fatal to the riba-free positioning. |
| **Prize / "lucky committee"** | Draw winner takes the pot and *stops paying* | **REFUSED.** A lottery wearing a committee's clothes; most participants pay more than they can receive. |

### The scale of it in Pakistan

- Roughly **Rs 4 trillion** rotates through committees annually — the country's
  third-largest savings channel.
- About **37% of adults** participate; roughly **52 million people**.
- Only **13% of adults** hold a bank account. Among those who save, **33% use a
  committee** and **63% hide cash at home**.
- **The committee is not competing with banks. It is competing with a cupboard.**

Full sourcing in `07`.

---

## 2. The architecture — and the one decision everything follows from

**Halqa never takes possession of member money.**

When a member pays, funds travel directly from their account to the recipient's
over Pakistan's own rails. Halqa observes the settlement and writes it to a
double-entry ledger. That is the entire relationship between Halqa and the money
— at every planned stage, including the second, where savings are held by a
licensed trustee in the member's own name.

### Why this is a legal position and not a slogan

Pakistan's heavy financial licences each attach to a specific *activity*:

| Licence | Regulator | Triggered by | Halqa |
|---|---|---|---|
| **EMI** (Electronic Money Institution), Rs 200M capital | SBP | Issuing or holding e-money | Issues no balances, holds none |
| **NBFC** — Investment Finance Services | SECP | Lending, or pooling and deploying funds | Members fund each other; second-stage savings are deployed only by a licensed AMC under its own licence |
| **PSO / PSP** | SBP | Operating a payment system | Operates none; initiates over a licensed aggregator's |

The regulated activities **do not occur anywhere in the architecture**, so the
licences governing them cannot apply. This was designed in from the first line of
code and survives scrutiny because it is architectural rather than contractual.

### The same decision is the primary fraud control

Every major committee fraud in Pakistan required one precondition: **a central
pool under one person's control.** Halqa has no such account, and this protection
cannot be weakened under commercial pressure because there is nothing to weaken.

### Independent academic validation

Researchers at **Information Technology University Lahore** and the **University
of Washington**, funded by the Gates Foundation and Karandaaz Pakistan, published
this exact architecture in 2018:

> "Holding money deposits is not allowed without a license, and therefore the
> money flowing in and out of the ROSCA app could be directed to an individual's
> mobile wallet with the ROSCA app serving as a conduit."
> — Mehmood, Razaq, Webster, Batool, Mustafa, Raza and Anderson (2018)

Halqa reached it from the fraud angle; they reached it from the regulatory angle;
it is the same architecture.

---

## 3. The three roles Halqa plays

This is the canonical framing used in all documents:

1. **The Ledger** — records every settlement with receipts, timestamps and CNIC
   linkage. Admissible under the Electronic Transactions Ordinance 2002.
2. **The Treasury** — schedules, prices, collects and settles, without ever
   holding.
3. **The Credit Bureau** — converts payment history into the **Sakh**, a portable
   proof of reliability, and (planned) furnishes it to TASDEEQ.

---

## 4. Who it serves — stated precisely

The academic literature forces a narrowing that competitors do not make:

- **Khan (2013)** found regular income is a *precondition* for committee
  participation, and that the genuinely poor are excluded by the groups
  themselves as bad risks.
- **Kamran (2017)**, interviewing 30 unbanked Pakistanis, found committees give
  real control and that **not one of his thirty informants had ever experienced a
  member default.**

Both are true once "the poor" is split:

| Segment | Outcome |
|---|---|
| **The destitute** — irregular, insufficient income | Excluded by the groups themselves (Khan is right) |
| **The regularly-earning unbanked** — a tailor on Rs 17,000/month, a driver on Rs 22,000 | Served well, near-zero defaults (Kamran is right) |

**The committee filters on income REGULARITY, not income LEVEL.**

**Two claims that have been formally retired and must not reappear:**
1. That Halqa serves "the poorest."
2. That committees substitute for formal finance.

The defensible claim is that Halqa is the **on-ramp** to formal finance — which
is exactly what the Sakh and the Credit Passport deliver. This narrowing costs
nothing (the market is still tens of millions) and buys credibility with a
regulator who can check.

---

## 5. The economics

### Who pays

**Members pay Rs 0. Permanently.** This is not a launch promotion — it is the
lesson from Shahid Kazi's failed "Razq" (killed by fees) and from Oraan's
struggle to scale a fee-charging committee.

### Revenue lines

| Line | Mechanism | Stage |
|---|---|---|
| Progressive late fees | 2% / 5% / 10% by lateness tier | `FUNCTIONAL` |
| Marketplace share | 10% of an accepted turn premium | `FUNCTIONAL` |
| Halqa-fill fee | Charged for matching a standby member into a vacant seat | `FUNCTIONAL` |
| **Goal Direct-Pay commission** | Merchant pays 1–3% when a goal circle's pot buys their product | `GATE-2` / partnership |
| Aggregate market insights | Anonymised informal-savings trends sold to banks/FMCG/policymakers | Later |
| White-label to licensed FIs | MFBs/NBFCs licence the engine; they carry the regulatory burden | Later |

**Shariah note:** on Shariah-labelled circles, late fees route to the **circle's
own pool**, not to Halqa — a fixed penalty retained as income is impermissible.
Elsewhere they are platform revenue.

### The scale arithmetic (modelled, not measured)

```
Stage-one take rate (late fees + marketplace + fill): 0.27–0.65% of flow
At 10% market penetration (Rs 400bn flow):            Rs 1.1–2.6bn / year

Goal Direct-Pay commission, merchant-paid:            1–3% of brokered value
If 30% of circles are goal circles and we broker half:
0.30 × 0.50 × 1–3% = 0.15–0.45% of total flow      → Rs 0.6–1.8bn at same penetration
```

**Read:** merchant commission roughly matches or exceeds the entire member-facing
fee stack, while costing members nothing and touching no regulated activity. The
commerce layer is a second engine of comparable size to the first.

### Rail economics — why the plan says Raast first

```
Rs 20,000 installment:
  Card:                 20,000 × 3.3% + Rs 33  =  Rs 693
  Wallet (JazzCash/EP):                          Rs 300–600
  Raast or intra-wallet:                       ≈ Rs 0
```

Members pay nothing, so **every rupee of rail cost is unrecovered**. A 12-member
circle running one full cycle on card rails would burn Rs 52,272 in fees with no
member revenue to absorb it. **Raast at ≈0% is the only arithmetic under which
free-for-members survives.** Card is therefore not offered on standard circles,
and the chairman's Rs 300 ceiling per payment stands.

---

## 6. The stage model

### Stage 1 — record-only (now)

Everything described above. No custody, no lending, no bureau writes. Requires a
company and a merchant agreement, not a financial licence.

### Stage 2 — savings under trustee custody (planned)

**No bank is involved at any point.** Under the NBFC Regulations 2008 the assets
of every regulated mutual fund in Pakistan are held by a **trustee** — in
practice the **Central Depository Company (CDC)** — while the asset-management
company only manages them.

The money path for a Halqa saver: **member → CDC collection account → fund units
registered in the member's own name.** Halqa never sits in that path.

Licence required: an **SECP mutual-fund distributor registration** — a simplified
registration permitting distribution of multiple AMCs' funds. Not EMI (holds no
balances), not NBFC (deploys no funds). Investment-adviser licensing is avoided by
presenting an execution-only menu and recommending nothing.

Three products:

| Product | Mechanism |
|---|---|
| **Growth Vault** | Idle savings — typically a late-seat member waiting their turn — routed into an Islamic money-market or income fund yielding roughly 10–11% against inflation of 11–12%. Committee money today earns zero while it waits. |
| **Safety Vault** | The same holding, **pledged**, with a lien in favour of the circle. A missed installment settles from the member's own units. *A member with a pledged buffer cannot default up to the size of that buffer.* |
| **The Float** | Contributions buy fund units in the payer's own name on pay-in and redeem on payout day. At 10–11% annual, one month of float ≈ 0.85–0.9% of the pot — about Rs 1,000 per round on a Rs 120,000 pot, accruing to savers rather than to nobody. Carries a liquidity buffer so no payout waits on a redemption. |

**How stage 2 strengthens stage 1:** stage one prevents default with **position**
and **price**; stage two adds **property**. Every member who adopts the vault
reduces the exposure of every circle they sit in.

---

## 7. The Sakh — the credit score

Named **Sakh** — the Urdu word for economic credibility. Needs no explanation to
a Pakistani user and cannot be borrowed by a foreign competitor.

| Band | Range | Seats claimable | Marketplace |
|---|---|---|---|
| Rebuilding | below 550 | Last three seats, never earlier than halfway | May not buy |
| Fair | 550–649 | Second half of the order | May buy |
| Good | 650–749 | Any free seat | May buy |
| Excellent | 750+ | Any free seat | May buy |

- Scale **300–850**, opening at **700**.
- **Hosting requires 700.** Marketplace requires any non-Rebuilding band (550+).
- **Tenure quarantine applies regardless of score** — a new account's 700 is an
  assumption, not a record.

### Why this signal is unusually strong

From Kamran's field interviews, a housemaid earning Rs 15,000/month:

> "I know that I have to pay the Committee instalment; it is necessary. We can
> compromise on rent or [utility] bills, but Committee [instalments] should not
> be missed."

Committee obligation ranks **above rent and utilities** in the household payment
hierarchy — not because the committee can evict, but because failing the group is
socially worse. **The Credit Passport is not exporting a soft signal. It is
exporting the hardest one the household has.**

### Bureau interoperability

TASDEEQ publishes a **200–600** scale; a linear invertible mapping onto Halqa's
300–850 is implemented, placing the 550/650/750 cutoffs at roughly TASDEEQ
382/455/527. TASDEEQ already ingests data from **non-financial contributors**
(utilities, telcos, insurers), so Halqa can join as an alternative-data
contributor **without a financial-institution licence and without a bank
partner**. Bureaus operate on reciprocity, so furnishing earns reads in return.

**The strategic value:** informal committee repayment history **exists in no
written form anywhere on earth**. At scale Halqa becomes the monopoly supplier of
an entire data class the national credit system lacks.

---

## 8. Default prevention — the seven layers

| Layer | Mechanism |
|---|---|
| **1 · Identity** | CNIC photographed at signup, GPS home pinned, uniqueness enforced on CNIC/phone/email. Every obligation binds to a government identity. |
| **2 · Position** | Band and tenure define claimable seats. Members below 550, and **all new members regardless of score**, may claim only the last three seats, never earlier than halfway. Graduation needs two clean circles *and* manual verification. **Worst-case exposure to an unproven member is two contributions** — Rs 20,000 on a Rs 120,000 pot. |
| **3 · Schedule** | Fixed dates, escalating reminders, day-before balance check, and an internal grace window never shown in the UI: `max(2, min(14, round(period × 0.23) − 2))`. |
| **4 · Price** | 2% / 5% / 10% by lateness tier with matched score damage −10 / −20 / −40. Post-payout default reaches **−200**. |
| **5 · Payout controls** | Three distinct mechanisms: a round's payout cannot release while any contribution in it is unpaid (including the recipient's own); a linked-account default withholds it; and where the forward-liability gate is on, a security shortfall is withheld from the payout, **capped at 60%**, released in steps as clean payments land. |
| **6 · Consequence** | Platform-wide feature lock, internal flag, recovery case for outstanding plus penalties plus a 10% rehabilitation fee. All CNIC-linked and timestamped. |
| **7 · Contract** | Weekly e-signed undertaking (typed legal name matching the account + optional drawn signature, stored with SHA-256 hash, IP and timestamp) and an auto-executed **mutual member-to-member guarantee — never to Halqa** — required from every member before a circle can start. |

**Legal reality check (verified):** signing a personal guarantee and then
defaulting is **civil, not criminal — there is no jail**. The only jail route was
§489-F PPC (dishonoured cheque, up to 3 years) and **cheques were dropped from
the model**. Asset recovery is via an **Order XXXVII CPC summary suit** — the
undertaking and PG qualify as a written contract for a fixed sum; 10-day
leave-to-defend; decree executable against assets. This needs a court decree
first and takes months. **Never claim Halqa can jail defaulters.**

Yes boss
