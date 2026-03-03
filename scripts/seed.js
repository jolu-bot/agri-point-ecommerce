/**
 * Script d'initialisation de la base de données
 * Crée un admin, des produits de démonstration et des paramètres
 * 
 * Usage: node scripts/seed.js
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Configuration MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/agripoint';

// Schémas simplifiés pour le seed
const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: String,
  permissions: [String],
  isActive: Boolean,
}, { timestamps: true });

const ProductSchema = new mongoose.Schema({
  name: String,
  slug: String,
  description: String,
  category: String,
  images: [String],
  price: Number,
  promoPrice: Number,
  stock: Number,
  isActive: Boolean,
  isFeatured: Boolean,
  isNew: Boolean,
  features: {
    npk: String,
    composition: String,
    cultures: [String],
    benefits: [String],
  },
  sku: String,
}, { timestamps: true });

const SettingsSchema = new mongoose.Schema({
  siteName: String,
  contact: {
    email: String,
    phone: String,
    whatsapp: String,
  },
}, { timestamps: true });

async function seed() {
  try {
    console.log('🌱 Connexion à MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connecté à MongoDB');

    const User = mongoose.model('User', UserSchema);
    const Product = mongoose.model('Product', ProductSchema);
    const Settings = mongoose.model('Settings', SettingsSchema);

    // Nettoyer les données existantes
    console.log('\n🧹 Nettoyage des données existantes...');
    await User.deleteMany({});
    await Product.deleteMany({});
    await Settings.deleteMany({});

    // Créer un admin
    console.log('\n👤 Création du compte administrateur...');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const admin = await User.create({
      name: 'Admin AGRI POINT',
      email: 'admin@agri-ps.com',
      password: hashedPassword,
      role: 'admin',
      permissions: ['*'],
      isActive: true,
    });
    console.log('✅ Admin créé: admin@agri-ps.com / admin123');

    // Créer des produits
    console.log('\n📦 Création des produits...');
    const products = [
      {
        name: 'HUMIFORTE',
        slug: 'humiforte',
        description: 'Fertilisant NPK avec L-aminoacides libres. Favorise le feuillage et la croissance.',
        category: 'biofertilisant',
        images: ['/products/icon-feuillage.png'],
        price: 13500,
        stock: 50,
        isActive: true,
        isFeatured: true,
        isNew: false,
        features: {
          npk: '6-4-0.2',
          cultures: ['Agrumes', 'Fruits à noyaux', 'Horticulture', 'Fleurs', 'Ornement'],
          benefits: ['Favorise le feuillage', 'Améliore la croissance'],
        },
        sku: 'HUM-001',
      },
      {
        name: 'FOSNUTREN 20',
        slug: 'fosnutren-20',
        description: 'Biostimulant pour la floraison. Garantit une floraison et fructification abondante.',
        category: 'biofertilisant',
        images: ['/products/icon-floraison.png'],
        price: 13500,
        stock: 30,
        isActive: true,
        isFeatured: true,
        isNew: true,
        features: {
          npk: '4.2-6.5',
          cultures: ['Agrumes', 'Culture pour graines', 'Fruits à noyaux', 'Papins'],
          benefits: ['Floraison abondante', 'Fructification optimale'],
        },
        sku: 'FOS-001',
      },
      {
        name: 'KADOSTIM 20',
        slug: 'kadostim-20',
        description: 'Biostimulant pour maturation du fruit. Assure la croissance et qualité des fruits.',
        category: 'biofertilisant',
        images: ['/products/icon-croissance-fruits.png'],
        price: 13500,
        stock: 45,
        isActive: true,
        isFeatured: true,
        isNew: false,
        features: {
          cultures: ['Agrumes', 'Fruits à noyaux', 'Cultures horticoles'],
          benefits: ['Maturation optimale', 'Qualité supérieure des fruits'],
        },
        sku: 'KAD-001',
      },
      {
        name: 'AMINOL 20',
        slug: 'aminol-20',
        description: 'Bio stimulant riche en aminoacides libres à absorption immédiate.',
        category: 'biofertilisant',
        images: ['/products/icon-anti-stress.png'],
        price: 13500,
        stock: 40,
        isActive: true,
        isFeatured: true,
        isNew: false,
        features: {
          cultures: ['Cacao', 'Café', 'Poivre'],
          benefits: ['Anti-stress', 'Absorption immédiate', 'Résistance aux maladies'],
        },
        sku: 'AMI-001',
      },
      {
        name: 'NATUR CARE',
        slug: 'natur-care',
        description: 'Engrais organique liquide NPK à haute concentration de bioactivateurs.',
        category: 'biofertilisant',
        images: ['/products/product-naturcare-terra.png'],
        price: 65000,
        stock: 35,
        isActive: true,
        isFeatured: true,
        isNew: true,
        features: {
          cultures: ['Toutes cultures'],
          benefits: ['Restauration des sols', 'Amélioration structure du sol'],
        },
        sku: 'NAT-001',
      },
      {
        name: 'SARAH NPK 20-10-10',
        slug: 'sarah-npk-20-10-10',
        description: 'Engrais minéral NPK haute qualité pour toutes cultures.',
        category: 'engrais_mineral',
        images: ['/products/product-sarah-npk-20-10-10.png'],
        price: 19500,
        stock: 100,
        isActive: true,
        isFeatured: false,
        isNew: false,
        features: {
          npk: '20-10-10',
          cultures: ['Toutes cultures'],
        },
        sku: 'SAR-NPK-001',
      },
      {
        name: 'URÉE 46%',
        slug: 'uree-46',
        description: 'Engrais azoté haute concentration pour boost de croissance.',
        category: 'engrais_mineral',
        images: ['/products/product-uree-46.png'],
        price: 22000,
        stock: 80,
        isActive: true,
        isFeatured: false,
        isNew: false,
        features: {
          npk: '46-0-0',
          cultures: ['Céréales', 'Maraîchage'],
        },
        sku: 'URE-001',
      },
      {
        name: 'Kit Agriculture Urbaine Débutant',
        slug: 'kit-urbain-debutant',
        description: 'Kit complet pour démarrer votre potager urbain sur balcon ou terrasse.',
        category: 'kit_urbain',
        images: ['/products/kit-urbain.jpg'],
        price: 35000,
        stock: 25,
        isActive: true,
        isFeatured: true,
        isNew: true,
        features: {
          cultures: ['Tomates cerises', 'Herbes aromatiques', 'Laitues'],
          benefits: ['Kit complet', 'Guide inclus', 'Support AgriBot'],
        },
        sku: 'KIT-URB-001',
      },
    ];

    await Product.insertMany(products);
    console.log(`✅ ${products.length} produits créés`);

    // Créer les paramètres
    console.log('\n⚙️ Création des paramètres du site...');
    await Settings.create({
      siteName: 'AGRI POINT SERVICE',
      contact: {
        email: 'infos@agri-ps.com',
        phone: '+237 657 39 39 39',
        whatsapp: '657393939',
      },
    });
    console.log('✅ Paramètres créés');

    console.log('\n✨ Initialisation terminée avec succès !');
    console.log('\n📋 Résumé:');
    console.log(`   - Admin: admin@agri-ps.com (mot de passe: admin123)`);
    console.log(`   - Produits: ${products.length}`);
    console.log('\n🚀 Vous pouvez maintenant démarrer le serveur avec: npm run dev');

  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Déconnecté de MongoDB');
    process.exit(0);
  }
}

// Exécuter le seed
seed();
