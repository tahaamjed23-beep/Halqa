// audit-allow: hard-coded-colour — these are other companies' brand marks, and
// a brand mark that followed Halqa's theme would be the wrong mark.
// ---------------------------------------------------------------------------
// Payment rail marks.
//
// Rails used to render as a solid colour square with a two-letter monogram, so
// a member picking how to pay saw "JC", "EP", "RA" and, on the card option, a
// 💳 emoji. Nobody recognises a monogram. Everybody recognises the wallet they
// already have on their phone, and on a payment screen recognition is the whole
// job: it is how a member knows their money is going somewhere real.
//
// These are drawn, not fetched, so they work offline, cost no request, and
// cannot leak which rails a member is looking at to a third-party CDN. They are
// used nominatively, to identify the rail a payment travels over, in the same
// way a checkout shows a Visa mark.
// ---------------------------------------------------------------------------

export type RailId = 'RAAST' | 'JAZZCASH' | 'EASYPAISA' | 'BANK_TRANSFER' | 'CARD';

export const RAIL_BRAND: Record<RailId, { name: string; bg: string; fg: string }> = {
  RAAST:         { name: 'Raast',      bg: '#0B7A3E', fg: '#ffffff' },
  JAZZCASH:      { name: 'JazzCash',   bg: '#1A1A1A', fg: '#ffffff' },
  EASYPAISA:     { name: 'Easypaisa',  bg: '#1FA05A', fg: '#ffffff' },
  BANK_TRANSFER: { name: 'Bank',       bg: '#334155', fg: '#ffffff' },
  CARD:          { name: 'Card',       bg: '#1E2436', fg: '#ffffff' },
};

/** JazzCash: two facing crescents, yellow over red. */
function JazzCashMark({ s }: { s: number }) {
  return (
    <svg viewBox="0 0 48 48" width={s} height={s} aria-hidden="true">
      <path d="M27 8a16 16 0 0 0 0 32 16 16 0 0 1 0-32z" fill="#F5C518" />
      <path d="M21 8a16 16 0 0 1 0 32 16 16 0 0 0 0-32z" fill="#E4222C" />
    </svg>
  );
}

/** Easypaisa: the lowercase e with its dot. */
function EasypaisaMark({ s }: { s: number }) {
  return (
    <svg viewBox="0 0 48 48" width={s} height={s} aria-hidden="true">
      <path d="M33 27H17a8 8 0 0 0 13.5 4.6l3.3 3.3A13 13 0 1 1 34 24a13 13 0 0 1-1 3zM17 22h11a6 6 0 0 0-11 0z"
            fill="#fff" />
      <circle cx="36.5" cy="13.5" r="3.6" fill="#8DD64B" />
    </svg>
  );
}

/** Raast: the instant-payment flow arrows. */
function RaastMark({ s }: { s: number }) {
  return (
    <svg viewBox="0 0 48 48" width={s} height={s} aria-hidden="true">
      <rect x="10" y="26" width="6" height="13" rx="1.6" fill="#fff" />
      <rect x="21" y="19" width="6" height="20" rx="1.6" fill="#fff" />
      <rect x="32" y="10" width="6" height="29" rx="1.6" fill="#fff" opacity=".9" />
      <path d="M11 17.5 24 9l13 8.5" fill="none" stroke="#fff" strokeWidth="2.6"
            strokeLinecap="round" strokeLinejoin="round" opacity=".55" />
    </svg>
  );
}

function BankMark({ s }: { s: number }) {
  return (
    <svg viewBox="0 0 48 48" width={s} height={s} fill="none" stroke="#fff" strokeWidth="2.6"
         strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M8 20 24 11l16 9" />
      <path d="M12 23v12M20 23v12M28 23v12M36 23v12" />
      <path d="M7 38h34" />
    </svg>
  );
}

function CardMark({ s }: { s: number }) {
  return (
    <svg viewBox="0 0 48 48" width={s} height={s} aria-hidden="true">
      <rect x="7" y="13" width="34" height="22" rx="3.4" fill="none" stroke="#fff" strokeWidth="2.6" />
      <path d="M7 21h34" stroke="#fff" strokeWidth="2.6" />
      <rect x="12" y="26" width="8" height="4" rx="1" fill="#fff" opacity=".85" />
    </svg>
  );
}

/**
 * One rail mark, in a tile sized like every other tile in the app.
 * `plain` drops the coloured tile and draws the mark alone, for dark surfaces.
 */
export function RailLogo({ rail, size = 38, plain = false }:
  { rail: string; size?: number; plain?: boolean }) {
  const id = (RAIL_BRAND[rail as RailId] ? rail : 'BANK_TRANSFER') as RailId;
  const brand = RAIL_BRAND[id];
  const glyph = size * 0.62;
  const mark =
    id === 'JAZZCASH' ? <JazzCashMark s={glyph} />
    : id === 'EASYPAISA' ? <EasypaisaMark s={glyph} />
    : id === 'RAAST' ? <RaastMark s={glyph} />
    : id === 'CARD' ? <CardMark s={glyph} />
    : <BankMark s={glyph} />;

  if (plain) return <span className="rail-mark-plain" aria-label={brand.name}>{mark}</span>;

  return (
    <span
      className="rail-mark"
      style={{ width: size, height: size, background: brand.bg }}
      role="img"
      aria-label={brand.name}
    >{mark}</span>
  );
}

/** Card scheme wordmarks, for a linked card rather than a wallet. */
export function SchemeMark({ brand, size = 34 }: { brand?: string | null; size?: number }) {
  const b = (brand || '').toLowerCase();
  if (b.includes('master')) {
    return (
      <svg viewBox="0 0 48 30" width={size} height={size * 0.62} aria-label="Mastercard">
        <circle cx="19" cy="15" r="10" fill="#EB001B" />
        <circle cx="29" cy="15" r="10" fill="#F79E1B" fillOpacity=".9" />
      </svg>
    );
  }
  if (b.includes('visa')) {
    return (
      <svg viewBox="0 0 48 30" width={size} height={size * 0.62} aria-label="Visa">
        <text x="24" y="21" textAnchor="middle" fontFamily="Georgia,serif" fontStyle="italic"
              fontWeight="700" fontSize="16" fill="#1A1F71">VISA</text>
      </svg>
    );
  }
  if (b.includes('paypak')) {
    return (
      <svg viewBox="0 0 48 30" width={size} height={size * 0.62} aria-label="PayPak">
        <rect x="4" y="7" width="40" height="16" rx="3" fill="#0B7A3E" />
        <text x="24" y="19" textAnchor="middle" fontFamily="system-ui,sans-serif"
              fontWeight="700" fontSize="10" fill="#fff">PayPak</text>
      </svg>
    );
  }
  return <RailLogo rail="CARD" size={size} />;
}

export default RailLogo;
