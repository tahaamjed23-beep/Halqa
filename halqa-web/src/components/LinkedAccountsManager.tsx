import { useEffect, useState } from 'react';
import { CalendarClock, Plus, ShieldCheck } from 'lucide-react';
import { api } from '../api';
import AddSource from './AddSource';
import { RailLogo, SchemeMark } from './RailLogo';
import { RAIL_META, groupAccount, type LinkedMethod } from './LinkedAccounts';
import { BottomBar, Field, Notice, Row, RowGroup, Sheet, SheetRow } from './wallet';

// ---------------------------------------------------------------------------
// THE LINKED ACCOUNTS MANAGER
//
// Rebuilt on the shared row set. It used to carry its own copy of the add form,
// rail chips, bank tiles, card fields and all, laid out with seventeen inline
// style objects that matched nothing else in the app. That form is now
// components/AddSource.tsx, which validates what each rail actually needs, and
// this is the list plus the salary arrangement that decides when collection
// runs.
// ---------------------------------------------------------------------------

type SalaryStatus = {
  salaryDay: number | null;
  salaryDayLearned: number | null;
  salaryVerifiedAt: string | null;
  salaryVerifyMethod: string | null;
  payslip: { status: string } | null;
};

const ordinal = (d: number) =>
  d === 1 || d === 21 || d === 31 ? 'st' : d === 2 || d === 22 ? 'nd' : d === 3 || d === 23 ? 'rd' : 'th';

