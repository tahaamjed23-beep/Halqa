import { createHash } from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';
import type { Prisma, PrismaClient } from '@prisma/client';

// E-signed legal instruments (Electronic Transactions Ordinance 2002 gives an
// in-app signature the same enforceability as wet ink). Two documents:
//
//  PLATFORM_UNDERTAKING — the master undertaking every account signs at signup
//  and RENEWS WEEKLY. Drafted as a promissory undertaking of a liquidated
//  demand so enforcement fits the SUMMARY procedure (Order XXXVII CPC: the
//  defaulter has 10 days to ask the court for permission to even defend), with
//  an acceleration clause (Oraan model: certified default makes the whole
//  remaining balance due), auto-collection consent, credit-bureau reporting
//  consent (TASDEEQ / DataCheck / eCIB via partners) and an arbitration clause.
//
//  MUTUAL_PG — the member-to-member cross-guarantee recorded per committee at
//  join, BEFORE the circle starts. It runs between the members: Halqa is the
//  record-keeper and witness, never the beneficiary — no guarantee runs to
//  Halqa, which preserves the facilitator (non-lender) posture.
//
// TEMPLATE ONLY: the wording must be reviewed by Pakistani counsel before it
// is relied on in an actual recovery. Versions bump when the text changes;
// signatures store the version + sha256 of the exact text signed.

export const PLATFORM_UNDERTAKING_VERSION = 1;
export const MUTUAL_PG_VERSION = 1;
export const UNDERTAKING_VALID_DAYS = 7;

export const hashText = (text: string) => createHash('sha256').update(text).digest('hex');

export const platformUndertakingText = (fullName: string, cnic?: string | null) => `HALQA MEMBER UNDERTAKING (IQRARNAMA)
Signed electronically under the Electronic Transactions Ordinance, 2002.

I, ${fullName}${cnic ? `, CNIC ${cnic}` : ''}, being the verified holder of this Halqa account, solemnly undertake and declare:

1. IDENTITY. I sign under my own CNIC-verified identity. This electronic signature has the same legal effect as my handwritten signature (s.3, Electronic Transactions Ordinance 2002).

2. PROMISE TO PAY. Every committee installment I commit to on Halqa is an unconditional promise to pay a fixed sum of money on a fixed date, owed to the members of my circle. Each unpaid installment is a debt and liquidated demand recoverable as such.

3. ACCELERATION. If I receive a circle payout and then fail to pay an installment beyond the disclosed grace window, and the default is certified from the platform ledger, ALL my remaining installments in that circle become immediately due and payable in full, together with recovery costs.

4. AUTO-COLLECTION. I authorise the scheduling of automatic collection of each due installment from my linked account or wallet on its due date, and I undertake to keep sufficient balance available. I acknowledge I will receive reminders before each collection. Where I designate a SALARY account as my linked collection account, I authorise salary-linked collection from it and receive the disclosed reduction in circle fees in return.

5. CREDIT REPORTING. I consent to my payment behaviour on Halqa — positive and negative — being reported to licensed credit bureaus in Pakistan (including TASDEEQ and DataCheck) and, through partner financial institutions, to the State Bank's eCIB, when such linkages are active. I delegate authority to conduct credit assessment on me through governmental and non-governmental sources for the purpose of circle participation.

6. OBLIGATIONS TO MEMBERS. My obligations run to my fellow circle members. I acknowledge the separate mutual guarantee I sign for each circle, and that my fellow members hold enforceable rights against me on the platform record.

7. RECOVERY CHANNELS. On a certified default I consent to: (a) forfeiture of my recorded deposits and payout holdbacks in that circle; (b) recovery by summary procedure under Order XXXVII of the Code of Civil Procedure 1908 as a suit on a written promise to pay a liquidated demand; (c) at the claimants' election, arbitration before a sole arbitrator seated in Pakistan on an expedited timetable, the award enforceable as a decree; (d) permanent recording of the default against my CNIC on the Halqa network; (e) LINKED ACCOUNTS: while my default remains unresolved, accounts linked to mine — family members and associates identified by shared device, referral or guarantee relationships on the platform — may have their payouts withheld and new joins declined until my obligation is cleared.

8. WEEKLY RENEWAL. This undertaking remains valid for seven days and I renew it to continue transacting. Non-renewal does not extinguish obligations already incurred.

9. RECORD-ONLY PLATFORM. I understand Halqa records and facilitates; it does not hold my money, is not my lender, and is not a beneficiary of my obligations or of any guarantee.

10. GOVERNING LAW. This undertaking is governed by the laws of Pakistan. If any clause is held unenforceable, the remainder stands.`;

export const mutualPgText = (committeeName: string, contributionPaisa: bigint, memberCap: number, cycleNumber: number) => `MUTUAL MEMBER-TO-MEMBER GUARANTEE — ${committeeName} (cycle ${cycleNumber})
Signed electronically under the Electronic Transactions Ordinance, 2002, before the circle starts.

Each member of this circle, signing for themselves and to every other member:

1. GUARANTEE. I personally and irrevocably guarantee to every other member of this circle the payment of my own contributions — Rs ${(Number(contributionPaisa) / 100).toLocaleString('en-PK')} per round across up to ${memberCap} rounds — as a fixed and liquidated sum, and I stand behind this guarantee with my personal assets.

2. CROSS-ENFORCEMENT. If I default after receiving the pool, each other member (individually or together) may enforce this guarantee against me using the platform's certified ledger record: by summary procedure under Order XXXVII CPC, by expedited arbitration, and by reporting the default to licensed credit bureaus against my CNIC.

3. ACCELERATION. On certified default, my entire remaining obligation for this cycle becomes due at once, with recovery costs.

4. NOT TO HALQA. This guarantee runs between the members only. Halqa is the record-keeper and witness of this instrument; it is not a party to, or beneficiary of, this guarantee, and holds no member funds.

5. DURATION. This guarantee is effective when the circle starts and stands until my obligations for this cycle are fully discharged.`;

export type AgreementDoc = 'PLATFORM_UNDERTAKING' | 'MUTUAL_PG';

// The newest unexpired PLATFORM_UNDERTAKING at the current version. Weekly
// renewal = expiresAt lands 7 days after signing; an expired row simply stops
// counting, the member signs again.
export async function freshUndertaking(db: PrismaClient | Prisma.TransactionClient, userId: string): Promise<boolean> {
  const row = await db.agreementSignature.findFirst({
    where: { userId, docType: 'PLATFORM_UNDERTAKING', version: PLATFORM_UNDERTAKING_VERSION, expiresAt: { gt: new Date() } },
    orderBy: { signedAt: 'desc' },
  });
  return Boolean(row);
}

// Money-action gate: creating, joining, waitlisting and paying all require a
// live (unexpired) undertaking. 428 tells the client to open the signing
// overlay; nothing already committed is affected by an expired signature.
export function requireFreshUndertaking(db: PrismaClient) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (await freshUndertaking(db, req.auth!.userId)) return next();
      return res.status(428).json({ error: 'Your weekly member undertaking needs to be signed before this action', code: 'UNDERTAKING_REQUIRED' });
    } catch (error) { next(error); }
  };
}
