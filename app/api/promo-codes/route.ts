import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import PromoCode from '@/models/PromoCode';
import Order from '@/models/Order';
import { verifyAccessToken } from '@/lib/auth';
import { rateLimit, getClientIp } from '@/lib/rate-limit';

/**
 * GET /api/promo-codes
 * Valider un code promo
 */
export async function GET(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    if (!rateLimit(`promo:${ip}`, 20, 60 * 60 * 1000)) {
      return NextResponse.json({ error: 'Trop de tentatives. Réessayez dans une heure.' }, { status: 429 });
    }

    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code')?.toUpperCase();
    const orderTotal = Number(searchParams.get('orderTotal')) || 0;

    if (!code) {
      return NextResponse.json(
        { error: 'Code promo requis' },
        { status: 400 }
      );
    }

    await connectDB();

    const promo = await PromoCode.findOne({ code });

    if (!promo) {
      return NextResponse.json(
        { error: 'Code promo invalide' },
        { status: 404 }
      );
    }

    // Vérifier les conditions
    const now = new Date();
    const errors: string[] = [];

    if (!promo.isActive) {
      errors.push('Code inactif');
    }

    if (promo.expiryDate < now) {
      errors.push('Code expiré');
    }

    if (promo.startDate > now) {
      errors.push('Code non encore valide');
    }

    if (promo.maxUses && promo.usedCount >= promo.maxUses) {
      errors.push('Nombre d\'utilisations dépassé');
    }

    if (promo.minOrderValue && orderTotal < promo.minOrderValue) {
      errors.push(
        `Montant minimum: ${promo.minOrderValue.toLocaleString('fr-FR')} FCFA`
      );
    }

    if (errors.length > 0) {
      return NextResponse.json(
        { valid: false, errors },
        { status: 400 }
      );
    }

    // Calculer la remise
    let discount = 0;
    if (promo.type === 'percentage') {
      discount = (orderTotal * promo.value) / 100;
    } else {
      discount = promo.value;
    }

    // Limiter la remise si maxDiscount est défini
    if (promo.maxDiscount) {
      discount = Math.min(discount, promo.maxDiscount);
    }

    // Ne pas laisser la remise dépasser le total
    discount = Math.min(discount, orderTotal);

    return NextResponse.json({
      valid: true,
      code: promo.code,
      type: promo.type,
      value: promo.value,
      discount: Math.round(discount),
      description: promo.description,
    });
  } catch (error) {
    console.error('Erreur validation promo:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/promo-codes
 * Admin: Créer un nouveau code promo
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
      value,
      maxUses: maxUses || null,
      minOrderValue: minOrderValue || 0,
      maxDiscount: maxDiscount || null,
      expiryDate: new Date(expiryDate),
      description,
      createdBy: decoded.userId,
    });

    return NextResponse.json(
      {
        success: true,
        promo: {
          _id: promo._id,
          code: promo.code,
          type: promo.type,
          value: promo.value,
        },
      },
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
