import { date } from '../lib/format';
import { useEffect, useState } from 'react';
import { Crown, ShieldAlert, ShieldCheck, MapPin, Briefcase } from 'lucide-react';
import { api } from '../api';
import { scoreColor } from './ui';

export type Reputation={userId:string;fullName:string;username:string;creditScore:number;paymentStreak:number;memberSince:string;hostedCompleted:number;hostedActive:number;cleanCompletions:number;paymentsResolved:number;onTimePct:number|null;missedPayments:number;defaultFlag:boolean;isBanned:boolean;city?:string|null;locality?:string|null;occupationType?:string|null;jobTitle?:string|null};

const OCC_LABEL:Record<string,string>={EMPLOYED:'Employed',BUSINESS_OWNER:'Business owner',SELF_EMPLOYED:'Self-employed',HOUSEWIFE:'Housewife',STUDENT:'Student',RETIRED:'Retired',OTHER:''};
// The public trust line, broad location (city + area, never the house number)
// and the member's job (never the employer). For a housewife jobTitle holds the
// husband's job, so we prefix it.
function placeLine(r:Reputation){return [r.city,r.locality].filter(Boolean).join(' · ')}
function jobLine(r:Reputation){const job=(r.jobTitle||'').trim();if(r.occupationType==='HOUSEWIFE')return job?`Housewife · husband: ${job}`:'Housewife';return job||OCC_LABEL[r.occupationType||'']||''}

export function HostCard({reputation,title='Host record'}:{reputation:Reputation;title?:string}){
  const flagged=reputation.defaultFlag||reputation.isBanned;
  const place=placeLine(reputation),job=jobLine(reputation);
  return <div className="host-card"><header><div><b><Crown/> {reputation.fullName}</b><span> @{reputation.username} · member since {date(reputation.memberSince)}</span></div><strong style={{color:scoreColor(reputation.creditScore)}}>{reputation.creditScore}</strong></header>
  {(place||job)&&<div className="host-card-trust">{place&&<span><MapPin size={13}/> {place}</span>}{job&&<span><Briefcase size={13}/> {job}</span>}</div>}
  <div className="host-card-stats"><div><span>Cycles hosted to completion</span><b>{reputation.hostedCompleted}</b></div><div><span>Clean completions</span><b>{reputation.cleanCompletions}</b></div><div><span>On-time payments</span><b>{reputation.onTimePct===null?'No history':`${reputation.onTimePct}%`}</b></div><div><span>Missed payments</span><b>{reputation.missedPayments}</b></div></div>
  {flagged?<div className="host-card-flag"><ShieldAlert/> This account has a recorded default or restriction. Review carefully before committing money.</div>
    :reputation.paymentsResolved===0&&reputation.hostedCompleted===0?<div className="host-card-flag" style={{background:'#fdf1e3',color:'#a05c10'}}><ShieldAlert/> New account, no history yet. {title==='Host record'?'First-time hosts are normal. Start with people you know.':''}</div>
    :<div className="host-card-clean"><ShieldCheck/> Built from payments Halqa recorded, not from anything they typed.</div>}
  </div>;
}

export function HostCardById({userId}:{userId:string}){
  const [reputation,setReputation]=useState<Reputation|null>(null);const [error,setError]=useState('');
  useEffect(()=>{void api<Reputation>(`/profile/reputation/${userId}`).then(setReputation).catch(reason=>setError(reason.message))},[userId]);
  if(error)return <div className="error-box">{error}</div>;
  if(!reputation)return <div className="host-card"><header><b>Loading host record…</b></header></div>;
  return <HostCard reputation={reputation}/>;
}
