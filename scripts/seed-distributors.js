#!/usr/bin/env node
/**
 * Script de seed pour remplir la BD avec des distributeurs
 * Usage: node scripts/seed-distributors.js
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Charger .env.local en priorité, puis .env
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });
if (!process.env.MONGODB_URI) {
  dotenv.config({ path: path.join(__dirname, '..', '.env') });
}

const distributorSchema = new mongoose.Schema({
  name: String,
  category: String,
  address: String,
  city: String,
  region: String,
  phone: String,
  email: String,
  coordinates: { lat: Number, lng: Number },
  businessHours: String,
  description: String,
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Distributor = mongoose.model('Distributor', distributorSchema);

const distributors = [
  {
    name: 'Agri Point - Yaoundé (Siège)',
    category: 'wholesaler',
    address: 'Rue Camerounaise, Centre Ville',
    city: 'Yaoundé',
    region: 'Centre',
    phone: '+237 6 XX XXX XXX',
    email: 'yaounde@agripoint.cm',
    coordinates: { lat: 3.8474, lng: 11.5021 },
    businessHours: 'Lun-Sam: 7h-18h',
    description: 'Siège principal - Gros commerce, livraison en région',
  },
  {
    name: 'Agri Point - Douala',
    category: 'retailer',
    address: 'Boulevard de la Liberté',
    city: 'Douala',
    region: 'Littoral',
    phone: '+237 6 XX XXX XXX',
    email: 'douala@agripoint.cm',
    coordinates: { lat: 4.0511, lng: 9.7679 },
    businessHours: 'Lun-Sam: 7h-18h',
    description: 'Magasin détail - Vente au détail et petite quantité',
  },
  {
    name: 'Agri Point - Bamenda',
    category: 'partner',
    address: 'Avenue Prince Charles',
    city: 'Bamenda',
    region: 'Nord-Ouest',
    phone: '+237 6 XX XXX XXX',
    email: 'bamenda@agripoint.cm',
    coordinates: { lat: 5.9631, lng: 10.1591 },
    businessHours: 'Lun-Sam: 8h-17h',
    description: 'Distributeur partenaire - Région Nord-Ouest',
  },
  {
    name: 'Agri Point - Buea',
    category: 'retailer',
    address: 'Commercial Avenue',
    city: 'Buea',
    region: 'Sud-Ouest',
    phone: '+237 6 XX XXX XXX',
    email: 'buea@agripoint.cm',
    coordinates: { lat: 4.1551, lng: 9.2414 },
    businessHours: 'Lun-Sam: 8h-17h',
    description: 'Point de vente - Agriculture urbaine',
  },
  {
    name: 'Agri Point - Bafoussam',
    category: 'retailer',
    address: 'Centre Commercial Bafoussam',
    city: 'Bafoussam',
    region: 'Ouest',
    phone: '+237 6 XX XXX XXX',
    email: 'bafoussam@agripoint.cm',
    coordinates: { lat: 5.763, lng: 10.416 },
    businessHours: 'Lun-Sam: 7h-18h',
    description: 'Point de vente - Région de l\'Ouest',
  },
  {
    name: 'Agri Point - Garoua',
    category: 'retailer',
    address: 'Marché Central Garoua',
    city: 'Garoua',
    region: 'Nord',
    phone: '+237 6 XX XXX XXX',
    email: 'garoua@agripoint.cm',
    coordinates: { lat: 9.3022, lng: 13.404 },
    businessHours: 'Lun-Sam: 7h-17h',
    description: 'Point de vente - Région du Nord',
  },
  {
    name: 'Agri Point - Limbé',
    category: 'retailer',
    address: 'Down Beach, Limbé',
    city: 'Limbé',
    region: 'Sud-Ouest',
    phone: '+237 6 XX XXX XXX',
    email: 'limbe@agripoint.cm',
    coordinates: { lat: 4.0311, lng: 9.1299 },
    businessHours: 'Lun-Dim: 7h-19h',
    description: 'Point de vente touristique - Zone côtière',
  },
  {
    name: 'Agri Point - Ngaoundéré',
    category: 'retailer',
    address: 'Avenue Ahmadou Ahidjo',
    city: 'Ngaoundéré',
    region: 'Adamaoua',
    phone: '+237 6 XX XXX XXX',
    email: 'ngaoundere@agripoint.cm',
    coordinates: { lat: 7.3242, lng: 13.5779 },
    businessHours: 'Lun-Sam: 7h-18h',
    description: 'Point de vente - Adamaoua',
  },
];

async function seedDistributors() {
  try {
    // Connexion à MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✓ Connecté à MongoDB');

    // Vider la collection
    await Distributor.deleteMany({});
    console.log('✓ Collection nettoyée');

    // Insérer les distributeurs
    const inserted = await Distributor.insertMany(distributors);
    console.log(`✓ ${inserted.length} distributeurs inséré(s)`);

    // Afficher les distributeurs
    console.log('\n📍 Distributeurs ajoutés:');
    inserted.forEach((d) => {
      console.log(`  • ${d.name} (${d.category}) - ${d.city}`);
    });

    console.log('\n✅ Seed complété avec succès !');
  } catch (error) {
    console.error('✗ Erreur:', error);
  } finally {
    await mongoose.connection.close();
  }
}

seedDistributors();
