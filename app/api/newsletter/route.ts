import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import NewsletterSubscriber from '@/models/NewsletterSubscriber';

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
      return NextResponse.json({ success: true, resubscribed: true });
    }

    await NewsletterSubscriber.create({
      email: email.toLowerCase(),
      locale,
      source,
    });

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
