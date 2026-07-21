import { Router, type NextFunction, type Request, type Response } from 'express';
import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '../db';
import { requireAuth } from '../lib/auth';
import { assertHost, assertMember } from '../lib/guards';
import { audit, ledger } from '../lib/audit';
import { clampScore, paisaInput, projectedReturn } from '../lib/money';
import { assessRisk, policyHash } from '../lib/risk-engine';
import { allocateCyclePool } from '../lib/distribution';
import { reputationFor } from '../lib/reputation';
import { activePartner, guaranteeFundAccount, guaranteeFundBalance, slotFeeBpsForRound } from '../lib/partner-catalog';
import { ensureSponsorUser, settleSponsorPayments } from '../lib/gap-fund';
import { DEPOSIT_SCHEME_SLUG, EARLY_BIRD_DAYS, FLOAT_MUDARIB_FEE_PCT, FLOAT_SCHEME_SLUG, earlyBirdFactor, patienceWeightTenths, pickPrizeIndex, qualifiesEarlyBird, roundFloatProfit } from '../lib/sukoon';

const router = Router();
router.use(requireAuth);
const protectionPolicy = (value: unknown) => (value && typeof value === 'object' ? value : {}) as Record<string, unknown>;

// Hidden operational policy (intentionally NOT surfaced in the UI): after an
// installment's due date a member gets a grace window of ~23% of the period
// (7 days on a 30-day circle, capped) before the strict, irreversible measures
// apply — the MISSED mark, the post-payout default ban and collateral
// forfeiture. Their reliability score and reputation still fall during the
// grace (settlement.ts / delinquency.ts apply the penalty on any late day);
// only the harsh consequences wait until the grace elapses.
const POST_DUE_GRACE_PCT = 0.23;
const postDueGraceDays = (periodDays: number) => Math.max(2, Math.min(14, Math.round(periodDays * POST_DUE_GRACE_PCT)));
const includeDetail = {
  host: { select: { id: true, fullName: true, username: true, creditScore: true } },
  scheme: true,
  partner: { select: { name: true, shortCode: true, sandbox: true } },
  floatScheme: { select: { name: true, indicativeRatePct: true, shariahCompliant: true } },
  depositScheme: { select: { name: true, indicativeRatePct: true, shariahCompliant: true } },
  members: { where: { status: 'ACTIVE' as const }, include: { user: { select: { id: true, fullName: true, username: true, creditScore: true, kycLevel: true } } }, orderBy: { turnPosition: 'asc' as const } },
  // (auto-debit mandate fields ride along on each member via the default select)
  rounds: { include: { recipient: { select: { id: true, fullName: true } }, payments: { include: { payer: { select: { id: true, fullName: true } } } }, investments: { include: { scheme: true } } }, orderBy: { roundNumber: 'asc' as const } },
} satisfies Prisma.CommitteeInclude;

router.get('/', async (req, res) => {
  const rows = await prisma.committee.findMany({
    where: { OR: [{ hostId: req.auth!.userId }, { members: { some: { userId: req.auth!.userId, status: 'ACTIVE' } } }, { status: 'FORMING', listedPublicly: true }] },
    include: { host: { select: { id: true, fullName: true, creditScore: true } }, scheme: true, members: { where: { status: 'ACTIVE' }, select: { userId: true, turnPosition: true, hasReceived: true } }, rounds: { where: { status: { in: ['COLLECTING', 'INVESTED'] } }, include: { payments: true }, take: 1 } },
    orderBy: { createdAt: 'desc' },
  });
  res.json(rows);
});

// Pre-join trust surface: resolve an invite code to the circle's terms and the
// host's verifiable reliability record WITHOUT joining. No membership required.
router.get('/preview/:inviteCode', async (req, res, next) => {
  try {
    const committee = await prisma.committee.findUnique({ where: { inviteCode: req.params.inviteCode.trim().toUpperCase() }, include: { scheme: true, members: { where: { status: 'ACTIVE' }, select: { id: true } } } });
    if (!committee) return res.status(404).json({ error: 'Invite code not found' });
    const host = await reputationFor(committee.hostId);
    res.json({
      id: committee.id, name: committee.name, mode: committee.mode, status: committee.status,
      memberCount: committee.members.length, memberCap: committee.memberCap,
      contributionPaisa: committee.contributionPaisa.toString(), periodDays: committee.periodDays,
      reinvestRatio: committee.reinvestRatio, riskScore: committee.riskScore, riskBand: committee.riskBand,
      distributionMode: committee.distributionMode, scheme: committee.scheme ? { name: committee.scheme.name, riskScore: committee.scheme.riskScore, indicativeRatePct: committee.scheme.indicativeRatePct } : null,
      host,
    });
  } catch (error) { next(error); }
});

router.get('/:id', async (req, res, next) => {
  try {
    await assertMember(req.params.id, req.auth!.userId);
    const committee = await prisma.committee.findUnique({ where: { id: req.params.id }, include: includeDetail });
    if (!committee) return res.status(404).json({ error: 'Committee not found' });
    const guaranteeFundPaisa = committee.custodyMode === 'BANK_CUSTODY' || committee.payoutGuaranteed ? (await guaranteeFundBalance(prisma, committee.id)).toString() : undefined;
    res.json({ ...committee, guaranteeFundPaisa });
  } catch (error) { next(error); }
});

