import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';

const ALLOWED_STATUSES = ['pending_email', 'pending_admin', 'approved', 'rejected', 'suspended'];

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Support Bearer header + cookie
    const authHeader = request.headers.get('authorization');
    const cookieToken = request.cookies.get('accessToken')?.value;
    const rawToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : cookieToken;

    if (!rawToken) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

    const decoded = verifyAccessToken(rawToken);
    if (!decoded) return NextResponse.json({ error: 'Token invalide' }, { status: 401 });

    await dbConnect();

    const currentUser = await User.findById(decoded.userId).select('role');
    if (!currentUser || !['admin', 'superadmin'].includes(currentUser.role)) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
    }

    const body = await request.json();
    const { accountStatus, reason } = body;

    if (!ALLOWED_STATUSES.includes(accountStatus)) {
      return NextResponse.json({ error: 'Statut invalide' }, { status: 400 });
    }

    const { id } = await context.params;

    const updateFields: Record<string, unknown> = { accountStatus };
    if (reason) updateFields.statusReason = reason;
    if (accountStatus === 'approved') updateFields.approvedAt = new Date();

    const user = await User.findByIdAndUpdate(id, updateFields, { new: true }).select('-password -verificationToken -passwordResetToken');
    if (!user) return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error('Erreur mise à jour statut:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
