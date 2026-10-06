// ---------------------------------------------------------------------------
// EVERY MESSAGE A MEMBER GETS
//
// Work register section AH. One entry per event: what fires it, when, down
// which channels, whether the member may switch it off, and the words
// themselves. Before this the texts lived wherever somebody first needed one,
// so the same event read differently in the application and on WhatsApp, and
// nothing recorded which events a member was allowed to silence.
//
// THE RULES THIS FILE ENFORCES
//
//   Cost.      Push and in-application messages are free; WhatsApp is not. At
//              Rs 15 a day, a WhatsApp message on every Hyper payment costs
//              more than the fee earns, so Hyper is push only. Every event
//              names the cheapest channel that will do.
//   Alerts.    A message about money leaving or arriving is LOCKED: the member
//              cannot switch it off, because a silent debit is how fraud goes
//              unnoticed. Everything else respects preferences and quiet hours.
//   Quiet.     Nothing but a locked alert is sent between 10 at night and 8 in
//              the morning. A reminder that wakes somebody is a reminder they
//              turn off.
//   Privacy.   No message carries a full account number, a CNIC, or another
//              member's balance. Names of other members appear only where the
//              member already knows them, which is inside their own circle.
//   Safety.    No message asks for a PIN or a code, and no link in a message
//              opens anything but the application.
//
// The Urdu is the translator's and is not written here. Each text names its
// English wording; `ur` is filled from the translator's file when it arrives,
// and a channel with no Urdu falls back to English rather than sending nothing.
// ---------------------------------------------------------------------------

export type Channel = 'app' | 'push' | 'whatsapp' | 'sms' | 'email';

export type NoticeVars = {
  name?: string;
  circle?: string;
  amount?: string;
  date?: string;
  time?: string;
  reason?: string;
  code?: string;
  count?: number | string;
  position?: number | string;
  reference?: string;
  bank?: string;
  device?: string;
  points?: number | string;
  step?: number | string;
};

export type Notice = {
  /** The group the register lists it under. */
  group: string;
  /** What fires it. */
  trigger: string;
  /** When it goes, relative to the trigger. */
  timing: string;
  channels: Channel[];
  /**
   * A locked notice is sent whatever the member's preferences and whatever the
   * hour, because it reports money moving or an account being changed.
   */
  locked: boolean;
  priority: 'P0' | 'P1' | 'P2' | 'P3';
  /** The English wording per channel. Urdu arrives from the translator. */
  text: Partial<Record<Channel, (v: NoticeVars) => string>>;
};

const v = (x?: string | number, fallback = '') => (x === undefined || x === null ? fallback : String(x));

