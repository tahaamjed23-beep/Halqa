// Service-charge discounts (Taha, 2026-07-23). A member earns a discount on
// Halqa's fees by lowering their own default risk. We take the LARGEST that
// applies (they don't stack):
//   - Guarantee cheque collected → 95%  (a physical cheque unlocks the 489-F
//     criminal route, the strongest deterrent, so this member is lowest-risk).
//   - Income slip + employer verified → 80%  (certain, traceable income).
//   - Salary account linked → 20%  (Money Fellows steer to the salary account).
// Everything is recorded, never held — this is a pricing lever, not custody.
export type DiscountInput = {
  chequeSecuredAt?: Date | string | null;
  incomeVerifiedAt?: Date | string | null;
  salaryAccountLinked?: boolean;
};
export const CHEQUE_DISCOUNT_BPS = 9500;
export const INCOME_DISCOUNT_BPS = 8000;
export const SALARY_DISCOUNT_BPS = 2000;

export const feeDiscountBps = (m: DiscountInput): number => Math.max(
  m.chequeSecuredAt ? CHEQUE_DISCOUNT_BPS : 0,
  m.incomeVerifiedAt ? INCOME_DISCOUNT_BPS : 0,
  m.salaryAccountLinked ? SALARY_DISCOUNT_BPS : 0,
);

export const discountReason = (m: DiscountInput): string | null =>
  m.chequeSecuredAt ? 'Guarantee cheque on file' :
  m.incomeVerifiedAt ? 'Income & employer verified' :
  m.salaryAccountLinked ? 'Salary account linked' : null;

// Apply the member's discount to a fee amount (paisa) — used wherever a service
// charge is levied so the discount is consistent everywhere.
export const applyFeeDiscount = (feePaisa: bigint, m: DiscountInput): bigint =>
  feePaisa - (feePaisa * BigInt(feeDiscountBps(m))) / 10_000n;
