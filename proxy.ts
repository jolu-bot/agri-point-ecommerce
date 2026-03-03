/**
 * AGRI POINT SERVICE — Next.js Edge Middleware
 * ─────────────────────────────────────────────────────────────────────────────
 * Runs on every request BEFORE route handlers.
 * Responsibilities:
 *   1. Security headers on every response
 *   2. HTTPS enforcement (production)
 *   3. Bot / scraper filtering on API routes
 *   4. Sliding-window IP rate limiting per route group
 *   5. Admin route protection (JWT presence + role claim)
 *   6. Suspicious path / payload detection
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

// ── Helpers ───────────────────────────────────────────────────────────────────

function getIp(req: NextRequest): string {
  const candidates = [
    req.headers.get('cf-connecting-ip'),
    req.headers.get('x-real-ip'),
    req.headers.get('x-forwarded-for')?.split(',')[0].trim(),
    req.headers.get('x-vercel-forwarded-for'),
  ];
  return candidates.find(ip => ip && ip.length > 0) ?? '127.0.0.1';
}

// ── In-memory sliding-window rate limiter (Edge-compatible) ───────────────────
// NOTE: Works reliably on single-instance VPS deployments.
// For multi-region / Vercel Edge, replace with Upstash Redis.

interface Bucket { timestamps: number[]; blockedUntil?: number }
const rl = new Map<string, Bucket>();

function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
  blockMs = windowMs * 2
): { ok: boolean; retryAfter?: number } {
  const now = Date.now();
  let b = rl.get(key);
  if (!b) { b = { timestamps: [] }; rl.set(key, b); }

  if (b.blockedUntil) {
    if (now < b.blockedUntil) return { ok: false, retryAfter: Math.ceil((b.blockedUntil - now) / 1000) };
    b.blockedUntil = undefined;
    b.timestamps = [];
  }

  b.timestamps = b.timestamps.filter(t => now - t < windowMs);
  if (b.timestamps.length >= limit) {
    b.blockedUntil = now + blockMs;
    return { ok: false, retryAfter: Math.ceil(blockMs / 1000) };
  }

  b.timestamps.push(now);
  return { ok: true };
}

// ── Known bad User-Agent fragments (scrapers, automated tools) ────────────────
const BAD_UA: RegExp[] = [
  /scrapy/i, /python-requests/i, /python-urllib/i, /wget\//i,
  /curl\//i, /go-http-client/i, /java\//i, /perl\//i, /ruby\//i,
  /libwww/i, /mechanize/i, /phantomjs/i, /crawler4j/i,
  /baiduspider/i, /yandexbot/i, /semrushbot/i, /dotbot/i,
  /mj12bot/i, /ahrefsbot/i, /dataforseobot/i, /serpstatbot/i,
  /bytespider/i, /ccbot/i, /gpt-/i,
];

// Good bots (SEO / social preview — allowed through)
const ALLOWED_BOTS: RegExp[] = [
  /googlebot/i, /bingbot/i, /duckduckbot/i,
  /facebookexternalhit/i, /twitterbot/i, /linkedinbot/i,
];

function isScraper(ua: string | null): boolean {
  if (!ua || ua.length < 10) return true;
  if (ALLOWED_BOTS.some(r => r.test(ua))) return false;
  return BAD_UA.some(r => r.test(ua));
}

// ── Suspicious path patterns ──────────────────────────────────────────────────
const SUSPICIOUS_PATHS: RegExp[] = [
  /\.\.\//,                          // Path traversal
  /%2e%2e/i,                         // Encoded traversal
  /\.(env|git|svn|htaccess|htpasswd|DS_Store)/i,
  /\/(admin|wp-admin|wp-login|phpmyadmin|adminer|cpanel)/i,
  /\/etc\/(passwd|shadow)/i,
  /\.(php|asp|aspx|jsp|cgi|pl|py|rb|sh)$/i,
  /union\s+select/i,
  /<script/i,
];

// ── JWT admin verification (jose — Edge compatible) ──────────────────────────
async function verifyAdminJwt(
  token: string
): Promise<{ role: string } | null> {
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET ?? '');
    const { payload } = await jwtVerify(token, secret);
    return { role: (payload.role as string) ?? 'user' };
  } catch {
    return null;
  }
}

// ── Security headers applied to EVERY response ────────────────────────────────
const SECURITY_HEADERS: Record<string, string> = {
  'X-Content-Type-Options':       'nosniff',
  'X-Frame-Options':              'DENY',
  'X-XSS-Protection':             '1; mode=block',
  'Referrer-Policy':              'strict-origin-when-cross-origin',
  'Strict-Transport-Security':    'max-age=63072000; includeSubDomains; preload',
  'Permissions-Policy':           'camera=(), microphone=(), geolocation=(), payment=(), usb=(), bluetooth=(), accelerometer=()',
  'Cross-Origin-Opener-Policy':   'same-origin',
  'Cross-Origin-Resource-Policy': 'same-origin',
  'X-DNS-Prefetch-Control':       'off',
  // Full CSP — API responses and pages
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: blob: https://res.cloudinary.com https://*.amazonaws.com https://*.googleusercontent.com https://lh3.googleusercontent.com https://agri-ps.com https://www.agri-ps.com",
    "connect-src 'self' https://www.google-analytics.com https://agri-ps.com",
    "frame-src 'none'",
    "frame-ancestors 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "upgrade-insecure-requests",
  ].join('; '),
};

function applyHeaders(res: NextResponse): NextResponse {
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    res.headers.set(key, value);
  }
  res.headers.delete('X-Powered-By');
  res.headers.delete('Server');
  return res;
}

function blocked(msg: string, status: number, retryAfter?: number): NextResponse {
  const res = NextResponse.json({ error: msg }, { status });
  if (retryAfter) res.headers.set('Retry-After', String(retryAfter));
  return applyHeaders(res);
}

// ── MAIN PROXY ────────────────────────────────────────────────────────────────

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const ip           = getIp(req);
  const ua           = req.headers.get('user-agent') ?? '';
  const method       = req.method;

  // ── 1. HTTPS redirection in production ──────────────────────────────────
  if (
    process.env.NODE_ENV === 'production' &&
    req.headers.get('x-forwarded-proto') === 'http'
  ) {
    const httpsUrl = req.nextUrl.clone();
    httpsUrl.protocol = 'https:';
    return NextResponse.redirect(httpsUrl, { status: 301 });
  }

  // ── 2. Suspicious path detection ────────────────────────────────────────
  if (SUSPICIOUS_PATHS.some(r => r.test(pathname))) {
    console.warn('[SECURITY] Suspicious path blocked:', { ip, pathname, ua });
    return blocked('Forbidden', 403);
  }

  // ── 3. Global rate limit: 500 req / 15min per IP ─────────────────────────
  const globalLimit = rateLimit(`global:${ip}`, 500, 15 * 60 * 1000, 30 * 60 * 1000);
  if (!globalLimit.ok) {
    console.warn('[SECURITY] Global rate limit hit:', { ip, pathname });
    return blocked('Trop de requêtes. Réessayez plus tard.', 429, globalLimit.retryAfter);
  }

  // ── 4. API-specific rules ────────────────────────────────────────────────
  if (pathname.startsWith('/api/')) {

    // Block known scrapers on API routes
    if (isScraper(ua)) {
      console.warn('[SECURITY] Scraper blocked on API:', { ip, ua: ua.slice(0, 80), pathname });
      return blocked('Access denied', 403);
    }

    // Auth endpoints — tight rate limits
    if (pathname.startsWith('/api/auth/')) {
      // LOGIN: 10 attempts / 5min per IP (extra tight)
      if (pathname === '/api/auth/login' && method === 'POST') {
        const r = rateLimit(`login:${ip}`, 10, 5 * 60 * 1000, 30 * 60 * 1000);
        if (!r.ok) {
          console.warn('[SECURITY] Login rate limit:', { ip });
          return blocked('Trop de tentatives de connexion. Attendez 30 minutes.', 429, r.retryAfter);
        }
      }

      // REGISTER: 5 accounts / 15min per IP
      if (pathname === '/api/auth/register' && method === 'POST') {
        const r = rateLimit(`register:${ip}`, 5, 15 * 60 * 1000, 60 * 60 * 1000);
        if (!r.ok) {
          console.warn('[SECURITY] Register rate limit:', { ip });
          return blocked('Trop d\'inscriptions depuis cette adresse IP.', 429, r.retryAfter);
        }
      }

      // FORGOT PASSWORD: 5 / 10min per IP (prevent email bombing)
      if (pathname === '/api/auth/forgot-password' && method === 'POST') {
        const r = rateLimit(`forgot:${ip}`, 5, 10 * 60 * 1000, 60 * 60 * 1000);
        if (!r.ok) {
          return blocked('Limite atteinte. Réessayez dans 1 heure.', 429, r.retryAfter);
        }
      }

      // RESEND VERIFICATION: 3 / 5min per IP
      if (pathname === '/api/auth/resend-verification' && method === 'POST') {
        const r = rateLimit(`resend:${ip}`, 3, 5 * 60 * 1000, 30 * 60 * 1000);
        if (!r.ok) {
          return blocked('Trop de renvois. Attendez 30 minutes.', 429, r.retryAfter);
        }
      }

      // REFRESH: 20 / 5min per IP
      if (pathname === '/api/auth/refresh' && method === 'POST') {
        const r = rateLimit(`refresh:${ip}`, 20, 5 * 60 * 1000);
        if (!r.ok) {
          return blocked('Activité suspecte détectée.', 429, r.retryAfter);
        }
      }
    }

    // Admin API routes — 200 req / 15min per IP
    if (pathname.startsWith('/api/admin/')) {
      const r = rateLimit(`admin-api:${ip}`, 200, 15 * 60 * 1000, 30 * 60 * 1000);
      if (!r.ok) {
        return blocked('Limite atteinte.', 429, r.retryAfter);
      }
    }
  }

  // ── 5. Admin panel route protection ─────────────────────────────────────
  if (pathname.startsWith('/admin')) {
    // Strict rate limit on admin UI
    const r = rateLimit(`admin-ui:${ip}`, 100, 5 * 60 * 1000, 30 * 60 * 1000);
    if (!r.ok) {
      return blocked('Accès restreint.', 429, r.retryAfter);
    }

    // Require valid JWT with admin / superadmin role
    const token =
      req.cookies.get('accessToken')?.value ??
      req.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      const loginUrl = new URL('/auth/login', req.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    const payload = await verifyAdminJwt(token);
    if (!payload || !['admin', 'superadmin'].includes(payload.role)) {
      console.warn('[SECURITY] Unauthorized admin access attempt:', { ip, ua: ua.slice(0, 80), pathname });
      // Don't reveal why (security by obscurity on redirects)
      const loginUrl = new URL('/auth/login', req.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // ── 6. Protect auth pages when already logged in ─────────────────────────
  const AUTH_PAGES = ['/auth/login', '/auth/register'];
  if (AUTH_PAGES.some(p => pathname.startsWith(p))) {
    const token = req.cookies.get('accessToken')?.value;
    if (token) {
      const payload = await verifyAdminJwt(token);
      if (payload) {
        // Already logged in → honor ?redirect param (internal paths only) or fall back to role-based home
        const raw = req.nextUrl.searchParams.get('redirect') ?? '';
        // Decode and validate: resolve against current origin to catch all bypass variants
        let safeRedirect: string | null = null;
        try {
          const resolved = new URL(decodeURIComponent(raw), req.url);
          if (resolved.origin === req.nextUrl.origin) {
            safeRedirect = resolved.pathname + resolved.search + resolved.hash;
          }
        } catch { /* ignore invalid URLs */ }
        const dest = safeRedirect || (['admin', 'superadmin'].includes(payload.role) ? '/admin' : '/compte');
        return NextResponse.redirect(new URL(dest, req.url));
      }
    }
  }

  // ── 7. Pass through with security headers ────────────────────────────────
  const response = NextResponse.next();
  return applyHeaders(response);
}

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT static files and Next.js internals.
     * This ensures the middleware doesn't run on static assets (images, fonts, etc.)
     * which would add unnecessary overhead.
     */
    '/((?!_next/static|_next/image|favicon.ico|manifest.json|icons|images).*)',
  ],
};
