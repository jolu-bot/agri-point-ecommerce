import { NextRequest, NextResponse } from 'next/server';
import { verifyTOTPToken } from '@/lib/auth-2fa';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, backupCode } = body;
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    // Récupérer le secret temporaire depuis la session
    // await redis.get(`2fa_setup:${userId}`)
    // Placeholder - à adapter selon votre système

    // Vérifier le token TOTP
    if (token) {
      const isValid = verifyTOTPToken(process.env.TEMP_2FA_SECRET || '', token);
      if (!isValid) {
        return NextResponse.json(
          { error: 'Invalid 2FA token' },
          { status: 400 }
        );
      }
    } else if (backupCode) {
      // Vérifier le code de secours
      // À implémenter selon votre système
      const isValid = backupCode.length === 8;
      if (!isValid) {
        return NextResponse.json(
          { error: 'Invalid backup code' },
          { status: 400 }
        );
      }
    } else {
      return NextResponse.json(
        { error: 'Token or backup code required' },
        { status: 400 }
      );
    }

    // Activer 2FA sur l'utilisateur
    await User.findByIdAndUpdate(userId, {
      twoFactorEnabled: true,
      twoFactorSecret: process.env.TEMP_2FA_SECRET,
      twoFactorVerifiedAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: '2FA enabled successfully',
    });
  } catch (error) {
    console.error('2FA verify error:', error);
    return NextResponse.json(
      { error: 'Failed to verify 2FA' },
      { status: 500 }
    );
  }
}
