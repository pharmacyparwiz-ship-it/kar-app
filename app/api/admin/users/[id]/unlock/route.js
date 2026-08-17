// POST /api/admin/users/:id/unlock — admin-only, remove an account suspension

const { NextResponse } = require('next/server');
const { prisma } = require('../../../../../../lib/prisma');
const { requireAdmin } = require('../../../../../../lib/adminGuard');

async function POST(req, { params }) {
  const admin = await requireAdmin(req);
  if (!admin) {
    return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 403 });
  }

  await prisma.user.update({
    where: { id: params.id },
    data: { lockedUntil: null, failedLoginCount: 0 },
  });

  return NextResponse.json({ ok: true });
}

module.exports = { POST };
