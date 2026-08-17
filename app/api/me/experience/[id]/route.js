// DELETE /api/me/experience/:id — jobseeker-only, must own the entry

const { NextResponse } = require('next/server');
const { prisma } = require('../../../../../lib/prisma');
const { getUserFromRequest } = require('../../../../../lib/auth');

async function DELETE(req, { params }) {
  const payload = getUserFromRequest(req);
  if (!payload) {
    return NextResponse.json({ error: 'وارد حساب خود شوید' }, { status: 401 });
  }

  const entry = await prisma.workExperience.findUnique({
    where: { id: params.id },
    include: { seekerProfile: true },
  });
  if (!entry) {
    return NextResponse.json({ error: 'مورد پیدا نشد' }, { status: 404 });
  }
  if (entry.seekerProfile.userId !== payload.userId) {
    return NextResponse.json({ error: 'اجازه حذف این مورد را ندارید' }, { status: 403 });
  }

  await prisma.workExperience.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}

module.exports = { DELETE };
