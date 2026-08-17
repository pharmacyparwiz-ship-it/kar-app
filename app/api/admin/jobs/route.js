// GET /api/admin/jobs — admin-only, full job list with employer contact info for moderation

const { NextResponse } = require('next/server');
const { prisma } = require('../../../../lib/prisma');
const { requireAdmin } = require('../../../../lib/adminGuard');

async function GET(req) {
  const admin = await requireAdmin(req);
  if (!admin) {
    return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 403 });
  }

  const jobs = await prisma.job.findMany({
    orderBy: { createdAt: 'desc' },
    include: { employer: { select: { phone: true } } },
  });

  return NextResponse.json({ jobs });
}

module.exports = { GET };
