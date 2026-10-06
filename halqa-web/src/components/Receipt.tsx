import { Check, Clock, Copy, Share2, ShieldAlert, X } from 'lucide-react';
import { useDismissable } from '../lib/dismissable';
import { useState } from 'react';
import { dateTime, money } from '../lib/format';
import { SERVICE_FEE_PAISA } from '../lib/fees';
import { RailLogo } from './RailLogo';

export type ReceiptParty = { name: string; ref?: string };

export type ReceiptData = {
  title: string;
  amountPaisa: string | number;
  /** The transaction id members quote when something goes wrong. */
  reference: string;
  rail: string;
  rows: [string, string][];
  feePaisa?: string | number;
  status?: 'SETTLED' | 'PENDING' | 'FAILED';
  stamp?: string;
  from?: ReceiptParty;
  to?: ReceiptParty;
  purpose?: string;
  /** The payment this receipt is for, so it can be disputed from here. */
  paymentId?: string;
  onDispute?: (paymentId: string) => void;
};

// ---------------------------------------------------------------------------
// THE RECEIPT IS THE PRODUCT.
//
// A committee member's whole complaint about the informal system is that
// nothing is written down. So every money event has to end on a document that
// can be produced later, and it has to carry what a real wallet receipt
// carries, not a pretty subset of it:
//
//   the transaction id, because that is what a member quotes on a helpline;
//   the exact date and time to the second;
//   the status in words, successful or pending or failed;
//   who sent it and who received it, each with their own identifier;
//   the amount, the fee, and the total, ruled off in that order;
//   what it was for; and the rail it travelled over.
//
// Laid out the way a Pakistani wallet lays one out, because that is the artefact
// members already trust: a tick above a torn paper slip, the id and time small,
// the amount large and centred, the parties, then the totals. Familiar beats
// clever here.
// ---------------------------------------------------------------------------

const RAIL_NAME: Record<string, string> = {
  RAAST: 'Raast', JAZZCASH: 'JazzCash', EASYPAISA: 'Easypaisa',
  CARD: 'Card', BANK_TRANSFER: 'Bank transfer',
};

export default function Receipt({ data, onClose }: { data: ReceiptData; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const when = data.stamp || dateTime(new Date());
  // A receipt that does not name a fee is a receipt for an instalment, and the
  // fee on an instalment is Rs 85. Falling back to nought understated what the
  // member paid (30 September 2026).
  const fee = Number(data.feePaisa || 0) || SERVICE_FEE_PAISA;
  const total = Number(data.amountPaisa) + fee;
  const state = data.status || 'SETTLED';

  const asText = [
    'Halqa receipt',
    'Transaction id  ' + data.reference,
    'Status          ' + (state === 'SETTLED' ? 'Successful' : state === 'PENDING' ? 'Pending' : 'Failed'),
    'Date and time   ' + when,
    data.from ? 'From            ' + data.from.name + (data.from.ref ? ' (' + data.from.ref + ')' : '') : '',
    data.to ? 'To              ' + data.to.name + (data.to.ref ? ' (' + data.to.ref + ')' : '') : '',
    ...data.rows.map(([k, v]) => (k + '                '.slice(0, Math.max(1, 16 - k.length))) + v),
    'Amount          ' + money(data.amountPaisa),
    'Fee             ' + money(fee),
    'Total           ' + money(total),
    'Paid over       ' + (RAIL_NAME[data.rail] || data.rail),
  ].filter(Boolean).join('\n');

  const share = async () => {
    try {
      if (navigator.share) await navigator.share({ title: 'Halqa receipt', text: asText });
      else { await navigator.clipboard.writeText(asText); setCopied(true); setTimeout(() => setCopied(false), 1800) }
    } catch { /* dismissed */ }
  };
  const copy = async () => {
    try { await navigator.clipboard.writeText(data.reference); setCopied(true); setTimeout(() => setCopied(false), 1800) }
    catch { /* clipboard refused */ }
  };

  const layer = useDismissable(true, onClose);
  return (
    // The receipt is the dialog; the wrap is somewhere to tap. Escape closes it
    // and so does the Close button, both from a keyboard.
    <div className="rcpt-wrap" onClick={onClose} aria-hidden="true">
      <div className="rcpt-stage" role="dialog" aria-modal="true" aria-label="Payment receipt"
           ref={layer} tabIndex={-1} onClick={e => e.stopPropagation()}>
        <button className="rcpt-close" onClick={onClose} aria-label="Close"><X /></button>

        <div className={'rcpt-tick' + (state === 'SETTLED' ? '' : ' pending')}>
          {state === 'SETTLED' ? <Check /> : <Clock />}
        </div>

        <div className="rcpt-slip">
          <div className="rcpt-slip-head">
            <b>{state === 'SETTLED' ? 'Transaction successful'
              : state === 'PENDING' ? 'Payment recorded, not yet settled' : 'Transaction failed'}</b>
            <span>{when}</span>
          </div>

          <div className="rcpt-amount">{money(total)}</div>
          <div className="rcpt-purpose">{data.purpose || data.title}</div>

          {/* Who to whom, the pair a member checks first. */}
          {(data.from || data.to) && (
            <div className="rcpt-parties">
              {data.from && <div><span>From</span><b>{data.from.name}</b>{data.from.ref && <small className="mono">{data.from.ref}</small>}</div>}
              {data.to && <div><span>To</span><b>{data.to.name}</b>{data.to.ref && <small className="mono">{data.to.ref}</small>}</div>}
            </div>
          )}

          <div className="rcpt-rows">
            {data.rows.map(([k, v]) => <div key={k}><span>{k}</span><b>{v}</b></div>)}
            <div><span>Amount</span><b>{money(data.amountPaisa)}</b></div>
            {/* The fee on a receipt is the fee that was actually charged. It
                used to fall back to "Rs 0", which stopped being true when the
                fee became Rs 85 on every instalment (30 September 2026). */}
            <div><span>Halqa fee</span><b>{money(fee)}</b></div>
            <div className="rcpt-total"><span>Total</span><b>{money(total)}</b></div>
          </div>

          {/* The id, on its own line, copyable: it is what a member quotes. */}
          <button className="rcpt-tid" onClick={copy}>
            <span>Transaction id</span>
            <b className="mono">{data.reference}</b>
            <Copy />
          </button>

          <div className="rcpt-rail">
            <span>Paid over</span>
            <RailLogo rail={data.rail} size={24} />
            <b>{RAIL_NAME[data.rail] || data.rail}</b>
          </div>
        </div>

        <div className="rcpt-acts">
          <button onClick={share}><Share2 />{copied ? 'Copied' : 'Share'}</button>
          <button onClick={() => window.print()}><Copy />Save a copy</button>
        </div>

        {data.paymentId && data.onDispute && (
          <button className="rcpt-dispute" onClick={() => data.onDispute!(data.paymentId!)}>
            <ShieldAlert /> Something is wrong with this
          </button>
        )}

        <p className="rcpt-note">
          Money moved directly between the two members. Halqa never held it.
        </p>
      </div>
    </div>
  );
}
