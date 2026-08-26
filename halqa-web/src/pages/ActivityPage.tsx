import { useEffect, useMemo, useState } from 'react';
import {
  ArrowDownLeft, ArrowUpRight, CalendarClock, Receipt as ReceiptIcon, Search,
} from 'lucide-react';
import { api } from '../api';
import { date, dateTime, money, phone } from '../lib/format';
import type { Committee, User } from '../types';
import ReceiptSheet, { type ReceiptData } from '../components/Receipt';
import { Blank, FlowHeader, Row, RowGroup, Segment } from '../components/wallet';

// ---------------------------------------------------------------------------
// ACTIVITY
//
// Every instalment and every payout, newest first, grouped by day the way a
// wallet groups them, because "what did I pay last Tuesday" is the question
// this screen exists to answer.
//
// Each row opens the full receipt: transaction id, exact time, both parties,
// amount, fee and total. That document is the whole point of the product, so
// nothing here is a summary that cannot be opened into one.
// ---------------------------------------------------------------------------

type Item = {
  id: string; kind: 'in' | 'out' | 'wait'; title: string; sub: string;
  paisa: string; when: string; rail: string; committee: string; round: number;
  counterparty: string; counterRef?: string;
};

/** Today, Yesterday, then the date. What a member actually scans for. */
function dayLabel(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const midnight = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const days = Math.round((midnight(now) - midnight(d)) / 86_400_000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  return date(iso);
}

export default function ActivityPage({ user, back, onDispute }:
  { user: User; back: () => void; onDispute?: (paymentId: string) => void }) {
  const [committees, setCommittees] = useState<Committee[]>([]);
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState<'all' | 'in' | 'out' | 'wait'>('all');
  const [open, setOpen] = useState<ReceiptData | null>(null);

  useEffect(() => {
    void api<Committee[]>('/committees?scope=mine').then(setCommittees).catch(() => setCommittees([]));
  }, []);

  const items = useMemo(() => {
    const out: Item[] = [];
    committees.forEach(c => c.rounds?.forEach(r => {
      if (r.recipientId === user.id) out.push({
        id: 'p' + r.id, kind: 'in', title: 'Payout received',
        sub: c.name + ' · turn ' + r.roundNumber,
        paisa: r.payoutPaisa, when: r.payoutDate, rail: 'RAAST',
        committee: c.name, round: r.roundNumber,
        counterparty: (c.members?.length || 0) + ' members of ' + c.name,
      });
      r.payments?.filter(p => p.payerId === user.id).forEach(p => out.push({
        id: p.id, kind: p.status === 'PAID' ? 'out' : 'wait',
        title: p.status === 'PAID' ? 'Instalment paid' : 'Instalment due',
        sub: c.name + ' · turn ' + r.roundNumber,
        paisa: p.amountPaisa, when: r.dueDate, rail: p.paidVia || 'RAAST',
        committee: c.name, round: r.roundNumber,
        counterparty: r.recipient?.fullName || 'This round',
        counterRef: r.recipient?.phone ? phone(r.recipient.phone) : undefined,
      }));
    }));
    return out.sort((a, b) => new Date(b.when).getTime() - new Date(a.when).getTime());
  }, [committees, user.id]);

  const shown = items.filter(i =>
    (filter === 'all' || i.kind === filter)
    && (!q || (i.title + ' ' + i.sub).toLowerCase().includes(q.toLowerCase())));

  // Group into days, preserving the newest-first order.
  const days: { label: string; rows: Item[] }[] = [];
  shown.forEach(i => {
    const label = dayLabel(i.when);
    const last = days[days.length - 1];
    if (last && last.label === label) last.rows.push(i); else days.push({ label, rows: [i] });
  });

  const openReceipt = (i: Item) => setOpen({
    title: i.title,
    purpose: i.committee + ', turn ' + i.round,
    amountPaisa: i.paisa,
    reference: 'HLQ' + i.id.replace(/[^a-zA-Z0-9]/g, '').slice(0, 12).toUpperCase(),
    rail: i.rail,
    status: i.kind === 'wait' ? 'PENDING' : 'SETTLED',
    stamp: dateTime(i.when),
    from: i.kind === 'in'
      ? { name: i.counterparty }
      : { name: user.fullName, ref: phone(user.phone) },
    to: i.kind === 'in'
      ? { name: user.fullName, ref: phone(user.phone) }
      : { name: i.counterparty, ref: i.counterRef },
    rows: [['Committee', i.committee], ['Turn', String(i.round)]],
    // Only a real instalment can be disputed; a payout is the circle paying
    // you, and there is nothing of yours to dispute in it.
    paymentId: i.kind === 'in' ? undefined : i.id,
    onDispute,
  });

  return (
    <div className="w-screen">
      <FlowHeader title="Activity" onBack={back} />

      <div className="w-search">
        <Search />
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search receipts" />
      </div>

      <Segment value={filter} onChange={setFilter} options={[
        { id: 'all', label: 'All' },
        { id: 'out', label: 'Paid' },
        { id: 'in', label: 'Received' },
        { id: 'wait', label: 'Due' },
      ]} />

      <div className="w-screen-body">
        {days.length ? days.map(group => (
          <RowGroup key={group.label} title={group.label}>
            {group.rows.map(i => (
              <Row key={i.id}
                   icon={i.kind === 'in' ? <ArrowDownLeft /> : i.kind === 'out' ? <ArrowUpRight /> : <CalendarClock />}
                   title={i.title}
                   sub={i.sub}
                   value={(i.kind === 'in' ? '+' : '') + money(i.paisa)}
                   valueSub={i.kind === 'wait' ? 'Pending' : 'Settled'}
                   tone={i.kind === 'in' ? 'ok' : i.kind === 'wait' ? 'warn' : undefined}
                   onClick={() => openReceipt(i)} />
            ))}
          </RowGroup>
        )) : (
          <Blank icon={<ReceiptIcon />} title={q ? 'Nothing matches that' : 'Nothing here yet'}
                 sub="Every instalment and payout lands here." />
        )}
      </div>

      {open && <ReceiptSheet data={open} onClose={() => setOpen(null)} />}
    </div>
  );
}
