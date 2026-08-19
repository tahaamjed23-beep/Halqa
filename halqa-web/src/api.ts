import { PREVIEW, previewRoute } from './preview';

const configured=(import.meta.env.VITE_API_URL as string|undefined)?.replace(/\/$/,'');
const nativeShell=window.location.protocol==='capacitor:'||window.location.protocol==='ionic:';
const nativeDevApi='http://10.0.2.2:4101';
export const API_ORIGIN=configured||(nativeShell?nativeDevApi:`${window.location.protocol}//${window.location.hostname}:4101`);
const BASE=`${API_ORIGIN}/api`;
export const tokens={
  get:()=>localStorage.getItem('halqa_access')||'',
  refresh:()=>localStorage.getItem('halqa_refresh')||'',
  set:(access:string,refresh?:string)=>{localStorage.setItem('halqa_access',access);if(refresh)localStorage.setItem('halqa_refresh',refresh)},
  clear:()=>{localStorage.removeItem('halqa_access');localStorage.removeItem('halqa_refresh')},
};

/**
 * Errors a member can act on.
 *
 * The app used to surface whatever the server said, or a bare
 * "Failed to fetch" when the phone had no signal. Neither tells somebody on a
 * patchy mobile connection what to do, and on a money screen that is the
 * difference between waiting and paying twice.
 */
export class ApiError extends Error {
  status:number;
  code?:string;
  retryable:boolean;
  constructor(message:string,status:number,code?:string,retryable=false){
    super(message);
    this.name='ApiError';
    this.status=status;
    this.code=code;
    this.retryable=retryable;
  }
}

const OFFLINE='You appear to be offline. Your payments are safe; try again when you have signal.';
const SERVER='Halqa could not be reached just now. Nothing was charged. Please try again.';

async function request<T>(path:string,init:RequestInit,retried:boolean):Promise<T>{
  if(typeof navigator!=='undefined'&&navigator.onLine===false){
    throw new ApiError(OFFLINE,0,'OFFLINE',true);
  }
  let response:Response;
  try{
    response=await fetch(`${BASE}${path}`,{...init,headers:{'Content-Type':'application/json',...(tokens.get()?{Authorization:`Bearer ${tokens.get()}`}:{ }),...init.headers}});
  }catch{
    // A network-level failure. Never a server decision, so it is always safe to
    // retry: no write reached the ledger.
    throw new ApiError(OFFLINE,0,'NETWORK',true);
  }
  if(response.status===401&&!retried&&tokens.refresh()&&!path.startsWith('/auth/')){
    const refreshed=await fetch(`${BASE}/auth/refresh`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({refreshToken:tokens.refresh()})});
    if(refreshed.ok){const next=await refreshed.json() as {accessToken:string;refreshToken?:string};tokens.set(next.accessToken,next.refreshToken);return request<T>(path,init,true)}
    tokens.clear();
  }
  if(response.status===204)return undefined as T;
  const data=await response.json().catch(()=>({})) as {error?:string;code?:string};
  // The weekly undertaking lapsed mid-session: any money action returns 428
  // and the signing overlay re-opens itself before the member retries.
  if(response.status===428&&data.code==='UNDERTAKING_REQUIRED')window.dispatchEvent(new CustomEvent('halqa:undertaking-required'));
  if(!response.ok){
    // 5xx and 429 are worth another attempt; a 4xx is a decision that will not
    // change on retry, so the member is told plainly instead of being asked to
    // press the button again.
    const retryable=response.status>=500||response.status===429;
    throw new ApiError(
      data.error||(retryable?SERVER:`That did not work (${response.status}).`),
      response.status,data.code,retryable,
    );
  }
  return data as T;
}
export const api=<T>(path:string,init:RequestInit={}):Promise<T>=>PREVIEW
  ?new Promise(resolve=>setTimeout(()=>resolve(previewRoute(path) as T),120))
  :request<T>(path,init,false);
// Keep the serverless function warm. A cold Vercel function + cross-region
// Supabase pooler is the real cause of the "super slow" first action, and it
// re-freezes after a few idle minutes, so a one-shot ping at load isn't
// enough. We ping /health (a) at load, (b) every 4 minutes while the tab is
// open, and (c) the instant the tab regains focus (the classic "came back and
// it's slow" case). Vercel Hobby cron is daily-only, so this client-side
// warmer is what actually protects an active session. Fire-and-forget, and
// paused while the tab is hidden so we never ping in the background forever.
const warm=()=>{if(PREVIEW)return;try{fetch(`${BASE}/health`,{cache:'no-store'}).catch(()=>{})}catch{/* SSR / no fetch */}};
warm();
if(typeof window!=='undefined'){
  let lastWarm=Date.now();
  setInterval(()=>{if(document.visibilityState==='visible'){warm();lastWarm=Date.now()}},4*60_000);
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'&&Date.now()-lastWarm>60_000){warm();lastWarm=Date.now()}});
}
// Money formatting lives in lib/format.ts now, so every screen speaks the same
// language. Re-exported here because most pages already import it from api.
export { money, moneyShort } from './lib/format';
export const key=()=>crypto.randomUUID();
