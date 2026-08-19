import { describe, expect, it } from 'vitest';
import {
  CONFIRMATION_WINDOW_HOURS,
  availableRungs,
  forwardObligationPaisa,
  windowState,
  withdrawalOutcome,
} from '../src/lib/exit-ladder';

const HOUR = 3_600_000;

describe('the 24-hour confirmation window', () => {
  it('has no state before the host presses Start', () => {
    expect(windowState(null)).toBeNull();
    expect(windowState(undefined)).toBeNull();
  });

  it('closes exactly 24 hours after Start, not 24 hours after each join', () => {
    const opened = new Date('2026-08-19T09:00:00Z');
    const w = windowState(opened, opened)!;
    expect(w.closesAt.toISOString()).toBe('2026-08-20T09:00:00.000Z');
    expect(CONFIRMATION_WINDOW_HOURS).toBe(24);
  });

  it('stays open right up to the deadline and shuts on it', () => {
    const opened = new Date('2026-08-19T09:00:00Z');
    const oneMinuteLeft = new Date(opened.getTime() + 23 * HOUR + 59 * 60_000);
    expect(windowState(opened, oneMinuteLeft)!.open).toBe(true);

    const exactly = new Date(opened.getTime() + 24 * HOUR);
    const shut = windowState(opened, exactly)!;
    expect(shut.open).toBe(false);
    expect(shut.expired).toBe(true);
    expect(shut.msRemaining).toBe(0);
  });

  it('never reports negative time remaining once long expired', () => {
    const opened = new Date('2026-08-19T09:00:00Z');
    const late = new Date(opened.getTime() + 400 * HOUR);
    expect(windowState(opened, late)!.msRemaining).toBe(0);
  });

  it('offers only the free rung while the window is open', () => {
    // Inside the window nothing is owed, so no priced exit should ever be shown.
    expect(availableRungs({
      inConfirmationWindow: true, hasCollected: false,
      substituteAvailable: true, hardshipFiled: true,
    })).toEqual(['WINDOW']);
  });

  it('offers priced rungs once the window has closed', () => {
    const rungs = availableRungs({
      inConfirmationWindow: false, hasCollected: false,
      substituteAvailable: true, hardshipFiled: false,
    });
    expect(rungs).toContain('SUBSTITUTION');
    expect(rungs).toContain('GROUP_VOTE');
    expect(rungs).not.toContain('WINDOW');
  });

  it('offers nothing at all to a member who already collected', () => {
    // Taking the pot and leaving is default, not exit. The ladder must not
    // present it as a way out.
    expect(availableRungs({
      inConfirmationWindow: true, hasCollected: true,
      substituteAvailable: true, hardshipFiled: true,
    })).toEqual([]);
  });
});

describe('withdrawing during the window', () => {
  it('keeps the circle in the window while it stays at or above the minimum', () => {
    expect(withdrawalOutcome(6, 6)).toEqual({ status: 'CONFIRMING', reopened: false });
    expect(withdrawalOutcome(9, 6)).toEqual({ status: 'CONFIRMING', reopened: false });
  });

  it('reopens the circle for recruiting when it drops below the minimum', () => {
    // A circle must not quietly carry on smaller than the one everyone joined.
    expect(withdrawalOutcome(5, 6)).toEqual({ status: 'FORMING', reopened: true });
    expect(withdrawalOutcome(0, 3)).toEqual({ status: 'FORMING', reopened: true });
  });
});

describe('the forward obligation shown during the window', () => {
  it('is the whole cycle, not one installment', () => {
    // Rs 10,000 a round across 12 rounds is Rs 120,000. This is the number the
    // old flow never showed anyone before they were committed to it.
    expect(forwardObligationPaisa(1_000_000n, 12)).toBe(12_000_000n);
  });

  it('is exact in integer paisa, with no floating point drift', () => {
    const odd = 333_333n; // Rs 3,333.33
    expect(forwardObligationPaisa(odd, 7)).toBe(2_333_331n);
  });

  it('is zero for a circle with no rounds rather than negative', () => {
    expect(forwardObligationPaisa(1_000_000n, 0)).toBe(0n);
    expect(forwardObligationPaisa(1_000_000n, -3)).toBe(0n);
  });
});
