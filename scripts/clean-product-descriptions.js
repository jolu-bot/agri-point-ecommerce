#!/usr/bin/env node

/**
 * Script de nettoyage des descriptions de produits
 * Supprime les textes problématiques comme "substention gouvernementale", "Organique"
 */

require('dotenv').config();
const mongoose = require('mongoose');

async function cleanProductDescriptions() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/agri-point');
    console.log('✅ Connecté à MongoDB\n');

    const db = mongoose.connection.db;
    const productsCollection = db.collection('products');

    // Patterns à nettoyer
    const cleanupPatterns = [
      { pattern: /Idéal pour toutes les cultures\.\s*Subvention gouvernementale disponible\.?/gi, replacement: '' },
      { pattern: /substention gouvernementale/gi, replacement: '' },
      { pattern: /Subvention gouvernementale/gi, replacement: '' },
      { pattern: /\bOrganique\b/g, replacement: '' },
      { pattern: /Biofertilisant Organique/gi, replacement: 'Biofertilisant' },
      { pattern: /\s+/g, replacement: ' ' }, // Nettoyer espaces multiples
    ];

    // Récupérer tous les produits
    const products = await productsCollection.find({}).toArray();
    console.log(`📦 ${products.length} produits trouvés\n`);

    let cleaned = 0;

    for (const product of products) {
      let originalDesc = product.description || '';
      let cleanedDesc = originalDesc;

      // Appliquer chaque pattern de nettoyage
      for (const { pattern, replacement } of cleanupPatterns) {
        const before = cleanedDesc;
        cleanedDesc = cleanedDesc.replace(pattern, replacement);
        if (before !== cleanedDesc) {
          console.log(`🧹 [${product.name}] Pattern trouvé et nettoyé`);
        }
      }

      // Trim
      cleanedDesc = cleanedDesc.trim();

      // Mettre à jour si la description a changé
      if (originalDesc !== cleanedDesc) {
        await productsCollection.updateOne(
          { _id: product._id },
          { $set: { description: cleanedDesc, updatedAt: new Date() } }
        );
        cleaned++;
        console.log(`✅ Mise à jour: "${product.name}"\n   Avant: ${originalDesc.substring(0, 80)}...\n   Après: ${cleanedDesc.substring(0, 80)}...\n`);
      }
    }

    console.log(`\n✨ ${cleaned} produits nettoyés avec succès!`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

cleanProductDescriptions();
