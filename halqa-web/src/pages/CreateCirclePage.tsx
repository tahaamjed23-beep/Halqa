import { useEffect, useMemo, useState } from 'react';
import { Check, ChevronLeft, Landmark, Repeat2, ShieldCheck, TrendingUp } from 'lucide-react';
import { api, money } from '../api';
import { emitHalqaAction } from '../lib/events';
import type { Committee, Partner, Scheme, User } from '../types';
import { Field, profitProjection, RateStamp, tierName } from '../components/ui';
import { SHOW_BANK_RAIL, SIMPLE_MODE } from '../config';

type Mode='ROTATING'|'HYBRID'|'INVESTMENT';
const modes=[
  {id:'ROTATING' as Mode,title:'Small slice',cap:25,riskCap:3,icon:<Repeat2/>,description:'Invest up to 25% of each pool, capital-preservation schemes only. Turns pay out as normal.'},
  {id:'HYBRID' as Mode,title:'Growth slice',cap:75,riskCap:6,icon:<TrendingUp/>,description:'Invest up to 75% at a moderate risk ceiling. Turns pay out as normal.'},
  {id:'INVESTMENT' as Mode,title:'Investment circle',cap:100,riskCap:8,icon:<Landmark/>,description:'No rotating payout. Capital stays invested until the locked maturity.'},
];
const band=(score:number)=>score<=3?'LOW':score<=6?'MEDIUM':score<=8?'HIGH':'EXTREME';

