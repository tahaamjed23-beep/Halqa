import { useCallback, useEffect, useState } from 'react';
import { Info, LogOut, Monitor, ShieldCheck, Smartphone } from 'lucide-react';
import { api } from '../api';
import { dateTime } from '../lib/format';
import { Blank, BottomBar, FlowHeader, Notice, Row, RowGroup, Sheet } from '../components/wallet';

// ---------------------------------------------------------------------------
// WHERE YOU ARE SIGNED IN
//
// Changing a password already signed every other device out; nobody could see
// that it did, or that there were other devices at all. This is the list, and
// the button.
//
// A refresh-token family is one sign-in, renewed in place, so a family is a
// device. The place is trimmed to the first two parts of the address: enough to
// tell "that was me at home" from "that was not me", without keeping a location
// history on a screen anybody who picks up the phone can read.
// ---------------------------------------------------------------------------

type Session = { id: string; signedInAt: string; device: string; place: string | null; current: boolean };
type Recent = { at: string; what: string; device: string };
type Devices = { sessions: Session[]; recent: Recent[] };

export default function DevicesPage({ back }: { back?: () => void }) {
  const [data, setData] = useState<Devices | null>(null);
  const [error, setError] = useState('');
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState('');

  const load = useCallback(() => api<Devices>('/account/devices')
    .then(d => Array.isArray(d?.sessions)
      ? setData({ sessions: d.sessions, recent: Array.isArray(d.recent) ? d.recent : [] })
      : setError('Your devices could not be read. Try again in a moment.'))
    .catch(reason => setError((reason as Error).message)), []);
  useEffect(() => { void load() }, [load]);

  const signOutOthers = async () => {
    setBusy(true); setConfirm(false);
    try {
      const r = await api<{ signedOut: number }>('/account/devices/sign-out-others', { method: 'POST' });
      setDone(r.signedOut
        ? r.signedOut + ' other session' + (r.signedOut === 1 ? '' : 's') + ' signed out'
        : 'There was nothing else signed in');
      await load();
    } catch (reason) { setError((reason as Error).message) }
    finally { setBusy(false) }
  };

  const icon = (d: string) => /phone|iPhone|Android|iPad/i.test(d) ? <Smartphone /> : <Monitor />;
  const others = (data?.sessions || []).filter(s => !s.current).length;

  return (
    <div className="w-screen">
      <FlowHeader title="Where you are signed in" onBack={back} />
      <div className="w-screen-body">
        {error && <div className="w-inset"><Notice kind="bad" icon={<Info />}>{error}</Notice></div>}
        {done && <div className="w-inset"><Notice kind="ok" icon={<ShieldCheck />}>{done}</Notice></div>}

        {!data && !error && <Blank icon={<Monitor />} title="Checking your sessions" />}

        {data && (
          <>
            <RowGroup title={data.sessions.length + ' session' + (data.sessions.length === 1 ? '' : 's')}>
              {data.sessions.map(s => (
                <Row key={s.id} chevron={false} icon={icon(s.device)}
                     title={s.device + (s.current ? ', this one' : '')}
                     sub={'Signed in ' + dateTime(s.signedInAt) + (s.place ? ' · ' + s.place : '')}
                     value={s.current ? 'Now' : undefined}
                     tone={s.current ? 'ok' : undefined} />
              ))}
              {!data.sessions.length && (
                <Row chevron={false} title="Only this device" sub="Nothing else is signed in" />
              )}
            </RowGroup>

            {data.recent.length > 0 && (
              <RowGroup title="Recent sign-ins">
                {data.recent.map((r, i) => (
                  <Row key={i} chevron={false} icon={<ShieldCheck />} title={r.what}
                       sub={r.device + ' · ' + dateTime(r.at)} />
                ))}
              </RowGroup>
            )}

            <p className="w-foot">
              Anything you do not recognise, sign the others out and change your password.
            </p>
          </>
        )}
      </div>

      {data && others > 0 && (
        <BottomBar>
          <button className="primary full" disabled={busy} onClick={() => setConfirm(true)}>
            <LogOut /> Sign out the other {others === 1 ? 'device' : others + ' devices'}
          </button>
        </BottomBar>
      )}

      {confirm && (
        <Sheet title="Sign the others out" onClose={() => setConfirm(false)}>
          <div className="w-inset" style={{ paddingTop: 12 }}>
            <Notice kind="warn" icon={<Info />}>
              Every other device has to sign in again with your password. This one stays.
            </Notice>
          </div>
          <BottomBar>
            <button className="secondary" onClick={() => setConfirm(false)}>Keep them</button>
            <button className="primary full" onClick={signOutOthers}>Sign them out</button>
          </BottomBar>
        </Sheet>
      )}
    </div>
  );
}
