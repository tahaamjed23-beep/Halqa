import { prisma } from '../db';

export async function assertMember(committeeId: string, userId: string) {
  const membership = await prisma.committeeMember.findUnique({
    where: { committeeId_userId: { committeeId, userId } },
  });
  if (!membership || membership.status !== 'ACTIVE') throw Object.assign(new Error('Committee membership required'), { status: 403 });
  return membership;
}

export async function assertHost(committeeId: string, userId: string) {
  const committee = await prisma.committee.findUnique({ where: { id: committeeId } });
  if (!committee) throw Object.assign(new Error('Committee not found'), { status: 404 });
  if (committee.hostId !== userId) throw Object.assign(new Error('Host access required'), { status: 403 });
  return committee;
}
