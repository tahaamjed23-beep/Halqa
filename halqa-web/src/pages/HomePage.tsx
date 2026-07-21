import { useEffect, useMemo, useState } from 'react';
import { ArrowUpRight, Clock3, Plus, ShieldCheck, Users } from 'lucide-react';
import { api, money } from '../api';
import type { Committee, Summary, User } from '../types';
import { Empty, HalqaOrb, Metric, Mini, ScoreRing, formatDuration, modeName } from '../components/ui';
import { SHOW_HOST_ELIGIBILITY, SIMPLE_MODE } from '../config';
import { t, useLang } from '../lib/i18n';

// Fifteen ways Pakistan says hello — one at random each visit. Assalam-o-alaikum
// and a plain Hello stay in Latin; the rest are in Urdu/regional script.
const GREETINGS=['Assalam-o-alaikum','Hello','سلام','آداب','خوش آمدید','جی آیاں نوں','پخیر راغلې','ڀلي ڪري آيا','سلام علیکم','کیا حال ہے','خیر مبارک','جیتے رہو','خوش رہو','سدا سلامت رہو','بسم اللہ، چلو شروع کریں'];

// Instant paint: the last good copy of a list renders immediately from
// localStorage while the fresh one loads — the committees screen stops
// feeling slow on serverless cold starts.
export function cached<T>(cacheKey:string,fallback:T):T{try{const raw=localStorage.getItem(`halqa.cache.${cacheKey}`);return raw?JSON.parse(raw) as T:fallback}catch{return fallback}}
export function keep(cacheKey:string,value:unknown){try{localStorage.setItem(`halqa.cache.${cacheKey}`,JSON.stringify(value))}catch{/* storage full */}}

export default function HomePage({user,openCommittee,create}:{user:User;openCommittee:(id:string)=>void;create:()=>void}){
  const [committees,setCommittees]=useState<Committee[]>(()=>cached('home.committees',[]));const [summary,setSummary]=useState<Summary|null>(()=>cached('home.summary',null));const [,tick]=useState(0);
  const [greeting]=useState(()=>GREETINGS[Math.floor(Math.random()*GREETINGS.length)]);
  useEffect(()=>{void Promise.all([api<Committee[]>('/committees'),api<Summary>('/profile/summary')]).then(([rows,data])=>{const mine=rows.filter(row=>row.members?.some(member=>member.userId===user.id));setCommittees(mine);setSummary(data);keep('home.committees',mine);keep('home.summary',data)})},[user.id]);
  useEffect(()=>{const timer=setInterval(()=>tick(value=>value+1),60000);return()=>clearInterval(timer)},[]);
  const sorted=useMemo(()=>[...committees].sort((a,b)=>Number(b.status==='ACTIVE')-Number(a.status==='ACTIVE')),[committees]);
  const [lang]=useLang();
  const today=new Intl.DateTimeFormat(lang==='ur'?'ur-PK':'en-PK',{weekday:'long',day:'numeric',month:'long'}).format(new Date());
  return <div className="page enter"><section className="home-hero"><div className="welcome"><span>{today}</span><h1>{lang==='ur'?t('hero_greeting',lang):greeting}, {user.fullName.split(' ')[0]}.</h1><p>{t('hero_sub',lang)}</p><button className="primary" disabled={user.creditScore<700} onClick={create}><Plus/>{t('hero_host',lang)}</button></div><div className="balance-stage"><HalqaOrb/><span>{t('hero_savings',lang)}</span><strong>{money(summary?.balancePaisa||0)}</strong><small>{SIMPLE_MODE?'Everything you have put in, recorded':'Contributions + distributed realised profit'}</small></div></section>
  <section className={`metric-grid${SHOW_HOST_ELIGIBILITY?' metric-grid-four':''}`}><Metric label="Next full payout" value={formatDuration(summary?.nextPayout?.payoutAt)} detail={summary?.nextPayout?`${summary.nextPayout.committee.name} · ${money(summary.nextPayout.amountPaisa)}`:'No scheduled payout'} tone="ink"/><Metric label="Next installment" value={formatDuration(summary?.nextInstallment?.dueAt)} detail={summary?.nextInstallment?`${summary.nextInstallment.committee.name} · ${money(summary.nextInstallment.amountPaisa)}`:'Nothing due'} tone="amber"/>{SIMPLE_MODE?<Metric label="Saved so far" value={money(summary?.totalRecordedPaisa||0)} detail="Every installment you've recorded" tone="green"/>:<Metric label="Investment profits" value={money(summary?.totalInvestmentProfitPaisa||0)} detail="Your realised share after fees" tone="green"/>}{SHOW_HOST_ELIGIBILITY&&<article className="metric score-metric"><div><span>Halqa reliability</span><strong>{user.creditScore}</strong><small>{user.creditScore>=700?'Eligible to host':'Build to 700 to host'}</small></div><ScoreRing score={user.creditScore}/></article>}</section>
  <div className="section-head"><div><span className="eyebrow">Active network</span><h2>Your committees</h2></div><span>{summary?.activeCommittees||0} active</span></div><section className="circle-grid">{sorted.map((committee,index)=><CircleCard key={committee.id} committee={committee} userId={user.id} index={index} open={openCommittee}/>)}{!sorted.length&&<Empty text="Join with an invite code or host your first committee."/>}</section>
  {!SIMPLE_MODE&&<aside className="trust-banner"><ShieldCheck/><div><b>{t('trust_title',lang)}</b><p>{t('trust_body',lang)}</p></div></aside>}</div>
}

export function CircleCard({committee,userId,index,open}:{committee:Committee;userId:string;index:number;open:(id:string)=>void}){
  const active=committee.rounds?.[0];const paid=active?.payments?.filter(payment=>payment.status==='PAID').length||0;const myTurn=committee.members?.find(member=>member.userId===userId)?.turnPosition;const nextPayout=committee.rounds?.find(round=>round.recipientId===userId&&round.status!=='CLOSED');
  return <button style={{animationDelay:`${index*55}ms`}} onClick={()=>open(committee.id)} className="circle-card stagger"><div className="circle-card-top"><div><span className={`mode-chip mode-${committee.mode.toLowerCase()}`}>{modeName[committee.mode]}</span>{committee.goalType&&<span className="goal-chip">🎯 {committee.goalName||({HAJJ:'Hajj / Umrah',EDUCATION:'Education',WEDDING:'Wedding',HOME:'Home',BUSINESS:'Business',CUSTOM:'Goal'} as Record<string,string>)[committee.goalType]||'Goal'}</span>}<h3>{committee.name}</h3><p>Hosted by {committee.host.fullName}</p></div><div className="circle-icon"><Users/></div></div><div className="circle-stats"><Mini label="Contribution" value={money(committee.contributionPaisa)}/><Mini label="Members" value={`${committee.members?.length||0}/${committee.memberCap}`}/><Mini label="Your turn" value={myTurn?`#${myTurn}`:'—'}/></div>{nextPayout&&<div className="turn-callout"><Clock3/><span>Your payout in <b>{formatDuration(nextPayout.payoutDate)}</b></span></div>}{active&&<div className="collection"><div><span>Round {active.roundNumber} collection</span><b>{paid}/{active.payments.length}</b></div><div><i style={{width:`${active.payments.length?paid/active.payments.length*100:0}%`}}/></div></div>}<div className="card-link">Open committee <ArrowUpRight/></div></button>
}
