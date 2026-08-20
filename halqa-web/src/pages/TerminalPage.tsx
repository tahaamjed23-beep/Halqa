import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { ExternalLink, Filter, Info, Sparkles, TrendingUp } from 'lucide-react';
import { api } from '../api';
import { date, money } from '../lib/format';
import type { Scheme } from '../types';
import { Field, profitProjection, RateStamp, rateFreshness } from '../components/ui';
import { RiskBadge } from '../components/RiskConsole';
import {
  Blank, Card, Chips, Facts, FlowHeader, Notice, Row, RowGroup, Segment,
} from '../components/wallet';

const ProjectionChart = lazy(() => import('../components/ProjectionChart'));
const band = (score: number) => score <= 3 ? 'LOW' : score <= 6 ? 'MEDIUM' : score <= 8 ? 'HIGH' : 'EXTREME';

// ---------------------------------------------------------------------------
// WHERE IDLE MONEY IS RECORDED TO SIT
//
// Two tabs. The engine sleeves, which earn for a member without any decision
// from them, and the market schemes a host can optionally put a slice of the
// pool into.
//
// CRYPTO IS GONE from this screen. It used to be listed under Digital Asset
// behind an extreme-risk confirmation dialog. The sleeve was removed from the
// vault weeks ago for the reason that dialog spelled out, so leaving the
// listing here, with its warning and its consent gate, was advertising a thing
// Halqa had already decided not to offer. Gold-linked went the same way: it is
// filtered out rather than merely hidden, so a scheme the API still serves
// cannot reappear.
// ---------------------------------------------------------------------------

const ENGINE_SLUGS = [
  'islamic-money-market-fund-basket',
  'islamic-mudarabah-deposit-basket',
  'islamic-income-fund-basket',
];

/** Categories Halqa does not offer, whatever the schemes endpoint returns. */
const DROPPED_CATEGORIES = ['Digital Asset', 'Commodity'];
const DROPPED_SLUGS = ['gold-linked-allocation'];

const ROLE: Record<string, { title: string; body: string }> = {
  'islamic-money-market-fund-basket': {
    title: 'The float sweep',
    body: "Every day your committee's pool sits idle between a payment and a payout, it earns here on an Islamic money market sleeve. This is where the Earn engines get their profit, automatically, with no decision from you. It is also the vault's Standard sleeve.",
  },
  'islamic-mudarabah-deposit-basket': {
    title: 'Deposit yield, Mudarabah',
    body: 'Your security deposit is not dead money. Across the cycle it earns here at the Islamic Mudarabah rate. On Earn the yield is yours; on Earn and Share it is pooled towards the members who waited longest.',
  },
  'islamic-income-fund-basket': {
    title: 'The vault Income sleeve',
    body: 'A higher-yielding halal sleeve. Park a payout or top up any amount and it earns here, a little more than the money market sleeve, with a little more movement.',
  },
};

const ABOUT: Record<string, string> = {
  'Government Security': 'A loan to the Government of Pakistan, Treasury Bills and Investment Bonds. About the safest and most liquid place to put money: steady returns and near zero chance of default.',
  'Sovereign Sukuk': 'Government issued Islamic bonds. Instead of paying interest they share the return from real underlying assets, a fully Shariah compliant way to hold safe sovereign exposure.',
  'National Savings': 'Government retail savings certificates, Behbood and Defence and Special Savings. Very safe, fixed term, backed directly by the state.',
  'Mutual Fund': 'A professionally managed basket of instruments. Money market funds are the calmest; income, asset allocation and balanced funds reach for more return and, with it, more movement.',
  'Corporate Debt': 'Islamic bonds, sukuk, issued by companies rather than the government. Higher yield than sovereign paper in exchange for more credit risk.',
  'Bank Deposit': 'A fixed deposit with a bank. The Islamic version uses Mudarabah: the bank shares real profit with you instead of paying interest.',
  'Equity ETF': 'Ownership of a basket of listed companies, traded on the exchange. The highest potential return and the biggest swings, best for money you can leave for years.',
  'Equity Fund': 'A managed fund of company shares, Shariah screened where marked. High growth potential and high volatility.',
  'REIT': 'A property trust. You earn from real estate rents and rising value without buying a building yourself.',
  'Private Credit': 'Lending to vetted businesses, for example against their unpaid invoices. Higher yield, higher risk, and your money is less quickly accessible.',
  'Islamic Finance': 'Short term Islamic trade finance, Murabaha, financing real goods and trade rather than lending cash at interest.',
  'Microfinance': 'Deposits with licensed microfinance institutions that lend on to small entrepreneurs. Curated, and higher risk.',
  'Multi-Asset': 'A blended, currency hedged mix across several asset classes, for spreading risk.',
};

