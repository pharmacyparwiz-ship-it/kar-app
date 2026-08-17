// Shared guard for admin-only API routes. Verifies the requester is
// logged in AND their phone number is in the ADMIN_PHONES allowlist.
// Returns the user record if authorized, or null (caller should respond 403).

const { prisma } = require('./prisma');
const { getUserFromRequest, isAdminUser } = require('./auth');

async function requireAdmin(req) {
  const payload = getUserFromRequest(req);
  if (!payload) return null;

  const user = await prisma.user.findUnique({ where: { id: payload.userId } });
  if (!user || !isAdminUser(user)) return null;

  return user;
}

module.exports = { requireAdmin };
