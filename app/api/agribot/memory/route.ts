// ═══════════════════════════════════════════════════════════════════
// AGRIBOT MEMORY SYNC — Persistance profil utilisateur vers MongoDB
// POST /api/agribot/memory  → sauvegarder/fusionner le profil
// GET  /api/agribot/memory?sessionId=xxx → récupérer le profil
// ═══════════════════════════════════════════════════════════════════
import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import ChatConversation from '@/models/ChatConversation';

interface UserMemoryBody {
  sessionId: string;
  location?: string;
  region?: string;
  mainCrops?: string[];
  surface?: string;
  farmType?: string;
  keyFacts?: string[];
  conversationCount?: number;
}

// ── GET — Récupérer le profil depuis MongoDB ──────────────────────
export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get('sessionId');
  if (!sessionId) return Response.json({ error: 'sessionId requis' }, { status: 400 });

  try {
    await connectDB();
    const conv = await ChatConversation.findOne({ sessionId }).lean() as {
      metadata?: Record<string, unknown>;
    } | null;

    if (!conv) return Response.json({ profile: null }, { status: 200 });

    const meta = conv.metadata || {};
    return Response.json({
      profile: {
        sessionId,
        location: meta.userLocation,
        region: meta.userRegion,
        mainCrops: meta.userCrops ? String(meta.userCrops).split(',').filter(Boolean) : [],
        surface: meta.userSurface,
        farmType: meta.userFarmType,
        conversationCount: (meta.totalTokens as number) > 0 ? 1 : 0,
      },
    });
  } catch (err) {
    console.error('Memory GET error:', err);
    return Response.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// ── POST — Sauvegarder/Fusionner le profil dans MongoDB ───────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as UserMemoryBody;
    const { sessionId } = body;
    if (!sessionId) return Response.json({ error: 'sessionId requis' }, { status: 400 });

    await connectDB();

    const updateFields: Record<string, unknown> = {};
    if (body.location)              updateFields['metadata.userLocation'] = body.location;
    if (body.region)                updateFields['metadata.userRegion']   = body.region;
    if (body.mainCrops?.length)     updateFields['metadata.userCrops']    = body.mainCrops.join(',');
    if (body.surface)               updateFields['metadata.userSurface']  = body.surface;
    if (body.farmType)              updateFields['metadata.userFarmType'] = body.farmType;
    if (body.keyFacts?.length)      updateFields['metadata.keyFacts']     = body.keyFacts.slice(0, 10).join('|');
    if (body.conversationCount)     updateFields['metadata.convCount']    = body.conversationCount;
    updateFields['metadata.lastSeen'] = new Date();

    if (Object.keys(updateFields).length === 0) {
      return Response.json({ ok: true, message: 'Rien à mettre à jour' });
    }

    await ChatConversation.findOneAndUpdate(
      { sessionId },
      { $set: updateFields },
      { upsert: true, new: true }
    );

    return Response.json({ ok: true, synced: Object.keys(updateFields).length });
  } catch (err) {
    console.error('Memory POST error:', err);
    return Response.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
