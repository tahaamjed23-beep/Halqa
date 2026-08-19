import { useRef, useState } from 'react';
import { Camera } from 'lucide-react';
import { api } from '../api';
import { initials } from '../lib/format';

// A committee is a group of people, and a group needs a face. Members scan a
// list far faster by picture than by name, which is why every messaging app
// does this. Downscaled on the device so a phone photo never ships megabytes.
async function downscale(file: File, max = 320): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale), h = Math.round(bitmap.height * scale);
  const canvas = document.createElement('canvas');
  canvas.width = w; canvas.height = h;
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, w, h);
  return canvas.toDataURL('image/jpeg', 0.82);
}

export function CommitteeAvatar({ committeeId, name, avatarUrl, canEdit, onChange }:
  { committeeId: string; name: string; avatarUrl?: string | null; canEdit?: boolean; onChange?: (url: string) => void }) {
  const [url, setUrl] = useState(avatarUrl || '');
  const [busy, setBusy] = useState(false);
  const input = useRef<HTMLInputElement | null>(null);

  const pick = async (file?: File) => {
    if (!file) return;
    setBusy(true);
    try {
      const data = await downscale(file);
      await api(`/committees/${committeeId}/avatar`, { method: 'PATCH', body: JSON.stringify({ avatarUrl: data }) });
      setUrl(data); onChange?.(data);
    } catch { /* keep the old picture */ } finally { setBusy(false); }
  };

  return (
    <div className={`cmt-avatar${canEdit ? ' editable' : ''}`}>
      {url ? <img src={url} alt={name} /> : <span>{initials(name)}</span>}
      {canEdit && (
        <>
          <button className="cmt-avatar-btn" disabled={busy} onClick={() => input.current?.click()}
                  aria-label="Change committee picture"><Camera /></button>
          <input ref={input} type="file" accept="image/*" hidden
                 onChange={e => void pick(e.target.files?.[0])} />
        </>
      )}
    </div>
  );
}

export default CommitteeAvatar;
