import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export async function GET(request: NextRequest) {
  try {
    // Support Bearer token ET cookie HttpOnly
    const authHeader = request.headers.get('authorization');
    const cookieToken = request.cookies.get('accessToken')?.value;
    const token = authHeader?.startsWith('Bearer ')
      ? authHeader.substring(7)
      : cookieToken;

    if (!token) {
      return NextResponse.json({ error: 'Token manquant' }, { status: 401 });
    }

    const decoded = verifyAccessToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Token invalide ou expiré' }, { status: 401 });
    }

    await dbConnect();

    const user = await User.findById(decoded.userId)
      .select('-password -emailVerificationToken -passwordResetToken');

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    return NextResponse.json({
      user: {
        id:            user._id,
        name:          user.name,
        email:         user.email,
        phone:         user.phone,
        whatsapp:      user.whatsapp,
        role:          user.role,
        permissions:   user.permissions,
        uniqueCode:    user.uniqueCode,
        accountStatus: user.accountStatus,
        emailVerified: user.emailVerified,
        avatar:        user.avatar,
        address:       user.address,
        createdAt:     user.createdAt,
        lastLoginAt:   user.lastLoginAt,
      },
    });
  } catch (error) {
    console.error('Erreur /me:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

/**
 * PATCH /api/auth/me — Mettre à jour le profil courant
 */
export async function PATCH(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const cookieToken = request.cookies.get('accessToken')?.value;
    const token = authHeader?.startsWith('Bearer ')
      ? authHeader.substring(7)
      : cookieToken;

    if (!token) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

    const decoded = verifyAccessToken(token);
    if (!decoded) return NextResponse.json({ error: 'Token invalide' }, { status: 401 });

    await dbConnect();

    const body = await request.json();
    const allowed = ['name', 'phone', 'whatsapp', 'address', 'avatar'];
    const updates: Record<string, any> = {};
    for (const key of allowed) {
      if (body[key] !== undefined) updates[key] = body[key];
    }

    const user = await User.findByIdAndUpdate(
      decoded.userId,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password -emailVerificationToken -passwordResetToken');

    if (!user) return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });

    return NextResponse.json({ success: true, user });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erreur serveur' }, { status: 500 });
  }
}

  try {
    // Récupérer le token
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Token manquant' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);

    // Vérifier le token
    const decoded = verifyAccessToken(token);
    
    if (!decoded) {
      return NextResponse.json(
        { error: 'Token invalide' },
        { status: 401 }
      );
    }

    // Connexion à la base de données
    await dbConnect();

    // Récupérer l'utilisateur
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    // Retourner les informations utilisateur
    return NextResponse.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        permissions: user.permissions,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Erreur vérification token:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
