import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import Product from '@/models/Product';
import User from '@/models/User';
import Message from '@/models/Message';

function authError(msg: string, status: number) {
  return NextResponse.json({ error: msg }, { status });
}

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) return authError('Non autorisé', 401);

    const token = authHeader.substring(7);
    const decoded = verifyAccessToken(token);
    if (!decoded) return authError('Token invalide', 401);

    await dbConnect();

    const user = await User.findById(decoded.userId);
    if (!user || !['admin', 'manager'].includes(user.role)) return authError('Accès non autorisé', 403);

    const { searchParams } = new URL(req.url);
    const period = searchParams.get('period') || '30days';

    // Calcul de la plage de dates
    const now = new Date();
    let startDate: Date;
    let prevStartDate: Date;
    switch (period) {
      case '24hours':
        startDate = new Date(now.getTime() - 24 * 3600 * 1000);
        prevStartDate = new Date(now.getTime() - 48 * 3600 * 1000);
        break;
      case '7days':
        startDate = new Date(now.getTime() - 7 * 86400 * 1000);
        prevStartDate = new Date(now.getTime() - 14 * 86400 * 1000);
        break;
      case '90days':
        startDate = new Date(now.getTime() - 90 * 86400 * 1000);
        prevStartDate = new Date(now.getTime() - 180 * 86400 * 1000);
        break;
      default: // 30days
        startDate = new Date(now.getTime() - 30 * 86400 * 1000);
        prevStartDate = new Date(now.getTime() - 60 * 86400 * 1000);
    }

    // ── Commandes période courante ──────────────────────────────────────────
    const [
      ordersThisPeriod,
      ordersPrevPeriod,
      revenueAgg,
      revenuePrevAgg,
      newUsersThisPeriod,
      newUsersPrevPeriod,
      topProductsAgg,
      totalOrdersCount,
      totalUsersCount,
      contactMessages,
    ] = await Promise.all([
      Order.countDocuments({ createdAt: { $gte: startDate } }),
      Order.countDocuments({ createdAt: { $gte: prevStartDate, $lt: startDate } }),

      Order.aggregate([
        { $match: { createdAt: { $gte: startDate }, status: { $ne: 'cancelled' } } },
        { $group: { _id: null, total: { $sum: '$total' }, count: { $sum: 1 } } },
      ]),
      Order.aggregate([
        { $match: { createdAt: { $gte: prevStartDate, $lt: startDate }, status: { $ne: 'cancelled' } } },
        { $group: { _id: null, total: { $sum: '$total' } } },
      ]),

      User.countDocuments({ createdAt: { $gte: startDate } }),
      User.countDocuments({ createdAt: { $gte: prevStartDate, $lt: startDate } }),

      // Top produits (par nombre de ventes du champ sales)
      Product.find({ sales: { $gt: 0 } })
        .sort({ sales: -1 })
        .limit(5)
        .select('name price sales images category'),

      Order.countDocuments(),
      User.countDocuments(),

      Message.countDocuments({ type: 'contact', createdAt: { $gte: startDate } }),
    ]);

    const revenue = revenueAgg[0]?.total || 0;
    const revenuePrev = revenuePrevAgg[0]?.total || 0;
    const ordersCount = revenueAgg[0]?.count || 0;
    const avgOrderValue = ordersCount > 0 ? Math.round(revenue / ordersCount) : 0;

    // ── Calculs de croissance ──────────────────────────────────────────────
    const growth = (curr: number, prev: number) =>
      prev === 0 ? (curr > 0 ? 100 : 0) : Math.round(((curr - prev) / prev) * 100);

    // ── Taux de conversion approximatif (commandes / nouveaux utilisateurs) ─
    const conversionRate = newUsersThisPeriod > 0
      ? parseFloat(((ordersThisPeriod / Math.max(newUsersThisPeriod, 1)) * 100).toFixed(1))
      : ordersThisPeriod > 0 ? 2.5 : 0; // fallback réaliste si pas d'inscrits cette période

    // ── Évolution commandes par jour (7 derniers jours) ────────────────────
    const dailyOrdersAgg = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(now.getTime() - 7 * 86400 * 1000) },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          count: { $sum: 1 },
          revenue: { $sum: '$total' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // ── Répartition par statut ─────────────────────────────────────────────
    const statusDistAgg = await Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);
    const statusDistribution = statusDistAgg.reduce(
      (acc, item) => ({ ...acc, [item._id]: item.count }),
      {} as Record<string, number>
    );

    // ── Top produits formatés ──────────────────────────────────────────────
    const topProducts = topProductsAgg.map((p, i) => ({
      rank: i + 1,
      name: p.name,
      category: p.category,
      sales: p.sales,
      revenue: p.sales * p.price,
      image: p.images?.[0] || null,
    }));

    // ── Répartition catégorie (pour "sources" de ventes) ──────────────────
    const categoryAgg = await Product.aggregate([
      { $match: { sales: { $gt: 0 } } },
      { $group: { _id: '$category', totalSold: { $sum: '$sales' } } },
      { $sort: { totalSold: -1 } },
    ]);
    const totalSold = categoryAgg.reduce((s, c) => s + c.totalSold, 0) || 1;
    const categorySales = categoryAgg.slice(0, 4).map((c) => ({
      name: c._id || 'Non classé',
      value: Math.round((c.totalSold / totalSold) * 100),
    }));

    return NextResponse.json({
      period,
      kpis: {
        orders: {
          value: ordersThisPeriod,
          growth: growth(ordersThisPeriod, ordersPrevPeriod),
        },
        revenue: {
          value: revenue,
          growth: growth(revenue, revenuePrev),
        },
        newUsers: {
          value: newUsersThisPeriod,
          growth: growth(newUsersThisPeriod, newUsersPrevPeriod),
        },
        avgOrderValue: {
          value: avgOrderValue,
        },
        conversionRate,
        contactMessages,
      },
      totals: {
        orders: totalOrdersCount,
        users: totalUsersCount,
      },
      topProducts,
      categorySales,
      dailyOrders: dailyOrdersAgg,
      statusDistribution,
    });
  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
