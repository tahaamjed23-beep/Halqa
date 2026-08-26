import type { ReactNode } from 'react';
import { FileText, Gauge, Info, LifeBuoy, LineChart, LogOut, Monitor, Package, Palette, Receipt, Repeat, Settings, ShieldCheck, Sparkles } from 'lucide-react';
import type { Page } from '../types';
import { SIMPLE_MODE } from '../config';
import { Row, RowGroup } from './wallet';

// ---------------------------------------------------------------------------
// The reachability fix.
//
// Marketplace, Terminal, About and Settings were all fully built, rendered by
// App.tsx, and unreachable: nothing anywhere navigated to them. A feature with
// no entry point does not exist to a member. This is the menu that opens them,
// built from the same rows as every other list in the app.
// ---------------------------------------------------------------------------

type Entry = { page: Page; icon: ReactNode; title: string; sub: string; when?: boolean };

export function AccountMenu({ go, onLogout }: { go: (page: Page) => void; onLogout?: () => void }) {
  const rows: Entry[] = [
    { page: 'credit',   icon: <ShieldCheck />, title: 'Credit report',      sub: 'Score, band and history' },
    { page: 'activity', icon: <Receipt />,     title: 'Activity',           sub: 'Receipts, newest first' },
    { page: 'market',   icon: <Repeat />,      title: 'Turn marketplace',   sub: 'Swap turns inside a circle', when: !SIMPLE_MODE },
    { page: 'asset',    icon: <Package />,     title: 'Save for something', sub: 'Phone, bike, appliance' },
    { page: 'rewards',  icon: <Sparkles />,    title: 'Rewards',            sub: 'What your streak is worth' },
    { page: 'terminal', icon: <LineChart />,   title: 'Where money sits',   sub: 'Every recorded balance', when: !SIMPLE_MODE },
    { page: 'statement', icon: <FileText />,  title: 'Statement',          sub: 'A period, its totals, every line' },
    { page: 'limits',    icon: <Gauge />,     title: 'Limits and level',   sub: 'What applies, and what lifts it' },
    { page: 'appearance', icon: <Palette />,  title: 'Look and feel',      sub: 'Theme, colour, text size, photo' },
    { page: 'devices',   icon: <Monitor />,   title: 'Where you are signed in', sub: 'Sessions, and signing others out' },
    { page: 'support',   icon: <LifeBuoy />,  title: 'Help',               sub: 'Answers, and raising a case' },
    { page: 'settings', icon: <Settings />,    title: 'Settings',           sub: 'PIN, privacy, notifications' },
    { page: 'about',    icon: <Info />,        title: 'About Halqa',        sub: 'How a committee works' },
  ];

  return (
    <RowGroup>
      {rows.filter(r => r.when !== false).map(r => (
        <Row key={r.page} icon={r.icon} title={r.title} sub={r.sub} onClick={() => go(r.page)} />
      ))}
      {/* Signing out had no control anywhere in the app. It does now. */}
      {onLogout && (
        <Row icon={<LogOut />} title="Sign out" sub="You will need your password to get back in"
             onClick={onLogout} />
      )}
    </RowGroup>
  );
}

export default AccountMenu;
