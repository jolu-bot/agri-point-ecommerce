/**
 * Script d'initialisation de la configuration du header
 * Ajoute les valeurs par défaut pour le header configuré dans le CMS
 */

import dbConnect from '../lib/db.js';
import SiteConfig from '../models/SiteConfig.js';

async function initHeaderConfig() {
  try {
    console.log('🔌 Connexion à MongoDB...');
    await dbConnect();

    console.log('📊 Recherche configuration active...');
    let config = await SiteConfig.findOne({ isActive: true });

    if (!config) {
      console.log('❌ Aucune configuration trouvée');
      return;
    }

    if (config.header && config.header.logo) {
      console.log('✅ Configuration du header déjà initialisée');
      return;
    }

    console.log('🔧 Ajout de la configuration du header...');

    // Ajouter la configuration du header par défaut
    config.header = {
      logo: {
        url: '/images/logo.svg',
        sizes: {
          mobile: 'w-11 h-11',
          tablet: 'w-13 h-13',
          desktop: 'w-15 h-15',
        },
      },
      primaryText: {
        content: 'AGRI POINT',
        sizes: {
          mobile: 'text-sm',
          tablet: 'text-lg',
          desktop: 'text-xl',
        },
        fontWeight: 'font-extrabold',
        color: 'text-gradient-primary',
      },
      secondaryText: {
        content: 'Service Agricole',
        sizes: {
          mobile: 'text-[10px]',
          tablet: 'text-xs',
          desktop: 'text-xs',
        },
        fontWeight: 'font-semibold',
        color: 'text-emerald-600',
      },
      height: {
        mobile: 'h-14',
        tablet: 'h-16',
        desktop: 'h-18',
      },
      spacing: 'gap-2',
    };

    // Ajouter la configuration des modules si elle n'existe pas
    if (!config.modules) {
      config.modules = {
        products: { 
          enabled: true,
          allowReviews: true,
          showStock: true,
        },
        orders: { 
          enabled: true,
          autoConfirmation: false,
          requireEmailVerification: true,
        },
        payments: {
          campost: true,
          mtnMomo: false,
          orangeMoney: false,
          notchPay: false,
          cineTPay: false,
          cash: true,
        },
        blog: { 
          enabled: false,
          allowComments: false,
        },
        campaigns: { 
          enabled: true,
          showCountdown: true,
        },
        urbanAgriculture: { 
          enabled: true,
          showCourses: false,
        },
      };
    }

    // Ajouter la configuration des permissions si elle n'existe pas
    if (!config.permissions) {
      config.permissions = {
        roles: [
          {
            name: 'admin',
            displayName: 'Administrateur',
            permissions: [
              { resource: 'all', actions: ['view', 'create', 'edit', 'delete', 'manage'] },
            ],
          },
          {
            name: 'manager',
            displayName: 'Manager',
            permissions: [
              { resource: 'products', actions: ['view', 'create', 'edit'] },
              { resource: 'orders', actions: ['view', 'edit', 'manage'] },
              { resource: 'users', actions: ['view'] },
            ],
          },
          {
            name: 'customer',
            displayName: 'Client',
            permissions: [
              { resource: 'products', actions: ['view'] },
              { resource: 'orders', actions: ['view', 'create'] },
            ],
          },
        ],
        defaultUserRole: 'customer',
      };
    }

    await config.save();

    console.log('✅ Configuration du header initialisée avec succès!');
    console.log('\n📋 Configuration ajoutée:');
    console.log('- Logo:', config.header.logo.url);
    console.log('- Texte principal:', config.header.primaryText.content);
    console.log('- Sous-titre:', config.header.secondaryText.content);
    console.log('- Modules configurés:', Object.keys(config.modules).length);
    console.log('- Rôles créés:', config.permissions.roles.length);

  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

initHeaderConfig();
