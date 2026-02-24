import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Product from '@/models/Product';

/**
 * GET /api/admin/products/low-stock
 * Retourne les produits dont le stock est en dessous du seuil critique.
 * Query params:
 *   - threshold : seuil (défaut = 10)
 *   - limit     : nombre max de résultats (défaut = 20)
 */
export async function GET(request: NextRequest) {
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

    const user = await User.findById(decoded.userId);
    if (!user || !['admin', 'manager'].includes(user.role)) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const threshold = parseInt(searchParams.get('threshold') || '10');
    const limit = parseInt(searchParams.get('limit') || '20');

    const products = await Product.find({
      isActive: true,
      stock: { $lte: threshold },
    })
      .select('name sku stock category price images')
      .sort({ stock: 1 }) // du plus critique au moins critique
      .limit(limit)
      .lean();

    const items = products.map((p) => ({
      id: p._id.toString(),
      name: p.name,
      sku: p.sku || '—',
      stock: p.stock,
      threshold,
      category: p.category,
      price: p.price,
      image: p.images?.[0] || null,
      level: p.stock === 0 ? 'out' : p.stock <= 3 ? 'critical' : 'low',
    }));

    return NextResponse.json({
      items,
      total: items.length,
      threshold,
    });
  } catch (error) {
    console.error('Erreur low-stock:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
