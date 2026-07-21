import { useEffect, useState } from 'react';
import { ChevronLeft, ShieldCheck, TrendingUp } from 'lucide-react';
import { api, money } from '../api';
import type { User } from '../types';
import { ScoreRing } from '../components/ui';

// The credit profile, as its own page — a proper bureau-style dashboard built
// from the member's real Halqa record: score gauge and band, month-by-month
// payment history, score movement, and the factors behind it. Everything here
// derives from data the member can already see; nothing new is collected.

type CreditEvent={id:string;reason:string;scoredAt:string;delta:number};
type PaymentRow={id:string;amountPaisa:string;status:string;paidAt?:string|null;round:{roundNumber:number;committee:{name:string}}};

const BAND=(score:number)=>score>=760?{label:'Excellent',color:'#3f7d4e',note:'Top-tier reliability. Early turns and hosting are open to you.'}
  :score>=700?{label:'Good',color:'#7a9a3f',note:'Solid standing — hosting unlocked, strong slot ranking.'}
  :score>=640?{label:'Fair',color:'#c28f1f',note:'Building. On-time rounds lift you toward hosting rights at 700.'}
  :{label:'Needs work',color:'#b3563a',note:'Recent misses are weighing. Every on-time round recovers ground.'};

const DOT=(status:string)=>status==='PAID'?{c:'#3f7d4e',t:'On time'}:status==='LATE'?{c:'#c28f1f',t:'Late'}:status==='MISSED'?{c:'#b3563a',t:'Missed'}:{c:'#d8d2bd',t:'Pending'};

export default function CreditPage({user,back}:{user:User;back:()=>void}){
  const [events,setEvents]=useState<CreditEvent[]>([]);const [payments,setPayments]=useState<PaymentRow[]>([]);
  useEffect(()=>{void Promise.all([api<CreditEvent[]>('/profile/credit'),api<PaymentRow[]>('/payments/mine')]).then(([ev,rows])=>{setEvents(ev);setPayments(rows)})},[]);
  const band=BAND(user.creditScore);
  const recent=payments.slice(0,12);
  const onTimePct=payments.length?Math.round(payments.filter(p=>p.status==='PAID').length/payments.length*100):null;
  // Walk the score backwards through events to draw the last months of movement.
  const trend=(()=>{const points:{score:number}[]=[{score:user.creditScore}];let s=user.creditScore;for(const e of events.slice(0,11)){s-=e.delta;points.unshift({score:s})}return points})();
  const min=Math.min(...trend.map(p=>p.score),640);const max=Math.max(...trend.map(p=>p.score),780);
  const negatives=events.filter(e=>e.delta<0).length;const positives=events.filter(e=>e.delta>0).length;
  return <div className="page narrow enter">
    <button className="back-link" onClick={back}><ChevronLeft/>Back to profile</button>
    <div className="page-head"><div><span className="eyebrow">Your credit profile</span><h1>Halqa reliability report</h1><p>Built from your real committee record — the same score circles use to rank turn order.</p></div></div>

    <section className="panel credit-hero">
      <div className="credit-gauge"><ScoreRing score={user.creditScore}/><div className="credit-band" style={{color:band.color}}><b>{band.label}</b><span>{band.note}</span></div></div>
      <div className="credit-stats">
        <div><span>On-time rate</span><b>{onTimePct===null?'No history yet':`${onTimePct}%`}</b></div>
        <div><span>Recorded installments</span><b>{payments.length}</b></div>
        <div><span>Hosting</span><b>{user.creditScore>=700?'Unlocked':'At 700'}</b></div>
      </div>
    </section>

    <section className="panel"><div className="panel-head"><div><span className="eyebrow">Payment history</span><h2>Your last {recent.length||12} installments</h2><p>Green is on time. This row is what a host sees when they rank turns.</p></div><ShieldCheck/></div>
      <div className="history-dots">{recent.length?recent.map(p=>{const d=DOT(p.status);return <div key={p.id} className="history-dot" title={`${p.round.committee.name} · round ${p.round.roundNumber} · ${money(p.amountPaisa)} · ${d.t}`} style={{background:d.c}}/>}):<p className="muted">No installments recorded yet — join a circle to start your history.</p>}</div>
      <div className="dot-legend"><span><i style={{background:'#3f7d4e'}}/>On time</span><span><i style={{background:'#c28f1f'}}/>Late</span><span><i style={{background:'#b3563a'}}/>Missed</span><span><i style={{background:'#d8d2bd'}}/>Pending</span></div>
    </section>

    <section className="panel"><div className="panel-head"><div><span className="eyebrow">Score movement</span><h2>How your score has moved</h2><p>Each bar is a score event — payments, completions, penalties.</p></div><TrendingUp/></div>
      <div className="trend-bars">{trend.map((p,i)=><div key={i} className="trend-bar" title={`${p.score}`}><i style={{height:`${Math.max(8,(p.score-min)/(max-min||1)*100)}%`,background:i===trend.length-1?'#b08d2f':'#e2d7b8'}}/><span>{i===trend.length-1?'Now':''}</span></div>)}</div>
    </section>

    <section className="panel"><div className="panel-head"><div><span className="eyebrow">Score factors</span><h2>Factors</h2></div></div>
      <div className="factor-rows">
        <div><i className="factor-pill up">{positives}</i><span><b>Positive events</b><small>On-time rounds, clean completions, streaks</small></span></div>
        <div><i className="factor-pill down">{negatives}</i><span><b>Negative events</b><small>Late or missed installments and penalties</small></span></div>
        <div><i className="factor-pill">{user.kycLevel}</i><span><b>Identity level</b><small>CNIC on file ranks you ahead for early turns</small></span></div>
      </div>
    </section>

    <section className="panel"><div className="panel-head"><div><span className="eyebrow">History</span><h2>Recent events</h2></div></div>
      <div className="history-list">{events.slice(0,10).map(e=><article key={e.id}><div><b>{e.reason}</b><span>{new Date(e.scoredAt).toLocaleDateString()}</span></div><strong className={e.delta>=0?'profit':'loss'}>{e.delta>0?'+':''}{e.delta}</strong></article>)}{!events.length&&<p className="muted">No score events yet.</p>}</div>
    </section>
  </div>;
}
