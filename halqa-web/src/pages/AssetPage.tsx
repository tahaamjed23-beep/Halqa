import { useMemo, useState } from 'react';
import {
  Bike, CalendarDays, Check, Info, Lock, Package, Search, Shirt,
  Smartphone, Sun, Users, WashingMachine,
} from 'lucide-react';
import { api } from '../api';
import { money, percent } from '../lib/format';
import type { Committee } from '../types';
import {
  BottomBar, Card, Facts, Field, FlowHeader, Notice, PickerRow,
  ReviewRow, Row, RowGroup, Sheet, SheetRow, Steps, Totals,
} from '../components/wallet';

// ---------------------------------------------------------------------------
// Asset committees: the pot buys a thing instead of paying out cash.
//
// Mirrors halqa-api/src/lib/asset-committee.ts. Two things have to be true on
// this screen for the product to be honest. First, the total cost of ownership
// has to sit next to the cash price, because the whole claim is that a
// committee costs almost nothing more than buying outright. Second, an item
// that cannot be locked remotely is delivered at the end and never at a turn,
// because early delivery of an unsecurable thing is a loan with extra steps.
//
// This screen used to end in a button with no handler, so nothing a member set
// here ever became a committee. It now creates one.
// ---------------------------------------------------------------------------

const FEE_PER_INSTALLMENT = 5_000;   // Rs 50 flat, the whole of Halqa's charge
const PERIOD_DAYS = 30;

const CATALOGUE = [
  { id: 'phone-entry', name: 'Entry smartphone',     priceP: 3_500_000,  securable: true,  icon: Smartphone, group: 'Phones' },
  { id: 'phone-mid',   name: 'Mid-range smartphone', priceP: 7_500_000,  securable: true,  icon: Smartphone, group: 'Phones' },
  { id: 'solar-basic', name: 'Home solar kit',       priceP: 12_000_000, securable: true,  icon: Sun,        group: 'Home' },
  { id: 'bike-70',     name: 'Motorcycle 70cc',      priceP: 16_500_000, securable: true,  icon: Bike,       group: 'Transport' },
  { id: 'fridge',      name: 'Refrigerator',         priceP: 9_500_000,  securable: false, icon: Package,    group: 'Home' },
  { id: 'washer',      name: 'Washing machine',      priceP: 5_500_000,  securable: false, icon: WashingMachine, group: 'Home' },
  { id: 'sewing',      name: 'Sewing machine',       priceP: 3_000_000,  securable: false, icon: Shirt,      group: 'Work' },
];

const ROUND_OPTIONS = [6, 10, 12, 18, 24];

