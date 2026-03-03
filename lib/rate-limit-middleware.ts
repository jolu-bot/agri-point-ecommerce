import { NextRequest, NextResponse } from 'next/server';

/**
 * Middleware pour rate limiting côté serveur (simple)
 * Pour production: utiliser Redis + Upstash
 */

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetAt: number;
  };
}

const rateLimitStore: RateLimitStore = {};

export async function rateLimit(
  request: NextRequest,
  limit: number,
  windowMs: number
): Promise<{
  allowed: boolean;
  remaining: number;
  resetAt: number;
}> {
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  const path = request.nextUrl.pathname;
  const key = `${ip}:${path}`;

  const now = Date.now();
  const entry = rateLimitStore[key];

  if (!entry || now > entry.resetAt) {
    // Reset window
    rateLimitStore[key] = {
      count: 1,
      resetAt: now + windowMs,
    };
    return {
      allowed: true,
      remaining: limit - 1,
      resetAt: rateLimitStore[key].resetAt,
    };
  }

  entry.count++;
  const remaining = Math.max(0, limit - entry.count);
  const allowed = entry.count <= limit;

  return {
    allowed,
    remaining,
    resetAt: entry.resetAt,
  };
}

export async function rateLimitMiddleware(
  request: NextRequest,
  limit: number,
  windowMs: number
) {
  const { allowed, remaining, resetAt } = await rateLimit(request, limit, windowMs);

  const response = NextResponse.next();
  response.headers.set('X-RateLimit-Limit', String(limit));
  response.headers.set('X-RateLimit-Remaining', String(remaining));
  response.headers.set('X-RateLimit-Reset', String(resetAt));

  if (!allowed) {
    return new NextResponse(
      JSON.stringify({
        error: 'Too many requests',
        retryAfter: Math.ceil((resetAt - Date.now()) / 1000),
      }),
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': String(limit),
          'X-RateLimit-Remaining': String(remaining),
          'X-RateLimit-Reset': String(resetAt),
          'Retry-After': String(Math.ceil((resetAt - Date.now()) / 1000)),
        },
      }
    );
  }

  return response;
}
