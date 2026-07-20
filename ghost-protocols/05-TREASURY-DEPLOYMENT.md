# Ghost 05 — Treasury: turning computed yield into actual yield
*Unlocks needed: SECP licence + MFB partner. Code activation: ~1 day — the engines don't change; their output becomes real.*

## The principle
Every engine number today is computed at dated indicative rates. Treasury activation swaps the *source* of those numbers from "rate card" to "actual placement statements" while keeping every formula, test, and disclosure identical. Members see the same screens; the profit becomes withdrawable instead of indicative.

## Placement map (mirrors the existing scheme sleeves 1:1)
| Ledger pool | Placed into | Vehicle |
|---|---|---|
| Committee float (between pay-in and payout) | Islamic money-market | AMC fund account (daily liquidity) via MFB brokerage, or MFB Islamic savings if simpler at pilot scale |
| Security deposits | Mudarabah term deposits | MFB deposit products (their treasury WANTS this — granular, sticky) |
| Vault Standard/Income | money-market / Islamic income fund | AMC (Al Meezan / NBP Funds class) institutional account |
| Vault Gold | gold-linked | AMC gold fund units |
| Vault Crypto | **NOT deployed** | remains simulated-only at custody launch; revisit only with explicit regulatory clarity — the tier's warnings already say speculative |

## Mechanics
- **Sweep cadence:** float sweeps to the money-market account **T+0 end-of-day** (Raast credits are same-day); redemption T+1 against the payout calendar, which the 7-day payout buffer already accommodates (this is why that buffer exists in the prototype).
- **Unit accounting:** a `Placement` row maps ledger pools to fund units; daily NAV feed marks positions; realized profit posts to the ledger through the exact same reason codes the simulation uses (`FLOAT_PROFIT_REALIZED` etc.) — every existing test keeps passing because the interface is unchanged.
```prisma
model Placement { id String @id @default(cuid()); pool String; instrument String; unitsMilli BigInt; costPaisa BigInt; navDate DateTime; navPaisaPerUnit BigInt; @@index([pool]) }
```
- **Profit distribution:** unchanged — the engines already split realized profit by capital-days/patience/boosts. Halqa's 5% sweeps weekly (01).
- **Liquidity ladder:** ≥ 1.2× next-7-days payout obligations held in T+1-or-faster instruments at all times; breach = alerts + block new deployments (mirrors the prototype's liquidity-reserve policy fields, now enforced against real positions).
- **Rate honesty survives:** scheme cards keep dated rates, now stamped from actual NAV feeds instead of published rate cards; "indicative, never guaranteed" stays until a cycle's profit is realized, then it reads "realized".

## Risk limits (hard-coded, board-changeable)
Single-AMC concentration ≤ 60% at pilot (relaxes with scale) · committee float NEVER in anything beyond money-market · vault tier mandates locked to their sleeves (a Gold-tier rupee cannot touch equity) · zero leverage, zero derivatives, obviously.

## Activation checklist
- [ ] AMC institutional accounts opened (Shariah-compliant fund classes only); MFB deposit lines agreed
- [ ] NAV feed (email/API) parser live; Placement migration G5; liquidity-ladder alert wired
- [ ] Dry run: one week of real sweeps at Rs 50k scale, reconciled daily, before pilot circles switch
- [ ] Shariah adviser sign-off on the placement map (the same review that upgrades "halal by design" toward certification)
