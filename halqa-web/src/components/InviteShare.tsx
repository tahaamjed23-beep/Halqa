import { useMemo, useState } from 'react';
import { Copy, Link2, MessageCircle, QrCode, Share2 } from 'lucide-react';
import { money } from '../lib/format';

// ---------------------------------------------------------------------------
// Sharing an invite used to be one WhatsApp link, in English, buried in the
// Turns tab of a circle that had already started. A host needs to invite people
// at creation, from the circle card, and from the circle itself, and most of
// them read Roman Urdu faster than English.
//
// The QR is drawn here rather than fetched, because the app must work on a bad
// connection and must not hand a circle's invite code to a third-party image
// service.
// ---------------------------------------------------------------------------

export function inviteUrl(code: string) {
  return `${window.location.origin}/?join=${encodeURIComponent(code)}`;
}

/** Roman Urdu first, English underneath: 31% of committee users read an SMS. */
export function inviteMessage(name: string, code: string, contributionPaisa?: string | number) {
  const amount = contributionPaisa ? ` Har baari ${money(contributionPaisa)}.` : '';
  return `Assalam-o-alaikum! Hamari committee "${name}" Halqa par hai.${amount}\n`
       + `Code: ${code}\n${inviteUrl(code)}\n\n`
       + `Join our committee "${name}" on Halqa. Enter invite code ${code}.`;
}

