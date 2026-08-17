// GET /api/employers/:id — public, employer's profile with their job listings
// This is the employer-side counterpart to /api/seekers/[id].

const { NextResponse } = require('next/server');
const { prisma } = require('../../../../lib/prisma');

async function GET(req, { params }) {
  const employer = await prisma.user.findUnique({
    where: { id: params.id },
    include: {
      jobs: { orderBy: { createdAt: 'desc' } },
    },
  });

  if (!employer || employer.role !== 'EMPLOYER') {
    return NextResponse.json({ error: 'کارفرما پیدا نشد' }, { status: 404 });
  }

  // Business name is taken from their most recent job listing (biz field),
  // since employers don't have a separate profile record like seekers do.
  const businessName = employer.jobs[0]?.biz || null;
  const city = employer.jobs[0]?.city || null;

  return NextResponse.json({
    employer: {
      id: employer.id,
      phone: employer.phone,
      businessName,
      city,
      createdAt: employer.createdAt,
      jobs: employer.jobs,
    },
  });
}

module.exports = { GET };
