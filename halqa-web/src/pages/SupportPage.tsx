import { useEffect, useState } from 'react';
import {
  ChevronRight, CircleHelp, Info, LifeBuoy, MessageSquare, Search, Send, ShieldAlert,
} from 'lucide-react';
import { api } from '../api';
import { dateShort } from '../lib/format';
import {
  Blank, BottomBar, Card, Field, FlowHeader, Notice, Row, RowGroup, Segment, Sheet, SheetRow,
} from '../components/wallet';
import { RAFA_KB } from '../components/rafa-knowledge';

// ---------------------------------------------------------------------------
// HELP
//
// The one screen every wallet a Pakistani member already uses has, and Halqa
// did not. Its whole support offering was an email address on a settings page,
// which is not a route somebody in trouble takes: they want to say "this is
// wrong", get a reference back, and be able to check on it later.
//
// Three things live here. The answers, which are the same ones Rafa knows, so
// there is one set of facts and not two. A case, with a reference. And the
// cases already open, so a member can see what happened to them.
// ---------------------------------------------------------------------------

type Message = { id: string; author: 'MEMBER' | 'HALQA'; body: string; createdAt: string };
type Ticket = {
  id: string; reference: string; category: string; subject: string; body: string;
  status: 'OPEN' | 'ANSWERED' | 'RESOLVED' | 'CLOSED';
  paymentId: string | null; committeeId: string | null;
  createdAt: string; messages?: Message[];
};

const CATEGORIES: [string, string][] = [
  ['PAYMENT', 'A payment of mine'],
  ['PAYOUT', 'A payout I was owed'],
  ['CIRCLE', 'A committee I am in'],
  ['ACCOUNT', 'My account or identity'],
  ['QUESTION', 'A question about Halqa'],
  ['OTHER', 'Something else'],
];
const CATEGORY_WORD: Record<string, string> = Object.fromEntries(CATEGORIES);

const STATUS_WORD: Record<string, string> = {
  OPEN: 'With us', ANSWERED: 'Answered', RESOLVED: 'Resolved', CLOSED: 'Closed',
};

