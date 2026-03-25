import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

// ---------------------------------------------------------------------------
// Next.js Edge Middleware — branche DEV
// Auth guard uniquement : protège /admin et /compte (JWT cookie/header)
// Le gate coming-soon n'existe PAS sur cette branche — le site est complet.
// Partager l'URL de preview Vercel (dev) avec le client pour validation.
// ---------------------------------------------------------------------------
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error('JWT_SECRET manquant: les routes protegees redirigeront vers /auth/login.');
}

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Auth guard (/admin, /compte) ────────────────────────────────────────────
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
    if (!JWT_SECRET) return redirectToLogin(request);
    const secret = new TextEncoder().encode(JWT_SECRET);
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
  matcher: ['/admin/:path*', '/compte', '/compte/:path*'],
};
