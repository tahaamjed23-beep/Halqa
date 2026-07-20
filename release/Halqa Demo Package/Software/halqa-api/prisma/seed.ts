import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { syncSchemeCatalog } from '../src/lib/scheme-catalog';

const db = new PrismaClient();
const password = 'halqa123';

async function main() {
  await db.auditLog.deleteMany();
  await db.ledgerEntry.deleteMany();
  await db.chatMessage.deleteMany();
  await db.chatRead.deleteMany();
  await db.notification.deleteMany();
  await db.creditEvent.deleteMany();
  await db.riskConsent.deleteMany();
  await db.riskAssessment.deleteMany();
  await db.payment.deleteMany();
  await db.investment.deleteMany();
  await db.round.deleteMany();
  await db.securityDeposit.deleteMany();
  await db.exchangeListing.deleteMany();
  await db.committeeMember.deleteMany();
  await db.committee.deleteMany();
  await db.scheme.deleteMany();
  await db.refreshToken.deleteMany();
  await db.kycRecord.deleteMany();
  await db.user.deleteMany();
  const hash = await bcrypt.hash(password, 12);
  const [taha, ahmed, sana, ayesha, bilal] = await Promise.all([
    db.user.create({ data: { fullName: 'Taha Kayani', username: 'taha', phone: '03001234567', email: 'taha@halqa.pk', passwordHash: hash, role: 'ADMIN', creditScore: 780, kycLevel: 2, kycStatus: 'VERIFIED' } }),
    db.user.create({ data: { fullName: 'Ahmed Khan', username: 'ahmed', phone: '03011234568', email: 'ahmed@halqa.pk', passwordHash: hash, creditScore: 735, kycLevel: 2, kycStatus: 'VERIFIED' } }),
    db.user.create({ data: { fullName: 'Sana Butt', username: 'sana', phone: '03021234569', email: 'sana@halqa.pk', passwordHash: hash, creditScore: 720, kycLevel: 1, kycStatus: 'PENDING' } }),
    db.user.create({ data: { fullName: 'Ayesha Noor', username: 'ayesha', phone: '03031234570', email: 'ayesha@halqa.pk', passwordHash: hash, creditScore: 748, kycLevel: 1, kycStatus: 'PENDING' } }),
    db.user.create({ data: { fullName: 'Bilal Raza', username: 'bilal', phone: '03041234571', email: 'bilal@halqa.pk', passwordHash: hash, creditScore: 688, kycLevel: 1, kycStatus: 'PENDING' } }),
  ]);
  await syncSchemeCatalog(db);
  const [tBill91, govSukuk, incomeFund, moneyMarket, balancedFund, goldLinked, psxEtf] = await Promise.all([
    db.scheme.findUniqueOrThrow({ where: { slug: 't-bill-91' } }),
    db.scheme.findUniqueOrThrow({ where: { slug: 'gov-ijarah-sukuk' } }),
    db.scheme.findUniqueOrThrow({ where: { slug: 'income-fund-basket' } }),
    db.scheme.findUniqueOrThrow({ where: { slug: 'money-market-fund-basket' } }),
    db.scheme.findUniqueOrThrow({ where: { slug: 'balanced-fund-basket' } }),
    db.scheme.findUniqueOrThrow({ where: { slug: 'gold-linked-allocation' } }),
    db.scheme.findUniqueOrThrow({ where: { slug: 'psx-index-etf-basket' } }),
  ]);
  const active = await db.committee.create({ data: { name: 'Islamabad Builders Circle', hostId: ahmed.id, status: 'ACTIVE', mode: 'HYBRID', memberCap: 8, contributionPaisa: 2500000n, cadencePreset: 'SHORT', periodDays: 30, minMembersToStart: 3, reinvestRatio: .2, schemeId: tBill91.id, inviteCode: 'HLQ-DEMO2026', currentRound: 1, scheduleLockedAt: new Date(), members: { create: [
    { userId: ahmed.id, turnPosition: 1 }, { userId: sana.id, turnPosition: 2 }, { userId: ayesha.id, turnPosition: 3 }, { userId: bilal.id, turnPosition: 4 },
  ] } } });
  const memberOrder = [ahmed,sana,ayesha,bilal];
  for (let i=0;i<memberOrder.length;i++) {
    const dueDate = new Date(Date.now() + i*30*86400000);
    const round = await db.round.create({ data: { committeeId: active.id, roundNumber: i+1, recipientId: memberOrder[i].id, status: i===0 ? 'COLLECTING' : 'PENDING', dueDate, payoutDate: new Date(dueDate.getTime()+7*86400000), grossPoolPaisa: 10000000n, reinvestPaisa: 2000000n, payoutPaisa: 8000000n } });
    if (i===0) await db.payment.createMany({ data: memberOrder.map(u => ({ roundId: round.id, payerId: u.id, amountPaisa: 2500000n, dueDate })) });
  }
  await db.committee.create({ data: { name: 'Lahore Family Savings', hostId: taha.id, memberCap: 12, contributionPaisa: 1000000n, cadencePreset: 'MID', periodDays: 30, minMembersToStart: 3, reinvestRatio: .15, schemeId: incomeFund.id, distributionMode: 'SHARE', joinPolicy: 'INVITE_ONLY', inviteCode: 'HLQ-FAMILY26', members: { create: [{ userId: taha.id, turnPosition: 1 }, { userId: ayesha.id, turnPosition: 2 }] } } });
  await db.notification.createMany({ data: [
    { userId: sana.id, type: 'PAYMENT_DUE', message: 'Your Rs 25,000 contribution is ready to record.' },
    { userId: ahmed.id, type: 'HOST_UPDATE', message: 'Three member contributions remain in round 1.' },
  ] });
  await db.chatMessage.createMany({ data: [
    { committeeId: active.id, senderId: ahmed.id, body: 'Welcome. Round 1 is now collecting.', pinned: true },
    { committeeId: active.id, senderId: sana.id, body: 'Thanks. I will record my Raast transfer today.' },
  ] });
  console.log('Seeded Halqa prototype');
  console.log('All demo passwords: halqa123');
  console.log('Users: taha, ahmed, sana, ayesha, bilal');
}

main().finally(() => db.$disconnect());
