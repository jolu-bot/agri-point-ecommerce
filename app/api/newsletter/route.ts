import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import NewsletterSubscriber from '@/models/NewsletterSubscriber';
import { sendEmail } from '@/lib/email';

function buildWelcomeEmail(locale: string, unsubscribeToken: string): string {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://agri-ps.com';
  const unsubscribeUrl = `${siteUrl}/api/newsletter?token=${unsubscribeToken}`;
  if (locale === 'en') {
    return `
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;">
  <div style="background:#059669;padding:32px 24px;text-align:center;">
    <h1 style="color:#fff;margin:0;font-size:24px;">🌱 Welcome to the AgriPoint Newsletter!</h1>
  </div>
  <div style="padding:28px 24px;">
    <p style="color:#374151;font-size:15px;">Thank you for subscribing to the <strong>AGRIPOINT SERVICES</strong> newsletter.</p>
    <p style="color:#374151;font-size:15px;">You will now receive:</p>
    <ul style="color:#374151;font-size:14px;line-height:2;">
      <li>🌾 Agricultural tips and best practices</li>
      <li>🎁 Exclusive promotions and discount codes</li>
      <li>📢 News about our events and new products</li>
    </ul>
    <div style="text-align:center;margin:28px 0;">
      <a href="${siteUrl}/produits" style="background:#059669;color:#fff;padding:13px 28px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:15px;">
        Browse our products
      </a>
    </div>
  </div>
  <div style="background:#f9fafb;padding:16px 24px;text-align:center;color:#9ca3af;font-size:12px;">
    <p style="margin:0;">© 2026 AGRIPOINT SERVICES — Cameroon</p>
    <p style="margin:6px 0 0;"><a href="${unsubscribeUrl}" style="color:#9ca3af;">Unsubscribe</a></p>
  </div>
</div>`;
  }
  return `
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;">
  <div style="background:#059669;padding:32px 24px;text-align:center;">
    <h1 style="color:#fff;margin:0;font-size:24px;">🌱 Bienvenue dans la newsletter AgriPoint !</h1>
  </div>
  <div style="padding:28px 24px;">
    <p style="color:#374151;font-size:15px;">Merci de vous être abonné(e) à la newsletter <strong>AGRIPOINT SERVICES</strong>.</p>
    <p style="color:#374151;font-size:15px;">Vous recevrez désormais :</p>
    <ul style="color:#374151;font-size:14px;line-height:2;">
      <li>🌾 Des conseils agricoles et bonnes pratiques</li>
      <li>🎁 Des promotions exclusives et codes de réduction</li>
      <li>📢 Les actualités de nos événements et nouveaux produits</li>
    </ul>
    <div style="text-align:center;margin:28px 0;">
      <a href="${siteUrl}/produits" style="background:#059669;color:#fff;padding:13px 28px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:15px;">
        Découvrir nos produits
      </a>
    </div>
  </div>
  <div style="background:#f9fafb;padding:16px 24px;text-align:center;color:#9ca3af;font-size:12px;">
    <p style="margin:0;">© 2026 AGRIPOINT SERVICES — Cameroun</p>
    <p style="margin:6px 0 0;"><a href="${unsubscribeUrl}" style="color:#9ca3af;">Se désinscrire</a></p>
  </div>
</div>`;
}

/**
 * POST /api/newsletter
 * Subscribe to newsletter
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, locale = 'fr', source = 'homepage' } = body;

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json(
        { error: locale === 'en' ? 'Invalid email address' : 'Adresse email invalide' },
        { status: 400 }
      );
    }

    await connectDB();

    const existing = await NewsletterSubscriber.findOne({ email: email.toLowerCase() });

    if (existing) {
      if (existing.subscribed) {
        // Already subscribed — return success silently (don't reveal email existence)
        return NextResponse.json({ success: true, alreadySubscribed: true });
      }
      // Re-subscribe
      existing.subscribed = true;
      existing.subscribedAt = new Date();
      existing.unsubscribedAt = undefined;
      existing.locale = locale;
      await existing.save();
      // Fire-and-forget welcome email
      sendEmail({
        to: existing.email,
        subject: locale === 'en' ? 'Welcome back to AgriPoint Newsletter!' : 'Content de vous retrouver — AGRIPOINT Newsletter',
        html: buildWelcomeEmail(locale, existing.unsubscribeToken),
      }).catch(() => {});
      return NextResponse.json({ success: true, resubscribed: true });
    }

    const newSubscriber = await NewsletterSubscriber.create({
      email: email.toLowerCase(),
      locale,
      source,
    });

    // Fire-and-forget welcome email
    sendEmail({
      to: newSubscriber.email,
      subject: locale === 'en' ? 'Welcome to the AgriPoint Newsletter!' : 'Bienvenue dans la newsletter AGRIPOINT !',
      html: buildWelcomeEmail(locale, newSubscriber.unsubscribeToken),
    }).catch(() => {});

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Newsletter] Subscribe error:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/newsletter?token=...
 * Unsubscribe via token (from email footer link)
 */
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token');

  if (!token) {
    return NextResponse.json({ error: 'Token manquant' }, { status: 400 });
  }

  try {
    await connectDB();

    const subscriber = await NewsletterSubscriber.findOne({ unsubscribeToken: token });

    if (!subscriber) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 404 });
    }

    subscriber.subscribed = false;
    subscriber.unsubscribedAt = new Date();
    await subscriber.save();

    return NextResponse.json({ success: true, message: 'Vous avez été désinscrit avec succès.' });
  } catch (error) {
    console.error('[Newsletter] Unsubscribe error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
