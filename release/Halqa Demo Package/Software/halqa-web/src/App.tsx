import { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import { api, tokens } from './api';
import type { Page, User } from './types';
import AuthPage from './pages/AuthPage';
import Shell from './pages/Shell';
import HomePage from './pages/HomePage';

const CirclesPage=lazy(()=>import('./pages/CirclesPage'));
const MarketplacePage=lazy(()=>import('./pages/MarketplacePage'));
const TerminalPage=lazy(()=>import('./pages/TerminalPage'));
const ProfilePage=lazy(()=>import('./pages/ProfilePage'));
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
  if(committeeId)return <Suspense fallback={<PageLoader/>}><CommitteePage id={committeeId} user={user} onBack={()=>setCommitteeId(null)}/><RafaBot page={'circles'} setPage={next=>{setCommitteeId(null);setPage(next)}}/></Suspense>;
  return <Shell user={user} page={page} setPage={setPage} onLogout={()=>{tokens.clear();setUser(null)}}>
    <Suspense fallback={<PageLoader/>}>
      {page==='home'&&<HomePage user={user} openCommittee={setCommitteeId} create={()=>setPage('create')}/>} 
      {page==='circles'&&<CirclesPage user={user} openCommittee={setCommitteeId} create={()=>setPage('create')}/>} 
      {page==='market'&&<MarketplacePage user={user}/>} 
      {page==='terminal'&&<TerminalPage/>} 
      {page==='profile'&&<ProfilePage user={user}/>} 
      {page==='create'&&<CreateCirclePage user={user} done={setCommitteeId} cancel={()=>setPage('home')}/>} 
    </Suspense>
  </Shell>
}

function PageLoader(){return <div className="page-loader"><i/><span>Loading Halqa</span></div>}
