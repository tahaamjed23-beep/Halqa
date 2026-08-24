import { useRef, useState } from 'react';
import { Camera } from 'lucide-react';
import { api } from '../api';
import { initials } from '../lib/format';

// ---------------------------------------------------------------------------
// A COMMITTEE'S PICTURE
//
// A committee is a group of people, and a group needs a face. Members scan a
// list far faster by picture than by name, which is why every messaging app
// does this.
//
// The mechanism has worked for a while; nobody could find it. The only way in
// was a twenty-pixel camera button tucked into the corner of the avatar. So the
// whole avatar is the button now, and a host whose committee still has no
// picture is asked for one in words.
//
// Downscaled on the device so a phone photo never ships megabytes.
// ---------------------------------------------------------------------------
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
      await api('/committees/' + committeeId + '/avatar', { method: 'PATCH', body: JSON.stringify({ avatarUrl: data }) });
      setUrl(data); onChange?.(data);
    } catch { /* the picture simply stays as it was */ } finally { setBusy(false) }
  };

  const face = url ? <img src={url} alt={name} /> : <span>{initials(name)}</span>;
  if (!canEdit) return <div className="cmt-avatar">{face}</div>;

  return (
    <>
      {/* The whole thing is the control, not a corner of it. */}
      <button className="cmt-avatar editable" disabled={busy}
              onClick={() => input.current?.click()}
              title={url ? 'Change the committee picture' : 'Add a committee picture'}
              aria-label={url ? 'Change the committee picture' : 'Add a committee picture'}>
        {face}
        <span className="cmt-avatar-btn"><Camera /></span>
      </button>
      <input ref={input} type="file" accept="image/*" hidden
             onChange={e => void pick(e.target.files?.[0])} />
    </>
  );
}

/** The host's prompt, while the committee still has no picture. */
export function CommitteePhotoPrompt({ committeeId, name, avatarUrl, isHost, onChange }:
  { committeeId: string; name: string; avatarUrl?: string | null; isHost: boolean; onChange?: (url: string) => void }) {
  const [url, setUrl] = useState(avatarUrl || '');
  const [busy, setBusy] = useState(false);
  const input = useRef<HTMLInputElement | null>(null);
  if (url || !isHost) return null;

  const pick = async (file?: File) => {
    if (!file) return;
    setBusy(true);
    try {
      const data = await downscale(file);
      await api('/committees/' + committeeId + '/avatar', { method: 'PATCH', body: JSON.stringify({ avatarUrl: data }) });
      setUrl(data); onChange?.(data);
    } catch { /* the header control is the other way in */ } finally { setBusy(false) }
  };

  return (
    <div className="w-inset">
      <button className="cmt-photo-cta" disabled={busy} onClick={() => input.current?.click()}>
        <Camera />
        <span><b>{busy ? 'Uploading' : 'Add a picture for ' + name}</b>
          <small>Members find a circle by its picture faster than by its name</small></span>
      </button>
      <input ref={input} type="file" accept="image/*" hidden
             onChange={e => void pick(e.target.files?.[0])} />
    </div>
  );
}

export default CommitteeAvatar;
