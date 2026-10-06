import { useCallback, useEffect, useState } from 'react';
import {
  Bell, CalendarClock, Check, CircleAlert, Gift, Users, Wallet,
} from 'lucide-react';
import { api } from '../api';
import { date, dateTime } from '../lib/format';
import type { Notice as NoticeRow } from '../types';
import { Blank, FlowHeader, Row, RowGroup, RowsLoading, Segment } from '../components/wallet';

// ---------------------------------------------------------------------------
// NOTIFICATIONS
//
// These lived in a sheet that dropped over whatever you were doing, so there
// was no way to look back through them, no grouping by day, and no way to tell
// a payment reminder from a payout at a glance. It is a screen now, like it is
// in every wallet, with the day as the divider and the kind as the icon.
// ---------------------------------------------------------------------------

/** Types come off the wire as enums; a member reads words. */
const WORD: Record<string, { title: string; icon: JSX.Element; tone?: 'ok' | 'warn' | 'bad' }> = {
  PAYMENT_DUE:       { title: 'An instalment is due', icon: <CalendarClock />, tone: 'warn' },
  PAYMENT_LATE:      { title: 'An instalment is late', icon: <CircleAlert />, tone: 'bad' },
  PAYMENT_RECEIVED:  { title: 'Your payment went through', icon: <Check />, tone: 'ok' },
  PAYOUT_RELEASED:   { title: 'A payout was released', icon: <Wallet />, tone: 'ok' },
  ROUND_OPENED:      { title: 'A new turn opened', icon: <CalendarClock /> },
  COMMITTEE_STARTED: { title: 'A committee started', icon: <Users />, tone: 'ok' },
  MEMBER_JOINED:     { title: 'Somebody joined', icon: <Users /> },
  REWARD_EARNED:     { title: 'You earned a reward', icon: <Gift />, tone: 'ok' },
  WHATSAPP_RECEIPT:  { title: 'Your receipt', icon: <Check />, tone: 'ok' },
};
const describe = (type: string) => WORD[type] || {
  title: type.replace(/_/g, ' ').toLowerCase().replace(/^\w/, c => c.toUpperCase()),
  icon: <Bell />,
};

function dayLabel(iso: string): string {
  const d = new Date(iso), now = new Date();
  const midnight = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const days = Math.round((midnight(now) - midnight(d)) / 86_400_000);
  return days === 0 ? 'Today' : days === 1 ? 'Yesterday' : date(iso);
}

export default function NoticesPage({ back }: { back?: () => void }) {
  const [rows, setRows] = useState<NoticeRow[]>([]);
  const [tab, setTab] = useState<'all' | 'unread'>('all');
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => api<NoticeRow[]>('/notifications')
    .then(setRows).catch(() => setRows([])).finally(() => setLoading(false)), []);
  useEffect(() => { void load() }, [load]);

  const markAll = async () => {
    setRows(list => list.map(r => ({ ...r, isRead: true })));
    try { await api('/notifications/read-all', { method: 'PATCH' }) } catch { /* it re-reads next open */ }
  };

  const shown = tab === 'unread' ? rows.filter(r => !r.isRead) : rows;
  const unread = rows.filter(r => !r.isRead).length;

  // Group by day, keeping the newest-first order the API sends.
  const days: { label: string; rows: NoticeRow[] }[] = [];
  shown.forEach(r => {
    const label = dayLabel(r.createdAt);
    const last = days[days.length - 1];
    if (last && last.label === label) last.rows.push(r); else days.push({ label, rows: [r] });
  });

  return (
    <div className="w-screen">
      <FlowHeader title="Notifications" onBack={back} />
      <Segment value={tab} onChange={setTab} options={[
        { id: 'all', label: 'All' },
        { id: 'unread', label: unread ? 'Unread (' + unread + ')' : 'Unread' },
      ]} />

      <div className="w-screen-body">
        {unread > 0 && (
          <div className="w-inset">
            <button className="secondary" onClick={markAll}><Check /> Mark everything read</button>
          </div>
        )}

        {loading ? <RowsLoading />
          : days.length ? days.map(g => (
            <RowGroup key={g.label} title={g.label}>
              {g.rows.map(n => {
                const d = describe(n.type);
                return (
                  <Row key={n.id} chevron={false} icon={d.icon} title={d.title}
                       sub={n.message}
                       value={n.isRead ? undefined : 'New'}
                       tone={n.isRead ? undefined : d.tone || 'warn'} />
                );
              })}
            </RowGroup>
          ))
          : (
            <Blank icon={<Bell />}
                   title={tab === 'unread' ? 'Nothing unread' : 'Nothing yet'}
                   sub="Payment reminders, payouts and committee news land here." />
          )}

        {rows.length > 0 && (
          <p className="w-foot">
            Oldest kept: {dateTime(rows[rows.length - 1].createdAt)}. Security alerts always arrive,
            whatever your notification settings say.
          </p>
        )}
      </div>
    </div>
  );
}
