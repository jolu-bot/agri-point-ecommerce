import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { computeTier } from '@/lib/loyalty';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const decoded = verifyAccessToken(authHeader.substring(7));
    if (!decoded) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    await dbConnect();

    const admin = await User.findById(decoded.userId).select('role');
    if (!admin || !['admin', 'manager'].includes(admin.role)) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const { userId, delta, reason } = await request.json();

    if (!userId || typeof delta !== 'number') {
      return NextResponse.json({ error: 'userId et delta requis' }, { status: 400 });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $inc: { loyaltyPoints: delta } },
      { new: true, select: 'loyaltyPoints loyaltyTier name' }
    );

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 });
    }

    const newPoints = user.loyaltyPoints ?? 0;
    const newTier   = computeTier(newPoints);

    if (user.loyaltyTier !== newTier) {
      await User.findByIdAndUpdate(userId, { $set: { loyaltyTier: newTier } });
    }

    console.log(`[loyalty-adjust] admin=${decoded.userId} user=${userId} delta=${delta} reason="${reason}"`);

    return NextResponse.json({
      success: true,
      points: newPoints,
      tier: newTier,
    });
  } catch (error) {
    console.error('Loyalty adjust error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
