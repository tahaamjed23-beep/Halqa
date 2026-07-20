import { useEffect, useState, type ReactNode } from 'react';
import { Bell, CircleDollarSign, Home, Landmark, LogOut, Users, Wallet } from 'lucide-react';
import { api } from '../api';
import type { Notice, Page, User } from '../types';
import { Logo } from '../components/ui';
import RafaBot from '../components/RafaBot';

export default function Shell({user,page,setPage,onLogout,children}:{user:User;page:Page;setPage:(page:Page)=>void;onLogout:()=>void;children:ReactNode}){
  const [notices,setNotices]=useState<Notice[]>([]);const [show,setShow]=useState(false);
  useEffect(()=>{void api<Notice[]>('/notifications').then(setNotices)},[]);
  const unread=notices.filter(notice=>!notice.isRead).length;
  const nav:[Page,string,ReactNode][]=[['home','Dashboard',<Home key="1"/>],['circles','Circles',<Users key="2"/>],['market','Market',<CircleDollarSign key="3"/>],['terminal','Terminal',<Landmark key="4"/>],['profile','Profile',<Wallet key="5"/>]];
  const openNotices=()=>{setShow(!show);if(unread)void api('/notifications/read-all',{method:'PATCH'}).then(()=>setNotices(items=>items.map(item=>({...item,isRead:true}))))};
  
  return (
    <div className="app-shell sidebar-layout">
      <aside className="sidebar">
        <div className="sidebar-top">
          <Logo/>
          <div className="account-box">
            <div className="account-avatar">{user.fullName.charAt(0)}</div>
            <div className="account-meta">
              <strong>{user.fullName}</strong>
              <span>🔥 {user.paymentStreak || 0} Streak</span>
            </div>
          </div>
          <nav className="side-nav">
            {nav.map(([id,label,icon])=>(
              <button key={id} className={page===id?'active':''} onClick={()=>setPage(id)}>
                {icon}<span>{label}</span>
              </button>
            ))}
          </nav>
        </div>
        <div className="sidebar-bottom">
          <div className="halqa-pulse"><i/><div><strong>Halqa Pulse</strong><span>{unread ? `${unread} update${unread===1?'':'s'} waiting` : 'Everything is current'}</span></div></div>
          <div className="sidebar-actions">
            <div className="notice-wrap">
              <button className={`action-btn ${show?'active':''}`} onClick={openNotices}>
                <Bell size={20}/>
                {unread>0&&<i className="badge"/>}
              </button>
              {show&&<aside className="notice-panel">{notices.length?notices.map(notice=><article key={notice.id}><b>{notice.type.replaceAll('_',' ')}</b><p>{notice.message}</p></article>):<p className="muted">No updates</p>}</aside>}
            </div>
            <button className="action-btn" onClick={onLogout}><LogOut size={20}/></button>
          </div>
        </div>
      </aside>
      <main className="content bento-content">
        <header className="mobile-topbar">
          <Logo/>
          <button onClick={openNotices}><Bell size={20}/>{unread>0&&<i className="badge"/>}</button>
        </header>
        {user.isBanned&&<div className="account-lock-banner"><strong>Account in default recovery</strong><span>{user.banReason||'Clear open recovery cases from Profile to restore access.'}</span><button onClick={()=>setPage('profile')}>Open recovery</button></div>}
        {children}
      </main>
      <RafaBot page={page} setPage={setPage}/>
      <nav className="mobile-nav">
        {nav.map(([id,label,icon])=>(
          <button key={id} className={page===id?'active':''} onClick={()=>setPage(id)}>
            {icon}<span>{label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
