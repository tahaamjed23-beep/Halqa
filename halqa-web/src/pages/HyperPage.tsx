import { useMemo, useState } from 'react';
import { CalendarDays, Check, Flame, Gavel, Lock, ShieldAlert, Wallet } from 'lucide-react';
import type { User } from '../types';
import { money } from '../lib/format';
import {
  AmountEntry, Blank, BottomBar, Card, Facts, FlowHeader,
  Notice, Row, RowGroup, Segment, Sheet, Steps,
} from '../components/wallet';

// ---------------------------------------------------------------------------
// HYPER: 30 days, Rs 500 a day, seven members collecting each day, so 210 in
// the circle. What a member pays in over the cycle is exactly what they
// collect, which is what makes it a committee and not a scheme.
//
// Members buy their collection day at a 24-hour opening auction. An early day
// is a real advance of cash, so it costs something; the last days are worth
// nothing and clear at nil.
//
// THE MARKUP CEILING is the part that matters. The premium is Halqa's markup,
// and it is what covers a default on a roster of strangers. It stops at Rs 380
// on day one, the dearest day in the cycle, and falls to a few rupees by the
// last week. Mirrors halqa-api/src/lib/hyper.ts, which enforces it.
// ---------------------------------------------------------------------------

const DAYS = 30;
const DAILY_PAISA = 50_000;             // Rs 500
const POT_PAISA = DAILY_PAISA * DAYS;   // Rs 15,000: what you pay in is what you collect
const SEATS_PER_DAY = 7;
const ROSTER = SEATS_PER_DAY * DAYS;    // 210
const MIN_SCORE = 650;
const MIN_CLEAN = 2;
const MIN_VAULT_PAISA = 1_500_000;
const MAX_APR_BPS = 6600;
const MAX_DAY_ONE_PAISA = 38_000;       // Rs 380

const advance = (day: number) => Math.max(0, POT_PAISA - DAILY_PAISA * day);
const outstanding = (day: number) => Math.max(0, DAYS - day);

/** The hard ceiling the server enforces on a bid for this day. */
function maxBid(day: number) {
  const a = advance(day), o = outstanding(day);
  if (a <= 0 || o <= 0) return 0;
  return Math.floor((MAX_APR_BPS * a * o) / (2 * 365 * 10_000));
}

