import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { InvitationCode, ActivityLog, Permission, ROLE_PERMISSIONS } from '@/models/Security';
import { verifyAccessToken } from '@/lib/auth';

// Générer un code d'invitation
export async function POST(request: NextRequest) {
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
    if (!adminUser || !adminUser.permissions.includes(Permission.CREATE_USER)) {
      return NextResponse.json({ error: 'Permission refusée' }, { status: 403 });
    }

    const { email, role, permissions, expiresInDays, maxUses } = await request.json();

    // Générer un code unique
    const code = generateInvitationCode();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + (expiresInDays || 7));

    const invitation = await InvitationCode.create({
      code,
      email,
      role: role || 'client',
      permissions: permissions || ROLE_PERMISSIONS[role] || [],
      createdBy: decoded.userId,
      expiresAt,
      maxUses: maxUses || 1,
    });

    // Log l'action
    await ActivityLog.create({
      user: decoded.userId,
      action: 'generate_invitation_code',
      category: 'user',
      details: { code, email, role },
    });

    return NextResponse.json({
      success: true,
      invitation: {
        code: invitation.code,
        email: invitation.email,
        role: invitation.role,
        expiresAt: invitation.expiresAt,
        maxUses: invitation.maxUses,
      },
    });
  } catch (error) {
    console.error('Erreur génération code:', error);
    const message = error instanceof Error ? error.message : 'Erreur inconnue';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// Lister les codes d'invitation
export async function GET(request: NextRequest) {
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
    if (!adminUser || !adminUser.permissions.includes(Permission.VIEW_USERS)) {
      return NextResponse.json({ error: 'Permission refusée' }, { status: 403 });
    }

    const invitations = await InvitationCode.find()
      .populate('createdBy', 'name email')
      .populate('usedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(100);

    return NextResponse.json({ invitations });
  } catch (error) {
    console.error('Erreur récupération codes:', error);
    const message = error instanceof Error ? error.message : 'Erreur inconnue';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function generateInvitationCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Sans O, 0, I, 1 pour éviter confusion
  let code = 'INV-';
  for (let i = 0; i < 12; i++) {
    if (i > 0 && i % 4 === 0) code += '-';
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}
