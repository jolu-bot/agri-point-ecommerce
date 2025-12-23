/**
 * DIAGNOSTIC DES IMAGES
 * Vérifie tous les aspects liés aux images des produits
 */

const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://agrips:REDACTED_PASSWORD_CHANGE_ON_ATLAS@cluster0.r4qjqcs.mongodb.net/agripoint?retryWrites=true&w=majority&appName=Cluster0';

async function diagnoseImages() {
  console.log('╔════════════════════════════════════════════════╗');
  console.log('║     DIAGNOSTIC DES IMAGES PRODUITS            ║');
  console.log('╚════════════════════════════════════════════════╝\n');

  // 1. Vérifier le dossier public/products
  console.log('1️⃣  VÉRIFICATION DU DOSSIER PUBLIC/PRODUCTS\n');
  const publicDir = path.join(__dirname, '..', 'public', 'products');
  
  if (!fs.existsSync(publicDir)) {
    console.log('❌ Le dossier public/products n\'existe pas !');
    return;
  }
  
  const files = fs.readdirSync(publicDir);
  console.log(`✅ ${files.length} fichier(s) trouvé(s)\n`);
  
  files.forEach(file => {
    const filePath = path.join(publicDir, file);
    const stats = fs.statSync(filePath);
    const sizeKB = (stats.size / 1024).toFixed(2);
    console.log(`  ✓ ${file} (${sizeKB} KB)`);
  });

  // 2. Vérifier la base de données
  console.log('\n2️⃣  VÉRIFICATION DE LA BASE DE DONNÉES\n');
  
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connecté à MongoDB Atlas\n');

    const db = mongoose.connection.db;
    const products = await db.collection('products').find({}).toArray();

    console.log(`📦 ${products.length} produit(s) dans la base\n`);

    const issues = [];

    for (const product of products) {
      console.log(`📦 ${product.name}`);
      console.log(`   Slug: ${product.slug}`);
      console.log(`   Images: ${JSON.stringify(product.images)}`);
      
      if (!product.images || product.images.length === 0) {
        console.log('   ⚠️  PROBLÈME: Aucune image définie');
        issues.push({ product: product.name, issue: 'Aucune image' });
      } else {
        const imagePath = product.images[0];
        const localPath = path.join(__dirname, '..', 'public', imagePath);
        
        if (fs.existsSync(localPath)) {
          console.log('   ✅ Image existe localement');
        } else {
          console.log('   ❌ PROBLÈME: Image n\'existe pas localement');
          console.log(`      Chemin: ${localPath}`);
          issues.push({ product: product.name, issue: 'Image manquante', path: imagePath });
        }
      }
      console.log('');
    }

    // 3. Résumé des problèmes
    console.log('3️⃣  RÉSUMÉ DES PROBLÈMES\n');
    
    if (issues.length === 0) {
      console.log('✅ AUCUN PROBLÈME DÉTECTÉ !');
      console.log('   Toutes les images sont correctement configurées.\n');
      console.log('📋 SOLUTIONS POSSIBLES:');
      console.log('   1. Redémarrer le serveur Next.js (npm run dev)');
      console.log('   2. Vider le cache Next.js: rm -rf .next');
      console.log('   3. Vérifier la console du navigateur (F12) pour les erreurs');
      console.log('   4. Tester avec unoptimized: true dans next.config.js');
    } else {
      console.log(`❌ ${issues.length} problème(s) détecté(s):\n`);
      issues.forEach((issue, i) => {
        console.log(`${i + 1}. ${issue.product}`);
        console.log(`   Problème: ${issue.issue}`);
        if (issue.path) console.log(`   Chemin: ${issue.path}`);
        console.log('');
      });
    }

    await mongoose.disconnect();
    console.log('🔌 Déconnecté de MongoDB\n');

  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

diagnoseImages();
