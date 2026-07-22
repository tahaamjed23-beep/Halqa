import { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import { api, tokens } from './api';
import type { Page, User } from './types';
import AuthPage from './pages/AuthPage';
import Shell from './pages/Shell';
import HomePage from './pages/HomePage';
import ErrorBoundary from './components/ErrorBoundary';
import AgreementGate from './components/AgreementGate';
import PinLock from './components/PinLock';
import { SIMPLE_MODE } from './config';

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

export default function App(){
  const [user,setUser]=useState<User|null>(null);
  const [loading,setLoading]=useState(true);
  const [page,setPage]=useState<Page>('home');
  const [committeeId,setCommitteeId]=useState<string|null>(null);
  // In-memory PIN unlock: false on every fresh load, so the app re-asks the PIN
  // each time it opens (a reload counts as an open). A fresh login sets it true
  // — you just proved your password, so no PIN on the same open.
  const [unlocked,setUnlocked]=useState(false);
  const [pinDeferred,setPinDeferred]=useState(false); // existing users who skip first-open setup
  const loadUser=useCallback(async()=>{try{setUser(await api<User>('/auth/me'))}catch{tokens.clear();setUser(null)}finally{setLoading(false)}},[]);
  useEffect(()=>{if(tokens.get())void loadUser();else setLoading(false)},[loadUser]);
  if(loading)return <div className="splash"><div className="splash-ring">ح</div></div>;
  if(!user)return <AuthPage onAuth={u=>{setUnlocked(true);setUser(u)}}/>;
  // PIN gate: a member WITH a PIN must enter it on every open; a member WITHOUT
  // one (older accounts) gets a one-time setup they may defer into Settings.
  if(!unlocked){
    if(user.hasPin)return <PinLock user={user} mode="verify" onUnlock={()=>setUnlocked(true)} onLogout={()=>{tokens.clear();setUser(null)}}/>;
    if(!pinDeferred)return <PinLock user={user} mode="setup" onUnlock={()=>{setUser({...user,hasPin:true});setUnlocked(true)}} onSkip={()=>{setPinDeferred(true);setUnlocked(true)}} onLogout={()=>{tokens.clear();setUser(null)}}/>;
  }
  // Rafa rides along on the committee page too — it renders outside the Shell,
  // and this is exactly where the pay/payout reactions fire.
  // Rafa is wrapped in its own scoped boundary everywhere it renders, so a
  // guide/chat failure can never blank the whole application.
  const rafa=(p:Page)=><ErrorBoundary scoped label="Rafa"><RafaBot page={p} setPage={next=>{setCommitteeId(null);setPage(next)}}/></ErrorBoundary>;
  // The weekly undertaking overlay rides on every logged-in branch: it shows
  // right after account creation, then re-appears each week (or on any 428).
  const gate=<ErrorBoundary scoped label="Undertaking"><AgreementGate userName={user.fullName}/></ErrorBoundary>;
  if(committeeId)return <Suspense fallback={<PageLoader/>}><ErrorBoundary resetKey={committeeId} label="Committee"><CommitteePage id={committeeId} user={user} onBack={()=>setCommitteeId(null)}/></ErrorBoundary>{rafa('circles')}{gate}</Suspense>;
  // In simple mode the investment surfaces are hidden; coerce any stale route
  // to home. The turn marketplace stays live in simple mode.
  const view=SIMPLE_MODE&&['terminal','vault'].includes(page)?'home':page;
  return <Shell user={user} page={view} setPage={setPage} onLogout={()=>{tokens.clear();setUser(null)}}>
    <ErrorBoundary resetKey={view} label="This page">
    <Suspense fallback={<PageLoader/>}>
      {view==='home'&&<HomePage user={user} openCommittee={setCommitteeId} create={()=>setPage('create')}/>}
      {view==='circles'&&<CirclesPage user={user} openCommittee={setCommitteeId} create={()=>setPage('create')}/>}
      {view==='market'&&<MarketplacePage user={user}/>}
      {view==='terminal'&&<TerminalPage/>}
      {view==='vault'&&<VaultPage/>}
      {view==='profile'&&<ProfilePage user={user} openCredit={()=>setPage('credit')}/>}
      {view==='credit'&&<CreditPage user={user} back={()=>setPage('profile')}/>}
      {view==='about'&&<AboutPage/>}
      {view==='create'&&<CreateCirclePage user={user} done={setCommitteeId} cancel={()=>setPage('home')}/>}
      {view==='settings'&&<SettingsPage user={user}/>}
    </Suspense>
    </ErrorBoundary>
    {gate}
  </Shell>
}

function PageLoader(){return <div className="page-loader"><i/><span>Loading Halqa</span></div>}
