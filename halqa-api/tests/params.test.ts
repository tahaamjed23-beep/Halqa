// Path parameters. Work register: "input checked against a schema before any
// logic". Twenty-seven endpoints took no body, so nothing was checking the one
// part of their input a caller fully controls: the id in the path.
import { describe, expect, it } from 'vitest';
import { ID, idParam, inviteCodeParam, twoIdParams } from '../src/lib/params';

describe('what an id may be', () => {
  it('accepts a real cuid, which is what the database mints', () => {
    expect(ID.safeParse('cmuwkdmb0002s1mqeg4gltf4s').success).toBe(true);
  });

  it('accepts the shortest plausible id and the longest we allow', () => {
    expect(ID.safeParse('a'.repeat(7)).success).toBe(true);
    expect(ID.safeParse('a'.repeat(64)).success).toBe(true);
  });

  it('refuses an empty id, which used to reach the database as a query', () => {
    expect(ID.safeParse('').success).toBe(false);
    expect(ID.safeParse('   ').success).toBe(false);
  });

  it('refuses something far too long to be an id', () => {
    expect(ID.safeParse('a'.repeat(4_000)).success).toBe(false);
  });

  it('refuses punctuation and whitespace inside an id', () => {
    for (const bad of ['abc def', "abc'def", 'abc;def', 'abc/def', 'abc.def', '../etc/passwd', 'abc%20def']) {
      expect(ID.safeParse(bad).success, bad).toBe(false);
    }
  });

  it('refuses an id that does not start with a letter or a digit', () => {
    expect(ID.safeParse('-abcdefg').success).toBe(false);
    expect(ID.safeParse('_abcdefg').success).toBe(false);
  });

  it('trims, so a trailing newline is not a different id', () => {
    expect(idParam.parse({ id: ' cmuwkdmb0002s1mq \n' }).id).toBe('cmuwkdmb0002s1mq');
  });
});

describe('routes carrying two ids', () => {
  it('checks both', () => {
    const schema = twoIdParams('id', 'userId');
    expect(schema.safeParse({ id: 'cmuwkdmb0002s1mq', userId: 'cmuwkdmb0002s1mr' }).success).toBe(true);
    expect(schema.safeParse({ id: 'cmuwkdmb0002s1mq', userId: '' }).success).toBe(false);
    expect(schema.safeParse({ id: '', userId: 'cmuwkdmb0002s1mr' }).success).toBe(false);
  });
});

describe('an invite code', () => {
  it('accepts the shape committees.ts actually mints', () => {
    // HLQ, a dash, then eight characters of a UUID in capitals. A schema of
    // letters and digits only refused every real code, which is validation
    // that is worse than none, and this test is why it was caught.
    expect(inviteCodeParam.safeParse({ inviteCode: 'HLQ-A1B2C3D4' }).success).toBe(true);
    expect(inviteCodeParam.safeParse({ inviteCode: 'ABCD1234' }).success).toBe(true);
  });

  it('refuses an empty code, one far too long, and punctuation', () => {
    expect(inviteCodeParam.safeParse({ inviteCode: '' }).success).toBe(false);
    expect(inviteCodeParam.safeParse({ inviteCode: 'A'.repeat(40) }).success).toBe(false);
    expect(inviteCodeParam.safeParse({ inviteCode: 'HLQ_A1B2' }).success).toBe(false);
    expect(inviteCodeParam.safeParse({ inviteCode: "HLQ'A1B2" }).success).toBe(false);
  });
});
