#!/usr/bin/env node

/**
 * scripts/sync-catalog.js
 *
 * Synchronisation complète du catalogue AGRI POINT SERVICE SARL
 * Source : Grille tarifaire officielle (FCFA) — mars 2026
 *
 * Ce script :
 *   - Met à jour le nom + prix des produits existants (par slug)
 *   - Insère les produits manquants (nouveaux formats + nouvelles références)
 *   - Ne touche JAMAIS aux produits campagne
 *
 * Usage : node scripts/sync-catalog.js
 */

require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/agripoint';

const ProductSchema = new mongoose.Schema({
  name: String, slug: String, description: String, category: String,
  images: [String], price: Number, promoPrice: Number, stock: Number,
  isActive: Boolean, isFeatured: Boolean, isNew: Boolean,
  features: {
    npk: String, composition: String, dosage: String,
    cultures: [String], benefits: [String], applications: [String],
  },
  sku: String, weight: Number,
}, { timestamps: true, strict: false });

const Product = mongoose.model('Product', ProductSchema);

// Slugs campagne — intouchables
const CAMPAIGN_SLUGS = [
  'engrais-mineral-15000',
  'engrais-mineral-nk-20-10-10',
  'biofertilisant-10000',
  'biofertilisant-compost',
];

/**
 * Catalogue officiel AGRI POINT SERVICE SARL
 * Chaque entrée sert à la fois de mise à jour (si le slug existe)
 * et de données de création (si le slug n'existe pas encore).
 */
