/**
 * TEST RAPIDE - VÉRIFICATION IMAGES SITE COMPLET
 */

const pages = [
  { name: 'Page d\'accueil', url: 'http://localhost:3000', check: 'Nos Produits Phares' },
  { name: 'Page produits', url: 'http://localhost:3000/produits', check: '10 produits' },
  { name: 'Produire Plus', url: 'http://localhost:3000/produire-plus', check: 'Solutions' },
  { name: 'Mieux Vivre', url: 'http://localhost:3000/mieux-vivre', check: 'Services' },
  { name: 'Gagner Plus', url: 'http://localhost:3000/gagner-plus', check: 'Revenus' },
  { name: 'Agriculture Urbaine', url: 'http://localhost:3000/agriculture-urbaine', check: 'Kits' }
];

console.log('╔════════════════════════════════════════════════╗');
console.log('║  CHECKLIST DE VÉRIFICATION DES IMAGES         ║');
console.log('╚════════════════════════════════════════════════╝\n');

console.log('🔍 Pages à vérifier manuellement:\n');

pages.forEach((page, index) => {
  console.log(`${index + 1}. ✓ ${page.name}`);
  console.log(`   URL: ${page.url}`);
  console.log(`   Vérifier: ${page.check}`);
  console.log('');
});

console.log('═'.repeat(60));
console.log('📋 POINTS DE CONTRÔLE:\n');
console.log('1. ✓ Les images des produits s\'affichent (pas d\'icônes)');
console.log('2. ✓ Pas d\'erreurs 404 dans la console (F12)');
console.log('3. ✓ Les images sont celles de la base de données');
console.log('4. ✓ Toutes les pages affichent les mêmes images');
console.log('═'.repeat(60));

console.log('\n🚀 Le serveur devrait être accessible sur: http://localhost:3000\n');
console.log('💡 Ouvrez chaque page et vérifiez visuellement.\n');