export default function TerminalPage({ back }: { back?: () => void }) {
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [selected, setSelected] = useState('');
  const [principal, setPrincipal] = useState(100000);
  const [allocation, setAllocation] = useState(25);
  const [months, setMonths] = useState(12);
  const [maxRisk, setMaxRisk] = useState(8);
  const [sortBy, setSortBy] = useState<'return' | 'risk'>('return');
  const [bandFilter, setBandFilter] = useState<'ALL' | 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME'>('ALL');
  const [tab, setTab] = useState<'engine' | 'market'>('engine');
  const [error, setError] = useState('');

  useEffect(() => {
    void api<Scheme[]>('/schemes')
      .then(rows => setSchemes(rows.filter(s =>
        !DROPPED_CATEGORIES.includes(s.category) && !DROPPED_SLUGS.includes(s.slug))))
      .catch(reason => setError(reason.message));
  }, []);

  const engineSchemes = ENGINE_SLUGS.map(slug => schemes.find(s => s.slug === slug)).filter((s): s is Scheme => !!s);
  const market = schemes.filter(s => !ENGINE_SLUGS.includes(s.slug));
  const visible = market.filter(item => item.riskScore <= maxRisk);
  const list = [...visible]
    .filter(item => bandFilter === 'ALL' || band(item.riskScore) === bandFilter)
    .sort((a, b) => sortBy === 'return' ? b.indicativeRatePct - a.indicativeRatePct : a.riskScore - b.riskScore);
  const scheme = list.find(item => item.id === selected) || list[0] || visible[0];
  const invested = principal * allocation / 100;
  const expected = useMemo(
    () => profitProjection(invested, scheme?.indicativeRatePct || 0, months * 30.4375),
    [invested, scheme, months]);

  return (
    <div className="w-screen">
      <FlowHeader title="Where money sits" onBack={back} />
      <Segment value={tab} onChange={setTab} options={[
        { id: 'engine', label: 'Earns for you' },
        { id: 'market', label: 'Market schemes' },
      ]} />

      <div className="w-screen-body">
        {error && <div className="w-inset"><Notice kind="bad" icon={<Info />}>{error}</Notice></div>}

        {tab === 'engine' && (
          <>
            <div className="w-inset">
              <Notice kind="ok" icon={<Sparkles />}>
                Idle pool days, deposits and parked payouts earn here on their own.
              </Notice>
            </div>
            {engineSchemes.length ? engineSchemes.map(s => (
              <Card key={s.id} title={ROLE[s.slug]?.title || s.name}
                    action={<RiskBadge score={s.riskScore} band={band(s.riskScore)} />}>
                <p className="w-body">{ROLE[s.slug]?.body || ABOUT[s.category]}</p>
                <Facts cols={3} items={[
                  ['Indicative', s.indicativeRatePct + '%'],
                  ['Out in', s.liquidityDays + ' days'],
                  ['A year on Rs 100,000', money(Math.round((100000 + profitProjection(100000, s.indicativeRatePct, 365)) * 100))],
                ]} />
                <div className="term-source">
                  <RateStamp rateAsOf={s.rateAsOf} />
                  <a href={s.sourceUrl} target="_blank" rel="noreferrer">Dated source <ExternalLink /></a>
                </div>
              </Card>
            )) : <Blank icon={<Sparkles />} title="Loading the sleeves" />}
          </>
        )}

        {tab === 'market' && (
          <>
            <div className="w-inset">
              <Notice kind="warn" icon={<TrendingUp />}>
                Optional. A host may put a slice of the pool here. Real market risk.
              </Notice>
            </div>

            <Card title="Risk you will accept"
                  action={<b className="term-risk">{maxRisk}/10 · {band(maxRisk)}</b>}>
              <div className="term-slider">
                <Filter />
                <input type="range" min="1" max="10" step="1" value={maxRisk}
                       onChange={e => setMaxRisk(+e.target.value)} />
              </div>
              <div className="term-filters">
                <Chips value={sortBy} onChange={setSortBy} options={[
                  { id: 'return', label: 'Highest return' },
                  { id: 'risk', label: 'Lowest risk' },
                ]} />
                <Chips value={bandFilter} onChange={setBandFilter} options={[
                  { id: 'ALL', label: 'All' },
                  { id: 'LOW', label: 'Low' },
                  { id: 'MEDIUM', label: 'Medium' },
                  { id: 'HIGH', label: 'High' },
                ]} />
              </div>
            </Card>

            {list.length ? (
              <RowGroup title={list.length + ' scheme' + (list.length === 1 ? '' : 's')}>
                {list.map(item => (
                  <Row key={item.id} title={item.name}
                       sub={item.issuer + ' · out in ' + item.liquidityDays + ' days'
                         + (item.shariahCompliant ? ' · Shariah compliant' : '')
                         + (rateFreshness(item.rateAsOf).stale ? ' · rate review due' : ' · ' + date(item.rateAsOf))}
                       value={item.indicativeRatePct + '%'}
                       valueSub={band(item.riskScore).toLowerCase() + ' risk'}
                       tone={item.riskScore <= 3 ? 'ok' : item.riskScore <= 6 ? undefined : 'warn'}
                       onClick={() => setSelected(item.id)} />
                ))}
              </RowGroup>
            ) : (
              <Blank icon={<Filter />} title="Nothing in this band"
                     sub="Raise the ceiling, or change band." />
            )}

            {scheme && (
              <Card title={scheme.name}
                    action={<RiskBadge score={scheme.riskScore} band={band(scheme.riskScore)} />}>
                <p className="w-body">
                  {ABOUT[scheme.category] || scheme.eligibilityNotes
                    || 'A curated investment sleeve available to Halqa circles.'}
                </p>
                <Controls principal={principal} setPrincipal={setPrincipal}
                          allocation={allocation} setAllocation={setAllocation}
                          months={months} setMonths={setMonths} />
                <Facts cols={3} items={[
                  ['You put in', money(invested * 100)],
                  ['Indicative profit', money(Math.round(expected * 100))],
                  ['At maturity', money(Math.round((invested + expected) * 100))],
                ]} />
                <Suspense fallback={<div className="chart-skeleton" />}>
                  <ProjectionChart principal={invested} rate={scheme?.indicativeRatePct || 0} months={months} />
                </Suspense>
                <div className="term-source">
                  <RateStamp rateAsOf={scheme.rateAsOf} />
                  <a href={scheme.sourceUrl} target="_blank" rel="noreferrer">Dated source <ExternalLink /></a>
                </div>
                <p className="w-foot">
                  Scenario bands are stress estimates. Rate, liquidity, tax and fees can all change.
                </p>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function Controls({ principal, setPrincipal, allocation, setAllocation, months, setMonths }:
  { principal: number; setPrincipal: (v: number) => void; allocation: number; setAllocation: (v: number) => void; months: number; setMonths: (v: number) => void }) {
  return (
    <div className="term-controls">
      <Field label="Circle pool, rupees">
        <input inputMode="numeric" value={principal}
               onChange={e => setPrincipal(Number(e.target.value.replace(/\D/g, '')) || 0)} />
      </Field>
      <Field label="Share of the pool, per cent">
        <input inputMode="numeric" value={allocation}
               onChange={e => setAllocation(Math.max(0, Math.min(100, Number(e.target.value.replace(/\D/g, '')) || 0)))} />
      </Field>
      <Field label="Held for">
        <select value={months} onChange={e => setMonths(+e.target.value)}>
          <option value="1">1 month</option>
          <option value="3">3 months</option>
          <option value="6">6 months</option>
          <option value="12">12 months</option>
          <option value="24">24 months</option>
          <option value="36">36 months</option>
        </select>
      </Field>
    </div>
  );
}
