import { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import { api, tokens } from './api';
import type { Page, User } from './types';
import AuthPage from './pages/AuthPage';
import Shell from './pages/Shell';
import HomePage from './pages/HomePage';
import ErrorBoundary from './components/ErrorBoundary';
import { SIMPLE_MODE } from './config';

const CirclesPage=lazy(()=>import('./pages/CirclesPage'));
const MarketplacePage=lazy(()=>import('./pages/MarketplacePage'));
const TerminalPage=lazy(()=>import('./pages/TerminalPage'));
const ProfilePage=lazy(()=>import('./pages/ProfilePage'));
const VaultPage=lazy(()=>import('./pages/VaultPage'));
const CreateCirclePage=lazy(()=>import('./pages/CreateCirclePage'));
const CommitteePage=lazy(()=>import('./pages/CommitteePage'));
const RafaBot=lazy(()=>import('./components/RafaBot'));

export default function App(){
  const [user,setUser]=useState<User|null>(null);
  const [loading,setLoading]=useState(true);
  const [page,setPage]=useState<Page>('home');
  const [committeeId,setCommitteeId]=useState<string|null>(null);
  const loadUser=useCallback(async()=>{try{setUser(await api<User>('/auth/me'))}catch{tokens.clear();setUser(null)}finally{setLoading(false)}},[]);
  useEffect(()=>{if(tokens.get())void loadUser();else setLoading(false)},[loadUser]);
  if(loading)return <div className="splash"><div className="splash-ring">ح</div></div>;
  if(!user)return <AuthPage onAuth={setUser}/>;
  // Rafa rides along on the committee page too — it renders outside the Shell,
  // and this is exactly where the pay/payout reactions fire.
  // Rafa is wrapped in its own scoped boundary everywhere it renders, so a
  // guide/chat failure can never blank the whole application.
  const rafa=(p:Page)=><ErrorBoundary scoped label="Rafa"><RafaBot page={p} setPage={next=>{setCommitteeId(null);setPage(next)}}/></ErrorBoundary>;
  if(committeeId)return <Suspense fallback={<PageLoader/>}><ErrorBoundary resetKey={committeeId} label="Committee"><CommitteePage id={committeeId} user={user} onBack={()=>setCommitteeId(null)}/></ErrorBoundary>{rafa('circles')}</Suspense>;
  // In simple mode the investment surfaces are hidden; coerce any stale route to home.
  const view=SIMPLE_MODE&&['market','terminal','vault'].includes(page)?'home':page;
  return <Shell user={user} page={view} setPage={setPage} onLogout={()=>{tokens.clear();setUser(null)}}>
    <ErrorBoundary resetKey={view} label="This page">
    <Suspense fallback={<PageLoader/>}>
      {view==='home'&&<HomePage user={user} openCommittee={setCommitteeId} create={()=>setPage('create')}/>}
      {view==='circles'&&<CirclesPage user={user} openCommittee={setCommitteeId} create={()=>setPage('create')}/>}
      {view==='market'&&<MarketplacePage user={user}/>}
      {view==='terminal'&&<TerminalPage/>}
      {view==='vault'&&<VaultPage/>}
      {view==='profile'&&<ProfilePage user={user}/>}
      {view==='create'&&<CreateCirclePage user={user} done={setCommitteeId} cancel={()=>setPage('home')}/>}
    </Suspense>
    </ErrorBoundary>
  </Shell>
}

function PageLoader(){return <div className="page-loader"><i/><span>Loading Halqa</span></div>}
