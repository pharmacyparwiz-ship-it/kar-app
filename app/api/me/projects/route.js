// POST /api/me/projects — jobseeker-only, adds a project/portfolio entry
// to the caller's own seeker profile (must already exist).

const { NextResponse } = require('next/server');
const { prisma } = require('../../../../lib/prisma');
const { projectSchema } = require('../../../../lib/validation');
const { getUserFromRequest } = require('../../../../lib/auth');

async function POST(req) {
  const payload = getUserFromRequest(req);
  if (!payload) {
    return NextResponse.json({ error: 'وارد حساب خود شوید' }, { status: 401 });
  }
  if (payload.role !== 'JOBSEEKER') {
    return NextResponse.json({ error: 'فقط حساب‌های کارجو می‌توانند پروژه ثبت کنند' }, { status: 403 });
  }

  const profile = await prisma.seekerProfile.findUnique({ where: { userId: payload.userId } });
  if (!profile) {
    return NextResponse.json({ error: 'ابتدا پروفایل کارجو خود را بسازید' }, { status: 400 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'بدنه درخواست نامعتبر است' }, { status: 400 });
  }

  const parsed = projectSchema.safeParse(body);
  if (!parsed.success) {
    const message = parsed.error.errors[0]?.message || 'اطلاعات نامعتبر است';
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const count = await prisma.project.count({ where: { seekerProfileId: profile.id } });

  const project = await prisma.project.create({
    data: { ...parsed.data, seekerProfileId: profile.id, order: count },
  });

  return NextResponse.json({ project }, { status: 201 });
}

module.exports = { POST };
