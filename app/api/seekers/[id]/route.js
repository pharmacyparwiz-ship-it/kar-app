// GET    /api/seekers/:id — public, full profile with experience + projects
// DELETE /api/seekers/:id — jobseeker-only, must own the profile

const { NextResponse } = require('next/server');
const { prisma } = require('../../../../lib/prisma');
const { getUserFromRequest } = require('../../../../lib/auth');

async function GET(req, { params }) {
  const profile = await prisma.seekerProfile.findUnique({
    where: { id: params.id },
    include: {
      user: { select: { phone: true } },
      experience: { orderBy: { order: 'asc' } },
      projects: { orderBy: { order: 'asc' } },
    },
  });

  if (!profile) {
    return NextResponse.json({ error: 'پروفایل پیدا نشد' }, { status: 404 });
  }

  return NextResponse.json({
    profile: {
      id: profile.id,
      name: profile.name,
      city: profile.city,
      skill: profile.skill,
      desc: profile.desc,
      yearsExperience: profile.yearsExperience,
      phone: profile.user.phone,
      createdAt: profile.createdAt,
      experience: profile.experience,
      projects: profile.projects,
    },
  });
}

async function DELETE(req, { params }) {
  const payload = getUserFromRequest(req);
  if (!payload) {
    return NextResponse.json({ error: 'وارد حساب خود شوید' }, { status: 401 });
  }

  const profile = await prisma.seekerProfile.findUnique({ where: { id: params.id } });
  if (!profile) {
    return NextResponse.json({ error: 'پروفایل پیدا نشد' }, { status: 404 });
  }
  if (profile.userId !== payload.userId) {
    return NextResponse.json({ error: 'اجازه حذف این پروفایل را ندارید' }, { status: 403 });
  }

  await prisma.seekerProfile.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}

module.exports = { GET, DELETE };
