// POST /api/admin/users/:id/lock — admin-only, suspend an account without
// deleting its data. Reuses the same lockedUntil field as the brute-force
// lockout mechanism, set far in the future to act as an indefinite suspension.

const { NextResponse } = require('next/server');
const { prisma } = require('../../../../../../lib/prisma');
const { requireAdmin } = require('../../../../../../lib/adminGuard');

async function POST(req, { params }) {
  const admin = await requireAdmin(req);
  if (!admin) {
    return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 403 });
  }

  if (admin.id === params.id) {
    return NextResponse.json({ error: 'نمی‌توانید حساب ادمین خودتان را مسدود کنید' }, { status: 400 });
  }

  const farFuture = new Date();
  farFuture.setFullYear(farFuture.getFullYear() + 100);

  await prisma.user.update({
    where: { id: params.id },
    data: { lockedUntil: farFuture },
  });

  return NextResponse.json({ ok: true });
}

module.exports = { POST };
