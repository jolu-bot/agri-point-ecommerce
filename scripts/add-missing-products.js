/**
 * AJOUT DES PRODUITS MANQUANTS
 * Ajoute SARAH NPK 12-14-10 et SARAH NPK 10-30-10
 */

const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://agrips:sMCoHcL2Xg7rtnOU@cluster0.r4qjqcs.mongodb.net/agripoint?retryWrites=true&w=majority&appName=Cluster0';

const newProducts = [
  {
    name: 'SARAH NPK 12-14-10',
    slug: 'sarah-npk-12-14-10',
    sku: 'SNK-12-14-10',
    description: 'Engrais minéral complet NPK 12-14-10, idéal pour favoriser la croissance végétative équilibrée et le développement racinaire. Adapté aux cultures maraîchères et céréalières.',
    category: 'engrais_mineral',
    price: 28000,
    promoPrice: null,
    stock: 50,
    unit: 'sac de 50kg',
    images: ['/products/sarah-npk-12-14-10.jpeg'],
    features: {
      composition: {
        azote: '12%',
        phosphore: '14%',
        potassium: '10%'
      },
      dosage: '200-300 kg/ha selon la culture',
      cultures: ['Maïs', 'Tomate', 'Légumes', 'Céréales'],
      avantages: [
        'Équilibre NPK optimal',
        'Favorise la croissance',
        'Développement racinaire',
        'Application facile'
      ]
    },
    isActive: true,
    isFeatured: true,
    isNew: false,
    metadata: {
      views: 0,
      sales: 0
    }
  },
  {
    name: 'SARAH NPK 10-30-10',
    slug: 'sarah-npk-10-30-10',
    sku: 'SNK-10-30-10',
    description: 'Engrais minéral NPK 10-30-10, riche en phosphore pour favoriser la floraison, la fructification et le développement des racines. Idéal pour le démarrage des cultures.',
    category: 'engrais_mineral',
    price: 30000,
    promoPrice: null,
    stock: 45,
    unit: 'sac de 50kg',
    images: ['/products/sarah-npk-10-30-10.jpeg'],
    features: {
      composition: {
        azote: '10%',
        phosphore: '30%',
        potassium: '10%'
      },
      dosage: '150-250 kg/ha selon la culture',
      cultures: ['Arachide', 'Coton', 'Soja', 'Légumineuses', 'Arbres fruitiers'],
      avantages: [
        'Très riche en phosphore',
        'Stimule la floraison',
        'Favorise la fructification',
        'Renforce les racines',
        'Idéal au démarrage'
      ]
    },
    isActive: true,
    isFeatured: true,
    isNew: false,
    metadata: {
      views: 0,
      sales: 0
    }
  }
];

async function addMissingProducts() {
  try {
    console.log('╔════════════════════════════════════════════════╗');
    console.log('║   AJOUT DES PRODUITS MANQUANTS                ║');
    console.log('╚════════════════════════════════════════════════╝\n');
    
    console.log('🔄 Connexion à MongoDB Atlas...\n');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connecté à MongoDB Atlas\n');

    const db = mongoose.connection.db;
    const productsCollection = db.collection('products');

    // Vérifier d'abord si les produits existent déjà
    for (const product of newProducts) {
      const existing = await productsCollection.findOne({ slug: product.slug });
      
      if (existing) {
        console.log(`⚠️  ${product.name} existe déjà`);
        console.log(`   Mise à jour de l'image...\n`);
        
        await productsCollection.updateOne(
          { slug: product.slug },
          { 
            $set: { 
              images: product.images,
              ...product
            } 
          }
        );
        console.log(`✅ ${product.name} mis à jour\n`);
      } else {
        console.log(`➕ Ajout de ${product.name}...`);
        await productsCollection.insertOne(product);
        console.log(`✅ ${product.name} ajouté avec succès`);
        console.log(`   📸 Image: ${product.images[0]}`);
        console.log(`   💰 Prix: ${product.price.toLocaleString()} FCFA`);
        console.log(`   📦 Stock: ${product.stock}\n`);
      }
    }

    // Vérifier le total
    const total = await productsCollection.countDocuments();
    console.log('═'.repeat(60));
    console.log(`🎉 TERMINÉ !`);
    console.log(`📦 Total de produits dans la base: ${total}`);
    console.log('═'.repeat(60));

    // Afficher tous les produits
    console.log('\n📋 LISTE COMPLÈTE DES PRODUITS:\n');
    const allProducts = await productsCollection.find({}).sort({ name: 1 }).toArray();
    
    allProducts.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name}`);
      console.log(`   └─ ${product.images[0]}`);
    });

    await mongoose.disconnect();
    console.log('\n🔌 Déconnecté de MongoDB\n');

  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

addMissingProducts();
