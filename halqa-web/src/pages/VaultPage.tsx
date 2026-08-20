import { useCallback, useEffect, useMemo, useState } from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import {
  ArrowDownToLine, ArrowUpFromLine, Check, Info, Landmark, PiggyBank,
  Scale, ShieldCheck, SlidersHorizontal, Target, TrendingUp, Wallet,
} from 'lucide-react';
import { api, key } from '../api';
import { date, dateShort, money } from '../lib/format';
import { emitHalqaAction } from '../lib/events';
import {
  AmountEntry, Blank, BottomBar, Card, Chips, Facts, Field, FlowHeader,
  Notice, Row, RowGroup, Segment, Sheet, Tile, TileGrid,
} from '../components/wallet';

// ---------------------------------------------------------------------------
// THE VAULT
//
// Where a payout can sit and earn instead of being spent the day it lands, and
// where a missed instalment is paid from before it becomes a default.
//
// The screen leads with the balance, the goal it is heading towards, and the
// four things a member does: add, take out, set a target, and turn the
// automatic behaviour on or off. Under that is the money's own history, which
// this screen did not have at all: a balance with no ledger behind it is a
// number nobody can check.
//
// The sleeve mix, the projection and the risk model sit behind tabs. Two
// sleeves, both halal: Standard, a short-term Islamic money market, and Income,
// which aims higher and moves more. Every figure is indicative, computed from
// each sleeve's own dated rate, and the screen says so where it matters.
// ---------------------------------------------------------------------------

type TierDetail = { tier: string; sharePct: number; name: string; ratePct: number; rateAsOf: string | null; shariahCompliant: boolean; riskScore: number; volatilityBps: number; liquidityDays: number; issuer: string; sourceUrl: string };
type HistoryRow = { id: string; at: string; direction: 'IN' | 'OUT'; amountPaisa: string; reason: string; earnedPaisa: string; daysHeld: number };
type Goal = { targetPaisa: string; name: string } | null;
type VaultX = {
  enabled: boolean; tier: string; tiers: string[]; autoCover: boolean;
  balancePaisa: string; accruedProfitPaisa: string; ratePct: number;
  allocation: Record<string, number> | null; tierDetails: TierDetail[];
  blendedRatePct: number; blendedRiskScore: number; mudaribFeePct: number;
  custodyStage: string; history: HistoryRow[]; goal: Goal;
};

const TIER_LABEL: Record<string, string> = { STANDARD: 'Standard', INCOME: 'Income' };
const TIER_WHAT: Record<string, string> = {
  STANDARD: 'A short-term Islamic money market. The calmest of the two.',
  INCOME: 'An Islamic income fund. Aims higher, and moves a little more.',
};
// Honest asymmetric projection bands, from each sleeve's own record.
const BAND: Record<string, { low: number; high: number }> = {
  STANDARD: { low: 0.8, high: 1.15 },
  INCOME: { low: 0.7, high: 1.25 },
};
const riskWord = (s: number) => s <= 3 ? 'Low' : s <= 6 ? 'Medium' : s <= 8 ? 'High' : 'Very high';

/** What each ledger line actually was, in words a member would use. */
const REASON: Record<string, string> = {
  VAULT_TOPUP_RECORDED: 'You added money',
  VAULT_PARKING_RECORDED: 'A payout parked here',
  VAULT_SWEEP_PRINCIPAL_RECORDED: 'You took money out',
  VAULT_PARKING_PROFIT_SIMULATED: 'Profit paid to you',
  VAULT_MUDARIB_FEE_5_PERCENT: "Halqa's share of the profit",
  VAULT_REMAINDER_REPARKED: 'The rest went back in',
  VAULT_AUTO_COVER: 'Covered a missed instalment',
};

