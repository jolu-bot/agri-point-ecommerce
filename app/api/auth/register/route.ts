import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { generateAccessToken, generateRefreshToken, getRolePermissions } from '@/lib/auth';
import { sendEmail } from '@/lib/email';
import {
  getClientIp, sanitizeObject, sanitizeString, scanForThreats,
  isValidEmail, isValidCameroonPhone, checkPasswordStrength,
  applySecurityHeaders, logSecurityEvent,
} from '@/lib/security';
import { rateLimit } from '@/lib/rate-limit';

// Régions administratives du Cameroun
const CAMEROUN_REGIONS = [
  'Adamaoua','Centre','Est','Extrême-Nord','Littoral',
  'Nord','Nord-Ouest','Ouest','Sud','Sud-Ouest',
];

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const ua = req.headers.get('user-agent') ?? 'unknown';

  try {
    // IP rate limit — 5 créations de compte / heure
    if (!rateLimit(`register:${ip}`, 5, 60 * 60 * 1000)) {
      return applySecurityHeaders(NextResponse.json(
        { error: 'Trop de créations de compte. Réessayez dans une heure.' }, { status: 429 }
      ));
    }

    await dbConnect();

    let rawBody: Record<string, unknown>;
    try { rawBody = await req.json(); }
    catch { return NextResponse.json({ error: 'Corps de requête invalide' }, { status: 400 }); }

    // -- Scan anti-injection/ XSS avant tout traitement -----------------------
    const threat = scanForThreats(rawBody);
    if (!threat.safe) {
      logSecurityEvent({ type: 'threat_detected', ip, userAgent: ua, detail: `${threat.threat} in ${threat.matchedField}` });
      return applySecurityHeaders(NextResponse.json({ error: 'Données invalides' }, { status: 400 }));
    }

    // -- Sanitisation complète ------------------------------------------------
    const body = sanitizeObject(rawBody);
    const {
      name, email, password, confirmPassword,
      phone, whatsapp,
      city, region, quartier, street,
    } = body as Record<string, string>;

    // -- Validation ------------------------------------------------------------
    const errors: string[] = [];

    if (!name?.trim() || name.trim().length < 2)
      errors.push('Le nom doit contenir au moins 2 caractères');
    if (!isValidEmail(email ?? ''))
      errors.push('Adresse email invalide');
    const pwdCheck = checkPasswordStrength(password ?? '');
    if (!pwdCheck.strong)
      errors.push(pwdCheck.issues[0] ?? 'Mot de passe trop faible');
    if (confirmPassword && password !== confirmPassword)
      errors.push('Les mots de passe ne correspondent pas');
    if (!phone?.trim() || !isValidCameroonPhone(phone))
      errors.push('Numéro de téléphone invalide (format camerounais requis)');
    if (!city?.trim())
      errors.push('La ville est requise');
    if (!region?.trim() || !CAMEROUN_REGIONS.includes(region))
      errors.push('Région invalide');

    if (errors.length > 0) {
      return NextResponse.json({ error: errors[0], errors }, { status: 400 });
    }

    // -- Email unique ----------------------------------------------------------
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return NextResponse.json(
        { error: 'Un compte existe déjà avec cette adresse email' },
        { status: 409 }
      );
    }

    // -- Création du compte ----------------------------------------------------
    const user = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: 'client',
      phone: phone.trim(),
      whatsapp: (whatsapp || phone).trim(),
      address: {
        city:     city.trim(),
        region:   region.trim(),
        quartier: quartier?.trim() || '',
        street:   street?.trim()   || '',
        country:  'Cameroun',
      },
      accountStatus: 'pending_email',
      emailVerified: false,
    });

    // Générer le token de vérification email
    const verificationToken = user.generateVerificationToken();
    await user.save();

    // -- Email de bienvenue + vérification -------------------------------------
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://agri-ps.com';
    const verifyUrl = `${siteUrl}/auth/verify-email?token=${verificationToken}`;

    await sendEmail({
      to: user.email,
      subject: '✅ Confirmez votre compte AGRIPOINT SERVICES',
      html: buildVerificationEmailHtml(user.name, verifyUrl, user.uniqueCode),
    });

    // Notification admin
    if (process.env.EMAIL_CONTACT) {
      await sendEmail({
        to: process.env.EMAIL_CONTACT,
        subject: `🆕 Nouvelle inscription — ${user.name}`,
        html: `<p>Nouvel utilisateur inscrit :</p>
               <ul>
                 <li><strong>Nom :</strong> ${user.name}</li>
                 <li><strong>Email :</strong> ${user.email}</li>
                 <li><strong>Téléphone :</strong> ${user.phone}</li>
                 <li><strong>Ville :</strong> ${user.address.city}, ${user.address.region}</li>
                 <li><strong>Code :</strong> ${user.uniqueCode}</li>
               </ul>`,
      });
    }

    // -- Tokens (pour connexion directe côté client si besoin) -----------------
    const accessToken = generateAccessToken({
      userId: user._id.toString(),
      email:  user.email,
      role:   user.role,
    });
    const refreshToken = generateRefreshToken({
      userId: user._id.toString(),
      email:  user.email,
      role:   user.role,
    });

    const response = NextResponse.json({
      success: true,
      message: 'Compte créé ! Consultez votre email pour valider votre adresse.',
      requiresVerification: true,
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
    }, { status: 201 });

    // HttpOnly cookies
    response.cookies.set('accessToken', accessToken, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge:   15 * 60,           // 15 min
      path:     '/',
    });
    response.cookies.set('refreshToken', refreshToken, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge:   7 * 24 * 3600,    // 7 jours
      path:     '/',
    });

    logSecurityEvent({ type: 'register', ip, userAgent: ua, email: user.email, userId: user._id.toString() });
    return applySecurityHeaders(response);

  } catch (error: any) {
    console.error('❌ Erreur inscription:', error);
    if (error.code === 11000) {
      return applySecurityHeaders(NextResponse.json(
        { error: 'Un compte existe déjà avec cet email ou ce code' },
        { status: 409 }
      ));
    }
    return applySecurityHeaders(NextResponse.json(
      { error: 'Erreur lors de l\'inscription' },
      { status: 500 }
    ));
  }
}

