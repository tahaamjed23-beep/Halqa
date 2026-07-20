import { Router } from 'express';
import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '../db';
import { requireAuth } from '../lib/auth';
import { assertHost, assertMember } from '../lib/guards';
import { audit } from '../lib/audit';
import { assessRisk, CONFLICT_DECISIONS, policyHash, RISK_MODEL_VERSION, STRATEGY_CATALOG, stressProjection } from '../lib/risk-engine';
import { paisaInput } from '../lib/money';
import { buildProfitPlan } from '../lib/profit-engine';
import { activePartner } from '../lib/partner-catalog';

const router = Router();
router.use(requireAuth);

export function normalizedWeights(utilities: number[]): number[] {
  if (utilities.length === 1) return [10_000];
  const total = utilities.reduce((sum, utility) => sum + utility, 0);
  const weights = utilities.map(utility => Math.max(1_000, Math.min(6_000, Math.round(utility / total * 10_000))));
  let difference = 10_000 - weights.reduce((sum, weight) => sum + weight, 0);
  while (difference !== 0) {
    const eligible = weights
      .map((weight, index) => ({ weight, index, utility: utilities[index] }))
      .filter(item => difference > 0 ? item.weight < 6_000 : item.weight > 1_000)
      .sort((a, b) => difference > 0 ? b.utility - a.utility : a.utility - b.utility);
    if (!eligible.length) throw new Error('Unable to normalize portfolio weights');
    for (const item of eligible) {
      if (difference === 0) break;
      const room = difference > 0 ? 6_000 - weights[item.index] : weights[item.index] - 1_000;
      const adjustment = Math.min(Math.abs(difference), room);
      weights[item.index] += difference > 0 ? adjustment : -adjustment;
      difference += difference > 0 ? -adjustment : adjustment;
    }
  }
  return weights;
}

router.get('/catalog', async (_req, res, next) => {
  try {
    const partner = await activePartner(prisma);
    res.json({ modelVersion: RISK_MODEL_VERSION, strategies: STRATEGY_CATALOG, conflicts: CONFLICT_DECISIONS, partner: partner ? { name: partner.name, shortCode: partner.shortCode, sandbox: partner.sandbox } : null });
  } catch (error) { next(error); }
});

router.post('/portfolio/optimize',async(req,res,next)=>{try{
  const input=z.object({principalPaisa:paisaInput.refine(value=>value>0n,'Principal must be positive'),horizonDays:z.number().int().min(30).max(3650),riskTolerance:z.number().int().min(1).max(8),shariahOnly:z.boolean().default(false),maxSchemes:z.number().int().min(1).max(3).default(3),minimumLiquidityBufferDays:z.number().int().min(0).max(90).default(7)}).parse(req.body);
  const candidates=await prisma.scheme.findMany({where:{isActive:true,riskScore:{lte:input.riskTolerance},liquidityDays:{lte:Math.max(1,input.horizonDays-input.minimumLiquidityBufferDays)},...(input.shariahOnly?{shariahCompliant:true}:{})}});
  const ranked=candidates.map(scheme=>{const liquidityPenalty=Math.max(0,scheme.liquidityDays/input.horizonDays)*2;const utility=Math.max(.01,scheme.indicativeRatePct-scheme.riskScore*.85-liquidityPenalty-scheme.volatilityBps/2500);return{scheme,utility}}).sort((a,b)=>b.utility-a.utility).slice(0,input.maxSchemes);
  if(!ranked.length)return res.status(409).json({error:'No active scheme satisfies this risk and liquidity mandate'});
  const weights=normalizedWeights(ranked.map(item=>item.utility));let allocatedPrincipal=0n;
  const allocations=ranked.map((item,index)=>{const target=weights[index];const principal=index===ranked.length-1?input.principalPaisa-allocatedPrincipal:input.principalPaisa*BigInt(target)/10_000n;allocatedPrincipal+=principal;return{schemeId:item.scheme.id,name:item.scheme.name,weightBps:target,riskScore:item.scheme.riskScore,indicativeRatePct:item.scheme.indicativeRatePct,liquidityDays:item.scheme.liquidityDays,regulatoryStatus:item.scheme.regulatoryStatus,principalPaisa:principal.toString()}});
  const weightedRate=allocations.reduce((sum,item)=>sum+item.indicativeRatePct*item.weightBps/10_000,0);const weightedRisk=allocations.reduce((sum,item)=>sum+item.riskScore*item.weightBps/10_000,0);
  res.json({modelVersion:RISK_MODEL_VERSION,input:{...input,principalPaisa:input.principalPaisa.toString()},allocations,weightedRatePct:weightedRate,weightedRiskScore:Math.round(weightedRisk*10)/10,projection:stressProjection(input.principalPaisa,weightedRate,input.horizonDays,Math.round(weightedRisk)),disclaimer:'Constraint-based scenario, not investment advice or guaranteed execution.'});
}catch(error){next(error)}});

