import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/auth';
import dbConnect from '@/lib/db';
import AuditLog from '@/models/AuditLog';
import ConfigVersion from '@/models/ConfigVersion';
import SiteConfig from '@/models/SiteConfig';

/**
 * API Analytics pour le CMS
 * Fournit des métriques et statistiques sur l'utilisation du CMS
 */

// GET - Récupérer les analytics
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

    // Seuls les admins peuvent voir les analytics
    if (decoded.role !== 'admin') {
      return NextResponse.json(
        { error: 'Accès réservé aux administrateurs' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '30'; // Jours
    const days = parseInt(timeRange);

    // Calculer la date de début
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // 1. VUE D'ENSEMBLE
    // ===================
    const totalLogs = await AuditLog.countDocuments({
      createdAt: { $gte: startDate }
    });

    const totalVersions = await ConfigVersion.countDocuments();

    const activeUsers = await AuditLog.distinct('userId', {
      createdAt: { $gte: startDate }
    });

    const criticalActions = await AuditLog.countDocuments({
      createdAt: { $gte: startDate },
      severity: { $in: ['warning', 'error', 'critical'] }
    });

    // 2. ACTIVITÉ PAR ACTION
    // ======================
    const actionBreakdown = await AuditLog.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $group: { _id: '$action', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // 3. ACTIVITÉ PAR RESOURCE
    // ========================
    const resourceBreakdown = await AuditLog.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $group: { _id: '$resource', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // 4. UTILISATEURS LES PLUS ACTIFS
    // ===============================
    const topUsers = await AuditLog.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: {
            userId: '$userId',
            userName: '$userName',
            userEmail: '$userEmail'
          },
          actions: { $sum: 1 },
          lastActivity: { $max: '$createdAt' }
        }
      },
      { $sort: { actions: -1 } },
      { $limit: 10 }
    ]);

    // 5. TIMELINE D'ACTIVITÉ (PAR JOUR)
    // =================================
    const activityTimeline = await AuditLog.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          count: { $sum: 1 },
          criticalCount: {
            $sum: {
              $cond: [
                { $in: ['$severity', ['warning', 'error', 'critical']] },
                1,
                0
              ]
            }
          }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    // 6. HEURES DE POINTE
    // ===================
    const peakHours = await AuditLog.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: { $hour: '$createdAt' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    // 7. SECTIONS DE CONFIG LES PLUS MODIFIÉES
    // ========================================
    const configSections = await ConfigVersion.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $unwind: '$changes' },
      {
        $group: {
          _id: {
            $arrayElemAt: [
              { $split: ['$changes.field', '.'] },
              0
            ]
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // 8. TENDANCES DE VERSIONING
    // ==========================
    const versioningTrends = await ConfigVersion.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          versions: { $sum: 1 },
          autoSaves: {
            $sum: {
              $cond: [{ $in: ['auto-save', '$tags'] }, 1, 0]
            }
          },
          manualSaves: {
            $sum: {
              $cond: [{ $in: ['manual', '$tags'] }, 1, 0]
            }
          },
          rollbacks: {
            $sum: {
              $cond: [{ $in: ['rollback', '$tags'] }, 1, 0]
            }
          }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    // 9. DISTRIBUTION PAR SÉVÉRITÉ
    // ============================
    const severityDistribution = await AuditLog.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $group: { _id: '$severity', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // 10. TAGS LES PLUS UTILISÉS
    // ==========================
    const topTags = await AuditLog.aggregate([
      { $match: { createdAt: { $gte: startDate }, tags: { $exists: true, $ne: [] } } },
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // 11. COMPARAISON PÉRIODE PRÉCÉDENTE
    // ==================================
    const previousStartDate = new Date(startDate);
    previousStartDate.setDate(previousStartDate.getDate() - days);

    const previousLogs = await AuditLog.countDocuments({
      createdAt: { $gte: previousStartDate, $lt: startDate }
    });

    const previousCritical = await AuditLog.countDocuments({
      createdAt: { $gte: previousStartDate, $lt: startDate },
      severity: { $in: ['warning', 'error', 'critical'] }
    });

    const previousUsers = await AuditLog.distinct('userId', {
      createdAt: { $gte: previousStartDate, $lt: startDate }
    });

    // Calculer les changements en pourcentage
    const logsChange = previousLogs > 0 
      ? ((totalLogs - previousLogs) / previousLogs * 100).toFixed(1)
      : 0;

    const usersChange = previousUsers.length > 0
      ? ((activeUsers.length - previousUsers.length) / previousUsers.length * 100).toFixed(1)
      : 0;

    const criticalChange = previousCritical > 0
      ? ((criticalActions - previousCritical) / previousCritical * 100).toFixed(1)
      : 0;

    return NextResponse.json({
      overview: {
        totalLogs,
        totalVersions,
        activeUsers: activeUsers.length,
        criticalActions,
        comparison: {
          logsChange: parseFloat(logsChange),
          usersChange: parseFloat(usersChange),
          criticalChange: parseFloat(criticalChange)
        }
      },
      actionBreakdown,
      resourceBreakdown,
      topUsers,
      activityTimeline,
      peakHours,
      configSections,
      versioningTrends,
      severityDistribution,
      topTags,
      timeRange: days
    }, { status: 200 });

  } catch (error) {
    console.error('Erreur récupération analytics:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des analytics' },
      { status: 500 }
    );
  }
}
