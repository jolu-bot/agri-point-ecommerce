import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import SiteConfig from '@/models/SiteConfig';

// GET - Récupérer la configuration du site
export async function GET() {
  try {
    await dbConnect();
    
    let config = await SiteConfig.findOne({ isActive: true });
    
    // Si aucune config n'existe, créer une par défaut
    if (!config) {
      config = await SiteConfig.create({
        isActive: true,
        navigation: {
          menuItems: [
            { name: 'Accueil', href: '/', order: 1 },
            { name: 'Boutique', href: '/produits', order: 2 },
            { 
              name: 'Nos Solutions', 
              href: '#', 
              order: 3,
              submenu: [
                { name: 'Produire Plus', href: '/produire-plus' },
                { name: 'Gagner Plus', href: '/gagner-plus' },
                { name: 'Mieux Vivre', href: '/mieux-vivre' },
              ]
            },
            { name: 'Agriculture Urbaine', href: '/agriculture-urbaine', order: 4 },
            { name: 'À propos', href: '/a-propos', order: 5 },
            { name: 'Contact', href: '/contact', order: 6 },
          ]
        },
        homePage: {
          hero: {
            cta: {
              primary: { text: 'Découvrir nos produits', link: '/produits' },
              secondary: { text: 'Agriculture Urbaine', link: '/agriculture-urbaine' },
            }
          },
          stats: [
            { value: '20K+', label: 'Hectares', order: 1 },
            { value: '10K+', label: 'Agriculteurs', order: 2 },
            { value: '100%', label: 'Bio', order: 3 },
          ],
        },
        seo: {
          keywords: ['biofertilisant', 'agriculture', 'Cameroun', 'engrais', 'agriculture urbaine', 'AGRI POINT'],
        },
      });
    }
    
    return NextResponse.json(config, { status: 200 });
  } catch (error) {
    console.error('Erreur récupération configuration:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de la configuration' },
      { status: 500 }
    );
  }
}

// PUT - Mettre à jour la configuration
export async function PUT(request: NextRequest) {
  try {
    await dbConnect();
    
    const body = await request.json();
    
    // Désactiver toutes les configs existantes
    await SiteConfig.updateMany({}, { isActive: false });
    
    // Créer ou mettre à jour la config active
    let config = await SiteConfig.findOne({ isActive: true });
    
    if (config) {
      config = await SiteConfig.findByIdAndUpdate(
        config._id,
        { ...body, isActive: true },
        { new: true, runValidators: true }
      );
    } else {
      config = await SiteConfig.create({ ...body, isActive: true });
    }
    
    return NextResponse.json({
      message: 'Configuration mise à jour avec succès',
      config
    }, { status: 200 });
  } catch (error) {
    console.error('Erreur mise à jour configuration:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de la configuration' },
      { status: 500 }
    );
  }
}

// POST - Créer une nouvelle version de configuration
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const body = await request.json();
    
    // Désactiver toutes les configs
    await SiteConfig.updateMany({}, { isActive: false });
    
    // Créer nouvelle config active
    const config = await SiteConfig.create({ ...body, isActive: true });
    
    return NextResponse.json({
      message: 'Nouvelle configuration créée avec succès',
      config
    }, { status: 201 });
  } catch (error) {
    console.error('Erreur création configuration:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création de la configuration' },
      { status: 500 }
    );
  }
}

// PATCH - Mise à jour partielle de la configuration
export async function PATCH(request: NextRequest) {
  try {
    await dbConnect();
    
    const body = await request.json();
    
    // Récupérer la config active avant modification
    const oldConfig = await SiteConfig.findOne({ isActive: true }).lean();
    
    // Récupérer la config active
    let config = await SiteConfig.findOne({ isActive: true });
    
   if (!config) {
      // Créer une nouvelle config si elle n'existe pas
      config = await SiteConfig.create({ ...body, isActive: true });
    } else {
      // Sauvegarder snapshot AVANT modification (auto-versioning)
      const ConfigVersion = (await import('@/models/ConfigVersion')).default;
      const lastVersion = await ConfigVersion.findOne().sort({ version: -1 }).lean();
      
      // Calculer les changements
      const changes: any[] = [];
      Object.keys(body).forEach(key => {
        if (JSON.stringify(body[key]) !== JSON.stringify(oldConfig?.[key])) {
          changes.push({
            field: key,
            oldValue: oldConfig?.[key],
            newValue: body[key],
          });
        }
      });
      
      // Créer version automatique
      await ConfigVersion.create({
        version: (lastVersion?.version || 0) + 1,
        config: oldConfig,
        changedBy: {
          userId: 'system',
          userName: 'Auto-Save',
          userEmail: 'system@agri-ps.com',
        },
        changes,
        description: `Sauvegarde automatique avant modification`,
        tags: ['auto-save'],
      });
      
      // Mise à jour partielle avec merge
      config = await SiteConfig.findByIdAndUpdate(
        config._id,
        { $set: body },
        { new: true, runValidators: true }
      );
    }
    
    return NextResponse.json({
      message: 'Configuration mise à jour avec succès',
      config
    }, { status: 200 });
  } catch (error) {
    console.error('Erreur mise à jour partielle configuration:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de la configuration' },
      { status: 500 }
    );
  }
}
