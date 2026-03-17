import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

// ---------------------------------------------------------------------------
// Next.js Edge Middleware
// 1. COMING SOON gate  — redirige tout le site public vers /coming-soon
// 2. Auth guard        — protège /admin et /compte (JWT cookie/header)
// ---------------------------------------------------------------------------

/**
 * COMING SOON gate
 * Default: active (true) — set COMING_SOON=false in Vercel env vars (or .env.local)
 * to disable and let the full site through.
 *
 * Local dev  : add COMING_SOON=false to .env.local
 * Production go-live : set COMING_SOON=false in Vercel dashboard, OR merge dev → main
 */
const COMING_SOON = process.env.COMING_SOON !== 'false';

const COMING_SOON_BYPASS = [
  '/coming-soon',
  '/api/',
  '/admin',
  '/auth/',
  '/_next/',
  '/favicon',
  '/robots',
  '/sitemap',
  '/manifest',
  '/images/',
];

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── 1. Coming soon gate ────────────────────────────────────────────────
  if (COMING_SOON) {
    const bypassed =
      COMING_SOON_BYPASS.some(p => pathname.startsWith(p)) ||
      /\.\w+$/.test(pathname); // static file extensions

    if (!bypassed) {
      return NextResponse.redirect(new URL('/coming-soon', request.url));
    }
  }

  // ── 2. Auth guard (/admin, /compte) ────────────────────────────────────
  const isProtected =
    pathname.startsWith('/admin') ||
    pathname === '/compte' ||
    pathname.startsWith('/compte/');

  if (!isProtected) return NextResponse.next();

  const token =
    request.cookies.get('accessToken')?.value ||
    request.headers.get('authorization')?.replace('Bearer ', '');

  if (!token) return redirectToLogin(request);

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback');
    const { payload } = await jwtVerify(token, secret);

    // /admin exige le rôle admin ou editor
    if (
      pathname.startsWith('/admin') &&
      payload.role !== 'admin' &&
      payload.role !== 'editor'
    ) {
      return redirectToLogin(request);
    }

    return NextResponse.next();
  } catch {
    return redirectToLogin(request);
  }
}

function redirectToLogin(request: NextRequest) {
  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = '/auth/login';
  loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
  const response = NextResponse.redirect(loginUrl);
  response.cookies.delete('accessToken');
  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon\\.ico).*)'],
};
