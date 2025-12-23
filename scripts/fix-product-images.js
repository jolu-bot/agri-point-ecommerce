/**
 * Script de correction des URLs des images des produits
 * Corrige les chemins des images pour qu'elles s'affichent correctement
 */

const mongoose = require('mongoose');

// URI MongoDB Atlas
const MONGODB_URI = 'mongodb+srv://agrips:sMCoHcL2Xg7rtnOU@cluster0.r4qjqcs.mongodb.net/agripoint?retryWrites=true&w=majority&appName=Cluster0';

// Schéma Product simplifié
const productSchema = new mongoose.Schema({
  name: String,
  images: [String],
  variants: [{
    images: [String]
  }]
}, { strict: false });

const Product = mongoose.model('Product', productSchema);

async function fixProductImages() {
  try {
    console.log('🔄 Connexion à MongoDB Atlas...\n');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connecté à MongoDB Atlas\n');

    // Récupérer tous les produits
    const products = await Product.find({});
    console.log(`📦 ${products.length} produit(s) trouvé(s)\n`);

    let updatedCount = 0;

    for (const product of products) {
      let hasChanges = false;
      console.log(`\n🔍 Vérification: ${product.name}`);

      // Corriger les images principales
      if (product.images && Array.isArray(product.images)) {
        const newImages = product.images.map(img => {
          if (img && !img.startsWith('/')) {
            console.log(`  ❌ Image incorrecte: ${img}`);
            const corrected = `/products/${img.replace(/^.*\//, '')}`;
            console.log(`  ✅ Corrigée en: ${corrected}`);
            hasChanges = true;
            return corrected;
          }
          return img;
        });
        product.images = newImages;
      }

      // Corriger les images des variants
      if (product.variants && Array.isArray(product.variants)) {
        product.variants.forEach((variant, idx) => {
          if (variant.images && Array.isArray(variant.images)) {
            const newVariantImages = variant.images.map(img => {
              if (img && !img.startsWith('/')) {
                console.log(`  ❌ Image variant ${idx} incorrecte: ${img}`);
                const corrected = `/products/${img.replace(/^.*\//, '')}`;
                console.log(`  ✅ Corrigée en: ${corrected}`);
                hasChanges = true;
                return corrected;
              }
              return img;
            });
            variant.images = newVariantImages;
          }
        });
      }

      // Sauvegarder si des changements ont été faits
      if (hasChanges) {
        await product.save();
        updatedCount++;
        console.log(`  💾 Produit mis à jour`);
      } else {
        console.log(`  ✓ Aucun changement nécessaire`);
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log('🎉 CORRECTION TERMINÉE !');
    console.log('='.repeat(50));
    console.log(`📊 Produits vérifiés: ${products.length}`);
    console.log(`✅ Produits mis à jour: ${updatedCount}`);
    console.log('='.repeat(50));

    // Afficher un aperçu des produits
    console.log('\n📋 Aperçu des images corrigées:\n');
    const updatedProducts = await Product.find({}).limit(5);
    updatedProducts.forEach(p => {
      console.log(`📦 ${p.name}`);
      if (p.images && p.images.length > 0) {
        p.images.forEach(img => console.log(`   - ${img}`));
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

// Exécuter le script
console.log('╔════════════════════════════════════════════════╗');
console.log('║  CORRECTION DES URLs DES IMAGES PRODUITS      ║');
console.log('╚════════════════════════════════════════════════╝\n');

fixProductImages()
  .then(() => {
    console.log('\n✅ Script terminé avec succès !');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Erreur fatale:', error);
    process.exit(1);
  });
