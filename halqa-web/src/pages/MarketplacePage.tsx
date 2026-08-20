import { useEffect, useState } from 'react';
import { Check, Gavel, Info, Lock, Plus, Repeat, Store, TrendingUp, Users } from 'lucide-react';
import { api, key, tokens } from '../api';
import { date, money } from '../lib/format';
import type { Committee, User } from '../types';
import type { TurnPricing } from '../components/ui';
import {
  AmountEntry, Blank, BottomBar, Card, Facts, Field, FlowHeader,
  Notice, Row, RowGroup, Segment, Sheet,
} from '../components/wallet';

// ---------------------------------------------------------------------------
// THE TURN MARKETPLACE
//
// A listing is a future turn somebody wants to move. The buyer takes the seat
// and its forward liability; the seller takes theirs. Nobody exits, no dues
// change, only the order does.
//
// WHY EVERY BUTTON USED TO FAIL. The server refuses a bid unless the bidder is
// an active member of that same committee, holds a future unreceived turn, and
// their score band allows the seat they are moving into. All three are checked
// server-side, and none of them were visible here, so a member tapped "Place
// bid" and got a 403 they could not have predicted. The reason is now on the
// row, before the tap, and the button is only live when a bid would be taken.
// ---------------------------------------------------------------------------

type Bid = { id: string; bidderId: string; premiumPaisa: string; status: string; bidder: { id: string; fullName: string; creditScore: number } };
type Listing = {
  id: string; position: number; payoutPaisa: string; premiumPaisa: string; payoutDate?: string;
  remainingDuesPaisa: string; buyerNetCostPaisa: string; buyerScope: 'INSIDE' | 'OUTSIDE';
  totalTurns?: number; turnPricing: TurnPricing;
  creditHealth: { averageCreditScore: number; grade: 'EXCELLENT' | 'STRONG' | 'FAIR' | 'WATCH'; defaults: number; latePayments: number; earlyPayments: number };
  engines: string[];
  seller: { id: string; fullName: string; creditScore: number; kycLevel: number };
  committee: { id: string; name: string; mode: string; currentRound: number; periodDays: number };
  bids?: Bid[];
};

/** Score bands decide which seats a member may hold. Mirrors score-bands.ts. */
function bandAllows(score: number, position: number, members: number): boolean {
  if (score < 550) return position > members - 3;      // last three only
  if (score < 650) return position > Math.floor(members / 2); // second half
  return true;
}

/** Why this member cannot bid on this listing, in the words the server means. */
function blockedReason(listing: Listing, user: User, mine: Committee[]): string | null {
  if (listing.seller.id === user.id) return null;
  if (user.creditScore < 550) return 'Your credit score is below 550, so you cannot buy turns yet';
  const committee = mine.find(c => c.id === listing.committee.id);
  if (!committee) return 'Only members of ' + listing.committee.name + ' can bid on this turn';
  const me = committee.members?.find(m => m.userId === user.id);
  if (!me || me.status !== 'ACTIVE') return 'Your membership of this committee is not active';
  if (me.hasReceived || me.turnPosition <= committee.currentRound) return 'You have already collected, so you have no turn to trade';
  if (!bandAllows(user.creditScore, listing.position, committee.members?.length || 0)) {
    return 'Turn ' + listing.position + ' is earlier than your credit score allows you to hold';
  }
  return null;
}

