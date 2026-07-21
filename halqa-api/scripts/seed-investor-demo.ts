import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();
const day = 86_400_000;

async function main() {
  const [taha, ahmed, sana, ayesha, bilal, moneyMarket, gold] = await Promise.all([
    db.user.findUniqueOrThrow({ where: { username: 'taha' } }),
    db.user.findUniqueOrThrow({ where: { username: 'ahmed' } }),
    db.user.findUniqueOrThrow({ where: { username: 'sana' } }),
    db.user.findUniqueOrThrow({ where: { username: 'ayesha' } }),
    db.user.findUniqueOrThrow({ where: { username: 'bilal' } }),
    db.scheme.findUniqueOrThrow({ where: { slug: 'money-market-fund-basket' } }),
    db.scheme.findUniqueOrThrow({ where: { slug: 'gold-linked-allocation' } }),
  ]);

  const open = await db.committee.upsert({
    where: { inviteCode: 'HLQ-OPEN-SLOTS' },
    update: { listedPublicly: true, joinPolicy: 'OPEN_UNTIL_FULL', orderMode: 'CREDIT_WEIGHTED' },
    create: {
      name: 'Karachi Professionals Circle', hostId: taha.id, status: 'FORMING', mode: 'HYBRID', memberCap: 8,
      contributionPaisa: 2000000n, cadencePreset: 'SHORT', periodDays: 14, minMembersToStart: 3, reinvestRatio: .15,
      schemeId: moneyMarket.id, inviteCode: 'HLQ-OPEN-SLOTS', joinPolicy: 'OPEN_UNTIL_FULL', listedPublicly: true,
      orderMode: 'CREDIT_WEIGHTED', tier: 'PRIORITY', earlyFeeBps: 500,
    },
  });
  for (const [userId, turnPosition] of [[taha.id, 1], [ahmed.id, 2]] as const) {
    await db.committeeMember.upsert({ where: { committeeId_userId: { committeeId: open.id, userId } }, create: { committeeId: open.id, userId, turnPosition }, update: { status: 'ACTIVE', turnPosition } });
  }

  const completed = await db.committee.upsert({
    where: { inviteCode: 'HLQ-NEXT-CYCLE' },
    update: { listedPublicly: true, status: 'COMPLETED' },
    create: {
      name: 'Lahore Gold Savers', hostId: taha.id, status: 'COMPLETED', mode: 'HYBRID', memberCap: 5,
      contributionPaisa: 3000000n, cadencePreset: 'MID', periodDays: 30, minMembersToStart: 3, reinvestRatio: .2,
      schemeId: gold.id, inviteCode: 'HLQ-NEXT-CYCLE', joinPolicy: 'OPEN_UNTIL_FULL', listedPublicly: true,
      orderMode: 'RANDOM_BALLOT', tier: 'SUKOON', currentRound: 3, cycleNumber: 1, scheduleLockedAt: new Date(Date.now() - 120 * day),
    },
  });
  const completedUsers = [taha, ahmed, ayesha];
  for (let index = 0; index < completedUsers.length; index++) {
    await db.committeeMember.upsert({ where: { committeeId_userId: { committeeId: completed.id, userId: completedUsers[index].id } }, create: { committeeId: completed.id, userId: completedUsers[index].id, turnPosition: index + 1, hasReceived: true }, update: { status: 'ACTIVE', turnPosition: index + 1, hasReceived: true } });
  }
  if (await db.round.count({ where: { committeeId: completed.id } }) === 0) {
    for (let index = 0; index < completedUsers.length; index++) {
      const dueDate = new Date(Date.now() - (90 - index * 30) * day);
      const payoutDate = new Date(dueDate.getTime() + 7 * day);
      const round = await db.round.create({ data: { committeeId: completed.id, roundNumber: index + 1, recipientId: completedUsers[index].id, status: 'CLOSED', dueDate, payoutDate, grossPoolPaisa: 9000000n, reinvestPaisa: 1800000n, payoutPaisa: 7200000n } });
      await db.payment.createMany({ data: completedUsers.map((user, payerIndex) => ({ roundId: round.id, payerId: user.id, amountPaisa: 3000000n, dueDate, status: 'PAID', paidAt: new Date(dueDate.getTime() - (payerIndex + 1) * day), paidVia: 'RAAST', txnRef: `DEMO-${index + 1}-${payerIndex + 1}` })) });
    }
  }

  const active = await db.committee.findFirst({ where: { name: 'Islamabad Builders Circle', status: 'ACTIVE' }, include: { members: true, rounds: true } });
  if (active) {
    for (const [seller, premium] of [[ayesha, 250000n], [bilal, 150000n]] as const) {
      const member = active.members.find(item => item.userId === seller.id);
      if (!member) continue;
      const existing = await db.exchangeListing.findFirst({ where: { committeeId: active.id, sellerId: seller.id, status: 'OPEN' } });
      if (!existing) await db.exchangeListing.create({ data: { committeeId: active.id, sellerId: seller.id, position: member.turnPosition, payoutPaisa: active.rounds.find(round => round.roundNumber === member.turnPosition)?.payoutPaisa ?? 8000000n, premiumPaisa: premium } });
    }
    const ayeshaListing = await db.exchangeListing.findFirst({ where: { committeeId: active.id, sellerId: ayesha.id, status: 'OPEN' } });
    if (ayeshaListing && !(await db.exchangeBid.findFirst({ where: { listingId: ayeshaListing.id, bidderId: sana.id, status: 'OPEN' } }))) {
      await db.exchangeBid.create({ data: { listingId: ayeshaListing.id, bidderId: sana.id, premiumPaisa: 300000n } });
    }
  }
  console.log('Investor briefing demos ready: public slots, next-cycle waitlist and two turn listings.');
}

main().finally(() => db.$disconnect());
