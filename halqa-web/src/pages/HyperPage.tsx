import { useEffect, useMemo, useState } from 'react';
import { CalendarCheck, HandCoins, ShieldCheck, Users } from 'lucide-react';
import type { User } from '../types';
import { api } from '../api';
import { dateShort, rupees } from '../lib/format';
import { HYPER_OPTIONS, payersPerCollector, type HyperOption } from '../lib/fees';
import { BottomBar, Sheet } from '../components/wallet';
import {
  Checks, Choice, Done, Figures, HeroCard, HowSteps, Line, PageTop, Panel, Section, SplitBar,
} from '../components/page';

// ---------------------------------------------------------------------------
// HYPER
//
// A daily committee on a roster of members who do not know one another. Two
// fixed configurations and nothing else: the member picks one, then picks the
// day they collect. There is no auction and no bid, because a price agreed
// between members for an early day makes one of them a lender.
//
// Each daily payment splits three ways where it is taken: the contribution
// goes straight to the member the payer is assigned to that day, the takaful
// contribution goes to the participants' risk fund at the operator, and the fee
// goes to Halqa. No party holds a pool. The fee is flat for every day on the
// roster; a member who collects late is compensated by Halqa in points and fee
// waivers, never by another member. Source: Hyper Committee, revision 4.
// ---------------------------------------------------------------------------

const MIN_SCORE = 650;
const MIN_CLEAN = 2;
/** The next circle of each kind opens this many days from today. */
const OPENS_IN = 6;

/** The date a collection day falls on. The 26-day circle does not run on Sundays. */
function dateOf(o: HyperOption, day: number, start: Date) {
  const d = new Date(start);
  for (let n = 0; ; d.setDate(d.getDate() + 1)) {
    if (o.id === 'H26' && d.getDay() === 0) continue;
    if (++n === day) return new Date(d);
  }
}

/** Seats already taken on a day. Early days fill first, because they are worth the most to a member. */
const taken = (o: HyperOption, day: number) =>
  Math.max(0, Math.min(o.collectingDaily, Math.round(o.collectingDaily * (1 - (day - 1) / (o.days * 0.7)))));

/** Totals over the cycle, as published in the document, not rebuilt from rounded daily figures. */
const CYCLE: Record<HyperOption['id'], { takaful: number; fee: number }> = {
  H50: { takaful: 3750, fee: 3750 },
  H26: { takaful: 2166.67, fee: 2166.67 },
};

