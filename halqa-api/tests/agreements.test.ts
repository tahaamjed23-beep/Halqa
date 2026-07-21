import { describe, expect, it } from 'vitest';
import {
  MUTUAL_PG_VERSION, PLATFORM_UNDERTAKING_VERSION, UNDERTAKING_VALID_DAYS,
  hashText, mutualPgText, platformUndertakingText,
} from '../src/lib/agreements';

describe('platform undertaking (weekly iqrarnama)', () => {
  const text = platformUndertakingText('Ayesha Noor', '42101-1234567-8');

  it('carries every load-bearing clause', () => {
    for (const clause of [
      'Electronic Transactions Ordinance, 2002',
      'CNIC 42101-1234567-8',
      'PROMISE TO PAY',
      'liquidated demand',
      'ACCELERATION',
      'AUTO-COLLECTION',
      'CREDIT REPORTING',
      'TASDEEQ',
      'eCIB',
      'Order XXXVII',
      'arbitration before a sole arbitrator',
      'WEEKLY RENEWAL',
      'not my lender',
      'SALARY account',
      'LINKED ACCOUNTS',
      'shared device, referral or guarantee',
    ]) expect(text).toContain(clause);
  });

  it('omits the personal CNIC cleanly when none is on file yet', () => {
    const anon = platformUndertakingText('Bilal Raza', null);
    expect(anon).toContain('I, Bilal Raza, being');
    expect(anon).not.toContain('CNIC 42101'); // no personal number; the clause-1 "CNIC-verified identity" wording stays
  });

  it('hashes deterministically and personalisation changes the hash', () => {
    expect(hashText(text)).toMatch(/^[0-9a-f]{64}$/);
    expect(hashText(text)).toBe(hashText(platformUndertakingText('Ayesha Noor', '42101-1234567-8')));
    expect(hashText(text)).not.toBe(hashText(platformUndertakingText('Sana Butt', '42101-1234567-8')));
  });

  it('renews weekly at version 1', () => {
    expect(PLATFORM_UNDERTAKING_VERSION).toBe(1);
    expect(UNDERTAKING_VALID_DAYS).toBe(7);
  });
});

describe('mutual member-to-member guarantee', () => {
  const text = mutualPgText('Gulshan Sisters', 1_000_000n, 12, 1);

  it('names the circle, the amount and the rounds', () => {
    expect(text).toContain('Gulshan Sisters');
    expect(text).toContain('Rs 10,000');
    expect(text).toContain('12 rounds');
    expect(text).toContain('cycle 1');
  });

  it('runs between members only — Halqa is never the beneficiary', () => {
    expect(text).toContain('NOT TO HALQA');
    expect(text).toContain('not a party to, or beneficiary of, this guarantee');
  });

  it('keeps the fast-recovery channels in the text', () => {
    expect(text).toContain('Order XXXVII');
    expect(text).toContain('credit bureaus');
    expect(text).toContain('ACCELERATION');
    expect(MUTUAL_PG_VERSION).toBe(1);
  });
});
