/**
 * TEST EN DIRECT DES IMAGES
 * Vérifie que les images sont accessibles via HTTP
 */

const http = require('http');

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
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: imagePath,
      method: 'GET'
    };

    const req = http.request(options, (res) => {
      resolve({
        path: imagePath,
        status: res.statusCode,
        contentType: res.headers['content-type']
      });
    });

    req.on('error', (error) => {
      resolve({
        path: imagePath,
        status: 'ERROR',
        error: error.message
      });
    });

    req.setTimeout(5000, () => {
      req.destroy();
      resolve({
        path: imagePath,
        status: 'TIMEOUT',
        error: 'Request timeout'
      });
    });

    req.end();
  });
}

async function testAllImages() {
  console.log('╔════════════════════════════════════════════════╗');
  console.log('║     TEST ACCESSIBILITÉ DES IMAGES             ║');
  console.log('╚════════════════════════════════════════════════╝\n');
  
  console.log('🌐 Serveur: http://localhost:3000\n');
  console.log('⏳ Test en cours...\n');
  
  // Attendre un peu que le serveur soit prêt
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const results = [];
  
  for (const imagePath of images) {
    const result = await testImage(imagePath);
    results.push(result);
    
    const fileName = imagePath.split('/').pop();
    
    if (result.status === 200) {
      console.log(`✅ ${fileName}`);
      console.log(`   Status: ${result.status} | Type: ${result.contentType}`);
    } else if (result.status === 304) {
      console.log(`✅ ${fileName}`);
      console.log(`   Status: ${result.status} (Cached)`);
    } else {
      console.log(`❌ ${fileName}`);
      console.log(`   Status: ${result.status} | Error: ${result.error || 'Unknown'}`);
    }
    console.log('');
  }
  
  const successful = results.filter(r => r.status === 200 || r.status === 304).length;
  const failed = results.length - successful;
  
  console.log('═'.repeat(60));
  console.log('📊 RÉSULTATS:');
  console.log(`✅ Accessibles: ${successful}/${results.length}`);
  console.log(`❌ Erreurs: ${failed}/${results.length}`);
  console.log('═'.repeat(60));
  
  if (failed === 0) {
    console.log('\n🎉 TOUTES LES IMAGES SONT ACCESSIBLES !');
    console.log('   👉 Visitez: http://localhost:3000/produits');
  } else {
    console.log('\n⚠️  Certaines images ne sont pas accessibles.');
    console.log('   Vérifiez que le serveur Next.js est démarré.');
  }
}

testAllImages().catch(console.error);
