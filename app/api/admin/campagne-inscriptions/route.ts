import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import CampaignRegistration from '@/models/CampaignRegistration';
import { verifyAccessToken } from '@/lib/auth';

function requireAdmin(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  const decoded = verifyAccessToken(authHeader.substring(7));
  if (!decoded || !['admin', 'editor'].includes(decoded.role)) return null;
  return decoded;
}

// GET /api/admin/campagne-inscriptions?page=1&limit=20&status=all|pending|confirmed|cancelled
export async function GET(request: NextRequest) {
  if (!requireAdmin(request)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, Number(searchParams.get('page') || 1));
  const limit = Math.min(100, Math.max(1, Number(searchParams.get('limit') || 20)));
  const status = searchParams.get('status') || 'all';

  const query: Record<string, unknown> = {};
  if (status !== 'all') query.status = status;

  try {
    await connectDB();
    const [registrations, total, stats] = await Promise.all([
      CampaignRegistration.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      CampaignRegistration.countDocuments(query),
      CampaignRegistration.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalAmount: { $sum: '$totalAmount' },
          },
        },
      ]),
    ]);

    const summary = { pending: 0, confirmed: 0, cancelled: 0, totalAmount: 0 };
    for (const s of stats) {
      if (s._id === 'pending') { summary.pending = s.count; summary.totalAmount += s.totalAmount; }
      if (s._id === 'confirmed') { summary.confirmed = s.count; summary.totalAmount += s.totalAmount; }
      if (s._id === 'cancelled') summary.cancelled = s.count;
    }

    return NextResponse.json({
      success: true,
      registrations,
      total,
      page,
      pages: Math.ceil(total / limit),
      summary,
    });
  } catch {
    return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 });
  }
}

// PATCH /api/admin/campagne-inscriptions  body: { id, status: 'confirmed'|'cancelled' }
export async function PATCH(request: NextRequest) {
  if (!requireAdmin(request)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id, status } = await request.json();
    if (!id || !['confirmed', 'cancelled'].includes(status)) {
      return NextResponse.json({ success: false, error: 'Paramètres invalides' }, { status: 400 });
    }

    await connectDB();
    const reg = await CampaignRegistration.findByIdAndUpdate(id, { status }, { new: true });
    if (!reg) return NextResponse.json({ success: false, error: 'Introuvable' }, { status: 404 });
    return NextResponse.json({ success: true, registration: reg });
  } catch {
    return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 });
  }
}
