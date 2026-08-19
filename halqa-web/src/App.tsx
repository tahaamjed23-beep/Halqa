import { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import { api, tokens } from './api';
import type { Page, User } from './types';
import AuthPage from './pages/AuthPage';
import Shell from './pages/Shell';
import HomePage from './pages/HomePage';
import ErrorBoundary from './components/ErrorBoundary';
import OfflineBanner from './components/OfflineBanner';
import AgreementGate from './components/AgreementGate';
import PinLock from './components/PinLock';
import { SIMPLE_MODE } from './config';
import { RegisterMark } from './components/ui';
import { PREVIEW, previewUser } from './preview';

const CirclesPage=lazy(()=>import('./pages/CirclesPage'));
const MarketplacePage=lazy(()=>import('./pages/MarketplacePage'));
const TerminalPage=lazy(()=>import('./pages/TerminalPage'));
const ProfilePage=lazy(()=>import('./pages/ProfilePage'));
const VaultPage=lazy(()=>import('./pages/VaultPage'));
const CreateCirclePage=lazy(()=>import('./pages/CreateCirclePage'));
const CommitteePage=lazy(()=>import('./pages/CommitteePage'));
const RafaBot=lazy(()=>import('./components/RafaBot'));
const SettingsPage=lazy(()=>import('./pages/SettingsPage'));
const CreditPage=lazy(()=>import('./pages/CreditPage'));
const AboutPage=lazy(()=>import('./pages/AboutPage'));
const PayPage=lazy(()=>import('./pages/PayPage'));
const RewardsPage=lazy(()=>import('./pages/RewardsPage'));
const HyperPage=lazy(()=>import('./pages/HyperPage'));
const CardsPage=lazy(()=>import('./pages/CardsPage'));
const ActivityPage=lazy(()=>import('./pages/ActivityPage'));
const AssetPage=lazy(()=>import('./pages/AssetPage'));

export default function App(){
  const [user,setUser]=useState<User|null>(PREVIEW?previewUser as unknown as User:null);
  const [loading,setLoading]=useState(!PREVIEW);
  const [page,setPage]=useState<Page>(()=>{const q=new URLSearchParams(window.location.search);return (q.get('screen') as Page)||(q.get('join')?'circles':'home')});
  const [committeeId,setCommitteeId]=useState<string|null>(()=>new URLSearchParams(window.location.search).get('committee'));
  // An invite link (?join=CODE) opens the app straight onto that committee.
  const [joinCode,setJoinCode]=useState<string|null>(()=>new URLSearchParams(window.location.search).get('join'));
  // Page and open committee live in the URL, so the hardware back button, a
  // refresh and a shared link all behave the way a member expects. Without this
  // back exits the app from anywhere inside it.
  useEffect(()=>{
    const url=new URL(window.location.href);
    const q=new URLSearchParams();
    if(page!=='home')q.set('screen',page);
    if(joinCode)q.set('join',joinCode);
    if(committeeId)q.set('committee',committeeId);
    const next=`${url.pathname}${q.toString()?'?'+q:''}`;
    if(next!==url.pathname+url.search)window.history.pushState({page,committeeId},'',next);
  },[page,committeeId,joinCode]);
  useEffect(()=>{
    const pop=()=>{const q=new URLSearchParams(window.location.search);
      setCommitteeId(q.get('committee'));setPage((q.get('screen') as Page)||'home')};
    window.addEventListener('popstate',pop);
    return ()=>window.removeEventListener('popstate',pop);
  },[]);
  // In-memory PIN unlock: false on every fresh load, so the app re-asks the PIN
  // each time it opens (a reload counts as an open). A fresh login sets it true
  //, you just proved your password, so no PIN on the same open.
  const [unlocked,setUnlocked]=useState(PREVIEW);
  const [pinDeferred,setPinDeferred]=useState(false); // existing users who skip first-open setup
  const loadUser=useCallback(async()=>{try{setUser(await api<User>('/auth/me'))}catch{tokens.clear();setUser(null)}finally{setLoading(false)}},[]);
  useEffect(()=>{if(PREVIEW)return;if(tokens.get())void loadUser();else setLoading(false)},[loadUser]);
  if(loading)return <div className="splash"><div className="splash-mark"><RegisterMark size={44}/></div></div>;
  if(!user)return <AuthPage onAuth={u=>{setUnlocked(true);setUser(u)}}/>;
  // PIN gate: a member WITH a PIN must enter it on every open; a member WITHOUT
  // one (older accounts) gets a one-time setup they may defer into Settings.
  if(!unlocked){
    if(user.hasPin)return <PinLock user={user} mode="verify" onUnlock={()=>setUnlocked(true)} onLogout={()=>{tokens.clear();setUser(null)}}/>;
    if(!pinDeferred)return <PinLock user={user} mode="setup" onUnlock={()=>{setUser({...user,hasPin:true});setUnlocked(true)}} onSkip={()=>{setPinDeferred(true);setUnlocked(true)}} onLogout={()=>{tokens.clear();setUser(null)}}/>;
  }
  // Rafa rides along on the committee page too, it renders outside the Shell,
  // and this is exactly where the pay/payout reactions fire.
  // Rafa is wrapped in its own scoped boundary everywhere it renders, so a
  // guide/chat failure can never blank the whole application.
  const rafa=(p:Page)=><ErrorBoundary scoped label="Rafa"><RafaBot page={p} setPage={next=>{setCommitteeId(null);setPage(next)}}/></ErrorBoundary>;
  // The weekly undertaking overlay rides on every logged-in branch: it shows
  // right after account creation, then re-appears each week (or on any 428).
  const gate=PREVIEW?null:<ErrorBoundary scoped label="Undertaking"><AgreementGate userName={user.fullName}/></ErrorBoundary>;
  if(committeeId)return <Suspense fallback={<PageLoader/>}><ErrorBoundary resetKey={committeeId} label="Committee"><CommitteePage id={committeeId} user={user} onBack={()=>setCommitteeId(null)}/></ErrorBoundary>{rafa('circles')}{gate}</Suspense>;
  // In simple mode the investment surfaces are hidden; coerce any stale route
  // to home. The turn marketplace stays live in simple mode.
  const view=SIMPLE_MODE&&['terminal','vault'].includes(page)?'home':page;
  return <><OfflineBanner/><Shell user={user} page={view} setPage={setPage} onLogout={()=>{tokens.clear();setUser(null)}}>
    <ErrorBoundary resetKey={view} label="This page">
    <Suspense fallback={<PageLoader/>}>
      {view==='home'&&<HomePage user={user} openCommittee={setCommitteeId} create={()=>setPage('create')} go={p=>setPage(p as Page)}/>}
      {view==='circles'&&<CirclesPage user={user} openCommittee={setCommitteeId} create={()=>setPage('create')} joinCode={joinCode} onJoinHandled={()=>setJoinCode(null)}/>}
      {view==='market'&&<MarketplacePage user={user} back={()=>setPage('profile')}/>}
      {view==='terminal'&&<TerminalPage back={()=>setPage('profile')}/>}
      {view==='vault'&&<VaultPage/>}
      {view==='profile'&&<ProfilePage user={user} openCredit={()=>setPage('credit')} go={p=>setPage(p)}/>}
      {view==='credit'&&<CreditPage user={user} back={()=>setPage('profile')}/>}
      {view==='about'&&<AboutPage back={()=>setPage('profile')}/>}
      {view==='create'&&<CreateCirclePage user={user} done={setCommitteeId} cancel={()=>setPage('home')}/>}
      {view==='settings'&&<SettingsPage user={user} back={()=>setPage('profile')}/>}
      {view==='pay'&&<PayPage user={user} back={()=>setPage('home')}/>}
      {view==='rewards'&&<RewardsPage user={user} back={()=>setPage('home')}/>}
      {view==='hyper'&&<HyperPage user={user} back={()=>setPage('home')}/>}
      {view==='cards'&&<CardsPage user={user} back={()=>setPage('home')}/>}
      {view==='activity'&&<ActivityPage user={user} back={()=>setPage('home')}/>}
      {view==='asset'&&<AssetPage back={()=>setPage('home')}/>}
    </Suspense>
    </ErrorBoundary>
    {gate}
  </Shell></>
}

function PageLoader(){return <div className="page-loader"><i/><span>Loading Halqa</span></div>}
