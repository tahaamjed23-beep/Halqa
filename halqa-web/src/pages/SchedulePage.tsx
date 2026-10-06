import { useEffect, useMemo, useState } from 'react';
import { ArrowDownToLine, CalendarClock, CircleAlert, Wallet } from 'lucide-react';
import { api } from '../api';
import { dateShort, money } from '../lib/format';
import type { Committee, Page } from '../types';
import { Blank, FlowHeader, Row, RowGroup, RowsLoading, Segment } from '../components/wallet';

// ---------------------------------------------------------------------------
// SCHEDULE
//
// Every member asks the same two questions and the app had no screen for
// either: when is my next instalment, and when is my turn. Activity answers
// what already happened; the committee screen answers it one circle at a time.
// Across six circles nobody was doing that arithmetic.
//
// Dues come straight off the member's own payments. Turn dates are projected
// from the running round: the round in flight knows its payout date and its
// number, and every turn after it lands one interval later.
// ---------------------------------------------------------------------------

type PaymentRow = {
  id: string; amountPaisa: string; status: string; paidAt?: string | null;
  round: { roundNumber: number; dueDate: string; payoutDate: string;
           committee: { id: string; name: string } };
};

type Entry = {
  id: string; when: string; committeeId: string; committee: string;
  turn: number; amountPaisa: string; status: string; late: boolean;
};

const DAY = 86_400_000;

/** "September 2026", and the month a row belongs to, from one date. */
const monthOf = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });

/** How far off, in a member's words rather than a duration formatter's. */
function whenWord(iso: string): string {
  const days = Math.round((new Date(iso).setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0)) / DAY);
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  if (days === -1) return 'Yesterday';
  if (days < 0) return Math.abs(days) + ' days ago';
  if (days < 14) return 'In ' + days + ' days';
  return dateShort(iso);
}

export default function SchedulePage({ userId, back, openCommittee, go }: {
  userId: string; back?: () => void;
  openCommittee?: (id: string) => void; go?: (page: Page) => void;
}) {
  const [tab, setTab] = useState<'due' | 'turns'>('due');
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [committees, setCommittees] = useState<Committee[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void Promise.all([
      api<PaymentRow[]>('/payments/mine').catch(() => [] as PaymentRow[]),
      api<Committee[]>('/committees?scope=mine').catch(() => [] as Committee[]),
    ]).then(([p, c]) => {
      setPayments(Array.isArray(p) ? p : []);
      setCommittees(Array.isArray(c) ? c : []);
    }).finally(() => setLoading(false));
  }, []);

  // Anything not yet paid, soonest first. A missed instalment stays at the top
  // of the list where it belongs rather than sorting away into the past.
  const dues = useMemo<Entry[]>(() => payments
    .filter(p => p.status !== 'PAID' && p.status !== 'WAIVED'
      && p.round && p.round.committee && !Number.isNaN(+new Date(p.round.dueDate)))
    .map(p => ({
      id: p.id, when: p.round.dueDate, committeeId: p.round.committee.id,
      committee: p.round.committee.name, turn: p.round.roundNumber,
      amountPaisa: p.amountPaisa, status: p.status,
      late: new Date(p.round.dueDate).getTime() < Date.now(),
    }))
    .sort((a, b) => +new Date(a.when) - +new Date(b.when)), [payments]);

  const turns = useMemo<Entry[]>(() => {
    const out: Entry[] = [];
    committees.forEach(c => {
      const me = (c.members || []).find(m => m.userId === userId);
      const running = (c.rounds || [])[0];
      if (!me || !running || me.hasReceived) return;
      if (Number.isNaN(+new Date(running.payoutDate)) || !c.contributionPaisa) return;

      const gap = (me.turnPosition - running.roundNumber) * c.periodDays * DAY;
      const when = new Date(new Date(running.payoutDate).getTime() + gap).toISOString();
      out.push({
        id: c.id + ':' + me.turnPosition, when, committeeId: c.id, committee: c.name,
        turn: me.turnPosition,
        // The pot as the circle is written: everyone's instalment, once.
        amountPaisa: String(BigInt(c.contributionPaisa) * BigInt(c.memberCap)),
        status: me.turnPosition === running.roundNumber ? 'RUNNING' : 'SCHEDULED',
        late: false,
      });
    });
    return out.sort((a, b) => +new Date(a.when) - +new Date(b.when));
  }, [committees, userId]);

  const rows = tab === 'due' ? dues : turns;

  // Month headings, in the order the rows already sit in.
  const months: { label: string; rows: Entry[] }[] = [];
  rows.forEach(r => {
    const label = monthOf(r.when);
    const last = months[months.length - 1];
    if (last && last.label === label) last.rows.push(r); else months.push({ label, rows: [r] });
  });

  const soon = dues.filter(d => +new Date(d.when) < Date.now() + 30 * DAY);
  const soonTotal = soon.reduce((t, d) => t + BigInt(d.amountPaisa), 0n);
  const overdue = dues.filter(d => d.late).length;

  return (
    <div className="w-screen">
      <FlowHeader title="Schedule" onBack={back} />
      <Segment value={tab} onChange={setTab} options={[
        { id: 'due', label: overdue ? 'Due (' + overdue + ' late)' : 'Due' },
        { id: 'turns', label: 'Your turns' },
      ]} />

      <div className="w-screen-body">
        {tab === 'due' && dues.length > 0 && (
          <div className="w-hero">
            <span>Next 30 days</span>
            <strong>{money(String(soonTotal))}</strong>
            <small>{soon.length} instalment{soon.length === 1 ? '' : 's'}
              {overdue ? ' · ' + overdue + ' already late' : ''}</small>
          </div>
        )}

        {loading ? <RowsLoading />
          : months.length ? months.map(m => (
            <RowGroup key={m.label} title={m.label}>
              {m.rows.map(r => (
                <Row key={r.id}
                     icon={r.late ? <CircleAlert /> : tab === 'due' ? <Wallet /> : <ArrowDownToLine />}
                     title={r.committee}
                     sub={'Turn ' + r.turn + ' · ' + whenWord(r.when)}
                     value={money(r.amountPaisa)}
                     tone={r.late ? 'bad' : r.status === 'RUNNING' ? 'ok' : undefined}
                     onClick={openCommittee ? () => openCommittee(r.committeeId) : undefined} />
              ))}
            </RowGroup>
          ))
          : (
            <Blank icon={<CalendarClock />}
                   title={tab === 'due' ? 'Nothing due' : 'No turn coming'}
                   sub={tab === 'due'
                     ? 'Every instalment is paid.'
                     : 'Your turn shows here once a circle you are in starts.'} />
          )}

        {tab === 'due' && dues.length > 0 && go && (
          <div className="w-inset">
            <button className="primary" onClick={() => go('pay')}>Pay an instalment</button>
          </div>
        )}
      </div>
    </div>
  );
}
