import { useCallback, useEffect, useMemo, useState } from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import {
  ArrowDownToLine, ArrowUpFromLine, Info, Landmark, Minus, Plus,
  Scale, ShieldCheck, SlidersHorizontal,
} from 'lucide-react';
import { api, key } from '../api';
import { date, money } from '../lib/format';
import { emitHalqaAction } from '../lib/events';
import {
  AmountEntry, BottomBar, Card, Facts, Field, FlowTitle, Notice,
  Row, RowGroup, Segment, Sheet,
} from '../components/wallet';

// ---------------------------------------------------------------------------
// THE VAULT
//
// Where a payout can sit and earn instead of being spent the day it lands, and
// where a missed instalment is paid from before it becomes a default. Two
// sleeves, both halal: Standard, a short-term Islamic money market, and Income,
// which aims a little higher and moves a little more.
//
// The screen leads with the balance and the two things a member does to it,
// add and take out, because that is what a member came here for. The sleeve
// mix, the projection and the risk model are behind tabs, not stacked on top
// of the balance in five long panels.
//
// Every figure is indicative and computed from each sleeve's own dated rate.
// None of them is a guarantee, and the screen says so where it matters rather
// than once at the bottom.
// ---------------------------------------------------------------------------

type TierDetail = { tier: string; sharePct: number; name: string; ratePct: number; rateAsOf: string | null; shariahCompliant: boolean; riskScore: number; volatilityBps: number; liquidityDays: number; issuer: string; sourceUrl: string };
type VaultX = { enabled: boolean; tier: string; tiers: string[]; autoCover: boolean; balancePaisa: string; accruedProfitPaisa: string; ratePct: number; allocation: Record<string, number> | null; tierDetails: TierDetail[]; blendedRatePct: number; blendedRiskScore: number; mudaribFeePct: number; custodyStage: string };

const TIER_LABEL: Record<string, string> = { STANDARD: 'Standard', INCOME: 'Income' };
const TIER_WHAT: Record<string, string> = {
  STANDARD: 'Short-term Islamic money market. The calmest of the two.',
  INCOME: 'Islamic income fund. Aims a little higher and moves a little more.',
};
// Honest asymmetric projection bands per sleeve, from each sleeve's own record.
const BAND: Record<string, { low: number; high: number }> = {
  STANDARD: { low: 0.8, high: 1.15 },
  INCOME: { low: 0.7, high: 1.25 },
};
const riskWord = (s: number) => s <= 3 ? 'Low' : s <= 6 ? 'Medium' : s <= 8 ? 'High' : 'Very high';

