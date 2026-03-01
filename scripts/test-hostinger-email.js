// ═══════════════════════════════════════════════════════════════
// 🧪 TEST HOSTINGER SMTP CONFIGURATION
// ═══════════════════════════════════════════════════════════════
// Script de test pour vérifier la configuration email Hostinger
// Usage: node scripts/test-hostinger-email.js
// ═══════════════════════════════════════════════════════════════

const nodemailer = require('nodemailer');
require('dotenv').config({ path: '.env.local' }); // ou .env.production.local

console.log('\n╔═══════════════════════════════════════════════════════════════╗');
console.log('║     🧪 TEST CONFIGURATION HOSTINGER SMTP                     ║');
console.log('╚═══════════════════════════════════════════════════════════════╝\n');

// ─────────────────────────────────────────────────
// 📋 Affichage Configuration
// ─────────────────────────────────────────────────
console.log('📋 Configuration chargée:');
console.log('─────────────────────────────────────────────────');
console.log(`   Host:     ${process.env.EMAIL_HOST || '❌ NON DÉFINI'}`);
console.log(`   Port:     ${process.env.EMAIL_PORT || '❌ NON DÉFINI'}`);
console.log(`   User:     ${process.env.EMAIL_USER || '❌ NON DÉFINI'}`);
console.log(`   Pass:     ${process.env.EMAIL_PASS ? '✅ Défini (' + process.env.EMAIL_PASS.length + ' caractères)' : '❌ NON DÉFINI'}`);
console.log(`   From:     ${process.env.EMAIL_FROM || '❌ NON DÉFINI'}`);
console.log(`   Secure:   ${process.env.EMAIL_PORT === '465' ? '✅ SSL (Port 465)' : '⚠️ TLS (Port ' + process.env.EMAIL_PORT + ')'}`);
console.log('─────────────────────────────────────────────────\n');

// Vérifications préliminaires
const errors = [];
if (!process.env.EMAIL_HOST) errors.push('EMAIL_HOST manquant');
if (!process.env.EMAIL_PORT) errors.push('EMAIL_PORT manquant');
if (!process.env.EMAIL_USER) errors.push('EMAIL_USER manquant');
if (!process.env.EMAIL_PASS) errors.push('EMAIL_PASS manquant');

if (errors.length > 0) {
  console.error('❌ ERREURS DE CONFIGURATION:');
  errors.forEach(err => console.error(`   - ${err}`));
  console.log('\n💡 Vérifiez votre fichier .env.local ou .env.production.local\n');
  process.exit(1);
}

// ─────────────────────────────────────────────────
// 🔧 Création Transporter Nodemailer
// ─────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT),
  secure: process.env.EMAIL_PORT === '465', // true pour 465 (SSL), false pour 587 (TLS)
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  // Options de debug (décommenter si problème)
  // debug: true,
  // logger: true,
});

