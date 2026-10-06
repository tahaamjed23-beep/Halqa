import type { ReactNode } from 'react';
import { useDismissable } from '../lib/dismissable';
import { useBackToClose } from '../lib/back';
import { ChevronLeft, ChevronRight, Delete, Fingerprint, Search, X } from 'lucide-react';

// ---------------------------------------------------------------------------
// THE WALLET LAYOUT SET
//
// Every screen in the app invented its own header, its own field, its own
// button and its own picker, so nothing looked related to anything else. These
// are the shapes a Pakistani wallet uses, and every screen is expected to build
// from them rather than hand-roll another variant.
//
// The STRUCTURE is borrowed: a flow header with back and close, a title and one
// line of subtitle, labelled fields with the hint underneath, a bottom sheet
// with a handle and a search for any picker, a review screen of rows each with
// its own Edit, a numeric keypad for the PIN, and a torn receipt at the end.
//
// The PALETTE is entirely ours: Halqa lime, ivory and ink, straight from the
// tokens in index.css. Nothing here borrows a colour.
// ---------------------------------------------------------------------------

/**
 * The one navigation pattern, used by 27 screens: a large left aligned title,
 * a back affordance where one applies, and at most two trailing actions.
 *
 * It replaced three patterns that were in use at the same time. The title was
 * centred and small, so it read as a browser chrome bar rather than as the
 * name of the screen. Where there was no back button the grid still reserved
 * its 40px column, which is what left the Committees screen with a bare
 * centred strip. And the back control was a filled grey circle, which looked
 * like a button to be pressed for its own sake rather than a way out.
 *
 * `actions` takes up to two trailing controls. `onClose` is kept so the
 * existing call sites do not have to change; it renders as one of them.
 */
export function FlowHeader({ title, subtitle, onBack, onClose, actions }:
  { title?: string; subtitle?: string; onBack?: () => void; onClose?: () => void; actions?: ReactNode }) {
  return (
    <header className="w-head">
      {(onBack || actions || onClose) && (
        <div className="w-head-bar">
          {onBack
            ? <button className="w-head-btn back" onClick={onBack} aria-label="Back"><ChevronLeft /></button>
            : <span />}
          {(actions || onClose) && (
            <div className="w-head-actions">
              {actions}
              {onClose && <button className="w-head-btn" onClick={onClose} aria-label="Close"><X /></button>}
            </div>
          )}
        </div>
      )}
      {title && <div className="w-head-text">
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>}
    </header>
  );
}

/** The big title and its single supporting line. Never more than one line. */
export function FlowTitle({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="w-title">
      <h2>{title}</h2>
      {sub && <p>{sub}</p>}
    </div>
  );
}

