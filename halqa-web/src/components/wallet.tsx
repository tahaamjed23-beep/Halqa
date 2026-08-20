import type { ReactNode } from 'react';
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

/** Back on the left, title centred, optional close on the right. */
export function FlowHeader({ title, onBack, onClose }:
  { title?: string; onBack?: () => void; onClose?: () => void }) {
  return (
    <header className="w-head">
      {onBack ? <button className="w-head-btn" onClick={onBack} aria-label="Back"><ChevronLeft /></button> : <span />}
      {title ? <h1>{title}</h1> : <span />}
      {onClose ? <button className="w-head-btn" onClick={onClose} aria-label="Close"><X /></button> : <span />}
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
  { value: T; options: { id: T; label: string }[]; onChange: (id: T) => void }) {
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
  return (
    <div className="w-sheet-wrap" onClick={onClose}>
      <div className="w-sheet" onClick={e => e.stopPropagation()}>
        <div className="w-sheet-handle" />
        <div className="w-sheet-head"><h3>{title}</h3></div>
        {onSearch && (
          <div className="w-sheet-search">
            <Search />
            <input value={search || ''} onChange={e => onSearch(e.target.value)} placeholder="Search" />
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
    <button className="w-tile" onClick={onClick}>
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
