import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db';
import { requireAuth } from '../lib/auth';
import { assertMember } from '../lib/guards';
import { audit, ledger } from '../lib/audit';
import { paisaInput } from '../lib/money';
import { band, allowedPositions, mayBuyTurns } from '../lib/score-bands';

const router = Router();
router.use(requireAuth);

router.get('/', async (req, res) => {
  const listings = await prisma.exchangeListing.findMany({
    where: { status: 'OPEN', committee: { members: { some: { userId: req.auth!.userId, status: 'ACTIVE' } } } },
    include: {
      seller: { select: { id: true, fullName: true, creditScore: true, kycLevel: true } },
      committee: {
        select: {
          id: true, name: true, mode: true, contributionPaisa: true, periodDays: true, currentRound: true,
          orderMode: true, tier: true, earlyFeeBps: true, payoutGuaranteed: true, reinvestRatio: true, allowTurnSale: true,
          riskScore: true, riskBand: true, scheme: { select: { name: true } },
          members: { where: { status: 'ACTIVE' }, select: { userId: true, user: { select: { creditScore: true } } } },
          rounds: { select: { roundNumber: true, payoutDate: true, payoutPaisa: true, payments: { select: { payerId: true, status: true, paidAt: true, dueDate: true } } }, orderBy: { roundNumber: 'asc' } },
          recoveryCases: { select: { userId: true, status: true } },
        },
      },
      bids: { where: { status: 'OPEN' }, include: { bidder: { select: { id: true, fullName: true, creditScore: true } } } },
    },
    orderBy: { listedAt: 'desc' },
  });
  res.json(listings.map(listing => {
    const targetRound = listing.committee.rounds.find(round => round.roundNumber === listing.position);
    const remainingRounds = Math.max(0, listing.committee.rounds.length - listing.committee.currentRound + 1);
    const remainingDuesPaisa = listing.committee.contributionPaisa * BigInt(remainingRounds);
    const payments = listing.committee.rounds.flatMap(round => round.payments);
    const defaultingMembers = new Set([
      ...payments.filter(payment => payment.status === 'MISSED').map(payment => payment.payerId),
      ...listing.committee.recoveryCases.filter(item => ['OPEN', 'PAYMENT_RECORDED'].includes(item.status)).map(item => item.userId),
    ]);
    const latePayments = payments.filter(payment => payment.status === 'LATE' || Boolean(payment.paidAt && payment.paidAt > payment.dueDate)).length;
    const earlyPayments = payments.filter(payment => Boolean(payment.paidAt && payment.paidAt < payment.dueDate)).length;
    const averageCreditScore = listing.committee.members.length ? Math.round(listing.committee.members.reduce((sum, member) => sum + member.user.creditScore, 0) / listing.committee.members.length) : 700;
    const engines = [
      listing.committee.tier !== 'CLASSIC' ? `${listing.committee.tier[0]}${listing.committee.tier.slice(1).toLowerCase()} earning engine` : null,
      listing.committee.reinvestRatio > 0 && listing.committee.scheme ? `${Math.round(listing.committee.reinvestRatio * 100)}% ${listing.committee.scheme.name} allocation` : null,
      listing.committee.payoutGuaranteed ? 'Safety Fund' : null,
      listing.committee.allowTurnSale ? 'Turn exchange' : null,
    ].filter((label): label is string => Boolean(label));
    return {
      ...listing,
      payoutPaisa: targetRound?.payoutPaisa ?? listing.payoutPaisa,
      payoutDate: targetRound?.payoutDate ?? null,
      remainingDuesPaisa,
      buyerNetCostPaisa: listing.premiumPaisa,
      buyerScope: 'INSIDE',
      totalTurns: listing.committee.members.length,
      turnPricing: listing.committee.earlyFeeBps > 0 ? { kind: 'EARLY_FEE' as const, earlyFeeBps: listing.committee.earlyFeeBps, pooled: false } : { kind: 'FLAT' as const, earlyFeeBps: 0, pooled: false },
      creditHealth: { averageCreditScore, defaults: defaultingMembers.size, latePayments, earlyPayments, grade: defaultingMembers.size ? 'WATCH' : averageCreditScore >= 750 && latePayments === 0 ? 'EXCELLENT' : averageCreditScore >= 700 ? 'STRONG' : averageCreditScore >= 650 ? 'FAIR' : 'WATCH' },
      engines,
    };
  }));
});

