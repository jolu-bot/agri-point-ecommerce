/**
 * Email Service — Nodemailer wrapper
 * Supports: Order confirmations, Follow-up emails, Admin notifications
 */

import nodemailer from 'nodemailer';
import { IOrder } from '@/models/Order';
import { IUser } from '@/models/User';

// -------------------------------------------------
// Configuration Nodemailer
// -------------------------------------------------

const getTransporter = () => {
  // Support pour 3 providers: Gmail, Outlook, Custom SMTP
  const provider = process.env.EMAIL_PROVIDER || 'gmail';

  if (provider === 'gmail') {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD, // App-specific password
      },
    });
  }

  if (provider === 'outlook') {
    return nodemailer.createTransport({
      host: 'smtp.office365.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  // Custom SMTP
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS, // ✅ Fixed: was EMAIL_PASSWORD
    },
  });
};

// -------------------------------------------------
// Email Templates
// -------------------------------------------------

const orderConfirmationTemplate = (order: IOrder) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; background-color: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; background-color: white; padding: 20px; border-radius: 8px; }
    .header { color: #22863a; font-size: 24px; font-weight: bold; margin-bottom: 20px; }
    .section { margin-bottom: 20px; padding: 15px; background-color: #f9f9f9; border-radius: 5px; }
    .items { width: 100%; border-collapse: collapse; }
    .items th { background-color: #22863a; color: white; padding: 10px; text-align: left; }
    .items td { padding: 10px; border-bottom: 1px solid #ddd; }
    .total { font-weight: bold; font-size: 18px; color: #22863a; }
    .footer { color: #666; font-size: 12px; text-align: center; margin-top: 20px; border-top: 1px solid #ddd; padding-top: 20px; }
    .button { background-color: #22863a; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none; display: inline-block; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">✅ Commande Confirmée</div>
    
    <p>Bonjour,</p>
    <p>Merci pour votre commande! Voici les détails:</p>
    
    <div class="section">
      <strong>Numéro de commande:</strong> ${order.orderNumber}<br>
      <strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString('fr-FR')}<br>
      <strong>Email:</strong> ${(order.user as any)?.email || 'N/A'}
    </div>
    
    <div class="section">
      <h3>Produits</h3>
      <table class="items">
        <tr>
          <th>Produit</th>
          <th>Quantité</th>
          <th>Prix</th>
          <th>Total</th>
        </tr>
        ${order.items.map(item => `
          <tr>
            <td>${item.productName}</td>
            <td>${item.quantity}</td>
            <td>${item.price.toLocaleString('fr-FR')} FCFA</td>
            <td>${item.total.toLocaleString('fr-FR')} FCFA</td>
          </tr>
        `).join('')}
      </table>
    </div>
    
    <div class="section">
      <strong>Sous-total:</strong> ${order.subtotal.toLocaleString('fr-FR')} FCFA<br>
      ${order.discount > 0 ? `<strong style="color: green;">Remise:</strong> -${order.discount.toLocaleString('fr-FR')} FCFA<br>` : ''}
      <strong>Livraison:</strong> ${order.shipping.toLocaleString('fr-FR')} FCFA<br>
      <strong>TVA:</strong> ${order.tax.toLocaleString('fr-FR')} FCFA<br>
      <div class="total">Montant total: ${order.total.toLocaleString('fr-FR')} FCFA</div>
    </div>
    
    <div class="section">
      <h3>🚚 Adresse de livraison</h3>
      ${order.shippingAddress.name}<br>
      ${order.shippingAddress.street}<br>
      ${order.shippingAddress.city}, ${order.shippingAddress.region}<br>
      Tél: ${order.shippingAddress.phone}
    </div>
    
    <div class="section">
      <h3>💳 Paiement</h3>
      Méthode: ${order.paymentMethod === 'campost' ? 'Campost' : 'Espèces'}<br>
      Statut: <strong>${order.paymentStatus === 'paid' ? '✅ Payé' : '⏳ En attente'}</strong>
    </div>
    
    <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/commande/${order._id}" class="button">Voir ma commande</a></p>
    
    <div class="footer">
      <p>Merci d'avoir choisi AGRIPOINT SERVICES!</p>
      <p>Pour toute question: <strong>support@agri-ps.com</strong> | 📞 +237 657 39 39 39</p>
    </div>
  </div>
</body>
</html>
`;

const followUpTemplate = (order: IOrder, conversationSummary?: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; }
    .container { max-width: 600px; margin: 0 auto; background-color: white; padding: 20px; }
    .header { color: #22863a; font-size: 20px; font-weight: bold; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">🌾 Suivi de votre demande</div>
    
    <p>Bonjour,</p>
    <p>Nous suivons votre commande <strong>${order.orderNumber}</strong> passée il y a 48 heures.</p>
    
    ${conversationSummary ? `
      <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 15px 0;">
        <h3>Vos questions posées à AgriBot</h3>
        <p>${conversationSummary}</p>
      </div>
    ` : ''}
    
    <h3>📋 État actuel</h3>
    <p><strong>Statut:</strong> ${order.status === 'delivered' ? '✅ Livrée' : order.status === 'shipped' ? '🚚 En transit' : '⏳ En préparation'}</p>
    
    <h3>❓ Des questions?</h3>
    <p>N'hésitez pas à nous contacter ou consultez votre compte pour plus de détails.</p>
    
    <p style="margin-top: 30px; color: #666; font-size: 12px;border-top: 1px solid #ddd; padding-top: 20px;">
      AGRIPOINT SERVICES | support@agri-ps.com | +237 657 39 39 39
    </p>
  </div>
</body>
</html>
`;

const adminNotificationTemplate = (order: IOrder, type: 'new_order' | 'payment_received' | 'shipped') => {
  const titles = {
    new_order: `🛒 Nouvelle commande: ${order.orderNumber}`,
    payment_received: `💰 Paiement reçu: ${order.orderNumber}`,
    shipped: `📦 Commande expédiée: ${order.orderNumber}`,
  };

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
</head>
<body>
  <h2>${titles[type]}</h2>
  <p><strong>Client:</strong> ${(order.user as any)?.name || 'N/A'} (${(order.user as any)?.email || 'N/A'})</p>
  <p><strong>Montant:</strong> ${order.total.toLocaleString('fr-FR')} FCFA</p>
  <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/orders?id=${order._id}">Voir la commande →</a></p>
</body>
</html>
  `;
};

// -------------------------------------------------
// Public Email Functions
// -------------------------------------------------

export const sendOrderConfirmation = async (order: IOrder) => {
  try {
    const transporter = getTransporter();
    const recipientEmail = (order.user as any)?.email;

    if (!recipientEmail) {
      console.error('Email client manquant pour la commande:', order._id);
      return false;
    }

    await transporter.sendMail({
      from: `"AGRIPOINT SERVICES" <${process.env.EMAIL_USER}>`,
      to: recipientEmail,
      subject: `✅ Commande confirmée - ${order.orderNumber}`,
      html: orderConfirmationTemplate(order),
    });

    // Notifier l'admin
    await sendAdminNotification(order, 'new_order');

    console.log(`✅ Email de confirmation envoyé à ${recipientEmail}`);
    return true;
  } catch (error) {
    console.error('Erreur envoi email confirmation:', error);
    return false;
  }
};

export const sendPaymentConfirmation = async (order: IOrder) => {
  try {
    const transporter = getTransporter();
    const recipientEmail = (order.user as any)?.email;

    if (!recipientEmail) return false;

    await transporter.sendMail({
      from: `"AGRIPOINT SERVICES" <${process.env.EMAIL_USER}>`,
      to: recipientEmail,
      subject: `💰 Paiement confirmé - ${order.orderNumber}`,
      html: `<html><body>Paiement de ${order.total.toLocaleString('fr-FR')} FCFA confirmé pour la commande ${order.orderNumber}.</body></html>`,
    });

    await sendAdminNotification(order, 'payment_received');
    return true;
  } catch (error) {
    console.error('Erreur envoi email paiement:', error);
    return false;
  }
};

export const sendFollowUpEmail = async (order: IOrder, conversationSummary?: string) => {
  try {
    const transporter = getTransporter();
    const recipientEmail = (order.user as any)?.email;

    if (!recipientEmail) return false;

    await transporter.sendMail({
      from: `"AGRIPOINT SERVICES" <${process.env.EMAIL_USER}>`,
      to: recipientEmail,
      subject: `🌾 Suivi de votre demande - ${order.orderNumber}`,
      html: followUpTemplate(order, conversationSummary),
    });

    console.log(`✅ Email de suivi envoyé à ${recipientEmail}`);
    return true;
  } catch (error) {
    console.error('Erreur envoi email suivi:', error);
    return false;
  }
};

export const sendAdminNotification = async (order: IOrder, type: 'new_order' | 'payment_received' | 'shipped') => {
  try {
    const transporter = getTransporter();
    const adminEmail = process.env.ADMIN_EMAIL;

    if (!adminEmail) {
      console.warn('ADMIN_EMAIL non configuré');
      return false;
    }

    await transporter.sendMail({
      from: `"AGRIPOINT SERVICES" <${process.env.EMAIL_USER}>`,
      to: adminEmail,
      subject: `[ADMIN] ${type === 'new_order' ? '🛒' : type === 'payment_received' ? '💰' : '📦'} ${order.orderNumber}`,
      html: adminNotificationTemplate(order, type),
    });

    return true;
  } catch (error) {
    console.error('Erreur notification admin:', error);
    return false;
  }
};

export const sendShippingNotification = async (order: IOrder) => {
  try {
    const transporter = getTransporter();
    const recipientEmail = (order.user as any)?.email;

    if (!recipientEmail) return false;

    await transporter.sendMail({
      from: `"AGRIPOINT SERVICES" <${process.env.EMAIL_USER}>`,
      to: recipientEmail,
      subject: `🚚 Votre commande a été expédiée - ${order.orderNumber}`,
      html: `<html><body><h2>Votre commande a été expédiée!</h2><p>Commande: ${order.orderNumber}</p><p>Tracking: En cours</p></body></html>`,
    });

    await sendAdminNotification(order, 'shipped');
    return true;
  } catch (error) {
    console.error('Erreur notification livraison:', error);
    return false;
  }
};

// Tester la configuration email
export const testEmailConfig = async () => {
  try {
    const transporter = getTransporter();
    await transporter.verify();
    console.log('✅ Configuration email valide');
    return true;
  } catch (error) {
    console.error('❌ Erreur configuration email:', error);
    return false;
  }
};
