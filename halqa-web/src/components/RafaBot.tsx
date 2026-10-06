import { useEffect, useRef, useState } from'react';
import { Send, Sparkles, X } from'lucide-react';
import type { Page } from'../types';
import { RAFA_STARTERS, matchRafa } from'./rafa-knowledge';
import type { HalqaAction } from'../lib/events';
import { SIMPLE_MODE } from'../config';

// Rafa, Halqa's little guide bot. A floating animated mascot that (1) answers
// questions from a curated knowledge base and (2) runs a real-time walkthrough
// that follows the user around the app: the coach card always reflects the page
// they're actually on, and can walk them to the next one. No forced modal.

export const RAFA_SEEN_KEY ='halqa_rafa_seen_v2';

export type RafaMood ='idle' |'wave' |'celebrate' |'coin' |'nod' |'talking';

// Cute 3D-looking mascot using CSS 3D transforms + layered SVG divs.
// perspective + preserve-3d + rotateX/Y give depth; layered shadows fake volume.
export function RafaBot3D({ size = 46, talking = false, mood ='idle' as RafaMood }: { size?: number; talking?: boolean; mood?: RafaMood }) {
 const effectiveMood: RafaMood = talking?'talking' : mood;
 return (
 <div
 className={`rafa3d rafa3d--${effectiveMood}`}
 style={{ width: size, height: size, fontSize: size }}
 aria-label="Rafa, your Halqa guide"
 role="img"
 >
 {/* Shadow beneath character */}
 <div className="rafa3d-shadow" />

 {/* Body, main rounded robot torso with 3D tilt */}
 <div className="rafa3d-body">
 {/* Shine layer */}
 <div className="rafa3d-shine" />

 {/* Face / screen */}
 <div className="rafa3d-face">
 {/* Eyes */}
 <div className="rafa3d-eyes">
 <div className="rafa3d-eye rafa3d-eye--left">
 <div className="rafa3d-pupil" />
 </div>
 <div className="rafa3d-eye rafa3d-eye--right">
 <div className="rafa3d-pupil" />
 </div>
 </div>
 {/* Mouth, changes with mood */}
 <div className={`rafa3d-mouth rafa3d-mouth--${effectiveMood}`} />
 </div>

 {/* Left ear bolt */}
 <div className="rafa3d-ear rafa3d-ear--left" />
 {/* Right ear bolt */}
 <div className="rafa3d-ear rafa3d-ear--right" />

 {/* Cheeks */}
 <div className="rafa3d-cheek rafa3d-cheek--left" />
 <div className="rafa3d-cheek rafa3d-cheek--right" />
 </div>

 {/* Antenna */}
 <div className="rafa3d-antenna">
 <div className="rafa3d-antenna-stem" />
 <div className="rafa3d-antenna-tip" />
 </div>

 {/* Right arm, only visible during wave/celebrate */}
 <div className="rafa3d-arm rafa3d-arm--right" />
 {/* Left arm */}
 <div className="rafa3d-arm rafa3d-arm--left" />

 {/* Coin, floats up during coin animation */}
 <div className="rafa3d-coin" aria-hidden="true" />

 {/* Sparkles, celebrate */}
 <div className="rafa3d-sparks" aria-hidden="true">
 
 
 
 </div>
 </div>
 );
}

// The reaction bubble that floated beside the mascot is gone with it. An
// outcome is confirmed on the screen the member is looking at, not by a
// speech bubble somewhere else.

const ACTION_MOOD: Record<HalqaAction, RafaMood> = {
 CREATE_CIRCLE:'celebrate',
 PAY_INSTALLMENT:'nod',
 PAYOUT:'celebrate',
 CONSENT:'nod',
 JOIN:'wave',
};

type Msg = { from:'rafa' |'you'; text: string; go?: Page };

