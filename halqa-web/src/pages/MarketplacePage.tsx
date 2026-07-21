import { useEffect, useState } from 'react';
import { CalendarDays, Plus, ShieldCheck, Users, Gavel } from 'lucide-react';
import { api, key, money, tokens } from '../api';
import type { Committee, User } from '../types';
import { Empty, Field } from '../components/ui';

type Bid = { id: string; bidderId: string; premiumPaisa: string; status: string; bidder: { id: string; fullName: string; creditScore: number } };
type Listing = { id: string; position: number; payoutPaisa: string; premiumPaisa: string; payoutDate?: string; remainingDuesPaisa: string; buyerNetCostPaisa: string; buyerScope: 'INSIDE' | 'OUTSIDE'; totalTurns?: number; seller: { id: string; fullName: string; creditScore: number; kycLevel: number }; committee: { id: string; name: string; mode: string; currentRound: number; periodDays: number }; bids?: Bid[] };

export default function MarketplacePage({ user }: { user: User }) {
  const [rows, setRows] = useState<Listing[]>([]);
  const [eligible, setEligible] = useState<Committee[]>([]);
  const [sell, setSell] = useState(false);
  const [biddingOn, setBiddingOn] = useState<string | null>(null);
  const [error, setError] = useState('');

  const load = () => Promise.all([api<Listing[]>('/exchange'), api<Committee[]>('/committees')]).then(([list, committees]) => {
    setRows(list);
    setEligible(committees.filter(committee => committee.status === 'ACTIVE' && committee.mode !== 'INVESTMENT' && committee.members?.some(member => member.userId === user.id && !member.hasReceived && member.turnPosition > committee.currentRound)));
  });
  
  useEffect(() => { void load() }, [user.id]);

  const acceptBid = async (listingId: string, bidId: string) => {
    try {
      setError('');
      await api(`/exchange/${listingId}/bids/${bidId}/accept`, { method: 'POST', body: JSON.stringify({ idempotencyKey: key() }) });
      await load();
    } catch (reason) { setError((reason as Error).message) }
  };

  return (
    <div className="page enter">
      <div className="page-head">
        <div>
          <span className="eyebrow">Turn exchange</span>
          <h1>Marketplace</h1>
          <p>Auction a future payout position or bid on active listings.</p>
        </div>
        <button className="primary" onClick={() => setSell(true)}><Plus />List a turn</button>
      </div>

      <div className="market-rules">
        <ShieldCheck />
        <div>
          <b>Protected exchange</b>
          <p>Active members bid to swap future payout positions. Membership and contribution duties remain unchanged.</p>
        </div>
      </div>

      {error && <div className="error-box">{error}</div>}

      <section className="listing-grid">
        {rows.map((listing, index) => (
          <article className="listing-card stagger" style={{ animationDelay: `${index * 55}ms` }} key={listing.id}>
            <div className="listing-top">
              <div className="turn-number"><span>Turn</span><b>#{listing.position}{listing.totalTurns?<em className="of-total"> / {listing.totalTurns}</em>:null}</b></div>
              <div>
                <span className={`scope scope-${listing.buyerScope.toLowerCase()}`}>
                  <Users />Inside-circle swap
                </span>
                <h3>{listing.committee.name}</h3>
                <p>Seller {listing.seller.fullName} · score {listing.seller.creditScore}</p>
              </div>
            </div>

            <div className="listing-values">
              <div><span>Future payout</span><b>{money(listing.payoutPaisa)}</b></div>
              <div><span>Asking Premium</span><b className="profit">+{money(listing.premiumPaisa)}</b></div>
              <div><span>Remaining dues</span><b>{money(listing.remainingDuesPaisa)}</b></div>
              <div><span>Opening premium</span><b>{money(listing.buyerNetCostPaisa)}</b></div>
            </div>

            {listing.payoutDate && (
              <div className="payout-date">
                <CalendarDays />Expected payout {new Date(listing.payoutDate).toLocaleDateString()}
              </div>
            )}

            {listing.seller.id === user.id ? (
              <div className="own-listing">
                <b>Your Listing</b>
                {listing.bids && listing.bids.length > 0 ? (
                  <div style={{ marginTop: '12px' }}>
                    <p style={{ marginBottom: '8px' }}>Active Bids:</p>
                    {listing.bids.map(bid => (
                      <div key={bid.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', border: '2px solid #000', padding: '8px', marginBottom: '8px' }}>
                        <div>
                          <b className="profit">+{money(bid.premiumPaisa)}</b>
                          <span style={{ display: 'block', fontSize: '10px' }}>{bid.bidder.fullName} (Score {bid.bidder.creditScore})</span>
                        </div>
                        <button className="primary" style={{ minHeight: '32px', fontSize: '12px', padding: '0 12px' }} onClick={() => acceptBid(listing.id, bid.id)}>Accept</button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>No bids yet.</p>
                )}
              </div>
            ) : (
              <button className="primary" onClick={() => setBiddingOn(listing.id)}>
                <Gavel /> Place Bid
              </button>
            )}
          </article>
        ))}

        {!rows.length && <Empty text="No future turns are listed. Eligible members can list theirs for auction." />}
      </section>

      {sell && <SellTurn committees={eligible} close={() => setSell(false)} done={() => { setSell(false); void load() }} />}
      {biddingOn && <BidTurn listingId={biddingOn} close={() => setBiddingOn(null)} done={() => { setBiddingOn(null); void load() }} />}
    </div>
  );
}

function BidTurn({ listingId, close, done }: { listingId: string; close: () => void; done: () => void }) {
  const [amount, setAmount] = useState(0);
  const [error, setError] = useState('');

  const submit = async () => {
    try {
      setError('');
      await api(`/exchange/${listingId}/bid`, { method: 'POST', body: JSON.stringify({ premiumPaisa: String(Math.round(amount * 100)) }) });
      done();
    } catch (reason) { setError((reason as Error).message) }
  };

  return (
    <div className="modal-backdrop">
      <section className="modal">
        <div className="modal-head">
          <h2>Place a Bid</h2>
          <button onClick={close}>×</button>
        </div>
        <Field label="Your Bid Premium (PKR)" hint="How much extra you are willing to pay the seller for this turn.">
          <input className="field" type="number" min="0" step="100" value={amount} onChange={e => setAmount(Math.max(0, +e.target.value))} />
        </Field>
        <div className="seller-math" style={{ marginTop: '16px' }}>
          <div><span>Bid Amount</span><b className="profit">+{money(amount * 100)}</b></div>
        </div>
        {error && <div className="error-box" style={{ marginTop: '16px' }}>{error}</div>}
        <button className="primary full" style={{ marginTop: '24px' }} onClick={submit}>Submit Bid</button>
      </section>
    </div>
  );
}

function SellTurn({ committees, close, done }: { committees: Committee[]; close: () => void; done: () => void }) {
  const viewerId = JSON.parse(atob(tokens.get().split('.')[1] || ''))?.userId as string | undefined;
  const [committeeId, setCommitteeId] = useState(committees[0]?.id || '');
  const [premium, setPremium] = useState(0);
  const [error, setError] = useState('');
  
  const committee = committees.find(item => item.id === committeeId);
  const membership = committee?.members.find(member => member.userId === viewerId);
  const targetRound = committee?.rounds?.find(round => round.roundNumber === membership?.turnPosition);
  const payout = Number(targetRound?.payoutPaisa || 0) / 100 || Number(committee?.contributionPaisa || 0) * (committee?.members.length || 0) / 100;
  const max = payout / 2;

  const submit = async () => {
    try {
      setError('');
      await api('/exchange', { method: 'POST', body: JSON.stringify({ committeeId, premiumPaisa: String(Math.round(premium * 100)) }) });
      done();
    } catch (reason) { setError((reason as Error).message) }
  };

  return (
    <div className="modal-backdrop">
      <section className="modal">
        <div className="modal-head">
          <h2>List for Auction</h2>
          <button onClick={close}>×</button>
        </div>
        {!committees.length ? <Empty text="No eligible future turn. Your current installment must be paid and the turn must be after the current round." /> : <>
          <Field label="Committee">
            <select className="field" value={committeeId} onChange={e => setCommitteeId(e.target.value)}>
              {committees.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
          </Field>
          <Field label="Starting Ask Premium (PKR)" hint={`Maximum ${max.toLocaleString()}`}>
            <input className="field" type="number" min="0" max={max} step="100" value={premium} onChange={e => setPremium(Math.max(0, Math.min(max, +e.target.value)))} />
          </Field>
          <div className="warning-box" style={{ marginTop: '16px' }}>Only active members of this committee can bid. Accepted bids swap future positions; nobody exits and all dues remain unchanged.</div>
          {error && <div className="error-box" style={{ marginTop: '16px' }}>{error}</div>}
          <button className="primary full" style={{ marginTop: '24px' }} onClick={submit}>Publish Listing</button>
        </>}
      </section>
    </div>
  );
}
