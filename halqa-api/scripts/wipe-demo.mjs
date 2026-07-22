// LAUNCH-DAY demo/seed wipe. Removes the demo population + seeded circles before
// real users arrive. SAFE BY DEFAULT: dry-run unless you pass --confirm.
//
//   node scripts/wipe-demo.mjs            # dry run — prints what WOULD be deleted
//   node scripts/wipe-demo.mjs --confirm  # actually deletes (transaction-wrapped)
//
// ⚠️ REVIEW BEFORE RUNNING ON PROD. Test on a Supabase branch first. The whole
// delete runs inside ONE transaction, so any missed foreign-key relation makes
// it roll back cleanly rather than half-wipe. It targets ONLY the known demo
// cohort (explicit usernames + seed patterns + seeded circle-name patterns) —
// never a blanket "delete all users."
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
const CONFIRM = process.argv.includes('--confirm');

// Demo/seed identity patterns. Extend these if new seeders add cohorts.
const DEMO_USERNAMES = ['taha', 'ahmed', 'sana', 'ayesha', 'bilal'];
const DEMO_USERNAME_PATTERNS = [
  /\.(bibi|teacher|karyana|parlor|tailor|stitch|maid|gig|mechanic|driver|rickshaw)$/i, // seed-demo occupations
  /_[a-z0-9]{4}$/i, // seed-open-circles hosts: rabia_x1y2, imran_x1y2, …
];
const DEMO_EMAIL_PATTERN = /@halqa\.pk$/i;              // seeded hosts use @halqa.pk
const DEMO_CIRCLE_PATTERNS = [
  /^ForwardLiab|^FLVERIFY|^Lifecycle |^Bazaar |^Priority |^Sigma |^Swap |^Cover |^Safety |^Autopay/i, // integration-test circles
  /^Tariq Road Traders/i,
];
// seed-open-circles OPEN names (date-stamped at runtime)
const OPEN_NAME_STEMS = ['Gulshan Homemakers','Saddar Shopkeepers','Clifton Hajj Savers','DHA School Fees','Johar Wedding Circle','Model Town Teachers','Anarkali Traders','F-10 Umrah Circle','Bahria Home Builders','Hayatabad Doctors','Satellite Town Tailors','Gulberg Jahez Circle','Cantt Daily Wagers','North Nazimabad Aunties'];

const isDemoUser = (u) =>
  DEMO_USERNAMES.includes(u.username) ||
  DEMO_USERNAME_PATTERNS.some(rx => rx.test(u.username)) ||
  DEMO_EMAIL_PATTERN.test(u.email || '');
const isDemoCircle = (c) =>
  DEMO_CIRCLE_PATTERNS.some(rx => rx.test(c.name)) ||
  OPEN_NAME_STEMS.some(stem => c.name.startsWith(stem));

async function main() {
  const users = await prisma.user.findMany({ select: { id: true, username: true, email: true } });
  const committees = await prisma.committee.findMany({ select: { id: true, name: true, hostId: true } });

  const demoUserIds = new Set(users.filter(isDemoUser).map(u => u.id));
  const demoCommitteeIds = new Set(
    committees.filter(c => isDemoCircle(c) || demoUserIds.has(c.hostId)).map(c => c.id),
  );
  const uIds = [...demoUserIds], cIds = [...demoCommitteeIds];

  console.log(`Demo users found:      ${uIds.length} / ${users.length}`);
  console.log(`Demo committees found: ${cIds.length} / ${committees.length}`);
  if (!CONFIRM) {
    console.log('\nDRY RUN — nothing deleted. Re-run with --confirm to execute.');
    console.log('Sample demo usernames:', users.filter(isDemoUser).slice(0, 8).map(u => u.username).join(', '));
    console.log('Sample demo circles:  ', committees.filter(c => demoCommitteeIds.has(c.id)).slice(0, 8).map(c => c.name).join(', '));
    return;
  }
  if (!uIds.length && !cIds.length) { console.log('Nothing to delete.'); return; }

  // One transaction: leaf tables first (children reference committees/users),
  // then committees, then users. Any missing relation → rollback, no half-wipe.
  await prisma.$transaction(async tx => {
    const byC = { committeeId: { in: cIds } };
    const memberIds = (await tx.committeeMember.findMany({ where: byC, select: { id: true } })).map(m => m.id);
    const byMember = { membershipId: { in: memberIds } };
    await tx.exchangeBid.deleteMany({ where: { listing: byC } });
    await tx.exchangeListing.deleteMany({ where: byC });
    await tx.investment.deleteMany({ where: byC });
    await tx.payment.deleteMany({ where: { round: byC } });
    await tx.securityDeposit.deleteMany({ where: byMember });
    await tx.payoutHoldback.deleteMany({ where: byC });
    await tx.protectionCommitment.deleteMany({ where: byMember });
    await tx.recoveryCase.deleteMany({ where: byC });
    await tx.riskConsent.deleteMany({ where: byC });
    await tx.round.deleteMany({ where: byC });
    await tx.committeeWaitlist.deleteMany({ where: byC });
    await tx.agreementSignature.deleteMany({ where: { OR: [byC, { userId: { in: uIds } }] } });
    await tx.ledgerEntry.deleteMany({ where: byC });
    await tx.committeeMember.deleteMany({ where: byC });
    await tx.committee.deleteMany({ where: { id: { in: cIds } } });
    // User-owned leaf rows
    const byUser = { userId: { in: uIds } };
    await tx.refreshToken.deleteMany({ where: byUser });
    await tx.creditEvent.deleteMany({ where: byUser });
    await tx.notification.deleteMany({ where: byUser });
    await tx.chatMessage.deleteMany({ where: byUser }).catch(() => {});
    await tx.riskConsent.deleteMany({ where: byUser }).catch(() => {});
    await tx.kycRecord.deleteMany({ where: byUser }).catch(() => {});
    await tx.user.deleteMany({ where: { id: { in: uIds } } });
  }, { timeout: 60_000 });
  console.log(`\n✅ Deleted ${cIds.length} committees and ${uIds.length} users.`);
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