export default function VaultPage() {
  const [vault, setVault] = useState<VaultX | null>(null);
  const [tab, setTab] = useState<'balance' | 'sleeves' | 'growth'>('balance');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [swept, setSwept] = useState<{ principalPaisa: string; profitPaisa: string } | null>(null);
  const [topSheet, setTopSheet] = useState(false);
  const [outSheet, setOutSheet] = useState(false);
  const [topup, setTopup] = useState('5000');
  const [shares, setShares] = useState<Record<string, number>>({ STANDARD: 100, INCOME: 0 });
  const [horizonY, setHorizonY] = useState(3);
  const [monthly, setMonthly] = useState(0);

  const load = useCallback(() => api<VaultX>('/vault').then(v => {
    setVault(v);
    const base: Record<string, number> = { STANDARD: 0, INCOME: 0 };
    if (v.allocation) setShares({ ...base, ...v.allocation });
    else setShares({ ...base, [v.tier]: 100 });
  }).catch(() => setVault(null)), []);
  useEffect(() => { void load() }, [load]);

  const call = async (fn: () => Promise<unknown>) => {
    setBusy(true); setError('');
    try { await fn(); await load() }
    catch (reason) { setError((reason as Error).message) }
    finally { setBusy(false) }
  };

  const sum = Object.values(shares).reduce((a, b) => a + b, 0);
  const details = vault?.tierDetails ?? [];
  const byTier = useMemo(() => Object.fromEntries(details.map(d => [d.tier, d])), [details]);

  const preview = useMemo(() => {
    let rate = 0, risk = 0, low = 0, high = 0;
    for (const [tier, pct] of Object.entries(shares)) {
      const d = byTier[tier]; if (!d || !pct) continue;
      const b = BAND[tier] ?? { low: 0.7, high: 1.2 };
      rate += d.ratePct * pct / 100;
      risk += d.riskScore * pct / 100;
      low += d.ratePct * b.low * pct / 100;
      high += d.ratePct * b.high * pct / 100;
    }
    return { rate, risk, low, high };
  }, [shares, byTier]);

  const balanceRs = vault ? Number(BigInt(vault.balancePaisa) / 100n) : 0;
  const seedRs = balanceRs > 0 ? balanceRs : 10000;
  const projection = useMemo(() => {
    const months = horizonY * 12; const rows = [];
    let mid = seedRs, lo = seedRs, hi = seedRs;
    for (let m = 1; m <= months; m++) {
      mid = mid * (1 + preview.rate / 1200) + monthly;
      lo = Math.max(0, lo * (1 + preview.low / 1200) + monthly);
      hi = hi * (1 + preview.high / 1200) + monthly;
      if (m % 3 === 0) rows.push({
        label: m % 12 === 0 ? 'Y' + m / 12 : m + 'm',
        Expected: Math.round(mid), Conservative: Math.round(lo), Optimistic: Math.round(hi),
      });
    }
    return rows;
  }, [seedRs, monthly, horizonY, preview]);

  const saveAllocation = () => call(() =>
    api('/vault/allocation', { method: 'POST', body: JSON.stringify({ allocation: shares }) }));

  if (!vault) {
    return <div className="w-screen"><FlowTitle title="Your vault" sub="Loading" /></div>;
  }

  const topupP = Math.round(Number(topup || 0) * 100);

  return (
    <div className="w-screen">
      {/* The balance, and the two things anybody came here to do. */}
      <div className="vault-band">
        <span>Recorded balance</span>
        <b>{money(vault.balancePaisa)}</b>
        <small>{money(vault.accruedProfitPaisa)} earned so far · {vault.blendedRatePct.toFixed(2)}% a year blended</small>
        <div className="vault-band-acts">
          <button onClick={() => setTopSheet(true)}><ArrowDownToLine />Add money</button>
          <button disabled={BigInt(vault.balancePaisa) <= 0n} onClick={() => setOutSheet(true)}>
            <ArrowUpFromLine />Take out
          </button>
        </div>
      </div>

      <Segment value={tab} onChange={setTab} options={[
        { id: 'balance', label: 'Balance' },
        { id: 'sleeves', label: 'Sleeves' },
        { id: 'growth', label: 'Growth' },
      ]} />

      <div className="w-screen-body">
        {error && <div className="w-inset"><Notice kind="bad" icon={<Info />}>{error}</Notice></div>}
        {swept && (
          <div className="w-inset">
            <Notice kind="ok" icon={<ShieldCheck />}>
              {money(swept.principalPaisa)} principal and {money(swept.profitPaisa)} profit sent to
              your account.
            </Notice>
          </div>
        )}

        {tab === 'balance' && (
          <>
            <Card>
              <Facts cols={2} items={[
                ['Earned so far', money(vault.accruedProfitPaisa)],
                ['Blended risk', vault.blendedRiskScore.toFixed(1) + '/10, ' + riskWord(vault.blendedRiskScore).toLowerCase()],
              ]} />
              <Notice kind="ok" icon={<ShieldCheck />}>
                A missed instalment is paid from this balance, so it never becomes a default on
                your record.
              </Notice>
            </Card>

            <RowGroup title="What the vault does on its own">
              <Row chevron={false} icon={<ArrowDownToLine />} title="Park my payouts here"
                   sub="New payouts land in the vault instead of releasing straight out"
                   value={vault.enabled ? 'On' : 'Off'} tone={vault.enabled ? 'ok' : undefined}
                   onClick={() => call(() => api('/vault/toggle', { method: 'POST', body: JSON.stringify({ enabled: !vault.enabled }) }))} />
              <Row chevron={false} icon={<ShieldCheck />} title="Cover a missed instalment"
                   sub="If one slips and the balance covers it, it is settled from here"
                   value={vault.autoCover ? 'On' : 'Off'} tone={vault.autoCover ? 'ok' : undefined}
                   onClick={() => call(() => api('/vault/auto-cover', { method: 'POST', body: JSON.stringify({ enabled: !vault.autoCover }) }))} />
            </RowGroup>

            {/* Where the money really is. Short, and honest about the stage. */}
            <RowGroup title="Where the money really is">
              {details.map(d => (
                <Row key={d.tier} chevron={false} icon={<Landmark />}
                     title={TIER_LABEL[d.tier] + ' · ' + d.sharePct + '%'}
                     sub={d.name + (d.issuer ? ' · ' + d.issuer : '') + (d.rateAsOf ? ' · rate as of ' + date(d.rateAsOf) : '')}
                     value={d.ratePct + '%'} valueSub="a year" />
              ))}
            </RowGroup>
            <p className="w-foot">
              Halqa records your balance today. It does not hold or invest it. Once the licence and
              the trustee are in place the same screen shows cash held in your own name and fund
              units held at the asset manager, with this ledger reconciling to theirs line by line.
            </p>
          </>
        )}

        {tab === 'sleeves' && (
          <>
            <Card title="Split it how you like">
              {details.map(d => (
                <div key={d.tier} className="vault-slice">
                  <div className="vault-slice-head">
                    <div>
                      <b>{TIER_LABEL[d.tier]}</b>
                      <small>{d.ratePct}% a year indicative · risk {d.riskScore}/10 · out in about {d.liquidityDays} day{d.liquidityDays === 1 ? '' : 's'}</small>
                    </div>
                    <span className="vault-slice-pct">{shares[d.tier] ?? 0}%</span>
                  </div>
                  <input className="allocation-slider" type="range" min="0" max="100" step="5"
                         value={shares[d.tier] ?? 0}
                         onChange={e => setShares({ ...shares, [d.tier]: +e.target.value })} />
                  <p className="vault-slice-note">{TIER_WHAT[d.tier]}</p>
                </div>
              ))}
              <Facts cols={3} items={[
                ['Total', sum + '%'],
                ['Blended yield', preview.rate.toFixed(2) + '%'],
                ['Blended risk', preview.risk.toFixed(1) + '/10'],
              ]} />
              {sum !== 100 && (
                <Notice kind="warn" icon={<SlidersHorizontal />}>
                  The two have to add up to 100. Yours comes to {sum}.
                </Notice>
              )}
            </Card>

            <Card title="What can go wrong">
              {details.map(d => (
                <div key={d.tier} className="vault-risk">
                  <div><b>{TIER_LABEL[d.tier]}</b>
                    <small>{riskWord(d.riskScore)} · swings about {(d.volatilityBps / 100).toFixed(1)}% a year</small></div>
                  <i><em style={{ width: d.riskScore * 10 + '%' }} /></i>
                </div>
              ))}
              <Notice kind="info" icon={<Scale />}>
                Both sleeves are halal. The risk is the yield drifting lower, not the principal
                disappearing. When you take money out, {vault.mudaribFeePct}% of the profit, never
                the principal, is Halqa's share.
              </Notice>
            </Card>

            <div className="w-inset">
              <button className="primary full" disabled={busy || sum !== 100} onClick={saveAllocation}>
                Save this split
              </button>
            </div>
          </>
        )}

        {tab === 'growth' && (
          <>
            <Card title="If nothing changes">
              <div className="w-pair-plain">
                <Field label="Over how long">
                  <select value={horizonY} onChange={e => setHorizonY(+e.target.value)}>
                    <option value="1">1 year</option>
                    <option value="3">3 years</option>
                    <option value="5">5 years</option>
                  </select>
                </Field>
                <Field label="Adding each month">
                  <input inputMode="numeric" value={monthly || ''} placeholder="0"
                         onChange={e => setMonthly(Math.max(0, Number(e.target.value.replace(/\D/g, '')) || 0))} />
                </Field>
              </div>
              <div className="vault-chart">
                <ResponsiveContainer>
                  <AreaChart data={projection} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeOpacity={0.18} vertical={false} />
                    <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} width={54}
                           tickFormatter={(v: number) => v >= 1000000 ? (v / 1000000).toFixed(1) + 'M' : v >= 1000 ? Math.round(v / 1000) + 'k' : String(v)} />
                    <Tooltip formatter={(v: number | string) => money(Math.round(Number(v)) * 100)} />
                    <Area type="monotone" dataKey="Optimistic" stroke="#A9E76A" fill="#A9E76A" fillOpacity={0.14} strokeWidth={1.5} />
                    <Area type="monotone" dataKey="Expected" stroke="#41801A" fill="#41801A" fillOpacity={0.2} strokeWidth={2.5} />
                    <Area type="monotone" dataKey="Conservative" stroke="#E08A00" fill="#fff" fillOpacity={0.35} strokeWidth={1.5} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <Facts cols={3} items={[
                ['Expected', money((projection.at(-1)?.Expected ?? 0) * 100)],
                ['If it goes badly', money((projection.at(-1)?.Conservative ?? 0) * 100)],
                ['If it goes well', money((projection.at(-1)?.Optimistic ?? 0) * 100)],
              ]} />
              <Notice kind="info" icon={<Info />}>
                Estimates at today's rates, not promises. Rates reset with the market.
              </Notice>
            </Card>
          </>
        )}
      </div>

      {topSheet && (
        <Sheet title="Add money to the vault" onClose={() => setTopSheet(false)}>
          <AmountEntry value={topup} onChange={setTopup} hint="From Rs 100. It earns from today." />
          <div className="w-inset">
            <div className="w-chips">
              {[1000, 5000, 10000, 25000].map(v => (
                <button key={v} className={topup === String(v) ? 'on' : ''} onClick={() => setTopup(String(v))}>
                  {money(v * 100)}
                </button>
              ))}
            </div>
          </div>
          <BottomBar>
            <button className="primary full" disabled={busy || topupP < 10_000}
                    onClick={() => { setTopSheet(false); void call(async () => {
                      await api('/vault/deposit', { method: 'POST', body: JSON.stringify({ amountPaisa: String(topupP), idempotencyKey: key() }) });
                      emitHalqaAction('VAULT_DEPOSIT');
                    }) }}>
              <Plus /> Add {money(topupP)}
            </button>
          </BottomBar>
        </Sheet>
      )}

      {outSheet && (
        <Sheet title="Take your money out" onClose={() => setOutSheet(false)}>
          <div className="w-inset" style={{ paddingTop: 12 }}>
            <Facts cols={2} items={[
              ['Principal', money(vault.balancePaisa)],
              ['Profit earned', money(vault.accruedProfitPaisa)],
            ]} />
            <Notice kind="info" icon={<Info />}>
              Everything goes back to your linked account. {vault.mudaribFeePct}% of the profit,
              never the principal, is Halqa's share.
            </Notice>
          </div>
          <BottomBar>
            <button className="primary full" disabled={busy}
                    onClick={() => { setOutSheet(false); void call(async () => {
                      setSwept(await api<{ principalPaisa: string; profitPaisa: string }>('/vault/withdraw', { method: 'POST', body: JSON.stringify({ idempotencyKey: key() }) }));
                      emitHalqaAction('VAULT_SWEEP');
                    }) }}>
              <Minus /> Take it all out
            </button>
          </BottomBar>
        </Sheet>
      )}
    </div>
  );
}
