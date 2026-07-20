import { createHash } from 'node:crypto';

export const RISK_MODEL_VERSION = 'HALQA-RM-2.0.0';
export type Decision = 'ACTIVE' | 'GUARDED' | 'DEFERRED' | 'REJECTED';
export type RiskBandName = 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME';

const TITLES = [
  'Treasury Bills (91-Day)','Treasury Bills (182-Day)','Treasury Bills (364-Day)','Government Ijarah Sukuk','Sovereign Hybrid Sukuk','Special Savings Certificate','Regular Income Certificates','Defence Savings Certificates','Islamic Naya Pakistan Certificates','Conventional Money Market Funds','Islamic Money Market Funds','Income Funds','Islamic Income Funds','Certificate of Islamic Investment','Balanced Funds','PSX Index ETFs','Shariah-Compliant Equity Funds','Gold-Linked Savings','Fractional Real Estate Crowdfunding','P2P Invoice Discounting','Stablecoin Yield Farming','App-Native Microloans','Agricultural Commodity Futures','Corporate Sukuk','Bank Term Deposits','Currency-Hedged Dual Pool','T-Bill Ladder','Yield-Curve Allocation','Multi-Scheme Basket','Seasonal Opportunity Fund','Profit Recycling','Cross-Committee Investment Pool','Institution Reverse Auction','Murabaha Trade Finance','Premium Prize Bonds','Extended Hold Window','Grace-Period Yield Capture','Early Collection Incentive','Delayed Distribution','Multi-Cycle Compounding','Staggered Liquidation','50% Rotating Reinvestment Cap','Progressive Reinvestment Ratio','Member-Choice Reinvestment','All-In Investment Circle','Penalty Bonus Pool','Timeliness-Weighted Profit','Capital-Days Profit Distribution','Defaulter Profit Offset','Host Profit Share','Turn-Position Profit Adjustment','Dynamic Turn Pricing','Turn-Sale Auctions','Investment Profit Preview','Cross-Committee Turn Exchange','Non-Member Turn Purchase','Individual Savings Vault','Referral Yield Bonus','Committee Insurance Pool','Savings Streaks','Loyalty Tiers','Education Rewards','Risk-Adjusted Leaderboard','Contribution Sizing Calculator','Fee-Free First Cycle','Refundable Security Deposit','Graduated Deposit Scaling','Promissory Note','Profit Withholding as Collateral','Progressive Late Penalty','Interest on Late Payments','Deposit Yield','Credit-Weighted Turn Order','Partial Payout Buffer','Auto-Debit Mandate','Split Payout','Exposure-to-Obligation Cap','Guarantor','Group Joint Liability','Default Feature Lock','Payment Status Board','Smart Nudging','Deadline Countdown','Peer Nudge','Never-Late Badge','Structured Member Reviews','Reliability Leaderboard','Default Impact Simulator','Post-Receipt Default Penalty','Credit-Bureau Reporting','Rehabilitation Path','Shared External Blacklist','Inactive Defaulter Score Decay','Explainable Default Prediction','Dynamic Deposit Top-Up','Statement Payment Matching','Blockchain Escrow','Payroll Deduction','Licensed Default Insurance',
] as const;

const ACTIVE = new Set([1,2,3,4,5,6,7,9,10,11,27,28,29,31,36,37,38,39,40,41,43,45,46,48,49,52,53,54,60,61,62,63,64,65,66,67,69,70,72,73,74,77,78,80,81,82,83,84,85,86,87,88,89,91,94,95]);
const GUARDED = new Set([8,12,13,14,18,24,25,26,32,33,34,35,56,59,68,75,96,98,99]);
const REJECTED = new Set([21,22,23,30,42,44,47,50,51,55,57,58,71,76,79,90,92,93,97]);

// GUARDED strategies that a licensed bank partner activates (see partner-catalog).
const PARTNER_UNLOCK_SET = new Set([75, 96, 99]);

export const STRATEGY_CATALOG = TITLES.map((title, index) => {
  const id = index + 1;
  const decision: Decision = ACTIVE.has(id) ? 'ACTIVE' : GUARDED.has(id) ? 'GUARDED' : REJECTED.has(id) ? 'REJECTED' : 'DEFERRED';
  const domain = id <= 35 ? 'INVESTMENT' : id <= 65 ? 'STRUCTURE' : 'SOLVENCY';
  return { id, title, domain, decision, partnerUnlocked: PARTNER_UNLOCK_SET.has(id) };
});