router.post('/', async (req, res, next) => {
  try {
    const input = z.object({
      name: z.string().trim().min(3).max(80), memberCap: z.number().int().min(3).max(150),
      mode: z.enum(['ROTATING','HYBRID','INVESTMENT']).default('ROTATING'),
      contributionPaisa: paisaInput.refine(value => value <= 10_000_000_000n, 'Contribution exceeds the prototype safety limit'),
      cadencePreset: z.enum(['VERY_SHORT','SHORT','MID','LONG']), periodDays: z.number().int().min(1).max(365),
      minMembersToStart: z.number().int().min(3).max(30), reinvestRatio: z.number().min(0).max(1).default(0),
      riskTolerance: z.number().int().min(1).max(8).default(3),
      depositCoverageBps: z.number().int().min(3000).max(9000).default(7000),
      // Host's expectation of how many days before the due date members
      // typically pay. Drives the float-projection estimates only — actual
      // float profit is always computed from real payment timestamps.
      expectedPaymentLeadDays: z.number().int().min(0).max(365).default(0),
      schemeId: z.string().nullable().optional(), distributionMode: z.enum(['SHARE','COMPOUND']).default('SHARE'),
      orderMode: z.enum(['RANDOM_BALLOT','HOST_ASSIGNED','CREDIT_WEIGHTED']).default('CREDIT_WEIGHTED'),
      joinPolicy: z.enum(['OPEN_UNTIL_FULL','OPEN_UNTIL_DATE','INVITE_ONLY']).default('OPEN_UNTIL_FULL'),
      custodyMode: z.enum(['RECORDED','BANK_CUSTODY']).default('RECORDED'),
      payoutGuaranteed: z.boolean().default(false),
      slotFeeBps: z.number().int().min(0).max(300).default(0),
      tier: z.enum(['CLASSIC','SUKOON','BAZAAR','PRIORITY','SIGMA']).default('CLASSIC'),
      prizeDrawEnabled: z.boolean().default(false),
      earlyFeeBps: z.number().int().min(0).max(2000).default(0),
      dividendPooled: z.boolean().default(false),
      goalType: z.enum(['HAJJ','EDUCATION','WEDDING','HOME','BUSINESS','CUSTOM']).optional(),
      goalName: z.string().trim().max(60).optional(),
      goalTargetPaisa: paisaInput.optional(),
      allowHalqaFill: z.boolean().default(false),
      listedPublicly: z.boolean().default(false),
    }).parse(req.body);
    if (input.minMembersToStart > input.memberCap) return res.status(400).json({ error: 'Minimum members cannot exceed member capacity' });
    const allocationCap = input.mode === 'ROTATING' ? 0.25 : input.mode === 'HYBRID' ? 0.75 : 1;
    if (input.reinvestRatio > allocationCap) return res.status(400).json({ error: `${input.mode} committees allow a maximum ${allocationCap * 100}% investment allocation` });
    if (input.mode === 'INVESTMENT' && input.reinvestRatio < 0.5) return res.status(400).json({ error: 'Investment circles require at least 50% allocation' });
    if (input.contributionPaisa < 10000n) return res.status(400).json({ error: 'Contribution must be at least Rs 100' });
    const host = await prisma.user.findUniqueOrThrow({ where: { id: req.auth!.userId } });
    if (host.isBanned) return res.status(403).json({ error: 'Restricted accounts cannot host committees' });
    if (host.creditScore < 700) return res.status(403).json({ error: 'A credit score of 700 or higher is required to host' });
    // Hosting a RECORDED circle needs identity on file (CNIC), not bank KYC —
    // Level 2 (bank verification) gates only bank-custody circles below. This
    // was a launch blocker: every real signup starts at Level 1.
    if (host.kycLevel < 1 && process.env.NODE_ENV === 'production') return res.status(403).json({ error: 'Identity verification is required to host' });
    // Custody uses the bank partner; the Safety Fund (guaranteed payouts funded
    // by a per-round slot fee) works in EITHER mode — recorded (the fund is
    // tracked on the ledger, guaranteed up to its recorded balance) or, at
    // Stage 2, held by the custody partner. The guarantee pool logic in the
    // payout route keys off payoutGuaranteed/slotFeeBps, not custody mode.
    let partnerId: string | null = null;
    if (input.custodyMode === 'BANK_CUSTODY') {
      const partner = await activePartner(prisma);
      if (!partner || !partner.custodyEnabled) return res.status(409).json({ error: 'No active custody partner is available' });
      if (host.kycLevel < 2) return res.status(403).json({ error: 'Bank-verified identity (Level 2) is required to host a bank-custody circle' });
      partnerId = partner.id;
    }
    // Daily/very-short circles (< 7 days): the earning engines are not
    // applicable — no instrument settles inside the window, deposits have no
    // meaningful accrual, and the tempo raises operational risk. They run as
    // plain record-keeping rotations, stated plainly to the host.
    if (input.periodDays < 7 && (input.tier !== 'CLASSIC' || input.earlyFeeBps > 0 || input.reinvestRatio > 0 || input.prizeDrawEnabled)) {
      return res.status(400).json({ error: 'Circles shorter than 7 days run as plain rotations: the earning engines are not applicable at this tempo and such circles carry higher operational risk' });
    }
    // Large circles (> 30 members): permitted up to 150, but the interval must
    // stay within a month — a 100-person circle on long periods would take
    // years to complete and concentrate too much exposure per turn.
    if (input.memberCap > 30 && input.periodDays > 30) {
      return res.status(400).json({ error: 'Circles with more than 30 members must run on intervals of 30 days or less' });
    }
    if (input.mode === 'INVESTMENT' && (input.payoutGuaranteed || input.slotFeeBps > 0)) return res.status(400).json({ error: 'Investment circles have no rotating payouts to guarantee or price' });
    if (input.payoutGuaranteed && input.slotFeeBps < 50) return res.status(400).json({ error: 'Guaranteed payouts need a slot fee of at least 0.5% to fund the Safety Fund' });
    if (input.slotFeeBps > 0 && !input.payoutGuaranteed) return res.status(400).json({ error: 'A slot fee only applies to guaranteed circles — it funds the Safety Fund' });
    // Sukoon/Bazaar profit engine: rotating money earns on Islamic instruments
    // while it waits. Investment circles already have a maturity engine.
    let floatSchemeId: string | null = null;
    let depositSchemeId: string | null = null;
    if (input.tier === 'SUKOON' || input.tier === 'BAZAAR' || input.tier === 'SIGMA') {
      if (input.mode === 'INVESTMENT') return res.status(400).json({ error: 'Investment circles use the maturity engine; Sukoon, Bazaar and Sigma apply to rotating or hybrid circles' });
      const [floatScheme, depositScheme] = await Promise.all([
        prisma.scheme.findUnique({ where: { slug: FLOAT_SCHEME_SLUG } }),
        prisma.scheme.findUnique({ where: { slug: DEPOSIT_SCHEME_SLUG } }),
      ]);
      if (!floatScheme?.isActive || !depositScheme?.isActive) return res.status(409).json({ error: 'The Islamic float or deposit scheme is not active in the catalog' });
      floatSchemeId = floatScheme.id;
      depositSchemeId = depositScheme.id;
    }
    if (input.prizeDrawEnabled && (input.tier === 'CLASSIC' || input.tier === 'PRIORITY')) return res.status(400).json({ error: 'The prize draw needs the Sukoon, Bazaar or Sigma engine (it is funded from float profit)' });
    // Priority tier: a conventional, interest-style early fee — NOT Sukoon/
    // Bazaar's halal investment profit. Kept as its own tier so the two
    // return sources (real Mudarabah profit vs. a member-paid fee) are never
    // presented to a host as the same thing.
    if (input.tier === 'PRIORITY' || input.tier === 'SIGMA') {
      if (input.mode === 'INVESTMENT') return res.status(400).json({ error: 'Investment circles have no rotating turns for an early fee to apply to' });
      if (input.earlyFeeBps < 50) return res.status(400).json({ error: `${input.tier === 'SIGMA' ? 'Sigma' : 'Priority'} circles need an early fee of at least 0.5% for the dividend to be meaningful` });
      // The early fee is capped at 10% by policy — the headline rate never rises
      // above it; extra return has to come from real profit levers, not the fee.
      if (input.tier === 'SIGMA' && input.earlyFeeBps > 1000) return res.status(400).json({ error: 'The Sigma early fee is capped at 10%' });
    } else if (input.earlyFeeBps > 0) {
      return res.status(400).json({ error: 'The early fee requires the Priority or Sigma tier' });
    }
    // Pooled dividends route every early fee through the completion patience
    // split instead of equal monthly payouts — that split only exists on Sigma.
    if (input.dividendPooled && input.tier !== 'SIGMA') return res.status(400).json({ error: 'Pooled dividends require the Sigma tier (they are distributed through the patience split)' });
    const activeHosted = await prisma.committee.count({ where: { hostId: host.id, status: { in: ['FORMING','ACTIVE'] } } });
    if (activeHosted >= 5) return res.status(403).json({ error: 'Maximum of five active hosted committees reached' });
    let selectedScheme: { riskScore: number; liquidityDays: number; volatilityBps: number } | null = null;
    if (input.schemeId) {
      const scheme = await prisma.scheme.findUnique({ where: { id: input.schemeId } });
      if (!scheme || !scheme.isActive) return res.status(400).json({ error: 'Selected scheme is not active' });
      const schemeCap = Math.min(input.riskTolerance, input.mode === 'ROTATING' ? 3 : input.mode === 'HYBRID' ? 6 : 8);
      if (scheme.riskScore > schemeCap) return res.status(400).json({ error: `${input.mode} circles permit schemes up to risk ${schemeCap}/10` });
      // Rotating/hybrid circles must be able to liquidate before each payout; investment
      // circles lock capital until maturity, so only they may exceed the period horizon.
      if (input.mode !== 'INVESTMENT' && scheme.liquidityDays > Math.max(1, input.periodDays - 7)) return res.status(400).json({ error: `Scheme liquidity of ${scheme.liquidityDays} day(s) exceeds this circle's ${input.periodDays}-day period minus the 7-day payout buffer` });
      selectedScheme = scheme;
    }
    const initialRisk = assessRisk({ mode: input.mode, memberCount: 1, periodDays: input.periodDays, contributionPaisa: input.contributionPaisa, reinvestRatio: input.reinvestRatio, schemeRisk: selectedScheme?.riskScore ?? 1, schemeLiquidityDays: selectedScheme?.liquidityDays ?? 1, schemeVolatilityBps: selectedScheme?.volatilityBps ?? 50, averageCreditScore: host.creditScore, minimumCreditScore: host.creditScore, onTimeRatio: 1, earlyPositionExposurePaisa: input.contributionPaisa * BigInt(Math.max(0, input.memberCap - 1)), securityDepositPaisa: 0n, payoutBufferBps: 1500, liquidityReserveBps: 1000, concentrationBps: input.schemeId ? 10_000 : 0, hasGuarantor: false });
    const inviteCode = `HLQ-${crypto.randomUUID().slice(0,8).toUpperCase()}`;
    const committee = await prisma.$transaction(async tx => {
      const engineConsent = ` Members who record at least three quarters of their contributions three or more days early carry a disclosed 1.25x weight on their profit share (the early-bird boost). Late-payment penalties are ${input.tier === 'SUKOON' || input.tier === 'BAZAAR' ? 'donated to charity at completion, as Shariah requires — they never enrich other members or Halqa' : 'shared at completion among members who never paid late'}. Unused default-reserve contributions are refunded at completion.`;
      const tierConsent = input.tier === 'PRIORITY'
        ? ` This is a Priority (conventional) circle: taking an earlier turn costs a disclosed Early Fee, starting at ${(input.earlyFeeBps/100).toFixed(2)}% of that round's payout and declining to 0% for the last turn. The fee is paid immediately, every round, as an equal-split dividend to every other active member — never to Halqa. This early-fee/dividend structure has NOT been reviewed for Shariah compliance; choose Sukoon or Bazaar for a halal alternative. Late-payment penalties are shared at completion among members who never paid late; unused default-reserve contributions are refunded.`
        : input.tier === 'SIGMA'
        ? ` This is a Sigma (maximum-return, conventional) circle combining every return lever: (1) an Early Fee starting at ${(input.earlyFeeBps/100).toFixed(2)}% of the round payout for the earliest turn, declining to 0% for the last — ${input.dividendPooled ? 'pooled into the completion pot and distributed through the patience split' : 'paid immediately as an equal-split dividend to every other active member'}, never to Halqa; (2) a float sweep that places idle pool days in a disclosed Islamic money-market sleeve; (3) deposit yield pooled with the float profit and shared with a disclosed tilt toward later turn positions (weights 1.0x to 2.0x), so patience genuinely pays.${engineConsent} Because of the early-fee component this circle has NOT been reviewed for Shariah compliance; choose Sukoon or Bazaar for a halal alternative.${input.prizeDrawEnabled ? ' Half of each round\'s net float profit is gifted to one on-time payer chosen by a deterministic draw; principal is never staked.' : ''}`
        : input.tier === 'CLASSIC' ? '' : ` The ${input.tier === 'BAZAAR' ? 'Bazaar' : 'Sukoon'} engine places idle pool days and recorded deposits in disclosed Shariah-compliant schemes; profit is real but indicative, never guaranteed.${input.tier === 'BAZAAR' ? ' Your deposit is returned in full, but the float profit AND the deposit yield are pooled and shared with a disclosed tilt toward later turn positions (weights 1.0x to 2.0x): later turns carried the circle longest and receive the most, so the earliest turn may get back less profit than its own deposit earned.' : ' Deposit yield is paid to you, the depositor.'}${engineConsent}${input.prizeDrawEnabled ? ' Half of each round\'s net float profit is gifted to one on-time payer chosen by a deterministic draw; principal is never staked.' : ''}`;
      const created = await tx.committee.create({ data: { ...input, allowTurnSale: input.mode !== 'INVESTMENT', schemeId: input.schemeId || null, hostId: host.id, inviteCode, partnerId, floatSchemeId, depositSchemeId, riskScore: initialRisk.score, riskBand: initialRisk.band, riskPolicyJson: { targetRiskScore: input.riskTolerance, payoutBufferBps: 1500, liquidityReserveBps: 1000, latePenaltyBps: 200, guarantorRequired: false, dynamicDeposit: true, profitCollateral: true, capitalDaysDistribution: true, delayedDistributionDays: 0, profitRecycling: input.distributionMode === 'COMPOUND', consentText: (input.custodyMode === 'BANK_CUSTODY' ? `I understand that partner custody is simulated in the sandbox, the disclosed slot fee funds this circle's own guarantee pool, and ${input.payoutGuaranteed ? 'payout guarantees reach only as far as that pool\'s recorded balance' : 'payouts are not guaranteed'}.` : 'I understand that projected returns are indicative, capital can be delayed or reduced, and this committee records rather than custodies funds during Stage 1.') + tierConsent } } });
      await tx.committeeMember.create({ data: { committeeId: created.id, userId: host.id, turnPosition: 1 } });
      await audit(tx, host.id, 'COMMITTEE_CREATED', 'Committee', created.id, { memberCap: input.memberCap, contributionPaisa: input.contributionPaisa.toString(), periodDays: input.periodDays });
      return created;
    });
    res.status(201).json(committee);
  } catch (error) { next(error); }
});

