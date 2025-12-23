/**
 * NETTOYAGE MONGODB - LIBÉRATION D'ESPACE
 * Supprime les données non essentielles pour libérer de l'espace
 */

const mongoose = require('mongoose');

require('dotenv').config({ path: '.env.local' });
const MONGODB_URI = process.env.MONGODB_URI;

async function cleanDatabase() {
  try {
    console.log('🔌 Connexion à MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connecté à MongoDB Atlas\n');

    const db = mongoose.connection.db;

    // 1. Afficher l'espace utilisé par chaque collection
    console.log('📊 ANALYSE DES COLLECTIONS:\n');
    const collections = await db.listCollections().toArray();
    
    let totalSize = 0;
    const stats = [];

    for (const coll of collections) {
      try {
        const collStats = await db.command({ collStats: coll.name });
        stats.push({
          name: coll.name,
          count: collStats.count,
          size: collStats.size,
          storageSize: collStats.storageSize,
        });
        totalSize += collStats.size;
      } catch (error) {
        console.log(`  ⚠️  ${coll.name}: Impossible d'obtenir les stats`);
      }
    }

    // Trier par taille décroissante
    stats.sort((a, b) => b.size - a.size);

    stats.forEach(stat => {
      const sizeMB = (stat.size / (1024 * 1024)).toFixed(2);
      const storageMB = (stat.storageSize / (1024 * 1024)).toFixed(2);
      console.log(`  📦 ${stat.name}`);
      console.log(`     Documents: ${stat.count}`);
      console.log(`     Taille: ${sizeMB} MB (Storage: ${storageMB} MB)\n`);
    });

    const totalMB = (totalSize / (1024 * 1024)).toFixed(2);
    console.log(`📊 TOTAL: ${totalMB} MB\n`);

    // 2. Demander confirmation avant nettoyage
    console.log('🗑️  NETTOYAGE PROPOSÉ:\n');
    
    const toClean = [
      { name: 'orders', keep: 50, reason: 'Garder les 50 dernières commandes' },
      { name: 'messages', keep: 100, reason: 'Garder les 100 derniers messages AgriBot' },
      { name: 'securitylogs', keep: 0, reason: 'Supprimer tous les logs de sécurité' },
      { name: 'sessions', keep: 0, reason: 'Supprimer toutes les sessions expirées' },
    ];

    for (const item of toClean) {
      const exists = stats.find(s => s.name === item.name);
      if (exists) {
        console.log(`  ✂️  ${item.name}: ${item.reason}`);
        console.log(`     Actuel: ${exists.count} documents`);
      }
    }

    console.log('\n⚠️  Collections à GARDER:');
    console.log('  ✅ products (produits du catalogue)');
    console.log('  ✅ users (utilisateurs)');
    console.log('  ✅ siteconfigs (configuration du site)\n');

    // 3. Nettoyage automatique
    console.log('🧹 DÉBUT DU NETTOYAGE...\n');

    // Supprimer tous les logs de sécurité
    if (stats.find(s => s.name === 'securitylogs')) {
      const result = await db.collection('securitylogs').deleteMany({});
      console.log(`  ✅ securitylogs: ${result.deletedCount} documents supprimés`);
    }

    // Supprimer les anciennes sessions
    if (stats.find(s => s.name === 'sessions')) {
      const result = await db.collection('sessions').deleteMany({
        expires: { $lt: new Date() }
      });
      console.log(`  ✅ sessions expirées: ${result.deletedCount} documents supprimés`);
    }

    // Garder seulement les 50 dernières commandes
    if (stats.find(s => s.name === 'orders')) {
      const orders = await db.collection('orders')
        .find({})
        .sort({ createdAt: -1 })
        .skip(50)
        .toArray();
      
      if (orders.length > 0) {
        const orderIds = orders.map(o => o._id);
        const result = await db.collection('orders').deleteMany({
          _id: { $in: orderIds }
        });
        console.log(`  ✅ orders: ${result.deletedCount} anciennes commandes supprimées`);
      } else {
        console.log(`  ℹ️  orders: Moins de 50 commandes, aucune suppression`);
      }
    }

    // Garder seulement les 100 derniers messages
    if (stats.find(s => s.name === 'messages')) {
      const messages = await db.collection('messages')
        .find({})
        .sort({ createdAt: -1 })
        .skip(100)
        .toArray();
      
      if (messages.length > 0) {
        const messageIds = messages.map(m => m._id);
        const result = await db.collection('messages').deleteMany({
          _id: { $in: messageIds }
        });
        console.log(`  ✅ messages: ${result.deletedCount} anciens messages supprimés`);
      } else {
        console.log(`  ℹ️  messages: Moins de 100 messages, aucune suppression`);
      }
    }

    // Compacter les collections pour libérer l'espace
    console.log('\n🗜️  COMPACTAGE DES COLLECTIONS...\n');
    
    for (const coll of collections) {
      try {
        await db.command({ compact: coll.name });
        console.log(`  ✅ ${coll.name} compacté`);
      } catch (error) {
        console.log(`  ⚠️  ${coll.name}: ${error.message}`);
      }
    }

    // 4. Afficher l'espace libéré
    console.log('\n📊 ANALYSE POST-NETTOYAGE:\n');
    
    let newTotalSize = 0;
    for (const coll of collections) {
      try {
        const collStats = await db.command({ collStats: coll.name });
        newTotalSize += collStats.size;
        const sizeMB = (collStats.size / (1024 * 1024)).toFixed(2);
        console.log(`  📦 ${coll.name}: ${collStats.count} docs (${sizeMB} MB)`);
      } catch (error) {
        // Collection peut avoir été supprimée
      }
    }

    const newTotalMB = (newTotalSize / (1024 * 1024)).toFixed(2);
    const freedMB = ((totalSize - newTotalSize) / (1024 * 1024)).toFixed(2);
    
    console.log(`\n✅ NOUVEAU TOTAL: ${newTotalMB} MB`);
    console.log(`🎉 ESPACE LIBÉRÉ: ${freedMB} MB\n`);

    await mongoose.connection.close();
    console.log('✅ Nettoyage terminé !');

  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

cleanDatabase();
