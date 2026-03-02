import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { sendEmail } from '@/lib/email';
import {
  getClientIp, isValidEmail, sanitizeString, scanForThreats,
  applySecurityHeaders, logSecurityEvent,
} from '@/lib/security';

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const ua = req.headers.get('user-agent') ?? 'unknown';

  try {
    await dbConnect();

    let body: Record<string, unknown>;
    try { body = await req.json(); }
    catch { return applySecurityHeaders(NextResponse.json({ error: 'Corps invalide' }, { status: 400 })); }

    const threat = scanForThreats(body);
    if (!threat.safe) {
      logSecurityEvent({ type: 'threat_detected', ip, userAgent: ua, detail: threat.threat ?? '' });
      return applySecurityHeaders(NextResponse.json({ error: 'Requête invalide' }, { status: 400 }));
    }

    const email = sanitizeString(body.email as string ?? '').toLowerCase();

    if (!isValidEmail(email)) {
      return applySecurityHeaders(NextResponse.json({ error: 'Email invalide' }, { status: 400 }));
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    // Sécurité : même message que l'user existe ou non
    if (!user) {
      return NextResponse.json({
        success: true,
        message: 'Si ce compte existe, un email de réinitialisation a été envoyé.',
      });
    }

    // Générer le token de réinitialisation
    const rawToken = user.generatePasswordResetToken();
    await user.save();

    const siteUrl  = process.env.NEXT_PUBLIC_SITE_URL || 'https://agri-ps.com';
    const resetUrl = `${siteUrl}/auth/reset-password?token=${rawToken}`;

    await sendEmail({
      to:      user.email,
      subject: '🔐 Réinitialisation de votre mot de passe — AGRI POINT SERVICE',
      html: `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;font-family:'Segoe UI',Arial,sans-serif;background:#f0fdf4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
    <tr><td align="center">
      <table width="580" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <tr><td style="background:linear-gradient(135deg,#059669,#065f46);padding:36px;text-align:center;">
          <h1 style="color:#fff;margin:0;font-size:26px;">🌿 AGRI POINT SERVICE</h1>
        </td></tr>
        <tr><td style="padding:40px;">
          <h2 style="color:#065f46;margin:0 0 16px;">Réinitialisation du mot de passe</h2>
          <p style="color:#374151;line-height:1.7;">Bonjour <strong>${user.name}</strong>,</p>
          <p style="color:#374151;line-height:1.7;">Une demande de réinitialisation de mot de passe a été effectuée pour votre compte.</p>
          <div style="text-align:center;margin:32px 0;">
            <a href="${resetUrl}"
               style="background:linear-gradient(135deg,#059669,#047857);color:#fff;padding:16px 40px;border-radius:50px;text-decoration:none;font-weight:700;font-size:15px;display:inline-block;box-shadow:0 4px 12px rgba(5,150,105,0.35);">
              🔐 Réinitialiser mon mot de passe
            </a>
          </div>
          <div style="background:#fef3c7;border:1px solid #fde68a;border-radius:10px;padding:16px;margin:24px 0;">
            <p style="color:#92400e;font-size:14px;margin:0;">⚠️ Ce lien expire dans <strong>1 heure</strong>.<br>Si vous n'avez pas fait cette demande, ignorez cet email — votre mot de passe reste inchangé.</p>
          </div>
          <p style="color:#9ca3af;font-size:12px;">Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :<br><a href="${resetUrl}" style="color:#059669;word-break:break-all;">${resetUrl}</a></p>
        </td></tr>
        <tr><td style="background:#f9fafb;padding:20px;text-align:center;">
          <p style="color:#9ca3af;font-size:12px;margin:0;">© 2026 AGRI POINT SERVICE SAS · Cameroun</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
    });

    return applySecurityHeaders(NextResponse.json({
      success: true,
      message: 'Si ce compte existe, un email de réinitialisation a été envoyé.',
    }));
  } catch (error: any) {
    console.error('❌ Erreur forgot-password:', error);
    return applySecurityHeaders(NextResponse.json({ error: 'Erreur serveur' }, { status: 500 }));
  }
}
