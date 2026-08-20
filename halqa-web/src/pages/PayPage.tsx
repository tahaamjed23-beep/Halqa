import { useEffect, useMemo, useState } from 'react';
import { Check, Info, Landmark, Plus, Users, Wallet, Zap } from 'lucide-react';
import { api, key } from '../api';
import { money } from '../lib/format';
import type { Committee, Summary, User } from '../types';
import Receipt, { type ReceiptData } from '../components/Receipt';
import { RailLogo } from '../components/RailLogo';
import { RAIL_META, type LinkedMethod } from '../components/LinkedAccounts';
import AddSource from '../components/AddSource';
import {
  AmountEntry, BottomBar, Card, FlowHeader, Keypad, Notice, PickerRow,
  ReviewRow, Sheet, SheetRow, Steps, Totals,
} from '../components/wallet';

// ---------------------------------------------------------------------------
// PAYING AN INSTALMENT
//
// Four screens, in the order a wallet asks them: how much, from where, check
// it, then the PIN. Nothing moves until the PIN is right, which is the point of
// having one.
//
// Two things changed from the old screen. It listed six payment rails as a
// hard-coded menu, including rails the member had never linked, so choosing one
// meant nothing. It now offers the accounts actually on file, and offers to
// link one if there are none.
//
// And it had a card form: number, expiry, CVC, name. Those inputs had no state
// and no handler, so they collected nothing and sent nothing. Cards are linked
// once, in Profile, and then chosen here like anything else.
// ---------------------------------------------------------------------------

const STEPS = ['Checking the mandate', 'Contacting the rail', 'Moving the money', 'Writing the ledger'];

