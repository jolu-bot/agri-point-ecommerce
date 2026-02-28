import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import PromoCode from '@/models/PromoCode';
import { verifyAccessToken } from '@/lib/auth';

/**
 * GET /api/admin/promo-codes
 * Lister tous les codes promos
 */
export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const decoded = verifyAccessToken(token);
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    await connectDB();

    const promoCodes = await PromoCode.find()
      .select('-usedBy')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ promoCodes });
  } catch (error) {
    console.error('Erreur chargement promos:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/promo-codes
 * Créer un nouveau code promo
 */
export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const decoded = verifyAccessToken(token);
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const body = await req.json();
    const { code, type, value, maxUses, minOrderValue, maxDiscount, expiryDate, description } = body;

    if (!code || !type || value === undefined || !expiryDate) {
      return NextResponse.json(
        { error: 'Données incomplètes' },
        { status: 400 }
      );
    }

    await connectDB();

    // Vérifier que le code n'existe pas
    const existing = await PromoCode.findOne({ code: code.toUpperCase() });
    if (existing) {
      return NextResponse.json(
        { error: 'Ce code existe déjà' },
        { status: 409 }
      );
    }

    const promo = await PromoCode.create({
      code: code.toUpperCase(),
      type,
      value: Number(value),
      maxUses: maxUses ? Number(maxUses) : null,
      minOrderValue: minOrderValue ? Number(minOrderValue) : 0,
      maxDiscount: maxDiscount ? Number(maxDiscount) : null,
      expiryDate: new Date(expiryDate),
      description,
      createdBy: decoded.userId,
    });

    return NextResponse.json(
      { success: true, promo },
      { status: 201 }
    );
  } catch (error) {
    console.error('Erreur création promo:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/promo-codes?id=[promoId]
 * Mettre à jour un code promo
 */
export async function PUT(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const decoded = verifyAccessToken(token);
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID manquant' }, { status: 400 });
    }

    const body = await req.json();

    await connectDB();

    const promo = await PromoCode.findByIdAndUpdate(
      id,
      { ...body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!promo) {
      return NextResponse.json({ error: 'Code non trouvé' }, { status: 404 });
    }

    return NextResponse.json({ success: true, promo });
  } catch (error) {
    console.error('Erreur update promo:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/promo-codes?id=[promoId]
 * Supprimer un code promo
 */
export async function DELETE(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const decoded = verifyAccessToken(token);
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID manquant' }, { status: 400 });
    }

    await connectDB();

    await PromoCode.findByIdAndDelete(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur suppression promo:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
