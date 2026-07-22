import { useEffect, useRef, useState } from 'react';
import { Camera, Check, RotateCcw, X } from 'lucide-react';

// CNIC camera capture (Oraan-style): scan the whole card with the device camera.
// A full-frame photo is taken against a card-shaped guide; the image stays on
// the device for now (we record only that a capture happened) — real OCR of the
// number and NADRA Verisys are licensed-stage upgrades. Manual entry always
// remains as the fallback, so a camera-less device is never blocked.
export default function CnicCapture({ onCaptured, onClose }: { onCaptured: (dataUrl: string) => void; onClose: () => void }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [shot, setShot] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false });
        if (cancelled) { stream.getTracks().forEach(t => t.stop()); return; }
        streamRef.current = stream;
        if (videoRef.current) { videoRef.current.srcObject = stream; await videoRef.current.play().catch(() => {}); }
      } catch { setError('Camera unavailable — you can type the number instead.'); }
    })();
    return () => { cancelled = true; streamRef.current?.getTracks().forEach(t => t.stop()); };
  }, []);

  const capture = () => {
    const v = videoRef.current; if (!v || !v.videoWidth) return;
    const canvas = document.createElement('canvas');
    canvas.width = v.videoWidth; canvas.height = v.videoHeight;
    canvas.getContext('2d')!.drawImage(v, 0, 0);
    setShot(canvas.toDataURL('image/jpeg', 0.7));
    streamRef.current?.getTracks().forEach(t => t.stop());
  };
  const restart = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false });
      streamRef.current = stream;
      if (videoRef.current) { videoRef.current.srcObject = stream; await videoRef.current.play().catch(() => {}); }
    } catch { setError('Camera unavailable.'); }
  };

  return <div className="modal-backdrop">
    <section className="modal cnic-capture" style={{ maxWidth: 420 }}>
      <div className="modal-head"><div><span className="eyebrow">Identity · CNIC scan</span><h2>Scan your CNIC</h2></div><button onClick={onClose} aria-label="Close"><X /></button></div>
      <p style={{ fontSize: 12.5, opacity: .8, margin: '0 0 10px' }}>Line the front of your CNIC inside the frame and capture. It stays on your device; we only record that you scanned it.</p>
      {error && <div className="error-box">{error}</div>}
      <div className="cnic-frame">
        {shot ? <img src={shot} alt="Captured CNIC" /> : <video ref={videoRef} playsInline muted />}
        <div className="cnic-guide" />
      </div>
      <div className="form-actions" style={{ marginTop: 12 }}>
        {shot
          ? <><button className="secondary" onClick={() => { setShot(null); void restart(); }}><RotateCcw size={16} /> Retake</button><button className="primary" onClick={() => onCaptured(shot)}><Check size={16} /> Use this photo</button></>
          : <button className="primary full" disabled={!!error} onClick={capture}><Camera size={16} /> Capture</button>}
      </div>
    </section>
  </div>;
}
