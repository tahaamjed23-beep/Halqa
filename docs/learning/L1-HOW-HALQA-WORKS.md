# Learning Volume 1 — HOW HALQA ACTUALLY WORKS
### A complete teaching walkthrough. No prior finance knowledge assumed. Read with a calculator; every number here can be checked by hand.

---

## Part 1 — What a committee is (start from absolute zero)

A **committee** (kameti / BC / ROSCA — "rotating savings and credit association" in economics textbooks) is the simplest financial machine humans ever invented. Here is the whole thing:

> Twelve people agree to each put in Rs 11,667 every month. That makes a pot of Rs 140,004 each month (12 × 11,667 = 140,004). Each month, ONE member takes the entire pot. After 12 months, everyone has had exactly one turn, and the committee ends.

That's it. Now check the arithmetic of what each person experienced:

- Every member paid in 12 × 11,667 = **Rs 140,004** over the year.
- Every member received the pot once = **Rs 140,004**.
- Net position: exactly zero. Nobody gained or lost a rupee.

So why does anyone bother? Because of **when** you get the money:

- The person with **turn 1** gets Rs 140,004 in month 1, having only paid in Rs 11,667 so far. She has effectively received an **interest-free loan** of the rest, which she repays over the following 11 months.
- The person with **turn 12** pays in for 12 months and gets her money at the end. For her, it worked like a **forced savings plan** — the social pressure of the group made her save when a bank account never would have.
- Everyone in between gets a blend.

One machine, three products: a loan (early turns), a savings account (late turns), and a **commitment device** — you can't skip a payment when the "bank" is your neighbours and your reputation. About 41% of Pakistanis have used one; roughly US$5 billion a year rotates through them.

### The three flaws Halqa exists to fix

1. **Fragility.** Suppose the turn-2 member collects her Rs 140,004 in month 2 and then simply stops paying. She owes the group 10 more payments of 11,667 = **Rs 116,670**, and there is no contract, no collateral, no court that will realistically recover it. The group eats the loss. In a paper committee, recovery on a default like this is essentially **0%**.
2. **Dead money.** Money sits idle inside the committee constantly (paid on the 1st, handed over on the 30th). With Pakistani inflation in double digits, idle money is literally shrinking in purchasing power while it waits. Nobody has ever been paid for those waiting days.
3. **Invisibility.** A woman who pays 144 installments over 12 years with zero misses has demonstrated world-class creditworthiness — and has **no credit history whatsoever**, because none of it was recorded anywhere a bank can read.

Halqa = the same machine + enforcement + yield on the dead days + a recorded, portable reputation.

---

## Part 2 — The golden rule: recorded, never held

This is the single most important design decision, so let's be precise about it.

**Halqa does not hold anyone's money.** When Bilal owes Ayesha his installment, Bilal sends the money directly to Ayesha — by Raast (the state's free instant transfer system), a wallet, or cash — and then records the payment in Halqa with a reference number. Halqa's job is to be the **scorekeeper and referee**: it knows who has paid, who is late, whose turn it is, what everyone's deposit covers, and it enforces the consequences.

Why build it this way?

- **Every big committee fraud in history** — the Karachi Rs 400 million online-committee scam, India's chit-fund collapses — had the same root cause: one operator physically held everyone's money and ran. Halqa is structurally incapable of this fraud because there is no pot to run with.
- **Regulation.** In Pakistan, the moment you hold or invest client money, you need a licence from the SECP (the securities regulator). Recording and refereeing needs none. So Stage 1 (now) is record-only; Stage 2 (after the NBFC licence — the exact licence the startup Oraan already obtained, so the path is proven) adds real custody and real investment.
- **Trust psychology.** A new user doesn't have to trust Halqa with a single rupee on day one. She only has to let it keep score. Trust is earned one clean cycle at a time.

