// POST /api/auth/login
// Verifies phone + password, signs a JWT, sets it as an httpOnly cookie.
// Protected by: IP-based rate limiting, and per-account lockout after
// repeated failed attempts (brute-force protection).

const { NextResponse } = require('next/server');
const { prisma } = require('../../../../lib/prisma');
const { loginSchema } = require('../../../../lib/validation');
const {
  comparePassword,
  signToken,
  buildAuthCookie,
  isLockedOut,
  computeFailedLoginUpdate,
  computeSuccessfulLoginUpdate,
  LOCKOUT_MINUTES,
} = require('../../../../lib/auth');
const { checkRateLimit } = require('../../../../lib/rateLimit');

async function POST(req) {
  const rate = checkRateLimit(req, 'login', 10, 60); // 10 attempts / minute / IP
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

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    const message = parsed.error.errors[0]?.message || 'اطلاعات نامعتبر است';
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const { phone, password } = parsed.data;

  const user = await prisma.user.findUnique({ where: { phone } });
  if (!user) {
    return NextResponse.json({ error: 'شماره یا رمز عبور اشتباه است' }, { status: 401 });
  }

  if (isLockedOut(user)) {
    return NextResponse.json(
      { error: `این حساب به‌دلیل تلاش‌های ناموفق زیاد، موقتاً قفل شده. بعد از ${LOCKOUT_MINUTES} دقیقه دوباره امتحان کنید.` },
      { status: 423 }
    );
  }

  const valid = await comparePassword(password, user.passwordHash);
  if (!valid) {
    const update = computeFailedLoginUpdate(user);
    await prisma.user.update({ where: { id: user.id }, data: update });
    return NextResponse.json({ error: 'شماره یا رمز عبور اشتباه است' }, { status: 401 });
  }

  await prisma.user.update({ where: { id: user.id }, data: computeSuccessfulLoginUpdate() });

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
