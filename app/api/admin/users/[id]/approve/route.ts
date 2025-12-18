import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { ActivityLog, Permission } from '@/models/Security';
import { verifyAccessToken } from '@/lib/auth';

// Approuver un utilisateur
export async function POST(
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

    // Vérifier les permissions
    const adminUser = await User.findById(decoded.userId);
    if (!adminUser || !adminUser.permissions.includes(Permission.APPROVE_USERS)) {
      return NextResponse.json({ error: 'Permission refusée' }, { status: 403 });
    }

    const { id } = params;
    const { status, reason } = await request.json();

    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    user.accountStatus = status;
    user.approvedBy = decoded.userId;
    user.approvedAt = new Date();
    
    if (status === 'rejected') {
      user.rejectionReason = reason;
      user.isActive = false;
    } else if (status === 'approved') {
      user.isActive = true;
    }

    await user.save();

    // Log l'action
    await ActivityLog.create({
      user: decoded.userId,
      action: `${status}_user`,
      category: 'user',
      details: {
        targetUserId: id,
        targetUserEmail: user.email,
        status,
        reason,
      },
    });

    return NextResponse.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        accountStatus: user.accountStatus,
        approvedAt: user.approvedAt,
      },
    });
  } catch (error) {
    console.error('Erreur approbation utilisateur:', error);
    const message = error instanceof Error ? error.message : 'Erreur inconnue';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