export const CONFLICT_DECISIONS = [
  { group: 'allocation-control', selected: [43,45], rejected: [42,44], reason: 'A group pool needs one locked schedule. Investment circles may reach 100%; rotating circles retain the conservative cap.' },
  { group: 'profit-allocation', selected: [48,49], rejected: [47,50,51], reason: 'Capital-days is auditable and economically causal; host and turn-position premiums create hidden redistribution.' },
  { group: 'payout-security', selected: [74,77], rejected: [76], reason: 'A disclosed rolling buffer protects the circle without replacing the ROSCA payout with installments.' },
  { group: 'delinquency-cost', selected: [70], rejected: [71], reason: 'Fixed disclosed penalties avoid compounding interest and Shariah/predatory-credit concerns.' },
  { group: 'marketplace', selected: [52,53,54], rejected: [55], reason: 'Committee-scoped auctions preserve obligations and consent. Cross-committee swaps create unbounded settlement coupling.' },
  { group: 'default-accountability', selected: [66,69,73,74,77,78,89,91], rejected: [79,90,92,93,97], reason: 'Direct, consented and reversible controls beat collective punishment, unlicensed reporting, decay and blockchain theatre.' },
  { group: 'platform-scope', selected: [60,61,62,63,64,65], rejected: [57,58], reason: 'Education and transparent rewards remain inside the committee product; personal custody and referral yield require a different licence and risk model.' },
] as const;

export interface RiskInput {
  mode: 'ROTATING' | 'HYBRID' | 'INVESTMENT';
  memberCount: number;
  periodDays: number;
  contributionPaisa: bigint;
  reinvestRatio: number;
  schemeRisk: number;
  schemeLiquidityDays: number;
  schemeVolatilityBps: number;
  averageCreditScore: number;
  minimumCreditScore: number;
  onTimeRatio: number;
  earlyPositionExposurePaisa: bigint;
  securityDepositPaisa: bigint;
  payoutBufferBps: number;
  liquidityReserveBps: number;
  concentrationBps: number;
  hasGuarantor: boolean;
}

export interface RiskFactor { key: string; label: string; score: number; weight: number; contribution: number; evidence: string; }
export interface RiskResult {
  modelVersion: string;
  score: number;
  band: RiskBandName;
  investmentRisk: number;
  defaultRisk: number;
  liquidityRisk: number;
  concentrationRisk: number;
  controlStrength: number;
  expectedLossBps: number;
  coverageRatioBps: number;
  depositRequiredPaisa: string;
  factors: RiskFactor[];
  recommendations: string[];
}

const clamp = (value: number, min = 0, max = 10) => Math.max(min, Math.min(max, value));
const round1 = (value: number) => Math.round(value * 10) / 10;
export const bandFor = (score: number): RiskBandName => score <= 3 ? 'LOW' : score <= 6 ? 'MEDIUM' : score <= 8 ? 'HIGH' : 'EXTREME';

