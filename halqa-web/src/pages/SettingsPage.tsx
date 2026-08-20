import { useEffect, useState } from 'react';
import {
  Bell, CreditCard, Fingerprint, Globe, HelpCircle, Info, Megaphone,
  Scale, ShieldCheck, UserCog,
} from 'lucide-react';
import { api } from '../api';
import type { User } from '../types';
import FeeSchedule from '../components/FeeSchedule';
import MyAgreements from '../components/MyAgreements';
import LegalFooter, { LegalDocModal } from '../components/LegalFooter';
import { LinkedAccountsManager } from '../components/LinkedAccounts';
import { LEGAL_DOCS, TERMS_VERSION, type DocId } from '../legal/content';
import { useLang } from '../lib/i18n';
import { AppearancePanel } from '../components/Appearance';
import { CollectionOrder } from '../components/CollectionOrder';
import { SecurityPanel } from '../components/SecurityPanel';
import { Card, Field, FlowHeader, Notice, Row, RowGroup } from '../components/wallet';

// ---------------------------------------------------------------------------
// SETTINGS
//
// A list that opens sub-screens, the way every wallet does it, instead of eight
// accordions expanding in place. Tapping a row replaces the screen and gives
// you a back arrow; you always know where you are and the page never grows to
// six screens tall while you read it.
// ---------------------------------------------------------------------------

type SectionId = 'security' | 'account' | 'privacy' | 'ads' | 'notifications' | 'payments' | 'legal' | 'help';

const pref = {
  get: (k: string, fallback: string) => localStorage.getItem('halqa.pref.' + k) ?? fallback,
  set: (k: string, v: string) => localStorage.setItem('halqa.pref.' + k, v),
};

function ChangePassword() {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const submit = async () => {
    setBusy(true); setError(''); setDone(false);
    try {
      await api('/auth/change-password', { method: 'POST', body: JSON.stringify({ currentPassword: current, newPassword: next }) });
      setDone(true); setCurrent(''); setNext('');
    } catch (reason) { setError((reason as Error).message) } finally { setBusy(false) }
  };
  return (
    <Card title="Change your password">
      <Field label="Current password">
        <input type="password" autoComplete="current-password" value={current}
               onChange={e => setCurrent(e.target.value)} />
      </Field>
      <Field label="New password" hint="Eight characters or more, letters and numbers.">
        <input type="password" autoComplete="new-password" value={next}
               onChange={e => setNext(e.target.value)} />
      </Field>
      {done && <Notice kind="ok" icon={<ShieldCheck />}>Password updated. Every other session was signed out.</Notice>}
      {error && <Notice kind="bad" icon={<Info />}>{error}</Notice>}
      <button className="primary full" disabled={busy || !current || next.length < 8} onClick={submit}>
        {busy ? 'Updating' : 'Update password'}
      </button>
    </Card>
  );
}

/** A settings switch: title, one line, and the state on the right. */
function Switch({ title, sub, on, onChange, disabled }:
  { title: string; sub: string; on: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <Row chevron={false} title={title} sub={sub}
         value={on ? 'On' : 'Off'} tone={on ? 'ok' : undefined}
         onClick={disabled ? undefined : () => onChange(!on)} />
  );
}

export { LinkedAccountsManager as LinkedMethodsManager } from '../components/LinkedAccounts';

