// POST /api/auth/logout — clears the auth cookie.

const { NextResponse } = require('next/server');
const { buildLogoutCookie } = require('../../../../lib/auth');

async function POST() {
  const res = NextResponse.json({ ok: true });
  res.headers.set('Set-Cookie', buildLogoutCookie());
  return res;
}

module.exports = { POST };
