import { safeRouter } from '../lib/safe-router';
import { idParam } from '../lib/params';
import { readPage, sendPage } from '../lib/page';
import { Router } from 'express';

import { prisma } from '../db';

import { requireAuth } from '../lib/auth';



// safeRouter, not Router: a rejected promise in any handler below reaches the
// error handler instead of hanging the request (lib/safe-router.ts).
const router = safeRouter();

router.use(requireAuth);

router.get('/', async (req, res) => {
  // Was a fixed take of 50 with no way to reach the 51st notice, so a member
  // with a year of history simply could not see the older ones.
  const { take, cursorArgs } = readPage(req.query);
  const rows = await prisma.notification.findMany({
    where: { userId: req.auth!.userId },
    // id is the tiebreaker, and it has to be: two notices written in the same
    // transaction share a createdAt, and a cursor over a non unique ordering
    // can show a row twice or skip it entirely.
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    take, ...cursorArgs,
  });
  sendPage(res, rows, take);
});

router.patch('/:id/read', async (req, res) => {
  idParam.parse(req.params);

  // The member's own id is in the WHERE, so another member's notice is never

  // touched whatever id is sent. It used to answer 200 {updated: 0} in that

  // case, which told the caller nothing: a notice that was marked and one that

  // was never theirs read identically. Nothing is leaked by saying so, because

  // the two reasons for a miss are already indistinguishable from here.

  const result = await prisma.notification.updateMany({ where: { id: req.params.id, userId: req.auth!.userId }, data: { isRead: true } });

  if (result.count === 0) return res.status(404).json({ error: 'No such notice' });

  res.json({ updated: result.count });

});

router.patch('/read-all', async (req, res) => {

  const result = await prisma.notification.updateMany({ where: { userId: req.auth!.userId, isRead: false }, data: { isRead: true } });

  res.json({ updated: result.count });

});

export default router;

