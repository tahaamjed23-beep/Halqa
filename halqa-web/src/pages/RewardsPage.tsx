import { useEffect, useState } from 'react';
import { ArrowLeft, Check, Flame, Lock } from 'lucide-react';
import type { User } from '../types';
import { api } from '../api';

// Streak ladder. Every reward is either the retailer's own promotional
// discount (their acquisition spend, not ours) or a waiver of a charge Halqa
// would otherwise collect. Nothing is redeemable for cash at any tier.
const LADDER=[
  {n:3,retail:'5% off at a partner store, up to Rs 500',platform:''},
  {n:6,retail:'10% off up to Rs 1,000, plus delivery waived',platform:''},
  {n:12,retail:'12% off up to Rs 2,000',platform:'One month of cover premium waived'},
  {n:18,retail:'Category offer up to Rs 3,000',platform:'Fill fee waived on your next circle'},
  {n:24,retail:'15% off up to Rs 4,000',platform:'Early seat fee waived on your next circle'},
  {n:36,retail:'Top tier offer up to Rs 6,000',platform:'Early seat fee and one month premium waived'},
];
const PARTNERS=[
  {name:'Daraz',cat:'Everything',bg:'linear-gradient(135deg,#F85606,#FF8A3D)',code:'DZ'},
  {name:'Foodpanda',cat:'Food delivery',bg:'linear-gradient(135deg,#D70F64,#F0468B)',code:'FP'},
  {name:'Bykea',cat:'Rides and delivery',bg:'linear-gradient(135deg,#0F9D58,#3CC97C)',code:'BK'},
  {name:'Naheed',cat:'Grocery',bg:'linear-gradient(135deg,#0B5FA5,#2C8BD6)',code:'NH'},
  {name:'Telemart',cat:'Electronics',bg:'linear-gradient(135deg,#7B1FA2,#A855C7)',code:'TM'},
  {name:'Imtiaz',cat:'Grocery',bg:'linear-gradient(135deg,#C62828,#E85555)',code:'IM'},
];

type RewardsState={points:number;streak:number;longestStreak:number;multiplier:number};

export default function RewardsPage({user,back}:{user:User;back:()=>void}){
  // Points and streaks are server truth. They are emitted by the settlement
  // path, never by the client, so a member cannot mint their own. The prop is
  // only the fallback until the first response lands.
  const [state,setState]=useState<RewardsState>({points:0,streak:user.paymentStreak||0,longestStreak:0,multiplier:1});
  useEffect(()=>{api<RewardsState>('/rewards').then(setState).catch(()=>{})},[]);
  const streak=state.streak;
  const next=LADDER.find(l=>l.n>streak)||LADDER[LADDER.length-1];
  const prev=[...LADDER].reverse().find(l=>l.n<=streak);
  const pct=Math.min(100,Math.round(streak/next.n*100));
  const points=state.points;
  const [tab,setTab]=useState<'ladder'|'partners'>('ladder');

  return <div className="enter">
    <div className="topbar">
      <button className="back" onClick={back}><ArrowLeft/></button>
      <h1>Rewards</h1>
    </div>

    <div style={{padding:14}}>
      <div className="streak-hero">
        <div style={{display:'flex',alignItems:'center',gap:8,position:'relative',zIndex:1}}>
          <Flame style={{width:18,height:18}}/><span style={{fontSize:12.5,fontWeight:600,opacity:.95}}>Payment streak</span>
        </div>
        <div className="streak-n">{streak}</div>
        <small>consecutive installments paid on time</small>
        <div className="streak-track">
          <div><span>{prev?`Tier ${prev.n} unlocked`:'First tier at 3'}</span><span>{next.n-streak} to go</span></div>
          <div className="track"><i style={{width:`${pct}%`}}/></div>
        </div>
      </div>

      <div className="stat-2" style={{marginTop:12}}>
        <div className="stat"><span>Points balance</span><strong>{new Intl.NumberFormat('en-PK').format(points)}</strong><small>Buys fee waivers</small></div>
        <div className="stat"><span>Next unlock</span><strong>{next.n} rounds</strong><small>{next.retail.split(',')[0]}</small></div>
      </div>

      <div className="seg" style={{marginTop:16}}>
        <button className={tab==='ladder'?'on':''} onClick={()=>setTab('ladder')}>Ladder</button>
        <button className={tab==='partners'?'on':''} onClick={()=>setTab('partners')}>Partners</button>
      </div>

      {tab==='ladder'?<div className="list" style={{marginTop:12}}>
        {LADDER.map(l=>{
          const hit=streak>=l.n;const isNext=!hit&&l.n===next.n;
          return <div className={`ladder-item ${hit?'hit':isNext?'next':''}`} key={l.n}>
            <div className="ladder-n">{hit?<Check style={{width:17,height:17,strokeWidth:3}}/>:l.n}</div>
            <div className="ladder-b">
              <strong>{l.retail}</strong>
              <span>{l.platform===''?`At ${l.n} consecutive payments`:l.platform}</span>
            </div>
            {hit?<span className="chip ok">Unlocked</span>:isNext?<span className="chip">Next</span>:<Lock style={{width:15,height:15,color:'var(--faint)'}}/>}
          </div>;
        })}
      </div>:<>
        <div className="partner-grid" style={{marginTop:12}}>
          {PARTNERS.map(p=>(
            <div className="partner" key={p.name}>
              <div className="partner-logo" style={{background:p.bg}}>{p.code}</div>
              <strong>{p.name}</strong>
              <span>{p.cat}</span>
              <button className="btn soft sm" style={{width:'100%',marginTop:9}} disabled={streak<3}>
                {streak>=3?'View offer':'Locked'}
              </button>
            </div>
          ))}
        </div>
      </>}

      <div style={{height:16}}/>
    </div>
  </div>;
}