export default function HyperPage({ user, back }: { user: User; back: () => void }) {
  const [tab, setTab] = useState<'how' | 'days'>('days');
  const [day, setDay] = useState<number | null>(null);
  const [bid, setBid] = useState('');
  const [placed, setPlaced] = useState<{ day: number; amount: number } | null>(null);

  // The standing book. Early days fill first because they are worth the most.
  const book = useMemo(() => Array.from({ length: DAYS }, (_, i) => {
    const d = i + 1;
    const held = d <= 3 ? SEATS_PER_DAY : d <= 8 ? Math.floor(SEATS_PER_DAY / 2) : 0;
    const cap = maxBid(d);
    return { d, held, top: Math.round((cap * 2) / 3), cap, full: held >= SEATS_PER_DAY };
  }), []);

  const hasVault = false; // vault balance is not on the user record yet
  const gates = [
    { ok: user.creditScore >= MIN_SCORE, label: 'Credit score ' + MIN_SCORE + ' or above', have: 'You are at ' + user.creditScore },
    { ok: (user.committeesCompletedClean || 0) >= MIN_CLEAN, label: MIN_CLEAN + ' committees finished clean', have: 'You have ' + (user.committeesCompletedClean || 0) },
    { ok: Boolean(user.incomeVerifiedAt), label: 'Salary slip on file', have: user.incomeVerifiedAt ? 'Verified' : 'Not uploaded' },
    { ok: Boolean(user.incomeVerifiedAt) || hasVault, label: 'Daily earnings, or a vault balance', have: 'Vault minimum ' + money(MIN_VAULT_PAISA) },
    { ok: Boolean(user.hasVerifiedRaast), label: 'Verified Raast credential', have: user.hasVerifiedRaast ? 'On file' : 'Not linked' },
  ];
  const failing = gates.filter(g => !g.ok);
  const eligible = failing.length === 0;

  const chosen = book.find(x => x.d === day) || null;
  const bidP = Math.round(Number(bid || 0) * 100);
  const over = Boolean(chosen && bidP > chosen.cap);
  const low = Boolean(chosen && bidP <= chosen.top);
  const gone = book.filter(x => x.full).length;

  if (placed) {
    return (
      <div className="w-screen">
        <FlowHeader title="HYPER" onClose={back} />
        <div className="w-screen-body">
          <Blank
            icon={<Check />}
            title={'Bid placed for day ' + placed.day}
            sub={money(placed.amount) + ' on top of the ' + money(POT_PAISA) + ' you collect. You will hear within 24 hours whether you won the day.'}
          />
          <Card>
            <Facts items={[
              ['Your bid', money(placed.amount)],
              ['You collect', money(POT_PAISA)],
              ['On day', String(placed.day)],
            ]} />
          </Card>
        </div>
        <BottomBar><button className="primary full" onClick={back}>Done</button></BottomBar>
      </div>
    );
  }

  return (
    <div className="w-screen">
      <FlowHeader title="HYPER" onBack={back} />

      {/* The pot, stated once, with the three numbers that define the product. */}
      <div className="hyper-band">
        <div className="hyper-band-top"><Flame /><span>30 days · {SEATS_PER_DAY} collect a day · {ROSTER} members</span></div>
        <b>{money(POT_PAISA)}</b>
        <small>Rs 500 a day for 30 days. You collect the pot once, on your day.</small>
      </div>

      <Segment value={tab} onChange={setTab} options={[
        { id: 'days', label: 'Pick a day' },
        { id: 'how', label: 'How it works' },
      ]} />

      {tab === 'how' ? (
        <>
          <Card title="What you pay, what you get">
            <Facts items={[
              ['Every day', money(DAILY_PAISA)],
              ['Over 30 days', money(DAILY_PAISA * DAYS)],
              ['You collect', money(POT_PAISA)],
            ]} />
            <Notice kind="ok" icon={<Check />}>
              What you pay in is exactly what you collect. The only thing that changes is when.
            </Notice>
          </Card>

          <Card title="The markup, and what caps it">
            <p className="w-body">
              An early day hands you the pot while you still owe most of it, so it costs a
              premium. That premium is Halqa's markup, and it is what covers a default on a
              roster of people who do not know each other.
            </p>
            <Notice kind="warn" icon={<Lock />}>
              It stops at {money(MAX_DAY_ONE_PAISA)} on day one, the dearest day there is, and
              falls to a few rupees by the last week. A bid above the cap is refused.
            </Notice>
          </Card>

          <Card title="Read this before you join">
            <p className="w-body">
              In an ordinary committee you know the others, and that is what makes people pay.
              Here you do not. So HYPER is the most tightly gated product on Halqa, and it
              collects from you automatically every single day.
            </p>
          </Card>
        </>
      ) : (
        <>
          {/* Gates first: there is no point browsing days you cannot bid on. */}
          <RowGroup title={eligible ? 'You can join' : failing.length + ' left before you can join'}>
            {gates.map(g => (
              <Row key={g.label} chevron={false}
                   icon={g.ok ? <Check /> : <Lock />}
                   title={g.label} sub={g.have}
                   value={g.ok ? 'Done' : 'Needed'} tone={g.ok ? 'ok' : 'warn'} />
            ))}
          </RowGroup>

          {!eligible && (
            <div className="w-inset">
              <Notice kind="bad" icon={<ShieldAlert />}>
                You cannot bid on a HYPER day yet. Everything above has to be in place first.
              </Notice>
            </div>
          )}

          <RowGroup title="Open days">
            {book.filter(x => !x.full).slice(0, 12).map(x => (
              <Row key={x.d}
                   icon={<CalendarDays />}
                   title={'Day ' + x.d}
                   sub={(SEATS_PER_DAY - x.held) + ' of ' + SEATS_PER_DAY + ' left · you still owe ' + money(DAILY_PAISA * outstanding(x.d)) + ' after'}
                   value={x.top ? money(x.top) : 'Free'}
                   valueSub={x.cap ? 'cap ' + money(x.cap) : 'no markup'}
                   onClick={eligible ? () => { setDay(x.d); setBid(String(Math.ceil((x.top + 100) / 100))); } : undefined} />
            ))}
          </RowGroup>
          <p className="w-foot">
            {gone > 0 ? 'Days 1 to ' + gone + ' are taken. ' : ''}
            Later days cost less because by then you have paid most of the pot in yourself.
          </p>
        </>
      )}

      {chosen && (
        <Sheet title={'Bid for day ' + chosen.d} onClose={() => setDay(null)}>
          <Steps step={2} of={2} />
          <AmountEntry value={bid} onChange={setBid} max={Math.floor(chosen.cap / 100)}
                       hint={'Standing bid ' + money(chosen.top) + ' · ceiling ' + money(chosen.cap)} />
          <div className="w-inset">
            {over && <Notice kind="bad" icon={<Lock />}>Above the ceiling for day {chosen.d}. The server refuses this bid.</Notice>}
            {!over && low && <Notice kind="warn" icon={<Gavel />}>This does not beat the standing bid of {money(chosen.top)}.</Notice>}
            <Facts cols={3} items={[
              ['You collect', money(POT_PAISA)],
              ['On day', String(chosen.d)],
              ['Owed after', money(DAILY_PAISA * outstanding(chosen.d))],
            ]} />
          </div>
          <BottomBar>
            <button className="primary full" disabled={over || low || !bidP}
                    onClick={() => { setPlaced({ day: chosen.d, amount: bidP }); setDay(null); }}>
              <Wallet /> Place bid
            </button>
          </BottomBar>
        </Sheet>
      )}
    </div>
  );
}
