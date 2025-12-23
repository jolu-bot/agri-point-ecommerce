import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email requis' },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    // ⚠️ Pour la sécurité, on retourne toujours le même message
    // même si l'utilisateur n'existe pas (évite l'énumération des emails)
    
    if (user) {
      // Générer un token de réinitialisation
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenHash = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

      // Expire dans 1 heure
      const resetTokenExpiry = new Date(Date.now() + 3600000);

      user.passwordResetToken = resetTokenHash;
      user.passwordResetExpires = resetTokenExpiry;
      await user.save();

      // TODO: Envoyer l'email avec nodemailer
      // const resetUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/auth/reset-password?token=${resetToken}`;
      // await sendEmail({
      //   to: user.email,
      //   subject: 'Réinitialisation de mot de passe - AGRI POINT',
      //   html: `Cliquez sur ce lien pour réinitialiser votre mot de passe: ${resetUrl}`
      // });

      console.log('🔐 Token de réinitialisation généré pour:', user.email);
      console.log('Token (à utiliser pour test):', resetToken);
    }

    return NextResponse.json({
      success: true,
      message: 'Si cet email existe, un lien de réinitialisation a été envoyé',
    });

  } catch (error: any) {
    console.error('Erreur forgot-password:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la demande de réinitialisation' },
      { status: 500 }
    );
  }
}
