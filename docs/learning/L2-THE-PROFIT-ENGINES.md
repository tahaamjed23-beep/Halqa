# Learning Volume 2 — THE PROFIT ENGINES, FROM ZERO
### Where every rupee of bonus actually comes from. Full arithmetic — check everything with a calculator. Requires Volume 1.

---

## Part 0 — The one idea behind all of it

There are exactly **two** ways a committee member can end up with more money than she put in:

1. **Create value:** put idle money to work in something that genuinely earns (a money-market fund, a profit-sharing bank deposit). New wealth enters the group from outside.
2. **Move value:** one member pays another for something she values (getting the pot early). No new wealth — it just changes hands, transparently.

Every Halqa engine is one of these two, and the app always tells you which. The halal engines are all type 1 (plus fair redistribution of type-1 profit). The one conventional lever (the early-turn fee) is type 2, labelled accordingly. Keep this sorting in your head and no engine will ever confuse you.

A **conservation law** guards the whole system (enforced by an automated test): across a full cycle,

> sum of all member bonuses = total type-1 profit actually created.

Type-2 transfers net to zero across the group by definition. The ledger cannot invent a rupee.

---

## Part 1 — The float sweep (the foundation engine)

### The idea
"Float" = money that has been paid in but not yet paid out. In a monthly committee, contributions arrive across the month; the payout happens at month-end. Every rupee of every contribution therefore sits idle for some days. Multiply small amounts by many members by many days and it stops being small.

### The rate, and how "annual %" works
Rates are quoted **per year**. An "annual 10.8%" doesn't mean you get 10.8% in a month — you get the fraction of the year your money actually sat:

> profit = amount × rate × (days ÷ 365)

Halqa's float engine parks (in Stage 2; computes, in Stage 1) the float in an **Islamic money-market fund** — the safest, most liquid class of fund, currently ~10.8%/yr — and credits profit for the *exact days each payment sat*. (It also clamps the day-count so nobody can backdate a payment to fake extra days. Every anti-cheat like this exists because someone would eventually try.)

### Worked example
Bilal pays his Rs 11,667 on day 1 of a 30-day round. Payout happens day 30, so his money sits 29 days:

> 11,667 × 0.108 × 29/365 = **Rs 100.1**

