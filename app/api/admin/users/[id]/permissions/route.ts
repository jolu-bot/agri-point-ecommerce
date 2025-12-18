import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { ActivityLog, Permission } from '@/models/Security';
import { verifyAccessToken } from '@/lib/auth';

// Modifier les permissions d'un utilisateur
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const decoded = verifyAccessToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    await connectDB();

    const adminUser = await User.findById(decoded.userId);
    if (!adminUser || !adminUser.permissions.includes(Permission.MANAGE_ROLES)) {
      return NextResponse.json({ error: 'Permission refusée' }, { status: 403 });
    }

    const { id } = params;
    const { permissions } = await request.json();

    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    // Mettre à jour les permissions
    user.permissions = permissions;
    await user.save();

    // Log l'action
    await ActivityLog.create({
      user: decoded.userId,
      action: 'update_user_permissions',
      category: 'user',
      details: {
        targetUserId: id,
        targetUserEmail: user.email,
        newPermissions: permissions,
      },
    });

    return NextResponse.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        permissions: user.permissions,
      },
    });
  } catch (error) {
    console.error('Erreur mise à jour permissions:', error);
    const message = error instanceof Error ? error.message : 'Erreur inconnue';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
