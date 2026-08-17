// GET /api/admin/stats — admin-only, quick overview numbers

const { NextResponse } = require('next/server');
const { prisma } = require('../../../../lib/prisma');
const { requireAdmin } = require('../../../../lib/adminGuard');

async function GET(req) {
  const admin = await requireAdmin(req);
  if (!admin) {
    return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 403 });
  }

  const [userCount, jobCount, seekerCount, lockedCount] = await Promise.all([
    prisma.user.count(),
    prisma.job.count(),
    prisma.seekerProfile.count(),
    prisma.user.count({ where: { lockedUntil: { gt: new Date() } } }),
  ]);

  return NextResponse.json({ userCount, jobCount, seekerCount, lockedCount });
}

module.exports = { GET };