async function buildAssessment(committeeId: string) {
  const committee = await prisma.committee.findUnique({
    where: { id: committeeId },
    include: {
      scheme: true,
      members: { where: { status: 'ACTIVE' }, include: { user: true, securityDeposits: { where: { status: 'HELD' } } } },
      rounds: { include: { payments: true } },
    },
  });
  if (!committee) throw Object.assign(new Error('Committee not found'), { status: 404 });
  const members = committee.members;
  const allPayments = committee.rounds.flatMap(round => round.payments);
  const resolved = allPayments.filter(payment => payment.status !== 'PENDING');
  const onTimeRatio = resolved.length ? resolved.filter(payment => payment.status === 'PAID').length / resolved.length : 1;
  const averageCreditScore = members.length ? members.reduce((sum, member) => sum + member.user.creditScore, 0) / members.length : 700;
  const minimumCreditScore = members.length ? Math.min(...members.map(member => member.user.creditScore)) : 700;
  const first = members.reduce((best, member) => member.turnPosition < best.turnPosition ? member : best, members[0]);
  const remainingRounds = Math.max(0, members.length - 1);
  const exposure = first ? committee.contributionPaisa * BigInt(remainingRounds) : 0n;
  const deposits = members.flatMap(member => member.securityDeposits).reduce((sum, deposit) => sum + deposit.amountPaisa, 0n);
  const result = assessRisk({
    mode: committee.mode,
    memberCount: members.length,
    periodDays: committee.periodDays,
    contributionPaisa: committee.contributionPaisa,
    reinvestRatio: committee.reinvestRatio,
    schemeRisk: committee.scheme?.riskScore ?? 1,
    schemeLiquidityDays: committee.scheme?.liquidityDays ?? 1,
    schemeVolatilityBps: committee.scheme?.volatilityBps ?? 50,
    averageCreditScore,
    minimumCreditScore,
    onTimeRatio,
    earlyPositionExposurePaisa: exposure,
    securityDepositPaisa: deposits,
    payoutBufferBps: committee.payoutBufferBps,
    liquidityReserveBps: committee.liquidityReserveBps,
    concentrationBps: committee.schemeId ? 10_000 : 0,
    hasGuarantor: Boolean((committee.riskPolicyJson as { guarantorRequired?: boolean } | null)?.guarantorRequired),
  });
  return { committee, result };
}

router.get('/committee/:id', async (req, res, next) => {
  try {
    await assertMember(req.params.id, req.auth!.userId);
    const { committee, result } = await buildAssessment(req.params.id);
    const consent = await prisma.riskConsent.findFirst({ where: { committeeId: committee.id, userId: req.auth!.userId }, orderBy: { createdAt: 'desc' } });
    res.json({ ...result, consent, policy: committee.riskPolicyJson, memberConsentRequired: committee.memberConsentRequired, committeeStatus: committee.status, riskTolerance: committee.riskTolerance, mode: committee.mode });
  } catch (error) { next(error); }
});

