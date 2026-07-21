import type { Prisma } from '@prisma/client';
import { audit } from './audit';

// WhatsApp delivery rail. Every debit of a member's money produces a receipt
// message and mandate setup produces an OTP — queued here as rows the member
// sees in-app immediately (Notification) plus an export row (AuditLog
// WHATSAPP_QUEUED) that a gateway dispatcher drains once a WhatsApp Business
// provider is connected (env WHATSAPP_GATEWAY_URL — BANK PARTNER stage; no
// real message leaves the machine before that, and the app never pretends one
// did). The queue is written inside the same transaction as the money event,
// so a receipt can never exist for a debit that rolled back.

export const receiptNo = (paymentId: string) => `RCPT-${paymentId.slice(-8).toUpperCase()}`;

export function debitReceiptText(args: { committeeName: string; roundNumber: number; amountPaisa: bigint; rail: string; txnRef: string; paymentId: string; penaltyPaisa?: bigint }): string {
  const rupees = (v: bigint) => `Rs ${(Number(v) / 100).toLocaleString('en-PK')}`;
  return `Halqa receipt ${receiptNo(args.paymentId)} — ${rupees(args.amountPaisa)} collected for ${args.committeeName}, round ${args.roundNumber}, via ${args.rail}${args.penaltyPaisa && args.penaltyPaisa > 0n ? ` (incl. late adjustment ${rupees(args.penaltyPaisa)})` : ''}. Ref ${args.txnRef}. This counts toward your reliability score. Halqa records the movement — it never holds your money.`;
}

export async function queueWhatsApp(tx: Prisma.TransactionClient, args: { userId: string; kind: 'DEBIT_RECEIPT' | 'MANDATE_OTP'; text: string; refType: string; refId: string }) {
  await tx.notification.create({ data: { userId: args.userId, type: 'WHATSAPP_RECEIPT', message: args.text } });
  await audit(tx, null, 'WHATSAPP_QUEUED', args.refType, args.refId, { userId: args.userId, kind: args.kind, text: args.text, gateway: process.env.WHATSAPP_GATEWAY_URL ? 'CONFIGURED' : 'PENDING_PARTNER' });
}
