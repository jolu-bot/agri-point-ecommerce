/**
 * Script de correction des extensions d'images
 * Corrige .jpg en .svg ou .png selon ce qui existe
 */

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const MONGODB_URI = 'mongodb+srv://agrips:sMCoHcL2Xg7rtnOU@cluster0.r4qjqcs.mongodb.net/agripoint?retryWrites=true&w=majority&appName=Cluster0';

// Mapping des fichiers existants
const imageFiles = {
  'humiforte': 'humiforte.svg',
  'fosnutren': 'fosnutren.svg',
  'kadostim': 'kadostim.svg',
  'aminol': 'aminol.svg',
  'naturcare': 'product-naturcare-terra.png',
  'sarah-npk-20-10-10': 'product-sarah-npk-20-10-10.png',
  'sarah-npk-12-14-10': 'product-sarah-npk-12-14-10.png',
  'uree-46': 'product-uree-46.png',
  'uree': 'product-uree-sac-blanc.png'
};

const productSchema = new mongoose.Schema({}, { strict: false });
const Product = mongoose.model('Product', productSchema);

async function fixImageExtensions() {
  try {
    console.log('🔄 Connexion à MongoDB Atlas...\n');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connecté\n');

    const products = await Product.find({});
    console.log(`📦 ${products.length} produit(s)\n`);

    let updatedCount = 0;

    for (const product of products) {
      let hasChanges = false;
      console.log(`\n🔍 ${product.name}`);

      // Corriger images principales
      if (product.images && Array.isArray(product.images)) {
        const newImages = product.images.map(img => {
          if (!img) return img;
          
          // Extraire le nom de base
          const basename = img.replace('/products/', '').replace(/\.(jpg|png|svg)$/, '').toLowerCase();
          
          // Chercher la correspondance
          for (const [key, file] of Object.entries(imageFiles)) {
            if (basename.includes(key) || key.includes(basename)) {
              const newPath = `/products/${file}`;
              if (newPath !== img) {
                console.log(`  ❌ ${img}`);
                console.log(`  ✅ ${newPath}`);
                hasChanges = true;
                return newPath;
              }
              break;
            }
          }
          return img;
        });
        product.images = newImages;
      }

      // Corriger variants
      if (product.variants && Array.isArray(product.variants)) {
        product.variants.forEach((variant) => {
          if (variant.images && Array.isArray(variant.images)) {
            const newVariantImages = variant.images.map(img => {
              if (!img) return img;
              
              const basename = img.replace('/products/', '').replace(/\.(jpg|png|svg)$/, '').toLowerCase();
              
              for (const [key, file] of Object.entries(imageFiles)) {
                if (basename.includes(key) || key.includes(basename)) {
                  const newPath = `/products/${file}`;
                  if (newPath !== img) {
                    hasChanges = true;
                    return newPath;
                  }
                  break;
                }
              }
              return img;
            });
            variant.images = newVariantImages;
          }
        });
      }

      if (hasChanges) {
        await product.save();
        updatedCount++;
        console.log(`  💾 MIS À JOUR`);
      } else {
        console.log(`  ✓ OK`);
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log('🎉 TERMINÉ !');
    console.log(`✅ ${updatedCount} produit(s) corrigé(s)`);
    console.log('='.repeat(50));

    // Afficher les résultats
    const updated = await Product.find({}).limit(10);
    console.log('\n📋 Résultats:\n');
    updated.forEach(p => {
      console.log(`📦 ${p.name}`);
      if (p.images && p.images.length > 0) {
        p.images.forEach(img => console.log(`   ✓ ${img}`));
      }
    });

  } catch (error) {
    console.error('\n❌ ERREUR:', error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Déconnecté');
  }
}

console.log('╔════════════════════════════════════════════════╗');
console.log('║  CORRECTION DES EXTENSIONS D\'IMAGES          ║');
console.log('╚════════════════════════════════════════════════╝\n');

fixImageExtensions()
  .then(() => {
    console.log('\n✅ Succès !');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Erreur:', error);
    process.exit(1);
  });
