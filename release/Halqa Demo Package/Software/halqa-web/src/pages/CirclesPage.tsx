import { useEffect, useState } from 'react';
import { Plus, X } from 'lucide-react';
import { api, money } from '../api';
import type { Committee, User } from '../types';
import { CircleCard } from './HomePage';
import { Empty, modeName } from '../components/ui';
import { HostCard, type Reputation } from '../components/HostCard';

type Preview={id:string;name:string;mode:'ROTATING'|'HYBRID'|'INVESTMENT';status:string;memberCount:number;memberCap:number;contributionPaisa:string;periodDays:number;reinvestRatio:number;riskScore:number;riskBand:string;distributionMode:string;scheme:{name:string;riskScore:number;indicativeRatePct:number}|null;host:Reputation};

export default function CirclesPage({user,openCommittee,create}:{user:User;openCommittee:(id:string)=>void;create:()=>void}){
  const [rows,setRows]=useState<Committee[]>([]);const [code,setCode]=useState('');const [error,setError]=useState('');const [preview,setPreview]=useState<Preview|null>(null);const [busy,setBusy]=useState(false);
  const load=()=>api<Committee[]>('/committees').then(setRows);useEffect(()=>{void load()},[]);
  const inspect=async()=>{try{setError('');setBusy(true);setPreview(await api<Preview>(`/committees/preview/${encodeURIComponent(code.trim())}`))}catch(reason){setError((reason as Error).message)}finally{setBusy(false)}};
  const join=async()=>{try{setError('');setBusy(true);await api('/committees/join',{method:'POST',body:JSON.stringify({inviteCode:code.trim()})});setCode('');setPreview(null);await load()}catch(reason){setError((reason as Error).message)}finally{setBusy(false)}};
  return <div className="page enter"><div className="page-head"><div><span className="eyebrow">Savings network</span><h1>Committees</h1><p>Member capacity and duration are configured independently.</p></div><button className="primary" onClick={create}><Plus/>Create</button></div><div className="join-bar"><input className="field" value={code} onChange={e=>{setCode(e.target.value);setPreview(null)}} placeholder="Enter invite code"/><button className="secondary" disabled={busy||code.trim().length<3} onClick={inspect}>Check before joining</button></div>{error&&<div className="error-box">{error}</div>}
  {preview&&<section className="panel" style={{display:'grid',gap:12}}><div className="panel-head"><div><span className="eyebrow">{modeName[preview.mode]} · risk {preview.riskScore}/10 {preview.riskBand}</span><h2>{preview.name}</h2><p>{money(preview.contributionPaisa)} every {preview.periodDays} days · {preview.memberCount}/{preview.memberCap} members · {Math.round(preview.reinvestRatio*100)}% growth allocation{preview.scheme?` into ${preview.scheme.name}`:''}</p></div><button className="icon-button" aria-label="Close preview" onClick={()=>setPreview(null)}><X/></button></div><HostCard reputation={preview.host}/><button className="primary" disabled={busy||preview.status!=='FORMING'} onClick={join}>{preview.status==='FORMING'?`Join ${preview.name}`:'This circle has already started'}</button></section>}
  <section className="circle-grid">{rows.map((committee,index)=><CircleCard key={committee.id} committee={committee} userId={user.id} index={index} open={openCommittee}/>)}{!rows.length&&<Empty text="No committees are available."/>}</section></div>
}
