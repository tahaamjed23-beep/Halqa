import { useEffect, useState } from 'react';
import { BadgeCheck, Banknote, Building2, Check, CreditCard, IdCard, MapPin, Phone, Wallet } from 'lucide-react';
import { api } from '../api';
import type { Page, User } from '../types';
import { Blank, FlowHeader, Row, RowGroup } from '../components/wallet';

// ---------------------------------------------------------------------------
// VERIFICATION
//
// Every check Halqa has run on this account, in one place, with the ones still
// open at the top and what each of them unlocks. Before this the member could
// only find out what was missing by hitting the thing it blocked.
// ---------------------------------------------------------------------------

type Check = {
  id: string; title: string; unlocks: string; icon: JSX.Element;
  done: boolean; go?: Page;
};

export default function VerifyPage({ user, back, go }:
  { user: User; back?: () => void; go?: (page: Page) => void }) {

  const [methods, setMethods] = useState<number | null>(null);
  useEffect(() => {
    void api<{ methods?: unknown[] }>('/profile/payment-methods')
      .then(r => setMethods((r.methods || []).length)).catch(() => setMethods(0));
  }, []);

  const checks: Check[] = [
    { id: 'phone', title: 'Mobile number', unlocks: 'Signing in and every reminder',
      icon: <Phone />, done: !!user.phoneVerified },
    { id: 'pin', title: 'App PIN', unlocks: 'Opening the app',
      icon: <Check />, done: !!user.hasPin, go: 'settings' },
    { id: 'cnic', title: 'CNIC', unlocks: 'Joining and hosting',
      icon: <IdCard />, done: !!user.cnicCaptured || !!user.cnic, go: 'profile' },
    { id: 'address', title: 'Address and city', unlocks: 'Circles near you',
      icon: <MapPin />, done: !!user.addressLine && !!user.city, go: 'profile' },
    { id: 'work', title: 'Work', unlocks: 'Circles matched to your income',
      icon: <Building2 />, done: !!user.occupationType, go: 'profile' },
    { id: 'method', title: 'A payment method', unlocks: 'Paying without leaving the app',
      icon: <CreditCard />, done: !!methods, go: 'cards' },
    { id: 'bank', title: 'Bank account', unlocks: 'Receiving your payout',
      icon: <Wallet />, done: !!user.bankVerifiedAt, go: 'cards' },
    { id: 'income', title: 'Income', unlocks: 'A fee discount and larger circles',
      icon: <Banknote />, done: !!user.incomeVerifiedAt, go: 'profile' },
    { id: 'early', title: 'Early-turn clearance', unlocks: 'Taking one of the first turns',
      icon: <BadgeCheck />, done: !!user.earlyTurnVerifiedAt || !!user.earlyTurnUnlocked },
  ];

  const open = checks.filter(c => !c.done);
  const done = checks.filter(c => c.done);
  const discount = (user.feeDiscountBps || 0) / 100;

  return (
    <div className="w-screen">
      <FlowHeader title="Verification" onBack={back} />
      <div className="w-screen-body">

        <div className="w-hero">
          <span>Verified</span>
          <strong>{done.length} of {checks.length}</strong>
          <small>
            Level {user.kycLevel}
            {discount > 0 ? ' · ' + discount + '% off your fees' : ''}
          </small>
        </div>

        {open.length > 0 && (
          <RowGroup title={open.length === 1 ? 'One thing left' : open.length + ' still to do'}>
            {open.map(c => (
              <Row key={c.id} icon={c.icon} title={c.title} sub={c.unlocks}
                   value="Do it" tone="warn"
                   onClick={c.go && go ? () => go(c.go as Page) : undefined} />
            ))}
          </RowGroup>
        )}

        {done.length > 0 && (
          <RowGroup title="Done">
            {done.map(c => (
              <Row key={c.id} chevron={false} icon={c.icon} title={c.title}
                   sub={c.unlocks} value="Verified" tone="ok" />
            ))}
          </RowGroup>
        )}

        {open.length === 0 && (
          <Blank icon={<BadgeCheck />} title="Fully verified"
                 sub="Nothing is holding your account back." />
        )}
      </div>
    </div>
  );
}
