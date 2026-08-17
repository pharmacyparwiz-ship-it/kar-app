// Lightweight in-memory rate limiter for Next.js API routes.
//
// This is intentionally simple (no Redis dependency) so the app stays
// free-tier friendly. It works correctly on a single-server deployment
// (e.g. one Vercel serverless region under light traffic, or a VPS).
//
// IMPORTANT CAVEAT: on serverless platforms with multiple concurrent
// instances, each instance has its own memory, so the effective limit
// is "N requests per instance" rather than a hard global cap. For a
// small-to-medium local marketplace this is still a meaningful deterrent
// against basic brute-force/spam. If you outgrow this, swap it for
// Upstash Redis (has a free tier) using the same function signature.

const buckets = new Map();

// Periodically clear old buckets so memory doesn't grow unbounded.
setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of buckets.entries()) {
    if (now - bucket.windowStart > 60 * 60 * 1000) {
      buckets.delete(key);
    }
  }
}, 10 * 60 * 1000).unref?.();

function getClientIp(req) {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return req.headers.get('x-real-ip') || 'unknown';
}

/**
 * Checks and increments the rate limit counter for a given request.
 * @param {Request} req - the incoming Next.js request
 * @param {string} routeKey - a short identifier for the route (e.g. 'login')
 * @param {number} maxRequests - max requests allowed within the window
 * @param {number} windowSeconds - window size in seconds
 * @returns {{ allowed: boolean, retryAfterSeconds: number }}
 */
function checkRateLimit(req, routeKey, maxRequests = 10, windowSeconds = 60) {
  const ip = getClientIp(req);
  const key = `${routeKey}:${ip}`;
  const now = Date.now();
  const windowMs = windowSeconds * 1000;

  let bucket = buckets.get(key);
  if (!bucket || now - bucket.windowStart > windowMs) {
    bucket = { windowStart: now, count: 0 };
  }

  bucket.count += 1;
  buckets.set(key, bucket);

  if (bucket.count > maxRequests) {
    const retryAfterSeconds = Math.ceil((bucket.windowStart + windowMs - now) / 1000);
    return { allowed: false, retryAfterSeconds: Math.max(retryAfterSeconds, 1) };
  }

  return { allowed: true, retryAfterSeconds: 0 };
}

module.exports = { checkRateLimit };
