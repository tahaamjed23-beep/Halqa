# Ghost 03 — Default measurement, collections & takaful cover
*Unlocks needed: MFB partner (field capability), takaful partner. Code activation: ~1 day; ops onboarding runs on the partner's clock.*

## What changes at custody
Today a default costs the member their forfeited collateral, ban, and reputation. At custody, three real-world layers activate on top of the existing (unchanged) protection stack:

## 1. Default measurement — from sim metrics to live book metrics
A daily job computes and stores the portfolio metrics the simulation currently estimates, per circle and platform-wide (they become the numbers reported to the MFB, the board, and eventually SBP):
- **PAR-7 / PAR-30** (portfolio-at-risk: % of expected receivables overdue 7/30+ days) — the sim's "late" analog.
- **Post-payout default rate** (the 0.27% the sim predicts — now measured).
- **Recovery ratio** (collateral seized ÷ exposure at default — the 84% claim, now measured).
- **Vintage curves** (cohort-by-start-month performance) and per-segment cuts using the KYC occupation field.
```prisma
model PortfolioSnapshot { id String @id @default(cuid()); date DateTime; scope String; par7Bps Int; par30Bps Int; defaultRateBps Int; recoveryBps Int; exposurePaisa BigInt; json Json; @@unique([date, scope]) }
```
Dashboard: a host-invisible, admin-only /api/portfolio endpoint + weekly PDF to the partner (the receivables-pack machinery already renders this shape).

## 2. Collections ladder (replaces "recovery case opened" with a real process)
| Stage | Days past grace | Action | Actor |
|---|---|---|---|
| Soft | 0–7 | in-app + SMS + robo-call reminders (Urdu) | automated |
| Social | 7–14 | host notified with a script; guarantor (if any) notified | host/automated |
| Field | 14–30 | referral to MFB field team / licensed collections agency, fee % logged | partner |
| Legal | 30+ | demand notice template; small-claims where economical; eCIB delinquency report (02) | counsel |
Hard rules coded in: no harassment scripts, contact-hours limits, all contact attempts logged to SecurityEvent-style audit (`CollectionEvent` table), member hardship flag pauses the ladder pending review — collections that respect dignity are also the ones SECP will approve.

## 3. Takaful (Islamic mutual cover) on post-payout default
- **Structure:** group takaful policy where the covered event = a member's death/disability/verified hardship causing post-payout non-payment (the sympathetic defaults, ~half the sim's residual). Wilful abscond stays uninsured — collateral + collections handle it (insuring it would create moral hazard and un-insurable premiums).
- **Premium funding:** from Halqa's Mudarib share for halal tiers (keeps "0% of member money" intact), disclosed; optional member top-up cover later.
- **Partner shortlist:** Pak-Qatar Family Takaful / Salaam Takaful — both write group micro-cover; the MFB's existing bancassurance desk is the fastest door.
- Claim flow: hardship default verified → takaful claim → proceeds credited to the circle's round via the existing guarantee-pool ledger path (already built for the partner rail).

## Activation checklist
- [ ] Collections SOP signed with MFB/agency (fees, scripts, contact rules) · robo-call/SMS Urdu scripts recorded
- [ ] Takaful master policy quoted, priced against sim loss data (expected claims ≈ 0.1–0.15% of pot volume), signed
- [ ] Migration G3 (PortfolioSnapshot, CollectionEvent, TakafulPolicy/Claim tables)
- [ ] Hardship-flag review process assigned (founder initially) · dashboard live · first weekly partner PDF sent
