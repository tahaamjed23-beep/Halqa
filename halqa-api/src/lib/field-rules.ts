// ---------------------------------------------------------------------------
// EVERY FIELD A MEMBER FILLS IN, AND WHAT MAKES IT VALID
//
// Work register section AD. One rule per field, written once, with the sentence
// the member reads when it fails. Before this, a rule lived wherever somebody
// first needed it: the PIN was four digits in one place and six in another, and
// the IBAN check was "ten characters or more", which a mistyped IBAN passes and
// the member discovers weeks later when a collection fails.
//
// The rules live in the interface service because the service is the only side
// that cannot be bypassed. The application should import this module rather
// than restate anything; where it cannot yet, the rule here is the one that
// decides.
//
// Each rule carries its own EXAMPLES: values that must pass, values that must
// fail, and the boundaries on each side where one meets the other. One test
// drives every rule through its own examples, so a rule added without examples
// fails the suite rather than going untested.
//
// A rule that cannot be settled from the value alone (is this number
// registered? is this seat open?) takes a context. Where the context is absent
// the rule checks only the shape, and the server check that needs the data is
// named in `needsServer`.
// ---------------------------------------------------------------------------

export type FieldContext = {
  /** The other PIN, when confirming one. */
  otherPin?: string;
  /** The instalment of the circle, in rupees, for ceilings and part payments. */
  instalmentRupees?: number;
  /** The pot of the circle, in points, for turn prices. */
  potPoints?: number;
  /** The member's points balance. */
  pointsBalance?: number;
  /** Today, so a date rule can be tested against a fixed day. */
  today?: Date;
  /** Values the member may choose from, where the list comes from the server. */
  allowed?: readonly string[];
  /** The fee due, in points, when redeeming against it. */
  feeDuePoints?: number;
  /** Stock available, for a cart. */
  stock?: number;
};

export type FieldRule = {
  /** The screen the member is on, as the register names it. */
  screen: string;
  /** The field, as the register names it. */
  field: string;
  /** The rule in words. This is what the register states; the code below is it. */
  rule: string;
  /** What the member reads when the value fails. Never blames, always says what to do. */
  message: string;
  /** A check the server cannot skip, named where the value alone cannot settle it. */
  needsServer?: string;
  check: (value: unknown, ctx?: FieldContext) => boolean;
  examples: { valid: unknown[]; invalid: unknown[] };
};

// ------------------------------------------------------------- primitives --
const str = (v: unknown) => (typeof v === 'string' ? v : '');
const trimmed = (v: unknown) => str(v).trim();
const len = (v: unknown, lo: number, hi: number) => {
  const t = trimmed(v);
  return t.length >= lo && t.length <= hi;
};
const digits = (v: unknown, n: number) => new RegExp(`^\\d{${n}}$`).test(str(v).replace(/\D/g, ''));
const intIn = (v: unknown, lo: number, hi: number) => {
  const n = typeof v === 'number' ? v : Number(str(v).replace(/[,\s]/g, ''));
  return Number.isInteger(n) && n >= lo && n <= hi;
};
const oneOf = (v: unknown, list: readonly string[]) => list.includes(trimmed(v));
const ticked = (v: unknown) => v === true;

/** A Pakistani mobile number: 3 then nine digits, written after a fixed +92. */
export const mobileOk = (v: unknown) => /^3\d{9}$/.test(str(v).replace(/\D/g, '').replace(/^92/, '').replace(/^0/, ''));

/** Repeated (111111) and sequential (123456, 654321) digits are refused. */
export const pinWeak = (pin: string) => {
  if (/^(\d)\1+$/.test(pin)) return true;
  const up = pin.split('').every((d, i, a) => i === 0 || Number(d) === Number(a[i - 1]) + 1);
  const down = pin.split('').every((d, i, a) => i === 0 || Number(d) === Number(a[i - 1]) - 1);
  return up || down;
};
export const pinOk = (v: unknown) => /^\d{6}$/.test(str(v)) && !pinWeak(str(v));

/** ISO 13616 mod-97, the check that makes an IBAN more than a shape. */
const mod97 = (iban: string) => {
  const r = iban.slice(4) + iban.slice(0, 4);
  let rem = 0;
  for (const ch of r) {
    const val = ch >= 'A' && ch <= 'Z' ? String(ch.charCodeAt(0) - 55) : ch;
    for (const d of val) rem = (rem * 10 + Number(d)) % 97;
  }
  return rem;
};
export const ibanOk = (v: unknown) => {
  const s = str(v).toUpperCase().replace(/[^A-Z0-9]/g, '');
  return /^PK\d{2}[A-Z]{4}\d{16}$/.test(s) && mod97(s) === 1;
};

export const cnicOk = (v: unknown) => digits(v, 13);
export const inviteCodeOk = (v: unknown) => /^HLQ-?[A-Z0-9]{8}$/i.test(trimmed(v));

const dayStart = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const asDate = (v: unknown) => (v instanceof Date ? v : new Date(str(v)));
const validDate = (d: Date) => !Number.isNaN(d.getTime());
const before = (v: unknown, ref: Date) => { const d = asDate(v); return validDate(d) && dayStart(d) < dayStart(ref); };
const after = (v: unknown, ref: Date) => { const d = asDate(v); return validDate(d) && dayStart(d) > dayStart(ref); };
const now = (ctx?: FieldContext) => ctx?.today ?? new Date();