router.post('/', async (req, res, next) => {
  try {
    const sellerUser = await prisma.user.findUniqueOrThrow({ where: { id: req.auth!.userId } });
    if (sellerUser.isBanned || (sellerUser.cooldownUntil && sellerUser.cooldownUntil > new Date())) return res.status(403).json({ error: 'Marketplace access is locked during default recovery or cooldown' });
    const input = z.object({ committeeId: z.string(), premiumPaisa: paisaInput }).parse(req.body);
    const membership = await assertMember(input.committeeId, req.auth!.userId);
    const committee = await prisma.committee.findUniqueOrThrow({ where: { id: input.committeeId }, include: { members: { where: { status: 'ACTIVE' } }, rounds: true } });
    if (!committee.allowTurnSale || committee.status !== 'ACTIVE' || committee.mode === 'INVESTMENT') return res.status(409).json({ error: 'Turn sales are not enabled for this committee' });
    // Shariah tiers: swapping turns by mutual consent is fine; selling a turn
    // for a premium is contested (trading a claim to money for more money), so
    // Sukoon/Bazaar listings must be free swaps. Premiums stay available on
    // Classic, Priority and Sigma.
    if ((committee.tier === 'SUKOON' || committee.tier === 'BAZAAR') && input.premiumPaisa > 0n) return res.status(400).json({ error: 'Sukoon and Bazaar circles allow free turn swaps only — list at a zero premium, or use a Classic, Priority or Sigma circle for premium sales' });
    if (membership.hasReceived || membership.turnPosition <= committee.currentRound) return res.status(409).json({ error: 'Only a future, unreceived turn can be listed' });
    const activeRound = committee.rounds.find(round => ['COLLECTING','INVESTED'].includes(round.status));
    const currentPayment = activeRound ? await prisma.payment.findUnique({ where: { roundId_payerId: { roundId: activeRound.id, payerId: req.auth!.userId } } }) : null;
    if (currentPayment && currentPayment.status !== 'PAID') return res.status(409).json({ error: 'Record the current installment before listing your turn' });
    const targetRound = committee.rounds.find(round => round.roundNumber === membership.turnPosition);
    const payout = targetRound?.payoutPaisa ?? committee.contributionPaisa * BigInt(committee.members.length);
    if (input.premiumPaisa < 0n || input.premiumPaisa > payout / 2n) return res.status(400).json({ error: 'Premium must be between zero and 50% of the payout' });
    const existing = await prisma.exchangeListing.findFirst({ where: { committeeId: committee.id, sellerId: req.auth!.userId, status: 'OPEN' } });
    if (existing) return res.status(409).json({ error: 'You already have an open listing in this committee' });
    const listing = await prisma.exchangeListing.create({ data: { committeeId: committee.id, sellerId: req.auth!.userId, position: membership.turnPosition, payoutPaisa: payout, premiumPaisa: input.premiumPaisa } });
    await audit(prisma, req.auth!.userId, 'TURN_LISTED', 'ExchangeListing', listing.id, { premiumPaisa: input.premiumPaisa.toString(), position: membership.turnPosition });
    res.status(201).json(listing);
  } catch (error) { next(error); }
});

router.post('/:id/bid', async (req, res, next) => {
  try {
    const input = z.object({ premiumPaisa: paisaInput }).parse(req.body);
    const listing = await prisma.exchangeListing.findUnique({ where: { id: req.params.id } });
    if (!listing || listing.status !== 'OPEN') return res.status(404).json({ error: 'Open listing not found' });
    if (listing.sellerId === req.auth!.userId) return res.status(409).json({ error: 'Cannot bid on your own listing' });
    const bidderUser = await prisma.user.findUniqueOrThrow({ where: { id: req.auth!.userId } });
    // Marketplace access follows the score bands: only BAD (<550) is barred
    // from buying turns (score-bands.ts). Banned/cooldown stays fully locked.
    if (bidderUser.isBanned || !mayBuyTurns(bidderUser.creditScore)) return res.status(403).json({ error: 'Turn buying is not available at your reliability band — build your score to unlock the marketplace' });
    const [bidderMembership,committee]=await Promise.all([
      prisma.committeeMember.findUnique({where:{committeeId_userId:{committeeId:listing.committeeId,userId:req.auth!.userId}}}),
      prisma.committee.findUniqueOrThrow({where:{id:listing.committeeId},select:{currentRound:true,tier:true,memberCap:true}}),
    ]);
    if(!bidderMembership||bidderMembership.status!=='ACTIVE')return res.status(403).json({error:'Turn auctions are currently restricted to active members of the same committee'});
    if(bidderMembership.hasReceived||bidderMembership.turnPosition<=committee.currentRound)return res.status(409).json({error:'Only members with a future unreceived turn can bid'});
    // Anti-default invariant: buying a turn can't drop you into a seat your band
    // couldn't sit in at join. A Decent member can't buy into the first half.
    if(!allowedPositions(band(bidderUser.creditScore),committee.memberCap).includes(listing.position))return res.status(409).json({error:'That turn is earlier than your reliability band allows you to hold'});
    if(committee.tier==='SUKOON'||committee.tier==='BAZAAR'){
      // Free-swap tiers: a bid is a swap request, not an auction — no premium.
      if(input.premiumPaisa!==0n)return res.status(400).json({error:'Sukoon and Bazaar circles allow free turn swaps only — bid zero to request the swap'});
    }else{
      const highest=await prisma.exchangeBid.findFirst({where:{listingId:listing.id,status:'OPEN'},orderBy:{premiumPaisa:'desc'}});
      const floor=highest?.premiumPaisa??listing.premiumPaisa;
      if(input.premiumPaisa<=floor)return res.status(400).json({error:`Bid must exceed ${floor.toString()} paisa`});
      if(input.premiumPaisa>listing.payoutPaisa/2n)return res.status(400).json({error:'Bid cannot exceed 50% of the future payout'});
    }
    const bid = await prisma.exchangeBid.create({
      data: { listingId: listing.id, bidderId: req.auth!.userId, premiumPaisa: input.premiumPaisa }
    });
    
    res.status(201).json(bid);
  } catch (error) { next(error); }
});

