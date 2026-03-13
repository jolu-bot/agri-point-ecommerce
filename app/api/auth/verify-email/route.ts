import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { generateAccessToken, generateRefreshToken, getRolePermissions } from '@/lib/auth';
import { sendEmail } from '@/lib/email';
import { applySecurityHeaders, logSecurityEvent, getClientIp } from '@/lib/security';

/**
 * GET /api/auth/verify-email?token=xxx
 * Valide le token de vérification d'email
 */
export async function GET(req: NextRequest) {
  const ip = getClientIp(req);
  try {
    const { searchParams } = new URL(req.url);
    const rawToken = searchParams.get('token');

    if (!rawToken || rawToken.length < 32 || rawToken.length > 256 || /[^a-zA-Z0-9_-]/.test(rawToken)) {
      logSecurityEvent({ type: 'token_invalid', ip, detail: 'verify-email: format token invalide' });
      return applySecurityHeaders(NextResponse.json({ error: 'Token invalide' }, { status: 400 }));
    }

    await dbConnect();

    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

    const user = await User.findOne({
      emailVerificationToken:   tokenHash,
      emailVerificationExpires: { $gt: new Date() },
    }).select('+emailVerificationToken +emailVerificationExpires');

    if (!user) {
      return NextResponse.json(
        { error: 'Lien de vérification invalide ou expiré. Demandez un nouveau lien.' },
        { status: 400 }
      );
    }

    // Activer le compte
    user.emailVerified            = true;
    user.accountStatus            = 'approved';
    user.emailVerificationToken   = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    // Email de confirmation d'activation
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://agri-ps.com';
    await sendEmail({
      to:      user.email,
      subject: '🎉 Votre compte AGRIPOINT SERVICES est activé !',
      html: `
        <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
          <div style="background:linear-gradient(135deg,#059669,#065f46);padding:40px;text-align:center;">
            <h1 style="color:#fff;margin:0;font-size:28px;">🌿 AGRIPOINT SERVICES</h1>
          </div>
          <div style="padding:40px;">
            <h2 style="color:#065f46;">Bienvenue ${user.name} ! Votre compte est actif 🎉</h2>
            <p style="color:#374151;line-height:1.6;">Votre adresse email a été vérifiée avec succès. Vous pouvez maintenant accéder à tous nos services.</p>
            <div style="text-align:center;margin:32px 0;">
              <a href="${siteUrl}/compte" style="background:linear-gradient(135deg,#059669,#047857);color:#fff;padding:14px 36px;border-radius:50px;text-decoration:none;font-weight:700;font-size:15px;display:inline-block;">
                Accéder à mon compte →
              </a>
            </div>
            <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:16px;text-align:center;">
              <p style="color:#065f46;font-weight:700;margin:0 0 4px;">Code client :</p>
              <p style="color:#059669;font-size:22px;font-weight:800;letter-spacing:3px;margin:0;">${user.uniqueCode}</p>
            </div>
          </div>
          <div style="background:#f9fafb;padding:20px;text-align:center;">
            <p style="color:#9ca3af;font-size:12px;margin:0;">© 2026 AGRIPOINT SERVICES SAS · Cameroun</p>
          </div>
        </div>`,
    });

    // Générer les tokens pour connexion auto
    const accessToken = generateAccessToken({
      userId: user._id.toString(),
      email:  user.email,
      role:   user.role,
      name:   user.name,
    });
    const refreshToken = generateRefreshToken({
      userId: user._id.toString(),
      email:  user.email,
      role:   user.role,
      name:   user.name,
    });

    const response = NextResponse.json({
      success: true,
      message: 'Email vérifié avec succès ! Bienvenue sur AGRIPOINT SERVICES.',
      user: {
        id:            user._id,
        name:          user.name,
        email:         user.email,
        phone:         user.phone,
        role:          user.role,
        uniqueCode:    user.uniqueCode,
        accountStatus: user.accountStatus,
        emailVerified: user.emailVerified,
        address:       user.address,
        permissions:   getRolePermissions(user.role),
      },
      accessToken,
      refreshToken,
    });

    // Cookies HttpOnly
    response.cookies.set('accessToken', accessToken, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge:   15 * 60,
      path:     '/',
    });
    response.cookies.set('refreshToken', refreshToken, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge:   7 * 24 * 3600,
      path:     '/',
    });

    return applySecurityHeaders(response);
  } catch (error: any) {
    console.error('Erreur verify-email:', error);
    return applySecurityHeaders(NextResponse.json({ error: 'Erreur serveur' }, { status: 500 }));
  }
}
