/**
 * Script d'initialisation de la base de données
 * Crée un admin, des produits de démonstration et des paramètres
 * 
 * Usage: node scripts/seed.js
 */

require('dotenv').config({ path: '.env.local' });
require('dotenv').config(); // fallback .env
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

      // ── BIOFERTILISANTS 1 litre ─────────────────────────────────
      {
        name: 'HUMIFORTE 1L',
        slug: 'humiforte',
        description: 'Fertilisant organique avec L-aminoacides libres (1 litre). Favorise le feuillage et la croissance végétative.',
        category: 'biofertilisant',
        images: ['/products/icon-feuillage.png'],
        price: 13500,
        stock: 50,
        isActive: true, isFeatured: true, isNew: false,
        features: {
          npk: '6-4-0.2',
          cultures: ['Agrumes', 'Fruits à noyaux', 'Horticulture', 'Fleurs', 'Ornement'],
          benefits: ['Favorise le feuillage', 'Améliore la croissance', 'Stimule la végétation'],
        },
        sku: 'HUM-1L-001', weight: 1,
      },
      {
        name: 'FOSNUTREN 1L',
        slug: 'fosnutren-20',
        description: 'Biostimulant pour la floraison et fructification (1 litre). Garantit une production abondante.',
        category: 'biofertilisant',
        images: ['/products/icon-floraison.png'],
        price: 13500,
        stock: 30,
        isActive: true, isFeatured: true, isNew: false,
        features: {
          npk: '4.2-6.5',
          cultures: ['Agrumes', 'Cultures pour graines', 'Fruits à noyaux', 'Papains'],
          benefits: ['Floraison abondante', 'Fructification optimale', 'Qualité des fruits améliorée'],
        },
        sku: 'FOS-1L-001', weight: 1,
      },
      {
        name: 'KADOSTIM 1L',
        slug: 'kadostim-20',
        description: 'Stimulant racinaire à base de potassium (1 litre). Renforce le système racinaire et la résistance.',
        category: 'biofertilisant',
        images: ['/products/icon-racines.png'],
        price: 13500,
        stock: 30,
        isActive: true, isFeatured: true, isNew: false,
        features: {
          npk: '0-0-20',
          cultures: ['Maïs', 'Manioc', 'Cacao', 'Café', 'Cultures maraîchères'],
          benefits: ['Renforce les racines', 'Résistance au stress hydrique', 'Augmente le rendement'],
        },
        sku: 'KAD-1L-001', weight: 1,
      },
      {
        name: 'AMINOL FORTE 1L',
        slug: 'aminol-20',
        description: 'Complexe d\'acides aminés et microéléments (1 litre). Stimule la croissance et le métabolisme des plantes.',
        category: 'biofertilisant',
        images: ['/products/icon-croissance.png'],
        price: 13500,
        stock: 30,
        isActive: true, isFeatured: true, isNew: false,
        features: {
          npk: '20-0-0',
          cultures: ['Tomates', 'Poivrons', 'Légumes-feuilles', 'Cultures fruitières'],
          benefits: ['Stimule la croissance', 'Améliore la qualité', 'Renforce l\'immunité des plantes'],
        },
        sku: 'AMI-1L-001', weight: 1,
      },

      // ── BIOFERTILISANTS 5 litres ─────────────────────────────────
      {
        name: 'HUMIFORTE 5L',
        slug: 'humiforte-5l',
        description: 'Fertilisant organique avec L-aminoacides libres (5 litres). Format économique pour grandes exploitations.',
        category: 'biofertilisant',
        images: ['/products/icon-feuillage.png'],
        price: 67500,
        stock: 20,
        isActive: true, isFeatured: false, isNew: false,
        features: {
          npk: '6-4-0.2',
          cultures: ['Agrumes', 'Fruits à noyaux', 'Horticulture', 'Fleurs', 'Ornement'],
          benefits: ['Favorise le feuillage', 'Améliore la croissance', 'Format économique 5L'],
        },
        sku: 'HUM-5L-001', weight: 5,
      },
      {
        name: 'FOSNUTREN 5L',
        slug: 'fosnutren-5l',
        description: 'Biostimulant pour la floraison et fructification (5 litres). Format économique pour grandes exploitations.',
        category: 'biofertilisant',
        images: ['/products/icon-floraison.png'],
        price: 67500,
        stock: 15,
        isActive: true, isFeatured: false, isNew: false,
        features: {
          npk: '4.2-6.5',
          cultures: ['Agrumes', 'Cultures pour graines', 'Fruits à noyaux', 'Papains'],
          benefits: ['Floraison abondante', 'Fructification optimale', 'Format économique 5L'],
        },
        sku: 'FOS-5L-001', weight: 5,
      },
      {
        name: 'KADOSTIM 5L',
        slug: 'kadostim-5l',
        description: 'Stimulant racinaire à base de potassium (5 litres). Format économique pour grandes exploitations.',
        category: 'biofertilisant',
        images: ['/products/icon-racines.png'],
        price: 67500,
        stock: 15,
        isActive: true, isFeatured: false, isNew: false,
        features: {
          npk: '0-0-20',
          cultures: ['Maïs', 'Manioc', 'Cacao', 'Café', 'Cultures maraîchères'],
          benefits: ['Renforce les racines', 'Résistance au stress hydrique', 'Format économique 5L'],
        },
        sku: 'KAD-5L-001', weight: 5,
      },
      {
        name: 'AMINOL FORTE 5L',
        slug: 'aminol-5l',
        description: 'Complexe d\'acides aminés et microéléments (5 litres). Format économique pour grandes exploitations.',
        category: 'biofertilisant',
        images: ['/products/icon-croissance.png'],
        price: 67500,
        stock: 15,
        isActive: true, isFeatured: false, isNew: false,
        features: {
          npk: '20-0-0',
          cultures: ['Tomates', 'Poivrons', 'Légumes-feuilles', 'Cultures fruitières'],
          benefits: ['Stimule la croissance', 'Améliore la qualité', 'Format économique 5L'],
        },
        sku: 'AMI-5L-001', weight: 5,
      },

      // ── KIT ──────────────────────────────────────────────────────
      {
        name: 'KIT NATURCARE 5L',
        slug: 'natur-care',
        description: 'Kit complet de biofertilisants AGRI POINT (5 litres). Assortiment complet pour une nutrition optimale de toutes vos cultures.',
        category: 'biofertilisant',
        images: ['/products/product-naturcare-terra.png'],
        price: 65000,
        stock: 10,
        isActive: true, isFeatured: true, isNew: false,
        features: {
          composition: 'Assortiment complet biofertilisants AGRI POINT SERVICES SARL',
          cultures: ['Toutes cultures'],
          benefits: ['Solution complète tout-en-un', 'Économique vs achats séparés', 'Convient à toutes les cultures'],
        },
        sku: 'NAT-KIT-001', weight: 5,
      },

      // ── ENGRAIS MINÉRAUX 50 kg ───────────────────────────────────
      {
        name: 'URÉE 46% 50kg',
        slug: 'uree-46',
        description: 'Engrais azoté Urée 46% (50 kg). Apport d\'azote à libération rapide pour stimuler la croissance végétative.',
        category: 'engrais_mineral',
        images: ['/products/product-uree-46.png'],
        price: 22000,
        stock: 40,
        isActive: true, isFeatured: true, isNew: false,
        features: {
          npk: '46-0-0',
          cultures: ['Maïs', 'Riz', 'Cacao', 'Café', 'Bananier', 'Légumes-feuilles'],
          benefits: ['Stimule la croissance', 'Augmente les rendements', 'Azote à libération rapide'],
        },
        sku: 'URE-50KG-001', weight: 50,
      },
      {
        name: 'NPK 20-10-10 50kg',
        slug: 'sarah-npk-20-10-10',
        description: 'Engrais complet NPK 20-10-10 (50 kg). Formulation équilibrée pour une nutrition complète et des rendements élevés.',
        category: 'engrais_mineral',
        images: ['/products/product-sarah-npk-20-10-10.png'],
        price: 19500,
        stock: 35,
        isActive: true, isFeatured: false, isNew: false,
        features: {
          npk: '20-10-10',
          cultures: ['Maïs', 'Riz', 'Coton', 'Légumes', 'Cultures maraîchères'],
          benefits: ['Nutrition N-P-K équilibrée', 'Favorise la croissance', 'Améliore les rendements'],
        },
        sku: 'NPK-20-10-10-001', weight: 50,
      },
      {
        name: 'NPK 00-00-36 50kg',
        slug: 'npk-00-00-36',
        description: 'Engrais potassique NPK 00-00-36 (50 kg). Renforce la résistance aux maladies et améliore la qualité des récoltes.',
        category: 'engrais_mineral',
        images: ['/products/icon-engrais.png'],
        price: 20500,
        stock: 25,
        isActive: true, isFeatured: false, isNew: false,
        features: {
          npk: '0-0-36',
          cultures: ['Bananier', 'Tubercules', 'Légumes', 'Café', 'Cacao'],
          benefits: ['Renforce la résistance aux maladies', 'Améliore la qualité des fruits', 'Régule la pression osmotique'],
        },
        sku: 'NPK-00-00-36-001', weight: 50,
      },
      {
        name: 'NPK 12-14-19 50kg',
        slug: 'npk-12-14-19',
        description: 'Engrais complet NPK 12-14-19 (50 kg). Riche en phosphore et potassium pour favoriser la floraison et la fructification.',
        category: 'engrais_mineral',
        images: ['/products/icon-engrais.png'],
        price: 23000,
        stock: 20,
        isActive: true, isFeatured: false, isNew: false,
        features: {
          npk: '12-14-19',
          cultures: ['Palmier à huile', 'Cacao', 'Café', 'Cultures fruitières', 'Légumes-fruits'],
          benefits: ['Favorise la floraison', 'Améliore la fructification', 'Renforce la qualité des fruits'],
        },
        sku: 'NPK-12-14-19-001', weight: 50,
      },
      {
        name: 'NPK 6-8-28 50kg',
        slug: 'npk-6-8-28',
        description: 'Engrais riche en potassium NPK 6-8-28 (50 kg). Idéal pour la maturation et la qualité des récoltes.',
        category: 'engrais_mineral',
        images: ['/products/icon-engrais.png'],
        price: 22000,
        stock: 20,
        isActive: true, isFeatured: false, isNew: false,
        features: {
          npk: '6-8-28',
          cultures: ['Banane', 'Plantain', 'Tubercules', 'Cultures fruitières'],
          benefits: ['Améliore la maturation', 'Renforce la qualité des récoltes', 'Résistance au stress'],
        },
        sku: 'NPK-6-8-28-001', weight: 50,
      },
      {
        name: 'SULFATE d\'Ammonium 50kg',
        slug: 'sulfate-50kg',
        description: 'Sulfate d\'ammonium (50 kg). Engrais azoté et soufré, idéal pour les cultures exigeantes en azote sur sols alcalins.',
        category: 'engrais_mineral',
        images: ['/products/icon-engrais.png'],
        price: 17500,
        stock: 30,
        isActive: true, isFeatured: false, isNew: false,
        features: {
          npk: '21-0-0',
          composition: 'Sulfate d\'ammonium (NH₄)₂SO₄ — 21% N + 24% S',
          cultures: ['Thé', 'Riz', 'Maïs', 'Légumes maraîchers', 'Oignons'],
          benefits: ['Apport combiné azote + soufre', 'Acidifie légèrement le sol', 'Améliore l\'absorption des nutriments'],
        },
        sku: 'SULF-50KG-001', weight: 50,
      },

      // ── ENGRAIS MINÉRAUX 25 kg ───────────────────────────────────
      {
        name: 'URÉE 46% 25kg',
        slug: 'uree-46-25kg',
        description: 'Engrais azoté Urée 46% (25 kg). Format réduit pour petites exploitations, jardins et maraîchage.',
        category: 'engrais_mineral',
        images: ['/products/product-uree-46.png'],
        price: 11000,
        stock: 50,
        isActive: true, isFeatured: false, isNew: false,
        features: {
          npk: '46-0-0',
          cultures: ['Maïs', 'Légumes', 'Jardin potager', 'Cultures maraîchères'],
          benefits: ['Format pratique 25kg', 'Stimule la croissance', 'Azote à libération rapide'],
        },
        sku: 'URE-25KG-001', weight: 25,
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