export function assessRisk(input: RiskInput): RiskResult {
  const creditRisk = clamp((750 - input.averageCreditScore) / 35 + (680 - input.minimumCreditScore) / 70 + 2);
  const behaviorRisk = clamp((1 - input.onTimeRatio) * 12);
  const tenorMismatch = clamp((input.schemeLiquidityDays - Math.max(1, input.periodDays - 7)) / 12 + 1);
  const allocationRisk = clamp(input.reinvestRatio * 8 + (input.mode === 'INVESTMENT' ? 1.5 : 0));
  const marketRisk = clamp(input.schemeRisk * .7 + input.schemeVolatilityBps / 300);
  const concentrationRisk = clamp(input.concentrationBps / 1000);
  const depositCoverage = input.earlyPositionExposurePaisa > 0n
    ? Number((input.securityDepositPaisa * 10_000n) / input.earlyPositionExposurePaisa)
    : 10_000;
  const bufferCoverage = Math.max(0, input.payoutBufferBps) + depositCoverage;
  const controlStrength = clamp(
    depositCoverage / 1500 + input.payoutBufferBps / 2000 + input.liquidityReserveBps / 2500 +
    (input.hasGuarantor ? 1 : 0) + Math.max(0, input.averageCreditScore - 650) / 100,
  );
  const factors: RiskFactor[] = [
    { key:'credit', label:'Member reliability', score:round1(creditRisk), weight:.22, contribution:round1(creditRisk*.22), evidence:`Average ${Math.round(input.averageCreditScore)}, floor ${input.minimumCreditScore}` },
    { key:'behavior', label:'Payment behaviour', score:round1(behaviorRisk), weight:.18, contribution:round1(behaviorRisk*.18), evidence:`${Math.round(input.onTimeRatio*100)}% on-time history` },
    { key:'market', label:'Instrument risk', score:round1(marketRisk), weight:.18, contribution:round1(marketRisk*.18), evidence:`Scheme ${input.schemeRisk}/10; volatility ${input.schemeVolatilityBps} bps` },
    { key:'liquidity', label:'Maturity mismatch', score:round1(tenorMismatch), weight:.16, contribution:round1(tenorMismatch*.16), evidence:`${input.schemeLiquidityDays}d liquidity versus ${input.periodDays}d period` },
    { key:'allocation', label:'Capital at risk', score:round1(allocationRisk), weight:.14, contribution:round1(allocationRisk*.14), evidence:`${Math.round(input.reinvestRatio*100)}% allocation in ${input.mode.toLowerCase()} mode` },
    { key:'concentration', label:'Concentration', score:round1(concentrationRisk), weight:.12, contribution:round1(concentrationRisk*.12), evidence:`Largest exposure ${Math.round(input.concentrationBps/100)}%` },
  ];
  const raw = factors.reduce((sum, factor) => sum + factor.contribution, 0);
  const mitigated = clamp(raw - controlStrength * .18, 1, 10);
  const score = Math.max(1, Math.min(10, Math.round(mitigated)));
  const defaultRisk = round1(clamp(creditRisk*.55 + behaviorRisk*.45 - controlStrength*.2));
  const investmentRisk = round1(clamp(marketRisk*.55 + allocationRisk*.25 + concentrationRisk*.2));
  const liquidityRisk = round1(tenorMismatch);
  const expectedLossBps = Math.max(5, Math.round((defaultRisk*.55 + investmentRisk*.3 + liquidityRisk*.15) ** 2 * 8));
  const remaining = input.earlyPositionExposurePaisa;
  const targetCoverageBps = score <= 3 ? 3000 : score <= 6 ? 5000 : score <= 8 ? 7000 : 9000;
  const required = remaining * BigInt(targetCoverageBps) / 10_000n;
  const recommendations: string[] = [];
  if (tenorMismatch > 4) recommendations.push('Use a shorter-liquidity scheme or extend the payout buffer before starting.');
  if (creditRisk > 5) recommendations.push('Keep credit-weighted order and move weaker members to later positions.');
  if (depositCoverage < targetCoverageBps) recommendations.push(`Increase recorded security coverage to ${targetCoverageBps/100}% of post-payout obligations.`);
  if (concentrationRisk > 5) recommendations.push('Split allocation across two or three eligible low-correlation schemes.');
  if (input.reinvestRatio > .75) recommendations.push('Require explicit 100%-allocation consent and a no-early-liquidity warning from every member.');
  if (!recommendations.length) recommendations.push('Controls are proportionate; monitor payment behaviour before every payout.');
  return {
    modelVersion:RISK_MODEL_VERSION, score, band:bandFor(score), investmentRisk, defaultRisk, liquidityRisk,
    concentrationRisk:round1(concentrationRisk), controlStrength:round1(controlStrength), expectedLossBps,
    coverageRatioBps:bufferCoverage, depositRequiredPaisa:required.toString(), factors, recommendations,
  };
}

export function stressProjection(principalPaisa: bigint, annualRatePct: number, days: number, riskScore: number) {
  const rateBps=BigInt(Math.round(annualRatePct*100));
  const expected=principalPaisa*rateBps*BigInt(days)/3_650_000n;
  const stressBps=BigInt(Math.round(Math.min(.95,.08+riskScore*.065)*10_000));
  const liquidityHaircut=principalPaisa*BigInt(Math.max(0,riskScore-6)*25)/10_000n;
  return {
    principalPaisa: principalPaisa.toString(), days,
    downsideProfitPaisa: (expected*(10_000n-stressBps)/10_000n-liquidityHaircut).toString(),
    expectedProfitPaisa: expected.toString(),
    upsideProfitPaisa: (expected*(10_000n+stressBps*65n/100n)/10_000n).toString(),
    stressLossPaisa: (-principalPaisa*BigInt(Math.max(0,riskScore-7)*150)/10_000n).toString(),
  };
}

export const policyHash = (value: unknown) => createHash('sha256').update(JSON.stringify(value)).digest('hex');
