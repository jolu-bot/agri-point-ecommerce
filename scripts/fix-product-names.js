/**
 * Nettoie les noms de produits qui contiennent des prix intégrés
 * Exemples :
 *   "Engrais Minéral NPK 15,000 FCFA" → "Engrais Minéral NPK"
 *   "Biofertilisant Organique 10,000 FCFA" → "Biofertilisant Organique"
 *
 * Usage : node scripts/fix-product-names.js
 */

const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI ||
  'mongodb+srv://agrips:sMCoHcL2Xg7rtnOU@cluster0.r4qjqcs.mongodb.net/agripoint?retryWrites=true&w=majority&appName=Cluster0';

// Regex : supprime les suffixes " 12,000 FCFA" / " 12.000 FCFA" / " 12000 FCFA" etc.
const PRICE_SUFFIX = /\s+[\d\s,\.]+\s*FCFA.*/i;

async function run() {
  console.log('🔌 Connexion MongoDB Atlas...');
  await mongoose.connect(MONGODB_URI);
  console.log('✅ Connecté\n');

  const col = mongoose.connection.db.collection('products');
  const all = await col.find({}).toArray();

  let count = 0;
  for (const p of all) {
    if (!PRICE_SUFFIX.test(p.name)) continue;

    const cleanName = p.name.replace(PRICE_SUFFIX, '').trim();
    await col.updateOne({ _id: p._id }, { $set: { name: cleanName } });
    console.log(`  ✅  "${p.name}"`);
    console.log(`       → "${cleanName}"\n`);
    count++;
  }

  if (count === 0) console.log('✓ Aucun produit à corriger — noms déjà propres.\n');
  else console.log(`\n✅ ${count} produit(s) corrigé(s)\n`);

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error('❌ Erreur :', err.message);
  process.exit(1);
});
