import { HandCoins, Landmark, ShieldCheck, Users } from 'lucide-react';
import { HalqaOrb } from '../components/ui';
import { Card, Facts, FlowHeader } from '../components/wallet';

// About Halqa: the kameti tradition, what is missing from it, and what Halqa
// adds. Reached from the account menu, or by tapping the Halqa mark.
export default function AboutPage({ back }: { back?: () => void }) {
  return (
    <div className="w-screen">
      <FlowHeader title="About Halqa" onBack={back} />

      <section className="about-band">
        <HalqaOrb />
        <h2>The committee you trust, finally written down.</h2>
        <p>
          For generations Pakistani families have saved through the kameti: a circle of people, a
          fixed amount, one member collecting the pool each turn. It runs on trust, and it works,
          until memory fails, a register goes missing, or somebody walks away with the pot. Halqa
          keeps everything that makes the committee good and adds the one thing it never had, a
          record that cannot be argued with.
        </p>
      </section>

      <div className="w-screen-body">
        <Card title="The scale of it">
          <Facts cols={2} items={[
            ['Through committees a year', 'Rs 1 trillion'],
            ['Saving adults who use one', '1 in 3'],
            ['Adults with no credit file', 'Over 100 million'],
            ['What a member pays Halqa', 'Rs 0'],
          ]} />
        </Card>

        <Card title="What we are for" action={<Landmark />}>
          <p className="w-body">
            Halqa turns the handshake into a record. Every contribution, every turn, every promise,
            written down, timestamped and tied to a real identity. When a committee is recorded
            three things happen: cheating gets hard, trust becomes portable, and a lifetime of
            on-time payments finally counts for something. A khala in Lyari who has not missed a
            kameti payment in twenty years deserves proof of it.
          </p>
        </Card>

        <Card title="What we are aiming at" action={<Users />}>
          <p className="w-body">
            A million recorded circles. Turn order that is earned rather than argued over.
            Payments that collect themselves. And a reliability score that opens a rental, a job
            or a loan for people the banks have never seen.
          </p>
        </Card>

        <Card title="Your money never touches us" action={<ShieldCheck />}>
          <p className="w-body">
            Money moves member to member, on the rails you already use. Halqa records, schedules
            and enforces; it does not hold. Your data is yours, and nothing is shared without a
            switch you turn on yourself.
          </p>
        </Card>

        <Card title="Why this needs to exist" action={<HandCoins />}>
          <p className="w-body">
            One collapsed online committee network took an estimated Rs 420 million of ordinary
            savers' money, and the members had nothing: no ledger, no agreement, no evidence a
            court could use. That is not a story about bad people, it is a story about missing
            infrastructure. Halqa is that infrastructure: identity at signup, a double-entry
            ledger under every rupee, agreements accepted and timestamped, and a safety system
            that makes defaulting harder than paying.
          </p>
        </Card>
      </div>
    </div>
  );
}