router.post('/committee/:id/refresh', async (req, res, next) => {
  try {
    await assertHost(req.params.id, req.auth!.userId);
    const { committee, result } = await buildAssessment(req.params.id);
    const assessment = await prisma.$transaction(async tx => {
      const row = await tx.riskAssessment.create({ data: {
        committeeId: committee.id, modelVersion: result.modelVersion, score: result.score, band: result.band,
        investmentRisk: Math.round(result.investmentRisk), defaultRisk: Math.round(result.defaultRisk),
        liquidityRisk: Math.round(result.liquidityRisk), concentrationRisk: Math.round(result.concentrationRisk),
        controlStrength: Math.round(result.controlStrength), expectedLossBps: result.expectedLossBps,
        coverageRatioBps: result.coverageRatioBps, factorsJson: result.factors as unknown as Prisma.InputJsonValue, recommendationsJson: result.recommendations as Prisma.InputJsonValue,
      } });
      await tx.committee.update({ where: { id: committee.id }, data: { riskScore: result.score, riskBand: result.band } });
      await audit(tx, req.auth!.userId, 'RISK_ASSESSMENT_REFRESHED', 'Committee', committee.id, { modelVersion: result.modelVersion, score: result.score, band: result.band });
      return row;
    });
    res.json({ ...result, assessmentId: assessment.id });
  } catch (error) { next(error); }
});

router.get('/committee/:id/projection', async (req, res, next) => {
  try {
    await assertMember(req.params.id, req.auth!.userId);
    const query = z.object({ days: z.coerce.number().int().min(1).max(3650).optional() }).parse(req.query);
    const { committee, result } = await buildAssessment(req.params.id);
    const principal = committee.contributionPaisa * BigInt(Math.max(1, committee.members.length)) * BigInt(Math.round(committee.reinvestRatio * 10_000)) / 10_000n;
    const days = query.days ?? committee.periodDays * Math.max(1, committee.memberCap);
    res.json({ ...stressProjection(principal, committee.scheme?.indicativeRatePct ?? 0, days, result.score), riskScore: result.score, band: result.band, modelVersion: result.modelVersion });
  } catch (error) { next(error); }
});

router.get('/committee/:id/profit-plan', async (req, res, next) => {
  try {
    await assertMember(req.params.id, req.auth!.userId);
    const { committee, result } = await buildAssessment(req.params.id);
    const raw = (committee.riskPolicyJson && typeof committee.riskPolicyJson === 'object' ? committee.riskPolicyJson : {}) as Record<string, unknown>;
    const number = (key: string, fallback: number) => typeof raw[key] === 'number' ? raw[key] as number : fallback;
    const boolean = (key: string, fallback = false) => typeof raw[key] === 'boolean' ? raw[key] as boolean : fallback;
    const payout = committee.contributionPaisa * BigInt(Math.max(1, committee.memberCap));
    const targetDefault = payout / 10n;
    res.json(buildProfitPlan({
      memberCount: Math.max(1, committee.members.length || committee.memberCap),
      contributionPaisa: committee.contributionPaisa,
      periodDays: committee.periodDays,
      allocationBps: Math.round(committee.reinvestRatio * 10_000),
      annualRatePct: committee.scheme?.indicativeRatePct ?? 0,
      expectedLossBps: result.expectedLossBps,
      liquidityReserveBps: committee.liquidityReserveBps,
      insuranceReserveBps: committee.insuranceReserveBps,
      policy: {
        targetMemberProfitPaisa: BigInt(String(raw.targetMemberProfitPaisa ?? targetDefault)),
        platformProfitFeeBps: number('platformProfitFeeBps', 500),
        taxWithholdingBps: number('taxWithholdingBps', 0),
        earlyCollectionYieldBps: number('earlyCollectionYieldBps', 0),
        partnerRewardBps: number('partnerRewardBps', 0),
        partnerRewardsFunded: boolean('partnerRewardsFunded'),
        loyaltySubsidyPaisa: BigInt(String(raw.loyaltySubsidyPaisa ?? 0)),
        loyaltySubsidyFunded: boolean('loyaltySubsidyFunded'),
      },
    }));
  } catch (error) { next(error); }
});

