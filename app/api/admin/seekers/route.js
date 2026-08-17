// GET /api/admin/seekers — admin-only, full seeker profile list for moderation

const { NextResponse } = require('next/server');
const { prisma } = require('../../../../lib/prisma');
const { requireAdmin } = require('../../../../lib/adminGuard');

async function GET(req) {
  const admin = await requireAdmin(req);
  if (!admin) {
    return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 403 });
  }

  const seekers = await prisma.seekerProfile.findMany({
    orderBy: { createdAt: 'desc' },
    include: { user: { select: { phone: true } } },
  });

  return NextResponse.json({ seekers });
}

module.exports = { GET };
