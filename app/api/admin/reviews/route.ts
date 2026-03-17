import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Review from '@/models/Review';
import { verifyAccessToken } from '@/lib/auth';

function requireAdmin(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  const decoded = verifyAccessToken(authHeader.substring(7));
  if (!decoded || !['admin', 'editor'].includes(decoded.role)) return null;
  return decoded;
}

// GET /api/admin/reviews?page=1&limit=20&filter=all|pending|approved&productId=xxx
export async function GET(request: NextRequest) {
  if (!requireAdmin(request)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, Number(searchParams.get('page') || 1));
  const limit = Math.min(50, Math.max(1, Number(searchParams.get('limit') || 20)));
  const filter = searchParams.get('filter') || 'all';
  const productId = searchParams.get('productId');

  const query: Record<string, unknown> = {};
  if (filter === 'pending') query.verified = false;
  if (filter === 'approved') query.verified = true;
  if (productId) query.productId = productId;

  try {
    await connectDB();
    const [reviews, total] = await Promise.all([
      Review.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      Review.countDocuments(query),
    ]);
    return NextResponse.json({ success: true, reviews, total, page, pages: Math.ceil(total / limit) });
  } catch {
    return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 });
  }
}

// PATCH /api/admin/reviews  body: { id, action: 'approve'|'delete' }
export async function PATCH(request: NextRequest) {
  if (!requireAdmin(request)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id, action } = await request.json();
    if (!id || !['approve', 'delete'].includes(action)) {
      return NextResponse.json({ success: false, error: 'Paramètres invalides' }, { status: 400 });
    }

    await connectDB();
    if (action === 'delete') {
      await Review.findByIdAndDelete(id);
      return NextResponse.json({ success: true, action: 'deleted' });
    }
    // approve
    const review = await Review.findByIdAndUpdate(id, { verified: true }, { new: true });
    if (!review) return NextResponse.json({ success: false, error: 'Introuvable' }, { status: 404 });
    return NextResponse.json({ success: true, review });
  } catch {
    return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 });
  }
}