One member, one round: about Rs 100. Now scale it: if all 12 pay early-ish, the round generates roughly 11 × 100 ≈ Rs 1,100 (the recipient's own contribution nets off), and the circle runs 12 rounds ≈ **Rs 12–13k of real profit a year** — from money that was previously just... waiting. Halqa takes 5% of the profit (its entire business model, Volume 4); the rest belongs to members.

Notice the behavioural loop: the earlier people pay, the more days the money sits, the bigger the pool. Which sets up:

---

## Part 2 — Deposits that earn (Mudarabah)

Volume 1 showed deposits sized to ~90% of remaining dues — big money. Position 1 in our reference circle posts ≈ Rs 115,500 and it sits there the **entire year**. Dead collateral would be a tax; Halqa makes it productive.

The deposits are placed (computed, today) in **Islamic Mudarabah bank deposits** (~11.2%/yr). Mudarabah is a profit-*sharing* contract, not interest — Volume 3 explains why that distinction is everything; for the math here it behaves like a rate.

### Worked example — position 1's deposit
> 115,500 × 0.112 × 365/365 = **Rs 12,936** earned by her deposit over the year.

The person with the most locked up earns the most on it — the protection literally pays its own participants. In Sukoon tier, each depositor keeps her own deposit yield. In Bazaar/Sigma, deposit yield flows into the shared pool (Part 3) to be split by the patience rules.

Now you can see why raising the deposit curve from 70% to 90% coverage did **two** things at once: recovery on default jumped (more collateral) *and* the group's profit pool grew (bigger earning base). Safety and yield turned out to be the same lever pushed harder. That is why the best-member bonus rose from ~15.6k to ~17k when the protection was strengthened — a result you can now derive yourself.

---

## Part 3 — The patience tilt (Bazaar's fairness correction)

### The unfairness it fixes
Recall from Volume 1: turn 1 is an interest-free loan, turn 12 is a forced savings account. In inflationary Pakistan, turn 1 also collects full-value rupees and repays in shrunken ones. The **late positions carry the committee** — their money is what funds everyone else's early pots — and for a century they were paid nothing for it.

### The mechanism
At cycle end, the pooled profit (float + deposit yield) is split by **capital-days × position weight**:

- **Capital-days** = amount × days it sat. The same quantity a physicist would call an "integral of money over time." Someone whose money stayed in the system longer accumulates more capital-days. Late positions naturally accumulate the most (they paid all year and collected last).
- **Position weight** = a disclosed multiplier from **1.0× (turn 1) to 2.0× (turn 12)**, linear in between. Turn 6 gets ≈ 1.45×, and so on.

### Toy example you can fully verify (3 members)
Amina (turn 1), Bushra (turn 2), Chandni (turn 3). Suppose their raw capital-days come out proportional to 1 : 2 : 3 (last position's money sat the longest). Weights: 1.0, 1.5, 2.0. Pool to split: Rs 6,600.

Weighted shares: A = 1×1.0 = 1.0 · B = 2×1.5 = 3.0 · C = 3×2.0 = 6.0. Total = 10.

> A gets 6,600 × 1/10 = Rs 660 · B gets 6,600 × 3/10 = Rs 1,980 · C gets 6,600 × 6/10 = Rs 3,960.

Patience got paid. Nobody lost principal; the *profit* was tilted toward whoever waited. This is Bazaar tier. It is halal type-1 redistribution: only real profit is being split, by disclosed rules everyone consented to.

---

## Part 4 — The behaviour bonuses (small engines, big psychology)

- **Early-bird boost:** pay ≥75% of your installments 3+ days early → your profit weight is multiplied by **1.25×** in the split. Why it's self-funding: early payments create extra float days (Part 1), i.e., the early birds *generate* the very profit they get a larger slice of.
- **Staking streak:** every consecutive round the whole circle completes with nobody late, the circle's float bonus rises +5% (cap +20%). One late payment resets it. The design makes discipline a *team sport* — eleven people have a financial reason to remind the twelfth.
- **Prize draw (opt-in):** each round, half the round's realised float profit is gifted (hiba) to one randomly chosen on-time payer. Two properties matter: (a) **principal is never staked** — only already-earned profit is gifted, so no one can lose anything, which is what separates it from gambling; (b) the "random" draw is a **deterministic hash** — a published mathematical function of the round's data. Anyone can recompute it and verify the winner. Provably fair, literally. (Marked 🟡: halal-intent, awaiting formal scholar sign-off.)

---

## Part 5 — The early-turn fee (the one conventional engine — 🟠)

### What it is
Some groups *want* to price early access — this is exactly how India's chit funds work, via auction. Halqa's version, in Priority and Sigma tiers, is deliberately tamer:

- The fee is a percentage of the pot, **capped at 10%**, charged to early positions and **declining linearly to 0%** for the last position.
- It is deducted **from the early member's own payout** — she never pays out of pocket; she just receives a bit less pot in exchange for receiving it early.
- 100% of it is **redistributed to the waiting members**. Halqa keeps none.

### Worked example (our 12-member circle, pot Rs 140,004)
Turn 1's fee: 10% = **Rs 14,000** (she receives 126,004). Turn 7's fee ≈ 10% × (12−7)/11 ≈ 4.5% ≈ Rs 6,360. Turn 12's fee: **Rs 0**.

In **Priority**, each round's fee is split immediately among the other 11 members as a monthly dividend. In **Sigma pooled** mode, the fees flow into the completion pool and get split by the patience rules — which concentrates them toward the late positions, and is precisely why Sigma-pooled produces the biggest single bonus.

### Why it's labelled 🟠
Charging for *time* on money is the definition of riba territory in Islamic finance (Volume 3). It might be structurable, it might not — no scholar has ruled on Halqa's version, so the app refuses to call it halal. It is capped, opt-in, disclosed at consent, and quarantined to two tiers. Honesty is the product.

---

## Part 6 — Putting it together: where Rs 16,982 comes from

The reference case: 12 members, Rs 140,004 pot, Sigma tier, pooled mode, fee at the 10% cap, everyone paying promptly. For the **best-positioned member** (turn 12 — maximum patience weight, zero fee paid, full early-bird boost), her annual bonus stacks like this:

1. Her **share of the real profit** — float (~10.8% on everyone's idle days) + deposit yield (~11.2% on ~Rs 620k of total posted deposits, all year) — tilted toward her by 2.0× patience weight and 1.25× early-bird.
2. Her **share of the pooled fees** — eleven other members' fees (totalling ~Rs 77k across the year, each declining by position) flow through the same tilted split; she pays no fee herself.
3. Result, computed by the engine's own integer arithmetic: **Rs 16,982**.

The whole group's bonuses sum to ≈ **Rs 68,800** — and here's your conservation check: fees moved money *within* the group (they cancel out group-wide), so the group total ≈ the real profit created by float + deposits. The ladder of configurations, each locked by an automated test:

| Configuration | Best member's annual bonus |
|---|---|
| Classic (no engines) | Rs 0 |
| Priority (fee dividends only) | ~Rs 7,600 |
| Bazaar (real yield + patience, no fee) | ~Rs 7,650 |
| Sigma, monthly dividends | **Rs 15,285** |
| Sigma, pooled | **Rs 16,982** |

Note what the Bazaar row tells you: **~Rs 7,650 of the story is pure created value** — no fee, fully halal. The fee roughly doubles the headline for groups that choose it, but the halal path alone is already a month's contribution back per year.

### Stress test (what if the world turns against us?)
The same arithmetic swept across bad scenarios (an automated backtest): drop all rates by 30% AND make everyone pay lazily at the deadline (killing most float days) → the best bonus still comes out at **Rs 13,821**. Why doesn't it collapse? Decompose it: ~Rs 9,334 of the Sigma-pooled bonus is fee redistribution — member-to-member movement that **doesn't care what interest rates do**. Only the real-yield component breathes with the economy. Engines built on two independent sources fail more gracefully than engines built on one — a diversification argument you'll meet again in Volume 3.

---

## Part 7 — The vault tiers (same math, personal scale)

Your vault balance earns at the tier you chose: Standard ~10.8%, Income ~12.1%, Gold ~15% (indicative — gold is volatile short-term), Crypto "~30%" (speculative, double-gated, and the quote marks are load-bearing). Worked example: park Rs 100,000 in Income tier for 6 months:

> 100,000 × 0.121 × 182/365 ≈ Rs 6,033 profit → Halqa keeps 5% (Rs 302) → **you sweep Rs 105,731.**

That 5%-of-profit-only is the entire revenue model, and it's the subject of Volume 4.

---

## Self-test (if you can answer these, you own this material)
1. Why does raising deposit coverage from 70% to 90% increase the group's profit pool? *(Part 2)*
2. A member pays Rs 20,000 on day 3 of a 30-day round at 10.8%/yr. How much float profit does that payment generate? *(≈ 20,000 × 0.108 × 27/365 ≈ Rs 160)*
3. In the 3-member toy split, what happens to Chandni's share if she was late twice and loses her early-bird boost — which number in the formula changes? *(Her weight multiplier; her weighted capital-days shrink relative to the others.)*
4. Why is the group's total bonus unaffected by the fee, while individuals' bonuses change a lot? *(Fees are type-2: they move value within the group and cancel in the sum.)*
5. Which single engine would survive a 0%-interest-rate world completely untouched? *(The fee — it's not interest-rate linked. This is also exactly why it needs the 🟠 label.)*
