import { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import { api, tokens } from './api';
import { trackScreen } from './lib/events';
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
import { SkeletonCard, SkeletonList } from './components/system';
import { PREVIEW, previewUser } from './preview';

const CirclesPage=lazy(()=>import('./pages/CirclesPage'));
const MarketplacePage=lazy(()=>import('./pages/MarketplacePage'));
const TerminalPage=lazy(()=>import('./pages/TerminalPage'));
const ProfilePage=lazy(()=>import('./pages/ProfilePage'));
const VaultPage=lazy(()=>import('./pages/VaultPage'));
const CreateCirclePage=lazy(()=>import('./pages/CreateCirclePage'));
const CommitteePage=lazy(()=>import('./pages/CommitteePage'));
const SettingsPage=lazy(()=>import('./pages/SettingsPage'));
const CreditPage=lazy(()=>import('./pages/CreditPage'));
const AboutPage=lazy(()=>import('./pages/AboutPage'));
const PayPage=lazy(()=>import('./pages/PayPage'));
const RewardsPage=lazy(()=>import('./pages/RewardsPage'));
const HyperPage=lazy(()=>import('./pages/HyperPage'));
const CardsPage=lazy(()=>import('./pages/CardsPage'));
const ActivityPage=lazy(()=>import('./pages/ActivityPage'));
const AssetPage=lazy(()=>import('./pages/AssetPage'));
const AppearancePage=lazy(()=>import('./pages/AppearancePage'));
const SupportPage=lazy(()=>import('./pages/SupportPage'));
const StatementPage=lazy(()=>import('./pages/StatementPage'));
const LimitsPage=lazy(()=>import('./pages/LimitsPage'));
const DevicesPage=lazy(()=>import('./pages/DevicesPage'));
const NoticesPage=lazy(()=>import('./pages/NoticesPage'));
const SearchPage=lazy(()=>import('./pages/SearchPage'));
const SchedulePage=lazy(()=>import('./pages/SchedulePage'));
const FeesPage=lazy(()=>import('./pages/FeesPage'));
const VerifyPage=lazy(()=>import('./pages/VerifyPage'));
const ReferPage=lazy(()=>import('./pages/ReferPage'));
const AutoPayPage=lazy(()=>import('./pages/AutoPayPage'));

export default function App(){
  const [user,setUser]=useState<User|null>(PREVIEW?previewUser as unknown as User:null);
  const [loading,setLoading]=useState(!PREVIEW);
  const [page,setPage]=useState<Page>(()=>{const q=new URLSearchParams(window.location.search);return (q.get('screen') as Page)||(q.get('join')?'circles':'home')});
  const [committeeId,setCommitteeId]=useState<string|null>(()=>new URLSearchParams(window.location.search).get('committee'));
  // An invite link (?join=CODE) opens the app straight onto that committee.
  const [joinCode,setJoinCode]=useState<string|null>(()=>new URLSearchParams(window.location.search).get('join'));
  // The payment a member is disputing, carried from a receipt into Help.
  const [dispute,setDispute]=useState<string|null>(null);
  // Page and open committee live in the URL, so the hardware back button, a
  // refresh and a shared link all behave the way a member expects. Without this
  // back exits the app from anywhere inside it.
  useEffect(()=>{
    const url=new URL(window.location.href);
    const q=new URLSearchParams();
    // Preview mode is a property of the session, not of the screen. Rebuilding
    // the query from scratch dropped it the moment anybody navigated, which is
    // why opening a committee in preview silently left preview.
    if(new URLSearchParams(url.search).get('preview')==='1')q.set('preview','1');
    if(page!=='home')q.set('screen',page);
    if(joinCode)q.set('join',joinCode);
    if(committeeId)q.set('committee',committeeId);
    const next=`${url.pathname}${q.toString()?'?'+q:''}`;
    if(next!==url.pathname+url.search)window.history.pushState({page,committeeId},'',next);
  },[page,committeeId,joinCode]);
  // Every screen records that it was seen, here rather than in each of the
  // thirty screens, so a new screen is counted without anybody remembering to
  // add the line. The event carries the screen's name and nothing else: no
  // member, no amount, no circle name (lib/events.ts).
  useEffect(()=>{trackScreen(page)},[page]);
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
  // Rafa is rendered by the Shell now that every logged-in screen, the committee
  // page included, lives inside it. One instance, one place.
  // The weekly undertaking overlay rides on every logged-in branch: it shows
  // right after account creation, then re-appears each week (or on any 428).
  const gate=PREVIEW?null:<ErrorBoundary scoped label="Undertaking"><AgreementGate userName={user.fullName}/></ErrorBoundary>;
  // The committee screen used to render outside the Shell entirely, so it got
  // none of the phone frame: on a desktop window it sprawled to 1265px, and it
  // had no bottom bar, which meant a member inside a committee could not reach
  // Home, the Vault or their Account at all. It lives inside the frame now,
  // with the Committees tab lit, like every other screen.
  if(committeeId)return <><OfflineBanner/><Shell user={user} page="circles" setPage={p=>{setCommitteeId(null);setPage(p)}} onLogout={()=>{tokens.clear();setUser(null)}}>
    <ErrorBoundary resetKey={committeeId} label="Committee">
      <Suspense fallback={<PageLoader/>}>
        <CommitteePage id={committeeId} user={user} onBack={()=>setCommitteeId(null)}/>
      </Suspense>
    </ErrorBoundary>
    {gate}
  </Shell></>;
  // In simple mode the investment surfaces are hidden; coerce any stale route
  // to home. The turn marketplace stays live in simple mode.
  const view=SIMPLE_MODE&&['terminal','vault'].includes(page)?'home':page;
  return <><OfflineBanner/><Shell user={user} page={view} setPage={setPage} onLogout={()=>{tokens.clear();setUser(null)}}>
    <ErrorBoundary resetKey={view} label="This page">
    <Suspense fallback={<PageLoader/>}>
    <div className="ds-page-enter" key={view}>
      {view==='home'&&<HomePage user={user} openCommittee={setCommitteeId} create={()=>setPage('create')} go={p=>setPage(p as Page)}/>}
      {view==='circles'&&<CirclesPage user={user} openCommittee={setCommitteeId} create={()=>setPage('create')} joinCode={joinCode} onJoinHandled={()=>setJoinCode(null)}/>}
      {view==='market'&&<MarketplacePage user={user} back={()=>setPage('profile')}/>}
      {view==='terminal'&&<TerminalPage back={()=>setPage('profile')}/>}
      {view==='vault'&&<VaultPage/>}
      {view==='profile'&&<ProfilePage user={user} openCredit={()=>setPage('credit')} go={p=>setPage(p)} onLogout={()=>{tokens.clear();setUser(null)}}/>}
      {view==='credit'&&<CreditPage user={user} back={()=>setPage('profile')}/>}
      {view==='about'&&<AboutPage back={()=>setPage('profile')}/>}
      {view==='create'&&<CreateCirclePage user={user} done={setCommitteeId} cancel={()=>setPage('home')}/>}
      {view==='settings'&&<SettingsPage user={user} back={()=>setPage('profile')}/>}
      {view==='pay'&&<PayPage user={user} back={()=>setPage('home')}/>}
      {view==='rewards'&&<RewardsPage user={user} back={()=>setPage('home')}/>}
      {view==='hyper'&&<HyperPage user={user} back={()=>setPage('home')} onVerify={()=>setPage('verify')}/>}
      {view==='cards'&&<CardsPage user={user} back={()=>setPage('home')}/>}
      {view==='activity'&&<ActivityPage user={user} back={()=>setPage('home')} onDispute={id=>{setDispute(id);setPage('support')}}/>}
      {view==='asset'&&<AssetPage back={()=>setPage('home')} openCommittee={setCommitteeId}/>}
      {view==='appearance'&&<AppearancePage back={()=>setPage('profile')}/>}
      {view==='support'&&<SupportPage back={()=>{setDispute(null);setPage(dispute?'activity':'profile')}} disputePaymentId={dispute}/>}
      {view==='statement'&&<StatementPage back={()=>setPage('profile')}/>}
      {view==='limits'&&<LimitsPage back={()=>setPage('profile')}/>}
      {view==='devices'&&<DevicesPage back={()=>setPage('profile')}/>}
      {view==='notices'&&<NoticesPage back={()=>setPage('home')}/>}
      {view==='search'&&<SearchPage back={()=>setPage('home')} openCommittee={setCommitteeId} go={p=>setPage(p)}/>}
      {view==='schedule'&&<SchedulePage userId={user.id} back={()=>setPage('home')} openCommittee={setCommitteeId} go={p=>setPage(p)}/>}
      {view==='fees'&&<FeesPage back={()=>setPage('profile')}/>}
      {view==='verify'&&<VerifyPage user={user} back={()=>setPage('profile')} go={p=>setPage(p)}/>}
      {view==='refer'&&<ReferPage user={user} back={()=>setPage('profile')} go={p=>setPage(p)}/>}
      {view==='autopay'&&<AutoPayPage userId={user.id} back={()=>setPage('profile')} openCommittee={setCommitteeId} go={p=>setPage(p)}/>}
    </div>
    </Suspense>
    </ErrorBoundary>
    {gate}
  </Shell></>
}

// A screen that is still being fetched shows a thin progress line at the top
// of the frame and the outline of what is coming, rather than replacing the
// whole app with one spinner and the word "Loading". The line is announced to
// a screen reader so a blind member is told the screen is loading instead of
// being read an empty page.
function PageLoader(){
  return <>
    <div className="ds-route-bar" aria-hidden="true"><i/></div>
    <p className="ds-sr-only" role="status" aria-live="polite">Loading</p>
    <div style={{padding:'var(--s-4) var(--gutter)'}}>
      <SkeletonCard lines={2}/>
      <div style={{height:'var(--s-4)'}}/>
      <SkeletonList rows={3}/>
    </div>
  </>;
}