export const NOTICES: Record<string, Notice> = {
  // --------------------------------------------- account and identity --
  'code.signin': {
    group: 'Account and identity', trigger: 'a one time code is requested for sign in or recovery',
    timing: 'at once', channels: ['sms'], locked: true, priority: 'P0',
    text: { sms: n => `${v(n.code)} is your Halqa code. It lasts five minutes. Halqa will never ask you for it.` },
  },
  'account.welcome': {
    group: 'Account and identity', trigger: 'sign up completes', timing: 'at once',
    channels: ['app', 'push'], locked: false, priority: 'P1',
    text: {
      app: n => `Welcome to Halqa, ${v(n.name, 'there')}. Your next step is to open your account at the bank.`,
      push: () => 'Welcome to Halqa. One step left: open your account at the bank.',
    },
  },
  'identity.submitted': {
    group: 'Account and identity', trigger: 'the identity check is submitted', timing: 'at once',
    channels: ['app'], locked: false, priority: 'P1',
    text: { app: () => 'Your details are with the bank. Most checks finish in a few minutes.' },
  },
  'identity.passed': {
    group: 'Account and identity', trigger: 'the identity check passes', timing: 'at once',
    channels: ['app', 'push', 'whatsapp'], locked: false, priority: 'P1',
    text: {
      app: () => 'Your identity is verified. You can join a circle now.',
      push: () => 'Identity verified. You can join a circle now.',
      whatsapp: () => 'Halqa: your identity is verified. Open the app to join a circle.',
    },
  },
  'identity.failed': {
    group: 'Account and identity', trigger: 'the identity check fails', timing: 'at once',
    channels: ['app', 'push', 'whatsapp'], locked: false, priority: 'P0',
    text: {
      app: n => `The bank could not verify your identity. ${v(n.reason, 'Check your CNIC details and try again.')}`,
      push: () => 'Identity check did not pass. Open Halqa to see what to fix.',
      whatsapp: () => 'Halqa: your identity check did not pass. Open the app to see what to fix.',
    },
  },
  'bank.opened': {
    group: 'Account and identity', trigger: 'the bank confirms the account is open', timing: 'at once',
    channels: ['app', 'push', 'whatsapp'], locked: false, priority: 'P0',
    text: {
      app: n => `Your account at ${v(n.bank, 'the bank')} is open. Instalments will be collected from it.`,
      push: n => `Your account at ${v(n.bank, 'the bank')} is open.`,
      whatsapp: n => `Halqa: your account at ${v(n.bank, 'the bank')} is open.`,
    },
  },
  'bank.refused': {
    group: 'Account and identity', trigger: 'the bank refuses the account', timing: 'at once',
    channels: ['app', 'push', 'whatsapp'], locked: false, priority: 'P0',
    text: {
      app: n => `The bank could not open your account. ${v(n.reason, 'You can still pay by wallet or card.')}`,
      push: () => 'The bank could not open your account. Open Halqa to see the other ways to pay.',
      whatsapp: () => 'Halqa: the bank could not open your account. Open the app to see the other ways to pay.',
    },
  },
  'cnic.expiring': {
    group: 'Account and identity', trigger: 'the CNIC expiry is within 30 days',
    timing: 'at 30 days, then at 7 days', channels: ['app', 'push', 'whatsapp'], locked: false, priority: 'P2',
    text: {
      app: n => `Your CNIC expires on ${v(n.date)}. Renew it to keep joining circles.`,
      push: n => `Your CNIC expires on ${v(n.date)}.`,
      whatsapp: n => `Halqa: your CNIC expires on ${v(n.date)}. Renew it to keep joining circles.`,
    },
  },
  'account.restricted': {
    group: 'Account and identity', trigger: 'the bank restricts the account', timing: 'at once',
    channels: ['app', 'push', 'whatsapp'], locked: true, priority: 'P1',
    text: {
      app: n => `The bank has restricted your account. ${v(n.reason, 'Contact the bank to lift it.')}`,
      push: () => 'Your account at the bank is restricted. Open Halqa for what to do.',
      whatsapp: () => 'Halqa: your account at the bank is restricted. Open the app for what to do.',
    },
  },

  // ------------------------------------------------------------ security --
  'security.newDevice': {
    group: 'Security', trigger: 'a new device is registered', timing: 'at once',
    channels: ['app', 'push', 'sms'], locked: true, priority: 'P0',
    text: {
      app: n => `A new device signed in: ${v(n.device, 'an unrecognised device')}, ${v(n.time)}. Not you? Block it now.`,
      push: () => 'A new device signed in to your Halqa account.',
      sms: () => 'Halqa: a new device signed in to your account. Not you? Open the app and block it.',
    },
  },
  'security.coolingOff': {
    group: 'Security', trigger: 'a device change starts the cooling off', timing: 'at once',
    channels: ['app', 'push'], locked: true, priority: 'P0',
    text: {
      app: n => `For your safety, payments and payout changes are paused until ${v(n.time)}.`,
      push: () => 'Payments are paused for two hours after a device change.',
    },
  },
  'security.pinChanged': {
    group: 'Security', trigger: 'the application PIN changes', timing: 'at once',
    channels: ['app', 'push', 'sms'], locked: true, priority: 'P0',
    text: {
      app: () => 'Your PIN was changed. If this was not you, contact support now.',
      push: () => 'Your Halqa PIN was changed.',
      sms: () => 'Halqa: your PIN was changed. If this was not you, contact support now.',
    },
  },
  'security.transactionPinChanged': {
    group: 'Security', trigger: 'the transaction PIN changes', timing: 'at once',
    channels: ['app', 'push', 'sms'], locked: true, priority: 'P0',
    text: {
      app: () => 'Your transaction PIN was changed. If this was not you, contact support now.',
      push: () => 'Your transaction PIN was changed.',
      sms: () => 'Halqa: your transaction PIN was changed. If this was not you, contact support now.',
    },
  },
  'security.newSignIn': {
    group: 'Security', trigger: 'a sign in from a device not seen before', timing: 'at once',
    channels: ['app', 'push', 'sms'], locked: true, priority: 'P0',
    text: {
      app: n => `Signed in from ${v(n.device, 'a new device')} at ${v(n.time)}.`,
      push: () => 'New sign in to your Halqa account.',
      sms: () => 'Halqa: a new sign in to your account. Not you? Open the app and sign out every device.',
    },
  },
  'security.blocked': {
    group: 'Security', trigger: 'the member asks for digital channels to be blocked', timing: 'at once',
    channels: ['app', 'push', 'sms'], locked: true, priority: 'P0',
    text: {
      app: () => 'Your digital channels are blocked. Contact the bank to open them again.',
      push: () => 'Your digital channels are blocked.',
      sms: () => 'Halqa: your digital channels are blocked at your request.',
    },
  },

  // ------------------------------------------- mandates and collection --
  'mandate.authorised': {
    group: 'Mandates and collection', trigger: 'the bank confirms the mandate', timing: 'at once',
    channels: ['app', 'push', 'whatsapp'], locked: true, priority: 'P0',
    text: {
      app: n => `Your instalment for ${v(n.circle)} will be collected automatically, up to ${v(n.amount)} each time.`,
      push: n => `Automatic payment is set up for ${v(n.circle)}.`,
      whatsapp: n => `Halqa: automatic payment is set up for ${v(n.circle)}, up to ${v(n.amount)} each time.`,
    },
  },
  'mandate.cancelled': {
    group: 'Mandates and collection', trigger: 'the mandate is cancelled at either end', timing: 'at once',
    channels: ['app', 'push', 'whatsapp'], locked: true, priority: 'P0',
    text: {
      app: n => `Automatic payment for ${v(n.circle)} is cancelled. Pay each instalment yourself from now on.`,
      push: n => `Automatic payment for ${v(n.circle)} is cancelled.`,
      whatsapp: n => `Halqa: automatic payment for ${v(n.circle)} is cancelled. You will need to pay each instalment yourself.`,
    },
  },
  'collection.eveningBefore': {
    group: 'Mandates and collection', trigger: 'the evening before the learned payday',
    timing: '7 in the evening, the day before', channels: ['push', 'whatsapp'], locked: false, priority: 'P0',
    text: {
      push: n => `${v(n.amount)} for ${v(n.circle)} will be collected tomorrow.`,
      whatsapp: n => `Halqa: ${v(n.amount)} for ${v(n.circle)} will be collected tomorrow. Keep it in your account.`,
    },
  },
  'collection.taken': {
    group: 'Mandates and collection', trigger: 'a collection succeeds', timing: 'at once',
    channels: ['app', 'push'], locked: true, priority: 'P0',
    text: {
      app: n => `${v(n.amount)} collected for ${v(n.circle)}. Reference ${v(n.reference)}.`,
      push: n => `${v(n.amount)} collected for ${v(n.circle)}.`,
    },
  },
  'collection.failed': {
    group: 'Mandates and collection', trigger: 'a collection attempt fails', timing: 'at once',
    channels: ['app', 'push', 'whatsapp'], locked: true, priority: 'P0',
    text: {
      app: n => `${v(n.amount)} for ${v(n.circle)} could not be collected. ${v(n.reason, 'We will try again tomorrow morning.')}`,
      push: n => `Payment for ${v(n.circle)} did not go through.`,
      whatsapp: n => `Halqa: ${v(n.amount)} for ${v(n.circle)} could not be collected. ${v(n.reason, 'We will try again tomorrow morning.')}`,
    },
  },
  'collection.retry': {
    group: 'Mandates and collection', trigger: 'a retry is scheduled', timing: 'at once',
    channels: ['app'], locked: true, priority: 'P1',
    text: { app: n => `We will try again tomorrow morning. Attempt ${v(n.step)} of five.` },
  },
  'collection.lastAttempt': {
    group: 'Mandates and collection', trigger: 'the last automatic attempt of the window',
    timing: 'the morning of the last attempt', channels: ['app', 'push', 'whatsapp'], locked: true, priority: 'P0',
    text: {
      app: n => `This is the last automatic attempt for ${v(n.circle)}. After today you will need to pay in the app.`,
      push: n => `Last automatic attempt for ${v(n.circle)} today.`,
      whatsapp: n => `Halqa: this is the last automatic attempt for ${v(n.circle)}. After today, pay in the app.`,
    },
  },
  'collection.dueTomorrow': {
    group: 'Mandates and collection', trigger: 'the instalment falls due tomorrow and there is no mandate',
    timing: '7 in the evening, the day before', channels: ['push', 'whatsapp'], locked: false, priority: 'P1',
    text: {
      push: n => `${v(n.amount)} for ${v(n.circle)} is due tomorrow.`,
      whatsapp: n => `Halqa: ${v(n.amount)} for ${v(n.circle)} is due tomorrow. Pay in the app.`,
    },
  },
  'collection.overdue': {
    group: 'Mandates and collection', trigger: 'the due date passes unpaid',
    timing: 'the morning after the due date', channels: ['app', 'push', 'whatsapp'], locked: true, priority: 'P0',
    text: {
      app: n => `${v(n.amount)} for ${v(n.circle)} is overdue. Pay now to avoid a late charge.`,
      push: n => `${v(n.circle)} is overdue.`,
      whatsapp: n => `Halqa: ${v(n.amount)} for ${v(n.circle)} is overdue. Pay in the app to avoid a late charge.`,
    },
  },
  'collection.amountChanged': {
    group: 'Mandates and collection', trigger: 'the next collection differs from the authorised amount',
    timing: 'at least five days before', channels: ['app', 'push', 'whatsapp'], locked: true, priority: 'P1',
    text: {
      app: n => `The next collection for ${v(n.circle)} will be ${v(n.amount)}, on ${v(n.date)}.`,
      push: n => `The next collection for ${v(n.circle)} will be ${v(n.amount)}.`,
      whatsapp: n => `Halqa: the next collection for ${v(n.circle)} will be ${v(n.amount)} on ${v(n.date)}.`,
    },
  },
  'collection.pspFee': {
    group: 'Mandates and collection', trigger: 'a wallet or card payment carries the payment partner fee',
    timing: 'with the receipt', channels: ['app'], locked: true, priority: 'P1',
    text: {
      app: n => `A payment service fee of ${v(n.amount)} applied. Paying from a bank account avoids it.`,
    },
  },

  // --------------------------------------------------------- late payment --
  'late.first': {
    group: 'Late payment', trigger: 'the first step of the late ladder', timing: '1 to 3 days late',
    channels: ['app', 'push', 'whatsapp'], locked: true, priority: 'P0',
    text: {
      app: n => `${v(n.circle)} is ${v(n.count, 'a few')} days late. A charge of ${v(n.amount)} applies.`,
      push: n => `${v(n.circle)} is late. Pay now to stop it growing.`,
      whatsapp: n => `Halqa: ${v(n.circle)} is late and a charge of ${v(n.amount)} applies. Pay in the app.`,
    },
  },
  'late.second': {
    group: 'Late payment', trigger: 'the second step of the late ladder', timing: '4 days to the end of grace',
    channels: ['app', 'push', 'whatsapp'], locked: true, priority: 'P0',
    text: {
      app: n => `${v(n.circle)} is still unpaid. The charge is now ${v(n.amount)} and your score has fallen.`,
      push: n => `${v(n.circle)} is still unpaid.`,
      whatsapp: n => `Halqa: ${v(n.circle)} is still unpaid. The charge is now ${v(n.amount)}.`,
    },
  },
  'late.third': {
    group: 'Late payment', trigger: 'the third step of the late ladder', timing: 'past the grace period',
    channels: ['app', 'push', 'whatsapp'], locked: true, priority: 'P0',
    text: {
      app: n => `${v(n.circle)} is past the grace period. Contact us today to agree a plan.`,
      push: n => `${v(n.circle)} is past the grace period.`,
      whatsapp: n => `Halqa: ${v(n.circle)} is past the grace period. Contact us today to agree a plan.`,
    },
  },
  'late.setOff': {
    group: 'Late payment', trigger: 'arrears are taken from the member\'s own payout', timing: 'at the payout',
    channels: ['app', 'push'], locked: true, priority: 'P1',
    text: {
      app: n => `${v(n.amount)} of arrears was taken from your payout for ${v(n.circle)}.`,
      push: n => `Arrears were taken from your payout for ${v(n.circle)}.`,
    },
  },
  'late.hardship': {
    group: 'Late payment', trigger: 'a hardship plan is agreed', timing: 'at once',
    channels: ['app', 'push', 'whatsapp'], locked: false, priority: 'P1',
    text: {
      app: n => `Your plan is agreed. The next payment of ${v(n.amount)} is due on ${v(n.date)}.`,
      push: n => `Your plan is agreed. Next payment ${v(n.date)}.`,
      whatsapp: n => `Halqa: your plan is agreed. The next payment of ${v(n.amount)} is due on ${v(n.date)}.`,
    },
  },
  'late.restricted': {
    group: 'Late payment', trigger: 'the account is restricted for arrears', timing: 'at once',
    channels: ['app', 'push', 'whatsapp'], locked: true, priority: 'P1',
    text: {
      app: () => 'You cannot join or host a circle until your arrears are cleared.',
      push: () => 'Joining and hosting are paused until your arrears are cleared.',
      whatsapp: () => 'Halqa: joining and hosting are paused until your arrears are cleared.',
    },
  },

  // ---------------------------------------------------- circles and turns --
  'circle.invited': {
    group: 'Circles and turns', trigger: 'a host invites the member', timing: 'at once',
    channels: ['push', 'whatsapp'], locked: false, priority: 'P1',
    text: {
      push: n => `${v(n.name, 'A host')} invited you to ${v(n.circle)}.`,
      whatsapp: n => `Halqa: ${v(n.name, 'a host')} invited you to ${v(n.circle)}. Open the app to see the details.`,
    },
  },
  'circle.admitted': {
    group: 'Circles and turns', trigger: 'the host admits the member', timing: 'at once',
    channels: ['app', 'push', 'whatsapp'], locked: false, priority: 'P1',
    text: {
      app: n => `You are in ${v(n.circle)}. Your turn is ${v(n.position)} of ${v(n.count)}.`,
      push: n => `You are in ${v(n.circle)}.`,
      whatsapp: n => `Halqa: you are in ${v(n.circle)}, at turn ${v(n.position)}.`,
    },
  },
  'circle.declined': {
    group: 'Circles and turns', trigger: 'the host declines the application', timing: 'at once',
    channels: ['app', 'push'], locked: false, priority: 'P1',
    text: {
      app: n => `${v(n.circle)} did not admit you. ${v(n.reason, '')}`.trim(),
      push: n => `${v(n.circle)} did not admit you.`,
    },
  },
  'circle.waitingList': {
    group: 'Circles and turns', trigger: 'the waiting list position changes', timing: 'at once',
    channels: ['app'], locked: false, priority: 'P2',
    text: { app: n => `You are ${v(n.position)} on the waiting list for ${v(n.circle)}.` },
  },
  'circle.started': {
    group: 'Circles and turns', trigger: 'the circle starts', timing: 'on the start date',
    channels: ['app', 'push', 'whatsapp'], locked: false, priority: 'P1',
    text: {
      app: n => `${v(n.circle)} has started. Your first instalment of ${v(n.amount)} is due on ${v(n.date)}.`,
      push: n => `${v(n.circle)} has started.`,
      whatsapp: n => `Halqa: ${v(n.circle)} has started. First instalment ${v(n.amount)} on ${v(n.date)}.`,
    },
  },
  'circle.turnNext': {
    group: 'Circles and turns', trigger: 'the member collects next period',
    timing: 'when the previous payout completes', channels: ['app', 'push', 'whatsapp'], locked: false, priority: 'P1',
    text: {
      app: n => `You collect next in ${v(n.circle)}, on ${v(n.date)}.`,
      push: n => `You collect next in ${v(n.circle)}.`,
      whatsapp: n => `Halqa: you collect next in ${v(n.circle)}, on ${v(n.date)}.`,
    },
  },
  'circle.payoutSent': {
    group: 'Circles and turns', trigger: 'the bank confirms the payout', timing: 'at once',
    channels: ['app', 'push', 'whatsapp'], locked: true, priority: 'P0',
    text: {
      app: n => `${v(n.amount)} was paid into your account from ${v(n.circle)}. Reference ${v(n.reference)}.`,
      push: n => `${v(n.amount)} paid into your account.`,
      whatsapp: n => `Halqa: ${v(n.amount)} was paid into your account from ${v(n.circle)}.`,
    },
  },
  'circle.payoutFailed': {
    group: 'Circles and turns', trigger: 'the payout is returned or refused', timing: 'at once',
    channels: ['app', 'push', 'whatsapp'], locked: true, priority: 'P0',
    text: {
      app: n => `Your payout could not reach your account. ${v(n.reason, 'Check the account and we will try again.')}`,
      push: () => 'Your payout could not reach your account.',
      whatsapp: () => 'Halqa: your payout could not reach your account. Open the app to check it.',
    },
  },
  'circle.completed': {
    group: 'Circles and turns', trigger: 'the last payout of the circle completes', timing: 'at once',
    channels: ['app', 'push', 'whatsapp'], locked: false, priority: 'P1',
    text: {
      app: n => `${v(n.circle)} is complete. Everybody collected once.`,
      push: n => `${v(n.circle)} is complete.`,
      whatsapp: n => `Halqa: ${v(n.circle)} is complete. Everybody collected once.`,
    },
  },
  'circle.ballot': {
    group: 'Circles and turns', trigger: 'the ballot sets the order of turns', timing: 'at once',
    channels: ['app', 'push'], locked: false, priority: 'P2',
    text: {
      app: n => `The ballot is done. Your turn in ${v(n.circle)} is ${v(n.position)} of ${v(n.count)}.`,
      push: n => `Your turn in ${v(n.circle)} is ${v(n.position)}.`,
    },
  },
  'circle.rulesChanged': {
    group: 'Circles and turns', trigger: 'the members approve a change to the rules', timing: 'at once',
    channels: ['app', 'push', 'whatsapp'], locked: false, priority: 'P2',
    text: {
      app: n => `The rules of ${v(n.circle)} changed. ${v(n.reason, 'Open the circle to read them.')}`,
      push: n => `The rules of ${v(n.circle)} changed.`,
      whatsapp: n => `Halqa: the rules of ${v(n.circle)} changed. Open the app to read them.`,
    },
  },

  // ----------------------------------------------------------- for hosts --
  'host.applicant': {
    group: 'For hosts', trigger: 'somebody applies to the host\'s circle', timing: 'at once',
    channels: ['app', 'push'], locked: false, priority: 'P1',
    text: {
      app: n => `${v(n.name, 'Someone')} applied to ${v(n.circle)}. Review them before the circle fills.`,
      push: n => `A new applicant for ${v(n.circle)}.`,
    },
  },
  'host.memberLate': {
    group: 'For hosts', trigger: 'a member of the host\'s circle passes the due date', timing: 'the morning after',
    channels: ['app', 'push'], locked: false, priority: 'P1',
    text: {
      app: n => `${v(n.name, 'A member')} is late in ${v(n.circle)}. A reminder has gone to them.`,
      push: n => `A member is late in ${v(n.circle)}.`,
    },
  },
  'host.removalVote': {
    group: 'For hosts', trigger: 'a removal vote opens', timing: 'at once',
    channels: ['app', 'push'], locked: false, priority: 'P1',
    text: {
      app: n => `A vote to remove a member of ${v(n.circle)} is open until ${v(n.date)}.`,
      push: n => `A removal vote is open in ${v(n.circle)}.`,
    },
  },
  'host.mandateCoverage': {
    group: 'For hosts', trigger: 'mandate coverage falls below the circle\'s rule', timing: 'daily while below',
    channels: ['app'], locked: false, priority: 'P2',
    text: { app: n => `${v(n.count)} members of ${v(n.circle)} have no automatic payment set up.` },
  },

  // ------------------------------------------------- leaving and recovery --
  'exit.requested': {
    group: 'Leaving and recovery', trigger: 'a member asks to leave', timing: 'at once',
    channels: ['app', 'push'], locked: false, priority: 'P1',
    text: {
      app: n => `Your request to leave ${v(n.circle)} is with the host and the members.`,
      push: n => `Your request to leave ${v(n.circle)} was received.`,
    },
  },
  'exit.voteResult': {
    group: 'Leaving and recovery', trigger: 'the exit vote closes', timing: 'at once',
    channels: ['app', 'push'], locked: false, priority: 'P1',
    text: {
      app: n => `The members have decided on your request to leave ${v(n.circle)}. ${v(n.reason, '')}`.trim(),
      push: n => `A decision on leaving ${v(n.circle)}.`,
    },
  },
  'exit.settled': {
    group: 'Leaving and recovery', trigger: 'the exit is settled', timing: 'at once',
    channels: ['app', 'push', 'whatsapp'], locked: true, priority: 'P1',
    text: {
      app: n => `You have left ${v(n.circle)}. ${v(n.amount)} was settled.`,
      push: n => `You have left ${v(n.circle)}.`,
      whatsapp: n => `Halqa: you have left ${v(n.circle)} and ${v(n.amount)} was settled.`,
    },
  },
  'claim.lodged': {
    group: 'Leaving and recovery', trigger: 'the operator lodges a claim', timing: 'at once',
    channels: ['app', 'push', 'whatsapp'], locked: false, priority: 'P1',
    text: {
      app: n => `A claim was lodged with the operator for ${v(n.circle)}. Reference ${v(n.reference)}.`,
      push: n => `A claim was lodged for ${v(n.circle)}.`,
      whatsapp: n => `Halqa: a claim was lodged with the operator for ${v(n.circle)}.`,
    },
  },
  'claim.paid': {
    group: 'Leaving and recovery', trigger: 'the operator pays the claim', timing: 'at once',
    channels: ['app', 'push', 'whatsapp'], locked: true, priority: 'P1',
    text: {
      app: n => `The operator paid ${v(n.amount)} into your account for ${v(n.circle)}.`,
      push: n => `${v(n.amount)} was paid to you by the operator.`,
      whatsapp: n => `Halqa: the operator paid ${v(n.amount)} into your account for ${v(n.circle)}.`,
    },
  },

  // -------------------------------------- points, marketplace and turns --
  'points.endOfCircle': {
    group: 'Points, marketplace and turns', trigger: 'the circle completes and the reward is calculated',
    timing: 'at the close of the circle', channels: ['app', 'push', 'whatsapp'], locked: false, priority: 'P2',
    text: {
      app: n => `${v(n.points)} points were credited for ${v(n.circle)}. One point is one rupee.`,
      push: n => `${v(n.points)} points credited for ${v(n.circle)}.`,
      whatsapp: n => `Halqa: ${v(n.points)} points were credited for ${v(n.circle)}.`,
    },
  },
  'points.onTime': {
    group: 'Points, marketplace and turns', trigger: 'an instalment is paid on time', timing: 'with the receipt',
    channels: ['app'], locked: false, priority: 'P2',
    text: { app: n => `${v(n.points)} points for paying on time.` },
  },
  'points.bought': {
    group: 'Points, marketplace and turns', trigger: 'points are bought with money', timing: 'at once',
    channels: ['app', 'push'], locked: true, priority: 'P2',
    text: {
      app: n => `${v(n.points)} points bought for ${v(n.amount)}.`,
      push: n => `${v(n.points)} points added.`,
    },
  },
  'order.placed': {
    group: 'Points, marketplace and turns', trigger: 'an order is placed', timing: 'at once',
    channels: ['app', 'push'], locked: false, priority: 'P2',
    text: {
      app: n => `Your order is placed. ${v(n.points)} points were used.`,
      push: () => 'Your order is placed.',
    },
  },
  'order.shipped': {
    group: 'Points, marketplace and turns', trigger: 'the merchant marks it shipped', timing: 'at once',
    channels: ['app', 'push'], locked: false, priority: 'P2',
    text: { app: n => `Your order is on its way. Reference ${v(n.reference)}.`, push: () => 'Your order is on its way.' },
  },
  'order.delivered': {
    group: 'Points, marketplace and turns', trigger: 'the merchant marks it delivered', timing: 'at once',
    channels: ['app', 'push'], locked: false, priority: 'P2',
    text: { app: () => 'Your order was delivered.', push: () => 'Your order was delivered.' },
  },
  'order.returned': {
    group: 'Points, marketplace and turns', trigger: 'a return is accepted', timing: 'at once',
    channels: ['app', 'push'], locked: false, priority: 'P2',
    text: {
      app: n => `Your return was accepted and ${v(n.points)} points were put back.`,
      push: n => `${v(n.points)} points were put back.`,
    },
  },
  'turn.offerReceived': {
    group: 'Points, marketplace and turns', trigger: 'an offer arrives on a listed turn', timing: 'at once',
    channels: ['app', 'push'], locked: false, priority: 'P2',
    text: {
      app: n => `An offer of ${v(n.points)} points for your turn in ${v(n.circle)}.`,
      push: n => `A new offer on your turn in ${v(n.circle)}.`,
    },
  },
  'turn.offerAccepted': {
    group: 'Points, marketplace and turns', trigger: 'the seller accepts an offer', timing: 'at once',
    channels: ['app', 'push'], locked: false, priority: 'P2',
    text: {
      app: n => `Your offer was accepted. The host of ${v(n.circle)} must approve it before it settles.`,
      push: () => 'Your offer was accepted, pending the host.',
    },
  },
  'turn.settled': {
    group: 'Points, marketplace and turns', trigger: 'the host approves and the trade settles', timing: 'at once',
    channels: ['app', 'push'], locked: true, priority: 'P2',
    text: {
      app: n => `The trade settled. Your turn in ${v(n.circle)} is now ${v(n.position)}.`,
      push: n => `Your turn in ${v(n.circle)} is now ${v(n.position)}.`,
    },
  },
  'turn.cancelled': {
    group: 'Points, marketplace and turns', trigger: 'a trade is cancelled before settlement', timing: 'at once',
    channels: ['app', 'push'], locked: false, priority: 'P2',
    text: {
      app: n => `The trade was cancelled. ${v(n.reason, 'Your points were not used.')}`,
      push: () => 'The trade was cancelled.',
    },
  },

  // ------------------------------------------------------------- service --
  'complaint.received': {
    group: 'Service', trigger: 'a complaint is opened', timing: 'at once',
    channels: ['app', 'push', 'email'], locked: false, priority: 'P1',
    text: {
      app: n => `Complaint ${v(n.reference)} received. We will reply within three working days.`,
      push: n => `Complaint ${v(n.reference)} received.`,
      email: n => `Your complaint ${v(n.reference)} has been received. We will reply within three working days.`,
    },
  },
  'complaint.updated': {
    group: 'Service', trigger: 'the complaint changes status', timing: 'at once',
    channels: ['app', 'push'], locked: false, priority: 'P1',
    text: {
      app: n => `Complaint ${v(n.reference)} was updated.`,
      push: n => `Complaint ${v(n.reference)} was updated.`,
    },
  },
  'complaint.resolved': {
    group: 'Service', trigger: 'the complaint is resolved', timing: 'at once',
    channels: ['app', 'push', 'email'], locked: false, priority: 'P1',
    text: {
      app: n => `Complaint ${v(n.reference)} is resolved. If you are not satisfied you may approach the Banking Mohtasib.`,
      push: n => `Complaint ${v(n.reference)} is resolved.`,
      email: n => `Complaint ${v(n.reference)} is resolved. If you are not satisfied you may approach the Banking Mohtasib.`,
    },
  },
  'dispute.opened': {
    group: 'Service', trigger: 'a payment dispute is opened', timing: 'at once',
    channels: ['app', 'push'], locked: false, priority: 'P0',
    text: {
      app: n => `Dispute ${v(n.reference)} is open. The bank has been told today.`,
      push: n => `Dispute ${v(n.reference)} is open.`,
    },
  },
  'dispute.resolved': {
    group: 'Service', trigger: 'the dispute is resolved', timing: 'at once',
    channels: ['app', 'push', 'whatsapp'], locked: false, priority: 'P0',
    text: {
      app: n => `Dispute ${v(n.reference)} is resolved. ${v(n.reason, '')}`.trim(),
      push: n => `Dispute ${v(n.reference)} is resolved.`,
      whatsapp: n => `Halqa: dispute ${v(n.reference)} is resolved. Open the app for the detail.`,
    },
  },
  'statement.ready': {
    group: 'Service', trigger: 'a statement is produced', timing: 'at once',
    channels: ['app', 'email'], locked: false, priority: 'P2',
    text: {
      app: n => `Your statement for ${v(n.date)} is ready.`,
      email: n => `Your Halqa statement for ${v(n.date)} is ready in the app.`,
    },
  },
  'terms.updated': {
    group: 'Service', trigger: 'the member documents change', timing: 'at least seven days before they take effect',
    channels: ['app', 'push', 'email'], locked: false, priority: 'P1',
    text: {
      app: n => `The terms change on ${v(n.date)}. ${v(n.reason, 'Open them to see what changed.')}`,
      push: n => `The terms change on ${v(n.date)}.`,
      email: n => `The Halqa terms change on ${v(n.date)}. What changed is listed in the app.`,
    },
  },
  'service.interruption': {
    group: 'Service', trigger: 'a service interruption begins or ends', timing: 'at once',
    channels: ['app', 'push'], locked: false, priority: 'P2',
    text: {
      app: n => `${v(n.reason, 'Some parts of Halqa are not working just now.')} Nothing you have paid is affected.`,
      push: () => 'Some parts of Halqa are not working just now.',
    },
  },
  'privacy.exportReady': {
    group: 'Service', trigger: 'a data export finishes', timing: 'at once',
    channels: ['app', 'email'], locked: false, priority: 'P2',
    text: {
      app: () => 'Your data is ready to download. The link lasts seven days.',
      email: () => 'Your Halqa data is ready to download in the app. The link lasts seven days.',
    },
  },

  // --------------------------------------------------------------- Hyper --
  // Push only, and never WhatsApp: at Rs 15 a day a WhatsApp message on each
  // daily payment costs more than the fee earns.
  'hyper.taken': {
    group: 'Hyper', trigger: 'the daily payment succeeds', timing: 'at once',
    channels: ['push'], locked: true, priority: 'P2',
    text: { push: n => `${v(n.amount)} taken for ${v(n.circle)}.` },
  },
  'hyper.failed': {
    group: 'Hyper', trigger: 'the daily payment fails', timing: 'at once',
    channels: ['app', 'push'], locked: true, priority: 'P2',
    text: {
      app: n => `Today's payment for ${v(n.circle)} did not go through. ${v(n.reason, '')}`.trim(),
      push: n => `Today's payment for ${v(n.circle)} did not go through.`,
    },
  },
  'hyper.collectionTomorrow': {
    group: 'Hyper', trigger: 'the member collects tomorrow', timing: '7 in the evening, the day before',
    channels: ['app', 'push'], locked: false, priority: 'P2',
    text: {
      app: n => `You collect ${v(n.amount)} from ${v(n.circle)} tomorrow.`,
      push: n => `You collect from ${v(n.circle)} tomorrow.`,
    },
  },
  'hyper.stopped': {
    group: 'Hyper', trigger: 'the circle stops on its limits', timing: 'at once',
    channels: ['app', 'push'], locked: false, priority: 'P2',
    text: {
      app: n => `${v(n.circle)} has stopped opening new days. ${v(n.reason, 'Everything already paid is unaffected.')}`,
      push: n => `${v(n.circle)} has stopped opening new days.`,
    },
  },
};