const TOUR: Partial<Record<Page, { title: string; body: string; cta?: { label: string; page: Page } }>> = {
 home: { title:"You're on the Dashboard", body:'This is home base, your next installment, your next payout and all your circles at a glance. Shall we look at your committees?', cta: { label:'Open Circles →', page:'circles' } },
 circles: { title:"These are your Circles", body:"Every committee you host or joined shows here. Tap Create to host a new one, or paste an invite code to join a friend's.", cta: { label:'Create a circle →', page:'create' } },
 create: SIMPLE_MODE
? { title:'Building a circle', body:'Set the name, members, amount, period and a goal, then share the invite code. The engine switches are optional; the defaults are fine.' }
 : { title:'Building a circle', body:"Set members, contribution and period. Pick a Low / Medium / High risk level, I auto-choose the best scheme, then tick the profit levers and I'll name your tier. The early fee is always capped at 10%." },
 market: { title:'The Turn Market', body: SIMPLE_MODE?'Need your payout sooner? Members auction future turns here at a premium, you can even buy a turn in another circle.' :'Need cash sooner, or happy to wait and earn? Members trade turns here. Halal circles (Earn / Earn & Share) allow free swaps only.' },
 terminal: { title:'The Scheme Terminal', body:'Explore every investment scheme with its dated rate, risk and liquidity. This is where your bonus profit actually comes from.' },
 profile: { title:'Your Profile', body: SIMPLE_MODE?'Your reliability score, payment history and your shareable Credit Passport all live here. Settings has your privacy and auto-pay controls.' :'Your reliability score, the Vault (save any amount and earn), and your shareable Credit Passport all live here.' },
 settings: { title:'Settings', body:'Security, privacy, notifications, payment preferences and every policy, all in one place. The data-sharing switch is yours alone to flip.' },
};

