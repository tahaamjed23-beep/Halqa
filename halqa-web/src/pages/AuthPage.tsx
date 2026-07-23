import { useState } from 'react';
import { ChevronLeft, ShieldCheck } from 'lucide-react';
import { api, tokens } from '../api';
import type { User } from '../types';
import { HalqaOrb, Logo } from '../components/ui';
import PhoneInput from '../components/PhoneInput';
import LegalFooter, { LegalDocModal } from '../components/LegalFooter';
import { AccountCard, PK_BANKS, RAIL_META, formatEntry } from '../components/LinkedAccounts';
import CnicCapture from '../components/CnicCapture';
import { TERMS_VERSION, type DocId } from '../legal/content';

// Onboarding is one question per screen (the pattern every Pakistani wallet
// app has trained users on): phone → name → email → CNIC → account → password
// → review. Each step validates before Continue unlocks, and the whole thing
// submits as a single register call at the end. The ACCOUNT step is mandatory:
// auto-collection is how every circle collects, so the account it pulls from
// is linked the moment the account is made (changeable later in Profile).
const REG_STEPS = ['phone', 'otp', 'name', 'profile', 'email', 'cnic', 'account', 'password', 'pin', 'review'] as const;
type RegStep = typeof REG_STEPS[number];
// Occupation drives future risk models + the partner KYC handoff. EMPLOYED asks
// for the employer (salary-deduction collection is the most certain there is).
const OCCUPATIONS: [string, string][] = [['EMPLOYED','Employed (salaried)'],['BUSINESS_OWNER','Business owner'],['SELF_EMPLOYED','Self-employed / freelance'],['HOUSEWIFE','Housewife'],['STUDENT','Student'],['RETIRED','Retired'],['OTHER','Other']];
// A short searchable list of the largest Pakistani cities; free text is allowed
// for anywhere not listed.
const PK_CITIES = ['Karachi','Lahore','Islamabad','Rawalpindi','Faisalabad','Multan','Peshawar','Quetta','Hyderabad','Gujranwala','Sialkot','Bahawalpur','Sargodha','Sukkur','Larkana','Sheikhupura','Mardan','Gujrat','Kasur','Rahim Yar Khan','Sahiwal','Okara','Wah Cantt','Dera Ghazi Khan','Mirpur','Abbottabad','Muzaffarabad','Mingora','Nawabshah','Chiniot'];

