import { useEffect, useState } from 'react';
import { BadgeCheck, Check, Gauge, Info, Lock } from 'lucide-react';
import { api } from '../api';
import { money } from '../lib/format';
import { Blank, Card, FlowHeader, Notice, Row, RowGroup } from '../components/wallet';

// ---------------------------------------------------------------------------
// LIMITS AND ACCOUNT LEVEL
//
// A member refused at the door with no explanation assumes the app is broken.
// A member who can see the ceiling, how close they are to it, and the one thing
// that would lift it, goes and does that thing.
//
// Every figure here is the figure the server actually enforces, read from the
// same constants, so this screen cannot drift away from the rules.
// ---------------------------------------------------------------------------

type Limit = {
  key: string; label: string; note: string;
  used?: number; cap?: number;
  usedPaisa?: string | null; capPaisa?: string;
  value?: string;
};
type Raise = { key: string; done: boolean; label: string; gain: string };
type Limits = { level: number; levelName: string; limits: Limit[]; raise: Raise[]; band: string };

const BAND_WORD: Record<string, string> = {
  EXCELLENT: 'Excellent', GOOD: 'Good', DECENT: 'Fair', BAD: 'Needs work',
};

export default function LimitsPage({ back }: { back?: () => void }) {
  const [data, setData] = useState<Limits | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    void api<Limits>('/account/limits').then(setData)
      .catch(reason => setError((reason as Error).message));
  }, []);

  if (!data) {
    return (
      <div className="w-screen">
        <FlowHeader title="Limits" onBack={back} />
        {error
          ? <div className="w-inset"><Notice kind="bad" icon={<Info />}>{error}</Notice></div>
          : <Blank icon={<Gauge />} title="Reading your limits" />}
      </div>
    );
  }

  const todo = data.raise.filter(r => !r.done);

  return (
    <div className="w-screen">
      <FlowHeader title="Limits" onBack={back} />

      <div className="lim-band">
        <div className="lim-band-top"><BadgeCheck /><span>Account level {data.level}</span></div>
        <b>{data.levelName}</b>
        <small>Standing: {BAND_WORD[data.band] || data.band}</small>
      </div>

      <div className="w-screen-body">
        <RowGroup title="What applies to you">
          {data.limits.map(l => {
            const hasCount = typeof l.used === 'number' && typeof l.cap === 'number';
            const atCap = hasCount && l.used! >= l.cap!;
            return (
              <Row key={l.key} chevron={false}
                   icon={atCap ? <Lock /> : <Gauge />}
                   title={l.label} sub={l.note}
                   value={hasCount ? l.used + ' of ' + l.cap
                     : l.capPaisa ? money(l.capPaisa)
                     : l.value || '—'}
                   tone={atCap ? 'warn' : undefined} />
            );
          })}
        </RowGroup>

        {todo.length ? (
          <RowGroup title="What would lift them">
            {todo.map(r => (
              <Row key={r.key} chevron={false} icon={<Lock />} title={r.label} sub={r.gain} value="To do" />
            ))}
          </RowGroup>
        ) : (
          <Card>
            <Notice kind="ok" icon={<Check />}>
              Everything that can be verified about you is verified. Nothing here is holding you back.
            </Notice>
          </Card>
        )}

        {data.raise.some(r => r.done) && (
          <RowGroup title="Already done">
            {data.raise.filter(r => r.done).map(r => (
              <Row key={r.key} chevron={false} icon={<Check />} title={r.label} sub={r.gain}
                   value="Done" tone="ok" />
            ))}
          </RowGroup>
        )}

        <p className="w-foot">
          These are the same numbers the server checks. If one refuses you, this is why.
        </p>
      </div>
    </div>
  );
}