export default function RafaBot({ page, setPage }: { page: Page; setPage: (page: Page) => void }) {
 const [open, setOpen] = useState(false);
 // Opened from the fixed entry point in the page header. Nothing floats over
 // the content waiting to be noticed.
 useEffect(() => {
   const handler = () => { setOpen(true); localStorage.setItem(RAFA_SEEN_KEY, '1'); };
   window.addEventListener('halqa:open-assistant', handler);
   return () => window.removeEventListener('halqa:open-assistant', handler);
 }, []);
 const [tour, setTour] = useState(false);
 const [messages, setMessages] = useState<Msg[]>([{ from:'rafa', text:"Assalam-o-alaikum! I'm Rafa, your Halqa guide Ask me anything, or tap'Show me around' and I'll walk you through the app as you go." }]);
 const [input, setInput] = useState('');
 const [talking, setTalking] = useState(false);
 const [mood, setMood] = useState<RafaMood>('idle');
 const moodTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
 const end = useRef<HTMLDivElement | null>(null);

 // Wave on first mount
 useEffect(() => {
 setMood('wave');
 moodTimer.current = setTimeout(() => setMood('idle'), 1800);
 return () => { if (moodTimer.current) clearTimeout(moodTimer.current); };
 }, []);

 // Listen for halqa:action events from any page
 useEffect(() => {
 const handler = (e: Event) => {
 const { type } = (e as CustomEvent<{ type: HalqaAction }>).detail;
 const nextMood = ACTION_MOOD[type]??'nod';
 if (moodTimer.current) clearTimeout(moodTimer.current);
 setMood(nextMood);
 moodTimer.current = setTimeout(() => setMood('idle'), 1800);
 };
 window.addEventListener('halqa:action', handler);
 return () => window.removeEventListener('halqa:action', handler);
 }, []);

 // The wandering stunt loop is gone with the floating mascot. A character that
 // moves itself across the screen every three minutes cannot be laid out
 // around, so nothing on any page could be guaranteed to stay visible.

 useEffect(() => { end.current?.scrollIntoView({ behavior:'smooth' }); }, [messages, tour, open]);

 const say = (text: string, go?: Page) => {
 setTalking(true);
 setMood('talking');
 setMessages(m => [...m, { from:'rafa', text, go }]);
 setTimeout(() => { setTalking(false); setMood('idle'); }, 700);
 };
 const ask = async (raw: string) => {
 const text = raw.trim();
 if (!text) return;
 setMessages(m => [...m, { from:'you', text }]);
 setInput('');
 const hit = matchRafa(text);
 if (hit) { say(hit.entry.a, hit.entry.go as Page | undefined); return; }
 // LLM scaffold (chairman-approved): when a licensed deployment configures
 // window.RAFA_LLM_URL, unknown questions go to the model; otherwise the
 // curated KB fallback answers honestly. No key is shipped with the app.
 const llmUrl = (window as unknown as { RAFA_LLM_URL?: string }).RAFA_LLM_URL;
 if (llmUrl) {
 try {
 const ctrl = new AbortController(); const timer = setTimeout(() => ctrl.abort(), 6000);
 const r = await fetch(llmUrl, { method:'POST', headers: {'content-type':'application/json' }, body: JSON.stringify({ question: text }), signal: ctrl.signal });
 clearTimeout(timer);
 if (r.ok) { const d = await r.json() as { answer?: string }; if (d.answer) { say(d.answer); return; } }
 } catch { /* fall through to the honest KB fallback */ }
 }
 say(SIMPLE_MODE
?"I'm not sure about that one yet, I know committees, joining & hosting, payments & auto-pay, safety & defaults, the turn market and your account. Try one of those, or tap a suggestion below."
 :"I'm not sure about that one yet, I know committees, joining & hosting, the profit engines and the 10% fee, safety & defaults, the vault, the turn market and your account. Try one of those, or tap a suggestion below.");
 };

 const tip = TOUR[page];
 return (
 <>
 {/* The assistant used to be a floating animated character parked over the
     content. It covered the affordability section on the credit screen, the
     Rewards row on the account screen, the committee card on home and the
     primary button on committees, on every page, for every member. It now
     opens from a fixed entry point in the page header and draws nothing over
     the screen until it is asked for. The character itself survives inside
     the panel, where it has somewhere to be. */}
 {open && (
 <section className="rafa-panel" role="dialog" aria-label="Rafa the Halqa guide">
 <header className="rafa-panel-head">
 <div className="rafa-panel-id"><RafaBot3D size={34} talking={talking} mood={mood} /><div><b>Rafa</b><span>Your Halqa guide</span></div></div>
 <button className="rafa-x" onClick={() => setOpen(false)} aria-label="Close"><X size={16} /></button>
 </header>

 <button className={`rafa-tour-toggle ${tour?'on' :''}`} onClick={() => setTour(t =>!t)}>
 <Sparkles size={14} />{tour?'Walkthrough on, following you' :'Show me around (live walkthrough)'}
 </button>

 <div className="rafa-msgs">
 {tour && tip && (
 <div className="rafa-coach">
 <span className="rafa-coach-step">You are here</span>
 <b>{tip.title}</b><p>{tip.body}</p>
 {tip.cta && <button className="rafa-go" onClick={() => setPage(tip.cta!.page)}>{tip.cta.label}</button>}
 </div>
 )}
 {messages.map((m, i) => (
 <div key={i} className={`rafa-msg ${m.from}`}>
 {m.from ==='rafa' && <RafaBot3D size={26} mood={i === messages.length - 1? mood :'idle'} />}
 <div className="rafa-bubble"><p>{m.text}</p>{m.go && <button className="rafa-go small" onClick={() => setPage(m.go!)}>Take me there →</button>}</div>
 </div>
 ))}
 <div ref={end} />
 </div>

 {messages.length <= 3 && (
 <div className="rafa-chips">{RAFA_STARTERS.map(s => <button key={s} onClick={() => ask(s)}>{s}</button>)}</div>
 )}

 <footer className="rafa-input">
 <input aria-label="Ask Rafa a question…" value={input} maxLength={200} placeholder="Ask Rafa a question…" onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key ==='Enter') ask(input); }} />
 <button className="rafa-send" onClick={() => ask(input)} aria-label="Send"><Send size={16} /></button>
 </footer>
 </section>
 )}
 </>
 );
}
