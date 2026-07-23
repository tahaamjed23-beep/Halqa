import { useEffect, useState } from 'react';
import { CalendarDays, Clock3, Lock, Plus, ShieldCheck, Users, X } from 'lucide-react';
import { api, money } from '../api';
import type { Committee, User } from '../types';
import { CircleCard, cached, keep } from './HomePage';
import { Empty, modeName, TurnPricingChip, type TurnPricing } from '../components/ui';
import { HostCard, type Reputation } from '../components/HostCard';
import { SHOW_INVESTOR_BRIEFING_FEATURES } from '../config';

type Preview={id:string;name:string;mode:'ROTATING'|'HYBRID'|'INVESTMENT';status:string;memberCount:number;memberCap:number;contributionPaisa:string;periodDays:number;reinvestRatio:number;riskScore:number;riskBand:string;distributionMode:string;scheme:{name:string;riskScore:number;indicativeRatePct:number}|null;host:Reputation};
type Slot={position:number;expectedPayoutAt:string;eligible:boolean};
type CreditHealth={averageCreditScore:number;grade:'EXCELLENT'|'STRONG'|'FAIR'|'WATCH';defaults:number;latePayments:number;earlyPayments:number;settledPayments:number;paymentQualityPct:number};
type DiscoveryCircle={id:string;name:string;mode:'ROTATING'|'HYBRID'|'INVESTMENT';status:string;availability:'OPEN'|'WAIT_NEXT_CYCLE';memberCount:number;memberCap:number;contributionPaisa:string;periodDays:number;cycleNumber:number;riskScore:number;riskBand:string;turnPricing:TurnPricing;host:{id:string;fullName:string;creditScore:number};scheme:{name:string;riskScore:number;indicativeRatePct:number}|null;availablePositions:Slot[];eligiblePositions:number[];projectedCycleStart:string;creditHealth:CreditHealth;engines:string[];waitlisted:boolean};

export default function CirclesPage({user,openCommittee,create}:{user:User;openCommittee:(id:string)=>void;create:()=>void}){
  const [rows,setRows]=useState<Committee[]>(()=>cached('circles.rows.v2',[]));
  const [discover,setDiscover]=useState<DiscoveryCircle[]>(()=>cached('circles.discover.v2',[]));
  const [code,setCode]=useState('');const [error,setError]=useState('');const [preview,setPreview]=useState<Preview|null>(null);const [busy,setBusy]=useState(false);
  const load=async()=>{
    if(SHOW_INVESTOR_BRIEFING_FEATURES){const data=await api<DiscoveryCircle[]>('/committees/discover');setDiscover(data);keep('circles.discover.v2',data)}
    else{const data=await api<Committee[]>('/committees');setRows(data);keep('circles.rows.v2',data)}
  };
  useEffect(()=>{void load()},[]);
  const inspect=async()=>{try{setError('');setBusy(true);setPreview(await api<Preview>(`/committees/preview/${encodeURIComponent(code.trim())}`))}catch(reason){setError((reason as Error).message)}finally{setBusy(false)}};
  // Joining is signing: the mutual member-to-member guarantee is SHOWN and
  // agreed before the join call runs (the act of joining records it).
  const [pgTarget,setPgTarget]=useState<{committeeId:string;run:()=>Promise<void>}|null>(null);
  const doJoin=async()=>{try{setError('');setBusy(true);const joined=preview?.id;await api('/committees/join',{method:'POST',body:JSON.stringify({inviteCode:code.trim()})});setCode('');setPreview(null);await load();if(joined)openCommittee(joined)}catch(reason){setError((reason as Error).message)}finally{setBusy(false)}};
  const doJoinPublic=async(id:string,position:number|null)=>{try{setError('');setBusy(true);await api(`/committees/${id}/join-public`,{method:'POST',body:JSON.stringify(position?{position}:{})});await load();openCommittee(id)}catch(reason){setError((reason as Error).message)}finally{setBusy(false)}};
  const join=()=>{if(preview)setPgTarget({committeeId:preview.id,run:doJoin})};
  const joinPublic=(id:string,position:number|null)=>setPgTarget({committeeId:id,run:()=>doJoinPublic(id,position)});
  const waitlist=async(id:string,preferredPosition:number|null)=>{try{setError('');setBusy(true);await api(`/committees/${id}/waitlist`,{method:'POST',body:JSON.stringify({preferredPosition})});await load()}catch(reason){setError((reason as Error).message)}finally{setBusy(false)}};
  const openRows=discover.filter(item=>item.availability==='OPEN');const nextRows=discover.filter(item=>item.availability==='WAIT_NEXT_CYCLE');
  return <div className="page enter"><div className="page-head"><div><span className="eyebrow">Savings network</span><h1>{SHOW_INVESTOR_BRIEFING_FEATURES?'Discover circles':'Committees'}</h1><p>{SHOW_INVESTOR_BRIEFING_FEATURES?'Explore circles you have not joined, compare their repayment record, and see every projected turn slot.':'Member capacity and duration are configured independently.'}</p></div><button className="primary" onClick={create}><Plus/>Create</button></div><div className="join-bar"><input className="field" value={code} onChange={e=>{setCode(e.target.value);setPreview(null)}} placeholder="Have a private invite code?"/><button className="secondary" disabled={busy||code.trim().length<3} onClick={inspect}>Check before joining</button></div>{error&&<div className="error-box">{error}</div>}
  {preview&&<section className="panel" style={{display:'grid',gap:12}}><div className="panel-head"><div><span className="eyebrow">{modeName[preview.mode]} · risk {preview.riskScore}/10 {preview.riskBand}</span><h2>{preview.name}</h2><p>{money(preview.contributionPaisa)} every {preview.periodDays} days · {preview.memberCount}/{preview.memberCap} members · {Math.round(preview.reinvestRatio*100)}% growth allocation{preview.scheme?` into ${preview.scheme.name}`:''}</p></div><button className="icon-button" aria-label="Close preview" onClick={()=>setPreview(null)}><X/></button></div><HostCard reputation={preview.host}/><button className="primary" disabled={busy||preview.status!=='FORMING'} onClick={join}>{preview.status==='FORMING'?`Join ${preview.name}`:'This circle has already started'}</button></section>}
  {SHOW_INVESTOR_BRIEFING_FEATURES?<><DiscoveryGroup title="Open now" subtitle="Choose a forming circle with room for new members." rows={openRows} busy={busy} joinPublic={joinPublic} waitlist={waitlist}/><DiscoveryGroup title="Wait for next cycle" subtitle="Follow established circles and reserve interest in a future turn." rows={nextRows} busy={busy} joinPublic={joinPublic} waitlist={waitlist}/></>:<section className="circle-grid">{rows.map((committee,index)=><CircleCard key={committee.id} committee={committee} userId={user.id} index={index} open={openCommittee}/>)}{!rows.length&&<Empty text="No committees are available."/>}</section>}
  {pgTarget&&<MutualPgSheet committeeId={pgTarget.committeeId} busy={busy} close={()=>setPgTarget(null)} confirm={async()=>{const run=pgTarget.run;setPgTarget(null);await run()}}/>}</div>
}

