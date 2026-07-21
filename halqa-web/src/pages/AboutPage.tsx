import { HandCoins, Landmark, ShieldCheck, Users } from 'lucide-react';
import { HalqaOrb } from '../components/ui';

// About Halqa — mission, the kameti tradition, and the numbers. Reached by
// tapping the Halqa mark anywhere in the shell.
export default function AboutPage(){
  return <div className="page narrow enter">
    <section className="about-hero"><HalqaOrb/><span className="eyebrow">About Halqa</span><h1>The committee you trust,<br/>finally written down.</h1>
    <p>For generations, Pakistani families have saved through the kameti — a circle of people, a fixed amount, one member collecting the pool each round. It runs on trust, and it works — until memory fails, a register goes missing, or someone walks away with the pot. Halqa keeps everything that makes the committee beautiful and adds the one thing it never had: a record that cannot be argued with.</p></section>

    <section className="stat-band">
      <div><strong>Rs 1&nbsp;trillion+</strong><span>estimated moving through informal committees in Pakistan every year</span></div>
      <div><strong>1 in 3</strong><span>saving adults in Pakistan use a committee as their main savings tool</span></div>
      <div><strong>100M+</strong><span>adults with committee discipline but no formal credit footprint</span></div>
      <div><strong>Rs 0</strong><span>what a member ever pays Halqa — the app is free, always</span></div>
    </section>

    <section className="panel"><div className="panel-head"><div><span className="eyebrow">Our mission</span><h2>Formalise the oldest financial habit in Pakistan</h2></div><Landmark/></div>
      <p className="muted" style={{fontSize:13.5,lineHeight:1.8}}>Halqa exists to turn the handshake into a record. Every contribution, every turn, every promise — written down, timestamped, and tied to a real identity. When a committee is recorded, three things happen: cheating gets hard, trust gets portable, and a lifetime of on-time payments finally counts for something. A khala in Lyari who has never missed a kameti payment in twenty years deserves proof of it.</p>
    </section>

    <div className="detail-grid">
      <section className="panel"><div className="panel-head"><div><span className="eyebrow">Our goal</span><h2>Every circle, on the record</h2></div><Users/></div>
        <p className="muted" style={{fontSize:13,lineHeight:1.75}}>A million recorded circles. Turn order that is earned, not argued. Payments that collect themselves. And a reliability score that opens doors — a rental, a job, a loan — for people banks have never seen.</p>
      </section>
      <section className="panel"><div className="panel-head"><div><span className="eyebrow">Our promise</span><h2>Your money never touches us</h2></div><ShieldCheck/></div>
        <p className="muted" style={{fontSize:13,lineHeight:1.75}}>Money moves member to member, on the rails you already use. Halqa records, schedules and enforces — it does not hold. Your data is yours: nothing is shared without a switch you flip yourself.</p>
      </section>
    </div>

    <section className="panel"><div className="panel-head"><div><span className="eyebrow">Why now</span><h2>The cost of no records</h2></div><HandCoins/></div>
      <p className="muted" style={{fontSize:13.5,lineHeight:1.8}}>In 2022, a single collapsed online committee network took an estimated Rs 420 million of ordinary savers' money — and the members had nothing: no ledger, no agreement, no evidence a court could use. That is not a story about bad people. It is a story about missing infrastructure. Halqa is that infrastructure: identity at signup, a double-entry ledger under every rupee, agreements accepted and timestamped, and a safety system that makes defaulting harder than paying.</p>
    </section>
  </div>;
}
