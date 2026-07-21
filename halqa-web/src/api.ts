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

async function request<T>(path:string,init:RequestInit,retried:boolean):Promise<T>{
  const response=await fetch(`${BASE}${path}`,{...init,headers:{'Content-Type':'application/json',...(tokens.get()?{Authorization:`Bearer ${tokens.get()}`}:{ }),...init.headers}});
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
  if(!response.ok)throw new Error(data.error||`Request failed (${response.status})`);
  return data as T;
}
export const api=<T>(path:string,init:RequestInit={})=>request<T>(path,init,false);
// Keep the serverless function warm. A cold Vercel function + cross-region
// Supabase pooler is the real cause of the "super slow" first action, and it
// re-freezes after a few idle minutes — so a one-shot ping at load isn't
// enough. We ping /health (a) at load, (b) every 4 minutes while the tab is
// open, and (c) the instant the tab regains focus (the classic "came back and
// it's slow" case). Vercel Hobby cron is daily-only, so this client-side
// warmer is what actually protects an active session. Fire-and-forget, and
// paused while the tab is hidden so we never ping in the background forever.
const warm=()=>{try{fetch(`${BASE}/health`,{cache:'no-store'}).catch(()=>{})}catch{/* SSR / no fetch */}};
warm();
if(typeof window!=='undefined'){
  let lastWarm=Date.now();
  setInterval(()=>{if(document.visibilityState==='visible'){warm();lastWarm=Date.now()}},4*60_000);
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'&&Date.now()-lastWarm>60_000){warm();lastWarm=Date.now()}});
}
export const money=(paisa:string|number|bigint=0)=>new Intl.NumberFormat('en-PK',{style:'currency',currency:'PKR',maximumFractionDigits:0}).format(Number(paisa)/100);
export const key=()=>crypto.randomUUID();
