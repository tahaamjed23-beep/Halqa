import { describe, expect, it } from 'vitest';
import {
  CATALOGUE, DELIVERY, allowedDelivery, deliveryAllowed, earlyBuyoutP, onDefault,
  outstandingAfter, ownershipSchedule, planFor, totalCostOfOwnership,
} from '../src/lib/asset-committee';

const phone = CATALOGUE.find(a => a.id === 'phone-mid')!;   // securable, Rs 75,000
const fridge = CATALOGUE.find(a => a.id === 'fridge')!;     // not securable
const RS = (n: number) => BigInt(Math.round(n * 100));

describe('sizing the committee from the asset', () => {
  it('divides the price across the rounds', () => {
    const p = planFor(phone, 10);
    expect(p.contributionP).toBe(RS(7_500));
    expect(p.totalP).toBe(phone.priceP);
    expect(p.premiumP).toBe(0n);
  });

  it('rounds the contribution up so the pot can never fall short of the invoice', () => {
    const odd = { ...phone, priceP: 1_000_001n };
    const p = planFor(odd, 3);
    expect(p.totalP).toBeGreaterThanOrEqual(odd.priceP);
    expect(p.premiumP).toBeGreaterThanOrEqual(0n);
    expect(p.premiumP).toBeLessThan(BigInt(p.rounds));   // residue only, never margin
  });

  it('charges no premium over the cash price', () => {
    // The circle buys the thing. There is no mark-up for time.
    for (const a of CATALOGUE) expect(planFor(a, 12).premiumP).toBeLessThan(12n);
  });
});

describe('the ownership problem', () => {
  it('delivers to everyone on the same day by default', () => {
    const p = planFor(phone, 10);
    const early = ownershipSchedule(p, 1);
    const late = ownershipSchedule(p, 10);
    expect(early.filter(e => e.delivered).map(e => e.round)).toEqual([10]);
    expect(late.filter(e => e.delivered).map(e => e.round)).toEqual([10]);
  });

  it('leaves nothing owed at the moment of delivery, so there is nothing to repossess', () => {
    const p = planFor(phone, 10);
    const atDelivery = ownershipSchedule(p, 1).find(e => e.delivered)!;
    expect(atDelivery.owedP).toBe(0n);
  });

  it('refuses early delivery for anything that cannot be secured', () => {
    expect(allowedDelivery(fridge)).toEqual([DELIVERY.ON_COMPLETION]);
    expect(deliveryAllowed(fridge, DELIVERY.AT_TURN)).toBe(false);
    expect(deliveryAllowed(phone, DELIVERY.AT_TURN)).toBe(true);
  });

  it('hands a securable asset over at the turn when that variant is chosen', () => {
    const p = planFor(phone, 10, DELIVERY.AT_TURN);
    expect(ownershipSchedule(p, 3).find(e => e.delivered)!.round).toBe(3);
  });
});

describe('default', () => {
  it('is an ordinary exit while nothing has been delivered', () => {
    const p = planFor(phone, 10);
    const d = onDefault(p, 4, false);
    expect(d.action).toBe('NONE_DELIVERED');
    expect(d.refundableP).toBe(RS(30_000));   // 4 x 7,500 back to them
  });

  it('locks a delivered device rather than chasing the member', () => {
    const p = planFor(phone, 10, DELIVERY.AT_TURN);
    expect(onDefault(p, 3, true).action).toBe('LOCK_DEVICE');
  });

  it('has no recovery route for a delivered unsecurable asset, which is why it is never delivered early', () => {
    const p = planFor(fridge, 10, DELIVERY.ON_COMPLETION);
    const d = onDefault(p, 3, true);
    expect(d.recoverable).toBe(false);
    expect(d.action).toBe('PURSUE_AS_DEBT');
  });
});

describe('what the member owes and can settle', () => {
  it('tracks the outstanding balance down to zero', () => {
    const p = planFor(phone, 10);
    expect(outstandingAfter(p, 0)).toBe(phone.priceP);
    expect(outstandingAfter(p, 10)).toBe(0n);
    expect(outstandingAfter(p, 99)).toBe(0n);
  });

  it('lets a member buy out early at the plain balance, with no penalty', () => {
    const p = planFor(phone, 10);
    expect(earlyBuyoutP(p, 6)).toBe(outstandingAfter(p, 6));
  });
});

describe('total cost of ownership', () => {
  it('is the cash price plus Halqa fees and nothing else', () => {
    const p = planFor(phone, 10);
    const t = totalCostOfOwnership(p, RS(50));
    expect(t.cashPriceP).toBe(phone.priceP);
    expect(t.halqaFeesP).toBe(RS(500));
    expect(t.allInP).toBe(phone.priceP + RS(500));
  });

  it('keeps the uplift over cash tiny, and states it', () => {
    const t = totalCostOfOwnership(planFor(phone, 10), RS(50));
    expect(t.upliftBps).toBeLessThan(100);   // under 1% of the cash price
  });
});
