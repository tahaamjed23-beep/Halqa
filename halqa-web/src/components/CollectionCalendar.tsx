import { CalendarClock } from 'lucide-react';
import { dateShort, money, when } from '../lib/format';

// ---------------------------------------------------------------------------
// When money will actually be taken, and what happens if it is not there.
//
// Collection was invisible: a member knew an amount was due but not when the
// attempt would run, what happens on a failure, or when the ladder starts. On a
// daily or monthly mandate that is the difference between keeping a balance
// ready and being surprised by a penalty.
//
// The due date is the deadline, not the collection event. The attempt runs on
// payday morning, while the balance is at its highest and before the money is
// spent, and the retry ladder runs from there to the deadline.
// ---------------------------------------------------------------------------

type Step = { at: string; label: string; note: string; tone?: 'now' | 'warn' | 'bad' };

export function CollectionCalendar({ dueAt, amountPaisa, paydayAt, graceDays = 0 }:
  { dueAt: string; amountPaisa: string | number; paydayAt?: string | null; graceDays?: number }) {
  const due = new Date(dueAt);
  const day = 86_400_000;

  const steps: Step[] = [];
  if (paydayAt) {
    steps.push({
      at: paydayAt, label: 'Balance check',
      note: 'The evening before, Halqa checks there is enough and tells you if there is not.',
    });
    steps.push({
      at: paydayAt, label: 'Collection runs', tone: 'now',
      note: 'On payday morning, while the balance is at its highest.',
    });
  } else {
    steps.push({
      at: new Date(due.getTime() - 2 * day).toISOString(), label: 'Balance check',
      note: 'Halqa checks there is enough and tells you if there is not.',
    });
    steps.push({
      at: new Date(due.getTime() - day).toISOString(), label: 'Collection runs', tone: 'now',
      note: 'The first attempt, a day before the deadline.',
    });
  }
  steps.push({ at: dueAt, label: 'Deadline', tone: 'warn', note: 'The last moment it can arrive without a late mark.' });
  if (graceDays > 0) {
    steps.push({
      at: new Date(due.getTime() + graceDays * day).toISOString(), label: 'Retries end', tone: 'bad',
      note: 'After this the late-fee ladder applies and your score is affected.',
    });
  }

  return (
    <section className="panel">
      <div className="panel-head">
        <div><h2>When this is collected</h2><p>{money(amountPaisa)} · due {when(dueAt)}</p></div>
        <CalendarClock />
      </div>
      <div className="cal-steps">
        {steps.map((s, i) => (
          <div key={i} className={`cal-step${s.tone ? ' ' + s.tone : ''}`}>
            <i />
            <div>
              <b>{s.label}</b>
              <span>{dateShort(s.at)} · {s.note}</span>
            </div>
          </div>
        ))}
      </div>
      <p className="cal-note">
        Keep the balance available and there is nothing to do. Halqa takes it automatically and
        sends you a receipt.
      </p>
    </section>
  );
}

export default CollectionCalendar;
