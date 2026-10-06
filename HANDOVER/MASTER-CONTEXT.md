# HALQA MASTER CONTEXT

Version-controlled knowledge base for the Halqa project and its owner.

| Field | Value |
|---|---|
| Compiled | 29 September 2026 (Pakistan time, afternoon) |
| Last updated | 5 October 2026, night (session 8c8e8bbf): first build session against the register; 909 of 10,490 items done (Sections 2, 4.4) |
| Compiled by | Claude (Opus 5.5), Claude Code desktop, session d2da94bb |
| File | `D:\HALQA SIGMA APP\HANDOVER\MASTER-CONTEXT.md` (the copy in `HALQA CORPORATE\07 Internal` is a mirror) |
| Supersedes for CURRENT facts | `HANDOVER\00` to `12` (written 9 to 11 August 2026, section 11 of `08` updated 22 September). Those files stay as history. |
| Classification | Internal. Contains private names (mentor, advisers, officers). Never paste this file, or names from it, into a deck or document for a bank, investor or regulator. |

## How to use this file

1. Read Section 1 (Current State) and Section 2 (Latest Updates) first. They are the active truth.
2. Before acting on anything older, check Section 9 (Superseded), Section 10 (Rejected) and Section 17 (Do Not Revert).
3. Where two records disagree, Section 18 lists the conflict, the newest reliable version and the confidence.
4. Every entry carries a date. Dates are 2026 unless stated. "Chairman" means Taha, the owner.
5. Status words used throughout: CURRENT, RECENTLY CHANGED, HISTORICAL, SUPERSEDED, REJECTED, UNCERTAIN, UNVERIFIED.
6. Evidence labels used throughout: CONFIRMED (checked in a primary source or in code), USER (the chairman said it), SOURCE (a named external source), INFERENCE (Claude's reading), ASSUMPTION (a modelling input), OPINION.

## Sources this file was built from

| Source | Coverage | Notes |
|---|---|---|
| Claude memory directory `C:\Users\admin\.claude\projects\D--HALQA-SIGMA-APP\memory\` | 7 July to 29 September | 69 files read in full on 29 September. `MEMORY.md` is the auto-loaded index. |
| `D:\HALQA SIGMA APP\HANDOVER\00` to `12` and `DEFECTS-2026-08-20.md` | 9 August cold-start pack; `08` section 11 added 22 September | Read `00`, `01`, `04`, `10`, `DEFECTS` in full; section headings and key sections of the rest. |
| Session transcripts | 28 July to 29 September | User messages extracted from sessions 09370bfd (28 Jul to 9 Aug), 74d1eb25 (11 to 17 Aug), c075d390 (9 to 11 Aug), 38acb936 (15 Sep scheduled task), 0109ba15 (non-Halqa school work), d2da94bb (17 Aug to 29 Sep, this session). |
| Missing | 7 to 27 July sessions (9db44df9, a7df764c) | Transcripts are not on this machine. Their content survives only through memory files. The migration bundle `D:\ClaudeCode_Full_Migration_2026-07-26_024908` holds the old session history. |
| Files on disk | `Desktop\ALL HALQA\HALQA CORPORATE\`, `D:\HALQA SIGMA APP\docs\`, generators | Inventory taken 29 September. |
| Web research of 29 September | Raqami Islamic Digital Bank | Official site, VIS rating report, half year accounts to 30 June 2026, press. |

---

# 1. CURRENT STATE (as of 29 September 2026)

## 1.1 The project in one paragraph

Halqa digitises the Pakistani committee (kameti, BC, ROSCA): members pay a fixed instalment each period and one member takes the whole pot each period until everyone has collected once. Since 28 September 2026 the governing design is the PARTNER BANK ROUTE: a licensed Pakistani bank holds and moves every rupee under its own licence and State Bank of Pakistan (SBP) regulation, and Halqa runs the committee as the bank's service provider (rules, order of turns, verification engines, reminders, records, late payment, exits). The chairman's line, adopted as the company's line: "Halqa is the system. The bank is the machine." The target bank is Mashreq Bank Pakistan; a meeting is expected near 10 October 2026, being arranged by the mentor. Raqami Islamic Digital Bank was researched on 29 September as a possible second bank (plan only). Halqa takes no licence of its own.

## 1.2 Status by dimension

| Dimension | Current state | Since | Status |
|---|---|---|---|
| Direction | Partner bank route; Halqa = system, bank = machine | 28 Sep | CURRENT |
| Partner bank | Mashreq Bank Pakistan (digital retail bank, DRB). Nothing signed. | 28 Sep (D1) | CURRENT, not contracted |
| Second bank | Raqami Islamic Digital Bank, pursued IN PARALLEL with Mashreq (chairman: "i will try to work with either, i dont care"). Deck built 29 Sep evening: "Halqa Presentation for Raqami 29 September 2026". No introduction or meeting yet. | 29 Sep | CURRENT |
| Bank meeting | Expected near 10 October 2026, arranged by the mentor | 28 Sep | UNCERTAIN date |
| Company | NOT incorporated (chairman confirmed 29 Sep evening: "no nothing"). Plan: private limited company, 2 directors, the chairman's father as director (a minor cannot be one), registered office Islamabad. TASDEEQ not contacted either. | 29 Sep | CURRENT (USER) |
| Licence | None. None sought. Regulation arrives through the bank's licence; Halqa assessed as the bank's service provider under the SBP outsourcing framework; the product goes to SBP through the bank for approval or notice | 28 Sep | CURRENT |
| Sandbox | Not pursued (chairman, 22 Sep: "we dont want any sandbox") | 22 Sep | CURRENT |
| Money moved | None, ever. Payment rail not connected; every payment is a sandbox record | always | CONFIRMED (code, 22 Sep) |
| App | Live since 20 July at halqa-seven.vercel.app (web) and halqa-api-delta.vercel.app (API). Not open to the public. Prototype work paused on 24 Sep (document pack) and again 28 Sep (bank route). Many uncommitted local changes. | 24 Sep | CURRENT (paused) |
| Theme | Lime green ramp (l500 #6DC72A fills, l700 #41801A text, ink #0C1408). Pine, gold and dark green retired everywhere. | 23 and 28 Sep | CURRENT |
| Current presentation | "Halqa Presentation for Mashreq 30 September 2026" (version 7) and "Halqa Presentation for Raqami 30 September 2026" (version 5) in `01 Presentation`: the version 5 boxes and wording with the chairman's own edits (his copy `Downloads\Halqa Presentation for Mashreq final.pptx`) applied to both banks, logos in place of party names, all text black, charts drawn as shapes, the redrawn instalment split with the new fee; 20 main slides (Summary slide 20, after Current Status) plus Appendix A1 to A6; built by `docs\generators\bank_pitch_2026-09-30\make_v7.py`. Earlier versions (Mashreq 2 to 6, Raqami 1 to 4) in `01 Presentation\Superseded` | 30 Sep (evening) | CURRENT |
| Reference deck | "Halqa Complete Position 29 September 2026" (81 slides) | 29 Sep | CURRENT as backup; out of date on pilot length (says six months) and uses icons |
| Google Slides | No deck uploaded. Blocked: the Drive connector cannot take a .pptx that size; Control Chrome is Mac only; Claude in Chrome not connected | 28 Sep | OPEN |
| Documents | Corporate set of 25 Sep (pre-bank design); bank Google Docs of 28 Sep | 25 and 28 Sep | See Section 13 |
| Work register | "Work Register to Operational at 100,000 Users" (HQ-IN-02) of 5 October in `07 Internal`: 10,490 items (909 done, 53 partly done, 9,528 open), every item with an owner, a priority P0 to P3, a phase or milestone and a status; Claude's 9,157 open items in 103 phases of at most 100 items and 100 effort points, one Claude Pro usage window each; items held by people in milestones H1 to H6. Generator `docs\generators\register_rev7\make_register.py`. The register of 28 September (1,039 items) is in `07 Internal\Superseded` | 5 Oct | CURRENT |

## 1.3 The sixteen bank decisions (D1 to D16), chosen by the chairman on 28 September 2026

These answer HQ-BK-01 "Bank Partnership Revisions". Status of all: CURRENT, chosen 28 Sep, can still change after the bank meeting.

| No. | Decision (chairman's intent) | Recommendation he was given (not always taken) |
|---|---|---|
| D1 | Mashreq Bank Pakistan | same |
| D2 | Option B: every member holds an account at the partner bank from the start ("will bring deposits to bank which they need") | collection account open to all banks at launch, members moved later |
| D3 | KEEP the collection design: tier 1 approval (card, wallet, Raast), tier 2 automatic debit, tier 3 manual; keep the PSP and PSO (Safepay etc.); ADD a bank direct debit mandate | standing instruction for account holders, RTP or 1BILL for others |
| D4 | Profit on committee balances paid as a REWARD AT THE END of the circle, nominal, converted to points at 1 rupee = 1 point, redeemable in Halqa's marketplace for e-commerce goods | members earn profit plus a balance-linked fee to Halqa |
| D5 | The BANK takes the member fee and gives Halqa a share of its income; use that income to cut the member fee as far as possible (cover is also a cost to members) | Halqa flat fee collected by the bank |
| D6 | Scrap any Halqa involvement in early seats (no Halqa credit) | none at launch |
| D7 | Credit bands and early-seat bands MANDATORY, no exception. Give the bank three cover options: bank guarantee from its balance sheet, insurance (some banks have their own), or takaful. UPDATED 29 Sep night: ONLY takaful or insurance; no Halqa cover, no bank guarantee | bank's takaful if it distributes, else Halqa agency |
| D8 | Keep Hyper exactly as it is; label it EXPERIMENTAL | defer Hyper |
| D9 | Proper member-to-member buying and selling of turns "like before"; points buyable with money (the point system is "already EMI dependent", meaning under the bank); collaboration with e-commerce markets and existing bank point systems | points kept, seat market paused |
| D10 | Bank KYC, but Halqa's computational methods (verification engines, models) stay | same |
| D11 | Credit reporting from launch day 1, NON-NEGOTIABLE. Offer TASDEEQ or the bank reporting directly; the bank decides | bank reports |
| D12 | Bank savings accounts, very short term: about a 7 day gap between salary and the due date (the 8th) | bank savings account replaces vault and float |
| D13 | Yes, bank asset financing ("brings business to bank") | bank-financed asset committees first |
| D14 | Yes, UAE members through Mashreq's non resident (NRP) accounts ("brilliant") | same |
| D15 | "Halqa still exists, we are the main guy, we are the system, the bank is the machine." | Halqa = technology service provider under the SBP outsourcing framework |
| D16 | Build the app as well as possible with all new and updated features | clean the live app first |

Legal flags carried as labels, never as blocks (per the keep-all-features rule): points bought with money, transferable and redeemable outside Halqa are stored value or e-money, lawful only as the bank's product under its licence; the Virtual Assets Act closed-loop exclusion no longer applies to such points; turns sold for money or points need a counsel view on P2P lending and a Shariah view; label non-Shariah features as such.

UPDATED 29 Sep evening (USER): "i dont really care shariah or not, no labelling needed". No Shariah or non-Shariah labels in decks or documents from now on. The legal flags above stay as internal counsel questions only. Features are still never removed from Halqa; a deck for a fully Islamic bank simply leaves out what that bank cannot offer. Also decided the same evening: turn price ceiling 100 per cent of the pot; 1 point = Rs 1 everywhere; on-time points never more than 50 per cent of Halqa's own fee on that instalment; Hyper fee Rs 15 a day (Section 1.5).

## 1.4 Product as currently presented to the bank (Mashreq version 4 and Raqami version 2, 30 September)

| Area | Current content |
|---|---|
| Committee types | Six: Known (family, colleagues or neighbours; the former Family, Office and Market merged on 29 Sep), Unknown, Large unknown, Asset, UAE family, Hyper (experimental) |
| Known | 6 to 12 members, Rs 2,000 to 10,000, monthly or weekly, checks level 1, no income check, no mandatory automatic debit, no takaful or insurance, no credit report read; early turns earned |
| Unknown | 12 members, Rs 10,000, monthly, level 2, income checked, automatic debit, takaful or insurance, credit report read |
| Large unknown | 20 members, Rs 25,000, monthly, level 2, all checks |
| Asset | 12 members, Rs 10,000, monthly, level 2, all checks; bank financing (ijarah for motorcycles and machines, or a modaraba if the bank prefers) |
| UAE family | 6 to 12 members, any amount, monthly, level 1, automatic debit only; via Mashreq Pakistan Account for non residents |
| Hyper | 390 to 400 members, Rs 450 to 500 a day, daily, level 3, all checks; labelled experimental |
| Onboarding | Signup (phone, passcode, PIN) then bank account (CNIC, NADRA biometric, due diligence by the bank) then Halqa engines: identity (names match 0.90 or more passes, 0.80 to 0.90 to a person; live face; home; job), income (salary from one employer on about the same day each month; for Hyper Rs 1,000 or more on 5 days a week for 8 weeks; own transfers and loans excluded; learns the payday), affordability (all instalments within a third of verified income, 40 per cent with other loans, from the fourth circle total still owed within a year of income), score 300 to 850 decides which turns open. Stored: results only. |
| Seat bands | Turns 1 to 6 need score 650 or more; turns 7 to 9 need 550; turns 10 to 12 open to anyone; every new member starts in the last three until two clean circles |
| Prevention | Before joining: engines, host admits each member, at most six circles and one daily circle. At joining: full cost shown, 24 hours to withdraw, ten clause undertaking, mutual guarantee, direct debit mandate, takaful or insurance on circles between strangers. Each instalment: reminder the evening before, debit on the learned payday, retries each morning, five at most. A missed payment: taken from the member's own pot before collecting; late fees 2, 5 and 10 per cent with score falls 10, 20, 40; daily circles 5, 10, 15 per cent at 12, 36, 60 hours; penalties to charity on the Islamic window; a daily circle stops opening days when losses would exceed the takaful or insurance limit. |
| Recovery | Only for a member who collected: 1 contact (hardship plan), 2 restrict (score down 200), 3 the takaful or insurance claim pays the members left short in their own names (no cover by Halqa, 29 Sep night), 4 mutual guarantee and acceleration, 5 ordinary civil suit on the undertaking, 6 summary suit only on a guarantee cheque. Never: relatives, contact lists, public lists of names. Worst case Rs 110,000 (turn 1 of 12 at Rs 10,000). Takaful or insurance priced at about 5.5 per cent (5.47) for the stress case. |
| Money of one instalment | CURRENT 30 Sep evening: on a circle between strangers the member pays Rs 10,235 plus the takaful or insurance fee = Rs 10,000 to the collector + Rs 85 fee (running cost of one payment, at most Rs 35, plus Rs 50; collected by the bank, agreed share to Halqa) + Rs 150 PSP service fee (1.5 per cent of the instalment) + the takaful or insurance fee, named only, set by the operator, not part of the fee or of Halqa's income. SUPERSEDED: Rs 11,047 = Rs 10,000 + Rs 547 takaful or insurance + up to Rs 500 fee |
| Revenue lines | Now: fee share, balance share. Later: financing referrals (2 to 4 per cent financier, 1 to 3 dealer), marketplace commission. Later: employers. |
| Unit costs (25 Sep model, pre-bank) | Rs 13 to 35 to run one payment; Rs 1.32 million fixed a month SUPERSEDED 30 Sep (it was salaries, office, counsel); fixed cost is now TECHNICAL ONLY: about Rs 61,000 a month (US$208 at Rs 290); contribution about Rs 352 a member a month with the Rs 15 Hyper fee and break-even about 170 members SUPERSEDED 30 Sep evening: with the Rs 85 fee the contribution is about Rs 50 a member a month (fee less running cost, takaful commission not counted) and the technical cost is covered at about 1,220 members |
| Pilot | REMOVED from the decks 30 Sep (USER: "remove requests, polot and timeline"). Was: about 8 weeks of agreement, approvals and connection, then ONE live month with about 1,000 members in known circles, review, scale decision (weeks 1 to 14) |
| Requests to the bank | REMOVED as a slide 30 Sep (USER). Was: 1 approve the partnership; 2 take the product to SBP; 3 approve it for the Islamic window and choose the cover; 4 accounts and mandates inside the Halqa app; 5 hold instalments in the Islamic Current Profit Account with profit returned as points; 6 agree the income share and a one month pilot |

## 1.5 Numbers that are current (with their basis)

| Item | Value | Basis | Date |
|---|---|---|---|
| Hyper option 1 | 400 members, 50 days, 8 collect a day, pot Rs 15,000. Daily payment Rs 450 = Rs 300 contribution + Rs 135 takaful or insurance + Rs 15 fee. Fee Rs 750 a member a cycle, Rs 300,000 a cycle; takaful or insurance Rs 6,750 a member, Rs 2,700,000 a cycle (the Rs 135 was called cover until 29 Sep night) | USER decision (structure 23 Sep; split confirmed 29 Sep evening) | 29 Sep |
| Hyper option 2 | 390 members, 26 active days (Sundays off), 15 collect a day, pot Rs 8,666.67. Daily payment Rs 500 = Rs 333.33 contribution + Rs 151.67 takaful or insurance + Rs 15 fee. Fee Rs 390 a member a cycle, Rs 152,100 a cycle; takaful or insurance Rs 3,943.33 a member | USER decision (structure 23 Sep; split confirmed 29 Sep evening) | 29 Sep |
| Hyper fee history | 23 Sep: fee Rs 150 / Rs 166.67 (no separate cover). 25 Sep: Rs 75 cover + Rs 75 fee (Rs 83.33 + Rs 83.33). 25/26 Sep: request for Rs 15 fee with more cover, paused 28 Sep. 29 Sep evening: Rs 15 CONFIRMED ("the latest one") | USER | 23 to 29 Sep |
| Points | 1 point = Rs 1 everywhere (USER, 29 Sep evening; the 10 points = Rs 1 fee credit value is superseded). On-time points: any amounts the model sets, but never more than 50 per cent of Halqa's own fee on that instalment ("whatever amounts doesnt let go of more than 50 percent of halqa own fee"). Balance-profit reward at the end of the circle: 1 point per rupee of profit (D4). | USER | 29 Sep evening |
| Turn price ceiling | A turn may be sold for at most 100 per cent of the pot | USER | 29 Sep evening |
| Fee range quoted to the mentor | Rs 100 to 500 per instalment; about Rs 500 at Rs 10,000 a month with more than 10 members | USER | 19 Sep |
| Fee ceiling set in July | A member must never pay more than Rs 300 to make a Rs 20,000 instalment | USER | 30 Jul |
| Business model 25 Sep | Running cost Rs 13 to 35 a payment; fixed Rs 1.32m a month; blend Rs 512 a member a month; break even 2,572 ("about 2,600"); 100,000 members Rs 45.6m a month before tax | Model (build_bm2.py) | 25 Sep |
| Cover price | 5.47 per cent of the instalment for circles between strangers, stress case one circle in five losing a fifth of its members from the earliest turns | Model HQ-MF-05 | 24 to 25 Sep |
| Due date | The 8th of the month, CONFIRMED by the chairman 29 Sep evening (the 10th is superseded) | USER | 29 Sep |
| Seat eligibility | Real bureau history and a good score open any seat; a mid score the middle seats; a low score the last seats; a thin record the middle seats; no record the last seats. ONE clean circle (was two) opens the rest. No score counts as good until TASDEEQ publishes its bands | USER | 5 Oct |
| Security in place of credit history | An aligned asset committee, points, or the member's own savings frozen by the bank, combinable, sufficient at 90 per cent of the pot. The frozen money sits in the bank's savings product and earns its profit for the member. Never opens the gate where the score is low on substantial credit factors | USER | 5 Oct |
| Host commission | 10 per cent of the profit the circle made for Halqa, not revenue, paid at the close of each circle, taken as points or cash. About Rs 720 on a 12 member circle at Rs 10,000 a month | USER | 5 Oct |
| Account opening | Under 10 minutes, welcome screen to verified account. MEASURED 5 Oct: twenty one screens stand in the way, which does not fit; section AQ6 holds the budget and the steps moved off the path | USER, and Claude's measurement | 5 Oct |

## 1.6 What is waiting, in order (as of 29 September)

0. DONE 30 Sep (session 8c8e8bbf): Mashreq v4 and Raqami v2 built, 26 slides each, .pptx and .pdf, filed; the first 26 slide pass was rejected the night before and rebuilt to the chairman's rules (Arial, plain headings, bank-themed palette, proper diagrams, own slides for committee types, payment collection, wallets and PSP, default prevention; no pilot, timeline or requests; takaful or insurance only; PSP unnamed). STILL QUEUED: FULL rebuild of the 81 slide reference deck in this style; names removed from the 43 slide deck and the 21 slide Mashreq pitch, both moved to Superseded; Raqami PDFs and Google Doc test copies moved to a superseded archive; fact register for 07 Internal.
1. Chairman: drag the current .pptx files into drive.google.com and open with Google Slides (or connect Claude in Chrome).
2. DONE 5 Oct: Work Register of 10,402 items in 102 phases (Section 4.4). CORRECTION: the register of 28 Sep held 1,039 items, not 665 as this file said. Next: phase 1 (removals; retired terms; endpoints to remove), then the bank presentation in Google Slides.
3. Bank meeting with Mashreq near 10 October.
4. Raqami: deck built (29 Sep evening), being rebuilt as v2. Scope settled: the chairman said "do whatever, i dont really care shariah or not, no labelling needed", so the Raqami deck keeps only what an Islamic bank can offer, with no labels. Research Raqami's standing instruction or API debit capability ("yes research"). Still open: who introduces Halqa to Raqami and when.
5. Update the "Oraan Research" Google Doc with the TASDEEQ and DIB findings (needs the Google Docs connector, else a new copy).
6. Re-plan the paused work (Section 4) around the bank's accounts.
7. App work (D16) after the above.
8. Open risks to remember: demo seed and a printed demo login on the live sign-in page; database password exposed in chat in July and not rotated (chairman said "forget it"); CNIC camera blocked by the Permissions-Policy header; prod schema migrations pending (locality, jobTitle, salary verification, rewards and exits).

---

# 2. LATEST UPDATES (newest first)

| Date | What changed | Previous state | Current state | Impact | Source |
|---|---|---|---|---|---|
| 5 Oct (night) | First build session against the register | 348 items done; the vault, investment schemes, deposits held and Halqa cover were still reachable in the API; one global rate limit of 1,500 requests in 15 minutes stood in front of sign in; failures answered with a bare sentence and no code; no interface specification existed; the app showed "Halqa fee Rs 0" and "No charge to contribute" | 909 items done. In the code: the seat engine rewritten to the ruling of 5 October; 24 withdrawn endpoints removed or unmounted (vault, schemes, deposits, invest, liquidate, investments, default cover, guarantee fund, profit plan, portfolio optimiser, catalogue, change password); per route rate limits (lib/rate-limits.ts) replacing the global ceiling; a shared error list in English and Urdu (lib/errors.ts) that every failure now carries, including the ones written inline; an interface specification generated from the route files (99 endpoints) and filed; the member facing prices corrected to the Rs 85 fee, the 1.5 per cent partner fee on wallet and card only, takaful named without an amount and Hyper at Rs 15 (lib/fees.ts, Fees, Pay, Committee checkout, About, ProtectionCenter); a full user row narrowed so passwordHash and pinHash stop being read to check a guarantor. All 238 API tests pass and both type checks are clean | Register statuses updated; Interface Specification filed in 07 Internal | Session 8c8e8bbf, 5 Oct |
| 5 Oct (evening) | Eligibility, security, host pay and speed ruled on | Two month salary observation was the normal route into a circle between strangers; every new member was held to the last three seats until two clean circles (score-bands.ts); no host commission; no stated limit on account opening time | The two month wait is dropped as the normal route, since members are assumed to be working adults aged 18 or over, and survives only as the exceptional fallback. Seats follow a matrix: real bureau history and a good score open any seat, a mid score the middle seats, a low score the last seats, a thin record the middle seats, and no record the last seats, with one clean circle (not two) opening the rest. No score counts as good until TASDEEQ publishes its bands, so the 700 spawn score must go. A SECURITY ROUTE skips the credit test where the pot is recoverable from an aligned asset committee, points, or the member's own savings frozen by the bank, combinable, with a 10 per cent relaxation; the frozen money sits in the bank's savings product and earns its profit for the member, and the route never opens the gate for a member whose score is low on substantial credit factors. HOST COMMISSION: 10 per cent of the profit the circle made for Halqa, not revenue, paid when the circle closes, taken as points or cash. HOST ELIGIBILITY: a good score with substantial proof, or two clean known committees, or the same security. ACCOUNT OPENING must take under ten minutes | New register section AQ (88 items); items 396, 471, 475, 916, 917, 920, 946 and 962 rewritten; the business model contribution of about Rs 50 a member a month is now before the host's commission and must be restated | USER 5 Oct: "most people 99 percent already work ... remove this concept of 2 months, only exceptional cases"; "if you have a good credit history ... you are eligible for any"; "you sign a clause that says that u will not take money out for duration of committee so kinda like a security"; "give a relaxation of 10% of pot money"; "he gets 10 percent of profit the committee made for us, profit not revenue"; "the time to make an account cannot be more than 10 min"; "make sure that money is in the savings scheme so not too harsh"; answers "Wait for TASDEEQ's bands", "At the end of each circle", "Frozen by the bank, member's own account" |
| 5 Oct | Work register of 5 October built and filed | Work Register of 28 Sep: 1,039 items, text and status only (this file said 665 in error) | 10,402 items with owner, priority, phase or milestone and status; 102 phases for Claude, each at most 100 items and 100 effort points; milestones H1 to H6 for people; decisions recorded: PSP service fee of 1.5 per cent on wallet and card payments only, never on the bank's direct debit; the meeting with Mashreq has no date yet, so phase 1 starts the corrections and the application; the ballot (parchi) is kept inside the score bands and credit weighted ordering removed (item 356) | Section 1.6 item 2 done; next work is phase 1 | USER 5 Oct: "verify the to do list, make it a pdf ... research how digital finance apps work and all interfaces ... run a loop 10 times ... fully corporate ... divide into phases that you can complete in one usage session of Claude Pro"; answers "100", "Very fine", "Wallet and card only", "Not fixed yet" |
| 30 Sep (evening, second round) | Version 6 icon design reverted; Mashreq v7 and Raqami v5; new fee | Mashreq v6 and Raqami v4 (icon tiles, person icon, no boxes); fee up to Rs 500 with Rs 547 takaful or insurance in the Rs 11,047 split; contribution Rs 352, break-even about 170 | Version 5 boxes and wording with his edits for both banks; logos kept (Structure, Cycle heads, NEO or Raqami tile in the first product box, Competition, International Success, the bank's name in the Onboarding lane and on Regulation); all text black; charts drawn as shapes; the redrawn split bar kept. Fee Rs 85 a monthly instalment = running cost (at most Rs 35) plus Rs 50; PSP service fee 1.5 per cent of the instalment (Rs 150 on Rs 10,000); the takaful or insurance fee named only, outside the fee and Halqa's income; the member pays Rs 10,235 plus that fee; contribution about Rs 50 a member a month; technical cost covered at about 1,220 members. The app's full-cost screen shows the same | Sections 1.2, 1.5, 15, 16.3, 17 | USER 30 Sep evening: "this looks too much now, and informal, revert these emji type changes except logos, keep logos, rest restore those boxes and wording"; "the total fee per month for installment, dont consider taful, keep our fee only like 50 pkr more than oepraional, rest just say nsurance or taful fee"; answers "Rs 85 but mention insurance, and also the psp service 1.5 percent per installment fee", "Name only, no amount", "all person icon and other thing icon remove, All text black, Charts drawn as shapes, New split bar on Revenue"; "keep the black text for all" |
| 30 Sep (evening) | Mashreq v6 and Raqami v4 built from the chairman's own edited copy of v5 | Mashreq v5 and Raqami v3 (morning) | His text edits applied to both banks: Founder on the cover; "Fixed order/Ballot"; Market without "2 times" and with "Rs 5000 / average monthly contribution, [4]"; Structure without "Halqa never"; ways to pay "(new), Recurring wallet merchant" and "Raast RTP"; "5-7 days"; "banking services"; Credit "reported to TASDEEQ", "or Linkage with Tasdeeq directly", "after a circle completes", evidence block removed; onboarding "Identity Engine" and "Verified using income verification engine", footer removed; Types "Rs 2000 to 10,000" and "Rs 10,000 to 25,000"; "... and autopay"; break-even chart removed; "Competition" with logos, "usually limited", JazzCash defaults "none", "60 million registered accesible"; "International Success" with logos; Current Status without subheading and bottom box; Summary moved after Current Status. Design: no text inside boxes, logos and icon tiles, his person icon for members, all grey text black, charts drawn as shapes | Sections 1.2, 16.3, 17 | USER 30 Sep evening: "see how i added logos, do this for raqami bank and where else i left, these boxes seem so boring ... for member use the person logo ... every text ... black, not grey ... dont add any new text ... do same for raqami"; "i dont like those boxes with text inside, bring some innovation here too" |
| 30 Sep (morning) | Decks rebuilt as Mashreq v5 and Raqami v3; technical-only fixed cost; verified rates | v4 and v2 of the same morning; fixed cost Rs 1.32m | 20 main slides plus Appendix A1 to A6 (Hyper, payment collection, wallets and PSP, recovery, points, regulation), each topic also briefly in the main slides; larger real app screens plus screens generated in the app's own kit (no tag); Hyper tagged Experimental; turn eligibility and recovery folded into Default Prevention. Fixed cost TECHNICAL ONLY about Rs 61,000 a month (Vercel, Supabase with PITR and staging, Sentry, Google Workspace, Apple); break-even about 170 members. Verified: Mashreq is Islamic-first with its own Shariah Board; NEO Islamic Current Profit Account now up to 2 per cent; Islamic Savings 10 per cent below Rs 1.5m; NO public direct debit or standing instruction, so the mandate is a new line to request; Raqami 7 day Mudarabah Certificate 10 per cent (August 2026); hosting in Singapore (Vercel sin1, Supabase AWS ap-southeast-1). Hyper at Rs 15 loses money without the takaful or insurance commission because of daily WhatsApp costs | Sections 1.2, 1.5 | USER 30 Sep: "Technical only"; "no tag but make them"; "keep all in appendix except default prevention ... and types"; "label hyper committee as experimental" |
| 30 Sep | Mashreq v4 and Raqami v2 presentations built and filed | Mashreq v3 (21 slides) and Raqami v1 current | 26 slide decks in the new style; old versions in Superseded. Hyper Rs 135 / Rs 151.67 confirmed as the takaful or insurance contribution; requests slide, pilot and timeline removed, Current Status kept; colours: lime, blue, teal, amber with each bank's own tones as the theme; the PSP is not named and the three collection methods are shown | Section 1.2 and 1.6 | USER answers of 29 Sep night: "Takaful or insurance", "remove requests, polot and timeline and not current staus", "option 1 ... raqami ... purple and mashreq their color tones", "dont give specifc name ... for autopull the 3 methods" |
| 29 Sep (night) | NO COVER BY HALQA: default protection is ONLY takaful or insurance | D7 (28 Sep): the bank chooses a guarantee from its balance sheet, insurance or takaful; decks said "cover" | Only takaful or insurance from a licensed operator, chosen by the bank; no Halqa cover of any kind; bank guarantee option dropped; the Rs 547 in the Rs 11,047 split is the takaful or insurance contribution; Hyper Rs 135 / Rs 151.67 portion treatment asked the same night | Every deck and document: replace "cover" with takaful or insurance; recovery step 3 is the takaful or insurance claim | USER: "HALQA COVER IS GONE, ONLY TAKAFUL OR INSURACNE, NO COVER BY HALQA, save it" |
| 29 Sep (night) | Rebuilt Mashreq and Raqami decks (26 slides each, assertion headlines, Georgia, lime only) REJECTED | Rebuild in progress | Start again: Arial only; wider colour palette; proper diagram standards; boring plain headings and subheadings; no one-point slides; own slides for committee types, autopay, default prevention, wallets, PSP and PSP integration; pilot and plan removed | Section 1.6 item 0 restarts | USER: "these are shit ... not up to the standrad, delete this and make it better" |
| 29 Sep (late evening) | Surname and age settled | Decks said "Taha Amjed"; age 16 or 17 in conflict | "Taha Kayani, Chairman, Halqa" on decks and documents; age 17 | Presenter line changes on every deck | USER: "17 Kayani" |
| 29 Sep (late evening) | Due date settled | The 8th (D12) or the 10th (older) | The 8th | Collection calendar and decks | USER: "8th" |
| 29 Sep (late evening) | Point value settled; on-time points capped | 10 points = Rs 1 of fee (25 Sep) against 1 point = Rs 1 (D4); 60 per on-time instalment, 100 per five | 1 point = Rs 1 everywhere; on-time points never more than 50 per cent of Halqa's own fee on that instalment | Business model point cost; decks | USER: "1 point 1 rupee"; "whatever amounts doesnt let go of more than 50 percent of halqa own fee" |
| 29 Sep (late evening) | Turn price ceiling set | None | 100 per cent of the pot | Turn market rules | USER: "at 100 percent of the pot" |
| 29 Sep (late evening) | Hyper fee settled | Rs 75 / Rs 83.33 fee plus equal cover (25 Sep); Rs 15 request paused (28 Sep) | Rs 15 fee a day; cover Rs 135 / Rs 151.67; daily payment unchanged Rs 450 / Rs 500 | Hyper economics; Halqa's Hyper fee falls from Rs 1.5m to Rs 0.3m a cycle on option 1 | USER: "the latest one", confirmed "Yes, exactly that" |
| 29 Sep (late evening) | Shariah labelling dropped | Keep non-Shariah features and label them honestly (14 Jul) | No labels at all; features never removed from Halqa; Raqami deck omits what an Islamic bank cannot offer, silently | Decks and documents | USER: "do whatever, i dont really care shariah or not no labelling needed" |
| 29 Sep (late evening) | Company and TASDEEQ status confirmed | Unknown | Not incorporated; TASDEEQ not contacted | Readiness slides say incorporation is to do | USER: "no nothing" |
| 29 Sep (late evening) | Old decks and stray files | 43 slide deck and 08 Mashreq pitch contain names; Raqami PDFs in an old scratchpad; Google Doc test copies in Drive | Names removed and both decks moved to Superseded; the PDFs and test copies moved to a superseded archive (never deleted) | Housekeeping | USER: "11. yes", "13. put them in superseded archive" |
| 29 Sep (late evening) | 81 slide reference deck | Six month pilot, icons, Amjed | Full rebuild in the new style after the two bank decks | Queue | USER: "After the two decks, full rebuild" |
| 29 Sep (late evening) | Task set: rebuild the Mashreq (v3) and Raqami (v1) presentations | v3 and v1 current | Verify all facts, deep pitch research, concise for a newcomer, fewer words, more diagrams, not AI-looking, up to 5 more slides, .pptx and .pdf | Section 1.6 item 0 | USER message 29 Sep late evening |
| 29 Sep (evening) | Raqami deck built: "Halqa Presentation for Raqami 29 September 2026", 21 slides, 1,856 words, Mashreq version 3 style in Raqami purple (#573F99). Islamic adaptations: no interest framing, standing instruction through Raqami's open API, 7 day Mudarabah Certificate for the payday to due date week, Saving Pots, cash at Askari branches, committee takaful with EFU, ijarah financing, five committee types (UAE family dropped because Raqami onboards residents only), late charges always to charity, flat fee called ujrah, a Shariah oversight row in the comparison, Hakbah first in Evidence, the 1 January 2028 riba deadline in Why Now, Shariah Board approval among the requests | Plan only | Built; filed in `01 Presentation` | Two bank decks now exist; Raqami is parallel to Mashreq | USER: "i will try to work with either, i dont care, just make the separate presentation like mashreq for raqami, same style but adapted for different bank" |
| 29 Sep (evening) | Raqami logo taken from the embedded image in Raqami's Annual Report 2025 PDF already on disk (no new download) | No logo | `docs\generators\complete_position_2026-09-29\logos\raqami-logo-colour.png` | Disclosed to the chairman | This session |
| 29 Sep (evening) | Non-Shariah features (money turn market, points bought with money) left out of the Raqami deck; its notes say anything the Shariah Board cannot approve is not offered through Raqami | Open question Q6 | Default applied, awaiting the chairman's confirmation | Keeps the keep-all-features rule for Halqa overall | Claude's choice, flagged |
| 29 Sep | Master context requested and built (this file) | HANDOVER folder of 9 Aug plus memory files | This file is the current cold-start brief | Read this first in any new chat | USER message 29 Sep |
| 29 Sep | Raqami Islamic Digital Bank researched; plan for a Raqami version of the deck written; nothing built | No second bank | Plan with 5 open decisions (Section 11) | Possible second partner or fallback | Web research; memory `raqami-plan-2026-09-29` |
| 29 Sep | Three Raqami PDFs (half year June 2026 11.8 MB, annual 2025 5.6 MB, first quarter 2026 2.4 MB) downloaded from raqamidigital.com into the session scratchpad without asking first | none | In scratchpad `raqami\` only | Disclosed to the chairman; delete on request | This session |
| 29 Sep | Presentation version 3: same information, 1,773 words on slides against 2,595; every exhibit redrawn as a proper chart or diagram (payment matrix, waffles, sequence diagram, swimlane, exposure by turn, Sankey, Harvey balls) | Version 2 (21 slides, icons, numbered circles, rings, staircase) | Version 3 current; version 2 in `01 Presentation\Superseded` | Diagram rules for all future decks (Section 16) | USER: "convey the same information with less words", "diagrams look like ai slop, beautiful and proper" |
| 29 Sep | Family, Office and Market committee types merged into one type, "Known" | Eight types | Six types | Applies to decks and future documents | USER: "for the office one and whatever, just say known" |
| 29 Sep | Presentation version 2 changes: mixed formats; detailed default prevention and recovery; onboarding and verification engines; committee types matrix; JazzCash added to the Oraan comparison; digital wallets and financial literacy in Why Now; founding years and two more companies in Evidence; SBP regulation stated; PILOT CUT TO ONE MONTH; market research slide with sources; "Mutual Benefit" title; Mashreq products in use; revenue and business model slide | Version 1 (15 slides, six month pilot, five requests) | Carried into version 3 | Pilot is one month everywhere now; the 81 slide deck still says six months | USER message 29 Sep |
| 29 Sep | Presentation version 1 built after pitch research (Visme, YC, Duarte, Kawasaki, DocSend, bank sales practice) | Only the 81 slide reference deck | Superseded by v2 and v3 | Pitch rules kept (Section 16) | USER: "make a new one that is useful and presentable ... audience knows nothing" |
| 29 Sep | No names in decks: mentor, advisers, private individuals, family, bank officers removed | The 43 slide deck of 28 Sep named the SECP Chairman on eight slides, an adviser, a fraud-case individual, Mashreq officers and "the chairman's father" | Rule in force; 81 slide deck and presentation are clean; the 43 slide deck of 28 Sep and the 21 slide Mashreq pitch in `08` were NOT cleaned | Never name them again | USER: "does this say their names akif saeed or anyone cause thats inappropriate" |
| 29 Sep | 81 slide "Halqa Complete Position 29 September 2026" built and filed separately | 43 slide edition of 28 Sep | 81 slide edition is the reference deck; 43 slide kept beside it | Backup for detailed questions | USER: "make it a separate powerpoint" |
| 29 Sep | "Needs visuals" answered with lucide icons and app screens in phone frames | Text-heavy slides | Later the same day icons in diagrams were judged "ai slop"; version 3 has no icons in diagrams | Icons are no longer a valid answer to "needs visuals" | USER messages 29 Sep |
| 28 Sep | BANK ROUTE adopted after the mentor's 27 Sep verdict | No bank partner ever (28 Jul); no custody; Safepay split settlement; CDC trustee vault | Partner bank holds and moves money; Halqa takes no licence | Reverses the core July to September architecture | USER report of 27 Sep meeting |
| 28 Sep | D1 to D16 chosen | HQ-BK-01 options | Section 1.3 | Governs every document from now | USER message 28 Sep 11:15 UTC |
| 28 Sep | Oraan research (Google Doc, two passes), Bank Partnership Revisions HQ-BK-01, Partner Bank Proposition HQ-BK-02, Complete Position 43 slides, Mashreq pitch 21 slides | none | Delivered | See Section 13 | Memory `bank-partnership-docs-2026-09-28` |
| 28 Sep | Visual direction: lime not dark green, fewer tables, more visuals, logos, less AI wording, ONE deck for everything, font does not matter | Dark green Mashreq deck; table-heavy Oraan doc | Lime visual-first | All decks | USER messages 28 Sep |
| 28 Sep | Work halted on: business model rebuild (Rs 15 Hyper fee, ads for points, software cost table, Google Ads blitz), pay on behalf, route maps, transaction map, payday window build | In progress | Paused, to be re-planned around the bank | See Section 4 | Memory `paused-work-2026-09-28` |
| 27 Sep | Mentor meeting 4: Halqa's CDC and float design breaches Companies Act 2017 s.84; any such system needs SBP regulation; partner with a Pakistani bank; he will try to arrange a bank meeting near 10 Oct | No-custody design believed lawful | Chairman accepts the verdict | Bank route | USER report 28 Sep |
| 25 Sep | Safepay restated as THE payment partner; EMI partner idea reversed; chairman called the regression memory loss | 24 Sep verification switched partner to an EMI (NayaPay or SadaPay) | Safepay (licensed PSP) for all collection; role to be re-decided under the bank | Never propose an EMI as partner again | USER: "safepay has all of the payment options and autodebit ... not sadapay" |
| 25 Sep | Points route A; 60 per on-time instalment, 100 per five; 10 points = Rs 1 of fee; seats sold for points at prices members agree; no money for points; no Daraz | none | Changed again on 28 Sep (D4, D9) | Legal flags on the 28 Sep version | Memory `seat-exchange-points-route-a` |
| 25 Sep | Business model rebuilt (HQ-CP-03); WhatsApp Rs 4.35 a message from 1 Oct; break even 2,572 | Older model (2,379 or 2,400 members etc.) | 25 Sep numbers current until the bank's terms | Old numbers must not be quoted | Memory `business-model-2026-09-25` |
| 25 Sep | New document style for all corporate documents; single home `Desktop\ALL HALQA\HALQA CORPORATE` | Documents in several places | Section 16 style; Section 13 folder | | USER messages 24 to 25 Sep |
| 24 Sep | Legal verification in primary text; RTP settles to the merchant who sends it; misquotes corrected | 23 Sep claims | Section 8 corrections | | Memory `legal-verification-2026-09-24` |
| 24 Sep | Decisions for the mentor's meeting: income account rule; insurance stress case; father as director; Islamabad office; app work paused for the document pack | none | CURRENT except where the bank route changes them | | Memory `akif-meeting-4-2026-09-27` |
| 23 Sep | Hyper fixed at two options with a contribution plus flat service fee split; takaful route C; bright green theme; "recorder" banned; collection ladder; wallet UI references | Several Hyper specs | Section 7 decision log | | Memories of 23 Sep |
| 22 Sep | JazzCash Committee launch discovered (13 Aug launch, v5.6.7 of 23 Aug); mentor's SBP versus SECP message; no member-to-member position money; licensing clause verification; no sandbox; 100,000 users in two weeks target (6 Oct) and work register | none | See timeline | | Memories of 22 Sep |

---

# 3. USER PROFILE AND LONG-TERM PREFERENCES

## 3.1 Who the user is

| Fact | Value | Evidence | Status |
|---|---|---|---|
| Name | Taha Amjed (email tahaamjed23@gmail.com; git user "Taha Amjed"; decks say "Taha Amjed, Chairman, Halqa") | CONFIRMED (git config, account email) | CURRENT |
| Surname for public use | "Kayani" (USER, 29 Sep late evening: "17 Kayani"). Decks and documents now say "Taha Kayani, Chairman, Halqa". Kayani is also the name on his app account and the byline of a Friday Times article of 23 Feb 2026. Email and git still say Amjed. | USER | CURRENT (was UNCERTAIN) |
| Title used in documents | "the chairman" (project convention) | HANDOVER 01 | CURRENT |
| Age | 17 (USER, 29 Sep late evening). The "i am 16" of 18 Aug is superseded. A minor, which is why his father is to be the director | USER | CURRENT (was CONFLICT) |
| Education | A-level: mathematics, chemistry, physics. Strong English. Zero formal finance background. | USER, July | CURRENT |
| School | Probably Cadet College Hasan Abdal (a speech addresses "my fellow Abdalians"; a debate "will happen in cadet college hasanabdal") | INFERENCE from non-Halqa session 0109ba15 | UNVERIFIED |
| Role | Founder and sole decision-maker of Halqa. No team. His attention is the binding constraint. | HANDOVER 01 | CURRENT |
| Machine | Windows 11 Pro, user `admin`, project `D:\HALQA SIGMA APP`. Migrated late July from laptop DESTROYER (user `pc`). | CONFIRMED | CURRENT |
| Other work seen on this machine (not Halqa) | Debate speech "Great Leaders are Defined by Empathy, Rather than Authority" (28 Jul, for a debate at Cadet College Hasan Abdal, 1,000 words, 3:40 to 4:00 minutes); speech "Redefining Student Decision-Making in an Era of Digital Transformation" (4 Aug); Claude project folders "Junior Economic Review USB Package", "PFIP MIGRATION", "codex security scans" (contents not reviewed); LSE Generate competition (registered, Aug) | Transcripts, folder names | HISTORICAL context only |

## 3.2 Network (details in Section 12)

- Mentor: Mr Akif Saeed, sitting Chairman of the SECP. Private relationship. Never name him in any deck or document.
- Adviser: Mr Shahid Kazi (20 July meeting). Never name in decks.
- Local "chachas" and lower-income workers, whose words shaped the product (payday collection came from "I pay as soon as my pay arrives"; trust from "I will only put a committee in a person I trust").
- Father: to be company director. No name recorded. Never mention family in documents.

## 3.3 Vision and values (his own framing)

- Halqa should stand next to JazzCash and Easypaisa in look and credibility, "not look like a startup toy"; "a google standard app"; "for all of Pakistan".
- Digitise the committee, do not replace it; "without making halqa too complex"; "you are making it more complex than need be".
- Trust is the product.
- Legal above all: "unethical or ethical we dont care, just legal, that wont take the app down or SECP shuts it down"; but he rejected extractive ideas ("no man most of these are u trying to sound evil"). Practical line: aggressive is fine, extracting from the member is not.
- From the mentor (30 Aug): "think like a businessman, not a social worker"; scale is the most important thing.
- Halqa is "the main guy", "the system"; the bank is "the machine" (28 Sep).

## 3.4 Long-term preferences that change how answers must be written (CURRENT)

| Preference | Detail | Since |
|---|---|---|
| "Yes boss" sign-off | End every reply with "Yes boss". It is a truth marker: everything above it is verified. | 7 Jul |
| No overstatement | Never claim something works that was not run. Say "unverified" or "failed" plainly. Show the reachable screen, never a percentage. | 7 Jul, 18 Aug |
| Specificity | Any mechanism must be concrete enough that "how?" never arises. | 30 Jul |
| Real numbers | "tell me business values not bullshit estimate", "the lowest possible value". | 30 Jul |
| Formal register, no puns | Plain noun headings ("Summary", "Fixed costs"); no hooks, metaphors, slogans, "numbers that matter"; tables where content has rows; only what was asked. Applies to chat too. | 19 Sep |
| No dashes | No em or en dashes in prose. | 12 and 17 Aug |
| Banned words | "journey", "unlock", "seamless", "empower", "leverage", "revolution", "truly", cringe slogans; "Sakh" (use "credit score"); "recorder" framing. | Aug to Sep |
| No you/your/we/our on slides; no direct addressing in documents he presents | "dont talk like YOU do this ... i will present this stuff at meetings" | 23 Sep |
| No AI look | No pills or rounded badges, no accent lines under headings, no italic kickers, no "previously we said" boxes, no emoji, no pastel card grids, no stat tiles, no eyebrow labels, no numbered 01/02/03 card grids, no list-of-rows navigation in the app. Diagrams must be proper exhibits (Section 16). | Jul to 29 Sep |
| Lime green | l500 #6DC72A, l700 #41801A, light tints E3F8CA and F3FCE7, ink #0C1408. Never dark green, pine or gold. | 12 Aug (app), 23 Sep, 28 Sep |
| Fonts | "i dont care what font". | 28 Sep |
| No names | No mentor, adviser, private individual, family or bank officer names in decks or documents. His own name as presenter is fine. | 29 Sep |
| Legal questions | "Are we in legal trouble" means "does the PLAN fall outside the law": answer per design part, provision and fix; never lead with "no money has moved". | 24 Sep |
| Learning register for him | Explanatory material for him defines every term, shows rupee arithmetic, uses maths and physics analogies, adds self-test questions. Maths comes in pairs: formal for companies, informal for him. | 14 Jul, 24 Sep |
| No agents or workflows | Do the work directly; he rejected agent orchestration repeatedly ("dont deploy any agents, all manually, i dont care how long it takes"). | 3 Aug, 17 Aug |
| Questions | He tolerates clarifying questions when he offers ("any doubt ask", 24 Sep) but usually expects intent extracted from short, typo-heavy messages. When he goes AFK: "dont ask me anything, complete everything". | Jul to Sep |
| Honesty over comfort | He wants the truth even when unwelcome ("so am i fucked" after JazzCash; "check again, dumbass, we fixed all the negatives"). Answer the actual question in one line when he asks for one line. | Sep |
| Memory | He expects every decision recalled; regressions are called "memory loss" (Safepay, 25 Sep). | ongoing |
| Production | Never blind `prisma db push` to production; additive SQL only; he applies production migrations himself; never deploy to production without approval. | Jul |
| Deletion | Never trash files he did not ask to delete. Move to "Superseded" folders instead. | ongoing |
| Downloads | Ask before downloading files (partner logos need approval). | 28 Sep |
| Drafts | Messages to the mentor and emails to partners are drafts; never send. | Sep |
| Drive | Do not mirror to Google Drive unless asked. | 25 Sep |

## 3.5 Things he has told Claude never to do (standing)

- Mention kameti.pk ("slop and random shit, dont bring it up again", 2 Aug).
- Use agents or workflows unless asked.
- Name the mentor or anyone private in decks (29 Sep).
- Rotate the exposed database password (he said "forget it"; flag it, do not act).
- Apply production migrations himself on his behalf.
- Remove a feature because it is not Shariah compliant (label it instead).
- Propose an EMI as the payment partner (25 Sep).
- Describe Halqa as "the recorder" (23 Sep).
- Use dark green or pine (28 Sep).

---

# 4. ACTIVE PROJECTS AND AREAS OF WORK (latest state)

## 4.1 Bank partnership with Mashreq Bank Pakistan (TOP PRIORITY)

| Item | State (29 Sep) |
|---|---|
| Status | Preparing for a meeting near 10 Oct arranged by the mentor. Nothing signed. |
| Presentation | Version 3, 21 slides, `01 Presentation\Halqa Presentation for Mashreq 29 September 2026.pptx` and `.pdf`, speaker notes on every slide. Generator `D:\HALQA SIGMA APP\docs\generators\complete_position_2026-09-29\deck\pres3_build.py`. |
| Reference deck | 81 slides, `01 Presentation\Halqa Complete Position 29 September 2026.pptx`. Out of date on the pilot (six months, now one month) and uses icons. |
| Earlier bank decks | `01 Presentation\Halqa Complete Position.pptx` (43 slides, 28 Sep, contains names) and `08 Bank Partnership\Halqa and Mashreq Bank Pakistan.pptx` (21 slides, 28 Sep, lime). Both historical. |
| Supporting docs | Google Docs HQ-BK-01 (Revisions, decisions now made) and HQ-BK-02 (Partner Bank Proposition, Mashreq fit). |
| Open with the bank | Cover option; who reports credit; income share and fee level; whether Mashreq can open accounts and mandates inside the Halqa app by API; Islamic window approval; SBP approval or notice path; pilot limits. |

## 4.2 Raqami Islamic Digital Bank (DECK BUILT, parallel to Mashreq)

Deck built 29 Sep evening: `01 Presentation\Halqa Presentation for Raqami 29 September 2026.pptx` and `.pdf` (21 slides, 1,856 words), generator `docs\generators\complete_position_2026-09-29\deck\pres_raqami_build.py`. The chairman will "work with either" bank. Open: introduction and meeting; confirmation of the Shariah-only scope. Researched 29 Sep (facts in Section 12 and 15). The plan that the deck follows: reuse the Mashreq v3 skeleton with Raqami data and colour; Islamic framing throughout (members' mutual interest-free loans, flat fee as ujrah, all penalties to charity, takaful only, Shariah Board approval as a request); Mutual Benefit chart built on Raqami's Rs 1.58 bn deposits against Rs 2.5 bn from 100,000 members; products line using the 7 day Mudarabah Certificate for the salary-to-due-date gap, Saving Pots after the circle, free cash deposits at Askari Bank branches, EFU window takaful as cover; drop or defer UAE family (Raqami onboards residents only); Evidence led by Hakbah; Why Now adds the 1 January 2028 riba deadline. Waiting on 5 decisions (Section 11).

## 4.3 Google Slides upload

Blocked. Route: the chairman drags the .pptx into drive.google.com and opens with Google Slides, or connects Claude in Chrome. Nothing uploaded yet.

## 4.4 Work Register

DONE 5 Oct. CURRENT: `07 Internal\Work Register.pdf` of 5 October, 10,402 items: 333 done, 148 partly done, 9,921 open. The 1,039 items of 28 September keep their numbers 1 to 1,039; items overturned by the decisions of 29 September to 5 October were rewritten in place; sections AA to AP (items 1,040 onward) came from ten passes: corrections; State Bank requirements on the bank's service provider; every screen state; every field; every endpoint and database model; every partner connection; every message to members; tests; security and accessibility (OWASP MASVS 2.1, ISO/IEC 27001:2022 Annex A, WCAG 2.2); governance, operations, growth, the two banks and features measured against eleven finance applications. Repeats were removed by a duplicate check and a manual comparison. Phases: Corrections, the application and the documents for the bank, phases 1 to 57; Work on the bank's interfaces (gate H2), phases 58 to 65; Work on the partners' interfaces (gate H3), phases 66 to 69; Public launch, phases 70 to 94; Public launch on the bank's interfaces (gate H2), phases 95 to 98; Public launch on the partners' interfaces (gate H3), phase 99; Scale, phases 100 to 101; Scale on the bank's interfaces (gate H2), phase 102. Phase 1: Removals; retired terms; endpoints to remove. Gates: H2 = the bank's interface documents and test environment; H3 = the PSP, TASDEEQ and message providers under agreement. Milestones for people: H1 company and counsel, H2 bank agreement, H3 partners, H4 pilot readiness, H5 launch, H6 scale. History: 214 items (22 Sep), 540 (23 Sep), 646 (24 Sep), 665 (25 Sep), 1,039 (28 Sep, revision 6; this file wrongly said 665), 10,402 (5 Oct).

## 4.5 Oraan Research update

The "Oraan Research" Google Doc needs the TASDEEQ membership finding and the DIB finding added (both in memory `oraan-research-2026-09-28`). Needs the Google Docs connector, else a new copy.

## 4.6 Paused work (halted 28 Sep, to be re-planned around the bank)

| Item | Requested | State |
|---|---|---|
| Business model rebuild | 25 Sep: explain every cost (cloud Rs 2 a member, statement check Rs 28, why brackets); remove all people except counsel; a software house for 1 to 2 weeks instead of engineers; separate software cost table by month and scale; rewarded ads earning points; a 3 week Google Ads blitz "Grammarly level"; Hyper fee Rs 15 on both options with more takaful | Not built |
| Points | Keep exactly as is (60 on time, 100 per five, ten points = Rs 1, fee credit) | Superseded in part by D4/D9 |
| Pay on behalf | Person B pays A's instalment; A repays B next month; lawful and simple; no points | Not built |
| Float answer | Halqa cannot float salary money until the due date (s.84); at the 11.5 per cent policy rate of 15 Sep it is about Rs 16 on Rs 10,000 for five days | Answered; the bank's short-term savings now replaces it (D12) |
| Maps | All outdated; maps must show connected ROUTES not lists; a metro-style Transaction Routes map | Not built |
| Payday window | pack/patch_payday_window.py applied to builders but not built or synced | Half done |
| Research saved 28 Sep | Prices of Vercel, Supabase, Sentry, AWS Rekognition and Textract, AdMob rewarded policy (rewards must be non-transferable), Google financial services verification list (Pakistan not on it), DataReportal Pakistan 2026, ad costs, Clutch rates, SBP policy rate, WhatsApp pricing | In scratchpad research |

## 4.7 The app (D16, paused)

| Item | State |
|---|---|
| Live URLs | Web https://halqa-seven.vercel.app ; API https://halqa-api-delta.vercel.app (NOT halqa-api.vercel.app, which belongs to a stranger) |
| Stack | React + Vite web (`halqa-web`, port 4100), Express + Prisma API (`halqa-api`, port 4101), Supabase Postgres (Singapore region, project lvxvncbflhlzsmvhgphq), Vercel serverless (sin1), daily cron 02:00 UTC for delinquency |
| Tests | Last recorded: 60 unit / 352 integration green (31 Jul); later suites grew (hyper 27 tests, 97 unit after engines on 13 Aug). Current count UNVERIFIED. |
| Git | Branch master; many modified files uncommitted at session start 29 Sep; GitHub pushes were blocked in August by ISP-level TLS filtering (verified 17 Aug) |
| Chairman's verdicts | 18 Aug "NOTHING HAS BEEN IMPLEMENTED ... SAME 90 PERCENT"; 26 Aug "only 25 percent complete"; 27 Aug "not even at 10 percent", "we need 100 more pages"; 29 Aug "mostly done, problems ... buttons look very AI"; 24 Sep: Home is the only screen he likes; he hates list-style layouts; sign-up and sign-in are "ancient, AI slop" |
| Known defects (verified 22 to 24 Sep) | CNIC camera blocked by `Permissions-Policy: camera=()`; no migrations history; no error monitoring; chat polls every 6 s; 58 unbounded findMany; 5 skeletons; no toast; demo login "+92 300 1234567 · halqa123" printed on the live sign-in page (AuthPage.tsx:538); four crashing screens (Support, Statement, Limits, Devices); retired terms still on nine screens |
| Legal findings in code (22 Sep) | Turn marketplace ledgers a premium buyer to seller with 10 per cent to Halqa; early fee distributed to members; vault accrues a money-market rate; deposits accrue yield; SIMPLE_MODE=false so the investment layer shows; float sweep takes a 5 per cent mudarib fee; BANK_CUSTODY gated off. Liabilities attach on go-live, not now (no money moved). Under the bank route these need re-planning. |
| Do not use in decks | App Hyper screen (shows Rs 412.50 a day) and Rewards screen (shows NaN), committee screen ("Turn 4 of 2"), pay screen (retired wording) |

## 4.8 Company formation and registrations

Plan (24 to 25 Sep, documents HQ-LD-01 and HQ-LD-02): SECP private limited company via eservices.secp.gov.pk; two directors (Companies Act s.154), neither a minor (s.153(a)), directors must hold shares unless an exception applies (s.153(i)); the chairman's father as director; registered office Islamabad so sales tax on services falls under the Islamabad Capital Territory Tax on Services Ordinance 2001 with FBR; FBR NTN; corporate bank account. No record that any step has been taken. UNCERTAIN.

## 4.9 TASDEEQ

Chairman to contact TASDEEQ directly (action from 30 Aug) as well as through the mentor's introduction. No record of the outcome. Under D11 the bank may report instead. Mashreq is a TASDEEQ member.

## 4.10 This master context

Keep it current: every new decision, correction or file updates Sections 1, 2, 6, 7, 8, 9, 13, 17 and 18 (rules in Section 16.6).

---

# 5. HISTORICAL PROJECTS AND WORK (completed or inactive)

| Period | Work | Where | Status |
|---|---|---|---|
| Jul | Report sets v1 to v3, meeting register (docs/reports 01 to 09) and learning register (docs/learning L1 to L4, HALQA-LEARNING-VOLUMES) | `D:\HALQA SIGMA APP\docs\` | HISTORICAL |
| 20 Jul onward | App live on Vercel; signup wizard, circles, marketplace, legal corpus, auto-collect, undertaking and mutual guarantee, payday collection (31 Jul), algorithm engines (13 Aug), Hyper page, rewards, exits, appearance | code | Built; reachability disputed (18 Aug) |
| 21 Jul | Full Project Report; ROADMAP-LICENSING-AND-COSTS | docs | HISTORICAL |
| 23 Jul | Meeting brief for the mentor (MEETING-BRIEF-AKIF-SAEED-2026-07-23) | docs | HISTORICAL |
| 28 to 30 Jul | Three master reports: investor/SECP, A-level explainer, meetings and findings (commit 8025fc6); JP Morgan pitchbook discipline | docs | HISTORICAL |
| 2 Aug | Brand v2 pine/gold, Register logo, Sakh; report set of 2 Aug (Full Report 19 pp, Strategy 11 pp, Explained 12 pp, ROSCA Literature 13 pp, Mathematics Explained) | docs | SUPERSEDED (brand) |
| 6 to 9 Aug | Committee Dossier (16 pp), Discipline Layer (15 to 16 pp), Attempts Archive (21 pp) | docs | HISTORICAL, still valid research |
| 9 Aug | HANDOVER folder (12 files) | `D:\HALQA SIGMA APP\HANDOVER` | HISTORICAL for current state |
| 11 Aug | Build plan, ten subsystems (HANDOVER 12); Product Architecture pitchbook 43 to 53 pp (golden black) | HANDOVER, docs | HISTORICAL |
| 12 to 13 Aug | Investor pitch in lime (PowerPoint "haji halqa" saved on his PC 13 Aug); Hyper default 3D models; fee Rs 100 flat directive | PC, docs | HISTORICAL |
| 14 to 15 Aug | LSE Generate competition research and pitch (Gamma prompt, "use gama") | | HISTORICAL |
| 17 Aug | Master deck 66 then 68 slides (dense, pine/gold) | `docs\HALQA-MASTER-DECK-2026-08-17.pptx` | SUPERSEDED |
| 18 Aug | LSE Generate / Glob Innovation deck (inverted colours, black ground; fee "just 50 PKR on each instalment"; "only real digital committee provider in Pakistan and globally"); the chairman's own Google Slides deck `12OAuug83FQ7kd4jUlvpLyBMs8GMs3MZ1` edited and rebuilt | Drive, docs | HISTORICAL |
| 18 Aug to 24 Sep | App rebuild toward JazzCash style: 600-task list, 137-item list, 35-item list, areas 1 to 18 | code | Paused |
| 30 Aug | Script PDF for "HALQA latest presentation" (bullets per slide) | PC | HISTORICAL |
| 15 Sep | Scheduled task "message-akif-15-september" reminded him to message the mentor and contact TASDEEQ | scheduled task | Done (the mentor replied on 22 Sep) |
| 17 to 19 Sep | Cost model and answers to the mentor (Google Doc "Halqa Cost Model and Answers to Akif Saeed", 19 Sep) | Drive | SUPERSEDED by business model of 25 Sep |
| 22 to 24 Sep | Statutory Position (revisions 22, 23, 24 Sep), Legal Verification (24 Sep), Collection and Auto-Pull Specification, Hyper Committee doc (several revisions), Business Model docs, Complete Feature and Process List, Work Registers, eight maps (PNG), Regulatory Jurisdiction Note, Structural Changes and Licensing Position | Drive folder "Halqa Business Documents", Desktop folders | SUPERSEDED by the 25 Sep corporate set, which is itself pre-bank |
| 25 Sep | HALQA CORPORATE document set (HQ-CP, HQ-LG, HQ-LD, HQ-MF, HQ-MI, maps, work register) and the 51 slide master deck of 25 Sep | `Desktop\ALL HALQA\HALQA CORPORATE` | Current as the latest documents on those topics, but written for the no-custody Safepay design; must be revised for the bank route |
| 25 Sep | Drafts: message to the mentor, email to Safepay (not sent) | `07 Internal\Drafts` | HISTORICAL (pre-bank) |

---

# 6. TIMELINE

Format per entry: what happened; what changed (before to after); why; source; relevance now. "Mem" = memory file name. "Msg" = the chairman's message that day. Times are not given; the order within a day follows the record.

## July 2026

| Date | Event and change | Why | Source | Relevance now |
|---|---|---|---|---|
| 7 Jul | "Yes boss" sign-off instituted; never overstate; read code when docs disagree | Agents had overstated progress | Mem user-communication-style | CURRENT |
| 14 Jul | Keep every feature, label honestly ("keep everything even if not shariah, just dont say its shariah in the app") | Honesty, not pruning | Mem keep-all-features-label-honestly | CURRENT (applies to Mashreq; see Raqami conflict in Section 11) |
| 14 Jul | Learning register required ("too brief ... i need learning reports, full learning detailed") | He learns from worked arithmetic | Mem learning-docs-style | CURRENT |
| 14 to 18 Jul | Host-configurable expected early-payment window; implemented 18 Jul (`Committee.expectedPaymentLeadDays`) | Drives float projections | Mem host-configurable-float-window | HISTORICAL (float design retired under the bank route) |
| 19 Jul | Stage-tag every claim; licence plus bank partner as the base case; tags FUNCTIONAL / LICENCE / BANK PARTNER / LICENCE+BANK | Record-only alone is "nominal profits" | Mem stage-tag-every-point | SUPERSEDED 28 Jul (tags became FUNCTIONAL / BUILD / GATE-2 / STAGE-2); the bank base case returned 28 Sep |
| 20 Jul | Adviser meeting (Shahid Kazi): low or zero user fees or it dies (his "Razq" failed on fees); study Money Fellows; make it simple (no investments, vault, engines, tiers for now); host incentive; link payment APIs; monetise consented intent data | Pivot to simplicity | Mem kazi-feedback-and-pivot | HISTORICAL (fees since adopted; intent data reframed to Goal Direct-Pay) |
| 20 Jul | Tier names renamed at display layer (Basic, Earn, Earn and Share, Early Access, Maximum) | Confusing brand names | Mem pending-tier-rename | HISTORICAL |
| 20 Jul | App went live on Vercel; brand v1 "gold and white, not dark green"; database password exposed in chat, not rotated ("forget it") | | Mem halqa-live-deployment | Live URLs CURRENT; brand SUPERSEDED; password risk OPEN |
| 21 Jul | Serverless pool fix; auto-collect live; anti-default legal rails live (weekly e-signed undertaking with adopted signature, mutual guarantee at join, salary link 20 per cent off, family linkage, grace minus 2 days, forward-liability gate, bureau-impact audit queue); licensing roadmap written (Version A no licence, Version B heavy licence) | | Mem halqa-live-deployment, licensing-and-cost-plan, halqa-dev-runbook | Code HISTORICAL; principles partly SUPERSEDED |
| 22 Jul | Credit-weighted reordering scrapped; score bands gate which seats may be claimed (Bad <550 last 3, Decent 550 to 649 second half, Good 650 to 749 and Excellent 750+ any); signup security (phone OTP, PIN on every open, address, city, occupation, employer, card linking without PAN or CVC); gold-goal committee as X-factor; bureau access research (eCIB closed to non-FIs) | Reordering felt unfair | Mems score-bands-slot-eligibility, signup-security-and-profile, gold-goal-committee-xfactor, bureau-access-constraint | Bands CURRENT (mandatory, D7) |
| 23 Jul (morning) | Record-only hard constraints: NO vault, deposits, holdback, custody, bank partner ever; anti-default = position, tenure, legal instruments, reputation, family linkage; new members last 3 turns until 2 clean circles plus manual verification; income verification = 80 per cent discount; CNIC camera and biometric to build | | Mem model-constraints-record-only | SUPERSEDED the same day in part, and wholly by the bank route |
| 23 Jul | Mentor meetings 1 (09:30) and 2: default risk is his first concern; "original"; Oraan founders also came to him; revive the vault through a licensed AMC plus CDC trustee; Halqa should cover defaults on its own balance sheet and insure with takaful; filter rather than enforce; separate consumers from savers; study Money Fellows and Egypt; full product report in about two weeks | Regulator's direction outranks self-imposed rules | Mems secp-chairman-meeting, akif-meeting-2-guidance | HISTORICAL; the vault idea was later ruled a s.84 breach by the same mentor (27 Sep) |
| 23 Jul | Commit 13d5687 adds User.locality and User.jobTitle without an additive SQL file (production landmine) | | Mem prod-schema-drift-locality-jobtitle | OPEN until the SQL is applied |
| 26 Jul | Migration bundle created on the old laptop (DESTROYER) | New laptop | Mem new-laptop-environment | Backup only |
| 28 Jul | Migration completed; memory restored manually; local DB rebuilt on PostgreSQL 18.4 (embedded binaries) port 54339 | Old cluster corrupt | Mem new-laptop-environment | CURRENT dev facts |
| 28 to 30 Jul | NO BANK PARTNER EVER directive; second stage = CDC trustee plus digital AMC under an SECP distributor registration; remove bank language everywhere. Document rulings: formal-human register, no italic kickers, no "previously we said" boxes, figures as Exhibits, mechanisms specific, JP Morgan benchmark. Rejected "not WE DONT HOLD money" phrasing | | Mem no-bank-partner-directive; Msg 30 Jul | Directive REVERSED 28 Sep; document rulings CURRENT |
| 30 Jul | Local chachas: "I will only put a committee in a person I trust"; "I pay as soon as my pay arrives". Known circles by invitation only (code, QR, link); fee ceiling Rs 300 on a Rs 20,000 instalment; most people use wallets | Field research | Msg 30 Jul; HANDOVER 01 | Payday collection CURRENT; ceiling CONFLICT (Section 18) |
| 31 Jul | Employer contacting "not viable, no one would want to do it with us"; payday auto-pull, salary pattern engine, credit-alert listener, title fetch, one payslip photo (commit 6052124); suite 60 unit / 352 integration | | Msg 31 Jul; Mem new-laptop-environment | Engines CURRENT (D10) |

## August 2026

| Date | Event and change | Why | Source | Relevance now |
|---|---|---|---|---|
| 2 Aug | Data strategy: one-time precise home pin plus server-side IP geolocation; no background location; Accessibility screen-reading of bank apps REJECTED; balance and payday signal from the pull attempt, credit alerts, Raast; incentivised volunteering beats scraping; grey telemetry only invisible and defensive | Google and SECP bans; trust moat | Mems device-data-and-collection-signals, nano-lending-crackdown-lessons | CURRENT policy |
| 2 Aug | Growth approved: TASDEEQ two-way membership, organiser incentives on value not recruitment depth, formal on-ramp, remittance committees (never hold FX), employer committees later; liked: gold, credit-builder, seasonal Islamic, merchant-sponsored, white-label, aggregate insights, BISP | | Mem growth-and-expansion-strategy | CURRENT as ideas |
| 2 Aug | Brand v2: pine and gold "Evergreen and Saved Gold", Register logo (ten tally marks in a ring), score renamed Sakh; reverses gold-and-white | Gold reads greedy; pine = trust | Mem halqa-brand-and-model-facts | SUPERSEDED (lime since 12 Aug in app, confirmed 23 Sep; Sakh dropped 13 Aug) |
| 2 to 3 Aug | ROSCA literature (Khan 2013, Kamran 2017 and 2018, Mehmood 2018, FII): committees filter on income regularity, not level; stop claiming "the poorest" | Accuracy | Mem rosca-literature-evidence | CURRENT |
| 4 Aug | "these round boxes are found in all ai slop remove them completely" | AI look | Msg 4 Aug | CURRENT rule |
| 6 Aug | Committee Dossier: UBL Kommittee autopsy, 21 attempts, 8 killers, 4 models that work, India's Chit Funds Act | | Mem committee-dossier-research | CURRENT research |
| 9 Aug | Discipline layer: no cancel button (5 rung exit ladder), restitution arithmetic, PIN plus NADRA face at join, 24 hour confirmation window, affordability caps (33 per cent of income, 40 per cent with debt service, forward exposure 4x income, concurrency limits). Corrections: leniency tier killed ("no i dont want too much leniency"); topology is a star (host knows everyone), Tier 1 only | Chairman's rules | Mem exit-consent-trust-rules; HANDOVER 04 | Mostly CURRENT (deck v3 carries 24h window, affordability, exits) |
| 9 Aug | HANDOVER folder written (12 files) | "everything for a new chat, no memory assumed" | Mem handover-folder | HISTORICAL |
| 11 Aug | Chairman's brief: cancellation rules, collection on the 10th, instalment held in a CDC trust for 5 to 7 days, Raast/Easypaisa/JazzCash, chat and phone numbers, streaks, net-off option, PIN and face, 24h buffer, time value optional, credit-weighted eligibility in open circles, auction option in known circles, publish a defaulter's live house location (REFUSED), buy-turn rules; build plan ten subsystems; Hyper max 60 days; ownership at cycle end | | Msg 11 Aug; Mem build-plan-ten-subsystems | Build plan HISTORICAL |
| 11 to 12 Aug | Product Architecture pitchbook (golden black theme); "codish and amateur", "cheesy"; formal headings "Past attempts at formalising ROSCAs" | | Mem document-formatting-rules | Golden black SUPERSEDED |
| 12 Aug | Hyper directions in stages: name HYPER COMMITTEES; up to 400 members; pots under Rs 100,000; several collect daily; members invisible; fees about 45 per cent more; about 25 then 30 per cent default design; phone numbers shown in known and unknown circles, not Hyper; Raast and a balance sheet for misses; bids and premiums to Halqa; "400 people fixed, 60 days fixed"; daily-income job proof for 2 months or a vault equal to the pot for 60 days; "we pay 7 members daily"; "max should be PKR 15,000"; asset committees split known and unknown | | Msgs 12 Aug | SUPERSEDED by 23 Sep options |
| 12 Aug | App theme "lime green and white, not dark colors"; must look like the Pakistani cash apps | | Msg 12 Aug | CURRENT |
| 13 Aug | Fee directive: Rs 100 flat per instalment except Hyper (percentage); loss formulas L(k)=c(T-k)-phi*k etc.; algorithm engines shipped (exposure score R, time value, rewards ladder, exit ladder); "twelve" corrected to 120; 3D models red loss, yellow balanced, green profit; remove Sakh, use "credit score" | | Mems fee-structure-and-loss-math, algorithm-engines-shipped | Formulas HISTORICAL; fee SUPERSEDED |
| 14 Aug | Known committee = a social product: ID plus mutual guarantee only, no salary slip, at most 3 committees; Hyper cap Rs 15,000; Hyper score and 3D model; Mahaana liquidity slide; customisation slide; app asks (join committee central and highlighted, code or WhatsApp join, auto-debit not removable, real card image, salary account plus preference order, asset circles by application) | | Msgs 14 Aug | Known as "social product" CURRENT in spirit; the "3 committees" limit appears later as "algorithm after 3" (19 Aug) |
| 15 Aug | "first discuss it then implement AFTER MY APPROVAL"; list of 1,000 changes; LSE Generate research; use Gamma | | Msgs 15 Aug | HISTORICAL |
| 17 Aug | Session d2da94bb starts with a master context request; production DB had 56 users, 48 committees, 64 payments; new tables empty; GitHub blocked by ISP-level TLS filtering; 6 commits stranded; CI never ran | | Msg 17 Aug (pasted status) | Deploy state UNCERTAIN since |
| 17 Aug | Master deck 66 then 68 slides (pine/gold); corrections: "credit score" not Sakh; Hyper "7 a day" not 6.7; no dashes; plain headings; HPA under P2P (Halqa initiates RTP payee = member; unverified); appliance chip locking | "20 percent density" | Mem master-deck-2026-08-17 | SUPERSEDED deck |
| 18 Aug | LSE Generate / Glob Innovation pitch; "dont mention 17 August and i am 16"; black ground; "50 PKR is the fees"; chairman's own Google Slides edited; app verdict "NOTHING HAS BEEN IMPLEMENTED ... SAME 90 PERCENT"; orphan pages found (market, terminal, about, settings) | | Msgs 18 Aug; Mem six-hundred-task-directive | Verify reachability before claiming |
| 19 Aug | Hyper agreed spec (30 days, Rs 500 a day, Rs 15,000 pot, 7 a day, 210 members, opening auction, salary slip plus daily work or vault; bid cap at 48 per cent APR, Rs 276 on day 1) then "also 60 days on hyper"; affordability: consider duration and members, be lenient, run the algorithm beyond 3 committees, use the circle rating; remove profit engine and collateral from regular committees; JazzCash-style UI | | Mem hyper-agreed-spec; Msgs 19 Aug | SUPERSEDED (APR removed 22 Sep; options fixed 23 Sep) |
| 19 Aug | "remove crypto and gold" from the vault screen; "the theme and colour palettes are ours only" | | Msg 19 Aug | HISTORICAL |
| 20 Aug | "i know the extra money covers default, its our markup, make it 380 pkr instead" (context: a Hyper or fee figure; exact referent UNCERTAIN); 35 defects listed; remove safety fund and collateral; customisation and sign out in account; no restrictions on his own account | | Msg 20 Aug; DEFECTS file | HISTORICAL |
| 23 Aug | JazzCash app 5.6.7 ships "JazzCash Committee" (launched 13 Aug per SPIN IDG) | Competitor | Mem jazzcash-committee-launch | CURRENT threat |
| 24 to 29 Aug | App fix loops; "25 percent complete", "not even at 10 percent", "100 more pages", "buttons look very ai" | | Msgs | HISTORICAL |
| 30 Aug | Mentor meeting 3: he will sound out SECP informally and introduce TASDEEQ; seven questions; message him 15 Sep; contact TASDEEQ directly; think like a businessman; scale; sandbox as target. Same day: CDC cannot hold bike titles, "ok lets take a modaraba then" | | Mems akif-meeting-3-2026-08-30, asset-committee-modaraba-ijarah | Modaraba SUPERSEDED by bank asset financing (D13) |

## September 2026

| Date | Event and change | Why | Source | Relevance now |
|---|---|---|---|---|
| 15 Sep | Scheduled reminder to message the mentor and contact TASDEEQ | Commitment of 30 Aug | Session 38acb936 | Done (reply 22 Sep) |
| 17 Sep | Cost questions; build for 100,000 people now, about 10 million eventually; per-user fee | Mentor's questions | Msgs 17 Sep | Business model (25 Sep) CURRENT |
| 19 Sep | Fees Rs 100 to 500 per instalment (about Rs 500 at Rs 10,000 a month with more than 10 members); cost model Google Doc; formal writing, no puns | | Msgs 19 Sep; Mem formal-writing-no-puns | Fee now set by the bank (D5) |
| 22 Sep | JazzCash Committee alarm ("major warning"): admin wallet collects, admin pays out by hand, 3 to 12 contacts, MPIN, no exit until the end, chat, reminders | Competitor | Msg 22 Sep | CURRENT |
| 22 Sep | Mentor's message: the question is SECP or SBP; globally central banks; apply under the SBP Regulatory Sandbox; check JazzCash | | Mem akif-message-sbp-not-secp | Sandbox declined; bank route answers SBP |
| 22 Sep | Structural ruling: no member-to-member money for position; seat money only between member and Halqa; late seats rewarded in points and fee waivers; no APR anywhere; every circle hosted; cover through licensed takaful; auto-cover removed | Avoid SECP P2P definition and NBFC licence (Rs 100m + Rs 20m) | Mem no-member-to-member-position-money | SUPERSEDED in part by D9 (turn market member to member) |
| 22 Sep | Licensing clause verification; five live-product findings; "NO SANDBOX" | | Mem licensing-clause-verification | Verification CURRENT; sandbox decision CURRENT |
| 22 Sep | Target: operational for 100,000 users within two weeks (6 Oct); 214 item register | | Mem operational-scan-and-100k-target | Deadline overtaken by the bank route |
| 23 Sep | Takaful route C chosen ("ok i choose the licenced takaful route"); Hyper numbers settled into two options with contribution plus flat service fee; aggregator token mandates; "negative balance" rejected; bright green theme; recorder banned; 540 item register; UI sections A and B started | | Mems of 23 Sep | Hyper options CURRENT (D8); takaful now one of three bank options (D7) |
| 24 Sep | New model Opus 5.5; audit; "are we in legal trouble" = plan compliance; legal verification (partner switched to an EMI); 646 item register; prototype work paused for the mentor's document pack; decisions: income account, insurance stress case, father as director, Islamabad office | | Mems of 24 Sep | Mostly CURRENT; EMI partner REVERSED 25 Sep |
| 24 to 25 Sep | HALQA CORPORATE folder, then ALL HALQA superior folder; corporate document set; new document style | | Mem halqa-document-set, new-document-style | CURRENT home |
| 25 Sep | Safepay restated; points route A; business model rebuilt; legal findings; questions on Hyper reminder cost, payday autopull window, points for money, Daraz | | Mems of 25 Sep | See D4, D9 |
| 25 Sep | "never mind, your point system i understand is correct leave it"; business model unclear; remove people except counsel; software house; ads for points; Google Ads blitz; Hyper fee Rs 15 both options; pay on behalf | | Msgs 25 Sep | PAUSED 28 Sep |
| 26 Sep | "can we not float the money as soon as it arrives in salary account until payment date on the 10th i think" (answer: no, s.84) | | Msg 26 Sep | Replaced by D12 |
| 27 Sep | Mentor meeting 4 (Sunday): s.84 breach; SBP regulation needed; partner with a Pakistani bank; bank meeting near 10 Oct | | Mem akif-meeting-4-outcome-bank-partner | CURRENT direction |
| 28 Sep | Bank route adopted; Oraan research (two passes); D1 to D16; decks in lime; visual direction; work halted | | Mems of 28 Sep | CURRENT |
| 29 Sep | 81 slide deck; no names rule; pitch research; presentation v1 (15), v2 (21), v3 (21, fewer words, proper diagrams, "Known"); Raqami research and plan; master context | | This session | CURRENT |
| 29 Sep (evening) | Raqami pursued in parallel ("i will try to work with either"); Raqami deck built in the Mashreq v3 style with Islamic adaptations | Second partner option | Msg 29 Sep | CURRENT |
| 30 Sep | Decks v4 and v5 (Mashreq), v2 and v3 (Raqami); technical-only fixed cost | | Section 2 | SUPERSEDED by v6 and v4 |
| 30 Sep (evening) | The chairman edited Mashreq v5 himself in Google Slides; Mashreq v6 and Raqami v4 built from his copy with logos, icon tiles, the person icon and black text | | Msg 30 Sep evening | SUPERSEDED the same evening |
| 5 Oct | Work register verified and extended in ten passes, divided into phases of 100 items for Claude Pro usage windows; PSP service fee set on wallet and card payments only | | Msg 5 Oct | CURRENT |
| 30 Sep (evening, second round) | Icon tiles rejected as informal; Mashreq v7 and Raqami v5 on the version 5 boxes with his edits and logos; fee Rs 85 (running cost plus Rs 50), PSP service fee 1.5 per cent, takaful or insurance fee named only | | Msg 30 Sep evening | CURRENT |

---

# 7. DECISIONS AND THEIR EVOLUTION

Each record: current decision; the versions before it; reason; date; evidence; status; whether it can still change.

## DL-01 Who holds the money (the architecture)

| Version | Dates | Content | Ended because |
|---|---|---|---|
| 1 Record-only | Jul to 23 Jul | Halqa never holds money; contributions move member to member over Raast and wallets; Halqa keeps the ledger. Hard constraints of 23 Jul: no vault, deposits, holdback, custody or bank partner, ever. | Mentor's direction of 23 Jul |
| 2 Trustee savings | 23 Jul to 28 Jul | Vault revived through a licensed AMC with CDC as trustee, so Halqa still holds nothing | Hardened into version 3 |
| 3 No bank ever | 28 Jul to 27 Sep | "Halqa will never use or need a bank partner"; second stage via CDC plus digital AMC under an SECP distributor registration; payments via an aggregator merchant agreement; from 25 Sep Safepay with split settlement straight to the collector | Mentor's verdict 27 Sep: s.84 breach (money for the CDC, float earned) and SBP regulation needed |
| 4 PARTNER BANK (CURRENT) | 28 Sep | A licensed Pakistani bank holds and moves all money under its licence; every member banks with it (D2); Halqa is the system and the bank's service provider; Halqa takes no licence; "relax the tight loopholes" (split settlement, member-to-member settlement contortions no longer govern) | |

Evidence: memories model-constraints-record-only, akif-meeting-2-guidance, no-bank-partner-directive, akif-meeting-4-outcome-bank-partner, bank-decisions-2026-09-28. Status: CURRENT. Can change: yes, but only on a new mentor or bank outcome.

## DL-02 Regulatory path

| Version | Dates | Content |
|---|---|---|
| Sandbox as target | 23 Jul to 22 Sep | SECP sandbox (Jul, Aug); mentor on 22 Sep: the question is SBP versus SECP, apply under the SBP Regulatory Sandbox |
| No sandbox | 22 Sep | Chairman: no regulatory approval sought, no sandbox; operate under general law over a licensed rail on a merchant agreement |
| Through the bank (CURRENT) | 28 Sep | "No matter what we do" such a system needs SBP regulation; it arrives through the partner bank: Halqa assessed as the bank's service provider under the SBP outsourcing framework (with audit rights for the bank and SBP); the product goes to SBP through the bank for approval or notice |

Status: CURRENT. The sandbox is not pursued. UNCERTAIN whether SBP will treat the product as needing approval or notice only; the bank decides the filing.

## DL-03 Partner bank

Mashreq Bank Pakistan chosen 28 Sep (D1). The chairman believed the mentor had Mashreq in mind (its CEO named by the chairman). Raqami Islamic Digital Bank researched 29 Sep as a possible second bank or fallback; relationship to Mashreq (parallel or fallback, exclusivity) is OPEN. Status: CURRENT, nothing signed.

## DL-04 Collection methods and payment partner

| Version | Dates | Content | Ended because |
|---|---|---|---|
| Aggregator merchant agreement | Jul to Aug | PayFast or Safepay merchant agreement (not a licence); Raast preferred (near 0 per cent) | |
| Collection ladder | 23 Sep | Tier 1 Raast Request to Pay (one tap), tier 2 aggregator token mandate (Hyper only), tier 3 manual; never store the token; never a negative balance (arrears against the round) | 24 Sep: RTP settles to the merchant who sends it, so Halqa may send RTP only for its own fee |
| EMI partner | 24 Sep | Partner must be an EMI (NayaPay, SadaPay) because a PSP cannot hold money | Chairman reversed it 25 Sep ("safepay has all of the payment options and autodebit ... not sadapay"), calling the regression memory loss |
| Safepay | 25 Sep | Safepay (licensed PSP, 21 Apr 2025) collects all payments; auto debit = saved card; each payment split: contribution to the collector, takaful to the operator, fee to Halqa; payday window: charge on the learned payday, then once a day up to 5 days | Bank route |
| Bank plus PSP (CURRENT) | 28 Sep (D3) | Keep tiers 1 to 3 and the PSP/PSO (Safepay etc.); ADD the bank's direct debit mandate; Safepay's role to be re-decided once the bank's capabilities are known | |

Status: CURRENT (D3). Never propose an EMI as partner again.

## DL-05 Fees and who is paid

| Version | Dates | Content |
|---|---|---|
| Rs 0 to members | Jul to 12 Aug | Adviser: low or zero fees or it dies; revenue from late fees, marketplace share, fill fee, merchant commission, data |
| Rs 300 ceiling | 30 Jul | At a Rs 20,000 instalment the member must never pay more than Rs 300 to make a payment |
| Rs 100 flat | 13 Aug | Rs 100 per instalment on all but Hyper; Hyper a percentage (15 per cent); analysis: Rs 100 is break-even on open circles, Rs 275 recommended for open circles (decision was left open) |
| Rs 50 in the LSE deck | 18 Aug | "member pays just 50 pkr on each instalment" (competition deck) |
| Rs 100 to 500 | 19 Sep | Grows with members and instalment; about Rs 500 at Rs 10,000 a month with more than 10 members |
| Seat-graded fee to Halqa | 22 Sep | Early seats pay Halqa a fee graded by forward liability; late seats get points and waivers |
| Flat uniform fee (Hyper) | 23 Sep | A fee graded by collection day reads as interest; keep it flat across the roster |
| Bank takes the fee (CURRENT) | 28 Sep (D5) | The bank collects the member fee as its income and shares income with Halqa; use that income to cut the member fee as far as possible |

Status: CURRENT = D5. OPEN: the fee level once the bank's terms are known; the Rs 300 ceiling versus the Rs 500 figure (Section 18).

## DL-06 Money for seat position

| Version | Dates | Content |
|---|---|---|
| Early fee to other members | Aug | Early-turn fee split to later members; time-value tilt crediting late seats; marketplace premium with 10 per cent to Halqa; Hyper bidding with a published APR (48 per cent cap, Rs 276 day 1) |
| Nothing between members | 22 Sep | Every member owes every other exactly c, n times; seat money only between a member and Halqa; no APR anywhere; words "loan, borrow, lend, interest, APR" banned in product copy |
| Points exception | 25 Sep | Members may pay each other Halqa points for a seat at prices they agree (route A) |
| Full turn market (CURRENT) | 28 Sep (D9) | Proper member-to-member buying and selling of turns "like before"; points buyable with money under the bank; D6: no Halqa credit in early seats |

Status: CURRENT = D9 with legal flags (P2P lending and Shariah questions for counsel). Bands still bind every trade (the buyer's band must permit the seat; swaps are symmetric).

## DL-07 Points

| Version | Dates | Content |
|---|---|---|
| Rewards ladder | 13 Aug | Streaks 3/6/12/18/24/36 rounds; +5 per cent a round capped +50 per cent on points only; score gain cap 40 a cycle; points never cash |
| Route A | 25 Sep | 60 points per on-time instalment, 100 per five in a row; last-third seats 2 points per rupee of fee, middle third 1; host 2,500; referral 1,000; 10 points = Rs 1 of Halqa fee; exchange fee Rs 500 or 5,000 points paid by the buyer; no buying points with money (fee credit only); no Daraz (Virtual Assets Act 2026 closed loop) |
| Bank route (CURRENT) | 28 Sep (D4, D9) | Balance profit as an end-of-circle reward at 1 point = Rs 1, redeemable for e-commerce goods; points buyable with money; collaboration with e-commerce and bank point systems |

Status: CURRENT = D4/D9 plus the 29 Sep late evening ruling: 1 point = Rs 1 everywhere; on-time points never more than 50 per cent of Halqa's own fee on that instalment. The 10 points = Rs 1 value is SUPERSEDED.

## DL-08 Hyper committee

| Version | Dates | Content |
|---|---|---|
| Brief | 11 to 12 Aug | Max 60 days; up to 400 members; pot under Rs 100,000 then under Rs 60,000; 45 per cent higher fees for 25 to 30 per cent default; members invisible; opening auction; daily-income proof or vault |
| Build plan final | 12 Aug | 400 members, 60 days, pot capped Rs 60,000; premium 15 per cent; 24 hour opening auction, locked after |
| Deck reference | 13 to 17 Aug | 400 members, 60 days, Rs 250 a day, Rs 15,000 pot cap, 15 per cent fee, 7 collect a day |
| Agreed spec | 19 Aug | 30 days, Rs 500 a day, Rs 15,000 pot, 7 a day, 210 members, bidding with 48 per cent APR cap; then "also 60 days on hyper" the same day |
| Two options (CURRENT) | 23 Sep | Option 1: 400 members, 50 days, Rs 450 a day (300 contribution + 150 fee), Rs 15,000 pot, 8 a day. Option 2: 390 members, 26 active days, Rs 500 a day (333.33 + 166.67), Rs 8,666.67 pot, 15 a day. Fee flat and uniform. |
| Fee change request | 25 Sep | Rs 15 fee on both options with more takaful (PAUSED 28 Sep) |
| Label | 28 Sep (D8) | Keep as it is; label EXPERIMENTAL |

| Fee confirmed | 29 Sep late evening | Rs 15 fee a day on both options; cover takes the rest; daily payment unchanged: Rs 450 = 300 + 135 cover + 15 fee; Rs 500 = 333.33 + 151.67 cover + 15 fee |

Status: CURRENT = 23 Sep structure with the 29 Sep late evening fee (Rs 15), experimental. The Rs 75 / Rs 83.33 fee of 25 Sep is SUPERSEDED.

## DL-09 Cover for defaults

| Version | Dates | Content |
|---|---|---|
| No platform cover | Aug archive view | Seat position is the collateral; balance-sheet guarantee killed eMoneyPool |
| Mentor | 23 Jul | Cover defaults on Halqa's balance sheet and insure with takaful (tension never resolved in August) |
| Cover facility | 11 Aug | Priced (r = 1.5q), capped, subrogated, reinsured by takaful |
| Removed | 22 Sep | Halqa never advances money; auto-cover removed |
| Takaful route C | 23 Sep | Licensed general takaful operator (Class 6) writes and prices; Halqa registers as a corporate insurance agent and earns commission; mandatory only on unknown committees (24 Sep) |
| Bank options | 28 Sep (D7) | The bank chooses: guarantee from its balance sheet, insurance (its own), or takaful. SUPERSEDED 29 Sep night |
| Takaful or insurance only (CURRENT) | 29 Sep night | No cover by Halqa of any kind and no bank guarantee; a licensed takaful or insurance operator, chosen by the bank, pays the members left short (USER: "HALQA COVER IS GONE, ONLY TAKAFUL OR INSURACNE, NO COVER BY HALQA") |

Pricing basis (24 Sep): stress case one unknown committee in five loses 20 per cent of members from the earliest turns; about 5.47 per cent of the instalment.

## DL-10 Seat bands and new-member quarantine

Bands (22 Jul): Bad <550 last about 3 seats and no marketplace buying; Decent 550 to 649 second half; Good 650 to 749 and Excellent 750+ any seat; hosting needs 700. New members in the last 3 turns until 2 clean circles plus verification (23 Jul). Forward-liability seat ceiling L(k) <= 2c for the rebuilding band, L(k) <= 7c for Decent (11 Aug, reproduces "position 5 of 12"). Made MANDATORY, no exception (D7, 28 Sep). Status: CURRENT.

## DL-11 Verification and KYC

Bank KYC (CNIC, NADRA biometric, due diligence) plus Halqa's engines (D10, 28 Sep): identity, income account, affordability, score. Income account rule (24 Sep): any account in the member's own name designated as the one income arrives in; mandatory for unknown committees and Hyper; Hyper needs at least Rs 1,000 credited on at least 5 days a week. Levels: known 1, unknown 2, Hyper 3. NADRA face match once at onboarding and on risk events; never store raw images (9 Aug). Status: CURRENT.

## DL-12 Affordability

9 Aug: sum of contributions within 33 per cent of net monthly income and within 40 per cent with debt service (SBP DBR cap, BPRD CL 29 of 2021); forward exposure within 4x income; history unlocks seats, never the money cap. 19 Aug chairman: consider duration and member count, be as lenient as possible, run the algorithm when a member goes beyond 3 committees, use the circle rating. 24 Sep: affordability algorithm for unknown circles only. Deck v3 (29 Sep): within a third of income, 40 per cent with other loans, from the fourth circle total still owed within a year of income. Status: CURRENT as in deck v3; the 33 per cent cap was a proposal awaiting sign-off in August.

## DL-13 Exit

No cancel button; five rungs (window withdrawal, substitution, group-approved exit, hardship exit, abandonment); restitution at cycle end (each member who collected before the exit owes the leaver exactly c); group vote 72 h, majority of votes cast, 50 per cent quorum, no quorum escalates to Halqa, host has no veto; fine 70 per cent to members, 30 per cent platform (9 Aug). 24 hour confirmation window before the circle starts. Status: CURRENT in design; exit fine level and split were proposals.

## DL-14 Savings, vault and float

Vault scrapped (Jul) then revived through AMC plus CDC (23 Jul) then Stage 2 (28 Jul) then held as live code (SIMPLE_MODE false) then ruled a s.84 breach by the mentor (27 Sep). CURRENT (D12): the bank's own short-term savings (about 7 days between salary and the due date); for Mashreq the Islamic Current Profit Account (mudaraba, profit on daily closing balance, up to 5 per cent) and Islamic Savings (up to 11.5 per cent); profit returned to members as points (D4). Halqa never floats member money (answer of 26 Sep).

## DL-15 Asset committees

Retention of title with a security trustee (11 Aug) then modaraba ijarah muntahia bittamleek because CDC cannot hold bike titles (30 Aug; candidates Orix, First Habib, Allied Rental, First Punjab modarabas; referral 2 to 4 per cent, merchant 1 to 3 per cent) then removed from the licence analysis on 22 Sep ("remove the asset ones for now") then bank asset financing (D13, 28 Sep): ijarah for motorcycles and machines, or a modaraba if the bank prefers. Status: CURRENT = D13.

## DL-16 Credit reporting and bureaus

eCIB closed to non-FIs; TASDEEQ and DataCheck by negotiated contract (22 Jul); TASDEEQ as an alternative-data contributor (2 Aug); consent must be the member's own electronic instruction on a separate screen (CBA s.19(1)(b), s.32; no power of attorney route because ETO s.31(1)(b)) (22 Sep); credit reporting from day 1, non-negotiable, via TASDEEQ or the bank, bank decides (D11, 28 Sep). Mashreq and Oraan Financial Services are TASDEEQ members (28 Sep). Status: CURRENT = D11.

## DL-17 UAE members and remittance

Remittance committees approved on 2 Aug (never hold FX, licensed rail only); D14 (28 Sep): UAE members through Mashreq's non resident accounts. Raqami onboards residents only (29 Sep), so UAE family circles do not fit Raqami today. Status: CURRENT for Mashreq.

## DL-18 Brand and visual theme

Gold and white (20 Jul) then pine and gold with the Register logo (2 Aug) then golden black for documents (11 Aug) then lime green and white for the app (12 Aug) then bright green lime ramp everywhere, pine retired (23 Sep) then lime not dark green in decks, fewer tables, more visuals (28 Sep) then proper exhibits without icons or badges (29 Sep). Documents for companies: black and white, lime logo top right only (25 Sep). Status: CURRENT = lime ramp.

## DL-19 Name of the score

"Sakh" (2 Aug) dropped for "credit score" (13 Aug, confirmed 17 Aug). Status: CURRENT = "credit score".

## DL-20 Document style

See Section 16. Current rules date from 11 Aug, 19 Sep, 25 Sep, 28 Sep and 29 Sep.

## DL-21 Committee type taxonomy

Four structural families (Aug) then seven types in the business model of 25 Sep (family, office, market, unknown, large unknown, Hyper option 1 and 2, plus asset) then eight columns in deck v2 (Family, Office, Market, Unknown, Large unknown, Asset, UAE family, Hyper) then six types (29 Sep): Known, Unknown, Large unknown, Asset, UAE family, Hyper. Status: CURRENT = six types.

## DL-22 Pilot

Six month pilot of about 1,000 members (v1 deck and 81 slide deck, 29 Sep morning) then ONE MONTH live with about 1,000 members, known circles, up to 100 circles, after about 8 weeks of agreement, approvals and connection (29 Sep). Status: CURRENT = one month.

## DL-23 Company formation

Private limited; father as director (the chairman is a minor); two directors; directors hold shares; registered office Islamabad (24 Sep). Status: CURRENT plan; execution UNCERTAIN.

## DL-24 Data and device policy

Volunteered, purpose-bound, minimal; no contacts, gallery, READ_SMS, call log, background location or Accessibility screen-reading; one-time home pin plus IP geolocation; credit-alert listener only with four stated properties (notification access not SMS, opt-in, on-device parse, aggregates only); no public default flag; no address publication; no sale of intent-data lead lists (Goal Direct-Pay instead). Dates 2 Aug and 12 Aug. Status: CURRENT.

## DL-25 Recovery

Legal instruments: weekly e-signed undertaking (ten clauses) and mutual guarantee, never to Halqa; ordinary civil suit on the undertaking; summary suit (CPC Order XXXVII r.2(1)) only on a guarantee cheque; s.489-F PPC only on counsel's advice; never claim Halqa can jail defaulters. Recovery ladder as in deck v3. Status: CURRENT.

## DL-26 Organiser (host) incentives

Reward value, never recruitment depth (multi-level = illegal pyramid): completion bounty, single-level revenue share, verified organiser status, fee waivers, host points 2,500 per clean circle (2 Aug, 25 Sep). Status: CURRENT.

## DL-27 Known circles: leniency and authenticity

Leniency tier "Apna Halqa" proposed and killed (9 Aug: "no i dont want too much leniency, there will still be autodebit and insurance"). Authenticity: detect whether the host knows each member (spoke integrity, Tier 1 only), awaiting approval since 9 Aug. Known circles in deck v3 need level 1 checks only because the group knows its members. Status: detection design OPEN.

## DL-28 Presentation strategy

One deck for everything (28 Sep: "1 slide deck for everything", not two decks pasted together) then a separate 81 slide reference plus a presentable 21 slide deck for an audience that "knows nothing" (29 Sep). Status: CURRENT.

## DL-29 Due date

The 10th (11 Aug brief; 26 Sep "the 10th i think, i dont remember") versus the 8th (D12, 28 Sep). Status: CURRENT = the 8th, confirmed by the chairman 29 Sep late evening.

---

# 8. CORRECTIONS

Format: previous information, corrected information, date, source. The corrected version is the one to use.

## 8.1 Corrections made by the chairman

| Previous | Corrected | Date | Source |
|---|---|---|---|
| Age 17 in project records | "i am 16" (said while the LSE Generate deck was built), then "17" | 18 Aug; 29 Sep | Final: 17 (USER, 29 Sep late evening) |
| Surname "Amjed" on decks | "Kayani" | 29 Sep | USER: "17 Kayani" |
| Hyper fee Rs 75 / Rs 83.33 (25 Sep) | Rs 15 a day, cover Rs 135 / Rs 151.67 | 29 Sep | USER |
| 10 points = Rs 1 of fee | 1 point = Rs 1 everywhere; on-time points capped at 50 per cent of Halqa's own fee | 29 Sep | USER |
| Score called "Sakh" | "credit score" ("remove SAKH btw, credit score is fine"; "its credit score not sakh") | 13 and 17 Aug | Msgs |
| Hyper pays "6.7 a day" | "7 people", seven a day | 17 Aug | Msg |
| Hyper numbers built as 30 days / 210 members | "we agreed, fixed 15000 and 500 daily and 7 members, salary slip check and daily job or min vault balance, and buying turn across the 60 day, bid essentially" | 19 Aug | Msg |
| App showed Hyper at Rs 30,000 and 480 members | Should match the presentation (Rs 15,000) | 19 Aug | Msg |
| Hyper "pot 25k, daily 250" (his own message) | "wait, sorry, i am dumb, 400 people, 60 days, 345 pkr daily, pot is 15k"; then "400 members, 50 days, Rs 300 daily ... no safety margin, just keep the ones which i said"; final: two options of 23 Sep | 23 Sep | Msgs |
| Payment partner switched to an EMI (NayaPay or SadaPay) on 24 Sep | Safepay, a licensed PSP, "not sadapay"; called the switch memory loss | 25 Sep | Msg; Mem payment-partner-safepay |
| "No legal trouble because no money has moved" | Answer whether the PLAN is lawful, per design part | 24 Sep | Mem legal-trouble-means-plan-compliance |
| Research said negatives remained | "check again, dumbass, we fixed all the negatives ... early FEE GOES TO US, VAULT IS TRUSTEE, APR SCRAPPED, DEPOSITS WITH YIELD VIA TRUSTEE AND AMC" | 22 Sep | Msgs 22 Sep |
| Map request read as a corporate hierarchy | "i know that the chart i shared is a corporate hierarchy chart my mistake, but something like that": an interconnected image of all systems, like an organic chemistry reaction map | 22 Sep | Msgs |
| Points design changed by Claude | "never mind, your point system i understand is correct leave it" | 25 Sep | Msg |
| Leniency tier for known circles | "no i dont want too much leniency, there will still be autodebit and insurance. i just need a way that we can detect whether they know this person" | 9 Aug | Msg |
| Authenticity test checked that all members know each other | "the idea is that the host knows everyone, and this is only for tier 1 committees" | 9 Aug | HANDOVER 04 |
| Employer verification by contacting employers | "not viable, no one would want to do it with us" | 31 Jul | Msg |
| Informal tone "WE DONT HOLD money" | Formal-human style | 30 Jul | Msg |
| Black page reports | "just normal white page with black text" (28 Jul); then golden black (11 Aug); then black and white with the lime logo (25 Sep) | various | Msgs |
| Pine or dark green decks | Lime green | 28 Sep | Msg |
| "Mutual Benefit for Mashreq" | "Mutual Benefit" | 29 Sep | Msg |
| Family, Office and Market as separate types | "Known" | 29 Sep | Msg |
| Mentor and others named in decks | No names | 29 Sep | Msg |
| Pilot of six months | One month | 29 Sep | Msg |
| Presentation diagrams (icons, rings, badges) | "beautiful and proper", not "ai slop" | 29 Sep | Msg |
| Presentation texts not his | "the texts are not mine, i told u to specially only put mine where i put them in the google slide" | 18 Aug | Msg |
| LSE deck wording | Specific replacements: "only real digital committee provider in Pakistan and globally"; "A 4 trillion market"; "member pays just 50 PKR on each instalment"; remove "weeks not years", "the honest challenge", "that's whole legal steady" | 18 Aug | Msg |

## 8.2 Corrections found by verification (Claude or sources)

| Previous | Corrected | Date | Source |
|---|---|---|---|
| "twelve members walking on day fifty" in the Hyper slide | 120 members (the 30 per cent design rate) | 13 Aug | Mem algorithm-engines-shipped |
| Feature register section A = shipped | Several pages were built but unreachable (market, terminal, about, settings) | 18 Aug | Mem six-hundred-task-directive |
| "Vault stripped from the UI via SIMPLE_MODE" | SIMPLE_MODE = false; the investment layer is live | 18 Aug, 22 Sep | Mems |
| 20-person association rule cited as Companies Act s.509 | s.9(1); s.509 is repeal and savings | 22 Sep | Mem licensing-clause-verification |
| Trusts for circles | ETO 2002 s.31(1)(c) excludes an express trust from electronic form; use contract | 22 Sep | same |
| Bureau consent by T&C checkbox or power of attorney | The member's own electronic instruction to the bureau, separate screen (CBA s.19(1)(b), s.32); POA excluded by ETO s.31(1)(b) | 22 Sep | same |
| Four PS&EFT quotations used US EFTA wording; s.30(2) "six items" | Pakistani text; s.30(2) has ten items | 24 Sep | Mem legal-verification-2026-09-24 |
| Tier 1 = Halqa-sent Raast RTP for contributions | RTP settles to the merchant who sends it; Halqa may RTP only its own fee | 24 Sep | same |
| Statutory duties (ss.30, 31, 36, 39, 41) owed by Halqa | They bind the financial institution or authorised party | 24 Sep | same |
| "Summary suit on the undertaking" | Summary suit only on bills of exchange, hundis, promissory notes (CPC O.XXXVII r.2(1)); undertaking = ordinary suit | 25 Sep | Mem legal-findings-2026-09-25 |
| CBA penalty for Halqa = s.26(2) | s.26(2) addresses bureaus; a user falls under s.34 (up to Rs 5m plus Rs 50,000 a day) | 25 Sep | same |
| P2P definition cut at "online medium" | Continues "or otherwise to the participants who have entered into an arrangement with that platform to lend or to borrow money" | 25 Sep | same |
| Break even 2,379 or "about 2,400"; Hyper nets Rs 1,320,855 / Rs 746,218 / Rs 549,855; Rs 12.60 a payment; Rs 1,815; Rs 1,338,000 | 2,572 ("about 2,600"); Hyper Rs 1,168,855 / Rs 669,154 later circles; see business model 25 Sep | 25 Sep | Mem business-model-2026-09-25 |
| Oraan "failing" | Not failing: gold grew about 75x in 7 months, bank licensing deal, Epic Angels funding July 2026 | Aug | Mem committee-dossier-research |
| JazzCash Committee mechanics unknown (22 Sep morning) | Rotates; 3 to 12 members from contacts; pot collected into the admin's wallet; admin pays out by hand; admin sets order; MPIN; no exit until the cycle ends; no partial payments; chat and reminders; fees unknown | 22 Sep | Msg (pasted search result) |
| TASDEEQ lists Oraan Tech | Only Oraan Financial Services (the NBFC) is listed; Oraan Tech is not | 28 Sep | Mem oraan-research-2026-09-28 |
| DIB guarantees or supervises Oraan | DIB was Oraan's banker and payout channel in 2021 (ImpactAlpha, 1 Oct 2021) only | 28 Sep | same |
| Deck used "Member Journey" | "From Signup to Completion" ("journey" banned) | 29 Sep | This session |
| Asaan account limit at Raqami | CONFLICT between the products page (Rs 3 million balance) and the FAQ (Rs 1 million) | 29 Sep | Web |

---

# 9. SUPERSEDED INFORMATION

Do not present any of these as current.

| Item | Old state | Superseded by | Date |
|---|---|---|---|
| Architecture | Record-only, no custody, no bank ever | Partner bank route | 28 Sep |
| No bank partner directive | "Halqa will never use or need a bank partner" | Bank route | 28 Sep |
| CDC trustee plus AMC vault, float earnings, held deposits with yield | Stage 2 savings | s.84 verdict; bank short-term savings (D12) | 27 to 28 Sep |
| Safepay split settlement as the governing constraint | Contribution straight to the collector, never through Halqa | Bank holds money; Safepay role to be re-decided | 28 Sep |
| EMI as partner | NayaPay or SadaPay | Safepay (25 Sep), then the bank (28 Sep) | 25 Sep |
| Collection tier 1 as Halqa-sent RTP | | Member-initiated or partner-initiated; now the bank's mandate | 24 Sep |
| Members pay Rs 0 permanently | HANDOVER standing rule 2 | Fees adopted; now bank-collected fee | 13 Aug onward |
| Rs 100 flat fee; Rs 50 LSE fee; Rs 100 to 500; seat-graded fee | | D5 | 28 Sep |
| Early fee to members; time-value tilt; marketplace premium with 10 per cent; Hyper APR cap of 48 per cent | | 22 Sep ruling; then D9 | 22 and 28 Sep |
| Hyper specs of 11, 12, 13, 17 and 19 Aug (60 days / Rs 60,000 cap / 15 per cent premium; Rs 250 a day; 30 days / 210 members / 48 per cent APR) | | Two options of 23 Sep | 23 Sep |
| Cover facility advancing money; auto-cover | | Removed 22 Sep; takaful route C 23 Sep; bank options D7 | 22 to 28 Sep |
| Asset committee with a CDC security trustee | | Modaraba ijarah (30 Aug), then bank asset financing (D13) | 28 Sep |
| Stage tags FUNCTIONAL / LICENCE / BANK PARTNER / LICENCE+BANK | | FUNCTIONAL / BUILD / GATE-2 / STAGE-2 (28 Jul); the bank base case returns 28 Sep, tags not restated since | 28 Jul, 28 Sep |
| Brand gold and white | | Pine and gold (2 Aug), then lime | 2 Aug, 12 Aug, 23 Sep |
| Brand pine and gold, Register logo wordmark "THE REGISTER", Sakh | | Lime; recorder framing banned; credit score | 13 Aug, 23 Sep |
| Golden black document theme | | Black and white with lime logo | 25 Sep |
| Report sets of July and 2 Aug | | Later sets; corporate set 25 Sep | Aug to Sep |
| Master deck 17 Aug (66/68 slides, pine/gold) | | 25 Sep master deck (51 slides), then Complete Position 28 and 29 Sep | 25 to 29 Sep |
| Master deck 25 Sep (51 slides) | | Complete Position 43 slides (28 Sep) | 28 Sep |
| Complete Position 43 slides (28 Sep) | | 81 slide edition (29 Sep); 43 kept beside it | 29 Sep |
| Mashreq pitch 21 slides in `08` (28 Sep) | | Presentation for Mashreq v1, v2, v3 (29 Sep) | 29 Sep |
| Presentation for Mashreq v1 (15 slides, six month pilot, five requests) | | v2 then v3 | 29 Sep |
| Presentation for Mashreq v2 (21 slides, 2,595 words, icons) | | v3 | 29 Sep |
| Work registers of 214, 540, 646 items | | 665 items (25 Sep), then 1,039 (28 Sep) | 23 to 28 Sep |
| Work register of 28 Sep (1,039 items, 36 pages) | | Work register of 5 Oct (10,402 items, 102 phases); old PDF in `07 Internal\Superseded` | 5 Oct |
| Statutory Position (22, 23, 24 Sep revisions), Legal Verification (24 Sep), Asset Committee Structure, Turn Exchange Lawful Options | | Legal Position HQ-LG-01, HQ-CP-01, HQ-CP-04 (25 Sep), archived in `docs\archive\superseded 2026-09-25\` | 25 Sep |
| Business model numbers before 25 Sep | | 25 Sep model | 25 Sep |
| 25 Sep drafts: message to the mentor, email to Safepay | Pre-bank position (split settlement, takaful agency) | Bank route | 28 Sep |
| "Oraan" Google Doc HQ-RS-01 first edition | | "Oraan Research" (28 Sep evening, built on the chairman's own edits) | 28 Sep |
| Oraan Research Arial copy; Partner Bank Proposition Arial copy | | Calibri versions | 28 Sep |
| Point value 10 points = Rs 1 as the only value | | D4 adds 1 point = Rs 1 for the balance reward (conflict open) | 28 Sep |
| Points closed loop, no money, no Daraz | | Points buyable with money and redeemable for e-commerce as the bank's product | 28 Sep |
| Pilot six months | | One month | 29 Sep |
| Eight committee types | | Six (Known merges Family, Office, Market) | 29 Sep |
| Deadline: operational for 100,000 users by 6 Oct | | Overtaken by the document pack (24 Sep) and the bank route (28 Sep); not formally withdrawn | UNCERTAIN |
| Target "SECP sandbox" | | No sandbox (22 Sep); regulation via the bank (28 Sep) | 22 and 28 Sep |
| HANDOVER 10 next actions (Gate 1, Gate 2 merchant agreement, SECP first clean actor) | | Bank route next steps (Section 1.6) | 28 Sep |

---

# 10. REJECTED OR ABANDONED IDEAS

Do not suggest these again as if open. "Reconsider?" says whether there is any reason to.

| Idea | Why it was considered | Why rejected | Replaced by | Reconsider? |
|---|---|---|---|---|
| Android Accessibility Service to read bank-app balances ("screen service loophole") | Balance check without a bank partner | The predatory-app signature and fastest Play delisting; reads the whole screen; destroys the trust moat | Pull attempt as the balance check, credit-alert listener, Raast, now the bank's own data | No |
| Harvesting contacts, gallery, SMS, call log, background location | Recovery and scoring leverage | Banned by Google Play (31 May 2023) and SECP circulars 2023 to 2024 even with consent; named criminal pattern (400 apps banned, 20+ arrests) | Volunteered data with rewards | No |
| Publishing a defaulter's live house location to the circle (11 Aug brief) | Deterrence | Nano-lending playbook; Google bans it; finished headline | Notice consent, evidence pack, status not address | No |
| Public default flag | Deterrence | Rhymes with loan-app shaming | Internal flag only | No |
| Selling consented intent-data lead lists (adviser idea, 20 Jul) | Revenue | "Sells poor people's dreams" headline | Goal Direct-Pay (merchant commission, better deal for the member) | Only as Goal Direct-Pay |
| Mentioning kameti.pk | | "slop and random shit" | | Never |
| Auctions of chit-fund type, lucky committees, instalment holidays | Market practice | Interest in substance; lottery; dissolves the commitment | Bands, exit ladder | Hyper keeps an opening auction with bids paid to Halqa, no APR |
| Multi-level organiser compensation | Growth | Illegal pyramid | Value-based host rewards | No |
| Employers contacted for verification | Income proof | "not viable" (31 Jul) | Salary pattern engine, payslip photo | Employer channel later as a product |
| Negative balance on the member's profile | Aggregator token pattern | Makes the member owe Halqa; stored value shape | Arrears record against the round | No |
| Storing payment tokens; a corporate wallet in Halqa's name receiving member money | Auto-pull | Custody and s.84 | Aggregator or bank holds tokens | No |
| EMI (NayaPay, SadaPay) as payment partner | 24 Sep legal reading | Chairman reversed it | Safepay, now the bank | No (chairman's order) |
| PayFast as partner in documents | | Chairman chose Safepay; never name PayFast as the partner | | No |
| Halqa floating salary money until the due date | Float income | s.84 deposit; about Rs 16 on Rs 10,000 for five days anyway | Bank short-term savings (D12) | No |
| Own EMI licence (Rs 200m) or NBFC licence (IFS Rs 100m plus P2P Rs 20m) | Custody or lending | Capital the chairman does not have; avoided by design | Bank's licence | No |
| Halqa balance-sheet default cover (mentor, 23 Jul) | Member safety | Halqa never advances money (22 Sep); a private company cannot be an insurer | Bank's choice of guarantee, insurance or takaful | The bank may choose its own guarantee |
| UBL-style interest-bearing recurring deposit | Bank precedent | Amputates the credit half, adds interest | | No |
| Leniency tier "Apna Halqa" | Known circles | Chairman: too much leniency | Detection that only tightens | No |
| Express trusts per circle | Protection | ETO s.31(1)(c) | Contract | No |
| CDC as security trustee for asset titles | Ownership at cycle end | CDC cannot hold bike titles | Modaraba, then bank financing | No |
| Ijarah as the asset instrument (rejected 11 Aug as a fiction) | | Cash flow did not fit | Later adopted in modaraba form (30 Aug) and now bank ijarah (D13) | Already reversed |
| Spin-to-win wheel with cash | Engagement | Ad-unlocked cash spin = lottery | Deterministic streak milestones | Only as recommended |
| Prize draw (PPC s.294-A) | Engagement | Publishing a lottery proposal is an offence | Off | Only with advice |
| Sandbox application | Mentor's advice 22 Sep | Chairman: "we dont want any sandbox" | Bank route | Only if the bank or SBP asks |
| Crypto and gold vault tiers | Savings | Chairman: "remove crypto and gold" (19 Aug) | Bank savings | No |
| "Halqa the recorder" slogan | Positioning | It belittles the company | Describe what Halqa charges for | No |
| Pine, gold, dark green, golden black | Earlier brand | Replaced by lime | Lime | No |
| Icons in circles, rings of numbered nodes, staircases, pastel cards, stat tiles, emoji, pills, dashed three-circle diagrams | Visual slides | "ai slop" (4 Aug, 28 Sep, 29 Sep) | Proper exhibits (Section 16) | No |
| Two decks pasted together | Coverage | "1 slide deck for everything" | One deck plus one presentable deck | No |
| Workflows and agents for the work | Speed | Chairman rejected repeatedly | Direct work | Only if he asks |
| Rotating the exposed DB password | Security | Chairman: "forget it" | Flag only | Only if he asks |
| Claiming Halqa can jail defaulters | Deterrence | Untrue | Civil remedies | No |
| Claiming Halqa serves "the poorest" or replaces formal finance | Positioning | Disprovable (Khan 2013) | "On-ramp to formal finance" | No |

---

# 11. OPEN QUESTIONS

## 11.1 Waiting on the chairman

| No. | Question | Raised | Notes |
|---|---|---|---|
| Q1 | ANSWERED 29 Sep late evening: 1 point = Rs 1 everywhere; on-time points never more than 50 per cent of Halqa's own fee | 28 Sep | AdMob still requires ad rewards to be non-transferable |
| Q2 | ANSWERED 29 Sep late evening: Rs 15 fee a day; cover Rs 135 / Rs 151.67; daily payment unchanged | 25 Sep | |
| Q3 | ANSWERED 29 Sep late evening: the 8th | 28 Sep | |
| Q4 | ANSWERED 29 Sep late evening: 100 per cent of the pot | 28 Sep | Counsel view on P2P still needed |
| Q5 | ANSWERED 29 Sep evening: parallel ("i will try to work with either, i dont care"); no exclusivity stated | 29 Sep | Closed |
| Q6 | ANSWERED 29 Sep late evening: "do whatever, i dont really care shariah or not, no labelling needed". The Raqami deck keeps only what an Islamic bank can offer, with no labels | 29 Sep | C10 closed |
| Q7 | Who introduces Halqa to Raqami, and when | 29 Sep | Open |
| Q8 | Raqami logo: taken from the annual report PDF already on disk instead of a new download; confirm this is acceptable | 29 Sep | Flagged |
| Q9 | ANSWERED 29 Sep late evening: move them to the superseded archive (never delete) | 29 Sep | |
| Q10 | ANSWERED 29 Sep late evening: 17; Kayani | 18 Aug / records | |
| Q11 | ANSWERED 29 Sep late evening ("yes"): names removed and both moved to Superseded | 29 Sep | |
| Q12 | Circle authenticity design for known circles (spoke integrity, Tier 1 only) | 9 Aug | Never approved |
| Q13 | Organiser guarantee: reproduce it or state that seat arithmetic replaces it | Aug | Now partly answered by bank cover options |
| Q14 | Proposed numbers never signed off: exit fine one instalment with 70/30 split; 33 per cent affordability cap; Tier 1 ceilings Rs 25,000 a month and Rs 300,000 pot | 9 Aug | |
| Q15 | Is the 6 October target (100,000 users) still live? | 22 Sep | Overtaken in practice |

## 11.2 Waiting on the bank (Mashreq)

- Which cover option: its own balance-sheet guarantee, its insurance, or takaful.
- Whether Mashreq or TASDEEQ reports credit (D11).
- The income share and the fee level (D5).
- Whether accounts and direct debit mandates can be opened inside the Halqa app by API.
- Whether the Islamic Current Profit Account can hold instalments and return profit as points (D4, request 5).
- The SBP path: approval or notice; outsourcing assessment of Halqa.
- Islamic window approval by its Shariah board.
- Pilot limits.
- UAE members through the non resident account (D14).
- Whether Safepay stays in the collection stack (D3).

## 11.3 Waiting on counsel (legal questions never resolved)

- Turns sold for money or points: P2P lending under S.R.O. 436(I)/2022 as amended; Shariah view.
- Points bought with money and redeemable outside Halqa: e-money, lawful only as the bank's product; the Virtual Assets Act 2026 closed-loop exclusion no longer applies.
- Seat-graded or flat service fee as "arranging credit".
- Compulsory cover on Hyper and CIA Regs 2020 reg 10(c) (no coercion).
- Bureau consent wording under the Credit Bureaus Act 2015.
- s.489-F PPC reach on a security cheque (disputed in the courts).
- Asset financing referral as "arranging credit".
- Undertaking and mutual guarantee texts: drafted, never reviewed by a lawyer.

## 11.4 Facts unknown or unverified

- Whether the company has been incorporated (no record).
- Whether the production migrations were applied (locality and jobTitle; salary verification; rewards, exits and personalisation) and what is deployed now.
- Whether the chairman contacted TASDEEQ directly (action of 30 Aug).
- JazzCash Committee fees.
- Mashreq's capabilities for API account opening and mandates.
- Raqami's profit rates (not published) and whether it can offer debit mandates or API debits.
- Whether "Mahaana Wealth" is the digital AMC the mentor meant on 23 Jul (never verified).
- The referent of "make it 380 pkr instead" (20 Aug).

---

# 12. IMPORTANT PEOPLE AND ORGANISATIONS

Names below are for continuity only. Never use private names in decks or documents (rule of 29 Sep).

## 12.1 People

| Person | Role and relevance | Key dates | Rule |
|---|---|---|---|
| Taha Amjed (also recorded as Taha Kayani) | Owner, "the chairman" | throughout | His name as presenter is fine |
| His father | To be company director (the chairman is a minor) | decided 24 Sep | Never mention family in documents |
| Mr Akif Saeed | Sitting Chairman of the SECP (ex-Commissioner Securities Market, ex-ADB, ex-American Express corporate banking). Mentor, not an investor. Meetings 23 Jul (two), 30 Aug, 27 Sep (Sunday); message 22 Sep; arranging a bank meeting near 10 Oct | Jul to Sep | Private. Never name in decks or documents; do not write "advised by" |
| Mr Shahid Kazi | Ex-Bank Alfalah SEVP, ex-Rozee CEO, microfinance bank director. His own attempt "Razq" failed on fees. Met 20 Jul | 20 Jul | Never name in decks |
| Local chachas and workers | Field input: trust, payday | 30 Jul | |
| Muhammad Hamayun Sajjad | CEO of Mashreq Bank Pakistan since Feb 2024 (public officer); the chairman named him on 28 Sep | 28 Sep | Leave out of decks unless asked |
| Fernando Morillo | Chairman of Mashreq Bank Pakistan (public) | 28 Sep | Leave out of decks |
| Umair Aijaz | CEO of Raqami (public) | 29 Sep | Leave out of decks |
| H.E. Abdullah Al-Mutairi | Chairman of Raqami (public) | 29 Sep | Leave out of decks |
| Mufti Muhammad Imran Ashraf Usmani | Chair of Raqami's Shariah Board (public) | 29 Sep | Leave out of decks |
| Halima Iqbal | CEO of Oraan Financial Services (public) | 28 Sep | Leave out of decks |
| Sidra Humaid | Private individual in the 2022 Facebook committee fraud (about Rs 420m, 117 committees) | 2022 | Never name; say "a 2022 committee fraud run through Facebook" |
| Khan (2013), Kamran (2017, 2018), Mehmood et al. (2018) | Academic authors | | Citations are fine |

## 12.2 Regulators and public bodies

| Body | Relevance |
|---|---|
| State Bank of Pakistan (SBP) | Regulates banks, payments (PS&EFT Act 2007), EMIs (2023 Regs), PSO/PSP (2014 Rules), outsourcing framework, Raast, Regulatory Sandbox (Guidelines May 2025; cohort 1 Aug 2025; 16 Sep 2026 clarification that completion is not approval), credit bureaus (CBA 2015), 40 per cent DBR cap (BPRD CL 29 of 2021), Fair Treatment of Consumers framework (Oct 2025), 2028 financial inclusion targets (75 per cent of adults with an account) |
| SECP | Companies Act 2017 (s.84 deposits, s.9(1), ss.153 to 154 directors), NBFC and P2P rules (S.R.O. 436(I)/2022, amended Nov 2025), insurance (Insurance Ordinance 2000, CIA Regs 2020), mutual fund distribution, nano-lending circulars 2023 to 2024 |
| PVARA | Virtual Assets Act 2026 (Act XIII of 2026, Gazette 5 Mar 2026): points redeemable outside a closed loop need a licence (Rs 200 to 300m capital; s.54(1) unlicensed = 5 years or Rs 50m) |
| FBR | NTN; ICT Tax on Services Ordinance 2001 for an Islamabad office |
| NADRA | CNIC verification (Verisys), Multi-Biometric Verification via the Nishan Pakistan portal; about Rs 20 to 50 a check (planning Rs 50) |
| Federal Shariat Court; 26th Constitutional Amendment | Riba to end by 1 January 2028 (Article 38(f)); FSC ruling 2022 |
| FIA | Arrests in the 2023 to 2025 loan-app crackdown |

## 12.3 Banks, bureaus and financial firms

| Organisation | Relevance | Facts (date checked) |
|---|---|---|
| Mashreq Bank Pakistan Limited | Target partner (D1) | DRB; restricted licence 19 Dec 2024; pilot 31 Jan 2025; Islamic window approval 29 Aug 2025; DRB licence 15 Sep 2025; commercial operations 16 Sep 2025; NEO launched Nov 2025; HY to 30 Jun 2026: deposits Rs 8,515m (Rs 1,319m at 31 Dec 2025), 350,000+ customers, no advances, net mark-up income Rs 596m, H1 loss Rs 4.7bn, accumulated losses Rs 16.2bn, NRP accounts 9,000+ holding Rs 265m; wholly owned by Mashreq Bank PSC; TASDEEQ member; products: NEO current account, Islamic Current Profit Account (mudaraba, daily closing balance, monthly, up to 5 per cent), Islamic Savings up to 11.5 per cent, NEO Savings up to 10 per cent, Mashreq Pakistan Account for non residents, PayPak and Mastercard debit cards, free transfers, account in 5 minutes; no takaful or financing listed in Pakistan (28 to 29 Sep) |
| Raqami Islamic Digital Bank Limited | Possible second bank | Section 15.6 |
| TASDEEQ | Private credit bureau; scale 200 to 600; members include Mashreq, Oraan Financial Services, JazzCash (Pvt) Ltd, Karandaaz, Easypaisa Bank, Digi Khata Financial Services; ingests non-financial alternative data |
| DataCheck | Second private bureau |
| eCIB | SBP bureau, closed to non-FIs |
| Safepay | Licensed PSP (full commercial licence 21 Apr 2025); cards, wallets, Raast; auto debit only on saved cards; published 2.9 per cent + Rs 30 cards, 1.5 per cent wallets and Raast, instant payouts 1.5 per cent, disputes Rs 3,000; custom pricing; target Rs 10 cap a debit |
| PayFast, NayaPay, SadaPay | Alternatives researched; never name as the partner |
| 1LINK | Switch carrying 1BILL payments; never holds money |
| Raast | SBP instant payment system; P2P free; P2M MDR 0 per cent at Bank Alfalah; RTP settles to the sender merchant; no silent pull |
| CDC, DCC | Trustees (vault design, retired) |
| Mahaana Wealth, Al Meezan | AMCs mapped for the retired vault |
| Orix, First Habib, Allied Rental, First Punjab modarabas | Asset committee candidates (30 Aug), none contracted |
| Pak-Qatar General Takaful, Salaam Takaful | General takaful candidates (Class 6), none contracted |
| EFU Life and EFU General window takaful | Raqami's takaful partner (Nov 2025) |
| Askari Bank | Raqami cash deposits at 750+ branches (Apr 2026) |
| Dubai Islamic Bank Pakistan | Oraan's banker and payout channel in 2021 only |
| Karandaaz | Grant to Oraan Tech (FIWC 2019 to 20, Gates Foundation funded); 2024 case study |
| UBL | "Kommittee" account: a recurring deposit, the category's clearest failure exhibit |
| Bank Alfalah | Raast P2M terms source |
| Kuwait Investment Authority, Enertech, Pak Kuwait Investment Company (PKIC) | Raqami's owners |
| VIS Credit Rating | Raqami AA / A1 |

## 12.4 Competitors and comparables

| Name | Country | Key facts |
|---|---|---|
| Oraan (Oraan Tech (Pvt) Ltd, CUIN 0122392, Aug 2018; Oraan Financial Services (Pvt) Ltd, NBFC IFS licensed 3 Jun 2024; ORAAN PTE. LTD., Singapore, UEN 201813537G, 20 Apr 2018) | Pakistan | Committees of 5 or 10 months; money into Oraan's own bank accounts as "Amanat" in a remunerative account, return kept by Oraan; payout net between the 11th and 18th; slot fees up to 21 per cent of the instalment a month for slot 1 of 10 (about 54 per cent APR nominal); guarantees payouts from its own balance sheet; Credolab device scoring; TASDEEQ pull; reports defaulters only; "600,000+ users" (accounts), only paying count ever published 10,000 (2021); seed US$3m (Sep 2021); Epic Angels 2021 and Jul 2026; gold product grew about 75x in 7 months; SECP sandbox 2021 for women-focused fund distribution; DIB payout channel 2021 |
| JazzCash Committee | Pakistan | Launched 13 Aug 2026 (SPIN IDG); app 5.6.7 on 23 Aug; admin's wallet collects, admin pays out by hand; 3 to 12 contacts; MPIN; no exit until the end; chat; fees unknown; JazzCash about 50m users |
| Easypaisa | Pakistan | Now a digital bank; UI reference |
| Digi Khata, Udhaar | Pakistan | Notebook apps with committee registers (asserted, not settled); Digi Khata cleared SBP sandbox cohort 1 |
| Money Fellows | Egypt | Launched 2016; profitable 2025; about 8.5m users (8m downloads, ~350k MAU); US$1.5bn processed; 2m+ circles; ~US$60m raised; <8 per cent of slots use its own capital; CBE sandbox; Banque Misr; 328 corporate partners |
| Hakbah | Saudi Arabia | Founded 2018; launched 2020 after SAMA approval; Series A Dec 2023; 500,000+ users (earlier reported 1.3m); 70 per cent aged 21 to 35; Visa cards |
| Esusu | United States | Founded 2018; ROSCA to rent reporting; US$1bn (Jan 2022, SoftBank VF2); US$1.2bn (Dec 2025, CNBC); 12m people |
| The Money Club | India | Founded 2016; about 200,000 users; about 17,000 clubs |
| Mapan | Indonesia | Village leader agents on 10 per cent / 5 per cent commission; GO-JEK acquisition 2017 |
| eMoneyPool, Yahoo Tanda, Braid, Puddle, StokFella, MyPaisaa, Chamasoft, Shriram, Margadarsi, KSFE, Saradha | Various | Graveyard and India evidence (Committee Dossier, HANDOVER 06) |
| Mission Asset Fund | United States | Circles average +168 credit points |

## 12.5 Other

- LSE Generate / Glob Innovation competition: the chairman registered (Aug); pitch built 18 Aug.
- Codebase Technologies, Garaj (Jazz cloud), Euronet: Raqami's technology partners.
- Vercel (team taha-s-project), Supabase (project lvxvncbflhlzsmvhgphq), GitHub (pushes blocked Aug), Sentry (not installed).

---

# 13. IMPORTANT FILES

Do not assume the newest-looking name is the newest content: the dates and status below govern.

## 13.1 Folder map

| Folder | Purpose |
|---|---|
| `C:\Users\admin\Desktop\ALL HALQA\` | Superior folder (25 Sep). Shortcuts: "Halqa App and Code" to `D:\HALQA SIGMA APP`; "Superseded Documents Archive" to `D:\HALQA SIGMA APP\docs\archive` |
| `...\ALL HALQA\HALQA CORPORATE\` | SINGLE HOME for current documents (subfolders 01 to 08) |
| `D:\HALQA SIGMA APP\` | Code (`halqa-api`, `halqa-web`), `docs\` (reports, generators, archive, legal PDFs), `HANDOVER\`, `.tools\` (portable Node 22, PostgreSQL 18.4 embedded binaries), `.data\postgres` |
| `D:\HALQA SIGMA APP\docs\generators\` | Generators: document pack (docgen.py, headings.py, cleanrules.py, charts3d.py, lawcite.py, build_*.py, m*_*.py, build_all.py, scan_all.py, verify_quotes.py, sync_corporate.py), maps, register, sources; `main_deck_2026-09-28.py` (43 slide deck); `complete_position_2026-09-29\` (d2_lib, d2_p1 to p7, d2_build, pres_build, pres2_build, pres3_build, render.ps1, pages.py, logos, shots2 with shoot.mjs, README) |
| `C:\Users\admin\.claude\projects\D--HALQA-SIGMA-APP\memory\` | Auto-loaded Claude memory (index MEMORY.md) |
| Session scratchpad `C:\Users\admin\AppData\Local\Temp\claude\D--HALQA-SIGMA-APP-HANDOVER\d2da94bb-...\scratchpad\` | TEMPORARY working copies (deck, research, raqami, icons, shots2, mc). Anything needed long term is copied to `docs\generators`. |
| Google Drive (My Drive) | Google Docs listed in 13.4; folder "Halqa Business Documents" (23 to 24 Sep versions) |

## 13.2 `HALQA CORPORATE` contents (29 Sep)

| Path | File | Date | Status and notes |
|---|---|---|---|
| 01 Presentation | Halqa Presentation for Mashreq 29 September 2026 (.pptx, .pdf) | 29 Sep 14:58 | CURRENT. Version 3, 21 slides, 1,773 words, speaker notes |
| 01 Presentation | Halqa Presentation for Raqami 29 September 2026 (.pptx, .pdf) | 29 Sep 20:49 | CURRENT. 21 slides, 1,856 words, Mashreq v3 style in Raqami purple, Islamic adaptations, speaker notes |
| 01 Presentation | Halqa Complete Position 29 September 2026 (.pptx, .pdf) | 29 Sep 10:52 | CURRENT reference, 81 slides; says six month pilot (out of date); icons |
| 01 Presentation | Halqa Complete Position (.pptx, .pdf) | 28 Sep 22:31 | HISTORICAL, 43 slides; contains names (the mentor on eight slides, the adviser, a fraud-case individual, Mashreq officers, "the chairman's father") |
| 01 Presentation\Superseded | Halqa Presentation for Mashreq 29 September 2026, version 2 | 29 Sep 13:40 | SUPERSEDED |
| 01 Presentation\Superseded | HALQA-MASTER-DECK-2026-09-25 (51 slides) | 25 Sep | SUPERSEDED |
| 02 Company Partnership Documents | Asset Committees (HQ-CP-01, 8 pp, modaraba), Auto Debit (HQ-CP-02, 13 pp), Business Model and Unit Costs (HQ-CP-03), Seat Exchange and Points (HQ-CP-04, 6 pp, route A), Default Prevention (HQ-CP-05), Complete Feature and Process List (HQ-CP-07), Hyper Committee (HQ-CP-08), Collection and Auto Debit Specification (HQ-CP-09) | 25 Sep | Latest on their topics but PRE-BANK (Safepay split settlement, no custody, modaraba, route A points); revise for the bank route |
| 03 Legal | Legal Position (HQ-LG-01, 17 pp) | 25 Sep | Pre-bank; citations verified 25 Sep |
| 03 Legal\Primary texts | Companies Act 2017; Corporate Insurance Agents Regulations 2020; Credit Bureaus Act 2015; Electronic Transactions Ordinance 2002; Insurance Ordinance 2000; ICT Tax on Services Ordinance 2001; PS&EFT Act 2007; SBP EMI Regulations 2023; SBP PSO/PSP Rules 2014; Summary Procedure Order XXXVII (Sindh Judicial Academy); Web Sources Read (HQ-LG-02) | 22 to 25 Sep | Primary texts, CURRENT |
| 04 Licence Documents | Registrations and Licences Required (HQ-LD-01); Incorporation Checklist (HQ-LD-02) | 25 Sep | Current for company formation |
| 05 Maths\Formal | 01 Hyper Default Threshold Model; 02 Affordability Model; 03 Income Account Verification Model; 04 Identity Verification Model; 05 Takaful Cover Pricing Model; 06 Credit Scoring and TASDEEQ (HQ-MF-01 to 06) | 25 Sep | Current models; each has a 3D figure |
| 05 Maths\Informal | Same six topics explained for the chairman (HQ-MI-01 to 06) | 25 Sep | Current |
| 06 Maps | 1 System, 2 Law, 3 Savings and Money, 4 Hyper, 5 Credit Bureau, 6 Credit and Rewards, 7 Business Model, 8 Technical (PNG) | 25 Sep | Pre-bank; judged outdated 25 to 28 Sep (should show connected routes) |
| 07 Internal | Work Register (HQ-IN-02, 10,402 items, 102 phases) | 5 Oct | CURRENT register; the 28 Sep version (1,039 items) is in `07 Internal\Superseded` as "Work Register 28 September 2026.pdf" |
| 07 Internal\Drafts | Email to Safepay 25 Sep; Message to Akif Saeed 25 Sep | 25 Sep | NOT SENT; pre-bank; do not send |
| 08 Bank Partnership | Bank Partnership Revisions (PDF of HQ-BK-01); Partner Bank Proposition (PDF of HQ-BK-02); Oraan Research (PDF); Halqa and Mashreq Bank Pakistan (.pptx, .pdf, 21 slides, 28 Sep); Google Docs.txt (links) | 28 Sep | PDFs are exports; edits live in Google Docs; the 21 slide pitch is HISTORICAL |
| 08 Bank Partnership\Sources\Bank | Mashreq HY 2026 accounts (pdf, txt), SBP NFIS 2024 to 28, SBP outsourcing 2019 annex, press pages | 28 Sep | Sources |
| 08 Bank Partnership\Sources\Oraan | Oraan site pages, app store pages, news (2020 to 2026), PICG case study 2024, 1LINK and bank biller lists, SECP list extracts, research notes | 28 Sep | Sources |
| 08 Bank Partnership\Superseded | Oraan (first edition).pdf | 28 Sep | SUPERSEDED |

## 13.3 Other important files

| File | Content | Status |
|---|---|---|
| `D:\HALQA SIGMA APP\HANDOVER\00` to `12`, `DEFECTS-2026-08-20.md` | Cold-start pack of 9 Aug; build plan 11 Aug; 35 defects of 20 Aug | HISTORICAL; `08` section 11 (22 Sep) still valid as a code finding |
| `D:\HALQA SIGMA APP\HANDOVER\MASTER-CONTEXT.md` | This file | CURRENT |
| `D:\HALQA SIGMA APP\docs\HALQA-MASTER-DECK-2026-08-17.pptx/.pdf` | 66 to 68 slide dense deck | SUPERSEDED |
| `D:\HALQA SIGMA APP\docs\HALQA-PRODUCT-ARCHITECTURE-2026-08-11.html/.pdf` | 43 to 53 pp pitchbook | HISTORICAL |
| `docs\HALQA-COMMITTEE-DOSSIER-2026-08-06.pdf`, `HALQA-DISCIPLINE-LAYER-2026-08-09.pdf`, `HALQA-ATTEMPTS-ARCHIVE-2026-08-09.pdf`, `HALQA-ROSCA-LITERATURE-REPORT.pdf` | Research | HISTORICAL but still valid research |
| `docs\ROADMAP-LICENSING-AND-COSTS.md`, `LICENSING-AND-BUREAU-ROADMAP-2026-07-22.md`, `MEETING-BRIEF-AKIF-SAEED-2026-07-23.md`, `BUSINESS-MODEL-V5.md`, `HALQA-TECHNICAL-COMPENDIUM.md`, `INVESTOR-BRIEFING.md` | July documents | HISTORICAL |
| `docs\cia-2020.pdf`, `emi-2023.pdf`, `psEFT-2007.pdf`, `psop-2014.pdf` | Primary texts read 24 Sep | Sources |
| `docs\archive\superseded 2026-09-25\` | Retired 22 to 25 Sep documents | HISTORICAL |
| `halqa-api\prisma\additive-*.sql` | Additive production migrations (2026-07-21 agreements, 07-22 signup security, 07-23 home location, 07-31 salary verification, 08-13 rewards/exits/personalisation; the locality/jobTitle file was to be written) | Application status UNCERTAIN |
| `C:\Users\admin\Downloads\HALQA latest presentation.pptx.pdf` | The chairman's own presentation PDF used for a script on 30 Aug | His file |
| Google Slides `12OAuug83FQ7kd4jUlvpLyBMs8GMs3MZ1` | The chairman's own deck, edited by him (18 Aug) | His file |
| Scheduled task `C:\Users\admin\.claude\scheduled-tasks\message-akif-15-september\` | Reminder of 15 Sep | Done |

## 13.4 Google Docs created by Claude (My Drive), newest per title first

| Title | ID | Created | Status |
|---|---|---|---|
| Oraan Research (Calibri, current) | 1fmqTf6PKOHYcrQHueAJPtzZ38B0pY9JjVLXbLUdogWc | 28 Sep 17:00 UTC | CURRENT; needs the TASDEEQ and DIB additions |
| Oraan Research (Arial copy, can be deleted) | 1p-sgS3XTY08beurwyGuIt0m7hjFuz-nGMcFtI0DiwiY | 28 Sep | Delete candidate (chairman decides) |
| Partner Bank Proposition HQ-BK-02 | 1etjScvbJeCLOIkJhcpBC1fD4Q8bkC5BrZedFVLxF3aA | 28 Sep | CURRENT |
| Partner Bank Proposition (superseded Arial copy, can be deleted) | 1d0K8EY5k-0681C4n7rxEAfH0pBzusdNzwGhhx3j3ckE | 28 Sep | Delete candidate |
| Bank Partnership Revisions HQ-BK-01 | 1PpswTrIcX17_QfZ4z3H_pLfRlZo1GHPZ6gb-7-Br60g | 28 Sep | CURRENT (decisions now answered) |
| Oraan HQ-RS-01 (first edition) | 1-cWEG203tKnX3KYkPcJXAQHVt8t4FejNE7uomue2sJE | 28 Sep | SUPERSEDED by Oraan Research |
| Format test (delete), Format test 2 (delete), Format test 3 (delete) | 1J1zfYwT..., 1OMHX357..., 1OgeqXO9... | 28 Sep | Delete candidates |
| Work Register rev 3 (646 items, status column) | 1TqANpN2Kf3i1uoKeWoJNVMvLJx2RQ-hHc1JKh_k7S7k | 24 Sep | SUPERSEDED by the 665 item PDF |
| Work Register rev 2 (540 items) | 1Mq3ZOYCDJY3nz3Zpc5en04_823s-r3lOmQEyVzCZHOk | 23 Sep | SUPERSEDED |
| Work Register rev 1 (214 items) | 1C_vx_8FF9uaELMAPG-rK7U1PGNhVhMaGe1wp5bAM1UY | 22 Sep | SUPERSEDED |
| Legal Verification of 24 September 2026 | 1b2IqOrEaAkcAzm7Goorhno7wvuF5AJ0DXVR0O6ln5M0 (latest of three) | 24 Sep | SUPERSEDED (EMI conclusion reversed 25 Sep) |
| Statutory Position and Design Changes | 15aOF5-637HQIE1OgEpeh9hAFFnjQ57q_3hXjNuDYLSA (24 Sep); earlier 1R_qMTo4... (23 Sep), 1VjXf08o... (22 Sep) | 22 to 24 Sep | SUPERSEDED by HQ-LG-01 |
| Collection and Auto-Pull Specification | 1U3Paa4e8Npq-T0H-FobXSDkRDNjSEI7515bexkDfu74 (24 Sep); earlier 1nAA0-kO..., 1fIqpqMe... | 23 to 24 Sep | SUPERSEDED by HQ-CP-09 |
| Business Model | 1EOSKv267J3Tt_S3V1Mz6aQD8D5QjYLWFdI7XALg1LVo (24 Sep); earlier three | 23 to 24 Sep | SUPERSEDED by HQ-CP-03 |
| Hyper Committee | 174_R7oIP3ikZxokMSRGRN6ZueQ4cYd81keiWODhI3IA (24 Sep); earlier four | 23 to 24 Sep | SUPERSEDED by HQ-CP-08 |
| Complete Feature and Process List | 1gPhlkdzYwxPL0Jf3SoPLRfy9bEOX-f7QI2kHPjTi3pE (24 Sep); earlier three | 23 to 24 Sep | SUPERSEDED by HQ-CP-07 |
| Halqa Business Documents (folder) | 13VQuvBLGPddsSoosYpDfTUB6xZYn3Apd | 23 Sep | Holds 23 to 24 Sep versions |
| Licensing Verification and Clause Authority (two), Structural Changes and Licensing Position, Regulatory Jurisdiction Note for Akif Saeed | 1RWeODOY..., 1UgePwYr..., 1TwMB-qO..., 1Tw512Xm... | 22 Sep | SUPERSEDED; two drafts reported trashed |
| Halqa Cost Model and Answers to Akif Saeed | 10XrjpTQG426IaVRHboAl9NJGaWXM3wk5xBtj3RxKs5w | 19 Sep | SUPERSEDED by HQ-CP-03 |

No Google Docs editor connector is attached; the Drive connector creates new files only. Edits to existing docs need the Google Docs connector turned on.

---

# 14. SOURCES

Primary = law, regulator or company filing. Secondary = press or third party.

## 14.1 Law and regulation (primary, texts in `03 Legal\Primary texts` or `docs\`)

| Source | What it supports |
|---|---|
| Companies Act 2017 s.84(1), (2), (3) and Explanation | Deposits; "invites"; officers' personal liability 2 years and Rs 5m; services carve-out "an advance against sale of goods or provision of services in the ordinary course of business" |
| Companies Act 2017 s.9(1); ss.153(a), 153(i), 154(1); s.509 | 20-person rule; no minor director; directors hold shares; two directors; s.509 preserves Companies Ordinance 1984 Part VIIIA (NBFC base) |
| Majority Act 1875 s.3; Contract Act 1872 s.11, s.74 | Age 18; only adults contract; penalties limited to reasonable compensation |
| PS&EFT Act 2007 ss.2(s), 4(1), 14(1), 24(1), 28, 30, 31(1), 35(1), 35(2), 36(2), 39, 41 | E-money, designation, SBP powers, EMI licence, scope, disclosures (s.30(2) ten items), notice, preauthorised EFT "either in writing, or in any other accepted form", stop, error resolution, triple damages, burden of proof (duties bind the FI or authorised party) |
| SBP PSO/PSP Rules 2014 r.2(p), r.4.1, r.6.1, r.6.5 | PSP definition; Rs 200m capital; contracts; PSPs "will not act as custodian of consumer's money" |
| SBP EMI Regulations 2023 paras 2, 7.I(f)(g)(h), 11.I, 12.II, 14.II(a) | E-money; payment initiation, escrow, APIs to TPSPs after 30 days' notice; capital; one wallet per CNIC; wallet limits Rs 50k/400k/1m |
| Insurance Ordinance 2000 ss.2(xxvii), 4(3)(a)(vi), 4(4)(f), 5(1), 6(1), 96(1)(a), 96(2), 98(1), 102 | Insurance definition; Class 6 credit and suretyship; only a public company may be an insurer; registration; agency by written contract; insurer's register; brokers licensed |
| Corporate Insurance Agents Regulations 2020 (S.R.O. 1304(I)/2020) regs 1(3), 3(1), 5(1), 5(4), 7(4), 8(2), 8(3), 10(c), 10(d) | Takaful covered; in-app consent valid; premium collection; gross premium; claims in the policyholder's name; commission; no extra service fee; no coercion; bundling with costs shown |
| Credit Bureaus Act 2015 ss.2(l), 11(1), 19(1)(a), 19(1)(b), 26, 31, 32, 34 | Credit institution; non-CI membership by federal notification; report on the debtor's own instruction; confidentiality; adverse action duty (NOT BUILT); electronic validity; user penalty |
| Electronic Transactions Ordinance 2002 ss.3, 4, 6 to 9, 31(1)(b), 31(1)(c); Qanun-e-Shahadat ss.29 to 30 | Electronic records valid; POA and express trusts excluded |
| CPC Order XXXVII r.2(1) (Sindh Judicial Academy paper) | Summary suits only on bills of exchange, hundis, promissory notes |
| PPC s.489-F; s.294-A | Dishonoured cheque (disputed reach); lottery offence |
| S.R.O. 436(I)/2022 (NBFC P2P), amended Nov 2025 | P2P definition in full |
| Virtual Assets Act 2026 (Act XIII of 2026, Gazette 5 Mar 2026) s.3(1)(xxxi), s.2(2)(a)(i) to (vii), s.54(1) | Closed-loop points exclusion; licence needed otherwise |
| SBP Regulatory Sandbox Guidelines 2025 ss.3.1(c), 6.4, 7(a); exclusion II | Sandbox eligibility; no objection letter; "similar product already deployed" bar |
| SBP BPRD Circular Letter 29 of 2021 | 40 per cent debt burden ratio for consumer finance |
| SBP outsourcing framework 2019 (annex saved) | Halqa as the bank's service provider |
| SBP Business Conduct and Fair Treatment of Consumers framework (Oct 2025) | Termination and fairness |
| SECP circulars 3, 10, 14, 15 of 2023 and 8 of 2024; Google Play personal-loan policy (31 May 2023) | Loan-app bans |
| 26th Constitutional Amendment (Oct 2024), Article 38(f); FSC 2022 | Riba to end by 1 January 2028 |
| SBP document moves | Old `sbp.org.pk/psd/YEAR/FILE` links redirect; new path `sbp.org.pk/assets/documents/circulars/psd/YEAR/FILE`; Raast P2P page at `sbp.org.pk/our-subsidiaries/raast/raast-person-to-person` |

## 14.2 Market and research (used in decks, verified 28 to 29 Sep unless noted)

| Source | Figure it supports |
|---|---|
| Dawn, 12 Dec 2022 (Karandaaz and Oraan) | 34 per cent (Karandaaz) and 41 per cent (Oraan) of Pakistanis use committees; about Rs 4 trillion a year (Oraan estimate); 2022 Facebook fraud of about Rs 420m across 117 committees |
| PICG Oraan case study 2024 (Karandaaz, EY Ford Rhodes, LUMS) | About 100 million people (Oraan); Oraan guarantees payouts |
| Financial Inclusion Insights (FII) tracker 2013 and waves (wave 3, wave 5 2017) | Average contribution US$17.96 (range US$0.09 to 470.20); 91 per cent monthly; 12 per cent lost money to fraud; 4 per cent of savers use a formal institution; 63 per cent keep cash at home; women 2x; 56 per cent have a committee within 1 km; 31 per cent can send or receive an SMS |
| SBP Saving Behaviour Survey 2021 | 37 per cent used committees |
| SBP payment systems reviews: Q2 FY25 press release (28 Mar 2025), Annual Review FY25, Q3 FY26 | Branchless wallet users 64.3m, e-money wallets 4.7m, mobile banking app users 21m, internet banking 13.3m; digital share 78 per cent FY23, 85 FY24, 88 FY25, 92 Jan to Mar 2026; apps 2.9bn transactions and Raast 742.1m in Jan to Mar 2026 |
| S&P Global FinLit Survey | 26 per cent financially literate |
| NFIS 2024 to 2028 | 75 per cent of adults with an account by 2028; gender gap to 25 per cent |
| Mashreq Bank Pakistan HY accounts to 30 Jun 2026; NEO product pages and rate sheets (29 Sep) | Mashreq figures in 12.3 |
| Launch Base Africa (Oct 2025), TechCrunch (May 2025), Entrepreneur Middle East (2023) | Money Fellows figures; 328 corporate partnerships |
| The National (Dec 2023), MENAbytes | Hakbah |
| CNBC (11 Dec 2025) | Esusu US$1.2bn |
| CB Insights | The Money Club |
| ImpactAlpha (1 Oct 2021, Jessica Pothering) | Oraan's partner bank DIB for payouts |
| TASDEEQ members page (read 28 Sep) | Members listed |
| SPIN IDG (LinkedIn, 13 Aug 2026); JazzCash Facebook posts; App Store version history | JazzCash Committee |
| TechX Pakistan (16 Sep 2026) | WhatsApp US$0.015 a message from 1 Oct 2026 |
| Khan 2013 (J. Econ. and Sustainable Dev. 4:19); Kamran 2017 (EJBO 22:2) and 2018 (Jyvaskyla dissertation); Mehmood et al. 2018 ("Save My Money", ITU Lahore and University of Washington) | ROSCA literature |
| Visme blog on pitch decks; YC; Duarte; Kawasaki 10/20/30; DocSend; bank-sales practice (Stacy Bishop) | Pitch rules (29 Sep) |

## 14.3 Raqami sources (29 Sep)

raqamidigital.com (about us, products, FAQ, schedule of charges July to Dec 2026, financial reports, news list); VIS rating report 12 Nov 2025 (docs.vis.com.pk); Raqami half year report to 30 Jun 2026 (directors' review and statements, scanned PDF, read visually); Bloomberg and Business Recorder (22 Jan 2026), Crowdfund Insider (25 Jan 2026), Retail Banker International (11 Feb 2026), ProPakistani (10 and 19 Feb 2026), Profit (22 Feb 2026), Radio Pakistan (25 Jan 2026), The Nation (18 Sep 2026, IBA CEIF diploma), Express Tribune, Dawn (restricted licence).

---

# 15. NUMBERS AND DATA (with date and source)

## 15.1 Market

| Figure | Value | Source | Date |
|---|---|---|---|
| Committee use | 34 per cent (Karandaaz) to 41 per cent (Oraan) of Pakistanis; 37 per cent (SBP 2021); 33 per cent of savers (FII) | Dawn 2022; SBP; FII | |
| People | About 100 million (Oraan's higher estimate); earlier derived about 52 million adults | PICG 2024; HANDOVER 07 | |
| Annual flow | About Rs 4 trillion (Oraan estimate); Oraan elsewhere "US$5bn" | Dawn 2022 | |
| Typical committee | 3 to 12 members in digital versions; 91 per cent monthly; about US$18 average instalment a cycle (2013) | FII; products | |
| Fraud | 12 per cent of users lost money; 2022 Facebook case Rs 420m, 117 committees; Punjab cooperatives 1991 to 92 Rs 10 to 23bn across up to 2.6m accounts | FII; Dawn; dossier | |
| Banking | 13 per cent of adults with an account (Findex via Kamran 2017); 4 per cent of savers use a formal institution; 63 per cent cash at home | FII | |
| Digital | 69 million wallet users end 2024 (64.3m branchless + 4.7m e-money); 73.8m mobile wallets (VIS, Nov 2025); 21m mobile banking; digital share 92 per cent Jan to Mar 2026 | SBP; VIS | |
| Literacy | 26 per cent | S&P | |

## 15.2 Halqa model numbers

| Figure | Value | Status |
|---|---|---|
| Worst-case exposure | Rs 110,000 (turn 1 of 12 at Rs 10,000) | CURRENT |
| One instalment split | Rs 10,000 + Rs 85 fee + Rs 150 PSP service fee (1.5 per cent) = Rs 10,235, plus the takaful or insurance fee (named only) | CURRENT (deck, 30 Sep evening); the earlier Rs 10,000 + Rs 547 + up to Rs 500 = Rs 11,047 is SUPERSEDED |
| Cover price | 5.47 per cent of instalment, stress case; build plan rule r = 1.5q at 3x loading (open 1.5, known 0.5, Hyper 3.0 per cent) | Current / historical |
| Running cost | Rs 13 to 35 a payment | 25 Sep |
| Fixed cost | Rs 1.32 million a month; blend Rs 512 a member a month; platform floor Rs 58,000 a month (19 Sep) | 25 Sep |
| Break even | 2,572 members ("about 2,600") | 25 Sep |
| At 100,000 members | Rs 45.6m a month before tax (25 Sep); cost Rs 1,304,000 a month = Rs 13 a member (19 Sep) | 25 Sep |
| Balance margin | About Rs 8 a member a month for each 10 per cent share (assumption) | 29 Sep |
| Deposits assumption | Rs 25,000 average balance a member: 100,000 members = Rs 2.5bn; 1,000,000 = Rs 25bn | 29 Sep (ASSUMPTION) |
| Per-circle results (first / later circles, 25 Sep) | family (Rs 427) / Rs 2,053; office Rs 55,946 / 60,906; market Rs 2,295 / 6,429; unknown Rs 62,559 / 70,355; large Rs 232,199 / 245,192; Hyper 1 Rs 888,998 / 1,168,855; Hyper 2 Rs 396,293 / 669,154; at Safepay's card price Hyper Rs 397,855 and 268,624 | 25 Sep |
| Message costs | WhatsApp Rs 4.35 (US$0.015 at Rs 290); SMS Rs 3.80 to 4.80; Hyper 1 reminders Rs 99,180 a cycle (about Rs 1,984 a day); Hyper 2 Rs 51,913 (about Rs 1,997 a day) | 25 Sep |
| Other unit costs | NADRA Rs 50 planning; AWS liveness US$0.015 + compare US$0.001; TASDEEQ Rs 200 planning; support Rs 60,000 an agent; acquisition Rs 250; host 2,500 points (Rs 250); referral 1,000 points (Rs 100) | 25 Sep |
| Hyper margin (option 1, 23 Sep) | Fee Rs 3,000,000 a cycle; payment cost about Rs 252,000; expected default loss at 2 per cent Rs 60,000; profit about Rs 2,688,000; covers expected loss about 50x | 23 Sep (superseded cost inputs) |
| Rail finding | A percentage rail against a flat fee takes 9 per cent of a Rs 75 Hyper fee but 38 to 60 per cent of monthly fees; card 3.3 per cent + Rs 33 takes 64 per cent of Hyper fee | 23 Sep |
| Loss formulas | L(k) = c(T - k) - phi*k; k* = cT/(c + phi); Net(m,d) = phi*N[(1 - d)T + dm] - N*d*c(T - m); d* = phi*T/[(c + phi)(T - m)]; asset L(k) = max(0, c(T-k) - phi*k - h*V(k)), h about 0.70 | 13 Aug, historical |
| Exposure score | R = n(c + phi)(T - kbar)/(phi*N*T); bands <0.80 self-funding, 0.80 design, 1.00 absorbing, 1.25 cover engages, 1.60 takaful attaches | 13 Aug, historical |
| Launch timing (pre-bank) | Standard circles 30 to 45 days; Hyper 75 to 90 days (after insurance agent registration) | 23 Sep, historical |
| Policy rate | 11.5 per cent (15 Sep 2026) | SBP |

## 15.3 Mashreq figures

See 12.3. Presentation uses: deposits Rs 8.5bn at 30 Jun 2026; 350,000+ customers; no advances; 9,000+ non resident accounts.

## 15.4 Oraan figures

See 12.4. Slot fee table (10 months): 21, 19, 16.5, 13.5, 10, 6, 2, 0, 0, 0 per cent of instalment a month by slot; (5 months): 10.5, 9, 7, 0, 0.

## 15.5 Evidence companies (decks)

Money Fellows: 2016, profitable 2025, 8.5m users, US$1.5bn. Hakbah: 2018, launched 2020 after SAMA approval, 500,000+ users. Esusu: 2018, US$1bn 2022, US$1.2bn Dec 2025, 12m people. The Money Club: 2016, about 200,000 users.

## 15.6 Raqami Islamic Digital Bank (29 Sep)

| Item | Value | Source |
|---|---|---|
| Legal | Raqami Islamic Digital Bank Limited, Karachi, incorporated 2023, public unlisted, digital retail bank, first fully Shariah compliant digital bank in Pakistan | VIS; site |
| Owners | PKIC 70.13 per cent (JV of the governments of Pakistan and Kuwait); Enertech Holding Company KSC 25.97 per cent (Kuwait Investment Authority subsidiary); sponsor undertakings to SBP for capital shortfalls | VIS |
| Licence path | In-principle Jan 2023 (five digital banks: Easypaisa, Hugo, Buraq/KT, Mashreq, Raqami); NOC 2024; restricted licence May 2025; scheduled bank from 6 Feb 2026; commercial launch 9 Feb 2026; licence presented at PM House (PM statement 12 Feb 2026). CONFLICT: site news list dates the commercial licence item 20 May 2026 | Accounts; RBI; site |
| Rating | VIS AA / A1, stable (preliminary 12 Nov 2025, final 17 Mar 2026) | VIS; site |
| HY to 30 Jun 2026 | Accounts 114,452; cards 80,966; deposits Rs 1,581m (current 205m, savings 1,058m, certificates 317m; Rs 47.5m at 31 Dec 2025); Islamic financing Rs 27.6m; investments Rs 4,112m; total assets Rs 7,839m (Rs 4,911m at Dec 2025); share capital Rs 9,900m (Rs 7,900m); accumulated losses Rs 5,171m; H1 loss after tax Rs 1,587.5m (Rs 811.9m H1 2025); opex Rs 1,754m; revenue Rs 216.5m; 1.4m transactions, Rs 26.57bn throughput; marketing campaign from April 2026 | Directors' review and statements |
| 9M 2025 | Deposits Rs 24.7m; CAR 85.1 per cent; 9M loss Rs 1,225m | VIS |
| Plans | US$100m over 5 years; Rs 8bn to reach launch; 1 million customers in 3 years; break even in 4 years; SME, freelancers, underserved; supply chain, auto and fleet financing; "improving revenue per customer" | Press; accounts |
| Mission | "open-API, BaaS platform offering Shariah-compliant financial services to empower unserved and underserved individuals and enterprises"; targets students, farmers, women, part-time workers, small business owners, freelancers | Site |
| Products | Current (qard), Savings (mudarabah), Mudarabah Certificates 7 days, 1, 3, 6 months, 1 year (profit at maturity), Saving Pots (round-up, goal-based, 52-week challenge), PayPak and Visa cards with complimentary EFU takaful (fraud to Rs 30,000), Raast ID, bills, free Raqami/Raast/RTGS transfers, free cash deposits at 750+ Askari branches, business banking "coming soon"; Asaan account (CNIC + mobile, instant) and Full account (back-office approval); residents only, 18+; overseas Pakistanis not eligible | Site; FAQ |
| Charges (Jul to Dec 2026) | Account free; PayPak/Visa Classic Rs 2,500; Visa Platinum Rs 6,000; local ATM Rs 35; 1LINK transfers free to Rs 25k a month then 0.1 per cent or Rs 200 | Schedule |
| Partners | Codebase Technologies, Garaj (Jazz), Euronet, EFU window takaful (Nov 2025), VIZPRO (May 2026), Sehat Kahani (Aug 2026), NIC Hyderabad (Sep 2026), IBA CEIF diploma (Sep 2026), Askari Bank | Site |
| Committee product | None found | Search 29 Sep |

---

# 16. WORKING PREFERENCES (how to work with him and what he expects back)

## 16.1 Replies

- End with "Yes boss".
- Lead with the answer; one line when he asks for one line; numbers only when he asks for numbers.
- State what was verified and what was not. Never report percentages of completion; show the result.
- When he asks "are we in legal trouble", answer at the level of the plan: each part outside the law, the provision, the fix.
- When documents and code disagree, read the code and say the documents are wrong.
- When his words and older plan documents conflict, his latest words win; say so and design an answer to the documented risk rather than ignoring it.
- Short status lines while working; he is often away and returns to "continue".

## 16.2 Documents (corporate style, 25 Sep, still CURRENT)

- Black and white, default, non flashy; the lime Halqa logo top right is the only colour except figures.
- No "prepared for" bar, no classification, no version or revision label. Under the title: subtitle, then "Reference HQ-XX-NN. <date>." Footer "Halqa, <title>" and "page n of N".
- Headings are short formal nouns ("Summary", "Constraint", "Routes"), never sentences. Never write "in plain words".
- Every document has a technical process section (how it works: APIs, tokens, mandates, messages, records, controls) and the law per step. Explain terms he may not know.
- Exact names of partners, always with "none contracted" where true.
- Bullets plus prose; a simple summary at the end, understandable to him.
- Legal material: provision name and number, exact quote, source and page; primary texts kept beside it. `lawcite.py` stops the build on any misquote.
- Every maths model has a coloured 3D figure, colours tied to the decision each region leads to (red loss, yellow balanced, green profit).
- Maths in pairs: formal for companies, informal for him.
- Only current material in `HALQA CORPORATE`; old files move to Superseded or the archive, never deleted.
- Build with `docgen.py`, `headings.py`, then `build_all.py`, `scan_all.py`, `verify_quotes.py` before syncing.
- Google Docs from HTML: put `<style>body,p,li,td,h1,h2,h3{font-family:Calibri}</style>` in the head AND inline Calibri, or the import turns everything into Arial; paragraphs need `margin:0 0 6pt 0`.

## 16.3 Decks

- Lime palette only; white ground; Georgia titles in l700 at 28 pt; Arial body; page numbers; sources line on every slide that carries a figure ("Sources 1 ... 2 ..."), readable at 10 pt.
- Formal noun titles; one-line plain statements; no "you, your, we, our"; no dashes; no banned words (`check_and_save` regex in d2_lib).
- One deck for everything, plus a short presentable deck for a first meeting. Audience "knows nothing": 10 to 20 slides, the category case before the company case, show the product, one idea per slide, a 3-second glance test, sell to the bank by its own need, answer worst cases, a light phased plan, remember the bank's committee of business, risk, compliance, IT and finance.
- Detail goes into speaker notes; slides carry exhibits.
- DECK RULES OF 30 SEP EVENING, SECOND ROUND (CURRENT): the icon-tile design of version 6 was REJECTED ("this looks too much now, and informal, revert these emoji type changes except logos"): keep the version 5 boxes and wording; NO icons, NO icon tiles, NO person icon; brand names shown as their logos (Halqa lockup, bank logo or app icon, TASDEEQ wordmark, competitor logos), inside the boxes; every grey text black, coloured figures stay coloured; charts drawn as shapes, not chart objects, because he edits in Google Slides; never add text, apply his text edits exactly and report doubtful ones; whatever he edits or deletes in one bank's deck is applied to the other.
- (Superseded the same evening: "no text inside boxes, every party or step a logo or app-icon tile, person icon for members, icons for products and steps".)
- DIAGRAM RULES (29 Sep, after "diagrams look like ai slop, beautiful and proper"; the "avoid icons, badges, rings, staircases" part is SUPERSEDED by the 30 Sep evening rules above): every exhibit carries real structure or real data. Use: payment matrices, waffle and unit charts, small multiples, UML-style sequence diagrams (thick lime line = money, thin ink line = instructions), swimlanes (Member, Bank, Halqa engines), exposure bar charts with bracketed bands, Sankey flows drawn to scale, Harvey balls, Gantt charts, lifelines on a real year axis, nested scope boxes, a line map with a dashed orange branch for new products. Avoid: icons in circles, numbered badge circles, rings of nodes, staircases, pastel cards, stat tiles, emoji, pills, three-circles-with-dashed-lines. Hairlines for structure, one thick accent line, direct labels instead of legends, the bank's colour only for the bank.
- Partner logos only with download approval (Mashreq's was approved). Use the app's real screens in phone frames; never the app's Hyper screen (Rs 412.50) or Rewards screen (NaN), the committee screen ("Turn 4 of 2") or the pay screen (retired wording).
- Build pipeline: python-pptx generators executing `d2_lib.py` in a shared namespace; render with PowerPoint COM (`render.ps1`, `$pres.SaveAs($Out, 32)`), then PyMuPDF (`pages.py`) to PNG; look at every slide before filing. Table borders: insert line elements first (`tcPr.insert(0, ln)`); tables auto-grow; native charts need `invertIfNegative` set to 0 per data point; freeform shapes for polygons, arcs and Sankey bands. Google Slides imports .pptx natively.
- App screenshots: Node CDP script `shots2/shoot.mjs` (390 x 844 at 3x, light scheme) against the web app in preview mode (`http://localhost:4100/?preview=1&screen=<name>`, started by the `halqa-web` launch configuration); framed with PIL. Icons (only where still wanted): lucide icon nodes from `halqa-web/node_modules/lucide-react` rendered with PyMuPDF.

## 16.4 App

- Look like JazzCash, Easypaisa and SadaPay in structure and craft, with Halqa's own lime palette and logo ("colors and logo should be same only").
- Home is the only screen he likes (24 Sep). He hates list-of-rows layouts. Sign-up and sign-in are to be redesigned from nothing (10 steps to 5, no password, PIN only).
- No cringe copy, no over-explaining, no eyebrows, no stacked panels, no pills, no emoji.
- Verify by reaching the screen as a member in the running app; never trust a register.
- Development facts: portable Node 22 at `D:\HALQA SIGMA APP\.tools\node-v22.22.0-win-x64` (system Node 26 exists); call local binaries (`node node_modules\typescript\bin\tsc`, `node node_modules\vitest\vitest.mjs run`) because `npx tsc` runs a wrong package; PostgreSQL 18.4 embedded binaries at `.tools\postgresql-18.4-embedded\bin`, port 54339, start manually each session; API 4101, web 4100; login field is `identity` (phone, e.g. +92 300 1234567) with demo password halqa123; restart the API by killing the PID on 4101; Prisma generate fails while the API runs; production schema only through additive SQL with the portable psql (strip `?pgbouncer=true` and change 6543 to 5432); serverless DB pool needs `connection_limit=1&pool_timeout=20`; deploy with `npx vercel@latest deploy --prod --yes` from each package after `npm install --include=dev` and `npx prisma generate`; never deploy without approval; GitHub pushes were blocked by the ISP in August.

## 16.5 Research standard

- Every figure sourced and verified; say "unverified" when it is.
- Primary texts over summaries; quote exactly; keep the source file.
- "PhD level" when he asks; loops of verification when he asks ("run 5 loops").
- Distinguish modelled from measured.

## 16.6 How to keep this file current (his rule of 29 Sep)

For every new piece of information:
1. Compare it with this file and classify it: new, unchanged, corrected, contradictory.
2. Update the relevant section and keep the previous version where it mattered (move it to Section 9 or the decision record).
3. Add a row to Section 2 (Latest Updates) with date, change, previous, current, impact, source.
4. Add the event to Section 6 (Timeline).
5. Update Section 1 (Current State) and Section 7 (Decisions) if a decision moved.
6. Add corrections to Section 8 and to Section 17 if they must never be reverted.
7. Record any conflict in Section 18 with both versions and the newest reliable one.
8. Never let an older detailed record overwrite a newer short correction.
Also update the matching memory file and the `MEMORY.md` index.

Before answering a question that depends on past context, check: the newest relevant information; recent changes; corrections; newer files; newer decisions; whether the fact is historical or current; conflicts; the relevant preference.

---

# 17. DO NOT REVERT

Each line is settled. Reverting any of them is an error unless the chairman changes it again.

1. The architecture is the PARTNER BANK ROUTE (28 Sep). Do not present no-custody record-only, the CDC trustee vault, float earnings or "no bank partner ever" as current.
2. Halqa is "the system", the bank is "the machine". Halqa takes no licence of its own; no sandbox.
3. Mashreq Bank Pakistan is the chosen bank (D1). Raqami is a plan only.
4. D1 to D16 as in Section 1.3.
5. Payment partner is Safepay, never an EMI (NayaPay, SadaPay) and never "PayFast" as the partner; the bank's direct debit mandate is added (D3).
6. The bank takes the member fee and shares income with Halqa (D5). Do not quote Rs 0, Rs 50 or Rs 100 flat as the current fee.
7. Hyper = the two options of 23 Sep, labelled experimental. Do not quote the 30 day / 210 member / 48 per cent APR spec or the Rs 60,000 cap as current. No APR anywhere.
8. Seat bands are mandatory; new members start in the last three turns.
9. Committee types are six: Known, Unknown, Large unknown, Asset, UAE family, Hyper. Family, Office and Market are "Known".
10. The pilot is one month live with about 1,000 members.
11. "Credit score", never "Sakh". For Hyper quote only the 23 Sep options (8 collect a day on option 1, 15 on option 2); "6.7 a day" was an error and "7 a day" belongs to superseded August specs.
12. Lime green only. No pine, gold, dark green or golden black.
13. Never "Halqa the recorder".
14. No names of the mentor, advisers, private individuals, family or bank officers in decks or documents.
15. No dashes; no puns; noun headings; no you/your/we/our on slides; banned words.
16. Proper exhibits with real structure or data. SUPERSEDED IN PART 30 Sep evening: icons, logos and app-icon tiles are now wanted; what is banned is text inside boxes (see 32).
17. Legal citations as corrected in Section 8.2 (s.9(1) not s.509; summary suit only on a cheque; CBA s.34 for users; full P2P definition; Pakistani PS&EFT wording; RTP settles to the sending merchant).
18. Business model numbers of 25 Sep replace all earlier numbers (break even 2,572, about 2,600).
19. No Accessibility screen-reading, no contact or gallery harvesting, no public default flag, no address publication.
20. Never claim Halqa can jail defaulters or serves "the poorest".
21. Never remove a feature for being non-Shariah on a mixed bank; label it (see the Raqami conflict in Section 18 for a fully Islamic bank).
22. Never run blind `prisma db push` on production; never deploy without approval; never send drafts; never trash his files.
23. "Yes boss" at the end of every reply.
24. Mashreq version 6 and Raqami version 4 are current (30 Sep evening); all earlier versions are in Superseded.
25. JazzCash Committee exists (launched 13 Aug 2026) and must appear in any comparison.
26. Presenter line is "Taha Kayani, Founder, Halqa" (his own edit on the cover, 30 Sep evening; was "Chairman"); age 17 (29 Sep late evening).
27. Due date the 8th; 1 point = Rs 1; on-time points never more than 50 per cent of Halqa's own fee; turn price ceiling 100 per cent of the pot (29 Sep late evening).
28. Hyper fee Rs 15 a day; cover Rs 135 (option 1) or Rs 151.67 (option 2); daily payment Rs 450 / Rs 500 (29 Sep late evening).
29. No Shariah or non-Shariah labels in decks or documents (29 Sep late evening).
30. No cover by Halqa, no bank guarantee: default protection is ONLY takaful or insurance from a licensed operator; never write "cover" as a Halqa facility (29 Sep night).
31. Partner decks: Arial only, a wide colour palette, proper diagrams, plain noun headings and subheadings, no one-point slides, no pilot and no plan (29 Sep night).
32. Partner decks: version 5 boxes and wording; logos in place of party names; NO icons or icon tiles and no person icon (the version 6 icon design was rejected as informal); all text black except coloured figures; charts drawn as shapes (30 Sep evening, second round).
34. Fee (30 Sep evening): Rs 85 a monthly instalment = running cost of one payment (at most Rs 35) plus Rs 50; a PSP service fee of 1.5 per cent of the instalment is shown separately; the takaful or insurance fee is named without an amount and is not part of the fee or of Halqa's income; contribution about Rs 50 a member a month; technical cost covered at about 1,220 members. Do not quote "up to Rs 500", Rs 547 or Rs 11,047 as current.
33. Partner deck order and names (his edit, 30 Sep evening): Summary after Current Status; "Competition" with no subheading; "International Success"; Current Status with no subheading and no bottom box; no break-even chart on Revenue; no "Halqa never" block on Proposed Structure; no evidence block on Credit Reporting.

---

# 18. CONFIDENCE, UNCERTAINTY AND CONFLICTS

## 18.1 Conflict register

| ID | Source A | Source B | Latest | Current interpretation | Confidence |
|---|---|---|---|---|---|
| C1 Age | HANDOVER 01 and memory: 17 (July) | Chairman 18 Aug: "i am 16" | 29 Sep late evening | RESOLVED: 17 (USER) | High |
| C2 Surname | Email, git, old decks: Amjed | App account and Friday Times byline: Kayani | 29 Sep late evening | RESOLVED: Kayani on decks and documents (USER) | High |
| C3 Point value | 10 points = Rs 1 of fee (25 Sep) | 1 point = Rs 1 for the balance reward (28 Sep, D4) | 29 Sep late evening | RESOLVED: 1 point = Rs 1 everywhere; on-time points capped at 50 per cent of Halqa's fee (USER) | High |
| C4 Due date | The 10th (11 Aug, 26 Sep) | The 8th (28 Sep, D12) | 29 Sep late evening | RESOLVED: the 8th (USER) | High |
| C5 Fee ceiling | Rs 300 at a Rs 20,000 instalment (30 Jul) | About Rs 500 at Rs 10,000 with more than 10 members (19 Sep); deck "up to Rs 500"; rail finding used Rs 500 at Rs 20,000 | 19 to 29 Sep | The later figures govern; the July ceiling has not been withdrawn; the bank now sets the fee (D5) | Medium |
| C6 Hyper fee | Rs 150 / Rs 166.67 (23 Sep); Rs 75 / Rs 83.33 plus equal cover (25 Sep) | Rs 15 fee on both options with more cover (25/26 Sep) | 29 Sep late evening | RESOLVED: Rs 15 fee, cover Rs 135 / Rs 151.67, daily payment unchanged (USER) | High |
| C7 Points for money and e-commerce | NO (25 Sep: e-money; VAA closed loop; no Daraz) | YES as the bank's product (28 Sep, D4, D9) | 28 Sep | YES under the bank's licence, with legal flags | High on intent, Low on legality until counsel |
| C8 Turn market | No money between members (22 Sep); points only (25 Sep) | Member-to-member buying and selling "like before" (28 Sep, D9) | 28 Sep | D9, with P2P and Shariah flags | Medium |
| C9 Cover | Halqa balance sheet plus takaful (mentor, 23 Jul) | Halqa never advances money; takaful agent (22 to 23 Sep) | 28 Sep D7 | The bank chooses guarantee, insurance or takaful | High |
| C10 Keep-all-features versus a fully Islamic bank | Keep non-Shariah features, label them (14 Jul) | Raqami cannot offer non-Shariah products | 29 Sep late evening | RESOLVED: no labels at all; the Raqami deck omits what an Islamic bank cannot offer; Halqa keeps every feature for other banks (USER: "do whatever ... no labelling needed") | High |
| C11 Raqami commercial licence date | Feb 2026 (scheduled 6 Feb, launch 9 Feb, Retail Banker International 11 Feb) | 20 May 2026 on the Raqami news list | 29 Sep | February 2026 | Medium to high |
| C12 Raqami account limits | Asaan "3Mn balance limit", Full "no balance limit" (products page) | Asaan Rs 1,000,000, Full Rs 10,000,000 (FAQ) | 29 Sep | Probably balance versus transaction limits; unconfirmed | Low |
| C13 Hyper member count on deck v3 | "390 to 400" | Options are exactly 400 and 390 | 23 Sep | Consistent | High |
| C14 Visual answer to "needs visuals" | Icons on lists (29 Sep morning, 81 slide deck) | Icons in diagrams are "ai slop" (29 Sep afternoon) | 29 Sep | No icons in diagrams; the 81 slide deck still has them | High |
| C15 Theme history | Gold and white (20 Jul) | Pine and gold (2 Aug), lime (12 Aug app), bright green (23 Sep), lime not dark green (28 Sep) | 28 Sep | Lime | High |
| C16 Stage tags | FUNCTIONAL / BUILD / GATE-2 / STAGE-2 (28 Jul) | Bank route (28 Sep) | 28 Sep | Tags not restated since the bank route; use plain status words | Low |
| C17 100,000 users by 6 Oct | Directive of 22 Sep | Pauses of 24 and 28 Sep | 28 Sep | Not formally withdrawn; not being worked | Low |
| C18 Mentor's earlier advice | Vault via CDC plus AMC (23 Jul) | The same mentor: that design breaches s.84 (27 Sep) | 27 Sep | The later verdict governs | High |

## 18.2 Unverified or uncertain facts

| Item | Status |
|---|---|
| Company incorporated? | Unknown |
| Production migrations applied? Current deployed build? | Unknown since August; some September commits say features "work in production" |
| Test counts today | Unknown (last recorded 60 unit / 352 integration on 31 Jul; more suites since) |
| Whether TASDEEQ was contacted directly | Unknown |
| Bank meeting date | "Near 10 October", not confirmed |
| Mahaana as "Pakistan's first digital AMC" named by the mentor | Never verified |
| JazzCash Committee fees | Unknown |
| Raqami profit rates, mandate capability | Unknown |
| Mashreq API account opening and mandates | Unknown |
| "make it 380 pkr instead" (20 Aug) | Referent unclear |
| All model outputs (default rates 0.3 to 1.4 per cent, cover 5.47 per cent, break even) | MODELLED, not measured; the first 100 completed circles would reprice them |
| Market size figures (34 to 41 per cent, Rs 4 trillion, 100 million) | Estimates by Karandaaz and Oraan; no official count |

## 18.3 Known gaps in this file

- The 7 to 27 July session transcripts were not available; July is reconstructed from memory files and the HANDOVER pack.
- `HANDOVER\02`, `03`, `05`, `06`, `07`, `09`, `11`, `12` were read by headings and key sections, not line by line; they hold much more detail (feature register of 617 lines, 103 KB build plan) and remain the place to look for August-era specifics.
- The content of the 25 Sep corporate PDFs was not re-read for this file; their summaries come from memory records written when they were built.
- The chairman's own Google Slides deck (12OAuug...) and the "HALQA latest presentation" PDF were not re-read.
