import { NextResponse } from 'next/server';

/**
 * POST /api/auth/logout
 * Efface les cookies HttpOnly
 */
export async function POST() {
  const response = NextResponse.json({ success: true, message: 'Déconnecté avec succès' });

  response.cookies.set('accessToken', '', {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge:   0,
    path:     '/',
  });
  response.cookies.set('refreshToken', '', {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge:   0,
    path:     '/',
  });

  return response;
}
