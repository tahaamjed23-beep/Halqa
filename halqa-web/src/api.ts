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
  const data=await response.json().catch(()=>({})) as {error?:string};
  if(!response.ok)throw new Error(data.error||`Request failed (${response.status})`);
  return data as T;
}
export const api=<T>(path:string,init:RequestInit={})=>request<T>(path,init,false);
export const money=(paisa:string|number|bigint=0)=>new Intl.NumberFormat('en-PK',{style:'currency',currency:'PKR',maximumFractionDigits:0}).format(Number(paisa)/100);
export const key=()=>crypto.randomUUID();