router.post('/:id/bids/:bidId/accept', async (req, res, next) => {
  try {
    const { idempotencyKey } = z.object({ idempotencyKey: z.string().min(8) }).parse(req.body);
    const listing = await prisma.exchangeListing.findUnique({ where: { id: req.params.id }, include: { committee: { include: { members: { where: { status: 'ACTIVE' } } } } } });
    if (!listing || listing.status !== 'OPEN') return res.status(404).json({ error: 'Open listing not found' });
    if (listing.sellerId !== req.auth!.userId) return res.status(403).json({ error: 'Only the seller can accept a bid' });
    
    const bid = await prisma.exchangeBid.findUnique({ where: { id: req.params.bidId } });
    if (!bid || bid.listingId !== listing.id || bid.status !== 'OPEN') return res.status(404).json({ error: 'Valid bid not found' });
    
    const seller = await assertMember(listing.committeeId, listing.sellerId);
    const existingBuyer = await prisma.committeeMember.findUnique({ where: { committeeId_userId: { committeeId: listing.committeeId, userId: bid.bidderId } } });
    if (!existingBuyer || existingBuyer.status !== 'ACTIVE' || existingBuyer.hasReceived || existingBuyer.turnPosition <= listing.committee.currentRound) return res.status(409).json({ error: 'The buyer no longer has an eligible future turn' });
    const fee = bid.premiumPaisa / 10n;
    const sellerNet = bid.premiumPaisa - fee;
    await prisma.$transaction(async tx => {
      const claimed = await tx.exchangeListing.updateMany({ where: { id: listing.id, status: 'OPEN' }, data: { status: 'ACCEPTED', buyerId: bid.bidderId, acceptedAt: new Date(), premiumPaisa: bid.premiumPaisa } });
      if (claimed.count !== 1) throw Object.assign(new Error('Listing was already settled'), { status: 409 });
      const buyerOriginalPosition = existingBuyer.turnPosition;
      await tx.committeeMember.update({ where: { id: existingBuyer.id }, data: { turnPosition: 0 } });
      await tx.committeeMember.update({ where: { id: seller.id }, data: { turnPosition: buyerOriginalPosition } });
      await tx.committeeMember.update({ where: { id: existingBuyer.id }, data: { turnPosition: listing.position } });
      await tx.round.updateMany({ where: { committeeId: listing.committeeId, roundNumber: listing.position, status: 'PENDING' }, data: { recipientId: bid.bidderId } });
      await tx.round.updateMany({ where: { committeeId: listing.committeeId, roundNumber: buyerOriginalPosition, status: 'PENDING' }, data: { recipientId: listing.sellerId } });
      await tx.exchangeBid.updateMany({ where: { listingId: listing.id }, data: { status: 'CANCELLED' } });
      await tx.exchangeBid.update({ where: { id: bid.id }, data: { status: 'ACCEPTED' } });
      
      if (sellerNet > 0n) await ledger(tx, { committeeId: listing.committeeId, actorId: req.auth!.userId, debit: `user:${bid.bidderId}:external`, credit: `user:${listing.sellerId}:external`, amountPaisa: sellerNet, reason: 'TURN_PREMIUM_RECORDED', refType: 'ExchangeListing', refId: listing.id, idempotencyKey });
      if (fee > 0n) await ledger(tx, { committeeId: listing.committeeId, actorId: req.auth!.userId, debit: `user:${bid.bidderId}:external`, credit: 'platform:fees', amountPaisa: fee, reason: 'TURN_MARKETPLACE_FEE_10_PERCENT', refType: 'ExchangeListing', refId: listing.id, idempotencyKey: `${idempotencyKey}:fee` });
      await audit(tx, req.auth!.userId, 'TURN_PURCHASED', 'ExchangeListing', listing.id, { buyerType: 'INSIDE', premiumPaisa: bid.premiumPaisa.toString(), feePaisa: fee.toString(), bidderId: bid.bidderId });
    });
    res.json({ message: 'Turn positions exchanged', buyerType: 'INSIDE', feePaisa: fee, sellerNetPaisa: sellerNet });
  } catch (error) { next(error); }
});

export default router;
