import { describe, expect, it } from 'vitest';
import {
  FIELD_RULES, FIELD_KEYS, checkField, mobileOk, pinOk, pinWeak, ibanOk, cnicOk, inviteCodeOk, ageOk, fileOk,
  TYPE_RANGES, DUE_DAY,
} from '../src/lib/field-rules';

// Every field a member fills in, driven through its own examples. A rule added
// without examples fails here rather than going untested, which is the point:
// the register asks for a valid value, an invalid value and the boundaries on
// each field, and this is where that is kept honest.

describe('every field carries a rule, a message and examples', () => {
  it('names its screen, its rule and the sentence the member reads', () => {
    expect(FIELD_KEYS.length).toBeGreaterThanOrEqual(90);
    for (const key of FIELD_KEYS) {
      const r = FIELD_RULES[key];
      expect(r.screen.length, key).toBeGreaterThan(2);
      expect(r.field.length, key).toBeGreaterThan(1);
      expect(r.rule.length, key).toBeGreaterThan(5);
      expect(r.message.length, key).toBeGreaterThan(5);
    }
  });

  it('writes no message that blames the member or names an internal field', () => {
    const forbidden = /invalid|error|failed|null|undefined|regex|schema|exception/i;
    for (const key of FIELD_KEYS) {
      expect(forbidden.test(FIELD_RULES[key].message), `${key}: ${FIELD_RULES[key].message}`).toBe(false);
    }
  });

  it('gives every field at least one value that must fail', () => {
    for (const key of FIELD_KEYS) {
      expect(FIELD_RULES[key].examples.invalid.length, key).toBeGreaterThan(0);
    }
  });

  it('accepts every value its own examples say are valid', () => {
    const bad: string[] = [];
    for (const key of FIELD_KEYS) {
      for (const v of FIELD_RULES[key].examples.valid) {
        if (!FIELD_RULES[key].check(v)) bad.push(`${key} rejected ${JSON.stringify(v)}`);
      }
    }
    expect(bad, bad.join('\n')).toEqual([]);
  });

  it('refuses every value its own examples say are invalid', () => {
    const bad: string[] = [];
    for (const key of FIELD_KEYS) {
      for (const v of FIELD_RULES[key].examples.invalid) {
        if (FIELD_RULES[key].check(v)) bad.push(`${key} accepted ${JSON.stringify(v)}`);
      }
    }
    expect(bad, bad.join('\n')).toEqual([]);
  });

  it('returns the member sentence on a failure and nothing on a pass', () => {
    expect(checkField('signup.pin', '193847')).toBeNull();
    expect(checkField('signup.pin', '111111')).toBe(FIELD_RULES['signup.pin'].message);
  });

  it('a field whose rule needs the server says so rather than pretending', () => {
    const needing = FIELD_KEYS.filter(k => FIELD_RULES[k].needsServer);
    expect(needing.length).toBeGreaterThan(5);
    for (const k of needing) expect(FIELD_RULES[k].needsServer!.length).toBeGreaterThan(10);
  });
});

