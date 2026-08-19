import { useEffect, useState } from 'react';
import { FileText, ShieldCheck } from 'lucide-react';
import { api } from '../api';
import { dateTime } from '../lib/format';

// ---------------------------------------------------------------------------
// A member signs a weekly undertaking and a mutual guarantee per circle, and
// until now had no way to read either one again. You cannot ask somebody to
// stand behind a legal promise and then hide it from them.
//
// Every document gets a plain-language summary above the legal text, because
// the text is a lawyer-unreviewed template and reads like one.
// ---------------------------------------------------------------------------

// /agreements/status returns the platform undertaking for the member. The
// mutual guarantee is per committee and needs a committeeId, so it is read
// from each committee rather than listed here.
type Status = { undertaking?: { signedAt: string | null; expiresAt: string | null; fresh: boolean } | null };
type Signed = { doc: string; signedAt: string; expiresAt?: string | null; fresh?: boolean };

const PLAIN: Record<string, { title: string; summary: string }> = {
  PLATFORM_UNDERTAKING: {
    title: 'Platform undertaking',
    summary: 'You confirm the payments you owe are a real debt, you allow Halqa to collect them '
           + 'automatically from the account you linked, and you allow your repayment record to be '
           + 'shared with a credit bureau if you consent. It is renewed weekly.',
  },
  MUTUAL_PG: {
    title: 'Mutual member guarantee',
    summary: 'You and the other members guarantee each other, not Halqa. If someone stops paying, '
           + 'the group carries it between themselves. Halqa never becomes your creditor.',
  },
};

export function MyAgreements() {
  const [rows, setRows] = useState<Signed[]>([]);
  const [open, setOpen] = useState<string | null>(null);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const status = await api<Status>('/agreements/status');
        if (!alive) return;
        const u = status.undertaking;
        setRows(u?.signedAt ? [{ doc: 'PLATFORM_UNDERTAKING', signedAt: u.signedAt, expiresAt: u.expiresAt, fresh: u.fresh }] : []);
      } catch { /* nothing signed yet, or offline */ }
      finally { if (alive) setLoading(false); }
    })();
    return () => { alive = false; };
  }, []);

  const show = async (doc: string) => {
    if (open === doc) { setOpen(null); return; }
    setOpen(doc); setText('');
    try { setText((await api<{ text: string }>(`/agreements/text?doc=${doc}`)).text); }
    catch { setText('This document could not be loaded right now.'); }
  };

  return (
    <section className="panel">
      <div className="panel-head"><div><h2>Your agreements</h2><p>What you signed, and when.</p></div><ShieldCheck /></div>

      {loading && <div className="chart-skeleton" style={{ height: 72 }} />}

      {!loading && !rows.length && (
        <div className="empty-state">
          <FileText />
          <p>You have not signed anything yet.</p>
        </div>
      )}

      <p className="agreement-note">
        The mutual guarantee is signed separately for each committee. Open a committee to read the one you signed there.
      </p>

      <div className="settings-body">
        {rows.map(r => {
          const plain = PLAIN[r.doc] || { title: r.doc, summary: '' };
          return (
            <div key={r.doc}>
              <button className="settings-row" onClick={() => void show(r.doc)}>
                <FileText />
                <span className="settings-row-text">
                  <b>{plain.title}</b>
                  <small>Signed {dateTime(r.signedAt)}{r.fresh === false ? ' · renewal due' : ''}</small>
                </span>
              </button>
              {open === r.doc && (
                <div className="agreement-body">
                  <p className="agreement-plain">{plain.summary}</p>
                  <pre className="agreement-text">{text || 'Loading'}</pre>
                  <button className="secondary full" onClick={() => print()}>Save or print a copy</button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default MyAgreements;
