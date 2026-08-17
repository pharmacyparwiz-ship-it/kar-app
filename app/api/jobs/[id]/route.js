// DELETE /api/jobs/:id — employer-only, must own the job listing

const { NextResponse } = require('next/server');
const { prisma } = require('../../../../lib/prisma');
const { getUserFromRequest } = require('../../../../lib/auth');

async function DELETE(req, { params }) {
  const payload = getUserFromRequest(req);
  if (!payload) {
    return NextResponse.json({ error: 'وارد حساب خود شوید' }, { status: 401 });
  }

  const job = await prisma.job.findUnique({ where: { id: params.id } });
  if (!job) {
    return NextResponse.json({ error: 'آگهی پیدا نشد' }, { status: 404 });
  }
  if (job.employerId !== payload.userId) {
    return NextResponse.json({ error: 'اجازه حذف این آگهی را ندارید' }, { status: 403 });
  }

  await prisma.job.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}

module.exports = { DELETE };
