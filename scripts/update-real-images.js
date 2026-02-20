/**
 * CORRECTION FINALE ET INTELLIGENTE DES IMAGES
 * Utilise les vraies images des produits fournies
 */

const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://agrips:sMCoHcL2Xg7rtnOU@cluster0.r4qjqcs.mongodb.net/agripoint?retryWrites=true&w=majority&appName=Cluster0';

// Mapping PRÉCIS basé sur les vraies images fournies
const productImageMapping = {
  'AMINOL 20': '/products/aminol-20.jpeg',
  'HUMIFORTE': '/products/humiforte-20.jpeg',
  'HUMIFORTE 20': '/products/humiforte-20.jpeg',
  'KADOSTIM 20': '/products/kadostim-20.jpeg',
  'FOSNUTREN 20': '/products/fosnutren-20.jpeg',
  'NATUR CARE': '/products/kit-naturcare-terra.jpeg',
  'NATURCARE': '/products/kit-naturcare-terra.jpeg',
  'SARAH NPK 20-10-10': '/products/sarah-npk-20-10-10.jpeg',
  'SARAH NPK 12-14-10': '/products/sarah-npk-12-14-10.jpeg',
  'SARAH NPK 10-30-10': '/products/sarah-npk-10-30-10.jpeg',
  'URÉE 46%': '/products/sarah-uree-46.jpeg',
  'UREE 46%': '/products/sarah-uree-46.jpeg',
  'Kit Agriculture Urbaine Débutant': '/products/kit-naturcare-terra.jpeg',
  'Kit Urbain': '/products/kit-naturcare-terra.jpeg'
};

async function updateProductsWithRealImages() {
  try {
    console.log('╔════════════════════════════════════════════════╗');
    console.log('║  MISE À JOUR AVEC LES VRAIES IMAGES           ║');
    console.log('╚════════════════════════════════════════════════╝\n');
    
    console.log('🔄 Connexion à MongoDB Atlas...\n');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connecté à MongoDB Atlas\n');

    const db = mongoose.connection.db;
    const productsCollection = db.collection('products');

    const products = await productsCollection.find({}).toArray();
    console.log(`📦 ${products.length} produit(s) trouvé(s)\n`);
    console.log('─'.repeat(60) + '\n');

    let updatedCount = 0;
    const updates = [];

    for (const product of products) {
      const productName = product.name.trim();
      const correctImage = productImageMapping[productName];

      if (correctImage) {
        console.log(`✓ ${productName}`);
        console.log(`  📸 Image: ${correctImage}`);
        
        const currentImage = product.images && product.images[0];
        if (currentImage !== correctImage) {
          console.log(`  🔄 Mise à jour nécessaire (ancien: ${currentImage})`);
          updates.push({
            _id: product._id,
            name: productName,
            oldImage: currentImage,
            newImage: correctImage
          });
        } else {
          console.log(`  ✓ Déjà correct`);
        }
      } else {
        console.log(`⚠️  ${productName}`);
        console.log(`  ⚠️  Image non trouvée dans le mapping`);
      }
      console.log('');
    }

    // Appliquer les mises à jour
    if (updates.length > 0) {
      console.log('\n' + '='.repeat(60));
      console.log(`🔧 Application de ${updates.length} mise(s) à jour...\n`);
      
      for (const update of updates) {
        await productsCollection.updateOne(
          { _id: update._id },
          { $set: { images: [update.newImage] } }
        );
        console.log(`✅ ${update.name}`);
        console.log(`   ${update.oldImage || '(aucune)'} → ${update.newImage}`);
        updatedCount++;
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('🎉 MISE À JOUR TERMINÉE !');
    console.log('='.repeat(60));
    console.log(`📊 Produits vérifiés: ${products.length}`);
    console.log(`✅ Produits mis à jour: ${updatedCount}`);
    console.log(`✓ Produits déjà corrects: ${products.length - updatedCount}`);
    console.log('='.repeat(60));

    // Afficher le résultat final
    console.log('\n📋 RÉSULTAT FINAL:\n');
    const finalProducts = await productsCollection.find({}).toArray();
    finalProducts.forEach(p => {
      const image = p.images && p.images[0] ? p.images[0] : '⚠️ Aucune image';
      console.log(`✓ ${p.name}`);
      console.log(`  └─ ${image}\n`);
    });

  } catch (error) {
    console.error('\n❌ ERREUR:', error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Déconnecté de MongoDB\n');
  }
}

updateProductsWithRealImages()
  .then(() => {
    console.log('✅ Script terminé avec succès !');
    console.log('\n🎯 PROCHAINES ÉTAPES:');
    console.log('   1. Les images sont maintenant dans le dossier public/products/');
    console.log('   2. Commiter et pusher sur GitHub');
    console.log('   3. Attendre le redéploiement sur Vercel (1-2 min)');
    console.log('   4. Actualiser le site (Ctrl+F5)\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Erreur fatale:', error);
    process.exit(1);
  });
