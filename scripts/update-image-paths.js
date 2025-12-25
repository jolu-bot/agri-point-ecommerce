/**
 * MISE À JOUR DES CHEMINS D'IMAGES DANS LA BASE DE DONNÉES
 * Remplace .jpeg/.jpg par .webp
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local') });
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI non trouvé dans .env.local');
  process.exit(1);
}

async function updateImagePaths() {
  try {
    console.log('🔌 Connexion à MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connecté\n');

    const db = mongoose.connection.db;
    const products = await db.collection('products').find({}).toArray();

    console.log(`📦 ${products.length} produits trouvés\n`);

    let updated = 0;

    for (const product of products) {
      const oldImage = product.images[0];
      const newImage = oldImage
        .replace('.jpeg', '.webp')
        .replace('.jpg', '.webp');

      if (oldImage !== newImage) {
        await db.collection('products').updateOne(
          { _id: product._id },
          { $set: { 'images.0': newImage } }
        );

        console.log(`✅ ${product.name}`);
        console.log(`   ${oldImage} → ${newImage}\n`);
        updated++;
      }
    }

    console.log(`\n🎉 ${updated} produit(s) mis à jour !`);

    await mongoose.connection.close();
    console.log('✅ Terminé');

  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

updateImagePaths();