One consequence you must understand: **today, all the "profit" numbers are computed, not banked.** The engine calculates what the idle money *would* earn at real, dated market rates, and records it. Nothing is actually deployed until the licence exists. The app says this openly.

---

## Part 3 — The double-entry ledger (the machine's skeleton)

Everything in Halqa sits on a **double-entry ledger**. This concept is 600 years old and it is the reason accounting works:

> Every movement of value is recorded twice — once as a **debit** (where it came from) and once as a **credit** (where it went). The two sides must always be equal.

Example: Bilal pays his Rs 11,667 installment for round 3:

| Debit (from) | Credit (to) | Amount | Reason code |
|---|---|---|---|
| user:bilal:external | committee:X:round3 | 1,166,700 paisa | CONTRIBUTION_RECORDED |

Two details worth noticing:

- The amount is in **paisa** (1 rupee = 100 paisa) and stored as a whole number. Why? Because computers represent decimal fractions imperfectly (try 0.1 + 0.2 in any programming language — you get 0.30000000000000004). If you do millions of money calculations with decimals, tiny errors accumulate. Whole-number paisa can never drift. This is the same reason physicists prefer exact integer units.
- Every entry has a **reason code** and an **idempotency key** — a unique tag that makes it impossible to accidentally record the same payment twice (if the same key arrives again, the ledger refuses the duplicate).

The payoff: at any moment, anyone can reconstruct every balance from the entries, and the system has automated tests proving **conservation** — across a full cycle, the bonuses paid out sum *exactly* to the profit created, to the paisa. Money cannot be invented or vanish. Think of it as the ledger's conservation of energy.

---

## Part 4 — One circle, start to finish (the running example)

Meet the reference circle used everywhere in Halqa's documents: **12 women, Rs 11,667/month each, pot Rs 140,004, 12 monthly rounds.** Ayesha is the host. Let's walk the whole year.

### 4.1 Creation
Ayesha (reliability score 700+, required to host) creates the circle: name, 12 members, Rs 11,667 contribution, 30-day period. She picks a **tier** (Part 5 explains tiers) — say Sigma, the full engine. She can add a goal tag ("Hajj fund"), and configure the protection settings (deposits, holdback, penalties — all on by default).

### 4.2 Joining
Ayesha invites her own circle — the same women she already runs a paper committee with. Each one sees a **pre-join preview**: the exact terms, and Ayesha's reputation card (her history as a host). Two automatic gates check every joiner:

- **Score gate:** reliability score must be ≥ 550 (everyone starts at 700; being late costs points).
- **First-circle cap:** someone who has *never completed a committee on Halqa* cannot join a circle above Rs 25,000/installment. New people prove themselves in small circles first — the app enforces the caution a wise host applies instinctively.

### 4.3 Turn order
Who gets month 1? Halqa's default is **credit-weighted ordering**: the most reliable members are placed in the earliest turns. Why? Work out who can hurt the group most. The turn-1 member collects Rs 140,004 while having paid in only 11,667 — she owes the group Rs 128,337 of future payments. The turn-12 member owes nothing after collecting (her turn is the last event). **Early positions are where the risk lives**, so the platform puts its most proven people there. (The host can override; a random ballot is also available.)

### 4.4 Security deposits — sized to the danger
Before the circle starts, each member posts a **security deposit** — and here is the elegant part: the deposit is sized to how much that member could run away with.

Formula: deposit ≈ **90% of the member's remaining dues after her payout**, shrinking linearly to 0 for the last position (capped at 95% after credit adjustments).

Worked out for our circle (remaining dues after payout = 11,667 × number of payments still owed):

| Position | Still owes after payout | Deposit (~90% of it) |
|---|---|---|
| 1 | 11 × 11,667 = 128,337 | ≈ Rs 115,500 |
| 6 | 6 × 11,667 = 70,002 | ≈ Rs 57,300 |
| 12 | 0 | Rs 0 |

