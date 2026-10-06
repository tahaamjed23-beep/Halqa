import { useState } from 'react';
import { useDismissable } from '../lib/dismissable';
import {
  Building2, Check, CreditCard, Info, Landmark, Lock, ShieldCheck, Smartphone, Zap,
} from 'lucide-react';
import { api } from '../api';
import { RailLogo } from './RailLogo';
import { AccountCard, PK_BANKS, RAIL_META, type LinkedMethod } from './LinkedAccounts';
import {
  BottomBar, Card, Field, FlowHeader, Notice, PickerRow, ReviewRow,
  Sheet, SheetGroup, SheetRow, Steps,
} from './wallet';
import {
  cardBrand, cleanCard, cleanIban, cleanMobile, expiryOk, expiryProblem,
  groupCard, groupExpiry, groupIban, groupMobile, ibanOk, ibanProblem, luhn,
  mobileOk, mobileProblem,
} from '../lib/validate';

// ---------------------------------------------------------------------------
// LINKING A MONEY SOURCE
//
// The old form asked for a number and a name and accepted anything ten
// characters long. A mistyped IBAN passed it, and the member found out weeks
// later when a collection failed and the circle recorded a miss against them.
//
// Each rail now asks for what that rail actually needs, and checks it before
// the request is sent:
//
//   Wallet   the mobile number IS the account, so it must be 03 and 11 digits,
//            and the holder name must match the one registered against it.
//   Bank     the bank, the account title, and a 24-character IBAN that passes
//            the mod-97 checksum. No checksum, no link.
//   Raast    the mobile number registered against an IBAN at the member's bank.
//   Card     name, a PAN that passes Luhn, an expiry that has not passed, and
//            the CVV. Halqa keeps the brand, the last four and the expiry.
//            Never the number, never the CVV.
//
// Layout is the wallet one: choose from a sheet, fill one screen, review what
// you are about to link, confirm with a code.
// ---------------------------------------------------------------------------

type Rail = 'RAAST' | 'JAZZCASH' | 'EASYPAISA' | 'BANK_TRANSFER' | 'CARD';

const RAIL_HELP: Record<Rail, string> = {
  RAAST: 'Free, instant, and it settles straight into your bank account',
  JAZZCASH: 'Your JazzCash wallet, which is your mobile number',
  EASYPAISA: 'Your Easypaisa wallet, which is your mobile number',
  BANK_TRANSFER: 'Any Pakistani bank account, linked by IBAN',
  CARD: 'A debit or credit card for one-off payments',
};

