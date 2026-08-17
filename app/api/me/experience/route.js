// POST /api/me/experience — jobseeker-only, adds a work experience entry
// to the caller's own seeker profile (must already exist).

const { NextResponse } = require('next/server');
const { prisma } = require('../../../../lib/prisma');
const { workExperienceSchema } = require('../../../../lib/validation');
const { getUserFromRequest } = require('../../../../lib/auth');

async function POST(req) {
  const payload = getUserFromRequest(req);
  if (!payload) {
    return NextResponse.json({ error: 'وارد حساب خود شوید' }, { status: 401 });
  }
  if (payload.role !== 'JOBSEEKER') {
    return NextResponse.json({ error: 'فقط حساب‌های کارجو می‌توانند سابقه کاری ثبت کنند' }, { status: 403 });
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

  const parsed = workExperienceSchema.safeParse(body);
  if (!parsed.success) {
    const message = parsed.error.errors[0]?.message || 'اطلاعات نامعتبر است';
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const count = await prisma.workExperience.count({ where: { seekerProfileId: profile.id } });

  const entry = await prisma.workExperience.create({
    data: { ...parsed.data, seekerProfileId: profile.id, order: count },
  });

  return NextResponse.json({ experience: entry }, { status: 201 });
}

module.exports = { POST };
