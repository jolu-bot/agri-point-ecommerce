const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

async function check() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ MongoDB connecté');

    // Chercher directement en base
    const db = mongoose.connection.db;
    const campaigns = await db.collection('campaigns').find({}).toArray();
    console.log(`✓ Campagnes en BD: ${campaigns.length}`);
    
    if (campaigns.length === 0) {
      console.log('⚠️ Aucune campagne found!');
    } else {
      campaigns.forEach(c => {
        console.log(`  - Slug: "${c.slug}" | Nom: "${c.name}"`);
      });
    }

    await mongoose.disconnect();
  } catch (err) {
    console.error('✗ Erreur:', err.message);
  }
}

check();
