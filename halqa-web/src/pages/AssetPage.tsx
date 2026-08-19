import { useMemo, useState } from 'react';
import { Bike, ChevronLeft, Package, Shirt, Smartphone, Sun, WashingMachine } from 'lucide-react';
import { money, percent } from '../lib/format';

// ---------------------------------------------------------------------------
// Asset committees: the pot buys a thing instead of paying out cash.
//
// Mirrors halqa-api/src/lib/asset-committee.ts. The number that matters here is
// the total cost of ownership set against buying outright, because the whole
// claim of this product is that it is not a loan and costs almost nothing more
// than cash. If that were untrue the comparison would show it, which is exactly
// why the comparison is on the screen.
// ---------------------------------------------------------------------------

const FEE_PER_INSTALLMENT = 5_000;   // Rs 50

const CATALOGUE = [
  { id: 'phone-entry', name: 'Entry smartphone',     priceP: 3_500_000,  securable: true,  icon: Smartphone },
  { id: 'phone-mid',   name: 'Mid-range smartphone', priceP: 7_500_000,  securable: true,  icon: Smartphone },
  { id: 'solar-basic', name: 'Home solar kit',       priceP: 12_000_000, securable: true,  icon: Sun },
  { id: 'bike-70',     name: 'Motorcycle 70cc',      priceP: 16_500_000, securable: true,  icon: Bike },
  { id: 'fridge',      name: 'Refrigerator',         priceP: 9_500_000,  securable: false, icon: Package },
  { id: 'washer',      name: 'Washing machine',      priceP: 5_500_000,  securable: false, icon: WashingMachine },
  { id: 'sewing',      name: 'Sewing machine',       priceP: 3_000_000,  securable: false, icon: Shirt },
];

const ROUND_OPTIONS = [6, 10, 12, 18, 24];

export default function AssetPage({ back }: { back: () => void }) {
  const [pick, setPick] = useState(CATALOGUE[1].id);
  const [rounds, setRounds] = useState(10);

  const asset = CATALOGUE.find(a => a.id === pick)!;
  const plan = useMemo(() => {
    const contribution = Math.ceil(asset.priceP / rounds);
    const total = contribution * rounds;
    const fees = FEE_PER_INSTALLMENT * rounds;
    return {
      contribution, total, fees,
      allIn: total + fees,
      uplift: ((total + fees - asset.priceP) / asset.priceP) * 100,
    };
  }, [asset, rounds]);

  const Icon = asset.icon;

  return (
    <div className="page narrow enter">
      <button className="back-link" onClick={back}><ChevronLeft />Back</button>
      <div className="page-head">
        <div>
          <span className="eyebrow">Committee for a thing</span>
          <h1>Save for something</h1>
          <p>The committee buys it. You pay monthly and own it outright.</p>
        </div>
      </div>

      <section className="panel">
        <div className="panel-head"><div><h2>What are you saving for</h2></div></div>
        <div className="asset-grid">
          {CATALOGUE.map(a => {
            const I = a.icon;
            return (
              <button key={a.id} className={`asset-card${pick === a.id ? ' on' : ''}`} onClick={() => setPick(a.id)}>
                <I />
                <b>{a.name}</b>
                <span>{money(a.priceP)}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="panel">
        <div className="panel-head"><div><h2>Over how many months</h2></div></div>
        <div className="segmented">
          {ROUND_OPTIONS.map(r => (
            <button key={r} className={rounds === r ? 'on' : ''} onClick={() => setRounds(r)}>{r}</button>
          ))}
        </div>
        <div className="detail-grid">
          <div><span>Each month</span><b>{money(plan.contribution)}</b></div>
          <div><span>Members</span><b>{rounds}</b></div>
          <div><span>You pay in total</span><b>{money(plan.total)}</b></div>
        </div>
      </section>

      {/* The comparison that has to be honest for the product to be honest. */}
      <section className="panel">
        <div className="panel-head"><div><h2>What it really costs</h2></div><Icon /></div>
        <div className="asset-compare">
          <div>
            <span>Buying it today, cash</span>
            <b>{money(asset.priceP)}</b>
          </div>
          <div className="asset-compare-us">
            <span>Through a committee, all in</span>
            <b>{money(plan.allIn)}</b>
            <small>{money(plan.total)} to the circle, {money(plan.fees)} to Halqa</small>
          </div>
        </div>
        <p className="asset-note">
          That is {percent(plan.uplift)} more than paying cash, and all of it is Halqa's Rs 50
          per month. The circle never charges you more than the price of the thing, because a
          charge for waiting is exactly what this is meant to replace.
        </p>
      </section>

      <section className="panel">
        <div className="panel-head"><div><h2>When you get it</h2></div></div>
        <p className="asset-note">
          Everyone in the committee receives on the same day, when the cycle finishes. By then
          nobody owes anything, so nobody can lose the thing they have been paying for.
        </p>
        {asset.securable ? (
          <div className="asset-early">
            <b>Early delivery is possible for this item.</b>
            <span>
              It can be locked remotely if payments stop, so it can be handed over at your turn
              instead. You would be told exactly what can be locked, and when, before you agree.
            </span>
          </div>
        ) : (
          <div className="asset-early plain">
            <b>This item is delivered at the end only.</b>
            <span>
              It cannot be secured once it is in your home, so handing it over early would make
              this a loan. Halqa does not offer that.
            </span>
          </div>
        )}
      </section>

      <button className="primary full">Start this committee</button>
      <p className="asset-foot">
        You can settle the balance and take the item at any time, at the plain amount left, with
        no charge for finishing early.
      </p>
    </div>
  );
}
