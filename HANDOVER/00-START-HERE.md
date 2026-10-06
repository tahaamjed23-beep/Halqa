# HALQA — COLD START HANDOVER

> **READ `MASTER-CONTEXT.md` IN THIS FOLDER FIRST (29 September 2026).** It is the current state, the latest
> updates, the decision log and the list of what must not be reverted. The files 00 to 12 below were written on
> 9 to 11 August 2026 and are now HISTORICAL: since 28 September Halqa works through a partner bank (Mashreq Bank
> Pakistan), which reverses "no bank partner, ever", "never hold member money" as the operating design, and
> "members pay Rs 0". Use 00 to 12 only for August-era detail.

**Written 9 August 2026. Assumes you know nothing.**

You are picking up a live fintech project mid-flight. This folder is everything —
what the product is, who the owner is, what has been built, what has been ruled
out, what happened on the previous machine, and what to do next. Read `00` then
`01` then `10`. The rest is reference you can search.

---

## The 60-second version

**Halqa** digitises the Pakistani **committee** (also called *kameti*, *BC*, or
globally a **ROSCA** — Rotating Savings and Credit Association). A committee is
*n* people who each pay a fixed amount *c* every period; each period one member
takes the whole pot *n×c*; after *n* periods everyone has paid the same and
collected exactly once.

**The one structural fact that defines the entire company:** Halqa **never holds
member money**. Contributions settle payer-to-recipient over Pakistan's own
payment rails (Raast, JazzCash, Easypaisa). Halqa keeps the double-entry ledger
and nothing else. This is simultaneously the fraud control, the legal strategy,
and the competitive moat.

**Members pay Rs 0, permanently.** Revenue comes from late fees, a 10% share of
turn-marketplace premiums, a circle-fill fee, and — at scale — merchant
commission when a goal circle's pot buys something.

**Status:** live in production since 20 July 2026, deliberately not opened to the
public. One real user. Both packages type-clean, 60 unit tests and 352
integration checks passing. Blocked on a payment-aggregator merchant agreement
(commercial, not technical) before real money can move.

**The owner** is a 17-year-old A-level student in Pakistan. He is mentored by
**Akif Saeed, the sitting Chairman of the SECP** (Pakistan's securities
regulator). That relationship is the single biggest asset the project has.

---

## Folder map

| File | What is in it |
|---|---|
| `00-START-HERE.md` | This file. Orientation and the rules that govern how you work. |
| `01-THE-CHAIRMAN-AND-CONTEXT.md` | Who the owner is, his circumstances, his network, how he wants to be spoken to, his vision. **Read this before writing anything for him.** |
| `02-WHAT-HALQA-IS.md` | The instrument, the architecture, the economics, the three roles, the stage model. |
| `03-FEATURE-REGISTER.md` | Every feature: shipped, built-but-hidden, specified, and refused. The longest file. |
| `04-DECISIONS-AND-VETOES.md` | Chronological record of every ruling — what was approved, what was killed, and why. |
| `05-TECHNICAL-RUNBOOK.md` | Stack, repo layout, exact commands, environment traps, deployment, database. |
| `06-COMPETITORS-AND-ATTEMPTS.md` | 25 committee products worldwide, their architecture, why each lived or died. |
| `07-RESEARCH-AND-EVIDENCE.md` | Every citable statistic and academic finding, with attribution. |
| `08-REGULATORY-AND-LEGAL.md` | Licences avoided and why, the three red lines, SECP/SBP posture, the nano-lending precedent. |
| `09-BRAND-AND-DOC-STYLE.md` | Palette, logo, voice, and the document rules that took many rejections to learn. |
| `10-CURRENT-STATE-AND-NEXT-ACTIONS.md` | Exactly where things stand and what to do next. **Read this second.** |
| `11-DOCUMENT-INDEX.md` | Every report produced, what each contains, which are current and which superseded. |

---

## Rules that govern how you work on this project

These were learned through correction. Violating them wastes the owner's time
and he will tell you so bluntly.

1. **End every message with "Yes boss."** It is a truth-marker he instituted
   after agents overstated progress. Not optional.

2. **Never overstate. Never claim something works that you have not run.** If a
   test failed, say so with the output. If you skipped something, say that. When
   documentation and code disagree, read the code and say the docs are wrong.

3. **No AI-tells in documents.** Specifically banned, each after an explicit
   rejection: rounded pill/badge elements, accent lines under headings, italic
   "kicker" teaser lines, "as we discussed previously" callout boxes,
   self-referential meta commentary, and correction boxes. State the correct fact
   and move on. Benchmark is a JP Morgan pitchbook.

4. **Do not use the Agent tool, workflows, or deep-research unless he asks.** He
   has explicitly rejected workflow orchestration. Do the work directly.

5. **Never remove a feature for being non-Shariah.** Keep it working, just do not
   label it Shariah-compliant. See `04`.

6. **Never blind `prisma db push` against production.** Write an additive-only
   hand-written SQL file and apply it with psql. See `05`.

7. **He cannot be assumed to know finance.** He is 17 and studies maths,
   chemistry and physics. Explanatory documents must teach — define every term at
   first use, show worked rupee arithmetic he can check by hand, use physics and
   maths analogies, and add self-test questions.

8. **Stage-tag claims.** Every capability is one of: `FUNCTIONAL` (works today,
   record-only, no licence), `BUILD` (specified, buildable now), `GATE-2` (needs
   the payment merchant agreement), `STAGE-2` (needs the CDC-trustee/AMC
   structure). Never blur these.

9. **Do not touch production without being asked.** Two migrations and four
   commits are pending and he applies them himself.

---

## The three sentences that carry the whole pitch

> Every serious competitor in this market makes money by **holding** money.
> Halqa makes money by **recording** it.
> That is not a feature difference — it is a different business, with a different
> regulator, a different cost structure, and a different failure mode.

Yes boss
