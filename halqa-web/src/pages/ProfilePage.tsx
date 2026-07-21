import { useCallback, useEffect, useState } from 'react';
import { BadgeCheck, Copy, CreditCard, Fingerprint, Landmark, PiggyBank, RotateCcw, ShieldCheck } from 'lucide-react';
import { API_ORIGIN, api, key, money } from '../api';
import { emitHalqaAction } from '../lib/events';
import type { Partner, User } from '../types';
import { Field, ScoreRing } from '../components/ui';
import { SHOW_BANK_RAIL, SHOW_HOST_ELIGIBILITY, SIMPLE_MODE } from '../config';

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

type Passport={token:string;passport:{cleanCompletions:number;onTimePct:number|null;paymentsResolved:number;totalRecordedPaisa:string;generatedAt:string;expiresAt:string}};

function PassportPanel(){
  const [issued,setIssued]=useState<Passport|null>(null);const [busy,setBusy]=useState(false);const [copied,setCopied]=useState(false);const [error,setError]=useState('');
  const generate=async()=>{setBusy(true);setError('');try{setIssued(await api<Passport>('/profile/passport',{method:'POST'}))}catch(reason){setError((reason as Error).message)}finally{setBusy(false)}};
  const verifyUrl=issued?`${API_ORIGIN}/api/verify/${issued.token}`:'';
  const copy=async()=>{await navigator.clipboard.writeText(verifyUrl);setCopied(true);setTimeout(()=>setCopied(false),1500)};
  return <section className="panel"><div className="panel-head"><div><span className="eyebrow">Portable trust</span><h2>Credit Passport</h2><p>A signed export of your verified committee history. Share the link with a landlord, employer or lender — they can confirm it without a Halqa account. Valid 90 days.</p></div><BadgeCheck/></div>
  {issued?<div className="passport-box"><div className="passport-meta"><span>Clean completions: <b>{issued.passport.cleanCompletions}</b></span><span>On-time: <b>{issued.passport.onTimePct===null?'No history':`${issued.passport.onTimePct}%`}</b></span><span>Total recorded: <b>{money(issued.passport.totalRecordedPaisa)}</b></span><span>Expires: <b>{new Date(issued.passport.expiresAt).toLocaleDateString()}</b></span></div><textarea readOnly value={verifyUrl}/><div className="form-actions"><button className="secondary" onClick={copy}><Copy/>{copied?'Copied':'Copy verification link'}</button><button className="primary" disabled={busy} onClick={generate}>Regenerate</button></div></div>
  :<button className="primary" disabled={busy} onClick={generate}>{busy?'Signing…':'Generate my passport'}</button>}
  {error&&<div className="error-box">{error}</div>}</section>;
}

type VaultInfo={enabled:boolean;tier:string;tiers:string[];autoCover:boolean;balancePaisa:string;accruedProfitPaisa:string;ratePct:number;scheme:{name:string;shariahCompliant:boolean;rateAsOf:string}|null};
const VAULT_TIER_LABEL:Record<string,string>={STANDARD:'Standard',INCOME:'Income',GOLD:'Gold-linked',CRYPTO:'Crypto'};
const VAULT_TIER_BLURB:Record<string,string>={STANDARD:'Money-market · lowest volatility',INCOME:'Islamic income fund · higher yield',GOLD:'Gold-linked · halal inflation hedge',CRYPTO:'High risk · NOT government-backed'};

