import { describe, expect, it } from 'vitest';
import {
  NOTICES, NOTICE_KEYS, shouldSend, cheapestChannel, render, inQuietHours, logEntry,
  QUIET_FROM, QUIET_TO, type Channel,
} from '../src/lib/notices';

// Every message a member can receive, checked against the rules the register
// sets for them: a locked alert always goes, nothing else wakes anybody, the
// cheapest channel that will do is the one taken, and no message carries
// something it must not.

const NOON = new Date('2026-10-06T12:00:00');
const MIDNIGHT = new Date('2026-10-06T23:30:00');

describe('every notice is complete', () => {
  it('covers the events the register lists', () => {
    expect(NOTICE_KEYS.length).toBeGreaterThanOrEqual(70);
  });

  it('names its trigger, its timing and at least one channel', () => {
    for (const key of NOTICE_KEYS) {
      const n = NOTICES[key];
      expect(n.trigger.length, key).toBeGreaterThan(8);
      expect(n.timing.length, key).toBeGreaterThan(3);
      expect(n.channels.length, key).toBeGreaterThan(0);
      expect(n.group.length, key).toBeGreaterThan(2);
    }
  });

  it('has words for every channel it claims, and none for channels it does not', () => {
    for (const key of NOTICE_KEYS) {
      const n = NOTICES[key];
      for (const c of n.channels) {
        const body = render(key, c, { amount: 'Rs 10,000', circle: 'Gulshan savers', name: 'Ali', date: 'the 8th' });
        expect(body, `${key} has no words for ${c}`).toBeTruthy();
        expect(body!.length, `${key}/${c}`).toBeGreaterThan(8);
      }
      for (const c of ['app', 'push', 'whatsapp', 'sms', 'email'] as Channel[]) {
        if (!n.channels.includes(c)) expect(render(key, c), `${key} writes for ${c} it does not use`).toBeNull();
      }
    }
  });

  it('leaves no gap where a value was not supplied', () => {
    // Rendering with nothing at all must still read as a sentence, never as
    // "undefined" or an empty slot in the middle of a line.
    for (const key of NOTICE_KEYS) {
      for (const c of NOTICES[key].channels) {
        const body = render(key, c, {})!;
        expect(body, `${key}/${c}`).not.toMatch(/undefined|null|NaN|\[object/);
        expect(body.trim(), `${key}/${c}`).toBe(body.trim().replace(/\s{2,}/g, ' '));
      }
    }
  });
});

describe('what a message may never say', () => {
  const render_all = () =>
    NOTICE_KEYS.flatMap(k => NOTICES[k].channels.map(c => [k, c, render(k, c, {
      amount: 'Rs 10,000', circle: 'Gulshan savers', name: 'Ali', reference: 'REF1', code: '123456',
    })!] as const));

  it('never asks for a PIN or a code', () => {
    for (const [k, c, body] of render_all()) {
      expect(/send (us )?your (pin|code)|enter your pin|share your (pin|code)/i.test(body), `${k}/${c}`).toBe(false);
    }
  });

  it('never carries an account number or a CNIC', () => {
    for (const [k, c, body] of render_all()) {
      // 11 or more consecutive digits is an account number, a CNIC or a phone.
      expect(/\d{11,}/.test(body.replace(/[\s,]/g, '')), `${k}/${c}: ${body}`).toBe(false);
    }
  });

  it('uses no dash as punctuation', () => {
    for (const [k, c, body] of render_all()) {
      expect(/[–—]/.test(body), `${k}/${c}: ${body}`).toBe(false);
    }
  });

  it('the only message carrying a code is the one time code itself, and it warns', () => {
    const body = render('code.signin', 'sms', { code: '123456' })!;
    expect(body).toContain('123456');
    expect(body.toLowerCase()).toContain('never ask');
  });
});

describe('locked alerts', () => {
  it('a message about money or an account change cannot be switched off', () => {
    for (const key of ['collection.taken', 'collection.failed', 'circle.payoutSent', 'security.pinChanged',
      'security.newDevice', 'mandate.authorised', 'mandate.cancelled'] as const) {
      expect(NOTICES[key].locked, key).toBe(true);
    }
  });

  it('a locked alert goes out at any hour and whatever the preferences', () => {
    expect(shouldSend('circle.payoutSent', 'app', MIDNIGHT, { app: false })).toBe(true);
    expect(shouldSend('security.newDevice', 'sms', MIDNIGHT, { sms: false, Security: false })).toBe(true);
  });

  it('everything else is silent in the quiet hours', () => {
    expect(inQuietHours(MIDNIGHT)).toBe(true);
    expect(inQuietHours(NOON)).toBe(false);
    expect(inQuietHours(new Date(`2026-10-06T0${QUIET_TO - 1}:59:00`))).toBe(true);
    expect(inQuietHours(new Date(`2026-10-06T0${QUIET_TO}:00:00`))).toBe(false);
    expect(inQuietHours(new Date(`2026-10-06T${QUIET_FROM}:00:00`))).toBe(true);
    expect(shouldSend('circle.invited', 'push', MIDNIGHT)).toBe(false);
    expect(shouldSend('circle.invited', 'push', NOON)).toBe(true);
  });

  it('an unlocked notice respects the member\'s choice, by channel and by group', () => {
    expect(shouldSend('points.onTime', 'app', NOON)).toBe(true);
    expect(shouldSend('points.onTime', 'app', NOON, { app: false })).toBe(false);
    expect(shouldSend('points.onTime', 'app', NOON, { 'Points, marketplace and turns': false })).toBe(false);
  });
});

describe('what a message costs', () => {
  it('takes a free channel over a charged one where both would carry it', () => {
    // Push and in-application cost nothing; WhatsApp and SMS are paid for.
    expect(cheapestChannel('identity.passed', NOON)).toBe('push');
    expect(cheapestChannel('circle.invited', NOON)).toBe('push');
  });

  it('Hyper never uses WhatsApp, because the fee is Rs 15 a day', () => {
    for (const key of NOTICE_KEYS.filter(k => NOTICES[k].group === 'Hyper')) {
      expect(NOTICES[key].channels, key).not.toContain('whatsapp');
      expect(NOTICES[key].channels, key).not.toContain('sms');
    }
  });

  it('falls back to a charged channel only when no free one will do', () => {
    // The one time code has nowhere free to go: it must reach a member who
    // cannot sign in, so SMS is the only channel it has.
    expect(cheapestChannel('code.signin', NOON)).toBe('sms');
  });

  it('returns nothing when every channel is closed to this member', () => {
    expect(cheapestChannel('points.onTime', MIDNIGHT, { app: false, push: false })).toBeNull();
  });
});

describe('the log', () => {
  it('records the event, the channel, the member, the words and the status', () => {
    const body = render('collection.taken', 'app', { amount: 'Rs 10,000', circle: 'Gulshan savers' })!;
    const e = logEntry('collection.taken', 'app', 'user_1', body, NOON);
    expect(e).toMatchObject({ key: 'collection.taken', channel: 'app', userId: 'user_1', status: 'QUEUED' });
    expect(e.body).toBe(body);
    expect(e.sentAt).toBe(NOON);
  });
});
