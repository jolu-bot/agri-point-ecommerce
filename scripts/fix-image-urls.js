/**
 * CORRECTION FINALE - URLS DES IMAGES
 * Corrige le chemin de l'image du kit (pas d'espaces dans les URLs)
 */

const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://agrips:REDACTED_PASSWORD_CHANGE_ON_ATLAS@cluster0.r4qjqcs.mongodb.net/agripoint?retryWrites=true&w=majority&appName=Cluster0';

async function fixImageUrls() {
  try {
    console.log('╔════════════════════════════════════════════════╗');
    console.log('║   CORRECTION FINALE - URLS DES IMAGES         ║');
    console.log('╚════════════════════════════════════════════════╝\n');
    
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connecté à MongoDB Atlas\n');

    const db = mongoose.connection.db;
    const productsCollection = db.collection('products');

    // Corriger l'image du Kit (enlever les espaces)
    const result = await productsCollection.updateOne(
      { slug: 'kit-urbain-debutant' },
      { 
        $set: { 
          images: ['/products/kit-urbain-debutant.jpg']
        } 
      }
    );

    console.log('✅ URL de l\'image corrigée');
    console.log('   Ancien: /products/Kit Agriculture Urbaine Débutant.jpg');
    console.log('   Nouveau: /products/kit-urbain-debutant.jpg\n');

    // Afficher toutes les images
    console.log('📋 URLS FINALES DES IMAGES:\n');
    const products = await productsCollection.find({}).sort({ name: 1 }).toArray();
    
    products.forEach((product, index) => {
      const imageUrl = product.images[0];
      const hasSpaces = imageUrl.includes(' ');
      const status = hasSpaces ? '⚠️' : '✅';
      
      console.log(`${index + 1}. ${product.name}`);
      console.log(`   ${status} ${imageUrl}`);
    });

    await mongoose.disconnect();
    console.log('\n🔌 Déconnecté de MongoDB');
    console.log('\n✅ Toutes les URLs sont maintenant sans espaces!\n');

  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

fixImageUrls();
