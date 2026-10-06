import {date, until} from '../lib/format';
import type { ReactNode } from 'react';
import { money } from '../api';

// Turn-pricing chip, the single label used on EVERY committee surface
// (Discover, Marketplace, own-circle cards, committee header) so a member
// always sees whether early seats pay a fee that flows to later seats (the
// "late premium" spectrum) or the circle is flat. Accepts either the discover
// payload's turnPricing object or a raw earlyFeeBps off a Committee.
export type TurnPricing={kind:'EARLY_FEE'|'FLAT';earlyFeeBps:number;pooled?:boolean};
export const pricingOf=(earlyFeeBps?:number):TurnPricing=>earlyFeeBps&&earlyFeeBps>0?{kind:'EARLY_FEE',earlyFeeBps}:{kind:'FLAT',earlyFeeBps:0};
// WITHDRAWN 5 October 2026. The early turn fee paid from one member to another
// is gone: the fee is Rs 85 and is the same for every seat, so there is no
// pricing to put on a chip. Kept as a component that renders nothing, so any
// screen still calling it is harmless while the call sites are cleared.
export function TurnPricingChip(_:{pricing:TurnPricing}){
  return null;
}

// Score colour follows the brand ramp at the top and the status convention at
// the bottom. It used to run green, BLUE, amber, red: the blue sat on a green
// header and read as a different product's control. Standing that is fine is
// drawn in the brand; standing that restricts what the member may do is drawn
// as a warning, then as a failure.
export const scoreColor=(score:number)=>
  score>=750?'var(--l500)':
  score>=700?'var(--l600)':
  score>=650?'var(--warn)':'var(--bad)';
export const modeName={ROTATING:'Rotating payout',HYBRID:'Rotating payout',INVESTMENT:'Investment circle'} as const;
// Engines AND credit-weighted ordering were both dropped, nobody is reordered
// by score now; members pick a band-eligible seat (score-bands). So every
// rotating/hybrid circle simply shows "Rotating payout"; the differentiators
// members actually care about (turn pricing, goal) render as their own chips.
export const orderingLabel=(_m?:string)=>'Rotating payout';
export const cadenceName:Record<string,string>={VERY_SHORT:'Very short',SHORT:'Short',MID:'Mid term',LONG:'Long term'};
// Display-layer rename over the DB tier enum. The enum values (CLASSIC/SUKOON/
// BAZAAR/PRIORITY/SIGMA) stay unchanged in code and storage; only what the
// member reads is plain and descriptive. Chairman-directed rename.
export const tierLabel:Record<string,string>={CLASSIC:'Basic',SUKOON:'Earn',BAZAAR:'Earn & Share',PRIORITY:'Early Access',SIGMA:'Maximum'};
export const tierName=(t?:string)=>tierLabel[t??'CLASSIC']??'Basic';

// The Register, Halqa's mark. Ten tally strokes in a ring: the organizer's
// notebook bent into the shape of the word halqa (circle). Nine ivory strokes
// are the members who have paid; the tenth, gold and reaching inward, is whose
// turn it is now. Survives down to 24px because the eye catches the one stroke
// that breaks the pattern before it reads any detail.
export function RegisterMark({size=26}:{size?:number}){return (
  <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden="true" style={{width:size,height:size,strokeWidth:'unset'}}>
    <g stroke="currentColor" strokeWidth="7" strokeLinecap="round">
      <line x1="50" y1="9" x2="50" y2="25"/><line x1="71" y1="13.6" x2="63" y2="27.5"/>
      <line x1="86.4" y1="29" x2="72.5" y2="37"/><line x1="91" y1="50" x2="75" y2="50"/>
      <line x1="86.4" y1="71" x2="72.5" y2="63"/><line x1="71" y1="86.4" x2="63" y2="72.5"/>
      <line x1="50" y1="91" x2="50" y2="75"/><line x1="29" y1="86.4" x2="37" y2="72.5"/>
      <line x1="13.6" y1="71" x2="27.5" y2="63"/>
    </g>
    {/* The one long spoke is the mark's accent. It follows the member's chosen
        accent colour (--mark-accent), which defaults to the lime family, so the
        logo sits inside the same palette as everything else instead of
        carrying the old gold. */}
    <line x1="9" y1="50" x2="31" y2="50" stroke="var(--mark-accent,#A9E76A)" strokeWidth="9" strokeLinecap="round"/>
  </svg>)}
export function Logo(){return <div className="brand"><div className="brand-mark"><RegisterMark size={26}/></div><div><strong>Halqa</strong><small></small></div></div>}
// No title attribute: it only repeated the aria-label, and the browser's own
// tooltip cannot be dismissed, which is what WCAG 1.4.13 asks of anything shown
// on hover. The name a reader announces is unchanged.
export function IconButton({label,children,onClick}:{label:string;children:ReactNode;onClick?:()=>void}){return <button aria-label={label} className="icon-button" onClick={onClick}>{children}</button>}
export function Metric({label,value,detail,tone='blue'}:{label:string;value:string;detail?:string;tone?:'blue'|'green'|'amber'|'ink'}){return <article className={`metric metric-${tone}`}><span>{label}</span><strong className="money">{value}</strong>{detail&&<small>{detail}</small>}</article>}
export function Mini({label,value}:{label:string;value:string}){return <div className="mini"><span>{label}</span><strong>{value}</strong></div>}
export function Field({label,children,hint}:{label:string;children:ReactNode;hint?:string}){return <label className="field-wrap"><span>{label}</span>{children}{hint&&<small>{hint}</small>}</label>}
export function Empty({text}:{text:string}){return <div className="empty"><p>{text}</p></div>}
export function ScoreRing({score}:{score:number}){return <div className="score-ring" style={{'--score':`${Math.max(0,Math.min(100,(score-300)/5.5))}%`,'--score-color':scoreColor(score)} as React.CSSProperties}><div><strong>{score}</strong><span>{score>=750?'Excellent':score>=700?'Good':score>=650?'Fair':'Build'}</span></div></div>}
export function HalqaOrb(){return <div className="orb-scene" aria-hidden="true"><div className="orb"><i/><i/><i/><b><RegisterMark size={34}/></b></div></div>}
// Kept as a name so existing call sites do not churn; the implementation is
// the shared one, so "159d 21h" becomes "5 months, 9 days" everywhere at once.
export function formatDuration(date?:string|null){return until(date)}
export function profitProjection(principalRupees:number,rate:number,days:number){return principalRupees*rate/100*days/365}
export const RATE_STALE_AFTER_DAYS=45;
export function rateFreshness(rateAsOf:string){const days=Math.floor((Date.now()-new Date(rateAsOf).getTime())/86400000);return{days,stale:days>RATE_STALE_AFTER_DAYS,label:`Rate verified ${date(rateAsOf)}`}}
export function RateStamp({rateAsOf}:{rateAsOf:string}){const f=rateFreshness(rateAsOf);return <span className={`rate-stamp ${f.stale?'stale':''}`}>{f.stale?`Rate review due, last verified ${date(rateAsOf)}`:f.label}</span>}
export function SummaryMoney({paisa}:{paisa:string|number}){return <>{money(paisa)}</>}
