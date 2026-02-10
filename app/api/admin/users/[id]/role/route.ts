import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken, getRolePermissions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = verifyAccessToken(token);
    
    if (!decoded) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    await dbConnect();

    const currentUser = await User.findById(decoded.userId);
    
    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
    }

    const body = await request.json();
    const { role } = body;

    const permissions = getRolePermissions(role);

    const paramsObj = await context.params;

    const user = await User.findByIdAndUpdate(
      paramsObj.id,
      { role, permissions },
      { new: true }
    ).select('-password');

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error('Erreur mise à jour rôle:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
