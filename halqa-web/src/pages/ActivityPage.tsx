import { useEffect, useMemo, useState } from 'react';
import { ArrowDownLeft, ArrowLeft, ArrowUpRight, CalendarClock, CheckCircle2, Receipt as ReceiptIcon, Search } from 'lucide-react';
import { api, money } from '../api';
import type { Committee, User } from '../types';
import ReceiptSheet, { type ReceiptData } from '../components/Receipt';

type Item={id:string;kind:'in'|'out'|'wait';title:string;sub:string;amt:string;paisa:string;when:string;rail:string;committee:string;round:number;counterparty:string};

export default function ActivityPage({user,back}:{user:User;back:()=>void}){
  const [committees,setCommittees]=useState<Committee[]>([]);
  const [q,setQ]=useState('');
  const [filter,setFilter]=useState<'all'|'in'|'out'|'wait'>('all');
  const [open,setOpen]=useState<ReceiptData|null>(null);

  useEffect(()=>{void api<Committee[]>('/committees?scope=mine').then(setCommittees).catch(()=>setCommittees([]))},[]);

  const items=useMemo(()=>{
    const out:Item[]=[];
    committees.forEach(c=>c.rounds?.forEach(r=>{
      if(r.recipientId===user.id)out.push({
        id:`p${r.id}`,kind:'in',title:'Payout received',sub:`${c.name} · round ${r.roundNumber}`,
        amt:money(r.payoutPaisa),paisa:r.payoutPaisa,when:r.payoutDate,rail:'Raast',
        committee:c.name,round:r.roundNumber,counterparty:`${c.members?.length||0} members`,
      });
      r.payments?.filter(p=>p.payerId===user.id).forEach(p=>out.push({
        id:p.id,kind:p.status==='PAID'?'out':'wait',
        title:p.status==='PAID'?'Installment paid':'Installment due',
        sub:`${c.name} · round ${r.roundNumber}`,
        amt:money(p.amountPaisa),paisa:p.amountPaisa,when:r.dueDate,rail:p.paidVia||'Raast',
        committee:c.name,round:r.roundNumber,counterparty:r.recipient?.fullName||'This round',
      }));
    }));
    return out.sort((a,b)=>new Date(b.when).getTime()-new Date(a.when).getTime());
  },[committees,user.id]);

  const shown=items.filter(i=>(filter==='all'||i.kind===filter)&&(!q||`${i.title} ${i.sub}`.toLowerCase().includes(q.toLowerCase())));

  return <div className="enter">
    <div className="topbar">
      <button className="back" onClick={back}><ArrowLeft/></button>
      <h1>Activity</h1>
    </div>
    <div style={{padding:'12px 14px 0'}}>
      <div style={{position:'relative'}}>
        <Search style={{position:'absolute',left:14,top:'50%',transform:'translateY(-50%)',width:17,height:17,color:'var(--faint)'}}/>
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search receipts" style={{paddingLeft:40,height:46}}/>
      </div>
    </div>
    <div className="pillbar" style={{marginTop:11}}>
      {(['all','out','in','wait'] as const).map(f=>(
        <button key={f} className={filter===f?'on':''} onClick={()=>setFilter(f)}>
          {f==='all'?'All':f==='out'?'Paid':f==='in'?'Received':'Pending'}
        </button>
      ))}
    </div>
    <div style={{padding:14}}>
      {shown.length?<div className="list">{shown.map(i=>(
        <button className="row" key={i.id} style={{width:'100%',textAlign:'left'}} onClick={()=>setOpen({
          title:i.title,amountPaisa:i.paisa,reference:`RCPT-${i.id.slice(0,8).toUpperCase()}`,rail:i.rail,
          status:i.kind==='wait'?'PENDING':'SETTLED',
          stamp:new Date(i.when).toLocaleString('en-PK',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'}),
          rows:[['Committee',i.committee],['Round',`#${i.round}`],[i.kind==='in'?'From':'To',i.counterparty],['Member',user.fullName]],
        })}>
          <div className={`row-ic ${i.kind}`}>{i.kind==='in'?<ArrowDownLeft/>:i.kind==='out'?<ArrowUpRight/>:<CalendarClock/>}</div>
          <div className="row-body"><strong>{i.title}</strong><span>{i.sub}</span></div>
          <div className="row-amt">
            <b className={i.kind==='in'?'in':''}>{i.kind==='in'?'+':''}{i.amt}</b>
            <small>{i.kind==='wait'?'Pending':<><CheckCircle2 style={{width:10,height:10,display:'inline',verticalAlign:-1}}/> Settled</>}</small>
          </div>
        </button>
      ))}</div>:<div className="card"><div className="empty" style={{padding:'26px 10px'}}>
        <div className="empty-ic"><ReceiptIcon/></div>
        <strong>Nothing here</strong>
        <p>Every installment and payout produces a receipt with its own reference, and they all land on this screen.</p>
      </div></div>}
    </div>
    {open&&<ReceiptSheet data={open} onClose={()=>setOpen(null)}/>}
  </div>;
}
