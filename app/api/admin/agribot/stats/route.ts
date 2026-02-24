import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Message from '@/models/Message';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = verifyAccessToken(token);
    if (!decoded) return NextResponse.json({ error: 'Token invalide' }, { status: 401 });

    await dbConnect();

    const user = await User.findById(decoded.userId);
    if (!user || !['admin', 'manager'].includes(user.role)) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
    }

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const last7days = new Date(now.getTime() - 7 * 86400 * 1000);

    const [
      totalConversations,
      convsThisMonth,
      convsLast7days,
      statusAgg,
    ] = await Promise.all([
      Message.countDocuments({ type: 'agribot' }),
      Message.countDocuments({ type: 'agribot', createdAt: { $gte: startOfMonth } }),
      Message.countDocuments({ type: 'agribot', createdAt: { $gte: last7days } }),
      Message.aggregate([
        { $match: { type: 'agribot' } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
    ]);

    const statusMap: Record<string, number> = {};
    statusAgg.forEach((s) => { statusMap[s._id] = s.count; });

    // Taux de résolution = conversations "replied" ou "closed" / total
    const resolved = (statusMap['replied'] || 0) + (statusMap['closed'] || 0);
    const resolutionRate = totalConversations > 0
      ? Math.round((resolved / totalConversations) * 100)
      : 0;

    return NextResponse.json({
      totalConversations,
      convsThisMonth,
      convsLast7days,
      resolutionRate,
      statusDistribution: statusMap,
    });
  } catch (error) {
    console.error('Agribot stats error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