export default function MarketplacePage({ user, back }: { user: User; back?: () => void }) {
  const [tab, setTab] = useState<'buy' | 'mine'>('buy');
  const [rows, setRows] = useState<Listing[]>([]);
  const [mine, setMine] = useState<Committee[]>([]);
  const [sell, setSell] = useState(false);
  const [bidding, setBidding] = useState<Listing | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = () => Promise.all([api<Listing[]>('/exchange'), api<Committee[]>('/committees')])
    .then(([list, committees]) => { setRows(list); setMine(committees); setError(''); })
    .catch(reason => setError((reason as Error).message))
    .finally(() => setLoading(false));

  useEffect(() => { void load() }, [user.id]);

  // Turns of mine that could be listed: paid up, still ahead of the round.
  const sellable = mine.filter(c => c.status === 'ACTIVE' && c.mode !== 'INVESTMENT'
    && c.members?.some(m => m.userId === user.id && !m.hasReceived && m.turnPosition > c.currentRound));

  const acceptBid = async (listingId: string, bidId: string) => {
    try {
      setError('');
      await api('/exchange/' + listingId + '/bids/' + bidId + '/accept',
        { method: 'POST', body: JSON.stringify({ idempotencyKey: key() }) });
      await load();
    } catch (reason) { setError((reason as Error).message) }
  };

  const mineRows = rows.filter(r => r.seller.id === user.id);
  const buyRows = rows.filter(r => r.seller.id !== user.id);
  const shown = tab === 'mine' ? mineRows : buyRows;

  return (
    <div className="w-screen">
      <FlowHeader title="Turn marketplace" onBack={back} />

      <Segment value={tab} onChange={setTab} options={[
        { id: 'buy', label: 'Buy a turn' },
        { id: 'mine', label: 'My listings' },
      ]} />

      <div className="w-screen-body">
        {error && <div className="w-inset"><Notice kind="bad" icon={<Info />}>{error}</Notice></div>}

        {loading ? <div className="w-blank"><b>Loading turns</b></div> : shown.length ? (
          <RowGroup>
            {shown.map(listing => {
              const stop = blockedReason(listing, user, mine);
              const own = listing.seller.id === user.id;
              return (
                <div key={listing.id} className="mkt-row">
                  <Row
                    chevron={!stop && !own}
                    icon={<span className="mkt-turn">{listing.position}</span>}
                    title={listing.committee.name}
                    sub={listing.seller.fullName + ' · turn ' + listing.position + ' of ' + (listing.totalTurns || '?') + ' · circle score ' + listing.creditHealth.averageCreditScore}
                    value={money(listing.payoutPaisa)}
                    valueSub={'ask ' + money(listing.premiumPaisa)}
                    onClick={!stop && !own ? () => setBidding(listing) : undefined}
                  />
                  <div className="mkt-strip">
                    <div><span>Still owe after</span><b>{money(listing.remainingDuesPaisa)}</b></div>
                    <div><span>Net cost</span><b>{money(listing.buyerNetCostPaisa)}</b></div>
                    {listing.payoutDate && <div><span>Pays</span><b>{date(listing.payoutDate)}</b></div>}
                  </div>
                  {stop && <p className="mkt-stop"><Lock />{stop}</p>}
                  {own && (
                    listing.bids?.length
                      ? listing.bids.map(bid => (
                          <div key={bid.id} className="mkt-bid">
                            <span><b>{money(bid.premiumPaisa)}</b><small>{bid.bidder.fullName} · score {bid.bidder.creditScore}</small></span>
                            <button className="secondary sm" onClick={() => acceptBid(listing.id, bid.id)}>Accept</button>
                          </div>
                        ))
                      : <p className="mkt-stop"><Info />Nobody has bid on this yet</p>
                  )}
                </div>
              );
            })}
          </RowGroup>
        ) : (
          <Blank
            icon={tab === 'mine' ? <Store /> : <Repeat />}
            title={tab === 'mine' ? 'You have nothing listed' : 'No turns are for sale'}
            sub={tab === 'mine'
              ? 'List a turn you hold and members of that same committee can bid for it.'
              : 'When somebody wants their turn earlier or later, it appears here. Only members of that committee may bid.'}
          />
        )}

        {tab === 'buy' && (
          <Card title="How a swap works">
            <Facts cols={3} items={[
              ['Who may bid', 'Same circle'],
              ['What moves', 'The seat'],
              ['What does not', 'Your dues'],
            ]} />
            <Notice kind="info" icon={<Info />}>
              Two positions swap. Nobody leaves, no instalment changes.
            </Notice>
          </Card>
        )}
      </div>

      <BottomBar>
        <button className="primary full" onClick={() => setSell(true)}>
          <Plus /> List one of my turns
        </button>
      </BottomBar>

      {sell && <SellTurn committees={sellable} close={() => setSell(false)}
                         done={() => { setSell(false); void load() }} />}
      {bidding && <BidTurn listing={bidding} close={() => setBidding(null)}
                           done={() => { setBidding(null); void load() }} />}
    </div>
  );
}

// ---------------------------------------------------------------------------

