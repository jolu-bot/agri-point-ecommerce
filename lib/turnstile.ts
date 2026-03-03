/// <reference types="../types/modules" />
import { Turnstile } from '@marsidev/react-turnstile';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Verification Cloudflare Turnstile server-side
 */
export async function verifyTurnstileToken(token: string): Promise<boolean> {
  if (!token) return false;

  try {
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        secret: process.env.TURNSTILE_SECRET_KEY,
        response: token,
      }),
    });

    const data = (await response.json()) as { success: boolean; error_codes?: string[] };

    if (!data.success) {
      console.warn('Turnstile verification failed:', data.error_codes);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Turnstile verification error:', error);
    return false;
  }
}

/**
 * Middleware to validate Turnstile token in request body
 */
export async function validateTurnstileMiddleware(request: NextRequest) {
  if (request.method === 'POST') {
    const body = await request.json();
    const turnstileToken = body.turnstileToken;

    if (!turnstileToken) {
      return NextResponse.json(
        { success: false, error: 'Turnstile token required' },
        { status: 400 }
      );
    }

    const isValid = await verifyTurnstileToken(turnstileToken);
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: 'Turnstile verification failed' },
        { status: 403 }
      );
    }
  }

  return NextResponse.next();
}

// Export pour utilisation dans composants React
export { Turnstile };

export const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '';