export default function AssetPage({ back, openCommittee }:
  { back: () => void; openCommittee?: (id: string) => void }) {
  const [step, setStep] = useState(0);
  const [pick, setPick] = useState(CATALOGUE[1].id);
  const [rounds, setRounds] = useState(10);
  const [name, setName] = useState('');
  const [picking, setPicking] = useState(false);
  const [months, setMonths] = useState(false);
  const [find, setFind] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const asset = CATALOGUE.find(a => a.id === pick)!;
  const plan = useMemo(() => {
    const contribution = Math.ceil(asset.priceP / rounds);
    const total = contribution * rounds;
    const fees = FEE_PER_INSTALLMENT * rounds;
    return {
      contribution, total, fees,
      allIn: total + fees,
      uplift: ((total + fees - asset.priceP) / asset.priceP) * 100,
    };
  }, [asset, rounds]);

  const circleName = name.trim() || asset.name + ' circle';

  const create = async () => {
    setBusy(true); setError('');
    try {
      // An asset circle is an ordinary rotating committee whose goal names the
      // thing being bought. goalType stays inside the API enum: CUSTOM, with
      // the item in goalName. Sending 'ASSET' is rejected by the schema.
      const committee = await api<Committee>('/committees', {
        method: 'POST',
        body: JSON.stringify({
          name: circleName,
          mode: 'ROTATING',
          memberCap: rounds,
          contributionPaisa: String(plan.contribution),
          cadencePreset: 'MID',
          periodDays: PERIOD_DAYS,
          minMembersToStart: Math.min(3, rounds),
          reinvestRatio: 0,
          riskTolerance: 3,
          schemeId: null,
          distributionMode: 'SHARE',
          orderMode: 'CREDIT_WEIGHTED',
          joinPolicy: 'INVITE_ONLY',
          listedPublicly: false,
          custodyMode: 'RECORDED',
          payoutGuaranteed: false,
          slotFeeBps: 0,
          tier: 'CLASSIC',
          earlyFeeBps: 0,
          depositCoverageBps: 0,
          expectedPaymentLeadDays: 0,
          goalType: 'CUSTOM',
          goalName: asset.name,
          goalTargetPaisa: String(asset.priceP),
          allowHalqaFill: false,
          forwardLiabilityGate: asset.securable,
        }),
      });
      if (openCommittee) openCommittee(committee.id); else back();
    } catch (reason) {
      setError((reason as Error).message);
      setBusy(false);
    }
  };

  const Icon = asset.icon;
  const matches = find.trim()
    ? CATALOGUE.filter(a => a.name.toLowerCase().includes(find.trim().toLowerCase()))
    : CATALOGUE;
  const groups = Array.from(new Set(matches.map(a => a.group)));

  // ---- step 2: review -----------------------------------------------------
  if (step === 1) {
    return (
      <div className="w-screen">
        <FlowHeader title="Check and start" onBack={() => setStep(0)} onClose={back} />
        <Steps step={2} of={2} />
        <div className="w-screen-body">
          <Card pad={false}>
            <ReviewRow icon={<Icon />} label="What the circle buys" value={asset.name} onEdit={() => setStep(0)} />
            <ReviewRow icon={<Users />} label="Members" value={rounds + ' people, one turn each'} onEdit={() => setStep(0)} />
            <ReviewRow icon={<CalendarDays />} label="Every" value={PERIOD_DAYS + ' days'} />
            <Totals
              rows={[
                ['Each month', money(plan.contribution)],
                ['Halqa, per month', money(FEE_PER_INSTALLMENT)],
                ['Cash price today', money(asset.priceP)],
              ]}
              total={['You pay, all in', money(plan.allIn)]}
            />
          </Card>

          <Card title="Name the circle">
            <Field label="Circle name" hint="Leave it blank to use the item">
              <input value={name} maxLength={60} placeholder={asset.name + ' circle'}
                     onChange={e => setName(e.target.value)} />
            </Field>
          </Card>

          {asset.securable ? (
            <div className="w-inset">
              <Notice kind="ok" icon={<Lock />}>
                Can be handed over at your turn, because it can be locked remotely.
              </Notice>
            </div>
          ) : (
            <div className="w-inset">
              <Notice kind="info" icon={<Info />}>
                Everyone receives on the last day. This item cannot be secured early.
              </Notice>
            </div>
          )}

          {error && <div className="w-inset"><Notice kind="bad">{error}</Notice></div>}
        </div>
        <BottomBar>
          <button className="primary full" disabled={busy} onClick={create}>
            {busy ? 'Starting' : 'Start this committee'}
          </button>
        </BottomBar>
      </div>
    );
  }

  // ---- step 1: what, and over how long ------------------------------------
  return (
    <div className="w-screen">
      <FlowHeader title="Save for something" onBack={back} />
      <Steps step={1} of={2} />
      <div className="w-screen-body">
        <div className="w-title">
          <h2>The committee buys it</h2>
          <p>You pay monthly and own it outright. No charge for waiting.</p>
        </div>

        <PickerRow label="What you are saving for" icon={<Icon />}
                   value={asset.name + ' · ' + money(asset.priceP)}
                   onClick={() => setPicking(true)} />

        <PickerRow label="Over how many months" icon={<CalendarDays />}
                   value={rounds + ' months · ' + money(plan.contribution) + ' each'}
                   onClick={() => setMonths(true)} />

        {/* The comparison that has to be honest for the product to be honest. */}
        <Card title="What it really costs">
          <Facts cols={2} items={[
            ['Cash today', money(asset.priceP)],
            ['Through a committee', money(plan.allIn)],
          ]} />
          <Notice kind="info" icon={<Info />}>
            {percent(plan.uplift)} more than cash, and all of it is Halqa's {money(FEE_PER_INSTALLMENT)}
            {' '}a month. The circle never charges you more than the price of the thing.
          </Notice>
        </Card>

        <RowGroup title="How it works">
          <Row chevron={false} icon={<Users />} title="One turn each"
               sub={rounds + ' members, ' + rounds + ' months'} />
          <Row chevron={false} icon={<CalendarDays />} title="Delivered together"
               sub="Everyone receives on the last day" />
          <Row chevron={false} icon={<Check />} title="Settle early if you want"
               sub="The plain amount left, no charge" />
        </RowGroup>
      </div>

      <BottomBar>
        <button className="primary full" onClick={() => setStep(1)}>Continue</button>
      </BottomBar>

      {picking && (
        <Sheet title="What are you saving for" onClose={() => setPicking(false)}
               search={find} onSearch={setFind}>
          {groups.map(g => (
            <div key={g}>
              <div className="w-sheet-group">{g}</div>
              {matches.filter(a => a.group === g).map(a => {
                const I = a.icon;
                return (
                  <SheetRow key={a.id} icon={<span className="w-row-icon"><I /></span>}
                            title={a.name}
                            sub={money(a.priceP) + (a.securable ? ' · can be handed over at your turn' : ' · delivered at the end')}
                            onClick={() => { setPick(a.id); setPicking(false); setFind(''); }} />
                );
              })}
            </div>
          ))}
          {!matches.length && (
            <div className="w-blank"><span><Search /></span><b>Nothing matches that</b></div>
          )}
        </Sheet>
      )}

      {months && (
        <Sheet title="Over how many months" onClose={() => setMonths(false)}>
          {ROUND_OPTIONS.map(r => (
            <SheetRow key={r} icon={<span className="w-row-icon"><CalendarDays /></span>}
                      title={r + ' months'}
                      sub={money(Math.ceil(asset.priceP / r)) + ' a month, ' + r + ' members'}
                      onClick={() => { setRounds(r); setMonths(false); }} />
          ))}
        </Sheet>
      )}
    </div>
  );
}
