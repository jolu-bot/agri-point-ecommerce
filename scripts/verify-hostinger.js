/**
 * VÉRIFICATION IMAGES SUR HOSTINGER
 * Teste l'accessibilité des images produits en production
 */

const https = require('https');

const SITE_URL = 'https://blue-goose-561723.hostingersite.com';

const images = [
  '/products/aminol-20.jpeg',
  '/products/fosnutren-20.jpeg',
  '/products/humiforte-20.jpeg',
  '/products/kadostim-20.jpeg',
  '/products/kit-naturcare-terra.jpeg',
  '/products/kit-urbain-debutant.jpg',
  '/products/sarah-npk-10-30-10.jpeg',
  '/products/sarah-npk-12-14-10.jpeg',
  '/products/sarah-npk-20-10-10.jpeg',
  '/products/sarah-uree-46.jpeg'
];

async function testImage(imagePath) {
  return new Promise((resolve) => {
    const url = new URL(imagePath, SITE_URL);
    
    const req = https.get(url, (res) => {
      resolve({
        path: imagePath,
        status: res.statusCode,
        contentType: res.headers['content-type'],
        size: res.headers['content-length']
      });
      res.resume(); // Consume response
    });

    req.on('error', (error) => {
      resolve({
        path: imagePath,
        status: 'ERROR',
        error: error.message
      });
    });

    req.setTimeout(10000, () => {
      req.destroy();
      resolve({
        path: imagePath,
        status: 'TIMEOUT',
        error: 'Request timeout (10s)'
      });
    });
  });
}

async function testProductsAPI() {
  return new Promise((resolve) => {
    const url = new URL('/api/products', SITE_URL);
    
    const req = https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({
            status: res.statusCode,
            productsCount: json.products?.length || 0,
            products: json.products || []
          });
        } catch {
          resolve({
            status: res.statusCode,
            error: 'Invalid JSON'
          });
        }
      });
    });

    req.on('error', (error) => {
      resolve({ status: 'ERROR', error: error.message });
    });

    req.setTimeout(10000, () => {
      req.destroy();
      resolve({ status: 'TIMEOUT', error: 'Request timeout' });
    });
  });
}

async function verifyHostinger() {
  console.log('╔════════════════════════════════════════════════╗');
  console.log('║   VÉRIFICATION SITE HOSTINGER EN PRODUCTION   ║');
  console.log('╚════════════════════════════════════════════════╝\n');
  
  console.log(`🌐 Site: ${SITE_URL}\n`);
  
  // Test 1: API Produits
  console.log('1️⃣  TEST API PRODUITS\n');
  const apiResult = await testProductsAPI();
  
  if (apiResult.status === 200) {
    console.log(`✅ API accessible`);
    console.log(`📦 ${apiResult.productsCount} produit(s) trouvé(s)\n`);
    
    if (apiResult.products.length > 0) {
      console.log('Produits disponibles:');
      apiResult.products.forEach((p, i) => {
        console.log(`  ${i + 1}. ${p.name}`);
        console.log(`     Image: ${p.images?.[0] || 'Aucune'}`);
      });
      console.log('');
    }
  } else {
    console.log(`❌ API non accessible (Status: ${apiResult.status})`);
    if (apiResult.error) console.log(`   Erreur: ${apiResult.error}`);
    console.log('');
  }
  
  // Test 2: Images
  console.log('2️⃣  TEST ACCESSIBILITÉ DES IMAGES\n');
  console.log('⏳ Test en cours...\n');
  
  const results = [];
  
  for (const imagePath of images) {
    const result = await testImage(imagePath);
    results.push(result);
    
    const fileName = imagePath.split('/').pop();
    
    if (result.status === 200) {
      const sizeMB = result.size ? (parseInt(result.size) / 1024 / 1024).toFixed(2) : 'N/A';
      console.log(`✅ ${fileName}`);
      console.log(`   Status: ${result.status} | Type: ${result.contentType} | Taille: ${sizeMB} MB`);
    } else if (result.status === 304) {
      console.log(`✅ ${fileName}`);
      console.log(`   Status: ${result.status} (Cached)`);
    } else if (result.status === 404) {
      console.log(`❌ ${fileName}`);
      console.log(`   Status: 404 NOT FOUND`);
    } else {
      console.log(`❌ ${fileName}`);
      console.log(`   Status: ${result.status} | Error: ${result.error || 'Unknown'}`);
    }
    console.log('');
  }
  
  // Résumé
  console.log('═'.repeat(60));
  console.log('📊 RÉSUMÉ:\n');
  
  const successful = results.filter(r => r.status === 200 || r.status === 304).length;
  const notFound = results.filter(r => r.status === 404).length;
  const errors = results.length - successful - notFound;
  
  console.log(`✅ Accessibles: ${successful}/${results.length}`);
  console.log(`❌ Non trouvées (404): ${notFound}/${results.length}`);
  console.log(`⚠️  Erreurs: ${errors}/${results.length}`);
  console.log('═'.repeat(60));
  
  if (successful === results.length) {
    console.log('\n🎉 EXCELLENT ! Toutes les images sont accessibles en production !');
    console.log(`   👉 Visitez: ${SITE_URL}/produits`);
  } else if (notFound > 0) {
    console.log('\n⚠️  ATTENTION ! Certaines images sont manquantes (404).');
    console.log('   💡 Solutions:');
    console.log('   1. Vérifier que les images sont bien dans le dossier public/products/');
    console.log('   2. Git add + commit + push');
    console.log('   3. Redéployer sur Hostinger');
    console.log('   4. Vider le cache du CDN si applicable');
  } else {
    console.log('\n⚠️  Problème de connexion ou d\'accessibilité.');
    console.log('   Vérifiez que le site est bien déployé et accessible.');
  }
  
  // Test 3: Pages principales
  console.log('\n3️⃣  PAGES À VÉRIFIER MANUELLEMENT:\n');
  const pages = [
    `${SITE_URL}`,
    `${SITE_URL}/produits`,
    `${SITE_URL}/produire-plus`,
    `${SITE_URL}/mieux-vivre`,
    `${SITE_URL}/gagner-plus`
  ];
  
  pages.forEach((url, i) => {
    console.log(`${i + 1}. ${url}`);
  });
  
  console.log('\n💡 Ouvrez chaque page et vérifiez visuellement les images.\n');
}

verifyHostinger().catch(console.error);
