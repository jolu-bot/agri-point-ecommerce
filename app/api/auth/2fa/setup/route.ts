import { NextRequest, NextResponse } from 'next/server';
import { generateTwoFactorSecret, verifyTOTPToken, verifyBackupCode } from '@/lib/auth-2fa';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    // 1. Vérifier que l'utilisateur est connecté
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Récupérer l'ID utilisateur du token
    // Note: À intégrer avec votre système de JWT
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    // 3. Générer une secret TOTP
    const { secret, qrCode, backupCodes } = await generateTwoFactorSecret(
      request.headers.get('x-user-email') || `user_${userId}@agri-ps.com`
    );

    // 4. Sauvegarder temporairement (en attente de vérification)
    // Les données ne sont pas commitées à la BD jusqu'à verify
    const sessionData = {
      userId,
      secret,
      backupCodes: await Promise.all(
        backupCodes.map(code => bcrypt.hash(code, 10))
      ),
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 15 * 60000), // 15 minutes
    };

    // Stocker en session/redis (temporaire)
    // À adapter selon votre système de sessions
    // await redis.setex(`2fa_setup:${userId}`, 900, JSON.stringify(sessionData));

    return NextResponse.json({
      success: true,
      qrCode,
      backupCodes, // Une seule fois! À sauvegarder par l'utilisateur
      message: 'Scan the QR code with your authenticator app',
    });
  } catch (error) {
    console.error('2FA setup error:', error);
    return NextResponse.json(
      { error: 'Failed to setup 2FA' },
      { status: 500 }
    );
  }
}