export type NoticeKey = keyof typeof NOTICES;
export const NOTICE_KEYS = Object.keys(NOTICES) as NoticeKey[];

// -------------------------------------------------------------- the rules --

/** Quiet hours: nothing but a locked alert goes out between these hours. */
export const QUIET_FROM = 22;
export const QUIET_TO = 8;

export const inQuietHours = (at: Date) => {
  const h = at.getHours();
  return h >= QUIET_FROM || h < QUIET_TO;
};

export type Preferences = Partial<Record<Channel, boolean>> & { [group: string]: boolean | undefined };

/**
 * Whether this notice goes down this channel, now, for this member. A locked
 * notice always goes: it reports money moving or an account changing, and a
 * silent debit is how fraud goes unnoticed.
 */
export function shouldSend(key: NoticeKey, channel: Channel, at: Date, prefs: Preferences = {}): boolean {
  const n = NOTICES[key];
  if (!n) throw new Error(`No notice ${String(key)}`);
  if (!n.channels.includes(channel)) return false;
  if (n.locked) return true;
  if (inQuietHours(at)) return false;
  if (prefs[channel] === false) return false;
  if (prefs[n.group] === false) return false;
  return true;
}

/**
 * The cheapest channel that will carry this notice now. Push and in-application
 * are free; WhatsApp is not, and SMS is charged too. Taking the free channel
 * where one is available is what keeps the message cost inside the business
 * model (about Rs 50 a member a month of contribution).
 */
