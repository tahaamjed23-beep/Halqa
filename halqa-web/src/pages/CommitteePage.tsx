import CommitteeAvatar, { CommitteePhotoPrompt } from '../components/CommitteeAvatar';
import { RailLogo } from '../components/RailLogo';
import SeatEligibility from '../components/SeatEligibility';
import CollectionCalendar from '../components/CollectionCalendar';
import ExitVotes from '../components/ExitVotes';
import ForwardLiability from '../components/ForwardLiability';
import ConfirmingWindow from '../components/ConfirmingWindow';
import { phone } from '../lib/format';
import InviteShare from '../components/InviteShare';
import { date, dateShort, dateTime } from '../lib/format';
import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { Check, ChevronLeft, Clock, Crown, Landmark, Lock, Send, UserRound, Users, X } from 'lucide-react';
import { api, key, money } from '../api';
import { emitHalqaAction } from '../lib/events';
import type { Committee, Round, User } from '../types';
import { Field, TurnPricingChip, formatDuration, pricingOf, scoreColor } from '../components/ui'; // orderingLabel dropped, mode label removed from header
import { SHOW_BANK_RAIL, SHOW_INVESTOR_BRIEFING_FEATURES, SIMPLE_MODE } from '../config';
import RiskConsole from '../components/RiskConsole';
import ProtectionCenter from '../components/ProtectionCenter';
import { HostCardById } from '../components/HostCard';
import ErrorBoundary from '../components/ErrorBoundary';
import { ExitSheet } from '../components/ExitSheet';
import { Blank, FlowHeader } from '../components/wallet';

const ProjectionChart=lazy(()=>import('../components/ProjectionChart'));
const PersonalGrowthChart=lazy(()=>import('../components/PersonalGrowthChart'));
type Tab='turns'|'payments'|'growth'|'protection'|'chat';

// A database enum is not a label. Members read these, so they are written the
// way a person would say them.
const STATUS_WORDS: Record<string, string> = {
  PAID: 'Paid', PENDING: 'Due', LATE: 'Late', MISSED: 'Missed', WAIVED: 'Waived',
  COLLECTING: 'Collecting', INVESTED: 'Invested', CLOSED: 'Done', SCHEDULED: 'Scheduled',
  FORMING: 'Forming', ACTIVE: 'Running', CONFIRMING: 'Confirming', COMPLETED: 'Finished',
  CANCELLED: 'Cancelled',
};
const statusWord = (s: string) => STATUS_WORDS[s] || s.charAt(0) + s.slice(1).toLowerCase();

const RAIL_WORDS: Record<string, string> = {
  RAAST: 'Raast', JAZZCASH: 'JazzCash', EASYPAISA: 'Easypaisa',
  BANK_TRANSFER: 'Bank transfer', CARD: 'Card', CASH: 'Cash',
};
const railName = (r?: string | null) => (r && RAIL_WORDS[r]) || r || 'Raast';

