// DELETE /api/admin/users/:id — admin-only, delete a user account
// (cascades to their jobs and/or seeker profile automatically via Prisma schema)

const { NextResponse } = require('next/server');
const { prisma } = require('../../../../../lib/prisma');
const { requireAdmin } = require('../../../../../lib/adminGuard');

async function DELETE(req, { params }) {
  const admin = await requireAdmin(req);
  if (!admin) {
    return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 403 });
  }

  if (admin.id === params.id) {
    return NextResponse.json({ error: 'نمی‌توانید حساب ادمین خودتان را حذف کنید' }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id: params.id } });
  if (!user) {
    return NextResponse.json({ error: 'کاربر پیدا نشد' }, { status: 404 });
  }

  await prisma.user.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}

module.exports = { DELETE };
