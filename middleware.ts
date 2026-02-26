import { NextRequest, NextResponse } from 'next/server';

// ---------------------------------------------------------------------------
// Rate Limiting (Edge-compatible, in-memory par IP)
// ---------------------------------------------------------------------------
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 60;  // max 60 req/min pour les API
const AUTH_RATE_LIMIT_MAX = 10;      // max 10 tentatives/min pour auth routes

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

// Map stockée en mémoire Edge (sera réinitialisée à chaque cold start)
const rateLimitMap = new Map<string, RateLimitEntry>();

function getRateLimitKey(req: NextRequest, suffix = ''): string {
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    req.headers.get('x-real-ip') ||
    'unknown';
  return `${ip}:${suffix}`;
}

function checkRateLimit(key: string, maxRequests: number): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true; // OK
  }

  if (entry.count >= maxRequests) {
    return false; // Bloqué
  }

  entry.count += 1;
  return true; // OK
}

// Nettoyage périodique pour éviter la fuite mémoire
let lastCleanup = Date.now();
function maybeCleanupMap() {
  const now = Date.now();
  if (now - lastCleanup > 5 * 60_000) { // toutes les 5 min
    lastCleanup = now;
    for (const [key, entry] of rateLimitMap.entries()) {
      if (now > entry.resetAt) rateLimitMap.delete(key);
    }
  }
}

// ---------------------------------------------------------------------------
// Routes bloquées / suspectes
// ---------------------------------------------------------------------------
const BLOCKED_PATHS = [
  /\/\.env/,
  /\/\.git\//,
  /wp-login/,
  /wp-admin/,
  /phpMyAdmin/i,
  /\.php$/,
  /\/etc\/passwd/,
  /\/proc\//,
];

// ---------------------------------------------------------------------------
// Middleware principal
// ---------------------------------------------------------------------------
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  maybeCleanupMap();

  // 1. Bloquer les chemins suspects
  if (BLOCKED_PATHS.some((pattern) => pattern.test(pathname))) {
    return new NextResponse(null, { status: 404 });
  }

  // 2. Rate limiting des routes API auth (login / register / forgot-password)
  if (
    pathname.startsWith('/api/auth/login') ||
    pathname.startsWith('/api/auth/register') ||
    pathname.startsWith('/api/auth/forgot-password')
  ) {
    const key = getRateLimitKey(req, 'auth');
    if (!checkRateLimit(key, AUTH_RATE_LIMIT_MAX)) {
      return NextResponse.json(
        { error: 'Trop de tentatives. Réessayez dans 1 minute.' },
        {
          status: 429,
          headers: {
            'Retry-After': '60',
            'X-RateLimit-Limit': String(AUTH_RATE_LIMIT_MAX),
          },
        }
      );
    }
  }

  // 3. Rate limiting général des autres routes API
  if (pathname.startsWith('/api/')) {
    const key = getRateLimitKey(req, 'api');
    if (!checkRateLimit(key, RATE_LIMIT_MAX_REQUESTS)) {
      return NextResponse.json(
        { error: 'Trop de requêtes. Réessayez dans 1 minute.' },
        {
          status: 429,
          headers: {
            'Retry-After': '60',
            'X-RateLimit-Limit': String(RATE_LIMIT_MAX_REQUESTS),
          },
        }
      );
    }
  }

  // 4. Protection des routes admin — rediriger si pas de token en cookie/header
  if (pathname.startsWith('/admin')) {
    const token =
      req.cookies.get('accessToken')?.value ||
      req.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      const loginUrl = new URL('/auth/login', req.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Appliquer le middleware à toutes les routes sauf :
     * - _next/static (fichiers statiques)
     * - _next/image (optimisation images)
     * - favicon.ico
     * - fichiers publics (images, fonts, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?|ttf|otf|eot|css|js)$).*)',
  ],
};
