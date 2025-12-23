/**
 * VÉRIFICATION DES IMAGES EN PRODUCTION (HOSTINGER)
 * Teste l'accessibilité des images des produits sur le site déployé
 */

const https = require('https');
const http = require('http');

// À CONFIGURER : URL de votre site Hostinger
const PRODUCTION_URL = 'https://votre-site.com'; // REMPLACER PAR L'URL RÉELLE

const productsToCheck = [
  { name: 'HUMIFORTE', image: '/products/humiforte-20.jpeg' },
  { name: 'FOSNUTREN 20', image: '/products/fosnutren-20.jpeg' },
  { name: 'KADOSTIM 20', image: '/products/kadostim-20.jpeg' },
  { name: 'AMINOL 20', image: '/products/aminol-20.jpeg' },
  { name: 'NATUR CARE', image: '/products/kit-naturcare-terra.jpeg' },
  { name: 'SARAH NPK 20-10-10', image: '/products/sarah-npk-20-10-10.jpeg' },
  { name: 'SARAH NPK 12-14-10', image: '/products/sarah-npk-12-14-10.jpeg' },
  { name: 'SARAH NPK 10-30-10', image: '/products/sarah-npk-10-30-10.jpeg' },
  { name: 'URÉE 46%', image: '/products/sarah-uree-46.jpeg' },
  { name: 'Kit Urbain Débutant', image: '/products/kit-urbain-debutant.jpg' }
];

const pagesToCheck = [
  { name: 'Page d\'accueil', path: '/' },
  { name: 'Page produits', path: '/produits' },
  { name: 'Produire Plus', path: '/produire-plus' },
  { name: 'Mieux Vivre', path: '/mieux-vivre' },
  { name: 'Gagner Plus', path: '/gagner-plus' },
  { name: 'Agriculture Urbaine', path: '/agriculture-urbaine' }
];

function checkUrl(url) {
  return new Promise((resolve) => {
    const urlObj = new URL(url);
    const protocol = urlObj.protocol === 'https:' ? https : http;
    
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname,
      method: 'HEAD',
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ImageChecker/1.0)'
      }
    };

    const req = protocol.request(options, (res) => {
      resolve({
        url,
        status: res.statusCode,
        contentType: res.headers['content-type'],
        contentLength: res.headers['content-length']
      });
    });

    req.on('error', (error) => {
      resolve({
        url,
        status: 'ERROR',
        error: error.message
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        url,
        status: 'TIMEOUT',
        error: 'Request timeout'
      });
    });

    req.end();
  });
}

