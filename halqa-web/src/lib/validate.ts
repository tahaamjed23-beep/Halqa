// ---------------------------------------------------------------------------
// WHAT A REAL ACCOUNT LOOKS LIKE
//
// Linking a money source used to accept any string of ten or more characters.
// That is not a check, it is a formality: a mistyped IBAN passes it, and the
// member finds out weeks later when a collection fails and their circle records
// a miss against them. These are the actual formats.
//
//   IBAN (Pakistan)  PK + 2 check digits + 4-letter bank code + 16 digits = 24
//                    characters, validated by the ISO 13616 mod-97 rule.
//   Mobile / wallet  03 followed by 9 digits. A JazzCash or Easypaisa wallet IS
//                    a mobile number, and it must be the member's own.
//   Raast ID         the mobile number registered against an IBAN at the bank.
//   CNIC             13 digits, no dashes.
//   Card             13 to 19 digits passing the Luhn checksum, with an expiry
//                    that has not passed.
// ---------------------------------------------------------------------------

const A = 'A'.charCodeAt(0);

/** ISO 13616 mod-97. Returns 1 for a valid IBAN. */
function mod97(iban: string): number {
  const rearranged = iban.slice(4) + iban.slice(0, 4);
  let remainder = 0;
  for (const ch of rearranged) {
    const value = ch >= 'A' && ch <= 'Z' ? String(ch.charCodeAt(0) - A + 10) : ch;
    for (const digit of value) remainder = (remainder * 10 + Number(digit)) % 97;
  }
  return remainder;
}

export const cleanIban = (v: string) => v.toUpperCase().replace(/[^A-Z0-9]/g, '');

/** A Pakistani IBAN: shape first, then the checksum. */
export function ibanOk(raw: string): boolean {
  const v = cleanIban(raw);
  if (!/^PK\d{2}[A-Z]{4}\d{16}$/.test(v)) return false;
  return mod97(v) === 1;
}

/** What is wrong with it, in words a member can act on. */
export function ibanProblem(raw: string): string | null {
  const v = cleanIban(raw);
  if (!v) return null;
  if (!v.startsWith('PK')) return 'A Pakistani IBAN starts with PK';
  if (v.length < 24) return 'An IBAN is 24 characters. You have ' + v.length + '.';
  if (v.length > 24) return 'That is longer than 24 characters';
  if (!/^PK\d{2}[A-Z]{4}\d{16}$/.test(v)) return 'After PK come 2 digits, 4 letters for the bank, then 16 digits';
  if (mod97(v) !== 1) return 'Those digits do not check out. Copy it again from your bank app.';
  return null;
}

export const groupIban = (v: string) => cleanIban(v).slice(0, 24).replace(/(.{4})/g, '$1 ').trim();

/** 03XXXXXXXXX. The only shape a Pakistani mobile wallet comes in. */
export const cleanMobile = (v: string) => v.replace(/\D/g, '').slice(0, 11);
export const mobileOk = (v: string) => /^03\d{9}$/.test(cleanMobile(v));
export function mobileProblem(raw: string): string | null {
  const v = cleanMobile(raw);
  if (!v) return null;
  if (!v.startsWith('03')) return 'A Pakistani mobile number starts 03';
  if (v.length < 11) return 'That is ' + v.length + ' digits. A mobile number is 11.';
  return null;
}
export const groupMobile = (v: string) => {
  const d = cleanMobile(v);
  return d.length > 4 ? d.slice(0, 4) + ' ' + d.slice(4) : d;
};

/** CNIC: 13 digits. Shown grouped 00000-0000000-0 the way the card prints it. */
export const cleanCnic = (v: string) => v.replace(/\D/g, '').slice(0, 13);
export const cnicOk = (v: string) => cleanCnic(v).length === 13;
export const groupCnic = (v: string) => {
  const d = cleanCnic(v);
  if (d.length <= 5) return d;
  if (d.length <= 12) return d.slice(0, 5) + '-' + d.slice(5);
  return d.slice(0, 5) + '-' + d.slice(5, 12) + '-' + d.slice(12);
};

/** Luhn. Catches a single mistyped digit and most transpositions. */
export function luhn(raw: string): boolean {
  const d = raw.replace(/\D/g, '');
  if (d.length < 13 || d.length > 19) return false;
  let sum = 0, alt = false;
  for (let i = d.length - 1; i >= 0; i--) {
    let n = Number(d[i]);
    if (alt) { n *= 2; if (n > 9) n -= 9; }
    sum += n; alt = !alt;
  }
  return sum % 10 === 0;
}

export const cleanCard = (v: string) => v.replace(/\D/g, '').slice(0, 19);
export const groupCard = (v: string) => cleanCard(v).replace(/(.{4})/g, '$1 ').trim();
export const cardBrand = (v: string) => {
  const d = cleanCard(v);
  return /^4/.test(d) ? 'Visa'
    : /^(5[1-5]|2[2-7])/.test(d) ? 'Mastercard'
    : /^3[47]/.test(d) ? 'Amex'
    : /^(60|65|81|82)/.test(d) ? 'PayPak'
    : 'Card';
};

export const groupExpiry = (raw: string) => {
  const d = raw.replace(/\D/g, '').slice(0, 4);
  return d.length >= 3 ? d.slice(0, 2) + '/' + d.slice(2) : d;
};

/** MM/YY, a real month, and not already past. */
export function expiryOk(v: string): boolean {
  const m = /^(\d{2})\/(\d{2})$/.exec(v);
  if (!m) return false;
  const month = Number(m[1]), year = 2000 + Number(m[2]);
  if (month < 1 || month > 12) return false;
  const now = new Date();
  const end = new Date(year, month, 1);          // first day after the card expires
  return end > now;
}

export function expiryProblem(v: string): string | null {
  if (!v) return null;
  if (!/^\d{2}\/\d{2}$/.test(v)) return null;
  const month = Number(v.slice(0, 2));
  if (month < 1 || month > 12) return 'There is no month ' + month;
  if (!expiryOk(v)) return 'That card has already expired';
  return null;
}
