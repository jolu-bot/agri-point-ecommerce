/**
 * Script de migration MongoDB Local → Atlas
 * Copie toutes les données de la base locale vers Atlas
 */

const mongoose = require('mongoose');

// URIs de connexion
const LOCAL_URI = 'mongodb://localhost:27017/agripoint';
const ATLAS_URI = 'mongodb+srv://agrips:REDACTED_PASSWORD_CHANGE_ON_ATLAS@cluster0.r4qjqcs.mongodb.net/agripoint?retryWrites=true&w=majority&appName=Cluster0';

// Collections à migrer
const COLLECTIONS = ['users', 'products', 'orders', 'siteconfigs', 'settings', 'messages'];

async function migrateData() {
  let localConn = null;
  let atlasConn = null;

  try {
    console.log('🔄 DÉBUT DE LA MIGRATION\n');

    // Connexion à MongoDB Local
    console.log('📍 Connexion à MongoDB Local...');
    localConn = await mongoose.createConnection(LOCAL_URI).asPromise();
    console.log('✅ Connecté à MongoDB Local\n');

    // Connexion à MongoDB Atlas
    console.log('📍 Connexion à MongoDB Atlas...');
    atlasConn = await mongoose.createConnection(ATLAS_URI).asPromise();
    console.log('✅ Connecté à MongoDB Atlas\n');

    // Statistiques
    let totalDocuments = 0;
    let totalMigrated = 0;

    // Migrer chaque collection
    for (const collectionName of COLLECTIONS) {
      try {
        console.log(`\n📦 Migration de la collection: ${collectionName}`);
        console.log('─'.repeat(50));

        // Vérifier si la collection existe dans local
        const collections = await localConn.db.listCollections({ name: collectionName }).toArray();
        
        if (collections.length === 0) {
          console.log(`⚠️  Collection "${collectionName}" n'existe pas en local, ignorée.`);
          continue;
        }

        // Récupérer les données de local
        const localCollection = localConn.db.collection(collectionName);
        const documents = await localCollection.find({}).toArray();

        if (documents.length === 0) {
          console.log(`ℹ️  Collection "${collectionName}" est vide, ignorée.`);
          continue;
        }

        console.log(`📊 ${documents.length} document(s) trouvé(s)`);
        totalDocuments += documents.length;

        // Insérer dans Atlas
        const atlasCollection = atlasConn.db.collection(collectionName);
        
        // Supprimer les documents existants dans Atlas (optionnel, décommentez si besoin)
        // await atlasCollection.deleteMany({});
        
        // Insérer les documents
        if (documents.length > 0) {
          await atlasCollection.insertMany(documents, { ordered: false });
          totalMigrated += documents.length;
          console.log(`✅ ${documents.length} document(s) migré(s) vers Atlas`);
        }

      } catch (error) {
        if (error.code === 11000) {
          console.log(`⚠️  Certains documents existent déjà dans "${collectionName}" (ignorés)`);
        } else {
          console.log(`❌ Erreur lors de la migration de "${collectionName}":`, error.message);
        }
      }
    }

    // Résumé final
    console.log('\n' + '='.repeat(50));
    console.log('🎉 MIGRATION TERMINÉE !');
    console.log('='.repeat(50));
    console.log(`📊 Total documents trouvés : ${totalDocuments}`);
    console.log(`✅ Total documents migrés : ${totalMigrated}`);
    console.log('='.repeat(50));

    // Afficher les collections dans Atlas
    console.log('\n📋 Collections dans Atlas :');
    const atlasCollections = await atlasConn.db.listCollections().toArray();
    for (const coll of atlasCollections) {
      const count = await atlasConn.db.collection(coll.name).countDocuments();
      console.log(`   - ${coll.name}: ${count} document(s)`);
    }

  } catch (error) {
    console.error('\n❌ ERREUR DE MIGRATION:', error.message);
    process.exit(1);
  } finally {
    // Fermer les connexions
    if (localConn) {
      await localConn.close();
      console.log('\n🔌 Déconnecté de MongoDB Local');
    }
    if (atlasConn) {
      await atlasConn.close();
      console.log('🔌 Déconnecté de MongoDB Atlas');
    }
  }
}

// Exécuter la migration
console.log('╔════════════════════════════════════════════════╗');
console.log('║  MIGRATION MONGODB LOCAL → ATLAS              ║');
console.log('╚════════════════════════════════════════════════╝\n');

migrateData()
  .then(() => {
    console.log('\n✅ Script terminé avec succès !');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Erreur fatale:', error);
    process.exit(1);
  });
