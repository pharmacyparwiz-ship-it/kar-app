// GET  /api/jobs?q=&city=&category=   — public, list/search/filter jobs
// POST /api/jobs                      — employer-only, create a new job listing (rate-limited)

const { NextResponse } = require('next/server');
const { prisma } = require('../../../lib/prisma');
const { jobSchema } = require('../../../lib/validation');
const { getUserFromRequest } = require('../../../lib/auth');
const { checkRateLimit } = require('../../../lib/rateLimit');

async function GET(req) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get('q') || '').trim();
  const city = (searchParams.get('city') || '').trim();
  const category = (searchParams.get('category') || '').trim();

  // mode: 'insensitive' requires PostgreSQL (not supported on SQLite).
  const where = {
    AND: [
      q
        ? {
            OR: [
              { title: { contains: q, mode: 'insensitive' } },
              { desc: { contains: q, mode: 'insensitive' } },
            ],
          }
        : {},
      city ? { city } : {},
      category ? { category } : {},
    ],
  };

  const jobs = await prisma.job.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 200,
  });

  return NextResponse.json({ jobs, count: jobs.length });
}

async function POST(req) {
  const payload = getUserFromRequest(req);
  if (!payload) {
    return NextResponse.json({ error: 'برای ثبت آگهی باید وارد حساب کارفرما شوید' }, { status: 401 });
  }
  if (payload.role !== 'EMPLOYER') {
    return NextResponse.json({ error: 'فقط حساب‌های کارفرما می‌توانند آگهی ثبت کنند' }, { status: 403 });
  }

  const rate = checkRateLimit(req, 'job-create', 20, 60 * 60); // 20 job posts / hour / IP
  if (!rate.allowed) {
    return NextResponse.json(
      { error: 'تعداد آگهی‌های ثبت‌شده در این ساعت زیاد است. کمی صبر کنید.' },
      { status: 429, headers: { 'Retry-After': String(rate.retryAfterSeconds) } }
    );
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'بدنه درخواست نامعتبر است' }, { status: 400 });
  }

  const parsed = jobSchema.safeParse(body);
  if (!parsed.success) {
    const message = parsed.error.errors[0]?.message || 'اطلاعات نامعتبر است';
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const job = await prisma.job.create({
    data: { ...parsed.data, employerId: payload.userId },
  });

  return NextResponse.json({ job }, { status: 201 });
}

module.exports = { GET, POST };