export function cheapestChannel(key: NoticeKey, at: Date, prefs: Preferences = {}): Channel | null {
  const order: Channel[] = ['push', 'app', 'email', 'whatsapp', 'sms'];
  for (const c of order) if (shouldSend(key, c, at, prefs)) return c;
  return null;
}

/**
 * The words, for a channel, with the member's values filled in.
 *
 * A value that is missing leaves a hole, and a hole reads as a broken message:
 * "Your instalment for  will be collected" is worse than no message at all.
 * The text is tidied after substitution so a gap closes up and the sentence
 * still reads, rather than shipping the hole to the member.
 */
export function render(key: NoticeKey, channel: Channel, vars: NoticeVars = {}): string | null {
  const fn = NOTICES[key]?.text[channel];
  if (!fn) return null;
  return fn(vars)
    .replace(/\s+/g, ' ')        // a missing value leaves a double space
    .replace(/\s+([.,])/g, '$1') // and sometimes a space before the full stop
    .replace(/\.{2,}/g, '.')
    .trim();
}

/** What is written to the log for every message sent, whatever the channel. */
export type NoticeLogEntry = {
  key: NoticeKey;
  channel: Channel;
  userId: string;
  sentAt: Date;
  body: string;
  status: 'QUEUED' | 'SENT' | 'DELIVERED' | 'READ' | 'FAILED';
  failureReason?: string;
};

export const logEntry = (
  key: NoticeKey, channel: Channel, userId: string, body: string, at: Date,
): NoticeLogEntry => ({ key, channel, userId, sentAt: at, body, status: 'QUEUED' });