router.post('/join', async (req, res, next) => {
  try {
    const { inviteCode } = z.object({ inviteCode: z.string().trim().min(3) }).parse(req.body);
    const committee = await prisma.committee.findUnique({ where: { inviteCode: inviteCode.toUpperCase() }, include: { members: { where: { status: 'ACTIVE' } } } });
    if (!committee) return res.status(404).json({ error: 'Invite code not found' });
    return joinCommittee(committee.id, req, res, next);
  } catch (error) { next(error); }
});
router.post('/:id/join', (req, res, next) => joinCommittee(req.params.id, req, res, next));
async function joinCommittee(committeeId: string, req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.auth!.userId;
    const joiningUser=await prisma.user.findUniqueOrThrow({where:{id:userId}});
    if(joiningUser.isBanned)return res.status(403).json({error:'Restricted accounts cannot join committees'});
    if(joiningUser.cooldownUntil && joiningUser.cooldownUntil > new Date())return res.status(403).json({error:`Rehabilitation cooldown applies until ${joiningUser.cooldownUntil.toISOString()}`});
    if(joiningUser.creditScore<550)return res.status(403).json({error:'A reliability score of 550 or higher is required to join'});
    // Newcomer first-circle installment cap removed (chairman-directed): a
    // member's exposure is governed by the reliability-score gate, graduated
    // collateral and credit-weighted ordering, not a fixed installment ceiling.
    const committee = await prisma.committee.findUnique({ where: { id: committeeId }, include: { members: { where: { status: 'ACTIVE' } } } });
    if (!committee) return res.status(404).json({ error: 'Committee not found' });
    if (committee.status !== 'FORMING') return res.status(409).json({ error: 'Committee has already started' });
    if (committee.members.length >= committee.memberCap) return res.status(409).json({ error: 'Committee is full' });
    const existing = committee.members.some(m => m.userId === userId);
    if (existing) return res.status(409).json({ error: 'Already a member' });
    const membership = await prisma.$transaction(async tx => {
      // Re-check the cap inside the transaction: two simultaneous joins both
      // pass the pre-read above, and a circle must never exceed its cap.
      const activeCount = await tx.committeeMember.count({ where: { committeeId: committee.id, status: 'ACTIVE' } });
      if (activeCount >= committee.memberCap) throw Object.assign(new Error('Committee is full'), { status: 409 });
      const nextPosition = committee.members.reduce((highest, member) => Math.max(highest, member.turnPosition), 0) + 1;
      const created = await tx.committeeMember.create({ data: { committeeId: committee.id, userId, turnPosition: nextPosition } });
      await audit(tx, userId, 'COMMITTEE_JOINED', 'Committee', committee.id, {});
      return created;
    });
    res.status(201).json(membership);
  } catch (error) { next(error); }
}

router.post('/:id/start', async (req, res, next) => {
  try {
    const { fundGap } = z.object({ fundGap: z.boolean().optional() }).parse(req.body ?? {});
    const committee = await assertHost(req.params.id, req.auth!.userId);
    if (committee.status !== 'FORMING') return res.status(409).json({ error: 'Only forming committees can start' });
    // The host can request gap-filling at start, OR have opted in at creation
    // (allowHalqaFill) so a not-full circle starts full automatically.
    const useFundGap = fundGap || committee.allowHalqaFill;
    const members = await prisma.committeeMember.findMany({ where: { committeeId: committee.id, status: 'ACTIVE' }, include: { user: true }, orderBy: { joinedAt: 'asc' } });
    if (members.length < committee.minMembersToStart) return res.status(409).json({ error: `At least ${committee.minMembersToStart} members are required` });
    if (committee.memberConsentRequired && (committee.reinvestRatio > 0 || committee.tier !== 'CLASSIC' || committee.earlyFeeBps > 0)) {
      const hash = policyHash(committee.riskPolicyJson ?? { reinvestRatio: committee.reinvestRatio, mode: committee.mode, schemeId: committee.schemeId });
      const accepted = await prisma.riskConsent.count({ where: { committeeId: committee.id, policyHash: hash, status: 'ACCEPTED', userId: { in: members.map(member => member.userId) } } });
      if (accepted !== members.length) return res.status(409).json({ error: `${members.length - accepted} member risk acknowledgement(s) are still required` });
    }
    const protection = protectionPolicy(committee.riskPolicyJson);
    if (protection.guarantorRequired || protection.promissoryNoteRequired || protection.autoDebitMandateRequired) {
      const commitments = await prisma.protectionCommitment.findMany({ where: { membershipId: { in: members.map(member => member.id) } } });
      const missing = members.filter(member => {
        const row = commitments.find(item => item.membershipId === member.id);
        return !row || !row.acceptedTermsAt || (protection.guarantorRequired === true && !row.guarantorUserId) || (protection.promissoryNoteRequired === true && !row.promissoryRef) || (protection.autoDebitMandateRequired === true && !row.autoDebitRef);
      });
      if (missing.length) return res.status(409).json({ error: `${missing.length} member protection commitment(s) are incomplete` });
    }
    // Fund-the-gap (Money Fellows model): fill the empty slots with platform
    // sponsor memberships so the circle starts full. Sponsor slots are created
    // AFTER the consent/protection checks (those cover real members only) and
    // are always ordered LAST — the platform pays into every round before it
    // collects, so members carry zero exposure to the sponsored positions.
    let sponsorMembers: typeof members = [];
    if (useFundGap && members.length < committee.memberCap) {
      const missing = committee.memberCap - members.length;
      for (let g = 1; g <= missing; g++) {
        const sponsor = await ensureSponsorUser(prisma, g);
        const membership = await prisma.committeeMember.upsert({
          where: { committeeId_userId: { committeeId: committee.id, userId: sponsor.id } },
          create: { committeeId: committee.id, userId: sponsor.id, status: 'ACTIVE', turnPosition: 1000 + g },
          update: { status: 'ACTIVE' },
        });
        sponsorMembers.push({ ...membership, user: sponsor } as (typeof members)[number]);
      }
    }
    // Money Fellows-style slot gating: identity-verified members (CNIC on file)
    // rank ahead of unverified ones for the early, high-exposure positions.
    // An unverified member is automatically slotted late — they pay in before
    // they ever collect, so their maximum possible damage is zero. Position is
    // the collateral in the no-deposit model.
    const verified = (m: (typeof members)[number]) => (m.user.cnic ? 1 : 0);
    const orderedReal = committee.orderMode === 'CREDIT_WEIGHTED'
      ? [...members].sort((a,b) => verified(b) - verified(a) || b.user.creditScore - a.user.creditScore || a.joinedAt.getTime() - b.joinedAt.getTime())
      : members;
    // Halqa's sponsor seats take the FIRST turns (host's creation choice): Halqa
    // collects early and pays its share over the rest of the cycle, minimising
    // Halqa's own capital at risk. Real members hold the later turns and rely on
    // Halqa's per-round auto-contribution (settleSponsorPayments) to be paid.
    const ordered = [...sponsorMembers, ...orderedReal];
    const now = new Date();
    await prisma.$transaction(async tx => {
      await tx.committeeMember.updateMany({ where: { committeeId: committee.id, status: 'ACTIVE' }, data: { turnPosition: { increment: 100 } } });
      for (let i=0; i<ordered.length; i++) await tx.committeeMember.update({ where: { id: ordered[i].id }, data: { turnPosition: i+1 } });
      const gross = committee.contributionPaisa * BigInt(ordered.length);
      // Pool-in-investment model: the turn-holder receives (1 - r) x pool now.
      // The held-back slice (r x pool) plus any realised profit is returned to
      // members at cycle completion per distributionMode.
      const reinvestBps=BigInt(Math.round(committee.reinvestRatio*10_000));
      const held = gross*reinvestBps/10_000n;
      const scheduledPayout = committee.mode === 'INVESTMENT' ? 0n : gross - held;
      const rounds = [];
      for (let i=0; i<ordered.length; i++) {
        const dueDate = new Date(now.getTime() + (i + 1) * committee.periodDays * 86400000);
        const payoutDate = new Date(dueDate.getTime() + 7 * 86400000);
        rounds.push(await tx.round.create({ data: { committeeId: committee.id, roundNumber: i+1, recipientId: ordered[i].userId, status: i===0 ? 'COLLECTING' : 'PENDING', dueDate, payoutDate, grossPoolPaisa: gross, reinvestPaisa: held, payoutPaisa: scheduledPayout, graceDays: postDueGraceDays(committee.periodDays) } }));
        const remainingDues = committee.contributionPaisa * BigInt(Math.max(0, ordered.length - i - 1));
        // Coverage raised 70%→90% (cap 95%) per chairman sign-off 2026-07-13:
        // the 100k simulation showed the old curve fully collateralised only
        // ~64% of worst-case (immediate post-payout) defaults.
        // Host-chosen deposit coverage base (30%–90%, clamped at create time).
        // The cap keeps ~5.5% headroom for the credit adjustment, mirroring the
        // old 90:95 relationship at any base the host picks.
        const coverageBase = committee.depositCoverageBps ?? 7000;
        const coverageCap = Math.min(9500, coverageBase + 500);
        const positionCoverageBps = ordered.length <= 1 ? 0 : Math.round(coverageBase * (ordered.length - i - 1) / (ordered.length - 1));
        const creditAdjustmentBps = Math.max(-1000, Math.min(1500, Math.round((700 - ordered[i].user.creditScore) * 10)));
        const requiredCoverageBps = Math.max(0, Math.min(coverageCap, positionCoverageBps + creditAdjustmentBps));
        
        const depositAmount = protection.dynamicDeposit === false ? 0n : remainingDues * BigInt(requiredCoverageBps) / 10_000n;
        if (depositAmount > 0n) await tx.securityDeposit.create({ data: { membershipId: ordered[i].id, amountPaisa: depositAmount, status: 'PENDING' } });
      }
      for (const member of ordered) await tx.payment.create({ data: { roundId: rounds[0].id, payerId: member.userId, amountPaisa: committee.contributionPaisa, dueDate: rounds[0].dueDate } });
      if (sponsorMembers.length) await settleSponsorPayments(tx, rounds[0].id, committee.id);
      await tx.committee.update({ where: { id: committee.id }, data: { status: 'ACTIVE', currentRound: 1, scheduleLockedAt: now } });
      await tx.notification.createMany({ data: ordered.map(m => ({ userId: m.userId, type: 'COMMITTEE_STARTED', message: `${committee.name} has started. Round 1 is collecting.` })) });
      await audit(tx, req.auth!.userId, 'COMMITTEE_STARTED', 'Committee', committee.id, { order: ordered.map(m => m.userId) });
    });
    res.json({ message: 'Committee started' });
  } catch (error) { next(error); }
});