export default function CommitteePage({id,user,onBack}:{id:string;user:User;onBack:()=>void}){
  const [committee,setCommittee]=useState<Committee|null>(null);const [tab,setTab]=useState<Tab>('turns');const [error,setError]=useState('');const [exitOpen,setExitOpen]=useState(false);
  const load=useCallback(()=>api<Committee>(`/committees/${id}`).then(setCommittee).catch(reason=>setError(reason.message)),[id]);useEffect(()=>{void load()},[load]);
  // A committee that came back in the wrong shape is a bad response, not a
  // reason to blank the app. Without this the page threw on committee.rounds
  // and the error boundary swallowed the whole screen.
  const usable=committee&&Array.isArray(committee.rounds)&&Array.isArray(committee.members);
  if(!usable)return <div className="w-screen"><FlowHeader title="Committee" onBack={onBack}/>
    <Blank icon={<Users/>} title={error?'Could not open this committee':'Opening the committee'}
           sub={error||undefined}
           action={error?<button className="primary" onClick={()=>{setError('');void load()}}>Try again</button>:undefined}/>
  </div>;
  const host=committee.hostId===user.id;const active=committee.rounds.find(round=>['COLLECTING','INVESTED'].includes(round.status));const membership=committee.members.find(member=>member.userId===user.id);const myRound=committee.rounds.find(round=>round.recipientId===user.id&&round.status!=='CLOSED');const myPayment=active?.payments.find(payment=>payment.payerId===user.id);
  const action=async(path:string,body:unknown={})=>{try{setError('');await api(`/committees/${id}/${path}`,{method:'POST',body:JSON.stringify(body)});await load()}catch(reason){setError((reason as Error).message)}};
  const full=committee.members.length>=committee.memberCap;
  // Leaving is a ladder, not a button (components/ExitSheet.tsx). It is shown
  // to any active member; a member who already collected is told inside the
  // sheet why they cannot exit, rather than the route being hidden from them.
  const exitBar=membership&&membership.status==='ACTIVE'
    ?<div className="exit-bar"><button className="secondary" onClick={()=>setExitOpen(true)}>Leave this circle</button></div>:null;
  const statusChip=committee.status==='FORMING'?(full?['Full','full']:committee.listedPublicly?['Open to join','open']:['Invite only','private']):committee.status==='CONFIRMING'?['Starts within 24 hours','confirming']:committee.status==='ACTIVE'?['Running','closed']:committee.status==='COMPLETED'?['Finished','done']:['Closed','closed'];
  return <div className="committee-page"><header className="committee-header"><button className="icon-button" onClick={onBack}><ChevronLeft/></button><CommitteeAvatar committeeId={committee.id} name={committee.name} avatarUrl={committee.avatarUrl} canEdit={host}/><div><b>{committee.name}</b><span>{committee.mode==='INVESTMENT'?'Investment circle · ':''}{committee.members.length}/{committee.memberCap} members</span></div><span className="host-chip">{host?<><Crown/>Host controls</>:<>Member view</>}</span></header><main className="committee-content enter">{committee.status==='CONFIRMING'&&committee.confirmingSince&&<ConfirmingWindow committeeId={committee.id} committeeName={committee.name} confirmingSince={committee.confirmingSince} contributionPaisa={committee.contributionPaisa} rounds={committee.members.length} isHost={host} onChanged={()=>{void load()}}/>}<div className="cm-band">
    <div className="cm-band-top"><UserRound/><span>{membership?`Your turn is ${membership.turnPosition} of ${committee.status==='FORMING'?committee.memberCap:committee.members.length}`:'Not a member'}</span></div>
    <b>{money(active?.payoutPaisa||0)}</b>
    <small>{myRound?`Yours lands in ${formatDuration(myRound.payoutDate)}`:committee.status==='FORMING'?'Starts once the host opens it':'Collected, or not scheduled'}</small>
    <div className="cm-band-facts">
      <div><span>Each turn</span><b>{money(committee.contributionPaisa)}</b></div>
      <div><span>Turn</span><b>{committee.currentRound?`${committee.currentRound} of ${committee.rounds.length}`:'Forming'}</b></div>
      <div><span>Members</span><b>{committee.members.length}/{committee.memberCap}</b></div>
    </div>
  </div>
  <div className="circle-status-bar"><span className={`circle-status status-${statusChip[1]}`}>{statusChip[0]}</span><TurnPricingChip pricing={pricingOf(committee.earlyFeeBps)}/>{host&&(committee.status==='FORMING'||(SHOW_INVESTOR_BRIEFING_FEATURES&&committee.status!=='CANCELLED'))&&<label className="listing-toggle"><input type="checkbox" checked={!!committee.listedPublicly} onChange={e=>action('listing',{listed:e.target.checked})}/><span>{committee.status==='FORMING'?(committee.listedPublicly?'Listed in Discover':'Invite code only'):(committee.listedPublicly?'Listed for the next cycle':'Waitlist hidden')}</span></label>}</div>
  {SHOW_BANK_RAIL&&committee.custodyMode==='BANK_CUSTODY'&&<div className="market-rules"><Landmark/><div><b>Custody · {committee.partner?.name||'Partner'}{committee.partner?.sandbox?' (sandbox)':''}{committee.payoutGuaranteed?' · payouts guaranteed up to the pool balance':''}</b><p>Installments settle from the partner statement. Slot fee {((committee.slotFeeBps||0)/100).toFixed(2)}% funds this circle's guarantee pool{committee.guaranteeFundPaisa!==undefined?` · pool balance ${money(committee.guaranteeFundPaisa)}`:''}. Never redistributed to members or the platform.</p></div></div>}
        <nav className="segmented">{((SIMPLE_MODE||committee.tier==='CLASSIC'?['turns','payments','protection','chat']:['turns','payments','growth','protection','chat']) as Tab[]).map(item=><button className={tab===item?'active':''} key={item} onClick={()=>setTab(item)}>{item==='turns'?'Turns & people':item==='protection'?'Safety':item==='chat'?'Messages':item.charAt(0).toUpperCase()+item.slice(1)}</button>)}</nav>{error&&<div className="error-box">{error}</div>}
  {tab==='turns'&&<><CommitteePhotoPrompt committeeId={committee.id} name={committee.name} avatarUrl={committee.avatarUrl} isHost={host} onChange={()=>{void load()}}/><Turns committee={committee} user={user} host={host} action={action}/><ExitVotes committeeId={committee.id} user={user} memberCount={committee.members.length}/><ForwardLiability contributionPaisa={committee.contributionPaisa} members={committee.members.length} seat={membership?.turnPosition}/><SeatEligibility creditScore={user.creditScore} cleanCircles={user.committeesCompletedClean||0} members={committee.members.length} contributionPaisa={committee.contributionPaisa}/><GroupCredit committee={committee}/></>} {tab==='payments'&&<>{active&&myPayment&&myPayment.status!=='PAID'&&<CollectionCalendar dueAt={active.dueDate} amountPaisa={myPayment.amountPaisa} graceDays={active.graceDays||0}/>}<Payments committee={committee} user={user} active={active} myPayment={myPayment} host={host} reload={load} action={action}/></>} {tab==='growth'&&<Growth committee={committee} active={active} host={host} action={action} myPosition={membership?.turnPosition}/>} {tab==='protection'&&<ProtectionCenter committeeId={committee.id} user={user} host={host}/>} {tab==='chat'&&<ErrorBoundary scoped label="Committee chat"><Chat committeeId={committee.id} user={user}/></ErrorBoundary>}{exitBar}{exitOpen&&<ExitSheet committeeId={id} onClose={()=>setExitOpen(false)} onDone={()=>{void load()}}/>}</main></div>
}

function Turns({committee,user,host,action}:{committee:Committee;user:User;host:boolean;action:(path:string,body?:unknown)=>Promise<void>}){
  return <div className="detail-grid"><section className="panel"><div className="panel-head"><div><span className="eyebrow">Locked order</span><h2>Everybody's turn</h2></div>{host&&committee.status==='FORMING'&&<div style={{display:'flex',gap:8,flexWrap:'wrap'}}><button className="primary" disabled={committee.members.length<committee.minMembersToStart} onClick={()=>action('start')}>Start with {committee.members.length}</button>{committee.members.length>=committee.minMembersToStart&&committee.members.length<committee.memberCap&&<button className="secondary" onClick={()=>action('start',{fundGap:true})} title="Halqa contributes into the unfilled positions so the circle starts full. Halqa's seats take the FIRST turns and Halqa pays its share into every round, so members holding later turns are still paid on schedule. Circles Halqa helps fill carry a higher management fee, per the Fees & Payments Policy.">Start full, Halqa fills {committee.memberCap-committee.members.length} slot{committee.memberCap-committee.members.length===1?'':'s'} · higher mgmt fee</button>}</div>}</div>{committee.status==='FORMING'&&<div className="assembly"><Users/><div><b>{committee.members.length>=committee.minMembersToStart
        ?`Ready to start with ${committee.members.length}`
        :`${committee.members.length} joined, ${committee.minMembersToStart} needed to start`}</b><p>{committee.memberCap-committee.members.length} seat{committee.memberCap-committee.members.length===1?'':'s'} still open. The host counts as one.</p></div></div>}
