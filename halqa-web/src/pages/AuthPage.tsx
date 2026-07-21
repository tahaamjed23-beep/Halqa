import { useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import { api, tokens } from '../api';
import type { User } from '../types';
import { HalqaOrb, Logo } from '../components/ui';
import PhoneInput from '../components/PhoneInput';
import LegalFooter, { LegalDocModal } from '../components/LegalFooter';
import { AccountCard, PK_BANKS, RAIL_META, formatEntry } from '../components/LinkedAccounts';
import { TERMS_VERSION, type DocId } from '../legal/content';

// Onboarding is one question per screen (the pattern every Pakistani wallet
// app has trained users on): phone → name → email → CNIC → account → password
// → review. Each step validates before Continue unlocks, and the whole thing
// submits as a single register call at the end. The ACCOUNT step is mandatory:
// auto-collection is how every circle collects, so the account it pulls from
// is linked the moment the account is made (changeable later in Profile).
const REG_STEPS = ['phone', 'name', 'email', 'cnic', 'account', 'password', 'review'] as const;
type RegStep = typeof REG_STEPS[number];

export default function AuthPage({onAuth}:{onAuth:(user:User)=>void}){
  const [mode,setMode]=useState<'login'|'register'>('login');
  const [step,setStep]=useState<RegStep>('phone');
  const [form,setForm]=useState({identity:'',password:'',fullName:'',username:'',phone:'',email:'',cnic:'',regPassword:'',rail:'RAAST',accountNo:'',accountTitle:'',bankName:'HBL'});
  const [agreed,setAgreed]=useState(false);
  const [doc,setDoc]=useState<DocId|null>(null);
  const [error,setError]=useState('');const [busy,setBusy]=useState(false);
  const stepIndex=REG_STEPS.indexOf(step);
  // International: +92 wants a 3XXXXXXXXX national part (10 digits); other
  // dial codes just need a plausible 7–14 digit number.
  const phoneOk=form.phone.startsWith('+92')?/^\+923\d{9}$/.test(form.phone):/^\+\d{8,15}$/.test(form.phone);
  const nameOk=form.fullName.trim().length>=3&&form.username.trim().length>=3;
  const emailOk=/.+@.+\..+/.test(form.email);
  const cnicOk=form.cnic.length===13;
  const passOk=form.regPassword.length>=8&&/[a-zA-Z]/.test(form.regPassword)&&/\d/.test(form.regPassword);
  const accountOk=form.accountNo.replace(/\s+/g,'').length>=10&&form.accountTitle.trim().length>=3;
  const canContinue=step==='phone'?phoneOk:step==='name'?nameOk:step==='email'?emailOk:step==='cnic'?cnicOk:step==='account'?accountOk:step==='password'?passOk:agreed;
  const next=()=>{setError('');if(stepIndex<REG_STEPS.length-1)setStep(REG_STEPS[stepIndex+1])};
  const back=()=>{setError('');if(stepIndex>0)setStep(REG_STEPS[stepIndex-1]);else setMode('login')};

  const login=async(event:React.FormEvent)=>{event.preventDefault();setBusy(true);setError('');try{const data=await api<{user:User;accessToken:string;refreshToken:string}>('/auth/login',{method:'POST',body:JSON.stringify({identity:form.identity.trim(),password:form.password.trim()})});tokens.set(data.accessToken,data.refreshToken);onAuth(data.user)}catch(reason){setError((reason as Error).message)}finally{setBusy(false)}};
  const register=async()=>{setBusy(true);setError('');try{const data=await api<{user:User;accessToken:string;refreshToken:string}>('/auth/register',{method:'POST',body:JSON.stringify({fullName:form.fullName.trim(),username:form.username.trim(),phone:form.phone.trim(),email:form.email.trim(),cnic:form.cnic,password:form.regPassword,termsVersion:TERMS_VERSION})});tokens.set(data.accessToken,data.refreshToken);
    // The mandatory collection account, linked the moment the account exists.
    // Best-effort: a rail hiccup must never strand a fresh registration —
    // Profile shows the link (and its WhatsApp OTP) if this needs a retry.
    try{await api('/profile/payment-methods',{method:'POST',body:JSON.stringify({rail:form.rail,accountNo:form.accountNo.replace(/\s+/g,''),accountTitle:form.accountTitle.trim(),bankName:form.rail==='BANK_TRANSFER'?form.bankName:undefined,preferred:true})})}catch{/* retry from Profile */}
    onAuth(data.user)}catch(reason){setError((reason as Error).message)}finally{setBusy(false)}};

  const stepBody=()=>{switch(step){
    case 'phone':return <><h2>What's your mobile number?</h2><p>Your number is your identity on Halqa — invites, reminders and payments all reach you here.</p>
      <PhoneInput value={form.phone} onChange={v=>setForm({...form,phone:v})} autoFocus/></>;
    case 'name':return <><h2>Your name, as on your CNIC</h2><p>Circles run on real names — it's how members know exactly who they're trusting.</p>
      <input className="field big-field" autoFocus autoComplete="name" placeholder="Full name" value={form.fullName} onChange={e=>setForm({...form,fullName:e.target.value})}/>
      <input className="field" placeholder="Pick a username" autoComplete="username" value={form.username} onChange={e=>setForm({...form,username:e.target.value.toLowerCase().replace(/[^a-z0-9_.]/g,'')})}/></>;
    case 'email':return <><h2>Your email address</h2><p>For receipts, records and account recovery. No marketing without your say-so.</p>
      <input className="field big-field" type="email" autoFocus autoComplete="email" placeholder="you@example.com" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></>;
    case 'cnic':return <><h2>Your CNIC number</h2><p>The 13 digits, no dashes. Verified members rank ahead in turn order, and your record becomes real, usable proof of reliability.</p>
      <input className="field big-field mono" inputMode="numeric" autoFocus maxLength={13} placeholder="3520212345671" value={form.cnic} onChange={e=>setForm({...form,cnic:e.target.value.replace(/\D/g,'')})}/>
      <div className="onboard-note"><b>Identity check</b><span>Your CNIC is recorded now and verified against NADRA when live verification activates. It is never shown to other members.</span></div></>;
    case 'account':return <><h2>Link your collection account</h2><p>Every circle collects automatically from this account on each due date — that's how Halqa keeps circles safe. A one-time code confirms the link and you get a WhatsApp receipt for every collection. Change it any time in Profile.</p>
      <div className="rail-grid" style={{marginBottom:12}}>{Object.keys(RAIL_META).map(id=><button type="button" key={id} className={`rail-chip ${form.rail===id?'on':''}`} onClick={()=>setForm({...form,rail:id})}><i className="chip-logo" style={{background:RAIL_META[id].color}}>{RAIL_META[id].mono}</i>{RAIL_META[id].name}</button>)}</div>
      {form.rail==='BANK_TRANSFER'&&<><label className="onboard-field-label">Your bank</label>
        <div className="bank-grid" style={{marginBottom:12}}>{PK_BANKS.map(b=><button type="button" key={b.name} className={`bank-tile ${form.bankName===b.name?'on':''}`} onClick={()=>setForm({...form,bankName:b.name})}><i style={{background:`linear-gradient(135deg, ${b.color}, ${b.dark})`}}>{b.mono}</i><span>{b.name}</span></button>)}</div></>}
      <label className="onboard-field-label">Account holder name</label>
      <input className="field" autoFocus autoComplete="name" placeholder="Exactly as printed on the account" value={form.accountTitle} onChange={e=>setForm({...form,accountTitle:e.target.value})}/>
      <label className="onboard-field-label">{form.rail==='BANK_TRANSFER'?'IBAN':form.rail==='RAAST'?'Raast ID (mobile number)':'Wallet number'}</label>
      <input className="field mono" inputMode={form.rail==='BANK_TRANSFER'?'text':'numeric'} placeholder={form.rail==='BANK_TRANSFER'?'PK36 SONE 0000 1234 5678 9012':'03XX XXXXXXX'} value={form.accountNo} onChange={e=>setForm({...form,accountNo:formatEntry(form.rail,e.target.value)})}/>
      <div style={{margin:'12px 0'}}><AccountCard draft rail={form.rail} bankName={form.rail==='BANK_TRANSFER'?form.bankName:undefined} accountTitle={form.accountTitle} accountNo={form.accountNo}/></div>
      <div className="onboard-note"><b>Unconfigurable by design</b><span>Auto-collection is standard on every circle — no manual payments to remember, no missed installments. Halqa stores the identifier only, never balances or cards.</span></div></>;
    case 'password':return <><h2>Create a password</h2><p>At least 8 characters with letters and numbers.</p>
      <input className="field big-field" type="password" autoFocus autoComplete="new-password" placeholder="Password" value={form.regPassword} onChange={e=>setForm({...form,regPassword:e.target.value})}/>
      <div className={`pass-meter ${passOk?'ok':form.regPassword.length>0?'weak':''}`}><i/><span>{passOk?'Strong enough':form.regPassword.length?'Keep going — letters + numbers, 8 minimum':'—'}</span></div></>;
    case 'review':return <><h2>One look before we start</h2><p>Check your details, accept the terms, and your Halqa opens.</p>
      <div className="review-rows">
        <div><span>Mobile</span><b>{form.phone}</b></div>
        <div><span>Name</span><b>{form.fullName}</b></div>
        <div><span>Username</span><b>@{form.username}</b></div>
        <div><span>Email</span><b>{form.email}</b></div>
        <div><span>CNIC</span><b className="mono">{'•'.repeat(9)}{form.cnic.slice(-4)}</b></div>
        <div><span>Collection account</span><b>{form.accountTitle} · <span className="mono">{form.rail==='BANK_TRANSFER'?form.bankName+' ':''}{'•'.repeat(Math.max(0,form.accountNo.replace(/\s+/g,'').length-4))}{form.accountNo.replace(/\s+/g,'').slice(-4)}</span></b></div>
      </div>
      <label className="tos-check"><input type="checkbox" checked={agreed} onChange={e=>setAgreed(e.target.checked)}/><span>I have read and agree to the <button type="button" className="inline-link" onClick={()=>setDoc('agreement')}>User Agreement</button> and <button type="button" className="inline-link" onClick={()=>setDoc('privacy')}>Privacy Policy</button>, including the <button type="button" className="inline-link" onClick={()=>setDoc('fees')}>Fees & Payments Policy</button>.</span></label></>;
  }};

  return <main className="auth-layout"><section className="auth-story"><Logo/><div className="auth-copy"><HalqaOrb/><span className="eyebrow">Pakistan's transparent savings network</span><h1>Save together.<br/>Grow with clarity.</h1><p>Locked schedules, visible turns, auto-pay, and a payment record that follows you — the committee you trust, finally written down.</p></div></section>
  <section className="auth-form"><div className="auth-card">
    <div className="mobile-logo"><Logo/></div>
    {mode==='login'?<>
      <h2>Welcome back</h2><p>Sign in with your mobile number and password.</p>
      <form onSubmit={login}>
        <PhoneInput value={form.identity} onChange={v=>setForm({...form,identity:v})}/>
        <input className="field" type="password" placeholder="Password" autoComplete="current-password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})}/>
        {error&&<div className="error-box">{error}</div>}
        <button className="primary" disabled={busy||form.identity.length<8||form.password.length<4}>{busy?'Please wait…':'Sign in'}</button>
      </form>
      <button className="text-action" onClick={()=>{setMode('register');setStep('phone');setError('')}}>New to Halqa? Create account</button>
      <div className="demo-note"><b>Demo</b><span>🇵🇰 +92 300 1234567 · halqa123</span></div>
    </>:<>
      <div className="onboard-top">
        <button type="button" className="onboard-back" onClick={back}><ChevronLeft size={18}/></button>
        <div className="onboard-dots">{REG_STEPS.map((s,i)=><i key={s} className={i<=stepIndex?'on':''}/>)}</div>
        <span className="onboard-count">{stepIndex+1}/{REG_STEPS.length}</span>
      </div>
      <div className="onboard-body">{stepBody()}</div>
      {error&&<div className="error-box">{error}</div>}
      {step!=='review'
        ?<button className="primary full" disabled={!canContinue} onClick={next}>Continue</button>
        :<button className="primary full" disabled={!agreed||busy} onClick={register}>{busy?'Opening your Halqa…':'Agree & open my Halqa'}</button>}
    </>}
  </div><LegalFooter/></section>
  {doc&&<LegalDocModal doc={doc} onClose={()=>setDoc(null)}/>}</main>
}
