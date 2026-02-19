import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/auth';
import dbConnect from '@/lib/db';
import AuditLog from '@/models/AuditLog';

// GET - Récupérer les logs d'audit avec filtres
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    // Vérifier l'authentification
    const decoded = await verifyAccessToken(request);
    if (!decoded) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    // Seuls les admins peuvent voir tous les logs
    if (decoded.role !== 'admin') {
      return NextResponse.json(
        { error: 'Accès réservé aux administrateurs' },
        { status: 403 }
      );
    }

    // Paramètres de pagination
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;

    // Filtres
    const userId = searchParams.get('userId');
    const action = searchParams.get('action');
    const resource = searchParams.get('resource');
    const severity = searchParams.get('severity');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const search = searchParams.get('search'); // Recherche dans description

    // Construire la query
    const query: any = {};

    if (userId) {
      query.userId = userId;
    }

    if (action) {
      query.action = action;
    }

    if (resource) {
      query.resource = resource;
    }

    if (severity) {
      query.severity = severity;
    }

    // Filtre de dates
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        query.createdAt.$lte = new Date(endDate);
      }
    }

    // Recherche textuelle
    if (search) {
      query.$or = [
        { description: { $regex: search, $options: 'i' } },
        { userName: { $regex: search, $options: 'i' } },
        { userEmail: { $regex: search, $options: 'i' } }
      ];
    }

    // Récupérer les logs
    const logs = await AuditLog.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .lean();

    // Compter le total
    const total = await AuditLog.countDocuments(query);

    // Calculer les pages
    const totalPages = Math.ceil(total / limit);

    // Statistiques supplémentaires
    const stats = {
      totalLogs: total,
      currentPage: page,
      totalPages,
      logsPerPage: limit,
      
      // Répartition par action
      byAction: await AuditLog.aggregate([
        { $match: query },
        { $group: { _id: '$action', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      
      // Répartition par sévérité
      bySeverity: await AuditLog.aggregate([
        { $match: query },
        { $group: { _id: '$severity', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      
      // Utilisateurs les plus actifs
      topUsers: await AuditLog.aggregate([
        { $match: query },
        { $group: { 
          _id: { userId: '$userId', userName: '$userName' },
          count: { $sum: 1 }
        }},
        { $sort: { count: -1 } },
        { $limit: 10 }
      ])
    };

    return NextResponse.json({
      logs,
      pagination: {
        page,
        limit,
        total,
        totalPages
      },
      stats
    }, { status: 200 });

  } catch (error) {
    console.error('Erreur récupération audit logs:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des logs' },
      { status: 500 }
    );
  }
}

// POST - Créer un log manuel (rarement utilisé, surtout via lib/audit-logger)
export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    // Vérifier l'authentification
    const decoded = await verifyAccessToken(request);
    if (!decoded) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    const body = await request.json();

    const log = await AuditLog.create({
      userId: decoded.userId,
      userName: decoded.name || 'Unknown',
      userEmail: decoded.email || 'unknown@example.com',
      userRole: decoded.role,
      action: body.action,
      resource: body.resource,
      resourceId: body.resourceId,
      description: body.description,
      severity: body.severity || 'info',
      metadata: body.metadata,
      tags: body.tags || [],
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
      requestMethod: request.method,
      requestPath: request.nextUrl.pathname,
      createdAt: new Date()
    });

    return NextResponse.json({
      message: 'Log créé avec succès',
      log
    }, { status: 201 });

  } catch (error) {
    console.error('Erreur création log:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création du log' },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer les logs anciens (maintenance)
export async function DELETE(request: NextRequest) {
  try {
    await dbConnect();

    // Vérifier l'authentification
    const decoded = await verifyAccessToken(request);
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json(
        { error: 'Accès réservé aux administrateurs' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '90');

    // Supprimer les logs plus anciens que X jours
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const result = await AuditLog.deleteMany({
      createdAt: { $lt: cutoffDate }
    });

    return NextResponse.json({
      message: `Logs supprimés avec succès`,
      deletedCount: result.deletedCount
    }, { status: 200 });

  } catch (error) {
    console.error('Erreur suppression logs:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression des logs' },
      { status: 500 }
    );
  }
}
