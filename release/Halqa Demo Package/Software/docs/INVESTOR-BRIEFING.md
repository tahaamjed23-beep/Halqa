# Halqa — Plain-English Briefing

_For someone seeing Halqa for the first time. No finance or software background assumed. Last updated 2026-07-07._

---

## 1. The one-paragraph version

Across Pakistan, tens of millions of people save money in **committees** (also called _ROSCAs_, _beesi_, or _BC_). A group agrees to put in a fixed amount every month; each month one member takes the whole pot; this repeats until everyone has had one turn. It is how ordinary people save for a wedding, a motorbike, school fees, or a business. It runs on trust — and when someone stops paying after taking their turn, the group loses money and friendships break. **Halqa is a digital home for these committees**: it organises the group, tracks who has paid, protects against the person who runs off, gives every member a portable "reliability score" they build by paying on time, and can optionally grow the idle money in safe government-backed savings while it waits to be paid out.

Think of it as: **the committee your family already runs on WhatsApp, but with the bookkeeping, fairness, and safety handled for them.**

---

## 2. Why this is a real market, not a niche app

- Roughly **4 in 10 Pakistani adults** have taken part in a committee at some point.
- An estimated **~US$5 billion rotates through committees every year** in Pakistan.
- Most of it is run on paper, WhatsApp groups, and memory — **no records, no protection, no credit history built from it.**
- The best-known player, **Oraan**, proved people will move this online (they raised US$3M seed funding and registered with Pakistan's securities regulator). They focus on women savers and take custody of the money.

The opportunity: the behaviour already exists at massive scale. The winner is whoever makes it **safe, fair, and rewarding** without changing what people already do.

---

## 3. How a committee works on Halqa (walk-through with real numbers)

**Example — a simple "classic" committee:**
- 6 friends, **Rs 25,000 each per month**.
- Every month the pot = 6 × 25,000 = **Rs 150,000**, and one member receives it.
- The order of turns is decided up front (Halqa can weight earlier turns toward more reliable members).
- After 6 months, everyone has paid Rs 150,000 total and received Rs 150,000 once. No interest, no fees on a plain committee — it is pure disciplined saving.

**What Halqa adds on top of that plain committee:**

| Feature | What it does in plain terms |
|---|---|
| **Reliability score** (300–850, everyone starts at 700) | Goes **up** when you pay on time, **down** when you pay late or default. Like a credit score, but earned inside real committees. |
| **Security deposits** | People with an early turn (who owe the group for many months after) put down a recorded deposit, sized to their risk. Protects the group. |
| **Payout hold-back** | A small slice of a payout is held until the recipient makes their next couple of payments — so nobody grabs the pot and vanishes. |
| **Recovery cases** | If someone defaults after taking their turn, the system opens a formal "you owe this" case and restricts their account until they clear it. |
| **Smart reminders** | Automatic nudges before a payment is due, warning what they'll lose (score, deposits) if they miss it. |
| **Credit Passport** | A shareable, signed summary of your on-time history that a landlord, employer, or lender can verify — **without needing a Halqa account.** This turns invisible informal saving into a real financial reputation. |

---

## 4. The optional "growth" layer

A committee's pot often sits idle for weeks between collection and payout. Halqa can put a **portion** of that idle money into **safe, dated, real Pakistani instruments** — government treasury bills, sukuk (Islamic bonds), national savings certificates, and regulated funds — and return the profit to members.

- Every scheme shows a **risk score (1–10)**, an **indicative rate**, and a **"rate verified on [date]" stamp** so nothing looks more certain than it is.
- Conservative committees are only allowed low-risk schemes; only dedicated "investment circles" can use higher-risk ones.
- Profit is shared by **how much each person contributed and for how long** (fair, not first-come).
- **Halqa's fee is 5% of the profit earned** — and only profit, never the members' own savings. This is the core money-maker.

**Example:** a committee routes Rs 500,000 into a 91-day government T-bill at ~11.5%. Over the quarter that earns roughly Rs 14,000 profit. Halqa keeps ~Rs 700 (5%); the members split the rest by their capital-days.

---

## 5. The Shariah / trust angle

Everything is framed around **profit-sharing on real, disclosed assets** rather than interest, with Islamic (Shariah-compliant) options available at every risk level. Committees are a centuries-old halal saving tradition; Halqa keeps that spirit and adds transparency.

---

## 6. What was built in this work block

### 6a. Bank-partner rail (the big one)

Halqa was designed so that certain powerful features stay **switched off until a licensed bank partner is connected** — because they involve real money handling. This block built that partner connection as a **working sandbox** modelled on **Soneri Bank**, shaped exactly like the real integration so that flipping to a live bank later changes the plumbing, not the product.

It unlocks three things:

1. **Bank-verified identity.** A member enters their CNIC (national ID) and bank account number; the bank confirms they're real and own the account, upgrading them to "Level 2." Previously nothing in the app could grant Level 2 — this closed a real gap. _(In the sandbox this is instant and checks the account-number format with the same checksum a real bank uses; a live bank answers over its API.)_

2. **Statement matching.** Instead of every member manually claiming "I paid," the committee host imports the bank statement and Halqa **automatically matches each transfer** to the right member — but only when the amount is exactly right and the transfer names exactly one unpaid member. No guessing.

3. **Guaranteed payouts (the headline feature).** A committee can promise that **the person whose turn it is always gets paid on time, even if another member misses that month.** This is what Oraan is known for — but Halqa does it more honestly and more fairly:
   - The guarantee is paid from the committee's **own guarantee pool**, and only reaches **as far as that pool actually holds** (no empty promises).
   - The pool is funded by a small, **openly disclosed "slot fee"** on early payout positions — the turns that carry the most risk to the group. The **last turn pays nothing.** So the people who create the risk fund the protection, rather than the platform skimming or one member subsidising another.
   - If someone is covered by the pool, they **still owe the pool back** — a default is never a free pass.

**Example:** A 3-person bank-custody committee, Rs 25,000/month, 1% slot fee on the earliest turn. Member B misses their payment the month it's Member A's turn. The guarantee pool covers B's Rs 25,000 so **A still gets the full payout on time.** B now has an open recovery obligation to the pool. Everyone saw the slot-fee schedule before joining.

### 6b. Today's fixes (from your review of the live app)

1. **Risk meter was stuck.** The little "NURA" risk badge on the Create-a-Committee screen always showed **1 / LOW** no matter what you configured. Cause: it ignored the main risk slider you actually drag and was being pulled down by an unrelated setting. **Fixed** — it now moves with the three things that truly drive risk: the investment scheme, how much of the pot is invested, and your chosen risk ceiling. Verified live: dragging the ceiling to 6 and investment to 60% moved it from 1 to 3 in real time.

2. **Investment schemes were buried.** You had to scroll far down to find the scheme picker, which confused the risk meter into looking "broken." **Fixed** — a new summary strip at the top shows the selected scheme, allocation, and risk ceiling at a glance, explains that the risk number moves with them, and points you down to change them.

3. **"Eligible to host" card disabled.** The dashboard card showing your reliability score and "Eligible to host" (and the matching row on the profile) is now **switched off** behind a single flag. Flip `SHOW_HOST_ELIGIBILITY` back to `true` in `halqa-web/src/config.ts` to restore both exactly as they were, whenever you want.

---

## 7. Where the money comes from (business model)

- **Today:** 5% of investment profit (only when a committee chooses to grow its idle pot, and only on the profit).
- **Natural next lines** (already architected for, switched off until a partner is live): transaction/rail fees on bank-handled committees, premium guarantee tiers, and lending against the Credit Passport reputation Halqa uniquely owns.
- **The long-term asset:** Halqa builds a **verified, portable credit history** for millions of people the formal banking system can't currently see. That data and trust layer is the durable moat.

---

## 8. Honest status and limits (important)

- Halqa is at **"Stage 1 — record-only."** It **tracks and organises** money and simulates the bank/investment legs; it does **not yet custody or move real funds** on its own. The app says so plainly on the dashboard.
- The bank partner (Soneri) is currently a **realistic sandbox**, not a signed commercial integration.
- Investment rates are **indicative and dated**, never promised.
- Going live with real money requires the licensed partner and the usual regulatory steps — which is exactly why those features are built but gated.

This conservatism is deliberate: the product never tells a user their money is "secured" when it is only "recorded," and it never shows a guarantee bigger than the pool behind it.

---

## 9. Why Halqa can win

1. **Same behaviour, zero learning curve** — it digitises what 40% of the country already does.
2. **Fairer than the incumbent** — protection is funded by those who create the risk, capped at what actually exists, and never redistributed between members silently.
3. **A reputation asset nobody else has** — the Credit Passport turns informal saving into bankable credit history.
4. **Built to scale into a bank rail** — the hard architecture (custody modes, guarantees, statement matching, KYC) is already in place and tested, waiting on a partner signature rather than a rebuild.
