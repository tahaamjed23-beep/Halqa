import { RailLogo, SchemeMark } from './RailLogo';

// The bank directory, the rail metadata and the account-card face. Pointers
// only, always: the server masks numbers on the way out, and no balance and no
// card number is ever stored.

export type LinkedMethod = { id: string; rail: string; accountNo: string; accountTitle?: string; bankName?: string; label: string; preferred: boolean; verified?: boolean; brand?: string; last4?: string; expiry?: string; addressLine?: string; city?: string };

type BrandMeta = { name: string; mono: string; color: string; dark: string };
export const RAIL_META: Record<string, BrandMeta> = {
  RAAST: { name: 'Raast', mono: 'RA', color: '#0e7d72', dark: '#07524a' },
  JAZZCASH: { name: 'JazzCash', mono: 'JC', color: '#c8102e', dark: '#7e0a1d' },
  EASYPAISA: { name: 'Easypaisa', mono: 'EP', color: '#3f9c35', dark: '#25631f' },
  BANK_TRANSFER: { name: 'Bank account', mono: 'BK', color: '#5b6472', dark: '#39404b' },
  CARD: { name: 'Debit or credit card', mono: 'CD', color: '#2b2f45', dark: '#14162a' },
};
// Card brand from leading digits, display only; the PAN never leaves the form.
export const cardBrand = (digits: string) => /^4/.test(digits) ? 'Visa' : /^(5[1-5]|2[2-7])/.test(digits) ? 'Mastercard' : /^3[47]/.test(digits) ? 'Amex' : /^(60|65|81|82)/.test(digits) ? 'PayPak' : 'Card';
export const formatCard = (raw: string) => raw.replace(/\D/g, '').slice(0, 19).replace(/(.{4})/g, '$1 ').trim();
export const formatExpiry = (raw: string) => { const d = raw.replace(/\D/g, '').slice(0, 4); return d.length >= 3 ? `${d.slice(0, 2)}/${d.slice(2)}` : d; };

// Indicative brand palette for the demo bank directory, avatar colors, not
// official assets. "Other bank" keeps the neutral slate.
export const PK_BANKS: BrandMeta[] = [
  { name: 'HBL', mono: 'HBL', color: '#007a3d', dark: '#004d26' },
  { name: 'Meezan Bank', mono: 'MZ', color: '#5d2e8e', dark: '#3a1c59' },
  { name: 'UBL', mono: 'UBL', color: '#0057a8', dark: '#003668' },
  { name: 'MCB', mono: 'MCB', color: '#006341', dark: '#003d28' },
  { name: 'Allied Bank', mono: 'ABL', color: '#005baa', dark: '#003a6d' },
  { name: 'Bank Alfalah', mono: 'BAF', color: '#b3282d', dark: '#701a1d' },
  { name: 'Bank Al Habib', mono: 'BAH', color: '#00693e', dark: '#004127' },
  { name: 'Standard Chartered', mono: 'SC', color: '#0f7dc2', dark: '#0a4f7a' },
  { name: 'Faysal Bank', mono: 'FBL', color: '#00539f', dark: '#003464' },
  { name: 'Askari Bank', mono: 'AKB', color: '#00447c', dark: '#002a4e' },
  { name: 'JS Bank', mono: 'JS', color: '#003da5', dark: '#002668' },
  { name: 'Soneri Bank', mono: 'SNB', color: '#8a1538', dark: '#560d23' },
  { name: 'Bank of Punjab', mono: 'BOP', color: '#9a3b26', dark: '#5f2317' },
  { name: 'NBP', mono: 'NBP', color: '#00594c', dark: '#00352e' },
  { name: 'SadaPay', mono: 'SP', color: '#ff4f6e', dark: '#c22646' },
  { name: 'NayaPay', mono: 'NP', color: '#00b388', dark: '#007257' },
  { name: 'Other bank', mono: 'BK', color: '#5b6472', dark: '#39404b' },
];
export const bankMeta = (bankName?: string): BrandMeta | undefined => PK_BANKS.find(b => b.name === bankName);
export const cardMeta = (rail: string, bankName?: string): BrandMeta =>
  rail === 'BANK_TRANSFER' ? (bankMeta(bankName) ?? { ...RAIL_META.BANK_TRANSFER, name: bankName || 'Bank account' }) : (RAIL_META[rail] ?? RAIL_META.BANK_TRANSFER);

// Grouping + entry formatting. IBANs group in 4s (PK36 SONE 0000 …); wallets
// and Raast IDs read as 03XX XXXXXXX. Masked numbers from the server regroup
// the same way, so cards look right with dots too.
export const groupAccount = (value: string) => value.replace(/\s+/g, '').replace(/(.{4})/g, '$1 ').trim();
export const formatEntry = (rail: string, raw: string) => rail === 'BANK_TRANSFER'
  ? groupAccount(raw.toUpperCase().replace(/[^A-Z0-9•]/g, '').slice(0, 24))
  : raw.replace(/[^\d•]/g, '').slice(0, 11).replace(/^(.{4})(.+)$/, '$1 $2');

export function AccountCard({ rail, bankName, accountTitle, accountNo, label, verified, preferred, salary, draft, brand, last4, expiry, footer }:
  { rail: string; bankName?: string; accountTitle?: string; accountNo: string; label?: string; verified?: boolean; preferred?: boolean; salary?: boolean; draft?: boolean; brand?: string; last4?: string; expiry?: string; footer?: React.ReactNode }) {
  const isCard = rail === 'CARD';
  const meta = isCard ? { ...RAIL_META.CARD, name: brand || 'Card' } : cardMeta(rail, bankName);
  // For a card, show the classic •••• •••• •••• 1234 line; the last4 comes back
  // from the server (the stored accountNo IS the last4), or from live input.
  const cardLine = isCard ? `•••• •••• •••• ${(last4 || accountNo || '').replace(/\D/g, '').slice(-4) || '••••'}` : groupAccount(accountNo);
  return <div className={`acct-card${isCard ? ' is-card' : ''}`} style={{ background: `linear-gradient(135deg, ${meta.color}, ${meta.dark})` }}>
    <div className="acct-card-top">
      <i className="acct-card-logo">{isCard ? <SchemeMark brand={brand} size={40} /> : <RailLogo rail={rail} size={34} plain />}</i>
      <b>{isCard ? (brand || 'Card') : rail === 'BANK_TRANSFER' ? (bankName || 'Bank account') : meta.name}</b>
      <span className="acct-badges">
        {draft ? <em className="acct-badge">Preview</em> : verified ? <em className="acct-badge ok">Verified</em> : <em className="acct-badge warn">Unverified</em>}
        {preferred && <em className="acct-badge gold">Preferred</em>}
        {salary && <em className="acct-badge gold">Salary, 20% off fees</em>}
      </span>
    </div>
    <div className="acct-card-no mono">{cardLine || '•••• •••• ••••'}</div>
    <div className="acct-card-holder">
      <div><span>{isCard ? 'Cardholder' : 'Account holder'}</span><b>{accountTitle || label || ''}</b></div>
      {isCard && <div className="acct-card-exp"><span>Expires</span><b>{expiry || 'MM/YY'}</b></div>}
    </div>
    {footer}
  </div>;
}

// The manager lives in LinkedAccountsManager.tsx now, rebuilt on the shared row
// set. Re-exported here so every existing import path keeps working.
export { LinkedAccountsManager } from './LinkedAccountsManager';
