import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import BlogPost from '@/models/BlogPost';
import { rateLimit } from '@/lib/rate-limit';

// Simple per-IP per-article 1-view/hour rate limiter
const VIEW_WINDOW = 3_600_000; // 1 hour

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    await dbConnect();

    const { slug } = await context.params;
    const post = await BlogPost.findOne({ slug, isPublished: true }).lean();

    if (!post) {
      return NextResponse.json({ error: 'Article introuvable' }, { status: 404 });
    }

    // Rate-limit view increment: 1 view per IP per article per hour
    const ip = request.headers.get('x-forwarded-for') ?? 'unknown';
    const viewKey = `blog-view:${ip}:${slug}`;
    if (rateLimit(viewKey, 1, VIEW_WINDOW)) {
      await BlogPost.findByIdAndUpdate((post as any)._id, { $inc: { views: 1 } });
    }

    return NextResponse.json({ post });
  } catch (error) {
    console.error('Blog [slug] GET error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
