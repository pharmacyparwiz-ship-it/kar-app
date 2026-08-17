// DELETE /api/admin/seekers/:id — admin-only, delete any seeker profile

const { NextResponse } = require('next/server');
const { prisma } = require('../../../../../lib/prisma');
const { requireAdmin } = require('../../../../../lib/adminGuard');

async function DELETE(req, { params }) {
  const admin = await requireAdmin(req);
  if (!admin) {
    return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 403 });
  }

  const profile = await prisma.seekerProfile.findUnique({ where: { id: params.id } });
  if (!profile) {
    return NextResponse.json({ error: 'پروفایل پیدا نشد' }, { status: 404 });
  }

  await prisma.seekerProfile.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}

module.exports = { DELETE };
