// ---------------------------------------------------------------------------
// WHAT A MEMBER PAYS
//
// One source for every price the app shows. The Fees screen, the Pay screen,
// Hyper and the demo data all read from here, so a member can never be quoted
// one fee on one screen and charged another on the next.
//
// Rewritten to the chairman's decisions of 30 September and 5 October 2026.
// What changed, and why:
//
//   The grid of Rs 100 to Rs 500 by instalment size and roster size is
//   WITHDRAWN. There is now ONE fee, Rs 85, on every monthly instalment,
//   whatever the instalment and whatever the roster. It is the running cost of
//   one payment, at most Rs 35, plus Rs 50. A fee that rose with the pot was a
//   price on the size of the money rather than on the work of collecting it.
//
//   The fee stays flat across a roster for the reason it always was: the member
//   who collects first pays exactly what the member who collects last pays. A
//   fee graded by collection day would be a price on the time between paying in
//   and collecting, which reads as interest.
//
//   The PAYMENT SERVICE FEE of 1.5 per cent is the payment partner's, not
//   Halqa's, and is charged ONLY on wallet and card payments, which pass
//   through them. A direct debit at the partner bank does not, so it carries
//   nothing (5 October 2026).
//
//   TAKAFUL OR INSURANCE is named, never priced here. It is the operator's
//   product, the bank chooses the operator, the operator sets the contribution,
//   and it is no part of Halqa's fee or Halqa's income. Halqa holds no cover of
//   its own and promises no payment on anybody's default.
// ---------------------------------------------------------------------------

/** Halqa's own fee on a monthly instalment, in rupees. Flat, for every seat. */
export const SERVICE_FEE_RUPEES = 85;
export const SERVICE_FEE_PAISA = SERVICE_FEE_RUPEES * 100;

/** The running cost of collecting one payment, in rupees. The ceiling, not the average. */
export const RUNNING_COST_RUPEES = 35;

/** The payment partner's fee, in basis points of the instalment. */
export const PSP_FEE_BPS = 150;

/** Rails that pass through the payment partner, and so carry its fee. */
export const PSP_RAILS = ['CARD', 'WALLET'] as const;
export type Rail = 'RAAST' | 'CARD' | 'WALLET' | 'BANK_TRANSFER' | 'MANDATE';

export const railCarriesPspFee = (rail: Rail | string | undefined | null) =>
  !!rail && (PSP_RAILS as readonly string[]).includes(rail);

/** The payment partner's fee on this instalment, in paisa. Nil on the bank's own rails. */
export const pspFeePaisa = (instalmentPaisa: number, rail: Rail | string | undefined | null) =>
  railCarriesPspFee(rail) ? Math.round(instalmentPaisa * PSP_FEE_BPS / 10_000) : 0;

/** Everything a member pays on one instalment, split so each part can be shown. */
export function instalmentCost(instalmentPaisa: number, rail: Rail | string | undefined | null) {
  const psp = pspFeePaisa(instalmentPaisa, rail);
  return {
    instalmentPaisa,
    serviceFeePaisa: SERVICE_FEE_PAISA,
    pspFeePaisa: psp,
    // Named, never priced here: the operator sets it, the bank chooses them.
    takafulLabel: 'Set by the operator',
    totalPaisa: instalmentPaisa + SERVICE_FEE_PAISA + psp,
  };
}

// ---------------------------------------------------------------------------
// DISCOUNTS
//
// Anything that lowers the risk of a missed payment lowers the fee. The largest
// discount that applies is taken; discounts do not stack.
//
// OPEN QUESTION for the chairman, raised 5 October 2026: on the withdrawn grid a
// fee of Rs 500 less 80 per cent still left Rs 100, above the running cost. On
// the flat Rs 85 fee, 80 per cent leaves Rs 17, which is BELOW the Rs 35 it
// costs to collect the payment, so a discounted instalment would lose money.
// The percentages below are the ones last decided and stand until that is
// settled.
// ---------------------------------------------------------------------------
export const DISCOUNTS = [
  { key: 'cheque', label: 'Guarantee cheque on file', pct: 80 },
  { key: 'income', label: 'Income and employer verified', pct: 50 },
] as const;

export type DiscountKey = typeof DISCOUNTS[number]['key'];

export function serviceFee(has: Partial<Record<DiscountKey, boolean>> = {}) {
  const best = DISCOUNTS.filter(d => has[d.key]).sort((a, b) => b.pct - a.pct)[0];
  const pct = best ? best.pct : 0;
  return {
    base: SERVICE_FEE_RUPEES,
    pct,
    discount: best ? best.label : null,
    fee: Math.round(SERVICE_FEE_RUPEES * (100 - pct) / 100),
  };
}

// ---------------------------------------------------------------------------
// HYPER
//
// Two fixed configurations, never a free choice of numbers. Each daily payment
// splits three ways: the contribution goes to the member collecting that day,
// the takaful or insurance contribution goes to the operator, and the fee goes
// to Halqa. Nothing is pooled with Halqa.
//
// The fee is Rs 15 a day on BOTH configurations (29 September 2026). It was
// Rs 75 and Rs 83.33. The rest of the daily payment that is not contribution is
// the operator's, and its amount is theirs to set.
//
// Two identities hold for both, and a configuration breaking either is refused:
//   pot = contribution x days          roster = collecting each day x days
// ---------------------------------------------------------------------------

export type HyperOption = {
  id: 'H50' | 'H26';
  name: string;
  cycle: string;
  members: number;
  days: number;
  collectingDaily: number;
  daily: number;
  contribution: number;
  /** The operator's part of the daily payment. Named to the member, not priced by Halqa. */
  takaful: number;
  fee: number;
  pot: number;
  /** members paying on any one day, who are assigned across that day's collectors */
  payersDaily: number;
};

/** Halqa's fee on a Hyper day, in rupees. The same on both configurations. */
export const HYPER_FEE_RUPEES = 15;

export const HYPER_OPTIONS: HyperOption[] = [
  {
    id: 'H50', name: '50-day circle', cycle: '50 days, every day',
    members: 400, days: 50, collectingDaily: 8,
    daily: 450, contribution: 300, takaful: 135, fee: HYPER_FEE_RUPEES, pot: 15000, payersDaily: 392,
  },
  {
    id: 'H26', name: '26-day circle', cycle: '26 days, Sundays off',
    members: 390, days: 26, collectingDaily: 15,
    daily: 500, contribution: 333.33, takaful: 151.67, fee: HYPER_FEE_RUPEES, pot: 8666.67, payersDaily: 375,
  },
];

/** How many payers settle straight to each collector on a given day. */
export const payersPerCollector = (o: HyperOption) => o.payersDaily / o.collectingDaily;
