import type { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from './db';

type SocketUser = { userId: string };
const normalizeMessage = (body: string) => body.trim();

export function registerSocket(io: Server) {
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) throw new Error('Authentication required');
      socket.data.user = jwt.verify(token, process.env.JWT_SECRET!) as SocketUser;
      next();
    } catch { next(new Error('Authentication failed')); }
  });
  const activeMember = async (committeeId: string, userId: string) => !!(await prisma.committeeMember.findFirst({ where: { committeeId, userId, status: 'ACTIVE' } }));
  io.on('connection', socket => {
    const sentAt: number[] = [];
    socket.on('join_room', async (raw, ack) => {
      const parsed = z.object({ committeeId: z.string() }).safeParse(raw);
      if (!parsed.success || !(await activeMember(parsed.data.committeeId, socket.data.user.userId))) return ack?.({ error: 'Membership required' });
      await socket.join(parsed.data.committeeId);
      ack?.({ ok: true });
    });
    socket.on('get_history', async (raw, ack) => {
      const parsed = z.object({ committeeId: z.string() }).safeParse(raw);
      if (!parsed.success || !(await activeMember(parsed.data.committeeId, socket.data.user.userId))) return ack?.({ error: 'Membership required' });
      const messages = await prisma.chatMessage.findMany({ where: { committeeId: parsed.data.committeeId }, include: { sender: { select: { id: true, fullName: true } } }, orderBy: { sentAt: 'desc' }, take: 100 });
      ack?.({ messages: messages.reverse() });
    });
    socket.on('send_message', async (raw, ack) => {
      const parsed = z.object({ committeeId: z.string(), body: z.string().min(1).max(2000) }).safeParse(raw);
      if (!parsed.success || !(await activeMember(parsed.data.committeeId, socket.data.user.userId))) return ack?.({ error: 'Membership required' });
      const now = Date.now();
      while (sentAt.length && sentAt[0] < now - 10_000) sentAt.shift();
      if (sentAt.length >= 10) return ack?.({ error: 'Message rate limit reached' });
      sentAt.push(now);
      const body = normalizeMessage(parsed.data.body);
      if (!body) return ack?.({ error: 'Message is empty' });
      const message = await prisma.chatMessage.create({ data: { committeeId: parsed.data.committeeId, senderId: socket.data.user.userId, body }, include: { sender: { select: { id: true, fullName: true } } } });
      io.to(parsed.data.committeeId).emit('new_message', message);
      ack?.({ message });
    });
    socket.on('leave_room', (raw) => { if (raw?.committeeId) socket.leave(raw.committeeId); });
  });
}
