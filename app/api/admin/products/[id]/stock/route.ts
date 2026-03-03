import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Product from '@/models/Product';
import { invalidateCacheByPattern } from '@/lib/api-route-cache';

/**
 * PATCH /api/admin/products/[id]/stock
 * Ajuste le stock d'un produit (ajout, retrait ou valeur absolue).
 * Body: { operation: 'set' | 'add' | 'subtract', value: number, reason?: string }
 */
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
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

    const { id } = await context.params;
    const { operation, value, reason } = await request.json();

    if (!['set', 'add', 'subtract'].includes(operation)) {
      return NextResponse.json({ error: 'Opération invalide (set | add | subtract)' }, { status: 400 });
    }
    if (typeof value !== 'number' || value < 0) {
      return NextResponse.json({ error: 'Valeur invalide' }, { status: 400 });
    }

    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json({ error: 'Produit non trouvé' }, { status: 404 });
    }

    const previousStock = product.stock;

    switch (operation) {
      case 'set':
        product.stock = value;
        break;
      case 'add':
        product.stock = previousStock + value;
        break;
      case 'subtract':
        product.stock = Math.max(0, previousStock - value);
        break;
    }

    await product.save();

    invalidateCacheByPattern('^api:admin:products:list');
    invalidateCacheByPattern('^api:admin:products:low-stock');
    invalidateCacheByPattern('^api:products:list');
    invalidateCacheByPattern('^api:admin:analytics');

    return NextResponse.json({
      success: true,
      product: {
        id: product._id.toString(),
        name: product.name,
        previousStock,
        newStock: product.stock,
        operation,
        value,
        reason: reason || '',
      },
    });
  } catch (error) {
    console.error('Erreur ajustement stock:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
