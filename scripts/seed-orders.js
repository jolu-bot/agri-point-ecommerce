const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

// Configuration MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/agri-point';

async function seedOrders() {
  try {
    console.log('🔌 Connexion à MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connecté à MongoDB');

    // Récupérer directement depuis la base de données
    const users = await mongoose.connection.collection('users').find({}).toArray();
    const products = await mongoose.connection.collection('products').find({}).toArray();

    if (users.length === 0) {
      console.log('❌ Aucun utilisateur trouvé. Veuillez d\'abord exécuter npm run seed:users');
      process.exit(1);
    }

    if (products.length === 0) {
      console.log('❌ Aucun produit trouvé. Veuillez d\'abord exécuter npm run seed');
      process.exit(1);
    }

    // Supprimer les commandes existantes
    console.log('🗑️  Suppression des commandes existantes...');
    await mongoose.connection.collection('orders').deleteMany({});
    console.log('✅ Commandes supprimées');

    // Générer des commandes de test
    const statuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
    const cities = ['Yaoundé', 'Douala', 'Bafoussam', 'Garoua', 'Bamenda'];
    const paymentMethods = ['cash', 'mtn', 'orange'];
    const paymentStatuses = ['pending', 'paid'];
    
    console.log('📦 Création des commandes de test...');
    
    const ordersToInsert = [];
    
    for (let i = 0; i < 25; i++) {
      const user = users[Math.floor(Math.random() * users.length)];
      const numItems = Math.floor(Math.random() * 3) + 1; // 1-3 articles
      const items = [];
      let subtotal = 0;

      for (let j = 0; j < numItems; j++) {
        const product = products[Math.floor(Math.random() * products.length)];
        const quantity = Math.floor(Math.random() * 3) + 1;
        const price = product.promoPrice || product.price;
        const itemTotal = price * quantity;
        
        items.push({
          product: product._id,
          productName: product.name,
          productImage: product.images?.[0] || '',
          quantity,
          price,
          total: itemTotal,
        });

        subtotal += itemTotal;
      }

      // Ajouter frais de livraison
      const shipping = subtotal < 50000 ? 2500 : 0;
      const total = subtotal + shipping;
      const tax = 0;
      const discount = 0;

      const orderNumber = `ORD-${Date.now()}-${i.toString().padStart(3, '0')}`;
      
      // Date aléatoire dans les 3 derniers mois
      const createdAt = new Date();
      createdAt.setDate(createdAt.getDate() - Math.floor(Math.random() * 90));
      
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
      const paymentStatus = status === 'pending' ? 'pending' : paymentStatuses[Math.floor(Math.random() * paymentStatuses.length)];
      const city = cities[Math.floor(Math.random() * cities.length)];

      ordersToInsert.push({
        orderNumber,
        user: user._id,
        items,
        subtotal,
        discount,
        shipping,
        tax,
        total,
        status,
        shippingAddress: {
          name: user.name,
          phone: user.phone || '+237 6XX XX XX XX',
          street: `${Math.floor(Math.random() * 999) + 1} Avenue de la Réunification`,
          city,
          region: city === 'Yaoundé' ? 'Centre' : city === 'Douala' ? 'Littoral' : 'Autre',
          country: 'Cameroun',
          postalCode: String(Math.floor(Math.random() * 90000) + 10000),
        },
        paymentMethod,
        paymentStatus,
        paymentDetails: paymentStatus === 'paid' ? {
          transactionId: `TXN-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          paidAt: createdAt,
        } : undefined,
        createdAt,
        updatedAt: createdAt,
      });
    }

    // Insérer toutes les commandes
    await mongoose.connection.collection('orders').insertMany(ordersToInsert);
    
    ordersToInsert.forEach((order) => {
      console.log(`✅ Commande créée: ${order.orderNumber} - ${order.total.toLocaleString('fr-FR')} FCFA`);
    });

    console.log('\n🎉 Seed des commandes terminé avec succès !');
    console.log('📊 25 commandes de test créées');

    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors du seed:', error);
    process.exit(1);
  }
}

seedOrders();
