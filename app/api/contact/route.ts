import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';
import connectDB from '@/lib/db';
import Message from '@/models/Message';

// ─────────────────────────────────────────────────
// 📬 Interface Contact Form Data
// ─────────────────────────────────────────────────
interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
}

// ─────────────────────────────────────────────────
// 📧 POST /api/contact
// ─────────────────────────────────────────────────
// Envoie un email à contact@agri-ps.com avec les détails
// du formulaire de contact, puis envoie une confirmation au client
// ─────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const body: ContactFormData = await request.json();
    
    // ─────────────────────────────────────────────────
    // Validation des champs requis
    // ─────────────────────────────────────────────────
    if (!body.name || !body.email || !body.message) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Champs requis manquants',
          details: 'Nom, email et message sont obligatoires'
        },
        { status: 400 }
      );
    }
    
    // Validation format email basique
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Email invalide',
          details: 'Veuillez fournir une adresse email valide'
        },
        { status: 400 }
      );
    }
    
    // ─────────────────────────────────────────────────
    // 0️⃣ Sauvegarde en base de données (toujours)
    // ─────────────────────────────────────────────────
    try {
      await connectDB();
      await Message.create({
        type: 'contact',
        name: body.name,
        email: body.email,
        phone: body.phone || '',
        subject: body.subject || '',
        message: body.message,
        status: 'new',
        priority: 'medium',
      });
    } catch (dbError) {
      console.warn('⚠️ Sauvegarde MongoDB échouée:', dbError);
      // On continue quand même — l'email peut encore passer
    }

    // ─────────────────────────────────────────────────
    // 1️⃣ Email à l'équipe AGRI PS (contact@agri-ps.com)
    // ─────────────────────────────────────────────────
    const emailToTeam = await sendEmail({
      to: process.env.EMAIL_CONTACT || 'contact@agri-ps.com',
      subject: `📩 Nouveau contact: ${body.subject || 'Sans sujet'}`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      background-color: #f4f4f4;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 20px auto;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .header {
      background: linear-gradient(135deg, #059669 0%, #10b981 100%);
      color: white;
      padding: 30px;
      text-align: center;
      border-radius: 8px 8px 0 0;
    }
    .content {
      padding: 30px;
    }
    .field {
      margin-bottom: 20px;
      padding: 15px;
      background: #f9fafb;
      border-left: 4px solid #059669;
      border-radius: 4px;
    }
    .field-label {
      font-weight: bold;
      color: #059669;
      margin-bottom: 5px;
      font-size: 14px;
      text-transform: uppercase;
    }
    .field-value {
      font-size: 16px;
      color: #333;
    }
    .message-box {
      background: #fff;
      border: 2px solid #e5e7eb;
      border-radius: 8px;
      padding: 20px;
      margin: 20px 0;
      white-space: pre-wrap;
      word-wrap: break-word;
    }
    .footer {
      background: #f9fafb;
      padding: 20px;
      text-align: center;
      border-radius: 0 0 8px 8px;
      font-size: 12px;
      color: #666;
    }
    .actions {
      margin: 30px 0;
      text-align: center;
    }
    .btn {
      display: inline-block;
      padding: 12px 30px;
      background: #059669;
      color: white;
      text-decoration: none;
      border-radius: 6px;
      font-weight: bold;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0; font-size: 24px;">📩 Nouveau Message de Contact</h1>
      <p style="margin: 10px 0 0 0; opacity: 0.9;">AGRIPOINT SERVICES</p>
    </div>
    
    <div class="content">
      <div class="field">
        <div class="field-label">👤 Nom</div>
        <div class="field-value">${body.name}</div>
      </div>
      
      <div class="field">
        <div class="field-label">📧 Email</div>
        <div class="field-value">
          <a href="mailto:${body.email}" style="color: #059669; text-decoration: none;">
            ${body.email}
          </a>
        </div>
      </div>
      
      ${body.phone ? `
      <div class="field">
        <div class="field-label">📱 Téléphone</div>
        <div class="field-value">
          <a href="tel:${body.phone}" style="color: #059669; text-decoration: none;">
            ${body.phone}
          </a>
        </div>
      </div>
      ` : ''}
      
      ${body.subject ? `
      <div class="field">
        <div class="field-label">📋 Sujet</div>
        <div class="field-value">${body.subject}</div>
      </div>
      ` : ''}
      
      <div class="field">
        <div class="field-label">💬 Message</div>
        <div class="message-box">${body.message.replace(/\n/g, '<br>')}</div>
      </div>
      
      <div class="actions">
        <a href="mailto:${body.email}?subject=Re: ${body.subject || 'Votre message'}" class="btn">
          Répondre à ${body.name}
        </a>
      </div>
    </div>
    
    <div class="footer">
      <p>Ce message a été envoyé depuis le formulaire de contact de agri-ps.com</p>
      <p>Heure de réception: ${new Date().toLocaleString('fr-FR', { timeZone: 'Africa/Douala' })}</p>
    </div>
  </div>
</body>
</html>
      `,
    });
    
    if (!emailToTeam) {
      console.warn('⚠️ Email équipe non envoyé — message sauvegardé en base');
    }
    
    // ─────────────────────────────────────────────────
    // 2️⃣ Email de confirmation au client
    // ─────────────────────────────────────────────────
    const emailToClient = await sendEmail({
      to: body.email,
      subject: '✅ Votre message a été reçu - AGRIPOINT SERVICES',
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      background-color: #f4f4f4;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 20px auto;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .header {
      background: linear-gradient(135deg, #059669 0%, #10b981 100%);
      color: white;
      padding: 40px;
      text-align: center;
      border-radius: 8px 8px 0 0;
    }
    .check-icon {
      font-size: 48px;
      margin-bottom: 10px;
    }
    .content {
      padding: 30px;
    }
    .message-recap {
      background: #f9fafb;
      border-left: 4px solid #059669;
      padding: 20px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .contact-info {
      background: #ecfdf5;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
    }
    .footer {
      background: #f9fafb;
      padding: 20px;
      text-align: center;
      border-radius: 0 0 8px 8px;
      font-size: 12px;
      color: #666;
    }
    .btn-whatsapp {
      display: inline-block;
      padding: 12px 30px;
      background: #25D366;
      color: white;
      text-decoration: none;
      border-radius: 6px;
      font-weight: bold;
      margin: 10px 5px;
    }
    .btn-phone {
      display: inline-block;
      padding: 12px 30px;
      background: #059669;
      color: white;
      text-decoration: none;
      border-radius: 6px;
      font-weight: bold;
      margin: 10px 5px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="check-icon">✅</div>
      <h1 style="margin: 0; font-size: 28px;">Message Bien Reçu !</h1>
      <p style="margin: 10px 0 0 0; opacity: 0.9;">Nous vous répondrons dans les plus brefs délais</p>
    </div>
    
    <div class="content">
      <p style="font-size: 16px;">Bonjour <strong>${body.name}</strong>,</p>
      
      <p>
        Nous vous confirmons la bonne réception de votre message. 
        Notre équipe l'examine actuellement et vous répondra dans les <strong>24 heures maximum</strong>.
      </p>
      
      <div class="message-recap">
        <h3 style="margin-top: 0; color: #059669;">📝 Récapitulatif de votre message:</h3>
        ${body.subject ? `<p><strong>Sujet:</strong> ${body.subject}</p>` : ''}
        <p><strong>Message:</strong></p>
        <p style="white-space: pre-wrap; font-style: italic;">${body.message}</p>
      </div>
      
      <div class="contact-info">
        <h3 style="margin-top: 0; color: #059669;">💬 Besoin d'une réponse urgente ?</h3>
        <p>Contactez-nous directement via:</p>
        <div style="text-align: center; margin: 20px 0;">
          <a href="https://wa.me/237${process.env.WHATSAPP_NUMBER || '657393939'}" class="btn-whatsapp">
            💬 WhatsApp
          </a>
          <a href="tel:+237${process.env.WHATSAPP_NUMBER || '657393939'}" class="btn-phone">
            📞 Appeler
          </a>
        </div>
        <p style="text-align: center; font-size: 14px; color: #666;">
          📧 Email: <a href="mailto:contact@agri-ps.com" style="color: #059669;">contact@agri-ps.com</a><br>
          📍 Siège: Bafoussam, Cameroun
        </p>
      </div>
      
      <p style="color: #666; font-style: italic; font-size: 14px;">
        💡 Astuce: Pour un suivi optimal, conservez cet email comme référence.
      </p>
    </div>
    
    <div class="footer">
      <p><strong>AGRIPOINT SERVICES</strong></p>
      <p>Solutions agricoles professionnelles | agri-ps.com</p>
      <p style="margin-top: 15px; font-size: 11px;">
        Cet email a été envoyé automatiquement. Ne pas répondre à cette adresse (noreply).
      </p>
    </div>
  </div>
</body>
</html>
      `,
    });
    
    // Ne pas bloquer si confirmation échoue
    if (!emailToClient) {
      console.warn('⚠️ Email de confirmation au client n\'a pas pu être envoyé');
    }
    
    // ─────────────────────────────────────────────────
    // ✅ Succès
    // ─────────────────────────────────────────────────
    return NextResponse.json({
      success: true,
      message: 'Votre message a été envoyé avec succès. Nous vous répondrons dans les plus brefs délais.',
    });
    
  } catch (error: any) {
    console.error('❌ Contact API error:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Erreur lors de l\'envoi du message',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}
