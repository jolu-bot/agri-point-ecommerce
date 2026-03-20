import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { computeTier, nextTierInfo, TIER_THRESHOLDS } from '@/lib/loyalty';
import { rateLimit } from '@/lib/rate-limit';

export async function GET(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') ?? 'unknown';
    const limited = await rateLimit(`loyalty-get:${ip}`, 30, 60_000);
    if (!limited.success) {
      return NextResponse.json({ error: 'Trop de requêtes' }, { status: 429 });
    }

    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const decoded = verifyAccessToken(authHeader.substring(7));
    if (!decoded) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    await dbConnect();

    const user = await User.findById(decoded.userId).select('loyaltyPoints loyaltyTier');
    if (!user) {
      return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 });
    }

    const points   = user.loyaltyPoints ?? 0;
    const tier     = computeTier(points);
    const info     = nextTierInfo(points);

    const TIER_LABELS: Record<string, string> = {
      bronze: 'Bronze', argent: 'Argent', or: 'Or', platine: 'Platine',
    };

    return NextResponse.json({
      points,
      tier,
      tierLabel: TIER_LABELS[tier] ?? tier,
      nextTier:  info.nextTier,
      nextTierLabel: info.nextTier ? (TIER_LABELS[info.nextTier] ?? info.nextTier) : null,
      remaining: info.remaining,
      progress:  info.progress,
      thresholds: TIER_THRESHOLDS,
    });
  } catch (error) {
    console.error('Loyalty GET error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
