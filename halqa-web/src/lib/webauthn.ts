// Optional biometric unlock via the WebAuthn platform authenticator (the
// device's fingerprint / Face gate). Prototype-grade: it's a convenience layer
// over the app PIN — the private key never leaves the device, and we persist
// only the credential id (locally + a server "enabled" flag). The PIN remains
// the fallback everywhere, so a device without biometrics is never blocked.
const CRED_KEY = 'halqa_biometric_cred';

export const biometricAvailable = () =>
  typeof window !== 'undefined' && !!window.PublicKeyCredential && !!navigator.credentials?.create;

export const storedCredId = () => { try { return localStorage.getItem(CRED_KEY); } catch { return null; } };

const rand = (n = 32) => { const a = new Uint8Array(n); crypto.getRandomValues(a); return a; };
const toB64 = (buf: ArrayBuffer) => btoa(String.fromCharCode(...new Uint8Array(buf)));
const fromB64 = (s: string) => Uint8Array.from(atob(s), c => c.charCodeAt(0));

// Register a platform credential and return its id (also cached locally). Null
// if unsupported or the user cancels.
export async function registerBiometric(userId: string, userName: string): Promise<string | null> {
  if (!biometricAvailable()) return null;
  try {
    const cred = await navigator.credentials.create({ publicKey: {
      challenge: rand(),
      rp: { name: 'Halqa' },
      user: { id: new TextEncoder().encode(userId).slice(0, 64), name: userName, displayName: userName },
      pubKeyCredParams: [{ type: 'public-key', alg: -7 }, { type: 'public-key', alg: -257 }],
      authenticatorSelection: { authenticatorAttachment: 'platform', userVerification: 'required' },
      timeout: 60_000,
    } }) as PublicKeyCredential | null;
    if (!cred) return null;
    const id = toB64(cred.rawId);
    try { localStorage.setItem(CRED_KEY, id); } catch { /* storage full */ }
    return id;
  } catch { return null; }
}

// Prompt the device biometric and confirm the stored credential. Returns true on
// a successful assertion.
export async function assertBiometric(credentialId?: string | null): Promise<boolean> {
  const id = credentialId ?? storedCredId();
  if (!biometricAvailable() || !id) return false;
  try {
    const assertion = await navigator.credentials.get({ publicKey: {
      challenge: rand(),
      allowCredentials: [{ type: 'public-key', id: fromB64(id) }],
      userVerification: 'required',
      timeout: 60_000,
    } });
    return !!assertion;
  } catch { return false; }
}

export const clearBiometric = () => { try { localStorage.removeItem(CRED_KEY); } catch { /* ignore */ } };
