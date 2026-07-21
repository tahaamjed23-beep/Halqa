import { useCallback, useEffect, useRef, useState } from 'react';
import { Eraser, FileSignature, ShieldCheck } from 'lucide-react';
import { api } from '../api';

type Status = { undertaking: { signedAt: string | null; expiresAt: string | null; fresh: boolean }; renewalDays: number };
type DocText = { doc: string; version: number; text: string; textHash: string };

// The weekly member undertaking (iqrarnama). Shown as a blocking overlay the
// first time an account signs in and again every seven days when the previous
// signature lapses; also re-opened by any 428 UNDERTAKING_REQUIRED from the
// API. Signing is a REAL adopted digital signature: the member types their
// full legal name (verified against the account) and may draw their signature;
// both are stored with the document hash, IP and timestamp (ETO 2002).
export default function AgreementGate({ userName }: { userName: string }) {
  const [open, setOpen] = useState(false);
  const [docText, setDocText] = useState<DocText | null>(null);
  const [agreed, setAgreed] = useState(false);
  const [typedName, setTypedName] = useState('');
  const [hasDrawn, setHasDrawn] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawing = useRef(false);

  const check = useCallback(async () => {
    try {
      const status = await api<Status>('/agreements/status');
      if (!status.undertaking.fresh) {
        setDocText(await api<DocText>('/agreements/text?doc=PLATFORM_UNDERTAKING'));
        setAgreed(false); setTypedName(''); setHasDrawn(false);
        setOpen(true);
      }
    } catch { /* status is best-effort; the API 428s will re-trigger us */ }
  }, []);

  useEffect(() => {
    void check();
    const reopen = () => void check();
    window.addEventListener('halqa:undertaking-required', reopen);
    return () => window.removeEventListener('halqa:undertaking-required', reopen);
  }, [check]);

  // Defensive: a stale cached session can carry a user object without
  // fullName — the gate must degrade to a non-matching name, never crash
  // (it fronts every 428-gated action).
  const normalize = (value?: string) => (value ?? '').trim().replace(/\s+/g, ' ').toLowerCase();
  const nameMatches = normalize(typedName) === normalize(userName);

  const pointerPos = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return { x: (event.clientX - rect.left) * (canvas.width / rect.width), y: (event.clientY - rect.top) * (canvas.height / rect.height) };
  };
  const startDraw = (event: React.PointerEvent<HTMLCanvasElement>) => {
    drawing.current = true;
    const ctx = canvasRef.current!.getContext('2d')!;
    const { x, y } = pointerPos(event);
    ctx.strokeStyle = '#2b230e'; ctx.lineWidth = 2.2; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath(); ctx.moveTo(x, y);
    (event.target as HTMLCanvasElement).setPointerCapture(event.pointerId);
  };
  const moveDraw = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    const ctx = canvasRef.current!.getContext('2d')!;
    const { x, y } = pointerPos(event);
    ctx.lineTo(x, y); ctx.stroke();
    setHasDrawn(true);
  };
  const endDraw = () => { drawing.current = false; };
  const clearPad = () => {
    const canvas = canvasRef.current; if (!canvas) return;
    canvas.getContext('2d')!.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  const sign = async () => {
    setBusy(true); setError('');
    try {
      const signatureData = hasDrawn && canvasRef.current ? canvasRef.current.toDataURL('image/png') : undefined;
      await api('/agreements/sign', { method: 'POST', body: JSON.stringify({ doc: 'PLATFORM_UNDERTAKING', accept: true, signedName: typedName.trim(), ...(signatureData && signatureData.length <= 80_000 ? { signatureData } : {}) }) });
      setOpen(false);
    } catch (reason) { setError((reason as Error).message); }
    finally { setBusy(false); }
  };

  if (!open || !docText) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(20,16,4,.72)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div className="panel" style={{ maxWidth: 640, width: '100%', maxHeight: '92vh', display: 'flex', flexDirection: 'column', gap: 10, overflowY: 'auto' }}>
        <div className="panel-head">
          <div>
            <span className="eyebrow">Renewed weekly · e-signed under ETO 2002</span>
            <h2><FileSignature size={18} style={{ verticalAlign: '-3px' }} /> Member undertaking</h2>
            <p>Read it fully. This is the promise every Halqa member signs to every other member — creating, joining and paying stay locked until you sign.</p>
          </div>
          <ShieldCheck />
        </div>
        <pre style={{ overflowY: 'auto', whiteSpace: 'pre-wrap', fontFamily: 'inherit', fontSize: 13, lineHeight: 1.55, background: 'rgba(255,255,255,.04)', border: '1px solid rgba(214,178,94,.25)', borderRadius: 10, padding: 14, margin: 0, flex: '1 1 140px', minHeight: 120 }}>{docText.text}</pre>
        <label className="settings-toggle" style={{ padding: '2px 0' }}>
          <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} />
          <span><b>I have read the undertaking and adopt the signature below as my own act</b><small>Version {docText.version} · document hash {docText.textHash.slice(0, 12)}… · valid 7 days, then renewed here</small></span>
        </label>
        <div>
          <div style={{ fontSize: 12, opacity: .75, marginBottom: 4 }}>Draw your signature (optional)</div>
          <div style={{ position: 'relative' }}>
            <canvas ref={canvasRef} width={560} height={120} style={{ width: '100%', height: 96, background: '#f7f2e2', borderRadius: 10, border: '1px dashed rgba(120,95,20,.45)', touchAction: 'none', cursor: 'crosshair' }}
              onPointerDown={startDraw} onPointerMove={moveDraw} onPointerUp={endDraw} onPointerLeave={endDraw} />
            {hasDrawn && <button type="button" className="secondary" style={{ position: 'absolute', top: 6, right: 6, padding: '2px 8px' }} onClick={clearPad}><Eraser size={13} /> Clear</button>}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 12, opacity: .75, marginBottom: 4 }}>Type your full legal name as your signature (required)</div>
          <input className="field" value={typedName} onChange={e => setTypedName(e.target.value)} placeholder={userName} autoComplete="off"
            style={{ fontStyle: 'italic', letterSpacing: '.4px' }} />
          {typedName.length > 2 && !nameMatches && <div style={{ fontSize: 12, color: '#c96b6b', marginTop: 4 }}>Must match your account name exactly: {userName}</div>}
        </div>
        {error && <div className="error-box">{error}</div>}
        <button className="primary full" disabled={!agreed || !nameMatches || busy} onClick={sign}>{busy ? 'Signing…' : 'E-sign the undertaking'}</button>
      </div>
    </div>
  );
}
