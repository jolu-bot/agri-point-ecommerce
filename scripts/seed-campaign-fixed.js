#!/usr/bin/env node

/**
 * Seed Correct - Campagne Engrais Mars 2026
 * Usage: npm run seed:campaign
 */

require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

// Importer le modèle Campaign réel
const { Campaign } = require('../models/Campaign');

async function seedCampaign() {
  try {
    // Connecter à MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connecté à MongoDB');

    // Vérifier si existe
    let campaign = await Campaign.findOne({ slug: 'engrais-mars-2026' });

    if (campaign) {
      console.log('ℹ️  Campagne existante trouvée. Mise à jour...');
      campaign.isActive = true;
      campaign.name = 'Campagne Engrais - Mars 2026';
      campaign.startDate = new Date('2026-03-01');
      campaign.endDate = new Date('2026-03-31');
      await campaign.save();
      console.log('✅ Campagne mise à jour');
    } else {
      console.log('📝 Création nouvelle campagne...');
      campaign = new Campaign({
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
      });
      await campaign.save();
      console.log('✅ Campagne créée');
    }

    console.log('\n📊 Résumé:');
    console.log(`  • Nom: ${campaign.name}`);
    console.log(`  • Slug: ${campaign.slug}`);
    console.log(`  • Période: ${campaign.startDate.toLocaleDateString('fr-FR')} - ${campaign.endDate.toLocaleDateString('fr-FR')}`);
    console.log(`  • Actif: ${campaign.isActive}`);
    console.log('\n✨ Campagne prête pour le lancement!');

    await mongoose.disconnect();
  } catch (error) {
    console.error('✗ Erreur:', error.message);
    process.exit(1);
  }
}

seedCampaign();
