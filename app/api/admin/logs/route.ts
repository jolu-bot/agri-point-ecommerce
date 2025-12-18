import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { ActivityLog } from '@/models/Security';
import { verifyAccessToken } from '@/lib/auth';
import User from '@/models/User';

// Récupérer les logs d'activité
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
    if (!adminUser || adminUser.role !== 'admin') {
      return NextResponse.json({ error: 'Permission refusée' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '50');

    const query: { user?: string; category?: string } = {};
    if (userId) query.user = userId;
    if (category) query.category = category;

    const logs = await ActivityLog.find(query)
      .populate('user', 'name email role')
      .sort({ createdAt: -1 })
      .limit(limit);

    return NextResponse.json({ logs });
  } catch (error: unknown) {
    console.error('Erreur récupération logs:', error);
    const message = error instanceof Error ? error.message : 'Une erreur est survenue';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
