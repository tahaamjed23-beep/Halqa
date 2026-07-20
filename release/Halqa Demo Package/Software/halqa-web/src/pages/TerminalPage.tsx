import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { ExternalLink, Filter, Sparkles, TrendingUp } from 'lucide-react';
import { api, money } from '../api';
import type { Scheme } from '../types';
import { Field, profitProjection, RateStamp, rateFreshness } from '../components/ui';
import { RiskBadge } from '../components/RiskConsole';
const ProjectionChart = lazy(() => import('../components/ProjectionChart'));
const band = (score: number) => score <= 3 ? 'LOW' : score <= 6 ? 'MEDIUM' : score <= 8 ? 'HIGH' : 'EXTREME';

// Halqa's own earning schemes — the ones that power the profit engine and the
// vault automatically (float sweep, deposit Mudarabah, income & gold vault
// tiers). These are kept separate from the general market-investment universe.
const ENGINE_SLUGS = ['islamic-money-market-fund-basket', 'islamic-mudarabah-deposit-basket', 'islamic-income-fund-basket', 'gold-linked-allocation'];
const ROLE: Record<string, { title: string; body: string }> = {
  'islamic-money-market-fund-basket': { title: 'The float sweep · Sukoon base', body: "Every day your committee's pool sits idle between a payment and a payout, it earns here on an Islamic money-market sleeve. This is where Sukoon and Bazaar profit comes from — automatically, with no decision from you. It is also the vault's Standard tier." },
  'islamic-mudarabah-deposit-basket': { title: 'Deposit yield · Mudarabah', body: "Your security deposit is not dead money. Across the cycle it earns here at the Islamic Mudarabah rate. In Sukoon the yield is yours; in Bazaar it is pooled toward the members who waited longest. Your collateral, working for you." },
  'islamic-income-fund-basket': { title: 'Vault Income tier', body: "A higher-yield halal sleeve for the Sukoon Vault. Park a payout or top up any amount and it earns here — more return than the standard money-market tier, with a little more movement." },
  'gold-linked-allocation': { title: 'Vault Gold tier · inflation hedge', body: "Gold-linked exposure for the vault. A classic, halal hedge: gold tends to hold or gain value exactly when the rupee is weakening, so it protects your purchasing power. Choose it as your vault tier on the Profile page." },
};

// Plain-language "what this actually is" for the general market schemes.
const ABOUT: Record<string, string> = {
  'Government Security': 'A loan to the Government of Pakistan (Treasury Bills and Investment Bonds). About the safest, most liquid place to put money — steady, dependable returns and near-zero chance of default.',
  'Sovereign Sukuk': 'Government-issued Islamic bonds. Instead of paying interest, they share the return from real underlying assets — a fully Shariah-compliant way to hold safe sovereign exposure.',
  'National Savings': 'Government retail savings certificates (Behbood, Defence, Special Savings and the like). Very safe, fixed-term products backed directly by the state.',
  'Mutual Fund': 'A professionally-managed basket of instruments. Money-market funds are the calmest; income, asset-allocation and balanced funds reach for more return and, with it, more ups and downs.',
  'Commodity': 'Gold-linked exposure — the classic hedge against inflation and a weakening rupee. Shariah-friendly.',
  'Corporate Debt': 'Islamic bonds (sukuk) issued by companies rather than the government. Higher yield than sovereign paper, in exchange for more credit risk.',
  'Bank Deposit': 'A fixed deposit with a bank. The Islamic version uses Mudarabah — the bank shares real profit with you instead of paying interest.',
  'Equity ETF': 'Ownership of a basket of listed companies (stocks), traded on the exchange. The highest potential return and the biggest swings — best for money you can leave for years.',
  'Equity Fund': 'A managed fund of company shares (Shariah-screened where marked). High growth potential and high volatility.',
  'REIT': 'A property trust — you earn from real-estate rents and rising value without having to buy a building yourself.',
  'Private Credit': 'Lending to vetted businesses (for example against their unpaid invoices). Higher yield, higher risk, and your money is less quickly accessible.',
  'Islamic Finance': 'Short-term Islamic trade finance (Murabaha) — financing real goods and trade rather than lending cash at interest. Shariah-compliant.',
  'Microfinance': 'Deposits with licensed microfinance institutions that on-lend to small entrepreneurs. Curated and higher-risk.',
  'Multi-Asset': 'A blended, currency-hedged mix across several asset classes — a diversified sleeve for spreading risk.',
  'Digital Asset': '⚠ Cryptocurrency. This is NOT government-backed and it is extremely volatile — the price can crash 50% or more in weeks. The "rate" shown is speculative, not a promise; you could lose a large part of your capital. Halqa keeps this out of committees entirely and shows it here for information only. Only for money you can afford to lose completely.',
};

