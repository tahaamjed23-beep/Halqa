import type { Page } from '../types';
import AccountMenu from '../components/AccountMenu';
import { useCallback, useEffect, useState } from 'react';
import { CreditCard, Landmark, PiggyBank, RotateCcw } from 'lucide-react';
import { api, key, money } from '../api';
import { emitHalqaAction } from '../lib/events';
import type { Partner, User } from '../types';
import { Field, ScoreRing } from '../components/ui';
import { SHOW_BANK_RAIL, SIMPLE_MODE } from '../config';
import { LinkedAccountsManager } from '../components/LinkedAccounts';
import MemberStatus from '../components/MemberStatus';

type BankKycResult={kycLevel:number;kycStatus:string;bankVerifiedAt:string;bankVerifyRef:string;partner:string;sandbox?:boolean};

function BankKycPanel({user}:{user:User}){
  const [partner,setPartner]=useState<Partner|null>(null);const [cnic,setCnic]=useState('');const [iban,setIban]=useState('');const [result,setResult]=useState<BankKycResult|null>(null);const [busy,setBusy]=useState(false);const [error,setError]=useState('');
  useEffect(()=>{void api<{partner:Partner|null}>('/partner').then(data=>setPartner(data.partner)).catch(()=>setPartner(null))},[]);
  const verified=result||(user.kycLevel>=2?{kycLevel:user.kycLevel,kycStatus:user.kycStatus,bankVerifiedAt:user.bankVerifiedAt||'',bankVerifyRef:user.bankVerifyRef||'',partner:partner?.name||'Partner bank'}:null);
  const submit=async()=>{setBusy(true);setError('');try{setResult(await api<BankKycResult>('/partner/kyc',{method:'POST',body:JSON.stringify({cnic:cnic.replace(/\D/g,''),iban:iban.replace(/\s+/g,'')})}))}catch(reason){setError((reason as Error).message)}finally{setBusy(false)}};
  if(!partner)return null;
  return <section className="panel"><div className="panel-head"><div><span className="eyebrow">Partner rail{partner.sandbox?' · sandbox':''}</span><h2>Bank verification</h2><p>{partner.name} confirms your CNIC and account ownership. Level 2 unlocks hosting and bank-custody circles.</p></div><Landmark/></div>
  {verified?<div className="info-stack"><div><span>Status</span><b>Level {verified.kycLevel} · {verified.kycStatus}</b></div><div><span>Verified by</span><b>{verified.partner}{partner.sandbox?' (sandbox)':''}</b></div>{verified.bankVerifyRef&&<div><span>Reference</span><b>{verified.bankVerifyRef}</b></div>}</div>
  :<><div className="form-grid"><Field label="CNIC (13 digits, no dashes)"><input className="field" inputMode="numeric" maxLength={13} value={cnic} onChange={e=>setCnic(e.target.value.replace(/\D/g,''))} placeholder="3520212345671"/></Field><Field label="IBAN" hint="Your own PK account; checked with the standard checksum."><input className="field" value={iban} onChange={e=>setIban(e.target.value.toUpperCase())} placeholder="PK36SONE0000123456789012"/></Field></div>
  {error&&<div className="error-box">{error}</div>}
  <button className="primary" disabled={busy||cnic.length!==13||iban.replace(/\s+/g,'').length<24} onClick={submit}>{busy?'Verifying…':`Verify with ${partner.name}`}</button></>}
  </section>;
}


type VaultInfo={enabled:boolean;tier:string;tiers:string[];autoCover:boolean;balancePaisa:string;accruedProfitPaisa:string;ratePct:number;scheme:{name:string;shariahCompliant:boolean;rateAsOf:string}|null};
const VAULT_TIER_LABEL:Record<string,string>={STANDARD:'Standard',INCOME:'Income'};
const VAULT_TIER_BLURB:Record<string,string>={STANDARD:'Lowest ups and downs',INCOME:'Aims a little higher'};