describe('the boundaries, where one value passes and the next does not', () => {
  it('a mobile number is 3 then nine digits, however it is written', () => {
    expect(mobileOk('3001234567')).toBe(true);
    expect(mobileOk('03001234567')).toBe(true);
    expect(mobileOk('+92 300 1234567')).toBe(true);
    expect(mobileOk('300123456')).toBe(false);   // one short
    expect(mobileOk('30012345678')).toBe(false); // one long
    expect(mobileOk('2001234567')).toBe(false);  // does not start with 3
  });

  it('a PIN is six digits and never a run or a repeat', () => {
    expect(pinOk('193847')).toBe(true);
    expect(pinOk('12345')).toBe(false);
    expect(pinOk('1234567')).toBe(false);
    expect(pinWeak('111111')).toBe(true);
    expect(pinWeak('123456')).toBe(true);
    expect(pinWeak('654321')).toBe(true);
    expect(pinWeak('193847')).toBe(false);
  });

  it('an IBAN must pass the checksum, not merely the shape', () => {
    expect(ibanOk('PK36SCBL0000001123456702')).toBe(true);
    expect(ibanOk('PK36SCBL0000001123456703')).toBe(false); // right shape, wrong check digits
    expect(ibanOk('PK36SCBL000000112345670')).toBe(false);  // 23 characters
    expect(ibanOk('GB33BUKB20201555555555')).toBe(false);   // not Pakistan
  });

  it('a CNIC is thirteen digits, with or without the dashes', () => {
    expect(cnicOk('6110112345671')).toBe(true);
    expect(cnicOk('61101-1234567-1')).toBe(true);
    expect(cnicOk('611011234567')).toBe(false);
  });

  it('an invitation code is HLQ and eight characters', () => {
    expect(inviteCodeOk('HLQ-AB12CD34')).toBe(true);
    expect(inviteCodeOk('HLQ-AB12CD3')).toBe(false);
    expect(inviteCodeOk('ABC-AB12CD34')).toBe(false);
  });

  it('eighteen is the boundary, to the day', () => {
    const today = new Date('2026-10-06');
    const eighteenToday = new Date('2008-10-05');
    const eighteenTomorrow = new Date('2008-10-07');
    expect(ageOk(eighteenToday, { today })).toBe(true);
    expect(ageOk(eighteenTomorrow, { today })).toBe(false);
  });

  it('a file is five megabytes or less, and of a type that can be read', () => {
    expect(fileOk({ name: 'a.pdf', sizeBytes: 5 * 1024 * 1024 })).toBe(true);
    expect(fileOk({ name: 'a.pdf', sizeBytes: 5 * 1024 * 1024 + 1 })).toBe(false);
    expect(fileOk({ name: 'a.exe', sizeBytes: 10 })).toBe(false);
    expect(fileOk({ name: 'a.pdf', sizeBytes: 0 })).toBe(false);
  });

  it('an instalment sits inside the range its kind of circle allows', () => {
    const known = { allowed: ['Known'] as const };
    expect(FIELD_RULES['circle.instalment'].check(2_000, known)).toBe(true);
    expect(FIELD_RULES['circle.instalment'].check(1_999, known)).toBe(false);
    expect(FIELD_RULES['circle.instalment'].check(10_000, known)).toBe(true);
    expect(FIELD_RULES['circle.instalment'].check(10_001, known)).toBe(false);
    const large = { allowed: ['Large unknown'] as const };
    expect(FIELD_RULES['circle.instalment'].check(25_000, large)).toBe(true);
    expect(FIELD_RULES['circle.instalment'].check(25_001, large)).toBe(false);
  });

  it('a salary circle falls due on the 8th and no other day', () => {
    expect(DUE_DAY).toBe(8);
    expect(FIELD_RULES['circle.dueDay'].check(8)).toBe(true);
    expect(FIELD_RULES['circle.dueDay'].check(10)).toBe(false);
  });

  it('a part payment is at least Rs 500 and never more than the instalment', () => {
    const ctx = { instalmentRupees: 10_000 };
    expect(FIELD_RULES['pay.amount'].check(500, ctx)).toBe(true);
    expect(FIELD_RULES['pay.amount'].check(499, ctx)).toBe(false);
    expect(FIELD_RULES['pay.amount'].check(10_000, ctx)).toBe(true);
    expect(FIELD_RULES['pay.amount'].check(10_001, ctx)).toBe(false);
  });

  it('a turn is never priced above the pot', () => {
    const ctx = { potPoints: 120_000, pointsBalance: 500_000 };
    expect(FIELD_RULES['turn.askingPrice'].check(120_000, ctx)).toBe(true);
    expect(FIELD_RULES['turn.askingPrice'].check(120_001, ctx)).toBe(false);
    expect(FIELD_RULES['turn.offer'].check(120_000, ctx)).toBe(true);
    expect(FIELD_RULES['turn.offer'].check(120_001, ctx)).toBe(false);
  });

  it('an offer is also capped by what the buyer actually holds', () => {
    expect(FIELD_RULES['turn.offer'].check(60_000, { potPoints: 120_000, pointsBalance: 50_000 })).toBe(false);
    expect(FIELD_RULES['turn.offer'].check(50_000, { potPoints: 120_000, pointsBalance: 50_000 })).toBe(true);
  });

  it('a financial alert cannot be switched off', () => {
    expect(FIELD_RULES['settings.notification'].check({ key: 'financial', on: true })).toBe(true);
    expect(FIELD_RULES['settings.notification'].check({ key: 'financial', on: false })).toBe(false);
    expect(FIELD_RULES['settings.notification'].check({ key: 'marketing', on: false })).toBe(true);
  });

  it('a mandate ceiling never exceeds one instalment', () => {
    const ctx = { instalmentRupees: 10_000 };
    expect(FIELD_RULES['mandate.ceiling'].check(10_000, ctx)).toBe(true);
    expect(FIELD_RULES['mandate.ceiling'].check(10_001, ctx)).toBe(false);
  });

  it('a statement range runs forwards and covers at most twelve months', () => {
    const r = FIELD_RULES['statement.range'];
    expect(r.check({ from: '2026-01-01', to: '2026-12-01' })).toBe(true);
    expect(r.check({ from: '2026-01-01', to: '2027-06-01' })).toBe(false);
    expect(r.check({ from: '2026-06-01', to: '2026-01-01' })).toBe(false);
  });

  it('the transaction PIN is never the application PIN', () => {
    expect(FIELD_RULES['security.transactionPin'].check('472916', { otherPin: '193847' })).toBe(true);
    expect(FIELD_RULES['security.transactionPin'].check('193847', { otherPin: '193847' })).toBe(false);
  });

  it('every kind of circle has a range, and none of them overlap into nonsense', () => {
    for (const [name, t] of Object.entries(TYPE_RANGES)) {
      expect(t.instalment[0], name).toBeLessThanOrEqual(t.instalment[1]);
      expect(t.members[0], name).toBeLessThanOrEqual(t.members[1]);
      expect(t.members[0], name).toBeGreaterThanOrEqual(6);
    }
  });
});
