import { AlertTriangle, Clock, Coins, Repeat, ShieldCheck, Users } from 'lucide-react';
import { FlowHeader, Row, RowGroup } from '../components/wallet';
import { SERVICE_FEE_RUPEES, PSP_FEE_BPS } from '../lib/fees';

// ---------------------------------------------------------------------------
// FEES AND CHARGES
//
// Every wallet in Pakistan publishes a schedule of charges and Halqa did not,
// so the only way to learn what a late payment costs was to be late. Each line
// here is a rule the code actually enforces; nothing is rounded for effect.
//
// Corrected 5 October 2026. The screen had shown no service fee at all, an
// early turn fee "paid to the other members", turn selling at "whatever the
// buyer bids", and a Hyper bid ceiling with an annual rate cap. The early turn
// fee and the bidding are withdrawn; the fee is Rs 85 and is the same for every
// seat; the prices come from lib/fees.ts, so this screen cannot drift from the
// Pay screen.
// ---------------------------------------------------------------------------

export default function FeesPage({ back }: { back?: () => void }) {
  return (
    <div className="w-screen">
      <FlowHeader title="Fees and charges" onBack={back} />
      <div className="w-screen-body">

        <RowGroup title="What you pay on every instalment">
          <Row chevron={false} icon={<Coins />} title="Halqa fee"
               sub="The same for every seat, whatever the instalment and whatever the circle"
               value={`Rs ${SERVICE_FEE_RUPEES}`} />
          <Row chevron={false} icon={<Repeat />} title="Payment service fee"
               sub="Charged by the payment partner on wallet and card payments only. Paying from a bank account carries none"
               value={`${PSP_FEE_BPS / 100}%`} />
          <Row chevron={false} icon={<ShieldCheck />} title="Takaful or insurance"
               sub="On circles between strangers and on Hyper. The operator sets it and the bank chooses the operator; it is no part of Halqa's fee"
               value="Set by the operator" />
        </RowGroup>

        <RowGroup title="Paying late">
          <Row chevron={false} icon={<Clock />} title="1 to 3 days late"
               sub="Of your instalment" value="2%" tone="warn" />
          <Row chevron={false} icon={<Clock />} title="4 days to the end of grace"
               sub="Of your instalment" value="5%" tone="warn" />
          <Row chevron={false} icon={<AlertTriangle />} title="Past the grace period"
               sub="Of your instalment" value="10%" tone="bad" />
          <Row chevron={false} icon={<ShieldCheck />} title="Grace period"
               sub="Set by the host, 5 days unless changed" value="5 days" />
        </RowGroup>

        <RowGroup title="Turns">
          <Row chevron={false} icon={<Coins />} title="Taking an earlier turn"
               sub="There is no charge for the turn you are given. Which turns are open to you depends on your record, not on a payment"
               value="No charge" tone="ok" />
          <Row chevron={false} icon={<Repeat />} title="Selling a turn"
               sub="Priced in points, agreed between the two members and approved by the host. Never more than the pot"
               value="Up to 100% of the pot" />
          <Row chevron={false} icon={<Users />} title="Halqa fills empty seats"
               sub="Shown on the circle before anybody joins" value="Per circle" />
        </RowGroup>

        <RowGroup title="Hyper">
          <Row chevron={false} icon={<Coins />} title="Halqa fee"
               sub="A flat fee on each daily payment, the same on both circles and on every day"
               value="Rs 15 a day" />
          <Row chevron={false} icon={<ShieldCheck />} title="Takaful or insurance"
               sub="Part of each daily payment, set by the operator and paid to them"
               value="Set by the operator" />
        </RowGroup>

        <RowGroup title="Nothing is charged for">
          <Row chevron={false} icon={<ShieldCheck />} title="Opening an account" value="Free" tone="ok" />
          <Row chevron={false} icon={<ShieldCheck />} title="Joining a circle" value="Free" tone="ok" />
          <Row chevron={false} icon={<ShieldCheck />} title="Receipts and statements" value="Free" tone="ok" />
          <Row chevron={false} icon={<ShieldCheck />} title="Leaving before a circle starts" value="Free" tone="ok" />
        </RowGroup>

        <p className="w-foot">
          The management fee is set per circle and shown on that circle before you join.
          Penalties are fixed percentages of one instalment. Nothing compounds.
        </p>
      </div>
    </div>
  );
}
