import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db';
import { requireAuth } from '../lib/auth';

// ---------------------------------------------------------------------------
// COMMITTEE MESSAGES, OVER HTTP
//
// The Messages tab has never worked in production. It talks to a socket.io
// server started by server.ts, and production runs api/index.ts, which is the
// Express app alone: a serverless function cannot hold a socket open, so the
// connection failed every time and the tab showed its offline state forever.
//
// So the same three operations, over plain HTTP, which serverless does fine:
// read the recent messages, send one, and ask whether anything is new since a
// given id. The client polls while the tab is open. Slower than a socket, and
// it actually works.
//
// The rules are the socket's rules, unchanged: only an active member of that
// committee may read or write, ten messages per ten seconds, 2000 characters.
// ---------------------------------------------------------------------------

const router = Router();
router.use(requireAuth);

const activeMember = async (committeeId: string, userId: string) =>
  !!(await prisma.committeeMember.findFirst({
    where: { committeeId, userId, status: 'ACTIVE' }, select: { id: true },
  }));

/** Collapse the whitespace a phone keyboard adds; refuse what is left if empty. */
const normalise = (body: string) => body.replace(/\s+/g, ' ').trim().slice(0, 2000);

const withSender = {
  id: true, body: true, pinned: true, sentAt: true,
  sender: { select: { id: true, fullName: true, avatarUrl: true } },
} as const;

/** The recent messages, oldest first so the client can append. */
router.get('/:committeeId', async (req, res, next) => {
  try {
    const { committeeId } = req.params;
    if (!(await activeMember(committeeId, req.auth!.userId))) {
      return res.status(403).json({ error: 'Only members of this committee can read its messages' });
    }
    const after = typeof req.query.after === 'string' ? req.query.after : null;
    const since = after
      ? await prisma.chatMessage.findUnique({ where: { id: after }, select: { sentAt: true } })
      : null;

    const messages = await prisma.chatMessage.findMany({
      where: { committeeId, ...(since ? { sentAt: { gt: since.sentAt } } : {}) },
      select: withSender,
      orderBy: { sentAt: since ? 'asc' : 'desc' },
      take: since ? 100 : 60,
    });
    res.json({ messages: since ? messages : messages.reverse() });
  } catch (error) { next(error); }
});

router.post('/:committeeId', async (req, res, next) => {
  try {
    const { committeeId } = req.params;
    const { body } = z.object({ body: z.string().min(1).max(2000) }).parse(req.body ?? {});
    if (!(await activeMember(committeeId, req.auth!.userId))) {
      return res.status(403).json({ error: 'Only members of this committee can post here' });
    }
    const text = normalise(body);
    if (!text) return res.status(400).json({ error: 'That message is empty' });

    // Ten in ten seconds, counted from what is already stored rather than from
    // a per-connection array, because there is no connection to hang one on.
    const recent = await prisma.chatMessage.count({
      where: { committeeId, senderId: req.auth!.userId, sentAt: { gt: new Date(Date.now() - 10_000) } },
    });
    if (recent >= 10) return res.status(429).json({ error: 'Slow down a moment' });

    const message = await prisma.chatMessage.create({
      data: { committeeId, senderId: req.auth!.userId, body: text },
      select: withSender,
    });
    res.status(201).json(message);
  } catch (error) { next(error); }
});

export default router;
