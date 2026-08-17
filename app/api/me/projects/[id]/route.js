// DELETE /api/me/projects/:id — jobseeker-only, must own the entry

const { NextResponse } = require('next/server');
const { prisma } = require('../../../../../lib/prisma');
const { getUserFromRequest } = require('../../../../../lib/auth');

async function DELETE(req, { params }) {
  const payload = getUserFromRequest(req);
  if (!payload) {
    return NextResponse.json({ error: 'وارد حساب خود شوید' }, { status: 401 });
  }

  const project = await prisma.project.findUnique({
    where: { id: params.id },
    include: { seekerProfile: true },
  });
  if (!project) {
    return NextResponse.json({ error: 'مورد پیدا نشد' }, { status: 404 });
  }
  if (project.seekerProfile.userId !== payload.userId) {
    return NextResponse.json({ error: 'اجازه حذف این مورد را ندارید' }, { status: 403 });
  }

  await prisma.project.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}

module.exports = { DELETE };