export function VaultPanel(){
  const [vault,setVault]=useState<VaultInfo|null>(null);const [busy,setBusy]=useState(false);const [error,setError]=useState('');const [swept,setSwept]=useState<{principalPaisa:string;profitPaisa:string}|null>(null);const [topup,setTopup]=useState(5000);const load=useCallback(()=>api<VaultInfo>('/vault').then(setVault).catch(()=>setVault(null)),[]);
  useEffect(()=>{void load()},[load]);
  const setTier=async(tier:string)=>{
    setBusy(true);setError('');try{await api('/vault/tier',{method:'POST',body:JSON.stringify({tier})});await load()}catch(reason){setError((reason as Error).message)}finally{setBusy(false)}};
  const toggleAutoCover=async()=>{if(!vault)return;setBusy(true);setError('');try{await api('/vault/auto-cover',{method:'POST',body:JSON.stringify({enabled:!vault.autoCover})});await load()}catch(reason){setError((reason as Error).message)}finally{setBusy(false)}};
  const toggle=async()=>{if(!vault)return;setBusy(true);setError('');try{await api('/vault/toggle',{method:'POST',body:JSON.stringify({enabled:!vault.enabled})});await load()}catch(reason){setError((reason as Error).message)}finally{setBusy(false)}};
  const withdraw=async()=>{setBusy(true);setError('');try{setSwept(await api<{principalPaisa:string;profitPaisa:string}>('/vault/withdraw',{method:'POST',body:JSON.stringify({idempotencyKey:key()})}));emitHalqaAction('VAULT_SWEEP');await load()}catch(reason){setError((reason as Error).message)}finally{setBusy(false)}};
  const deposit=async()=>{setBusy(true);setError('');try{await api('/vault/deposit',{method:'POST',body:JSON.stringify({amountPaisa:String(Math.round(topup*100)),idempotencyKey:key()})});emitHalqaAction('VAULT_DEPOSIT');await load()}catch(reason){setError((reason as Error).message)}finally{setBusy(false)}};
  if(!vault)return null;
  return <section className="panel"><div className="panel-head"><div><span className="eyebrow">Vault · halal savings pocket</span><h2>Savings pocket</h2><p>Committee payouts can park here, and you can top up any amount yourself, everything accrues on {vault.scheme?.name||'the Islamic money-market sleeve'} ({vault.ratePct.toFixed(1)}% indicative{vault.scheme&&!vault.scheme.shariahCompliant?'':', Mudarabah'}) until you sweep it out. Principal is yours at any time.</p></div><PiggyBank/></div>
  <div className="info-stack"><div><span>Parking</span><b>{vault.enabled?'On':'Off, payouts release directly'}</b></div><div><span>Vault balance</span><b>{money(vault.balancePaisa)}</b></div><div><span>Profit so far</span><b>{money(vault.accruedProfitPaisa)}</b></div></div>
  <div className="vault-tiers">{vault.tiers.map(t=><button key={t} type="button" className={`vault-tier ${vault.tier===t?'on':''}`} disabled={busy} onClick={()=>setTier(t)}><b>{VAULT_TIER_LABEL[t]||t} <i className="rafa-halal">halal</i></b><small>{VAULT_TIER_BLURB[t]||''}</small></button>)}</div>
    <div className="policy-toggles compact"><label><input type="checkbox" checked={vault.autoCover} disabled={busy} onChange={toggleAutoCover}/><span><b>Cover a missed installment</b><small>A missed installment is paid from here, so it never becomes a default.</small></span></label></div>
  <div className="form-grid"><Field label="Top up the vault (PKR)" hint="From Rs 100."><input className="field" type="number" min="100" step="100" value={topup} onChange={e=>setTopup(Math.max(100,+e.target.value))}/></Field><div className="form-actions" style={{alignItems:'end'}}><button className="primary" disabled={busy||topup<100} onClick={deposit}>Add money</button></div></div>
  {swept&&<div className="warning-box">Swept {money(swept.principalPaisa)} principal + {money(swept.profitPaisa)} recorded profit to your external account.</div>}
  {error&&<div className="error-box">{error}</div>}
  <div className="form-actions"><button className="secondary" disabled={busy} onClick={toggle}>{vault.enabled?'Stop parking payouts':'Turn parking on'}</button><button className="primary" disabled={busy||vault.balancePaisa==='0'} onClick={withdraw}>Take my money out</button></div>
  </section>;
}

// The change-password form moved to Settings → Sign in & security (2026-07-21),
// with the broken current-password length gate fixed there.

