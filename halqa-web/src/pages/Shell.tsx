import { useEffect, useState, type ReactNode } from 'react';
import { Gift, Home, UserPlus, User as UserIcon, Users, X, Bell } from 'lucide-react';
import { JoinSheet } from '../components/JoinSheet';
import { api } from '../api';
import type { Notice, Page, User } from '../types';
import RafaBot from '../components/RafaBot';
import ErrorBoundary from '../components/ErrorBoundary';

// Cash-app frame: pages own their own header, the shell owns the bottom tab
// bar, the notification sheet and the account-lock banner. Five slots with a
// raised centre action, which is the layout every Pakistani wallet uses and
// therefore the one a member already knows how to drive.
const TABS:[Page,string,ReactNode][]=[
  ['home','Home',<Home key="h"/>],
  ['circles','Committees',<Users key="c"/>],
  ['rewards','Rewards',<Gift key="r"/>],
  ['profile','Account',<UserIcon key="p"/>],
];

export default function Shell({user,page,setPage,onLogout,children}:{user:User;page:Page;setPage:(page:Page)=>void;onLogout:()=>void;children:ReactNode}){
  const [notices,setNotices]=useState<Notice[]>([]);
  const [showNotices,setShowNotices]=useState(false);
  const [joinOpen,setJoinOpen]=useState(false);
  useEffect(()=>{void api<Notice[]>('/notifications').then(setNotices).catch(()=>{})},[]);
  const unread=notices.filter(n=>!n.isRead).length;
  const openNotices=()=>{
    setShowNotices(true);
    if(unread)void api('/notifications/read-all',{method:'PATCH'}).then(()=>setNotices(items=>items.map(i=>({...i,isRead:true})))).catch(()=>{});
  };
  useEffect(()=>{
    const handler=()=>openNotices();
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

      {showNotices&&<div className="rcpt-wrap" onClick={()=>setShowNotices(false)}>
        <div className="rcpt" onClick={e=>e.stopPropagation()}>
          <div className="topbar" style={{borderRadius:'26px 26px 0 0'}}>
            <h1>Notifications</h1>
            <button className="back" onClick={()=>setShowNotices(false)}><X/></button>
          </div>
          <div style={{padding:14}}>
            {notices.length?<div className="list">{notices.map(n=>(
              <div className="row" key={n.id}>
                <div className="row-ic"><Bell/></div>
                <div className="row-body">
                  <strong>{n.type.replaceAll('_',' ').toLowerCase().replace(/^\w/,c=>c.toUpperCase())}</strong>
                  <span>{n.message}</span>
                </div>
              </div>
            ))}</div>:<Blank/>}
          </div>
        </div>
      </div>}

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

function Blank(){return <div className="empty"><div className="empty-ic"><Bell/></div><strong>Nothing yet</strong><p>Payment receipts, payout alerts and committee updates land here.</p></div>}
