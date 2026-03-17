import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import CampaignRegistration from '@/models/CampaignRegistration';
import { rateLimit, getClientIp } from '@/lib/rate-limit';
import { sendEmail } from '@/lib/email';

const MINERAL_PRICE = 15000;
const BIO_PRICE = 10000;

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function generateRegNumber(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `CAMP-${ts}-${rand}`;
}

// POST /api/campagne
export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  if (!rateLimit(`campagne:${ip}`, 5, 60 * 60 * 1000)) {
    return NextResponse.json(
      { success: false, error: 'Trop de tentatives. Réessayez dans une heure.' },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const {
      fullName, email, phone,
      cooperativeName, isMember, hasInsurance, insuranceProvider,
      productType, quantity, locale,
    } = body;

    // Validation
    if (!fullName?.trim() || !email?.trim() || !phone?.trim()) {
      return NextResponse.json({ success: false, error: 'Champs requis manquants' }, { status: 400 });
    }
    if (!['mineral', 'bio'].includes(productType)) {
      return NextResponse.json({ success: false, error: 'Type de produit invalide' }, { status: 400 });
    }
    const qty = Number(quantity);
    if (!Number.isInteger(qty) || qty < 6) {
      return NextResponse.json({ success: false, error: 'Quantité minimale : 6' }, { status: 400 });
    }
    if (!isMember || !hasInsurance) {
      return NextResponse.json({ success: false, error: "Conditions d'éligibilité non remplies" }, { status: 400 });
    }
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      return NextResponse.json({ success: false, error: 'Email invalide' }, { status: 400 });
    }

    const unitPrice = productType === 'mineral' ? MINERAL_PRICE : BIO_PRICE;
    const totalAmount = qty * unitPrice;
    const registrationNumber = generateRegNumber();

    await connectDB();
    const reg = await CampaignRegistration.create({
      registrationNumber,
      fullName: escapeHtml(fullName.trim().slice(0, 120)),
      email: email.trim().toLowerCase(),
      phone: escapeHtml(phone.trim().slice(0, 30)),
      cooperativeName: cooperativeName ? escapeHtml(cooperativeName.trim().slice(0, 150)) : undefined,
      isMember: Boolean(isMember),
      hasInsurance: Boolean(hasInsurance),
      insuranceProvider: insuranceProvider ? escapeHtml(insuranceProvider.trim().slice(0, 100)) : undefined,
      productType,
      quantity: qty,
      totalAmount,
      status: 'pending',
      locale: locale === 'en' ? 'en' : 'fr',
    });

    const isEn = locale === 'en';
    const unit = productType === 'mineral'
      ? (isEn ? 'bags × 50 kg' : 'sacs × 50 kg')
      : (isEn ? 'liters' : 'litres');
    const amount70 = Math.round(totalAmount * 0.7).toLocaleString('fr-FR');
    const amount30 = Math.round(totalAmount * 0.3).toLocaleString('fr-FR');

    // Confirmation email to customer
    const customerHtml = isEn ? `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
        <div style="background:linear-gradient(135deg,#10b981,#0d9488);padding:30px;text-align:center;border-radius:12px 12px 0 0;">
          <h1 style="color:white;margin:0;font-size:24px;">✅ Registration Confirmed</h1>
          <p style="color:rgba(255,255,255,0.9);margin:8px 0 0;">AGRIPOINT SERVICES — Fertilizer Campaign 2026</p>
        </div>
        <div style="padding:30px;background:#fff;">
          <p>Hello <strong>${escapeHtml(fullName.trim())}</strong>,</p>
          <p>Your registration for the subsidised fertilizer campaign has been received. Our team will contact you within <strong>24 hours via WhatsApp</strong> to finalise your order.</p>
          <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:20px;margin:20px 0;">
            <p style="margin:0 0 8px;font-weight:bold;color:#166534;">Registration Summary</p>
            <table style="width:100%;border-collapse:collapse;font-size:14px;">
              <tr><td style="padding:6px 0;color:#555;">Registration N°</td><td style="text-align:right;font-weight:bold;">${registrationNumber}</td></tr>
              <tr><td style="padding:6px 0;color:#555;">Product</td><td style="text-align:right;">${productType === 'mineral' ? 'Mineral Fertilizers' : 'Biofertilizers'}</td></tr>
              <tr><td style="padding:6px 0;color:#555;">Quantity</td><td style="text-align:right;">${qty} ${unit}</td></tr>
              <tr><td style="padding:6px 0;color:#555;">Total amount</td><td style="text-align:right;font-weight:bold;">${totalAmount.toLocaleString('fr-FR')} FCFA</td></tr>
              <tr><td style="padding:6px 0;color:#10b981;font-weight:bold;">70% at registration</td><td style="text-align:right;font-weight:bold;">${amount70} FCFA</td></tr>
              <tr><td style="padding:6px 0;color:#f59e0b;font-weight:bold;">30% from April 15</td><td style="text-align:right;font-weight:bold;">${amount30} FCFA</td></tr>
            </table>
          </div>
          <p style="color:#666;font-size:13px;">Questions? Contact us: support@agri-ps.com</p>
        </div>
        <div style="background:#f9fafb;padding:16px;text-align:center;color:#999;font-size:12px;border-radius:0 0 12px 12px;">
          © 2026 AGRIPOINT SERVICES SARL. All rights reserved.
        </div>
      </div>
    ` : `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
        <div style="background:linear-gradient(135deg,#10b981,#0d9488);padding:30px;text-align:center;border-radius:12px 12px 0 0;">
          <h1 style="color:white;margin:0;font-size:24px;">✅ Inscription Confirmée</h1>
          <p style="color:rgba(255,255,255,0.9);margin:8px 0 0;">AGRIPOINT SERVICES — Campagne Engrais 2026</p>
        </div>
        <div style="padding:30px;background:#fff;">
          <p>Bonjour <strong>${escapeHtml(fullName.trim())}</strong>,</p>
          <p>Votre inscription à la campagne engrais subventionnés a bien été reçue. Notre équipe vous contactera sous <strong>24h via WhatsApp</strong> pour finaliser votre commande.</p>
          <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:20px;margin:20px 0;">
            <p style="margin:0 0 8px;font-weight:bold;color:#166534;">Récapitulatif de votre inscription</p>
            <table style="width:100%;border-collapse:collapse;font-size:14px;">
              <tr><td style="padding:6px 0;color:#555;">N° d'inscription</td><td style="text-align:right;font-weight:bold;">${registrationNumber}</td></tr>
              <tr><td style="padding:6px 0;color:#555;">Produit</td><td style="text-align:right;">${productType === 'mineral' ? 'Engrais Minéraux' : 'Biofertilisants'}</td></tr>
              <tr><td style="padding:6px 0;color:#555;">Quantité</td><td style="text-align:right;">${qty} ${unit}</td></tr>
              <tr><td style="padding:6px 0;color:#555;">Montant total</td><td style="text-align:right;font-weight:bold;">${totalAmount.toLocaleString('fr-FR')} FCFA</td></tr>
              <tr><td style="padding:6px 0;color:#10b981;font-weight:bold;">70% à l'inscription</td><td style="text-align:right;font-weight:bold;">${amount70} FCFA</td></tr>
              <tr><td style="padding:6px 0;color:#f59e0b;font-weight:bold;">30% à partir du 15 avril</td><td style="text-align:right;font-weight:bold;">${amount30} FCFA</td></tr>
            </table>
          </div>
          <p style="color:#666;font-size:13px;">Questions ? Contactez-nous : support@agri-ps.com</p>
        </div>
        <div style="background:#f9fafb;padding:16px;text-align:center;color:#999;font-size:12px;border-radius:0 0 12px 12px;">
          © 2026 AGRIPOINT SERVICES SARL. Tous droits réservés.
        </div>
      </div>
    `;

    // Fire-and-forget emails (don't block response)
    sendEmail({
      to: email.trim(),
      subject: isEn ? `Registration Confirmed — ${registrationNumber}` : `Inscription confirmée — ${registrationNumber}`,
      html: customerHtml,
    }).catch(() => {});

    const adminEmails = (process.env.EMAIL_ADMIN_RECEIVERS?.split(',') || [process.env.EMAIL_USER] || []).filter(Boolean) as string[];
    if (adminEmails.length > 0) {
      sendEmail({
        to: adminEmails,
        subject: `📋 Nouvelle inscription campagne: ${fullName.trim()} (${qty} ${productType})`,
        html: `<p><b>N°:</b> ${registrationNumber}</p><p><b>Nom:</b> ${escapeHtml(fullName.trim())}</p><p><b>Email:</b> ${email.trim()}</p><p><b>Tél:</b> ${escapeHtml(phone.trim())}</p><p><b>Coopérative:</b> ${escapeHtml(cooperativeName || '—')}</p><p><b>Produit:</b> ${productType} × ${qty}</p><p><b>Montant:</b> ${totalAmount.toLocaleString('fr-FR')} FCFA</p><p><a href="${process.env.NEXT_PUBLIC_SITE_URL || ''}/admin/campaigns">Voir dans l'admin →</a></p>`,
      }).catch(() => {});
    }

    return NextResponse.json({ success: true, registrationNumber }, { status: 201 });
  } catch (err) {
    console.error('[campagne POST]', err);
    return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 });
  }
}