router.get('/:id/payment-matrix', async (req, res, next) => {
  try {
    await assertHost(req.params.id, req.auth!.userId);
    const rounds = await prisma.round.findMany({ where: { committeeId: req.params.id }, include: { recipient: { select: { fullName: true } }, payments: { include: { payer: { select: { id: true, fullName: true, creditScore: true } } } } }, orderBy: { roundNumber: 'asc' } });
    res.json(rounds);
  } catch (error) { next(error); }
});

router.get('/:id/deposits', async (req, res, next) => {
  try {
    await assertMember(req.params.id, req.auth!.userId);
    const deposits = await prisma.securityDeposit.findMany({ where: { membership: { committeeId: req.params.id } }, include: { membership: { include: { user: { select: { id: true, fullName: true, username: true } } } } }, orderBy: { amountPaisa: 'desc' } });
    res.json(deposits);
  } catch (error) { next(error); }
});

router.post('/:id/deposits/:depositId/confirm', async (req, res, next) => {
  try {
    await assertHost(req.params.id, req.auth!.userId);
    const { txnRef } = z.object({ txnRef: z.string().trim().min(4).max(100) }).parse(req.body);
    const deposit = await prisma.securityDeposit.findFirst({ where: { id: req.params.depositId, membership: { committeeId: req.params.id } } });
    if (!deposit) return res.status(404).json({ error: 'Security deposit not found' });
    if (deposit.status !== 'PENDING') return res.status(409).json({ error: 'Security deposit has already been resolved' });
    const claimed = await prisma.securityDeposit.updateMany({ where: { id: deposit.id, status: 'PENDING' }, data: { status: 'HELD', txnRef, confirmedAt: new Date() } });
    if (claimed.count !== 1) return res.status(409).json({ error: 'Security deposit has already been resolved' });
    const updated = await prisma.securityDeposit.findUniqueOrThrow({ where: { id: deposit.id } });
    await ledger(prisma, { committeeId: req.params.id, actorId: req.auth!.userId, debit: `user:${deposit.membershipId}:external`, credit: `committee:${req.params.id}:deposit_reserve`, amountPaisa: deposit.amountPaisa, reason: 'SECURITY_DEPOSIT_RECORDED_STAGE_1', refType: 'SecurityDeposit', refId: deposit.id, idempotencyKey: `deposit:${deposit.id}:confirmed` });
    await audit(prisma, req.auth!.userId, 'SECURITY_DEPOSIT_RECORDED', 'SecurityDeposit', deposit.id, { txnRef, stage: 'RECORD_ONLY' });
    res.json(updated);
  } catch (error) { next(error); }
});

router.post('/:id/nudge/:userId', async (req, res, next) => {
  try {
    const committee = await assertHost(req.params.id, req.auth!.userId);
    await assertMember(req.params.id, req.params.userId);
    const notice = await prisma.notification.create({ data: { userId: req.params.userId, type: 'PAYMENT_NUDGE', message: `Reminder from ${committee.name}: please record your current contribution.` } });
    await audit(prisma, req.auth!.userId, 'PAYMENT_NUDGE_SENT', 'Committee', committee.id, { targetUserId: req.params.userId });
    res.status(201).json(notice);
  } catch (error) { next(error); }
});

router.post('/:id/default-cover/:paymentId', async (req, res, next) => {
  try {
    const committee = await assertHost(req.params.id, req.auth!.userId);
    const payment = await prisma.payment.findFirst({ where: { id: req.params.paymentId, round: { committeeId: committee.id }, status: 'MISSED' } });
    if (!payment) return res.status(404).json({ error: 'Missed payment not found' });
    const membership = await prisma.committeeMember.findUniqueOrThrow({ where: { committeeId_userId: { committeeId: committee.id, userId: payment.payerId } }, include: { securityDeposits: true, payoutHoldbacks: true } });
    const deposits = membership.securityDeposits.filter(item => item.status === 'FORFEITED').reduce((sum, item) => sum + item.amountPaisa, 0n);
    const holdbacks = membership.payoutHoldbacks.filter(item => item.status === 'FORFEITED').reduce((sum, item) => sum + item.amountPaisa, 0n);
    if (deposits + holdbacks < payment.amountPaisa) return res.status(409).json({ error: 'Recorded collateral is insufficient to cover this missed contribution' });
    await prisma.$transaction(async tx => {
      await tx.payment.update({ where: { id: payment.id }, data: { status: 'PAID', paidVia: 'DEFAULT_COLLATERAL', txnRef: `COVER-${payment.id}`, paidAt: new Date() } });
      await audit(tx, req.auth!.userId, 'DEFAULT_CONTRIBUTION_COVERED', 'Payment', payment.id, { depositsPaisa: deposits.toString(), holdbacksPaisa: holdbacks.toString(), amountPaisa: payment.amountPaisa.toString(), stage: 'RECORD_ONLY' });
      await tx.notification.create({ data: { userId: payment.payerId, type: 'DEFAULT_COLLATERAL_USED', message: `${committee.name} used your recorded collateral to cover a missed contribution. Your recovery obligation remains open.` } });
    });
    res.json({ message: 'Missed contribution covered from recorded collateral' });
  } catch (error) { next(error); }
});

router.post('/:id/invest', async (req, res, next) => {
  try {
    const committee = await assertHost(req.params.id, req.auth!.userId);
    const { idempotencyKey } = z.object({ idempotencyKey: z.string().min(8) }).parse(req.body);
    const allocationCap = committee.mode === 'ROTATING' ? 0.25 : committee.mode === 'HYBRID' ? 0.75 : 1;
    if (committee.reinvestRatio <= 0 || committee.reinvestRatio > allocationCap || !committee.schemeId) return res.status(400).json({ error: 'Committee investment configuration is invalid' });
    const round = await prisma.round.findFirst({ where: { committeeId: committee.id, status: 'COLLECTING' }, include: { payments: true } });
    if (!round) return res.status(409).json({ error: 'No collecting round' });
    const unpaidCount = round.payments.filter(payment => payment.status !== 'PAID').length;
    if (unpaidCount) return res.status(409).json({ error: `${unpaidCount} contribution(s) must be recorded before deployment` });
    const paidTotal = round.payments.filter(p => p.status === 'PAID').reduce((sum,p) => sum + p.amountPaisa, 0n);
    const principal = paidTotal*BigInt(Math.round(committee.reinvestRatio*10_000))/10_000n;
    if (principal <= 0n) return res.status(409).json({ error: 'No paid pool available to deploy' });
    const scheme = await prisma.scheme.findUniqueOrThrow({ where: { id: committee.schemeId } });
    const schemeCap = Math.min(committee.riskTolerance, committee.mode === 'ROTATING' ? 3 : committee.mode === 'HYBRID' ? 6 : 8);
    if (!scheme.isActive || scheme.riskScore > schemeCap) return res.status(400).json({ error: `Scheme exceeds this circle's risk limit (${schemeCap}/10)` });
    const investment = await prisma.$transaction(async tx => {
      const claimed = await tx.round.updateMany({ where: { id: round.id, status: 'COLLECTING' }, data: { status: 'INVESTED', reinvestPaisa: principal } });
      if (claimed.count !== 1) throw Object.assign(new Error('Round is no longer available for deployment'), { status: 409 });
      const row = await tx.investment.create({ data: { committeeId: committee.id, roundId: round.id, schemeId: scheme.id, principalPaisa: principal, ratePctAtDeploy: scheme.indicativeRatePct } });
      await ledger(tx, { committeeId: committee.id, actorId: req.auth!.userId, debit: `committee:${committee.id}:escrow`, credit: `committee:${committee.id}:investment`, amountPaisa: principal, reason: 'SIMULATED_INVESTMENT_DEPLOY', refType: 'Investment', refId: row.id, idempotencyKey });
      await audit(tx, req.auth!.userId, 'INVESTMENT_DEPLOYED', 'Investment', row.id, { principalPaisa: principal.toString(), stage: 'SIMULATED' });
      return row;
    });
    res.status(201).json(investment);
  } catch (error) { next(error); }
});