export default function VaultPage() {
  const [vault, setVault] = useState<VaultX | null>(null);
  const [tab, setTab] = useState<'money' | 'sleeves' | 'growth'>('money');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState('');
  const [sheet, setSheet] = useState<'' | 'add' | 'out' | 'goal'>('');
  const [topup, setTopup] = useState('5000');
  const [takeout, setTakeout] = useState('');
  const [goalAmount, setGoalAmount] = useState('');
  const [goalName, setGoalName] = useState('');
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

  const call = async (fn: () => Promise<unknown>, message = '') => {
    setBusy(true); setError(''); setDone('');
    try { await fn(); await load(); if (message) setDone(message) }
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

  const balanceP = Number(vault?.balancePaisa || 0);
  const seedRs = balanceP > 0 ? balanceP / 100 : 10000;
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

  if (!vault) {
    return (
      <div className="w-screen">
        <FlowHeader title="Your vault" />
        <Blank icon={<PiggyBank />} title="Opening your vault" />
      </div>
    );
  }

  const goalTarget = Number(vault.goal?.targetPaisa || 0);
  const goalPct = goalTarget > 0 ? Math.min(100, Math.round(balanceP / goalTarget * 100)) : 0;
  const topupP = Math.round(Number(topup || 0) * 100);
  const takeoutP = Math.round(Number(takeout || 0) * 100);
  const thisMonth = vault.history
    .filter(h => h.direction === 'IN' && new Date(h.at).getMonth() === new Date().getMonth())
    .reduce((s, h) => s + Number(h.amountPaisa), 0);

  return (
    <div className="w-screen">
      {/* The balance, the goal it is heading for, and nothing else competing. */}
      <div className="vault-band">
        <span>Recorded balance</span>
        <b>{money(vault.balancePaisa)}</b>
        <small>
          {money(vault.accruedProfitPaisa)} earned · {vault.blendedRatePct.toFixed(2)}% a year
        </small>

        {vault.goal ? (
          <div className="vault-goal">
            <div><span>{vault.goal.name}</span><span>{goalPct}% of {money(goalTarget)}</span></div>
            <i><em style={{ width: goalPct + '%' }} /></i>
          </div>
        ) : (
          <button className="vault-goal-cta" onClick={() => setSheet('goal')}>
            <Target /> Set what you are saving for
          </button>
        )}
      </div>

      {/* The four things a member actually does here. */}
      <div className="w-inset">
        <TileGrid>
          <Tile icon={<ArrowDownToLine />} label="Add money" onClick={() => setSheet('add')} />
          <Tile icon={<ArrowUpFromLine />} label="Take out" onClick={() => setSheet('out')} />
          <Tile icon={<Target />} label={vault.goal ? 'Change goal' : 'Set a goal'} onClick={() => setSheet('goal')} />
        </TileGrid>
      </div>

      <Segment value={tab} onChange={setTab} options={[
        { id: 'money', label: 'Money' },
        { id: 'sleeves', label: 'Sleeves' },
        { id: 'growth', label: 'Growth' },
      ]} />

      <div className="w-screen-body">
        {error && <div className="w-inset"><Notice kind="bad" icon={<Info />}>{error}</Notice></div>}
        {done && <div className="w-inset"><Notice kind="ok" icon={<Check />}>{done}</Notice></div>}

        {tab === 'money' && (
          <>
            <Card>
              <Facts cols={3} items={[
                ['Earned so far', money(vault.accruedProfitPaisa)],
                ['Added this month', money(thisMonth)],
                ['Risk', vault.blendedRiskScore.toFixed(1) + '/10'],
              ]} />
            </Card>

            <RowGroup title="What the vault does on its own">
              <Row chevron={false} icon={<Wallet />} title="Park my payouts here"
                   sub="Payouts land here"
                   value={vault.enabled ? 'On' : 'Off'} tone={vault.enabled ? 'ok' : undefined}
                   onClick={() => call(() => api('/vault/toggle', { method: 'POST', body: JSON.stringify({ enabled: !vault.enabled }) }))} />
              <Row chevron={false} icon={<ShieldCheck />} title="Cover a missed instalment"
                   sub="Settled from this balance"
                   value={vault.autoCover ? 'On' : 'Off'} tone={vault.autoCover ? 'ok' : undefined}
                   onClick={() => call(() => api('/vault/auto-cover', { method: 'POST', body: JSON.stringify({ enabled: !vault.autoCover }) }))} />
            </RowGroup>

            {/* The ledger. Every movement, what it was, and what it earned. */}
            {vault.history.length ? (
              <RowGroup title="Everything that has moved">
                {vault.history.map(h => (
                  <Row key={h.id} chevron={false}
                       icon={h.direction === 'IN' ? <ArrowDownToLine /> : <ArrowUpFromLine />}
                       title={REASON[h.reason] || h.reason.replace(/_/g, ' ').toLowerCase()}
                       sub={dateShort(h.at) + (h.daysHeld > 0
                         ? ' · ' + h.daysHeld + ' day' + (h.daysHeld === 1 ? '' : 's') + ' in, ' + money(h.earnedPaisa) + ' earned'
                         : '')}
                       value={(h.direction === 'IN' ? '+' : '') + money(h.amountPaisa)}
                       tone={h.direction === 'IN' ? 'ok' : undefined} />
                ))}
              </RowGroup>
            ) : (
              <Blank icon={<PiggyBank />} title="Nothing in the vault yet"
                     sub="From Rs 100. Out whenever you want."
                     action={<button className="primary" onClick={() => setSheet('add')}>Add money</button>} />
            )}

            <p className="w-foot">
              Halqa records your balance today, it does not hold or invest it. Once the licence
              and the trustee are in place this screen shows cash held in your own name and fund
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
                      <b>{TIER_LABEL[d.tier] || d.tier}</b>
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
                ['Adds up to', sum + '%'],
                ['Blended yield', preview.rate.toFixed(2) + '%'],
                ['Blended risk', preview.risk.toFixed(1) + '/10'],
              ]} />
              {sum !== 100 && (
                <Notice kind="warn" icon={<SlidersHorizontal />}>
                  The two have to add up to 100. Yours comes to {sum}.
                </Notice>
              )}
              <button className="primary full" disabled={busy || sum !== 100}
                      onClick={() => call(() => api('/vault/allocation', { method: 'POST', body: JSON.stringify({ allocation: shares }) }), 'Split saved.')}>
                Save this split
              </button>
            </Card>

            <Card title="What can go wrong">
              {details.map(d => (
                <div key={d.tier} className="vault-risk">
                  <div><b>{TIER_LABEL[d.tier] || d.tier}</b>
                    <small>{riskWord(d.riskScore)} · moves about {(d.volatilityBps / 100).toFixed(1)}% a year</small></div>
                  <i><em style={{ width: d.riskScore * 10 + '%' }} /></i>
                </div>
              ))}
              <Notice kind="info" icon={<Scale />}>
                Both halal. The risk is a lower yield, not a lost principal.
              </Notice>
            </Card>

            <RowGroup title="Where the money is recorded">
              {details.map(d => (
                <Row key={d.tier} chevron={false} icon={<Landmark />}
                     title={(TIER_LABEL[d.tier] || d.tier) + ' · ' + d.sharePct + '%'}
                     sub={d.name + (d.issuer ? ' · ' + d.issuer : '') + (d.rateAsOf ? ' · rate as of ' + date(d.rateAsOf) : '')}
                     value={d.ratePct + '%'} valueSub="a year" />
              ))}
            </RowGroup>
          </>
        )}

        {tab === 'growth' && (
          <Card title="If nothing changes" action={<TrendingUp />}>
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
              Estimates, not promises.
            </Notice>
          </Card>
        )}
      </div>

      {/* ---- add money ---- */}
      {sheet === 'add' && (
        <Sheet title="Add money to the vault" onClose={() => setSheet('')}>
          <AmountEntry value={topup} onChange={setTopup} hint="From Rs 100" />
          <div className="w-inset">
            <Chips value={topup} onChange={setTopup} options={[
              { id: '1000', label: money(100_000) },
              { id: '5000', label: money(500_000) },
              { id: '10000', label: money(1_000_000) },
              { id: '25000', label: money(2_500_000) },
            ]} />
            {vault.goal && topupP > 0 && (
              <Notice kind="info" icon={<Target />}>
                That takes you to {Math.min(100, Math.round((balanceP + topupP) / goalTarget * 100))}% of {vault.goal.name}.
              </Notice>
            )}
          </div>
          <BottomBar>
            <button className="primary full" disabled={busy || topupP < 10_000}
                    onClick={() => { setSheet(''); void call(async () => {
                      await api('/vault/deposit', { method: 'POST', body: JSON.stringify({ amountPaisa: String(topupP), idempotencyKey: key() }) });
                      emitHalqaAction('VAULT_DEPOSIT');
                    }, money(topupP) + ' added.') }}>
              Add {money(topupP)}
            </button>
          </BottomBar>
        </Sheet>
      )}

      {/* ---- take out ---- */}
      {sheet === 'out' && (
        <Sheet title="Take money out" onClose={() => setSheet('')}>
          <AmountEntry value={takeout} onChange={setTakeout} max={Math.floor(balanceP / 100)}
                       hint={'You have ' + money(vault.balancePaisa)} />
          <div className="w-inset">
            <button className="secondary" onClick={() => setTakeout(String(balanceP / 100))}>
              Take all of it
            </button>
            <Facts cols={2} items={[
              ['Profit earned', money(vault.accruedProfitPaisa)],
              ["Halqa's share", money(Math.round(Number(vault.accruedProfitPaisa) * vault.mudaribFeePct / 100))],
            ]} />
            <Notice kind="info" icon={<Info />}>
              The rest starts earning again from today.
            </Notice>
          </div>
          <BottomBar>
            <button className="primary full" disabled={busy || takeoutP <= 0 || takeoutP > balanceP}
                    onClick={() => { setSheet(''); void call(async () => {
                      const r = await api<{ principalPaisa: string; profitPaisa: string }>('/vault/withdraw',
                        { method: 'POST', body: JSON.stringify({ idempotencyKey: key(), amountPaisa: String(takeoutP) }) });
                      emitHalqaAction('VAULT_SWEEP');
                      setTakeout('');
                      setDone(money(r.principalPaisa) + ' plus ' + money(r.profitPaisa) + ' profit sent to your account.');
                    }) }}>
              Take out {money(takeoutP)}
            </button>
          </BottomBar>
        </Sheet>
      )}

      {/* ---- goal ---- */}
      {sheet === 'goal' && (
        <Sheet title="What are you saving for" onClose={() => setSheet('')}>
          <Field label="Call it something" hint="">
            <input maxLength={60} placeholder="Eid, a laptop, the deposit"
                   value={goalName || vault.goal?.name || ''}
                   onChange={e => setGoalName(e.target.value)} />
          </Field>
          <Field label="How much, in rupees" hint="">
            <input inputMode="numeric" placeholder="50000"
                   value={goalAmount || (goalTarget ? String(goalTarget / 100) : '')}
                   onChange={e => setGoalAmount(e.target.value.replace(/\D/g, ''))} />
          </Field>
          <div className="w-inset">
            <Notice kind="info" icon={<Target />}>
              A target is not a lock.
            </Notice>
          </div>
          <BottomBar>
            {vault.goal && (
              <button className="secondary" disabled={busy}
                      onClick={() => { setSheet(''); void call(() => api('/vault/goal', { method: 'POST', body: JSON.stringify({ targetPaisa: null }) }), 'Goal removed.') }}>
                Remove it
              </button>
            )}
            <button className="primary full"
                    disabled={busy || Number(goalAmount || (goalTarget / 100)) < 1000}
                    onClick={() => { setSheet(''); void call(() => api('/vault/goal', {
                      method: 'POST',
                      body: JSON.stringify({
                        targetPaisa: String(Math.round(Number(goalAmount || goalTarget / 100) * 100)),
                        name: goalName || vault.goal?.name || 'My savings goal',
                      }),
                    }), 'Goal set.') }}>
              Save the goal
            </button>
          </BottomBar>
        </Sheet>
      )}
    </div>
  );
}
