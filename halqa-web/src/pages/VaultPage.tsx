import { date } from '../lib/format';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Landmark, LineChart, Map, PiggyBank, Scale, ShieldCheck, SlidersHorizontal } from 'lucide-react';
import { api, key, money } from '../api';
import { emitHalqaAction } from '../lib/events';
import { Field } from '../components/ui';

// The vault as a full investment device: overview, portion sizing across the
// four sleeves, projected-growth bands, a risk model, and the money map that
// states exactly where recorded balances sit at each stage. All figures are
// indicative and computed from the sleeves' dated rates, never guarantees.

type TierDetail={tier:string;sharePct:number;name:string;ratePct:number;rateAsOf:string|null;shariahCompliant:boolean;riskScore:number;volatilityBps:number;liquidityDays:number;issuer:string;sourceUrl:string};
type VaultX={enabled:boolean;tier:string;tiers:string[];autoCover:boolean;balancePaisa:string;accruedProfitPaisa:string;ratePct:number;allocation:Record<string,number>|null;tierDetails:TierDetail[];blendedRatePct:number;blendedRiskScore:number;mudaribFeePct:number;custodyStage:string};

const TIER_LABEL:Record<string,string>={STANDARD:'Standard',INCOME:'Income'};
const TIER_WHAT:Record<string,string>={STANDARD:'Short-term Islamic money market',INCOME:'Islamic income fund, aims a little higher'};
// Honest asymmetric projection factors per sleeve: halal sleeves wobble around
// their dated rate, from the sleeve's own record.
const BAND:Record<string,{low:number;high:number}>={STANDARD:{low:0.8,high:1.15},INCOME:{low:0.7,high:1.25}};
const riskWord=(s:number)=>s<=3?'Low':s<=6?'Medium':s<=8?'High':'Very high';

