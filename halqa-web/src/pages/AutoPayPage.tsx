import { useEffect, useMemo, useState } from 'react';
import { CreditCard, Landmark, Repeat, Smartphone, Zap, ZapOff } from 'lucide-react';
import { api } from '../api';
import { money } from '../lib/format';
import type { Committee, Page } from '../types';
import { Blank, FlowHeader, Row, RowGroup, RowsLoading, Segment } from '../components/wallet';

// ---------------------------------------------------------------------------
// AUTO-PAY
//
// Auto-collection is set one committee at a time, buried on that committee's
// screen, so a member in nine circles had no way to see which of them will pull
// on their own and which are waiting for a tap. This is that list.
// ---------------------------------------------------------------------------

const RAIL: Record<string, { word: string; icon: JSX.Element }> = {
  RAAST:     { word: 'Raast',        icon: <Zap /> },
  BANK:      { word: 'Bank account', icon: <Landmark /> },
  CARD:      { word: 'Card',         icon: <CreditCard /> },
  WALLET:    { word: 'Wallet',       icon: <Smartphone /> },
  EASYPAISA: { word: 'Easypaisa',    icon: <Smartphone /> },
  JAZZCASH:  { word: 'JazzCash',     icon: <Smartphone /> },
};

type Line = {
  id: string; name: string; on: boolean; rail: string | null;
  amountPaisa: string; turn: number; running: boolean;
};

export default function AutoPayPage({ userId, back, openCommittee, go }: {
  userId: string; back?: () => void;
  openCommittee?: (id: string) => void; go?: (page: Page) => void;
}) {
  const [tab, setTab] = useState<'on' | 'off'>('on');
  const [committees, setCommittees] = useState<Committee[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void api<Committee[]>('/committees?scope=mine')
      .then(c => setCommittees(Array.isArray(c) ? c : []))
      .catch(() => setCommittees([]))
      .finally(() => setLoading(false));
  }, []);

  const lines = useMemo<Line[]>(() => {
    const out: Line[] = [];
    committees.forEach(c => {
      const me = (c.members || []).find(m => m.userId === userId);
      if (!me || c.status === 'COMPLETED' || c.status === 'CANCELLED') return;
      out.push({
        id: c.id, name: c.name, on: !!me.autoDebitEnabled, rail: me.autoDebitRail || null,
        amountPaisa: c.contributionPaisa, turn: me.turnPosition,
        running: c.status === 'ACTIVE',
      });
    });
    return out.sort((a, b) => a.name.localeCompare(b.name));
  }, [committees, userId]);

  const on = lines.filter(l => l.on);
  const off = lines.filter(l => !l.on);
  const rows = tab === 'on' ? on : off;

  return (
    <div className="w-screen">
      <FlowHeader title="Auto-pay" onBack={back} />
      <Segment value={tab} onChange={setTab} options={[
        { id: 'on', label: on.length ? 'Automatic (' + on.length + ')' : 'Automatic' },
        { id: 'off', label: off.length ? 'You pay (' + off.length + ')' : 'You pay' },
      ]} />

      <div className="w-screen-body">
        {rows.length > 0 && (
          <div className="w-hero">
            <span>{tab === 'on' ? 'Collected automatically' : 'You pay these yourself'}</span>
            <strong>{money(String(rows.reduce((t, l) => t + BigInt(l.amountPaisa), 0n)))}</strong>
            <small>Each round, across {rows.length} committee{rows.length === 1 ? '' : 's'}</small>
          </div>
        )}

        {loading ? <RowsLoading />
          : rows.length ? (
            <RowGroup title={tab === 'on' ? 'Pulls on the due date' : 'Waiting for you'}>
              {rows.map(l => (
                <Row key={l.id}
                     icon={l.on ? (RAIL[l.rail || ''] || RAIL.RAAST).icon : <ZapOff />}
                     title={l.name}
                     sub={'Turn ' + l.turn + ' · ' + money(l.amountPaisa)
                       + (l.on ? ' · ' + (RAIL[l.rail || '']?.word || 'Raast') : '')
                       + (l.running ? '' : ' · not started')}
                     value={l.on ? 'On' : 'Off'}
                     tone={l.on ? 'ok' : 'warn'}
                     onClick={openCommittee ? () => openCommittee(l.id) : undefined} />
              ))}
            </RowGroup>
          ) : (
            <Blank icon={<Repeat />}
                   title={tab === 'on' ? 'Nothing is automatic' : 'All of them are automatic'}
                   sub={tab === 'on'
                     ? 'Turn it on inside a committee and it appears here.'
                     : 'Nothing needs a tap on the due date.'} />
          )}

        {go && off.length > 0 && tab === 'off' && (
          <div className="w-inset">
            <button className="primary" onClick={() => go('pay')}>Pay one now</button>
          </div>
        )}

        <p className="w-foot">
          Auto-pay is set per committee, on that committee's screen. Halqa never
          moves money on its own outside the instalment that is due.
        </p>
      </div>
    </div>
  );
}