export function LinkedAccountsManager() {
  const [methods, setMethods] = useState<LinkedMethod[]>([]);
  const [salaryRef, setSalaryRef] = useState<string | null>(null);
  const [salary, setSalary] = useState<SalaryStatus | null>(null);
  const [adding, setAdding] = useState(false);
  const [verifyFor, setVerifyFor] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [payslipBusy, setPayslipBusy] = useState(false);
  const [daySheet, setDaySheet] = useState(false);

  const load = () => Promise.all([
    api<{ methods: LinkedMethod[] }>('/profile/payment-methods').then(d => setMethods(d.methods)),
    api<{ salaryAccountLinked: boolean; salaryAccountRef: string | null }>('/auth/me')
      .then(d => setSalaryRef(d.salaryAccountLinked ? d.salaryAccountRef : null)).catch(() => {}),
    api<SalaryStatus>('/profile/salary-status').then(setSalary).catch(() => {}),
  ]).catch(() => {});
  useEffect(() => { void load() }, []);

  const setSalaryDay = async (value: number | null) => {
    setDaySheet(false);
    try { await api('/profile/salary-day', { method: 'POST', body: JSON.stringify({ day: value }) }); await load() }
    catch { /* refresh next open */ }
  };

  // One payslip, one photo, downscaled on the device so the upload is instant
  // on any connection. Nobody should have to fight a form for a discount.
  const uploadPayslip = async (file: File) => {
    setPayslipBusy(true);
    try {
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const i = new Image(); i.onload = () => resolve(i); i.onerror = reject;
        i.src = URL.createObjectURL(file);
      });
      const scale = Math.min(1, 1000 / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(img.src);
      await api('/profile/payslip', { method: 'POST', body: JSON.stringify({ imageBase64: canvas.toDataURL('image/jpeg', 0.8) }) });
      await load();
    } catch { /* surfaced by the status staying unchanged */ }
    finally { setPayslipBusy(false) }
  };

  const prefer = async (id: string) => {
    try {
      const d = await api<{ methods: LinkedMethod[] }>('/profile/payment-methods/' + id + '/preferred', { method: 'POST' });
      setMethods(d.methods);
    } catch { /* refresh next open */ }
  };
  const remove = async (id: string) => {
    try {
      const d = await api<{ methods: LinkedMethod[] }>('/profile/payment-methods/' + id, { method: 'DELETE' });
      setMethods(d.methods); if (id === salaryRef) setSalaryRef(null);
    } catch { /* refresh next open */ }
  };
  const markSalary = async (id: string, enabled: boolean) => {
    try {
      const d = await api<{ salaryAccountLinked: boolean; salaryAccountRef: string | null }>(
        '/profile/payment-methods/' + id + '/salary', { method: 'POST', body: JSON.stringify({ enabled }) });
      setSalaryRef(d.salaryAccountLinked ? d.salaryAccountRef : null);
      await load();
    } catch { /* refresh next open */ }
  };
  const verify = async (id: string) => {
    setError('');
    try {
      const d = await api<{ methods: LinkedMethod[] }>('/profile/payment-methods/' + id + '/verify',
        { method: 'POST', body: JSON.stringify({ code: code.trim() }) });
      setMethods(d.methods); setVerifyFor(null); setCode('');
    } catch (reason) { setError((reason as Error).message) }
  };

  const day = salary?.salaryDay ?? null;
  const learned = salary?.salaryDayLearned ?? null;

  return (
    <>
      <RowGroup title="Where collections pull from">
        {methods.map(m => (
          <div key={m.id}>
            <Row chevron={false}
                 icon={m.rail === 'CARD' ? <SchemeMark brand={m.brand} size={22} /> : <RailLogo rail={m.rail} size={22} />}
                 title={m.label || RAIL_META[m.rail]?.name || m.rail}
                 sub={groupAccount(m.accountNo) + (m.verified ? '' : ' · not verified yet')}
                 value={m.preferred ? 'Default' : m.id === salaryRef ? 'Salary' : undefined}
                 tone={m.preferred || m.id === salaryRef ? 'ok' : undefined} />
            <div className="acct-acts">
              {!m.verified && <button onClick={() => { setVerifyFor(m.id); setCode(''); setError('') }}>Enter the code</button>}
              {!m.preferred && <button onClick={() => void prefer(m.id)}>Make it the default</button>}
              {m.id === salaryRef
                ? <button onClick={() => void markSalary(m.id, false)}>Not my salary account</button>
                : <button onClick={() => void markSalary(m.id, true)}>This is my salary account</button>}
              {m.id !== salaryRef && <button className="danger" onClick={() => void remove(m.id)}>Remove</button>}
            </div>
          </div>
        ))}
        {!methods.length && (
          <Row chevron={false} title="Nothing linked yet"
               sub="Link a wallet, a Raast ID or a bank account and collection pulls from it." />
        )}
      </RowGroup>

      {methods.length < 5 && (
        <div className="w-inset">
          <button className="secondary" onClick={() => setAdding(true)}><Plus /> Link an account</button>
        </div>
      )}

      {salary && (
        <RowGroup title="When collection runs">
          <Row icon={<CalendarClock />} title="Your payday"
               sub={day ? 'Collection runs that morning, before the instalment is even due'
                 : learned ? 'It looks like about the ' + learned + ordinal(learned) + ', from your payment history'
                 : 'Set it and collection runs while the money is there'}
               value={day ? 'The ' + day + ordinal(day) : learned ? 'About the ' + learned : 'Not set'}
               tone={day ? 'ok' : 'warn'}
               onClick={() => setDaySheet(true)} />
          <Row chevron={false} icon={<ShieldCheck />} title="Verified"
               sub={salary.salaryVerifiedAt
                 ? 'Confirmed ' + (salary.salaryVerifyMethod === 'PATTERN' ? 'from your payment history'
                   : salary.salaryVerifyMethod === 'ALERTS' ? 'from your credit alerts'
                   : salary.salaryVerifyMethod === 'PAYSLIP' ? 'by your payslip' : 'for the pilot')
                 : salary.payslip?.status === 'PENDING' ? 'Your payslip is being checked'
                 : 'One payslip photo confirms it instantly'}
               value={salary.salaryVerifiedAt ? 'Yes' : salary.payslip?.status === 'PENDING' ? 'Checking' : 'No'}
               tone={salary.salaryVerifiedAt ? 'ok' : undefined} />
        </RowGroup>
      )}

      {salary && !salary.salaryVerifiedAt && salary.payslip?.status !== 'PENDING' && (
        <div className="w-inset">
          <label className="secondary w-upload">
            {payslipBusy ? 'Uploading' : 'Add one payslip photo'}
            <input type="file" accept="image/*" capture="environment" disabled={payslipBusy}
                   onChange={e => { const f = e.target.files?.[0]; if (f) void uploadPayslip(f); e.target.value = '' }} />
          </label>
        </div>
      )}

      {adding && (
        <AddSource onClose={() => setAdding(false)} onDone={() => { setAdding(false); void load() }} />
      )}

      {verifyFor && (
        <Sheet title="Confirm it is yours" onClose={() => { setVerifyFor(null); setError('') }}>
          <Field label="Six digit code" hint="Sent to the number on that account.">
            <input className="mono" inputMode="numeric" maxLength={6} value={code}
                   onChange={e => setCode(e.target.value.replace(/\D/g, ''))} placeholder="000000" />
          </Field>
          {error && <div className="w-inset"><Notice kind="bad">{error}</Notice></div>}
          <BottomBar>
            <button className="primary full" disabled={code.length !== 6}
                    onClick={() => void verify(verifyFor)}>Confirm</button>
          </BottomBar>
        </Sheet>
      )}

      {daySheet && (
        <Sheet title="When does your pay arrive" onClose={() => setDaySheet(false)}>
          <SheetRow icon={<span className="w-row-icon"><CalendarClock /></span>} title="It varies"
                    sub="We will work it out from your payment history"
                    onClick={() => void setSalaryDay(null)} />
          {Array.from({ length: 31 }, (_, i) => i + 1).map(d => (
            <SheetRow key={d} icon={<span className="w-row-icon"><CalendarClock /></span>}
                      title={'The ' + d + ordinal(d)} onClick={() => void setSalaryDay(d)} />
          ))}
        </Sheet>
      )}
    </>
  );
}

export default LinkedAccountsManager;