router.post('/:id/liquidate', async (req, res, next) => {
  try {
    const committee = await assertHost(req.params.id, req.auth!.userId);
    const { idempotencyKey } = z.object({ idempotencyKey: z.string().min(8) }).parse(req.body);
    const investment = await prisma.investment.findFirst({ where: { committeeId: committee.id, status: 'ACTIVE' }, include: { scheme: true, round: true } });
    if (!investment || !investment.round) return res.status(409).json({ error: 'No active investment' });
    const days = Math.max(1, Math.round((Date.now() - investment.deployedAt.getTime()) / 86400000));
    const profit = projectedReturn(investment.principalPaisa, investment.ratePctAtDeploy, days);
    const devFee = (profit * 5n) / 100n;
    const netProfit = profit - devFee;
    await prisma.$transaction(async tx => {
      const claimed = await tx.investment.updateMany({ where: { id: investment.id, status: 'ACTIVE' }, data: { status: 'LIQUIDATED', liquidatedAt: new Date(), realizedProfitPaisa: profit } });
      if (claimed.count !== 1) throw Object.assign(new Error('Investment was already liquidated'), { status: 409 });
      // Principal + net profit returns to the committee escrow (below); it is NOT
      // added to this round's payout. It stays pooled and is distributed to all
      // members at cycle completion per distributionMode.
      await tx.round.update({ where: { id: investment.roundId! }, data: { status: 'COLLECTING' } });
      await ledger(tx, { committeeId: committee.id, actorId: req.auth!.userId, debit: `committee:${committee.id}:investment`, credit: `committee:${committee.id}:escrow`, amountPaisa: investment.principalPaisa + netProfit, reason: 'SIMULATED_INVESTMENT_LIQUIDATION', refType: 'Investment', refId: investment.id, idempotencyKey });
      if (devFee > 0n) await ledger(tx, { committeeId: committee.id, actorId: req.auth!.userId, debit: `committee:${committee.id}:investment_profit`, credit: 'platform:fees', amountPaisa: devFee, reason: 'INVESTMENT_PROFIT_FEE_5_PERCENT', refType: 'Investment', refId: investment.id, idempotencyKey: `${idempotencyKey}:fee` });
      await audit(tx, req.auth!.userId, 'INVESTMENT_LIQUIDATED', 'Investment', investment.id, { profitPaisa: profit.toString(), devFeePaisa: devFee.toString(), stage: 'SIMULATED' });
    });
    res.json({ profitPaisa: profit, devFeePaisa: devFee, netProfitPaisa: netProfit });
  } catch (error) { next(error); }
});

router.get('/:id/investments', async (req, res, next) => {
  try {
    await assertMember(req.params.id, req.auth!.userId);
    res.json(await prisma.investment.findMany({ where: { committeeId: req.params.id }, include: { scheme: true }, orderBy: { deployedAt: 'desc' } }));
  } catch (error) { next(error); }
});