/** Two or three mutually exclusive choices, as a pill row. */
export function Segment<T extends string>({ value, options, onChange }:
  { value: T; options: readonly { id: NoInfer<T>; label: string }[]; onChange: (id: NoInfer<T>) => void }) {
  return (
    <div className="w-seg" role="tablist">
      {options.map(o => (
        <button key={o.id} role="tab" aria-selected={value === o.id}
                className={value === o.id ? 'on' : ''} onClick={() => onChange(o.id)}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

/** Label above, control in the middle, hint underneath. */
export function Field({ label, hint, error, children }:
  { label: string; hint?: string; error?: string; children: ReactNode }) {
  return (
    <label className={`w-field${error ? ' bad' : ''}`}>
      <span className="w-field-label">{label}</span>
      {children}
      {error ? <small className="w-field-error">{error}</small>
             : hint ? <small className="w-field-hint">{hint}</small> : null}
    </label>
  );
}

/** A row that opens a picker rather than holding a value directly. */
export function PickerRow({ label, value, placeholder, onClick, icon }:
  { label: string; value?: string; placeholder?: string; onClick: () => void; icon?: ReactNode }) {
  return (
    <label className="w-field">
      <span className="w-field-label">{label}</span>
      <button type="button" className="w-picker" onClick={onClick}>
        {icon && <span className="w-picker-icon">{icon}</span>}
        <span className={value ? 'w-picker-value' : 'w-picker-placeholder'}>{value || placeholder || 'Select'}</span>
        <ChevronRight />
      </button>
    </label>
  );
}

/** The action that ends a step. Sits at the foot of the screen, always. */
export function BottomBar({ children }: { children: ReactNode }) {
  return <div className="w-bottom">{children}</div>;
}

/** A bottom sheet: handle, title, optional search, then whatever list. */
export function Sheet({ title, onClose, search, onSearch, children }:
  { title: string; onClose: () => void; search?: string; onSearch?: (v: string) => void; children: ReactNode }) {
  // A sheet is a place you can be, so back gets you out of it.
  useBackToClose(true, onClose);
  // And so does Escape, with focus held inside the sheet while it is open and
  // returned where it came from afterwards (lib/dismissable.ts).
  const layer = useDismissable(true, onClose);
  return (
    <div className="w-sheet-wrap" onClick={onClose} aria-hidden="true">
      <div className="w-sheet" role="dialog" aria-modal="true" aria-label={title}
           ref={layer} tabIndex={-1} onClick={e => e.stopPropagation()}>
        <div className="w-sheet-handle" />
        <div className="w-sheet-head"><h3>{title}</h3></div>
        {onSearch && (
          <div className="w-sheet-search">
            <Search />
            <input aria-label="Search this list" value={search || ''} onChange={e => onSearch(e.target.value)} placeholder="Search" />
          </div>
        )}
        <div className="w-sheet-body">{children}</div>
      </div>
    </div>
  );
}

export function SheetGroup({ label }: { label: string }) {
  return <div className="w-sheet-group">{label}</div>;
}

export function SheetRow({ icon, title, sub, onClick }:
  { icon?: ReactNode; title: string; sub?: string; onClick: () => void }) {
  return (
    <button className="w-sheet-row" onClick={onClick}>
      {icon && <span className="w-sheet-row-icon">{icon}</span>}
      <span className="w-sheet-row-text"><b>{title}</b>{sub && <small>{sub}</small>}</span>
    </button>
  );
}

/** A line on a review screen, with its own way back to the step that set it. */
export function ReviewRow({ icon, label, value, onEdit }:
  { icon?: ReactNode; label: string; value: string; onEdit?: () => void }) {
  return (
    <div className="w-review-row">
      {icon && <span className="w-review-icon">{icon}</span>}
      <span className="w-review-text"><small>{label}</small><b>{value}</b></span>
      {onEdit && <button className="w-review-edit" onClick={onEdit}>Edit</button>}
    </div>
  );
}

/** The amount a review screen is about, stated once and large. */
export function ReviewAmount({ amount, onEdit }: { amount: string; onEdit?: () => void }) {
  return (
    <div className="w-review-amount">
      <b>{amount}</b>
      {onEdit && <button className="w-review-edit" onClick={onEdit}>Edit</button>}
    </div>
  );
}

/** Fee and total, ruled off at the foot of a review. */
export function Totals({ rows, total }: { rows: [string, string][]; total?: [string, string] }) {
  return (
    <div className="w-totals">
      {rows.map(([k, v]) => <div key={k}><span>{k}</span><b>{v}</b></div>)}
      {total && <div className="w-total"><span>{total[0]}</span><b>{total[1]}</b></div>}
    </div>
  );
}

/** The PIN pad. Dots above, keypad below, biometric where the thumb sits. */
export function Keypad({ length = 4, filled, onKey, onBackspace, onBiometric }:
  { length?: number; filled: number; onKey: (d: string) => void; onBackspace: () => void; onBiometric?: () => void }) {
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
  return (
    <div className="w-pin">
      <div className="w-pin-dots">
        {Array.from({ length }, (_, i) => <i key={i} className={i < filled ? 'on' : ''} />)}
      </div>
      <div className="w-pad">
        {keys.map(k => <button key={k} onClick={() => onKey(k)}>{k}</button>)}
        <button className="w-pad-alt" onClick={onBiometric} aria-label="Use fingerprint" disabled={!onBiometric}>
          <Fingerprint />
        </button>
        <button onClick={() => onKey('0')}>0</button>
        <button className="w-pad-alt" onClick={onBackspace} aria-label="Delete"><Delete /></button>
      </div>
    </div>
  );
}

/** The home tile. Icon in a soft square, one short label under it. */
export function Tile({ icon, label, badge, onClick }:
  { icon: ReactNode; label: string; badge?: 'new' | 'hot'; onClick: () => void }) {
  return (
    <button className="w-tile" aria-label={label} onClick={onClick}>
      {badge && <em className={`w-tile-badge ${badge}`}>{badge === 'new' ? 'New' : 'Popular'}</em>}
      <span className="w-tile-icon">{icon}</span>
      <span className="w-tile-label">{label}</span>
    </button>
  );
}

export function TileGrid({ children }: { children: ReactNode }) {
  return <div className="w-tiles">{children}</div>;
}

/** A titled block of tiles or rows, the way a wallet groups its home screen. */
export function Group({ title, action, children }:
  { title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section className="w-group">
      <div className="w-group-head"><h3>{title}</h3>{action}</div>
      <div className="w-group-body">{children}</div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// THE SECOND HALF OF THE SET
//
// Everything above builds one step of a flow. These build the screens between
// the flows: the list rows, the fact grids, the notices and the empty states
// that every page was previously drawing by hand, each slightly differently.
// ---------------------------------------------------------------------------

/** A whole flow screen: sticky header, scrolling body, sticky action at the foot. */
export function Screen({ title, onBack, onClose, step, of, children, action }: {
  title?: string; onBack?: () => void; onClose?: () => void;
  step?: number; of?: number; children: ReactNode; action?: ReactNode;
}) {
  return (
    <div className="w-screen">
      {(title || onBack || onClose) && <FlowHeader title={title} onBack={onBack} onClose={onClose} />}
      {step && of ? <Steps step={step} of={of} /> : null}
      <div className="w-screen-body">{children}</div>
      {action && <BottomBar>{action}</BottomBar>}
    </div>
  );
}

/** How far through a multi-step flow the member is. Bars, not a sentence. */
export function Steps({ step, of }: { step: number; of: number }) {
  return (
    <div className="w-steps" aria-label={`Step ${step} of ${of}`}>
      {Array.from({ length: of }, (_, i) => <i key={i} className={i < step ? 'on' : ''} />)}
    </div>
  );
}

/** A plain surface block. Title optional, because most of them do not need one. */
export function Card({ title, action, pad = true, children }: {
  title?: string; action?: ReactNode; pad?: boolean; children: ReactNode;
}) {
  return (
    <section className={`w-card${pad ? '' : ' flush'}`}>
      {(title || action) && <div className="w-card-head">{title && <h3>{title}</h3>}{action}</div>}
      {children}
    </section>
  );
}

/** The list row every screen needs: icon, title, one line under, value, chevron. */
/** The shape of the rows that are coming, while they are still on the wire. */
export function RowsLoading({ rows = 4 }: { rows?: number }) {
  return (
    <div className="w-rowgroup" aria-hidden>
      <div className="w-rowgroup-body">
        {Array.from({ length: rows }, (_, i) => (
          <div className="w-row w-row-skel" key={i}>
            <span className="w-row-icon" />
            <span className="w-row-text"><i style={{ width: 42 + (i % 3) * 18 + '%' }} /><i style={{ width: 26 + (i % 2) * 12 + '%' }} /></span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function Row({ icon, title, sub, value, valueSub, onClick, tone, chevron = true }: {
  icon?: ReactNode; title: string; sub?: string; value?: string; valueSub?: string;
  onClick?: () => void; tone?: 'ok' | 'warn' | 'bad'; chevron?: boolean;
}) {
  const inner = (
    <>
      {icon && <span className={`w-row-icon${tone ? ' ' + tone : ''}`}>{icon}</span>}
      <span className="w-row-text"><b>{title}</b>{sub && <small>{sub}</small>}</span>
      {value && <span className={`w-row-val${tone ? ' ' + tone : ''}`}><b>{value}</b>{valueSub && <small>{valueSub}</small>}</span>}
      {onClick && chevron && <ChevronRight className="w-row-chev" />}
    </>
  );
  return onClick
    ? <button className="w-row" onClick={onClick}>{inner}</button>
    : <div className="w-row">{inner}</div>;
}

/** Rows ruled off inside one rounded block, the way a wallet groups a menu. */
export function RowGroup({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <section className="w-rowgroup">
      {title && <h4>{title}</h4>}
      <div className="w-rowgroup-body">{children}</div>
    </section>
  );
}

/** Dense facts: two or three per line, label above, figure below. */
export function Facts({ items, cols = 3 }: { items: [string, string][]; cols?: 2 | 3 }) {
  return (
    <div className={`w-facts c${cols}`}>
      {items.map(([k, v]) => <div key={k}><span>{k}</span><b>{v}</b></div>)}
    </div>
  );
}

/** One sentence the member has to read, coloured by how much it matters. */
export function Notice({ kind = 'info', icon, children }:
  { kind?: 'info' | 'warn' | 'bad' | 'ok'; icon?: ReactNode; children: ReactNode }) {
  return <div className={`w-notice ${kind}`}>{icon && <span>{icon}</span>}<p>{children}</p></div>;
}

/** The big amount field a payment flow opens on. */
export function AmountEntry({ value, onChange, hint, max }:
  { value: string; onChange: (v: string) => void; hint?: string; max?: number }) {
  return (
    <div className="w-amount">
      <div className="w-amount-row">
        <span>Rs</span>
        <input aria-label="0" inputMode="decimal" value={value} placeholder="0"
               onChange={e => {
                 const raw = e.target.value.replace(/[^\d.]/g, '');
                 if (max && Number(raw) > max) return onChange(String(max));
                 onChange(raw);
               }} />
      </div>
      {hint && <small>{hint}</small>}
    </div>
  );
}

export function Chips<T extends string | number>({ value, options, onChange }:
  { value: T; options: readonly { id: NoInfer<T>; label: string }[]; onChange: (v: NoInfer<T>) => void }) {
  return (
    <div className="w-chips">
      {options.map(o => (
        <button key={o.id} className={value === o.id ? 'on' : ''} onClick={() => onChange(o.id)}>{o.label}</button>
      ))}
    </div>
  );
}

export function Blank({ icon, title, sub, action }:
  { icon?: ReactNode; title: string; sub?: string; action?: ReactNode }) {
  return (
    <div className="w-blank">
      {icon && <span>{icon}</span>}
      <b>{title}</b>
      {sub && <p>{sub}</p>}
      {action}
    </div>
  );
}
