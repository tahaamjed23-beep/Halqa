import { useEffect, useState } from 'react';
import { Crown, ShieldAlert, ShieldCheck } from 'lucide-react';
import { api } from '../api';
import { scoreColor } from './ui';

export type Reputation={userId:string;fullName:string;username:string;creditScore:number;paymentStreak:number;memberSince:string;hostedCompleted:number;hostedActive:number;cleanCompletions:number;paymentsResolved:number;onTimePct:number|null;missedPayments:number;defaultFlag:boolean;isBanned:boolean};

export function HostCard({reputation,title='Host record'}:{reputation:Reputation;title?:string}){
  const flagged=reputation.defaultFlag||reputation.isBanned;
  return <div className="host-card"><header><div><b><Crown/> {reputation.fullName}</b><span> @{reputation.username} · member since {new Date(reputation.memberSince).toLocaleDateString()}</span></div><strong style={{color:scoreColor(reputation.creditScore)}}>{reputation.creditScore}</strong></header>
  <div className="host-card-stats"><div><span>Cycles hosted to completion</span><b>{reputation.hostedCompleted}</b></div><div><span>Clean completions</span><b>{reputation.cleanCompletions}</b></div><div><span>On-time payments</span><b>{reputation.onTimePct===null?'No history':`${reputation.onTimePct}%`}</b></div><div><span>Missed payments</span><b>{reputation.missedPayments}</b></div></div>
  {flagged?<div className="host-card-flag"><ShieldAlert/> This account has a recorded default or restriction. Review carefully before committing money.</div>
    :reputation.paymentsResolved===0&&reputation.hostedCompleted===0?<div className="host-card-flag" style={{background:'#fdf1e3',color:'#a05c10'}}><ShieldAlert/> New account with no verified history yet. {title==='Host record'?'First-time hosts are normal, but start with people you know.':''}</div>
    :<div className="host-card-clean"><ShieldCheck/> Verified from recorded payment and completion events. Never self-reported.</div>}
  </div>;
}

export function HostCardById({userId}:{userId:string}){
  const [reputation,setReputation]=useState<Reputation|null>(null);const [error,setError]=useState('');
  useEffect(()=>{void api<Reputation>(`/profile/reputation/${userId}`).then(setReputation).catch(reason=>setError(reason.message))},[userId]);
  if(error)return <div className="error-box">{error}</div>;
  if(!reputation)return <div className="host-card"><header><b>Loading host record…</b></header></div>;
  return <HostCard reputation={reputation}/>;
}