router.patch('/committee/:id/policy', async (req, res, next) => {
  try {
    const committee = await assertHost(req.params.id, req.auth!.userId);
    if (committee.status !== 'FORMING') return res.status(409).json({ error: 'Risk policy locks when the committee starts' });
    const policy = z.object({
      payoutBufferBps: z.number().int().min(0).max(3000).default(1500),
      targetRiskScore: z.number().int().min(1).max(8).default(3),
      liquidityReserveBps: z.number().int().min(500).max(4000).default(1000),
      latePenaltyBps: z.number().int().min(0).max(1000).default(200),
      guarantorRequired: z.boolean().default(false),
      dynamicDeposit: z.boolean().default(true),
      profitCollateral: z.boolean().default(true),
      capitalDaysDistribution: z.boolean().default(true),
      delayedDistributionDays: z.number().int().min(0).max(90).default(0),
      profitRecycling: z.boolean().default(false),
      progressivePenalties: z.boolean().default(true),
      payoutHoldbackEnabled: z.boolean().default(true),
      holdbackReleasePayments: z.number().int().min(1).max(6).default(2),
      featureLockOnDefault: z.boolean().default(true),
      smartNudges: z.boolean().default(true),
      peerNudges: z.boolean().default(true),
      promissoryNoteRequired: z.boolean().default(false),
      autoDebitMandateRequired: z.boolean().default(false),
      depositYieldBps: z.number().int().min(0).max(2500).default(0),
      insuranceReserveBps: z.number().int().min(0).max(300).default(0),
      postReceiptPenaltyPoints: z.number().int().min(100).max(250).default(200),
      rehabilitationCooldownMonths: z.number().int().min(3).max(24).default(6),
      targetMemberProfitPaisa: paisaInput.default(0),
      platformProfitFeeBps: z.number().int().min(0).max(2000).default(500),
      taxWithholdingBps: z.number().int().min(0).max(5000).default(0),
      earlyCollectionYieldBps: z.number().int().min(0).max(300).default(0),
      partnerRewardBps: z.number().int().min(0).max(300).default(0),
      partnerRewardsFunded: z.boolean().default(false),
      loyaltySubsidyPaisa: paisaInput.default(0),
      loyaltySubsidyFunded: z.boolean().default(false),
      consentText: z.string().min(20).max(2000),
    }).parse(req.body);
    const modeRiskCap = committee.mode === 'ROTATING' ? 3 : committee.mode === 'HYBRID' ? 6 : 8;
    if (policy.targetRiskScore > modeRiskCap) return res.status(400).json({ error: `${committee.mode} committees permit a maximum risk mandate of ${modeRiskCap}/10` });
    // JSON columns cannot store bigint — serialize paisa fields to strings.
    const policyJson = { ...policy, targetMemberProfitPaisa: policy.targetMemberProfitPaisa.toString(), loyaltySubsidyPaisa: policy.loyaltySubsidyPaisa.toString() };
    const updated = await prisma.committee.update({ where: { id: committee.id }, data: {
      riskTolerance: policy.targetRiskScore, payoutBufferBps: policy.payoutBufferBps, liquidityReserveBps: policy.liquidityReserveBps,
      latePenaltyBps: policy.latePenaltyBps, riskPolicyJson: policyJson, memberConsentRequired: true,
      insuranceReserveBps: policy.insuranceReserveBps,
    } });
    await audit(prisma, req.auth!.userId, 'RISK_POLICY_UPDATED', 'Committee', committee.id, policyJson);
    res.json(updated);
  } catch (error) { next(error); }
});

router.post('/committee/:id/consent', async (req, res, next) => {
  try {
    await assertMember(req.params.id, req.auth!.userId);
    const committee = await prisma.committee.findUniqueOrThrow({ where: { id: req.params.id } });
    const { accepted } = z.object({ accepted: z.literal(true) }).parse(req.body);
    const policy = committee.riskPolicyJson ?? { reinvestRatio: committee.reinvestRatio, mode: committee.mode, schemeId: committee.schemeId };
    const hash = policyHash(policy);
    const row = await prisma.riskConsent.upsert({
      where: { committeeId_userId_policyHash: { committeeId: committee.id, userId: req.auth!.userId, policyHash: hash } },
      update: { status: accepted ? 'ACCEPTED' : 'PENDING', acceptedAt: accepted ? new Date() : null },
      create: { committeeId: committee.id, userId: req.auth!.userId, modelVersion: RISK_MODEL_VERSION, riskScore: committee.riskScore, policyHash: hash, status: 'ACCEPTED', acceptedAt: new Date() },
    });
    await audit(prisma, req.auth!.userId, 'RISK_POLICY_ACCEPTED', 'Committee', committee.id, { policyHash: hash, modelVersion: RISK_MODEL_VERSION });
    res.status(201).json(row);
  } catch (error) { next(error); }
});

export default router;