export function InviteShare({ name, code, contributionPaisa }:
  { name: string; code: string; contributionPaisa?: string | number }) {
  const [copied, setCopied] = useState<'code' | 'link' | null>(null);
  const [qr, setQr] = useState(false);
  const text = inviteMessage(name, code, contributionPaisa);

  const copy = async (what: 'code' | 'link') => {
    try {
      await navigator.clipboard.writeText(what === 'code' ? code : inviteUrl(code));
      setCopied(what);
      setTimeout(() => setCopied(null), 1600);
    } catch { /* clipboard blocked, the value is on screen anyway */ }
  };

  const nativeShare = async () => {
    try { await navigator.share({ title: `Join ${name} on Halqa`, text }); }
    catch { /* dismissed or unsupported */ }
  };

  return (
    <div className="invite-share">
      <div className="invite-code">
        <span>Invite code</span>
        <b>{code}</b>
      </div>

      <div className="invite-actions">
        <a className="invite-act invite-act--wa"
           href={`https://wa.me/?text=${encodeURIComponent(text)}`}
           target="_blank" rel="noreferrer">
          <MessageCircle /><span>WhatsApp</span>
        </a>
        <button className="invite-act" onClick={() => void copy('link')}>
          <Link2 /><span>{copied === 'link' ? 'Copied' : 'Copy link'}</span>
        </button>
        <button className="invite-act" onClick={() => void copy('code')}>
          <Copy /><span>{copied === 'code' ? 'Copied' : 'Copy code'}</span>
        </button>
        <button className="invite-act" onClick={() => setQr(v => !v)}>
          <QrCode /><span>{qr ? 'Hide QR' : 'QR code'}</span>
        </button>
        {typeof navigator !== 'undefined' && 'share' in navigator && (
          <button className="invite-act" onClick={() => void nativeShare()}>
            <Share2 /><span>More</span>
          </button>
        )}
      </div>

      {qr && <div className="invite-qr"><Qr text={inviteUrl(code)} /><small>Scan to join</small></div>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// A minimal QR encoder. Byte mode, error-correction level L, smallest version
// that fits the payload. Enough for an invite URL and nothing more, which keeps
// it small and dependency-free.
// ---------------------------------------------------------------------------

function Qr({ text, size = 168 }: { text: string; size?: number }) {
  const matrix = useMemo(() => buildQr(text), [text]);
  if (!matrix) return <small className="muted">Code too long for a QR</small>;
  const n = matrix.length;
  const cell = size / n;
  const rects: string[] = [];
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (matrix[y][x]) {
    rects.push(`<rect x="${(x * cell).toFixed(2)}" y="${(y * cell).toFixed(2)}" width="${cell.toFixed(2)}" height="${cell.toFixed(2)}"/>`);
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">`
            + `<rect width="${size}" height="${size}" fill="#fff"/><g fill="#0C1408">${rects.join('')}</g></svg>`;
  return <img alt="Invite QR code" width={size} height={size}
              src={`data:image/svg+xml;utf8,${encodeURIComponent(svg)}`} />;
}

// --- encoder -----------------------------------------------------------------
const EC_L = 1;
const CAPACITY: Record<number, number> = { 1: 17, 2: 32, 3: 53, 4: 78, 5: 106, 6: 134, 7: 154, 8: 192, 9: 230, 10: 271 };
const ECC_BYTES: Record<number, number> = { 1: 7, 2: 10, 3: 15, 4: 20, 5: 26, 6: 18, 7: 20, 8: 24, 9: 30, 10: 18 };
const ECC_BLOCKS: Record<number, number> = { 1: 1, 2: 1, 3: 1, 4: 1, 5: 1, 6: 2, 7: 2, 8: 2, 9: 2, 10: 4 };
const TOTAL_BYTES: Record<number, number> = { 1: 26, 2: 44, 3: 70, 4: 100, 5: 134, 6: 172, 7: 196, 8: 242, 9: 292, 10: 346 };

function buildQr(text: string): number[][] | null {
  const data = new TextEncoder().encode(text);
  let version = 0;
  for (let v = 1; v <= 10; v++) if (data.length <= CAPACITY[v]) { version = v; break; }
  if (!version) return null;

  const totalBytes = TOTAL_BYTES[version];
  const blocks = ECC_BLOCKS[version];
  const eccPerBlock = ECC_BYTES[version];
  const dataBytes = totalBytes - eccPerBlock * blocks;

  // bit stream: mode 0100, length, payload, terminator, pad
  const bits: number[] = [];
  const push = (val: number, len: number) => { for (let i = len - 1; i >= 0; i--) bits.push((val >> i) & 1); };
  push(0b0100, 4);
  push(data.length, version < 10 ? 8 : 16);
  for (const b of data) push(b, 8);
  for (let i = 0; i < 4 && bits.length < dataBytes * 8; i++) bits.push(0);
  while (bits.length % 8) bits.push(0);
  const bytes: number[] = [];
  for (let i = 0; i < bits.length; i += 8) bytes.push(parseInt(bits.slice(i, i + 8).join(''), 2));
  const PAD = [0xec, 0x11];
  for (let i = 0; bytes.length < dataBytes; i++) bytes.push(PAD[i % 2]);

  // split into blocks, compute Reed-Solomon parity for each
  const per = Math.floor(dataBytes / blocks);
  const dBlocks: number[][] = [], eBlocks: number[][] = [];
  for (let b = 0; b < blocks; b++) {
    const start = b * per;
    const chunk = bytes.slice(start, b === blocks - 1 ? dataBytes : start + per);
    dBlocks.push(chunk);
    eBlocks.push(rsEncode(chunk, eccPerBlock));
  }
  const out: number[] = [];
  const maxD = Math.max(...dBlocks.map(b => b.length));
  for (let i = 0; i < maxD; i++) for (const b of dBlocks) if (i < b.length) out.push(b[i]);
  for (let i = 0; i < eccPerBlock; i++) for (const b of eBlocks) out.push(b[i]);

  return render(version, out, EC_L);
}

// GF(256) arithmetic for Reed-Solomon
const EXP = new Uint8Array(512), LOG = new Uint8Array(256);
(() => { let x = 1; for (let i = 0; i < 255; i++) { EXP[i] = x; LOG[x] = i; x <<= 1; if (x & 0x100) x ^= 0x11d; } for (let i = 255; i < 512; i++) EXP[i] = EXP[i - 255]; })();
const mul = (a: number, b: number) => (a && b ? EXP[LOG[a] + LOG[b]] : 0);

function rsEncode(data: number[], ecc: number): number[] {
  let gen = [1];
  for (let i = 0; i < ecc; i++) {
    const next = new Array(gen.length + 1).fill(0);
    for (let j = 0; j < gen.length; j++) { next[j] ^= gen[j]; next[j + 1] ^= mul(gen[j], EXP[i]); }
    gen = next;
  }
  const res = new Array(ecc).fill(0);
  for (const d of data) {
    const factor = d ^ res[0];
    res.shift(); res.push(0);
    for (let i = 0; i < ecc; i++) res[i] ^= mul(gen[i + 1], factor);
  }
  return res;
}

function render(version: number, codewords: number[], ecLevel: number): number[][] {
  const n = version * 4 + 17;
  const m: (number | null)[][] = Array.from({ length: n }, () => new Array(n).fill(null));

  const finder = (r: number, c: number) => {
    for (let y = -1; y <= 7; y++) for (let x = -1; x <= 7; x++) {
      const yy = r + y, xx = c + x;
      if (yy < 0 || yy >= n || xx < 0 || xx >= n) continue;
      const edge = x === -1 || x === 7 || y === -1 || y === 7;
      const ring = (x === 0 || x === 6 || y === 0 || y === 6);
      const core = x >= 2 && x <= 4 && y >= 2 && y <= 4;
      m[yy][xx] = edge ? 0 : (ring || core) ? 1 : 0;
    }
  };
  finder(0, 0); finder(0, n - 7); finder(n - 7, 0);

  for (let i = 8; i < n - 8; i++) { m[6][i] = i % 2 === 0 ? 1 : 0; m[i][6] = i % 2 === 0 ? 1 : 0; }
  if (version >= 2) {
    const pos = [6, n - 7];
    for (const r of pos) for (const c of pos) {
      if ((r === 6 && c === 6) || (r === 6 && c === n - 7) || (r === n - 7 && c === 6)) continue;
      for (let y = -2; y <= 2; y++) for (let x = -2; x <= 2; x++)
        m[r + y][c + x] = Math.max(Math.abs(x), Math.abs(y)) !== 1 ? 1 : 0;
    }
  }
  m[n - 8][8] = 1; // dark module

  const reserved = (y: number, x: number) => m[y][x] !== null;

  // place data, mask 0, then format info
  let bitIdx = 0;
  const bitAt = (i: number) => (i >> 3) < codewords.length ? (codewords[i >> 3] >> (7 - (i & 7))) & 1 : 0;
  let upward = true;
  for (let col = n - 1; col > 0; col -= 2) {
    if (col === 6) col--;
    for (let i = 0; i < n; i++) {
      const row = upward ? n - 1 - i : i;
      for (const c of [col, col - 1]) {
        if (reserved(row, c)) continue;
        const bit = bitAt(bitIdx++);
        m[row][c] = ((row + c) % 2 === 0) ? bit ^ 1 : bit; // mask pattern 0
      }
    }
    upward = !upward;
  }

  const fmt = formatBits(ecLevel, 0);
  const put = (y: number, x: number, v: number) => { m[y][x] = v; };
  for (let i = 0; i <= 5; i++) put(8, i, fmt[i]);
  put(8, 7, fmt[6]); put(8, 8, fmt[7]); put(7, 8, fmt[8]);
  for (let i = 9; i < 15; i++) put(14 - i, 8, fmt[i]);
  for (let i = 0; i < 8; i++) put(n - 1 - i, 8, fmt[i]);
  for (let i = 8; i < 15; i++) put(8, n - 15 + i, fmt[i]);

  return m.map(row => row.map(v => v ?? 0));
}

function formatBits(ec: number, mask: number): number[] {
  const data = (ec << 3) | mask;
  let rem = data;
  for (let i = 0; i < 10; i++) rem = (rem << 1) ^ (((rem >> 9) & 1) * 0x537);
  const bits = ((data << 10) | rem) ^ 0x5412;
  return Array.from({ length: 15 }, (_, i) => (bits >> (14 - i)) & 1);
}

export default InviteShare;
