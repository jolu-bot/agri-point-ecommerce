import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

// ---------------------------------------------------------------------------
// Next.js Edge Middleware
// 1. COMING SOON gate  — redirige tout le site public vers /coming-soon
//    └─ PREVIEW bypass — ?preview=SECRET ou cookie preview_bypass donne accès complet
// 2. Auth guard        — protège /admin et /compte (JWT cookie/header)
// ---------------------------------------------------------------------------

/**
 * COMING SOON gate
 * Default: active (true) — set COMING_SOON=false in Vercel env vars (or .env.local)
 * to disable and let the full site through.
 *
 * Local dev        : COMING_SOON=false dans .env.local
 * Production live  : COMING_SOON=false dans Vercel dashboard, OU merger dev → main
 *
 * PREVIEW (partager avec un client) :
 *   1. Ajouter PREVIEW_SECRET=un-token-secret dans Vercel env vars
 *   2. Envoyer au client : https://votre-site.com/?preview=un-token-secret
 *   3. Le client voit le site complet — cookie valide 7 jours
 *   4. Pour révoquer : changer PREVIEW_SECRET dans Vercel
 */
const COMING_SOON     = process.env.COMING_SOON !== 'false';
const PREVIEW_SECRET  = process.env.PREVIEW_SECRET ?? '';

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
    // a) Check preview bypass (query param → sets cookie, or existing cookie)
    const queryToken  = request.nextUrl.searchParams.get('preview') ?? '';
    const cookieToken = request.cookies.get('preview_bypass')?.value ?? '';
    const hasPreview  = PREVIEW_SECRET !== '' && (
      queryToken === PREVIEW_SECRET || cookieToken === PREVIEW_SECRET
    );

    if (hasPreview) {
      // Allow full site — fall through to auth guard below
      // If arriving via query param, set the persistent cookie
      if (queryToken === PREVIEW_SECRET) {
        // Redirect to the same path without ?preview so the URL looks clean
        const cleanUrl = new URL(request.nextUrl.pathname, request.url);
        const res = NextResponse.redirect(cleanUrl);
        res.cookies.set('preview_bypass', PREVIEW_SECRET, {
          httpOnly: true,
          sameSite: 'lax',
          maxAge:   60 * 60 * 24 * 7, // 7 jours
          path:     '/',
        });
        return res;
      }
      // Cookie already set — let the request continue (fall through to auth guard)
    } else {
      // b) Static/system bypasses
      const bypassed =
        COMING_SOON_BYPASS.some(p => pathname.startsWith(p)) ||
        /\.\w+$/.test(pathname);

      if (!bypassed) {
        return NextResponse.redirect(new URL('/coming-soon', request.url));
      }
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
