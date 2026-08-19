import { dateTime } from '../lib/format';
import { Check, Download, Share2, X } from 'lucide-react';
import { money } from '../api';

export type ReceiptData={
  title:string;
  amountPaisa:string|number;
  reference:string;
  rail:string;
  rows:[string,string][];
  feePaisa?:string|number;
  status?:'SETTLED'|'PENDING';
  stamp?:string;
};

// The receipt is the product. A committee member's whole complaint about the
// informal system is that nothing is written down, so every money event ends
// on a document with a reference, a timestamp and an identity on it, the same
// artefact a wallet issues, because that is the one members already trust.
export default function Receipt({data,onClose}:{data:ReceiptData;onClose:()=>void}){
  const when=data.stamp||dateTime(new Date());
  const fee=Number(data.feePaisa||0);
  const total=Number(data.amountPaisa)+fee;
  const share=async()=>{
    const text=`Halqa receipt ${data.reference}\n${data.title}\n${money(total)}\n${when}`;
    try{
      if(navigator.share)await navigator.share({title:'Halqa receipt',text});
      else{await navigator.clipboard.writeText(text);alert('Receipt copied')}
    }catch{/* dismissed */}
  };
  return <div className="rcpt-wrap" onClick={onClose}>
    <div className="rcpt" onClick={e=>e.stopPropagation()}>
      <div style={{display:'flex',justifyContent:'flex-end',padding:'12px 14px 0'}}>
        <button className="back" onClick={onClose} aria-label="Close"><X/></button>
      </div>
      <div className="rcpt-head">
        <div className="rcpt-tick"><Check/></div>
        <h3>{data.title}</h3>
        <strong>{money(total)}</strong>
        <p>{data.status==='PENDING'?'Awaiting settlement confirmation':'Settled'} · {when}</p>
      </div>
      <div className="rcpt-perf"/>
      <div className="rcpt-body">
        <div className="rcpt-row"><span>Reference</span><b>{data.reference}</b></div>
        <div className="rcpt-row"><span>Paid via</span><b>{data.rail}</b></div>
        {data.rows.map(([k,v])=><div className="rcpt-row" key={k}><span>{k}</span><b>{v}</b></div>)}
        <div className="rcpt-row"><span>Amount</span><b>{money(data.amountPaisa)}</b></div>
        <div className="rcpt-row"><span>Halqa fee</span><b>{fee?money(fee):'Rs 0'}</b></div>
        <div className="rcpt-row total"><span>Total</span><b>{money(total)}</b></div>
      </div>
      <div className="rcpt-acts">
        <button className="btn ghost" onClick={share}><Share2/>Share</button>
        <button className="btn" onClick={()=>window.print()}><Download/>Save</button>
      </div>
      <p className="rcpt-note">Halqa records this settlement between members. Funds moved directly between the two accounts and were not held by Halqa at any point.</p>
    </div>
  </div>;
}
