import type { ReactNode } from 'react';
import { Check, ChevronLeft, Lock } from 'lucide-react';

// ---------------------------------------------------------------------------
// THE PAGE KIT
//
// Home is the one screen the chairman approved: a green top with a rounded
// edge, a white card sitting up into it that carries the one number that
// matters, then a grid of things to do. Every destination screen is built from
// the same parts, so moving from Home into HYPER, Fees or Savings feels like
// moving through one product rather than into a different app.
//
// A destination screen reads: its answer in the card, the evidence below it in
// figures, the choices as cards side by side, and a single action at the foot.
// Rows are kept for ledgers only.
// ---------------------------------------------------------------------------

/** The green top of Home, with a back button and the screen's name. */
export function PageTop({ title, sub, onBack, actions, flat }: {
  title: string; sub?: string; onBack?: () => void; actions?: ReactNode;
  /** true when no card sits up into the top */
  flat?: boolean;
}) {
  return (
    <header className={'pg-top' + (flat ? ' flat' : '')}>
      <div className="pg-top-bar">
        {onBack && <button className="pg-top-btn" onClick={onBack} aria-label="Back"><ChevronLeft /></button>}
        <h1>{title}</h1>
        {actions && <div className="pg-top-actions">{actions}</div>}
      </div>
      {sub && <p>{sub}</p>}
    </header>
  );
}

/** The card that sits up into the green top and carries the screen's answer. */
export function HeroCard({ label, icon, amount, sub, children }: {
  label?: string; icon?: ReactNode; amount?: ReactNode; sub?: ReactNode; children?: ReactNode;
}) {
  return (
    <section className="pg-hero">
      {label && <div className="pg-hero-label">{icon}{label}</div>}
      {amount !== undefined && <div className="pg-hero-amount">{amount}</div>}
      {sub && <div className="pg-hero-sub">{sub}</div>}
      {children}
    </section>
  );
}

/** Two to four figures side by side, ruled off under the hero figure. */
export function Figures({ items }: { items: [string, ReactNode][] }) {
  return (
    <div className="pg-figs">
      {items.map(([k, v]) => <div key={k}><span>{k}</span><b>{v}</b></div>)}
    </div>
  );
}

/** A titled part of the page, with an optional action at the right. */
export function Section({ title, action, children }: { title?: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section className="pg-sec">
      {(title || action) && <div className="pg-sec-head">{title && <h2>{title}</h2>}{action}</div>}
      {children}
    </section>
  );
}

/** A white surface for anything that is not a figure, a choice or a check. */
export function Panel({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={'pg-panel' + (className ? ' ' + className : '')}>{children}</div>;
}

/** Package selection: the options side by side, the chosen one filled green. */
export function Choice<T extends string>({ value, onChange, options }: {
  value: T; onChange: (v: T) => void;
  options: { id: T; title: string; figure: string; sub?: string }[];
}) {
  return (
    <div className="pg-choice" role="radiogroup">
      {options.map(o => (
        <button key={o.id} role="radio" aria-checked={value === o.id}
                className={value === o.id ? 'on' : ''} onClick={() => onChange(o.id)}>
          <small>{o.title}</small>
          <b>{o.figure}</b>
          {o.sub && <span>{o.sub}</span>}
        </button>
      ))}
    </div>
  );
}

/** Where a payment goes: one bar divided in proportion, the parts named under it. */
export function SplitBar({ parts }: { parts: { label: string; value: string; share: number; tone: 1 | 2 | 3 }[] }) {
  const total = parts.reduce((s, p) => s + p.share, 0) || 1;
  return (
    <div className="pg-split">
      <div className="pg-split-bar" aria-hidden>
        {parts.map(p => <i key={p.label} className={'t' + p.tone} style={{ flexGrow: p.share / total }} />)}
      </div>
      <div className="pg-split-legend">
        {parts.map(p => <div key={p.label} className={'t' + p.tone}><b>{p.value}</b><span>{p.label}</span></div>)}
      </div>
    </div>
  );
}

/** Conditions as tiles: a tick or a lock, the condition, where the member stands. */
export function Checks({ items }: { items: { ok: boolean; label: string; have: string; onFix?: () => void }[] }) {
  return (
    <div className="pg-checks">
      {items.map(c => {
        const body = (
          <>
            <i>{c.ok ? <Check /> : <Lock />}</i>
            <b>{c.label}</b>
            <span>{c.have}</span>
          </>
        );
        return c.onFix && !c.ok
          ? <button key={c.label} className="pg-check no" onClick={c.onFix}>{body}</button>
          : <div key={c.label} className={'pg-check' + (c.ok ? '' : ' no')}>{body}</div>;
      })}
    </div>
  );
}

/** How it works, in three steps across the screen: an icon over a few words. */
export function HowSteps({ steps }: { steps: { icon: ReactNode; text: string }[] }) {
  return (
    <ol className="pg-how">
      {steps.map((s, i) => <li key={i}><i>{s.icon}</i><span>{s.text}</span></li>)}
    </ol>
  );
}

/** The finished state of a flow: a green tick, what happened, and what is next. */
export function Done({ title, sub, children }: { title: string; sub?: string; children?: ReactNode }) {
  return (
    <div className="pg-done">
      <i><Check /></i>
      <h2>{title}</h2>
      {sub && <p>{sub}</p>}
      {children}
    </div>
  );
}

/** A label and a value on one line, for a receipt or a confirmation. */
export function Line({ k, v, strong }: { k: string; v: ReactNode; strong?: boolean }) {
  return <div className={'pg-line' + (strong ? ' strong' : '')}><span>{k}</span><b>{v}</b></div>;
}