Check the logic: position 12 can't abscond (she gets paid last), so she posts nothing. Position 1 could do maximum damage, so she posts nearly everything she could steal. If anyone defaults, their deposit is **forfeited to the group**, covering most of the hole.

And the deposit is not dead weight — it **earns profit the whole year** (Part 5). Collateral that pays you. Deposits always come back in full to anyone who doesn't default.

### 4.5 A round, day by day
Round 3, say. The round opens; each of the 12 owes Rs 11,667, due by day 30.

- Day 1–29: members pay (transfer to the round's recipient directly, record with reference). Early payment is rewarded (the early-bird mechanic, Part 5).
- The app sends reminders as the due date approaches; other members can send gentle nudges from the Protection tab.
- Day 30: due date. Suppose Sana hasn't paid.
- **The grace window:** Halqa quietly allows a short internal grace period after the due date (calibrated to the circle's length, clamped between 2 and 14 days) before the heavy escalation starts. Crucially, **the member is never told how long it is** — if people knew the real deadline was day 37, day 37 would become the new deadline. (This is the one number in the whole system that is deliberately secret. Never mention its size to anyone.) Penalties and score damage still apply from day 30 — only the *escalation to ban* waits.
- **Late penalties:** progressive and fixed — 2%, then 5%, then 10% bands, never compounding. Where does penalty money go? **Not to Halqa.** In halal tiers, to charity at completion (there's a classical Islamic ruling behind this — Volume 3 explains); otherwise, to the members who were never late.
- **Auto-cover:** if Sana opted in, her missed installment is automatically paid from her personal vault savings (Part 6). She still gets the penalty and the score hit — fairness to the group — but the miss never snowballs toward default.
- Once all 12 payments are in, Ayesha releases the payout to the round's recipient, and the next round opens.

### 4.6 The payout holdback
When a member receives her Rs 140,004 pot, **15% (Rs 21,000) is held back** and released only as she keeps paying her remaining installments cleanly. Why: the moment of maximum temptation is right after collecting. The holdback keeps skin in the game past that moment. (At cycle end, any remaining holdbacks are force-released — an automated test exists specifically to prove no holdback can get stuck.)

### 4.7 If the worst happens
Say the turn-2 member collects and vanishes. The sequence: grace expires → marked defaulted → **platform ban** (visible to every future circle) → her deposit (≈ Rs 105,000 at position 2) and her Rs 21,000 holdback are forfeited to the group → a recovery case opens. She can rehabilitate — clear the dues plus a fee, serve a cooldown — because permanent exile helps nobody, but her record remembers.

Group's arithmetic: she owed 10 × 11,667 = Rs 116,670. Forfeited collateral ≈ Rs 126,000 — the group is actually made whole. This is why the deposit curve was raised to 90%: in the calibrated 100,000-person simulation, **90.4% of defaulted exposure is recovered** and **70% of defaults are fully covered**, versus **0%** in a paper committee.

### 4.8 Completion
Round 12 ends. Deposits return in full to everyone (plus the profit they earned). Remaining holdbacks release. The cycle's pooled profit is split (Volume 2 — the engines). Everyone's reliability score gets +25 for a clean completion. Each member's **Credit Passport** — a signed, verifiable export of her record (cycles completed, on-time %, total recorded) — gets one cycle richer. Any lender can verify a Passport through its link without having a Halqa account.

---

## Part 5 — The five tiers (choose your engine)

A tier is just a bundle of engine switches. From simplest to fullest:

| Tier | What's on | Halal status shown in-app |
|---|---|---|
| **Classic** | Nothing — pure rotation, exactly the paper committee | Neutral |
| **Sukoon** ("peace") | Idle money earns; deposits earn; each keeps their own yield | 🟢 Halal structure |
| **Bazaar** | Sukoon + "patience pays": all profit pooled, split favouring later turns | 🟢 Halal structure |
| **Priority** | Early positions pay a fee (max 10%) that goes to the waiting members | 🟠 NOT Shariah-reviewed |
| **Sigma** | Everything at once | 🟠 NOT Shariah-reviewed |

The labels are the point: Halqa never blurs the halal line to sell a feature. The two 🟠 tiers exist because some groups want them (the chit-fund tradition of paying for early access), but they're labelled honestly, the fee is capped at 10%, declines to zero across positions, and **Halqa keeps none of it** — it moves member-to-member. A fully halal option is always one tap away.

What the engines produce in our reference circle (all numbers are outputs of the actual code, locked by automated tests): best member's annual bonus ≈ **Rs 0** (Classic) → **7,600** (Priority) → **7,650** (Bazaar) → **15,285** (Sigma monthly) → **16,982** (Sigma pooled). The full mechanics, with arithmetic, are Volume 2.

---

## Part 6 — The Sukoon Vault (your personal pocket)

Outside any committee, every member has a **vault** — a personal halal savings pocket.

- **Park a payout:** collected Rs 140,004 but only need 100,000 now? Leave 40,004 in the vault, where it keeps earning until you sweep it out.
- **Top up:** deposit any amount from Rs 100, committee or no committee.
- **Four yield tiers** (pick your risk): Standard ~10.8% 🟢 · Income ~12.1% 🟢 · Gold-linked ~15% 🟢 · Crypto "~30%" 🟠 **extreme** — see below.
- **Sweep anytime:** principal + profit − 5% of the *profit only* (Halqa's share; Volume 4 explains why 5%-of-profit is the whole business model).
- **Auto-cover:** the opt-in from Part 4.5 — your vault automatically pays your own late installment. Your savings become your own default insurance: no insurance pool, no premiums, no one else's money at risk.

**About that crypto tier** — it exists mostly to prove the system can say no. It is rated 10/10 risk, marked "not government-backed" in red, invisible until you deliberately raise your risk ceiling to maximum, requires a double confirmation in the app AND a special acknowledgement flag in the API (the server refuses a silent switch with an HTTP error), applies to the personal vault only, and is **permanently barred from committees**. Group money can never touch it.

---

## Part 7 — The protection stack, assembled

You've now met every layer. Here they are in firing order, from prevention to cure:

1. **Score gates** (550 join / 700 host) — filter at the door.
2. **First-circle cap** (Rs 25,000 until one clean cycle) — small stakes until proven.
3. **Credit-weighted ordering** — reliable people in dangerous seats.
4. **Graduated deposits** (≈90% of remaining dues) — collateral sized to temptation.
5. **Reminders + peer nudges** — social pressure, digitised.
6. **Hidden grace window** — humanity without gameability.
7. **Progressive penalties** (2/5/10%, → charity or the never-late) — discipline that doesn't enrich the platform.
8. **15% payout holdback** — skin in the game after the payout.
9. **Vault auto-cover** — your own savings absorb your own slip.
10. **Ban + forfeiture + recovery + rehabilitation** — real consequences, real road back.
11. **Credit Passport** — the long game: your behaviour follows you, both ways.

Measured effect (calibrated 100k simulation, same simulated people living the same year with and without the stack): post-payout defaults **1.41% → 0.27%**, recovery on default **0% → 90.4%**, the worst-risk segment improves **7.95% → 0.83%**.

---

## Part 8 — What Halqa is NOT (honesty section)

- It does **not** hold or invest real money yet — everything yield-related is computed at dated market rates and labelled indicative. Custody needs the SECP licence.
- It is **not** Shariah-certified — the halal engines are *designed* to classical halal principles (Volume 3 teaches them) and labelled as such, but a formal Shariah board sign-off is a milestone ahead, and the app says so.
- The simulations are **calibrated models, not history** — no real-ledger dataset of committees exists anywhere on earth; the pilot's purpose is to replace the model with Halqa's own ledger data.
- The word "**guaranteed**" appears nowhere in the product. If you ever catch it, that's a bug.
