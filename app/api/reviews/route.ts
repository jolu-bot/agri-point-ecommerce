import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Review from '@/models/Review';
import { rateLimit, getClientIp } from '@/lib/rate-limit';

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// GET /api/reviews?productId=xxx
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get('productId');

  if (!productId) {
    return NextResponse.json({ success: false, error: 'productId requis' }, { status: 400 });
  }

  try {
    await connectDB();
    const reviews = await Review.find({ productId, verified: true })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    const total = reviews.length;
    const average =
      total > 0
        ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / total) * 10) / 10
        : 0;

    return NextResponse.json({ success: true, reviews, average, total });
  } catch {
    return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 });
  }
}

// POST /api/reviews
export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  if (!rateLimit(`reviews:${ip}`, 10, 60 * 60 * 1000)) {
    return NextResponse.json(
      { success: false, error: 'Trop d\'avis. Réessayez dans une heure.' },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const { productId, userName, rating, text } = body;

    if (!productId || !userName?.trim() || !text?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Champs requis manquants' },
        { status: 400 }
      );
    }

    const ratingNum = Number(rating);
    if (!Number.isInteger(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return NextResponse.json(
        { success: false, error: 'Note invalide (1-5)' },
        { status: 400 }
      );
    }

    await connectDB();

    const review = await Review.create({
      productId,
      userName: escapeHtml(userName.trim().slice(0, 80)),
      rating: ratingNum,
      text: escapeHtml(text.trim().slice(0, 2000)),
      userId: body.userId,
    });

    return NextResponse.json({ success: true, review }, { status: 201 });
  } catch {
    return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 });
  }
}
