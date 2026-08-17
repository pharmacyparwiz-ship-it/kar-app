// GET  /api/seekers  — public, list jobseeker profiles (for employers to browse)
// POST /api/seekers  — jobseeker-only, create or update their own profile

const { NextResponse } = require('next/server');
const { prisma } = require('../../../lib/prisma');
const { seekerProfileSchema } = require('../../../lib/validation');
const { getUserFromRequest } = require('../../../lib/auth');
const { checkRateLimit } = require('../../../lib/rateLimit');

async function GET(req) {
  const { searchParams } = new URL(req.url);
  const city = (searchParams.get('city') || '').trim();

  const seekers = await prisma.seekerProfile.findMany({
    where: city ? { city } : {},
    orderBy: { createdAt: 'desc' },
    take: 200,
    include: {
      user: { select: { phone: true } },
      experience: { orderBy: { order: 'asc' } },
      projects: { orderBy: { order: 'asc' } },
    },
  });

  const shaped = seekers.map((s) => ({
    id: s.id,
    name: s.name,
    city: s.city,
    skill: s.skill,
    desc: s.desc,
    yearsExperience: s.yearsExperience,
    phone: s.user.phone,
    createdAt: s.createdAt,
    experience: s.experience,
    projects: s.projects,
  }));

  return NextResponse.json({ seekers: shaped, count: shaped.length });
}

async function POST(req) {
  const payload = getUserFromRequest(req);
  if (!payload) {
    return NextResponse.json({ error: 'برای ثبت پروفایل باید وارد حساب کارجو شوید' }, { status: 401 });
  }
  if (payload.role !== 'JOBSEEKER') {
    return NextResponse.json({ error: 'فقط حساب‌های کارجو می‌توانند پروفایل ثبت کنند' }, { status: 403 });
  }

  const rate = checkRateLimit(req, 'seeker-profile', 20, 60 * 10); // 20 saves / 10 min / IP
  if (!rate.allowed) {
    return NextResponse.json(
      { error: 'تعداد درخواست زیاد است. کمی صبر کنید.' },
      { status: 429, headers: { 'Retry-After': String(rate.retryAfterSeconds) } }
    );
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'بدنه درخواست نامعتبر است' }, { status: 400 });
  }

  const parsed = seekerProfileSchema.safeParse(body);
  if (!parsed.success) {
    const message = parsed.error.errors[0]?.message || 'اطلاعات نامعتبر است';
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const profile = await prisma.seekerProfile.upsert({
    where: { userId: payload.userId },
    update: parsed.data,
    create: { ...parsed.data, userId: payload.userId },
  });

  return NextResponse.json({ profile }, { status: 201 });
}

module.exports = { GET, POST };