router.post('/:id/payout', async (req, res, next) => {
  try {
    const committee = await assertHost(req.params.id, req.auth!.userId);
    const { idempotencyKey } = z.object({ idempotencyKey: z.string().min(8) }).parse(req.body);
    const round = await prisma.round.findFirst({ where: { committeeId: committee.id, status: { in: ['COLLECTING','INVESTED'] } }, include: { payments: true } });
    if (!round) return res.status(409).json({ error: 'No active round' });
    if (round.status === 'INVESTED' || await prisma.investment.count({ where: { roundId: round.id, status: 'ACTIVE' } })) return res.status(409).json({ error: 'Liquidate the active investment before payout' });
    if (Date.now() < round.payoutDate.getTime()) return res.status(409).json({ error: `Payout is locked until ${round.payoutDate.toISOString()}` });
    const unpaid = round.payments.filter(p => p.status !== 'PAID');
    // Guaranteed circles (#99, partner rail): installments the delinquency
    // scheduler already escalated to MISSED can be covered by the circle's own
    // guarantee pool. PENDING/LATE ones still block, so coverage can never
    // short-circuit live collection, and the recipient's own installment is
    // still enforced by the eligibility check below.
    const coverable = committee.payoutGuaranteed ? unpaid.filter(p => p.status === 'MISSED') : [];
    const blocking = unpaid.length - coverable.length;
    if (blocking > 0) return res.status(409).json({ error: `${blocking} current contribution(s) are not paid` });
    const guaranteeShortfallPaisa = coverable.reduce((sum, p) => sum + p.amountPaisa, 0n);
    if (guaranteeShortfallPaisa > 0n) {
      const fundBalance = await guaranteeFundBalance(prisma, committee.id);
      if (fundBalance < guaranteeShortfallPaisa) return res.status(409).json({ error: `The guarantee pool holds ${fundBalance.toString()} paisa and cannot cover ${coverable.length} missed installment(s) totalling ${guaranteeShortfallPaisa.toString()} paisa` });
    }
    const recipientPayment = round.payments.find(payment => payment.payerId === round.recipientId);
    const eligibilityDeadline = round.payoutDate.getTime() - 7 * 86_400_000;
    if (!recipientPayment?.paidAt || recipientPayment.paidAt.getTime() > eligibilityDeadline) return res.status(409).json({ error: 'Recipient did not clear the current installment by the locked seven-day eligibility deadline' });
    const recipientMembership = await prisma.committeeMember.findUnique({ where: { committeeId_userId: { committeeId: committee.id, userId: round.recipientId } }, include: { securityDeposits: true, user: { select: { vaultParkingEnabled: true } } } });
    const unresolvedDeposit = recipientMembership?.securityDeposits.find(deposit => deposit.amountPaisa > 0n && deposit.status === 'PENDING');
    if (unresolvedDeposit) return res.status(409).json({ error: `The recipient's recorded security deposit of ${unresolvedDeposit.amountPaisa.toString()} paisa is not confirmed` });
    const members = await prisma.committeeMember.findMany({ where: { committeeId: committee.id, status: 'ACTIVE' } });
    const protection = protectionPolicy(committee.riskPolicyJson);
    const remainingRounds = Math.max(0, members.length - round.roundNumber);
    const holdbackEnabled = protection.payoutHoldbackEnabled !== false && remainingRounds > 0 && round.payoutPaisa > 0n;
    const holdbackPaisa = holdbackEnabled ? round.payoutPaisa * BigInt(committee.payoutBufferBps) / 10_000n : 0n;
    // Disclosed slot pricing (Oraan model): early positions pay the published
    // fee into this circle's guarantee pool; the final position pays nothing.
    const totalRounds = await prisma.round.count({ where: { committeeId: committee.id } });
    const slotFeePaisa = round.payoutPaisa * BigInt(slotFeeBpsForRound(committee.slotFeeBps, round.roundNumber, totalRounds)) / 10_000n;
    // Priority/Sigma (conventional, chit-fund style): the recipient pays a
    // disclosed Early Fee on the same declining curve as the guarantee slot
    // fee. Priority (and Sigma in monthly mode) pays it out as an immediate
    // dividend to every OTHER active member this same round. Sigma in pooled
    // mode leaves the fee in escrow so it reaches members through the
    // patience-weighted completion split instead — either way, never Halqa's.
    const earlyFeePaisa = committee.tier === 'PRIORITY' || committee.tier === 'SIGMA' ? round.payoutPaisa * BigInt(slotFeeBpsForRound(committee.earlyFeeBps, round.roundNumber, totalRounds)) / 10_000n : 0n;
    const releasedPayoutPaisa = round.payoutPaisa - holdbackPaisa - slotFeePaisa - earlyFeePaisa;
    // Sukoon/Bazaar float sweep: every PAID contribution earned the Islamic
    // money-market rate for the days it sat before this payout. Realised here,
    // minus the platform's Mudarib share; the net stays pooled in escrow for
    // the cycle-completion distribution.
    const floatScheme = committee.tier !== 'CLASSIC' && committee.floatSchemeId ? await prisma.scheme.findUnique({ where: { id: committee.floatSchemeId } }) : null;
    let grossFloatPaisa = floatScheme ? roundFloatProfit(round.payments.filter(p => p.status === 'PAID'), floatScheme.indicativeRatePct, round.payoutDate) : 0n;
    if (grossFloatPaisa > 0n && floatScheme) {
      // A slice deployed into the committee's scheme already earned investment
      // profit for its deployment window — the float sweep must not pay the
      // money-market rate on those same rupee-days twice.
      const deployed = await prisma.investment.findMany({ where: { roundId: round.id, status: 'LIQUIDATED' }, select: { principalPaisa: true, deployedAt: true, liquidatedAt: true } });
      for (const item of deployed) {
        const overlapDays = Math.max(0, Math.min(90, Math.floor(((item.liquidatedAt ?? round.payoutDate).getTime() - item.deployedAt.getTime()) / 86_400_000)));
        grossFloatPaisa -= projectedReturn(item.principalPaisa, floatScheme.indicativeRatePct, overlapDays);
      }
      if (grossFloatPaisa < 0n) grossFloatPaisa = 0n;
    }
    // Group staking streak (loyalty): a circle that has paid cleanly in prior
    // rounds earns a slightly longer effective float window — a disclosed bonus
    // of +5% per consecutive clean round, capped at +50% (10 clean rounds).
    // Funded from the same simulated sleeve; rewards discipline, never charges anyone.
    const streakBonusBps = BigInt(500 * Math.min(10, committee.cleanStreak));
    if (grossFloatPaisa > 0n && streakBonusBps > 0n) grossFloatPaisa += grossFloatPaisa * streakBonusBps / 10_000n;
    // Is THIS round clean? (every installment recorded on or before its due
    // date.) Drives next round's streak bonus; a late/missed payment resets it.
    const roundClean = round.payments.length > 0 && round.payments.every(p => p.status === 'PAID' && p.paidAt && p.paidAt.getTime() <= p.dueDate.getTime());
    const floatFeePaisa = grossFloatPaisa * FLOAT_MUDARIB_FEE_PCT / 100n;
    const netFloatPaisa = grossFloatPaisa - floatFeePaisa;
    // Prize draw (hiba): half the net float goes to one on-time payer, picked
    // deterministically from the round seed. Never touches principal.
    const onTimePaid = committee.prizeDrawEnabled ? round.payments.filter(p => p.status === 'PAID' && p.paidAt && p.paidAt.getTime() <= p.dueDate.getTime()).sort((a, b) => a.payerId.localeCompare(b.payerId)) : [];
    const prizePaisa = onTimePaid.length && netFloatPaisa > 1n ? netFloatPaisa / 2n : 0n;
    const prizeWinnerId = prizePaisa > 0n ? onTimePaid[pickPrizeIndex(`${committee.id}:${round.roundNumber}`, onTimePaid.length)].payerId : null;
    await prisma.$transaction(async tx => {
      const claimed = await tx.round.updateMany({ where: { id: round.id, status: round.status }, data: { status: 'CLOSED' } });
      if (claimed.count !== 1) throw Object.assign(new Error('Round payout was already processed'), { status: 409 });
      // Advance the staking streak for the NEXT round's loyalty bonus.
      await tx.committee.update({ where: { id: committee.id }, data: { cleanStreak: roundClean ? committee.cleanStreak + 1 : 0 } });
      if (committee.mode !== 'INVESTMENT') await tx.committeeMember.update({ where: { committeeId_userId: { committeeId: committee.id, userId: round.recipientId } }, data: { hasReceived: true } });
      // Payout Parking: recipients who opted in keep the payout recorded in
      // their personal vault (earning the float rate) instead of sweeping it
      // straight out. Same money, different account — their choice, reversible
      // any time via /vault/withdraw.
      const parkPayout = recipientMembership?.user.vaultParkingEnabled === true;
      if (releasedPayoutPaisa > 0n) await ledger(tx, { committeeId: committee.id, actorId: req.auth!.userId, debit: `committee:${committee.id}:escrow`, credit: parkPayout ? `user:${round.recipientId}:vault` : `user:${round.recipientId}:external`, amountPaisa: releasedPayoutPaisa, reason: parkPayout ? 'ROUND_PAYOUT_PARKED_IN_VAULT' : 'ROUND_PAYOUT_RECORDED', refType: 'Round', refId: round.id, idempotencyKey });
      if (slotFeePaisa > 0n) await ledger(tx, { committeeId: committee.id, actorId: req.auth!.userId, debit: `committee:${committee.id}:escrow`, credit: guaranteeFundAccount(committee.id), amountPaisa: slotFeePaisa, reason: 'SLOT_FEE_TO_GUARANTEE_POOL_RECORDED', refType: 'Round', refId: round.id, idempotencyKey: `${idempotencyKey}:slotfee` });
      if (earlyFeePaisa > 0n && committee.dividendPooled) {
        // Pooled mode: the fee never leaves escrow, so it lands in the
        // completion pool and flows through the patience split. Recorded as an
        // audit event, not a ledger move — the money genuinely stays put.
        await audit(tx, req.auth!.userId, 'EARLY_FEE_POOLED_FOR_PATIENCE', 'Round', round.id, { earlyFeePaisa: earlyFeePaisa.toString() });
        await tx.notification.createMany({ data: members.filter(m => m.userId !== round.recipientId).map(m => ({ userId: m.userId, type: 'EARLY_FEE_POOLED', message: `${committee.name}: this round's early fee of ${earlyFeePaisa.toString()} paisa was pooled for the patience-weighted completion split.` })) });
      } else if (earlyFeePaisa > 0n) {
        const others = members.filter(m => m.userId !== round.recipientId);
        const perMember = earlyFeePaisa / BigInt(others.length);
        let distributed = 0n;
        for (let i = 0; i < others.length; i++) {
          const share = i === others.length - 1 ? earlyFeePaisa - distributed : perMember;
          distributed += share;
          if (share > 0n) {
            await ledger(tx, { committeeId: committee.id, actorId: req.auth!.userId, debit: `committee:${committee.id}:escrow`, credit: `user:${others[i].userId}:external`, amountPaisa: share, reason: 'EARLY_FEE_DIVIDEND_RECORDED', refType: 'Round', refId: round.id, idempotencyKey: `${idempotencyKey}:dividend:${others[i].userId}` });
            await tx.notification.create({ data: { userId: others[i].userId, type: 'EARLY_FEE_DIVIDEND', message: `${committee.name}: you received ${share.toString()} paisa as your share of this round's early-fee dividend.` } });
          }
        }
      }
      if (netFloatPaisa > 0n) {
        await ledger(tx, { committeeId: committee.id, actorId: req.auth!.userId, debit: `committee:${committee.id}:float_investment`, credit: `committee:${committee.id}:escrow`, amountPaisa: netFloatPaisa, reason: 'FLOAT_SWEEP_PROFIT_SIMULATED', refType: 'Round', refId: round.id, idempotencyKey: `${idempotencyKey}:float` });
        if (floatFeePaisa > 0n) await ledger(tx, { committeeId: committee.id, actorId: req.auth!.userId, debit: `committee:${committee.id}:float_investment`, credit: 'platform:fees', amountPaisa: floatFeePaisa, reason: 'FLOAT_MUDARIB_FEE_5_PERCENT', refType: 'Round', refId: round.id, idempotencyKey: `${idempotencyKey}:floatfee` });
      }
      if (prizePaisa > 0n && prizeWinnerId) {
        await ledger(tx, { committeeId: committee.id, actorId: req.auth!.userId, debit: `committee:${committee.id}:escrow`, credit: `user:${prizeWinnerId}:external`, amountPaisa: prizePaisa, reason: 'PRIZE_HIBA_GIFT_RECORDED', refType: 'Round', refId: round.id, idempotencyKey: `${idempotencyKey}:prize` });
        await tx.notification.create({ data: { userId: prizeWinnerId, type: 'PRIZE_HIBA_WON', message: `${committee.name}: this round's profit gift of ${prizePaisa.toString()} paisa was recorded for you. Everyone's savings stay untouched.` } });
      }
      for (const covered of coverable) {
        await ledger(tx, { committeeId: committee.id, actorId: req.auth!.userId, debit: guaranteeFundAccount(committee.id), credit: `committee:${committee.id}:escrow`, amountPaisa: covered.amountPaisa, reason: 'GUARANTEE_POOL_COVERED_MISSED_INSTALLMENT', refType: 'Payment', refId: covered.id, idempotencyKey: `${idempotencyKey}:guarantee:${covered.id}` });
        await tx.recoveryCase.upsert({ where: { paymentId: covered.id }, update: { outstandingPaisa: covered.amountPaisa, status: 'OPEN' }, create: { userId: covered.payerId, committeeId: committee.id, roundId: round.id, paymentId: covered.id, outstandingPaisa: covered.amountPaisa, penaltyPaisa: covered.penaltyPaisa } });
        await tx.notification.create({ data: { userId: covered.payerId, type: 'GUARANTEE_COVERAGE', message: `${committee.name} covered your missed installment from the guarantee pool. Your recovery obligation to the pool remains open.` } });
      }
      if (holdbackPaisa > 0n && recipientMembership) await tx.payoutHoldback.create({ data: { committeeId: committee.id, membershipId: recipientMembership.id, roundId: round.id, amountPaisa: holdbackPaisa, requiredCleanPayments: Number(protection.holdbackReleasePayments ?? 2) } });
      const nextNumber = round.roundNumber + 1;
      const nextRound = await tx.round.findUnique({ where: { committeeId_roundNumber: { committeeId: committee.id, roundNumber: nextNumber } } });
      if (nextRound) {
        await tx.round.update({ where: { id: nextRound.id }, data: { status: 'COLLECTING' } });
        await tx.payment.createMany({ data: members.map(m => ({ roundId: nextRound.id, payerId: m.userId, amountPaisa: committee.contributionPaisa, dueDate: nextRound.dueDate })) });
        await settleSponsorPayments(tx, nextRound.id, committee.id); // gap-fund slots pay instantly every round
        await tx.committee.update({ where: { id: committee.id }, data: { currentRound: nextNumber } });
      } else {
        await tx.committee.update({ where: { id: committee.id }, data: { status: 'COMPLETED' } });
        const heldDeposits = await tx.securityDeposit.findMany({ where: { membership: { committeeId: committee.id }, status: 'HELD' }, include: { membership: true } });
        // Deposits That Earn: in Sukoon/Bazaar the recorded deposits accrue at
        // the Islamic deposit scheme's dated rate; Classic keeps the host-set bps.
        const depositScheme = committee.depositSchemeId ? await tx.scheme.findUnique({ where: { id: committee.depositSchemeId } }) : null;
        const depositYieldBps = depositScheme ? BigInt(Math.round(depositScheme.indicativeRatePct * 100)) : BigInt(Number(protection.depositYieldBps ?? 0));
        for (const deposit of heldDeposits) {
          const heldDays = BigInt(Math.max(1, Math.ceil((Date.now() - (deposit.confirmedAt ?? deposit.createdAt).getTime()) / 86_400_000)));
          const yieldPaisa = deposit.amountPaisa * depositYieldBps * heldDays / 3_650_000n;
          await tx.securityDeposit.update({ where: { id: deposit.id }, data: { status: 'REFUNDED', releasedAt: new Date(), accruedYieldPaisa: yieldPaisa } });
          await ledger(tx, { committeeId: committee.id, actorId: req.auth!.userId, debit: `committee:${committee.id}:deposit_reserve`, credit: `user:${deposit.membership.userId}:external`, amountPaisa: deposit.amountPaisa, reason: 'SECURITY_DEPOSIT_REFUND_RECORDED', refType: 'SecurityDeposit', refId: deposit.id, idempotencyKey: `${idempotencyKey}:deposit-refund:${deposit.id}` });
          // Deposit principal always returns in full (above). The YIELD it earned
          // is routed by tier:
          //  - Sukoon/Classic: paid to the depositor — your collateral, your yield.
          //  - Bazaar: pooled into escrow and shared through the patience-weighted
          //    split below. Early positions took their payout early (liquidity);
          //    late positions carried the circle longest, so the circle's savings
          //    yield flows to them. That is what makes "patience pays" actually true
          //    — otherwise early positions (who post the biggest collateral) would
          //    quietly earn the most, the opposite of the promise.
          if (yieldPaisa > 0n) {
            if (committee.tier === 'BAZAAR' || committee.tier === 'SIGMA') {
              await ledger(tx, { committeeId: committee.id, actorId: req.auth!.userId, debit: `committee:${committee.id}:deposit_investment`, credit: `committee:${committee.id}:escrow`, amountPaisa: yieldPaisa, reason: 'DEPOSIT_YIELD_POOLED_FOR_PATIENCE', refType: 'SecurityDeposit', refId: deposit.id, idempotencyKey: `${idempotencyKey}:deposit-yield:${deposit.id}` });
            } else {
              await ledger(tx, { committeeId: committee.id, actorId: req.auth!.userId, debit: `committee:${committee.id}:deposit_investment`, credit: `user:${deposit.membership.userId}:external`, amountPaisa: yieldPaisa, reason: 'SECURITY_DEPOSIT_YIELD_RECORDED', refType: 'SecurityDeposit', refId: deposit.id, idempotencyKey: `${idempotencyKey}:deposit-yield:${deposit.id}` });
            }
          }
        }
        for (const m of members) {
          const event = await tx.creditEvent.createMany({ data: [{ userId: m.userId, committeeId: committee.id, roundId: round.id, checkpoint: 'committee_completed', delta: 25, reason: 'Clean committee completion' }], skipDuplicates: true });
          if (event.count === 1) await tx.user.update({ where: { id: m.userId }, data: { creditScore: clampScore((await tx.user.findUniqueOrThrow({ where: { id: m.userId } })).creditScore + 25) } });
        }
        // Referral loyalty pool (chairman-approved): when a referred member
        // completes their FIRST cycle, the referrer earns Rs 250 — funded from
        // Halqa's own Mudarib share (platform:fees), never from members. Paid
        // once ever per referred member (idempotency key `referral:{userId}`).
        const referredMembers = await tx.user.findMany({ where: { id: { in: members.map(m => m.userId) }, referredById: { not: null } }, select: { id: true, fullName: true, referredById: true } });
        for (const referred of referredMembers) {
          const alreadyPaid = await tx.ledgerEntry.count({ where: { idempotencyKey: `referral:${referred.id}` } });
          if (alreadyPaid) continue;
          try {
            await ledger(tx, { committeeId: committee.id, actorId: referred.id, debit: 'platform:fees', credit: `user:${referred.referredById}:external`, amountPaisa: 25_000n, reason: 'REFERRAL_LOYALTY_BONUS_RECORDED', refType: 'User', refId: referred.id, idempotencyKey: `referral:${referred.id}` });
            await tx.notification.create({ data: { userId: referred.referredById!, type: 'REFERRAL_BONUS', message: `${referred.fullName} completed their first committee cycle — your Rs 250 referral bonus was recorded, funded from Halqa's own share.` } });
          } catch { /* concurrent duplicate — the once-ever guarantee holds */ }
        }
        // Late-cycle holdbacks can never gather the required clean follow-up
        // payments (no rounds remain). The cycle is complete and every
        // obligation settled, so return them to their owners — otherwise the
        // pool sweep below would redistribute a member's own money as profit.
        const stuckHoldbacks = await tx.payoutHoldback.findMany({ where: { committeeId: committee.id, status: 'HELD', membership: { status: 'ACTIVE' } }, include: { membership: true } });
        for (const holdback of stuckHoldbacks) {
          await tx.payoutHoldback.update({ where: { id: holdback.id }, data: { status: 'RELEASED', releasedAt: new Date() } });
          await ledger(tx, { committeeId: committee.id, actorId: req.auth!.userId, debit: `committee:${committee.id}:escrow`, credit: `user:${holdback.membership.userId}:external`, amountPaisa: holdback.amountPaisa, reason: 'PAYOUT_HOLDBACK_RELEASED_AT_COMPLETION', refType: 'PayoutHoldback', refId: holdback.id, idempotencyKey: `${idempotencyKey}:holdback-final:${holdback.id}` });
        }
        // Cycle complete: whatever remains in escrow is the held-back slices +
        // realised investment profit. Distribute it to members per distributionMode.
        const escrowAcct = `committee:${committee.id}:escrow`;
        const entries = await tx.ledgerEntry.findMany({ where: { committeeId: committee.id } });
        let pool = 0n;
        for (const e of entries) { if (e.credit === escrowAcct) pool += e.amountPaisa; if (e.debit === escrowAcct) pool -= e.amountPaisa; }
        // The default reserve holds two kinds of member money that must not be
        // stranded when the cycle ends clean: (a) insurance-reserve slices of
        // contributions, refunded to whoever paid them; (b) late-payment
        // penalties — donated to charity in the Shariah tiers (a penalty may
        // discipline, it may never enrich), otherwise shared equally among the
        // members who never paid late. Everything is capped by what the
        // reserve still actually holds after any default coverage.
        const reserveAcct = `committee:${committee.id}:default_reserve`;
        let reserveBalance = 0n;
        for (const e of entries) { if (e.credit === reserveAcct) reserveBalance += e.amountPaisa; if (e.debit === reserveAcct) reserveBalance -= e.amountPaisa; }
        const reserveByUser = new Map<string, bigint>();
        let reserveTotal = 0n;
        let penaltyTotal = 0n;
        for (const e of entries) {
          if (e.reason === 'DEFAULT_RESERVE_CONTRIBUTION_RECORDED' && e.debit.startsWith('user:')) {
            const uid = e.debit.split(':')[1];
            reserveByUser.set(uid, (reserveByUser.get(uid) ?? 0n) + e.amountPaisa);
            reserveTotal += e.amountPaisa;
          }
          if (e.reason === 'PROGRESSIVE_LATE_PENALTY_RECORDED') penaltyTotal += e.amountPaisa;
        }
        for (const [uid, contributed] of reserveByUser) {
          const refund = reserveTotal > reserveBalance ? contributed * reserveBalance / reserveTotal : contributed;
          if (refund <= 0n) continue;
          await ledger(tx, { committeeId: committee.id, actorId: req.auth!.userId, debit: reserveAcct, credit: `user:${uid}:external`, amountPaisa: refund, reason: 'DEFAULT_RESERVE_REFUND_RECORDED', refType: 'Committee', refId: committee.id, idempotencyKey: `${idempotencyKey}:reserve-refund:${uid}` });
          reserveBalance -= refund;
        }
        const penaltyPayable = penaltyTotal < reserveBalance ? penaltyTotal : reserveBalance;
        if (penaltyPayable > 0n) {
          const shariahTier = committee.tier === 'SUKOON' || committee.tier === 'BAZAAR';
          const latePayerIds = new Set((await tx.payment.findMany({ where: { round: { committeeId: committee.id }, OR: [{ penaltyPaisa: { gt: 0n } }, { status: { in: ['LATE', 'MISSED'] } }] }, select: { payerId: true } })).map(p => p.payerId));
          const cleanMembers = members.filter(m => !latePayerIds.has(m.userId));
          if (shariahTier || cleanMembers.length === 0) {
            await ledger(tx, { committeeId: committee.id, actorId: req.auth!.userId, debit: reserveAcct, credit: 'charity:sadaqah', amountPaisa: penaltyPayable, reason: 'LATE_PENALTY_DONATED_TO_CHARITY_RECORDED', refType: 'Committee', refId: committee.id, idempotencyKey: `${idempotencyKey}:penalty-charity` });
            await tx.notification.createMany({ data: members.map(m => ({ userId: m.userId, type: 'PENALTY_TO_CHARITY', message: `${committee.name}: ${penaltyPayable.toString()} paisa of late-payment penalties was recorded for charity${shariahTier ? ', as Shariah requires' : ''}.` })) });
          } else {
            const perClean = penaltyPayable / BigInt(cleanMembers.length);
            let sent = 0n;
            for (let i = 0; i < cleanMembers.length; i++) {
              const share = i === cleanMembers.length - 1 ? penaltyPayable - sent : perClean;
              sent += share;
              if (share > 0n) {
                await ledger(tx, { committeeId: committee.id, actorId: req.auth!.userId, debit: reserveAcct, credit: `user:${cleanMembers[i].userId}:external`, amountPaisa: share, reason: 'LATE_PENALTY_POOL_DIVIDEND_RECORDED', refType: 'Committee', refId: committee.id, idempotencyKey: `${idempotencyKey}:penalty-dividend:${cleanMembers[i].userId}` });
                await tx.notification.create({ data: { userId: cleanMembers[i].userId, type: 'PENALTY_DIVIDEND', message: `${committee.name}: you received ${share.toString()} paisa from late-payment penalties for a spotless payment record.` } });
              }
            }
          }
        }
        if (committee.distributionMode === 'SHARE' && pool > 0n && members.length > 0) {
          const [paidRows,heldAggregate]=await Promise.all([
            tx.payment.findMany({where:{status:'PAID',round:{committeeId:committee.id}},select:{payerId:true,amountPaisa:true,paidAt:true,dueDate:true}}),
            tx.round.aggregate({where:{committeeId:committee.id},_sum:{reinvestPaisa:true}}),
          ]);
          const principalHeldRaw=heldAggregate._sum.reinvestPaisa??0n;
          const capitalDays=new Map<string,bigint>();
          const earlyStats=new Map<string,{early:number;paid:number}>();
          for(const payment of paidRows){
            const days=BigInt(Math.max(1,Math.ceil((Date.now()-(payment.paidAt?.getTime()??Date.now()))/86_400_000)));
            capitalDays.set(payment.payerId,(capitalDays.get(payment.payerId)??0n)+payment.amountPaisa*days);
            const stats=earlyStats.get(payment.payerId)??{early:0,paid:0};
            stats.paid+=1;
            if(payment.paidAt&&payment.paidAt.getTime()<=payment.dueDate.getTime()-EARLY_BIRD_DAYS*86_400_000)stats.early+=1;
            earlyStats.set(payment.payerId,stats);
          }
          // Bazaar/Sigma patience tilt: later turn positions carried the circle
          // longest, so their capital-days weigh up to 2x in the profit split
          // (disclosed at consent). The early-bird boost multiplies a further
          // 1.25x for members who consistently paid three or more days early.
          // Funded purely by realised profit — early turns are never charged.
          const engineTier=committee.tier==='SUKOON'||committee.tier==='BAZAAR'||committee.tier==='SIGMA';
          const distribution=allocateCyclePool(pool,principalHeldRaw,members.map(member=>{
            const tilt=committee.tier==='BAZAAR'||committee.tier==='SIGMA'?patienceWeightTenths(member.turnPosition,members.length):10n;
            const stats=earlyStats.get(member.userId)??{early:0,paid:0};
            const boost=engineTier?earlyBirdFactor(qualifiesEarlyBird(stats.early,stats.paid)):4n;
            return{userId:member.userId,paidPrincipalPaisa:member.paidPrincipalPaisa,capitalDays:(capitalDays.get(member.userId)??0n)*tilt*boost};
          }));
          for(const share of distribution){
            if(share.principalPaisa>0n)await ledger(tx,{committeeId:committee.id,actorId:req.auth!.userId,debit:escrowAcct,credit:`user:${share.userId}:external`,amountPaisa:share.principalPaisa,reason:'CYCLE_PRINCIPAL_RETURN',refType:'Committee',refId:committee.id,idempotencyKey:`${idempotencyKey}:principal:${share.userId}`});
            if(share.profitPaisa>0n)await ledger(tx,{committeeId:committee.id,actorId:req.auth!.userId,debit:escrowAcct,credit:`user:${share.userId}:external`,amountPaisa:share.profitPaisa,reason:'CAPITAL_DAYS_PROFIT_DISTRIBUTION',refType:'Committee',refId:committee.id,idempotencyKey:`${idempotencyKey}:profit:${share.userId}`});
          }
          await tx.notification.createMany({ data: members.map(m => ({ userId: m.userId, type: 'PROFIT_DISTRIBUTED', message: `${committee.name} completed. Your time-weighted profit share was recorded for payout.` })) });
        } else if (committee.distributionMode === 'COMPOUND' && pool > 0n) {
          await tx.notification.createMany({ data: members.map(m => ({ userId: m.userId, type: 'PROFIT_COMPOUNDED', message: `${committee.name} completed. The pooled savings and profit remain recorded for the next cycle.` })) });
        }
      }
      await tx.notification.createMany({ data: members.map(m => ({ userId: m.userId, type: 'PAYOUT_RELEASED', message: `Round ${round.roundNumber} payout was recorded for ${committee.name}.` })) });
      await audit(tx, req.auth!.userId, 'ROUND_PAYOUT_RECORDED', 'Round', round.id, { scheduledPayoutPaisa: round.payoutPaisa.toString(), releasedPayoutPaisa: releasedPayoutPaisa.toString(), holdbackPaisa: holdbackPaisa.toString(), slotFeePaisa: slotFeePaisa.toString(), earlyFeePaisa: earlyFeePaisa.toString(), guaranteeCoveredPaisa: guaranteeShortfallPaisa.toString(), netFloatProfitPaisa: netFloatPaisa.toString(), prizePaisa: prizePaisa.toString(), recipientId: round.recipientId, stage: 'RECORD_ONLY' });
    });
    res.json({ message: 'Payout recorded and schedule advanced' });
  } catch (error) { next(error); }
});