function BidTurn({ listing, close, done }: { listing: Listing; close: () => void; done: () => void }) {
  const floor = Number(listing.premiumPaisa) / 100;
  const ceiling = Number(listing.payoutPaisa) / 200;    // the server caps a bid at half the payout
  const [amount, setAmount] = useState(String(Math.ceil(floor + 100)));
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const value = Math.round(Number(amount || 0) * 100);
  const low = value <= Number(listing.premiumPaisa);
  const high = value > Number(listing.payoutPaisa) / 2;

  const submit = async () => {
    setBusy(true); setError('');
    try {
      await api('/exchange/' + listing.id + '/bid',
        { method: 'POST', body: JSON.stringify({ premiumPaisa: String(value) }) });
      done();
    } catch (reason) { setError((reason as Error).message); setBusy(false) }
  };

  return (
    <Sheet title={'Bid for turn ' + listing.position} onClose={close}>
      <AmountEntry value={amount} onChange={setAmount} max={Math.floor(ceiling)}
                   hint={'Beat ' + money(listing.premiumPaisa) + ' · most allowed ' + money(Number(listing.payoutPaisa) / 2)} />
      <div className="w-inset">
        {low && <Notice kind="warn" icon={<Gavel />}>This does not beat the standing ask of {money(listing.premiumPaisa)}.</Notice>}
        {high && <Notice kind="bad" icon={<Lock />}>A bid cannot be more than half the payout.</Notice>}
        {error && <Notice kind="bad" icon={<Info />}>{error}</Notice>}
        <Facts cols={3} items={[
          ['You collect', money(listing.payoutPaisa)],
          ['You still owe', money(listing.remainingDuesPaisa)],
          ['Net cost', money(listing.buyerNetCostPaisa)],
        ]} />
        <Notice kind="info" icon={<Users />}>
          The seller decides. Nothing is charged unless they accept.
        </Notice>
      </div>
      <BottomBar>
        <button className="primary full" disabled={busy || low || high} onClick={submit}>
          {busy ? 'Placing' : 'Place bid'}
        </button>
      </BottomBar>
    </Sheet>
  );
}

// ---------------------------------------------------------------------------

function SellTurn({ committees, close, done }:
  { committees: Committee[]; close: () => void; done: () => void }) {
  const viewerId = (() => {
    try { return JSON.parse(atob(tokens.get().split('.')[1] || ''))?.userId as string | undefined }
    catch { return undefined }
  })();
  const [committeeId, setCommitteeId] = useState(committees[0]?.id || '');
  const [premium, setPremium] = useState('0');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const committee = committees.find(c => c.id === committeeId);
  const me = committee?.members.find(m => m.userId === viewerId);
  const round = committee?.rounds?.find(r => r.roundNumber === me?.turnPosition);
  const payoutP = Number(round?.payoutPaisa || 0)
    || Number(committee?.contributionPaisa || 0) * (committee?.members.length || 0);
  const max = payoutP / 2;

  const submit = async () => {
    setBusy(true); setError('');
    try {
      await api('/exchange', {
        method: 'POST',
        body: JSON.stringify({ committeeId, premiumPaisa: String(Math.round(Number(premium || 0) * 100)) }),
      });
      done();
    } catch (reason) { setError((reason as Error).message); setBusy(false) }
  };

  if (!committees.length) {
    return (
      <Sheet title="List a turn" onClose={close}>
        <Blank icon={<Store />} title="No turn you can list"
               sub="Only a future turn, instalment paid." />
      </Sheet>
    );
  }

  return (
    <Sheet title="List a turn" onClose={close}>
      <Field label="Which committee">
        <select value={committeeId} onChange={e => setCommitteeId(e.target.value)}>
          {committees.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </Field>
      <Field label="Opening ask, in rupees" hint={'Most allowed ' + money(max) + ', half the payout'}>
        <input inputMode="decimal" value={premium}
               onChange={e => setPremium(e.target.value.replace(/[^\d.]/g, ''))} />
      </Field>
      <div className="w-inset">
        <Facts cols={2} items={[
          ['Turn', me ? String(me.turnPosition) : '—'],
          ['Payout', money(payoutP)],
        ]} />
        <Notice kind="info" icon={<TrendingUp />}>
          Only members of this committee may bid.
        </Notice>
        {error && <Notice kind="bad" icon={<Info />}>{error}</Notice>}
      </div>
      <BottomBar>
        <button className="primary full" disabled={busy} onClick={submit}>
          {busy ? 'Publishing' : <><Check /> Publish listing</>}
        </button>
      </BottomBar>
    </Sheet>
  );
}
