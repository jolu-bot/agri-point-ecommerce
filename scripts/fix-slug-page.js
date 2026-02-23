// Fix [slug]/page.tsx encoding issues
const fs = require('fs');
const R = '\uFFFD';

let c = fs.readFileSync('app/produits/[slug]/page.tsx', 'utf8');

// ── Box drawing comment dividers ── 
// Pattern: FFFD U+201D U+20AC (repeated 4x) -> ─── 
// Each "─" (U+2500) was encoded as FFFD 201D 20AC (3 chars)
const boxPattern = '\uFFFD\u201D\u20AC';
// Replace groups of 4 box patterns
while (c.includes(boxPattern + boxPattern + boxPattern + boxPattern)) {
  c = c.split(boxPattern + boxPattern + boxPattern + boxPattern).join('\u2500\u2500\u2500\u2500');
}
// Replace groups of 3
while (c.includes(boxPattern + boxPattern + boxPattern)) {
  c = c.split(boxPattern + boxPattern + boxPattern).join('\u2500\u2500\u2500');
}
// Replace remaining single
while (c.includes(boxPattern)) {
  c = c.split(boxPattern).join('\u2500');
}

// ── Plant emoji: FFFD 0178 0152 FFFD ── -> 🌱 (seedling)
c = c.split('\uFFFD\u0178\u0152\uFFFD').join(String.fromCodePoint(0x1F331));

// ── Warning emoji: FFFD 0161 2014 FE0F ── -> ⚗️ or ⚠️
// U+0161=š=0x9A in win1252, U+2014=—=0x97 in win1252, U+FE0F=variation selector
// FFFD=0xF0, 0x9A, 0x97 in w1252 -> bytes F0 9A 97
// Hmm, that's not a standard 4-byte emoji... 
// Actually U+FE0F suggests this is a text/emoji variation selector
// Pattern: FFFD 0161 2014 FE0F -> likely ⚗️ or ✅ or ⚠️
// Bytes: F0 9A 97 [??] -> In emoji range F0 9F range, but 9A != 9F
// Wait: 9A might be the 3rd byte from win1252 0x9A=U+0161=š
// Different: if byte was 0xE2 (for 3-byte emoji): E2 9A 97 = ⚗ (hex: 2697)
// Actually: FFFD as first char when the file was processed: 0xE2 byte -> FFFD
// 3-byte emoji ⚠ = E2 9A A0: but we have E2 9A 97 -> ???
// Common warning emoji in dosage context: ⚗️ (alembic) = U+2697 = E2 9A 97 ✓
c = c.split('\uFFFD\u0161\u2014\uFE0F').join('\u2697\uFE0F'); // ⚗️

// ── French words ──
// L52: 'Résultats visibles dès la 2e semaine. Ma production a nettement augmenté !'
c = c.split('R\uFFFDsultats visibles d\uFFFDs').join('Résultats visibles dès');
c = c.split('augment\uFFFD !').join('augmenté !');

// L53: 'Produit de grande qualité et livraison rapide.'
c = c.split('grande qualit\uFFFD et').join('grande qualité et');

// L53: 'Décembre 2025'
c = c.split('D\uFFFDcembre').join('Décembre');

// L54: 'Très bon produit, dosage facile à respecter. Je rachèterai.'
c = c.split('Tr\uFFFDs bon').join('Très bon');
c = c.split('facile \uFFFD respecter').join('facile à respecter');
c = c.split('Je rach\uFFFDterai').join('Je rachèterai');

// L81: 'Produit non trouvé'
c = c.split('Produit non trouv\uFFFD').join('Produit non trouvé');

// L113: 'article(s) ajouté(s) au panier'
c = c.split('ajout\uFFFD(s)').join('ajouté(s)');

// L122: 'Lien copié'
c = c.split('Lien copi\uFFFD').join('Lien copié');

// L247: '4.9 ★ 24 avis' - FFFD is likely ★ star or · bullet
c = c.split('4.9 \uFFFD 24 avis').join('4.9 ★ 24 avis');

// L292: label block - let's check if FFFD is in className or text
// Read the line content
const lines = c.split('\n');
console.log('L292:', JSON.stringify(lines[291].substring(0, 120)));

// L301: 'Quantité' aria-label
c = c.split('aria-label="Quantit\uFFFD"').join('aria-label="Quantité"');

// L327: 'Qualité certifiée'
c = c.split('Qualit\uFFFD certifi\uFFFDe').join('Qualité certifiée');

// L379: 'Cultures adaptées'
c = c.split('Cultures adapt\uFFFDes').join('Cultures adaptées');

// L394: 'Bénéfices'
c = c.split('B\uFFFDn\uFFFDfices').join('Bénéfices');

// L434: 'Dosage recommandé'
c = c.split('Dosage recommand\uFFFD').join('Dosage recommandé');

// L459: 'Précautions'
c = c.split('Pr\uFFFDcautions').join('Précautions');

// L477: 'Référence (SKU)'
c = c.split('R\uFFFDF\uFFFDrence (SKU)').join('Référence (SKU)');

// Write file
fs.writeFileSync('app/produits/[slug]/page.tsx', c, 'utf8');

// Verify
const c2 = fs.readFileSync('app/produits/[slug]/page.tsx', 'utf8');
const remaining = c2.split('\n').filter(l => l.includes(R));
console.log('[slug] FFFD remaining:', remaining.length);
remaining.forEach((l, i) => console.log('  ' + JSON.stringify(l.substring(0, 100))));
