import { useEffect, useState } from 'react';
import { Check, Flame, Gift, Info, Lock } from 'lucide-react';
import type { User } from '../types';
import { api } from '../api';
import { Blank, Card, Facts, FlowHeader, Notice, Row, RowGroup, Segment } from '../components/wallet';

// ---------------------------------------------------------------------------
// THE STREAK LADDER
//
// Every reward here is either a retailer's own promotional discount, which is
// their acquisition spend and not Halqa's, or a waiver of a charge Halqa would
// otherwise collect. Nothing converts to cash at any tier, which is what keeps
// this a loyalty scheme rather than a deposit-taking one.
// ---------------------------------------------------------------------------

const LADDER = [
  { n: 3,  retail: '5 per cent off at a partner store, up to Rs 500', platform: '' },
  { n: 6,  retail: '10 per cent off up to Rs 1,000, and delivery waived', platform: '' },
  { n: 12, retail: '12 per cent off up to Rs 2,000', platform: 'One month of cover premium waived' },
  { n: 18, retail: 'A category offer up to Rs 3,000', platform: 'Fill fee waived on your next circle' },
  { n: 24, retail: '15 per cent off up to Rs 4,000', platform: 'Early turn fee waived on your next circle' },
  { n: 36, retail: 'The top offer, up to Rs 6,000', platform: 'Early turn fee and one month premium waived' },
];

const PARTNERS = [
  { name: 'Daraz', cat: 'Everything', bg: 'linear-gradient(135deg,#F85606,#FF8A3D)', code: 'DZ' },
  { name: 'Foodpanda', cat: 'Food delivery', bg: 'linear-gradient(135deg,#D70F64,#F0468B)', code: 'FP' },
  { name: 'Bykea', cat: 'Rides and delivery', bg: 'linear-gradient(135deg,#0F9D58,#3CC97C)', code: 'BK' },
  { name: 'Naheed', cat: 'Grocery', bg: 'linear-gradient(135deg,#0B5FA5,#2C8BD6)', code: 'NH' },
  { name: 'Telemart', cat: 'Electronics', bg: 'linear-gradient(135deg,#7B1FA2,#A855C7)', code: 'TM' },
  { name: 'Imtiaz', cat: 'Grocery', bg: 'linear-gradient(135deg,#C62828,#E85555)', code: 'IM' },
];

type RewardsState = { points: number; streak: number; longestStreak: number; multiplier: number };

export default function RewardsPage({ user, back }: { user: User; back: () => void }) {
  // Points and streaks are server truth, emitted by the settlement path and
  // never by the client, so a member cannot mint their own. The prop is only
  // the fallback until the first response lands.
  const [state, setState] = useState<RewardsState>({
    points: 0, streak: user.paymentStreak || 0, longestStreak: 0, multiplier: 1,
  });
  const [tab, setTab] = useState<'ladder' | 'partners'>('ladder');

  useEffect(() => { api<RewardsState>('/rewards').then(setState).catch(() => {}) }, []);

  const streak = state.streak;
  const next = LADDER.find(l => l.n > streak) || LADDER[LADDER.length - 1];
  const prev = [...LADDER].reverse().find(l => l.n <= streak);
  const pct = Math.min(100, Math.round(streak / next.n * 100));

  return (
    <div className="w-screen">
      <FlowHeader title="Rewards" onBack={back} />

      <div className="streak-band">
        <div className="streak-band-top"><Flame /><span>Payment streak</span></div>
        <b>{streak}</b>
        <small>instalments paid on time, one after another</small>
        <div className="streak-track">
          <div><span>{prev ? 'Tier ' + prev.n + ' unlocked' : 'First tier at 3'}</span>
            <span>{Math.max(0, next.n - streak)} to go</span></div>
          <i><em style={{ width: pct + '%' }} /></i>
        </div>
      </div>

      <Segment value={tab} onChange={setTab} options={[
        { id: 'ladder', label: 'The ladder' },
        { id: 'partners', label: 'Partners' },
      ]} />

      <div className="w-screen-body">
        <Card>
          <Facts cols={3} items={[
            ['Points', new Intl.NumberFormat('en-PK').format(state.points)],
            ['Longest run', String(state.longestStreak || streak)],
            ['Next level at', next.n + ' turns'],
          ]} />
        </Card>

        {tab === 'ladder' ? (
          <RowGroup title="What each run unlocks">
            {LADDER.map(l => {
              const hit = streak >= l.n;
              const isNext = !hit && l.n === next.n;
              return (
                <Row key={l.n} chevron={false}
                     icon={hit ? <Check /> : <Lock />}
                     title={l.retail}
                     sub={l.platform || 'At ' + l.n + ' consecutive payments'}
                     value={hit ? 'Unlocked' : isNext ? 'Next' : String(l.n)}
                     tone={hit ? 'ok' : isNext ? 'warn' : undefined} />
              );
            })}
          </RowGroup>
        ) : (
          <>
            {streak < 3 && (
              <div className="w-inset">
                <Notice kind="warn" icon={<Lock />}>
                  Partner offers open at three consecutive on-time payments. You are{' '}
                  {3 - streak} away.
                </Notice>
              </div>
            )}
            <div className="partner-grid">
              {PARTNERS.map(p => (
                <div className="partner" key={p.name}>
                  <div className="partner-logo" style={{ background: p.bg }}>{p.code}</div>
                  <strong>{p.name}</strong>
                  <span>{p.cat}</span>
                  <button className="secondary" disabled={streak < 3}>
                    {streak >= 3 ? 'See the offer' : 'Locked'}
                  </button>
                </div>
              ))}
            </div>
            {!PARTNERS.length && <Blank icon={<Gift />} title="No partners yet" />}
          </>
        )}

        <div className="w-inset">
          <Notice kind="info" icon={<Info />}>
            A retailer discount or a waived fee. Never cash.
          </Notice>
        </div>
      </div>
    </div>
  );
}
