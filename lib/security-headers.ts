import { NextRequest, NextResponse } from 'next/server';

/**
 * Security Headers Middleware pour Next.js
 */
export function securityHeadersMiddleware(response: NextResponse) {
  // Content Security Policy - Strict
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://connect.facebook.net; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: https:; " +
    "font-src 'self'; " +
    "connect-src 'self' https://www.google-analytics.com https://www.googletagmanager.com; " +
    "frame-ancestors 'none'; " +
    "base-uri 'self'; " +
    "form-action 'self'"
  );

  // Hide server info
  response.headers.set('Server', 'AGRI-PS');
  response.headers.set('X-Powered-By', 'Next.js');
  response.headers.delete('X-AspNet-Version');

  // Prevent MIME type sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff');

  // Enable X-XSS Protection
  response.headers.set('X-XSS-Protection', '1; mode=block');

  // Clickjacking protection
  response.headers.set('X-Frame-Options', 'DENY');

  // Referrer Policy - Privacy-first
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Feature Policy (Permissions Policy)
  response.headers.set(
    'Permissions-Policy',
    'geolocation=(), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()'
  );

  // HSTS - Force HTTPS
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains; preload'
  );

  // Disable caching for sensitive pages
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  response.headers.set('Pragma', 'no-cache');
  response.headers.set('Expires', '0');

  return response;
}

/**
 * Request logging middleware
 */
export function requestLoggingMiddleware(req: NextRequest) {
  req.headers.set('X-Request-Start', String(Date.now()));
  return NextResponse.next({
    request: req,
  });
}

/**
 * Response timing middleware
 */
export async function responseTimingMiddleware(
  response: NextResponse,
  req: NextRequest
) {
  const startTime = parseInt(req.headers.get('X-Request-Start') || '0');
  const responseTime = Date.now() - startTime;

  response.headers.set('X-Response-Time', `${responseTime}ms`);

  // Log slow requests
  if (responseTime > 1000) {
    console.warn(`⚠️ SLOW REQUEST: ${req.method} ${req.nextUrl.pathname} took ${responseTime}ms`);
  }

  return response;
}
