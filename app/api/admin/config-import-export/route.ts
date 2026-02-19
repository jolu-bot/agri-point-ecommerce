import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import SiteConfig from '@/models/SiteConfig';
import ConfigVersion from '@/models/ConfigVersion';
import { verifyAccessToken } from '@/lib/auth';

/**
 * API Import/Export de configurations
 * Permet de sauvegarder et restaurer des configurations entre environnements
 */

// GET - Exporter la configuration actuelle
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
    const format = searchParams.get('format') || 'json';
    const includeVersions = searchParams.get('includeVersions') === 'true';

    const config = await SiteConfig.findOne({ isActive: true }).lean();
    
    if (!config) {
      return NextResponse.json({ error: 'Configuration introuvable' }, { status: 404 });
    }

    const exportData: any = {
      config: config,
      exportedAt: new Date().toISOString(),
      exportedBy: {
        userId: decoded.userId,
        userName: decoded.name || 'Admin',
        userEmail: decoded.email || '',
      },
      version: '1.0.0',
    };

    if (includeVersions) {
      const versions = await ConfigVersion.find()
        .sort({ version: -1 })
        .limit(10)
        .lean();
      exportData.versions = versions;
    }

    if (format === 'json') {
      // Export JSON avec formatage
      const jsonStr = JSON.stringify(exportData, null, 2);
      
      return new NextResponse(jsonStr, {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="agri-point-config-${Date.now()}.json"`,
        },
      });
    } else {
      // Format par défaut - retour JSON simple
      return NextResponse.json(exportData);
    }
  } catch (error) {
    console.error('Erreur export configuration:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'export' },
      { status: 500 }
    );
  }
}

// POST - Importer une configuration
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('accessToken')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const decoded = verifyAccessToken(token);
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Accès refusé (admin requis)' }, { status: 403 });
    }

    await dbConnect();

    const body = await request.json();
    const { config, overwrite = false, validateOnly = false } = body;

    if (!config) {
      return NextResponse.json({ error: 'Configuration manquante' }, { status: 400 });
    }

    // Validation de la structure
    const validationErrors: string[] = [];
    
    if (!config.branding || !config.branding.siteName) {
      validationErrors.push('Branding - siteName manquant');
    }
    
    if (!config.colors || !config.colors.primary) {
      validationErrors.push('Colors - primary manquant');
    }

    if (validationErrors.length > 0 && !validateOnly) {
      return NextResponse.json({
        error: 'Configuration invalide',
        validationErrors,
      }, { status: 400 });
    }

    if (validateOnly) {
      return NextResponse.json({
        valid: validationErrors.length === 0,
        errors: validationErrors,
        message: validationErrors.length === 0 
          ? 'Configuration valide' 
          : 'Configuration invalide',
      });
    }

    // Sauvegarder la config actuelle avant import
    const currentConfig = await SiteConfig.findOne({ isActive: true });
    if (currentConfig && overwrite) {
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
        description: 'Snapshot avant import de configuration',
        tags: ['pre-import', 'auto-save'],
      });
    }

    // Importer la nouvelle configuration
    let importedConfig;
    if (overwrite) {
      // Remplacer complètement
      await SiteConfig.updateMany({}, { isActive: false });
      importedConfig = await SiteConfig.create({
        ...config,
        _id: undefined, // Nouveau document
        isActive: true,
      });
    } else {
      // Merge avec existante
      importedConfig = await SiteConfig.findOneAndUpdate(
        { isActive: true },
        { $set: config },
        { new: true, upsert: true }
      );
    }

    // Créer version de l'import
    const lastVersion = await ConfigVersion.findOne().sort({ version: -1 }).lean();
    await ConfigVersion.create({
      version: (lastVersion?.version || 0) + 1,
      config: importedConfig.toObject(),
      changedBy: {
        userId: decoded.userId,
        userName: decoded.name || 'Admin',
        userEmail: decoded.email || '',
      },
      changes: [{
        field: 'all',
        oldValue: 'previous config',
        newValue: 'imported config',
      }],
      description: `Import de configuration (${overwrite ? 'overwrite' : 'merge'})`,
      tags: ['import', 'manual'],
    });

    return NextResponse.json({
      message: 'Configuration importée avec succès',
      config: importedConfig,
      overwrite,
    }, { status: 200 });
  } catch (error) {
    console.error('Erreur import configuration:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'import' },
      { status: 500 }
    );
  }
}