// The mutual guarantee contract, drafted and shown at the moment of joining.
// Confirming = e-signing it as part of the join (recorded server-side with
// version + document hash against your account).
function MutualPgSheet({committeeId,busy,close,confirm}:{committeeId:string;busy:boolean;close:()=>void;confirm:()=>Promise<void>}){
  const [text,setText]=useState('');const [version,setVersion]=useState(0);const [agreed,setAgreed]=useState(false);const [failed,setFailed]=useState('');
  useEffect(()=>{api<{text:string;version:number}>(`/agreements/text?doc=MUTUAL_PG&committeeId=${committeeId}`).then(d=>{setText(d.text);setVersion(d.version)}).catch(reason=>setFailed((reason as Error).message))},[committeeId]);
  return <div className="modal-backdrop"><section className="modal" style={{display:'flex',flexDirection:'column',gap:10,maxHeight:'88vh'}}>
    <div className="modal-head"><div><span className="eyebrow">Signed as part of joining · ETO 2002</span><h2><ShieldCheck size={18} style={{verticalAlign:'-3px'}}/> Mutual member guarantee</h2></div><button onClick={close} aria-label="Close"><X/></button></div>
    <p style={{fontSize:12.5,opacity:.8,margin:0}}>This is the personal guarantee every member of this circle gives to every other member — read it before you join. Joining records your e-signature on it.</p>
    {failed?<div className="error-box">{failed}</div>:<pre style={{overflowY:'auto',whiteSpace:'pre-wrap',fontFamily:'inherit',fontSize:13,lineHeight:1.55,background:'rgba(255,255,255,.04)',border:'1px solid rgba(214,178,94,.25)',borderRadius:10,padding:14,margin:0,flex:1,minHeight:140}}>{text||'Loading the guarantee…'}</pre>}
    <label className="settings-toggle" style={{padding:'2px 0'}}><input type="checkbox" checked={agreed} onChange={e=>setAgreed(e.target.checked)}/><span><b>I give this guarantee to my fellow members and sign it by joining</b><small>Version {version||'—'} · recorded with a document hash against your CNIC-verified account</small></span></label>
    <button className="primary full" disabled={!agreed||busy||!text} onClick={()=>void confirm()}>Sign the guarantee & join</button>
  </section></div>
}

