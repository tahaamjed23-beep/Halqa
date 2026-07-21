import { useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import { api, tokens } from '../api';
import type { User } from '../types';
import { HalqaOrb, Logo } from '../components/ui';
import LegalFooter, { LegalDocModal } from '../components/LegalFooter';
import { TERMS_VERSION, type DocId } from '../legal/content';

// Onboarding is one question per screen (the pattern every Pakistani wallet
// app has trained users on): phone → name → email → CNIC → password → review.
// Each step validates before Continue unlocks, and the whole thing submits as
// a single register call at the end.
const REG_STEPS = ['phone', 'name', 'email', 'cnic', 'password', 'review'] as const;
type RegStep = typeof REG_STEPS[number];

export default function AuthPage({onAuth}:{onAuth:(user:User)=>void}){
  const [mode,setMode]=useState<'login'|'register'>('login');
  const [step,setStep]=useState<RegStep>('phone');
  const [form,setForm]=useState({identity:'sana',password:'halqa123',fullName:'',username:'',phone:'',email:'',cnic:'',regPassword:''});
  const [agreed,setAgreed]=useState(false);
  const [doc,setDoc]=useState<DocId|null>(null);
  const [error,setError]=useState('');const [busy,setBusy]=useState(false);
  const stepIndex=REG_STEPS.indexOf(step);
  const phoneOk=/^03\d{9}$/.test(form.phone.replace(/\D/g,''));
  const nameOk=form.fullName.trim().length>=3&&form.username.trim().length>=3;
  const emailOk=/.+@.+\..+/.test(form.email);
  const cnicOk=form.cnic.length===13;
  const passOk=form.regPassword.length>=8&&/[a-zA-Z]/.test(form.regPassword)&&/\d/.test(form.regPassword);
  const canContinue=step==='phone'?phoneOk:step==='name'?nameOk:step==='email'?emailOk:step==='cnic'?cnicOk:step==='password'?passOk:agreed;
  const next=()=>{setError('');if(stepIndex<REG_STEPS.length-1)setStep(REG_STEPS[stepIndex+1])};
  const back=()=>{setError('');if(stepIndex>0)setStep(REG_STEPS[stepIndex-1]);else setMode('login')};

  const login=async(event:React.FormEvent)=>{event.preventDefault();setBusy(true);setError('');try{const data=await api<{user:User;accessToken:string;refreshToken:string}>('/auth/login',{method:'POST',body:JSON.stringify({identity:form.identity.trim(),password:form.password.trim()})});tokens.set(data.accessToken,data.refreshToken);onAuth(data.user)}catch(reason){setError((reason as Error).message)}finally{setBusy(false)}};
  const register=async()=>{setBusy(true);setError('');try{const data=await api<{user:User;accessToken:string;refreshToken:string}>('/auth/register',{method:'POST',body:JSON.stringify({fullName:form.fullName.trim(),username:form.username.trim(),phone:form.phone.trim(),email:form.email.trim(),cnic:form.cnic,password:form.regPassword,termsVersion:TERMS_VERSION})});tokens.set(data.accessToken,data.refreshToken);onAuth(data.user)}catch(reason){setError((reason as Error).message)}finally{setBusy(false)}};

  const stepBody=()=>{switch(step){
    case 'phone':return <><h2>What's your mobile number?</h2><p>Your number is your identity on Halqa — invites, reminders and payments all reach you here.</p>
      <input className="field big-field" inputMode="tel" autoFocus maxLength={11} placeholder="03XX XXXXXXX" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value.replace(/[^\d]/g,'')})}/></>;
    case 'name':return <><h2>Your name, as on your CNIC</h2><p>Circles run on real names — it's how members know exactly who they're trusting.</p>
      <input className="field big-field" autoFocus autoComplete="name" placeholder="Full name" value={form.fullName} onChange={e=>setForm({...form,fullName:e.target.value})}/>
      <input className="field" placeholder="Pick a username" autoComplete="username" value={form.username} onChange={e=>setForm({...form,username:e.target.value.toLowerCase().replace(/[^a-z0-9_.]/g,'')})}/></>;
    case 'email':return <><h2>Your email address</h2><p>For receipts, records and account recovery. No marketing without your say-so.</p>
      <input className="field big-field" type="email" autoFocus autoComplete="email" placeholder="you@example.com" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></>;
    case 'cnic':return <><h2>Your CNIC number</h2><p>The 13 digits, no dashes. Verified members rank ahead in turn order, and your record becomes real, usable proof of reliability.</p>
      <input className="field big-field mono" inputMode="numeric" autoFocus maxLength={13} placeholder="3520212345671" value={form.cnic} onChange={e=>setForm({...form,cnic:e.target.value.replace(/\D/g,'')})}/>
      <div className="onboard-note"><b>Identity check</b><span>Your CNIC is recorded now and verified against NADRA when live verification activates. It is never shown to other members.</span></div></>;
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
      </div>
      <label className="tos-check"><input type="checkbox" checked={agreed} onChange={e=>setAgreed(e.target.checked)}/><span>I have read and agree to the <button type="button" className="inline-link" onClick={()=>setDoc('agreement')}>User Agreement</button> and <button type="button" className="inline-link" onClick={()=>setDoc('privacy')}>Privacy Policy</button>, including the <button type="button" className="inline-link" onClick={()=>setDoc('fees')}>Fees & Payments Policy</button>.</span></label></>;
  }};

  return <main className="auth-layout"><section className="auth-story"><Logo/><div className="auth-copy"><HalqaOrb/><span className="eyebrow">Pakistan's transparent savings network</span><h1>Save together.<br/>Grow with clarity.</h1><p>Locked schedules, visible turns, auto-pay, and a payment record that follows you — the committee you trust, finally written down.</p></div><small>Stage 1 · Record-only prototype · No money held</small></section>
  <section className="auth-form"><div className="auth-card">
    <div className="mobile-logo"><Logo/></div>
    {mode==='login'?<>
      <h2>Welcome back</h2><p>Sign in using username, phone or email.</p>
      <form onSubmit={login}>
        <input className="field" placeholder="Username, phone or email" value={form.identity} onChange={e=>setForm({...form,identity:e.target.value})}/>
        <input className="field" type="password" placeholder="Password" autoComplete="current-password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})}/>
        {error&&<div className="error-box">{error}</div>}
        <button className="primary" disabled={busy}>{busy?'Please wait…':'Sign in'}</button>
      </form>
      <button className="text-action" onClick={()=>{setMode('register');setStep('phone');setError('')}}>New to Halqa? Create account</button>
      <div className="demo-note"><b>Demo</b><span>sana / halqa123</span></div>
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
