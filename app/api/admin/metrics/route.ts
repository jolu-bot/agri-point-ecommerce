/**
 * BUSINESS METRICS ENDPOINT
 * URL: /api/admin/metrics (auth required)
 * Provides KPIs: orders, revenue, user growth, conversion rate
 * Used by admin dashboard at /admin/analytics
 */

import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import Order from '@/models/Order';
import User from '@/models/User';
import Product from '@/models/Product';
import dbConnect from '@/lib/db';
import { logger, logRequest, logError, createRequestContext, logPerformance } from '@/lib/logger';

interface Metrics {
  period: string;
  summary: {
    totalOrders24h: number;
    totalOrders7d: number;
    totalOrders30d: number;
    totalRevenue24h: number;
    totalRevenue7d: number;
    totalRevenue30d: number;
    newUsers24h: number;
    newUsers7d: number;
    avgOrderValue24h: number;
    conversionRate: number;
  };
  topProducts: Array<{
    name: string;
    sold: number;
    revenue: number;
  }>;
  ordersTrend: Array<{
    date: string;
    count: number;
    revenue: number;
  }>;
  generatedAt: string;
}

export async function GET(req: NextRequest) {
  const startTime = Date.now();
  const context = createRequestContext(req);

  try {
    // ── Authentication ──
    const token = req.headers.get('authorization')?.replace('Bearer ', '') ||
                  req.cookies.get('accessToken')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET || '');
      const { payload } = await jwtVerify(token, secret);
      
      const userRole = (payload.role as string) || 'user';
      const userId = (payload.id as string) || (payload.sub as string);

      if (!['admin', 'superadmin'].includes(userRole)) {
        return NextResponse.json(
          { error: 'Forbidden' },
          { status: 403 }
        );
      }

      context.userId = userId;
      context.userRole = userRole;
    } catch (err) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    // ── Connect to DB ──
    await dbConnect();

    // ── Calculate metrics ──
    const metricsStart = Date.now();
    const metrics = await calculateMetrics();
    logPerformance('calculateMetrics', Date.now() - metricsStart, {
      userId: context.userId,
    });

    const duration = Date.now() - startTime;

    logRequest({
      ...context,
      statusCode: 200,
      duration,
    });

    // Log business event
    logger.info(
      {
        event: 'metrics_requested',
        userId: context.userId,
        userRole: context.userRole,
        timestamp: new Date().toISOString(),
      },
      'Admin retrieved metrics'
    );

    return NextResponse.json(metrics, {
      status: 200,
      headers: {
        'Cache-Control': 'private, max-age=30, stale-while-revalidate=60',
      },
    });
  } catch (error) {
    const duration = Date.now() - startTime;

    logError(error instanceof Error ? error : String(error), {
      requestId: context.requestId,
      endpoint: '/api/admin/metrics',
      userId: context.userId,
      severity: 'medium',
    });

    logRequest({
      ...context,
      statusCode: 500,
      duration,
      error: error instanceof Error ? error.message : String(error),
    });

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function calculateMetrics(): Promise<Metrics> {
  const now = new Date();
  const day24hAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const day7dAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const day30dAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  // Orders queries
  const [
    orders24h,
    orders7d,
    orders30d,
    newUsers24h,
    newUsers7d,
    totalUsers,
    allOrders30d,
    topProducts30d,
  ] = await Promise.all([
    Order.find({ createdAt: { $gte: day24hAgo }, status: { $ne: 'cancelled' } }).lean(),
    Order.find({ createdAt: { $gte: day7dAgo }, status: { $ne: 'cancelled' } }).lean(),
    Order.find({ createdAt: { $gte: day30dAgo }, status: { $ne: 'cancelled' } }).lean(),
    User.find({ createdAt: { $gte: day24hAgo } }).lean(),
    User.find({ createdAt: { $gte: day7dAgo } }).lean(),
    User.countDocuments(),
    Order.find({ createdAt: { $gte: day30dAgo }, status: { $ne: 'cancelled' } }).lean(),
    Product.aggregate([
      {
        $match: {
          createdAt: { $gte: day30dAgo },
          published: true,
        },
      },
      {
        $group: {
          _id: '$_id',
          name: { $first: '$name' },
          sold: { $sum: '$totalSold' },
          revenue: { $sum: { $multiply: ['$price', '$totalSold'] } },
        },
      },
      {
        $sort: { sold: -1 },
      },
      {
        $limit: 5,
      },
    ]),
  ]);

  // Calculate aggregates
  const totalRevenue24h = orders24h.reduce((sum, o) => sum + (o.total || 0), 0);
  const totalRevenue7d = orders7d.reduce((sum, o) => sum + (o.total || 0), 0);
  const totalRevenue30d = orders30d.reduce((sum, o) => sum + (o.total || 0), 0);

  const avgOrderValue24h = orders24h.length > 0 ? totalRevenue24h / orders24h.length : 0;

  // Conversion rate: Orders past 30d / Unique users past 30d
  const uniqueUsersPast30d = await User.countDocuments({
    createdAt: { $gte: day30dAgo },
  });
  const conversionRate =
    uniqueUsersPast30d > 0
      ? ((allOrders30d.length / uniqueUsersPast30d) * 100).toFixed(2)
      : 0;

  // Orders trend (last 7 days)
  const ordersTrend = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

    const dayOrders = allOrders30d.filter(
      (o) =>
        o.createdAt >= dayStart &&
        o.createdAt < dayEnd
    );

    const dayRevenue = dayOrders.reduce((sum, o) => sum + (o.total || 0), 0);

    ordersTrend.push({
      date: dayStart.toISOString().split('T')[0],
      count: dayOrders.length,
      revenue: dayRevenue,
    });
  }

  return {
    period: `${day30dAgo.toISOString().split('T')[0]} to ${now.toISOString().split('T')[0]}`,
    summary: {
      totalOrders24h: orders24h.length,
      totalOrders7d: orders7d.length,
      totalOrders30d: orders30d.length,
      totalRevenue24h: Math.round(totalRevenue24h * 100) / 100,
      totalRevenue7d: Math.round(totalRevenue7d * 100) / 100,
      totalRevenue30d: Math.round(totalRevenue30d * 100) / 100,
      newUsers24h: newUsers24h.length,
      newUsers7d: newUsers7d.length,
      avgOrderValue24h: Math.round(avgOrderValue24h * 100) / 100,
      conversionRate: Number(conversionRate),
    },
    topProducts: topProducts30d.map((p: any) => ({
      name: p.name,
      sold: p.sold,
      revenue: Math.round(p.revenue * 100) / 100,
    })),
    ordersTrend,
    generatedAt: now.toISOString(),
  };
}
