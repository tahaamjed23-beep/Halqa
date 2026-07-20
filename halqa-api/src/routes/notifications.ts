import { Router } from 'express';
import { prisma } from '../db';
import { requireAuth } from '../lib/auth';

const router = Router();
router.use(requireAuth);
router.get('/', async (req, res) => res.json(await prisma.notification.findMany({ where: { userId: req.auth!.userId }, orderBy: { createdAt: 'desc' }, take: 50 })));
router.patch('/:id/read', async (req, res) => {
  const result = await prisma.notification.updateMany({ where: { id: req.params.id, userId: req.auth!.userId }, data: { isRead: true } });
  res.json({ updated: result.count });
});
router.patch('/read-all', async (req, res) => {
  const result = await prisma.notification.updateMany({ where: { userId: req.auth!.userId, isRead: false }, data: { isRead: true } });
  res.json({ updated: result.count });
});
export default router;