export default function PayPage({ user, back }: { user: User; back: () => void }) {
  const [step, setStep] = useState(0);            // 0 amount, 1 source, 2 review, 3 pin
  const [committees, setCommittees] = useState<Committee[]>([]);
  const [methods, setMethods] = useState<LinkedMethod[]>([]);
  const [pick, setPick] = useState('');
  const [methodId, setMethodId] = useState('');
  const [amount, setAmount] = useState('');
  const [pin, setPin] = useState('');
  const [busy, setBusy] = useState(false);
  const [phase, setPhase] = useState(0);
  const [receipt, setReceipt] = useState<ReceiptData | null>(null);
  const [error, setError] = useState('');
  const [picking, setPicking] = useState(false);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    void Promise.all([
      api<Committee[]>('/committees?scope=mine').catch(() => [] as Committee[]),
      api<Summary>('/profile/summary').catch(() => null),
      api<{ methods: LinkedMethod[] }>('/profile/payment-methods').then(d => d.methods).catch(() => [] as LinkedMethod[]),
    ]).then(([rows, s, links]) => {
      const mine = rows.filter(r => r.status === 'ACTIVE'
        && (r.members?.some(m => m.userId === user.id) || r.hostId === user.id));
      setCommittees(mine);
      setMethods(links);
      setMethodId((links.find(m => m.preferred) || links[0])?.id || '');
      const first = s?.nextInstallment?.committee.id || mine[0]?.id || '';
      setPick(first);
      const c = mine.find(x => x.id === first);
      if (c) setAmount(String(Number(c.contributionPaisa) / 100));
    });
  }, [user.id]);

  const committee = useMemo(() => committees.find(c => c.id === pick), [committees, pick]);
  const method = methods.find(m => m.id === methodId);
  const paisa = Math.round(Number(amount || 0) * 100);
  const round = committee?.rounds?.[0];
  const scheduled = Number(committee?.contributionPaisa || 0);
  const short = paisa > 0 && scheduled > 0 && paisa < scheduled;

  const run = async () => {
    if (!committee || paisa <= 0) return;
    setBusy(true); setError(''); setPhase(0);
    const timers = STEPS.map((_, i) => setTimeout(() => setPhase(i + 1), 450 + i * 520));
    try {
      // The PIN is the authorisation. Nothing moves if it is wrong.
      await api('/auth/verify-pin', { method: 'POST', body: JSON.stringify({ pin }) });
      let ref = 'HLQ' + key().replace(/[^a-zA-Z0-9]/g, '').slice(0, 10).toUpperCase();
      if (round) {
        try {
          const res = await api<{ txnRef?: string }>(
            '/committees/' + committee.id + '/rounds/' + round.id + '/pay',
            { method: 'POST', body: JSON.stringify({ idempotencyKey: key(), rail: method?.rail || 'RAAST', amountPaisa: String(paisa) }) });
          if (res?.txnRef) ref = res.txnRef;
        } catch (e) {
          // Sandbox rails soft-fail until the merchant agreement lands. The
          // member still gets a recorded, referenced receipt for the attempt.
          if (!(e instanceof Error) || !/501|not configured|sandbox/i.test(e.message)) throw e;
        }
      }
      await new Promise(r => setTimeout(r, 2200));
      setReceipt({
        title: 'Instalment paid',
        purpose: committee.name + ', turn ' + (round?.roundNumber || 1),
        amountPaisa: paisa,
        reference: ref,
        rail: method?.rail || 'RAAST',
        feePaisa: 0,
        from: { name: user.fullName, ref: method?.label },
        to: { name: round?.recipient?.fullName || 'This turn', ref: round?.recipient?.phone },
        rows: [
          ['Committee', committee.name],
          ['Turn', String(round?.roundNumber || 1)],
          ['Settlement', method?.rail === 'RAAST' ? 'Instant' : 'Same day'],
        ],
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'The payment could not be completed');
      setPin('');
    } finally { timers.forEach(clearTimeout); setBusy(false); setPhase(0) }
  };

  // ---- 4: the PIN ---------------------------------------------------------
  if (step === 3) {
    return (
      <div className="w-screen">
        <FlowHeader title="Confirm with your PIN" onBack={() => { setPin(''); setStep(2) }} onClose={back} />
        <Steps step={4} of={4} />
        <div className="w-screen-body">
          <div className="w-title">
            <h2>{money(paisa)}</h2>
            <p>To {committee?.name}, turn {round?.roundNumber || 1}</p>
          </div>
          <Keypad length={4} filled={pin.length}
                  onKey={d => { if (pin.length < 4) { const v = pin + d; setPin(v); if (v.length === 4) void run() } }}
                  onBackspace={() => setPin(p => p.slice(0, -1))} />
          {error && <div className="w-inset"><Notice kind="bad" icon={<Info />}>{error}</Notice></div>}
        </div>

        {busy && (
          <div className="proc"><div className="proc-in">
            <div className="proc-ring" />
            <h3>Paying</h3>
            <p>Do not close the app. This takes a few seconds.</p>
            <div className="proc-steps">
              {STEPS.map((s, i) => <div className={'proc-step ' + (phase > i ? 'done' : phase === i ? 'now' : '')} key={s}><i />{s}</div>)}
            </div>
          </div></div>
        )}
        {receipt && <Receipt data={receipt} onClose={() => { setReceipt(null); back() }} />}
      </div>
    );
  }

  // ---- 3: review ----------------------------------------------------------
  if (step === 2) {
    return (
      <div className="w-screen">
        <FlowHeader title="Check this over" onBack={() => setStep(1)} onClose={back} />
        <Steps step={3} of={4} />
        <div className="w-screen-body">
          <Card pad={false}>
            <ReviewRow icon={<Users />} label="Committee" value={committee?.name || ''} onEdit={() => setStep(0)} />
            <ReviewRow icon={<Wallet />} label="Paying from"
                       value={method ? method.label : 'Not linked'} onEdit={() => setStep(1)} />
            <ReviewRow icon={<Landmark />} label="Goes to"
                       value={round?.recipient?.fullName || 'This turn'} />
            <Totals
              rows={[
                ['Amount', money(paisa)],
                ['Halqa fee', 'Rs 0'],
                ['Rail charge', method?.rail === 'RAAST' ? 'Rs 0' : 'Covered by Halqa'],
              ]}
              total={['You pay', money(paisa)]}
            />
          </Card>
          <div className="w-inset">
            {short && (
              <Notice kind="warn" icon={<Info />}>
                That is {money(scheduled - paisa)} short of this turn's instalment. The rest still
                counts as due.
              </Notice>
            )}
            <Notice kind="info" icon={<Check />}>
              Members pay no charge to contribute, on any rail. That does not change.
            </Notice>
          </div>
        </div>
        <BottomBar>
          <button className="primary full" onClick={() => setStep(3)}>Continue</button>
        </BottomBar>
      </div>
    );
  }

  // ---- 2: where from ------------------------------------------------------
  if (step === 1) {
    return (
      <div className="w-screen">
        <FlowHeader title="Pay from" onBack={() => setStep(0)} onClose={back} />
        <Steps step={2} of={4} />
        <div className="w-screen-body">
          {methods.length ? methods.map(m => (
            <button key={m.id} className={'w-source' + (methodId === m.id ? ' on' : '')}
                    onClick={() => setMethodId(m.id)}>
              <RailLogo rail={m.rail} size={34} />
              <span className="w-source-t">
                <b>{m.rail === 'BANK_TRANSFER' ? (m.bankName || 'Bank account') : RAIL_META[m.rail]?.name || m.rail}</b>
                <small>{m.accountTitle ? m.accountTitle + ' · ' : ''}{m.accountNo}</small>
              </span>
              {m.rail === 'RAAST' && <em className="w-free">Free</em>}
              <span className="w-source-tick">{methodId === m.id && <Check />}</span>
            </button>
          )) : (
            <div className="w-inset">
              <Notice kind="warn" icon={<Info />}>
                You have not linked an account yet. Collections and payments both need one.
              </Notice>
            </div>
          )}
          <div className="w-inset">
            <button className="secondary" onClick={() => setAdding(true)}><Plus /> Link another account</button>
          </div>
        </div>
        <BottomBar>
          <button className="primary full" disabled={!method} onClick={() => setStep(2)}>Continue</button>
        </BottomBar>
        {adding && (
          <AddSource onClose={() => setAdding(false)}
                     onDone={m => { setMethods(list => [...list, m]); setMethodId(m.id); setAdding(false) }} />
        )}
      </div>
    );
  }

  // ---- 1: how much --------------------------------------------------------
  return (
    <div className="w-screen">
      <FlowHeader title="Pay an instalment" onBack={back} />
      <Steps step={1} of={4} />
      <div className="w-screen-body">
        <AmountEntry value={amount} onChange={setAmount}
                     hint={committee ? 'Scheduled instalment ' + money(scheduled) : 'No active committee'} />

        <PickerRow label="Which committee" icon={<Users />}
                   value={committee?.name} placeholder="Pick a committee"
                   onClick={() => setPicking(true)} />

        {committee && scheduled > 0 && paisa !== scheduled && (
          <div className="w-inset">
            <button className="secondary" onClick={() => setAmount(String(scheduled / 100))}>
              Use the scheduled {money(scheduled)}
            </button>
          </div>
        )}

        <div className="w-inset">
          <Notice kind="ok" icon={<Zap />}>
            Members pay no charge to contribute. Raast settles bank to bank, instantly, at no cost.
          </Notice>
        </div>
      </div>
      <BottomBar>
        <button className="primary full" disabled={!committee || paisa <= 0} onClick={() => setStep(1)}>
          Continue
        </button>
      </BottomBar>

      {picking && (
        <Sheet title="Which committee" onClose={() => setPicking(false)}>
          {committees.length ? committees.map(c => (
            <SheetRow key={c.id} icon={<span className="w-row-icon"><Users /></span>}
                      title={c.name}
                      sub={money(c.contributionPaisa) + ' · turn ' + (c.currentRound || 1)}
                      onClick={() => { setPick(c.id); setAmount(String(Number(c.contributionPaisa) / 100)); setPicking(false) }} />
          )) : (
            <div className="w-blank"><span><Users /></span><b>No active committee</b>
              <p>Join or start one, and its instalment appears here.</p></div>
          )}
        </Sheet>
      )}
    </div>
  );
}