<div className="turn-timeline">{committee.rounds.length?committee.rounds.map(round=><article className={`${round.recipientId===user.id?'mine':''} ${round.status.toLowerCase()}`} key={round.id}><div className="turn-index">{round.roundNumber}</div><div><b>{round.recipient.fullName}{round.recipientId===user.id?' · You':''}</b><p>{date(round.payoutDate)} · {money(round.payoutPaisa)}</p></div><span>{statusWord(round.status)}</span></article>):committee.members.map(member=><article className={member.userId===user.id?'mine':''} key={member.id}><div className="turn-index">{member.turnPosition}</div><div><b>{member.user.fullName}{member.userId===user.id?' · You':''}</b><p>Provisional order · score {member.user.creditScore}</p></div><span>Not started</span></article>)}</div></section><section className="panel"><div className="panel-head"><div><span className="eyebrow">Circle</span><h2>Members</h2></div></div><div className="member-list">{committee.members.map(member=><article key={member.id}><div className="avatar">{member.user.fullName[0]}</div><div><b>{member.user.fullName}{member.userId===user.id?' · You':''}</b><p>Position {member.turnPosition}{member.userId===committee.hostId?' · Host':''}{member.user.phone?` · ${phone(member.user.phone)}`:''}</p></div><strong style={{color:scoreColor(member.user.creditScore)}}>{member.user.creditScore}</strong></article>)}</div><HostCardById userId={committee.hostId}/><InviteShare name={committee.name} code={committee.inviteCode} contributionPaisa={committee.contributionPaisa}/></section></div>
}

// The mutual guarantee this member e-signed at join, viewable any time.
function MutualPgLink({committeeId}:{committeeId:string}){
  const [open,setOpen]=useState(false);const [text,setText]=useState('');const [signedAt,setSignedAt]=useState<string|null>(null);
  const show=async()=>{try{const [doc,status]=await Promise.all([api<{text:string}>(`/agreements/text?doc=MUTUAL_PG&committeeId=${committeeId}`),api<{mutualPg:{signedAt:string}|null}>(`/agreements/status?committeeId=${committeeId}`)]);setText(doc.text);setSignedAt(status.mutualPg?.signedAt||null);setOpen(true)}catch{/* non-fatal */}};
  return <>
    <button className="text-action" style={{fontSize:11.5}} onClick={()=>void show()}>View the mutual guarantee you signed</button>
    {open&&<div className="modal-backdrop"><section className="modal" style={{display:'flex',flexDirection:'column',gap:10,maxHeight:'88vh'}}>
      <div className="modal-head"><div><span className="eyebrow">{signedAt?`E-signed ${dateTime(signedAt)}`:'Recorded at join'}</span><h2>Mutual member guarantee</h2></div><button onClick={()=>setOpen(false)} aria-label="Close"><X/></button></div>
      <pre style={{overflowY:'auto',whiteSpace:'pre-wrap',fontFamily:'inherit',fontSize:13,lineHeight:1.55,background:'rgba(255,255,255,.04)',border:'1px solid rgba(214,178,94,.25)',borderRadius:10,padding:14,margin:0,flex:1,minHeight:140}}>{text}</pre>
    </section></div>}
  </>;
}

