import { dateTime } from '../lib/format';
import { Check, RotateCw, Share2, X } from 'lucide-react';
import { money } from '../api';
import { RailLogo } from './RailLogo';

export type ReceiptData = {
  title: string;
  amountPaisa: string | number;
  reference: string;
  rail: string;
  rows: [string, string][];
  feePaisa?: string | number;
  status?: 'SETTLED' | 'PENDING';
  stamp?: string;
};

// ---------------------------------------------------------------------------
// The receipt is the product.
//
// A committee member's whole complaint about the informal system is that
// nothing is written down, so every money event has to end on a document with
// a reference, a timestamp and an identity on it.
//
// Laid out the way a Pakistani wallet lays one out, because that is the artefact
// members already trust: a green tick above a torn paper slip, the transaction
// id and time in small type, the amount large and centred, then the ledger rows,
// then the rail it travelled over at the foot. Familiar beats clever here.
// ---------------------------------------------------------------------------
export default function Receipt({ data, onClose }: { data: ReceiptData; onClose: () => void }) {
  const when = data.stamp || dateTime(new Date());
  const fee = Number(data.feePaisa || 0);
  const total = Number(data.amountPaisa) + fee;
  const pending = data.status === 'PENDING';

  const share = async () => {
    const text = `Halqa receipt ${data.reference}\n${data.title}\n${money(total)}\n${when}`;
    try {
      if (navigator.share) await navigator.share({ title: 'Halqa receipt', text });
      else { await navigator.clipboard.writeText(text); }
    } catch { /* dismissed */ }
  };

  return (
    <div className="rcpt-wrap" onClick={onClose}>
      <div className="rcpt-stage" onClick={e => e.stopPropagation()}>
        <button className="rcpt-close" onClick={onClose} aria-label="Close"><X /></button>

        <div className={`rcpt-tick${pending ? ' pending' : ''}`}><Check /></div>

        <div className="rcpt-slip">
          <div className="rcpt-slip-head">
            <b>{pending ? 'Payment recorded' : 'Transaction successful'}</b>
            <span>{data.reference}</span>
            <span>{when}</span>
          </div>

          <div className="rcpt-amount">{money(total)}</div>

          <div className="rcpt-rows">
            <div><span>Fee</span><b>{fee ? money(fee) : 'Rs 0'}</b></div>
            {data.rows.map(([k, v]) => <div key={k}><span>{k}</span><b>{v}</b></div>)}
            <div><span>Amount</span><b>{money(data.amountPaisa)}</b></div>
          </div>

          <div className="rcpt-rail">
            <span>Paid over</span>
            <RailLogo rail={data.rail} size={24} />
            <b>{data.rail === 'RAAST' ? 'Raast' : data.rail === 'JAZZCASH' ? 'JazzCash'
               : data.rail === 'EASYPAISA' ? 'Easypaisa' : data.rail === 'CARD' ? 'Card' : 'Bank'}</b>
          </div>
        </div>

        <div className="rcpt-acts">
          <button onClick={share}><Share2 />Share</button>
          <button onClick={() => window.print()}><RotateCw />Save</button>
        </div>

        <p className="rcpt-note">
          Money moved directly between the two members. Halqa never held it.
        </p>
      </div>
    </div>
  );
}
