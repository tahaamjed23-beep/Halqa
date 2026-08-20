import type { ReactNode } from 'react';
import { Info, LineChart, Package, Receipt, Repeat, Settings, ShieldCheck, Sparkles } from 'lucide-react';
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

export function AccountMenu({ go }: { go: (page: Page) => void }) {
  const rows: Entry[] = [
    { page: 'credit',   icon: <ShieldCheck />, title: 'Credit report',      sub: 'Your score, and every payment behind it' },
    { page: 'activity', icon: <Receipt />,     title: 'Activity',           sub: 'Every receipt, newest first' },
    { page: 'market',   icon: <Repeat />,      title: 'Turn marketplace',   sub: 'Swap your turn with somebody in the same circle', when: !SIMPLE_MODE },
    { page: 'asset',    icon: <Package />,     title: 'Save for something', sub: 'A phone, a bike, an appliance' },
    { page: 'rewards',  icon: <Sparkles />,    title: 'Rewards',            sub: 'What your streak is worth' },
    { page: 'terminal', icon: <LineChart />,   title: 'Where money sits',   sub: 'Every recorded balance, and where', when: !SIMPLE_MODE },
    { page: 'settings', icon: <Settings />,    title: 'Settings',           sub: 'PIN, privacy, notifications' },
    { page: 'about',    icon: <Info />,        title: 'About Halqa',        sub: 'How a Halqa committee works' },
  ];

  return (
    <RowGroup>
      {rows.filter(r => r.when !== false).map(r => (
        <Row key={r.page} icon={r.icon} title={r.title} sub={r.sub} onClick={() => go(r.page)} />
      ))}
    </RowGroup>
  );
}

export default AccountMenu;
