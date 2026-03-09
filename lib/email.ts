import nodemailer from 'nodemailer';
import { Resend } from 'resend';

interface EmailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
}

/**
 * Service Email — Resend (HTTP API) en priorité, SMTP en fallback
 * 
 * Priorité 1: RESEND_API_KEY → Resend (fiable sur Vercel serverless)
 * Priorité 2: EMAIL_USER + EMAIL_PASS → Nodemailer SMTP (Hostinger)
 */

// ─── Resend (HTTP API, recommandé pour Vercel) ───────────────────────────────
async function sendViaResend(options: EmailOptions): Promise<boolean> {
  const resend = new Resend(process.env.RESEND_API_KEY);
  try {
    const { error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'AGRIPOINT SERVICES <noreply@agri-ps.com>',
      to: Array.isArray(options.to) ? options.to : [options.to],
      subject: options.subject,
      html: options.html || options.text || '',
    });
    if (error) {
      console.error('❌ Resend error:', error);
      return false;
    }
    console.log('✅ Email envoyé via Resend');
    return true;
  } catch (err) {
    console.error('❌ Resend exception:', err);
    return false;
  }
}

// ─── SMTP Nodemailer (Hostinger) ─────────────────────────────────────────────
async function sendViaSMTP(options: EmailOptions): Promise<boolean> {
  const emailUser = process.env.EMAIL_USER;
  const emailPassword = process.env.EMAIL_PASS;
  const emailHost = process.env.EMAIL_HOST || 'smtp.hostinger.com';
  const emailPort = process.env.EMAIL_PORT ? parseInt(process.env.EMAIL_PORT) : 465;

  if (!emailUser || !emailPassword) {
    console.warn('⚠️  SMTP non configuré (EMAIL_USER / EMAIL_PASS manquants)');
    return false;
  }

  // Nouveau transporter à chaque fois (serverless-safe, pas de connexion stale)
  const transport = nodemailer.createTransport({
    host: emailHost,
    port: emailPort,
    secure: emailPort === 465,
    auth: { user: emailUser, pass: emailPassword },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
  });

  try {
    const info = await transport.sendMail({
      from: process.env.EMAIL_FROM || emailUser,
      to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
      subject: options.subject,
      html: options.html || options.text,
      text: options.text,
    });
    console.log('✅ Email envoyé via SMTP:', info.messageId);
    return true;
  } catch (error) {
    console.error('❌ SMTP erreur:', error);
    return false;
  } finally {
    transport.close();
  }
}

/**
 * Envoyer un email — auto-sélection Resend ou SMTP
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  // Priorité 1: Resend (API HTTP, fonctionne sur Vercel)
  if (process.env.RESEND_API_KEY) {
    return sendViaResend(options);
  }
  // Priorité 2: SMTP Hostinger
  return sendViaSMTP(options);
}

/**
 * Envoyer un email de confirmation de commande
 */
export async function sendOrderConfirmation(
  customerEmail: string,
  orderId: string,
  customerName: string,
  total: number
) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #10b981; color: white; padding: 20px; text-align: center;">
        <h1>✅ Commande Confirmée</h1>
      </div>
      
      <div style="padding: 20px;">
        <p>Bonjour <strong>${customerName}</strong>,</p>
        
        <p>Merci pour votre commande ! Nous l'avons bien reçue.</p>
        
        <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Numéro de Commande:</strong> ${orderId}</p>
          <p><strong>Montant Total:</strong> ${total.toLocaleString('fr-FR')} FCFA</p>
          <p><strong>Date:</strong> ${new Date().toLocaleDateString('fr-FR')}</p>
        </div>
        
        <p>Nous vous enverrons un email supplémentaire dès que votre commande sera expédiée.</p>
        
        <p style="color: #666;">
          Questions ? Contactez-nous à support@agripoint.cm
        </p>
      </div>
      
      <div style="background: #f9fafb; padding: 20px; text-align: center; color: #666; font-size: 12px;">
        <p>© 2026 AGRIPOINT SERVICES. Tous droits réservés.</p>
      </div>
    </div>
  `;

  return sendEmail({
    to: customerEmail,
    subject: `Commande Confirmée #${orderId}`,
    html,
  });
}

/**
 * Envoyer un email admin pour nouvelle commande
 */
export async function sendAdminOrderNotification(
  orderId: string,
  customerName: string,
  customerEmail: string,
  total: number
) {
  const adminEmails = process.env.EMAIL_ADMIN_RECEIVERS?.split(',') || [process.env.EMAIL_USER] || [];

  const html = `
    <div style="font-family: Arial, sans-serif;">
      <h2>🔔 Nouvelle Commande</h2>
      <p><strong>Commande ID:</strong> ${orderId}</p>
      <p><strong>Client:</strong> ${customerName} (${customerEmail})</p>
      <p><strong>Montant:</strong> ${total.toLocaleString('fr-FR')} FCFA</p>
      <p><strong>Date:</strong> ${new Date().toLocaleString('fr-FR')}</p>
      
      <p>
        <a href="${process.env.NEXT_PUBLIC_SITE_URL}/admin/orders" style="background: #10b981; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
          Voir la Commande
        </a>
      </p>
    </div>
  `;

  return sendEmail({
    to: adminEmails,
    subject: `Nouvelle Commande: ${orderId}`,
    html,
  });
}

/**
 * Envoyer un récapitulatif journalier
 */
export async function sendDailySummary(
  stats: {
    totalOrders: number;
    totalRevenue: number;
    newCustomers: number;
  }
) {
  const adminEmails = process.env.EMAIL_ADMIN_RECEIVERS?.split(',') || [process.env.EMAIL_USER] || [];

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>📊 Récapitulatif Journalier</h2>
      <p>${new Date().toLocaleDateString('fr-FR')}</p>
      
      <table style="width: 100%; border-collapse: collapse;">
        <tr style="background: #f3f4f6;">
          <td style="padding: 10px; border: 1px solid #ddd;"><strong>Commandes</strong></td>
          <td style="padding: 10px; border: 1px solid #ddd;">${stats.totalOrders}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd;"><strong>Chiffre d'Affaires</strong></td>
          <td style="padding: 10px; border: 1px solid #ddd;">${stats.totalRevenue.toLocaleString('fr-FR')} FCFA</td>
        </tr>
        <tr style="background: #f3f4f6;">
          <td style="padding: 10px; border: 1px solid #ddd;"><strong>Nouveaux Clients</strong></td>
          <td style="padding: 10px; border: 1px solid #ddd;">${stats.newCustomers}</td>
        </tr>
      </table>
    </div>
  `;

  return sendEmail({
    to: adminEmails,
    subject: `Récapitulatif Journalier - ${new Date().toLocaleDateString('fr-FR')}`,
    html,
  });
}

export default {
  sendEmail,
  sendOrderConfirmation,
  sendAdminOrderNotification,
  sendDailySummary,
};