export default function SettingsPage({ user, back }: { user: User; back?: () => void }) {
  const [open, setOpen] = useState<SectionId | null>(null);
  const [doc, setDoc] = useState<DocId | null>(null);
  const [lang, setLang] = useLang();
  const [consent, setConsent] = useState<boolean | null>(null);
  const [consentBusy, setConsentBusy] = useState(false);
  const [notif, setNotif] = useState({
    reminders: pref.get('notif.reminders', 'on') === 'on',
    rounds: pref.get('notif.rounds', 'on') === 'on',
    marketing: pref.get('notif.marketing', 'off') === 'on',
  });

  useEffect(() => {
    void api<{ dataConsent: boolean }>('/profile/consent').then(d => setConsent(d.dataConsent)).catch(() => setConsent(null));
  }, []);

  const saveConsent = async (value: boolean) => {
    setConsentBusy(true);
    try { await api('/profile/consent', { method: 'PATCH', body: JSON.stringify({ dataConsent: value }) }); setConsent(value) }
    catch { /* keep the previous value */ } finally { setConsentBusy(false) }
  };
  const setN = (k: keyof typeof notif, v: boolean) => {
    setNotif({ ...notif, [k]: v }); pref.set('notif.' + k, v ? 'on' : 'off');
  };

  const sections: { id: SectionId; icon: JSX.Element; title: string; sub: string }[] = [
    { id: 'security', icon: <Fingerprint />, title: 'Sign in and security', sub: 'PIN, password, fingerprint' },
    { id: 'account', icon: <UserCog />, title: 'Your details', sub: user.fullName + ' · @' + user.username },
    { id: 'payments', icon: <CreditCard />, title: 'Payments', sub: 'Linked accounts, fees, collection order' },
    { id: 'notifications', icon: <Bell />, title: 'Notifications', sub: 'When Halqa contacts you' },
    { id: 'privacy', icon: <ShieldCheck />, title: 'Data privacy', sub: 'What is shared, and with whom' },
    { id: 'ads', icon: <Megaphone />, title: 'Advertising', sub: 'One switch, no trackers' },
    { id: 'legal', icon: <Scale />, title: 'Legal', sub: 'What you signed, and when' },
    { id: 'help', icon: <HelpCircle />, title: 'Help', sub: 'support@halqa.pk' },
  ];

  const section = sections.find(s => s.id === open);

  // ---- a sub-screen -------------------------------------------------------
  if (section) {
    return (
      <div className="w-screen">
        <FlowHeader title={section.title} onBack={() => setOpen(null)} />
        <div className="w-screen-body">
          {section.id === 'security' && <>
            <ChangePassword />
            <SecurityPanel />
            <RowGroup title="Also in force">
              <Row chevron={false} title="Lockout after repeated failures" sub="On, and it cannot be turned off" value="On" tone="ok" />
              <Row chevron={false} title="Other sessions" sub="Changing your password signs out every other device" />
              <Row chevron={false} title="Two step verification" sub="Arrives with the WhatsApp code rail" value="Soon" />
            </RowGroup>
          </>}

          {section.id === 'account' && <>
            <RowGroup title="Verified identity">
              <Row chevron={false} title="Full name" value={user.fullName} />
              <Row chevron={false} title="Username" value={'@' + user.username} />
              <Row chevron={false} title="Mobile" value={user.phone} />
              <Row chevron={false} title="Email" value={user.email} />
              <Row chevron={false} title="CNIC"
                   value={user.cnic ? '•••••••••' + user.cnic.slice(-4) : 'Not on file'}
                   tone={user.cnic ? 'ok' : 'warn'} />
            </RowGroup>
            <div className="w-inset">
              <Notice kind="info" icon={<Info />}>
                These are locked once a circle is running. If one is wrong, write to
                support@halqa.pk with proof of identity.
              </Notice>
            </div>
            <RowGroup title="Language">
              <Switch title={lang === 'en' ? 'اردو interface' : 'English interface'}
                      sub="Switch the language the app speaks"
                      on={lang === 'ur'} onChange={v => setLang(v ? 'ur' : 'en')} />
            </RowGroup>
            <AppearancePanel />
          </>}

          {section.id === 'payments' && <>
            <FeeSchedule />
            <CollectionOrder />
            <LinkedAccountsManager />
            <div className="w-inset">
              <button className="text-action" onClick={() => setDoc('fees')}>Read the Fees and Payments Policy</button>
            </div>
          </>}

          {section.id === 'notifications' && <>
            <RowGroup title="On this device">
              <Switch title="Payment reminders" sub="A nudge before an instalment is due"
                      on={notif.reminders} onChange={v => setN('reminders', v)} />
              <Switch title="Turn updates" sub="Payouts released, turns opening, circles finishing"
                      on={notif.rounds} onChange={v => setN('rounds', v)} />
              <Switch title="News from Halqa" sub="Off by default, and product news only"
                      on={notif.marketing} onChange={v => setN('marketing', v)} />
            </RowGroup>
            <p className="w-foot">Security alerts are always delivered, whatever is set here.</p>
          </>}

          {section.id === 'privacy' && <>
            <RowGroup>
              <Switch title="Share my goal with relevant partners"
                      sub="Name, number, city and goal category only. Never your ledger, score, CNIC or history."
                      on={consent === true} disabled={consent === null || consentBusy}
                      onChange={saveConsent} />
            </RowGroup>
            <RowGroup title="What is never shared">
              <Row chevron={false} title="Your ledger and your score" sub="Never sold, never given to a partner" />
              <Row chevron={false} title="What other members see" sub="Your name, standing and payment status, in shared circles only" />
              <Row chevron={false} title="Download your data" sub="Generate a Credit Passport from Profile, or write to privacy@halqa.pk" />
              <Row chevron={false} title="Delete your account" sub="Write to privacy@halqa.pk. Honoured once your circles settle." />
            </RowGroup>
            <div className="w-inset">
              <button className="text-action" onClick={() => setDoc('privacy')}>Read the full Privacy Policy</button>
            </div>
          </>}

          {section.id === 'ads' && <>
            <RowGroup>
              <Switch title="Goal sharing" sub="The same switch as Data privacy. One consent, one control."
                      on={consent === true} disabled={consent === null || consentBusy}
                      onChange={saveConsent} />
            </RowGroup>
            <RowGroup title="What advertisers get">
              <Row chevron={false} title="Third party ad trackers" value="None" tone="ok" />
              <Row chevron={false} title="Your CNIC and your ledger" value="Never" tone="ok" />
            </RowGroup>
            <div className="w-inset">
              <button className="text-action" onClick={() => setDoc('ads')}>Read Advertising and Ad Choices</button>
            </div>
          </>}

          {section.id === 'legal' && <>
            <MyAgreements />
            <RowGroup title="The documents">
              {(Object.keys(LEGAL_DOCS) as DocId[]).map(id => (
                <Row key={id} icon={<Scale />} title={LEGAL_DOCS[id].title}
                     sub={LEGAL_DOCS[id].updated} onClick={() => setDoc(id)} />
              ))}
            </RowGroup>
            <p className="w-foot">
              You accepted version {TERMS_VERSION} at signup, and the acceptance is timestamped.
            </p>
          </>}

          {section.id === 'help' && (
            <RowGroup>
              <Row chevron={false} icon={<HelpCircle />} title="Support"
                   sub="support@halqa.pk, answered within two working days" />
              <Row chevron={false} icon={<ShieldCheck />} title="Security reports" sub="security@halqa.pk" />
              <Row chevron={false} icon={<Globe />} title="Region" sub="Pakistan, Asia/Karachi" />
              <Row chevron={false} icon={<Info />} title="App version" sub={'Halqa web ' + TERMS_VERSION.split('-')[0]} />
            </RowGroup>
          )}
        </div>
        {doc && <LegalDocModal doc={doc} onClose={() => setDoc(null)} />}
      </div>
    );
  }

  // ---- the list -----------------------------------------------------------
  return (
    <div className="w-screen">
      <FlowHeader title="Settings" onBack={back} />
      <div className="w-screen-body">
        <RowGroup>
          {sections.map(s => (
            <Row key={s.id} icon={s.icon} title={s.title} sub={s.sub} onClick={() => setOpen(s.id)} />
          ))}
        </RowGroup>
        <LegalFooter />
      </div>
      {doc && <LegalDocModal doc={doc} onClose={() => setDoc(null)} />}
    </div>
  );
}
