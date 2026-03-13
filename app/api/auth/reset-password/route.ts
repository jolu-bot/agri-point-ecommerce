import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import {
  getClientIp, scanForThreats, checkPasswordStrength,
  applySecurityHeaders, logSecurityEvent,
} from '@/lib/security';

/**
 * POST /api/auth/reset-password
 * Body: { token: string, password: string, confirmPassword: string }
 */
export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const ua = req.headers.get('user-agent') ?? 'unknown';

  try {
    let body: Record<string, unknown>;
    try { body = await req.json(); }
    catch { return applySecurityHeaders(NextResponse.json({ error: 'Corps invalide' }, { status: 400 })); }

    const threat = scanForThreats(body);
    if (!threat.safe) {
      logSecurityEvent({ type: 'threat_detected', ip, userAgent: ua, detail: threat.threat ?? '' });
      return applySecurityHeaders(NextResponse.json({ error: 'Données invalides' }, { status: 400 }));
    }

    const { token, password, confirmPassword } = body as Record<string, string>;

    if (!token || !password) {
      return applySecurityHeaders(NextResponse.json(
        { error: 'Token et nouveau mot de passe requis' }, { status: 400 }
      ));
    }

    // Valider le token visuellement avant la DB
    if (token.length < 32 || token.length > 256) {
      return applySecurityHeaders(NextResponse.json({ error: 'Token invalide' }, { status: 400 }));
    }

    const pwdCheck = checkPasswordStrength(password);
    if (!pwdCheck.strong) {
      return applySecurityHeaders(NextResponse.json(
        { error: pwdCheck.issues[0] ?? 'Mot de passe trop faible' }, { status: 400 }
      ));
    }

    if (confirmPassword && password !== confirmPassword) {
      return applySecurityHeaders(NextResponse.json(
        { error: 'Les mots de passe ne correspondent pas' }, { status: 400 }
      ));
    }

    await dbConnect();

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      passwordResetToken:   tokenHash,
      passwordResetExpires: { $gt: new Date() },
    }).select('+passwordResetToken +passwordResetExpires');

    if (!user) {
      return NextResponse.json(
        { error: 'Lien de réinitialisation invalide ou expiré. Faites une nouvelle demande.' },
        { status: 400 }
      );
    }

    // Mettre à jour le mot de passe
    user.password             = password;
    user.passwordResetToken   = undefined;
    user.passwordResetExpires = undefined;
    user.loginAttempts        = 0;
    user.lockUntil            = undefined;
    await user.save();

    logSecurityEvent({ type: 'password_reset', ip, userAgent: ua, email: user.email });

    return applySecurityHeaders(NextResponse.json({
      success: true,
      message: 'Mot de passe réinitialisé avec succès. Vous pouvez maintenant vous connecter.',
    }));
  } catch (error: any) {
    console.error('Erreur reset-password:', error);
    return applySecurityHeaders(NextResponse.json({ error: 'Erreur serveur' }, { status: 500 }));
  }
}
