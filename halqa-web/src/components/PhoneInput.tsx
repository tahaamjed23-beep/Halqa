import { useMemo, useRef, useState } from 'react';
import { ChevronDown, Search } from 'lucide-react';

// International phone input: a country selector (flag + dial code, Pakistan
// first) beside a national-number field. Emits an E.164-style string
// `+<dial><national>` with any leading zeros on the national part stripped —
// the API's cleanPhone() turns +92… back into 0… for Pakistani numbers.

export type Country = { code: string; name: string; dial: string; flag: string };

// Flag emoji from the ISO-3166 alpha-2 code (regional-indicator letters), so we
// don't ship an image set.
const flag = (code: string) => code.replace(/./g, c => String.fromCodePoint(127397 + c.charCodeAt(0)));
const mk = (code: string, name: string, dial: string): Country => ({ code, name, dial, flag: flag(code) });

// Pakistan first, then the diaspora hubs, then a broad alphabetical list.
export const COUNTRIES: Country[] = [
  mk('PK', 'Pakistan', '92'),
  mk('SA', 'Saudi Arabia', '966'), mk('AE', 'United Arab Emirates', '971'), mk('GB', 'United Kingdom', '44'),
  mk('US', 'United States', '1'), mk('CA', 'Canada', '1'), mk('QA', 'Qatar', '974'), mk('KW', 'Kuwait', '965'),
  mk('OM', 'Oman', '968'), mk('BH', 'Bahrain', '973'), mk('AU', 'Australia', '61'), mk('MY', 'Malaysia', '60'),
  mk('AF', 'Afghanistan', '93'), mk('BD', 'Bangladesh', '880'), mk('IN', 'India', '91'), mk('CN', 'China', '86'),
  mk('DE', 'Germany', '49'), mk('FR', 'France', '33'), mk('IT', 'Italy', '39'), mk('ES', 'Spain', '34'),
  mk('NL', 'Netherlands', '31'), mk('SE', 'Sweden', '46'), mk('NO', 'Norway', '47'), mk('DK', 'Denmark', '45'),
  mk('IE', 'Ireland', '353'), mk('TR', 'Turkey', '90'), mk('IR', 'Iran', '98'), mk('IQ', 'Iraq', '964'),
  mk('JO', 'Jordan', '962'), mk('LB', 'Lebanon', '961'), mk('EG', 'Egypt', '20'), mk('ZA', 'South Africa', '27'),
  mk('KE', 'Kenya', '254'), mk('NG', 'Nigeria', '234'), mk('SG', 'Singapore', '65'), mk('ID', 'Indonesia', '62'),
  mk('TH', 'Thailand', '66'), mk('JP', 'Japan', '81'), mk('KR', 'South Korea', '82'), mk('NZ', 'New Zealand', '64'),
  mk('CH', 'Switzerland', '41'), mk('BE', 'Belgium', '32'), mk('AT', 'Austria', '43'), mk('PT', 'Portugal', '351'),
  mk('GR', 'Greece', '30'), mk('PL', 'Poland', '48'), mk('RU', 'Russia', '7'), mk('BR', 'Brazil', '55'),
  mk('MX', 'Mexico', '52'), mk('LK', 'Sri Lanka', '94'), mk('NP', 'Nepal', '977'),
];

export default function PhoneInput({ value, onChange, autoFocus }: { value: string; onChange: (full: string) => void; autoFocus?: boolean }) {
  const [dial, setDial] = useState('92');
  const [national, setNational] = useState(() => (value.startsWith('+') ? '' : value));
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const boxRef = useRef<HTMLDivElement | null>(null);
  const country = COUNTRIES.find(c => c.dial === dial) || COUNTRIES[0];
  const emit = (d: string, n: string) => { const digits = n.replace(/\D/g, '').replace(/^0+/, ''); onChange(digits ? `+${d}${digits}` : ''); };
  const setCountry = (c: Country) => { setDial(c.dial); setOpen(false); setQuery(''); emit(c.dial, national); };
  const typeNumber = (raw: string) => { setNational(raw); emit(dial, raw); };
  const filtered = useMemo(() => { const q = query.trim().toLowerCase(); return q ? COUNTRIES.filter(c => c.name.toLowerCase().includes(q) || c.dial.includes(q) || c.code.toLowerCase().includes(q)) : COUNTRIES; }, [query]);
  return <div className="phone-input" ref={boxRef}>
    <div className="phone-row">
      <button type="button" className="country-btn" onClick={() => setOpen(o => !o)} aria-label="Select country">
        <span className="flag">{country.flag}</span><span className="dial">+{country.dial}</span><ChevronDown size={15} className={open ? 'rot' : ''} />
      </button>
      <input className="field phone-num" inputMode="tel" autoFocus={autoFocus} placeholder={country.code === 'PK' ? '3XX XXXXXXX' : 'Phone number'} value={national} onChange={e => typeNumber(e.target.value)} />
    </div>
    {open && <div className="country-menu">
      <div className="country-search"><Search size={14} /><input autoFocus placeholder="Search country or code" value={query} onChange={e => setQuery(e.target.value)} /></div>
      <div className="country-list">{filtered.map(c => <button type="button" key={c.code} className={`country-opt ${c.dial === dial ? 'on' : ''}`} onClick={() => setCountry(c)}><span className="flag">{c.flag}</span><span className="cname">{c.name}</span><span className="cdial">+{c.dial}</span></button>)}{!filtered.length && <p className="muted" style={{ padding: '10px 12px', fontSize: 12 }}>No match</p>}</div>
    </div>}
  </div>;
}
