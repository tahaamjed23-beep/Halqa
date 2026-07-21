import type { ReactNode } from 'react';
import { Sparkles } from 'lucide-react';
import { money } from '../api';

export const scoreColor=(score:number)=>score>=750?'#22a865':score>=700?'#0a7cff':score>=650?'#e58900':'#e43d36';
export const modeName={ROTATING:'Rotating payout',HYBRID:'Rotating payout',INVESTMENT:'Investment circle'} as const;
// Engines were dropped — circles are distinguished by their TURN ORDER, not a
// product tier. This is what the cards and headers show.
export const orderingName:Record<string,string>={CREDIT_WEIGHTED:'Credit-weighted order',RANDOM_BALLOT:'Random ballot',HOST_ASSIGNED:'Host-assigned order'};
export const orderingLabel=(m?:string)=>orderingName[m??'CREDIT_WEIGHTED']??'Credit-weighted order';
export const cadenceName:Record<string,string>={VERY_SHORT:'Very short',SHORT:'Short',MID:'Mid term',LONG:'Long term'};
// Display-layer rename over the DB tier enum. The enum values (CLASSIC/SUKOON/
// BAZAAR/PRIORITY/SIGMA) stay unchanged in code and storage; only what the
// member reads is plain and descriptive. Chairman-directed rename.
export const tierLabel:Record<string,string>={CLASSIC:'Basic',SUKOON:'Earn',BAZAAR:'Earn & Share',PRIORITY:'Early Access',SIGMA:'Maximum'};
export const tierName=(t?:string)=>tierLabel[t??'CLASSIC']??'Basic';

export function Logo(){return <div className="brand"><div className="brand-mark">ح</div><div><strong>Halqa</strong><small>Committee infrastructure</small></div></div>}
export function IconButton({label,children,onClick}:{label:string;children:ReactNode;onClick?:()=>void}){return <button aria-label={label} title={label} className="icon-button" onClick={onClick}>{children}</button>}
export function Metric({label,value,detail,tone='blue'}:{label:string;value:string;detail?:string;tone?:'blue'|'green'|'amber'|'ink'}){return <article className={`metric metric-${tone}`}><span>{label}</span><strong className="money">{value}</strong>{detail&&<small>{detail}</small>}</article>}
export function Mini({label,value}:{label:string;value:string}){return <div className="mini"><span>{label}</span><strong>{value}</strong></div>}
export function Field({label,children,hint}:{label:string;children:ReactNode;hint?:string}){return <label className="field-wrap"><span>{label}</span>{children}{hint&&<small>{hint}</small>}</label>}
export function Empty({text}:{text:string}){return <div className="empty"><Sparkles/><p>{text}</p></div>}
export function ScoreRing({score}:{score:number}){return <div className="score-ring" style={{'--score':`${Math.max(0,Math.min(100,(score-300)/5.5))}%`,'--score-color':scoreColor(score)} as React.CSSProperties}><div><strong>{score}</strong><span>{score>=750?'Excellent':score>=700?'Good':score>=650?'Fair':'Build'}</span></div></div>}
export function HalqaOrb(){return <div className="orb-scene" aria-hidden="true"><div className="orb"><i/><i/><i/><b>ح</b></div></div>}
export function formatDuration(date?:string|null){if(!date)return 'Not scheduled';const ms=new Date(date).getTime()-Date.now();if(ms<=0)return 'Due now';const days=Math.floor(ms/86400000);const hours=Math.floor((ms%86400000)/3600000);if(days>0)return `${days}d ${hours}h`;const minutes=Math.max(1,Math.floor((ms%3600000)/60000));return `${hours}h ${minutes}m`}
export function profitProjection(principalRupees:number,rate:number,days:number){return principalRupees*rate/100*days/365}
export const RATE_STALE_AFTER_DAYS=45;
export function rateFreshness(rateAsOf:string){const days=Math.floor((Date.now()-new Date(rateAsOf).getTime())/86400000);return{days,stale:days>RATE_STALE_AFTER_DAYS,label:`Rate verified ${new Date(rateAsOf).toLocaleDateString()}`}}
export function RateStamp({rateAsOf}:{rateAsOf:string}){const f=rateFreshness(rateAsOf);return <span className={`rate-stamp ${f.stale?'stale':''}`}>{f.stale?`⚠ Rate review due · last verified ${new Date(rateAsOf).toLocaleDateString()}`:f.label}</span>}
export function SummaryMoney({paisa}:{paisa:string|number}){return <>{money(paisa)}</>}
