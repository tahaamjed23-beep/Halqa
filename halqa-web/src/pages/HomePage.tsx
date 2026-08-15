import { useEffect, useMemo, useState } from 'react';
import { ArrowDownLeft, ArrowUpRight, Bell, CalendarClock, CheckCircle2, ChevronRight, CreditCard, Eye, EyeOff, Flame, Gauge, Gift, Landmark, Receipt, Users, Wallet, Zap } from 'lucide-react';
import { api, money } from '../api';
import type { Committee, Summary, User } from '../types';
import { formatDuration } from '../components/ui';

const GREETINGS=['Assalam-o-alaikum','السلام علیکم','آداب','خوش آمدید','جی آیاں نوں','پخیر راغلې','ڀلي ڪري آيا'];

export function cached<T>(cacheKey:string,fallback:T):T{try{const raw=localStorage.getItem(`halqa.cache.${cacheKey}`);return raw?JSON.parse(raw) as T:fallback}catch{return fallback}}
export function keep(cacheKey:string,value:unknown){try{localStorage.setItem(`halqa.cache.${cacheKey}`,JSON.stringify(value))}catch{/* full */}}

export default function HomePage({user,openCommittee,create,go}:{user:User;openCommittee:(id:string)=>void;create:()=>void;go:(page:string)=>void}){
  const [committees,setCommittees]=useState<Committee[]>(()=>cached('home.committees',[]));
  const [summary,setSummary]=useState<Summary|null>(()=>cached('home.summary',null));
  const [hide,setHide]=useState(()=>localStorage.getItem('halqa.hideBal')==='1');
  const [,tick]=useState(0);
  const [greeting]=useState(()=>GREETINGS[Math.floor(Math.random()*GREETINGS.length)]);

  useEffect(()=>{void Promise.all([
    api<Committee[]>('/committees?scope=mine').catch(()=>[] as Committee[]),
    api<Summary>('/profile/summary').catch(()=>null),
  ]).then(([rows,data])=>{
    const mine=rows.filter(r=>r.members?.some(m=>m.userId===user.id)||r.hostId===user.id);
    setCommittees(mine);keep('home.committees',mine);
    if(data){setSummary(data);keep('home.summary',data)}
  })},[user.id]);
  useEffect(()=>{const t=setInterval(()=>tick(v=>v+1),60000);return()=>clearInterval(t)},[]);

  const sorted=useMemo(()=>[...committees].sort((a,b)=>Number(b.status==='ACTIVE')-Number(a.status==='ACTIVE')),[committees]);
  const active=sorted.filter(c=>c.status==='ACTIVE');
  const due=summary?.nextInstallment;
  const mask=(v:string)=>hide?'••••••':v;
  const toggle=()=>{const next=!hide;setHide(next);localStorage.setItem('halqa.hideBal',next?'1':'0')};

  return <div className="enter">
    <header className="hdr">
      <div className="hdr-row">
        <div className="avatar">{user.fullName.charAt(0).toUpperCase()}</div>
        <div className="hdr-id">
          <small>{greeting}</small>
          <strong>{user.fullName}</strong>
        </div>
        <button className="hdr-btn" aria-label="Notifications" onClick={()=>window.dispatchEvent(new CustomEvent('halqa:open-notices'))}>
          <Bell/><i className="dot"/>
        </button>
      </div>
    </header>

    <div className="sheet">
      <div className="bal-card">
        <div className="bal-top">
          <div>
            <div className="bal-lab"><Wallet/> Total recorded</div>
            <div className="bal-amt">{mask(money(summary?.balancePaisa||0))}</div>
            <div className="bal-sub">Across {summary?.activeCommittees||0} active {summary?.activeCommittees===1?'committee':'committees'}</div>
          </div>
          <button className="bal-eye" onClick={toggle} aria-label={hide?'Show balance':'Hide balance'}>{hide?<EyeOff/>:<Eye/>}</button>
        </div>
        <div className="bal-split">
          <div><span>Next installment</span><strong>{due?mask(money(due.amountPaisa)):''}</strong></div>
          <div><span>Due in</span><strong>{due?formatDuration(due.dueAt):'Nothing due'}</strong></div>
          <div><span>Sakh</span><strong style={{color:'var(--l600)'}}>{user.creditScore}</strong></div>
        </div>
      </div>
    </div>

    <div className="qa">
      <Action icon={<Zap/>} label="Pay now" solid onClick={()=>go('pay')}/>
      <Action icon={<Users/>} label="Join circle" onClick={()=>go('circles')}/>
      <Action icon={<Flame/>} label="HYPER" onClick={()=>go('hyper')}/>
      <Action icon={<Landmark/>} label="Auto debit" onClick={()=>go('cards')}/>
      <Action icon={<CreditCard/>} label="Cards" onClick={()=>go('cards')}/>
      <Action icon={<Receipt/>} label="Receipts" onClick={()=>go('activity')}/>
      <Action icon={<Gauge/>} label="Sakh score" tone="blue" onClick={()=>go('credit')}/>
      <Action icon={<Gift/>} label="Rewards" tone="amber" onClick={()=>go('rewards')}/>
    </div>

    {due&&<div className="sec">
      <div className="card" style={{background:'var(--l50)',borderColor:'var(--l200)'}}>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <div className="row-ic" style={{background:'var(--l500)',color:'#fff'}}><CalendarClock/></div>
          <div className="row-body">
            <strong>{due.committee.name}</strong>
            <span>Installment of {money(due.amountPaisa)} · due {formatDuration(due.dueAt)}</span>
          </div>
        </div>
        <button className="btn" style={{marginTop:13}} onClick={()=>go('pay')}><Zap/>Pay {money(due.amountPaisa)}</button>
      </div>
    </div>}

    <div className="sec">
      <div className="sec-head">
        <h2>Your committees</h2>
        <button onClick={()=>go('circles')}>See all</button>
      </div>
      {active.length?active.slice(0,3).map((c,i)=><CommitteeCard key={c.id} c={c} userId={user.id} i={i} open={openCommittee}/>):
        <div className="card"><div className="empty" style={{padding:'22px 10px'}}>
          <div className="empty-ic"><Users/></div>
          <strong>No active committee</strong>
          <p>Start one with people you know, or join an open circle matched by income and score.</p>
          <div className="btn-pair" style={{marginTop:16}}>
            <button className="btn" onClick={create}>Start one</button>
            <button className="btn ghost" onClick={()=>go('circles')}>Browse</button>
          </div>
        </div></div>}
    </div>

    <div className="sec">
      <div className="sec-head"><h2>Recent activity</h2><button onClick={()=>go('activity')}>All</button></div>
      <Activity committees={sorted} userId={user.id}/>
    </div>

    <div style={{height:10}}/>
  </div>;
}

