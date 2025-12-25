/**
 * MIGRATION IMAGES VERS WEBP
 * Remplace les extensions .jpeg/.jpg par .webp dans MongoDB
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI non trouvée dans .env.local');
  process.exit(1);
}

async function migrateToWebP() {
  try {
    console.log('🔌 Connexion à MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connecté à MongoDB Atlas\n');

    const db = mongoose.connection.db;
    const productsCollection = db.collection('products');

    console.log('📊 Récupération des produits...\n');
    const products = await productsCollection.find({}).toArray();
    
    console.log(`Nombre de produits: ${products.length}\n`);

    let updated = 0;
    
    for (const product of products) {
      const oldImages = product.images || [];
      const newImages = oldImages.map(img => {
        // Remplacer .jpeg et .jpg par .webp
        return img.replace(/\.(jpeg|jpg)$/i, '.webp');
      });

      if (JSON.stringify(oldImages) !== JSON.stringify(newImages)) {
        console.log(`📦 ${product.name}`);
        console.log(`   Avant: ${oldImages[0]}`);
        console.log(`   Après: ${newImages[0]}`);
        
        await productsCollection.updateOne(
          { _id: product._id },
          { $set: { images: newImages } }
        );
        
        updated++;
        console.log('   ✅ Mis à jour\n');
      }
    }

    console.log(`\n✅ Migration terminée !`);
    console.log(`   ${updated} produit(s) mis à jour`);

    await mongoose.connection.close();

  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

migrateToWebP();
