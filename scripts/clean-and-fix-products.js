/**
 * Script de suppression des produits en double et correction des images
 */

const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://agrips:sMCoHcL2Xg7rtnOU@cluster0.r4qjqcs.mongodb.net/agripoint?retryWrites=true&w=majority&appName=Cluster0';

// Mapping des fichiers existants
const imageFiles = {
  'humiforte': 'humiforte.svg',
  'fosnutren': 'fosnutren.svg',
  'kadostim': 'kadostim.svg',
  'aminol': 'aminol.svg',
  'naturcare': 'product-naturcare-terra.png',
  'natur-care': 'product-naturcare-terra.png',
  'sarah-npk-20-10-10': 'product-sarah-npk-20-10-10.png',
  'sarah-npk-12-14-10': 'product-sarah-npk-12-14-10.png',
  'uree-46': 'product-uree-46.png',
  'uree': 'product-uree-sac-blanc.png',
  'kit-agriculture': 'product-naturcare-terra.png'
};

async function cleanAndFixProducts() {
  try {
    console.log('🔄 Connexion à MongoDB Atlas...\n');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connecté\n');

    const db = mongoose.connection.db;
    const productsCollection = db.collection('products');

    // 1. Trouver les doublons par nom
    console.log('🔍 Recherche des doublons...\n');
    const duplicates = await productsCollection.aggregate([
      {
        $group: {
          _id: "$name",
          count: { $sum: 1 },
          ids: { $push: "$_id" }
        }
      },
      {
        $match: { count: { $gt: 1 } }
      }
    ]).toArray();

    console.log(`📊 ${duplicates.length} produit(s) en double trouvé(s)\n`);

    // 2. Supprimer les doublons (garder le plus ancien)
    for (const dup of duplicates) {
      const [keep, ...remove] = dup.ids;
      console.log(`🗑️  Suppression des doublons de "${dup._id}"`);
      await productsCollection.deleteMany({
        _id: { $in: remove }
      });
      console.log(`   ✅ ${remove.length} doublon(s) supprimé(s)\n`);
    }

    // 3. Corriger les extensions d'images
    console.log('🖼️  Correction des extensions d\'images...\n');
    const products = await productsCollection.find({}).toArray();
    
    let updated = 0;
    for (const product of products) {
      let needsUpdate = false;
      
      // Corriger images
      if (product.images && Array.isArray(product.images)) {
        const newImages = product.images.map(img => {
          if (!img) return img;
          
          const basename = img.replace('/products/', '').replace(/\.(jpg|png|svg)$/, '').toLowerCase();
          
          for (const [key, file] of Object.entries(imageFiles)) {
            if (basename.includes(key) || key.includes(basename)) {
              const newPath = `/products/${file}`;
              if (newPath !== img) {
                console.log(`  📦 ${product.name}`);
                console.log(`     ❌ ${img}`);
                console.log(`     ✅ ${newPath}`);
                needsUpdate = true;
                return newPath;
              }
              return newPath;
            }
          }
          return img;
        });
        
        if (needsUpdate) {
          await productsCollection.updateOne(
            { _id: product._id },
            { $set: { images: newImages } }
          );
          updated++;
        }
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log('🎉 NETTOYAGE TERMINÉ !');
    console.log('='.repeat(50));
    console.log(`🗑️  Doublons supprimés: ${duplicates.reduce((sum, d) => sum + d.ids.length - 1, 0)}`);
    console.log(`✅ Images corrigées: ${updated}`);
    console.log('='.repeat(50));

    // Afficher le résultat
    const finalProducts = await productsCollection.find({}).toArray();
    console.log(`\n📦 Total produits: ${finalProducts.length}\n`);
    
    finalProducts.slice(0, 8).forEach(p => {
      console.log(`✓ ${p.name}`);
      if (p.images && p.images.length > 0) {
        console.log(`  └─ ${p.images[0]}`);
      }
    });

  } catch (error) {
    console.error('\n❌ ERREUR:', error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Déconnecté de MongoDB');
  }
}

console.log('╔════════════════════════════════════════════════╗');
console.log('║  NETTOYAGE & CORRECTION DES IMAGES            ║');
console.log('╚════════════════════════════════════════════════╝\n');

cleanAndFixProducts()
  .then(() => {
    console.log('\n✅ Script terminé avec succès !');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Erreur fatale:', error);
    process.exit(1);
  });
