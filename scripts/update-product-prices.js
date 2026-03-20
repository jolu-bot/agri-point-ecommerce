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

require('dotenv').config({ path: '.env.local' });
require('dotenv').config(); // fallback .env
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

// Grille tarifaire officielle (FCFA) — mars 2026
const PRICE_GRID = [
  // Biofertilisants 1L
  { slug: 'humiforte',          name: 'HUMIFORTE 1L',            newPrice: 13500 },
  { slug: 'fosnutren-20',       name: 'FOSNUTREN 1L',            newPrice: 13500 },
  { slug: 'kadostim-20',        name: 'KADOSTIM 1L',             newPrice: 13500 },
  { slug: 'aminol-20',          name: 'AMINOL FORTE 1L',         newPrice: 13500 },
  // Biofertilisants 5L
  { slug: 'humiforte-5l',       name: 'HUMIFORTE 5L',            newPrice: 67500 },
  { slug: 'fosnutren-5l',       name: 'FOSNUTREN 5L',            newPrice: 67500 },
  { slug: 'kadostim-5l',        name: 'KADOSTIM 5L',             newPrice: 67500 },
  { slug: 'aminol-5l',          name: 'AMINOL FORTE 5L',         newPrice: 67500 },
  // Kit
  { slug: 'natur-care',         name: 'KIT NATURCARE 5L',        newPrice: 65000 },
  // Engrais minéraux 50kg
  { slug: 'uree-46',            name: 'SARAH URÉE 46% 50kg',          newPrice: 22000 },
  { slug: 'sarah-npk-20-10-10', name: 'SARAH NPK 20-10-10 50kg',      newPrice: 19500 },
  { slug: 'npk-00-00-36',       name: 'SARAH NPK 00-00-36 50kg',      newPrice: 20500 },
  { slug: 'npk-12-14-19',       name: 'SARAH NPK 12-14-19 50kg',      newPrice: 23000 },
  { slug: 'npk-6-8-28',         name: 'SARAH NPK 6-8-28 50kg',        newPrice: 22000 },
  { slug: 'sulfate-50kg',       name: 'SARAH Sulfate 50kg',           newPrice: 17500 },
  // Engrais minéraux 25kg
  { slug: 'uree-46-25kg',       name: 'SARAH Urée 46% 25kg',          newPrice: 11000 },
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

      if (oldPrice === item.newPrice && product.name === item.name) {
        console.log(`✓  ${item.name} — ${item.newPrice.toLocaleString('fr-FR')} FCFA (déjà à jour)`);
        unchanged++;
        continue;
      }

      // Mettre à jour le prix et le nom
      await Product.updateOne(
        { slug: item.slug },
        {
          $set: { price: item.newPrice, name: item.name },
          // Supprimer le promoPrice s'il existe et est >= nouveau prix
          ...(product.promoPrice && product.promoPrice >= item.newPrice
            ? { $unset: { promoPrice: '' } }
            : {})
        }
      );

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
