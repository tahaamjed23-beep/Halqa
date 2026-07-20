// Payment-rail integration layer.
//
// This is the seam where real Pakistani rails plug in. Each provider is
// selected by environment variable; when none is configured the SANDBOX
// provider runs, which produces a real-shaped payment instruction and
// (optionally) auto-confirms it so the pay/collect loop is fully exercisable
// today without any merchant credentials.
//
// To go live, set the credentials for a rail (e.g. RAAST_API_URL +
// RAAST_API_KEY, or JAZZCASH_MERCHANT_ID + JAZZCASH_PASSWORD) and implement
// the corresponding branch in initiatePayment(). Nothing else in the app
// changes — the route and the settlement path are provider-agnostic.

export type Rail = 'RAAST' | 'JAZZCASH' | 'EASYPAISA' | 'BANK_TRANSFER' | 'CASH';

export interface PaymentInstruction {
  provider: string;        // which rail actually handled it
  reference: string;       // the transaction reference recorded on the ledger
  instruction: string;     // human text: what the payer should do / what happened
  deepLink?: string;       // app/deeplink to complete payment on a real rail
  autoConfirm: boolean;    // sandbox: settle immediately; real: false, await webhook
}

const env = (k: string) => (typeof process !== 'undefined' ? process.env?.[k] : undefined);

// A rail is "live" only when its credentials are present. Until then the
// sandbox handles it, so the product is demonstrable end to end.
export function railIsLive(rail: Rail): boolean {
  switch (rail) {
    case 'RAAST': return !!(env('RAAST_API_URL') && env('RAAST_API_KEY'));
    case 'JAZZCASH': return !!(env('JAZZCASH_MERCHANT_ID') && env('JAZZCASH_PASSWORD'));
    case 'EASYPAISA': return !!(env('EASYPAISA_STORE_ID') && env('EASYPAISA_HASH_KEY'));
    default: return false; // BANK_TRANSFER / CASH are always manual-reference
  }
}

const ref = (rail: Rail) => `${rail === 'RAAST' ? 'RST' : rail === 'JAZZCASH' ? 'JZC' : rail === 'EASYPAISA' ? 'EZP' : 'REF'}-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

// Produce a payment instruction for an installment. In sandbox this returns an
// auto-confirming instruction; when a rail is live it would create the real
// charge and return autoConfirm:false to await the provider's webhook.
export async function initiatePayment(rail: Rail, amountPaisa: bigint, providedRef?: string): Promise<PaymentInstruction> {
  const reference = providedRef?.trim() || ref(rail);
  if (railIsLive(rail)) {
    // Live branch — implement the real call per rail when credentials land.
    // e.g. Raast Request-to-Pay create, or JazzCash/Easypaisa hosted charge.
    // Until implemented, we fail loud rather than silently sandboxing live money.
    throw Object.assign(new Error(`${rail} is configured as live but its integration is not yet implemented`), { status: 501 });
  }
  if (rail === 'CASH' || rail === 'BANK_TRANSFER') {
    return { provider: 'MANUAL', reference, instruction: `Record the ${rail === 'CASH' ? 'cash' : 'bank transfer'} once received.`, autoConfirm: false };
  }
  // Sandbox rail: instantly confirmable, so create/join/pay/collect works today.
  return {
    provider: `${rail}_SANDBOX`,
    reference,
    instruction: `Sandbox ${rail}: Rs ${(Number(amountPaisa) / 100).toLocaleString('en-PK')} confirmed instantly. No real money moved.`,
    deepLink: undefined,
    autoConfirm: true,
  };
}