export const ageOk = (v: unknown, ctx?: FieldContext) => {
  const d = asDate(v);
  if (!validDate(d)) return false;
  const ref = now(ctx);
  const years = (dayStart(ref).getTime() - dayStart(d).getTime()) / (365.2425 * 86_400_000);
  return years >= 18 && years < 120;
};

const FILE_TYPES = ['pdf', 'jpg', 'jpeg', 'png'];
type FileLike = { name?: string; type?: string; sizeBytes?: number };
export const fileOk = (v: unknown, maxMb = 5) => {
  const f = (v ?? {}) as FileLike;
  const ext = (f.name ?? '').split('.').pop()?.toLowerCase() ?? '';
  const typeOk = FILE_TYPES.includes(ext) || FILE_TYPES.some(t => (f.type ?? '').includes(t));
  return typeOk && typeof f.sizeBytes === 'number' && f.sizeBytes > 0 && f.sizeBytes <= maxMb * 1024 * 1024;
};

// ------------------------------------------------------------- the lists --
export const CIRCLE_TYPES = ['Known', 'Unknown', 'Large unknown', 'Asset', 'UAE family', 'Hyper'] as const;
export const CADENCES = ['monthly', 'weekly'] as const;
export const INCOME_SOURCES = ['salary', 'business', 'daily wages', 'remittance', 'pension', 'other'] as const;
export const LANGUAGES = ['English', 'Urdu'] as const;
export const THEMES = ['system', 'light', 'dark'] as const;
export const TEXT_SIZES = ['small', 'normal', 'large', 'largest'] as const;
export const EXPORT_FORMATS = ['PDF', 'spreadsheet'] as const;
export const ORDER_MODES = ['fixed by the host', 'ballot'] as const;
export const VOTES = ['for', 'against'] as const;
export const ADMISSION = ['admit', 'decline'] as const;
export const DUE_DAY = 8;

/** The instalment and member ranges each kind of circle allows. */
export const TYPE_RANGES: Record<string, { instalment: [number, number]; members: [number, number] }> = {
  'Known': { instalment: [2_000, 10_000], members: [6, 12] },
  'Unknown': { instalment: [2_000, 10_000], members: [12, 12] },
  'Large unknown': { instalment: [10_000, 25_000], members: [20, 20] },
  'Asset': { instalment: [10_000, 10_000], members: [12, 12] },
  'UAE family': { instalment: [2_000, 100_000], members: [6, 12] },
  'Hyper': { instalment: [450, 500], members: [390, 400] },
};

const R = (
  screen: string, field: string, rule: string, message: string,
  check: FieldRule['check'], examples: FieldRule['examples'], needsServer?: string,
): FieldRule => ({ screen, field, rule, message, check, examples, needsServer });

