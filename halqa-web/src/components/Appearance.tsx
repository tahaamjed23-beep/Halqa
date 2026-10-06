import { useEffect, useState } from 'react';
import { Camera, Check, Moon, Sun, Monitor, Type, Contrast, Languages } from 'lucide-react';
import { api } from '../api';

// Personalisation. A committee is a personal arrangement between people who
// mostly know each other; an app that looks like a bank statement gets opened
// once.
//
// None of this touches verification. displayName is what other members see;
// the legal name matched against the CNIC is untouched and is what appears on
// agreements, the credit record and anything a court would read.

export type Appearance = {
  displayName: string | null;
  avatarUrl: string | null;
  accentColor: string;
  themePref: 'system' | 'light' | 'dark';
  langPref: 'en' | 'ur';
  textScale: number;
  highContrast: boolean;
  notifyPrefsJson: NotifyPrefs | null;
};

export type NotifyPrefs = {
  push?: boolean; whatsapp?: boolean; email?: boolean;
  quietFrom?: number; quietTo?: number;
};

export const ACCENTS: Array<{ id: string; label: string; swatch: string }> = [
  { id: 'lime',   label: 'Lime',   swatch: '#6DC72A' },
  { id: 'pine',   label: 'Pine',   swatch: '#2F8A4B' },
  { id: 'sand',   label: 'Sand',   swatch: '#B58A22' },
  { id: 'clay',   label: 'Clay',   swatch: '#B25334' },
  { id: 'indigo', label: 'Indigo', swatch: '#4F5CB2' },
  { id: 'plum',   label: 'Plum',   swatch: '#954E8A' },
];

/** Apply an appearance to the document. Called on load and on every change, so
 *  the choice takes effect immediately rather than after a reload. */
export function applyAppearance(a: Partial<Appearance>) {
  const root = document.documentElement;
  if (a.accentColor) root.dataset.accent = a.accentColor;
  if (a.textScale) { root.dataset.scale = String(a.textScale); root.style.setProperty('--scale', String(a.textScale / 100)); }
  if (a.highContrast !== undefined) {
    if (a.highContrast) root.dataset.contrast = 'high'; else delete root.dataset.contrast;
  }
  if (a.themePref) {
    const dark = a.themePref === 'dark' ||
      (a.themePref === 'system' && window.matchMedia?.('(prefers-color-scheme: dark)').matches);
    root.dataset.theme = dark ? 'dark' : 'light';
  }
  if (a.langPref) { root.lang = a.langPref; root.dir = a.langPref === 'ur' ? 'rtl' : 'ltr'; }
}

/** Read the cached appearance before the first paint, so the app never flashes
 *  the default palette at a member who chose another one. */
export function bootAppearance() {
  try {
    const raw = localStorage.getItem('halqa.appearance');
    if (raw) applyAppearance(JSON.parse(raw) as Appearance);
  } catch { /* a corrupt cache is not worth blocking startup for */ }
}

const MAX_AVATAR_BYTES = 220_000;

/** Downscale and re-encode on the device before upload. A phone camera photo is
 *  several megabytes; the app needs a 256px circle. Doing this client-side keeps
 *  the original off the network entirely. */
async function toAvatarDataUrl(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size; canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const scale = Math.max(size / bitmap.width, size / bitmap.height);
  const w = bitmap.width * scale, h = bitmap.height * scale;
  ctx.drawImage(bitmap, (size - w) / 2, (size - h) / 2, w, h);
  for (const q of [0.82, 0.7, 0.6, 0.5, 0.4]) {
    const url = canvas.toDataURL('image/jpeg', q);
    if (url.length <= MAX_AVATAR_BYTES) return url;
  }
  return canvas.toDataURL('image/jpeg', 0.35);
}