export function VaultPanel(){
  const [vault,setVault]=useState<VaultInfo|null>(null);const [busy,setBusy]=useState(false);const [error,setError]=useState('');const [swept,setSwept]=useState<{principalPaisa:string;profitPaisa:string}|null>(null);const [topup,setTopup]=useState(5000);const [cryptoConfirm,setCryptoConfirm]=useState(false);
  const load=useCallback(()=>api<VaultInfo>('/vault').then(setVault).catch(()=>setVault(null)),[]);
  useEffect(()=>{void load()},[load]);
  const setTier=async(tier:string,acknowledged=false)=>{
    if(tier==='CRYPTO'&&!acknowledged){setCryptoConfirm(true);return}
    setBusy(true);setError('');try{await api('/vault/tier',{method:'POST',body:JSON.stringify({tier,...(tier==='CRYPTO'?{acknowledgeExtremeRisk:true}:{})})});await load()}catch(reason){setError((reason as Error).message)}finally{setBusy(false);setCryptoConfirm(false)}};
  const toggleAutoCover=async()=>{if(!vault)return;setBusy(true);setError('');try{await api('/vault/auto-cover',{method:'POST',body:JSON.stringify({enabled:!vault.autoCover})});await load()}catch(reason){setError((reason as Error).message)}finally{setBusy(false)}};
  const toggle=async()=>{if(!vault)return;setBusy(true);setError('');try{await api('/vault/toggle',{method:'POST',body:JSON.stringify({enabled:!vault.enabled})});await load()}catch(reason){setError((reason as Error).message)}finally{setBusy(false)}};
  const withdraw=async()=>{setBusy(true);setError('');try{setSwept(await api<{principalPaisa:string;profitPaisa:string}>('/vault/withdraw',{method:'POST',body:JSON.stringify({idempotencyKey:key()})}));emitHalqaAction('VAULT_SWEEP');await load()}catch(reason){setError((reason as Error).message)}finally{setBusy(false)}};
  const deposit=async()=>{setBusy(true);setError('');try{await api('/vault/deposit',{method:'POST',body:JSON.stringify({amountPaisa:String(Math.round(topup*100)),idempotencyKey:key()})});emitHalqaAction('VAULT_DEPOSIT');await load()}catch(reason){setError((reason as Error).message)}finally{setBusy(false)}};
  if(!vault)return null;
  return <section className="panel"><div className="panel-head"><div><span className="eyebrow">Vault · halal savings pocket</span><h2>Let money keep earning</h2><p>Committee payouts can park here, and you can top up any amount yourself — everything accrues on {vault.scheme?.name||'the Islamic money-market sleeve'} ({vault.ratePct.toFixed(1)}% indicative{vault.scheme&&!vault.scheme.shariahCompliant?'':', Mudarabah'}) until you sweep it out. Principal is yours at any time.</p></div><PiggyBank/></div>
  <div className="info-stack"><div><span>Parking</span><b>{vault.enabled?'On — new payouts park here':'Off — payouts release directly'}</b></div><div><span>Vault balance</span><b>{money(vault.balancePaisa)}</b></div><div><span>Accrued profit (indicative)</span><b>{money(vault.accruedProfitPaisa)}</b></div></div>
  <div className="vault-tiers">{vault.tiers.map(t=><button key={t} type="button" className={`vault-tier ${vault.tier===t?'on':''} ${t==='CRYPTO'?'crypto':''}`} disabled={busy} onClick={()=>setTier(t)}><b>{VAULT_TIER_LABEL[t]||t} {t==='CRYPTO'?<i className="rafa-conv">high risk · not Shariah</i>:<i className="rafa-halal">halal</i>}</b><small>{VAULT_TIER_BLURB[t]||''}</small></button>)}</div>
  {cryptoConfirm&&<div className="modal-backdrop" role="dialog" aria-label="Crypto tier confirmation"><section className="modal"><div className="modal-head"><h2>⚠ Switch vault to crypto?</h2></div><div className="crypto-warn big">Cryptocurrency is <b>not government-backed</b>, <b>not Shariah-compliant</b>, and <b>highly volatile</b> — your vault's indicative value could fall by half or more, fast. The rate shown is speculative, not a promise. Committees never touch crypto; this affects only your personal vault.</div><p className="muted" style={{fontSize:12}}>Only continue if you can afford to lose most of this money.</p><div className="form-actions"><button className="secondary" onClick={()=>setCryptoConfirm(false)}>No, keep me safe</button><button className="danger-button" onClick={()=>setTier('CRYPTO',true)}>I accept the risk — switch</button></div></section></div>}
  <div className="policy-toggles compact"><label><input type="checkbox" checked={vault.autoCover} disabled={busy} onChange={toggleAutoCover}/><span><b>Auto-cover missed installments (safety net)</b><small>If an installment slips past its deadline and your vault holds enough, it's paid from your vault automatically — the small late adjustment still applies, but it never escalates toward default.</small></span></label></div>
  <div className="form-grid"><Field label="Top up the vault (PKR)" hint="From Rs 100. Recorded to your vault and accruing from today."><input className="field" type="number" min="100" step="100" value={topup} onChange={e=>setTopup(Math.max(100,+e.target.value))}/></Field><div className="form-actions" style={{alignItems:'end'}}><button className="primary" disabled={busy||topup<100} onClick={deposit}>Record top-up</button></div></div>
  {swept&&<div className="warning-box">Swept {money(swept.principalPaisa)} principal + {money(swept.profitPaisa)} recorded profit to your external account.</div>}
  {error&&<div className="error-box">{error}</div>}
  <div className="form-actions"><button className="secondary" disabled={busy} onClick={toggle}>{vault.enabled?'Turn parking off':'Turn parking on'}</button><button className="primary" disabled={busy||vault.balancePaisa==='0'} onClick={withdraw}>Sweep vault to my account</button></div>
  </section>;
}

// The change-password form moved to Settings → Sign in & security (2026-07-21),
// with the broken current-password length gate fixed there.

type CreditEvent={id:string;reason:string;scoredAt:string;delta:number};
type PaymentRow={id:string;amountPaisa:string;status:string;round:{roundNumber:number;committee:{name:string}}};
type Recovery={id:string;outstandingPaisa:string;penaltyPaisa:string;status:string;openedAt:string;committee:{id:string;name:string};round:{roundNumber:number}};

export default function ProfilePage({user,openCredit}:{user:User;openCredit?:()=>void}){
  const [credit,setCredit]=useState<CreditEvent[]>([]);const [payments,setPayments]=useState<PaymentRow[]>([]);const [recoveries,setRecoveries]=useState<Recovery[]>([]);const [refs,setRefs]=useState<Record<string,string>>({});const [error,setError]=useState('');const [busy,setBusy]=useState('');
  const load=useCallback(()=>Promise.all([api<CreditEvent[]>('/profile/credit'),api<PaymentRow[]>('/payments/mine'),api<Recovery[]>('/protection/recovery/mine')]).then(([events,rows,cases])=>{setCredit(events);setPayments(rows);setRecoveries(cases)}),[]);
  useEffect(()=>{void load()},[load]);
  const resolve=async(id:string)=>{setBusy(id);setError('');try{await api(`/protection/recovery/${id}/resolve`,{method:'POST',body:JSON.stringify({txnRef:refs[id],idempotencyKey:key()})});await load()}catch(reason){setError((reason as Error).message)}finally{setBusy('')}};
  const openRecoveries=recoveries.filter(item=>item.status==='OPEN');
  return <div className="page narrow enter"><section className="profile-hero"><div className="profile-avatar">{user.fullName[0]}</div><div><span className="eyebrow">Member profile</span><h1>{user.fullName}</h1><p>@{user.username} · {user.phone}</p>{openCredit&&<button className="secondary" style={{marginTop:8,padding:'8px 14px',borderRadius:12,fontSize:12,fontWeight:700}} onClick={openCredit}>View full credit report →</button>}</div><ScoreRing score={user.creditScore}/></section>{openRecoveries.length>0&&<section className="recovery-panel"><div><RotateCcw/><span className="eyebrow">Account recovery</span><h2>{openRecoveries.length} unresolved default case{openRecoveries.length>1?'s':''}</h2><p>Record the outstanding amount, fixed penalties, and 10% rehabilitation fee. Once every case is cleared, access is restored with a six-month low-risk cooldown.</p></div>{openRecoveries.map(item=><article key={item.id}><div><b>{item.committee.name} · round {item.round.roundNumber}</b><span>Outstanding {money(item.outstandingPaisa)} · penalties {money(item.penaltyPaisa)}</span></div><input className="field" value={refs[item.id]||''} onChange={event=>setRefs({...refs,[item.id]:event.target.value})} placeholder="External recovery transfer reference"/><button className="primary" disabled={busy===item.id||(refs[item.id]?.trim().length||0)<4} onClick={()=>resolve(item.id)}>Record recovery</button></article>)}{error&&<div className="error-box">{error}</div>}</section>}<div className="profile-grid"><section className="panel"><div className="panel-head"><div><span className="eyebrow">Identity</span><h2>Account assurance</h2></div><Fingerprint/></div><div className="info-stack"><div><span>Email</span><b>{user.email}</b></div><div><span>KYC level</span><b>Level {user.kycLevel}</b></div><div><span>Status</span><b>{user.kycStatus}</b></div>{SHOW_HOST_ELIGIBILITY&&<div><span>Hosting</span><b>{user.creditScore>=700?'Eligible':'Score 700 required'}</b></div>}</div></section><section className="panel"><div className="panel-head"><div><span className="eyebrow">Reliability</span><h2>Credit events</h2></div><ShieldCheck/></div><div className="history-list">{credit.slice(0,7).map(event=><article key={event.id}><div><b>{event.reason}</b><span>{new Date(event.scoredAt).toLocaleDateString()}</span></div><strong className={event.delta>=0?'profit':'loss'}>{event.delta>0?'+':''}{event.delta}</strong></article>)}{!credit.length&&<p className="muted">No score events yet.</p>}</div></section></div>{!SIMPLE_MODE&&<VaultPanel/>}{SHOW_BANK_RAIL&&<BankKycPanel user={user}/>}<PassportPanel/><section className="panel payment-history"><div className="panel-head"><div><span className="eyebrow">Ledger history</span><h2>Recorded installments</h2></div><CreditCard/></div><div className="table-wrap"><table><thead><tr><th>Committee</th><th>Round</th><th>Amount</th><th>Status</th></tr></thead><tbody>{payments.map(payment=><tr key={payment.id}><td>{payment.round.committee.name}</td><td>{payment.round.roundNumber}</td><td>{money(payment.amountPaisa)}</td><td><span className={`status status-${payment.status.toLowerCase()}`}>{payment.status}</span></td></tr>)}</tbody></table></div></section></div>;
}
