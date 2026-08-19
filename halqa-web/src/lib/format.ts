// ============================================================================
// ONE FORMATTER FOR THE WHOLE APP
//
// Every page used to format its own money, dates and durations, so the same
// value appeared three different ways on three screens: "8/27/2026" next to
// "27 Aug", "159d 21h" next to "5 months". A cash app cannot read like that.
// Nothing outside this file is allowed to call toLocaleDateString or build a
// currency string by hand.
// ============================================================================

const PKR = new Intl.NumberFormat('en-PK', { maximumFractionDigits: 0 });
const PKR2 = new Intl.NumberFormat('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** Narrow no-break space: keeps "Rs" welded to the number across a line break. */
const NB = ' ';

/**
 * The one money formatter. Input is integer paisa, because the ledger is
 * integer paisa and floating point cannot represent most decimal fractions.
 * Paisa are only shown when they are non-zero, so ordinary amounts stay clean.
 */
export function money(paisa: string | number | bigint = 0): string {
  const n = Number(paisa);
  if (!Number.isFinite(n)) return `Rs${NB}0`;
  const neg = n < 0;
  const abs = Math.abs(n);
  const rupees = Math.floor(abs / 100);
  const rem = abs % 100;
  const body = rem === 0 ? PKR.format(rupees) : PKR2.format(abs / 100);
  return `${neg ? '− ' : ''}Rs${NB}${body}`;
}

/**
 * Short money for tight rows and chart axes. Uses the lakh/crore the reader
 * actually thinks in, not the western million.
 */
export function moneyShort(paisa: string | number | bigint = 0): string {
  const rupees = Math.floor(Number(paisa) / 100);
  const abs = Math.abs(rupees);
  const sign = rupees < 0 ? '− ' : '';
  if (abs >= 10000000) return `${sign}Rs${NB}${trim(abs / 10000000)} crore`;
  if (abs >= 100000) return `${sign}Rs${NB}${trim(abs / 100000)} lakh`;
  if (abs >= 1000) return `${sign}Rs${NB}${trim(abs / 1000)}k`;
  return `${sign}Rs${NB}${PKR.format(abs)}`;
}
const trim = (n: number) => (Math.round(n * 10) / 10).toString();

/** Rupees, not paisa. For inputs where the member types whole rupees. */
export const rupees = (r: number) => money(Math.round(r * 100));

/** One percentage format, one decimal at most, never a bare float. */
export function percent(value: number, decimals = 1): string {
  if (!Number.isFinite(value)) return '0%';
  const r = Math.round(value * 10 ** decimals) / 10 ** decimals;
  return `${Number.isInteger(r) ? r : r.toFixed(decimals)}%`;
}

/** Basis points to a readable percentage. The API speaks bps; members do not. */
export const bps = (b: number) => percent((b || 0) / 100, 2);

// ---------------------------------------------------------------- dates

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const toDate = (v?: string | number | Date | null): Date | null => {
  if (v === null || v === undefined || v === '') return null;
  const d = v instanceof Date ? v : new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
};

/** `27 Aug 2026`. The only long date in the app. */
export function date(v?: string | number | Date | null): string {
  const d = toDate(v);
  if (!d) return '—';
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

/** `27 Aug`. For rows where the year is obvious from context. */
export function dateShort(v?: string | number | Date | null): string {
  const d = toDate(v);
  if (!d) return '—';
  const now = new Date();
  return d.getFullYear() === now.getFullYear()
    ? `${d.getDate()} ${MONTHS[d.getMonth()]}`
    : date(d);
}

/** `27 Aug 2026, 4:05 pm` */
export function dateTime(v?: string | number | Date | null): string {
  const d = toDate(v);
  if (!d) return '—';
  return `${date(d)}, ${time(d)}`;
}

/** `4:05 pm` */
export function time(v?: string | number | Date | null): string {
  const d = toDate(v);
  if (!d) return '—';
  let h = d.getHours();
  const m = d.getMinutes().toString().padStart(2, '0');
  const suffix = h >= 12 ? 'pm' : 'am';
  h = h % 12 || 12;
  return `${h}:${m} ${suffix}`;
}

const DAY = 86400000;

/**
 * Anything inside a week reads as human time; past that it becomes a date.
 * "in 3 days" is what a member understands; "159d 21h" is what a server thinks.
 */
export function when(v?: string | number | Date | null): string {
  const d = toDate(v);
  if (!d) return '—';
  const diff = d.getTime() - Date.now();
  const days = Math.round(diff / DAY);
  if (Math.abs(diff) < 3600000) return diff >= 0 ? 'within the hour' : 'just now';
  if (days === 0) return diff >= 0 ? 'later today' : 'earlier today';
  if (days === 1) return 'tomorrow';
  if (days === -1) return 'yesterday';
  if (days > 1 && days <= 7) return `in ${days} days`;
  if (days < -1 && days >= -7) return `${Math.abs(days)} days ago`;
  return dateShort(d);
}

/**
 * How long until something, in units a person uses out loud.
 * Replaces "159d 21h" with "5 months, 9 days".
 */
export function until(v?: string | number | Date | null): string {
  const d = toDate(v);
  if (!d) return 'Not scheduled';
  const ms = d.getTime() - Date.now();
  if (ms <= 0) return 'Due now';
  const days = Math.floor(ms / DAY);
  if (days >= 60) {
    const months = Math.floor(days / 30);
    const rest = days % 30;
    return rest ? `${months} months, ${rest} ${plural(rest, 'day')}` : `${months} months`;
  }
  if (days >= 1) {
    const hours = Math.floor((ms % DAY) / 3600000);
    return hours ? `${days} ${plural(days, 'day')}, ${hours} ${plural(hours, 'hour')}`
                 : `${days} ${plural(days, 'day')}`;
  }
  const hours = Math.floor(ms / 3600000);
  if (hours >= 1) return `${hours} ${plural(hours, 'hour')}`;
  const mins = Math.max(1, Math.floor(ms / 60000));
  return `${mins} ${plural(mins, 'minute')}`;
}

/** How long since something. */
export function since(v?: string | number | Date | null): string {
  const d = toDate(v);
  if (!d) return '—';
  const days = Math.floor((Date.now() - d.getTime()) / DAY);
  if (days < 1) return 'today';
  if (days < 30) return `${days} ${plural(days, 'day')}`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} ${plural(months, 'month')}`;
  const years = Math.floor(months / 12);
  return `${years} ${plural(years, 'year')}`;
}

const plural = (n: number, word: string) => (n === 1 ? word : `${word}s`);

// ---------------------------------------------------------------- identity

/** `0300 1234567` from any shape the API or a member gives us. */
export function phone(raw?: string | null): string {
  if (!raw) return '—';
  const digits = raw.replace(/\D/g, '');
  const local = digits.startsWith('92') ? '0' + digits.slice(2) : digits;
  if (local.length !== 11) return raw;
  return `${local.slice(0, 4)} ${local.slice(4)}`;
}

/** `12345-1234567-1`, the way it is printed on the card. */
export function cnic(raw?: string | null): string {
  if (!raw) return '—';
  const d = raw.replace(/\D/g, '');
  if (d.length !== 13) return raw;
  return `${d.slice(0, 5)}-${d.slice(5, 12)}-${d.slice(12)}`;
}

/** Never show a full account number. Last four only, always. */
export function maskAccount(raw?: string | null): string {
  if (!raw) return '—';
  const s = raw.replace(/\s/g, '');
  return s.length <= 4 ? s : `•••• ${s.slice(-4)}`;
}

/** Initials for an avatar, at most two letters, never empty. */
export function initials(name?: string | null): string {
  const parts = (name || '').trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '?';
  return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase();
}

/** `Position 5 of 12`, spelled out rather than `5/12`. */
export const position = (k: number, n: number) => `Position ${k} of ${n}`;

/** Ordinal for turn numbers: 1st, 2nd, 3rd. */
export function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

/** Sentence case for shouted enum values: `RUNNING` becomes `Running`. */
export function sentence(v?: string | null): string {
  if (!v) return '';
  const s = v.replace(/_/g, ' ').toLowerCase();
  return s.charAt(0).toUpperCase() + s.slice(1);
}
