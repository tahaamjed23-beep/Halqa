import { useEffect, useMemo, useState } from 'react';
import { Receipt as ReceiptIcon, Search, Users, UserRound } from 'lucide-react';
import { api } from '../api';
import { dateShort, money, phone as fmtPhone } from '../lib/format';
import type { Committee, Page } from '../types';
import { Blank, FlowHeader, Row, RowGroup, Segment } from '../components/wallet';

// ---------------------------------------------------------------------------
// SEARCH
//
// A member with two committees does not need this. A member with twenty four
// cannot find anything without it, and the app quietly became the second kind.
//
// It searches what a member would actually be looking for: a circle by name, a
// person by name or number, and a payment by amount, circle or reference. All
// of it is already loaded for the other screens, so this costs one fetch and
// stays instant while typing.
// ---------------------------------------------------------------------------

type PaymentRow = {
  id: string; amountPaisa: string; status: string; txnRef?: string | null; paidAt?: string | null;
  round: { roundNumber: number; dueDate: string; committee: { id: string; name: string } };
};

type Person = { id: string; name: string; phone?: string; where: string; committeeId: string };

export default function SearchPage({ back, openCommittee, go }:
  { back?: () => void; openCommittee?: (id: string) => void; go?: (page: Page) => void }) {
  const [q, setQ] = useState('');
  const [tab, setTab] = useState<'all' | 'circles' | 'people' | 'money'>('all');
  const [committees, setCommittees] = useState<Committee[]>([]);
  const [payments, setPayments] = useState<PaymentRow[]>([]);

  useEffect(() => {
    void Promise.all([
      api<Committee[]>('/committees?scope=mine').catch(() => [] as Committee[]),
      api<PaymentRow[]>('/payments/mine').catch(() => [] as PaymentRow[]),
    ]).then(([c, p]) => { setCommittees(c); setPayments(p) });
  }, []);

  // One row per person per circle, so a name that appears in three committees
  // is findable from any of them.
  const people = useMemo<Person[]>(() => {
    const seen = new Set<string>();
    const out: Person[] = [];
    committees.forEach(c => (c.members || []).forEach(m => {
      const key = m.userId + ':' + c.id;
      if (seen.has(key)) return;
      seen.add(key);
      out.push({
        id: key, name: m.user.fullName, phone: m.user.phone,
        where: c.name + ' · turn ' + m.turnPosition, committeeId: c.id,
      });
    }));
    return out;
  }, [committees]);

  const term = q.trim().toLowerCase();
  const digits = term.replace(/\D/g, '');

  const circleHits = term
    ? committees.filter(c => c.name.toLowerCase().includes(term)
        || (c.inviteCode || '').toLowerCase().includes(term))
    : [];
  const peopleHits = term
    ? people.filter(p => p.name.toLowerCase().includes(term)
        || (digits.length >= 3 && (p.phone || '').replace(/\D/g, '').includes(digits)))
    : [];
  const moneyHits = term
    ? payments.filter(p =>
        p.round.committee.name.toLowerCase().includes(term)
        || (p.txnRef || '').toLowerCase().includes(term)
        || (digits.length >= 2 && String(Math.round(Number(p.amountPaisa) / 100)).includes(digits)))
    : [];

  const show = (k: 'circles' | 'people' | 'money') => tab === 'all' || tab === k;
  const nothing = term && !circleHits.length && !peopleHits.length && !moneyHits.length;

  return (
    <div className="w-screen">
      <FlowHeader title="Search" onBack={back} />

      <div className="w-search">
        <Search />
        <input autoFocus value={q} onChange={e => setQ(e.target.value)}
               placeholder="A circle, a person, an amount" />
      </div>

      <Segment value={tab} onChange={setTab} options={[
        { id: 'all', label: 'Everything' },
        { id: 'circles', label: 'Circles' },
        { id: 'people', label: 'People' },
        { id: 'money', label: 'Money' },
      ]} />

      <div className="w-screen-body">
        {!term && (
          <Blank icon={<Search />} title="Find anything"
                 sub={'Across ' + committees.length + ' committees, '
                   + people.length + ' people and ' + payments.length + ' payments.'} />
        )}

        {nothing && (
          <Blank icon={<Search />} title={'Nothing matches "' + q.trim() + '"'}
                 sub="Try part of a name, a phone number, or an amount." />
        )}

        {show('circles') && circleHits.length > 0 && (
          <RowGroup title={circleHits.length + ' circle' + (circleHits.length === 1 ? '' : 's')}>
            {circleHits.map(c => (
              <Row key={c.id} icon={<Users />} title={c.name}
                   sub={money(c.contributionPaisa) + ' · ' + (c.members?.length || 0) + '/' + c.memberCap + ' members'}
                   onClick={openCommittee ? () => openCommittee(c.id) : undefined} />
            ))}
          </RowGroup>
        )}

        {show('people') && peopleHits.length > 0 && (
          <RowGroup title={peopleHits.length + ' ' + (peopleHits.length === 1 ? 'person' : 'people')}>
            {peopleHits.slice(0, 30).map(p => (
              <Row key={p.id} icon={<UserRound />} title={p.name}
                   sub={p.where + (p.phone ? ' · ' + fmtPhone(p.phone) : '')}
                   onClick={openCommittee ? () => openCommittee(p.committeeId) : undefined} />
            ))}
          </RowGroup>
        )}

        {show('money') && moneyHits.length > 0 && (
          <RowGroup title={moneyHits.length + ' payment' + (moneyHits.length === 1 ? '' : 's')}>
            {moneyHits.slice(0, 30).map(p => (
              <Row key={p.id} icon={<ReceiptIcon />}
                   title={money(p.amountPaisa)}
                   sub={p.round.committee.name + ' · turn ' + p.round.roundNumber
                     + ' · ' + dateShort(p.paidAt || p.round.dueDate)}
                   value={p.status === 'PAID' ? 'Paid' : p.status === 'LATE' ? 'Late' : 'Due'}
                   tone={p.status === 'PAID' ? 'ok' : 'warn'}
                   onClick={go ? () => go('activity') : undefined} />
            ))}
          </RowGroup>
        )}
      </div>
    </div>
  );
}
