import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { generateAccessToken, generateRefreshToken, getRolePermissions } from '@/lib/auth';

const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_TIME_MINUTES  = 30;

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email et mot de passe requis' },
        { status: 400 }
      );
    }

    // Récupérer l'utilisateur + mot de passe (select: false)
    const user = await User.findOne({ email: email.toLowerCase() })
      .select('+password +loginAttempts +lockUntil +emailVerificationToken +emailVerificationExpires');

    // Gestion sécurisée : même comportement si l'user n'existe pas
    if (!user) {
      return NextResponse.json(
        { error: 'Email ou mot de passe incorrect' },
        { status: 401 }
      );
    }

    // ── Compte suspendu / rejeté ──────────────────────────────────────────────
    if (user.accountStatus === 'suspended') {
      return NextResponse.json(
        { error: 'Votre compte a été suspendu. Contactez le support.' },
        { status: 403 }
      );
    }
    if (user.accountStatus === 'rejected') {
      return NextResponse.json(
        { error: 'Votre demande de compte a été refusée.' },
        { status: 403 }
      );
    }

    // ── Compte verrouillé (brute-force) ───────────────────────────────────────
    if (user.isLocked()) {
      const remaining = Math.ceil(
        ((user.lockUntil?.getTime() || 0) - Date.now()) / 60000
      );
      return NextResponse.json(
        { error: `Compte temporairement verrouillé. Réessayez dans ${remaining} min.` },
        { status: 423 }
      );
    }

    // ── Vérification du mot de passe ──────────────────────────────────────────
    const isValid = await user.comparePassword(password);

    if (!isValid) {
      user.loginAttempts = (user.loginAttempts || 0) + 1;

      if (user.loginAttempts >= MAX_LOGIN_ATTEMPTS) {
        user.lockUntil = new Date(Date.now() + LOCK_TIME_MINUTES * 60 * 1000);
        await user.save();
        return NextResponse.json(
          { error: `Trop de tentatives. Compte verrouillé pour ${LOCK_TIME_MINUTES} minutes.` },
          { status: 423 }
        );
      }

      await user.save();
      const remaining = MAX_LOGIN_ATTEMPTS - user.loginAttempts;
      return NextResponse.json(
        { error: `Email ou mot de passe incorrect. ${remaining} tentative(s) restante(s).` },
        { status: 401 }
      );
    }

    // ── Email non vérifié ─────────────────────────────────────────────────────
    if (!user.emailVerified || user.accountStatus === 'pending_email') {
      return NextResponse.json(
        {
          error: 'Veuillez vérifier votre adresse email avant de vous connecter.',
          code:  'EMAIL_NOT_VERIFIED',
          email: user.email,
        },
        { status: 403 }
      );
    }

    // ── Réinitialiser les tentatives échouées ─────────────────────────────────
    user.loginAttempts = 0;
    user.lockUntil     = undefined;
    user.lastLoginAt   = new Date();
    user.lastLoginIp   = req.headers.get('x-forwarded-for') ||
                         req.headers.get('x-real-ip') || 'unknown';
    await user.save();

    // ── Générer les tokens ────────────────────────────────────────────────────
    const payload = {
      userId: user._id.toString(),
      email:  user.email,
      role:   user.role,
      name:   user.name,
    };
    const accessToken  = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    const userData = {
      id:            user._id,
      name:          user.name,
      email:         user.email,
      phone:         user.phone,
      role:          user.role,
      uniqueCode:    user.uniqueCode,
      accountStatus: user.accountStatus,
      emailVerified: user.emailVerified,
      avatar:        user.avatar,
      address:       user.address,
      permissions:   getRolePermissions(user.role),
    };

    const response = NextResponse.json({
      success:      true,
      user:         userData,
      accessToken,
      refreshToken,
    });

    // ── HttpOnly Cookies (sécurisé, résistant XSS) ─────────────────────────
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

    return response;

  } catch (error: any) {
    console.error('❌ Erreur connexion:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la connexion' },
      { status: 500 }
    );
  }
}

  try {
    await dbConnect();

    const { email, password } = await req.json();

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email et mot de passe requis' },
        { status: 400 }
      );
    }

    // Trouver l'utilisateur avec le mot de passe
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    
    if (!user) {
      return NextResponse.json(
        { error: 'Email ou mot de passe incorrect' },
        { status: 401 }
      );
    }

    // Vérifier si l'utilisateur est actif
    if (!user.isActive) {
      return NextResponse.json(
        { error: 'Compte désactivé. Contactez l\'administrateur.' },
        { status: 403 }
      );
    }

    // Vérifier le mot de passe
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Email ou mot de passe incorrect' },
        { status: 401 }
      );
    }

    // Générer les tokens
    const accessToken = generateAccessToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    const refreshToken = generateRefreshToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    // Retourner la réponse
    return NextResponse.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        permissions: getRolePermissions(user.role),
      },
      accessToken,
      refreshToken,
    });

  } catch (error: any) {
    console.error('Erreur connexion:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la connexion' },
      { status: 500 }
    );
  }
}
