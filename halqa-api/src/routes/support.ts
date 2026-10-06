import { Router } from 'express';
import { idParam } from '../lib/params';
import { readPage } from '../lib/page';
import { safeRouter } from '../lib/safe-router';
import { z } from 'zod';
import { prisma } from '../db';
import { requireAuth } from '../lib/auth';
import { audit } from '../lib/audit';

// ---------------------------------------------------------------------------
// SUPPORT AND DISPUTES
//
// The one thing every wallet a Pakistani member already uses has, and Halqa did
// not: a way to say "this is wrong" and get a reference number back. Until now
// the only route was an email address on a settings page, which is not a route
// somebody in trouble takes.
//
// A ticket is either a plain question or a dispute against one recorded
// payment. Disputing is deliberately narrow: a member can only dispute a
// payment they made themselves, and only once, because a dispute is a claim
// against the circle's ledger and the ledger is the product.
// ---------------------------------------------------------------------------

// safeRouter, not Router: a rejected promise in any handler below reaches the
// error handler instead of hanging the request (lib/safe-router.ts).
const router = safeRouter();
router.use(requireAuth);

const CATEGORIES = ['QUESTION', 'PAYMENT', 'PAYOUT', 'ACCOUNT', 'CIRCLE', 'OTHER'] as const;

/** Short, readable, and unique enough to quote down a phone line. */
function reference(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';   // no I, O, 0, 1
  let tail = '';
  for (let i = 0; i < 5; i++) tail += alphabet[Math.floor(Math.random() * alphabet.length)];
  return 'HS-' + tail;
}

const publicTicket = {
  id: true, reference: true, category: true, subject: true, body: true,
  status: true, paymentId: true, committeeId: true, createdAt: true, updatedAt: true,
} as const;

/** Everything the member has ever raised, newest first. */
router.get('/tickets', async (req, res, next) => {
  try {
    // Was a fixed 50 with no cursor, so an older case became unreachable.
    const { take, cursorArgs } = readPage(req.query);
    const tickets = await prisma.supportTicket.findMany({
      where: { userId: req.auth!.userId },
      select: { ...publicTicket, messages: { select: { id: true, author: true, body: true, createdAt: true }, orderBy: { createdAt: 'asc' } } },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],   // id breaks ties, so a cursor is sound
      take, ...cursorArgs,
    });
    res.json({ tickets, open: tickets.filter(t => t.status === 'OPEN').length });
  } catch (error) { next(error); }
});

router.get('/tickets/:id', async (req, res, next) => {
  try {
    idParam.parse(req.params);
    const ticket = await prisma.supportTicket.findFirst({
      where: { id: req.params.id, userId: req.auth!.userId },
      select: { ...publicTicket, messages: { select: { id: true, author: true, body: true, createdAt: true }, orderBy: { createdAt: 'asc' } } },
    });
    if (!ticket) return res.status(404).json({ error: 'No such ticket' });
    res.json(ticket);
  } catch (error) { next(error); }
});

router.post('/tickets', async (req, res, next) => {
  try {
    const input = z.object({
      category: z.enum(CATEGORIES).default('QUESTION'),
      subject: z.string().trim().min(3).max(120),
      body: z.string().trim().min(5).max(4000),
      paymentId: z.string().trim().optional(),
      committeeId: z.string().trim().optional(),
    }).parse(req.body ?? {});

    // A dispute names a payment, and it has to be the member's own. Anything
    // else is somebody asking about a transaction that is none of their
    // business, and the ledger will not discuss it.
    if (input.paymentId) {
      const payment = await prisma.payment.findFirst({
        where: { id: input.paymentId, payerId: req.auth!.userId },
        select: { id: true },
      });
      if (!payment) return res.status(404).json({ error: 'That payment is not one of yours' });
      const already = await prisma.supportTicket.findFirst({
        where: { paymentId: input.paymentId, userId: req.auth!.userId, status: { in: ['OPEN', 'ANSWERED'] } },
        select: { reference: true },
      });
      if (already) return res.status(409).json({ error: `You already have an open case on that payment, ${already.reference}` });
    }

    const open = await prisma.supportTicket.count({
      where: { userId: req.auth!.userId, status: { in: ['OPEN', 'ANSWERED'] } },
    });
    if (open >= 10) return res.status(429).json({ error: 'You have ten cases open already. Let those be answered first.' });

    const ticket = await prisma.$transaction(async tx => {
      const ticket = await tx.supportTicket.create({
        data: {
          reference: reference(),
          userId: req.auth!.userId,
          category: input.category,
          subject: input.subject,
          body: input.body,
          paymentId: input.paymentId ?? null,
          committeeId: input.committeeId ?? null,
          messages: { create: { author: 'MEMBER', body: input.body } },
        },
        select: { ...publicTicket, messages: { select: { id: true, author: true, body: true, createdAt: true } } },
      });
      await audit(tx, req.auth!.userId, 'SUPPORT_TICKET_OPENED', 'SupportTicket', ticket.id,
        { reference: ticket.reference, category: ticket.category });
      return ticket;
    });
    res.status(201).json(ticket);
  } catch (error) { next(error); }
});

/** Add to a case that is still open. */
router.post('/tickets/:id/reply', async (req, res, next) => {
  try {
    idParam.parse(req.params);
    const { body } = z.object({ body: z.string().trim().min(2).max(4000) }).parse(req.body ?? {});
    const ticket = await prisma.supportTicket.findFirst({
      where: { id: req.params.id, userId: req.auth!.userId },
      select: { id: true, status: true },
    });
    if (!ticket) return res.status(404).json({ error: 'No such ticket' });
    if (ticket.status === 'CLOSED') return res.status(409).json({ error: 'That case is closed. Open a new one and quote the old reference.' });
    await prisma.supportMessage.create({ data: { ticketId: ticket.id, author: 'MEMBER', body } });
    const updated = await prisma.supportTicket.update({
      where: { id: ticket.id },
      data: { status: 'OPEN' },
      select: { ...publicTicket, messages: { select: { id: true, author: true, body: true, createdAt: true }, orderBy: { createdAt: 'asc' } } },
    });
    res.json(updated);
  } catch (error) { next(error); }
});

/** The member is satisfied. Only they can say so. */
router.post('/tickets/:id/close', async (req, res, next) => {
  try {
    idParam.parse(req.params);
    const ticket = await prisma.supportTicket.findFirst({
      where: { id: req.params.id, userId: req.auth!.userId }, select: { id: true },
    });
    if (!ticket) return res.status(404).json({ error: 'No such ticket' });
    const updated = await prisma.$transaction(async tx => {
      const updated = await tx.supportTicket.update({
        where: { id: ticket.id }, data: { status: 'CLOSED' }, select: publicTicket,
      });
      await audit(tx, req.auth!.userId, 'SUPPORT_TICKET_CLOSED', 'SupportTicket', ticket.id, {});
      return updated;
    });
    res.json(updated);
  } catch (error) { next(error); }
});

export default router;
