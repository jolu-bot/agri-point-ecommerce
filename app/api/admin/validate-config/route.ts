import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/auth';
import { validateSiteConfig } from '@/lib/config-validator';

/**
 * API de Validation Intelligente
 * Valide les configurations avant sauvegarde
 */

// POST - Valider une configuration
export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const decoded = await verifyAccessToken(request);
    if (!decoded) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { config } = body;

    if (!config) {
      return NextResponse.json(
        { error: 'Configuration requise' },
        { status: 400 }
      );
    }

    // Valider la configuration
    const validation = await validateSiteConfig(config);

    return NextResponse.json({
      ...validation,
      message: validation.valid
        ? 'Configuration valide'
        : `${validation.errors.length} erreur(s) trouvée(s)`
    }, { status: 200 });

  } catch (error) {
    console.error('Erreur validation configuration:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la validation' },
      { status: 500 }
    );
  }
}
