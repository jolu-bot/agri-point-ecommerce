/**
 * Corrige le double-encodage UTF-8 → Latin-1 → UTF-8 (mojibake)
 * Principe: chaque char du fichier a un code U+0000..U+00FF qui correspond
 * à un octet original. En réinterprétant ces octets comme de l'UTF-8
 * on retrouve le texte original.
 */
const fs = require('fs');
const path = require('path');

const FILES = [
  '../app/produits/ProductsClient.tsx',
  '../components/home/Newsletter.tsx',
  '../components/home/Testimonials.tsx',
  '../components/home/Stats.tsx',
];

function decodeMojibake(content) {
  const bytes = [];
  for (let i = 0; i < content.length; i++) {
    const code = content.charCodeAt(i);
    if (code <= 0xFF) {
      bytes.push(code);
    } else {
      // Caractère déjà correct (> U+00FF) — encoder en UTF-8
      const enc = Buffer.from(String.fromCodePoint(code), 'utf8');
      for (const b of enc) bytes.push(b);
    }
  }
  // Re-décoder les octets comme UTF-8 (avec remplacement pour les séquences invalides)
  return Buffer.from(bytes).toString('utf8');
}

// Remplacements supplémentaires pour les cas résiduels (emojis déjà partiellement détruits)
const EMOJI_FALLBACK = [
  // Emojis → texte si encore cassés après le fix
  [/[^\x20-\x7E\u00A0-\u024F\u2000-\u2FFF\u{1F000}-\u{1FFFF}]/gu, ''],
  // Cas spécifiques cassés par les tentatives précédentes
  ['¿', ''],   // reste de 🌿 cassé
  ['§ª', ''],  // reste de 🧪 cassé
  ['™ï¸', ''], // reste de 🏙️ cassé
  ['¤', ''],   // reste de 🤝 cassé
  ['"¦', ''],  // reste de 📦 cassé
  ['±', ''],   // reste de 🌱 cassé
];

for (const filePath of FILES) {
  const abs = path.join(__dirname, filePath);
  if (!fs.existsSync(abs)) {
    console.log(`⚠️  Skiप: ${path.basename(abs)}`);
    continue;
  }

  const raw = fs.readFileSync(abs, 'utf8');
  let fixed = decodeMojibake(raw);

  // Appliquer les remplacements résiduels d'emojis
  for (const [from, to] of EMOJI_FALLBACK) {
    if (typeof from === 'string') {
      fixed = fixed.split(from).join(to);
    } else {
      fixed = fixed.replace(from, to);
    }
  }

  // Nettoyer espaces multiples créés par suppression d'emojis dans les labels
  fixed = fixed.replace(/icon: ''\s*,\s*/g, "icon: '',\n  ");

  fs.writeFileSync(abs, fixed, 'utf8');
  console.log(`✅ ${path.basename(abs)}`);
}

console.log('\nDone.');