export default function CreateCirclePage({user,done,cancel}:{user:User;done:(id:string)=>void;cancel:()=>void}){
  const [schemes,setSchemes]=useState<Scheme[]>([]);const [error,setError]=useState('');const [busy,setBusy]=useState(false);
  const [partner,setPartner]=useState<Partner|null>(null);const [custody,setCustody]=useState(false);const [guaranteed,setGuaranteed]=useState(false);const slotFee=1;
  // Safety Fund: guaranteed on-time payouts funded by a per-round slot fee that
  // pools into the circle's own fund. Works in recorded mode (fund tracked on
  // the ledger, guaranteed up to its balance). Host-configurable fee 0.5-3%.
  const safetyFund=false,slotFeePct=0;
  const [allowHalqaFill,setAllowHalqaFill]=useState(false);
  const [secureEarly,setSecureEarly]=useState(false);
  const [discoverable,setDiscoverable]=useState(true);
  // Profit engine is now composable: tick any combination of levers and the
  // named tier is derived at submit. earn = the Sukoon float+deposit base;
  // patience = the Bazaar tilt; earlyFeeOn = the conventional Priority fee.
  const [earn,setEarn]=useState(true);const [patience,setPatience]=useState(true);const [earlyFeeOn,setEarlyFeeOn]=useState(false);const [earlyFeePct,setEarlyFeePct]=useState(10);const [dividendPooled,setDividendPooled]=useState(true);
  const [goalType,setGoalType]=useState('');const [goalName,setGoalName]=useState('');
  // Gold hedge, a simple, prominent way to back the circle with gold without
  // digging into the generic "advanced invest" controls.
  // Deposit coverage: how much of each member's remaining dues their security
  // deposit covers, sized down the turn order. Host-chosen 30-90%. Higher =
  // safer + more deposit yield in the pool, but early turns lock up more cash.
  // Host's expectation of how early members pay (days before the due date).
  // Feeds the float part of the projections only; real profit always follows
  // real timestamps. Default = pay at round open (the reference assumption).
  const [leadDays,setLeadDays]=useState(30);
  // Investing a slice of the pool into a market scheme is now an OPTIONAL,
  // advanced choice, off by default. The circle earns the profit engine
  // (float + deposits) with no scheme or risk decision required.
  const [advanced,setAdvanced]=useState(false);
  const [form,setForm]=useState({name:'',mode:'ROTATING' as Mode,memberCap:6,contribution:25000,cadencePreset:'SHORT',periodDays:30,minMembersToStart:3,reinvestPercent:0,schemeId:'',distributionMode:'SHARE',targetRiskScore:3,payoutBuffer:15,liquidityReserve:10,latePenalty:2,guarantorRequired:false,dynamicDeposit:true,profitCollateral:true,capitalDaysDistribution:true,delayedDistributionDays:0,profitRecycling:false,progressivePenalties:true,payoutHoldbackEnabled:true,holdbackReleasePayments:2,featureLockOnDefault:true,smartNudges:true,peerNudges:true,promissoryNoteRequired:false,autoDebitMandateRequired:false,depositYield:0,insuranceReserve:0,postReceiptPenaltyPoints:200,rehabilitationCooldownMonths:6});
  useEffect(()=>{void api<Scheme[]>('/schemes').then(items=>{setSchemes(items);if(items[0])setForm(value=>({...value,schemeId:items[0].id}))});void api<{partner:Partner|null}>('/partner').then(data=>setPartner(data.partner)).catch(()=>setPartner(null))},[]);
  const selectedMode=modes.find(mode=>mode.id===form.mode)!;
  const effectiveRiskCap=Math.min(selectedMode.riskCap,form.targetRiskScore);
  // Rotating/hybrid circles pay out every period, so a scheme must be liquidatable
  // at least 7 days before payout. Investment circles lock capital until maturity.
  const liquidityLimitDays=form.mode==='INVESTMENT'?Number.MAX_SAFE_INTEGER:Math.max(1,form.periodDays-7);
  const eligible=schemes.filter(item=>item.riskScore<=effectiveRiskCap&&item.liquidityDays<=liquidityLimitDays);
  const hiddenByLiquidity=schemes.filter(item=>item.riskScore<=effectiveRiskCap&&item.liquidityDays>liquidityLimitDays).length;
  const scheme=eligible.find(item=>item.id===form.schemeId)||eligible[0];
  const cycleDays=form.memberCap*form.periodDays;const gross=form.memberCap*form.contribution;const invested=gross*form.reinvestPercent/100;
  const effLead=Math.min(leadDays,Math.max(0,form.periodDays));
  const daily=form.periodDays<7;
  // Deposit-coverage preview. Reference curves (verified by the engine's own
  // tests on the 12×Rs11,667 / Rs140,004 circle) are scaled to THIS pool for
  // the bonus, and used as-is for recovery (a pool-independent ratio). Values
  // are indicative, never guaranteed, same as every other projection here.
  const projected=useMemo(()=>profitProjection(invested,scheme?.indicativeRatePct||0,cycleDays),[invested,scheme,cycleDays]);
  // Derived engine tier from the composable levers (see the state above).
  const engineTier=form.mode==='INVESTMENT'||daily?'CLASSIC':earlyFeeOn?(earn?'SIGMA':'PRIORITY'):earn?(patience?'BAZAAR':'SUKOON'):'CLASSIC';
  const engineName=engineTier==='CLASSIC'?'Basic (no engine)':tierName(engineTier);
  const isShariah=engineTier!=='PRIORITY'&&engineTier!=='SIGMA';
  const effectiveFeePct=engineTier==='SIGMA'?Math.min(10,earlyFeePct):earlyFeePct;
  const setMode=(mode:Mode)=>{const next=modes.find(item=>item.id===mode)!;const nextRisk=Math.min(next.riskCap,form.targetRiskScore);const nextScheme=schemes.find(item=>item.riskScore<=nextRisk);setForm(value=>({...value,mode,targetRiskScore:nextRisk,reinvestPercent:mode==='INVESTMENT'?Math.max(50,Math.min(next.cap,value.reinvestPercent)):Math.min(next.cap,Math.max(1,value.reinvestPercent)),schemeId:nextScheme?.id||''}))};
  // Pick a risk band: lock the ceiling at the top of that band and auto-select
  // the highest-return scheme that fits, "maximise profit within the level".
  const pickRiskBand=(bandScore:number)=>{const target=Math.min(selectedMode.riskCap,bandScore);const ranked=[...schemes].filter(item=>item.riskScore<=target&&item.liquidityDays<=liquidityLimitDays).sort((a,b)=>b.indicativeRatePct-a.indicativeRatePct);setForm(current=>({...current,targetRiskScore:target,schemeId:ranked[0]?.id||current.schemeId}))};
  const setPercent=(value:number)=>setForm(current=>({...current,reinvestPercent:Math.max(current.mode==='INVESTMENT'?50:0,Math.min(selectedMode.cap,Math.round(value)))}));
  // Turning investing on/off: off resets to a pure rotating circle (0% invested);
  // on seeds a sensible default slice so the controls have something to show.
  const toggleAdvanced=(on:boolean)=>{setAdvanced(on);if(!on)setForm(f=>({...f,mode:'ROTATING' as Mode,reinvestPercent:0,targetRiskScore:3}));else setForm(f=>({...f,reinvestPercent:f.reinvestPercent>0?f.reinvestPercent:15}))};
  const submit=async()=>{setBusy(true);setError('');try{
    const bankRail=custody&&form.mode!=='INVESTMENT';
    const useSafety=safetyFund&&form.mode!=='INVESTMENT';
    const guaranteedOut=(bankRail&&guaranteed)||useSafety;
    const slotBpsOut=bankRail?Math.round(slotFee*100):useSafety?Math.round(slotFeePct*100):0;
    // Gold hedge overrides the investment config with a simple HYBRID gold slice.
    // Guarded: not in INVESTMENT mode (the section is hidden there but the
    // toggle state survives), and only when the period clears gold's 3-day
    // liquidity + the 7-day payout buffer.
    const modeOut=form.mode;
    const reinvestOut=daily?0:form.reinvestPercent/100;
    const schemeIdOut=daily?null:(form.reinvestPercent?scheme?.id:null);
    const riskOut=form.targetRiskScore;
    // Listing in Discover is a normal product choice, not a demo-only flag.
    const publicDiscovery=discoverable;
    const committee=await api<Committee>('/committees',{method:'POST',body:JSON.stringify({name:form.name,mode:modeOut,memberCap:form.memberCap,contributionPaisa:String(Math.round(form.contribution*100)),cadencePreset:SIMPLE_MODE?(form.periodDays<10?'VERY_SHORT':form.periodDays<=20?'SHORT':form.periodDays<=45?'MID':'LONG'):form.cadencePreset,periodDays:form.periodDays,minMembersToStart:form.minMembersToStart,reinvestRatio:reinvestOut,riskTolerance:riskOut,schemeId:schemeIdOut,distributionMode:form.distributionMode,orderMode:'CREDIT_WEIGHTED',joinPolicy:publicDiscovery?'OPEN_UNTIL_FULL':'INVITE_ONLY',listedPublicly:publicDiscovery,custodyMode:custody?'BANK_CUSTODY':'RECORDED',payoutGuaranteed:guaranteedOut,slotFeeBps:slotBpsOut,tier:engineTier,prizeDrawEnabled:false,earlyFeeBps:earlyFeeOn&&engineTier!=='CLASSIC'?Math.round(effectiveFeePct*100):0,dividendPooled:engineTier==='SIGMA'?dividendPooled:false,depositCoverageBps:0,expectedPaymentLeadDays:daily?0:effLead,goalType:goalType?(goalType==='ASSET'?'CUSTOM':goalType):undefined,goalName:goalName.trim()||undefined,forwardLiabilityGate:modeOut!=='INVESTMENT'&&secureEarly,allowHalqaFill})});
    // The committee exists from here on. Tuning its risk policy is a refinement,
    // not part of creating it, so a failure here must never strand the host on
    // the form with a circle that was silently created behind them. That is the
    // "no code, no invite, nothing" bug: the create returned 201, this call threw,
    // and the catch below swallowed the navigation.
    try{await api(`/risk/committee/${committee.id}/policy`,{method:'PATCH',body:JSON.stringify({targetRiskScore:riskOut,payoutBufferBps:form.payoutBuffer*100,liquidityReserveBps:form.liquidityReserve*100,latePenaltyBps:form.latePenalty*100,guarantorRequired:form.guarantorRequired,dynamicDeposit:SIMPLE_MODE?false:form.dynamicDeposit,profitCollateral:form.profitCollateral,capitalDaysDistribution:form.capitalDaysDistribution,delayedDistributionDays:form.delayedDistributionDays,profitRecycling:form.profitRecycling,progressivePenalties:form.progressivePenalties,payoutHoldbackEnabled:form.payoutHoldbackEnabled,holdbackReleasePayments:form.holdbackReleasePayments,featureLockOnDefault:form.featureLockOnDefault,smartNudges:form.smartNudges,peerNudges:form.peerNudges,promissoryNoteRequired:form.promissoryNoteRequired,autoDebitMandateRequired:form.autoDebitMandateRequired,depositYieldBps:form.depositYield*100,insuranceReserveBps:form.insuranceReserve*100,postReceiptPenaltyPoints:form.postReceiptPenaltyPoints,rehabilitationCooldownMonths:form.rehabilitationCooldownMonths,consentText:`I accept progressive penalties, feature locks and the disclosed rehabilitation policy.`})})}catch{/* refinement only; the circle is already created */}
    emitHalqaAction('CREATE_CIRCLE');
    done(committee.id);
  }catch(reason){setError((reason as Error).message)}finally{setBusy(false)}};
  // Simple mode runs creation as a 3-step wizard (name → people & money →
  // engines & review), one decision per screen, wallet-app style.
  // Three screens, one decision at a time. This used to ride on SIMPLE_MODE,
  // which is off, so every host got the whole form at once.
  const WIZARD=true;
  const [wstep,setWstep]=useState(0);
  const WIZ=['Name & goal','People & money','Review & start'];
  if(user.creditScore<700)return <div className="blocked-page"><h2>Hosting locked</h2><p>A reliability score of 700 or higher is required.</p><button className="secondary" onClick={cancel}>Go back</button></div>;
  return <div className="page narrow enter"><button className="back-link" onClick={cancel}><ChevronLeft/>Back</button>
  <div className="page-head"><div><span className="eyebrow">Locks when it starts</span><h1>Start a committee</h1><p>{SIMPLE_MODE?'Set the name, members, amount, period and a goal. Invite your circle with the code, that\'s it.':'Name it, set the amount and the people, and start it.'}</p></div></div>
  {WIZARD&&<div className="wizard-bar">{WIZ.map((label,i)=><button key={label} type="button" className={`wizard-step ${i===wstep?'on':''} ${i<wstep?'done':''}`} onClick={()=>{if(i<wstep)setWstep(i)}}><i>{i<wstep?<Check size={12}/>:i+1}</i><span>{label}</span></button>)}</div>}
  <section className="form-card">{(!WIZARD||wstep===0)&&<Field label="Name this committee"><input className="field" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="e.g. Islamabad Builders Circle"/></Field>}
  {(!WIZARD||wstep===0)&&<div className="form-grid"><Field label="What is it for" hint="Optional. Members see what they are saving towards."><select className="field" value={goalType} onChange={e=>setGoalType(e.target.value)}><option value="">No specific goal</option><option value="HAJJ">Hajj / Umrah</option><option value="EDUCATION">Education / fees</option><option value="WEDDING">Wedding</option><option value="HOME">Home / property</option><option value="BUSINESS">Business</option><option value="ASSET">Asset circle · buy a specific item</option><option value="CUSTOM">Something else</option></select></Field>{goalType==='ASSET'&&<div className="halqa-fill-box" style={{marginTop:10}}><b>Asset circles are reviewed before they start.</b><p>You take possession on your turn. A licensed leasing partner owns the item until the circle finishes paying, then it becomes yours. Halqa checks the item, the price and the dealer before the circle opens, so this sends an application rather than starting a circle.</p></div>}{goalType&&<Field label={goalType==='ASSET'?'What is being bought':'Goal name (optional)'}><input className="field" maxLength={60} value={goalName} onChange={e=>setGoalName(e.target.value)} placeholder="e.g. Ayesha's Hajj 2027"/></Field>}</div>}
  {(!WIZARD||wstep===1)&&<div className="form-grid"><Field label="How many people" hint={form.memberCap>30?'Large circle: interval must stay 30 days or less.':'You count as one. Up to 150.'}><input className="field" type="number" min="3" max="150" step="1" value={form.memberCap} onChange={e=>{const count=Math.max(3,Math.min(150,+e.target.value));setForm({...form,memberCap:count,minMembersToStart:Math.min(form.minMembersToStart,count),periodDays:count>30?Math.min(form.periodDays,30):form.periodDays})}}/></Field><Field label="Fewest needed to start"><input className="field" type="number" min="3" max={form.memberCap} step="1" value={form.minMembersToStart} onChange={e=>setForm({...form,minMembersToStart:Math.max(3,Math.min(form.memberCap,+e.target.value))})}/></Field><Field label="How much each turn, in rupees"><input className="field" type="number" min="100" step="100" value={form.contribution} onChange={e=>setForm({...form,contribution:+e.target.value})}/></Field><Field label="How many days between turns" hint={form.periodDays<7?'Daily-tempo circle: runs as a plain rotation, see the note below.':undefined}><input className="field" type="number" min="1" max={form.memberCap>30?30:365} step="1" value={form.periodDays} onChange={e=>setForm({...form,periodDays:Math.max(1,Math.min(form.memberCap>30?30:365,+e.target.value))})}/></Field>{!SIMPLE_MODE&&<Field label="Tempo"><select className="field" value={form.cadencePreset} onChange={e=>setForm({...form,cadencePreset:e.target.value})}><option value="VERY_SHORT">Very short</option><option value="SHORT">Short</option><option value="MID">Mid term</option><option value="LONG">Long term</option></select></Field>}{SIMPLE_MODE&&<Field label="Tempo" hint="Set automatically from the period so the label always matches the days."><div className="field" style={{display:'flex',alignItems:'center',fontWeight:700,fontSize:13}}>{form.periodDays<10?'Very short':form.periodDays<=20?'Short':form.periodDays<=45?'Mid term':'Long term'} · every {form.periodDays} day{form.periodDays===1?'':'s'}</div></Field>}</div>}
  {(!WIZARD||wstep===1)&&<div className="halqa-fill-box"><label className="settings-toggle" style={{padding:'4px 0'}}><input type="checkbox" checked={allowHalqaFill} onChange={e=>setAllowHalqaFill(e.target.checked)}/><span><b>Let Halqa join to fill empty seats</b><small>Halqa takes the empty seats so you can start without waiting. Higher management fee.</small></span></label>
  {allowHalqaFill&&<div className="disclaimer-box"><b>Please note before you turn this on:</b><ul><li><b>Halqa reserves the first turn positions.</b> Halqa's seats collect the earliest payouts; you and your members take the later turns.</li><li><b>A higher management fee applies</b> to circles Halqa helps fill, disclosed in the Fees &amp; Payments Policy.</li><li>Halqa pays its share into every round, so the members holding later turns are still paid on schedule.</li></ul></div>}</div>}
  {(!WIZARD||wstep===1)&&form.mode!=='INVESTMENT'&&<div className="halqa-fill-box"><label className="settings-toggle" style={{padding:'4px 0'}}><input type="checkbox" checked={secureEarly} onChange={e=>setSecureEarly(e.target.checked)}/><span><b>Cover early payouts</b><small>An early turn needs a signed undertaking for what is still owed after the payout.</small></span></label></div>}
  {(!WIZARD||wstep===1)&&form.periodDays<7&&<div className="market-rules"><div><b>Daily-tempo circle, plain rotation only, and riskier</b><p>Under 7 days there is nothing for idle money to earn on, so the circle is record-keeping only. Turns, scores and penalties still apply.</p></div></div>}

  {/* SIMPLE MODE, one option, a spectrum, no jargon: the turn-order
      adjustment. Turn 1 pays the full rate, declining position by position to
      zero for the last turn; what early turns pay flows to later turns on the
      same declining weights (position 2 mirrors second-last, and so on). The
      backend earlyFee engine already prices exactly this spectrum. The safety
      fund stays out (custody optics) and the float runs silently. */}
  {WIZARD&&wstep===2&&<section className="default-policy-panel discovery-controls"><div className="panel-head"><div><span className="eyebrow">Joining &amp; turn order</span><h2>Who can find it</h2><p>Locks when the first turn opens.</p></div></div><div className="policy-toggles compact"><label><input type="checkbox" checked={discoverable} onChange={e=>setDiscoverable(e.target.checked)}/><span><b>Show open slots in Discover</b><small>People can see the open turns and pick one. Off means invite only.</small></span></label></div><div className="secure-explainer"><ShieldCheck/><span>Members pick their own turn. A chosen turn is never moved.</span></div></section>}

  {WIZARD&&wstep===2&&form.mode!=='INVESTMENT'&&!daily&&<section className="default-policy-panel"><div className="panel-head"><div><span className="eyebrow">Optional · turn-order adjustment</span><h2>Early turns pay a little extra</h2><p>At nothing, every turn is equal.</p></div></div>
  <div className="allocation-box"><div className="allocation-head"><div><span className="eyebrow">First turn pays</span><h3>{earlyFeeOn?effectiveFeePct:0}% <small style={{fontWeight:400,opacity:0.7}}>declining to 0% for the last turn</small></h3></div></div>
  <input aria-label="Early turn fee, per cent" className="allocation-slider" type="range" min="0" max="10" step="0.5" value={earlyFeeOn?effectiveFeePct:0} onChange={e=>{const v=+e.target.value;setEarlyFeeOn(v>0);if(v>0)setEarlyFeePct(v)}}/>
  {/* One picture with one description: each bar used to carry a title
      attribute, which is a tooltip a member cannot dismiss and cannot hold
      open (WCAG 1.4.13), and a reader announced ten of them one after another. */}
  {earlyFeeOn&&<div className="spectrum-preview" role="img"
    aria-label={`What each turn pays: ${Array.from({length:Math.min(form.memberCap,10)},(_,i)=>{const n=Math.min(form.memberCap,10);return `turn ${i+1} pays ${(effectiveFeePct*(n-1-i)/(n-1)).toFixed(1)} per cent`}).join(', ')}`}>
    {Array.from({length:Math.min(form.memberCap,10)},(_,i)=>{const n=Math.min(form.memberCap,10);const pct=effectiveFeePct*(n-1-i)/(n-1);return <div key={i}><i style={{height:`${Math.max(6,pct/effectiveFeePct*100)}%`}}/><span>{i+1}</span></div>})}</div>}
  <p className="field-note" style={{opacity:0.85}}>{earlyFeeOn?`Turn 1 collects its pool minus ${effectiveFeePct}%; each later turn pays less on a straight line down to 0%. What's paid is shared back the same way in reverse, position 2 mirrors the second-last, and the final turn earns the most. Halqa keeps none of it.`:'Off, every member collects the identical pool on their turn.'}</p></div>
  <p className="field-note" style={{fontSize:12,opacity:0.8}}>Late fees: 2%, 5%, then 10% by tier. Turns can be sold on the Market once the circle starts.</p></section>}

  {/* PROFIT ENGINE, the primary "how it earns" choice, front and centre */}
  {WIZARD&&wstep===2&&form.mode!=='INVESTMENT'&&<section className="default-policy-panel"><div className="panel-head"><div><span className="eyebrow">Profit engine · how this circle earns</span><h2>Earn while everyone saves</h2><p>Money waiting between payments earns. Pick what to switch on.</p></div></div>
  <p className="combo-hint">Any combination works. Adding the early fee makes it Early Access, or Maximum with the engine on.</p>
  <div className="engine-lever-group"><span className="eyebrow">Halal levers · real profit on money that's just waiting</span>
  <div className="policy-toggles compact"><label className={daily?'lever-off':''}><input type="checkbox" disabled={daily} checked={earn&&!daily} onChange={e=>{const on=e.target.checked;setEarn(on);if(!on){setPatience(false)}}}/><span><b>Earn on idle money</b><small>{daily?'Not applicable at daily tempo, no instrument settles inside the window.':'The pool earns on an Islamic money-market sleeve between payment and payout. Shared by amount and days.'}</small></span></label>
  <label className={earn&&!daily?'':'lever-off'}><input aria-label="Reward members who pay early" type="checkbox" disabled={!earn||daily} checked={earn&&patience&&!daily} onChange={e=>setPatience(e.target.checked)}/><span><b>Patience pays</b><small>Profit tilts toward later turns, up to 2x.</small></span></label>
  </div>
  {earn&&!daily&&<div className="allocation-box"><div className="allocation-head"><div><span className="eyebrow">How early do members usually pay?</span><h3>{effLead} {effLead===1?'day':'days'} <small style={{fontWeight:400,opacity:0.7}}>before the due date</small></h3></div></div><input aria-label="Days the money is held before payout" className="allocation-slider" type="range" min="0" max={form.periodDays} step="1" value={effLead} onChange={e=>setLeadDays(+e.target.value)}/><p className="field-note" style={{opacity:0.85}}>Shapes the estimate only. Real profit follows the dates people actually pay.</p></div>}
  </div>
  <div className="engine-lever-group conventional"><span className="eyebrow">Conventional lever · not Shariah-reviewed</span>
  <div className="policy-toggles compact"><label><input type="checkbox" checked={earlyFeeOn} onChange={e=>setEarlyFeeOn(e.target.checked)}/><span><b>Early-turn fee</b><small>An early turn pays a fee from its own payout, 0% by the last turn. It goes to the other members, not to Halqa.</small></span></label></div>
  {earlyFeeOn&&<><Field label="Early fee % (earliest turn)" hint={engineTier==='SIGMA'?'Hard-capped at 10% when combined with the earning engine, extra return comes from the profit levers, never a higher fee.':'Declines to 0% for the last turn. Default 10%.'}><input className="field" type="number" min="0.5" max={engineTier==='SIGMA'?10:20} step="0.5" value={effectiveFeePct} onChange={e=>setEarlyFeePct(Math.max(0.5,Math.min(engineTier==='SIGMA'?10:20,+e.target.value)))}/></Field>
  <div className="fee-explainer"><div><span>How it works</span><b>The member whose turn it is has this fee <u>deducted from their own payout</u>, e.g. a {effectiveFeePct}% fee on a {money(gross*100)} pool means the first recipient collects {money(Math.round(gross*100*(1-effectiveFeePct/100)))} and the deducted {money(Math.round(gross*100*effectiveFeePct/100))} {engineTier==='SIGMA'&&dividendPooled?'joins the completion pot, shared through the patience split':'is split equally among the other members that same round'}.</b></div><div><span>Declining charge</span><b>Turn #1 pays the full rate; it steps down each turn to 0% for the last turn, who pays nothing and only collects.</b></div><div><span>Net effect</span><b>Early turns pay more than they receive (the cost of early cash); later turns receive more (the reward for waiting). Halqa keeps none of it.</b></div></div>
  {engineTier==='SIGMA'&&<div className="policy-toggles compact"><label><input type="checkbox" checked={dividendPooled} onChange={e=>setDividendPooled(e.target.checked)}/><span><b>Pool the fee into the patience split (recommended)</b><small>Fees go into the completion pot instead of monthly splits, so later turns earn more.</small></span></label></div>}</>}</div>
  <div className="engine-summary"><div><span className="eyebrow">Your combination</span><h3>{engineTier==='CLASSIC'?'Basic, no engine':engineTier==='SIGMA'?'Maximum (all levers)':tierName(engineTier)} <i className={isShariah?'rafa-halal':'rafa-conv'}>{isShariah?'halal structure':'not Shariah-reviewed'}</i></h3><p>{engineTier==='SIGMA'?'Every lever at once, the engine-verified maximum-bonus configuration.':engineTier==='BAZAAR'?'Earning engine with the patience tilt toward later turns.':engineTier==='SUKOON'?'Earning engine, profit shared by capital-days.':engineTier==='PRIORITY'?'The early-turn fee only, no investment engine.':'A pure rotating committee, equal in, equal out.'}</p></div></div>
  {!isShariah&&<div className="warning-box">This combination includes the conventional early-turn fee, paying for early access to shared money, funded by the members who take later turns. It has <b>not</b> been reviewed by a Shariah board and is a deliberate opt-in. Untick it for a fully halal circle.</div>}
  </section>}

  {/* Gold hedge, simple, prominent, optional */}

  {/* Protection stays visible, it's about safety, not investing. In simple mode it runs on sane defaults, hidden from the host. */}
  

  {/* Deposit coverage, the safety/liquidity trade-off, made visible */}


  {/* ADVANCED, OPTIONAL: actively invest a slice of the pool */}
  {WIZARD&&wstep===2&&<label className="advanced-toggle"><input type="checkbox" checked={advanced} onChange={e=>toggleAdvanced(e.target.checked)}/><span><b>Also invest a slice of the pool into a market scheme</b><small>Off by default. Only for actively investing part of each pool.</small></span></label>}
  {WIZARD&&wstep===2&&advanced&&<div className="advanced-invest"><section className="mode-grid">{modes.map(mode=><button key={mode.id} type="button" className={`mode-option ${form.mode===mode.id?'selected':''}`} onClick={()=>setMode(mode.id)}><div>{mode.icon}<span>Up to {mode.cap}% · risk ≤{mode.riskCap}</span></div><h3>{mode.title}</h3><p>{mode.description}</p></button>)}</section>
  <div className="risk-band-box"><div><span className="eyebrow">Risk level for the invested slice</span><h3>{band(form.targetRiskScore)} risk</h3><p>Pick a level, the ceiling locks at the top of that band and the highest-return eligible scheme is selected automatically.</p></div>
  <div className="mode-grid risk-band-grid">{([{id:'LOW',label:'Low',score:3,blurb:'Capital preservation, government paper and savings certificates.'},{id:'MEDIUM',label:'Medium',score:6,blurb:'Balanced growth, income and asset-allocation funds.'},{id:'HIGH',label:'High',score:8,blurb:'Maximum growth, equity, REIT and higher-yield sleeves.'}] as const).map(rb=>{const avail=rb.score<=selectedMode.riskCap;const active=band(form.targetRiskScore)===rb.id;return <button key={rb.id} type="button" disabled={!avail} className={`mode-option ${active?'selected':''}`} onClick={()=>pickRiskBand(rb.score)}><div><span>Risk ≤ {rb.score}/10</span></div><h3>{rb.label}</h3><p>{avail?rb.blurb:`Available with a ${rb.score<=6?'Growth slice or an Investment circle':'Investment circle'}.`}</p></button>})}</div></div>
  <Field label="Eligible investment scheme" hint={hiddenByLiquidity>0?`${hiddenByLiquidity} scheme(s) hidden: liquidity exceeds this circle's ${form.periodDays}-day period minus the 7-day payout buffer.`:undefined}><select className="field" value={scheme?.id||''} onChange={e=>setForm({...form,schemeId:e.target.value})}>{eligible.map(item=><option key={item.id} value={item.id}>{item.name} · {item.indicativeRatePct}% · risk {item.riskScore}/10 · {item.liquidityDays}d liquidity</option>)}</select>{scheme&&<RateStamp rateAsOf={scheme.rateAsOf}/>}{eligible.length===0&&<small className="field-warning">No scheme fits this period at the chosen risk ceiling. Extend the period, or lower the level.</small>}</Field>
  <div className="allocation-box"><div className="allocation-head"><div><span className="eyebrow">Growth allocation</span><h3>{form.reinvestPercent}% of every pool</h3></div><label><input className="percentage-input" type="number" min={form.mode==='INVESTMENT'?50:0} max={selectedMode.cap} step="1" value={form.reinvestPercent} onChange={e=>setPercent(+e.target.value)}/><span>%</span></label></div><input aria-label="Share placed in the scheme" className="allocation-slider" type="range" min={form.mode==='INVESTMENT'?50:0} max={selectedMode.cap} step="1" value={form.reinvestPercent} onChange={e=>setPercent(+e.target.value)}/></div>
  <div className="risk-policy-grid"><Field label="Payout buffer %"><input className="field" type="number" min="0" max="30" step="1" value={form.payoutBuffer} onChange={e=>setForm({...form,payoutBuffer:+e.target.value})}/></Field><Field label="Liquidity reserve %"><input className="field" type="number" min="5" max="40" step="1" value={form.liquidityReserve} onChange={e=>setForm({...form,liquidityReserve:+e.target.value})}/></Field><Field label="Late penalty %"><input className="field" type="number" min="0" max="10" step="1" value={form.latePenalty} onChange={e=>setForm({...form,latePenalty:+e.target.value})}/></Field><Field label="Delayed distribution"><select className="field" value={form.delayedDistributionDays} onChange={e=>setForm({...form,delayedDistributionDays:+e.target.value})}><option value="0">None</option><option value="30">30 days</option><option value="60">60 days</option><option value="90">90 days</option></select></Field></div></div>}

  {WIZARD&&wstep===2&&SHOW_BANK_RAIL&&partner&&<section className="default-policy-panel"><div className="panel-head"><div><span className="eyebrow">Partner rail · {partner.name}{partner.sandbox?' sandbox':''}</span><h2>Custody &amp; guaranteed payouts</h2><p>{user.kycLevel>=2?'The partner bank holds and moves the money for this circle.':'Finish verification on your profile before this circle can use the bank.'}</p></div><ShieldCheck/></div>
  {user.kycLevel>=2&&<div className="policy-toggles compact"><label><input type="checkbox" checked={custody} onChange={e=>{setCustody(e.target.checked);if(!e.target.checked)setGuaranteed(false)}}/><span><b>Custody via {partner.name}</b><small>Installments settle by statement matching.</small></span></label></div>}
  </section>}
  {(!WIZARD||wstep===2)&&<div className="projection-summary"><div><span>Pool / period</span><strong>{money(gross*100)}</strong></div><div><span>Members</span><strong>{form.memberCap}</strong></div><div><span>Each round</span><strong>{money(form.contribution*100)}</strong></div>{!SIMPLE_MODE&&advanced&&form.reinvestPercent>0&&<><div><span>Put to work</span><strong>{money(invested*100)}</strong></div><div><span>Estimated profit</span><strong>{money(Math.round(projected*100))}</strong></div></>}<p>{SIMPLE_MODE?'Everyone contributes each round; one member collects the full pool each round until everyone has had a turn. The order and rules lock when the circle starts.':<>Earns the <b>{engineName}</b> engine on idle days. The order and rules lock when it starts.</>}</p></div>}{error&&<div className="error-box">{error}</div>}{WIZARD&&wstep<2
  ?<div className="form-actions"><button className="secondary" onClick={()=>wstep===0?cancel():setWstep(wstep-1)}>{wstep===0?'Cancel':'Back'}</button><button className="primary" disabled={wstep===0&&form.name.trim().length<3} onClick={()=>setWstep(wstep+1)}>Continue</button></div>
  :<div className="form-actions"><button className="secondary" onClick={()=>WIZARD?setWstep(1):cancel()}>{WIZARD?'Back':'Cancel'}</button><button className="primary" disabled={busy||form.name.trim().length<3||(form.reinvestPercent>0&&!scheme)} onClick={submit}>{busy?'Starting':'Create circle'}</button></div>}
  {/* A disabled button with no reason on it is the same as a broken one. */}
  {!busy&&(form.name.trim().length<3||(form.reinvestPercent>0&&!scheme))&&<p className="create-blocked">{form.name.trim().length<3?'Give the circle a name first.':'Pick a scheme for the invested slice, or set it back to 0%.'}</p>}
  </section></div>;
}
