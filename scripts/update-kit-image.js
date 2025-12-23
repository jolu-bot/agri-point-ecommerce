/**
 * MISE À JOUR - KIT AGRICULTURE URBAINE
 * Donner au kit son image propre
 */

const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://agrips:sMCoHcL2Xg7rtnOU@cluster0.r4qjqcs.mongodb.net/agripoint?retryWrites=true&w=majority&appName=Cluster0';

async function updateKitImage() {
  try {
    console.log('╔════════════════════════════════════════════════╗');
    console.log('║   MISE À JOUR KIT AGRICULTURE URBAINE         ║');
    console.log('╚════════════════════════════════════════════════╝\n');
    
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connecté à MongoDB Atlas\n');

    const db = mongoose.connection.db;
    const productsCollection = db.collection('products');

    // Mettre à jour le Kit Agriculture Urbaine
    const result = await productsCollection.updateOne(
      { slug: 'kit-urbain-debutant' },
      { 
        $set: { 
          images: ['/products/Kit Agriculture Urbaine Débutant.jpg']
        } 
      }
    );

    if (result.modifiedCount > 0) {
      console.log('✅ Kit Agriculture Urbaine Débutant mis à jour');
      console.log('   📸 Nouvelle image: /products/Kit Agriculture Urbaine Débutant.jpg\n');
    } else {
      console.log('⚠️  Aucune modification (peut-être déjà à jour)\n');
    }

    // Afficher le résumé
    console.log('📋 RÉSUMÉ DES IMAGES PAR PRODUIT:\n');
    const products = await productsCollection.find({}).sort({ name: 1 }).toArray();
    
    products.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name}`);
      console.log(`   📸 ${product.images[0]}`);
    });

    await mongoose.disconnect();
    console.log('\n🔌 Déconnecté de MongoDB');
    console.log('\n✅ Terminé ! Tous les produits ont maintenant leurs images propres.\n');

  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

updateKitImage();
