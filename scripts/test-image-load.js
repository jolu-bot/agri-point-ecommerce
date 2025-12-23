/**
 * TEST DE CHARGEMENT D'IMAGES - DIAGNOSTIC APPROFONDI
 */

const https = require('https');

const SITE_URL = 'https://blue-goose-561723.hostingersite.com';

async function testImageWithDetails(imagePath) {
  return new Promise((resolve) => {
    const url = new URL(imagePath, SITE_URL);
    
    console.log(`\n🔍 Test de: ${imagePath}`);
    console.log(`   URL complète: ${url.href}`);
    
    const req = https.get(url, (res) => {
      let data = '';
      
      console.log(`   Status: ${res.statusCode}`);
      console.log(`   Content-Type: ${res.headers['content-type']}`);
      console.log(`   Content-Length: ${res.headers['content-length']}`);
      console.log(`   Cache-Control: ${res.headers['cache-control']}`);
      
      res.on('data', chunk => data += chunk.length);
      res.on('end', () => {
        console.log(`   Bytes reçus: ${data}`);
        resolve({ status: res.statusCode, size: data });
      });
    });

    req.on('error', (error) => {
      console.log(`   ❌ Erreur: ${error.message}`);
      resolve({ status: 'ERROR', error: error.message });
    });

    req.end();
  });
}

async function testAll() {
  console.log('╔════════════════════════════════════════════════╗');
  console.log('║   DIAGNOSTIC IMAGES - MODE DÉTAILLÉ           ║');
  console.log('╚════════════════════════════════════════════════╝');
  
  const images = [
    '/products/kit-urbain-debutant.jpg',
    '/products/kit-naturcare-terra.jpeg',
    '/products/fosnutren-20.jpeg',
    '/products/humiforte-20.jpeg'
  ];
  
  for (const img of images) {
    await testImageWithDetails(img);
  }
}

testAll();