// Auto-pay lives on the profile (not buried inside each committee): one list,
// every active circle, one switch each. The mandate itself is per-circle.
type AutoCircle={id:string;name:string;status:string;members?:{userId:string;autoDebitEnabled?:boolean;autoDebitRail?:string|null}[]};
function AutoPayPanel({user}:{user:User}){
  const [circles,setCircles]=useState<AutoCircle[]>([]);
  const load=useCallback(()=>api<AutoCircle[]>('/committees').then(rows=>setCircles(rows.filter(row=>row.status==='ACTIVE'||row.status==='FORMING'))),[]);
  useEffect(()=>{void load()},[load]);
  const mine=(c:AutoCircle)=>c.members?.find(m=>m.userId===user.id);
  const joined=circles.filter(c=>mine(c));
  if(!joined.length)return <section className="panel"><div className="panel-head"><div><span className="eyebrow">Never miss a round</span><h2>Auto-collection</h2><p>Every circle you join collects automatically on the due date, always on, never removable. If you pay early yourself, there's simply nothing left to collect. Halqa schedules it, never holds it.</p></div><CreditCard/></div><LinkedAccountsManager/></section>;
  return <section className="panel"><div className="panel-head"><div><span className="eyebrow">Never miss a round</span><h2>Auto-collection</h2><p>Every committee collects automatically. Pay early yourself and there is nothing left to take.</p></div><CreditCard/></div>
  <div className="info-stack">{joined.map(c=>{const m=mine(c)!;return <div key={c.id}><span>{c.name}</span><b>🔒 Auto-collect ON · {m.autoDebitRail||'RAAST'}</b></div>})}</div>
  <LinkedAccountsManager/></section>;
}

type PaymentRow={id:string;amountPaisa:string;status:string;round:{roundNumber:number;committee:{name:string}}};
type Recovery={id:string;outstandingPaisa:string;penaltyPaisa:string;status:string;openedAt:string;committee:{id:string;name:string};round:{roundNumber:number}};

export default function ProfilePage({user,openCredit,go}:{user:User;openCredit?:()=>void;go?:(page:Page)=>void}){
  const [payments,setPayments]=useState<PaymentRow[]>([]);const [recoveries,setRecoveries]=useState<Recovery[]>([]);const [refs,setRefs]=useState<Record<string,string>>({});const [error,setError]=useState('');const [busy,setBusy]=useState('');
  const load=useCallback(()=>Promise.all([api<PaymentRow[]>('/payments/mine'),api<Recovery[]>('/protection/recovery/mine')]).then(([rows,cases])=>{setPayments(rows);setRecoveries(cases)}),[]);
  useEffect(()=>{void load()},[load]);
  const resolve=async(id:string)=>{setBusy(id);setError('');try{await api(`/protection/recovery/${id}/resolve`,{method:'POST',body:JSON.stringify({txnRef:refs[id],idempotencyKey:key()})});await load()}catch(reason){setError((reason as Error).message)}finally{setBusy('')}};
  const openRecoveries=recoveries.filter(item=>item.status==='OPEN');
  return <div className="page narrow enter"><section className="profile-hero"><div className="profile-avatar">{user.fullName[0]}</div><div><span className="eyebrow">Member profile</span><h1>{user.fullName}</h1><p>@{user.username} · {user.phone}</p>{openCredit&&<button className="secondary" style={{marginTop:8,padding:'8px 14px',borderRadius:12,fontSize:12,fontWeight:700}} onClick={openCredit}>View full credit report →</button>}</div><ScoreRing score={user.creditScore}/></section>{go&&<AccountMenu go={go}/>}{openRecoveries.length>0&&<section className="recovery-panel"><div><RotateCcw/><span className="eyebrow">Account recovery</span><h2>{openRecoveries.length} unresolved default case{openRecoveries.length>1?'s':''}</h2><p>Record the outstanding amount, fixed penalties, and 10% rehabilitation fee. Once every case is cleared, access is restored with a six-month low-risk cooldown.</p></div>{openRecoveries.map(item=><article key={item.id}><div><b>{item.committee.name} · round {item.round.roundNumber}</b><span>Outstanding {money(item.outstandingPaisa)} · penalties {money(item.penaltyPaisa)}</span></div><input className="field" value={refs[item.id]||''} onChange={event=>setRefs({...refs,[item.id]:event.target.value})} placeholder="External recovery transfer reference"/><button className="primary" disabled={busy===item.id||(refs[item.id]?.trim().length||0)<4} onClick={()=>resolve(item.id)}>Record recovery</button></article>)}{error&&<div className="error-box">{error}</div>}</section>}{!SIMPLE_MODE&&<VaultPanel/>}<MemberStatus user={user}/>{SHOW_BANK_RAIL&&<BankKycPanel user={user}/>}<AutoPayPanel user={user}/><section className="panel payment-history"><div className="panel-head"><div><span className="eyebrow">Ledger history</span><h2>Recorded installments</h2></div><CreditCard/></div><div className="table-wrap"><table><thead><tr><th>Committee</th><th>Round</th><th>Amount</th><th>Status</th></tr></thead><tbody>{payments.map(payment=><tr key={payment.id}><td>{payment.round.committee.name}</td><td>{payment.round.roundNumber}</td><td>{money(payment.amountPaisa)}</td><td><span className={`status status-${payment.status.toLowerCase()}`}>{payment.status}</span></td></tr>)}</tbody></table></div></section></div>;
}