async function checkProductImages() {
  console.log('╔════════════════════════════════════════════════╗');
  console.log('║  VÉRIFICATION IMAGES PRODUCTION (HOSTINGER)   ║');
  console.log('╚════════════════════════════════════════════════╝\n');

  // Vérifier si l'URL est configurée
  if (PRODUCTION_URL === 'https://votre-site.com') {
    console.log('⚠️  URL DE PRODUCTION NON CONFIGURÉE !\n');
    console.log('📝 Instructions:');
    console.log('   1. Ouvrez: scripts/verify-production-images.js');
    console.log('   2. Remplacez la ligne 9:');
    console.log('      const PRODUCTION_URL = \'https://votre-site-reel.com\';');
    console.log('   3. Relancez ce script\n');
    console.log('💡 Pour trouver votre URL Hostinger:');
    console.log('   - Connectez-vous à votre compte Hostinger');
    console.log('   - Allez dans "Websites" ou "Hébergement"');
    console.log('   - Copiez l\'URL de votre site\n');
    return;
  }

  console.log(`🌐 Site de production: ${PRODUCTION_URL}\n`);
  console.log('─'.repeat(60) + '\n');

  // 1. Tester l'accessibilité du site
  console.log('1️⃣  TEST D\'ACCESSIBILITÉ DU SITE\n');
  const siteCheck = await checkUrl(PRODUCTION_URL);
  
  if (siteCheck.status === 200 || siteCheck.status === 301 || siteCheck.status === 302) {
    console.log(`✅ Site accessible (Status: ${siteCheck.status})\n`);
  } else {
    console.log(`❌ Site non accessible (Status: ${siteCheck.status})`);
    console.log(`   Erreur: ${siteCheck.error || 'Unknown'}\n`);
    console.log('⚠️  Vérifiez que:');
    console.log('   - Le site est bien déployé sur Hostinger');
    console.log('   - L\'URL est correcte');
    console.log('   - Le domaine est actif\n');
    return;
  }

  // 2. Tester les images des produits
  console.log('2️⃣  TEST DES IMAGES DES PRODUITS\n');
  
  const imageResults = [];
  for (const product of productsToCheck) {
    const imageUrl = `${PRODUCTION_URL}${product.image}`;
    const result = await checkUrl(imageUrl);
    imageResults.push({ ...product, ...result });
    
    if (result.status === 200) {
      const sizeKB = result.contentLength ? (parseInt(result.contentLength) / 1024).toFixed(2) : 'Unknown';
      console.log(`✅ ${product.name}`);
      console.log(`   ${product.image}`);
      console.log(`   Taille: ${sizeKB} KB | Type: ${result.contentType || 'Unknown'}`);
    } else {
      console.log(`❌ ${product.name}`);
      console.log(`   ${product.image}`);
      console.log(`   Status: ${result.status} | Erreur: ${result.error || 'Not Found'}`);
    }
    console.log('');
  }

  // 3. Tester les pages
  console.log('─'.repeat(60) + '\n');
  console.log('3️⃣  TEST DES PAGES DU SITE\n');
  
  const pageResults = [];
  for (const page of pagesToCheck) {
    const pageUrl = `${PRODUCTION_URL}${page.path}`;
    const result = await checkUrl(pageUrl);
    pageResults.push({ ...page, ...result });
    
    if (result.status === 200) {
      console.log(`✅ ${page.name}`);
      console.log(`   ${page.path}`);
    } else {
      console.log(`❌ ${page.name}`);
      console.log(`   ${page.path} (Status: ${result.status})`);
    }
    console.log('');
  }

  // 4. Résumé
  console.log('═'.repeat(60));
  console.log('📊 RÉSUMÉ DE LA VÉRIFICATION\n');
  
  const successfulImages = imageResults.filter(r => r.status === 200).length;
  const failedImages = imageResults.length - successfulImages;
  const successfulPages = pageResults.filter(r => r.status === 200).length;
  const failedPages = pageResults.length - successfulPages;
  
  console.log(`🖼️  Images:`);
  console.log(`   ✅ Accessibles: ${successfulImages}/${imageResults.length}`);
  console.log(`   ❌ Inaccessibles: ${failedImages}/${imageResults.length}\n`);
  
  console.log(`📄 Pages:`);
  console.log(`   ✅ Accessibles: ${successfulPages}/${pageResults.length}`);
  console.log(`   ❌ Inaccessibles: ${failedPages}/${pageResults.length}\n`);
  
  console.log('═'.repeat(60));
  
  if (failedImages === 0 && failedPages === 0) {
    console.log('\n🎉 PARFAIT ! Tout fonctionne correctement sur Hostinger !\n');
    console.log('✅ Toutes les images sont accessibles');
    console.log('✅ Toutes les pages sont accessibles');
    console.log('\n👉 Visitez: ' + PRODUCTION_URL);
  } else {
    console.log('\n⚠️  PROBLÈMES DÉTECTÉS\n');
    
    if (failedImages > 0) {
      console.log('📋 Images manquantes:');
      imageResults
        .filter(r => r.status !== 200)
        .forEach(r => console.log(`   - ${r.name}: ${r.image}`));
      console.log('');
      console.log('💡 Solutions:');
      console.log('   1. Vérifiez que les images sont bien dans public/products/');
      console.log('   2. Redéployez le site sur Hostinger');
      console.log('   3. Attendez 2-3 minutes pour la propagation');
      console.log('');
    }
    
    if (failedPages > 0) {
      console.log('📋 Pages inaccessibles:');
      pageResults
        .filter(r => r.status !== 200)
        .forEach(r => console.log(`   - ${r.name}: ${r.path}`));
      console.log('');
    }
  }
  
  console.log('═'.repeat(60));
  console.log(`\n⏰ Vérification effectuée: ${new Date().toLocaleString('fr-FR')}\n`);
}

// Lancer la vérification
checkProductImages().catch(console.error);
