// ---------------------------------------------------------------------------
// THE EVENT TAXONOMY
//
// Work register AM4, and the "screen view and main action recorded" item on
// every screen. One list of every event the application may record, each with
// what it means and the few properties it may carry.
//
// Why a list rather than free text at each call site: an event named
// `pay_clicked` on one screen and `payment_started` on another is two events to
// the analytics and one to everybody else, and the funnel meant to show where
// members fall out shows nothing.
//
// WHAT AN EVENT MAY NEVER CARRY
//
//   No name, phone number, CNIC, account number, address or email.
//   No amount of money and no balance. "An instalment was paid" is an event;
//   how much was paid belongs in the ledger, which is Halqa's and the bank's,
//   not an analytics provider's.
//   No free text a member typed.
//
// Only the properties listed below may travel, and `cleanProps` drops anything
// that looks personal even when it is passed under an allowed name, so a
// careless call loses the property rather than leaking it.
// ---------------------------------------------------------------------------

/** Every event the application may record. Nothing outside this list is sent. */
export const EVENTS = {
  // Getting in
  app_opened: 'the application was opened',
  signup_started: 'the welcome screen led to the phone number',
  phone_submitted: 'a phone number was submitted',
  code_verified: 'the one time code was accepted',
  pin_set: 'the application PIN was set',
  profile_completed: 'name, date of birth and address were saved',
  cnic_captured: 'both sides of the CNIC were captured',
  liveness_passed: 'the liveness check passed',

  // The bank
  bank_onboarding_started: "the bank's account opening was entered",
  bank_account_opened: 'the bank confirmed the account',
  bank_account_refused: 'the bank refused the account',

  // Circles
  circle_viewed: 'a circle was opened',
  circle_created: 'a circle was created',
  invitation_shared: 'an invitation was shared',
  joining_requested: 'a member asked to join',
  admitted: 'the host admitted a member',
  key_facts_accepted: 'the key fact statement was accepted',
  undertaking_signed: 'the undertaking was signed',

  // Paying
  mandate_started: 'the mandate journey was entered',
  mandate_authorised: 'the bank confirmed the mandate',
  mandate_cancelled: 'the mandate was cancelled',
  payment_method_added: 'a payment method was linked',
  payment_started: 'a payment was begun',
  payment_succeeded: 'a payment completed',
  payment_failed: 'a payment did not complete',
  payout_received: 'a payout reached the member',

  // When it goes wrong
  late_notice_opened: 'a late notice was opened',
  hardship_requested: 'a hardship plan was asked for',
  exit_requested: 'a member asked to leave',
  dispute_opened: 'a dispute was opened',
  complaint_opened: 'a complaint was opened',

  // Rewards and the market
  points_credited: 'points were credited',
  points_redeemed: 'points were spent',
  order_placed: 'a marketplace order was placed',
  turn_listed: 'a turn was listed',
  offer_made: 'an offer was made on a turn',
  trade_settled: 'a turn trade settled',
  hyper_joined: 'a Hyper circle was joined',

  // Help and settings
  help_article_read: 'a help article was read',
  support_contacted: 'support was contacted',
  language_changed: 'the language was changed',
  notification_opened: 'a notification was opened',
  device_bound: 'a device was bound',
  cooling_off_reached: 'a financial action met the cooling off',
  account_closed: 'the account was closed',

  // Every screen records that it was seen, naming itself as a property.
  screen_viewed: 'a screen was shown',
} as const;

export type EventName = keyof typeof EVENTS;
export const EVENT_NAMES = Object.keys(EVENTS) as EventName[];

/** The only properties that may travel with an event. */
export const ALLOWED_PROPERTIES = [
  'screen',   // which screen, by its name
  'circleId', // an opaque id, never the circle's name
  'step',     // where in a journey
  'reason',   // a reason CODE, never free text
  'method',   // the rail, by its code
  'count',    // a number of things, never an amount of money
  'ms',       // how long something took
  'ok',       // whether it succeeded
] as const;
export type EventProperty = typeof ALLOWED_PROPERTIES[number];
export type EventProps = Partial<Record<EventProperty, string | number | boolean>>;

/** Anything shaped like a person, an account or an amount of money. */
const LOOKS_PERSONAL = /\d{11,}|\d{5}-\d{7}-\d|[\w.+-]+@[\w-]+\.[\w.]+|\+?92\d/;
const LOOKS_LIKE_MONEY = /\bRs\s?\d|\bpaisa\b|\b\d{4,}\.\d{2}\b/i;

/** Keep only what is allowed, and only where it carries nothing personal. */
export function cleanProps(props: Record<string, unknown> = {}): EventProps {
  const out: EventProps = {};
  for (const key of ALLOWED_PROPERTIES) {
    const value = props[key];
    if (value === undefined || value === null) continue;
    if (typeof value === 'string') {
      if (LOOKS_PERSONAL.test(value) || LOOKS_LIKE_MONEY.test(value)) continue;
      if (value.length > 64) continue; // free text, not a code
      out[key] = value;
    } else if (typeof value === 'number' || typeof value === 'boolean') {
      out[key] = value;
    }
  }
  return out;
}

export type TrackedEvent = { name: EventName; props: EventProps; at: number };

/** Where events go. A provider is wired in here once one is chosen (AM4). */
let sink: ((e: TrackedEvent) => void) | null = null;
export const setEventSink = (fn: ((e: TrackedEvent) => void) | null) => { sink = fn; };

/**
 * Record an event. An unknown name is refused rather than invented, so the list
 * above stays the whole list.
 */
export function track(name: EventName, props: Record<string, unknown> = {}): TrackedEvent | null {
  if (!Object.prototype.hasOwnProperty.call(EVENTS, name)) return null;
  const e: TrackedEvent = { name, props: cleanProps(props), at: Date.now() };
  try {
    sink?.(e);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('halqa:event', { detail: e }));
    }
  } catch { /* analytics must never break a screen */ }
  return e;
}

/** Every screen calls this once when it is shown. */
export const trackScreen = (screen: string, props: Record<string, unknown> = {}) =>
  track('screen_viewed', { ...props, screen });

// The older action event, kept so the screens already calling it keep working
// while they move across to track(). The vault actions are gone with the vault.
export type HalqaAction = 'CREATE_CIRCLE' | 'PAY_INSTALLMENT' | 'PAYOUT' | 'CONSENT' | 'JOIN';
const ACTION_EVENT: Record<HalqaAction, EventName> = {
  CREATE_CIRCLE: 'circle_created',
  PAY_INSTALLMENT: 'payment_started',
  PAYOUT: 'payout_received',
  CONSENT: 'undertaking_signed',
  JOIN: 'joining_requested',
};
export const emitHalqaAction = (type: HalqaAction) => {
  track(ACTION_EVENT[type]);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('halqa:action', { detail: { type } }));
  }
};
