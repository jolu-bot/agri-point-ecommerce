import { NextRequest, NextResponse } from 'next/server';
import { createImpersonationSession, ImpersonationSession } from '@/lib/admin-impersonation';
import User from '@/models/User';
import { getLogger } from '@/lib/logger-rotation';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, reason, duration } = body;
    const adminId = request.headers.get('x-admin-id');
    const userEmail = request.headers.get('x-admin-email');

    if (!adminId || !userEmail) {
      return NextResponse.json({ error: 'Admin authentication required' }, { status: 401 });
    }

    // Validation
    if (!userId || !reason || !duration) {
      return NextResponse.json(
        { error: 'userId, reason, and duration required' },
        { status: 400 }
      );
    }

    if (duration < 5 || duration > 480) {
      return NextResponse.json(
        { error: 'Duration must be between 5 and 480 minutes' },
        { status: 400 }
      );
    }

    // Vérifier que l'utilisateur ciblé existe
    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Créer la session d'impersonation
    const ipAddress = request.headers.get('x-forwarded-for') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    const session = createImpersonationSession(
      adminId,
      userId,
      reason,
      duration,
      ipAddress,
      userAgent
    );

    // Sauvegarder en BD (créer collection ImpersonationSession)
    // await ImpersonationSession.create(session);

    // LOG AUDIT
    getLogger().info(
      {
        adminId,
        adminEmail: userEmail,
        targetUserId: userId,
        targetEmail: targetUser.email,
        reason,
        duration,
        sessionId: session.id,
        timestamp: new Date(),
      },
      'ADMIN_IMPERSONATION_STARTED'
    );

    return NextResponse.json({
      success: true,
      session,
      message: `Impersonating user ${targetUser.email} for ${duration} minutes`,
    });
  } catch (error) {
    getLogger().error(
      { error: error instanceof Error ? error.message : error },
      'IMPERSONATION_ERROR'
    );
    return NextResponse.json(
      { error: 'Failed to create impersonation session' },
      { status: 500 }
    );
  }
}

// GET - Lister les sessions actives
export async function GET(request: NextRequest) {
  try {
    const adminId = request.headers.get('x-admin-id');
    if (!adminId) {
      return NextResponse.json({ error: 'Admin authentication required' }, { status: 401 });
    }

    // Récupérer les sessions actives de cet admin
    // const sessions = await ImpersonationSession.find({
    //   adminId,
    //   isActive: true,
    //   expiresAt: { $gt: new Date() }
    // });

    return NextResponse.json({
      success: true,
      sessions: [], // À implémenter avec BD
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to retrieve sessions' },
      { status: 500 }
    );
  }
}
