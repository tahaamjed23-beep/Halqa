import { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight, Check, Copy, Eye, Globe, Info, MessageCircle, Phone,
  Plus, Search, Send, Users,
} from 'lucide-react';
import { api } from '../api';
import { money } from '../lib/format';
import type { Committee, User } from '../types';
import JoinByCode from '../components/JoinByCode';
import { CommitteeCard, cached, keep } from './HomePage';
import { formatDuration } from '../components/ui';
import {
  Blank, BottomBar, Card, Facts, Field, FlowHeader, Notice,
  Row, RowGroup, Segment, Sheet,
} from '../components/wallet';

// ---------------------------------------------------------------------------
// COMMITTEES
//
// Two tabs: the ones you are in, and the ones open to join. Everything else on
// the screen, the invite code box and the share sheet, is behind a button
// rather than stacked underneath, because a member opening this screen is
// nearly always looking for a circle they already have.
//
// Two failures used to surface as browser alerts: a refused join, and a bad
// invite code. Both are now shown in place, and joining no longer reloads the
// whole page to get back to the committee it just joined.
// ---------------------------------------------------------------------------

type Discover = {
  id: string; name: string; hostName: string; hostScore: number; memberCap: number;
  members: number; contributionPaisa: string; periodDays: number; status: string;
  listedPublicly: boolean; earlyFeeBps: number; openSlots: number[]; cleanStreak: number;
  startsAt: string; riskBand: string;
};

