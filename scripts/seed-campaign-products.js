#!/usr/bin/env node

/**
 * Script de seed pour les produits campagne
 * Crée les produits engrais minéraux et biofertilisants
 */

require('dotenv').config();
const mongoose = require('mongoose');

// Schémas
const productSchema = new mongoose.Schema({
  name: String,
  slug: String,
  description: String,
  category: String,
  price: Number,
  promoPrice: Number,
  stock: Number,
  isActive: Boolean,
  isFeatured: Boolean,
  sku: String,
  images: [String],
  createdAt: Date,
  updatedAt: Date,
});

const campaignSchema = new mongoose.Schema({
  name: String,
  slug: String,
  products: [mongoose.Schema.Types.ObjectId],
});

const Product = mongoose.model('Product', productSchema);
const Campaign = mongoose.model('Campaign', campaignSchema);

async function seedCampaignProducts() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/agri-point');
    console.log('✅ Connecté à MongoDB\n');

    // Créer les produits engrais
    const products = [
      {
        name: 'Engrais Minéral NPK 15,000 FCFA',
        slug: 'engrais-mineral-15000',
        description: 'Sac d\'engrais minéral 50kg - NPK équilibré.',
        category: 'engrais_mineral',
        price: 15000,
        stock: 1000,
        isActive: true,
        isFeatured: true,
        sku: 'ENGmet-50KG-001',
        images: ['/images/fallback-product.svg'],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Engrais Minéral NPK 20-10-10',
        slug: 'engrais-mineral-nk-20-10-10',
        description: 'Engrais minéral de haute qualité NPK 20-10-10, 50kg. Haute concentration d\'azote pour croissance rapide.',
        category: 'engrais_mineral',
        price: 15000,
        stock: 500,
        isActive: true,
        isFeatured: true,
        sku: 'ENGmet-NPK20-002',
        images: ['/images/fallback-product.svg'],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Biofertilisant 10,000 FCFA',
        slug: 'biofertilisant-10000',
        description: 'Biofertilisant 5L - 100% naturel. Enrichit le sol et améliore la structure. Paiement échelonné 70/30.',
        category: 'biofertilisant',
        price: 10000,
        stock: 800,
        isActive: true,
        isFeatured: true,
        sku: 'BIO-5L-001',
        images: ['/images/fallback-product.svg'],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Biofertilisant Compost Matricé',
        slug: 'biofertilisant-compost',
        description: 'Biofertilisant à base de compost matricé, 5L. Améliore la rétention d\'eau et l\'activité biologique du sol.',
        category: 'biofertilisant',
        price: 10000,
        stock: 600,
        isActive: true,
        isFeatured: true,
        sku: 'BIO-COMPOST-002',
        images: ['/images/fallback-product.svg'],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    // Vérifier si les produits existent déjà
    console.log('📦 Création des produits...\n');

    const createdProducts = [];

    for (const productData of products) {
      const existing = await Product.findOne({ slug: productData.slug });

      if (existing) {
        console.log(`ℹ️  ${productData.name} (existing)`);
        createdProducts.push(existing._id);
      } else {
        const product = new Product(productData);
        await product.save();
        createdProducts.push(product._id);
        console.log(`✅ ${productData.name}`);
      }
    }

    // Lier les produits à la campagne
    console.log('\n📌 Liaison des produits à la campagne...');

    const campaign = await Campaign.findOne({ slug: 'engrais-mars-2026' });

    if (campaign) {
      campaign.products = createdProducts;
      await campaign.save();
      console.log(`✅ ${createdProducts.length} produits liés à la campagne`);
    } else {
      console.log('⚠️  Campagne non trouvée - exécuter: npm run seed:campaign');
    }

    // Afficher le résumé
    console.log('\n📊 RÉSUMÉ:');
    console.log('═'.repeat(60));
    console.log(`✅ Engrais minéraux créés: 2`);
    console.log(`✅ Biofertilisants créés: 2`);
    console.log(`✅ Total produits: ${createdProducts.length}`);
    console.log(`✅ Campagne mise à jour\n`);

    console.log('🎯 Prochaines étapes:');
    console.log('  1. npm run dev          # Démarrer dev server');
    console.log('  2. Aller à /campagne-engrais');
    console.log('  3. Tester le formulaire d\'éligibilité\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

seedCampaignProducts();
