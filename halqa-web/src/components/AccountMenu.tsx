import type { ReactNode } from 'react';
import { ChevronRight, Info, LineChart, Receipt, Repeat, Settings, ShieldCheck, Sparkles } from 'lucide-react';
import type { Page } from '../types';
import { SIMPLE_MODE } from '../config';

// ---------------------------------------------------------------------------
// The reachability fix.
//
// Marketplace, Terminal, About and Settings were all fully built, rendered by
// App.tsx, and unreachable: nothing anywhere navigated to them. A feature with
// no entry point does not exist to a member. This is the menu that opens them,
// laid out like the account tab of any cash app: one row list, icon, title,
// one line of context, chevron.
// ---------------------------------------------------------------------------

type Row = { page: Page; icon: ReactNode; title: string; sub: string; when?: boolean };

export function AccountMenu({ go }: { go: (page: Page) => void }) {
  const rows: Row[] = [
    { page: 'credit',   icon: <ShieldCheck />, title: 'Credit report',   sub: 'Your score and payment record' },
    { page: 'activity', icon: <Receipt />,     title: 'Activity',        sub: 'Every payment and receipt' },
    { page: 'market',   icon: <Repeat />,      title: 'Turn marketplace', sub: 'Buy or sell a turn', when: !SIMPLE_MODE },
    { page: 'rewards',  icon: <Sparkles />,    title: 'Rewards',         sub: 'Points and streaks' },
    { page: 'terminal', icon: <LineChart />,   title: 'Scheme terminal', sub: 'Where idle funds sit', when: !SIMPLE_MODE },
    { page: 'settings', icon: <Settings />,    title: 'Settings',        sub: 'Security, privacy, notifications' },
    { page: 'about',    icon: <Info />,        title: 'About Halqa',     sub: 'How it works, who we are' },
  ];
  const visible = rows.filter(r => r.when !== false);

  return (
    <section className="panel account-menu">
      <div className="settings-body">
        {visible.map(r => (
          <button key={r.page} className="settings-row" onClick={() => go(r.page)}>
            {r.icon}
            <span className="settings-row-text"><b>{r.title}</b><small>{r.sub}</small></span>
            <ChevronRight className="chev" />
          </button>
        ))}
      </div>
    </section>
  );
}

export default AccountMenu;
