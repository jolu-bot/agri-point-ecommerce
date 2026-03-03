#!/usr/bin/env node

/**
 * Script de mise à jour des prix produits
 * Basé sur la grille tarifaire officielle AGRI POINT SERVICE
 * 
 * ⚠️ Ne touche PAS aux produits campagne (engrais-mineral-15000, engrais-mineral-nk-20-10-10,
 *    biofertilisant-10000, biofertilisant-compost)
 * 
 * Usage: node scripts/update-product-prices.js
 */

require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/agripoint';

const productSchema = new mongoose.Schema({
  name: String,
  slug: String,
  price: Number,
  promoPrice: Number,
  category: String,
}, { timestamps: true, strict: false });

const Product = mongoose.model('Product', productSchema);

// Grille tarifaire officielle (FCFA)
const PRICE_GRID = [
  { slug: 'humiforte',          name: 'HUMIFORTE',          newPrice: 13500 },
  { slug: 'fosnutren-20',       name: 'FOSNUTREN 20',       newPrice: 13500 },
  { slug: 'kadostim-20',        name: 'KADOSTIM 20',        newPrice: 13500 },
  { slug: 'aminol-20',          name: 'AMINOL 20',          newPrice: 13500 },
  { slug: 'natur-care',         name: 'NATUR CARE',         newPrice: 65000 },
  { slug: 'sarah-npk-20-10-10', name: 'SARAH NPK 20-10-10', newPrice: 19500 },
  { slug: 'uree-46',            name: 'URÉE 46%',           newPrice: 22000 },
];

// Slugs des produits campagne — NE PAS TOUCHER
const CAMPAIGN_SLUGS = [
  'engrais-mineral-15000',
  'engrais-mineral-nk-20-10-10',
  'biofertilisant-10000',
  'biofertilisant-compost',
];

async function updatePrices() {
  try {
    console.log('🔗 Connexion à MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connecté\n');

    console.log('📊 GRILLE TARIFAIRE OFFICIELLE');
    console.log('═'.repeat(60));

    let updated = 0;
    let unchanged = 0;
    let notFound = 0;

    for (const item of PRICE_GRID) {
      // Vérifier que ce n'est pas un produit campagne
      if (CAMPAIGN_SLUGS.includes(item.slug)) {
        console.log(`⏭️  ${item.name} — Produit campagne, ignoré`);
        continue;
      }

      const product = await Product.findOne({ slug: item.slug });

      if (!product) {
        console.log(`❌ ${item.name} (${item.slug}) — Non trouvé en base`);
        notFound++;
        continue;
      }

      const oldPrice = product.price;

      if (oldPrice === item.newPrice) {
        console.log(`✓  ${item.name} — ${item.newPrice.toLocaleString('fr-FR')} FCFA (déjà à jour)`);
        unchanged++;
        continue;
      }

      // Mettre à jour le prix
      await Product.updateOne(
        { slug: item.slug },
        { 
          $set: { price: item.newPrice },
          // Supprimer le promoPrice s'il existe et est >= nouveau prix
          ...(product.promoPrice && product.promoPrice >= item.newPrice
            ? { $unset: { promoPrice: '' } }
            : {})
        }
      );

      // Si promoPrice existe et >= newPrice, le supprimer dans un 2e update
      if (product.promoPrice && product.promoPrice >= item.newPrice) {
        await Product.updateOne(
          { slug: item.slug },
          { $unset: { promoPrice: '' } }
        );
      }

      const diff = item.newPrice - oldPrice;
      const arrow = diff > 0 ? '↑' : '↓';
      console.log(`✅ ${item.name} — ${oldPrice.toLocaleString('fr-FR')} → ${item.newPrice.toLocaleString('fr-FR')} FCFA (${arrow} ${Math.abs(diff).toLocaleString('fr-FR')})`);
      updated++;
    }

    console.log('\n' + '═'.repeat(60));
    console.log('📋 RÉSUMÉ:');
    console.log(`   ✅ Mis à jour : ${updated}`);
    console.log(`   ✓  Déjà à jour : ${unchanged}`);
    console.log(`   ❌ Non trouvés : ${notFound}`);
    console.log(`   ⏭️  Campagne ignorés : ${CAMPAIGN_SLUGS.length}`);

    // Vérification finale
    console.log('\n📦 VÉRIFICATION — Tous les produits actuels:');
    console.log('─'.repeat(60));
    const allProducts = await Product.find({}).sort({ category: 1, name: 1 });
    for (const p of allProducts) {
      const isCampaign = CAMPAIGN_SLUGS.includes(p.slug);
      const tag = isCampaign ? ' [CAMPAGNE]' : '';
      console.log(`   ${p.name} — ${p.price?.toLocaleString('fr-FR')} FCFA${tag}`);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

updatePrices();