function DiscoveryGroup({title,subtitle,rows,busy,joinPublic,waitlist}:{title:string;subtitle:string;rows:DiscoveryCircle[];busy:boolean;joinPublic:(id:string,position:number|null)=>void;waitlist:(id:string,position:number|null)=>void}){
  return <section className="discovery-group"><div className="section-head"><div><span className="eyebrow">Public network</span><h2>{title}</h2><p>{subtitle}</p></div><span>{rows.length} circle{rows.length===1?'':'s'}</span></div><div className="discovery-grid">{rows.map((circle,index)=><DiscoveryCard key={circle.id} circle={circle} index={index} busy={busy} joinPublic={joinPublic} waitlist={waitlist}/>)}{!rows.length&&<Empty text={`No circles are marked “${title}” right now.`}/>}</div></section>
}

function DiscoveryCard({circle,index,busy,joinPublic,waitlist}:{circle:DiscoveryCircle;index:number;busy:boolean;joinPublic:(id:string,position:number|null)=>void;waitlist:(id:string,position:number|null)=>void}){
  // Default to the earliest slot the viewer's band can actually take; a locked
  // slot can never be selected. Discover only surfaces circles with at least
  // one eligible open slot, so this is populated for anything joinable.
  // Defensive: stale localStorage cache from an older app version can lack the
  // newer fields (eligiblePositions / availablePositions). Guard every access so
  // instant-paint from an old cache degrades gracefully instead of crashing the
  // whole page before the fresh fetch replaces it.
  const eligible=circle.eligiblePositions??[];
  const available=circle.availablePositions??[];
  const health=circle.creditHealth??{averageCreditScore:0,grade:'FAIR',defaults:0,latePayments:0,earlyPayments:0,settledPayments:0,paymentQualityPct:100} as CreditHealth;
  const eligibleSet=new Set(eligible);
  const [preferred,setPreferred]=useState<number|null>(eligible[0]??null);
  const open=circle.availability==='OPEN';
  return <article className="discovery-card stagger" style={{animationDelay:`${index*55}ms`}}><header><div><div className="discovery-badges"><span className={`availability availability-${circle.availability.toLowerCase()}`}>{open?'Open':'Wait next cycle'}</span><TurnPricingChip pricing={circle.turnPricing??{kind:'FLAT',earlyFeeBps:0}}/><span className={`health-grade health-${health.grade.toLowerCase()}`}>{health.grade}</span></div><h3>{circle.name}</h3><p>Hosted by {circle.host?.fullName??'—'} · host score {circle.host?.creditScore??'—'}</p></div><div className="circle-icon"><Users/></div></header><div className="discovery-summary"><div><span>Contribution</span><b>{money(circle.contributionPaisa)}</b><small>every {circle.periodDays} days</small></div><div><span>Circle credit</span><b>{health.averageCreditScore}</b><small>{health.paymentQualityPct}% clean record</small></div><div><span>Members</span><b>{circle.memberCount}/{circle.memberCap}</b><small>{circle.memberCap-circle.memberCount} current openings</small></div></div><div className="credit-evidence"><span><b>{health.defaults}</b> defaults</span><span><b>{health.latePayments}</b> late</span><span><b>{health.earlyPayments}</b> early payments</span></div><div className="engine-tags">{(circle.engines??[]).map(engine=><span key={engine}>{engine}</span>)}</div><div className="slot-board"><div><span className="eyebrow">{open?'Pick your turn':'Payout timeline'}</span><small>{open?'Choose any open turn your reliability band allows — it is yours, never reshuffled.':'Reserve interest; you pick a turn when the next cycle opens.'}</small></div><div className="slot-list">{available.map(slot=>{const locked=!eligibleSet.has(slot.position);return <button type="button" key={slot.position} disabled={!open||locked} className={`${preferred===slot.position?'selected':''} ${locked?'locked':''}`} onClick={()=>{if(!locked)setPreferred(slot.position)}}><b>{locked?<><Lock size={11} style={{verticalAlign:'-1px'}}/> Turn #{slot.position} · band-locked</>:`Turn #${slot.position} available`}</b><span><CalendarDays/>Expected {new Date(slot.expectedPayoutAt).toLocaleDateString('en-PK',{day:'numeric',month:'short',year:'numeric'})}</span></button>})}</div></div>{open?<button className="primary full" disabled={busy||!preferred} onClick={()=>joinPublic(circle.id,preferred)}>{preferred?`Join · take turn #${preferred}`:'No turn available for your band'}</button>:<button className="primary full" disabled={busy||circle.waitlisted} onClick={()=>waitlist(circle.id,preferred)}><Clock3/>{circle.waitlisted?'You are on the next-cycle list':'Join next-cycle waitlist'}</button>}</article>
}
