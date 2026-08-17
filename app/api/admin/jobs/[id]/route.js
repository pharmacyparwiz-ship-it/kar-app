// DELETE /api/admin/jobs/:id — admin-only, delete any job listing

const { NextResponse } = require('next/server');
const { prisma } = require('../../../../../lib/prisma');
const { requireAdmin } = require('../../../../../lib/adminGuard');

async function DELETE(req, { params }) {
  const admin = await requireAdmin(req);
  if (!admin) {
    return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 403 });
  }

  const job = await prisma.job.findUnique({ where: { id: params.id } });
  if (!job) {
    return NextResponse.json({ error: 'آگهی پیدا نشد' }, { status: 404 });
  }

  await prisma.job.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}

module.exports = { DELETE };