const CATALOG = [

  // ═══════════════════════════════════════════════════════════════
  // BIOFERTILISANTS — 1 litre
  // ═══════════════════════════════════════════════════════════════
  {
    slug:        'humiforte',
    name:        'HUMIFORTE 1L',
    price:       13500,
    category:    'biofertilisant',
    description: 'Fertilisant organique avec L-aminoacides libres (1 litre). Favorise le feuillage et la croissance végétative.',
    features: {
      npk:      '6-4-0.2',
      cultures: ['Agrumes', 'Fruits à noyaux', 'Horticulture', 'Fleurs', 'Ornement'],
      benefits: ['Favorise le feuillage', 'Améliore la croissance', 'Stimule la végétation'],
    },
    images:     ['/products/icon-feuillage.png'],
    sku:        'HUM-1L-001',
    weight:     1,
    isActive:   true,
    isFeatured: true,
    isNew:      false,
    stock:      50,
  },
  {
    slug:        'fosnutren-20',
    name:        'FOSNUTREN 1L',
    price:       13500,
    category:    'biofertilisant',
    description: 'Biostimulant pour la floraison et fructification (1 litre). Garantit une production abondante.',
    features: {
      npk:      '4.2-6.5',
      cultures: ['Agrumes', 'Cultures pour graines', 'Fruits à noyaux', 'Papains'],
      benefits: ['Floraison abondante', 'Fructification optimale', 'Qualité des fruits améliorée'],
    },
    images:     ['/products/icon-floraison.png'],
    sku:        'FOS-1L-001',
    weight:     1,
    isActive:   true,
    isFeatured: true,
    isNew:      false,
    stock:      30,
  },
  {
    slug:        'kadostim-20',
    name:        'KADOSTIM 1L',
    price:       13500,
    category:    'biofertilisant',
    description: 'Stimulant racinaire à base de potassium (1 litre). Renforce le système racinaire et la résistance.',
    features: {
      npk:      '0-0-20',
      cultures: ['Maïs', 'Manioc', 'Cacao', 'Café', 'Cultures maraîchères'],
      benefits: ['Renforce les racines', 'Résistance au stress hydrique', 'Augmente le rendement'],
    },
    images:     ['/products/icon-racines.png'],
    sku:        'KAD-1L-001',
    weight:     1,
    isActive:   true,
    isFeatured: true,
    isNew:      false,
    stock:      30,
  },
  {
    slug:        'aminol-20',
    name:        'AMINOL FORTE 1L',
    price:       13500,
    category:    'biofertilisant',
    description: 'Complexe d\'acides aminés et microéléments (1 litre). Stimule la croissance et le métabolisme des plantes.',
    features: {
      npk:      '20-0-0',
      cultures: ['Tomates', 'Poivrons', 'Légumes-feuilles', 'Cultures fruitières'],
      benefits: ['Stimule la croissance', 'Améliore la qualité', 'Renforce l\'immunité des plantes'],
    },
    images:     ['/products/icon-croissance.png'],
    sku:        'AMI-1L-001',
    weight:     1,
    isActive:   true,
    isFeatured: true,
    isNew:      false,
    stock:      30,
  },

  // ═══════════════════════════════════════════════════════════════
  // BIOFERTILISANTS — 5 litres (formats éco)
  // ═══════════════════════════════════════════════════════════════
  {
    slug:        'humiforte-5l',
    name:        'HUMIFORTE 5L',
    price:       67500,
    category:    'biofertilisant',
    description: 'Fertilisant organique avec L-aminoacides libres (5 litres). Format économique pour grandes exploitations.',
    features: {
      npk:      '6-4-0.2',
      cultures: ['Agrumes', 'Fruits à noyaux', 'Horticulture', 'Fleurs', 'Ornement'],
      benefits: ['Favorise le feuillage', 'Améliore la croissance', 'Format économique 5L'],
    },
    images:     ['/products/icon-feuillage.png'],
    sku:        'HUM-5L-001',
    weight:     5,
    isActive:   true,
    isFeatured: false,
    isNew:      false,
    stock:      20,
  },
  {
    slug:        'fosnutren-5l',
    name:        'FOSNUTREN 5L',
    price:       67500,
    category:    'biofertilisant',
    description: 'Biostimulant pour la floraison et fructification (5 litres). Format économique pour grandes exploitations.',
    features: {
      npk:      '4.2-6.5',
      cultures: ['Agrumes', 'Cultures pour graines', 'Fruits à noyaux', 'Papains'],
      benefits: ['Floraison abondante', 'Fructification optimale', 'Format économique 5L'],
    },
    images:     ['/products/icon-floraison.png'],
    sku:        'FOS-5L-001',
    weight:     5,
    isActive:   true,
    isFeatured: false,
    isNew:      false,
    stock:      15,
  },
  {
    slug:        'kadostim-5l',
    name:        'KADOSTIM 5L',
    price:       67500,
    category:    'biofertilisant',
    description: 'Stimulant racinaire à base de potassium (5 litres). Format économique pour grandes exploitations.',
    features: {
      npk:      '0-0-20',
      cultures: ['Maïs', 'Manioc', 'Cacao', 'Café', 'Cultures maraîchères'],
      benefits: ['Renforce les racines', 'Résistance au stress hydrique', 'Format économique 5L'],
    },
    images:     ['/products/icon-racines.png'],
    sku:        'KAD-5L-001',
    weight:     5,
    isActive:   true,
    isFeatured: false,
    isNew:      false,
    stock:      15,
  },
  {
    slug:        'aminol-5l',
    name:        'AMINOL FORTE 5L',
    price:       67500,
    category:    'biofertilisant',
    description: 'Complexe d\'acides aminés et microéléments (5 litres). Format économique pour grandes exploitations.',
    features: {
      npk:      '20-0-0',
      cultures: ['Tomates', 'Poivrons', 'Légumes-feuilles', 'Cultures fruitières'],
      benefits: ['Stimule la croissance', 'Améliore la qualité', 'Format économique 5L'],
    },
    images:     ['/products/icon-croissance.png'],
    sku:        'AMI-5L-001',
    weight:     5,
    isActive:   true,
    isFeatured: false,
    isNew:      false,
    stock:      15,
  },

  // ═══════════════════════════════════════════════════════════════
  // KIT
  // ═══════════════════════════════════════════════════════════════
  {
    slug:        'natur-care',
    name:        'KIT NATURCARE',
    price:       65000,
    category:    'biofertilisant',
    description: 'Kit complet de biofertilisants AGRI POINT (5 litres). Assortiment complet pour une nutrition optimale de toutes vos cultures.',
    features: {
      composition: 'Assortiment complet biofertilisants AGRI POINT SERVICE SARL',
      cultures:    ['Toutes cultures'],
      benefits:    ['Solution complète tout-en-un', 'Économique vs achats séparés', 'Convient à toutes les cultures'],
    },
    images:     ['/products/icon-kit.png'],
    sku:        'NAT-KIT-001',
    weight:     5,
    isActive:   true,
    isFeatured: true,
    isNew:      false,
    stock:      10,
  },

  // ═══════════════════════════════════════════════════════════════
  // ENGRAIS MINÉRAUX — 50 kg
  // ═══════════════════════════════════════════════════════════════
  {
    slug:        'uree-46',
    name:        'URÉE 46%',
    price:       22000,
    category:    'engrais_mineral',
    description: 'Engrais azoté Urée 46% (50 kg). Apport d\'azote à libération rapide pour stimuler la croissance végétative.',
    features: {
      npk:      '46-0-0',
      cultures: ['Maïs', 'Riz', 'Cacao', 'Café', 'Bananier', 'Légumes-feuilles'],
      benefits: ['Stimule la croissance', 'Augmente les rendements', 'Azote à libération rapide'],
    },
    images:     ['/products/icon-engrais.png'],
    sku:        'URE-50KG-001',
    weight:     50,
    isActive:   true,
    isFeatured: true,
    isNew:      false,
    stock:      40,
  },
  {
    slug:        'sarah-npk-20-10-10',
    name:        'NPK 20-10-10',
    price:       19500,
    category:    'engrais_mineral',
    description: 'Engrais complet NPK 20-10-10 (50 kg). Formulation équilibrée pour une nutrition complète et des rendements élevés.',
    features: {
      npk:      '20-10-10',
      cultures: ['Maïs', 'Riz', 'Coton', 'Légumes', 'Cultures maraîchères'],
      benefits: ['Nutrition N-P-K équilibrée', 'Favorise la croissance', 'Améliore les rendements'],
    },
    images:     ['/products/icon-engrais.png'],
    sku:        'NPK-20-10-10-001',
    weight:     50,
    isActive:   true,
    isFeatured: false,
    isNew:      false,
    stock:      35,
  },
  {
    slug:        'npk-00-00-36',
    name:        'NPK 00-00-36',
    price:       20500,
    category:    'engrais_mineral',
    description: 'Engrais potassique NPK 00-00-36 (50 kg). Renforce la résistance aux maladies et améliore la qualité des récoltes.',
    features: {
      npk:      '0-0-36',
      cultures: ['Bananier', 'Tubercules', 'Légumes', 'Café', 'Cacao'],
      benefits: ['Renforce la résistance aux maladies', 'Améliore la qualité des fruits', 'Régule la pression osmotique'],
    },
    images:     ['/products/icon-engrais.png'],
    sku:        'NPK-00-00-36-001',
    weight:     50,
    isActive:   true,
    isFeatured: false,
    isNew:      false,
    stock:      25,
  },
  {
    slug:        'npk-12-14-19',
    name:        'NPK 12-14-19',
    price:       23000,
    category:    'engrais_mineral',
    description: 'Engrais complet NPK 12-14-19 (50 kg). Riche en phosphore et potassium pour favoriser la floraison et la fructification.',
    features: {
      npk:      '12-14-19',
      cultures: ['Palmier à huile', 'Cacao', 'Café', 'Cultures fruitières', 'Légumes-fruits'],
      benefits: ['Favorise la floraison', 'Améliore la fructification', 'Renforce la qualité des fruits'],
    },
    images:     ['/products/icon-engrais.png'],
    sku:        'NPK-12-14-19-001',
    weight:     50,
    isActive:   true,
    isFeatured: false,
    isNew:      false,
    stock:      20,
  },
  {
    slug:        'npk-6-8-28',
    name:        'NPK 6-8-28',
    price:       22000,
    category:    'engrais_mineral',
    description: 'Engrais riche en potassium NPK 6-8-28 (50 kg). Idéal pour la maturation et la qualité des récoltes.',
    features: {
      npk:      '6-8-28',
      cultures: ['Banane', 'Plantain', 'Tubercules', 'Cultures fruitières'],
      benefits: ['Améliore la maturation', 'Renforce la qualité des récoltes', 'Résistance au stress'],
    },
    images:     ['/products/icon-engrais.png'],
    sku:        'NPK-6-8-28-001',
    weight:     50,
    isActive:   true,
    isFeatured: false,
    isNew:      false,
    stock:      20,
  },
  {
    slug:        'sulfate-50kg',
    name:        'SULFATE 50kg',
    price:       17500,
    category:    'engrais_mineral',
    description: 'Sulfate d\'ammonium (50 kg). Engrais azoté et soufré, idéal pour les cultures exigeantes en azote sur sols alcalins.',
    features: {
      npk:         '21-0-0',
      composition: 'Sulfate d\'ammonium (NH₄)₂SO₄ — 21% N + 24% S',
      cultures:    ['Thé', 'Riz', 'Maïs', 'Légumes maraîchers', 'Oignons'],
      benefits:    ['Apport combiné azote + soufre', 'Acidifie légèrement le sol', 'Améliore l\'absorption des nutriments'],
    },
    images:     ['/products/icon-engrais.png'],
    sku:        'SULF-50KG-001',
    weight:     50,
    isActive:   true,
    isFeatured: false,
    isNew:      false,
    stock:      30,
  },

  // ═══════════════════════════════════════════════════════════════
  // ENGRAIS MINÉRAUX — 25 kg
  // ═══════════════════════════════════════════════════════════════
  {
    slug:        'uree-46-25kg',
    name:        'URÉE 46% 25kg',
    price:       11000,
    category:    'engrais_mineral',
    description: 'Engrais azoté Urée 46% (25 kg). Format réduit pour petites exploitations, jardins et maraîchage.',
    features: {
      npk:      '46-0-0',
      cultures: ['Maïs', 'Légumes', 'Jardin potager', 'Cultures maraîchères'],
      benefits: ['Format pratique 25kg', 'Stimule la croissance', 'Azote à libération rapide'],
    },
    images:     ['/products/icon-engrais.png'],
    sku:        'URE-25KG-001',
    weight:     25,
    isActive:   true,
    isFeatured: false,
    isNew:      false,
    stock:      50,
  },
];