function Payments({committee,user,active,myPayment,host,reload,action}:{committee:Committee;user:User;active?:Round;myPayment?:Round['payments'][number];host:boolean;reload:()=>Promise<void>;action:(path:string,body?:unknown)=>Promise<void>}){
  const [pay,setPay]=useState(false);const paid=active?.payments.filter(payment=>payment.status==='PAID').length||0;
  const overdue=!!active&&new Date(active.dueDate).getTime()<Date.now();
  const mine=committee.members.find(member=>member.userId===user.id);
  // Guaranteed circles can release with MISSED installments (pool covers them);
  // PENDING/LATE still block, mirroring the API rule.
  const blocking=active?.payments.filter(payment=>payment.status!=='PAID'&&!(committee.payoutGuaranteed&&payment.status==='MISSED')).length||0;
  const myRound=committee.rounds?.find(r=>r.recipientId===user.id);
  const [showReceipt,setShowReceipt]=useState(false);
  return <section className="panel detail-panel"><div className="panel-head"><div><h2>This turn</h2><p>{active
      ?`${paid} of ${active.payments.length} have paid${overdue?', and it is past the due date':` · due ${dateShort(active.dueDate)}`}`
      :'Nothing is due yet.'}</p></div>{myPayment&&(myPayment.status!=='PAID'
    ?<button className="secondary" onClick={()=>setPay(true)}>Collect now (optional)</button>
    :<button className="secondary" onClick={()=>setShowReceipt(!showReceipt)}>Collected, see the receipt</button>)}</div>
  {mine&&myPayment&&myPayment.status!=='PAID'&&active&&<div className="w-notice info"><p>{money(myPayment.amountPaisa)} is collected on {dateShort(active.dueDate)}. Keep the balance there.</p></div>}
  {myRound&&<div className="your-payout"><div><span>Turn {myRound.roundNumber}, yours</span><b>{money(myRound.payoutPaisa)}</b><small>{myRound.status==='CLOSED'?'Collected':`Lands ${date(myRound.payoutDate)}`}</small></div><i>#{committee.members.find(m=>m.userId===user.id)?.turnPosition||''}</i></div>}
  {!active&&<div className="warning-box">{committee.status==='FORMING'?(host?'Installments appear here the moment you start the circle, use Start on the Turns tab.':'Installments appear here once the host starts the circle. Nothing is owed while it forms.'):'Nothing is due right now.'}</div>}
  {showReceipt&&myPayment&&<div className="receipt-rows" style={{marginBottom:12}}><div><span>Status</span><b className="paid">Paid</b></div><div><span>Amount</span><b>{money(myPayment.amountPaisa)}</b></div><div><span>Paid over</span><b>{railName((myPayment as unknown as {paidVia?:string}).paidVia)}</b></div><div><span>Reference</span><b className="mono">{(myPayment as unknown as {txnRef?:string}).txnRef||''}</b></div></div>}<div className="pay-rows">{active?.payments.map(payment=><div key={payment.id} className="pay-row">
    <span className="pay-who"><i>{payment.payer?.fullName[0]}</i><b>{payment.payer?.fullName}</b></span>
    <span className="pay-amt">{money(payment.amountPaisa)}</span>
    <span className={`pay-state s-${payment.status.toLowerCase()}`}>{statusWord(payment.status)}</span>
  </div>)}</div>
  {/* div, not p: MutualPgLink renders its modal inline and block elements can't nest in a paragraph */}
  {mine&&<div className="cm-guarantee"><MutualPgLink committeeId={committee.id}/></div>}
  {SHOW_BANK_RAIL&&host&&committee.custodyMode==='BANK_CUSTODY'&&active&&<StatementImport committeeId={committee.id} reload={reload}/>}{host&&active&&<div className="host-actions"><button className="primary" disabled={active.status==='INVESTED'||blocking>0} onClick={async()=>{await action('payout',{idempotencyKey:key()});emitHalqaAction('PAYOUT')}}>{committee.mode==='INVESTMENT'?'Close contribution cycle':'Release payout & advance'}</button><button className="secondary" title="Export a bank-facing statement of this circle's future receivables and member reliability" onClick={async()=>{try{const pack=await api<Record<string,unknown>>(`/committees/${committee.id}/receivables-pack`);const blob=new Blob([JSON.stringify(pack,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`halqa-receivables-${committee.name.replace(/\W+/g,'-')}.json`;a.click();URL.revokeObjectURL(url)}catch{/* non-fatal */}}}>Bank pack</button><small>{blocking>0?'All current installments must be recorded first.':paid<(active.payments.length||0)?'Missed installments will be covered from the guarantee pool at release.':'Ready when no investment remains active.'}</small></div>}{pay&&<PaymentModal round={active!} committee={committee} user={user} amountPaisa={myPayment?.amountPaisa||committee.contributionPaisa} close={()=>setPay(false)} done={async()=>{setPay(false);await reload()}}/>}</section>
}

// Partner rail (#96): the host pastes statement lines as `ref | amount PKR | narration`.
// A line settles a member's installment only when the amount equals the
// contribution and the narration names exactly one unpaid member.
function StatementImport({committeeId,reload}:{committeeId:string;reload:()=>Promise<void>}){
  const [raw,setRaw]=useState('');const [busy,setBusy]=useState(false);const [error,setError]=useState('');
  const [summary,setSummary]=useState<{matchedLines:number;totalLines:number;results:{lineRef:string;status:string;payerUsername?:string;note?:string}[]}|null>(null);
  const parsed=raw.split('\n').map(line=>line.trim()).filter(Boolean).map(line=>{const [lineRef,amount,...rest]=line.split('|').map(part=>part.trim());return {lineRef,amountPaisa:String(Math.round((+amount||0)*100)),narration:rest.join(' '),postedAt:new Date().toISOString()}});
  const valid=parsed.length>0&&parsed.every(line=>line.lineRef?.length>=4&&+line.amountPaisa>0&&line.narration.length>=3);
  const submit=async()=>{setBusy(true);setError('');try{setSummary(await api(`/partner/committees/${committeeId}/statements`,{method:'POST',body:JSON.stringify({lines:parsed})}));setRaw('');await reload()}catch(reason){setError((reason as Error).message)}finally{setBusy(false)}};
  return <div className="deposit-board"><header><b>Partner statement import</b><span>One line per transfer: reference | amount PKR | narration naming the member</span></header>
  <textarea className="field" rows={3} value={raw} onChange={e=>setRaw(e.target.value)} placeholder={'SON-8841 | 250 | monthly installment from ayesha\nSON-8842 | 250 | bilal committee transfer'}/>
  {summary&&<div className="info-stack"><div><span>Last import</span><b>{summary.matchedLines}/{summary.totalLines} matched</b></div>{summary.results.filter(item=>item.status!=='MATCHED').slice(0,3).map(item=><div key={item.lineRef}><span>{item.lineRef}</span><b>{item.status}{item.note?` · ${item.note}`:''}</b></div>)}</div>}
  {error&&<div className="error-box">{error}</div>}
  <button className="secondary" disabled={busy||!valid} onClick={submit}>{busy?'Matching…':`Match ${parsed.length||''} line(s)`}</button></div>;
}

// The checkout sheet, a proper gateway-style flow (order summary → rail →
// processing → receipt), modelled on how Safepay/PayFast present a charge.
// Sandbox settles instantly behind the same UI a live rail will use.
const RAILS:[string,string,string,string][]=[["RAAST","Raast","RA","#0e7d72"],["JAZZCASH","JazzCash","JC","#c8102e"],["EASYPAISA","Easypaisa","EP","#3f9c35"],["BANK_TRANSFER","Bank transfer","BK","#5b6472"],["CASH","Cash","₨","#b08d2f"]];
// Group credit history, each member's on-time / late / missed record inside
// THIS circle, computed from the rounds' payments. Visible to everyone; that
// visibility is the accountability.
function GroupCredit({committee}:{committee:Committee}){
  const rows=committee.members.map(m=>{let paid=0,late=0,missed=0;for(const r of committee.rounds)for(const p of r.payments)if(p.payerId===m.userId){if(p.status==='PAID')paid++;else if(p.status==='LATE')late++;else if(p.status==='MISSED')missed++;}return {m,paid,late,missed,clean:late===0&&missed===0};});
  const anyHistory=rows.some(r=>r.paid+r.late+r.missed>0);
  return <section className="panel"><div className="panel-head"><div><span className="eyebrow">Circle reliability</span><h2>Group payment history</h2><p>How each member has paid in this circle. Everyone sees the same record.</p></div></div>
  {anyHistory?<div className="group-credit">{[...rows].sort((a,b)=>(a.missed+a.late)-(b.missed+b.late)).map(({m,paid,late,missed,clean})=><article key={m.id} className={clean?'':'flag'}><div className="gc-avatar">{m.user.fullName[0]}</div><div className="gc-name"><b>{m.user.fullName}{m.userId===committee.hostId?' · Host':''}</b><span>score {m.user.creditScore}</span></div><div className="gc-tally">{paid>0&&<span className="ok">{paid} on-time</span>}{late>0&&<span className="warn">{late} late</span>}{missed>0&&<span className="bad">{missed} missed</span>}{paid+late+missed===0&&<span className="muted">no rounds yet</span>}</div></article>)}</div>:<p className="muted">No installments recorded yet, history appears here once the circle starts collecting.</p>}
  </section>;
}

type LinkedMethod={id:string;rail:string;accountNo:string;label:string;preferred:boolean};
function PaymentModal({round,committee,user,amountPaisa,close,done}:{round:Round;committee:Committee;user:User;amountPaisa:string;close:()=>void;done:()=>Promise<void>}){
  const [via,setVia]=useState('RAAST');const [wallet,setWallet]=useState(user.phone||'');const [reference,setReference]=useState('');const [error,setError]=useState('');
  const [step,setStep]=useState<'select'|'processing'|'receipt'|'failed'>('select');const [receipt,setReceipt]=useState<{ref:string;at:Date;rail:string;live:boolean}|null>(null);const [copied,setCopied]=useState(false);
  const [methods,setMethods]=useState<LinkedMethod[]>([]);const [methodId,setMethodId]=useState('');const [saveMethod,setSaveMethod]=useState(false);
  useEffect(()=>{void api<{methods:LinkedMethod[]}>('/profile/payment-methods').then(d=>{setMethods(d.methods);const pref=d.methods.find(m=>m.preferred);if(pref){setMethodId(pref.id);setVia(pref.rail)}}).catch(()=>setMethods([]))},[]);
  const digital=via==='RAAST'||via==='JAZZCASH'||via==='EASYPAISA';const wallets=via==='JAZZCASH'||via==='EASYPAISA';
  const railMeta=RAILS.find(r=>r[0]===via)!;
  const chooseMethod=(m:LinkedMethod)=>{setMethodId(m.id);setVia(m.rail)};
  const chooseRail=(id:string)=>{setMethodId('');setVia(id)};
  const afterSuccess=()=>{if(saveMethod&&wallets&&!methodId)void api('/profile/payment-methods',{method:'POST',body:JSON.stringify({rail:via,accountNo:wallet.replace(/\D/g,''),preferred:true})}).catch(()=>{})};
  const payNow=async()=>{setStep('processing');setError('');const started=Date.now();try{
    const r=await api<{settled:boolean;payment?:{txnRef?:string};instruction?:{instruction:string;reference?:string}}>('/payments/initiate',{method:'POST',body:JSON.stringify({roundId:round.id,rail:via,idempotencyKey:key()})});
    emitHalqaAction('PAY_INSTALLMENT');
    await new Promise(resolve=>setTimeout(resolve,Math.max(0,1400-(Date.now()-started)))); // let the processing state read as real work, never a flicker
    afterSuccess();
    if(r.settled){setReceipt({ref:r.payment?.txnRef||r.instruction?.reference||'',at:new Date(),rail:railMeta[1],live:false});setStep('receipt')}
    else{setReceipt({ref:r.instruction?.reference||'',at:new Date(),rail:railMeta[1],live:true});setStep('receipt')}
  }catch(reason){setError((reason as Error).message);setStep('failed')}};
  const record=async()=>{setStep('processing');setError('');const started=Date.now();try{
    await api('/payments',{method:'POST',body:JSON.stringify({roundId:round.id,paidVia:via,txnRef:reference,idempotencyKey:key()})});
    emitHalqaAction('PAY_INSTALLMENT');
    await new Promise(resolve=>setTimeout(resolve,Math.max(0,1100-(Date.now()-started))));
    setReceipt({ref:reference,at:new Date(),rail:railMeta[1],live:false});setStep('receipt');
  }catch(reason){setError((reason as Error).message);setStep('failed')}};
  const copyRef=async()=>{try{await navigator.clipboard.writeText(receipt?.ref||'');setCopied(true);setTimeout(()=>setCopied(false),1500)}catch{/* clipboard unavailable */}};
  return <div className="modal-backdrop"><section className="modal checkout">
    <div className="modal-head"><div className="checkout-title"><h2>Checkout</h2><span className="secure-chip"><Lock/>Encrypted</span></div>{step!=='processing'&&<button onClick={step==='receipt'?()=>void done():close}><X/></button>}</div>
    {step==='select'&&<>
      <div className="checkout-summary"><div className="checkout-lines"><div><span>{committee.name}</span><b>Round {round.roundNumber} installment</b></div><div><span>Service fee</span><b className="fee-zero">Rs 0, members never pay Halqa</b></div></div><div className="checkout-amount"><span>Total</span><strong>{money(amountPaisa)}</strong></div></div>
      {methods.length>0&&<><span className="eyebrow" style={{display:'block',margin:'12px 0 6px'}}>Your linked methods</span>
      <div className="method-list">{methods.map(m=>{return <button key={m.id} type="button" className={`method-row ${methodId===m.id?'on':''}`} onClick={()=>chooseMethod(m)}><i className="method-radio"/><RailLogo rail={m.rail} size={38} /><span className="method-text"><b>{m.label}</b><small className="mono">{m.accountNo}</small></span>{m.preferred&&<span className="pref-chip">Preferred</span>}</button>})}</div></>}
      <span className="eyebrow" style={{display:'block',margin:'12px 0 6px'}}>{methods.length?'Or pay another way':'Pay with'}</span>
      <div className="rail-cards">{RAILS.map(([id,label,mono,color])=><button key={id} type="button" className={`rail-card ${via===id&&!methodId?'on':''}`} onClick={()=>chooseRail(id)}><i style={{background:color}}>{mono}</i><b>{label}</b>{via===id&&!methodId&&<span className="tick"><Check/></span>}</button>)}</div>
      {wallets&&!methodId&&<><Field label={`${railMeta[1]} wallet number`}><input className="field" inputMode="tel" value={wallet} onChange={e=>setWallet(e.target.value)} placeholder="03XXXXXXXXX"/></Field>
      <label className="tos-check" style={{margin:'2px 0 8px'}}><input type="checkbox" checked={saveMethod} onChange={e=>setSaveMethod(e.target.checked)}/><span>Save this as my preferred way to pay</span></label></>}
      {via==='BANK_TRANSFER'&&<div className="warning-box">Send the transfer to the recipient directly from your banking app, then enter the transaction reference below.</div>}
      {via==='CASH'&&<div className="warning-box">Hand the cash to the recipient or host, then enter the receipt or slip number below.</div>}
      {!digital&&<Field label="Transaction reference"><input className="field" value={reference} onChange={e=>setReference(e.target.value)} placeholder="e.g. slip no. 739204"/></Field>}
      {error&&<div className="error-box">{error}</div>}
      {digital
        ?<button className="primary full checkout-pay" disabled={wallets&&wallet.replace(/\D/g,'').length<11} onClick={payNow}>Pay {money(amountPaisa)} securely</button>
        :<button className="primary full checkout-pay" disabled={reference.trim().length<4} onClick={record}>Confirm {money(amountPaisa)} record</button>}
      <p className="checkout-foot">Halqa never holds your money, it moves member to member and Halqa records it. {digital?'Digital rails run in sandbox until live credentials connect: this confirmation is instant and no real money moves.':''}</p>
    </>}
    {step==='processing'&&<div className="checkout-processing"><i className="pay-spinner"/><b>Contacting {railMeta[1]}…</b><span>Confirming your installment, don't close this window.</span></div>}
    {step==='failed'&&<div className="checkout-failed">
      <div className="failed-badge">!</div>
      <h3>Oops</h3>
      <p className="failed-sub">Something went wrong.<br/>Please try again.</p>
      {error&&<div className="failed-reason">{error}</div>}
      <button type="button" className="failed-cancel" onClick={close}>Cancel <X size={16}/></button>
      <button type="button" className="primary full failed-retry" onClick={()=>{setStep('select');setError('')}}>Try again →</button>
      <p className="checkout-foot">Nothing was recorded, your installment is untouched until a payment confirms.</p>
    </div>}
    {step==='receipt'&&receipt&&<div className="checkout-receipt">
      <div className={`receipt-badge ${receipt.live?'pending':''}`}>{receipt.live?<Clock/>:<Check/>}</div>
      <h3>{receipt.live?'Payment initiated':'Payment confirmed'}</h3>
      <div className="receipt-amount">{money(amountPaisa)}</div>
      <div className="receipt-rows">
        <div><span>Status</span><b className={receipt.live?'':'paid'}>{receipt.live?'AWAITING CONFIRMATION':'PAID'}</b></div>
        <div><span>Rail</span><b>{receipt.rail}{receipt.live?'':' · sandbox'}</b></div>
        <div><span>Reference</span><b className="mono">{receipt.ref}</b></div>
        <div><span>Circle</span><b>{committee.name} · round {round.roundNumber}</b></div>
        <div><span>Date</span><b>{dateTime(receipt.at)}</b></div>
        <div><span>Paid by</span><b>{user.fullName}</b></div>
      </div>
      <div className="form-actions"><button className="secondary" onClick={copyRef}>{copied?'Copied':'Copy reference'}</button><button className="primary" onClick={()=>void done()}>Done</button></div>
      <p className="checkout-foot">This receipt is recorded on the circle's ledger and counts toward your reliability score.</p>
    </div>}
  </section></div>}

function Growth({committee,active,host,action,myPosition}:{committee:Committee;active?:Round;host:boolean;action:(path:string,body?:unknown)=>Promise<void>;myPosition?:number}){const investment=active?.investments.find(item=>item.status==='ACTIVE');const principal=Number(active?.grossPoolPaisa||0)/100*committee.reinvestRatio;return <div className="growth-stack">{myPosition&&committee.mode!=='INVESTMENT'&&<section className="panel"><div className="panel-head"><div><span className="eyebrow">Your circle · turn #{myPosition}</span><h2>Month by month</h2><p>What you pay in, and what you collect at your turn.</p></div></div><Suspense fallback={<div className="chart-skeleton"/>}><PersonalGrowthChart committee={committee} turnPosition={myPosition}/></Suspense></section>}<RiskConsole committeeId={committee.id} host={host}/><div className="detail-grid"><section className="panel"><div className="panel-head"><div><span className="eyebrow">Member-visible performance</span><h2>{committee.scheme?.name||'No scheme selected'}</h2><p>{committee.scheme?.indicativeRatePct||0}% indicative · risk {committee.scheme?.riskScore||1}/10 · dated source</p></div></div><Suspense fallback={<div className="chart-skeleton"/>}><ProjectionChart principal={principal} rate={committee.scheme?.indicativeRatePct||0} months={Math.max(1,Math.ceil(committee.periodDays/30))}/></Suspense><div className="warning-box">Only the host can execute the group mandate.</div></section><section className="panel"><span className="eyebrow">Host execution</span><h2>{investment?'Simulation deployed':'Ready to deploy'}</h2><div className="info-stack"><div><span>Turn order</span><b>{committee.mode==='INVESTMENT'?'Investment':'Rotating'}</b></div><div><span>Allocation</span><b>{Math.round(committee.reinvestRatio*100)}%</b></div><div><span>Principal this round</span><b>{money(principal*100)}</b></div><div><span>Liquidity</span><b>{committee.scheme?.liquidityDays||0} days</b></div><div><span>Access</span><b>{host?'Host control':'Read only'}</b></div></div>{host&&active&&committee.reinvestRatio>0&&(investment?<button className="primary full" onClick={()=>action('liquidate',{idempotencyKey:key()})}>Simulate liquidation</button>:<button className="primary full" onClick={()=>action('invest',{idempotencyKey:key()})}>Simulate deployment</button>)}</section></div></div>}

type ChatMessage={id:string;senderId:string;body:string;sentAt:string;sender?:{fullName:string}};

function chatTime(iso:string){const d=new Date(iso);return isNaN(d.getTime())?'':d.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}
function Chat({committeeId,user}:{committeeId:string;user:User}){
  const [messages,setMessages]=useState<ChatMessage[]>([]);
  const [body,setBody]=useState('');
  const [error,setError]=useState('');
  const [sending,setSending]=useState(false);
  const end=useRef<HTMLDivElement|null>(null);
  const lastId=useRef<string|null>(null);

  // Messages come over HTTP now. The socket server this used to talk to is
  // started by server.ts, and production runs the Express app alone: a
  // serverless function cannot hold a socket open, so the Messages tab never
  // connected once in production. Polling is slower, and it works.
  useEffect(()=>{
    let alive=true;
    const pull=async()=>{
      try{
        const after=lastId.current;
        const d=await api<{messages:ChatMessage[]}>(`/chat/${committeeId}${after?`?after=${after}`:''}`);
        if(!alive||!d.messages?.length)return;
        lastId.current=d.messages[d.messages.length-1].id;
        setMessages(items=>after?[...items,...d.messages]:d.messages);
      }catch(reason){if(alive)setError((reason as Error).message)}
    };
    void pull();
    const timer=setInterval(()=>{void pull()},6000);
    return()=>{alive=false;clearInterval(timer)};
  },[committeeId]);

  useEffect(()=>{end.current?.scrollIntoView({behavior:'smooth'})},[messages.length]);

  const send=async()=>{
    const text=body.trim();
    if(!text)return;
    setSending(true);setError('');
    try{
      const m=await api<ChatMessage>(`/chat/${committeeId}`,{method:'POST',body:JSON.stringify({body:text})});
      lastId.current=m.id;
      setMessages(items=>[...items,m]);setBody('');
    }catch(reason){setError((reason as Error).message)}
    finally{setSending(false)}
  };

  return <section className="panel">
    <div className="panel-head"><div><h2>Messages</h2><p>Everyone in this committee can read these.</p></div></div>
    {error&&<div className="w-notice bad"><p>{error}</p></div>}
    <div className="chat-log">
      {messages.map(m=><div key={m.id} className={`chat-msg${m.senderId===user.id?' mine':''}`}>
        {m.senderId!==user.id&&<small className="chat-who">{m.sender?.fullName||'A member'}</small>}
        <p>{m.body}</p>
        <small className="chat-at">{chatTime(m.sentAt)}</small>
      </div>)}
      {!messages.length&&<p className="chat-empty">Nothing said yet. Say the first thing.</p>}
      <div ref={end}/>
    </div>
    <div className="chat-send">
      <input value={body} maxLength={2000} placeholder="Write to the committee"
             onChange={e=>setBody(e.target.value)}
             onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();void send()}}}/>
      <button className="primary" disabled={sending||!body.trim()} onClick={()=>void send()}><Send/></button>
    </div>
  </section>;
}