export default function SupportPage({ back, disputePaymentId }:
  { back?: () => void; disputePaymentId?: string | null }) {
  const [tab, setTab] = useState<'answers' | 'cases'>(disputePaymentId ? 'cases' : 'answers');
  const [find, setFind] = useState('');
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [open, setOpen] = useState<Ticket | null>(null);
  const [raising, setRaising] = useState(!!disputePaymentId);
  const [category, setCategory] = useState(disputePaymentId ? 'PAYMENT' : 'QUESTION');
  const [catSheet, setCatSheet] = useState(false);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [reply, setReply] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [answer, setAnswer] = useState<{ q: string; a: string } | null>(null);

  const load = () => api<{ tickets: Ticket[] }>('/support/tickets')
    .then(d => setTickets(Array.isArray(d?.tickets) ? d.tickets : [])).catch(() => {});
  useEffect(() => { void load() }, []);

  const raise = async () => {
    setBusy(true); setError('');
    try {
      const t = await api<Ticket>('/support/tickets', {
        method: 'POST',
        body: JSON.stringify({
          category, subject: subject.trim(), body: body.trim(),
          paymentId: disputePaymentId || undefined,
        }),
      });
      setRaising(false); setSubject(''); setBody(''); setTab('cases');
      await load(); setOpen(t);
    } catch (reason) { setError((reason as Error).message) }
    finally { setBusy(false) }
  };

  const send = async () => {
    if (!open) return;
    setBusy(true); setError('');
    try {
      const t = await api<Ticket>('/support/tickets/' + open.id + '/reply',
        { method: 'POST', body: JSON.stringify({ body: reply.trim() }) });
      setOpen(t); setReply(''); await load();
    } catch (reason) { setError((reason as Error).message) }
    finally { setBusy(false) }
  };

  // The answers are Rafa's, so there is one set of facts in the product rather
  // than a help page that drifts away from what the assistant says.
  const q = find.trim().toLowerCase();
  const answers = RAFA_KB
    .filter(k => k.cat !== 'Chat')
    .filter(k => !q || k.q.toLowerCase().includes(q) || k.a.toLowerCase().includes(q)
      || k.k.some(word => word.includes(q)));
  const groups = Array.from(new Set(answers.map(a => a.cat)));

  // ---- one case, opened -----------------------------------------------------
  if (open) {
    return (
      <div className="w-screen">
        <FlowHeader title={open.reference} onBack={() => setOpen(null)} />
        <div className="w-screen-body">
          <Card>
            <div className="sup-head">
              <div><b>{open.subject}</b><small>{CATEGORY_WORD[open.category] || open.category} · {dateShort(open.createdAt)}</small></div>
              <em className={'sup-status s-' + open.status.toLowerCase()}>{STATUS_WORD[open.status]}</em>
            </div>
          </Card>
          <div className="sup-thread">
            {(open.messages || []).map(m => (
              <div key={m.id} className={'sup-msg' + (m.author === 'MEMBER' ? ' mine' : '')}>
                <p>{m.body}</p>
                <small>{m.author === 'MEMBER' ? 'You' : 'Halqa'} · {dateShort(m.createdAt)}</small>
              </div>
            ))}
          </div>
          {open.status === 'CLOSED' ? (
            <div className="w-inset">
              <Notice kind="info" icon={<Info />}>This case is closed. Open a new one and quote {open.reference}.</Notice>
            </div>
          ) : (
            <>
              <Field label="Add to this case">
                <textarea rows={3} value={reply} placeholder="Anything else we should know"
                          onChange={e => setReply(e.target.value)} />
              </Field>
              {error && <div className="w-inset"><Notice kind="bad" icon={<Info />}>{error}</Notice></div>}
              <BottomBar>
                <button className="primary full" disabled={busy || reply.trim().length < 2} onClick={send}>
                  <Send /> {busy ? 'Sending' : 'Send'}
                </button>
              </BottomBar>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-screen">
      <FlowHeader title="Help" onBack={back} />
      <Segment value={tab} onChange={setTab} options={[
        { id: 'answers', label: 'Answers' },
        { id: 'cases', label: tickets.length ? 'Your cases (' + tickets.length + ')' : 'Your cases' },
      ]} />

      <div className="w-screen-body">
        {tab === 'answers' ? (
          <>
            <div className="w-search">
              <Search />
              <input aria-label="Search help" value={find} onChange={e => setFind(e.target.value)}
                     placeholder="What do you need help with" />
            </div>
            {answers.length ? groups.map(g => (
              <RowGroup key={g} title={g}>
                {answers.filter(a => a.cat === g).map(a => (
                  <Row key={a.id} icon={<CircleHelp />} title={a.q}
                       onClick={() => setAnswer({ q: a.q, a: a.a })} />
                ))}
              </RowGroup>
            )) : (
              <Blank icon={<Search />} title="No answer for that yet"
                     sub="Open a case and a person will read it."
                     action={<button className="primary" onClick={() => setRaising(true)}>Open a case</button>} />
            )}
          </>
        ) : (
          <>
            {tickets.length ? (
              <RowGroup title="Everything you have raised">
                {tickets.map(t => (
                  <Row key={t.id} icon={<MessageSquare />} title={t.subject}
                       sub={t.reference + ' · ' + dateShort(t.createdAt)}
                       value={STATUS_WORD[t.status]}
                       tone={t.status === 'RESOLVED' ? 'ok' : t.status === 'OPEN' ? 'warn' : undefined}
                       onClick={() => setOpen(t)} />
                ))}
              </RowGroup>
            ) : (
              <Blank icon={<LifeBuoy />} title="You have not raised anything"
                     sub="If a payment looks wrong, or anything else does, tell us and you get a reference to quote." />
            )}
          </>
        )}

        <RowGroup title="Other ways to reach us">
          <Row chevron={false} icon={<LifeBuoy />} title="support@halqa.pk" sub="Answered within two working days" />
          <Row chevron={false} icon={<ShieldAlert />} title="security@halqa.pk" sub="Anything about safety or fraud" />
        </RowGroup>
      </div>

      <BottomBar>
        <button className="primary full" onClick={() => setRaising(true)}>
          <MessageSquare /> {disputePaymentId ? 'Dispute this payment' : 'Open a case'}
        </button>
      </BottomBar>

      {/* ---- one answer ---- */}
      {answer && (
        <Sheet title={answer.q} onClose={() => setAnswer(null)}>
          <div className="w-inset" style={{ paddingTop: 10 }}>
            <p className="w-body">{answer.a}</p>
          </div>
          <BottomBar>
            <button className="secondary" onClick={() => setAnswer(null)}>That helps</button>
            <button className="primary full" onClick={() => { setAnswer(null); setRaising(true) }}>
              Still stuck
            </button>
          </BottomBar>
        </Sheet>
      )}

      {/* ---- raise one ---- */}
      {raising && (
        <Sheet title={disputePaymentId ? 'Dispute a payment' : 'Open a case'} onClose={() => setRaising(false)}>
          {disputePaymentId && (
            <div className="w-inset" style={{ paddingTop: 10 }}>
              <Notice kind="warn" icon={<ShieldAlert />}>
                This is raised against that one payment. Halqa reads the ledger entry alongside what you write.
              </Notice>
            </div>
          )}
          <label className="w-field">
            <span className="w-field-label">What is it about</span>
            <button type="button" className="w-picker" onClick={() => setCatSheet(true)}>
              <span className="w-picker-value">{CATEGORY_WORD[category]}</span>
              <ChevronRight />
            </button>
          </label>
          <Field label="In one line">
            <input aria-label="What happened" value={subject} maxLength={120} placeholder="What happened"
                   onChange={e => setSubject(e.target.value)} />
          </Field>
          <Field label="Tell us properly" hint="Dates, amounts and names help.">
            <textarea rows={5} value={body} placeholder="What you expected, and what happened instead"
                      onChange={e => setBody(e.target.value)} />
          </Field>
          {error && <div className="w-inset"><Notice kind="bad" icon={<Info />}>{error}</Notice></div>}
          <BottomBar>
            <button className="primary full"
                    disabled={busy || subject.trim().length < 3 || body.trim().length < 5}
                    onClick={raise}>
              {busy ? 'Sending' : 'Send it'}
            </button>
          </BottomBar>
        </Sheet>
      )}

      {catSheet && (
        <Sheet title="What is it about" onClose={() => setCatSheet(false)}>
          {CATEGORIES.map(([id, label]) => (
            <SheetRow key={id} icon={<span className="w-row-icon"><CircleHelp /></span>} title={label}
                      onClick={() => { setCategory(id); setCatSheet(false) }} />
          ))}
        </Sheet>
      )}
    </div>
  );
}
