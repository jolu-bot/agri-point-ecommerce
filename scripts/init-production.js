/**
 * Script d'initialisation de la base de données de production
 * 
 * Ce script crée :
 * 1. Un compte administrateur par défaut
 * 2. La configuration initiale du site (SiteConfig)
 * 3. Les collections nécessaires
 * 
 * Usage: node scripts/init-production.js
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Charger les variables d'environnement
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ ERREUR: MONGODB_URI non défini dans .env.local');
  process.exit(1);
}

// Schéma User simplifié
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: String,
  isActive: Boolean,
  createdAt: { type: Date, default: Date.now }
});

// Schéma SiteConfig complet
const siteConfigSchema = new mongoose.Schema({
  isActive: { type: Boolean, default: true },
  branding: {
    siteName: { type: String, default: 'AGRI POINT SERVICE' },
    tagline: { type: String, default: 'Le partenaire sûr de l\'entrepreneur agricole' },
    logoUrl: { type: String, default: '/images/logo.png' },
    faviconUrl: { type: String, default: '/favicon.ico' },
  },
  colors: {
    primary: { type: String, default: '#1B5E20' },
    primaryLight: { type: String, default: '#4caf50' },
    secondary: { type: String, default: '#B71C1C' },
    secondaryLight: { type: String, default: '#f44336' },
    accent: { type: String, default: '#57534e' },
    background: { type: String, default: '#ffffff' },
    text: { type: String, default: '#1f2937' },
  },
  navigation: {
    menuItems: [{
      name: String,
      href: String,
      order: Number,
      submenu: [{
        name: String,
        href: String
      }]
    }]
  },
  homePage: {
    hero: {
      cta: {
        primary: { text: String, link: String },
        secondary: { text: String, link: String },
      }
    },
    stats: [{
      value: String,
      label: String,
      order: Number
    }]
  },
  seo: {
    keywords: [String]
  }
});

const User = mongoose.models.User || mongoose.model('User', userSchema);
const SiteConfig = mongoose.models.SiteConfig || mongoose.model('SiteConfig', siteConfigSchema);

async function initProduction() {
  try {
    console.log('🔄 Connexion à MongoDB...');
    console.log('📍 URI:', MONGODB_URI.replace(/:[^:]*@/, ':****@')); // Masquer le mot de passe
    
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connecté à MongoDB');

    // 1. Vérifier si un admin existe déjà
    const existingAdmin = await User.findOne({ role: 'admin' });
    
    if (existingAdmin) {
      console.log('⚠️  Un compte admin existe déjà:', existingAdmin.email);
    } else {
      // Créer le compte admin
      const adminEmail = process.env.ADMIN_EMAIL || 'admin@agri-ps.com';
      const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
      
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      
      const admin = await User.create({
        name: 'Administrateur',
        email: adminEmail,
        password: hashedPassword,
        role: 'admin',
        isActive: true
      });
      
      console.log('✅ Compte admin créé:');
      console.log('   📧 Email:', admin.email);
      console.log('   🔑 Mot de passe:', adminPassword);
      console.log('   ⚠️  CHANGEZ CE MOT DE PASSE après première connexion !');
    }

    // 2. Créer la configuration du site
    const existingConfig = await SiteConfig.findOne({ isActive: true });
    
    if (existingConfig) {
      console.log('⚠️  Une configuration existe déjà');
    } else {
      await SiteConfig.create({
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
      
      console.log('✅ Configuration du site créée');
    }

    // 3. Afficher les statistiques
    const userCount = await User.countDocuments();
    const configCount = await SiteConfig.countDocuments();
    
    console.log('\n📊 STATISTIQUES DE LA BASE DE DONNÉES:');
    console.log('   👥 Utilisateurs:', userCount);
    console.log('   ⚙️  Configurations:', configCount);
    
    console.log('\n✅ Initialisation terminée avec succès !');
    console.log('\n🚀 Vous pouvez maintenant:');
    console.log('   1. Vous connecter avec le compte admin');
    console.log('   2. Accéder au panneau admin');
    console.log('   3. Créer d\'autres produits et utilisateurs');
    
  } catch (error) {
    console.error('❌ ERREUR lors de l\'initialisation:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Déconnecté de MongoDB');
  }
}

// Exécuter le script
initProduction();
