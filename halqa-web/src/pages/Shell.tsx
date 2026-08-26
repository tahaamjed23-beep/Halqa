import { useEffect, useState, type ReactNode } from 'react';
import { Gift, Home, PiggyBank, UserPlus, User as UserIcon, Users, X } from 'lucide-react';
import { JoinSheet } from '../components/JoinSheet';
import { SIMPLE_MODE } from '../config';
import type { Page, User } from '../types';
import RafaBot from '../components/RafaBot';
import ErrorBoundary from '../components/ErrorBoundary';

// Cash-app frame: pages own their own header, the shell owns the bottom tab
// bar, the notification sheet and the account-lock banner. Five slots with a
// raised centre action, which is the layout every Pakistani wallet uses and
// therefore the one a member already knows how to drive.
// The bar is symmetric around the centre Join button: two tabs, Join, two tabs.
// With the full product on, Vault replaces Rewards on the right and Rewards
// moves to a quick action, so the bar never grows past five targets.
const TABS:[Page,string,ReactNode][]=SIMPLE_MODE?[
  ['home','Home',<Home key="h"/>],
  ['circles','Committees',<Users key="c"/>],
  ['rewards','Rewards',<Gift key="r"/>],
  ['profile','Account',<UserIcon key="p"/>],
]:[
  ['home','Home',<Home key="h"/>],
  ['circles','Committees',<Users key="c"/>],
  ['vault','Vault',<PiggyBank key="v"/>],
  ['profile','Account',<UserIcon key="p"/>],
];

export default function Shell({user,page,setPage,onLogout,children}:{user:User;page:Page;setPage:(page:Page)=>void;onLogout:()=>void;children:ReactNode}){
  const [joinOpen,setJoinOpen]=useState(false);
  useEffect(()=>{
    // The bell now opens the notifications screen. The sheet stays for anything
    // that still asks for it, but nothing does.
    const handler=()=>setPage('notices');
    window.addEventListener('halqa:open-notices',handler);
    return()=>window.removeEventListener('halqa:open-notices',handler);
  });

  return (
    <div className="app-shell">
      <main className="content">
        {user.isBanned&&<div className="banner bad" style={{margin:'12px 14px'}}>
          <X/><div><b>Account in recovery</b><p>{user.banReason||'Clear open recovery cases from Account to restore access.'}</p></div>
        </div>}
        {children}
      </main>

      
      <ErrorBoundary scoped label="Rafa"><RafaBot page={page} setPage={setPage}/></ErrorBoundary>

      {joinOpen&&<JoinSheet onClose={()=>setJoinOpen(false)} onJoined={()=>{setJoinOpen(false);setPage('circles')}}/>}

      <nav className="tabs">
        {TABS.slice(0,2).map(([id,label,icon])=>(
          <button key={id} className={`tab ${page===id?'on':''}`} onClick={()=>setPage(id)}>{icon}<span>{label}</span></button>
        ))}
        {/* Joining is what most members do most of the time; hosting is the
            rarer act and lives on the Committees screen. So the biggest thing
            in the bar is Join. */}
        <div className="tab-fab">
          <button className="fab" aria-label="Join a committee" onClick={()=>setJoinOpen(true)}><UserPlus size={26}/></button>
          <span className="fab-label">Join</span>
        </div>
        {TABS.slice(2).map(([id,label,icon])=>(
          <button key={id} className={`tab ${page===id?'on':''}`} onClick={()=>setPage(id)}>{icon}<span>{label}</span></button>
        ))}
      </nav>
      <button hidden onClick={onLogout}/>
    </div>
  );
}

