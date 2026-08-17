// GET /api/me
// Returns the currently authenticated user's basic info, plus their
// seeker profile (if jobseeker) or posted jobs (if employer).

const { NextResponse } = require('next/server');
const { prisma } = require('../../../lib/prisma');
const { getUserFromRequest, isAdminUser } = require('../../../lib/auth');

async function GET(req) {
  const payload = getUserFromRequest(req);
  if (!payload) {
    return NextResponse.json({ user: null }, { status: 200 });
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    include: {
      seekerProfile: {
        include: {
          experience: { orderBy: { order: 'asc' } },
          projects: { orderBy: { order: 'asc' } },
        },
      },
      jobs: true,
    },
  });

  if (!user) {
    return NextResponse.json({ user: null }, { status: 200 });
  }

  return NextResponse.json({
    user: {
      id: user.id,
      phone: user.phone,
      role: user.role,
      seekerProfile: user.seekerProfile,
      jobs: user.jobs,
      isAdmin: isAdminUser(user),
    },
  });
}

module.exports = { GET };
