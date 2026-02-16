/**
 * ============================================================
 * SCRIPT DE TEST MONGODB - AGRI POINT
 * ============================================================
 * Ce script teste la connexion à MongoDB
 * Usage: node test-mongo-connection.js
 * ============================================================
 */

require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🔍 TEST DE CONNEXION MONGODB');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('');

// Vérifier que MONGODB_URI existe
if (!process.env.MONGODB_URI) {
  console.error('❌ ERREUR: Variable MONGODB_URI non définie !');
  console.log('');
  console.log('📝 Actions à faire:');
  console.log('   1. Créez un fichier .env.local');
  console.log('   2. Ajoutez: MONGODB_URI=mongodb+srv://...');
  console.log('');
  process.exit(1);
}

// Masquer le mot de passe dans l'affichage
const safeUri = process.env.MONGODB_URI.replace(/:[^:@]+@/, ':****@');
console.log('📍 URI de connexion:');
console.log(`   ${safeUri}`);
console.log('');

console.log('🔄 Tentative de connexion...');
console.log('');

// Tentative de connexion avec timeout
const connectionTimeout = setTimeout(() => {
  console.error('❌ TIMEOUT: La connexion prend trop de temps (>10s)');
  console.log('');
  console.log('🔍 Causes possibles:');
  console.log('   - MongoDB Atlas: IP non autorisée dans Network Access');
  console.log('   - MongoDB local: Service MongoDB non démarré');
  console.log('   - Problème réseau ou firewall');
  console.log('');
  process.exit(1);
}, 10000);

mongoose.connect(process.env.MONGODB_URI, {
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 10000,
})
  .then(async () => {
    clearTimeout(connectionTimeout);
    
    console.log('✅ CONNEXION RÉUSSIE !');
    console.log('');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 INFORMATIONS SUR LA BASE DE DONNÉES');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    
    // Obtenir le nom de la base de données
    const dbName = mongoose.connection.db.databaseName;
    console.log(`📁 Base de données: ${dbName}`);
    console.log('');
    
    // Lister les collections
    try {
      const collections = await mongoose.connection.db.listCollections().toArray();
      console.log(`📚 Collections trouvées: ${collections.length}`);
      
      if (collections.length > 0) {
        console.log('');
        for (const collection of collections) {
          const count = await mongoose.connection.db.collection(collection.name).countDocuments();
          console.log(`   - ${collection.name}: ${count} documents`);
        }
      } else {
        console.log('');
        console.log('⚠️  Aucune collection trouvée (base de données vide)');
        console.log('');
        console.log('📝 Actions recommandées:');
        console.log('   1. Exécutez: node scripts/init-production.js');
        console.log('   2. Ou exécutez: npm run seed');
      }
    } catch (err) {
      console.log('⚠️  Impossible de lister les collections:', err.message);
    }
    
    console.log('');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ TEST TERMINÉ AVEC SUCCÈS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    
    await mongoose.connection.close();
    process.exit(0);
  })
  .catch((err) => {
    clearTimeout(connectionTimeout);
    
    console.error('❌ ERREUR DE CONNEXION:');
    console.error(`   ${err.message}`);
    console.log('');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔧 SOLUTIONS POSSIBLES');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    
    if (err.message.includes('Authentication failed')) {
      console.log('🔑 Problème d\'authentification:');
      console.log('   1. Vérifiez le nom d\'utilisateur et mot de passe');
      console.log('   2. Encodez les caractères spéciaux dans le mot de passe');
      console.log('      @ → %40, # → %23, % → %25');
      console.log('   3. Exemple: Pass@123 → Pass%40123');
    }
    else if (err.message.includes('ENOTFOUND') || err.message.includes('EHOSTUNREACH')) {
      console.log('🌐 Problème de réseau:');
      console.log('   1. Vérifiez votre connexion internet');
      console.log('   2. Vérifiez l\'URL du cluster MongoDB');
      console.log('   3. Pour MongoDB Atlas: Vérifiez Network Access');
    }
    else if (err.message.includes('connection refused')) {
      console.log('🔌 Service MongoDB inaccessible:');
      console.log('   1. MongoDB local: Démarrez le service');
      console.log('      sudo systemctl start mongod');
      console.log('   2. Vérifiez que MongoDB écoute sur le bon port');
    }
    else if (err.message.includes('timeout')) {
      console.log('⏱️  Timeout de connexion:');
      console.log('   1. Le serveur MongoDB est trop lent');
      console.log('   2. Problème de firewall ou réseau');
      console.log('   3. MongoDB Atlas: Autorisez l\'IP du serveur');
    }
    else {
      console.log('❓ Erreur inconnue:');
      console.log('   Consultez la documentation MongoDB ou');
      console.log('   contactez le support technique');
    }
    
    console.log('');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    
    process.exit(1);
  });