export default function VaultPage(){
  const [vault,setVault]=useState<VaultX|null>(null);
  const [busy,setBusy]=useState(false);const [error,setError]=useState('');
  const [swept,setSwept]=useState<{principalPaisa:string;profitPaisa:string}|null>(null);
  const [topup,setTopup]=useState(5000);
  const [shares,setShares]=useState<Record<string,number>>({STANDARD:100,INCOME:0});
  const [horizonY,setHorizonY]=useState(3);const [monthly,setMonthly]=useState(0);
  const load=useCallback(()=>api<VaultX>('/vault').then(v=>{setVault(v);const base:Record<string,number>={STANDARD:0,INCOME:0};if(v.allocation)setShares({...base,...v.allocation});else setShares({...base,[v.tier]:100})}).catch(()=>setVault(null)),[]);
  useEffect(()=>{void load()},[load]);
  const call=async(fn:()=>Promise<unknown>)=>{setBusy(true);setError('');try{await fn();await load()}catch(reason){setError((reason as Error).message)}finally{setBusy(false)}};

  const sum=Object.values(shares).reduce((a,b)=>a+b,0);
  const details=vault?.tierDetails??[];
  const byTier=useMemo(()=>Object.fromEntries(details.map(d=>[d.tier,d])),[details]);
  const preview=useMemo(()=>{
    let rate=0,risk=0,low=0,high=0;
    for(const [tier,pct] of Object.entries(shares)){const d=byTier[tier];if(!d||!pct)continue;rate+=d.ratePct*pct/100;risk+=d.riskScore*pct/100;const b=BAND[tier]??{low:0.7,high:1.2};low+=d.ratePct*b.low*pct/100;high+=d.ratePct*b.high*pct/100}
    return {rate,risk,low,high};
  },[shares,byTier]);
  const balanceRs=vault?Number(BigInt(vault.balancePaisa)/100n):0;
  const seedRs=balanceRs>0?balanceRs:10000;
  const projection=useMemo(()=>{
    const months=horizonY*12;const rows=[];let mid=seedRs,lo=seedRs,hi=seedRs;
    for(let m=1;m<=months;m++){
      mid=mid*(1+preview.rate/1200)+monthly;lo=Math.max(0,lo*(1+preview.low/1200)+monthly);hi=hi*(1+preview.high/1200)+monthly;
      if(m%3===0)rows.push({label:m%12===0?`Y${m/12}`:`${m}m`,Expected:Math.round(mid),Conservative:Math.round(lo),Optimistic:Math.round(hi)});
    }
    return rows;
  },[seedRs,monthly,horizonY,preview]);
  const saveAllocation=()=>call(()=>api('/vault/allocation',{method:'POST',body:JSON.stringify({allocation:shares})}));

  if(!vault)return <div className="page enter"><div className="page-head"><div><h1>Your vault</h1><p>Loading…</p></div></div></div>;
  const sections=[['overview','Overview',<Landmark key="a"/>],['sizing','Portion sizing',<SlidersHorizontal key="b"/>],['growth','Projected growth',<LineChart key="c"/>],['risk','Risk model',<Scale key="d"/>],['map','Money map',<Map key="e"/>]] as const;
  return <div className="page enter">
    <div className="page-head"><div><h1>Your vault</h1><p>Payouts can park here and earn until you take them out. Your principal is available any time.</p></div></div>
    <div className="segmented" style={{marginBottom:6}}>{sections.map(([id,label,icon])=><button key={id} onClick={()=>document.getElementById(`vault-${id}`)?.scrollIntoView({behavior:'smooth',block:'start'})}><span style={{display:'inline-flex',alignItems:'center',gap:5,verticalAlign:'middle'}}>{icon}{label}</span></button>)}</div>

    <section className="panel" id="vault-overview"><div className="panel-head"><div><h2>Your balance</h2></div><PiggyBank/></div>
      <div className="info-stack">
        <div><span>Recorded balance</span><b>{money(vault.balancePaisa)}</b></div>
        <div><span>Profit so far</span><b className="profit">{money(vault.accruedProfitPaisa)}</b></div>
        <div><span>Blended yield</span><b>{vault.blendedRatePct.toFixed(2)}% / yr</b></div>
        <div><span>Blended risk</span><b>{vault.blendedRiskScore.toFixed(1)}/10 · {riskWord(vault.blendedRiskScore)}</b></div>
      </div>
      <div className="market-rules"><ShieldCheck/><div><b>Covers a missed installment</b><p>If you miss an installment, it is paid from this balance so it never becomes a default.</p></div></div>
      <div className="policy-toggles compact">
        <label><input type="checkbox" checked={vault.enabled} disabled={busy} onChange={()=>call(()=>api('/vault/toggle',{method:'POST',body:JSON.stringify({enabled:!vault.enabled})}))}/><span><b>Payout parking</b><small>New committee payouts land here instead of releasing directly.</small></span></label>
        <label><input type="checkbox" checked={vault.autoCover} disabled={busy} onChange={()=>call(()=>api('/vault/auto-cover',{method:'POST',body:JSON.stringify({enabled:!vault.autoCover})}))}/><span><b>Auto-cover missed installments</b><small>If an installment slips and the vault holds enough, it is settled from here automatically.</small></span></label>
      </div>
      <div className="form-grid"><Field label="Top up the vault (PKR)" hint="From Rs 100. Recorded and accruing from today."><input className="field" type="number" min="100" step="100" value={topup} onChange={e=>setTopup(+e.target.value)}/></Field></div>
      <div className="form-actions">
        <button className="secondary" disabled={busy||topup<100} onClick={()=>call(async()=>{await api('/vault/deposit',{method:'POST',body:JSON.stringify({amountPaisa:String(Math.round(topup*100)),idempotencyKey:key()})});emitHalqaAction('VAULT_DEPOSIT')})}>Add money</button>
        <button disabled={busy||BigInt(vault.balancePaisa)<=0n} onClick={()=>call(async()=>{setSwept(await api<{principalPaisa:string;profitPaisa:string}>('/vault/withdraw',{method:'POST',body:JSON.stringify({idempotencyKey:key()})}));emitHalqaAction('VAULT_SWEEP')})}>Take my money out</button>
      </div>
      {swept&&<div className="vault-callout ok">Swept {money(swept.principalPaisa)} principal + {money(swept.profitPaisa)} recorded profit to your external account.</div>}
      {error&&<div className="vault-callout warn">{error}</div>}
    </section>

    <section className="panel" id="vault-sizing"><div className="panel-head"><div><h2>Where it sits</h2><p>Must total 100%.</p></div><SlidersHorizontal/></div>
      {details.map(d=><div key={d.tier} className="allocation-box" style={{marginBottom:8}}>
        <div className="allocation-head"><div><span className="eyebrow">{TIER_LABEL[d.tier]} {d.shariahCompliant?<i className="rafa-halal">halal</i>:<i className="rafa-conv">high risk · not Shariah</i>}</span><h3>{shares[d.tier]??0}% <small style={{fontWeight:400,opacity:0.7}}>· {d.ratePct}%/yr indicative · risk {d.riskScore}/10</small></h3></div></div>
        <input className="allocation-slider" type="range" min="0" max="100" step="5" value={shares[d.tier]??0} onChange={e=>setShares({...shares,[d.tier]:+e.target.value})}/>
      </div>)}
      <div className="info-stack">
        <div><span>Total</span><b className={sum===100?'profit':''}>{sum}%{sum!==100?', must equal 100%':''}</b></div>
        <div><span>Blended yield</span><b>{preview.rate.toFixed(2)}%/yr</b></div>
        <div><span>Blended risk</span><b>{preview.risk.toFixed(1)}/10 · {riskWord(preview.risk)}</b></div>
      </div>
            <div className="form-actions"><button className="primary full" disabled={busy||sum!==100} onClick={saveAllocation}>Save</button></div>
    </section>

    <section className="panel" id="vault-growth"><div className="panel-head"><div><h2>Projected growth</h2><p>Estimates only, at the rates shown.</p></div><LineChart/></div>
      <div className="form-grid">
        <Field label="Horizon"><select className="field" value={horizonY} onChange={e=>setHorizonY(+e.target.value)}><option value="1">1 year</option><option value="3">3 years</option><option value="5">5 years</option></select></Field>
        <Field label="Monthly top-up (PKR, optional)"><input className="field" type="number" min="0" step="500" value={monthly} onChange={e=>setMonthly(Math.max(0,+e.target.value))}/></Field>
      </div>
      <div style={{width:'100%',height:260}}>
        <ResponsiveContainer><AreaChart data={projection} margin={{top:8,right:8,left:8,bottom:0}}>
          <CartesianGrid strokeOpacity={0.2} vertical={false}/>
          <XAxis dataKey="label" tick={{fontSize:11}}/>
          <YAxis tick={{fontSize:11}} width={70} tickFormatter={(v:number)=>v>=1000000?`${(v/1000000).toFixed(1)}M`:v>=1000?`${Math.round(v/1000)}k`:String(v)}/>
          <Tooltip formatter={(v:number|string)=>money(Math.round(Number(v))*100)}/>
          <Area type="monotone" dataKey="Optimistic" stroke="#8fb8a8" fill="#8fb8a8" fillOpacity={0.12} strokeWidth={1.5}/>
          <Area type="monotone" dataKey="Expected" stroke="#1c6349" fill="#1c6349" fillOpacity={0.18} strokeWidth={2.5}/>
          <Area type="monotone" dataKey="Conservative" stroke="#8a5a00" fill="#fff" fillOpacity={0.4} strokeWidth={1.5}/>
        </AreaChart></ResponsiveContainer>
      </div>
      <div className="info-stack">
        <div><span>Expected at horizon</span><b className="profit">{money((projection.at(-1)?.Expected??0)*100)}</b></div>
        <div><span>Conservative</span><b>{money((projection.at(-1)?.Conservative??0)*100)}</b></div>
        <div><span>Optimistic</span><b>{money((projection.at(-1)?.Optimistic??0)*100)}</b></div>
      </div>
    </section>

    <section className="panel" id="vault-risk"><div className="panel-head"><div><h2>What can go wrong</h2></div><Scale/></div>
      {details.map(d=><div key={d.tier} className="allocation-box" style={{marginBottom:8}}>
        <div className="allocation-head"><div><span className="eyebrow">{TIER_LABEL[d.tier]}</span><h3>{riskWord(d.riskScore)} risk <small style={{fontWeight:400,opacity:0.7}}>· {d.riskScore}/10 · swings around ±{(d.volatilityBps/100).toFixed(1)}%/yr · exit in ~{d.liquidityDays} day{d.liquidityDays===1?'':'s'}</small></h3></div></div>
        <div style={{height:8,borderRadius:4,background:'#e7efe9',overflow:'hidden'}}><div style={{width:`${d.riskScore*10}%`,height:'100%',background:d.riskScore<=3?'#1c6349':d.riskScore<=6?'#8a5a00':'#a03030'}}/></div>
        <p className="field-note" style={{marginTop:6,opacity:0.85}}>{TIER_WHAT[d.tier]}. Rate resets with the market; the risk is the yield drifting lower, not the principal.</p>
      </div>)}
      <div className="market-rules"><ShieldCheck/><div><b>Your blended position: {vault.blendedRiskScore.toFixed(1)}/10 ({riskWord(vault.blendedRiskScore)})</b><p>Committees never touch the crypto sleeve regardless of your mix, it exists only inside this personal vault. On sweep, {vault.mudaribFeePct}% of the accrued profit (never principal) is the platform's Mudarib share on the halal sleeves.</p></div></div>
    </section>

    <section className="panel" id="vault-map"><div className="panel-head"><div><h2>Where the money really is</h2><p>Halqa records your balance. It does not hold or invest it.</p></div><Map/></div>
      <div className="table-scroll"><table className="mini-table"><thead><tr><th>Sleeve</th><th>Your share</th><th>Instrument</th><th>Issuer</th><th>Rate (dated)</th><th>Where it sits today</th></tr></thead><tbody>
        {details.map(d=><tr key={d.tier}><td><b>{TIER_LABEL[d.tier]}</b></td><td>{d.sharePct}%</td><td>{d.name}</td><td>{d.issuer||''}</td><td>{d.ratePct}%/yr{d.rateAsOf?` · as of ${date(d.rateAsOf)}`:''}</td><td>{d.sharePct>0?'Recorded entry in the Halqa ledger; no real money moved':''}</td></tr>)}
      </tbody></table></div>
      <div className="vault-callout"><b>After licensing and the bank partnership</b>, the same screen will show: cash held in escrow at the partner bank in your name, fund units held at the asset-management company for each sleeve, and gold exposure through the gold-linked fund, with this ledger reconciling to theirs, line by line. The structure is already built; only the custody switch is waiting.</div>
    </section>
  </div>;
}
