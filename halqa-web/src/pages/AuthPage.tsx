import { useState } from 'react';
import {
  Briefcase, Camera, Check, CreditCard, Info, Landmark, Lock, MapPin,
  Search, ShieldCheck, Smartphone, Wallet,
} from 'lucide-react';
import { api, tokens } from '../api';
import type { User } from '../types';
import { HalqaOrb, Logo } from '../components/ui';
import PhoneInput from '../components/PhoneInput';
import LegalFooter, { LegalDocModal } from '../components/LegalFooter';
import { AccountCard, PK_BANKS, RAIL_META } from '../components/LinkedAccounts';
import { RailLogo } from '../components/RailLogo';
import CnicCapture from '../components/CnicCapture';
import { TERMS_VERSION, type DocId } from '../legal/content';
import {
  BottomBar, Card, Field, FlowHeader, Keypad, Notice, PickerRow,
  ReviewRow, Sheet, SheetGroup, SheetRow, Steps,
} from '../components/wallet';
import {
  cleanCnic, cleanIban, cleanMobile, groupCnic, groupIban, groupMobile,
  ibanOk, ibanProblem, mobileOk, mobileProblem,
} from '../lib/validate';
import { money } from '../lib/format';

// ---------------------------------------------------------------------------
// OPENING AN ACCOUNT
//
// One question per screen, the pattern every Pakistani wallet has trained
// people on, laid out with the shared wallet components so it matches the rest
// of the app rather than inventing a ninth style of form.
//
// Three things were wrong with the old flow and are fixed here.
//
//   The income question was asked and thrown away. The register call never sent
//   it, so the affordability engine had no figure and had to assume zero, which
//   makes it refuse every committee. It is sent now.
//
//   The PIN was two text boxes. It is the number a member types every single
//   time they open the app, so it is a keypad with dots, the way it will be
//   entered forever afterwards.
//
//   The collection account accepted any ten characters. An IBAN is now checked
//   against its mod-97 checksum and a wallet number against 03 plus nine
//   digits, because a mistyped account does not fail at signup, it fails weeks
//   later as a missed instalment on somebody's record.
// ---------------------------------------------------------------------------

const REG_STEPS = ['phone', 'otp', 'name', 'where', 'work', 'cnic', 'account', 'password', 'pin', 'review'] as const;
type RegStep = typeof REG_STEPS[number];

const OCCUPATIONS: [string, string][] = [
  ['EMPLOYED', 'Employed, salaried'],
  ['BUSINESS_OWNER', 'Business owner'],
  ['SELF_EMPLOYED', 'Self employed or freelance'],
  ['HOUSEWIFE', 'Housewife'],
  ['STUDENT', 'Student'],
  ['RETIRED', 'Retired'],
  ['OTHER', 'Other'],
];

// The public job line on a member's profile: the profession, never the
// employer. For a housewife it holds the husband's job, a common reference
// point here. Label and placeholder follow the occupation chosen.
const JOB_FIELD: Record<string, { label: string; ph: string }> = {
  EMPLOYED: { label: 'Your job, shown to members', ph: 'Teacher, accountant, engineer' },
  BUSINESS_OWNER: { label: 'Your business, shown to members', ph: 'Grocery store, garments trader' },
  SELF_EMPLOYED: { label: 'Your work, shown to members', ph: 'Electrician, tailor, driver' },
  STUDENT: { label: 'What you are studying, shown to members', ph: 'BSc Computer Science' },
  HOUSEWIFE: { label: 'Husband’s job, shown to members', ph: 'Shopkeeper, government officer' },
  RETIRED: { label: 'What you did, shown to members', ph: 'Retired schoolteacher' },
  OTHER: { label: 'Your work, shown to members', ph: 'Describe your work' },
};

const PK_CITIES = ['Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan', 'Peshawar', 'Quetta', 'Hyderabad', 'Gujranwala', 'Sialkot', 'Bahawalpur', 'Sargodha', 'Sukkur', 'Larkana', 'Sheikhupura', 'Mardan', 'Gujrat', 'Kasur', 'Rahim Yar Khan', 'Sahiwal', 'Okara', 'Wah Cantt', 'Dera Ghazi Khan', 'Mirpur', 'Abbottabad', 'Muzaffarabad', 'Mingora', 'Nawabshah', 'Chiniot'];

