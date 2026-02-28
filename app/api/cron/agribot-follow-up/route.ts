/**
 * Cron Job pour envoyer des emails de suivi 48h après une conversation AgriBot
 * Point d'accès: GET /api/cron/agribot-follow-up
 * 
 * À configurer dans Vercel:
 * - Ajouter dans vercel.json ou créer un endpoint de cron
 * - Ou utiliser un service externe: EasyCron, Later.com, etc.
 * 
 * Configuration Vercel (vercel.json):
 * {
 *   "crons": [{
 *     "path": "/api/cron/agribot-follow-up",
 *     "schedule": "0 0 * * *"
 *   }]
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import ChatConversation from '@/models/ChatConversation';
import Order from '@/models/Order';
import { sendFollowUpEmail } from '@/lib/email-service';

export const maxDuration = 60; // 60 secondes max pour cron

/**
 * GET /api/cron/agribot-follow-up
 * Envoyer des emails de suivi 48h après une conversation
 */
export async function GET(req: NextRequest) {
  // Vérifier que la requête vient de Vercel Cron
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json(
      { error: 'Non autorisé' },
      { status: 401 }
    );
  }

  try {
    await connectDB();

    // Trouver les conversations d'il y a 48h ± 1h
    const now = new Date();
    const fortyEightHoursAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);
    const windowStart = new Date(fortyEightHoursAgo.getTime() - 60 * 60 * 1000); // -1h
    const windowEnd = new Date(fortyEightHoursAgo.getTime() + 60 * 60 * 1000); // +1h

    const conversations = await ChatConversation.find({
      createdAt: { $gte: windowStart, $lte: windowEnd },
      // Exclure les conversations déjà traitées
      followUpEmailSent: { $ne: true },
      // Seulement si on a un email client
      userEmail: { $exists: true, $ne: null },
    }).lean();

    console.log(`Trouvé ${conversations.length} conversations pour suivi`);

    let successCount = 0;
    let errorCount = 0;

    for (const conv of conversations) {
      try {
        // Trouver la commande associée (si existe)
        let order = null;
        if (conv.orderId) {
          order = await Order.findById(conv.orderId).lean();
        }

        // Créer un résumé de la conversation
        const summary = generateConversationSummary(conv);

        // Si une commande existe, envoyer l'email avec les détails
        if (order) {
          await sendFollowUpEmail(order, summary);
        } else {
          // Sinon, envoyer un email générique
          await sendGenericFollowUpEmail(conv.userEmail, summary);
        }

        // Marquer comme traité
        await ChatConversation.updateOne(
          { _id: conv._id },
          { followUpEmailSent: true, followUpEmailSentAt: now }
        );

        successCount++;
      } catch (err) {
        console.error(`Erreur suivi conversation ${conv._id}:`, err);
        errorCount++;
      }
    }

    return NextResponse.json({
      success: true,
      processedCount: conversations.length,
      successCount,
      errorCount,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Erreur cron suivi AgriBot:', error);
    return NextResponse.json(
      { error: 'Erreur serveur', details: String(error) },
      { status: 500 }
    );
  }
}

/**
 * Générer un résumé de conversation pour l'email
 */
function generateConversationSummary(conversation: any): string {
  if (!conversation.messages || conversation.messages.length === 0) {
    return 'Vous aviez échangé avec AgriBot sur des sujets agricoles.';
  }

  // Extrait les questions posées par l'utilisateur
  const userQuestions = conversation.messages
    .filter((msg: any) => msg.role === 'user')
    .map((msg: any) => msg.content)
    .slice(0, 3); // Limiter à 3 questions

  if (userQuestions.length === 0) {
    return 'Vous aviez échangé avec AgriBot sur des sujets agricoles.';
  }

  const summary = userQuestions
    .map((q: string) => `• ${q.substring(0, 100)}...`)
    .join('\n');

  return `Vos principales questions étaient :\n${summary}`;
}

/**
 * Envoyer un email générique de suivi (si pas de commande)
 */
async function sendGenericFollowUpEmail(email: string, summary: string) {
  // Utiliser nodemailer directement
  const nodemailer = await import('nodemailer');

  const transporter = nodemailer.default.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body>
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2 style="color: #22863a;">🌾 Continuons notre conversation</h2>
    <p>Bonjour,</p>
    <p>Il y a 48h, vous aviez échangé avec AgriBot sur vos besoins agricoles.</p>
    
    <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 15px 0;">
      <h3 style="margin-top: 0;">Votre conversation:</h3>
      <pre style="white-space: pre-wrap; word-wrap: break-word;">${summary}</pre>
    </div>
    
    <p>
      <strong>Vous avez des questions supplémentaires ?</strong><br>
      <a href="${process.env.NEXT_PUBLIC_SITE_URL}" style="color: #22863a; text-decoration: none; font-weight: bold;">
        📱 Continuer la conversation avec AgriBot
      </a>
    </p>
    
    <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
    <p style="color: #666; font-size: 12px;">
      Agri Point Services | support@agri-ps.com | +237 657 39 39 39
    </p>
  </div>
</body>
</html>
  `;

  await transporter.sendMail({
    from: `"Agri Point Services" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: '🌾 Continuons notre conversation - Agri Point Services',
    html,
  });
}