// Bank-facing receivables pack (chairman-approved): a host-exportable,
// structured statement of the circle's future contribution stream and the
// members' verified reliability — exactly what a bank's credit desk needs to
// evaluate "financing backed by receivables from participating entities".
router.get('/:id/receivables-pack', async (req, res, next) => {
  try {
    const committee = await assertHost(req.params.id, req.auth!.userId);
    const [members, rounds, payments] = await Promise.all([
      prisma.committeeMember.findMany({ where: { committeeId: committee.id, status: 'ACTIVE' }, include: { user: { select: { fullName: true, creditScore: true, kycLevel: true } }, securityDeposits: true, payoutHoldbacks: true }, orderBy: { turnPosition: 'asc' } }),
      prisma.round.findMany({ where: { committeeId: committee.id }, orderBy: { roundNumber: 'asc' } }),
      prisma.payment.findMany({ where: { round: { committeeId: committee.id } }, select: { payerId: true, status: true, paidAt: true, dueDate: true } }),
    ]);
    const futureRounds = rounds.filter(r => r.status === 'PENDING' || r.status === 'COLLECTING');
    const perMember = members.map(m => {
      const mine = payments.filter(p => p.payerId === m.userId);
      const resolved = mine.filter(p => p.status === 'PAID');
      const onTime = resolved.filter(p => p.paidAt && p.paidAt.getTime() <= p.dueDate.getTime());
      return {
        position: m.turnPosition,
        member: m.user.fullName,
        reliabilityScore: m.user.creditScore,
        kycLevel: m.user.kycLevel,
        paymentsResolved: resolved.length,
        onTimePct: resolved.length ? Math.round(onTime.length / resolved.length * 100) : null,
        collateralHeldPaisa: (m.securityDeposits.filter(d => d.status === 'HELD').reduce((s, d) => s + d.amountPaisa, 0n) + m.payoutHoldbacks.filter(h => h.status === 'HELD').reduce((s, h) => s + h.amountPaisa, 0n)).toString(),
      };
    });
    res.json({
      generatedAt: new Date().toISOString(),
      disclaimer: 'Stage-1 record-only data: transfers are member-to-member and recorded, not custodied. Figures are ledger-derived.',
      circle: { name: committee.name, status: committee.status, tier: committee.tier, members: members.length, contributionPaisa: committee.contributionPaisa.toString(), periodDays: committee.periodDays, currentRound: committee.currentRound, totalRounds: rounds.length },
      receivables: {
        futureRounds: futureRounds.length,
        perRoundInflowPaisa: (committee.contributionPaisa * BigInt(members.length)).toString(),
        totalFutureInflowPaisa: (committee.contributionPaisa * BigInt(members.length) * BigInt(futureRounds.length)).toString(),
        schedule: futureRounds.map(r => ({ round: r.roundNumber, dueDate: r.dueDate, expectedInflowPaisa: (committee.contributionPaisa * BigInt(members.length)).toString() })),
      },
      collateral: { totalHeldPaisa: perMember.reduce((s, m) => s + BigInt(m.collateralHeldPaisa), 0n).toString() },
      members: perMember,
    });
  } catch (error) { next(error); }
});

