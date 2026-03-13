import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

// ---------------------------------------------------------------------------
// Next.js Edge Middleware — protège /admin côté serveur avant hydration
// Lit le cookie accessToken ou le header Authorization
// ---------------------------------------------------------------------------
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Récupérer le token (cookie prioritaire, puis Authorization header)
  const token =
    request.cookies.get('accessToken')?.value ||
    request.headers.get('authorization')?.replace('Bearer ', '');

  if (!token) {
    return redirectToLogin(request);
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback');
    const { payload } = await jwtVerify(token, secret);

    // Seuls admin et editor ont accès au panel
    if (payload.role !== 'admin' && payload.role !== 'editor') {
      return redirectToLogin(request);
    }

    return NextResponse.next();
  } catch {
    // Token invalide ou expiré
    return redirectToLogin(request);
  }
}

function redirectToLogin(request: NextRequest) {
  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = '/auth/login';
  loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
  const response = NextResponse.redirect(loginUrl);
  // Effacer le cookie corrompu si présent
  response.cookies.delete('accessToken');
  return response;
}

export const config = {
  matcher: ['/admin/:path*'],
};
