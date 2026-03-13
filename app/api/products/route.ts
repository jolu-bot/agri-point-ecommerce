import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import {
  buildCacheKey,
  getCachedPayload,
  setCachedPayload,
  publicCacheHeaders,
} from '@/lib/api-route-cache';
import { rateLimit, getClientIp } from '@/lib/rate-limit';

export async function GET(req: NextRequest) {
  const ip = getClientIp(req);
  const limited = rateLimit(`api:products:${ip}`, 60, 60_000);
  if (limited) return NextResponse.json({ error: 'Trop de requêtes' }, { status: 429 });

  try {
    const cacheKey = buildCacheKey('api:products:list', req);
    const cached = getCachedPayload<any>(cacheKey);
    if (cached) {
      return NextResponse.json(cached, {
        headers: publicCacheHeaders(120, 300),
      });
    }

    await dbConnect();

    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort') || 'createdAt';
    const order = searchParams.get('order') || 'desc';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');

    // Construire la requête
    const query: any = { isActive: true };

    if (category && category !== 'all') {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    // Compter le total
    const total = await Product.countDocuments(query);

    // Récupérer les produits
    const products = await Product.find(query)
      .sort({ [sort]: order === 'desc' ? -1 : 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const payload = {
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };

    setCachedPayload(cacheKey, payload, 120_000);

    return NextResponse.json(payload, {
      headers: publicCacheHeaders(120, 300),
    });

  } catch (error: any) {
    console.error('Erreur récupération produits:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    );
  }
}
