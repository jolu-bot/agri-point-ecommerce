/**
 * Script de correction de l'encodage mojibake dans les fichiers TSX/JS
 * Corrige aussi les noms de produits contenant des prix
 */
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://agrips:sMCoHcL2Xg7rtnOU@cluster0.r4qjqcs.mongodb.net/agripoint?retryWrites=true&w=majority&appName=Cluster0';

// ─── Correction fichiers TSX ──────────────────────────────────────────────────
const files = [
  path.join(__dirname, '../app/produits/ProductsClient.tsx'),
  path.join(__dirname, '../components/home/Newsletter.tsx'),
  path.join(__dirname, '../components/home/Testimonials.tsx'),
  path.join(__dirname, '../components/home/Stats.tsx'),
];

// Table de remplacement mojibake → correct
const REPLACEMENTS = [
  // Textes français
  ['qualitÃ©', 'qualité'],
  ['NouveautÃ©s', 'Nouveautés'],
  ['Engrais MinÃ©raux', 'Engrais Minéraux'],
  ['CatÃ©gorie', 'Catégorie'],
  ['catÃ©gorie', 'catégorie'],
  ['filtrÃ©', 'filtré'],
  ['trouvÃ©', 'trouvé'],
  ['RÃ©initialiser', 'Réinitialiser'],
  ['performante', 'performante'],
  // Ponctuation
  ['â€¦', '…'],
  ['â€™', "'"],
  ['Â·', '·'],
  ['Â«', '«'],
  ['Â»', '»'],
  // Flèches
  ['â†'', '↑'],
  ['â†"', '↓'],
  ['â†'', '→'],
  // Checkmark
  ['âœ•', '✕'],
  // Tirets/boîte
  ['â"€', '─'],
  // Emojis (remplacer par du texte neutre pour éviter les problèmes)
  ['ðŸŒ¿', '🌿'],
  ['ðŸ§ª', '🧪'],
  ['âš—ï¸', '⚗️'],
  ['ðŸ™ï¸', '🏙️'],
  ['ðŸ¤', '🤝'],
  ['ðŸ"¦', '📦'],
  ['ðŸŒ±', '🌱'],
  ['ðŸ"ˆ', '📈'],
  ['ðŸŒ±', '🌱'],
  ['ðŸŽ', '🎁'],
  ['ðŸšš', '🚚'],
];

console.log('🔧 Correction des fichiers TSX...\n');

for (const file of files) {
  if (!fs.existsSync(file)) {
    console.log(`⚠️  Fichier non trouvé: ${path.basename(file)}`);
    continue;
  }

  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  for (const [from, to] of REPLACEMENTS) {
    if (content.includes(from)) {
      content = content.split(from).join(to);
      changed = true;
    }
  }

  if (changed) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`✅ ${path.basename(file)} - corrigé`);
  } else {
    console.log(`✓  ${path.basename(file)} - déjà correct`);
  }
}

// ─── Correction noms produits MongoDB ────────────────────────────────────────
async function fixProductNames() {
  console.log('\n🔧 Correction des noms de produits dans MongoDB...\n');

  try {
    await mongoose.connect(MONGODB_URI);
    const db = mongoose.connection.db;
    const col = db.collection('products');

    // Trouver tous les produits dont le nom contient un pattern prix FCFA
    const products = await col.find({
      name: { $regex: /\s+[\d,\.]+\s*FCFA/i }
    }).toArray();

    console.log(`📊 ${products.length} produit(s) avec prix dans le nom\n`);

    for (const p of products) {
      // Supprimer le pattern " 15,000 FCFA" ou " 10.000 FCFA" etc.
      const cleanName = p.name.replace(/\s+[\d,\.]+\s*FCFA.*/i, '').trim();
      await col.updateOne({ _id: p._id }, { $set: { name: cleanName } });
      console.log(`  ✅ "${p.name}" → "${cleanName}"`);
    }

    console.log('\n✅ Noms de produits corrigés\n');
  } catch (err) {
    console.error('❌ Erreur MongoDB:', err.message);
  } finally {
    await mongoose.disconnect();
  }
}

fixProductNames();
