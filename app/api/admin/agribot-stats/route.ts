// ═══════════════════════════════════════════════════════════════════
// ADMIN — Statistiques AgriBot
// GET /api/admin/agribot-stats?period=7days
// ═══════════════════════════════════════════════════════════════════
import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import ChatConversation from '@/models/ChatConversation';
import { verifyAccessToken } from '@/lib/auth';

function getPeriodStart(period: string): Date {
  const now = new Date();
  const days = period === '24hours' ? 1
    : period === '7days' ? 7
    : period === '30days' ? 30
    : period === '90days' ? 90
    : 30;
  return new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
}

export async function GET(req: NextRequest) {
  try {
    const auth = req.headers.get('authorization');
    if (!auth?.startsWith('Bearer ')) return Response.json({ error: 'Non autorisé' }, { status: 401 });
    const token = auth.slice(7);
    const payload = verifyAccessToken(token) as { role?: string } | null;
    if (!payload || payload.role !== 'admin') return Response.json({ error: 'Accès refusé' }, { status: 403 });

    const period   = req.nextUrl.searchParams.get('period') || '30days';
    const since    = getPeriodStart(period);

    await connectDB();

    // Total conversations & messages
    const [totalConvs, recentConvs] = await Promise.all([
      ChatConversation.countDocuments({}),
      ChatConversation.countDocuments({ updatedAt: { $gte: since } }),
    ]);

    // Conversations récentes avec métadonnées
    const conversations = await ChatConversation.find(
      { updatedAt: { $gte: since } },
      { messages: 1, metadata: 1, tags: 1, createdAt: 1, updatedAt: 1 }
    ).lean() as Array<{
      messages?: Array<{ role: string; content: string; intent?: string; feedback?: string }>;
      metadata?: Record<string, unknown>;
      tags?: string[];
      createdAt?: Date;
      updatedAt?: Date;
    }>;

    // Compter les messages totaux
    const totalMessages = conversations.reduce((acc, c) => acc + (c.messages?.length || 0), 0);

    // Top intents
    const intentCount: Record<string, number> = {};
    const tagCount: Record<string, number> = {};
    const locationCount: Record<string, number> = {};
    const cropCount: Record<string, number> = {};
    let escalations = 0;
    let totalTokens = 0;
    let feedbackPositive = 0;
    let feedbackNegative = 0;

    for (const conv of conversations) {
      // Intents depuis les messages
      for (const msg of (conv.messages || [])) {
        if (msg.role === 'assistant' && (msg as { feedback?: string }).feedback === 'positive') feedbackPositive++;
        if (msg.role === 'assistant' && (msg as { feedback?: string }).feedback === 'negative') feedbackNegative++;
      }

      // Tags (sujets)
      for (const tag of (conv.tags || [])) {
        tagCount[tag] = (tagCount[tag] || 0) + 1;
      }

      // Métadonnées
      const meta = conv.metadata || {};
      const loc = meta.userLocation as string | undefined;
      if (loc) locationCount[loc] = (locationCount[loc] || 0) + 1;

      const crops = meta.userCrops as string | undefined;
      if (crops) {
        crops.split(',').forEach(c => {
          if (c.trim()) cropCount[c.trim()] = (cropCount[c.trim()] || 0) + 1;
        });
      }

      const intent = meta.lastIntent as string | undefined;
      if (intent) intentCount[intent] = (intentCount[intent] || 0) + 1;

      if (intent === 'urgence') escalations++;
      totalTokens += (meta.totalTokens as number) || 0;
    }

    // Conversations par jour (7 jours)
    const dailyMap: Record<string, number> = {};
    for (const conv of conversations) {
      const day = (conv.updatedAt || new Date()).toISOString().slice(0, 10);
      dailyMap[day] = (dailyMap[day] || 0) + 1;
    }
    const dailyConvs = Object.entries(dailyMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-14)
      .map(([date, count]) => ({ date, count }));

    // Top intents triés
    const topIntents = Object.entries(intentCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8)
      .map(([intent, count]) => ({ intent, count }));

    // Top sujets (tags)
    const topTopics = Object.entries(tagCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([topic, count]) => ({ topic, count }));

    // Top localisations
    const topLocations = Object.entries(locationCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8)
      .map(([location, count]) => ({ location, count }));

    // Top cultures
    const topCrops = Object.entries(cropCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8)
      .map(([crop, count]) => ({ crop, count }));

    // Taux d'escalade
    const escalationRate = recentConvs > 0
      ? Math.round((escalations / recentConvs) * 100)
      : 0;

    const avgMessagesPerConv = recentConvs > 0
      ? Math.round(totalMessages / recentConvs * 10) / 10
      : 0;

    return Response.json({
      period,
      kpis: {
        totalConversations: totalConvs,
        recentConversations: recentConvs,
        totalMessages,
        avgMessagesPerConv,
        totalTokens,
        escalations,
        escalationRate,
        feedbackPositive,
        feedbackNegative,
        satisfactionScore: feedbackPositive + feedbackNegative > 0
          ? Math.round((feedbackPositive / (feedbackPositive + feedbackNegative)) * 100)
          : null,
      },
      topIntents,
      topTopics,
      topLocations,
      topCrops,
      dailyConvs,
    });
  } catch (err) {
    console.error('AgriBot stats error:', err);
    return Response.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
