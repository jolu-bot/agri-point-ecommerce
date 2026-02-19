import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import ConfigVersion from '@/models/ConfigVersion';
import SiteConfig from '@/models/SiteConfig';
import { verifyAccessToken } from '@/lib/auth';

/**
 * API de gestion des versions de configuration
 * Support: Historique, Rollback, Comparaison, Export
 */

// GET - Récupérer l'historique des versions
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('accessToken')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const decoded = verifyAccessToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = parseInt(searchParams.get('skip') || '0');
    const userId = searchParams.get('userId');

    const query = userId ? { 'changedBy.userId': userId } : {};

    const versions = await ConfigVersion.find(query)
      .sort({ version: -1, createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .lean();

    const total = await ConfigVersion.countDocuments(query);

    return NextResponse.json({
      versions,
      total,
      page: Math.floor(skip / limit) + 1,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Erreur récupération versions:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des versions' },
      { status: 500 }
    );
  }
}

// POST - Créer une nouvelle version (snapshot)
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('accessToken')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const decoded = verifyAccessToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    await dbConnect();

    const body = await request.json();
    const { config, changes, description, tags, userName, userEmail } = body;

    // Récupérer le dernier numéro de version
    const lastVersion = await ConfigVersion.findOne().sort({ version: -1 }).lean();
    const newVersionNumber = (lastVersion?.version || 0) + 1;

    // Créer la nouvelle version
    const newVersion = await ConfigVersion.create({
      version: newVersionNumber,
      config,
      changedBy: {
        userId: decoded.userId,
        userName: userName || decoded.name || 'Admin',
        userEmail: userEmail || decoded.email || '',
      },
      changes: changes || [],
      description,
      tags: tags || ['auto-save'],
    });

    // Garder seulement les 50 dernières versions (cleanup automatique)
    const oldVersions = await ConfigVersion.find()
      .sort({ version: -1 })
      .skip(50)
      .select('_id');

    if (oldVersions.length > 0) {
      await ConfigVersion.deleteMany({
        _id: { $in: oldVersions.map(v => v._id) }
      });
    }

    return NextResponse.json({
      message: 'Version créée avec succès',
      version: newVersion,
    }, { status: 201 });
  } catch (error) {
    console.error('Erreur création version:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création de la version' },
      { status: 500 }
    );
  }
}

// PUT - Restaurer une version (rollback)
export async function PUT(request: NextRequest) {
  try {
    const token = request.cookies.get('accessToken')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const decoded = verifyAccessToken(token);
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    await dbConnect();

    const body = await request.json();
    const { versionId } = body;

    // Récupérer la version à restaurer
    const versionToRestore = await ConfigVersion.findById(versionId);
    if (!versionToRestore) {
      return NextResponse.json({ error: 'Version introuvable' }, { status: 404 });
    }

    // Créer un snapshot de la config actuelle avant restauration
    const currentConfig = await SiteConfig.findOne({ isActive: true });
    if (currentConfig) {
      const lastVersion = await ConfigVersion.findOne().sort({ version: -1 }).lean();
      await ConfigVersion.create({
        version: (lastVersion?.version || 0) + 1,
        config: currentConfig.toObject(),
        changedBy: {
          userId: decoded.userId,
          userName: decoded.name || 'Admin',
          userEmail: decoded.email || '',
        },
        changes: [],
        description: `Snapshot avant restauration vers v${versionToRestore.version}`,
        tags: ['pre-rollback', 'auto-save'],
      });
    }

    // Restaurer la configuration
    const restoredConfig = await SiteConfig.findOneAndUpdate(
      { isActive: true },
      { $set: versionToRestore.config },
      { new: true, upsert: true }
    );

    // Créer une entrée de restauration
    const lastVersion = await ConfigVersion.findOne().sort({ version: -1 }).lean();
    await ConfigVersion.create({
      version: (lastVersion?.version || 0) + 1,
      config: restoredConfig.toObject(),
      changedBy: {
        userId: decoded.userId,
        userName: decoded.name || 'Admin',
        userEmail: decoded.email || '',
      },
      changes: [{
        field: 'all',
        oldValue: 'current',
        newValue: `v${versionToRestore.version}`,
      }],
      description: `Restauration vers version ${versionToRestore.version}`,
      tags: ['rollback', 'manual'],
      restoredFrom: versionId,
    });

    return NextResponse.json({
      message: 'Configuration restaurée avec succès',
      config: restoredConfig,
      restoredVersion: versionToRestore.version,
    });
  } catch (error) {
    console.error('Erreur restauration version:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la restauration' },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer une version spécifique
export async function DELETE(request: NextRequest) {
  try {
    const token = request.cookies.get('accessToken')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const decoded = verifyAccessToken(token);
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const versionId = searchParams.get('versionId');

    if (!versionId) {
      return NextResponse.json({ error: 'ID version requis' }, { status: 400 });
    }

    await ConfigVersion.findByIdAndDelete(versionId);

    return NextResponse.json({
      message: 'Version supprimée avec succès',
    });
  } catch (error) {
    console.error('Erreur suppression version:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression' },
      { status: 500 }
    );
  }
}
