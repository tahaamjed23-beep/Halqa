# GHOST PROTOCOLS — the production activation vault
### What gets built the day the three unlocks land: SECP licence · anchor investor · MFB partner.
*This folder is deliberately separate from the functional prototype. Nothing here is referenced by the app, shipped in a build, or mentioned in any investor-facing document. It exists so that a "yes" converts to a production system in days, not months.*

## The premise
Everything in the live prototype was built under one constraint: **record-only, no custody**. The moment the three unlocks exist, that constraint lifts, and six systems become buildable. Each has a protocol file in this folder containing: the exact schema changes, the API surface, the provider shortlist, the environment variables, the activation checklist, and the tests that must pass before it goes live.

The honest scope statement up front: "within a day" applies to the **code activation** — wiring, schemas, flags, deploys — because these protocols pre-decide every design question. The *operational* items (bank account opening, provider contracts, SBP/SECP filings) have their own external clocks that no engineering can compress.

## The six ghost systems
| # | System | Protocol file | Unlock required | Code activation |
|---|---|---|---|---|
| 1 | Custody & real payments (escrow, Raast, PSP, settlement engine) | 01 | Licence + MFB | ~1 day |
| 2 | KYC & account linkage (NADRA, bank accounts, eCIB) | 02 | Licence | ~1 day |
| 3 | Default measurement, collections & takaful | 03 | MFB / takaful partner | ~1 day |
| 4 | Production security (2FA, secrets vault, WAF, SOC, DR) | 04 | Investor (budget) | ~1–2 days |
| 5 | Treasury: real deployment of float/deposits/vault | 05 | Licence + MFB | ~1 day |
| 6 | Compliance & AML program (monitoring, STR/CTR, audit) | 06 | Licence | ~1–2 days |

## Why these six and nothing else
Each one is the production twin of something the prototype already simulates — which is exactly why activation is fast:
- The **ledger** already double-enters every rupee → custody just adds a real settlement leg to entries that already exist (01).
- **KYC levels** already gate features → NADRA verification just upgrades how a level is earned (02).
- The **protection stack** already measures lateness/default → collections and takaful just add real-world consequences and cover (03).
- **Auth** is already OAuth-tier (rotation, reuse detection, lockout, audit log) → production security adds the second factor and the infrastructure shell (04).
- The **engines** already compute yield at dated rates → treasury replaces "computed" with "actual" via real placements, same numbers, same tests (05).
- The **SecurityEvent/audit trail** already exists → AML monitoring is new rules over the same event architecture (06).

## The activation-day runbook (when all three unlocks exist)
1. **T-0 morning:** flip `STAGE=CUSTODY` behind the feature flag system (01 §Activation); run migration set G1–G6 (each protocol lists its migrations); deploy to the hardened environment (04).
2. **T-0 midday:** sandbox-verify the four money paths end-to-end with the MFB's UAT environment: collect → escrow → payout; deposit → placement; vault top-up → placement; penalty → charity account. The prototype's 283-check suite runs unchanged, plus each protocol's activation tests.
3. **T-0 evening:** enable 2FA enforcement for hosts and any account moving > Rs 50k (04); switch AML rules to enforce mode (06); eCIB reporting stays in shadow mode for 30 days (02).
4. **T+1 to T+7:** pilot cohort only (allowlisted circles), daily reconciliation reports (01 §Recon), weekly compliance review (06).

## What is intentionally NOT in this vault
- Anything that changes the Stage-1 prototype's behaviour today.
- Marketing, pricing, or fundraising material.
- Anything that would need to be hidden from a regulator — the entire point of this folder is that it can be handed to SECP/SBP as the implementation plan.
