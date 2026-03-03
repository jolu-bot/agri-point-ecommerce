import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Order from '@/models/Order';
import {
  buildCacheKey,
  getCachedPayload,
  setCachedPayload,
  privateCacheHeaders,
} from '@/lib/api-route-cache';

export async function GET(request: NextRequest) {
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

    const user = await User.findById(decoded.userId);
    
    if (!user || !['admin', 'manager', 'redacteur'].includes(user.role)) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
    }

    const cacheKey = buildCacheKey('api:admin:orders:list', request);
    const cached = getCachedPayload<any>(cacheKey);
    if (cached) {
      return NextResponse.json(cached, {
        headers: privateCacheHeaders(20, 60),
      });
    }

    const orders = await Order.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .lean();

    const payload = { orders };
    setCachedPayload(cacheKey, payload, 20_000);

    return NextResponse.json(payload, {
      headers: privateCacheHeaders(20, 60),
    });
  } catch (error) {
    console.error('Erreur récupération commandes:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
