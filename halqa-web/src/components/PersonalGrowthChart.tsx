import { Area, AreaChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { Committee } from '../types';
import { money } from '../api';

// A member-facing, position-aware projection: the person at turn X sees THEIR
// own money's journey across the cycle — paying in each month, receiving the
// pot at their turn, and their estimated profit share at completion. It makes
// the loan-vs-savings shape of a committee visible per position.
export default function PersonalGrowthChart({committee,turnPosition}:{committee:Committee;turnPosition:number}){
  const N=committee.memberCap;
  const C=Number(committee.contributionPaisa)/100;
  const pot=C*N;
  const X=turnPosition;
  // Estimated profit share, position-aware. Halal engines tilt profit toward
  // later turns (weight 1.0x→2.0x); the reference curves below are the engine's
  // own tested output on the 12×Rs11,667 circle, scaled to this pool. Indicative.
  const tier=committee.tier||'CLASSIC';
  const engine=tier!=='CLASSIC';
  const patience=tier==='BAZAAR'||tier==='SIGMA';
  const w=(p:number)=>patience?1+(p-1)/Math.max(1,N-1):1;               // 1.0 → 2.0
  const cov=(committee.depositCoverageBps??7000)/100;
  const BAZAAR_REF=[3619,4291,4962,5634,6306,6977,7649];
  const interp=(cv:number)=>{const i=Math.max(0,Math.min(5,Math.floor((cv-30)/10)));return BAZAAR_REF[i]+(BAZAAR_REF[i+1]-BAZAAR_REF[i])*((cv-30-i*10)/10);};
  const bestBazaar=interp(Math.max(30,Math.min(90,cov)))*(pot/140004);   // position-N halal profit
  const profitShare=engine?Math.round(bestBazaar*w(X)/2):0;              // position X's estimated share
  // Conventional tiers trade some of that share for early cash: early turns pay
  // a declining fee (capped 10%) out of their own payout.
  const earlyFeeBps=committee.earlyFeeBps||0;
  const feePaid=(tier==='PRIORITY'||tier==='SIGMA')&&N>1?Math.round(pot*(earlyFeeBps/10000)*(N-X)/(N-1)):0;

  // Net cash position each round: what you've received minus what you've paid.
  // At completion, your estimated profit share (minus any early-turn fee) lands.
  const data=Array.from({length:N+1},(_,r)=>{
    const paid=C*Math.min(r,N);
    const received=r>=X?pot:0;
    const bonus=r===N?profitShare-feePaid:0;
    return {label:r===0?'Start':`R${r}`,net:Math.round(received-paid+bonus)};
  });
  const totalPaid=C*N;
  const netEnd=profitShare-feePaid;

  return <div className="personal-growth">
    <div className="info-stack"><div><span>You pay in total</span><b>{money(totalPaid*100)}</b></div><div><span>You receive at turn #{X}</span><b>{money(pot*100)}</b></div><div><span>Est. profit share</span><b className="profit">{engine?money(profitShare*100):'—'}</b></div>{feePaid>0&&<div><span>Early-turn fee you pay</span><b>-{money(feePaid*100)}</b></div>}<div><span>Net at completion</span><b className={netEnd>=0?'profit':''}>{netEnd>=0?'+':''}{money(netEnd*100)}</b></div></div>
    <div className="projection-chart"><ResponsiveContainer width="100%" height="100%"><AreaChart data={data}><defs><linearGradient id="posFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1c6349" stopOpacity=".28"/><stop offset="1" stopColor="#1c6349" stopOpacity="0"/></linearGradient></defs><CartesianGrid vertical={false} stroke="#e9ebef"/><XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={11}/><YAxis tickFormatter={v=>`${Math.round(v/1000)}k`} tickLine={false} axisLine={false} fontSize={11}/><Tooltip formatter={(v:number)=>`Rs ${Number(v).toLocaleString()}`} contentStyle={{borderRadius:14,border:'1px solid #e4e7eb'}}/><ReferenceLine y={0} stroke="#c4c9d0"/><ReferenceLine x={`R${X}`} stroke="#0a7cff" strokeDasharray="4 4" label={{value:'your payout',position:'top',fontSize:11,fill:'#0a7cff'}}/><Area dataKey="net" stroke="#1c6349" fill="url(#posFill)" strokeWidth={3}/></AreaChart></ResponsiveContainer></div>
    <p className="field-note">{X<=Math.ceil(N/3)?'You’re an early turn: you collect the pot near the start — like an interest-free loan you repay over the remaining rounds.':X>=Math.ceil(N*2/3)?'You’re a later turn: your money stays in longest, so you earn the largest profit share — the committee’s reward for patience.':'You’re a middle turn: a balance of early access and profit share.'}{feePaid>0?' Because this is a conventional (Early Access / Maximum) circle, taking an earlier turn costs a disclosed fee out of your own payout.':''} All profit figures are indicative, never guaranteed.</p>
  </div>;
}
