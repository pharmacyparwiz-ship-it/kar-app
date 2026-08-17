// POST /api/auth/register
// Creates a new user (jobseeker or employer), hashes their password,
// signs a JWT, and sets it as an httpOnly cookie.
// Protected by IP-based rate limiting to slow down mass account creation.

const { NextResponse } = require('next/server');
const { prisma } = require('../../../../lib/prisma');
const { registerSchema } = require('../../../../lib/validation');
const { hashPassword, signToken, buildAuthCookie } = require('../../../../lib/auth');
const { checkRateLimit } = require('../../../../lib/rateLimit');

async function POST(req) {
  const rate = checkRateLimit(req, 'register', 5, 60); // 5 registrations / minute / IP
  if (!rate.allowed) {
    return NextResponse.json(
      { error: 'تلاش‌های زیاد. کمی صبر کنید و دوباره امتحان کنید.' },
      { status: 429, headers: { 'Retry-After': String(rate.retryAfterSeconds) } }
    );
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'بدنه درخواست نامعتبر است' }, { status: 400 });
  }

  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    const message = parsed.error.errors[0]?.message || 'اطلاعات نامعتبر است';
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const { phone, password, role } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { phone } });
  if (existing) {
    return NextResponse.json(
      { error: 'کاربری با این شماره قبلاً ثبت شده است' },
      { status: 409 }
    );
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: { phone, passwordHash, role },
  });

  const token = signToken({ userId: user.id, role: user.role });

  const res = NextResponse.json({
    id: user.id,
    phone: user.phone,
    role: user.role,
  });
  res.headers.set('Set-Cookie', buildAuthCookie(token));
  return res;
}

module.exports = { POST };