export default function HyperPage({ user, back, onVerify }: { user: User; back: () => void; onVerify?: () => void }) {
  const [id, setId] = useState<HyperOption['id']>('H50');
  const [salaryLinked, setSalaryLinked] = useState<boolean>(Boolean(user.salaryAccountLinked));
  const [picking, setPicking] = useState(false);
  const [day, setDay] = useState<number | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [consent, setConsent] = useState(false);
  const [joined, setJoined] = useState<{ day: number; ref: string } | null>(null);

  useEffect(() => {
    void api<{ linked?: boolean }>('/profile/salary-status')
      .then(s => { if (s && typeof s === 'object' && 'linked' in s) setSalaryLinked(Boolean(s.linked)) })
      .catch(() => {});
  }, []);

  const o = HYPER_OPTIONS.find(x => x.id === id)!;
  const start = useMemo(() => { const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() + OPENS_IN); return d }, []);

  // The largest discount that applies, and only on the fee: cover and contribution are never discounted.
  const pct = user.chequeSecuredAt ? 80 : user.incomeVerifiedAt ? 50 : 0;
  const fee = Math.round(o.fee * (100 - pct)) / 100;
  const daily = o.contribution + o.takaful + fee;
  const feeCycle = Math.round(CYCLE[o.id].fee * (100 - pct)) / 100;
  const paidIn = o.pot + CYCLE[o.id].takaful + feeCycle;
  const perCollector = payersPerCollector(o);

  const dailyIncome = Boolean(user.dailyIncomeVerifiedAt)
    || ['BUSINESS_OWNER', 'SELF_EMPLOYED'].includes(user.occupationType || '');
  const gates = [
    { ok: salaryLinked, label: 'Salary account linked', have: salaryLinked ? 'Linked' : 'Link your account' },
    { ok: user.creditScore >= MIN_SCORE, label: 'Credit score ' + MIN_SCORE + ' or more', have: 'Yours is ' + user.creditScore },
    { ok: (user.committeesCompletedClean || 0) >= MIN_CLEAN, label: 'Two circles finished clean', have: 'You have ' + (user.committeesCompletedClean || 0) },
    { ok: user.kycLevel >= 2, label: 'Identity fully verified', have: user.kycLevel >= 2 ? 'Verified' : 'Finish verifying' },
    { ok: dailyIncome, label: 'Daily income shown', have: dailyIncome ? 'Shown' : 'Show your income' },
    { ok: !user.defaultFlag, label: 'No missed payment open', have: user.defaultFlag ? 'Settle it first' : 'None open' },
  ].map(g => ({ ...g, onFix: g.ok ? undefined : onVerify }));
  const left = gates.filter(g => !g.ok).length;

  const days = Array.from({ length: o.days }, (_, i) => {
    const d = i + 1;
    const free = o.collectingDaily - taken(o, d);
    return { d, free, date: dateOf(o, d, start) };
  });
  const chosen = days.find(x => x.d === day) || null;

  const pickOption = (next: HyperOption['id']) => { setId(next); setDay(null) };

  if (joined && chosen) {
    return (
      <div className="w-screen pg">
        <PageTop title="HYPER" onBack={back} flat />
        <Done title={'Day ' + joined.day + ' is yours'}
              sub={'You collect ' + rupees(o.pot) + ' on ' + dateShort(chosen.date.toISOString()) + '.'} />
        <Section>
          <Panel>
            <Line k="Circle" v={o.cycle} />
            <Line k="First payment" v={dateShort(start.toISOString())} />
            <Line k="You pay each day" v={rupees(daily)} />
            <Line k="Collected by" v="Auto-pay, salary account" />
            <Line k="Reference" v={joined.ref} strong />
          </Panel>
        </Section>
        <BottomBar><button className="primary full" onClick={back}>Done</button></BottomBar>
      </div>
    );
  }

  return (
    <div className="w-screen pg">
      <PageTop title="HYPER" onBack={back} />

      <HeroCard label="You collect once" icon={<HandCoins />} amount={rupees(o.pot)}
                sub={'On the day you choose, paid to you by ' + perCollector + ' members'}>
        <Figures items={[
          ['You pay a day', rupees(daily)],
          ['For', o.days + ' days'],
          ['Members', String(o.members)],
        ]} />
      </HeroCard>

      <Section title="Choose a circle">
        <Choice value={id} onChange={pickOption} options={HYPER_OPTIONS.map(x => ({
          id: x.id, title: x.cycle, figure: rupees(x.pot), sub: rupees(x.daily) + ' a day',
        }))} />
      </Section>

      <Section title="How a day works">
        <Panel>
          <HowSteps steps={[
            { icon: <CalendarCheck />, text: 'You pay ' + rupees(daily) + ' each morning' },
            { icon: <Users />, text: rupees(o.contribution) + ' goes straight to one member collecting' },
            { icon: <HandCoins />, text: 'On your day, ' + perCollector + ' members pay you' },
          ]} />
        </Panel>
      </Section>

      <Section title="Where your money goes">
        <Panel>
          <SplitBar parts={[
            { label: "To that day's collector", value: rupees(o.contribution), share: o.contribution, tone: 1 },
            { label: 'Takaful cover', value: rupees(o.takaful), share: o.takaful, tone: 2 },
            { label: pct ? "Halqa's fee, " + pct + '% off' : "Halqa's fee", value: rupees(fee), share: fee, tone: 3 },
          ]} />
          <Line k={'You pay over ' + o.days + ' days'} v={rupees(paidIn)} strong />
          <Line k="Comes back to you" v={rupees(o.pot)} />
          <Line k="Takaful cover" v={rupees(CYCLE[o.id].takaful)} />
          <Line k="Halqa's fee" v={rupees(feeCycle)} />
        </Panel>
      </Section>

      <Section title="Before you join" action={<span className="pg-sec-meta">{left ? left + ' to go' : 'All clear'}</span>}>
        <Checks items={gates} />
      </Section>

      <Section>
        <Panel className="pg-cover">
          <ShieldCheck />
          <p>If a member stops paying after collecting, the takaful operator pays the members left short, in their own names.</p>
        </Panel>
      </Section>

      <div className="pg-foot-space" />
      <BottomBar>
        <button className="primary full" disabled={left > 0} onClick={() => setPicking(true)}>
          {left ? left + (left === 1 ? ' check' : ' checks') + ' before you can join' : 'Choose your day'}
        </button>
      </BottomBar>

      {picking && (
        <Sheet title="Choose your day" onClose={() => setPicking(false)}>
          <div className="pg-days-key">
            <span>{o.collectingDaily} collect each day</span>
            <span>Opens {dateShort(start.toISOString())}</span>
          </div>
          <div className="pg-days">
            {days.map(x => (
              <button key={x.d} className={'pg-day' + (day === x.d ? ' on' : '')} disabled={x.free === 0}
                      aria-label={'Day ' + x.d + ', ' + (x.free ? x.free + ' seats left' : 'full')}
                      onClick={() => setDay(x.d)}>
                <b>{x.d}</b>
                <small>{x.free ? x.free + ' left' : 'Full'}</small>
              </button>
            ))}
          </div>
          <p className="pg-note pg-sheet-note">A later day earns points and fee waivers from Halqa.</p>
          <BottomBar>
            <button className="primary full" disabled={!chosen}
                    onClick={() => { setPicking(false); setConfirming(true) }}>
              {chosen ? 'Continue with day ' + chosen.d : 'Pick a day'}
            </button>
          </BottomBar>
        </Sheet>
      )}

      {confirming && chosen && (
        <Sheet title={'Day ' + chosen.d + ', ' + dateShort(chosen.date.toISOString())} onClose={() => setConfirming(false)}>
          <div className="pg-sheet-pad">
            <Line k="You collect" v={rupees(o.pot)} />
            <Line k="You pay each day" v={rupees(daily)} />
            <Line k="First payment" v={dateShort(start.toISOString())} />
            <Line k="Last payment" v={dateShort(dateOf(o, o.days, start).toISOString())} />
            <Line k="Collected by" v="Auto-pay, salary account" />
            <Line k="Total over the circle" v={rupees(paidIn)} strong />
            <button className={'pg-consent' + (consent ? ' on' : '')} onClick={() => setConsent(!consent)}
                    role="checkbox" aria-checked={consent}>
              <i>{consent && <CheckMark />}</i>
              <span>I authorise daily collection of {rupees(daily)} from my salary account for {o.days} days. I can withdraw this authority, and I stay liable for any day I have not paid.</span>
            </button>
          </div>
          <BottomBar>
            <button className="primary full" disabled={!consent}
                    onClick={() => { setConfirming(false); setJoined({ day: chosen.d, ref: 'HYP-' + String(Date.now()).slice(-6) }) }}>
              Join HYPER
            </button>
          </BottomBar>
        </Sheet>
      )}
    </div>
  );
}

function CheckMark() {
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>;
}
