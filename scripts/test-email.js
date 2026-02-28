#!/usr/bin/env node
/**
 * Script de Test du Service Email
 * Usage: node scripts/test-email.js
 */

const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const path = require('path');

// Charger les variables d'environnement
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });
if (!process.env.EMAIL_USER) {
  dotenv.config({ path: path.join(__dirname, '..', '.env') });
}

const {
  EMAIL_USER,
  EMAIL_PASS,
  EMAIL_HOST = 'smtp.gmail.com',
  EMAIL_PORT = 587,
  EMAIL_FROM,
} = process.env;

async function testEmail() {
  console.log('🧪 Test du Service Email\n');
  console.log('Configuration:');
  console.log(`  Email: ${EMAIL_USER}`);
  console.log(`  Host: ${EMAIL_HOST}`);
  console.log(`  Port: ${EMAIL_PORT}`);
  console.log(`  From: ${EMAIL_FROM || EMAIL_USER}\n`);

  if (!EMAIL_USER || !EMAIL_PASS) {
    console.error('❌ Erreur: EMAIL_USER ou EMAIL_PASS non configuré');
    console.log('\nConfiguration requise dans .env.local:');
    console.log('  EMAIL_USER=votre.email@gmail.com');
    console.log('  EMAIL_PASS=votre_app_password');
    process.exit(1);
  }

  try {
    // Créer le transporter
    const transporter = nodemailer.createTransport({
      host: EMAIL_HOST,
      port: parseInt(EMAIL_PORT),
      secure: parseInt(EMAIL_PORT) === 465,
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
      },
    });

    console.log('📡 Vérification de la connexion SMTP...');
    await transporter.verify();
    console.log('✅ Connexion SMTP réussie\n');

    // Test 1: Email simple de test
    console.log('📧 Test 1: Email de test simple');
    const result1 = await transporter.sendMail({
      from: EMAIL_FROM || EMAIL_USER,
      to: EMAIL_USER, // Envoyer à soi-même pour le test
      subject: '[TEST] ✅ Service Email Agri Point',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px;">
          <h2>✅ Connexion Email Réussie</h2>
          <p>Cet email a été envoyé à: <strong>${new Date().toLocaleTimeString('fr-FR')}</strong></p>
          <p>Le service d'email fonction correctement !</p>
          <hr>
          <p style="color: #666; font-size: 12px;">
            Cet email a été généré par le script de test automatique.
          </p>
        </div>
      `,
      text: 'Service email fonctionne correctement',
    });
    console.log(`✅ Email envoyé - ID: ${result1.messageId}\n`);

    // Test 2: Confirmation de commande
    console.log('📧 Test 2: Email de confirmation de commande');
    const result2 = await transporter.sendMail({
      from: EMAIL_FROM || EMAIL_USER,
      to: EMAIL_USER,
      subject: 'Commande Confirmée #CMD-TEST-001',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #10b981; color: white; padding: 20px; text-align: center;">
            <h1>✅ Commande Confirmée</h1>
          </div>
          
          <div style="padding: 20px;">
            <p>Bonjour <strong>Client Test</strong>,</p>
            
            <p>Merci pour votre commande ! Nous l'avons bien reçue.</p>
            
            <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Numéro de Commande:</strong> CMD-TEST-001</p>
              <p><strong>Montant Total:</strong> 45 000 FCFA</p>
              <p><strong>Date:</strong> ${new Date().toLocaleDateString('fr-FR')}</p>
            </div>
            
            <p>Nous vous enverrons un email supplémentaire dès que votre commande sera expédiée.</p>
            
            <p style="color: #666;">
              Questions ? Contactez-nous à support@agripoint.cm
            </p>
          </div>
          
          <div style="background: #f9fafb; padding: 20px; text-align: center; color: #666; font-size: 12px;">
            <p>© 2026 Agri Point Service. Tous droits réservés.</p>
          </div>
        </div>
      `,
    });
    console.log(`✅ Email confirmation envoyé - ID: ${result2.messageId}\n`);

    // Test 3: Récapitulatif journalier
    console.log('📧 Test 3: Email de récapitulatif journalier');
    const result3 = await transporter.sendMail({
      from: EMAIL_FROM || EMAIL_USER,
      to: EMAIL_USER,
      subject: `Récapitulatif Journalier - ${new Date().toLocaleDateString('fr-FR')}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>📊 Récapitulatif Journalier</h2>
          <p>${new Date().toLocaleDateString('fr-FR')}</p>
          
          <table style="width: 100%; border-collapse: collapse;">
            <tr style="background: #f3f4f6;">
              <td style="padding: 10px; border: 1px solid #ddd;"><strong>Commandes</strong></td>
              <td style="padding: 10px; border: 1px solid #ddd;">12</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd;"><strong>Chiffre d'Affaires</strong></td>
              <td style="padding: 10px; border: 1px solid #ddd;">540 000 FCFA</td>
            </tr>
            <tr style="background: #f3f4f6;">
              <td style="padding: 10px; border: 1px solid #ddd;"><strong>Nouveaux Clients</strong></td>
              <td style="padding: 10px; border: 1px solid #ddd;">5</td>
            </tr>
          </table>
        </div>
      `,
    });
    console.log(`✅ Email récapitulatif envoyé - ID: ${result3.messageId}\n`);

    console.log('✅ Tous les tests sont passés !');
    console.log('\n📧 Vérifiez votre boîte de réception pour voir les emails de test.');
    console.log('💡 Les emails ont été envoyés à votre adresse EMAIL_USER pour test.');
  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
    console.error('\n🔍 Diagnostique:');

    if (error.message.includes('invalid login')) {
      console.error('  • Erreur: Authentification échouée');
      console.error('  • Vérifiez EMAIL_USER et EMAIL_PASS dans .env.local');
      console.error('  • Pour Gmail: Utilisez une "App Password" not votre password classique');
      console.error('  • Voir: https://support.google.com/accounts/answer/185833');
    } else if (error.message.includes('ECONNREFUSED')) {
      console.error('  • Erreur: Connexion refusée au serveur SMTP');
      console.error('  • Vérifiez EMAIL_HOST et EMAIL_PORT');
    } else {
      console.error('  •', error.message);
    }
    process.exit(1);
  }
}

testEmail();