export default function CirclesPage({ user, openCommittee, create, joinCode, onJoinHandled }:
  { user: User; openCommittee: (id: string) => void; create: () => void; joinCode?: string | null; onJoinHandled?: () => void }) {
  const [tab, setTab] = useState<'mine' | 'discover'>('mine');
  const [mine, setMine] = useState<Committee[]>(() => cached('home.committees', []));
  const [rows, setRows] = useState<Discover[]>([]);
  const [code, setCode] = useState('');
  const [q, setQ] = useState('');
  const [publicOnly, setPublicOnly] = useState(true);
  const [invite, setInvite] = useState(false);
  const [codeSheet, setCodeSheet] = useState(false);
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    void api<Committee[]>('/committees?scope=mine').then(list => {
      const own = list.filter(r => r.members?.some(m => m.userId === user.id) || r.hostId === user.id);
      setMine(own); keep('home.committees', own);
    }).catch(() => {});
  }, [user.id]);
  useEffect(() => {
    void api<Discover[]>('/committees/discover').then(r => setRows(Array.isArray(r) ? r : [])).catch(() => setRows([]));
  }, []);

  const shown = useMemo(() => rows
    .filter(r => !publicOnly || r.listedPublicly)
    .filter(r => !q || r.name.toLowerCase().includes(q.toLowerCase())), [rows, publicOnly, q]);

  const link = 'https://halqa-seven.vercel.app/join/' + (mine[0]?.inviteCode || 'HALQA');
  const text = 'Assalam o alaikum. Join my committee on Halqa. Every instalment is recorded and you get a receipt for each one. ' + link;

  const share = async (via: string) => {
    const enc = encodeURIComponent(text);
    if (via === 'whatsapp') window.open('https://wa.me/?text=' + enc, '_blank');
    if (via === 'sms') window.location.href = 'sms:?&body=' + enc;
    if (via === 'contacts') {
      const nav = navigator as Navigator & { contacts?: { select: (p: string[], o: { multiple: boolean }) => Promise<{ tel?: string[]; name?: string[] }[]> } };
      if (nav.contacts?.select) {
        try {
          const picked = await nav.contacts.select(['name', 'tel'], { multiple: true });
          const numbers = picked.flatMap(c => c.tel || []).filter(Boolean);
          if (numbers.length) window.location.href = 'sms:' + numbers.join(',') + '?&body=' + enc;
        } catch { /* cancelled */ }
      } else if (navigator.share) { await navigator.share({ text, url: link }).catch(() => {}) }
      else { await navigator.clipboard.writeText(text); setCopied(true) }
    }
    if (via === 'copy') { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000) }
  };

  const join = async (id: string) => {
    setBusy(id); setError('');
    try { await api('/committees/' + id + '/join', { method: 'POST', body: JSON.stringify({}) }); openCommittee(id) }
    catch (e) { setError(e instanceof Error ? e.message : 'Could not join that circle') }
    finally { setBusy('') }
  };

  const joinByCode = async () => {
    setBusy('code'); setError('');
    try {
      const c = await api<Committee>('/committees/join/' + code, { method: 'POST' });
      setCodeSheet(false);
      if (c?.id) openCommittee(c.id);
    } catch (e) { setError(e instanceof Error ? e.message : 'That code did not work') }
    finally { setBusy('') }
  };

  return (
    <div className="w-screen">
      <JoinByCode initialCode={joinCode} onJoined={id => { onJoinHandled?.(); openCommittee(id) }} />

      <FlowHeader title="Committees" />
      <Segment value={tab} onChange={setTab} options={[
        { id: 'mine', label: 'Mine' },
        { id: 'discover', label: 'Discover' },
      ]} />

      <div className="w-screen-body">
        {error && <div className="w-inset"><Notice kind="bad" icon={<Info />}>{error}</Notice></div>}

        {tab === 'mine' ? (
          <>
            {mine.length ? (
              <div className="w-inset">
                {mine.map((c, i) => <CommitteeCard key={c.id} c={c} userId={user.id} i={i} open={openCommittee} />)}
              </div>
            ) : (
              <Blank icon={<Users />} title="No committees yet"
                     sub="Start one, or find an open circle."
                     action={<button className="primary" onClick={create}>Start one</button>} />
            )}

            <RowGroup title="Other ways in">
              <Row icon={<Copy />} title="Join with an invite code"
                   sub="From whoever invited you"
                   onClick={() => setCodeSheet(true)} />
              <Row icon={<Send />} title="Invite people to a committee"
                   sub="WhatsApp, contacts or a link"
                   onClick={() => setInvite(true)} />
            </RowGroup>
          </>
        ) : (
          <>
            <div className="w-search">
              <Search />
              <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search circles" />
            </div>

            <RowGroup>
              <Row chevron={false} icon={<Globe />} title="Public circles only"
                   sub="Anyone can find these"
                   value={publicOnly ? 'On' : 'Off'} tone={publicOnly ? 'ok' : undefined}
                   onClick={() => setPublicOnly(!publicOnly)} />
            </RowGroup>

            {publicOnly && (
              <div className="w-inset">
                <Notice kind="info" icon={<Eye />}>
                  Join one and that circle sees your name, area and credit score.
                </Notice>
              </div>
            )}

            {shown.length ? (
              <div className="w-inset">
                {shown.map(r => (
                  <DiscoverRow key={r.id} r={r} busy={busy === r.id} join={() => void join(r.id)} />
                ))}
              </div>
            ) : (
              <Blank icon={<Globe />} title="Nothing open right now"
                     sub="New circles open every week." />
            )}
          </>
        )}
      </div>

      <BottomBar>
        <button className="primary full" onClick={create}><Plus /> Start a committee</button>
      </BottomBar>

      {codeSheet && (
        <Sheet title="Join with a code" onClose={() => { setCodeSheet(false); setError('') }}>
          <Field label="Invite code" hint="">
            <input className="mono w-code" value={code} maxLength={8} placeholder="ABCD12"
                   onChange={e => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))} />
          </Field>
          {error && <div className="w-inset"><Notice kind="bad" icon={<Info />}>{error}</Notice></div>}
          <BottomBar>
            <button className="primary full" disabled={code.length < 4 || busy === 'code'} onClick={joinByCode}>
              {busy === 'code' ? 'Joining' : 'Join'}
            </button>
          </BottomBar>
        </Sheet>
      )}

      {invite && (
        <Sheet title="Invite people" onClose={() => setInvite(false)}>
          <div className="w-inset" style={{ paddingTop: 10 }}>
            <Notice kind="info" icon={<Info />}>
              The link opens straight onto your circle.
            </Notice>
          </div>
          <div className="w-shares">
            <button onClick={() => void share('whatsapp')}><i className="sh-wa"><MessageCircle /></i><span>WhatsApp</span></button>
            <button onClick={() => void share('contacts')}><i className="sh-co"><Users /></i><span>Contacts</span></button>
            <button onClick={() => void share('sms')}><i className="sh-sm"><Phone /></i><span>Messages</span></button>
            <button onClick={() => void share('copy')}><i className="sh-cp"><Copy /></i><span>{copied ? 'Copied' : 'Copy link'}</span></button>
          </div>
        </Sheet>
      )}
    </div>
  );
}

/** One open circle, compact enough that three fit on a phone screen. */
function DiscoverRow({ r, busy, join }: { r: Discover; busy: boolean; join: () => void }) {
  const left = r.memberCap - r.members;
  const initials = r.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  return (
    <Card>
      <div className="disc-head">
        <span className="disc-badge">{initials}</span>
        <div className="disc-id">
          <b>{r.name}</b>
          <span>{r.hostName} · credit score {r.hostScore}</span>
        </div>
        {r.listedPublicly && <em className="disc-pub"><Globe />Public</em>}
      </div>
      <Facts cols={3} items={[
        ['Instalment', money(r.contributionPaisa)],
        ['Places left', left > 0 ? String(left) : 'Full'],
        ['Starts', formatDuration(r.startsAt)],
      ]} />
      {r.cleanStreak > 0 && (
        <p className="disc-clean"><Check />{r.cleanStreak} clean turns so far</p>
      )}
      <button className="primary full" disabled={busy || left <= 0} onClick={join}>
        {busy ? 'Joining' : left > 0 ? <>Join this circle <ArrowRight /></> : 'Full'}
      </button>
    </Card>
  );
}