export default function TerminalPage() {
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [selected, setSelected] = useState('');
  const [principal, setPrincipal] = useState(100000);
  const [allocation, setAllocation] = useState(25);
  const [months, setMonths] = useState(12);
  const [maxRisk, setMaxRisk] = useState(8);
  const [sortBy, setSortBy] = useState<'return' | 'risk'>('return');
  const [bandFilter, setBandFilter] = useState<'ALL' | 'LOW' | 'MEDIUM' | 'HIGH'>('ALL');
  const [tab, setTab] = useState<'engine' | 'market'>('engine');
  const [cryptoOk, setCryptoOk] = useState(false);
  const [pending, setPending] = useState<Scheme | null>(null);
  const [error, setError] = useState('');
  useEffect(() => { void api<Scheme[]>('/schemes').then(setSchemes).catch(reason => setError(reason.message)); }, []);
  const engineSchemes = ENGINE_SLUGS.map(slug => schemes.find(s => s.slug === slug)).filter((s): s is Scheme => !!s);
  const market = schemes.filter(s => !ENGINE_SLUGS.includes(s.slug));
  const visible = market.filter(item => item.riskScore <= maxRisk);
  const list = [...visible].filter(item => bandFilter === 'ALL' || band(item.riskScore) === bandFilter).sort((a, b) => sortBy === 'return' ? b.indicativeRatePct - a.indicativeRatePct : a.riskScore - b.riskScore);
  const scheme = list.find(item => item.id === selected) || list[0] || visible[0];
  const invested = principal * allocation / 100;
  const expected = useMemo(() => profitProjection(invested, scheme?.indicativeRatePct || 0, months * 30.4375), [invested, scheme, months]);
  return <div className="page enter">
    <div className="page-head terminal-head"><div><span className="eyebrow">Investments · where your profit comes from</span><h1>Growth laboratory</h1><p>Two separate worlds: how Halqa grows your money automatically, and the market schemes you can optionally invest a slice of the pool into.</p></div></div>
    <nav className="terminal-tabs"><button className={tab === 'engine' ? 'active' : ''} onClick={() => setTab('engine')}><Sparkles />Halqa earning &amp; gold</button><button className={tab === 'market' ? 'active' : ''} onClick={() => setTab('market')}><TrendingUp />Market investments</button></nav>
    {error && <div className="error-box">{error}</div>}

    {tab === 'engine' && <section className="engine-intro">
      <div className="market-rules"><Sparkles /><div><b>These earn for you automatically — no decision needed.</b><p>Sukoon, Bazaar and the vault put your idle pool days, security deposits and parked payouts to work in these disclosed, halal instruments. You don't pick them; they run in the background whenever your circle earns.</p></div></div>
      <div className="engine-scheme-grid">{engineSchemes.map(s => <article key={s.id} className="engine-scheme"><div className="engine-scheme-head"><h3>{ROLE[s.slug]?.title || s.name}</h3><RiskBadge score={s.riskScore} band={band(s.riskScore)} /></div><span className="scheme-cat">{s.name} · {s.indicativeRatePct}% indicative{s.shariahCompliant ? ' · Shariah-compliant' : ''}</span><p>{ROLE[s.slug]?.body || ABOUT[s.category]}</p><div className="engine-growth">Est. 1-year growth on Rs 100,000 → <b>{money(Math.round((100000 + profitProjection(100000, s.indicativeRatePct, 365)) * 100))}</b></div><div className="engine-scheme-foot"><span>{s.liquidityDays}d liquidity</span><a href={s.sourceUrl} target="_blank" rel="noreferrer">Dated source <ExternalLink /></a></div></article>)}{!engineSchemes.length && <p className="scheme-empty">Loading earning schemes…</p>}</div>
    </section>}

    {tab === 'market' && <>
      <div className="market-rules subtle"><TrendingUp /><div><b>Optional &amp; advanced.</b><p>These are the market schemes a host can choose to invest a slice of the pool into (the "Advanced" option when creating a circle). They carry real market risk — unlike the halal earning engine, they are a deliberate choice.</p></div></div>
      <section className="terminal-filter"><Filter /><span>Maximum accepted risk</span><input type="range" min="1" max="10" step="1" value={maxRisk} onChange={e => setMaxRisk(+e.target.value)} /><b>{maxRisk}/10 · {band(maxRisk)}</b></section>
      <div className="terminal-layout">
        <aside className="scheme-list">
          <div className="scheme-toolbar">
            <div className="scheme-sort"><button className={sortBy === 'return' ? 'on' : ''} onClick={() => setSortBy('return')}>Highest return</button><button className={sortBy === 'risk' ? 'on' : ''} onClick={() => setSortBy('risk')}>Lowest risk</button></div>
            <div className="scheme-bands">{(['ALL', 'LOW', 'MEDIUM', 'HIGH'] as const).map(b => <button key={b} className={bandFilter === b ? 'on' : ''} onClick={() => setBandFilter(b)}>{b === 'ALL' ? 'All' : b.charAt(0) + b.slice(1).toLowerCase()}</button>)}</div>
          </div>
          <div className="scheme-scroll">{list.length ? list.map(item => <button key={item.id} className={scheme?.id === item.id ? 'selected' : ''} onClick={() => { if (item.category === 'Digital Asset' && !cryptoOk) setPending(item); else setSelected(item.id); }}><div><b>{item.name}</b><RiskBadge score={item.riskScore} band={band(item.riskScore)} /></div><p>{item.indicativeRatePct}% indicative · {item.issuer}</p><span>{item.liquidityDays}d liquidity · {item.shariahCompliant ? 'Shariah-compliant · ' : ''}{rateFreshness(item.rateAsOf).stale ? '⚠ rate review due · ' : ''}{new Date(item.rateAsOf).toLocaleDateString()}</span></button>) : <p className="scheme-empty">No schemes in this band under your risk ceiling. Raise the maximum accepted risk above, or pick another band.</p>}</div>
        </aside>
        <section className="terminal-card">
          {scheme && <div className="scheme-about">
            <div className="scheme-about-head"><h2>{scheme.name}</h2><RiskBadge score={scheme.riskScore} band={band(scheme.riskScore)} />{scheme.shariahCompliant && <span className="chip-halal">Shariah-compliant</span>}</div>
            <span className="scheme-cat">{scheme.category} · {scheme.indicativeRatePct}% indicative · {scheme.issuer}</span>
            {scheme.category === 'Digital Asset' && <div className="crypto-warn">⚠ HIGH RISK · not government-backed · extremely volatile — you could lose most of your capital. Halqa never invests committee money here.</div>}
            <p>{ABOUT[scheme.category] || scheme.eligibilityNotes || 'A curated investment sleeve available to Halqa circles.'}</p>
          </div>}
          <Controls principal={principal} setPrincipal={setPrincipal} allocation={allocation} setAllocation={setAllocation} months={months} setMonths={setMonths} />
          <div className="projection-kpis"><div><span>Invested principal</span><strong>{money(invested * 100)}</strong></div><div><span>Indicative gross profit</span><strong>{money(Math.round(expected * 100))}</strong></div><div><span>Indicative maturity</span><strong>{money(Math.round((invested + expected) * 100))}</strong></div></div>
          <Suspense fallback={<div className="chart-skeleton" />}><ProjectionChart principal={invested} rate={scheme?.indicativeRatePct || 0} months={months} /></Suspense>
          <div className="source-strip"><p>Scenario bands are stress estimates. Rate, liquidity, tax and fees can change.{scheme && <> <RateStamp rateAsOf={scheme.rateAsOf} /></>}</p>{scheme && <a href={scheme.sourceUrl} target="_blank" rel="noreferrer">Dated source <ExternalLink /></a>}</div>
        </section>
      </div>
    </>}

    {pending && <div className="modal-backdrop" role="dialog" aria-label="High-risk confirmation"><section className="modal"><div className="modal-head"><h2>⚠ Extreme-risk asset</h2></div><div className="crypto-warn big"><b>{pending.name}</b> is cryptocurrency — <b>not government-backed</b> and <b>extremely volatile</b>. Its value can fall 50% or more very quickly, and the indicative rate is speculative, not a promise. You could lose most or all of the money. Halqa will <b>never</b> put a committee's savings into this — it is shown for information only.</div><p className="muted" style={{ fontSize: 12 }}>Only continue if you understand you could lose it all.</p><div className="form-actions"><button className="secondary" onClick={() => setPending(null)}>No, take me back</button><button className="danger-button" onClick={() => { setCryptoOk(true); setSelected(pending.id); setPending(null); }}>I understand the risk — show it</button></div></section></div>}
  </div>;
}
function Controls({ principal, setPrincipal, allocation, setAllocation, months, setMonths }: { principal: number; setPrincipal: (v: number) => void; allocation: number; setAllocation: (v: number) => void; months: number; setMonths: (v: number) => void }) { return <div className="terminal-controls"><Field label="Circle pool (PKR)"><input className="field" type="number" min="1000" step="1000" value={principal} onChange={e => setPrincipal(+e.target.value)} /></Field><Field label="Allocation %"><input className="field" type="number" min="0" max="100" step="1" value={allocation} onChange={e => setAllocation(Math.max(0, Math.min(100, +e.target.value)))} /></Field><Field label="Holding period"><select className="field" value={months} onChange={e => setMonths(+e.target.value)}><option value="1">1 month</option><option value="3">3 months</option><option value="6">6 months</option><option value="12">12 months</option><option value="24">24 months</option><option value="36">36 months</option></select></Field></div>; }
