import { Receipt } from 'lucide-react';

// ---------------------------------------------------------------------------
// Every charge Halqa can make, on one screen.
//
// Fees were explained differently in the create flow, the checkout and the
// policy text, and a member had no single place to check what they would pay.
// This mirrors halqa-api/src/lib/fee-book.ts, which is the only place a fee is
// produced, so the two cannot drift apart.
// ---------------------------------------------------------------------------

const ROWS = [
  { label: 'Each installment', value: 'Rs 50', note: 'Flat. It does not grow with the committee.' },
  { label: 'Joining a committee', value: 'Free', note: '' },
  { label: 'Starting a committee', value: 'Free', note: '' },
  { label: 'Collecting your pot', value: 'Free', note: 'Halqa never takes a share of the pot.' },
  { label: 'Moving the money', value: 'Free', note: 'Payments run over Raast, which is free between people.' },
  { label: 'Leaving in the first 24 hours', value: 'Free', note: 'Nothing is owed before a committee starts.' },
  { label: 'Leaving with a replacement', value: 'Free', note: 'The group is not harmed, so there is nothing to charge.' },
  { label: 'Leaving by group approval', value: 'One installment', note: '70% goes to the members who stay, 30% to Halqa.' },
  { label: 'Leaving on hardship', value: 'Waived', note: 'Reviewed case by case.' },
  { label: 'Selling your turn', value: '10% of the premium', note: 'On the premium only. The premium is capped at half the payout.' },
  { label: 'Verified income', value: 'Up to 80% off', note: 'Lowers what Halqa charges. Never required to join.' },
];

export function FeeSchedule() {
  return (
    <section className="panel">
      <div className="panel-head">
        <div><h2>What Halqa charges</h2><p>Everything, in one place.</p></div>
        <Receipt />
      </div>
      <div className="fee-rows">
        {ROWS.map(r => (
          <div key={r.label} className="fee-row">
            <div className="fee-row-main">
              <b>{r.label}</b>
              <strong className={r.value === 'Free' || r.value === 'Waived' ? 'fee-free' : ''}>{r.value}</strong>
            </div>
            {r.note && <span>{r.note}</span>}
          </div>
        ))}
      </div>
      <p className="fee-foot">
        On a Rs 10,000 turn the fee is one half of one per cent. Halqa takes nothing from the pot itself.
      </p>
    </section>
  );
}

export default FeeSchedule;
