/**
 * TEST COMPLET DU SITE EN PRODUCTION
 */

const https = require('https');

const SITE_URL = 'https://agri-ps.com';

async function testEndpoint(path, description) {
  return new Promise((resolve) => {
    console.log(`\n🔍 Test: ${description}`);
    console.log(`   URL: ${SITE_URL}${path}`);
    
    https.get(`${SITE_URL}${path}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log(`   Status: ${res.statusCode}`);
        if (res.statusCode === 200) {
          console.log(`   ✅ OK`);
        } else {
          console.log(`   ❌ ERREUR`);
          console.log(`   Réponse: ${data.substring(0, 200)}`);
        }
        resolve({ status: res.statusCode, ok: res.statusCode === 200 });
      });
    }).on('error', (error) => {
      console.log(`   ❌ ERREUR: ${error.message}`);
      resolve({ status: 'ERROR', ok: false });
    });
  });
}

async function runTests() {
  console.log('╔════════════════════════════════════════════════╗');
  console.log('║   TEST COMPLET PRODUCTION (VERCEL)            ║');
  console.log('╚════════════════════════════════════════════════╝');

  const tests = [
    { path: '/', desc: 'Page d\'accueil' },
    { path: '/api/products', desc: 'API Produits' },
    { path: '/produits', desc: 'Page produits' },
    { path: '/admin', desc: 'Page admin' },
    { path: '/api/site-config', desc: 'API Configuration' },
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    const result = await testEndpoint(test.path, test.desc);
    if (result.ok) passed++;
    else failed++;
  }

  console.log('\n════════════════════════════════════════════════');
  console.log(`✅ Réussis: ${passed}/${tests.length}`);
  console.log(`❌ Échoués: ${failed}/${tests.length}`);
  console.log('════════════════════════════════════════════════\n');
}

runTests();
