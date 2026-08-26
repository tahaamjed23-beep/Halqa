import { useCallback, useEffect, useState } from 'react';
import { ArrowDownToLine, ArrowUpFromLine, FileText, Info, Share2 } from 'lucide-react';
import { api } from '../api';
import { date, dateShort, money } from '../lib/format';
import { Blank, BottomBar, Card, Chips, Facts, FlowHeader, Notice, Row, RowGroup } from '../components/wallet';

// ---------------------------------------------------------------------------
// THE STATEMENT
//
// Pick a period, see what went out, what came in, and every line that made
// those two numbers. A member asked for their statement wants the totals
// without doing the arithmetic themselves, and the lines underneath so they can
// check the arithmetic anyway.
//
// It shares as plain text rather than a file: a file needs somewhere to go, and
// the place this actually ends up is a WhatsApp message to a host.
// ---------------------------------------------------------------------------

type Line = {
  id: string; at: string; direction: 'IN' | 'OUT'; kind: string; status: string;
  amountPaisa: string; penaltyPaisa: string; rail: string | null; reference: string | null;
  committee: string; committeeId: string; turn: number;
};
type Statement = {
  member: { fullName: string; username: string; phone: string };
  from: string; to: string;
  totals: {
    paidInPaisa: string; collectedPaisa: string; penaltiesPaisa: string;
    stillDuePaisa: string; netPaisa: string;
    instalments: number; payouts: number; onTimeRate: number | null;
  };
  lines: Line[];
};

const PERIODS: { id: string; label: string; months: number }[] = [
  { id: '1', label: 'This month', months: 0 },
  { id: '3', label: 'Three months', months: 3 },
  { id: '6', label: 'Six months', months: 6 },
  { id: '12', label: 'A year', months: 12 },
];

const STATUS_WORD: Record<string, string> = {
  PAID: 'Paid', PENDING: 'Due', LATE: 'Late', MISSED: 'Missed', WAIVED: 'Waived',
  CLOSED: 'Collected', COLLECTING: 'Collecting', SCHEDULED: 'Scheduled', INVESTED: 'Invested',
};

export default function StatementPage({ back }: { back?: () => void }) {
  const [period, setPeriod] = useState('1');
  const [data, setData] = useState<Statement | null>(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const load = useCallback(() => {
    const months = PERIODS.find(p => p.id === period)?.months ?? 0;
    const now = new Date();
    const from = months
      ? new Date(now.getFullYear(), now.getMonth() - months + 1, 1)
      : new Date(now.getFullYear(), now.getMonth(), 1);
    setData(null); setError('');
    return api<Statement>('/account/statement?from=' + from.toISOString() + '&to=' + now.toISOString())
      .then(setData)
      .catch(reason => setError((reason as Error).message));
  }, [period]);
  useEffect(() => { void load() }, [load]);

  const share = async () => {
    if (!data) return;
    const t = data.totals;
    const text = [
      'Halqa statement',
      data.member.fullName + ' · ' + data.member.phone,
      date(data.from) + ' to ' + date(data.to),
      '',
      'Paid in        ' + money(t.paidInPaisa),
      'Collected      ' + money(t.collectedPaisa),
      'Net            ' + money(t.netPaisa),
      'Still due      ' + money(t.stillDuePaisa),
      'Penalties      ' + money(t.penaltiesPaisa),
      t.onTimeRate !== null ? 'Paid on time   ' + t.onTimeRate + '%' : '',
      '',
      ...data.lines.slice(0, 40).map(l =>
        dateShort(l.at).padEnd(14) + (l.direction === 'IN' ? '+' : '-') + money(l.amountPaisa).padEnd(12) + l.committee),
    ].filter(Boolean).join('\n');
    try {
      if (navigator.share) await navigator.share({ title: 'Halqa statement', text });
      else { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1800) }
    } catch { /* dismissed */ }
  };

  return (
    <div className="w-screen">
      <FlowHeader title="Statement" onBack={back} />

      <div className="w-inset" style={{ marginTop: 12 }}>
        <Chips value={period} onChange={setPeriod}
               options={PERIODS.map(p => ({ id: p.id, label: p.label }))} />
      </div>

      <div className="w-screen-body">
        {error && <div className="w-inset"><Notice kind="bad" icon={<Info />}>{error}</Notice></div>}

        {!data && !error && <Blank icon={<FileText />} title="Working it out" />}

        {data && (
          <>
            <Card title={date(data.from) + ' to ' + date(data.to)}>
              <Facts cols={2} items={[
                ['Paid in', money(data.totals.paidInPaisa)],
                ['Collected', money(data.totals.collectedPaisa)],
              ]} />
              <Facts cols={3} items={[
                ['Net', money(data.totals.netPaisa)],
                ['Still due', money(data.totals.stillDuePaisa)],
                ['On time', data.totals.onTimeRate === null ? '—' : data.totals.onTimeRate + '%'],
              ]} />
              {Number(data.totals.penaltiesPaisa) > 0 && (
                <Notice kind="warn" icon={<Info />}>
                  {money(data.totals.penaltiesPaisa)} of that was late penalties.
                </Notice>
              )}
            </Card>

            {data.lines.length ? (
              <RowGroup title={data.lines.length + ' line' + (data.lines.length === 1 ? '' : 's')}>
                {data.lines.map(l => (
                  <Row key={l.kind + l.id} chevron={false}
                       icon={l.direction === 'IN' ? <ArrowDownToLine /> : <ArrowUpFromLine />}
                       title={l.kind === 'PAYOUT' ? 'Payout collected' : 'Instalment'}
                       sub={l.committee + ' · turn ' + l.turn + ' · ' + dateShort(l.at)}
                       value={(l.direction === 'IN' ? '+' : '') + money(l.amountPaisa)}
                       valueSub={STATUS_WORD[l.status] || l.status}
                       tone={l.direction === 'IN' ? 'ok' : l.status === 'PAID' ? undefined : 'warn'} />
                ))}
              </RowGroup>
            ) : (
              <Blank icon={<FileText />} title="Nothing in this period"
                     sub="Try a longer one, or start a committee." />
            )}
          </>
        )}
      </div>

      {data && (
        <BottomBar>
          <button className="primary full" onClick={share}>
            <Share2 /> {copied ? 'Copied' : 'Share this statement'}
          </button>
        </BottomBar>
      )}
    </div>
  );
}