const ordinal = (d: number) =>
  d === 1 || d === 21 || d === 31 ? 'st' : d === 2 || d === 22 ? 'nd' : d === 3 || d === 23 ? 'rd' : 'th';

export default function AuthPage({ onAuth }: { onAuth: (user: User) => void }) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [step, setStep] = useState<RegStep>('phone');
  const [form, setForm] = useState({
    identity: '', password: '', fullName: '', username: '', phone: '', email: '', cnic: '',
    regPassword: '', rail: 'RAAST', accountNo: '', accountTitle: '', bankName: 'HBL',
    otpCode: '', addressLine: '', city: '', locality: '', occupationType: '', employerName: '',
    jobTitle: '', pin: '', pinConfirm: '', salaryDay: '', monthlyIncome: '',
  });
  const [agreed, setAgreed] = useState(false);
  const [cnicCaptured, setCnicCaptured] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [homeLat, setHomeLat] = useState<number | null>(null);
  const [homeLng, setHomeLng] = useState<number | null>(null);
  const [locating, setLocating] = useState(false);
  const [locErr, setLocErr] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [devCode, setDevCode] = useState('');
  const [doc, setDoc] = useState<DocId | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  // Pickers
  const [railSheet, setRailSheet] = useState(false);
  const [bankSheet, setBankSheet] = useState(false);
  const [bankFind, setBankFind] = useState('');
  const [citySheet, setCitySheet] = useState(false);
  const [cityFind, setCityFind] = useState('');
  const [jobSheet, setJobSheet] = useState(false);
  const [daySheet, setDaySheet] = useState(false);
  // PIN keypad
  const [pinStage, setPinStage] = useState<'set' | 'again'>('set');

  const stepIndex = REG_STEPS.indexOf(step);
  const isBank = form.rail === 'BANK_TRANSFER';

  const phoneOk = form.phone.startsWith('+92') ? /^\+923\d{9}$/.test(form.phone) : /^\+\d{8,15}$/.test(form.phone);
  const nameOk = form.fullName.trim().length >= 3 && form.username.trim().length >= 3 && /.+@.+\..+/.test(form.email);
  const cnicOk = form.cnic.length === 13;
  const passOk = form.regPassword.length >= 8 && /[a-zA-Z]/.test(form.regPassword) && /\d/.test(form.regPassword);
  const accountNumberOk = isBank ? ibanOk(form.accountNo) : mobileOk(form.accountNo);
  const accountOk = accountNumberOk && form.accountTitle.trim().length >= 3;
  const whereOk = homeLat != null && form.addressLine.trim().length >= 5 && form.city.trim().length >= 2;
  const workOk = !!form.occupationType && Number(form.monthlyIncome) > 0
    && (form.occupationType !== 'EMPLOYED' || form.employerName.trim().length >= 2);
  const pinOk = /^\d{4}$/.test(form.pin) && form.pin === form.pinConfirm;

  const canContinue = step === 'phone' ? phoneOk
    : step === 'otp' ? otpVerified
    : step === 'name' ? nameOk
    : step === 'where' ? whereOk
    : step === 'work' ? workOk
    : step === 'cnic' ? cnicOk
    : step === 'account' ? accountOk
    : step === 'password' ? passOk
    : step === 'pin' ? pinOk
    : agreed;

  const next = () => { setError(''); if (stepIndex < REG_STEPS.length - 1) setStep(REG_STEPS[stepIndex + 1]) };
  const back = () => { setError(''); if (stepIndex > 0) setStep(REG_STEPS[stepIndex - 1]); else setMode('login') };
  const goNext = () => { const cur = step; next(); if (cur === 'phone' && !otpSent) void requestOtp() };

  const requestOtp = async () => {
    setBusy(true); setError('');
    try {
      const d = await api<{ otpSent: boolean; devCode?: string }>('/auth/phone-otp',
        { method: 'POST', body: JSON.stringify({ phone: form.phone.trim() }) });
      setOtpSent(true); setDevCode(d.devCode || '');
    } catch (reason) { setError((reason as Error).message) } finally { setBusy(false) }
  };

  const verifyOtp = async () => {
    setBusy(true); setError('');
    try {
      await api('/auth/phone-otp/verify',
        { method: 'POST', body: JSON.stringify({ phone: form.phone.trim(), code: form.otpCode.trim() }) });
      setOtpVerified(true);
    } catch (reason) { setError((reason as Error).message) } finally { setBusy(false) }
  };

  // The device's real position, reverse-geocoded to fill the address and city.
  // The coordinates themselves are the registered home.
  const captureLocation = () => {
    setLocating(true); setLocErr('');
    if (!('geolocation' in navigator)) {
      setLocErr('Location is not available on this device. Type your address instead.');
      setLocating(false); return;
    }
    navigator.geolocation.getCurrentPosition(async pos => {
      const lat = pos.coords.latitude, lng = pos.coords.longitude;
      setHomeLat(lat); setHomeLng(lng);
      try {
        const r = await fetch('https://nominatim.openstreetmap.org/reverse?lat=' + lat + '&lon=' + lng + '&format=json&zoom=16', { headers: { Accept: 'application/json' } });
        const j = await r.json(); const a = j.address || {};
        const city = a.city || a.town || a.village || a.county || '';
        const locality = a.suburb || a.neighbourhood || a.city_district || a.quarter || a.residential || a.borough || '';
        const line = [a.road, a.suburb, a.neighbourhood, a.residential].filter(Boolean).join(', ')
          || (j.display_name || '').split(',').slice(0, 2).join(', ');
        setForm(f => ({ ...f, city: city || f.city, locality: locality || f.locality, addressLine: line || f.addressLine }));
      } catch { /* the coordinates alone are enough */ }
      setLocating(false);
    }, err => {
      setLocErr(err.code === 1 ? 'Allow location access. Your home location is required.' : 'Could not get your location. Try again.');
      setLocating(false);
    }, { enableHighAccuracy: true, timeout: 15000 });
  };

  const login = async (event: React.FormEvent) => {
    event.preventDefault(); setBusy(true); setError('');
    try {
      const data = await api<{ user: User; accessToken: string; refreshToken: string }>('/auth/login',
        { method: 'POST', body: JSON.stringify({ identity: form.identity.trim(), password: form.password.trim() }) });
      tokens.set(data.accessToken, data.refreshToken); onAuth(data.user);
    } catch (reason) { setError((reason as Error).message) } finally { setBusy(false) }
  };

  const register = async () => {
    setBusy(true); setError('');
    try {
      const data = await api<{ user: User; accessToken: string; refreshToken: string }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          fullName: form.fullName.trim(), username: form.username.trim(), phone: form.phone.trim(),
          email: form.email.trim(), cnic: form.cnic, password: form.regPassword,
          termsVersion: TERMS_VERSION,
          addressLine: form.addressLine.trim(), city: form.city.trim(),
          locality: form.locality.trim() || undefined,
          occupationType: form.occupationType,
          employerName: form.occupationType === 'EMPLOYED' ? form.employerName.trim() : undefined,
          jobTitle: form.jobTitle.trim() || undefined,
          pin: form.pin, cnicCaptured,
          homeLat: homeLat ?? undefined, homeLng: homeLng ?? undefined,
          salaryDay: form.salaryDay ? Number(form.salaryDay) : undefined,
          // The figure affordability sizes every committee against. Rupees on
          // the form, paisa on the wire, like every other amount.
          declaredIncomePaisa: form.monthlyIncome ? String(Number(form.monthlyIncome) * 100) : undefined,
        }),
      });
      tokens.set(data.accessToken, data.refreshToken);
      // The collection account, linked the moment the account exists. Best
      // effort: a rail hiccup must never strand a fresh registration, and
      // Profile shows the link and its code if this needs a retry.
      try {
        await api('/profile/payment-methods', {
          method: 'POST',
          body: JSON.stringify({
            rail: form.rail,
            accountNo: isBank ? cleanIban(form.accountNo) : cleanMobile(form.accountNo),
            accountTitle: form.accountTitle.trim(),
            bankName: isBank ? form.bankName : undefined,
            preferred: true,
          }),
        });
      } catch { /* retry from Profile */ }
      onAuth(data.user);
    } catch (reason) { setError((reason as Error).message) } finally { setBusy(false) }
  };

  const pressPin = (d: string) => {
    if (pinStage === 'set') {
      const v = (form.pin + d).slice(0, 4);
      setForm(f => ({ ...f, pin: v }));
      if (v.length === 4) setPinStage('again');
    } else {
      const v = (form.pinConfirm + d).slice(0, 4);
      setForm(f => ({ ...f, pinConfirm: v }));
    }
  };
  const backPin = () => {
    if (pinStage === 'again' && !form.pinConfirm) { setPinStage('set'); setForm(f => ({ ...f, pin: f.pin.slice(0, -1) })); return }
    if (pinStage === 'again') setForm(f => ({ ...f, pinConfirm: f.pinConfirm.slice(0, -1) }));
    else setForm(f => ({ ...f, pin: f.pin.slice(0, -1) }));
  };

  const cities = cityFind.trim() ? PK_CITIES.filter(c => c.toLowerCase().includes(cityFind.trim().toLowerCase())) : PK_CITIES;
  const banks = bankFind.trim() ? PK_BANKS.filter(b => b.name.toLowerCase().includes(bankFind.trim().toLowerCase())) : PK_BANKS;
  const numberLabel = isBank ? 'IBAN' : form.rail === 'RAAST' ? 'Raast ID, your mobile number' : 'Wallet number';

  const body = () => {
    switch (step) {
      case 'phone': return <>
        <div className="w-title"><h2>What is your mobile number?</h2>
          <p>Your number is your identity on Halqa. Invites, reminders and payments all reach you here.</p></div>
        <div className="w-inset">
          <PhoneInput value={form.phone} onChange={v => {
            setForm({ ...form, phone: v });
            if (otpSent) { setOtpSent(false); setOtpVerified(false); setDevCode('') }
          }} autoFocus />
        </div>
      </>;

      case 'otp': return <>
        <div className="w-title"><h2>Confirm your number</h2>
          <p>A six digit code went to {form.phone}.</p></div>
        <Field label="The code">
          <input className="mono" inputMode="numeric" autoFocus maxLength={6} placeholder="000000"
                 value={form.otpCode} disabled={otpVerified}
                 onChange={e => setForm({ ...form, otpCode: e.target.value.replace(/\D/g, '') })} />
        </Field>
        <div className="w-inset">
          {otpVerified
            ? <Notice kind="ok" icon={<Check />}>Number confirmed.</Notice>
            : <div className="w-actions">
                <button className="secondary" disabled={busy || form.otpCode.length !== 6} onClick={() => void verifyOtp()}>
                  {busy ? 'Checking' : 'Verify code'}
                </button>
                <button className="text-action" disabled={busy} onClick={() => void requestOtp()}>Send again</button>
              </div>}
          {devCode && !otpVerified && (
            <Notice kind="info" icon={<Info />}>
              No SMS gateway is connected yet, so your code is <b className="mono">{devCode}</b>.
            </Notice>
          )}
        </div>
      </>;

      case 'name': return <>
        <div className="w-title"><h2>Your name, as on your CNIC</h2>
          <p>Circles run on real names. It is how members know who they are trusting.</p></div>
        <Field label="Full name">
          <input autoFocus autoComplete="name" placeholder="Full name" value={form.fullName}
                 onChange={e => setForm({ ...form, fullName: e.target.value })} />
        </Field>
        <Field label="Username" hint="">
          <input autoComplete="username" placeholder="Pick a username" value={form.username}
                 onChange={e => setForm({ ...form, username: e.target.value.toLowerCase().replace(/[^a-z0-9_.]/g, '') })} />
        </Field>
        <Field label="Email" hint="For receipts and recovery">
          <input type="email" autoComplete="email" placeholder="you@example.com" value={form.email}
                 onChange={e => setForm({ ...form, email: e.target.value })} />
        </Field>
      </>;

      case 'where': return <>
        <div className="w-title"><h2>Where you live</h2>
          <p>Your city and area appear on your profile. Your street address never does.</p></div>
        <div className="w-inset">
          {homeLat != null
            ? <Notice kind="ok" icon={<Check />}>Home location pinned from your device.</Notice>
            : <button type="button" className="w-locate" disabled={locating} onClick={captureLocation}>
                <MapPin />
                <span><b>{locating ? 'Getting your location' : 'Use my live location'}</b>
                  <small>{locating ? 'One moment' : 'Required. This pins your home from the device.'}</small></span>
              </button>}
          {locErr && <Notice kind="bad" icon={<Info />}>{locErr}</Notice>}
        </div>
        <Field label="Home address" hint="Private">
          <input autoComplete="street-address" placeholder="House, street, area" value={form.addressLine}
                 onChange={e => setForm({ ...form, addressLine: e.target.value })} />
        </Field>
        <PickerRow label="City" icon={<MapPin />} value={form.city} placeholder="Pick your city"
                   onClick={() => setCitySheet(true)} />
        <Field label="Area or sector" hint="Shown to members">
          <input placeholder="Your area" value={form.locality}
                 onChange={e => setForm({ ...form, locality: e.target.value })} />
        </Field>
      </>;

      case 'work': return <>
        <div className="w-title"><h2>What you do</h2>
          <p>Your work is a trust signal to other members. What you earn is private and decides
            what you can join.</p></div>
        <PickerRow label="What you do" icon={<Briefcase />}
                   value={OCCUPATIONS.find(([id]) => id === form.occupationType)?.[1]}
                   placeholder="Pick one" onClick={() => setJobSheet(true)} />
        {form.occupationType && (
          <Field label={JOB_FIELD[form.occupationType].label}>
            <input placeholder={JOB_FIELD[form.occupationType].ph} value={form.jobTitle}
                   onChange={e => setForm({ ...form, jobTitle: e.target.value })} />
          </Field>
        )}
        <Field label="Roughly what you earn a month" hint="Private">
          <input inputMode="numeric" placeholder="60000" value={form.monthlyIncome}
                 onChange={e => setForm({ ...form, monthlyIncome: e.target.value.replace(/\D/g, '') })} />
        </Field>
        {Number(form.monthlyIncome) > 0 && (
          <div className="w-inset">
            <Notice kind="info" icon={<Info />}>
              Halqa keeps your committees under a third of what you earn, so about{' '}
              <b>{money(Math.round(Number(form.monthlyIncome) * 33))}</b> a month across everything
              you hold.
            </Notice>
          </div>
        )}
        {form.occupationType === 'EMPLOYED' && (
          <>
            <Field label="Where you work" hint="Private. 20 per cent off the fee.">
              <input placeholder="Company or employer" value={form.employerName}
                     onChange={e => setForm({ ...form, employerName: e.target.value })} />
            </Field>
            <PickerRow label="Which day your pay arrives" icon={<Wallet />}
                       value={form.salaryDay ? 'The ' + form.salaryDay + ordinal(Number(form.salaryDay)) : undefined}
                       placeholder="It varies" onClick={() => setDaySheet(true)} />
          </>
        )}
      </>;

      case 'cnic': return <>
        <div className="w-title"><h2>Your CNIC number</h2>
          <p>Thirteen digits. Used to confirm who you are, and never shown to another member.</p></div>
        <Field label="CNIC">
          <input className="mono" inputMode="numeric" autoFocus maxLength={15}
                 placeholder="35202-1234567-1" value={groupCnic(form.cnic)}
                 onChange={e => setForm({ ...form, cnic: cleanCnic(e.target.value) })} />
        </Field>
        <div className="w-inset">
          {cnicCaptured
            ? <Notice kind="ok" icon={<Check />}>Card photo captured on this device.</Notice>
            : <button type="button" className="secondary" onClick={() => setScanning(true)}>
                <Camera /> Scan my CNIC with the camera
              </button>}
        </div>
      </>;

      case 'account': return <>
        <div className="w-title"><h2>Where should we collect from?</h2>
          <p>Every committee collects automatically. This is the account it pulls from, and you
            can change it later.</p></div>
        <PickerRow label="What you are linking" icon={<RailLogo rail={form.rail} size={22} />}
                   value={RAIL_META[form.rail].name} onClick={() => setRailSheet(true)} />
        {isBank && <PickerRow label="Your bank" icon={<Landmark />} value={form.bankName}
                              onClick={() => setBankSheet(true)} />}
        <Field label="Account holder name" hint="As registered">
          <input autoComplete="name" placeholder="As printed on the account" value={form.accountTitle}
                 onChange={e => setForm({ ...form, accountTitle: e.target.value })} />
        </Field>
        <Field label={numberLabel}
               hint={isBank ? '24 characters, starting PK' : '11 digits, starting 03'}
               error={(isBank ? ibanProblem(form.accountNo) : mobileProblem(form.accountNo)) || undefined}>
          <input className="mono" inputMode={isBank ? 'text' : 'numeric'}
                 placeholder={isBank ? 'PK36 SONE 0000 1234 5678 9012' : '0300 1234567'}
                 value={isBank ? groupIban(form.accountNo) : groupMobile(form.accountNo)}
                 onChange={e => setForm({ ...form, accountNo: e.target.value })} />
        </Field>
        <div className="w-inset">
          <AccountCard draft rail={form.rail} bankName={isBank ? form.bankName : undefined}
                       accountTitle={form.accountTitle} accountNo={form.accountNo} />
          <Notice kind="info" icon={<Lock />}>
            The identifier only. No balances, no card numbers.
          </Notice>
        </div>
      </>;

      case 'password': return <>
        <div className="w-title"><h2>Create a password</h2>
          <p>Eight characters or more, with letters and numbers.</p></div>
        <Field label="Password">
          <input type="password" autoFocus autoComplete="new-password" placeholder="Password"
                 value={form.regPassword} onChange={e => setForm({ ...form, regPassword: e.target.value })} />
        </Field>
        <div className="w-inset">
          <div className={'w-strength' + (passOk ? ' ok' : form.regPassword ? ' weak' : '')}>
            <i />
            <span>{passOk ? 'Strong enough'
              : form.regPassword ? 'Keep going. Letters and numbers, eight minimum.' : ''}</span>
          </div>
        </div>
      </>;

      case 'pin': return <>
        <div className="w-title">
          <h2>{pinStage === 'set' ? 'Set your app PIN' : 'Enter it again'}</h2>
          <p>{pinStage === 'set'
            ? 'Four digits, typed every time you open Halqa. A second lock even when you are signed in.'
            : 'Type the same four digits to confirm.'}</p>
        </div>
        <Keypad length={4}
                filled={pinStage === 'set' ? form.pin.length : form.pinConfirm.length}
                onKey={pressPin} onBackspace={backPin} />
        <div className="w-inset">
          {pinStage === 'again' && form.pinConfirm.length === 4 && form.pin !== form.pinConfirm && (
            <Notice kind="bad" icon={<Info />}>
              Those do not match.{' '}
              <button className="text-action" onClick={() => { setForm(f => ({ ...f, pin: '', pinConfirm: '' })); setPinStage('set') }}>Start again</button>
            </Notice>
          )}
          {pinOk && <Notice kind="ok" icon={<Check />}>PIN set.</Notice>}
          <Notice kind="info" icon={<ShieldCheck />}>
            Forgotten later, you sign in with your password and set a new one.
          </Notice>
        </div>
      </>;

      case 'review': return <>
        <div className="w-title"><h2>One look before we start</h2>
          <p>Check it over, accept the terms, and your Halqa opens.</p></div>
        <Card pad={false}>
          <ReviewRow icon={<Smartphone />} label="Mobile" value={form.phone} onEdit={() => setStep('phone')} />
          <ReviewRow icon={<ShieldCheck />} label="Name" value={form.fullName + ' · @' + form.username} onEdit={() => setStep('name')} />
          <ReviewRow icon={<CreditCard />} label="CNIC" value={'•'.repeat(9) + form.cnic.slice(-4)} onEdit={() => setStep('cnic')} />
          <ReviewRow icon={<MapPin />} label="City and area"
                     value={form.city + (form.locality ? ' · ' + form.locality : '')} onEdit={() => setStep('where')} />
          <ReviewRow icon={<Briefcase />} label="Work"
                     value={(OCCUPATIONS.find(([id]) => id === form.occupationType)?.[1] || '') + (form.jobTitle ? ' · ' + form.jobTitle : '')}
                     onEdit={() => setStep('work')} />
          <ReviewRow icon={<Wallet />} label="Collects from"
                     value={form.accountTitle + ' · ' + (isBank ? form.bankName + ' ' : '') + (form.accountNo.replace(/\s+/g, '').slice(-4))}
                     onEdit={() => setStep('account')} />
          <ReviewRow icon={<Lock />} label="App PIN" value="Set" onEdit={() => { setPinStage('set'); setForm(f => ({ ...f, pin: '', pinConfirm: '' })); setStep('pin') }} />
        </Card>
        <div className="w-inset">
          <label className="w-check">
            <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} />
            <span>I have read and agree to the{' '}
              <button type="button" className="inline-link" onClick={() => setDoc('agreement')}>User Agreement</button>,{' '}
              the <button type="button" className="inline-link" onClick={() => setDoc('privacy')}>Privacy Policy</button>{' '}
              and the <button type="button" className="inline-link" onClick={() => setDoc('fees')}>Fees and Payments Policy</button>.
            </span>
          </label>
        </div>
      </>;
    }
  };

  return (
    <main className="auth-layout">
      <section className="auth-story">
        <Logo />
        <div className="auth-copy">
          <HalqaOrb />
          <span className="eyebrow">Pakistan's transparent savings network</span>
          <h1>Save together.<br />Grow with clarity.</h1>
          <p>Locked schedules, visible turns, and a payment record that follows you.</p>
        </div>
      </section>

      <section className="auth-form">
        <div className="auth-card">
          <div className="mobile-logo"><Logo /></div>

          {mode === 'login' ? (
            <>
              <div className="w-title"><h2>Welcome back</h2><p>Mobile number and password.</p></div>
              <form onSubmit={login}>
                <div className="w-inset">
                  <PhoneInput value={form.identity} onChange={v => setForm({ ...form, identity: v })} />
                </div>
                <Field label="Password">
                  <input type="password" placeholder="Password" autoComplete="current-password"
                         value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
                </Field>
                {error && <div className="w-inset"><Notice kind="bad" icon={<Info />}>{error}</Notice></div>}
                <div className="w-inset">
                  <button className="primary full" disabled={busy || form.identity.length < 8 || form.password.length < 4}>
                    {busy ? 'Please wait' : 'Sign in'}
                  </button>
                </div>
              </form>
              <button className="text-action" onClick={() => { setMode('register'); setStep('phone'); setError('') }}>
                New to Halqa? Create an account
              </button>
              <div className="demo-note"><b>Demo</b><span>+92 300 1234567 · halqa123</span></div>
            </>
          ) : (
            <>
              <FlowHeader title={'Step ' + (stepIndex + 1) + ' of ' + REG_STEPS.length} onBack={back} />
              <Steps step={stepIndex + 1} of={REG_STEPS.length} />
              {body()}
              {error && <div className="w-inset"><Notice kind="bad" icon={<Info />}>{error}</Notice></div>}
              <BottomBar>
                {step !== 'review'
                  ? <button className="primary full" disabled={!canContinue || busy} onClick={goNext}>Continue</button>
                  : <button className="primary full" disabled={!agreed || busy} onClick={register}>
                      {busy ? 'Creating your account' : 'Agree and open my Halqa'}
                    </button>}
              </BottomBar>
            </>
          )}
        </div>
        <LegalFooter />
      </section>

      {doc && <LegalDocModal doc={doc} onClose={() => setDoc(null)} />}
      {scanning && <CnicCapture onClose={() => setScanning(false)} onCaptured={() => { setCnicCaptured(true); setScanning(false) }} />}

      {railSheet && (
        <Sheet title="What are you linking" onClose={() => setRailSheet(false)}>
          <SheetGroup label="Instant, and free" />
          <SheetRow icon={<RailLogo rail="RAAST" size={30} />} title="Raast"
                    sub="Settles straight into your bank account"
                    onClick={() => { setForm({ ...form, rail: 'RAAST', accountNo: '' }); setRailSheet(false) }} />
          <SheetGroup label="Mobile wallets" />
          <SheetRow icon={<RailLogo rail="JAZZCASH" size={30} />} title="JazzCash"
                    sub="Your wallet, which is your mobile number"
                    onClick={() => { setForm({ ...form, rail: 'JAZZCASH', accountNo: '' }); setRailSheet(false) }} />
          <SheetRow icon={<RailLogo rail="EASYPAISA" size={30} />} title="Easypaisa"
                    sub="Your wallet, which is your mobile number"
                    onClick={() => { setForm({ ...form, rail: 'EASYPAISA', accountNo: '' }); setRailSheet(false) }} />
          <SheetGroup label="Bank" />
          <SheetRow icon={<RailLogo rail="BANK_TRANSFER" size={30} />} title="Bank account"
                    sub="Any Pakistani bank, linked by IBAN"
                    onClick={() => { setForm({ ...form, rail: 'BANK_TRANSFER', accountNo: '' }); setRailSheet(false) }} />
        </Sheet>
      )}

      {bankSheet && (
        <Sheet title="Pick your bank" onClose={() => setBankSheet(false)} search={bankFind} onSearch={setBankFind}>
          {banks.map(b => (
            <SheetRow key={b.name}
                      icon={<i className="bank-dot" style={{ background: 'linear-gradient(135deg,' + b.color + ',' + b.dark + ')' }}>{b.mono}</i>}
                      title={b.name}
                      onClick={() => { setForm({ ...form, bankName: b.name }); setBankSheet(false); setBankFind('') }} />
          ))}
          {!banks.length && <div className="w-blank"><span><Search /></span><b>No bank matches that</b></div>}
        </Sheet>
      )}

      {citySheet && (
        <Sheet title="Your city" onClose={() => setCitySheet(false)} search={cityFind} onSearch={setCityFind}>
          {cities.map(c => (
            <SheetRow key={c} icon={<span className="w-row-icon"><MapPin /></span>} title={c}
                      onClick={() => { setForm({ ...form, city: c }); setCitySheet(false); setCityFind('') }} />
          ))}
          {!cities.length && (
            <SheetRow icon={<span className="w-row-icon"><MapPin /></span>}
                      title={'Use "' + cityFind.trim() + '"'}
                      sub="Not on the list, and that is fine"
                      onClick={() => { setForm({ ...form, city: cityFind.trim() }); setCitySheet(false); setCityFind('') }} />
          )}
        </Sheet>
      )}

      {jobSheet && (
        <Sheet title="What do you do" onClose={() => setJobSheet(false)}>
          {OCCUPATIONS.map(([id, label]) => (
            <SheetRow key={id} icon={<span className="w-row-icon"><Briefcase /></span>} title={label}
                      onClick={() => { setForm({ ...form, occupationType: id, employerName: id === 'EMPLOYED' ? form.employerName : '', jobTitle: '' }); setJobSheet(false) }} />
          ))}
        </Sheet>
      )}

      {daySheet && (
        <Sheet title="When does your pay arrive" onClose={() => setDaySheet(false)}>
          <SheetRow icon={<span className="w-row-icon"><Wallet /></span>} title="It varies"
                    sub="Worked out from your payments"
                    onClick={() => { setForm({ ...form, salaryDay: '' }); setDaySheet(false) }} />
          {Array.from({ length: 31 }, (_, i) => i + 1).map(d => (
            <SheetRow key={d} icon={<span className="w-row-icon"><Wallet /></span>}
                      title={'The ' + d + ordinal(d)}
                      onClick={() => { setForm({ ...form, salaryDay: String(d) }); setDaySheet(false) }} />
          ))}
        </Sheet>
      )}
    </main>
  );
}
