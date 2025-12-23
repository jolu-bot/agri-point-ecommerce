/**
 * Script FINAL de correction des images
 * Utilise les fichiers PNG existants
 */

const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://agrips:REDACTED_PASSWORD_CHANGE_ON_ATLAS@cluster0.r4qjqcs.mongodb.net/agripoint?retryWrites=true&w=majority&appName=Cluster0';

// Mapping exact des fichiers disponibles (PNG + JPEG)
const imageMapping = {
  // Produits principaux avec les vrais fichiers JPEG
  'humiforte': '/products/humiforte-20.jpeg',
  'fosnutren': '/products/fosnutren-20.jpeg',
  'kadostim': '/products/kadostim-20.jpeg',
  'aminol': '/products/aminol-20.jpeg',
  'naturcare': '/products/product-naturcare-terra.png',
  'natur-care': '/products/product-naturcare-terra.png',
  'kit': '/products/kit-naturcare-terra.jpeg',
  
  // Sarah NPK variants
  'sarah-npk-20-10-10': '/products/sarah-npk-20-10-10.jpeg',
  'sarah-npk-12-14-10': '/products/sarah-npk-12-14-10.jpeg',
  'sarah-npk-10-30-10': '/products/sarah-npk-10-30-10.jpeg',
  'sarah-npk': '/products/sarah-npk-20-10-10.jpeg',
  'sarah': '/products/sarah-npk-20-10-10.jpeg',
  
  // Urée
  'uree-46': '/products/sarah-uree-46.jpeg',
  'uree': '/products/product-uree-sac-blanc.png',
  
  // Icônes
  'anti-stress': '/products/icon-anti-stress.png',
  'croissance-fruits': '/products/icon-croissance-fruits.png',
  'croissance': '/products/icon-croissance-fruits.png',
  'feuillage': '/products/icon-feuillage.png',
  'floraison': '/products/icon-floraison.png'
};

async function finalImageFix() {
  try {
    console.log('🔄 Connexion à MongoDB Atlas...\n');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connecté à MongoDB\n');

    const db = mongoose.connection.db;
    const productsCollection = db.collection('products');

    const products = await productsCollection.find({}).toArray();
    console.log(`📦 ${products.length} produit(s) trouvé(s)\n`);

    let updatedCount = 0;

    for (const product of products) {
      console.log(`\n🔍 ${product.name}`);
      let updated = false;

      // Fonction pour trouver la bonne image
      const findImage = (originalImg) => {
        if (!originalImg) return null;

        const productName = product.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
        
        // Essayer de matcher avec le nom du produit
        for (const [key, path] of Object.entries(imageMapping)) {
          if (productName.includes(key) || key.includes(productName.substring(0, 8))) {
            console.log(`   ✅ ${path}`);
            return path;
          }
        }

        // Fallback par défaut
        console.log(`   ⚠️  Fallback: /products/product-naturcare-terra.png`);
        return '/products/product-naturcare-terra.png';
      };

      // Corriger images principales
      if (product.images && product.images.length > 0) {
        const newImage = findImage(product.images[0]);
        if (newImage && newImage !== product.images[0]) {
          console.log(`   Ancien: ${product.images[0]}`);
          await productsCollection.updateOne(
            { _id: product._id },
            { $set: { images: [newImage] } }
          );
          updated = true;
        }
      } else {
        // Pas d'image du tout, en ajouter une
        const newImage = findImage(product.name);
        await productsCollection.updateOne(
          { _id: product._id },
          { $set: { images: [newImage] } }
        );
        updated = true;
      }

      if (updated) {
        updatedCount++;
        console.log(`   💾 Mis à jour`);
      } else {
        console.log(`   ✓ OK`);
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log('🎉 CORRECTION FINALE TERMINÉE !');
    console.log('='.repeat(50));
    console.log(`✅ Produits mis à jour: ${updatedCount}`);
    console.log('='.repeat(50));

    // Afficher le résultat final
    const finalProducts = await productsCollection.find({}).toArray();
    console.log('\n📋 RÉSULTAT FINAL:\n');
    finalProducts.forEach(p => {
      console.log(`✓ ${p.name}`);
      if (p.images && p.images.length > 0) {
        console.log(`  └─ ${p.images[0]}`);
      } else {
        console.log(`  └─ ⚠️ Aucune image`);
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
console.log('║  CORRECTION FINALE DES IMAGES (PNG)           ║');
console.log('╚════════════════════════════════════════════════╝\n');

finalImageFix()
  .then(() => {
    console.log('\n✅ Script terminé avec succès !');
    console.log('\n🎯 PROCHAINE ÉTAPE:');
    console.log('   Actualisez votre navigateur (Ctrl+F5)');
    console.log('   Les images devraient maintenant apparaître !');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Erreur fatale:', error);
    process.exit(1);
  });
