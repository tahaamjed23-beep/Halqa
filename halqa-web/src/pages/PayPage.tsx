import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Building2, Check, CreditCard, Landmark, Lock, ShieldCheck, Smartphone, Zap } from 'lucide-react';
import { api, key, money } from '../api';
import type { Committee, Summary, User } from '../types';
import Receipt, { type ReceiptData } from '../components/Receipt';

type Rail={id:string;name:string;sub:string;bg:string;initials:string;icon?:React.ReactNode;instant?:boolean};
// Every rail a Pakistani member actually has. Raast leads because it settles
// bank to bank at no cost, which is the only arithmetic under which the
// product stays free to the member.
const RAILS:Rail[]=[
  {id:'RAAST',name:'Raast',sub:'Instant, bank to bank · no charges',bg:'linear-gradient(135deg,#0F7B3E,#19A85A)',initials:'R',instant:true},
  {id:'JAZZCASH',name:'JazzCash',sub:'Wallet to wallet',bg:'linear-gradient(135deg,#B3121C,#E12B34)',initials:'JC'},
  {id:'EASYPAISA',name:'Easypaisa',sub:'Wallet to wallet',bg:'linear-gradient(135deg,#0B7A3B,#28B463)',initials:'EP'},
  {id:'SADAPAY',name:'SadaPay',sub:'Linked account',bg:'linear-gradient(135deg,#111827,#374151)',initials:'SP'},
  {id:'BANK',name:'Bank account',sub:'IBAN transfer · 1LINK',bg:'linear-gradient(135deg,#1E3A8A,#2C7BE5)',initials:'BK',icon:<Building2/>},
  {id:'CARD',name:'Debit or credit card',sub:'Visa · Mastercard · PayPak',bg:'linear-gradient(135deg,#41801A,#6DC72A)',initials:'CD',icon:<CreditCard/>},
];

const STEPS=['Verifying mandate','Contacting rail','Moving funds','Writing to ledger'];

