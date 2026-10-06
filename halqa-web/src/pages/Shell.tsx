import { useEffect, type ReactNode } from 'react';
import { Home, Receipt, User as UserIcon, Users, X } from 'lucide-react';
import type { Page, User } from '../types';
import RafaBot from '../components/RafaBot';
import ErrorBoundary from '../components/ErrorBoundary';

// The frame: pages own their own header, the shell owns the bottom tab bar and
// the account-lock banner.
//
// Four destinations, flat, no raised centre action. The raised Join button was
// removed on 23 September 2026. It overlapped the primary button on the
// Committees screen, its label rendered below the bar and off the bottom of the
// viewport, and joining existed three ways at once: a tab, a floating button
// and a grid tile. Joining is now one thing, an action on Home and on the
// Committees screen, which is where a member is when they want it.
//
// Vault is not a destination while the surface is withdrawn pending the
// distributor registration; Activity takes the slot, which is what a member
// opens most after Home.
const TABS: [Page, string, ReactNode][] = [
  ['home', 'Home', <Home key="h" />],
  ['circles', 'Committees', <Users key="c" />],
  ['activity', 'Activity', <Receipt key="a" />],
  ['profile', 'Account', <UserIcon key="p" />],
];

export default function Shell({user,page,setPage,onLogout,children}:{user:User;page:Page;setPage:(page:Page)=>void;onLogout:()=>void;children:ReactNode}){
  useEffect(()=>{
    const handler=()=>setPage('notices');
    window.addEventListener('halqa:open-notices',handler);
    return()=>window.removeEventListener('halqa:open-notices',handler);
  });

  return (
    <div className="app-shell">
      {/* The first thing a keyboard reaches on every screen. Without it, a
          member tabs through the whole tab bar before they reach the screen
          they opened, on every screen, every time (WCAG 2.4.1). It is invisible
          until it has focus, and then it is the most visible thing on screen. */}
      <a href="#main-content" className="skip-link">Skip to the main content</a>
      <main className="content" id="main-content" tabIndex={-1}>
        {user.isBanned&&<div className="banner bad" style={{margin:'12px 14px'}}>
          <X/><div><b>Account in recovery</b><p>{user.banReason||'Clear open recovery cases from Account to restore access.'}</p></div>
        </div>}
        {children}
      </main>

      <ErrorBoundary scoped label="Rafa"><RafaBot page={page} setPage={setPage}/></ErrorBoundary>

      <nav className="tabs" aria-label="Main">
        {TABS.map(([id,label,icon])=>(
          <button
            key={id}
            className={`tab ${page===id?'on':''}`}
            aria-current={page===id?'page':undefined}
            onClick={()=>setPage(id)}
          >{icon}<span>{label}</span></button>
        ))}
      </nav>
      <button hidden onClick={onLogout}/>
    </div>
  );
}