export default function AuthPage({onAuth}:{onAuth:(user:User)=>void}){
  const [mode,setMode]=useState<'login'|'register'>('login');
  const [step,setStep]=useState<RegStep>('phone');
  const [form,setForm]=useState({identity:'',password:'',fullName:'',username:'',phone:'',email:'',cnic:'',regPassword:'',rail:'RAAST',accountNo:'',accountTitle:'',bankName:'HBL',otpCode:'',addressLine:'',city:'',occupationType:'',employerName:'',pin:'',pinConfirm:''});
  const [agreed,setAgreed]=useState(false);
  const [cnicCaptured,setCnicCaptured]=useState(false);const [scanning,setScanning]=useState(false);
  const [homeLat,setHomeLat]=useState<number|null>(null);const [homeLng,setHomeLng]=useState<number|null>(null);const [locating,setLocating]=useState(false);const [locErr,setLocErr]=useState('');
  const [otpSent,setOtpSent]=useState(false);const [otpVerified,setOtpVerified]=useState(false);const [devCode,setDevCode]=useState('');
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
  const profileOk=homeLat!=null&&form.addressLine.trim().length>=5&&form.city.trim().length>=2&&!!form.occupationType&&(form.occupationType!=='EMPLOYED'||form.employerName.trim().length>=2);
  const pinOk=/^\d{4,6}$/.test(form.pin)&&form.pin===form.pinConfirm;
  const canContinue=step==='phone'?phoneOk:step==='otp'?otpVerified:step==='name'?nameOk:step==='profile'?profileOk:step==='email'?emailOk:step==='cnic'?cnicOk:step==='account'?accountOk:step==='password'?passOk:step==='pin'?pinOk:agreed;
  const next=()=>{setError('');if(stepIndex<REG_STEPS.length-1)setStep(REG_STEPS[stepIndex+1])};
  const back=()=>{setError('');if(stepIndex>0)setStep(REG_STEPS[stepIndex-1]);else setMode('login')};

  // Phone OTP: request a code when the user reaches the verify step, and confirm
  // it before they can continue. Sandbox surfaces the code inline (devCode).
  const requestOtp=async()=>{setBusy(true);setError('');try{const d=await api<{otpSent:boolean;devCode?:string}>('/auth/phone-otp',{method:'POST',body:JSON.stringify({phone:form.phone.trim()})});setOtpSent(true);setDevCode(d.devCode||'')}catch(reason){setError((reason as Error).message)}finally{setBusy(false)}};
  // Live location: capture the device's real GPS and reverse-geocode it to
  // prefill the address + city. The coordinates are saved as the member's home.
  const captureLocation=()=>{
    setLocating(true);setLocErr('');
    if(!('geolocation' in navigator)){setLocErr('Location isn’t available on this device — type your address instead.');setLocating(false);return}
    navigator.geolocation.getCurrentPosition(async pos=>{
      const lat=pos.coords.latitude,lng=pos.coords.longitude;setHomeLat(lat);setHomeLng(lng);
      try{
        const r=await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&zoom=16`,{headers:{Accept:'application/json'}});
        const j=await r.json();const a=j.address||{};
        const city=a.city||a.town||a.village||a.county||'';
        const line=[a.road,a.suburb,a.neighbourhood,a.residential].filter(Boolean).join(', ')||(j.display_name||'').split(',').slice(0,2).join(', ');
        setForm(f=>({...f,city:city||f.city,addressLine:line||f.addressLine}));
      }catch{/* coordinates alone are enough */}
      setLocating(false);
    },err=>{setLocErr(err.code===1?'Please allow location access — your home location is required.':'Couldn’t get your location. Try again.');setLocating(false)},{enableHighAccuracy:true,timeout:15000});
  };
  const verifyOtp=async()=>{setBusy(true);setError('');try{await api('/auth/phone-otp/verify',{method:'POST',body:JSON.stringify({phone:form.phone.trim(),code:form.otpCode.trim()})});setOtpVerified(true)}catch(reason){setError((reason as Error).message)}finally{setBusy(false)}};
  // Advancing off the phone step fires the OTP so the code is waiting when the
  // verify step paints.
  const goNext=()=>{const cur=step;next();if(cur==='phone'&&!otpSent)void requestOtp()};

  const login=async(event:React.FormEvent)=>{event.preventDefault();setBusy(true);setError('');try{const data=await api<{user:User;accessToken:string;refreshToken:string}>('/auth/login',{method:'POST',body:JSON.stringify({identity:form.identity.trim(),password:form.password.trim()})});tokens.set(data.accessToken,data.refreshToken);onAuth(data.user)}catch(reason){setError((reason as Error).message)}finally{setBusy(false)}};
  const register=async()=>{setBusy(true);setError('');try{const data=await api<{user:User;accessToken:string;refreshToken:string}>('/auth/register',{method:'POST',body:JSON.stringify({fullName:form.fullName.trim(),username:form.username.trim(),phone:form.phone.trim(),email:form.email.trim(),cnic:form.cnic,password:form.regPassword,termsVersion:TERMS_VERSION,addressLine:form.addressLine.trim(),city:form.city.trim(),occupationType:form.occupationType,employerName:form.occupationType==='EMPLOYED'?form.employerName.trim():undefined,pin:form.pin,cnicCaptured,homeLat:homeLat??undefined,homeLng:homeLng??undefined})});tokens.set(data.accessToken,data.refreshToken);
    // The mandatory collection account, linked the moment the account exists.
    // Best-effort: a rail hiccup must never strand a fresh registration —
    // Profile shows the link (and its WhatsApp OTP) if this needs a retry.
    try{await api('/profile/payment-methods',{method:'POST',body:JSON.stringify({rail:form.rail,accountNo:form.accountNo.replace(/\s+/g,''),accountTitle:form.accountTitle.trim(),bankName:form.rail==='BANK_TRANSFER'?form.bankName:undefined,preferred:true})})}catch{/* retry from Profile */}
    onAuth(data.user)}catch(reason){setError((reason as Error).message)}finally{setBusy(false)}};

  const stepBody=()=>{switch(step){
    case 'phone':return <><h2>What's your mobile number?</h2><p>Your number is your identity on Halqa — invites, reminders and payments all reach you here. We'll send a one-time code to confirm it.</p>
      <PhoneInput value={form.phone} onChange={v=>{setForm({...form,phone:v});if(otpSent){setOtpSent(false);setOtpVerified(false);setDevCode('')}}} autoFocus/></>;
    case 'otp':return <><h2>Confirm your number</h2><p>We sent a 6-digit code to <b>{form.phone}</b>. Enter it to prove the number is yours.</p>
      <input className="field big-field mono" inputMode="numeric" autoFocus maxLength={6} placeholder="6-digit code" value={form.otpCode} disabled={otpVerified} onChange={e=>setForm({...form,otpCode:e.target.value.replace(/\D/g,'')})}/>
      {otpVerified
        ?<div className="commitment-ok" style={{marginTop:10}}><ShieldCheck/><div><b>Number confirmed</b><p>Tap Continue to carry on.</p></div></div>
        :<div className="otp-actions"><button type="button" className="secondary" disabled={busy||form.otpCode.length!==6} onClick={()=>void verifyOtp()}>{busy?'Checking…':'Verify code'}</button><button type="button" className="text-action" disabled={busy} onClick={()=>void requestOtp()}>Resend code</button></div>}
      {devCode&&!otpVerified&&<p className="muted" style={{fontSize:11.5,marginTop:8}}>Sandbox — no SMS gateway yet. Your code is <b className="mono">{devCode}</b>. Real codes arrive by SMS/WhatsApp once the provider connects.</p>}</>;
    case 'name':return <><h2>Your name, as on your CNIC</h2><p>Circles run on real names — it's how members know exactly who they're trusting.</p>
      <input className="field big-field" autoFocus autoComplete="name" placeholder="Full name" value={form.fullName} onChange={e=>setForm({...form,fullName:e.target.value})}/>
      <input className="field" placeholder="Pick a username" autoComplete="username" value={form.username} onChange={e=>setForm({...form,username:e.target.value.toLowerCase().replace(/[^a-z0-9_.]/g,'')})}/></>;
    case 'profile':return <><h2>Where you live & what you do</h2><p>Your home location and work help us keep circles trustworthy and verify you faster. Never shown to other members.</p>
      {homeLat!=null
        ?<div className="commitment-ok" style={{marginBottom:10}}><ShieldCheck/><div><b>Home location set ✓</b><p>Pinned from your device — this is your registered home.</p></div></div>
        :<button type="button" className="secondary" style={{marginBottom:10,display:'inline-flex',alignItems:'center',gap:8}} disabled={locating} onClick={captureLocation}>📍 {locating?'Getting your location…':'Use my live location (required)'}</button>}
      {locErr&&<div className="error-box" style={{marginBottom:10}}>{locErr}</div>}
      <label className="onboard-field-label">Home address</label>
      <input className="field" autoFocus autoComplete="street-address" placeholder="House / street / area" value={form.addressLine} onChange={e=>setForm({...form,addressLine:e.target.value})}/>
      <label className="onboard-field-label">City</label>
      <input className="field" list="pk-cities" autoComplete="address-level2" placeholder="Start typing your city" value={form.city} onChange={e=>setForm({...form,city:e.target.value})}/>
      <datalist id="pk-cities">{PK_CITIES.map(c=><option key={c} value={c}/>)}</datalist>
      <label className="onboard-field-label">What do you do?</label>
      <select className="field" value={form.occupationType} onChange={e=>setForm({...form,occupationType:e.target.value})}><option value="">Select…</option>{OCCUPATIONS.map(([id,label])=><option key={id} value={id}>{label}</option>)}</select>
      {form.occupationType==='EMPLOYED'&&<><label className="onboard-field-label">Where do you work?</label>
        <input className="field" placeholder="Company / employer name" value={form.employerName} onChange={e=>setForm({...form,employerName:e.target.value})}/>
        <div className="onboard-note"><b>Salary account = best rate</b><span>Members who collect from a salary account get a 20% fee discount — the most reliable collection there is.</span></div></>}</>;
    case 'email':return <><h2>Your email address</h2><p>For receipts, records and account recovery. No marketing without your say-so.</p>
      <input className="field big-field" type="email" autoFocus autoComplete="email" placeholder="you@example.com" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></>;
    case 'cnic':return <><h2>Your CNIC number</h2><p>The 13 digits, no dashes. Scan the card or type it — your record becomes real, usable proof of reliability.</p>
      <input className="field big-field mono" inputMode="numeric" autoFocus maxLength={13} placeholder="3520212345671" value={form.cnic} onChange={e=>setForm({...form,cnic:e.target.value.replace(/\D/g,'')})}/>
      {cnicCaptured
        ?<div className="commitment-ok" style={{marginTop:10}}><ShieldCheck/><div><b>CNIC scanned ✓</b><p>Card photo captured on your device.</p></div></div>
        :<button type="button" className="secondary" style={{marginTop:10,display:'inline-flex',alignItems:'center',gap:8}} onClick={()=>setScanning(true)}>📷 Scan my CNIC with the camera</button>}
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
    case 'pin':return <><h2>Set your app PIN</h2><p>A 4-digit PIN you'll enter every time you open Halqa — a second lock even when you're already signed in.</p>
      <label className="onboard-field-label">Choose a PIN</label>
      <input className="field big-field mono" inputMode="numeric" autoFocus maxLength={6} placeholder="••••" value={form.pin} onChange={e=>setForm({...form,pin:e.target.value.replace(/\D/g,'')})}/>
      <label className="onboard-field-label">Confirm PIN</label>
      <input className="field big-field mono" inputMode="numeric" maxLength={6} placeholder="••••" value={form.pinConfirm} onChange={e=>setForm({...form,pinConfirm:e.target.value.replace(/\D/g,'')})}/>
      {form.pin&&form.pinConfirm&&form.pin!==form.pinConfirm&&<div className="pin-error" style={{textAlign:'left'}}>PINs don't match yet</div>}
      <div className="onboard-note"><b>Keep it private</b><span>You'll need this PIN on every open. Forgot it later? Sign in with your password to reset.</span></div></>;
    case 'review':return <><h2>One look before we start</h2><p>Check your details, accept the terms, and your Halqa opens.</p>
      <div className="review-rows">
        <div><span>Mobile</span><b>{form.phone}</b></div>
        <div><span>Name</span><b>{form.fullName}</b></div>
        <div><span>Username</span><b>@{form.username}</b></div>
        <div><span>Email</span><b>{form.email}</b></div>
        <div><span>CNIC</span><b className="mono">{'•'.repeat(9)}{form.cnic.slice(-4)}</b></div>
        <div><span>City</span><b>{form.city||'—'}</b></div>
        <div><span>Work</span><b>{OCCUPATIONS.find(([id])=>id===form.occupationType)?.[1]||'—'}{form.occupationType==='EMPLOYED'&&form.employerName?` · ${form.employerName}`:''}</b></div>
        <div><span>Collection account</span><b>{form.accountTitle} · <span className="mono">{form.rail==='BANK_TRANSFER'?form.bankName+' ':''}{'•'.repeat(Math.max(0,form.accountNo.replace(/\s+/g,'').length-4))}{form.accountNo.replace(/\s+/g,'').slice(-4)}</span></b></div>
        <div><span>App PIN</span><b>Set ✓</b></div>
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
        ?<button className="primary full" disabled={!canContinue||busy} onClick={goNext}>Continue</button>
        :<button className="primary full" disabled={!agreed||busy} onClick={register}>{busy?'Opening your Halqa…':'Agree & open my Halqa'}</button>}
    </>}
  </div><LegalFooter/></section>
  {doc&&<LegalDocModal doc={doc} onClose={()=>setDoc(null)}/>}
  {scanning&&<CnicCapture onClose={()=>setScanning(false)} onCaptured={()=>{setCnicCaptured(true);setScanning(false)}}/>}</main>
}