export default function AddSource({ onClose, onDone, title = 'Link an account' }:
  { onClose: () => void; onDone: (method: LinkedMethod) => void; title?: string }) {
  const [step, setStep] = useState(0);          // 0 details, 1 review, 2 confirm
  const [rail, setRail] = useState<Rail>('RAAST');
  const [railSheet, setRailSheet] = useState(false);
  const [bank, setBank] = useState('HBL');
  const [bankSheet, setBankSheet] = useState(false);
  const [bankFind, setBankFind] = useState('');

  const [holder, setHolder] = useState('');
  const [number, setNumber] = useState('');       // IBAN or mobile, by rail
  const [card, setCard] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [billing, setBilling] = useState('');
  const [city, setCity] = useState('');

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [linked, setLinked] = useState<LinkedMethod | null>(null);
  const [code, setCode] = useState('');
  const [devCode, setDevCode] = useState('');

  const isCard = rail === 'CARD';
  const isBank = rail === 'BANK_TRANSFER';
  const isWallet = rail === 'JAZZCASH' || rail === 'EASYPAISA';
  const isRaast = rail === 'RAAST';

  // ---- what this rail needs, and whether it has it -------------------------
  const numberProblem = isBank ? ibanProblem(number) : mobileProblem(number);
  const numberValid = isBank ? ibanOk(number) : mobileOk(number);
  const cardValid = luhn(card) && expiryOk(expiry) && cvc.length >= 3;
  const holderValid = holder.trim().length >= 3;
  const detailsValid = isCard
    ? cardValid && holderValid && billing.trim().length >= 5 && city.trim().length >= 2
    : numberValid && holderValid;

  const numberLabel = isBank ? 'IBAN' : isRaast ? 'Raast ID, your mobile number' : 'Wallet number';
  const numberHint = isBank
    ? '24 characters, starting PK'
    : isRaast
      ? 'Registered with your bank'
      : 'Must be your own number';

  const reset = () => { setNumber(''); setCard(''); setExpiry(''); setCvc(''); };

  const submit = async () => {
    setBusy(true); setError('');
    try {
      const body = isCard
        ? {
            rail, cardNumber: cleanCard(card), expiry, cvc,
            accountTitle: holder.trim(),
            addressLine: billing.trim() || undefined, city: city.trim() || undefined,
          }
        : {
            rail,
            accountNo: isBank ? cleanIban(number) : cleanMobile(number),
            accountTitle: holder.trim(),
            bankName: isBank ? bank : undefined,
          };
      const d = await api<{ method: LinkedMethod; devCode?: string }>(
        '/profile/payment-methods', { method: 'POST', body: JSON.stringify(body) });
      setLinked(d.method); setDevCode(d.devCode || ''); setStep(2);
    } catch (reason) { setError((reason as Error).message) }
    finally { setBusy(false) }
  };

  const confirm = async () => {
    if (!linked) return;
    setBusy(true); setError('');
    try {
      await api('/profile/payment-methods/' + linked.id + '/verify',
        { method: 'POST', body: JSON.stringify({ code: code.trim() }) });
      onDone({ ...linked, verified: true });
    } catch (reason) { setError((reason as Error).message); setBusy(false) }
  };

  const banks = bankFind.trim()
    ? PK_BANKS.filter(b => b.name.toLowerCase().includes(bankFind.trim().toLowerCase()))
    : PK_BANKS;

  // Escape and the Close button are the keyboard ways out of every step of
  // this sheet; the backdrop is a convenience and is hidden from readers.
  const layer = useDismissable(true, onClose);
  // ---- step 3: confirm with the code --------------------------------------
  if (step === 2 && linked) {
    return (
      <div className="w-sheet-wrap" onClick={onClose} aria-hidden="true">
        <div className="w-sheet" role="dialog" aria-modal="true" aria-label="Link an account"
           ref={layer} tabIndex={-1} onClick={e => e.stopPropagation()}>
          <div className="w-sheet-handle" />
          <FlowHeader title="Confirm it is yours" onClose={onClose} />
          <Steps step={3} of={3} />
          <div className="w-sheet-body">
            <div className="w-inset" style={{ marginTop: 12 }}>
              <AccountCard rail={linked.rail} bankName={linked.bankName} accountTitle={linked.accountTitle}
                           accountNo={linked.accountNo} brand={linked.brand} last4={linked.last4}
                           expiry={linked.expiry} />
            </div>
            <Field label="Six digit code" hint="">
              <input aria-label="Six digit code sent to you" className="mono" inputMode="numeric" maxLength={6} value={code}
                     onChange={e => setCode(e.target.value.replace(/\D/g, ''))} placeholder="000000" />
            </Field>
            {devCode && (
              <div className="w-inset">
                <Notice kind="info" icon={<Info />}>
                  No SMS gateway is connected yet, so the code is <b className="mono">{devCode}</b>.
                </Notice>
              </div>
            )}
            {error && <div className="w-inset"><Notice kind="bad" icon={<Info />}>{error}</Notice></div>}
          </div>
          <BottomBar>
            <button className="primary full" disabled={busy || code.length !== 6} onClick={confirm}>
              {busy ? 'Checking' : 'Confirm'}
            </button>
          </BottomBar>
        </div>
      </div>
    );
  }

  // ---- step 2: review ------------------------------------------------------
  if (step === 1) {
    return (
      <div className="w-sheet-wrap" onClick={onClose} aria-hidden="true">
        <div className="w-sheet" role="dialog" aria-modal="true" aria-label="Link an account"
           ref={layer} tabIndex={-1} onClick={e => e.stopPropagation()}>
          <div className="w-sheet-handle" />
          <FlowHeader title="Check this over" onBack={() => setStep(0)} onClose={onClose} />
          <Steps step={2} of={3} />
          <div className="w-sheet-body">
            <div className="w-inset" style={{ marginTop: 12 }}>
              <AccountCard draft rail={rail} bankName={isBank ? bank : undefined}
                           accountTitle={holder}
                           accountNo={isCard ? cleanCard(card) : number}
                           brand={isCard ? cardBrand(card) : undefined}
                           expiry={isCard ? expiry : undefined} />
            </div>
            <Card pad={false}>
              <ReviewRow icon={<RailLogo rail={rail} size={20} plain />} label="Type"
                         value={RAIL_META[rail].name} onEdit={() => setStep(0)} />
              {isBank && <ReviewRow icon={<Landmark />} label="Bank" value={bank} onEdit={() => setStep(0)} />}
              <ReviewRow icon={<ShieldCheck />} label={isCard ? 'Name on card' : 'Account holder'}
                         value={holder} onEdit={() => setStep(0)} />
              <ReviewRow icon={isCard ? <CreditCard /> : <Smartphone />}
                         label={isCard ? 'Card' : numberLabel}
                         value={isCard
                           ? cardBrand(card) + ' ending ' + cleanCard(card).slice(-4)
                           : isBank ? groupIban(number) : groupMobile(number)}
                         onEdit={() => setStep(0)} />
            </Card>
            <div className="w-inset">
              <Notice kind="info" icon={<Lock />}>
                {isCard
                  ? 'Halqa keeps the brand, the last four digits and the expiry. Never the full number, never the security code.'
                  : 'Halqa keeps the identifier only. No balances are read and no money moves until a committee is due.'}
              </Notice>
              {error && <Notice kind="bad" icon={<Info />}>{error}</Notice>}
            </div>
          </div>
          <BottomBar>
            <button className="primary full" disabled={busy} onClick={submit}>
              {busy ? 'Linking' : 'Link this account'}
            </button>
          </BottomBar>
        </div>
      </div>
    );
  }

  // ---- step 1: the details this rail actually needs -------------------------
  return (
    <div className="w-sheet-wrap" onClick={onClose} aria-hidden="true">
      <div className="w-sheet" role="dialog" aria-modal="true" aria-label="Link an account"
           ref={layer} tabIndex={-1} onClick={e => e.stopPropagation()}>
        <div className="w-sheet-handle" />
        <FlowHeader title={title} onClose={onClose} />
        <Steps step={1} of={3} />
        <div className="w-sheet-body">
          <PickerRow label="What are you linking" icon={<RailLogo rail={rail} size={22} />}
                     value={RAIL_META[rail].name} onClick={() => setRailSheet(true)} />

          {isBank && (
            <PickerRow label="Your bank" icon={<Landmark />} value={bank}
                       onClick={() => setBankSheet(true)} />
          )}

          <Field label={isCard ? 'Name on the card' : 'Account holder name'}
                 hint="As registered">
            <input aria-label="As printed on the account" value={holder} autoComplete="name" placeholder="As printed on the account"
                   onChange={e => setHolder(e.target.value)} />
          </Field>

          {isCard ? (
            <>
              <Field label="Card number" error={card && !luhn(card) ? 'Check those digits again' : undefined}>
                <input aria-label="1234 5678 9012 3456" className="mono" inputMode="numeric" autoComplete="cc-number"
                       value={groupCard(card)} placeholder="1234 5678 9012 3456"
                       onChange={e => setCard(cleanCard(e.target.value))} />
              </Field>
              <div className="w-pair">
                <Field label="Expiry" error={expiryProblem(expiry) || undefined}>
                  <input aria-label="08/29" className="mono" inputMode="numeric" autoComplete="cc-exp" placeholder="08/29"
                         value={expiry} onChange={e => setExpiry(groupExpiry(e.target.value))} />
                </Field>
                <Field label="Security code" hint="Never stored">
                  <input aria-label="123" className="mono" inputMode="numeric" autoComplete="cc-csc" maxLength={4}
                         placeholder="123" value={cvc}
                         onChange={e => setCvc(e.target.value.replace(/\D/g, ''))} />
                </Field>
              </div>
              <Field label="Billing address">
                <input aria-label="House, street, area" autoComplete="street-address" placeholder="House, street, area"
                       value={billing} onChange={e => setBilling(e.target.value)} />
              </Field>
              <Field label="City">
                <input aria-label="City" autoComplete="address-level2" placeholder="City"
                       value={city} onChange={e => setCity(e.target.value)} />
              </Field>
            </>
          ) : (
            <Field label={numberLabel} hint={numberHint} error={numberProblem || undefined}>
              <input aria-label="Account number" className="mono" inputMode={isBank ? 'text' : 'numeric'}
                     value={isBank ? groupIban(number) : groupMobile(number)}
                     placeholder={isBank ? 'PK36 SONE 0000 1234 5678 9012' : '0300 1234567'}
                     onChange={e => setNumber(e.target.value)} />
            </Field>
          )}

          <div className="w-inset">
            <AccountCard draft rail={rail} bankName={isBank ? bank : undefined}
                         accountTitle={holder}
                         accountNo={isCard ? cleanCard(card) : number}
                         brand={isCard ? cardBrand(card) : undefined}
                         expiry={isCard ? expiry : undefined} />
          </div>

          {isWallet && (
            <div className="w-inset">
              <Notice kind="warn" icon={<ShieldCheck />}>
                The wallet must be in your own name.
              </Notice>
            </div>
          )}
        </div>
        <BottomBar>
          <button className="primary full" disabled={!detailsValid} onClick={() => setStep(1)}>
            Continue
          </button>
        </BottomBar>

        {railSheet && (
          <Sheet title="What are you linking" onClose={() => setRailSheet(false)}>
            <SheetGroup label="Instant, and free" />
            <SheetRow icon={<RailLogo rail="RAAST" size={30} />} title="Raast"
                      sub={RAIL_HELP.RAAST}
                      onClick={() => { setRail('RAAST'); reset(); setRailSheet(false) }} />
            <SheetGroup label="Mobile wallets" />
            <SheetRow icon={<RailLogo rail="JAZZCASH" size={30} />} title="JazzCash"
                      sub={RAIL_HELP.JAZZCASH}
                      onClick={() => { setRail('JAZZCASH'); reset(); setRailSheet(false) }} />
            <SheetRow icon={<RailLogo rail="EASYPAISA" size={30} />} title="Easypaisa"
                      sub={RAIL_HELP.EASYPAISA}
                      onClick={() => { setRail('EASYPAISA'); reset(); setRailSheet(false) }} />
            <SheetGroup label="Bank and card" />
            <SheetRow icon={<RailLogo rail="BANK_TRANSFER" size={30} />} title="Bank account"
                      sub={RAIL_HELP.BANK_TRANSFER}
                      onClick={() => { setRail('BANK_TRANSFER'); reset(); setRailSheet(false) }} />
            <SheetRow icon={<RailLogo rail="CARD" size={30} />} title="Debit or credit card"
                      sub={RAIL_HELP.CARD}
                      onClick={() => { setRail('CARD'); reset(); setRailSheet(false) }} />
          </Sheet>
        )}

        {bankSheet && (
          <Sheet title="Pick your bank" onClose={() => setBankSheet(false)}
                 search={bankFind} onSearch={setBankFind}>
            {banks.map(b => (
              <SheetRow key={b.name}
                        icon={<i className="bank-dot" style={{ background: 'linear-gradient(135deg,' + b.color + ',' + b.dark + ')' }}>{b.mono}</i>}
                        title={b.name}
                        onClick={() => { setBank(b.name); setBankSheet(false); setBankFind('') }} />
            ))}
            {!banks.length && (
              <div className="w-blank"><span><Building2 /></span><b>No bank matches that</b></div>
            )}
          </Sheet>
        )}
      </div>
    </div>
  );
}

/** The little "linked" confirmation a caller can show after onDone. */
export function SourceLinked({ method }: { method: LinkedMethod }) {
  return (
    <Notice kind="ok" icon={<Check />}>
      <b>{method.label}</b> is linked{method.preferred ? ' and set as your default' : ''}. Collections
      will pull from it. <Zap size={12} />
    </Notice>
  );
}