// ─────────────────────────────────────────────────
// 🧪 Tests Séquentiels
// ─────────────────────────────────────────────────
async function runTests() {
  try {
    // ─────────────────────────────────────────────────
    // TEST 1: Vérification Connexion SMTP
    // ─────────────────────────────────────────────────
    console.log('🔍 TEST 1/3: Vérification connexion SMTP Hostinger...');
    await transporter.verify();
    console.log('✅ Connexion SMTP réussie! Serveur Hostinger accessible.\n');

    // ─────────────────────────────────────────────────
    // TEST 2: Envoi Email Test (Admin)
    // ─────────────────────────────────────────────────
    console.log('📧 TEST 2/3: Envoi email test à admin@agri-ps.com...');
    const info1 = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: process.env.ADMIN_EMAIL || 'admin@agri-ps.com',
      subject: '✅ Test SMTP Hostinger - AGRI PS',
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {
      font-family: Arial, sans-serif;
      background: #f4f4f4;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 20px auto;
      background: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .header {
      background: linear-gradient(135deg, #059669 0%, #10b981 100%);
      color: white;
      padding: 40px;
      text-align: center;
    }
    .content {
      padding: 30px;
    }
    .success-box {
      background: #d1fae5;
      border-left: 4px solid #059669;
      padding: 20px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .info-table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    .info-table td {
      padding: 10px;
      border-bottom: 1px solid #e5e7eb;
    }
    .info-table td:first-child {
      font-weight: bold;
      color: #059669;
      width: 40%;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0; font-size: 32px;">✅</h1>
      <h2 style="margin: 10px 0 0 0;">Configuration SMTP Réussie!</h2>
    </div>
    <div class="content">
      <p>Félicitations! La configuration SMTP Hostinger fonctionne parfaitement.</p>
      
      <div class="success-box">
        <strong>✅ Tests Réussis:</strong>
        <ul style="margin: 10px 0;">
          <li>Connexion au serveur Hostinger</li>
          <li>Authentification valide</li>
          <li>Envoi d'email fonctionnel</li>
        </ul>
      </div>
      
      <h3 style="color: #059669;">📋 Détails Configuration</h3>
      <table class="info-table">
        <tr>
          <td>Serveur SMTP</td>
          <td>${process.env.EMAIL_HOST}</td>
        </tr>
        <tr>
          <td>Port</td>
          <td>${process.env.EMAIL_PORT} (${process.env.EMAIL_PORT === '465' ? 'SSL' : 'TLS'})</td>
        </tr>
        <tr>
          <td>Email Envoi</td>
          <td>${process.env.EMAIL_USER}</td>
        </tr>
        <tr>
          <td>Date Test</td>
          <td>${new Date().toLocaleString('fr-FR', { timeZone: 'Africa/Douala' })}</td>
        </tr>
      </table>
      
      <p style="color: #666; font-size: 14px; font-style: italic;">
        💡 Ce test confirme que tous les emails système (confirmations commandes, 
        notifications, etc.) seront envoyés correctement.
      </p>
    </div>
  </div>
</body>
</html>
      `,
    });
    
    console.log(`✅ Email test envoyé avec succès!`);
    console.log(`   Message ID: ${info1.messageId}`);
    console.log(`   Destinataire: ${process.env.ADMIN_EMAIL || 'admin@agri-ps.com'}\n`);

    // ─────────────────────────────────────────────────
    // TEST 3: Email Test Contact Form
    // ─────────────────────────────────────────────────
    console.log('📬 TEST 3/3: Envoi email test formulaire contact...');
    const info2 = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: process.env.EMAIL_CONTACT || 'contact@agri-ps.com',
      subject: '📩 Test Formulaire Contact - AGRI PS',
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .header { background: #059669; color: white; padding: 30px; text-align: center; }
    .content { padding: 30px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2 style="margin: 0;">📬 Test Formulaire Contact</h2>
    </div>
    <div class="content">
      <p>Ceci est un email de test pour vérifier que les emails du formulaire de contact arrivent bien.</p>
      <p><strong>✅ Si vous recevez ce message, le formulaire contact fonctionne!</strong></p>
      <p style="color: #666; font-size: 14px; margin-top: 30px;">
        Test effectué le ${new Date().toLocaleString('fr-FR', { timeZone: 'Africa/Douala' })}
      </p>
    </div>
  </div>
</body>
</html>
      `,
    });
    
    console.log(`✅ Email contact form envoyé avec succès!`);
    console.log(`   Message ID: ${info2.messageId}`);
    console.log(`   Destinataire: ${process.env.EMAIL_CONTACT || 'contact@agri-ps.com'}\n`);

    // ─────────────────────────────────────────────────
    // ✅ Résumé Final
    // ─────────────────────────────────────────────────
    console.log('╔═══════════════════════════════════════════════════════════════╗');
    console.log('║               ✅ TOUS LES TESTS RÉUSSIS! 🎉                  ║');
    console.log('╚═══════════════════════════════════════════════════════════════╝\n');
    
    console.log('📊 Résultats:');
    console.log('   ✅ Connexion SMTP: OK');
    console.log('   ✅ Email Admin: OK');
    console.log('   ✅ Email Contact: OK\n');
    
    console.log('📬 Vérifications à faire:');
    console.log(`   1. Vérifiez la boîte ${process.env.ADMIN_EMAIL || 'admin@agri-ps.com'}`);
    console.log(`   2. Vérifiez la boîte ${process.env.EMAIL_CONTACT || 'contact@agri-ps.com'}`);
    console.log('   3. Vérifiez que les emails ne sont pas dans SPAM\n');
    
    console.log('🚀 Prochaines étapes:');
    console.log('   1. Si en développement: Testez le formulaire http://localhost:3000/contact');
    console.log('   2. Si en production: Déployez avec ces configurations');
    console.log('   3. Testez une vraie commande pour vérifier Phase 3 & 4\n');

  } catch (error) {
    console.error('\n❌ ERREUR LORS DES TESTS:\n');
    console.error('Type:', error.code || 'UNKNOWN');
    console.error('Message:', error.message);
    
    console.log('\n🔧 SOLUTIONS POSSIBLES:\n');
    
    if (error.code === 'EAUTH') {
      console.log('❌ Erreur d\'authentification (EAUTH):');
      console.log('   - Vérifiez que EMAIL_USER est correct (ex: noreply@agri-ps.com)');
      console.log('   - Vérifiez que EMAIL_PASS est le BON mot de passe Hostinger');
      console.log('   - Assurez-vous que le compte email existe dans Hostinger panel');
      console.log('   - Connectez-vous à https://hpanel.hostinger.com pour vérifier\n');
    }
    
    if (error.code === 'ECONNECTION' || error.code === 'ETIMEDOUT') {
      console.log('❌ Erreur de connexion:');
      console.log('   - Vérifiez que EMAIL_HOST = smtp.hostinger.com');
      console.log('   - Vérifiez EMAIL_PORT (465 pour SSL, 587 pour TLS)');
      console.log('   - Vérifiez votre connexion internet');
      console.log('   - Firewall bloque peut-être le port SMTP\n');
    }
    
    if (error.responseCode === 550) {
      console.log('❌ Email rejeté (550):');
      console.log('   - Email destinataire invalide');
      console.log('   - Vérifiez que admin@agri-ps.com existe\n');
    }
    
    console.log('📖 Documentation Hostinger:');
    console.log('   https://support.hostinger.com/en/articles/1583288-how-to-set-up-an-email-account\n');
    
    process.exit(1);
  }
}

// ─────────────────────────────────────────────────
// 🚀 Exécution
// ─────────────────────────────────────────────────
runTests().catch(error => {
  console.error('❌ Erreur fatale:', error);
  process.exit(1);
});
