import { Redis } from '@upstash/redis';

/**
 * Redis-based distributed rate limiter (multi-instance safe)
 */
export class RedisRateLimiter {
  private redis: Redis;
  private windowMs: number;
  private maxRequests: number;

  constructor(
    redisUrl: string,
    redisToken: string,
    windowMs: number = 60000,
    maxRequests: number = 100
  ) {
    this.redis = new Redis({
      url: redisUrl,
      token: redisToken,
    });
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
  }

  /**
   * Check if request is allowed
   */
  async isAllowed(key: string): Promise<boolean> {
    try {
      const count = await this.redis.incr(key);

      if (count === 1) {
        // Set expiration on first request
        await this.redis.expire(key, Math.ceil(this.windowMs / 1000));
      }

      return count <= this.maxRequests;
    } catch (error) {
      console.error('Rate limiter check failed:', error);
      // Fallback: allow request if Redis fails
      return true;
    }
  }

  /**
   * Get remaining requests
   */
  async getRemaining(key: string): Promise<number> {
    try {
      const count = await this.redis.get<number>(key);
      return Math.max(0, this.maxRequests - (count || 0));
    } catch (error) {
      return this.maxRequests;
    }
  }

  /**
   * Reset counter for key
   */
  async reset(key: string): Promise<void> {
    try {
      await this.redis.del(key);
    } catch (error) {
      console.error('Rate limiter reset failed:', error);
    }
  }

  /**
   * Get TTL (time to live) for current window
   */
  async getTTL(key: string): Promise<number> {
    try {
      const ttl = await this.redis.ttl(key);
      return ttl > 0 ? ttl : 0;
    } catch (error) {
      return 0;
    }
  }
}

/**
 * Middleware pour rate limiting (Express/Next.js)
 */
export function createRateLimitMiddleware(rateLimiter: RedisRateLimiter) {
  return async (req: any, res: any, next: any) => {
    try {
      const key = `rate_limit:${req.ip}:${req.path}`;
      const allowed = await rateLimiter.isAllowed(key);
      const remaining = await rateLimiter.getRemaining(key);
      const resetTime = await rateLimiter.getTTL(key);

      res.set('X-RateLimit-Limit', String(rateLimiter['maxRequests']));
      res.set('X-RateLimit-Remaining', String(remaining));
      res.set('X-RateLimit-Reset', String(Date.now() + resetTime * 1000));

      if (!allowed) {
        return res.status(429).json({
          error: 'Too many requests',
          retryAfter: resetTime,
        });
      }

      next();
    } catch (error) {
      console.error('Rate limit middleware error:', error);
      next(); // Fail open on error
    }
  };
}

/**
 * Specific rate limiters for different endpoints
 */
export const LOGIN_RATE_LIMIT = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5, // 5 attempts max
};

export const API_RATE_LIMIT = {
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 100, // 100 requests per minute
};

export const SIGNUP_RATE_LIMIT = {
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  maxRequests: 5, // 5 signups per day per IP
};

export const FORGOT_PASSWORD_RATE_LIMIT = {
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 3, // 3 attempts per hour
};
