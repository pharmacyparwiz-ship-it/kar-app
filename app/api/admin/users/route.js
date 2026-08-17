// GET /api/admin/users — admin-only, full user list for moderation

const { NextResponse } = require('next/server');
const { prisma } = require('../../../../lib/prisma');
const { requireAdmin } = require('../../../../lib/adminGuard');

async function GET(req) {
  const admin = await requireAdmin(req);
  if (!admin) {
    return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 403 });
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      phone: true,
      role: true,
      createdAt: true,
      lockedUntil: true,
      _count: { select: { jobs: true } },
      seekerProfile: { select: { id: true } },
    },
  });

  return NextResponse.json({ users });
}

module.exports = { GET };
