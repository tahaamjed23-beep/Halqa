import { useState } from 'react';
import { Copy, Gift, MessageCircle, Share2, UserPlus, Users } from 'lucide-react';
import type { Page, User } from '../types';
import { FlowHeader, Row, RowGroup } from '../components/wallet';

// ---------------------------------------------------------------------------
// REFER
//
// A committee is a group of people who already trust each other, so the way
// Halqa grows is one member bringing the rest of their circle. There was no
// screen for that: invites only existed inside a committee that already
// existed, which is the wrong way round for someone with nobody on the app yet.
// ---------------------------------------------------------------------------

const LINE = (code: string) =>
  'Join me on Halqa, the committee app. Every turn, payment and payout is '
  + 'recorded, so nobody has to keep the register in a notebook. My code is '
  + code + '. https://halqa-seven.vercel.app/?ref=' + code;

export default function ReferPage({ user, back, go }:
  { user: User; back?: () => void; go?: (page: Page) => void }) {
  const [copied, setCopied] = useState('');

  const code = (user.username || user.id).toUpperCase();
  const copy = async (what: string, text: string) => {
    try { await navigator.clipboard.writeText(text); setCopied(what); setTimeout(() => setCopied(''), 1800) }
    catch { /* a phone with no clipboard permission still has the WhatsApp button */ }
  };

  return (
    <div className="w-screen">
      <FlowHeader title="Invite people" onBack={back} />
      <div className="w-screen-body">

        <div className="w-hero">
          <span>Your code</span>
          <strong>{code}</strong>
          <small>Anyone who signs up with it is linked to you.</small>
        </div>

        <RowGroup title="Send it">
          <Row icon={<MessageCircle />} title="WhatsApp"
               sub="Opens WhatsApp with the message ready"
               onClick={() => window.open('https://wa.me/?text=' + encodeURIComponent(LINE(code)), '_blank')} />
          <Row icon={<Share2 />} title="Share"
               sub="Anywhere else on your phone"
               onClick={() => {
                 const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> };
                 if (nav.share) void nav.share({ text: LINE(code) });
                 else void copy('message', LINE(code));
               }} />
          <Row icon={<Copy />} title={copied === 'code' ? 'Copied' : 'Copy the code'}
               sub={code} tone={copied === 'code' ? 'ok' : undefined}
               onClick={() => copy('code', code)} />
        </RowGroup>

        <RowGroup title="What happens next">
          <Row chevron={false} icon={<UserPlus />} title="They sign up"
               sub="With your code, on their own number" />
          <Row chevron={false} icon={<Users />} title="You start a circle together"
               sub="Or they join one of yours with the invite code" />
          <Row chevron={false} icon={<Gift />} title="Both records grow"
               sub="Every payment either of you makes on time builds both scores" />
        </RowGroup>

        {go && (
          <div className="w-inset">
            <button className="primary" onClick={() => go('create')}>Start a committee</button>
          </div>
        )}
      </div>
    </div>
  );
}