export function AppearancePanel({ onChange }: { onChange?: (a: Appearance) => void }) {
  const [a, setA] = useState<Appearance | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api<Appearance>('/profile/appearance')
      .then(next => { setA(next); applyAppearance(next); })
      .catch(() => setError('Could not load your preferences'));
  }, []);

  async function save(patch: Partial<Appearance> & { notifyPrefs?: NotifyPrefs }) {
    if (!a) return;
    const optimistic = { ...a, ...patch } as Appearance;
    setA(optimistic);
    applyAppearance(optimistic);
    localStorage.setItem('halqa.appearance', JSON.stringify(optimistic));
    setBusy(true); setError('');
    try {
      const saved = await api<Appearance>('/profile/appearance', { method: 'PATCH', body: JSON.stringify(patch) });
      setA(saved); applyAppearance(saved); onChange?.(saved);
      localStorage.setItem('halqa.appearance', JSON.stringify(saved));
    } catch {
      setError('Saved on this device, but not synced yet');
    } finally { setBusy(false); }
  }

  if (!a) return <section className="panel"><p className="muted">{error || 'Loading preferences…'}</p></section>;

  const notify = a.notifyPrefsJson ?? {};

  return <section className="panel">
    <div className="panel-head"><div>
      <span className="eyebrow">Make it yours</span>
      <h2>Appearance and personalisation</h2>
      <p>Your photo and display name are what other members see. Your legal name stays on the record and is never changed by anything here.</p>
    </div></div>

    <div className="field-wrap" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      <label className="pfp-edit profile-avatar" style={{ width: 72, height: 72, borderRadius: '50%', flex: 'none' }}>
        {a.avatarUrl
          ? <img className="pfp" src={a.avatarUrl} alt="" />
          : <span>{(a.displayName || 'H')[0].toUpperCase()}</span>}
        <span className="pfp-hint"><Camera size={13} /></span>
        <input type="file" accept="image/*" aria-label="Change profile photo" onChange={async e => {
          const file = e.target.files?.[0]; if (!file) return;
          try { await save({ avatarUrl: await toAvatarDataUrl(file) }); }
          catch { setError('That image could not be read'); }
        }} />
      </label>
      <div style={{ flex: 1, minWidth: 0 }}>
        <label className="field-wrap"><span>Display name</span>
          <input aria-label="What members call you" className="field" defaultValue={a.displayName ?? ''} placeholder="What members call you"
            onBlur={e => { const v = e.target.value.trim(); if (v !== (a.displayName ?? '')) save({ displayName: v || null }); }} />
          <small>Two to forty characters. Leave it empty to use your registered name.</small>
        </label>
        {a.avatarUrl && <button className="secondary" onClick={() => save({ avatarUrl: null })}>Remove photo</button>}
      </div>
    </div>

    <label className="field-wrap"><span>Accent colour</span>
      <div className="accent-row">
        {ACCENTS.map(opt => <button key={opt.id} type="button" className="accent-dot"
          aria-pressed={a.accentColor === opt.id} aria-label={opt.label} title={opt.label}
          onClick={() => save({ accentColor: opt.id })}>
          <i style={{ background: opt.swatch }} />
          {a.accentColor === opt.id && <Check size={13} style={{ position: 'absolute', color: 'var(--on-accent)' }} />}
        </button>)}
      </div>
      <small>Changes the whole app, not just this screen.</small>
    </label>

    <label className="field-wrap"><span>Theme</span>
      <div className="accent-row">
        {([['system', 'Match my phone', Monitor], ['light', 'Light', Sun], ['dark', 'Dark', Moon]] as const).map(([id, label, Icon]) =>
          <button key={id} type="button" className={`secondary ${a.themePref === id ? 'on' : ''}`}
            aria-pressed={a.themePref === id} onClick={() => save({ themePref: id })}
            style={{ display: 'flex', alignItems: 'center', gap: 7 }}><Icon size={14} />{label}</button>)}
      </div>
    </label>

    <label className="field-wrap"><span><Languages size={13} /> Language</span>
      <div className="accent-row">
        {([['en', 'English'], ['ur', 'اردو']] as const).map(([id, label]) =>
          <button key={id} type="button" className={`secondary ${a.langPref === id ? 'on' : ''}`}
            aria-pressed={a.langPref === id} onClick={() => save({ langPref: id })}>{label}</button>)}
      </div>
    </label>

    <label className="field-wrap"><span><Type size={13} /> Text size · {a.textScale}%</span>
      <input type="range" min={90} max={140} step={10} value={a.textScale}
        onChange={e => save({ textScale: Number(e.target.value) })} />
      <small>Larger text everywhere in the app.</small>
    </label>

    <label className="field-wrap" style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
      <input type="checkbox" checked={a.highContrast} onChange={e => save({ highContrast: e.target.checked })} />
      <span style={{ margin: 0 }}><Contrast size={13} /> Higher contrast</span>
    </label>

    <div className="field-wrap"><span>Reminders</span>
      {([['push', 'In the app'], ['whatsapp', 'WhatsApp'], ['email', 'Email']] as const).map(([k, label]) =>
        <label key={k} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0' }}>
          <input type="checkbox" checked={notify[k] !== false}
            onChange={e => save({ notifyPrefs: { ...notify, [k]: e.target.checked } })} />
          <span>{label}</span>
        </label>)}
      <label className="field-wrap"><span>Quiet hours</span>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input className="field" type="number" min={0} max={23} style={{ width: 78 }}
            value={notify.quietFrom ?? 22}
            onChange={e => save({ notifyPrefs: { ...notify, quietFrom: Number(e.target.value) } })} />
          <span className="muted">to</span>
          <input className="field" type="number" min={0} max={23} style={{ width: 78 }}
            value={notify.quietTo ?? 8}
            onChange={e => save({ notifyPrefs: { ...notify, quietTo: Number(e.target.value) } })} />
        </div>
        <small>Reminders are held until the morning.</small>
      </label>
    </div>

    {busy && <p className="muted">Saving…</p>}
    {error && <div className="error-box">{error}</div>}
  </section>;
}

/** Small round photo used across lists. Falls back to the initial, so a member
 *  without a photo never sees a broken image. */
export function Pfp({ url, name, size = 40 }: { url?: string | null; name: string; size?: number }) {
  return <div className="avatar" style={{ width: size, height: size, fontSize: Math.round(size / 2.4) }}>
    {url ? <img className="pfp" src={url} alt="" /> : (name?.[0] ?? '?').toUpperCase()}
  </div>;
}
