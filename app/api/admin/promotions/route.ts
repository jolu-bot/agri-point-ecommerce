import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Promotion from '@/models/Promotion';
import { verifyAccessToken } from '@/lib/auth';
import { createAuditLog } from '@/lib/audit-logger';

// GET /api/admin/promotions - Liste toutes les promotions
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('accessToken')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const user = await verifyAccessToken(token);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    await dbConnect();

    // Query params pour filtrage
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // 'active', 'scheduled', 'expired', 'all'
    const type = searchParams.get('type');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search');

    // Build query
    const query: any = {};

    // Filtre par statut
    if (status === 'active') {
      query.isActive = true;
      query.startDate = { $lte: new Date() };
      query.endDate = { $gte: new Date() };
    } else if (status === 'scheduled') {
      query.startDate = { $gt: new Date() };
    } else if (status === 'expired') {
      query.endDate = { $lt: new Date() };
    }

    // Filtre par type
    if (type) {
      query.type = type;
    }

    // Recherche
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
      ];
    }

    // Exécuter la requête avec pagination
    const promotions = await Promotion.find(query)
      .sort({ 'display.priority': -1, createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit)
      .populate('createdBy', 'name email')
      .lean();

    const total = await Promotion.countDocuments(query);

    // Stats rapides
    const stats = await Promotion.aggregate([
      {
        $facet: {
          active: [
            {
              $match: {
                isActive: true,
                startDate: { $lte: new Date() },
                endDate: { $gte: new Date() },
              },
            },
            { $count: 'count' },
          ],
          scheduled: [
            { $match: { startDate: { $gt: new Date() } } },
            { $count: 'count' },
          ],
          expired: [
            { $match: { endDate: { $lt: new Date() } } },
            { $count: 'count' },
          ],
          totalRevenue: [
            { $group: { _id: null, total: { $sum: '$stats.revenue' } } },
          ],
          totalConversions: [
            { $group: { _id: null, total: { $sum: '$stats.conversions' } } },
          ],
        },
      },
    ]);

    return NextResponse.json({
      promotions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      stats: {
        active: stats[0].active[0]?.count || 0,
        scheduled: stats[0].scheduled[0]?.count || 0,
        expired: stats[0].expired[0]?.count || 0,
        totalRevenue: stats[0].totalRevenue[0]?.total || 0,
        totalConversions: stats[0].totalConversions[0]?.total || 0,
      },
    });
  } catch (error: any) {
    console.error('Erreur GET /api/admin/promotions:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/admin/promotions - Créer une nouvelle promotion
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('accessToken')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const user = await verifyAccessToken(token);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    await dbConnect();

    const body = await request.json();

    // Générer un slug si non fourni
    if (!body.slug) {
      body.slug = body.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }

    // Générer un code aléatoire si non fourni mais type code
    if (!body.code && body.codeRequired) {
      body.code = Math.random().toString(36).substring(2, 10).toUpperCase();
    }

    // Ajouter l'ID de l'utilisateur créateur
    body.createdBy = user.userId;

    const promotion = await Promotion.create(body);

    // Audit log
    await createAuditLog({
      userId: user.userId,
      userName: user.name,
      userEmail: user.email,
      userRole: user.role,
      action: 'create',
      resource: 'promotion',
      resourceId: promotion._id.toString(),
      description: `Promotion créée: ${promotion.name}`,
      severity: 'info',
      metadata: {
        type: promotion.type,
        value: promotion.value,
        code: promotion.code,
      },
      request,
    });

    return NextResponse.json({ promotion }, { status: 201 });
  } catch (error: any) {
    console.error('Erreur POST /api/admin/promotions:', error);
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'Une promotion avec ce slug ou code existe déjà' },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH /api/admin/promotions - Mettre à jour une promotion
export async function PATCH(request: NextRequest) {
  try {
    const token = request.cookies.get('accessToken')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const user = await verifyAccessToken(token);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID manquant' }, { status: 400 });
    }

    const body = await request.json();
    body.updatedBy = user.userId;

    const promotion = await Promotion.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });

    if (!promotion) {
      return NextResponse.json({ error: 'Promotion introuvable' }, { status: 404 });
    }

    // Audit log
    await createAuditLog({
      userId: user.userId,
      userName: user.name,
      userEmail: user.email,
      userRole: user.role,
      action: 'update',
      resource: 'promotion',
      resourceId: promotion._id.toString(),
      description: `Promotion mise à jour: ${promotion.name}`,
      severity: 'info',
      request,
    });

    return NextResponse.json({ promotion });
  } catch (error: any) {
    console.error('Erreur PATCH /api/admin/promotions:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/admin/promotions - Supprimer une promotion
export async function DELETE(request: NextRequest) {
  try {
    const token = request.cookies.get('accessToken')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const user = await verifyAccessToken(token);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID manquant' }, { status: 400 });
    }

    const promotion = await Promotion.findByIdAndDelete(id);

    if (!promotion) {
      return NextResponse.json({ error: 'Promotion introuvable' }, { status: 404 });
    }

    // Audit log
    await createAuditLog({
      userId: user.userId,
      userName: user.name,
      userEmail: user.email,
      userRole: user.role,
      action: 'delete',
      resource: 'promotion',
      resourceId: id,
      description: `Promotion supprimée: ${promotion.name}`,
      severity: 'warning',
      tags: ['delete', 'promotion'],
      request,
    });

    return NextResponse.json({ message: 'Promotion supprimée avec succès' });
  } catch (error: any) {
    console.error('Erreur DELETE /api/admin/promotions:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
