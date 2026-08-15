import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Check, Flame, Gavel, Info } from 'lucide-react';
import { money } from '../api';
import type { User } from '../types';

// HYPER: four hundred members, sixty days, daily contributions, six or seven
// members collecting each day, positions set once by a twenty four hour
// opening auction and fixed for the cycle thereafter.
const TIERS=[
  {daily:100,pot:6000},
  {daily:150,pot:9000},
  {daily:200,pot:12000},
  {daily:250,pot:15000},
];
const ROSTER=400,DAYS=60;
const PER_DAY=Math.round(ROSTER/DAYS*10)/10;

export default function HyperPage({user,back}:{user:User;back:()=>void}){
  const [tier,setTier]=useState(1);
  const [day,setDay]=useState<number|null>(null);
  const [bid,setBid]=useState('');
  const [placed,setPlaced]=useState<{day:number;amount:number}|null>(null);
  const [left,setLeft]=useState(23*3600+41*60+12);
  useEffect(()=>{const t=setInterval(()=>setLeft(v=>Math.max(0,v-1)),1000);return()=>clearInterval(t)},[]);
  const t=TIERS[tier];
  const eligible=user.creditScore>=650&&(user.committeesCompletedClean||0)>=2;

  // Standing highest bid per day. Early days carry the largest forward
  // liability and therefore the largest premium; the last days clear at nil.
  const days=useMemo(()=>Array.from({length:DAYS},(_,i)=>{
    const d=i+1;
    const seats=d<=40?7:6;
    const curve=Math.max(0,Math.round((DAYS-d)/DAYS*(t.pot*0.055)/10)*10);
    return{d,seats,taken:d<=6?seats:d<=14?Math.floor(seats/2):0,top:curve};
  }),[t.pot]);

  const hh=String(Math.floor(left/3600)).padStart(2,'0');
  const mm=String(Math.floor(left%3600/60)).padStart(2,'0');
  const ss=String(left%60).padStart(2,'0');
  const chosen=days.find(x=>x.d===day);

  return <div className="enter">
    <div className="topbar">
      <button className="back" onClick={back}><ArrowLeft/></button>
      <h1>HYPER committees</h1>
      <span className="chip solid"><Flame/>Daily</span>
    </div>

    <div style={{padding:14}}>
      <div className="card" style={{background:'linear-gradient(150deg,#22450C,#41801A 60%,#6DC72A)',color:'#fff',border:'none'}}>
        <div style={{display:'flex',alignItems:'center',gap:8,fontSize:12.5,fontWeight:600,opacity:.92}}><Flame style={{width:16,height:16}}/>Sixty days · four hundred members</div>
        <div style={{fontSize:30,fontWeight:760,letterSpacing:'-.035em',marginTop:8,fontVariantNumeric:'tabular-nums'}}>{money(t.pot*100)}</div>
        <div style={{fontSize:12.5,opacity:.9,marginTop:3}}>pot, paid to {PER_DAY} members a day across {ROSTER}</div>
        <div style={{display:'flex',gap:16,marginTop:15,paddingTop:14,borderTop:'1px solid rgba(255,255,255,.22)'}}>
          <div><div style={{fontSize:11,opacity:.85}}>You pay daily</div><div style={{fontSize:16,fontWeight:700,marginTop:2}}>Rs {t.daily}</div></div>
          <div><div style={{fontSize:11,opacity:.85}}>Over the cycle</div><div style={{fontSize:16,fontWeight:700,marginTop:2}}>{money(t.pot*100)}</div></div>
          <div><div style={{fontSize:11,opacity:.85}}>Cover premium</div><div style={{fontSize:16,fontWeight:700,marginTop:2}}>15%</div></div>
        </div>
      </div>

      <div className="sec-head" style={{marginTop:18}}><h2>Choose your daily amount</h2></div>
      <div className="pillbar" style={{padding:0}}>
        {TIERS.map((x,i)=><button key={x.daily} className={tier===i?'on':''} onClick={()=>{setTier(i);setDay(null)}}>Rs {x.daily} a day</button>)}
      </div>

      {!eligible&&<div className="banner" style={{margin:'16px 0 0'}}>
        <Info/><div><b>Not open to you yet</b><p>HYPER needs a Sakh of 650 or above and two completed committees with a clean record. You are at {user.creditScore} with {user.committeesCompletedClean||0} completed.</p></div>
      </div>}

      <div className="card" style={{marginTop:16}}>
        <div style={{display:'flex',alignItems:'center',gap:9,marginBottom:12}}>
          <div className="row-ic" style={{background:'var(--ink)',color:'#fff'}}><Gavel/></div>
          <div className="row-body"><strong>Opening auction</strong><span>Bidding closes in</span></div>
        </div>
        <div className="countdown">
          <div><b>{hh}</b><span>hrs</span></div>
          <div><b>{mm}</b><span>min</span></div>
          <div><b>{ss}</b><span>sec</span></div>
        </div>
        <p className="note" style={{textAlign:'center'}}>Bid for <b>one</b> day only. You may raise your bid on that day as often as you like. Everything not taken at auction is drawn by ballot, and only a winning bid is charged.</p>
      </div>

      <div className="sec-head" style={{marginTop:18}}><h2>Pick a collection day</h2><span>{DAYS} days</span></div>
      <div style={{maxHeight:340,overflow:'auto',paddingRight:2}}>
        {days.slice(0,20).map(x=>{
          const full=x.taken>=x.seats;
          return <button key={x.d} className={`auc-day ${day===x.d?'on':''} ${full?'full':''}`} disabled={full||!eligible} onClick={()=>{setDay(x.d);setBid(String(x.top+50))}}>
            <span className="auc-d"><b>{x.d}</b><span>day</span></span>
            <span className="auc-b">
              <strong>Collect {money(t.pot*100)}</strong>
              <span>{x.seats-x.taken} of {x.seats} places left · you owe {money((DAYS-x.d)*t.daily*100)} after</span>
            </span>
            <span className="auc-bid"><b>{x.top?`Rs ${x.top}`:'No bid'}</b><small>top bid</small></span>
          </button>;
        })}
      </div>

      {chosen&&<div className="card" style={{marginTop:14}}>
        <label className="fld" style={{marginBottom:10}}>
          <span>Your bid for day {chosen.d}</span>
          <div className="amt-input"><i>Rs</i><input inputMode="numeric" value={bid} onChange={e=>setBid(e.target.value.replace(/\D/g,''))}/></div>
          <small>Must beat the standing top bid of Rs {chosen.top}. Paid to Halqa in full only if you win.</small>
        </label>
        <button className="btn" disabled={Number(bid)<=chosen.top} onClick={()=>setPlaced({day:chosen.d,amount:Number(bid)})}>
          <Gavel/>Place bid
        </button>
      </div>}

      {placed&&<div className="banner info" style={{margin:'14px 0 0'}}>
        <Check/><div><b>Bid placed on day {placed.day}</b><p>Rs {placed.amount} standing. You will be charged only if you are still the highest bidder when the window closes.</p></div>
      </div>}

      <div style={{height:18}}/>
    </div>
  </div>;
}

