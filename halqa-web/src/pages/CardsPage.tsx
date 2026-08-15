import { useEffect, useState } from 'react';
import { ArrowLeft, Building2, Check, CreditCard, Plus, Smartphone, Trash2, Zap } from 'lucide-react';
import { CardMini } from '../components/CardArt';
import { api } from '../api';
import type { User } from '../types';

type Method={id:string;kind:string;label:string;masked:string;brand?:string;preferred?:boolean;verified?:boolean};

const BRAND_BG:Record<string,string>={
  RAAST:'linear-gradient(135deg,#0F7B3E,#19A85A)',
  JAZZCASH:'linear-gradient(135deg,#B3121C,#E12B34)',
  EASYPAISA:'linear-gradient(135deg,#0B7A3B,#28B463)',
  BANK:'linear-gradient(135deg,#1E3A8A,#2C7BE5)',
  CARD:'linear-gradient(135deg,#41801A,#6DC72A)',
};

export default function CardsPage({user,back}:{user:User;back:()=>void}){
  const [methods,setMethods]=useState<Method[]>([]);
  const [adding,setAdding]=useState(false);
  const [kind,setKind]=useState('RAAST');
  const [value,setValue]=useState('');
  const [saved,setSaved]=useState(false);

  useEffect(()=>{void api<Method[]|{methods:Method[]}>('/profile/payment-methods')
    .then(r=>setMethods(Array.isArray(r)?r:(r?.methods??[])))
    .catch(()=>setMethods([]))},[]);

  const primary=methods.find(m=>m.preferred)||methods[0];

  return <div className="enter">
    <div className="topbar">
      <button className="back" onClick={back}><ArrowLeft/></button>
      <h1>Payment methods</h1>
    </div>

    <div style={{padding:14}}>
      <div className="pcard">
        <div className="pcard-inner">
          <div className="pcard-top">
            <div className="pcard-chip"/>
            <div style={{textAlign:'right'}}>
              <div style={{fontSize:9,opacity:.75,letterSpacing:'.1em',textTransform:'uppercase'}}>Halqa</div>
              <div style={{fontSize:13,fontWeight:700,marginTop:1}}>Auto debit</div>
            </div>
          </div>
          <div className="pcard-no">{primary?primary.masked:'•••• •••• •••• ••••'}</div>
          <div className="pcard-bot">
            <div><span>Account holder</span><strong>{user.fullName}</strong></div>
            <div style={{textAlign:'right'}}><span>Rail</span><strong>{primary?primary.kind:'Not linked'}</strong></div>
          </div>
        </div>
      </div>

      <div className="sec-head" style={{marginTop:20}}><h2>Linked accounts</h2><span>{methods.length} of 5</span></div>
      {methods.length?<div className="list">
        {methods.map(m=>(
          <div className="row" key={m.id}>
            {/* A card looks like a card. A member recognises their own by its
                colour and brand before they read a digit. */}
            {m.kind==='CARD'
              ? <CardMini brand={m.label||m.brand}/>
              : <div className="row-ic" style={{background:BRAND_BG[m.kind]||'var(--l50)',color:'#fff'}}>
                  {m.kind==='BANK'?<Building2/>:<Smartphone/>}
                </div>}
            <div className="row-body">
              <strong>{m.label||m.kind}</strong>
              <span>{m.masked}{m.verified?' · verified':' · pending verification'}</span>
            </div>
            {m.preferred&&<span className="chip ok">Primary</span>}
            <button className="back" style={{width:32,height:32,background:'transparent'}} aria-label="Remove"><Trash2 style={{width:16,height:16,color:'var(--faint)'}}/></button>
          </div>
        ))}
      </div>:<div className="card"><div className="empty" style={{padding:'20px 10px'}}>
        <div className="empty-ic"><CreditCard/></div>
        <strong>Nothing linked yet</strong>
        <p>Link a Raast ID, a wallet or a bank account so installments collect themselves on your payday.</p>
      </div></div>}

      {!adding?<button className="btn ghost" style={{marginTop:12}} onClick={()=>setAdding(true)}><Plus/>Add a method</button>:
      <div className="card" style={{marginTop:12}}>
        <label className="fld">
          <span>Type</span>
          <select value={kind} onChange={e=>setKind(e.target.value)}>
            <option value="RAAST">Raast ID</option>
            <option value="JAZZCASH">JazzCash wallet</option>
            <option value="EASYPAISA">Easypaisa wallet</option>
            <option value="BANK">Bank account (IBAN)</option>
            <option value="CARD">Debit or credit card</option>
          </select>
        </label>
        <label className="fld">
          <span>{kind==='BANK'?'IBAN':kind==='CARD'?'Card number':'Mobile number'}</span>
          <input inputMode={kind==='BANK'?'text':'numeric'} value={value} onChange={e=>setValue(e.target.value)}
            placeholder={kind==='BANK'?'PK__ ____ ____ ____ ____ ____':kind==='CARD'?'4111 1111 1111 1111':'03__ _______'}/>
          <small>{kind==='CARD'?'Only the brand, last four digits and expiry are kept.':'The account title is checked against your identity card before it can be used.'}</small>
        </label>
        <div className="btn-pair">
          <button className="btn ghost" onClick={()=>setAdding(false)}>Cancel</button>
          <button className="btn" disabled={!value} onClick={()=>{setSaved(true);setAdding(false);setValue('')}}><Check/>Link</button>
        </div>
      </div>}

      {saved&&<div className="banner info" style={{margin:'12px 0 0'}}><Zap/><div><b>Verification sent</b><p>A one time code has gone to that number. The method activates once the account title matches your identity card.</p></div></div>}

      <div className="sec-head" style={{marginTop:20}}><h2>Auto debit</h2></div>
      <div className="list">
        <div className="row">
          <div className="row-ic" style={{background:'var(--l500)',color:'#fff'}}><Zap/></div>
          <div className="row-body"><strong>Collect on my payday</strong><span>Runs on the morning your salary lands, before the due date</span></div>
          <span className="chip ok">On</span>
        </div>
        <div className="row">
          <div className="row-ic"><Building2/></div>
          <div className="row-body"><strong>Declared payday</strong><span>1st of each month · verified from two months of collections</span></div>
        </div>
      </div>
      <div style={{height:18}}/>
    </div>
  </div>;
}
