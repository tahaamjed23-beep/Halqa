export type ProfitScenarioName = 'CONSERVATIVE' | 'TARGET' | 'UPSIDE';

export type ProfitPolicy = {
  targetMemberProfitPaisa: bigint;
  platformProfitFeeBps: number;
  taxWithholdingBps: number;
  earlyCollectionYieldBps: number;
  partnerRewardBps: number;
  partnerRewardsFunded: boolean;
  loyaltySubsidyPaisa: bigint;
  loyaltySubsidyFunded: boolean;
};

export type ProfitPlanInput = {
  memberCount: number;
  contributionPaisa: bigint;
  periodDays: number;
  allocationBps: number;
  annualRatePct: number;
  expectedLossBps: number;
  liquidityReserveBps: number;
  insuranceReserveBps: number;
  policy: ProfitPolicy;
};

const clampBps = (value: number, min = 0, max = 10_000) => Math.max(min, Math.min(max, Math.round(value)));
const mulBps = (amount: bigint, bps: number) => amount * BigInt(clampBps(bps)) / 10_000n;
const annualYield = (principal: bigint, ratePct: number, days: number) =>
  BigInt(Math.round(Number(principal) * Math.max(0, ratePct) / 100 * Math.max(0, days) / 365));

export function buildProfitPlan(input: ProfitPlanInput) {
  const memberCount = Math.max(1, Math.round(input.memberCount));
  const rounds = memberCount;
  const cycleDays = Math.max(input.periodDays, input.periodDays * rounds);
  const memberPrincipal = input.contributionPaisa * BigInt(rounds);
  const totalContributions = memberPrincipal * BigInt(memberCount);
  const allocationBps = clampBps(input.allocationBps);

  // Contributions arrive in equal installments. Each installment earns only for
  // the time it actually remains in the locked cycle, avoiding an upfront-funding illusion.
  let capitalDays = 0n;
  for (let round = 0; round < rounds; round += 1) {
    const daysInvested = Math.max(0, cycleDays - round * input.periodDays);
    capitalDays += input.contributionPaisa * BigInt(memberCount) * BigInt(daysInvested);
  }
  const allocatedCapitalDays = capitalDays * BigInt(allocationBps) / 10_000n;
  const reserveBps = clampBps(input.liquidityReserveBps + input.insuranceReserveBps, 0, 8_000);
  const productiveCapitalDays = allocatedCapitalDays * BigInt(10_000 - reserveBps) / 10_000n;

  const scenarioRates: Array<[ProfitScenarioName, number]> = [
    ['CONSERVATIVE', Math.max(0, input.annualRatePct * 0.7)],
    ['TARGET', Math.max(0, input.annualRatePct)],
    ['UPSIDE', Math.max(0, input.annualRatePct * 1.2)],
  ];
  const fundedPartnerRewards = input.policy.partnerRewardsFunded ? mulBps(totalContributions, input.policy.partnerRewardBps) : 0n;
  const fundedLoyalty = input.policy.loyaltySubsidyFunded ? input.policy.loyaltySubsidyPaisa : 0n;
  const collectionCapture = mulBps(totalContributions, input.policy.earlyCollectionYieldBps);

  const scenarios = scenarioRates.map(([name, ratePct]) => {
    const marketGross = BigInt(Math.round(Number(productiveCapitalDays) * ratePct / 100 / 365));
    const grossProfit = marketGross + collectionCapture + fundedPartnerRewards + fundedLoyalty;
    const expectedLoss = mulBps(grossProfit, input.expectedLossBps);
    const fee = mulBps(grossProfit - expectedLoss, input.policy.platformProfitFeeBps);
    const tax = mulBps(grossProfit - expectedLoss - fee, input.policy.taxWithholdingBps);
    const netProfit = [grossProfit - expectedLoss - fee - tax, 0n].reduce((a, b) => a > b ? a : b);
    const memberProfit = netProfit / BigInt(memberCount);
    return {
      name,
      annualRatePct: Math.round(ratePct * 100) / 100,
      marketGrossPaisa: marketGross.toString(),
      otherFundedIncomePaisa: (collectionCapture + fundedPartnerRewards + fundedLoyalty).toString(),
      expectedLossPaisa: expectedLoss.toString(),
      feePaisa: fee.toString(),
      taxPaisa: tax.toString(),
      netProfitPaisa: netProfit.toString(),
      memberProfitPaisa: memberProfit.toString(),
      memberReturnPct: Number(memberPrincipal) ? Math.round(Number(memberProfit) / Number(memberPrincipal) * 10_000) / 100 : 0,
    };
  });

  const target = scenarios.find(item => item.name === 'TARGET')!;
  const targetGap = input.policy.targetMemberProfitPaisa - BigInt(target.memberProfitPaisa);
  const requiredNetReturnPct = Number(memberPrincipal) ? Number(input.policy.targetMemberProfitPaisa) / Number(memberPrincipal) * 100 : 0;
  const impliedRequiredGrossRatePct = Number(productiveCapitalDays) > 0
    ? Number(input.policy.targetMemberProfitPaisa * BigInt(memberCount)) * 365 / Number(productiveCapitalDays) * 100
    : 0;

  return {
    cycleDays,
    memberPrincipalPaisa: memberPrincipal.toString(),
    totalContributionsPaisa: totalContributions.toString(),
    productiveCapitalDays: productiveCapitalDays.toString(),
    allocationBps,
    reserveBps,
    targetMemberProfitPaisa: input.policy.targetMemberProfitPaisa.toString(),
    requiredNetReturnPct: Math.round(requiredNetReturnPct * 100) / 100,
    impliedRequiredGrossRatePct: Math.round(impliedRequiredGrossRatePct * 100) / 100,
    targetGapPaisa: targetGap.toString(),
    feasibleAtIndicativeRate: targetGap <= 0n,
    scenarios,
    channels: [
      { key: 'MARKET_YIELD', label: 'Locked scheme yield', status: 'ACTIVE', funded: true },
      { key: 'EARLY_COLLECTION', label: 'Early-collection yield capture', status: input.policy.earlyCollectionYieldBps > 0 ? 'ACTIVE' : 'OFF', funded: input.policy.earlyCollectionYieldBps > 0 },
      { key: 'PARTNER_REWARDS', label: 'Merchant or payment-partner rewards', status: input.policy.partnerRewardsFunded ? 'FUNDED' : 'PLANNED', funded: input.policy.partnerRewardsFunded },
      { key: 'LOYALTY_SUBSIDY', label: 'Platform-funded loyalty subsidy', status: input.policy.loyaltySubsidyFunded ? 'FUNDED' : 'OFF', funded: input.policy.loyaltySubsidyFunded },
    ],
    warnings: [
      'Projections use indicative rates and are not guaranteed.',
      'Monthly contributions are time-weighted; the model does not pretend the full cycle principal was invested on day one.',
      'Unfunded partner rewards and subsidies are excluded from projected profit.',
    ],
  };
}