// -----------------------------------------------------------------------------
// Template email de vérification
// -----------------------------------------------------------------------------
function buildVerificationEmailHtml(name: string, verifyUrl: string, code: string): string {
  return `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;font-family:'Segoe UI',Arial,sans-serif;background:#f0fdf4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0fdf4;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <!-- Header -->
        <tr><td style="background:linear-gradient(135deg,#059669,#065f46);padding:40px;text-align:center;">
          <h1 style="color:#ffffff;margin:0;font-size:28px;font-weight:800;">🌿 AGRIPOINT SERVICES</h1>
          <p style="color:#a7f3d0;margin:8px 0 0;font-size:14px;">La plateforme agricole de confiance au Cameroun</p>
        </td></tr>
        <!-- Body -->
        <tr><td style="padding:40px;">
          <h2 style="color:#065f46;font-size:22px;margin:0 0 16px;">Bienvenue, ${name} ! 🎉</h2>
          <p style="color:#374151;font-size:16px;line-height:1.6;margin:0 0 24px;">
            Votre compte AGRIPOINT SERVICES a été créé avec succès.<br>
            Pour activer votre compte, cliquez sur le bouton ci-dessous :
          </p>
          <div style="text-align:center;margin:32px 0;">
            <a href="${verifyUrl}"
               style="background:linear-gradient(135deg,#059669,#047857);color:#ffffff;padding:16px 40px;border-radius:50px;text-decoration:none;font-weight:700;font-size:16px;display:inline-block;box-shadow:0 4px 12px rgba(5,150,105,0.4);">
              ✅ Vérifier mon adresse email
            </a>
          </div>
          <p style="color:#6b7280;font-size:13px;text-align:center;">Ce lien expire dans <strong>24 heures</strong></p>
          <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:20px;margin:24px 0;">
            <p style="color:#065f46;font-weight:700;margin:0 0 8px;font-size:14px;">🆔 Votre code client unique :</p>
            <p style="color:#059669;font-size:24px;font-weight:800;margin:0;letter-spacing:3px;text-align:center;">${code}</p>
            <p style="color:#6b7280;font-size:12px;margin:8px 0 0;text-align:center;">Conservez ce code — il peut vous être demandé lors d'un contact avec notre équipe.</p>
          </div>
        </td></tr>
        <!-- Footer -->
        <tr><td style="background:#f9fafb;padding:24px;text-align:center;border-top:1px solid #e5e7eb;">
          <p style="color:#9ca3af;font-size:12px;margin:0;">© 2026 AGRIPOINT SERVICES SAS · Cameroun</p>
          <p style="color:#9ca3af;font-size:12px;margin:4px 0 0;">Si vous n'avez pas créé ce compte, ignorez cet email.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