// --------------------------------------------------------------- the rules --
export const FIELD_RULES: Record<string, FieldRule> = {
  // ------------------------------------------------ sign up and sign in --
  'signup.mobile': R('Phone number entry', 'mobile number',
    'ten digits after a fixed +92, starting with 3',
    'Enter a mobile number like 300 1234567',
    v => mobileOk(v),
    { valid: ['3001234567', '03001234567', '+923001234567', '3999999999'], invalid: ['', '300123456', '30012345678', '2001234567', 'abcdefghij'] }),

  'signup.code': R('Passcode entry', 'code',
    'six digits, valid for five minutes, five attempts before a new code is needed',
    'That code is not right. Check the message or send a new one',
    v => digits(v, 6),
    { valid: ['123456', '000000'], invalid: ['', '12345', '1234567', 'abcdef'] },
    'the code must match the one sent, be inside five minutes, and be the first five attempts'),

  'signup.pin': R('Set the application PIN', 'PIN',
    'six digits, refusing repeated and sequential digits such as 111111 and 123456',
    'Choose six digits that are not in a row or repeated',
    v => pinOk(v),
    { valid: ['193847', '820461'], invalid: ['', '1234', '12345', '1234567', '111111', '123456', '654321', 'abcdef'] }),

  'signup.pinConfirm': R('Confirm the application PIN', 'PIN again',
    'the same six digits as before',
    'The two PINs do not match. Try again',
    (v, ctx) => pinOk(v) && str(v) === str(ctx?.otherPin),
    { valid: [], invalid: ['', '000000'] }),

  'signup.newPin': R('Forgotten PIN recovery', 'new PIN',
    'six digits, after a fresh code to the registered number',
    'Choose six digits that are not in a row or repeated',
    v => pinOk(v),
    { valid: ['759134'], invalid: ['', '111111', '123456'] },
    'a fresh code must have been verified first'),

  'signin.mobile': R('Sign in', 'mobile number',
    'a registered number',
    'No account uses this number. Create an account instead',
    v => mobileOk(v),
    { valid: ['3211234567'], invalid: ['', '123'] },
    'the number must belong to an account'),

  'signin.pin': R('Sign in', 'PIN',
    'six digits, five attempts, then a wait of fifteen minutes and a code',
    'Wrong PIN. Attempts left: the number',
    v => /^\d{6}$/.test(str(v)),
    { valid: ['123456', '908172'], invalid: ['', '12345', 'abcdef'] },
    'the attempt counter and the fifteen minute lock'),

  'profile.fullName': R('Name and date of birth', 'full name',
    'as on the CNIC: letters, spaces and full stops, 3 to 60 characters',
    'Enter your name as it appears on your CNIC',
    v => len(v, 3, 60) && /^[A-Za-z؀-ۿ .]+$/.test(trimmed(v)),
    { valid: ['Ali Raza', 'M. Hassan Kayani', 'abc'], invalid: ['', 'Al', 'Ali123', 'Ali@Raza', 'x'.repeat(61)] }),

  'profile.dob': R('Name and date of birth', 'date of birth',
    'aged 18 or over today',
    'Halqa is for members aged 18 and over',
    (v, ctx) => ageOk(v, ctx),
    { valid: ['1990-01-01'], invalid: ['', 'not a date', '2020-01-01'] }),

  'profile.address': R('Address and city', 'address',
    '5 to 120 characters',
    'Enter your home address',
    v => len(v, 5, 120),
    { valid: ['House 1, Street 2, Islamabad', '12345'], invalid: ['', '1234', 'x'.repeat(121)] }),

  'profile.city': R('Address and city', 'city',
    'chosen from the list of cities',
    'Choose your city',
    (v, ctx) => oneOf(v, ctx?.allowed ?? ['Islamabad', 'Lahore', 'Karachi']),
    { valid: ['Lahore'], invalid: ['', 'Atlantis'] },
    'the list of cities comes from the server'),

  'profile.province': R('Address and city', 'province',
    'chosen from the list, set from the city where possible',
    'Choose your province',
    (v, ctx) => oneOf(v, ctx?.allowed ?? ['Punjab', 'Sindh', 'KP', 'Balochistan', 'ICT', 'GB', 'AJK']),
    { valid: ['Punjab'], invalid: ['', 'Bavaria'] }),

  'profile.occupation': R('Occupation and employer', 'occupation',
    'chosen from the list, with Other and a short description',
    'Choose your occupation',
    (v, ctx) => oneOf(v, ctx?.allowed ?? ['Salaried', 'Business', 'Daily wages', 'Student', 'Other']),
    { valid: ['Salaried'], invalid: [''] }),

  'profile.employer': R('Occupation and employer', 'employer',
    '2 to 80 characters, optional for the self employed',
    "Enter your employer's name",
    v => trimmed(v) === '' || len(v, 2, 80),
    { valid: ['', 'Acme', 'x'.repeat(80)], invalid: ['A', 'x'.repeat(81)] }),

  'profile.income': R('Income declaration', 'monthly income',
    'whole rupees from Rs 1,000 to Rs 10,000,000',
    'Enter your monthly income in rupees',
    v => intIn(v, 1_000, 10_000_000),
    { valid: [1_000, 50_000, 10_000_000, '45,000'], invalid: ['', 999, 10_000_001, 1_500.5, -5_000] }),

  'profile.incomeSource': R('Income declaration', 'income source',
    'salary, business, daily wages, remittance, pension or other',
    'Choose where your income comes from',
    v => oneOf(v, INCOME_SOURCES),
    { valid: ['salary', 'pension'], invalid: ['', 'crypto'] }),

  'profile.statementFile': R('Income verification upload', 'statement file',
    'PDF, JPG or PNG, at most 5 MB, covering the last three months',
    'Upload a statement for the last three months',
    v => fileOk(v, 5),
    { valid: [{ name: 's.pdf', sizeBytes: 1_000_000 }, { name: 's.PNG', sizeBytes: 5 * 1024 * 1024 }], invalid: [{}, { name: 's.exe', sizeBytes: 10 }, { name: 's.pdf', sizeBytes: 5 * 1024 * 1024 + 1 }] }),

  'onboarding.bankConsent': R('Bank account opening consent', 'consent to share data',
    "ticked before the bank's screens open",
    'Allow Halqa to share your details with the bank to open your account',
    v => ticked(v),
    { valid: [true], invalid: [false, '', 'yes'] }),

  // ---------------------------------------------------------- identity --
  'cnic.number': R('CNIC manual entry', 'CNIC number',
    'thirteen digits in the form 00000-0000000-0',
    'Enter the 13 digits on your CNIC',
    v => cnicOk(v),
    { valid: ['6110112345671', '61101-1234567-1'], invalid: ['', '611011234567', '61101123456712'] }),

  'cnic.issued': R('CNIC manual entry', 'issue date',
    'before today',
    'Enter the date your CNIC was issued',
    (v, ctx) => before(v, now(ctx)),
    { valid: ['2015-06-01'], invalid: ['', '2999-01-01'] }),

  'cnic.expiry': R('CNIC manual entry', 'expiry date',
    'after today, or Lifetime',
    'Your CNIC has expired. Renew it before joining',
    (v, ctx) => trimmed(v).toLowerCase() === 'lifetime' || after(v, now(ctx)),
    { valid: ['2999-01-01', 'Lifetime'], invalid: ['', '2000-01-01'] }),

  'cnic.confirm': R('CNIC review before submission', 'confirmation',
    'each read value confirmed or corrected',
    'Check each detail before you continue',
    v => ticked(v),
    { valid: [true], invalid: [false, ''] }),

  'bureau.instruction': R('Bureau instruction', 'instruction to the bureau',
    'ticked, naming the bureau and the purpose',
    'Allow Halqa to request your report from the bureau named',
    v => ticked(v),
    { valid: [true], invalid: [false, ''] }),

  // ------------------------------------------ accounts and payment routes --
  'account.bank': R('Add a bank account', 'bank',
    'chosen from the list of banks',
    'Choose your bank',
    (v, ctx) => oneOf(v, ctx?.allowed ?? ['Mashreq', 'Raqami', 'Meezan']),
    { valid: ['Meezan'], invalid: [''] }),

  'account.iban': R('Add a bank account', 'IBAN',
    'PK, two check digits, four letters for the bank and sixteen digits, 24 characters, passing the checksum',
    'Enter the 24 character IBAN, for example PK36SCBL0000001123456702',
    v => ibanOk(v),
    { valid: ['PK36SCBL0000001123456702'], invalid: ['', 'PK36SCBL0000001123456703', 'PK36SCBL000000112345670', 'GB33BUKB20201555555555'] }),

  'account.walletProvider': R('Add a wallet account', 'wallet provider',
    'chosen from the list of wallets',
    'Choose your wallet',
    (v, ctx) => oneOf(v, ctx?.allowed ?? ['JazzCash', 'Easypaisa', 'SadaPay', 'NayaPay']),
    { valid: ['JazzCash'], invalid: [''] }),

  'account.walletNumber': R('Add a wallet account', 'wallet number',
    'a mobile number registered with that wallet',
    'Enter the mobile number of your wallet',
    v => mobileOk(v),
    { valid: ['3001234567'], invalid: ['', '123'] },
    'the number must be registered with that wallet'),

  'account.default': R('Set the default collection account', 'default account',
    'one of the verified linked accounts',
    'Choose one account for collections',
    (v, ctx) => trimmed(v).length > 0 && (!ctx?.allowed || oneOf(v, ctx.allowed)),
    { valid: ['acc_1'], invalid: [''] },
    'the account must be linked and verified'),

  'mandate.account': R('Authorise a mandate', 'account',
    'a verified account at the partner bank',
    'Choose the account the instalment comes from',
    (v, ctx) => trimmed(v).length > 0 && (!ctx?.allowed || oneOf(v, ctx.allowed)),
    { valid: ['acc_1'], invalid: [''] },
    'the account must be at the partner bank and verified'),

  'mandate.ceiling': R('Authorise a mandate', 'ceiling',
    'at most one instalment',
    'The ceiling cannot be more than one instalment',
    (v, ctx) => intIn(v, 1, ctx?.instalmentRupees ?? 10_000),
    { valid: [], invalid: ['', 0, -1] }),

  'mandate.consent': R('Authorise a mandate', 'consent',
    'ticked against the mandate terms',
    'Read and accept the mandate terms to continue',
    v => ticked(v),
    { valid: [true], invalid: [false, ''] }),

  'mandate.newCeiling': R('Change a mandate ceiling', 'new ceiling',
    'at least the instalment and at most one instalment of a larger circle the member holds',
    'The ceiling must cover one instalment and no more',
    (v, ctx) => intIn(v, ctx?.instalmentRupees ?? 1, ctx?.instalmentRupees ?? 10_000),
    { valid: [], invalid: ['', 0] }),

  'mandate.cancel': R('Cancel a mandate', 'confirmation',
    'the consequence read and confirmed',
    'Confirm that you will pay each instalment yourself',
    v => ticked(v),
    { valid: [true], invalid: [false, ''] }),

  // ----------------------------------------------------------- circles --
  'circle.name': R('Create a circle', 'circle name',
    "3 to 40 characters, not used by the host's other active circles",
    'Give the circle a name of 3 to 40 characters',
    v => len(v, 3, 40),
    { valid: ['Gulshan savers', 'abc', 'x'.repeat(40)], invalid: ['', 'ab', 'x'.repeat(41)] },
    'the name must be unused among the host\'s active circles'),

  'circle.type': R('Create a circle', 'circle type',
    'Known, Unknown, Large unknown, Asset, UAE family on Mashreq, or Hyper',
    'Choose the kind of circle',
    v => oneOf(v, CIRCLE_TYPES),
    { valid: ['Known', 'Hyper'], invalid: ['', 'Investment'] }),

  'circle.instalment': R('Create a circle', 'instalment',
    "within the type's range",
    'Choose an instalment within the range for this kind of circle',
    (v, ctx) => {
      const t = TYPE_RANGES[trimmed(ctx?.allowed?.[0] ?? 'Known')] ?? TYPE_RANGES.Known;
      return intIn(v, t.instalment[0], t.instalment[1]);
    },
    { valid: [2_000, 10_000], invalid: ['', 1_999, 10_001] }),

  'circle.members': R('Create a circle', 'members',
    "within the type's range: 6 to 12 for Known, 12 for Unknown, 20 for Large unknown",
    'Choose the number of members for this kind of circle',
    (v, ctx) => {
      const t = TYPE_RANGES[trimmed(ctx?.allowed?.[0] ?? 'Known')] ?? TYPE_RANGES.Known;
      return intIn(v, t.members[0], t.members[1]);
    },
    { valid: [6, 12], invalid: ['', 5, 13] }),

  'circle.cadence': R('Create a circle', 'cadence',
    'monthly, or weekly for Known circles',
    'Choose how often members pay',
    v => oneOf(v, CADENCES),
    { valid: ['monthly', 'weekly'], invalid: ['', 'daily'] }),

  'circle.startMonth': R('Create a circle', 'start month',
    'the next month or later',
    'Choose a start month from next month on',
    (v, ctx) => {
      const d = asDate(v);
      if (!validDate(d)) return false;
      const ref = now(ctx);
      const first = new Date(ref.getFullYear(), ref.getMonth() + 1, 1);
      return d >= first;
    },
    { valid: [], invalid: ['', '2000-01-01'] }),

  'circle.dueDay': R('Create a circle', 'due day',
    'the 8th of the month for salary circles',
    'Salary circles fall due on the 8th',
    v => Number(v) === DUE_DAY,
    { valid: [8, '8'], invalid: ['', 1, 10, 31] }),

  'circle.order': R('Create a circle', 'order of turns',
    'fixed by the host or by ballot, always inside the score bands',
    'Choose how the order of turns is set',
    v => oneOf(v, ORDER_MODES),
    { valid: ['ballot', 'fixed by the host'], invalid: ['', 'credit weighted'] }),

  'circle.joining': R('Create a circle', 'joining rule',
    'by invitation, with the host admitting each member',
    'Choose who may join',
    (v, ctx) => oneOf(v, ctx?.allowed ?? ['by invitation', 'open to anyone the host admits']),
    { valid: ['by invitation'], invalid: [''] }),

  'join.code': R('Join a circle', 'invitation code',
    'HLQ and eight letters or digits',
    'Enter the code the host sent you',
    v => inviteCodeOk(v),
    { valid: ['HLQ-AB12CD34', 'HLQAB12CD34'], invalid: ['', 'HLQ-AB12CD3', 'XYZ-AB12CD34'] }),

  'join.seat': R('Seat chooser', 'seat',
    "only seats open to the member's score band",
    'This seat needs a higher score; choose from the seats shown',
    (v, ctx) => Number.isInteger(Number(v)) && Number(v) > 0 && (!ctx?.allowed || ctx.allowed.includes(String(v))),
    { valid: [1, 12], invalid: ['', 0, -1] },
    'the seat must be inside the member\'s band (lib/score-bands.ts)'),

  'join.undertaking': R('Join a circle', 'undertaking acceptance',
    'ticked after the undertaking is shown in full',
    'Read and accept the undertaking to join',
    v => ticked(v),
    { valid: [true], invalid: [false, ''] }),

  'join.guarantee': R('Join a circle', 'mutual guarantee acceptance',
    'ticked after the guarantee is shown in full',
    'Read and accept the guarantee to join',
    v => ticked(v),
    { valid: [true], invalid: [false, ''] }),

  'join.keyFacts': R('Join a circle', 'key fact statement acceptance',
    'ticked after the key fact statement is shown',
    'Read and accept the key facts to join',
    v => ticked(v),
    { valid: [true], invalid: [false, ''] }),

  'join.signature': R('Signature capture', 'signature',
    'drawn, not empty, with a minimum length of stroke',
    'Sign in the box',
    v => Array.isArray(v) && v.length >= 8,
    { valid: [[1, 2, 3, 4, 5, 6, 7, 8]], invalid: ['', [], [1, 2]] }),

  'join.withdraw': R('Withdraw before the start', 'confirmation',
    'within 24 hours of joining and before the first round',
    'You can withdraw at no cost until the first round',
    v => ticked(v),
    { valid: [true], invalid: [false, ''] },
    'the 24 hour window and the round status'),

  // -------------------------------------------------------------- host --
  'host.admission': R('Applicant detail', 'admission decision',
    'admit or decline; a reason is required to decline',
    'Give a reason for declining',
    (v, ctx) => {
      const d = (v ?? {}) as { decision?: string; reason?: string };
      if (!oneOf(d.decision, ADMISSION)) return false;
      return d.decision === 'admit' || len(d.reason, 3, 300);
    },
    { valid: [{ decision: 'admit' }, { decision: 'decline', reason: 'Income not verified' }], invalid: [{}, { decision: 'decline' }, { decision: 'maybe' }] }),

  'host.removalReason': R('Removal against the published test', 'reason',
    'one of the published removal grounds',
    'Choose the ground for removal',
    (v, ctx) => oneOf(v, ctx?.allowed ?? ['missed three instalments', 'identity fraud', 'abuse of other members']),
    { valid: ['identity fraud'], invalid: ['', 'I do not like them'] }),

  'host.vote': R('Member vote on a removal', 'vote',
    'for or against, once per member',
    'Choose for or against',
    v => oneOf(v, VOTES),
    { valid: ['for', 'against'], invalid: ['', 'abstain'] },
    'one vote per member'),

  'host.reminder': R('Reminder composer', 'message',
    "at most 300 characters and no other member's details",
    'Keep the reminder short and about the circle',
    v => len(v, 1, 300) && !/\b\d{11,}\b/.test(str(v)),
    { valid: ['Please pay before the 8th.'], invalid: ['', 'x'.repeat(301), 'call 03001234567890'] }),

  'host.turnOrder': R('Order of turns assignment, fixed or by ballot', 'order',
    'every seat filled once, inside the score bands',
    'Each seat needs one member allowed to take it',
    v => Array.isArray(v) && v.length > 0 && new Set(v).size === v.length,
    { valid: [[1, 2, 3]], invalid: ['', [], [1, 1, 2]] },
    'every seat must be inside its holder\'s band'),

  'host.dissolve': R('Circle dissolution', 'confirmation',
    'only before the first payout, with every member told',
    'A circle can be closed only before the first payout',
    v => ticked(v),
    { valid: [true], invalid: [false, ''] },
    'no payout may have been made'),

  // ------------------------------------------------------------- money --
  'pay.method': R('Payment method chooser', 'method',
    "the bank's direct debit, a wallet or card through the PSP, Raast, or by hand",
    'Choose how to pay',
    (v, ctx) => oneOf(v, ctx?.allowed ?? ['MANDATE', 'CARD', 'WALLET', 'RAAST', 'BANK_TRANSFER']),
    { valid: ['MANDATE', 'RAAST'], invalid: ['', 'CASH'] }),

  'pay.amount': R('Pay', 'amount',
    'the instalment, or a part of it of at least Rs 500 where partial payment is allowed',
    'Pay at least Rs 500, or the whole instalment',
    (v, ctx) => intIn(v, 500, ctx?.instalmentRupees ?? 10_000),
    { valid: [500, 10_000], invalid: ['', 499, 10_001, 0] }),

  'dispute.reason': R('Dispute a payment', 'reason',
    'chosen from the list',
    'Choose what went wrong',
    (v, ctx) => oneOf(v, ctx?.allowed ?? ['taken twice', 'wrong amount', 'not authorised', 'never arrived']),
    { valid: ['wrong amount'], invalid: [''] }),

  'dispute.details': R('Dispute a payment', 'details',
    '10 to 1,000 characters',
    'Describe what happened in a few words',
    v => len(v, 10, 1_000),
    { valid: ['Taken twice', 'x'.repeat(1_000)], invalid: ['', 'too short', 'x'.repeat(1_001)] }),

  'dispute.attachment': R('Dispute a payment', 'attachment',
    'PDF, JPG or PNG, at most 5 MB',
    'Attach a file of 5 MB or less',
    v => fileOk(v, 5),
    { valid: [{ name: 'a.jpg', sizeBytes: 1 }], invalid: [{}, { name: 'a.zip', sizeBytes: 1 }] }),

  'payout.account': R('Payout destination confirmation', 'account',
    'a verified account whose title matches the member',
    'Choose a verified account in your name',
    (v, ctx) => trimmed(v).length > 0 && (!ctx?.allowed || oneOf(v, ctx.allowed)),
    { valid: ['acc_1'], invalid: [''] },
    'the account title must match the member (title inquiry)'),

  'cheque.number': R('Guarantee cheque registration', 'cheque number',
    'the digits on the cheque',
    'Enter the cheque number',
    v => /^\d{6,12}$/.test(str(v).replace(/\D/g, '')),
    { valid: ['123456', '123456789012'], invalid: ['', '12345', '1234567890123'] }),

  'cheque.amount': R('Guarantee cheque registration', 'cheque amount',
    'equal to the amount stated in the undertaking',
    'The cheque must be for the amount stated',
    (v, ctx) => intIn(v, 1, 100_000_000) && (!ctx?.instalmentRupees || Number(v) >= ctx.instalmentRupees),
    { valid: [10_000], invalid: ['', 0, -1] }),

  // ----------------------------------------------- recovery and leaving --
  'hardship.reason': R('Hardship declaration', 'reason',
    'chosen from the list, with Other',
    'Choose the reason',
    (v, ctx) => oneOf(v, ctx?.allowed ?? ['lost my job', 'illness', 'salary late', 'other']),
    { valid: ['illness'], invalid: [''] }),

  'hardship.date': R('Hardship declaration', 'proposed date',
    'within 30 days',
    'Choose a date within 30 days',
    (v, ctx) => {
      const d = asDate(v);
      if (!validDate(d)) return false;
      const ref = now(ctx);
      return d >= dayStart(ref) && d <= new Date(dayStart(ref).getTime() + 30 * 86_400_000);
    },
    { valid: [], invalid: ['', '1999-01-01'] }),

  'hardship.revisedDate': R('Revised date agreement', 'date',
    'one of the dates the plan allows',
    'Choose one of the dates offered',
    (v, ctx) => !!ctx?.allowed && oneOf(v, ctx.allowed),
    { valid: [], invalid: ['', '2026-01-01'] }),

  'exit.rung': R('Exit ladder chooser', 'rung',
    'one of the rungs open to this member at this point in the circle',
    'Choose how you would like to leave',
    (v, ctx) => !!ctx?.allowed && oneOf(v, ctx.allowed),
    { valid: [], invalid: [''] }),

  'exit.reason': R('Exit ladder chooser', 'reason',
    'chosen from the list',
    'Choose a reason',
    (v, ctx) => oneOf(v, ctx?.allowed ?? ['cannot afford it', 'moving', 'other']),
    { valid: ['moving'], invalid: [''] }),

  'exit.replacement': R('Seat transfer to a replacement', "replacement's number",
    'a registered member allowed to take the seat',
    'This member cannot take the seat; the reason is shown',
    v => mobileOk(v),
    { valid: ['3001234567'], invalid: ['', '123'] },
    'the replacement must be registered and inside the band for that seat'),

  // ------------------------------------------- rewards and marketplace --
  'points.redeem': R('Redeem points against a fee', 'points',
    'at most the balance and at most the fee due',
    'You can use up to the number of points shown',
    (v, ctx) => intIn(v, 1, Math.min(ctx?.pointsBalance ?? 0, ctx?.feeDuePoints ?? 0) || 0),
    { valid: [], invalid: ['', 0, -1] }),

  'points.buy': R('Buy points (Mashreq)', 'amount',
    'within the daily and monthly limits agreed with the bank',
    'The most you can buy today is shown',
    v => intIn(v, 1, 1_000_000),
    { valid: [100], invalid: ['', 0, -1] },
    'the daily and monthly limits agreed with the bank'),

  'cart.quantity': R('Cart', 'quantity',
    'one to the stock available',
    'Only the number shown is in stock',
    (v, ctx) => intIn(v, 1, ctx?.stock ?? 1),
    { valid: [1], invalid: ['', 0, -1] }),

  'checkout.address': R('Checkout with points', 'delivery address',
    '5 to 120 characters, with city',
    'Enter the delivery address',
    v => len(v, 5, 120),
    { valid: ['House 1, Lahore'], invalid: ['', '1234'] }),

  'checkout.contact': R('Checkout with points', 'contact number',
    'a Pakistani mobile number',
    'Enter a mobile number for delivery',
    v => mobileOk(v),
    { valid: ['3001234567'], invalid: ['', '123'] }),

  'return.reason': R('Return request', 'reason',
    "chosen from the merchant's list",
    'Choose the reason for the return',
    (v, ctx) => oneOf(v, ctx?.allowed ?? ['damaged', 'wrong item', 'not as described']),
    { valid: ['damaged'], invalid: [''] }),

  'turn.askingPrice': R('Create a turn listing', 'asking price in points',
    'at most 100 per cent of the pot',
    'The price cannot be more than the pot',
    (v, ctx) => intIn(v, 1, ctx?.potPoints ?? 0),
    { valid: [], invalid: ['', 0, -1] }),

  'turn.offer': R('Make an offer', 'offer in points',
    "at most 100 per cent of the pot and at most the buyer's balance after any purchase",
    'Offer no more than the pot',
    (v, ctx) => intIn(v, 1, Math.min(ctx?.potPoints ?? 0, ctx?.pointsBalance ?? 0) || 0),
    { valid: [], invalid: ['', 0, -1] }),

  // ------------------------------------------------ support and settings --
  'support.category': R('Contact support', 'category',
    'chosen from the list',
    'Choose a topic',
    (v, ctx) => oneOf(v, ctx?.allowed ?? ['payments', 'my circle', 'my account', 'something else']),
    { valid: ['payments'], invalid: [''] }),

  'support.subject': R('Contact support', 'subject',
    '5 to 80 characters',
    'Add a short subject',
    v => len(v, 5, 80),
    { valid: ['Cannot pay', 'x'.repeat(80)], invalid: ['', 'abcd', 'x'.repeat(81)] }),

  'support.description': R('Contact support', 'description',
    '10 to 2,000 characters',
    'Describe the problem in a few words',
    v => len(v, 10, 2_000),
    { valid: ['It failed twice', 'x'.repeat(2_000)], invalid: ['', 'too short', 'x'.repeat(2_001)] }),

  'support.attachments': R('Contact support', 'attachments',
    'at most three files of 5 MB each',
    'Attach up to three files of 5 MB or less',
    v => Array.isArray(v) && v.length <= 3 && v.every(f => fileOk(f, 5)),
    { valid: [[], [{ name: 'a.png', sizeBytes: 10 }]], invalid: [[{ name: 'a.exe', sizeBytes: 10 }], [1, 2, 3, 4]] }),

  'complaint.category': R('Complaint form', 'category',
    'the categories agreed with the bank',
    'Choose what the complaint is about',
    (v, ctx) => oneOf(v, ctx?.allowed ?? ['a payment', 'my account at the bank', 'the service', 'fraud']),
    { valid: ['fraud'], invalid: [''] }),

  'complaint.description': R('Complaint form', 'description',
    '10 to 2,000 characters',
    'Describe the complaint',
    v => len(v, 10, 2_000),
    { valid: ['Money was taken twice'], invalid: ['', 'short'] }),

  'bureau.record': R('Dispute a reported record', 'record',
    "one of the member's reported records",
    'Choose the record',
    (v, ctx) => !!ctx?.allowed && oneOf(v, ctx.allowed),
    { valid: [], invalid: [''] }),

  'bureau.disputeReason': R('Dispute a reported record', 'reason',
    'chosen from the list, with details',
    'Say what is wrong with the record',
    (v, ctx) => oneOf(v, ctx?.allowed ?? ['not mine', 'already paid', 'wrong amount', 'wrong dates']),
    { valid: ['already paid'], invalid: [''] }),

  'settings.notification': R('Notification preferences', 'each switch',
    'financial alerts locked on; marketing off by default',
    'Payment alerts stay on for your safety',
    v => {
      const s = (v ?? {}) as { key?: string; on?: boolean };
      if (s.key === 'financial') return s.on === true;
      return typeof s.on === 'boolean';
    },
    { valid: [{ key: 'financial', on: true }, { key: 'marketing', on: false }], invalid: [{ key: 'financial', on: false }, {}] }),

  'settings.language': R('Language', 'language',
    'English or Urdu',
    'Choose a language',
    v => oneOf(v, LANGUAGES),
    { valid: ['English', 'Urdu'], invalid: ['', 'French'] }),

  'settings.theme': R('Appearance', 'theme',
    'system, light or dark',
    'Choose a theme',
    v => oneOf(v, THEMES),
    { valid: ['dark'], invalid: ['', 'sepia'] }),

  'settings.textSize': R('Appearance', 'text size',
    'four sizes',
    'Choose a text size',
    v => oneOf(v, TEXT_SIZES),
    { valid: ['large'], invalid: ['', 'huge'] }),

  'settings.photo': R('Appearance', 'photo',
    'JPG or PNG, at most 5 MB, cropped to a square',
    'Choose a photo of 5 MB or less',
    v => fileOk(v, 5) && !/\.pdf$/i.test(((v ?? {}) as FileLike).name ?? ''),
    { valid: [{ name: 'me.jpg', sizeBytes: 1_000 }], invalid: [{}, { name: 'me.pdf', sizeBytes: 10 }] }),

  'settings.exportFormat': R('Data export request', 'format',
    'PDF or a spreadsheet',
    'Choose a format',
    v => oneOf(v, EXPORT_FORMATS),
    { valid: ['PDF'], invalid: ['', 'docx'] }),

  'settings.closure': R('Account closure', 'confirmation',
    'allowed only with no circle owed; PIN required',
    'Close every circle before closing the account',
    v => {
      const c = (v ?? {}) as { confirmed?: boolean; pin?: string };
      return c.confirmed === true && /^\d{6}$/.test(c.pin ?? '');
    },
    { valid: [{ confirmed: true, pin: '123456' }], invalid: [{}, { confirmed: true }, { confirmed: false, pin: '123456' }] },
    'no circle may be owed'),

  'search.query': R('Search', 'query',
    'at least two characters',
    'Type at least two letters',
    v => len(v, 2, 100),
    { valid: ['ab'], invalid: ['', 'a'] }),

  'statement.range': R('Statement', 'date range',
    'start before end, at most twelve months',
    'Choose dates within twelve months',
    v => {
      const r = (v ?? {}) as { from?: string; to?: string };
      const a = asDate(r.from), b = asDate(r.to);
      if (!validDate(a) || !validDate(b) || a >= b) return false;
      return (b.getTime() - a.getTime()) <= 366 * 86_400_000;
    },
    { valid: [{ from: '2026-01-01', to: '2026-06-01' }], invalid: [{}, { from: '2026-06-01', to: '2026-01-01' }, { from: '2020-01-01', to: '2026-01-01' }] }),

  'security.transactionPin': R('Transaction PIN set up', 'transaction PIN',
    'six digits, different from the application PIN',
    'Choose six digits different from your application PIN',
    (v, ctx) => pinOk(v) && str(v) !== str(ctx?.otherPin),
    { valid: ['472916'], invalid: ['', '111111', '123456'] }),

  'security.transactionPinEntry': R('Transaction PIN entry', 'transaction PIN',
    'five attempts, then financial actions locked for fifteen minutes',
    'Wrong PIN. Attempts left: the number',
    v => /^\d{6}$/.test(str(v)),
    { valid: ['123456'], invalid: ['', '12345'] },
    'the attempt counter and the fifteen minute lock'),

  'hyper.design': R('Hyper design chooser', 'design',
    'Design 1 or Design 2, with the daily amount shown',
    'Choose a design',
    v => oneOf(v, ['Design 1', 'Design 2']),
    { valid: ['Design 1'], invalid: ['', 'Design 3'] }),

  'hyper.collectionDay': R('Hyper design chooser', 'collection day',
    'one of the open days',
    'Choose a day that is still open',
    (v, ctx) => !!ctx?.allowed && oneOf(v, ctx.allowed),
    { valid: [], invalid: [''] },
    'the day must still be open on that circle'),
};

/** Check one field. Returns the member's sentence when it fails, or null. */
export function checkField(key: keyof typeof FIELD_RULES, value: unknown, ctx?: FieldContext): string | null {
  const rule = FIELD_RULES[key];
  if (!rule) throw new Error(`No rule for field ${String(key)}`);
  return rule.check(value, ctx) ? null : rule.message;
}

export const FIELD_KEYS = Object.keys(FIELD_RULES) as (keyof typeof FIELD_RULES)[];