function Action({icon,label,onClick,solid,tone}:{icon:React.ReactNode;label:string;onClick?:()=>void;solid?:boolean;tone?:'amber'|'blue'}){
  return <button className="qa-item" onClick={onClick}>
    <span className={`qa-ic ${solid?'solid':''} ${tone||''}`}>{icon}</span>
    <span>{label}</span>
  </button>;
}

export function CommitteeCard({c,userId,i,open}:{c:Committee;userId:string;i:number;open:(id:string)=>void}){
  const round=c.rounds?.[0];
  const paid=round?.payments?.filter(p=>p.status==='PAID').length||0;
  const total=round?.payments?.length||c.members?.length||0;
  const mine=c.members?.find(m=>m.userId===userId);
  const myPayout=c.rounds?.find(r=>r.recipientId===userId&&r.status!=='CLOSED');
  const initials=c.name.split(' ').map(w=>w[0]).slice(0,2).join('').toUpperCase();
  return <button className="cm-card stagger" style={{animationDelay:`${i*60}ms`}} onClick={()=>open(c.id)}>
    <div className="cm-top">
      <div className="cm-badge">{initials}</div>
      <div className="cm-t">
        <h3>{c.name}</h3>
        <p>{c.hostId===userId?'You host this':`Hosted by ${c.host?.fullName||''}`}</p>
      </div>
      <ChevronRight style={{color:'var(--faint)',flex:'none',marginTop:4}}/>
    </div>
    <div className="cm-grid">
      <div><span>Installment</span><strong>{money(c.contributionPaisa)}</strong></div>
      <div><span>Members</span><strong>{c.members?.length||0}/{c.memberCap}</strong></div>
      <div><span>Your turn</span><strong>{mine?.turnPosition?`#${mine.turnPosition}`:''}</strong></div>
    </div>
    {total>0&&<div className="cm-bar">
      <div className="cm-bar-top"><span>Round {round?.roundNumber||1} collection</span><b>{paid}/{total} paid</b></div>
      <div className="track"><i style={{width:`${total?paid/total*100:0}%`}}/></div>
    </div>}
    {myPayout&&<div className="cm-due"><CalendarClock/><span>Your payout in <b>{formatDuration(myPayout.payoutDate)}</b></span></div>}
  </button>;
}

function Activity({committees,userId}:{committees:Committee[];userId:string}){
  const items=useMemo(()=>{
    const out:{id:string;kind:'in'|'out'|'wait';title:string;sub:string;amt:string}[]=[];
    committees.forEach(c=>c.rounds?.forEach(r=>{
      if(r.recipientId===userId&&r.status==='CLOSED')out.push({id:`p${r.id}`,kind:'in',title:`Payout received`,sub:`${c.name} · round ${r.roundNumber}`,amt:money(r.payoutPaisa)});
      r.payments?.filter(p=>p.payerId===userId).forEach(p=>out.push({
        id:p.id,
        kind:p.status==='PAID'?'out':'wait',
        title:p.status==='PAID'?'Installment paid':'Installment due',
        sub:`${c.name} · ${p.paidVia||'Raast'}`,
        amt:money(p.amountPaisa),
      }));
    }));
    return out.slice(0,6);
  },[committees,userId]);
  if(!items.length)return <div className="card"><div className="empty" style={{padding:'20px 10px'}}><div className="empty-ic"><Receipt/></div><strong>No activity yet</strong><p>Your paid installments and received payouts appear here with a receipt for each.</p></div></div>;
  return <div className="list">{items.map(it=>(
    <div className="row" key={it.id}>
      <div className={`row-ic ${it.kind}`}>{it.kind==='in'?<ArrowDownLeft/>:it.kind==='out'?<ArrowUpRight/>:<CalendarClock/>}</div>
      <div className="row-body"><strong>{it.title}</strong><span>{it.sub}</span></div>
      <div className="row-amt">
        <b className={it.kind==='in'?'in':''}>{it.kind==='in'?'+':''}{it.amt}</b>
        <small>{it.kind==='wait'?'Pending':<><CheckCircle2 style={{width:10,height:10,display:'inline',verticalAlign:-1}}/> Settled</>}</small>
      </div>
    </div>
  ))}</div>;
}
