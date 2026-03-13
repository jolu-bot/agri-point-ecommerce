/**
 * Lightweight in-memory rate limiter — no external dependencies.
 *
 * NOTE: In-memory state resets on cold starts (Vercel serverless).
 * Provides protection against rapid-fire attacks within a single warm
 * lambda instance. For production-grade rate limiting, swap for
 * @upstash/ratelimit backed by Redis.
 */

interface Entry {
  count: number;
  resetAt: number;
}

const store = new Map<string, Entry>();

/**
 * Returns true if the request is allowed, false if rate-limited.
 * @param key     Unique identifier (e.g. IP address)
 * @param limit   Max requests allowed in the window (default 5)
 * @param windowMs Window duration in milliseconds (default 1 hour)
 */
export function rateLimit(
  key: string,
  limit = 5,
  windowMs = 60 * 60 * 1000
): boolean {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (entry.count >= limit) return false;

  entry.count++;
  return true;
}

/** Extract the real client IP from Next.js request headers. */
export function getClientIp(req: { headers: { get: (h: string) => string | null } }): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'
  );
}
