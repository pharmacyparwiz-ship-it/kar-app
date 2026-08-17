// Auth helpers: JWT signing/verification and password hashing.
// JWT_SECRET must be set in the environment (see .env.example).
// Tokens are stored client-side in an httpOnly cookie set by the login/register routes.

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const JWT_SECRET = process.env.JWT_SECRET;
const TOKEN_COOKIE = 'kar_token';
const TOKEN_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days

const KNOWN_PLACEHOLDER_SECRETS = [
  'change-this-to-a-long-random-string',
  'secret',
  'changeme',
];

function requireSecret() {
  if (!JWT_SECRET) {
    throw new Error(
      'JWT_SECRET is not set. Copy .env.example to .env and set a strong random value ' +
      '(e.g. run: openssl rand -base64 32).'
    );
  }
  if (JWT_SECRET.length < 32) {
    throw new Error(
      'JWT_SECRET is too short (must be at least 32 characters). ' +
      'Generate a strong one with: openssl rand -base64 32'
    );
  }
  if (KNOWN_PLACEHOLDER_SECRETS.includes(JWT_SECRET)) {
    throw new Error(
      'JWT_SECRET is still set to the placeholder value from .env.example. ' +
      'You MUST change it before running in production — anyone could forge login sessions. ' +
      'Generate a strong one with: openssl rand -base64 32'
    );
  }
}

function signToken(payload) {
  requireSecret();
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_MAX_AGE_SECONDS });
}

function verifyToken(token) {
  requireSecret();
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}

async function hashPassword(plain) {
  return bcrypt.hash(plain, 10);
}

async function comparePassword(plain, hash) {
  return bcrypt.compare(plain, hash);
}

const MAX_FAILED_LOGINS = 5;
const LOCKOUT_MINUTES = 15;

// Returns true if the account is currently locked out due to too many
// recent failed login attempts.
function isLockedOut(user) {
  return !!(user.lockedUntil && new Date(user.lockedUntil) > new Date());
}

// Call after a failed password check. Increments the failure counter and
// locks the account for LOCKOUT_MINUTES once MAX_FAILED_LOGINS is reached.
function computeFailedLoginUpdate(user) {
  const nextCount = (user.failedLoginCount || 0) + 1;
  if (nextCount >= MAX_FAILED_LOGINS) {
    return {
      failedLoginCount: 0,
      lockedUntil: new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000),
    };
  }
  return { failedLoginCount: nextCount, lockedUntil: null };
}

// Call after a successful login to clear any failure history.
function computeSuccessfulLoginUpdate() {
  return { failedLoginCount: 0, lockedUntil: null };
}

// Reads the auth cookie from a Next.js Request object (app router) and
// returns the decoded payload, or null if missing/invalid.
function getUserFromRequest(req) {
  const cookieHeader = req.headers.get('cookie') || '';
  const match = cookieHeader
    .split(';')
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${TOKEN_COOKIE}=`));
  if (!match) return null;
  const token = match.split('=')[1];
  return verifyToken(token);
}

function buildAuthCookie(token) {
  // Secure flag is skipped in dev (http://localhost) but should be added
  // automatically by most hosts (Vercel etc.) terminating TLS in front of the app.
  // We set it conditionally based on NODE_ENV.
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  return `${TOKEN_COOKIE}=${token}; HttpOnly; Path=/; Max-Age=${TOKEN_MAX_AGE_SECONDS}; SameSite=Lax${secure}`;
}

function buildLogoutCookie() {
  return `${TOKEN_COOKIE}=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax`;
}

// Admin access is controlled by an allowlist of phone numbers in the
// ADMIN_PHONES environment variable (comma-separated), not a database flag.
// This keeps admin status out of reach of any API bug or injection — the
// only way to grant it is by editing server environment variables directly.
function getAdminPhones() {
  return (process.env.ADMIN_PHONES || '')
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean);
}

function isAdminPhone(phone) {
  return getAdminPhones().includes(phone);
}

// Convenience check that takes the JWT payload (which only has userId/role)
// plus the phone looked up from the DB. Call sites fetch the user first.
function isAdminUser(user) {
  return !!user && isAdminPhone(user.phone);
}

module.exports = {
  signToken,
  verifyToken,
  hashPassword,
  comparePassword,
  getUserFromRequest,
  buildAuthCookie,
  buildLogoutCookie,
  isLockedOut,
  computeFailedLoginUpdate,
  computeSuccessfulLoginUpdate,
  isAdminPhone,
  isAdminUser,
  MAX_FAILED_LOGINS,
  LOCKOUT_MINUTES,
  TOKEN_COOKIE,
};
