import { NextRequest, NextResponse } from 'next/server';
import { verifyRefreshToken, generateAccessToken, generateRefreshToken } from '@/lib/auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';

/**
 * POST /api/auth/refresh
 * Renouvelle l'accessToken à partir du refreshToken (cookie ou body)
 */
export async function POST(req: NextRequest) {
  try {
    const cookieRefresh = req.cookies.get('refreshToken')?.value;
    const body = await req.json().catch(() => ({}));
    const token = cookieRefresh || body.refreshToken;

    if (!token) {
      return NextResponse.json({ error: 'Refresh token manquant' }, { status: 401 });
    }

    const decoded = verifyRefreshToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Refresh token invalide ou expiré' }, { status: 401 });
    }

    await dbConnect();
    const user = await User.findById(decoded.userId);

    if (!user || !user.isActive || user.accountStatus === 'suspended') {
      return NextResponse.json({ error: 'Compte inactif' }, { status: 403 });
    }

    const payload = {
      userId: user._id.toString(),
      email:  user.email,
      role:   user.role,
      name:   user.name,
    };

    const newAccessToken  = generateAccessToken(payload);
    const newRefreshToken = generateRefreshToken(payload);

    const response = NextResponse.json({
      success:      true,
      accessToken:  newAccessToken,
      refreshToken: newRefreshToken,
    });

    response.cookies.set('accessToken', newAccessToken, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge:   15 * 60,
      path:     '/',
    });
    response.cookies.set('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge:   7 * 24 * 3600,
      path:     '/',
    });

    return response;
  } catch (error) {
    console.error('Erreur refresh:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
