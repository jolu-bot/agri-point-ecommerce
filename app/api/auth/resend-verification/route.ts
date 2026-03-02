import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { sendEmail } from '@/lib/email';

/**
 * POST /api/auth/resend-verification
 * Body: { email: string }
 */
export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email requis' }, { status: 400 });
    }

    await dbConnect();

    const user = await User.findOne({ email: email.toLowerCase() })
      .select('+emailVerificationToken +emailVerificationExpires');

    if (!user) {
      // Sécurité : ne pas révéler l'existence du compte
      return NextResponse.json({
        success: true,
        message: 'Si ce compte existe, un email de vérification a été envoyé.',
      });
    }

    if (user.emailVerified) {
      return NextResponse.json(
        { error: 'Cet email est déjà vérifié.' },
        { status: 400 }
      );
    }

    // Générer un nouveau token
    const raw = user.generateVerificationToken();
    await user.save();

    const siteUrl   = process.env.NEXT_PUBLIC_SITE_URL || 'https://agri-ps.com';
    const verifyUrl = `${siteUrl}/auth/verify-email?token=${raw}`;

    await sendEmail({
      to:      user.email,
      subject: '🔗 Nouveau lien de vérification — AGRI POINT SERVICE',
      html: `
        <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:580px;margin:0 auto;">
          <div style="background:linear-gradient(135deg,#059669,#065f46);padding:32px;text-align:center;border-radius:16px 16px 0 0;">
            <h1 style="color:#fff;margin:0;">🌿 AGRI POINT SERVICE</h1>
          </div>
          <div style="background:#fff;padding:32px;border-radius:0 0 16px 16px;box-shadow:0 4px 20px rgba(0,0,0,0.06);">
            <h2 style="color:#065f46;">Nouveau lien de vérification</h2>
            <p style="color:#374151;line-height:1.6;">Bonjour ${user.name},<br>Voici votre nouveau lien de vérification d'email :</p>
            <div style="text-align:center;margin:28px 0;">
              <a href="${verifyUrl}" style="background:#059669;color:#fff;padding:14px 36px;border-radius:50px;text-decoration:none;font-weight:700;">
                ✅ Vérifier mon email
              </a>
            </div>
            <p style="color:#9ca3af;font-size:13px;text-align:center;">Ce lien expire dans 24 heures.</p>
          </div>
        </div>`,
    });

    return NextResponse.json({
      success: true,
      message: 'Email de vérification envoyé. Consultez votre boîte mail.',
    });
  } catch (error: any) {
    console.error('Erreur resend-verification:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