// Members may exit ONLY after a clean full cycle (D6) or before it starts. Leaving mid-cycle is
// abandonment and is blocked here; ban-on-abandonment is enforced by the hourly
// delinquency scheduler (services/delinquency.ts) when a received member stops paying.
router.post('/:id/leave', async (req, res, next) => {
  try {
    const membership = await assertMember(req.params.id, req.auth!.userId);
    const committee = await prisma.committee.findUniqueOrThrow({ where: { id: req.params.id } });
    if (committee.hostId === req.auth!.userId) return res.status(409).json({ error: 'The host cannot leave their own committee' });
    if (committee.status !== 'COMPLETED' && committee.status !== 'FORMING') return res.status(409).json({ error: 'You can only leave before starting or after a full cycle completes.' });
    const unpaid = await prisma.payment.count({ where: { payerId: req.auth!.userId, round: { committeeId: committee.id }, status: { not: 'PAID' } } });
    if (unpaid > 0) return res.status(409).json({ error: 'Clear all outstanding contributions before leaving.' });
    await prisma.$transaction(async tx => {
      if (committee.status === 'FORMING') await tx.committeeMember.delete({ where: { id: membership.id } });
      else await tx.committeeMember.update({ where: { id: membership.id }, data: { status: 'EXITED', exitedAt: new Date() } });
      await audit(tx, req.auth!.userId, 'MEMBER_EXITED', 'Committee', committee.id, {});
    });
    res.json({ message: 'You have exited the committee' });
  } catch (error) { next(error); }
});

// Host toggles whether this forming circle is publicly discoverable. Flipping
// it off hides it from the "Discover circles" list immediately; invite-code
// joining still works either way.
router.post('/:id/listing', async (req, res, next) => {
  try {
    const { listed } = z.object({ listed: z.boolean() }).parse(req.body);
    const committee = await assertHost(req.params.id, req.auth!.userId);
    if (committee.status !== 'FORMING') return res.status(409).json({ error: 'Only forming circles can be listed or hidden' });
    await prisma.committee.update({ where: { id: committee.id }, data: { listedPublicly: listed } });
    await audit(prisma, req.auth!.userId, listed ? 'CIRCLE_LISTED' : 'CIRCLE_HIDDEN', 'Committee', committee.id, {});
    res.json({ listedPublicly: listed });
  } catch (error) { next(error); }
});

// Auto-collect mandate: the member turns standing auto-debit on or off for
// this circle and picks the rail. Enabling records a timestamped consent (the
// mandate); the nightly auto-debit pass then pulls each due installment via the
// provider layer. No money is held by Halqa — this only schedules the pull.
router.post('/:id/autopay', async (req, res, next) => {
  try {
    const input = z.object({ enabled: z.boolean(), rail: z.enum(['RAAST', 'JAZZCASH', 'EASYPAISA', 'BANK_TRANSFER', 'CASH']).optional() }).parse(req.body);
    const membership = await assertMember(req.params.id, req.auth!.userId);
    const updated = await prisma.$transaction(async tx => {
      const row = await tx.committeeMember.update({
        where: { id: membership.id },
        data: input.enabled
          ? { autoDebitEnabled: true, autoDebitRail: input.rail ?? membership.autoDebitRail ?? 'RAAST', autoDebitMandateAt: new Date() }
          : { autoDebitEnabled: false },
      });
      await audit(tx, req.auth!.userId, input.enabled ? 'AUTOPAY_MANDATE_GRANTED' : 'AUTOPAY_MANDATE_REVOKED', 'Committee', req.params.id, { rail: row.autoDebitRail });
      return row;
    });
    res.json({ autoDebitEnabled: updated.autoDebitEnabled, autoDebitRail: updated.autoDebitRail, autoDebitMandateAt: updated.autoDebitMandateAt });
  } catch (error) { next(error); }
});

export default router;