// ─────────────────────────────────────────────────────────────────
async function syncCatalog() {
  try {
    console.log('🔗 Connexion à MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connecté\n');

    console.log('📦 SYNCHRONISATION CATALOGUE OFFICIEL — AGRI POINT SERVICE SARL');
    console.log('═'.repeat(65));

    let inserted  = 0;
    let updated   = 0;
    let unchanged = 0;

    for (const item of CATALOG) {
      const existing = await Product.findOne({ slug: item.slug });

      if (!existing) {
        await Product.create(item);
        console.log(`➕ [NOUVEAU]    ${item.name.padEnd(22)} ${String(item.price.toLocaleString('fr-FR')).padStart(8)} FCFA`);
        inserted++;
        continue;
      }

      // Déterminer ce qui change
      const priceChanged = existing.price !== item.price;
      const nameChanged  = existing.name  !== item.name;

      const setFields = { price: item.price, name: item.name };
      const unsetFields = {};

      // Éliminer un promoPrice devenu invalide (>= prix officiel)
      if (existing.promoPrice != null && existing.promoPrice >= item.price) {
        unsetFields.promoPrice = '';
      }

      const updateOp = { $set: setFields };
      if (Object.keys(unsetFields).length) updateOp.$unset = unsetFields;

      await Product.updateOne({ slug: item.slug }, updateOp);

      if (priceChanged || nameChanged) {
        const priceLog = priceChanged
          ? `${existing.price?.toLocaleString('fr-FR')} → ${item.price.toLocaleString('fr-FR')} FCFA`
          : `${item.price.toLocaleString('fr-FR')} FCFA (prix inchangé)`;
        const nameLog = nameChanged ? ` | nom: "${existing.name}" → "${item.name}"` : '';
        console.log(`✅ [MIS À JOUR] ${item.name.padEnd(22)} ${priceLog}${nameLog}`);
        updated++;
      } else {
        console.log(`✓  [OK]        ${item.name.padEnd(22)} ${String(item.price.toLocaleString('fr-FR')).padStart(8)} FCFA`);
        unchanged++;
      }
    }

    // Résumé
    console.log('\n' + '═'.repeat(65));
    console.log('📋 RÉSUMÉ:');
    console.log(`   ➕ Nouveaux insérés  : ${inserted}`);
    console.log(`   ✅ Mis à jour        : ${updated}`);
    console.log(`   ✓  Déjà à jour       : ${unchanged}`);
    console.log(`   📦 Total traités     : ${CATALOG.length}`);

    // Vérification finale : tous les produits en base
    console.log('\n📊 CATALOGUE COMPLET EN BASE:');
    console.log('─'.repeat(65));
    const all = await Product.find({}).sort({ category: 1, price: 1 });
    let lastCat = '';
    for (const p of all) {
      if (p.category !== lastCat) {
        console.log(`\n  ── ${(p.category || 'autre').toUpperCase()} ──`);
        lastCat = p.category;
      }
      const isCampaign = CAMPAIGN_SLUGS.includes(p.slug);
      const tag  = isCampaign ? ' [CAMPAGNE]' : '';
      const unit = p.weight ? ` (${p.weight}${p.category === 'biofertilisant' ? 'L' : 'kg'})` : '';
      console.log(`     ${p.name.padEnd(28)}${unit.padEnd(8)} ${String(p.price?.toLocaleString('fr-FR')).padStart(8)} FCFA${tag}`);
    }

    await mongoose.disconnect();
    console.log('\n✅ Synchronisation terminée.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Erreur:', err.message);
    process.exit(1);
  }
}

syncCatalog();
