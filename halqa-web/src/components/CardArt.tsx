// Real card artwork, not a green rectangle.
//
// A member recognises their own card by its colour and its brand before they
// read a single digit, which is exactly how every Pakistani wallet app draws
// them. So: issuer gradient, a gold chip, the masked number in card spacing,
// holder name and expiry. Nothing sensitive is involved — the full number and
// the security code are never stored, so the art can only ever show the last
// four, which is all a member needs to tell one card from another.

const ISSUER: Record<string, { bg: string; brand: string }> = {
  VISA:        { bg: 'linear-gradient(135deg,#1A1F71,#2C3AA8 55%,#4453C4)', brand: 'VISA' },
  MASTERCARD:  { bg: 'linear-gradient(135deg,#1A1A1A,#3A2416 55%,#EB001B)', brand: 'Mastercard' },
  UNIONPAY:    { bg: 'linear-gradient(135deg,#005B9A,#007AC2 55%,#E21836)', brand: 'UnionPay' },
  PAYPAK:      { bg: 'linear-gradient(135deg,#0B5D3B,#128A55 55%,#1FB06C)', brand: 'PayPak' },
  HBL:         { bg: 'linear-gradient(135deg,#0B5D3B,#1B7A4E)', brand: 'HBL' },
  MEEZAN:      { bg: 'linear-gradient(135deg,#00563F,#0A7A59)', brand: 'Meezan' },
  UBL:         { bg: 'linear-gradient(135deg,#00447C,#0A63A8)', brand: 'UBL' },
  JAZZCASH:    { bg: 'linear-gradient(135deg,#8C1D40,#C42A5E)', brand: 'JazzCash' },
  EASYPAISA:   { bg: 'linear-gradient(135deg,#00A651,#25C16F)', brand: 'Easypaisa' },
  SADAPAY:     { bg: 'linear-gradient(135deg,#101820,#2B3440)', brand: 'SadaPay' },
  RAAST:       { bg: 'linear-gradient(135deg,#0E4C92,#1C6FC4)', brand: 'Raast' },
  DEFAULT:     { bg: 'linear-gradient(150deg,#41801A,#57A81E 46%,#6DC72A)', brand: 'Halqa' },
};

/** Guess the issuer from whatever label or brand string we hold. */
export function issuerOf(hint?: string | null): keyof typeof ISSUER {
  const s = (hint || '').toUpperCase();
  for (const key of Object.keys(ISSUER)) if (key !== 'DEFAULT' && s.includes(key)) return key;
  if (s.includes('MASTER')) return 'MASTERCARD';
  if (s.includes('UNION')) return 'UNIONPAY';
  return 'DEFAULT';
}

export function CardArt({ brand, last4, holder, expiry }: {
  brand?: string | null; last4?: string | null; holder?: string | null; expiry?: string | null;
}) {
  const issuer = ISSUER[issuerOf(brand)];
  return <div className="card-art" style={{ background: issuer.bg }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div className="card-chip" aria-hidden="true" />
      <span className="card-brand">{issuer.brand}</span>
    </div>
    <div className="card-no">•••• •••• •••• {last4 || '••••'}</div>
    <div className="card-foot">
      <div><span>Card holder</span><b>{(holder || 'Halqa member').toUpperCase()}</b></div>
      <div style={{ textAlign: 'right' }}><span>Expires</span><b>{expiry || '••/••'}</b></div>
    </div>
  </div>;
}

/** The small card used in list rows, in place of a flat icon tile. */
export function CardMini({ brand }: { brand?: string | null }) {
  const issuer = ISSUER[issuerOf(brand)];
  return <div className="card-mini" style={{ background: issuer.bg }} aria-hidden="true">
    <i /><b>{issuer.brand.slice(0, 8)}</b>
  </div>;
}
