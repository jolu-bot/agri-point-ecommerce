const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

async function insertCampaign() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const campaignData = {
      name: 'Campagne Engrais - Mars 2026',
      slug: 'engrais-mars-2026',
      description: 'Programme national de subvention des engrais',
      heroImage: '/images/campaigns/engrais-mars-2026-hero.jpg',
      startDate: new Date('2026-03-01'),
      endDate: new Date('2026-03-31'),
      isActive: true,
      products: [],
      eligibility: {
        requireCooperativeMembership: true,
        minQuantity: 6,
        requireMutualInsurance: true,
      },
      paymentScheme: {
        enabled: true,
        firstPercentage: 70,
        secondPercentage: 30,
      },
      specialPricing: {
        mineralFertilizer: 15000,
        biofertilizer: 10000,
      },
    };

    const db = mongoose.connection.db;
    const result = await db.collection('campaigns').updateOne(
      { slug: 'engrais-mars-2026' },
      { $set: campaignData },
      { upsert: true }
    );

    console.log('✅ Campagne créée/mise à jour');
    console.log(`   Matched: ${result.matchedCount}, Modified: ${result.modifiedCount}`);

    // Vérifier
    const campaigns = await db.collection('campaigns').find({}).toArray();
    console.log(`✓ Total campagnes en BD: ${campaigns.length}`);
    campaigns.forEach(c => console.log(`  - ${c.slug}`));

    await mongoose.disconnect();
  } catch (err) {
    console.error('✗ Erreur:', err.message);
    process.exit(1);
  }
}

insertCampaign();
