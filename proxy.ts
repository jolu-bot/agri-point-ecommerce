import { NextRequest, NextResponse } from 'next/server';
import { securityHeadersMiddleware } from '@/lib/security-headers';

export default async function middleware(request: NextRequest) {
  // 1. Appliquer les security headers
  const response = NextResponse.next();
  const securedResponse = securityHeadersMiddleware(response);

  // 2. Logger les requêtes (optionnel)
  const requestStart = Date.now();
  const startHeader = request.headers.get('x-request-start');
  if (startHeader) {
    const responseTime = Date.now() - parseInt(startHeader);
    if (responseTime > 1000) {
      console.warn(`⚠️ SLOW REQUEST: ${request.method} ${request.nextUrl.pathname} (${responseTime}ms)`);
    }
  }

  // 3. Ajouter les headers de timing
  securedResponse.headers.set('X-Request-Start', String(Date.now()));

  return securedResponse;
}

export const config = {
  matcher: [
    // Appliquer aux routes API
    '/api/:path*',
    // Appliquer aux routes admin
    '/admin/:path*',
    // Appliquer aux routes auth
    '/auth/:path*',
    // Appliquer à la racine
    '/',
  ],
};
