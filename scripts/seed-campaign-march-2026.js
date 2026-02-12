#!/usr/bin/env node

/**
 * Script de seed pour la campagne engrais Mars 2026
 * Usage: node scripts/seed-campaign-march-2026.js
 */

require('dotenv').config();
const mongoose = require('mongoose');

// Importer les modèles
const campaignSchema = new mongoose.Schema({
  name: String,
  slug: String,
  description: String,
  heroImage: String,
  startDate: Date,
  endDate: Date,
  isActive: Boolean,
  products: [mongoose.Schema.Types.ObjectId],
  eligibility: Object,
  paymentScheme: Object,
  specialPricing: Object,
  terms: Object,
  stats: Object,
  createdAt: Date,
  updatedAt: Date,
});

const Campaign = mongoose.model('Campaign', campaignSchema);

async function seedCampaign() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/agri-point');
    console.log('✅ Connecté à MongoDB');

    // Vérifier si la campagne existe déjà
    const existing = await Campaign.findOne({ slug: 'engrais-mars-2026' });
    if (existing) {
      console.log('ℹ️  Campagne déjà existante. Mise à jour...');
      // Mettre à jour
      existing.isActive = true;
      existing.stats = {
        totalOrders: existing.stats?.totalOrders || 0,
        totalQuantity: existing.stats?.totalQuantity || 0,
        totalRevenue: existing.stats?.totalRevenue || 0,
      };
      await existing.save();
    } else {
      // Créer la nouvelle campagne
      const campaign = new Campaign({
        name: 'Campagne Engrais - Mars 2026',
        slug: 'engrais-mars-2026',
        description: 'Programme national permanent de subvention des engrais au Cameroun. Vos engrais désormais accessibles et disponibles. Paiement échelonné 70/30 disponible.',
        heroImage: '/images/campaigns/engrais-mars-2026-hero.jpg',
        startDate: new Date('2026-03-01'),
        endDate: new Date('2026-03-31'),
        isActive: true,
        products: [], // Sera rempli manuellement ou via API
        eligibility: {
          requireCooperativeMembership: true,
          minQuantity: 6,
          requireMutualInsurance: true,
          insuranceProviders: ['CICAN', 'CAMAO'],
          acceptedCooperatives: [],
        },
        paymentScheme: {
          enabled: true,
          firstPercentage: 70,
          secondPercentage: 30,
          firstPaymentLabel: 'À la commande',
          secondPaymentLabel: 'Après récolte',
        },
        specialPricing: {
          mineralFertilizer: 15000, // 15,000 FCFA par sac 50kg
          biofertilizer: 10000, // 10,000 FCFA
        },
        terms: {
          paymentTerms: 'Les engrais minéraux sont payables en deux tranches (70% à la commande, 30% après récolte). Les biofertilisants en une seule tranche.',
          refundPolicy: 'Remboursement possible jusqu\'à 7 jours après la commande si les conditions d\'éligibilité ne sont pas respectées.',
          contactInfo: '+237 XXX XXX XXX - support@agri-point.cm',
          additionalInfo: 'Pour plus d\'informations, consultez le document officiel de la campagne ou contactez votre coopérative.',
        },
        stats: {
          totalOrders: 0,
          totalQuantity: 0,
          totalRevenue: 0,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await campaign.save();
      console.log('✅ Campagne créée avec succès!');
      console.log(`📄 Slug: ${campaign.slug}`);
      console.log(`📅 Période: ${campaign.startDate.toLocaleDateString('fr-CM')} - ${campaign.endDate.toLocaleDateString('fr-CM')}`);
    }

    console.log('\n📊 Résumé:');
    console.log('  • Page campagne: /campagne-engrais');
    console.log('  • API: /api/campaigns/march-2026');
    console.log('  • Dashboard admin: /admin/campaigns');
    console.log('\n✨ Campagne prête pour le lancement!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

seedCampaign();
