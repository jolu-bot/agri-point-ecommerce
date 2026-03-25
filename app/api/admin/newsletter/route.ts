import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import NewsletterSubscriber from '@/models/NewsletterSubscriber';
import { sendEmail } from '@/lib/email';
import { verifyAccessToken } from '@/lib/auth';
import { rateLimit, getClientIp } from '@/lib/rate-limit';

function requireAdmin(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  const decoded = verifyAccessToken(authHeader.substring(7));
  if (!decoded || decoded.role !== 'admin') return null;
  return decoded;
}

// GET /api/admin/newsletter — stats abonnés
export async function GET(request: NextRequest) {
  if (!requireAdmin(request)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  try {
    await connectDB();
    const [total, active, fr, en] = await Promise.all([
      NewsletterSubscriber.countDocuments(),
      NewsletterSubscriber.countDocuments({ subscribed: true }),
      NewsletterSubscriber.countDocuments({ subscribed: true, locale: 'fr' }),
      NewsletterSubscriber.countDocuments({ subscribed: true, locale: 'en' }),
    ]);
    return NextResponse.json({ success: true, stats: { total, active, unsubscribed: total - active, fr, en } });
  } catch {
    return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 });
  }
}

// POST /api/admin/newsletter  body: { subject, html, locale?: 'fr'|'en'|'all' }
export async function POST(request: NextRequest) {
  if (!requireAdmin(request)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const ip = getClientIp(request);
  if (!rateLimit(`newsletter-send:${ip}`, 3, 60 * 60 * 1000)) {
    return NextResponse.json({ success: false, error: 'Trop d\'envois. Attendez 1h.' }, { status: 429 });
  }

  try {
    const { subject, html, locale } = await request.json();
    if (!subject?.trim() || !html?.trim()) {
      return NextResponse.json({ success: false, error: 'Sujet et contenu requis' }, { status: 400 });
    }

    await connectDB();
    const query: Record<string, unknown> = { subscribed: true };
    if (locale === 'fr' || locale === 'en') query.locale = locale;

    const subscribers = await NewsletterSubscriber.find(query).select('email').lean<{ email: string }[]>();
    if (subscribers.length === 0) {
      return NextResponse.json({ success: true, sent: 0, message: 'Aucun abonné actif' });
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://agri-ps.com';
    const wrappedHtml = `
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;">
  <div style="background:linear-gradient(135deg,#059669,#0d9488);padding:24px;text-align:center;">
    <p style="color:rgba(255,255,255,0.85);margin:0;font-size:13px;letter-spacing:1px;text-transform:uppercase;">AGRIPOINT SERVICES SARL</p>
  </div>
  <div style="padding:28px 24px;">
    ${html}
  </div>
  <div style="background:#f9fafb;padding:16px 24px;text-align:center;color:#9ca3af;font-size:12px;">
    <p style="margin:0;">© 2026 AGRIPOINT SERVICES — Cameroun</p>
    <p style="margin:6px 0 0;"><a href="${siteUrl}/api/newsletter?token={{TOKEN}}" style="color:#9ca3af;">Se désinscrire</a></p>
  </div>
</div>`;

    // Batch send — 10 at a time with individual unsubscribe tokens
    const allSubscribers = await NewsletterSubscriber.find(query).select('email unsubscribeToken').lean<{ email: string; unsubscribeToken: string }[]>();
    let sent = 0;
    let failed = 0;

    const BATCH = 10;
    for (let i = 0; i < allSubscribers.length; i += BATCH) {
      const batch = allSubscribers.slice(i, i + BATCH);
      const results = await Promise.allSettled(
        batch.map(s =>
          sendEmail({
            to: s.email,
            subject: subject.trim(),
            html: wrappedHtml.replace('{{TOKEN}}', s.unsubscribeToken),
          })
        )
      );
      sent += results.filter(r => r.status === 'fulfilled' && r.value).length;
      failed += results.filter(r => r.status === 'rejected' || (r.status === 'fulfilled' && !r.value)).length;
    }

    return NextResponse.json({ success: true, sent, failed, total: allSubscribers.length });
  } catch {
    return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 });
  }
}
