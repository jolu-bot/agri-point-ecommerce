import { NextRequest, NextResponse } from 'next/server';

/**
 * COMING SOON gate
 * Set COMING_SOON=true in your environment to redirect all public traffic
 * to /coming-soon. API routes, admin panel and auth remain accessible.
 *
 * Default: active (true) — set COMING_SOON=false in Vercel env vars (or .env.local)
 * to disable and let the full site through.
 *
 * Local dev: add COMING_SOON=false to .env.local
 * Production go-live: set COMING_SOON=false in Vercel dashboard, OR merge dev → main
 */
const COMING_SOON = process.env.COMING_SOON !== 'false';

/** Paths that bypass the coming-soon gate */
const BYPASS_PREFIXES = [
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

export function middleware(request: NextRequest) {
  if (!COMING_SOON) return NextResponse.next();

  const { pathname } = request.nextUrl;

  // Allow bypass paths
  if (BYPASS_PREFIXES.some(prefix => pathname.startsWith(prefix))) {
    return NextResponse.next();
  }

  // Allow static file extensions
  if (/\.\w+$/.test(pathname)) {
    return NextResponse.next();
  }

  // Redirect everything else to coming-soon
  return NextResponse.redirect(new URL('/coming-soon', request.url));
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon\\.ico).*)'],
};
