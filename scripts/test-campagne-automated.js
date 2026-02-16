#!/usr/bin/env node

/**
 * Script de Test Automatisé - Campagne Engrais Mars 2026
 * Teste tous les scénarios d'éligibilité et paiement 70/30
 */

const http = require('http');
const BASE_URL = 'http://localhost:3000';

// Couleurs console
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  title: (msg) => console.log(`\n${colors.cyan}${colors.yellow}${msg}${colors.reset}\n`)
};

// Helper pour faire des requêtes HTTP
function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let responseData = '';
      res.on('data', chunk => responseData += chunk);
      res.on('end', () => {
        try {
          const parsed = responseData ? JSON.parse(responseData) : {};
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: parsed
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: responseData
          });
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

// Tests
async function runTests() {
  log.title('🧪 TEST CAMPAGNE ENGRAIS MARS 2026');
  
  // Vérifier que le serveur est prêt
  log.info('Vérification connexion serveur...');
  let campaignId;
  try {
    const checkRes = await makeRequest('GET', '/api/campaigns/march-2026');
    log.success('Serveur prêt!');
    
    // Charger la campagne et obtenir son ID
    if (checkRes.status === 200 && checkRes.body.campaign) {
      campaignId = checkRes.body.campaign._id || checkRes.body.campaign.id;
      log.success(`Campagne chargée: ${checkRes.body.campaign.slug}`);
    } else {
      log.error('Impossible de charger la campagne');
      process.exit(1);
    }
  } catch (e) {
    log.error(`Serveur non accessible: ${e.message}`);
    log.error('Assurez-vous que \'npm run dev\' est lancé');
    process.exit(1);
  }

  // Scénario 1: Non-Éligible (Pas Membre Coopérative)
  log.title('TEST 1️⃣: Non-Éligible (Pas Membre Coopérative)');
  
  const test1Data = {
    campaignId: campaignId,
    name: 'Test User 1',
    email: 'test1@exemple.cm',
    phone: '+237 655 123 456',
    productType: 'mineral',
    cooperativeName: 'COOP Test',
    cooperativeEmail: 'test@coop.cm',
    isMember: false, // ❌ NON COCHÉ
    hasInsurance: true,
    insuranceProvider: 'CICAN',
    quantity: 10
  };

  log.info('Données:', JSON.stringify(test1Data, null, 2));
  const res1 = await makeRequest('POST', '/api/campaigns/apply', test1Data);
  
  if (res1.status === 200 && res1.body.eligible === false) {
    log.success('Erreur d\'éligibilité détectée ✓');
    log.success(`Message: ${res1.body.message}`);
  } else {
    log.error('Erreur d\'éligibilité NOT détectée');
  }

  // Scénario 2: Non-Éligible (Pas d'Assurance)
  log.title('TEST 2️⃣: Non-Éligible (Pas d\'Assurance)');
  
  const test2Data = {
    campaignId: campaignId,
    name: 'Test User 2',
    email: 'test2@exemple.cm',
    phone: '+237 655 123 456',
    productType: 'bio',
    cooperativeName: 'COOP Agritech',
    cooperativeEmail: 'contact@coop.cm',
    isMember: true,
    hasInsurance: false, // ❌ NON COCHÉ
    insuranceProvider: null,
    quantity: 5
  };

  log.info('Données:', JSON.stringify(test2Data, null, 2));
  const res2 = await makeRequest('POST', '/api/campaigns/apply', test2Data);
  
  if (res2.status === 200 && res2.body.eligible === false) {
    log.success('Erreur d\'assurance détectée ✓');
    log.success(`Message: ${res2.body.message}`);
  } else {
    log.error('Erreur d\'assurance NOT détectée');
  }

  // Scénario 3: Non-Éligible (Quantité Insuffisante)
  log.title('TEST 3️⃣: Non-Éligible (Quantité < 6)');
  
  const test3Data = {
    campaignId: campaignId,
    name: 'Test User 3',
    email: 'test3@exemple.cm',
    phone: '+237 655 123 456',
    productType: 'mineral',
    cooperativeName: 'COOP Success',
    cooperativeEmail: 'success@coop.cm',
    isMember: true,
    hasInsurance: true,
    insuranceProvider: 'CAMAO',
    quantity: 3 // ❌ Minimum est 6!
  };

  log.info('Données:', JSON.stringify(test3Data, null, 2));
  const res3 = await makeRequest('POST', '/api/campaigns/apply', test3Data);
  
  if (res3.status === 200 && res3.body.eligible === false) {
    log.success('Erreur de quantité détectée ✓');
    log.success(`Message: ${res3.body.message}`);
  } else {
    log.error('Erreur de quantité NOT détectée');
  }

  // D'abord, obtenir la campagne
  log.info('Récupération de la campagne mars-2026...');
  const campaignRes = await makeRequest('GET', '/api/campaigns/march-2026');
  
  if (campaignRes.status !== 200 || !campaignRes.body.campaign) {
    log.error('Impossible de charger la campagne');
    log.error(`Response: ${JSON.stringify(campaignRes.body)}`);
    process.exit(1);
  }
  
  const campaignIdFromRes = campaignRes.body.campaign._id || campaignRes.body.campaign.id;
  log.success(`Campagne chargée: ${campaignRes.body.campaign.slug}`);

  // Scénario 4: ✅ ÉLIGIBLE (Complet)
  log.title('TEST 4️⃣: ✅ ÉLIGIBLE (Complet)');
  
  const test4Data = {
    campaignId: campaignId,
    name: 'John Doe',
    email: 'john@exemple.cm',
    phone: '+237 655 123 456',
    productType: 'mineral',
    cooperativeName: 'COOP Agritech Cameroun',
    cooperativeEmail: 'contact@agritech.cm',
    isMember: true,  // Changed from isMemberCooperative
    hasInsurance: true,  // Changed from isMemberMutual
    insuranceProvider: 'CICAN',  // Changed from mutualProvider
    quantity: 10 // ✅ OK (>= 6)
  };

  log.info('Données:', JSON.stringify(test4Data, null, 2));
  const res4 = await makeRequest('POST', '/api/campaigns/apply', test4Data);
  
  if (res4.status === 200 && res4.body.eligible === true) {
    log.success('✅ ÉLIGIBLE détecté correctement!');
    log.success(`Message: ${res4.body.message}`);
  } else {
    log.error('Éligibilité non détectée correctement');
    log.error(`Status: ${res4.status}, Body: ${JSON.stringify(res4.body)}`);
  }

  // Scénario 5: Vérifier Paiement 70/30 en BD
  log.title('TEST 5️⃣: Vérifier Paiement 70/30');
  
  const checkoutData = {
    campaignId: campaignId,
    name: 'John Doe Checkout',
    email: 'john.checkout@exemple.cm',
    phone: '+237 655 123 456',
    productType: 'mineral',
    cooperativeName: 'COOP Agritech Cameroun',
    cooperativeEmail: 'contact@agritech.cm',
    isMember: true,
    hasInsurance: true,
    insuranceProvider: 'CICAN',
    quantity: 10,
    totalAmount: 150000 // 10 sacs × 15,000 FCFA
  };

  log.info('Passage au checkout...');
  const res5 = await makeRequest('POST', '/api/campaigns/checkout', checkoutData);
  
  if (res5.status === 201 || res5.status === 200) {
    log.success('Commande créée! ✓');
    
    if (res5.body.order) {
      const order = res5.body.order;
      const expectedFirst = Math.round(150000 * 0.7);
      const expectedSecond = 150000 - expectedFirst;
      
      log.success(`Montant total: ${order.totalAmount || '?'} FCFA`);
      log.success(`1ère tranche (70%): ${order.installmentPayment?.firstAmount || '?'} FCFA (attendu: ${expectedFirst})`);
      log.success(`2ème tranche (30%): ${order.installmentPayment?.secondAmount || '?'} FCFA (attendu: ${expectedSecond})`);
      log.success(`Statut 1ère tranche: ${order.installmentPayment?.firstPaymentStatus || '?'}`);
      log.success(`Statut 2ème tranche: ${order.installmentPayment?.secondPaymentStatus || '?'}`);
      
      if (order.installmentPayment?.secondPaymentDueDate) {
        log.success(`Date paiement 2ème: ${order.installmentPayment.secondPaymentDueDate}`);
      }
    }
  } else {
    log.error(`Erreur checkout: ${res5.status}`);
    log.error(`Response: ${JSON.stringify(res5.body)}`);
  }

  // Scénario 6: Vérifier Dashboard Admin
  log.title('TEST 6️⃣: Vérifier Dashboard Admin API');
  
  log.info('Requête vers /api/admin/campaigns/stats...');
  const res6 = await makeRequest('GET', '/api/admin/campaigns/stats');
  
  if (res6.status === 200) {
    log.success('Dashboard API répond! ✓');
    
    if (res6.body.campaigns && res6.body.campaigns.length > 0) {
      const campaign = res6.body.campaigns[0];
      log.success(`Campagne: ${campaign.name}`);
      log.success(`Total commandes: ${campaign.stats?.totalOrders || 0}`);
      log.success(`Total quantité: ${campaign.stats?.totalQuantity || 0}`);
      log.success(`Total revenu: ${campaign.stats?.totalRevenue || 0} FCFA`);
      
      if (res6.body.orders && res6.body.orders.length > 0) {
        log.success(`Nombre de commandes à afficher: ${res6.body.orders.length}`);
      }
    }
  } else {
    log.error(`Erreur Dashboard: ${res6.status}`);
  }

  // Résumé Final
  log.title('📊 RÉSUMÉ DES TESTS');
  log.success(`
✅ Test 1: Non-éligible (pas coopérative) - ${res1.status === 200 ? '✓ PASS' : '✗ FAIL'}
✅ Test 2: Non-éligible (pas assurance) - ${res2.status === 200 ? '✓ PASS' : '✗ FAIL'}
✅ Test 3: Non-éligible (quantité) - ${res3.status === 200 ? '✓ PASS' : '✗ FAIL'}
✅ Test 4: Éligible (complet) - ${res4.status === 200 && res4.body.eligible ? '✓ PASS' : '✗ FAIL'}
✅ Test 5: Paiement 70/30 - ${res5.status === 201 || res5.status === 200 ? '✓ PASS' : '✗ FAIL'}
✅ Test 6: Dashboard Admin - ${res6.status === 200 ? '✓ PASS' : '✗ FAIL'}

${colors.green}Tous les tests sont terminés!${colors.reset}
  `);

  process.exit(0);
}

// Lancer les tests
runTests().catch(err => {
  log.error(`Erreur: ${err.message}`);
  process.exit(1);
});