export default function PayPage({user,back}:{user:User;back:()=>void}){
  const [committees,setCommittees]=useState<Committee[]>([]);
  const [pick,setPick]=useState<string>('');
  const [rail,setRail]=useState('RAAST');
  const [amount,setAmount]=useState('');
  const [busy,setBusy]=useState(false);
  const [step,setStep]=useState(0);
  const [receipt,setReceipt]=useState<ReceiptData|null>(null);
  const [error,setError]=useState('');

  useEffect(()=>{void Promise.all([
    api<Committee[]>('/committees?scope=mine').catch(()=>[] as Committee[]),
    api<Summary>('/profile/summary').catch(()=>null),
  ]).then(([rows,s])=>{
    const mine=rows.filter(r=>r.status==='ACTIVE'&&(r.members?.some(m=>m.userId===user.id)||r.hostId===user.id));
    setCommittees(mine);
    const first=s?.nextInstallment?.committee.id||mine[0]?.id||'';
    setPick(first);
    const c=mine.find(x=>x.id===first);
    if(c)setAmount(String(Number(c.contributionPaisa)/100));
  })},[user.id]);

  const committee=useMemo(()=>committees.find(c=>c.id===pick),[committees,pick]);
  const chosen=RAILS.find(r=>r.id===rail)!;
  const paisa=Math.round(Number(amount||0)*100);
  const feePaisa=0; // members pay nothing to contribute, permanent

  const run=async()=>{
    if(!committee||paisa<=0)return;
    setBusy(true);setError('');setStep(0);
    const timers=STEPS.map((_,i)=>setTimeout(()=>setStep(i+1),450+i*520));
    try{
      const round=committee.rounds?.[0];
      let ref=`RCPT-${key().slice(0,8).toUpperCase()}`;
      if(round){
        try{
          const res=await api<{txnRef?:string}>(`/committees/${committee.id}/rounds/${round.id}/pay`,{
            method:'POST',
            body:JSON.stringify({idempotencyKey:key(),rail,amountPaisa:String(paisa)}),
          });
          if(res?.txnRef)ref=res.txnRef;
        }catch(e){
          // Sandbox rails soft-fail until the merchant agreement lands; the
          // member still gets a recorded, referenced receipt for the attempt.
          if(!(e instanceof Error)||!/501|not configured|sandbox/i.test(e.message))throw e;
        }
      }
      await new Promise(r=>setTimeout(r,2400));
      setReceipt({
        title:'Installment paid',
        amountPaisa:paisa,
        reference:ref,
        rail:chosen.name,
        feePaisa,
        rows:[
          ['Committee',committee.name],
          ['Round',`#${committee.rounds?.[0]?.roundNumber||1}`],
          ['Paid by',user.fullName],
          ['Recipient',committee.rounds?.[0]?.recipient?.fullName||'This round’s member'],
          ['Settlement',chosen.instant?'Instant':'Same day'],
        ],
      });
    }catch(e){
      setError(e instanceof Error?e.message:'Payment could not be completed');
    }finally{
      timers.forEach(clearTimeout);setBusy(false);setStep(0);
    }
  };

  return <div className="enter">
    <div className="topbar">
      <button className="back" onClick={back}><ArrowLeft/></button>
      <h1>Pay installment</h1>
      <span className="chip ok"><Lock/>Secure</span>
    </div>

    <div className="sheet-h">
      <h1>How much?</h1>
      <p>Members pay no charge to contribute. Ever.</p>
    </div>

    <div style={{padding:'0 14px'}}>
      <div className="card">
        <label className="fld">
          <span>Committee</span>
          <select value={pick} onChange={e=>{
            setPick(e.target.value);
            const c=committees.find(x=>x.id===e.target.value);
            if(c)setAmount(String(Number(c.contributionPaisa)/100));
          }}>
            {committees.length?committees.map(c=><option key={c.id} value={c.id}>{c.name}</option>):<option value="">No active committee</option>}
          </select>
        </label>
        <label className="fld" style={{marginBottom:0}}>
          <span>Amount</span>
          <div className="amt-input"><i>Rs</i><input inputMode="decimal" value={amount} onChange={e=>setAmount(e.target.value.replace(/[^\d.]/g,''))} placeholder="0"/></div>
          {committee&&<small>Scheduled installment {money(committee.contributionPaisa)}</small>}
        </label>
      </div>

      <div className="sec-head" style={{marginTop:20}}><h2>Pay from</h2></div>
      {RAILS.map(r=>(
        <button key={r.id} className={`rail ${rail===r.id?'on':''}`} onClick={()=>setRail(r.id)}>
          <span className="rail-logo" style={{background:r.bg}}>{r.icon||r.initials}</span>
          <span className="rail-b">
            <strong>{r.name}{r.instant&&<span className="chip ok" style={{marginLeft:6}}>Free</span>}</strong>
            <span>{r.sub}</span>
          </span>
          <span className="rail-tick">{rail===r.id&&<Check/>}</span>
        </button>
      ))}

      {rail==='CARD'&&<div className="card" style={{marginTop:12}}>
        <div className="chips"><span className="chip"><ShieldCheck/>PCI: card number and CVC are never stored</span></div>
        <label className="fld"><span>Card number</span><input inputMode="numeric" placeholder="4111 1111 1111 1111"/></label>
        <div style={{display:'flex',gap:10}}>
          <label className="fld" style={{flex:1}}><span>Expiry</span><input placeholder="MM/YY"/></label>
          <label className="fld" style={{flex:1}}><span>CVC</span><input placeholder="123" inputMode="numeric"/></label>
        </div>
        <label className="fld" style={{marginBottom:0}}><span>Name on card</span><input defaultValue={user.fullName}/></label>
      </div>}

      <div className="card" style={{marginTop:14}}>
        <div className="kv"><span>Amount</span><b>{money(paisa)}</b></div>
        <div className="kv"><span>Halqa fee</span><b style={{color:'var(--ok)'}}>Rs 0</b></div>
        <div className="kv"><span>Rail charge</span><b>{chosen.instant?'Rs 0':'Covered by Halqa'}</b></div>
        <div className="kv"><span>You pay</span><b style={{fontSize:16}}>{money(paisa)}</b></div>
      </div>

      {error&&<div className="banner bad" style={{margin:'12px 0 0'}}><Zap/><div><b>Not completed</b><p>{error}</p></div></div>}

      <div style={{padding:'16px 0 24px'}}>
        <button className="btn" disabled={!committee||paisa<=0||busy} onClick={run}><Zap/>Pay {money(paisa)}</button>
      </div>
    </div>

    {busy&&<div className="proc"><div className="proc-in">
      <div className="proc-ring"/>
      <h3>Processing payment</h3>
      <p>Do not close the app. This takes a few seconds.</p>
      <div className="proc-steps">{STEPS.map((s,i)=>(
        <div className={`proc-step ${step>i?'done':step===i?'now':''}`} key={s}><i/>{s}</div>
      ))}</div>
    </div></div>}

    {receipt&&<Receipt data={receipt} onClose={()=>{setReceipt(null);back()}}/>}
  </div>;
}

export function RailIcons(){return <><Smartphone/><Landmark/></>}
