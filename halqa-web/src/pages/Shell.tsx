import { useEffect, useState, type ReactNode } from 'react';
import { Bell, CircleDollarSign, Home, Landmark, LogOut, PiggyBank, Settings, Users, Wallet } from 'lucide-react';
import { api } from '../api';
import type { Notice, Page, User } from '../types';
import { Logo } from '../components/ui';
import RafaBot from '../components/RafaBot';
import ErrorBoundary from '../components/ErrorBoundary';
import { SIMPLE_MODE } from '../config';
import { t, useLang } from '../lib/i18n';

export default function Shell({user,page,setPage,onLogout,children}:{user:User;page:Page;setPage:(page:Page)=>void;onLogout:()=>void;children:ReactNode}){
  const [notices,setNotices]=useState<Notice[]>([]);const [show,setShow]=useState(false);
  const [lang,setLang]=useLang();
  useEffect(()=>{void api<Notice[]>('/notifications').then(setNotices)},[]);
  const unread=notices.filter(notice=>!notice.isRead).length;
  // Simple mode (Kazi pivot) shows only the "just lend and pay" surfaces —
  // Market/Terminal/Vault stay in the code, hidden from the nav.
  const fullNav:[Page,string,ReactNode][]=[['home',t('nav_home',lang),<Home key="1"/>],['circles',t('nav_circles',lang),<Users key="2"/>],['market',t('nav_market',lang),<CircleDollarSign key="3"/>],['terminal',t('nav_terminal',lang),<Landmark key="4"/>],['vault',t('nav_vault',lang),<PiggyBank key="6"/>],['profile',t('nav_profile',lang),<Wallet key="5"/>],['settings',lang==='ur'?'ترتیبات':'Settings',<Settings key="7"/>]];
  // Simple mode keeps the turn marketplace (buy/sell positions — even across
  // circles) alongside the core surfaces; only the investment layer stays hidden.
  const nav=SIMPLE_MODE?fullNav.filter(([id])=>['home','circles','market','profile','settings'].includes(id)):fullNav;
  const openNotices=()=>{setShow(!show);if(unread)void api('/notifications/read-all',{method:'PATCH'}).then(()=>setNotices(items=>items.map(item=>({...item,isRead:true}))))};

  return (
    <div className="app-shell sidebar-layout">
      <aside className="sidebar">
        <div className="sidebar-top">
          <button className="logo-link" onClick={()=>setPage('about')} title="About Halqa"><Logo/></button>
          <div className="account-box">
            <div className="account-avatar">{user.fullName.charAt(0)}</div>
            <div className="account-meta">
              <strong>{user.fullName}</strong>
              <span>🔥 {user.paymentStreak || 0} {t('streak',lang)}</span>
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
          <div className="sidebar-actions">
            <div className="notice-wrap">
              <button className={`action-btn ${show?'active':''}`} onClick={openNotices}>
                <Bell size={20}/>
                {unread>0&&<i className="badge"/>}
              </button>
              {show&&<aside className="notice-panel">{notices.length?notices.map(notice=><article key={notice.id}><b>{notice.type.replaceAll('_',' ')}</b><p>{notice.message}</p></article>):<p className="muted">No updates</p>}</aside>}
            </div>
            <button className="action-btn lang-btn" title={lang==='en'?'اردو میں دیکھیں':'Switch to English'} onClick={()=>setLang(lang==='en'?'ur':'en')}>{lang==='en'?'اردو':'EN'}</button>
            <button className="action-btn" onClick={()=>{if(window.confirm(lang==='ur'?'کیا آپ واقعی سائن آؤٹ کرنا چاہتے ہیں؟':'Are you sure you want to sign out?'))onLogout()}}><LogOut size={20}/></button>
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
      <ErrorBoundary scoped label="Rafa"><RafaBot page={page} setPage={setPage}/></ErrorBoundary>
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
