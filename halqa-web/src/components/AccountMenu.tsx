import type { ReactNode } from 'react';
import {
  BadgeCheck, CalendarClock, Coins, FileText, Gauge, Info, LifeBuoy, LineChart, LogOut,
  Monitor, Package, Palette, Receipt, Repeat, Settings, ShieldCheck, Sparkles, UserPlus, Zap,
} from 'lucide-react';
import type { Page } from '../types';
import { SIMPLE_MODE } from '../config';
import { Row, RowGroup } from './wallet';

// ---------------------------------------------------------------------------
// The reachability fix.
//
// Marketplace, Terminal, About and Settings were all fully built, rendered by
// App.tsx, and unreachable: nothing anywhere navigated to them. A feature with
// no entry point does not exist to a member.
//
// It began as one flat list, which read fine at eight rows and not at all at
// eighteen. Grouped now, the way every wallet's account tab is grouped, so a
// member looking for one thing reads five headings instead of every row.
// ---------------------------------------------------------------------------

type Entry = { page: Page; icon: ReactNode; title: string; sub?: string; when?: boolean };
type Section = { title: string; rows: Entry[] };

const SECTIONS: Section[] = [
  {
    title: 'Your money',
    rows: [
      { page: 'schedule',  icon: <CalendarClock />, title: 'Schedule',  sub: 'What is due, and when your turn lands' },
      { page: 'activity',  icon: <Receipt />,       title: 'Activity',  sub: '' },
      { page: 'statement', icon: <FileText />,      title: 'Statement', sub: '' },
      { page: 'autopay',   icon: <Zap />,           title: 'Auto-pay',  sub: 'Which circles collect on their own' },
    ],
  },
  {
    title: 'Your standing',
    rows: [
      { page: 'credit',  icon: <ShieldCheck />, title: 'Credit report',    sub: '' },
      { page: 'verify',  icon: <BadgeCheck />,  title: 'Verification',     sub: 'What is checked, and what is left' },
      { page: 'limits',  icon: <Gauge />,       title: 'Limits and level', sub: '' },
      { page: 'rewards', icon: <Sparkles />,    title: 'Rewards',          sub: '' },
    ],
  },
  {
    title: 'Circles',
    rows: [
      { page: 'refer',    icon: <UserPlus />,  title: 'Invite people',      sub: '' },
      { page: 'asset',    icon: <Package />,   title: 'Save for something', sub: 'Phone, bike, appliance' },
      { page: 'market',   icon: <Repeat />,    title: 'Turn marketplace',   sub: 'Swap turns inside a circle', when: !SIMPLE_MODE },
      { page: 'terminal', icon: <LineChart />, title: 'Where money sits',   sub: '', when: !SIMPLE_MODE },
    ],
  },
  {
    title: 'App',
    rows: [
      { page: 'appearance', icon: <Palette />,  title: 'Look and feel', sub: 'Theme, colour, text size' },
      { page: 'devices',    icon: <Monitor />,  title: 'Signed in on',  sub: '' },
      { page: 'settings',   icon: <Settings />, title: 'Settings',      sub: 'PIN, privacy, notifications' },
    ],
  },
  {
    title: 'Halqa',
    rows: [
      { page: 'fees',    icon: <Coins />,    title: 'Fees and charges', sub: '' },
      { page: 'support', icon: <LifeBuoy />, title: 'Help',             sub: '' },
      { page: 'about',   icon: <Info />,     title: 'About Halqa',      sub: '' },
    ],
  },
];

export function AccountMenu({ go, onLogout }: { go: (page: Page) => void; onLogout?: () => void }) {
  return (
    <>
      {SECTIONS.map(section => {
        const rows = section.rows.filter(r => r.when !== false);
        if (!rows.length) return null;
        return (
          <RowGroup key={section.title} title={section.title}>
            {rows.map(r => (
              <Row key={r.page} icon={r.icon} title={r.title} sub={r.sub || undefined} onClick={() => go(r.page)} />
            ))}
          </RowGroup>
        );
      })}

      {/* Signing out had no control anywhere in the app. It does now. */}
      {onLogout && (
        <RowGroup>
          <Row icon={<LogOut />} title="Sign out" onClick={onLogout} />
        </RowGroup>
      )}
    </>
  );
}

export default AccountMenu;
